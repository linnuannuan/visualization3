function render_pattern_list(response){
    console.log(response)
    var node_list = []
    var ul = d3.select('#pattern_list').append("ul").attr("margin-left","20px")
    for ( var i in response.rs){
        var li = ul.append("li")
        var node = li.append("h5").attr("class","node")
            node.append("b").text("Node: ")
        var relationship = li.append("h5").attr("class","relationship")
            relationship.append("b").text("Relationship: ")
        for(var j in response.rs[i]){
            //j是返回的变量名称
            if(response.rs[i][j].type == "Person"){
                node.append("span").text("Person(" + response.rs[i][j].name + ")  ")
                node_list.push(response.rs[i][j].vertex_id)
                // li.append("h4").text("Node: Person").attr('font-weight','bold')
                // li.append("h5").text("name: " + response.rs[i][j].name).attr("color",'gray')
                // li.append("h5").text("vertex_id: " + response.rs[i][j].vertex_id).attr("color",'gray')
            }
            else if(response.rs[i][j].type == "Company") {
                node.append("span").text("Company(" + response.rs[i][j].name + ")  ")
                node_list.push(response.rs[i][j].vertex_id)

                // li.append("h4").text("Node: Company").attr('font-weight','bold')
                // li.append("h5").text("name: " + response.rs[i][j].name).attr("color",'gray')
                // li.append("h5").text("vertex_id: " + response.rs[i][j].vertex_id).attr("color",'gray')
            }
            else if(response.rs[i][j].type == "TRANSACTION"){
                relationship.append("span").text(response.rs[i][j].src_name + "-->" + response.rs[i][j].type+ "-->" + response.rs[i][j].dst_name+"     ")
                // li.append("h4").text("Relationship: Transaction").attr('font-weight','bold')
                // li.append("h5").text("Information: " + response.rs[i][j].src_name + " -> " +  response.rs[i][j].dst_name).attr("color",'gray')
                // li.append("h5").text("Transaction_amount: "+response.rs[i][j].transaction_amount).attr("color",'gray')
                // li.append("h5").text("Transaction_number: "+response.rs[i][j].transaction_number).attr("color",'gray')
            }
            else if(response.rs[i][j].type == "INVESTMENT"){
                relationship.append("span").text(response.rs[i][j].src_name + "-->" + response.rs[i][j].type+ "-->" + response.rs[i][j].dst_name+"     "

            )
                // li.append("h4").text("Relationship: Investment").attr('font-weight','bold').attr("color",'gray')
                // li.append("h5").text("Information: " + response.rs[i][j].src_name + " -> " +  response.rs[i][j].dst_name).attr("color",'gray')
                // li.append("h5").text("Proportion: " + response.rs[i][j].proportion).attr("color",'gray')
            }
            else if(response.rs[i][j].type == "CONTROL"){
                relationship.append("span").text(response.rs[i][j].src_name + "-->" + response.rs[i][j].type+ "-->" + response.rs[i][j].dst_name)
                // li.append("h4").text("Relationship: Control").attr('font-weight','bold')
                // li.append("h5").text("Information: " + response.rs[i][j].src_name + " -> " +  response.rs[i][j].dst_name).attr("color",'gray')
            }
        }
    }
    ul.append("ul")
    //清空导航画布，重新绘制
    d3.select("#d3_selectable_force_directed_graph > *").remove()
    console.log("node_list",node_list)
    renderNav(node_list)

}