from flask import Flask, request, render_template, g, jsonify

import  string

import taxdg as dg

from neo4j.v1 import GraphDatabase, basic_auth

from pypinyin import pinyin, lazy_pinyin, Style

import random

app = Flask(__name__)

#Neo4j数据驱动 通过驱动查询节点，
#操作neo4j (1) 驱动：GraphDatabase.driver连接bolt端口
#          (2) py2neo包连接：Graph连接Http端口 Bolt端口在3.0版本以上支持

driver = GraphDatabase.driver('bolt://localhost:11001', auth=basic_auth("neo4j", '1234'))
# graph = Graph("http://localhost:11002", username="neo4j", password="1234")


def get_db():
    if not hasattr(g, 'neo4j_db'):
        # 给全局变量g加载数据库
        g.neo4j_db = driver.session()
    return g.neo4j_db

@app.teardown_appcontext
def close_db(error):
    if hasattr(g, 'neo4j_db'):
        # 关闭数据库
        g.neo4j_db.close()



@app.route('/')
def index():
    return render_template('new_index.html')


@app.route('/graph_data')
def data():
    db = get_db()
    company_results = db.run("MATCH (n:Company) return n ORDER BY n.group_id")
    person_results = db.run("MATCH (n:Person) return n ORDER BY n.group_id")
    transaction_result = db.run("MATCH (a:Company) - [r:TRANSACTION] -> (b:Company) return a.vertex_id,r,b.vertex_id ORDER BY r.group_id ")
    investment_result = db.run("MATCH (a) - [r:INVESTMENT] -> (b) return a.vertex_id,r,b.vertex_id ORDER BY r.group_id")
    control_result = db.run("MATCH (a) - [r:CONTROL] -> (b) return a.vertex_id,r,b.vertex_id ORDER BY r.group_id")
    family_result = db.run("MATCH (a) - [r:FAMILY] -> (b) return a.vertex_id,r,b.vertex_id ORDER BY r.group_id")
    ret = {
        "company": [],
        "person": [],
        "investment": [],
        "family": [],
        "control": [],
        "transaction": []
    }
    for row in company_results:
        # for i in range(1, 10):
            ret['company'].append({
                "name": row['n']['name'],
                "vertex_id": row['n']['vertex_id'],
                "electronic_archive_number": row['n']["electronic_archive_number"],
                "enterprise_id":row['n']['enterprise_id'],
                "industry": row['n']["industry"],
                "group_id": row['n']['group_id']
            })
    for row in person_results:
        # for i in range(1, 10):
            ret['person'].append({
                "name": row['n']['name'],
                "vertex_id": row['n']['vertex_id'],
                "person_id": row['n']['id'],
                "group_id": row['n']['group_id']
            })

    for row in investment_result:
        ret['investment'].append({
            "src_node": row['a.vertex_id'],
            "dst_node": row['b.vertex_id'],
            "proportion": row['r']['proportion'],
            "group_id": row['r']['group_id']
        })
    for row in transaction_result:
        ret['transaction'].append({
            "src_node": row['a.vertex_id'],
            "dst_node": row['b.vertex_id'],
            "transaction_amount": row['r']['transaction_amount' ],
            "transaction_number": row['r']['transaction_number'],
            "group_id": row['r']['group_id']
        })
    for row in control_result:
        ret['control'].append({
            "src_node": row['a.vertex_id'],
            "dst_node": row['b.vertex_id'],
            "group_id": row['r']['group_id']
        })
    for row in family_result:
        ret['family'].append({
            "src_node": row['a.vertex_id'],
            "dst_node": row['b.vertex_id'],
            "group_id": row['r']['group_id']
        })
    # 解析query的返回值
    # index = query.find('return')
    #
    # variables = query[query.find('return') + 7:].split(",")
    #
    # ret = {
    #     'rs': []
    # }
    return jsonify(ret)



@app.route('/search', methods=['GET', 'POST'])
def search():
    sid = request.args.get('sid')
    txt = request.form.get('txt')

    ret = {
        'success': True,
        'sid': sid,
        'data': [1, 2, 3],
        'kks': {
            'tp': 1,
            'name': 'Just a Title'
        }
    }
    return jsonify(ret)

@app.route('/lala')
def lala():
    return render_template("test.html", result="dfiadakd")

@app.route('/getRelatedGroups', methods=['GET', 'POST'])
def getRelatedGroups():
    group_id = request.args.get('group_id')
    # print(group_id)
    # 返回以group_id 为键的vertex集合
    results = {}
    db = get_db()
    query = "MATCH (a:Company)-[r:TRANSACTION]->(b:Company) where a.group_id <> b.group_id  and a.group_id = " + str(group_id) +" return b.group_id"
    # print(query)
    related_group_ids = db.run(query)
    # print(related_group_ids)
    # 把原始组也放进去
    group_list = [{
           "b.group_id": str(group_id),
           "type": 'main'
        }]
    for row in related_group_ids:
        group_list.append({
           "b.group_id": str(row['b.group_id']),
           "type": 'second'
        })

    for row in group_list:
        # print("row['b.group_id']---->", row['b.group_id'])
        results[row['b.group_id']] = {
            'vertex_list': {},
            'relation_list': []
        }
        # query_group_nodes = "MATCH (a) where a.group_id = "+str(row['b.group_id']) + " RETURN a.vertex_id"
        query_group_nodes = "MATCH (a) where a.group_id = "+str(row['b.group_id']) + " RETURN a, a.vertex_id"
        # query_group_edges = "MATCH (a)-[r]->(b) where a.group_id = " + str(row['b.group_id']) + " and b.group_id =" + str(row['b.group_id']) + " RETURN a.vertex_id,r,b.vertex_id"
        query_group_edges = "MATCH (a)-[r]->(b) where a.group_id = " + str(row['b.group_id']) + " RETURN a.vertex_id,r,b.vertex_id"

        # print(query_group_nodes)
        # print(query_group_edges)


        # 此处应当获取不同组之间的交易边

        nodes_list = db.run(query_group_nodes)
        edges_list = db.run(query_group_edges)
        results[row['b.group_id']]["type"] = row['type']
        for node in nodes_list:
            # print(node['a'].labels)
            # print('Person' in node['a'].labels)
            # print('Company' in node['a'].labels)
            if 'Person' in node['a'].labels:
                type = 'Person'
            else:
                type = 'Company'
            results[row['b.group_id']]['vertex_list'][node['a.vertex_id']] = {
                'type': type,
                'capital': random.random()*100
            }
        for edges in edges_list:
            # print("------》", edges['r'])
            results[row['b.group_id']]['relation_list'].append({
                'src_node': edges['a.vertex_id'],
                'dst_node': edges['b.vertex_id'],
                'type': edges['r'].type,
                'importance': random.random()
            })
    # print(results)
    return jsonify(results)
    # return render_template("test.html", result="dfiadakd")

@app.route('/query')
def query():
#     param = request.args.get('param')
#     # parse this param
#     # get the nodes and edges
#
#     # convert the nodes and edges to cypher query
#     r = dg.find_xxx()
#
#     q = """
# MATCH (a:Person)-[control:CONTROL]- (c1:Company)- [transaction:TRANSACTION] ->
#     (c2:Company),(a2:Person)-[investment:INVESTMENT]->
#     (c3:Company)
# RETURN a, control, c1, transaction, c2, investment, c3



#
# RETURN a, control, c1, transaction, c2, investment, c3
#     """

    # do the query

    query = request.args.get('cypher')
    db = get_db()
    results = db.run(query)

    #解析query的返回值
    index = query.find('return')

    variables = query[query.find('return')+7:].split(",")

    ret = {
        'rs': []
    }
    for row in results:
        result = {}
        for variable in variables:
            # variables = ['n1','n2','n3']
            # variable = 'n1'
            # variable[0] = 'n'
            result[variable] = {}
            print("get row: ", row[variable])
            if variable[0] == "n":
                print("get type: ", row[variable].labels)
                if 'Person' in row[variable].labels:
                    result[variable]['type'] = 'Person'
                    result[variable]['vertex_id'] = row[variable]['vertex_id']
                    result[variable]['group_id'] = row[variable]['group_id']
                    result[variable]['name'] = row[variable]['name']
                if 'Company' in row[variable].labels:
                    result[variable]['type'] = 'Company'
                    result[variable]['vertex_id'] = row[variable]['vertex_id']
                    result[variable]['group_id'] = row[variable]['group_id']
                    result[variable]['name'] = row[variable]['name']
                    result[variable]['electronic_archive_number'] = row[variable].get('electronic_archive_number')

            if variable[0] == "r":
                print("get type: ", row[variable].type)
                if row[variable].type == 'TRANSACTION':
                    result[variable]['type'] = 'TRANSACTION'
                    #以空字符连接名字里所有字的拼音并首字母大写 " ".join(map(lambda s: s.capitalize(), lazy_pinyin(row[variable].nodes[0]['name'])
                    result[variable]['src_name'] = " ".join(map(lambda s: s.capitalize(), lazy_pinyin(row[variable].nodes[0]['name'])))
                    result[variable]['dst_name'] = " ".join(map(lambda s: s.capitalize(), lazy_pinyin(row[variable].nodes[1]['name'])))
                    result[variable]['transaction_amount'] = row[variable].get('transaction_amount')
                    result[variable]['transaction_number'] = row[variable].get('transaction_number')
                if row[variable].type == 'INVESTMENT':
                    result[variable]['type'] = 'INVESTMENT'
                    result[variable]['src_name'] = " ".join(map(lambda s: s.capitalize(), lazy_pinyin(row[variable].nodes[0]['name'])))
                    result[variable]['dst_name'] = " ".join(map(lambda s: s.capitalize(), lazy_pinyin(row[variable].nodes[1]['name'])))
                    result[variable]['proportion'] = row[variable].get('proportion')
                if row[variable].type == 'CONTROL':
                    result[variable]['type'] = 'CONTROL'
                    result[variable]['src_name'] = " ".join(map(lambda s: s.capitalize(), lazy_pinyin(row[variable].nodes[0]['name'])))
                    result[variable]['dst_name'] = " ".join(map(lambda s: s.capitalize(), lazy_pinyin(row[variable].nodes[1]['name'])))
                    result[variable]['legal_representative_id'] = row[variable].get('legal_representative_id')
                if row[variable].type == 'FAMILY':
                    result[variable]['type'] = 'FAMILY'
                    result[variable]['src_name'] = " ".join(map(lambda s: s.capitalize(), lazy_pinyin(row[variable].nodes[0]['name'])))
                    result[variable]['dst_name'] = " ".join(map(lambda s: s.capitalize(), lazy_pinyin(row[variable].nodes[1]['name'])))
        # print(result)
        ret['rs'].append(result)
        # ret['rs'].append({
        #     'a': {
        #         'vertex_id': row[results[0]]['vertex_id'],
        #         'name': row['a']['name'],
        #     },
        #     'control': row['control']['legal_representative_id'],
        #     'c1': {
        #         'id': row['c1']['vertex_id'],
        #         'electronic_archive_number': row['c1']['electronic_archive_number'],
        #         'name': row['c1']['name']
        #     },
        #     'transaction': {
        #         'transaction_amount': row['transaction']['transaction_amount'],
        #         'transaction_number': row['transaction']['transaction_number']
        #     },
        #     'investment': row['investment']['proportion'],
        #     'c2': {
        #         'id': row['c2']['vertex_id'],
        #         'electronic_archive_number': row['c2']['electronic_archive_number'],
        #         'name': row['c2']['name']
        #     }
        # })
    # print(jsonify(ret))
    # return render_template('index.html', result=jsonify(ret))
    return jsonify(ret)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8888, debug=True)