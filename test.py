# coding: utf-8 -*-
from py2neo import Graph, Node, Relationship
graph = Graph("http://localhost:11002", username="neo4j", password="1234")

test_node_1 = Node(label="Person", name="test_node_1")
test_node_2 = Node(label="Person", name="test_node_2")
graph.create(test_node_1)
graph.create(test_node_2)
graph.run("match (n) return (n)")

"""分别建立了test_node_1指向test_node_2和test_node_2指向test_node_1两条关系，
关系的类型为"CALL"，两条关系都有属性count，且值为1。"""
node_1_call_node_2 = Relationship(test_node_1, 'CALL', test_node_2)
node_1_call_node_2['count'] = 1
node_2_call_node_1 = Relationship(test_node_2, 'CALL', test_node_1)
node_2_call_node_1['count'] = 1
graph.create(node_1_call_node_2)
graph.create(node_2_call_node_1)


"""节点和关系的属性初始赋值在前面节点和关系的建立
的时候已经有了相应的代码，在这里主要讲述一下怎么更新一个节点/关系的属性值。"""

node_1_call_node_2['count']+=1
graph.push(node_1_call_node_2)

"""通过find和find_one函数，可以根据类型和属性、属性值来查找节点和关系。"""

"""find和find_one的区别在于：
find_one的返回结果是一个具体的节点/关系，可以直接查看它的属性和值。如果没有这个节点/关系，返回None。
find查找的结果是一个游标，可以通过循环取到所找到的所有节点/关系。"""

find_code_1 = graph.find_one(
  label="Person",
  property_key="name",
  # property_value="test_node_1"
)
# print(find_code_1['name'])

find_code_3 = graph.find_one(
  label="Person",
  property_key="name",
  # property_value="test_node_2"
)

"""如果已经确定了一个节点或者关系，想找到和它相关的关系和节点，
就可以使用match和match_one"""
#
find_relationship = graph.match_one(start_node=find_code_1,end_node=find_code_3,bidirectional=False)
print(find_relationship)


# match_relation = graph.match(start_node=find_code_1,bidirectional=False) #True
# for i in match_relation:
#     print(i)
#     i['count']+=1
#     graph.push(i)


# print("1111111111111111")
# # print(graph)
# print(test_node_1)
# print(test_node_2)
# print(node_2_call_node_1)
print(node_1_call_node_2)