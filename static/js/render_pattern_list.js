function render_pattern_list(response){
    console.log(response)
    var ul = d3.select('#pattern_list').append("ul").attr("margin-left","20px")

    for ( var i in response.rs){
        // 返回单条结果
        var node_list = {}
        var relationship_list = []
        var li = ul.append("li").append("a").datum(node_list).on(
            "click",function enterGroup(d) {
                //绑定了符合模式的每个组的节点Map。key为vertex_id，value 为 name 和 type 和 group_id
                // d3.select("#main_view svg").remove()
                // console.log("node_list",node_list)
                console.log(d)
                for(var i in d){
                   highlight(d[i].group_id);
                   break;
                }
                // overview(d)
            }
        )
        for(var j in response.rs[i]){
            //j是返回的变量名称
            if(response.rs[i][j].type == "Person" || response.rs[i][j].type == "Company"){
                if(!(response.rs[i][j].vertex_id in node_list)){
                    node_list[response.rs[i][j].vertex_id] = {
                        "name":response.rs[i][j].name,
                        "type":response.rs[i][j].type,
                        "group_id":response.rs[i][j].group_id
                    }
                }
            }
            else {
                relationship_list.push({
                    "name":response.rs[i][j].name,
                    "type":response.rs[i][j].type,
                    "src_name":response.rs[i][j].src_name,
                    "dst_name":response.rs[i][j].dst_name,
                    "group_id":response.rs[i][j].group_id
                })
            }
        }

        var node = li.append("h5").attr("class","node")
            node.append("b").text("Group: ")
        // var relationship = li.append("h5").attr("class","relationship")
        //     relationship.append("b").text("Relationship: ")
        // console.log(node_list,relationship_list)
        for(var i in node_list){
            node.append("span").text(node_list[i].type+"(" + node_list[i].name + ")  ")
        }
        // for (var i in relationship_list){
        //     relationship.append("li").text(relationship_list[i].src_name + "-" + relationship_list[i].type + "->" +relationship_list[i].dst_name)
        // }
    }

    //清空导航画布，重新绘制
    // renderNav(node_list)
}

function highlight(group_id) {
    // console.log(overview_location)
    $.get('/getRelatedGroups?group_id='+ group_id).then(function (response) {
        console.log(response)
        for (var i in response){
            // console.log(response);
            for(var j in response[i]['vertex_list']){
                switch (response[i]['vertex_list'][j].type) {
                    case 'Person': d3.select("#person-" + j).transition(5000).attr('fill','red');break;
                    case 'Company': d3.select("#company-" + j).transition(5000).attr('fill','blue');break;
                    default: console.log('vertex-'+j+" type undefined");break;
                }
            }
            for(var j in response[i]['relation_list']){
                // console.log(response[i]['relation_list'][j].type+"-" + response[i]['relation_list'][j]['src_node']+"-"+response[i]['relation_list'][j]['dst_node'])
                switch (response[i]['relation_list'][j].type) {
                    case 'INVESTMENT': d3.select("#investment-" + response[i]['relation_list'][j]['src_node']+"-"+response[i]['relation_list'][j]['dst_node']).transition(5000).attr('stroke',cfg.color_highlight['investment']);break;
                    case 'TRANSACTION': d3.select("#transaction-" +  response[i]['relation_list'][j]['src_node']+"-"+response[i]['relation_list'][j]['dst_node']).transition(5000).attr('stroke',cfg.color_highlight['transaction']).attr('fill',cfg.color_highlight['transaction']);break;
                    case 'CONTROL': d3.select("#control-" + response[i]['relation_list'][j]['src_node']+"-"+response[i]['relation_list'][j]['dst_node']).transition(5000).attr('stroke',cfg.color_highlight['control']);break;

                    // case 'INVESTMENT': d3.select("#investment-" + response[i]['relation_list']['src_node']+"-"+response[i]['relation_list']['dst_node']).attr('fill','red');break;
                    // case 'TRANSACTION': d3.select("#transaction-" +  response[i]['relation_list']['src_node']+"-"+response[i]['relation_list']['dst_node']).attr('fill','red');break;
                    // case 'CONTROL': d3.select("#control-" + response[i]['relation_list']['src_node']+"-"+response[i]['relation_list']['dst_node']).attr('fill','red');break;
                    default: console.log('relation-'+j+" type undefined");break;
                }
            }
        }
        mainView(response)
        getGroupDetail(response)
    })
}