from neo4j import GraphDatabase
import mysql.connector
import py2neo
from py2neo import Graph,Node,Relationship,PropertyDict,NodeMatcher

connection = mysql.connector.connect(user='root', password='root', host='localhost', database='test')
cursor = connection.cursor()

graph = Graph("http://localhost:11002", username="neo4j", password="1234")


# graph = Graph(host="localhost", auth=('root', 'root'))

def print_friends_of(tx, name):
    for record in tx.run("MATCH (a:Person)-[:KNOWS]->(f) "
                         "WHERE a.name = {name} "
                         "RETURN f.name", name=name):
        print(record["f.name"])


# #创建人节点
# cursor.execute('SELECT vertex_id, group_id , person_detail.person_id,person_detail.`name` \
# from vertex_group LEFT JOIN vertex on vertex_group.vertex_id = vertex.id LEFT JOIN person_detail on vertex.person_id = person_detail.person_id \
# where vertex.category = "person" and group_id>33500 and group_id<33700')
# person_list = cursor.fetchall()
# # print(person_list)
# print(len(person_list))
# for person in person_list:
#     # CREATE(付建国: Person{name: '付建国', id: 610112440825001})
#     # print(person)
#     cypher_create_person = "CREATE ("+person[3]+":Person{name:'"+person[3]+"', vertex_id:"+str(person[0])+", id:"+str(person[2])+", group_id:"+str(person[1])+"})"
#     # print(cypher_create_person)
#     #在图中插入一条数据
#     graph.run(cypher_create_person)
# print("create person finish")
#
#
#
#
# # 创建公司节点
# cursor.execute('SELECT vertex_id, group_id ,vertex.enterprise_id , enterprise_detail.electronic_archive_number,enterprise_detail.industry,enterprise_detail.`name` \
# from vertex_group LEFT JOIN vertex on vertex_group.vertex_id = vertex.id LEFT JOIN enterprise_detail on vertex.enterprise_id = enterprise_detail.enterprise_id \
# where vertex.category = "enterprise" and group_id>33500 and group_id<33700')
# company_list = cursor.fetchall()
# print(len(company_list))
# for company in company_list:
#     # CREATE(西安唐荣置业有限公司: Company{name: '西安唐荣置业有限公司', id: 610111552335968, electronic_archive_number: 610016023141904467, industry: "其他服务业"})
#     # print(company)
#     cypher_create_company = "CREATE ("+company[5]+":Company{name:'"+company[5]+"', vertex_id:"+str(company[0])+", enterprise_id:'"+company[2]+\
#                             "', industry:'"+company[4]+"', electronic_archive_number:"+str(company[3])+", group_id:"+str(company[1])+"})"
#     # print(cypher_create_company)
#     #在图中插入公司数据
#     graph.run(cypher_create_company)
# print("create company finish")
# #
# #
#创建边
#交易边
cursor.execute('SELECT edge.source_id, edge.target_id , transaction_amount, transaction_number, group_id from edge_group_2 LEFT JOIN edge \
on edge_group_2.source_id = edge.source_id AND edge_group_2.target_id = edge.target_id where edge_group_2.category = "transaction" and group_id>33500 and group_id<33700')
transaction_edges = cursor.fetchall()
print(len(transaction_edges))
for edge in transaction_edges:
    # CREATE(西安唐荣置业有限公司: Company{name: '西安唐荣置业有限公司', id: 610111552335968, electronic_archive_number: 610016023141904467, industry: "其他服务业"})
    # print(edge)
    cypher_create_transaction_edge = "Match (a:Company),(b:Company) WHERE a.vertex_id = " + str(edge[0]) + " AND b.vertex_id = " + str(edge[1]) + \
                                     " CREATE (a)-[transaction:TRANSACTION{transaction_amount:"+str(edge[2]) + ", transaction_number:"+str(edge[3])+", group_id: '"+str(edge[4])+"'}]->(b) "
    # print(cypher_create_transaction_edge)
    # 在图中插入公司数据
    graph.run(cypher_create_transaction_edge)
print("create transaction_edge finish")
#
# #
# #
# #投资边
#
# cursor.execute('SELECT edge.source_id, edge.target_id , investment_proportion, group_id \
# from edge_group_2 LEFT JOIN edge \
# on edge_group_2.source_id = edge.source_id AND edge_group_2.target_id = edge.target_id \
# where edge.category = "investment" and edge_group_2.category="investment" \
# and group_id>33500 and group_id<33700')
# investment_edges = cursor.fetchall()
# print(len(investment_edges))
#
# for edge in investment_edges:
#     # CREATE(西安唐荣置业有限公司: Company{name: '西安唐荣置业有限公司', id: 610111552335968, electronic_archive_number: 610016023141904467, industry: "其他服务业"})
#     cypher_create_investment_edge = "Match (a),(b) WHERE a.vertex_id = " + str(edge[0]) + " AND b.vertex_id = " + str(edge[1]) + \
#                                      " CREATE (a)-[investment:INVESTMENT{ proportion:" + str(edge[2]) + ", group_id: '" + str(edge[3])+"'}]->(b)"
#     # print(cypher_create_investment_edge)
#     graph.run(cypher_create_investment_edge)
# print("create investment edge finish")
#
# # #
# #
# # #控制边
# cursor.execute('SELECT edge.source_id, edge.target_id , group_id \
# from edge_group_2 LEFT JOIN edge \
# on edge_group_2.source_id = edge.source_id AND edge_group_2.target_id = edge.target_id \
# where edge.category = "control" and edge_group_2.category="control" \
# and group_id>33500 and group_id<33700')
# control_edges = cursor.fetchall()
# print(len(control_edges))
#
# for edge in control_edges:
#     # CREATE(西安唐荣置业有限公司: Company{name: '西安唐荣置业有限公司', id: 610111552335968, electronic_archive_number: 610016023141904467, industry: "其他服务业"})
#     cypher_create_control_edge = "Match (a),(b) WHERE a.vertex_id = " + str(edge[0]) + " AND b.vertex_id = " + str(edge[1]) + \
#                                      " CREATE (a)-[control:CONTROL{ group_id: '" + str(edge[2])+"'}]->(b)"
#     graph.run(cypher_create_control_edge)
#     # print(cypher_create_control_edge)
# print("create control edge finish")
#
#
# # 亲属边
# cursor.execute('SELECT edge.source_id, edge.target_id , group_id \
# from edge_group_2 LEFT JOIN edge \
# on edge_group_2.source_id = edge.source_id AND edge_group_2.target_id = edge.target_id \
# where edge.category = "family" and edge_group_2.category="family"')
# family_edges = cursor.fetchall()
# print(len(family_edges))
# for edge in family_edges:
#     # CREATE(西安唐荣置业有限公司: Company{name: '西安唐荣置业有限公司', id: 610111552335968, electronic_archive_number: 610016023141904467, industry: "其他服务业"})
#     cypher_create_family_edge = "Match (a:Person),(b:Person) WHERE a.vertex_id = " + str(edge[0]) + " AND b.vertex_id = " + str(edge[1]) + \
#                                      " CREATE (a)-[family:FAMILY{ group_id: '" + str(edge[2])+"'}]->(b)"
#     print(cypher_create_family_edge)
#     graph.run(cypher_create_family_edge)
# print("create family edge finish")
#
#
#
#
#
#
#
#
#
