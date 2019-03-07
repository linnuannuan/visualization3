from flask import json
from py2neo import Graph, Node, Relationship, PropertyDict, NodeMatcher
import random

graph = Graph("http://localhost:11002", username="neo4j", password="1234")

#查询所有的人节点
person_node = graph.nodes.match("Person")
company_node = graph.nodes.match("Company")
transaction_edge = graph.relationships.match(r_type="TRANSACTION")
investment_edge = graph.relationships.match(r_type="INVESTMENT")
control_edge = graph.relationships.match(r_type="CONTROL")
family_edge = graph.relationships.match(r_type="FAMILY")
# print(graph.relationships)

# person_node_list = list(person_node)


location = {
    "nodes":[
    ],
    "links":[]
}

#人节点的布局
#y=100
#当全局位置够大时，x= node.group_id*10 + node.id(18位身份证)/10的17次方
#考虑到暂时只显示部分节点来验证布局算法的可行性，选取group_id为33500到33700的节点和边，x= (node.group_id-33500)*20 + node.person_id(18位身份证)/10的17次方

for node in person_node:
    # print(node)
    # print("node[group_id]: ", node['group_id'], "vertex_id: ", node['vertex_id'])

    # 随机生成人的纳税额属性， 表示其重要性 作为坐标的垂直方向的维度信息
    tax_count = random.random()*10
    location['nodes'].append(
        {
            # 'x': (node['group_id'] - 33500) * 20 + node['id']/pow(10, 14),
            # 'x': (node['group_id'] - 33500) * 20 + node['id'] % 10 * 10,
            'x': (node['group_id'] - 33500) * 80 + random.random()*80,
            'y': 30,
            'r': tax_count,
            'id': node['vertex_id'],
            'type': 'person',
        }
    )
    print("x", (node['group_id'] - 33500) * 40 + node['id']/pow(10, 14),"(node['group_id'] - 33500) * 20: ", (node['group_id'] - 33500) * 20, "node['id']/pow(10, 14)", node['id']/pow(10, 14))
print("create person location finished!")

for node in company_node:
    print(node)
    location['nodes'].append(
        {
            # 'x': (node['group_id'] - 33500) * 20 + node['electronic_archive_number']/pow(10, 19),
            'x': (node['group_id'] - 33500) * 80 + random.random()*80,
            'y': 170,
            'id': node['vertex_id'],
            'type': 'company',
            # 随机数预留用于判断点的重要性
            'r': random.random()*20
        }
    )
print("create company location finished!")

print(transaction_edge)
for edge in transaction_edge:
    # print(edge)
    # 设置属性用于判断边的重要性，决定线的宽度
    # 可用属性有 交易额以及交易的次数、
    # 假设重要性 = 交易额
    location['links'].append(
        {
            'sid': edge.start_node['vertex_id'],
            'tid': edge.end_node['vertex_id'],
            'type': 'transaction',
            'importance': edge['transaction_amount']/1000
        }
    )
print("create transaction_edge location finished!")

for edge in investment_edge:
    # print(edge)
    location['links'].append(
        {
            'sid': edge.start_node['vertex_id'],
            'tid': edge.end_node['vertex_id'],
            'type': 'investment',
            'importance': edge['proportion']*100
        }
    )
print("create investment_edge location finished!")

for edge in control_edge:
    # print(edge)
    # 随机一个属性用于表示控制的重要性
    location['links'].append(
        {
            'sid': edge.start_node['vertex_id'],
            'tid': edge.end_node['vertex_id'],
            'type': 'control',
            'importance': random.random()*1000
        }
    )
print("create control_edge location finished!")

for edge in family_edge:
    # print(edge)
    # 随机一个属性用于表示关系的亲近程度
    location['links'].append(
        {
            'sid': edge.start_node['vertex_id'],
            'tid': edge.end_node['vertex_id'],
            'type': 'family',
            'importance': random.random()*1000
        }
    )
print("create family_edge location finished!")

# print(location)
# person_node.__iter__()
with open("static/data/graph.json", "w+") as f:
    json.dump(location, f)
    print("load file finished")