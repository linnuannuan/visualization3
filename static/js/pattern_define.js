function dbg(msg) {
    $('#debug').html("<p>" + msg + "</p>");
    // console.log(msg);
}

/**
 * Mode Selection for the Graph
 * 0 : add mode
 * 1 : construct edge mode
 * 2 : xx mode
 */
var cfg = {
    color_link: {
        "family": "#EE5252",
        "control": "#EDEE9F",
        "investment": "#AFE4C1",
        "transaction": "black"
    },
    color_highlight: {
        "family": "#ff0000",
        "control": "#ffff00",
        "investment": "#00ff00",
        "transaction": "black"
    },
    num_modes: 4,
    modes: {
        ADD_PERSON_MODE: 0,
        ADD_COMPANY_MODE: 1,
        ADD_TRANSACTION_EDGE_MODE: 2,
        ADD_CONTROL_EDGE_MODE: 3,
        ADD_INVESTMENT_EDGE_MODE: 4,
        ADD_KINSHIP_EDGE_MODE: 5,
        DEBUG_MODE: 6,
        DELETE_MODE: 7
    },
};


var cur_mode = 0;

var nodes = [];
var edges = [];
var paths = [];


/**
 *
 */
var node_clicked = [];


function switch_mode(mode) {
    // cur_mode = (cur_mode + 1) % cfg.num_modes;
    // $('#btn-switch-mode').html('Mode ' + cur_mode);
    cur_mode = mode;
    dbg("curr mode change to : " + mode);

}

function get_nodes_edges() {
    var nodes_str = ''
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        nodes_str += node.node_id + ', ';
    }
    var edges_str = ''
    for (var i = 0; i < edges.length; i++) {
        var edge = edges[i];
        edges_str += edge.edge_id + ', ';
    }
    var paths_str = ''
    for (let i in paths) {
        // for (var i = 0; i < paths.length; i++) {
        var path = paths[i];
        paths_str += path.path_id + ', ';
    }
    console.log('Nodes: ', nodes, 'Edges: ', edges, 'Paths: ', paths)
    return 'Nodes: ' + nodes_str + '<br>Edges: ' + edges_str + '<br>Paths: ' + paths_str;

}

function delete_edge(obj) {
    var edge = $(obj);
    var edge_id = edge.attr('id');
    if (cur_mode == cfg.modes.DELETE_MODE) {
        edge.remove();
        // remove this object from the edges
        var idx_removed_edge = null;
        for (var i = 0; i < edges.length; i++) {
            var cur_edge = edges[i];
            if (cur_edge.edge_id == edge_id) {
                console.log('* found the removed edge in the edges list at ' + i);
                idx_removed_edge = i;
                break;
            }
        }
        // edges.pop(idx_removed_edge);
        edges.splice(idx_removed_edge, 1);
        console.log('* deleted edge ' + edge_id);
        dbg(get_nodes_edges());
        // console.log("edges:", edges);
        // dbg("deleted edges:", edges);
        delete_path(edge_id)
    }
}
function delete_path(edge_id) {
    // 删除节点或边的同时调用删除路径的函数，删除相关路径

    // 删除节点 默认把相连的边也删除了

    // 删除边
    // 如果该边在路径之中。则将原路径拆成两个新路径
    // 如果该边在路径的头部或尾部，则删掉path所对应的edge集合里的对应边，以及节点。
    console.log("delete path with edge ",edge_id)
    for(var i in paths){
        console.log("loop at path[",i,"]:", paths[i])
        for(var j in paths[i].edge_list){
            j = parseInt(j)
            console.log(" edge in paths["+i+ "]'s edge_list : ",paths[i].edge_list[j])
            if(paths[i].edge_list[j].edge_id == edge_id){
                //该路径包含删除的边
                console.log("find path has delete edge -- its index in edge list is : ",j)
                if(j == 0 ){
                    //删除的边在起始位置
                    //删除对应路径的节点
                    paths[i].edge_list.splice(j,1)
                    paths[i].node_list.splice(0,1)
                }
                else if(j == paths[i].edge_list.length-1){
                    paths[i].edge_list.splice(j,1)
                    paths[i].node_list.splice(paths[i].node_list.length-1,1)
                }
                else{
                    // 删除的边在中间位置
                    // 后半部分生成新边，前半部分截取存在的部分
                    var new_path_id = 'path-' + Math.round(Math.random().toFixed(4)*10000)
                    var new_path = {
                        path_id: new_path_id,
                        src_node: paths[i].node_list[j+1],
                        dst_node: paths[i].node_list[paths[i].node_list.length-1],
                        node_list: paths[i].node_list.slice(j+1,),
                        edge_list: paths[i].edge_list.slice(j+1,)
                    }
                    console.log("new_path: ",new_path)
                    paths.push(new_path)

                    paths[i].node_list = paths[i].node_list.slice(0,j+1)
                    paths[i].edge_list = paths[i].edge_list.slice(0,j)
                    console.log("new paths",paths)
                }
                break;
            }
        }
        //更新首尾节点
        paths[i].src_node= paths[i].node_list[0]
        paths[i].dst_node= paths[i].node_list[paths[i].node_list.length-1]
    }
    console.log("now path ",paths)

}

function on_click_node(obj) {
    if (cur_mode !== cfg.modes.DELETE_MODE) {
        // add
        node_menu(obj);
    } else if (cur_mode == cfg.modes.DELETE_MODE) {
        node_delete(obj);
    }
}

function node_delete(obj) {
    console.log("delete node: ", obj);
    var node = $(obj);
    var node_id = node.attr('id');
    //或d3.select("#"+node_id).remove()
    node.remove();
    // remove this object from the nodes
    var idx_removed_node = null;
    for (var i = 0; i < nodes.length; i++) {
        var cur_node = nodes[i];
        if (cur_node.node_id == node_id) {
            console.log('* found the removed node in the nodes list at ' + i);
            idx_removed_node = i;
            break;
        }
    }
    nodes.splice(idx_removed_node, 1);
    console.log('* deleted node ' + node_id);

    //删除节点后默认把相连的边删除了 包括图和内存
    // var remove_edges=[]
    for( i in edges){
        if(edges[i].src_node == node_id || edges[i].dst_node == node_id){
            console.log('* delete edge ' + i);
            console.log('* delete edge ' + edges[i].edge_id);
            // delete_edge()
            d3.select("#"+edges[i].edge_id).remove()
            delete_path(edges[i].edge_id)
            edges.splice(i,1)
            i-=1
        }
    }
    dbg(get_nodes_edges());
    // dbg("deleted edges:", edges);
}

function add_person() {
    // 绑定了一个windows事件
    var e = event || window.event
    var name = 'node-' + Math.round(Math.random().toFixed(4)*10000);
    // windows坐标
    // console.log("client x:",e.clientX,"client y:",e.clientY)
    // console.log("e.clientX: ",e.clientX)
    // console.log("e.clientY: ",e.clientY)
    // console.log("e.screenX: ",e.screenX)
    // console.log("e.screenY: ",e.screenY)
    // console.log("e.x: ",e.x)
    // console.log("e.y: ",e.y)
    // console.log("e.offsetX: ",e.offsetX)
    // console.log("e.offsetY: ",e.offsetY)
    // console.log("e.layerX: ",e.layerX)
    // console.log("e.layerY: ",e.layerY)
    // console.log(e)
    var cx = e.offsetX;
    var cy = e.offsetY;
    // console.log("* clicked at " + cx + ', ' + cy);
    if (cur_mode == cfg.modes.ADD_PERSON_MODE) {
        var person = "<circle id='" + name + "' r='10' cx='" + cx + "' cy='" + cy + "' fill='blue' onclick='on_click_node(this)' />";
        document.getElementById('dks').innerHTML += person;
        nodes.push({
            node_id: name,
            title: 'xxx',
            category: 'person'
        })
        console.log('* add a person ' + name);
    } else if (cur_mode == cfg.modes.ADD_COMPANY_MODE) {
        var company = "<circle id='" + name + "'  r='10' cx='" + cx + "' cy='" + cy + "' fill='#ccc' onclick='on_click_node(this)' />";
        document.getElementById('dks').innerHTML += company;
        nodes.push({
            node_id: name,
            title: 'xxx',
            category: 'company'
        })
        console.log('* add a company ' + name);
    }
    dbg(get_nodes_edges());
}

function calculate(x1, y1, x2, y2, r) {
    // console.log(x1, y1, x2, y2)
    // var r = 25;
    var d = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    var locate = {};
    var x = Number(x1) + Number((x2 - x1) * (d - r) / d)
    var y = Number(y1) + Number((y2 - y1) * (d - r) / d)
    locate.x = x
    locate.y = y
    // console.log(locate)
    return locate
}

function add_edge() {
    var node_a = node_clicked[0];
    var node_b = node_clicked[1];
    var edge_id = 'edge-' + Math.round(Math.random().toFixed(4)*10000);
    var color = null;
    var edge_category = null;
    switch (cur_mode) {
        case cfg.modes.ADD_TRANSACTION_EDGE_MODE:
            edge_category = "transaction";
            break
        case cfg.modes.ADD_CONTROL_EDGE_MODE:
            edge_category = "control";
            break
        case cfg.modes.ADD_INVESTMENT_EDGE_MODE:
            edge_category = "investment";
            break
        case cfg.modes.ADD_KINSHIP_EDGE_MODE:
            edge_category = "family";
            break
    }
    // console.log(x1,y1,x2,y2)
    var locate = calculate(node_a.attr('cx'), node_a.attr('cy'), node_b.attr('cx'), node_b.attr('cy'), 25);
    var edge = '<line id="' + edge_id + '" ' +
        'x1="' + node_a.attr('cx') + '" y1="' + node_a.attr('cy') + '" x2="' + locate.x + '" y2="' + locate.y + '" ' +
        'onclick="delete_edge(this)" ' +
        'class="edge edge-' + edge_category + ' " marker-end="url(#' + edge_category + '-arrow)" />';
    console.log(edge);
    // $('#dks').append(edge);
    document.getElementById('dks').innerHTML += edge;
    edge_item = {
        edge_id: edge_id,
        src_node: node_a.attr('id'),
        dst_node: node_b.attr('id'),
        category: edge_category,
    }
    edges.push(edge_item);
    add_path(node_a, node_b, edge_item)
    console.log('* added edge between ' + node_a.attr('id') + ' and ' + node_b.attr('id'));
    dbg(get_nodes_edges());
}

function get_node_by_id(node_id) {
    // console.log("get node by id :node_id = ",node_id)
    for (var i in nodes) {
        // console.log("node: ", nodes[i].node_id)
        if (nodes[i].node_id == node_id) {
            return nodes[i]
        }
    }
}

function add_path(node_a, node_b, edge_item) {
    var hasPrePath = false;
    var hasAfterPath = false;
    node_a = get_node_by_id(node_a.attr('id'))
    node_b = get_node_by_id(node_b.attr('id'))

    console.log("add path ----  node_a: ", node_a, "  node_b: ", node_b, "  edge_item: ", edge_item)

    // console.log("node_a ", "node_b :", node_a, node_b)
    var pre_path = [] //用于记录该边前的路径的序号
    var after_path = [] //用于记录该边后的路径的序号
    for (var i = 0; i < paths.length; i++) {
        // console.log("paths[i].dst_node == node_a :", paths[i].dst_node.node_id, " == ", node_a.node_id, ":", paths[i].dst_node.node_id == node_a.node_id)
        if (paths[i].dst_node.node_id == node_a.node_id) {
            //在path[i]之后增加了边
            hasPrePath = true
            pre_path.push(i)
        }
        if (paths[i].src_node.node_id == node_b.node_id) {
            //在path[i]之前增加了边
            hasAfterPath = true
            after_path.push(i)
        }
        if (paths[i].dst_node.node_id == node_b.node_id) {
            //两条路径有相同终点(即构成了环路) ,在生成cypher时需要添加where语句，此处暂不考虑
        }
    }
    // console.log("has pre path :",hasPrePath)
    // console.log("has after path :",hasAfterPath)
    // console.log("Pre paths:",pre_path)
    // console.log("After paths:",after_path)
    //若增加的边连接了两条路径。则将两条路径合成一条新路径，删除前两个路径
    if (hasPrePath && hasAfterPath) {
        console.log("enter add pre and after")
        for (i in pre_path) {
            //给前路径加上增加边和后面的路径
            for (j in after_path) {
                //合并path[i],path[j],用edge连接
                pre_index = pre_path[i]
                after_index = after_path[j]
                // console.log("pre path:",paths[pre_index])
                // console.log("after path:",paths[after_index])
                var new_path_id = 'path-' + Math.round(Math.random().toFixed(4)*10000)
                var new_path = {
                    path_id: new_path_id,
                    src_node: paths[pre_index].src_node,
                    dst_node: paths[after_index].dst_node,
                    node_list: paths[pre_index].node_list.concat(paths[after_index].node_list),
                    edge_list: paths[pre_index].edge_list.concat(edge_item).concat(paths[after_index].edge_list)
                }
                // console.log("new_path: ",new_path)
                paths.push(new_path)
            }
        }
        //删除所有Pre路径
        for (i in pre_path) {
            delete paths[pre_path[i]]
        }
        //删除所有After路径
        for (j in after_path) {
            delete paths[after_path[i]]
        }
        for (i = 0; i < paths.length; i++) {
            //清除所有的空元素
            console.log(paths[i])
            if (paths[i] == null) {
                paths.splice(i, 1)
                i = i - 1
            }
        }
    } else if (hasPrePath) {
        // console.log("enter add pre ")
        //在已有的路径后增加路径
        console.log("enter add pre ", node_b)
        for (j in pre_path) {
            paths[pre_path[j]].dst_node = node_b
            paths[pre_path[j]].node_list.push(node_b)
            paths[pre_path[j]].edge_list.push(edge_item)
        }
    } else if (hasAfterPath) {
        // console.log("enter add after ")
        //在已有的路径之前增加路径
        for (k in after_path) {
            paths[after_path[k]].src_node = node_a
            var new_node_list = []
            var new_edge_list = []
            for (var j = 0; j < paths[after_path[k]].node_list.length; j++) {
                if (paths[after_path[k]].node_list[j].node_id == node_b.node_id) {
                    new_node_list.push(node_a)
                    new_node_list.push(paths[after_path[k]].node_list[j])
                } else {
                    new_node_list.push(paths[after_path[k]].node_list[j])
                }
            }
            for (var j = 0; j < paths[after_path[k]].edge_list.length; j++) {
                if (paths[after_path[k]].edge_list[j].src_node == node_b.node_id) {
                    new_edge_list.push(edge_item)
                    new_edge_list.push(paths[after_path[k]].edge_list[j])
                } else {
                    new_edge_list.push(paths[after_path[k]].edge_list[j])
                }
            }
            paths[after_path[k]].node_list = new_node_list
            paths[after_path[k]].edge_list = new_edge_list
        }

    }
    if (paths.length == 0 || (paths.length != 0 && hasPrePath == false && hasAfterPath == false)) {
        // console.log("enter new path ")
        var path_id = 'path-' + Math.round(Math.random().toFixed(4)*10000);
        var node_list = [];
        var edge_list = [];
        node_list.push(node_a)
        node_list.push(node_b)
        edge_list.push(edge_item)
        paths.push({
            path_id: path_id,
            src_node: node_a,
            dst_node: node_b,
            node_list: node_list,
            edge_list: edge_list
        })
    }
    // console.log("finally paths: ",paths)
    dbg(get_nodes_edges());
}

function get_node_variable_by_id(variable_list, id) {
    for (var i in variable_list) {
        if (variable_list[i].node_id == id) {
            console.log("id: " + id + " -> variable : ", variable_list[i].node_variable)
            return variable_list[i]
        }
    }
    return false
}

function preserve_pattern() {
    var svg = $("#dks");
    nodes = svg.children() //图中所有的绘图内容信息
    console.log(nodes)
    // for (let i = 0; i <nodes.length;i++){
    //     console.log(i)
    //     console.log(nodes[i])
    // }
    //nodes里保存了图中所有的点和边的绘图信息，
    // 但是没有保存图中的点、边的类型及其他数据信息，以及路径信息，无法通过导入生成cypher语句。
    console.log(paths)
}

function generate_query() {
    var query_str = "MATCH "
    var company_variable_list = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9"]
    var person_variable_list = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"]
    var node_variable_list = ["n1", "n2", "n3", "n4", "n5", "n6", "n7", "n8", "n9", "n10", "n11", "n12"]
    var relation_variable_list = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9"]
    var dst_node = []
    var src_node = []
    //保存多条路径相同起点变量名
    var equal_src_variable = []

    //保存多条路径相同终点变量名
    var equal_dst_variable = []

    //保存路径上经过的所有节点在查询语句中的变量名称
    var pattern_node_list = []

    //定义迭代变量
    var node_iter = 0;
    var relation_iter = 0;

    for (var i in paths) {
        //对每个path遍历
        //保存每个path的起始终结点，作为环路的判断
        // var same_node_variable =  get_node_variable_by_id(dst_node,paths[i].dst_node.node_id)
        // if(!!same_node_variable ){
        //     //存在路径与该条路径的终结点的节点id相同
        //     //保存相等的节点的变量
        //    equal_node_list.push((same_node_variable,))

        // }
        src_node.push({
            node_id: paths[i].src_node.node_id,
            node_variable: node_variable_list[0]
        })
        console.log("query_str", query_str)

        //多条路径的拼接
        if (i != 0) query_str += ","

        for (var j in paths[i].node_list) {
            if (paths[i].node_list[j].category == "company") {
                query_str += "(" + node_variable_list[node_iter] + ":Company)"
                console.log("paths i : " + i + "node_list j : " + j)
                console.log("node_id: ", paths[i].node_list[j].node_id)
                var curr_id = paths[i].node_list[j].node_id
                pattern_node_list.push({
                    // node_id: paths[i].node_list[j].node_id,
                    node_id: curr_id,
                    node_variable: node_variable_list[node_iter]
                })
                console.log("pattern_node_list: ", pattern_node_list)
                node_iter++
            } else if (paths[i].node_list[j].category == "person") {
                query_str += "(" + node_variable_list[node_iter] + ":Person)"
                console.log("node_id: ", paths[i].node_list[j].node_id)
                pattern_node_list.push({
                    node_id: paths[i].node_list[j].node_id,
                    node_variable: node_variable_list[node_iter]
                })
                console.log("pattern_node_list: ", pattern_node_list)
                node_iter++
            }
            if (paths[i].edge_list[j] != null) {
                switch (paths[i].edge_list[j].category) {
                    case "family":
                        query_str += "-[" + relation_variable_list[relation_iter] + ":FAMILY]->";
                        break;
                    case "control":
                        query_str += "-[" + relation_variable_list[relation_iter] + ":CONTROL]->";
                        break;
                    case "transaction":
                        query_str += "-[" + relation_variable_list[relation_iter] + ":TRANSACTION]->";
                        break;
                    case "investment":
                        query_str += "-[" + relation_variable_list[relation_iter] + ":INVESTMENT]->";
                        break;
                }
                relation_iter++
            }
        }
        // dst_node.push({
        //     node_id: paths[i].dst_node.node_id,
        //     node_variable: node_variable_list[node_iter - 1]
        // })
    }
    // if (dst_node) {
    //     //假如两条路径有相同的终结点

    // }
    // console.log("dst_node: ", dst_node)
    // console.log("pattern_node_list : ", pattern_node_list)

    var has_where = false
    // for (var i in dst_node) {
    //     for (var j = 0; j < i; j++) {
    //         if (dst_node[i].node_id = dst_node[j].node_id) {
    //             if (!has_where) {
    //                 query_str += "where "
    //             }
    //             else {
    //                 query_str += "and"
    //             }
    //             query_str += dst_node[i].node_variable + ".id" + "=" + dst_node[j].node_variable + ".id"
    //         }
    //     }
    // }
    for (var i in pattern_node_list) {
        for (var j = 0; j < i; j++) {
            if (pattern_node_list[i].node_id == pattern_node_list[j].node_id) {

                if (!has_where) {
                    query_str += " where "
                    has_where = true
                } else {
                    query_str += " and "
                }
                query_str += pattern_node_list[i].node_variable + ".vertex_id" + "=" + pattern_node_list[j].node_variable + ".vertex_id"
                //当两个节点有
                pattern_node_list[j].node_variable = null
            }
        }
    }
    query_str += " return ";
    for (var i = 0; i < node_iter; i++) {
        if (i != 0) query_str += ","
        query_str += node_variable_list[i];
    }
    for (var i = 0; i < relation_iter; i++) {
        query_str += ","
        query_str += relation_variable_list[i];
    }
    console.log("query_str", query_str)

    //默认以该模式查询
    query_str="MATCH (n1:Person)-[r1:CONTROL]->(n2:Company)-[r2:TRANSACTION]->(n3:Company),(n4:Person)-[r3:INVESTMENT]->(n5:Company) where n4.vertex_id=n1.vertex_id and n5.vertex_id=n3.vertex_id return n1,n2,n3,n4,n5,r1,r2,r3"
    $.getJSON('/query?cypher='+query_str).then(function (response) {
        // response = {"rs":[{"n1":},{}]}
        render_pattern_list(response)
    })
}

function node_menu(obj) {
    console.log(obj);
    var node = $(obj);
    node.attr('r', '15');
    // node.attr('fill', 'red');
    node_clicked.push(node);
    // console.log(node_clicked);

    if (node_clicked.length == 2) {
        console.log('* the list is full!');
        add_edge();
        node_clicked = [];
    } else {
    }
}