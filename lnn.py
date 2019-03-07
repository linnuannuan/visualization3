from flask import Flask, request, render_template, g, jsonify

import  string

import taxdg as dg

from neo4j.v1 import GraphDatabase, basic_auth

from pypinyin import pinyin, lazy_pinyin, Style

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
    return render_template('index.html')


@app.route('/search', methods=['GET', 'POST'])
def search():
    sid = request.args.get('sid')
    txt = request.form.get('txt')

    ret = {
        'success': True,
        'sid': sid,
        'data': [1,2,3],
        'kks': {
            'tp': 1,
            'name': 'Just a Title'
        }
    }
    return jsonify(ret)

@app.route('/lala')
def lala():
    return render_template("test.html", result="dfiadakd")


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
                    result[variable]['name'] = row[variable]['name']
                if 'Company' in row[variable].labels:
                    result[variable]['type'] = 'Company'
                    result[variable]['vertex_id'] = row[variable]['vertex_id']
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