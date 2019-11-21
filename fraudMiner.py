from flask import Flask, request, render_template, g, jsonify
import  string
import json
import taxdg as dg
from neo4j.v1 import GraphDatabase, basic_auth
from pypinyin import pinyin, lazy_pinyin, Style
import random
app = Flask(__name__)


def selectDataByGroup(data, g_ids):
    newData = {
        'nodes': [],
        'links': []
    }
    in_node_list = []
    print('g_ids', g_ids)
    for node in data['nodes']:
        if not (node['group'] in g_ids):
            newData['nodes'].append(node)
            in_node_list.append(node['id'])
    for link in data['links']:
        if link['source'] in in_node_list and link['target'] in in_node_list:
            newData['links'].append(link)
    return newData



@app.route('/')
def index():
    return render_template('fraudMiner.html')

@app.route('/testData')
def testdata():

# 获取参数
    group_id = request.args.get('group_id')
    filter_1 = request.args.get('filter_1')
    filter_2 = request.args.get('filter_2')
    filter_3 = request.args.get('filter_3')

# 取数据
    print('group_id:', group_id)
    fp = open('./static/data/n_miserables.json', encoding='utf-8')
    data = json.load(fp)

# 根据参数对数据处理
    if group_id:
        group_id = int(group_id)
        g_ids = [group_id]
        # g_ids = [group_id-1, group_id, group_id+1]
        data = selectDataByGroup(data, g_ids)
    elif filter_1:
        sql_queryByGroup = ''
    elif filter_2:
        sql_queryByGroup = ''
    elif filter_2:
        sql_queryByGroup = ''
    else:
        data = data
    return jsonify(data)

# 返回数据


@app.route('/testGroupData_1')
def testdata_group1():
    fp = open('./static/data/n_miserables_g1.json', encoding='utf-8')
    data = json.load(fp)

    return jsonify(data)

@app.route('/testGroupData_2')
def testdata_group2():
    fp = open('./static/data/n_miserables_g2.json', encoding='utf-8')
    data = json.load(fp)
    return jsonify(data)



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8800, debug=True)