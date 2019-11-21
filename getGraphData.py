import mysql.connector
from flask import Flask, redirect, request, jsonify
from pypinyin import pinyin, lazy_pinyin, Style
from sqlalchemy import create_engine
import json

web = Flask(__name__)
# tianwangcha_data = json.load(open('all_ent_data_json'))
# three_affiliated_groups_data = json.load(open('data/three-group_json'))

engine = create_engine("mysql+pymysql://root:root@localhost:3306/test", echo=False)
conn = engine.connect()
print('* connected!')


sql = '''
select * from vertex.group
where is_three_affiliated = 3
GROUP BY group_id
'''



group_ids = conn.execute(sql).fetchall()
# group_ids = [{'group_id': 30}, {'group_id': 35}, {'group_id': 58}]
print(len(group_ids))

graph = ""#
# sql = '''
# select * from vertex_group
# GROUP BY group_id
# '''


for i in range(len(group_ids)):
# for i in range(14500, 14600):
    group_id = group_ids[i]['group_id']
    # print(i, group_id)
    if i%100 == 0:
        print(i, group_id)
    t_graph = "t # %s\n"%i
    v_sql = '''
    SELECT 'v',v_vertex_id, IF(vertex_category='person',1,2)
    from (select * from vertex_group
    where group_id = '%s') as v LEFT JOIN vertex
    on v_vertex_id = vertex_id;
    '''% group_id

    # print(v_sql)
    vertex_list = conn.execute(v_sql)

    for vertex in vertex_list:
        t_graph += str(vertex[0])+" "+str(vertex[1])+" "+str(vertex[2]) +"\n"


    # print(t_graph)

    e_sql = '''
    SELECT 'e',e_source_id, e_target_id,e_category, IF(e_category='control',1,IF(e_category='investment',2,if(e_category='transaction',3,4)))
    from  edge_group_2 as e 
    where group_id = '%s'
    ''' % group_id

    # print(e_sql)
    edge_list = conn.execute(e_sql)

    for edge in edge_list:
        t_graph += str(edge[0])+" " + str(edge[1]) + " " + str(edge[2]) +" "+ str(edge[4]) +"\n"

    graph += t_graph
graph += "t # -1"
# print(graph)

# fo = open("generate_data", "w+")
fo = open("three_data", "w+")

fo.write(graph)
