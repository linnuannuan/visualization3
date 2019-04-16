console.log('inited main_veiw');


function mainView(group_list) {
    //此函数计算中央布局
    //输入 ： n(group), n(companies), Groups, Companys, init_positions{} , e=PI/90(偏差项)
    //输出 ： 中央视图的布局
    let generate_location = calculateLocation(group_list)

    let graph = getGraph(generate_location)

    let vertex_location = getVertexLocation(generate_location)
    let relation_location = getRelationLocation(generate_location)

    var w = 500;
    var h = 500;

    // graph = graph.
    //创建弧生成器
    var company_outerRadius = w / 4;
    var company_innerRadius = w / 4.4

    var person_outerRadius = w / 2.1;
    var person_innerRadius = w / 2.4;


    //company_arc 生成的坐标path  d=  M x1,y1 Ax2,y2 0 x3(0),y3(1),x4,y4 Lx5,y5 A x6,y6 x7(0),y7(0) x8,y8
    //分别对应了一个弦块的  x1，y1:左上角 x4,y4 右上角 x5,y5 右下角  x8,y8左下角 centroid(d) 正中心
    //A弧形 A rx（x轴半径） ry（y轴半径） x-axis-rotation（旋转情况） large-arc-flag（角度大小） sweep-flag（弧线方向） x y


    var chord = d3.svg.chord()
        .source(function (d) {
            return vertex_location[d.src_node];
        })
        .target(function (d, i) {
            return vertex_location[d.dst_node];
        })
        .radius(company_innerRadius)
        .startAngle(function (d) {
            return d.startAngle;
        })
        .endAngle(function (d) {
            return d.endAngle;
        })


    var svg = d3.select("#main_view").append("svg")
        .attr("width", w)
        .attr("height", h)

    var person_svg = svg.append("g").attr("class", "main-person")
    var company_svg = svg.append("g").attr("class", "main-company")
    var transaction_svg = svg.append("g").attr("class", "main-transaction")
    var control_svg = svg.append("g").attr("class", "main-control")
    var family_svg = svg.append("g").attr("class", "main-family")
    var investment_svg = svg.append("g").attr("class", "main-investment")
    var test_svg = svg.append('g').attr('class', 'main-test')

    var tooltip = svg.append("div").attr("class", "main-tooltip")


    var company_arc = d3.svg.arc()
        .innerRadius(company_innerRadius)
        .outerRadius(company_outerRadius)
        .startAngle(function (d) {
            // console.log(d)
            return d.startAngle

        })
        .endAngle(function (d) {
            return d.endAngle
        })


    var person_arc = d3.svg.arc()
        .innerRadius(person_innerRadius)
        .outerRadius(person_outerRadius)
        .startAngle(function (d) {
            return d.startAngle
        })
        .endAngle(function (d) {
            return d.endAngle
        })


    //根据对应起始角度生成人的对应弧度
    var relation_start_arc = d3.svg.arc()
        .innerRadius(person_innerRadius)
        .outerRadius(person_innerRadius)
        .startAngle(function (d) {
            return d.startAngle
        })
        .endAngle(function (d) {
            return d.endAngle
        })

    //根据对应起始角度生成公司的对应弧度
    var relation_end_arc = d3.svg.arc()
        .innerRadius(company_outerRadius)
        .outerRadius(company_outerRadius)
        .startAngle(function (d) {
            return d.startAngle
        })
        .endAngle(function (d) {
            return d.endAngle
        })

    var person_arcs = person_svg.selectAll("g.arc")
        .data(graph.person)
        .enter()
        .append("g")
        .attr("transform", "translate(" + w / 2 + "," + w / 2 + ")")//放到svg中心
        .attr("class", "person")
        .on("click", function (d, i) {
            /*
            鼠标移入时，
            （1）通过 selection.html() 来更改提示框的文字
            （2）通过更改样式 left 和 top 来设定提示框的位置
            （3）设定提示框的透明度为1.0（完全不透明）
            */
            // console.log(d)
            tooltip.html(d.data.vertex_id)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY + 20) + "px")
                .style("opacity", 1.0);
            tooltip.style("box-shadow", "10px 0px 0px" + "black");//在提示框后添加阴影
        })
    // .on("mousemove", function (d) {
    //     /* 鼠标移动时，更改样式 left 和 top 来改变提示框的位置 */
    //     tooltip.style("left", (d3.event.pageX) + "px")
    //         .style("top", (d3.event.pageY + 20) + "px");
    // })
    // .on("mouseout", function (d) {
    //     //鼠标移除 透明度设为0
    //     tooltip.style("opacity", 0.0);
    // })


    var company_arcs = company_svg.selectAll("g.arc")
        .data(graph.company)
        .enter()
        .append("g")
        .attr("transform", "translate(" + w / 2 + "," + w / 2 + ")")//放到svg中心
        .on("click", function (d, i) {
            /*
            鼠标移入时，
            （1）通过 selection.html() 来更改提示框的文字
            （2）通过更改样式 left 和 top 来设定提示框的位置
            （3）设定提示框的透明度为1.0（完全不透明）
            */
            console.log(d)
        })

    person_arcs.append("path")
        .attr("fill", function (d, i) {
            if(d.data.importance == "second")return 'pink'
            else return 'deeppink';
        })
        .attr("d", function (d) {
            // arc.outerRadius(d.value);
            // console.log(person_arc(d))
            // console.log(d)
            generate_location[d.data.group_id]['vertex_list']['person'][d.data.vertex_id]['d'] = person_arc(d)
            return person_arc(d);
        })
    // .attr("id",function (d) {
    //     return "person-"+d['data'].vertex_id
    // })


    company_arcs.append("path")
        .attr("fill", function (d, i) {
            if(d.data.importance == "second")return 'lightblue'
            else return 'blue';
        })
        .attr("d", function (d) {
            // arc.outerRadius(d.value);
            // console.log(company_arc(d))
            generate_location[d.data.group_id]['vertex_list']['company'][d.data.vertex_id]['d'] = company_arc(d)
            return company_arc(d);
        })
    // .attr("id",function (d) {
    //     return "company-"+d['data'].vertex_id
    // })

    let transaction_arcs = transaction_svg.selectAll("g.arc")
        .data(graph.transaction)
        .enter()
        .append("g")
        .attr("transform", "translate(" + w / 2 + "," + w / 2 + ")")//放到svg中心

    console.log("change d init location", generate_location)

    let investment_arcs = investment_svg.selectAll("g.arc")
        .data(graph.investment)
        .enter()
        .append("g")
        .attr("transform", "translate(" + w / 2 + "," + w / 2 + ")")//放到svg中心

    let control_arcs = control_svg.selectAll("g.arc")
        .data(graph.control)
        .enter()
        .append("g")
        .attr("transform", "translate(" + w / 2 + "," + w / 2 + ")")//放到svg中心


    investment_arcs.append("path")
        .attr("d", function (d, i) {
            // console.log("start d:", generate_location[d.group_id]['vertex_list']['person'][d.src_node]['d'], "end d: ", getArcLocate(generate_location[d.group_id]['vertex_list']['company'][d.dst_node]['d']))
            // let startLocate = getArcLocate(generate_location[d.group_id]['vertex_list']['person'][d.src_node]['d'])
            // let endLocate = getArcLocate(generate_location[d.group_id]['vertex_list']['company'][d.dst_node]['d'])
            // let start = startLocate.left_down_location.x + "," + startLocate.left_down_location.y
            // let end = endLocate.right_up_location.x + "," + endLocate.right_up_location.y
            // return "M" + start + " L" + end
            d.type = "investment"
            return getPath(d, relation_location, vertex_location, relation_start_arc, relation_end_arc)
        })
        .attr("fill", function (d, i) {
            return cfg.color_link['investment']
        })
        // .attr("stroke-width", "2")
        // .attr("stroke", function (d) {
        //     return cfg.color_link['investment'];
        // })
        // .attr("marker-end", function (d) {
        //     return "url(#small_investment_arrow)";
        // })
        .attr("id", function (d) {
            return "investment-" + d.src_node + "-" + d.dst_node;
        })

    control_arcs.append("path")
        .attr("d", function (d, i) {
            // let startLocate = getArcLocate(generate_location[d.group_id]['vertex_list']['person'][d.src_node]['d'])
            // let endLocate = getArcLocate(generate_location[d.group_id]['vertex_list']['company'][d.dst_node]['d'])
            // let start = startLocate.left_down_location.x + "," + startLocate.left_down_location.y
            // let end = endLocate.right_up_location.x + "," + endLocate.right_up_location.y
            // return "M" + start + " L" + end
            d.type = "control"
            return getPath(d, relation_location, vertex_location, relation_start_arc, relation_end_arc)

        })
        .attr("fill", function (d, i) {
            return cfg.color_link['control']
        })
        // .attr("stroke-width", "2")
        // .attr("stroke", function (d) {
        //     return cfg.color_link['control'];
        // })
        // .attr("marker-end", function (d) {
        //     return "url(#small_investment_arrow)";
        // })
        .attr("id", function (d) {
            return "control-" + d.src_node + "-" + d.dst_node;
        })

    transaction_arcs.append("path")
        .attr("fill", function (d, i) {
            return 'lightgray';
        })
        .attr("d", function (d) {
            // console.log(d)
            // console.log(chord(d))
            return chord(d);
        })
    // .attr("transform", "translate(" + w / 2 + "," + w / 2 + ")")
    // .attr("stroke",'#ccc')
    // .attr("stroke-width",'0px')

    // let test_arcs = test_svg.selectAll("g.arc")
    //     .data(graph.control)
    //     .enter()
    //     .append("g")
    //     .attr("transform", "translate(" + w / 2 + "," + w / 2 + ")")//放到svg中心
    //
    // test_arcs.append('path')
    //     .attr('fill', "red")
    //     .attr('d', function (d) {
    //         // 计算该项在数组中的位置， 索引和 ，优先顺序 control -> invest -> family   (transaction 不在两个环之间的内部角度的计算范围内)
    //         return getPath(d,relation_location,vertex_location,relation_start_arc,relation_end_arc)
    //     })
    //     .attr('stroke', 'red')
    //     .attr('stroke-width', '2px')
    //     .on('click',function (d) {
    //             console.log("d.source : ", d.src_node,"d.target : ", d.dst_node)
    //         }
    //     )


}

function calculateLocation(group_list) {
    console.log("group_list: ", group_list)
    console.log("overview_location", overview_location)

    let group_len = Object.keys(group_list).length


    //人和人之间的间隔
    let interval_degree = (15 / 360) * Math.PI * 2

    //人和公司的弧长
    let unit_degree = (10 / 360) * Math.PI * 2


    let init_location = {}

    let start_angle_list = []

    for (var i in group_list) {
        let vertex_len = Object.keys(group_list[i]['vertex_list']).length
        let group_start_angle_list = []
        init_location[i] = {}
        init_location[i]['relation_list'] = group_list[i]['relation_list']
        init_location[i]['type'] = group_list[i]['type']
        init_location[i]['vertex_list'] = {"person": {}, "company": {}}
        for (let j in group_list[i]['vertex_list']) {
            // console.log(init_location[i]['vertex_list'])
            if (j in overview_location['person_location']) {
                // console.log("init location : person", group_list[i]['vertex_list'][j])
                //初始化init_location值
                init_location[i]['vertex_list']['person'][j] = group_list[i]['vertex_list'][j]

                //用于记录最大角度
                start_angle_list.push(overview_location['person_location'][j]['startAngle'])
                group_start_angle_list.push(overview_location['person_location'][j]['startAngle'])

                //初始化init_location值
                init_location[i]['vertex_list']['person'][j]['startAngle'] = overview_location['person_location'][j]['startAngle']
            } else if (j in overview_location['company_location']) {

                // console.log("init location : company", group_list[i]['vertex_list'][j], " j : ", j)

                init_location[i]['vertex_list']['company'][j] = group_list[i]['vertex_list'][j]

                // console.log("init company ", j, " ==", init_location[i]['vertex_list']['company'])
                start_angle_list.push(overview_location['company_location'][j]['startAngle'])

                group_start_angle_list.push(overview_location['company_location'][j]['startAngle'])

                init_location[i]['vertex_list']['company'][j]['startAngle'] = overview_location['company_location'][j]['startAngle']
            } else {
                console.log("vertex", j, "'s location not in graph")
            }
            init_location[i].minAngle = Math.min.apply(Math, group_start_angle_list)
            init_location[i].maxAngle = Math.max.apply(Math, group_start_angle_list)
        }
    }
    console.log("init location: ", init_location)
    //组最小原始角度，
    let maxAngle = Math.max.apply(Math, start_angle_list)
    let minAngle = Math.min.apply(Math, start_angle_list)

    //将组按照startAngle排序
    let group_location_sortby_angle = []
    for (let i in init_location) {
        group_location_sortby_angle.push(
            {
                group_id: i,
                minAngle: init_location[i].minAngle
            }
        )
    }

    function sequence(a, b) {
        // console.log(a, b)
        if (a.minAngle < b.minAngle) {
            return -1;
        } else if (a.minAngle > b.minAngle) {
            return 1
        } else {
            return 0;
        }
    }

    group_location_sortby_angle.sort(sequence)

    console.log("maxAngle, minAngle: ", maxAngle, minAngle)

    console.log("group_sort_by_angle: ", group_location_sortby_angle)


    for (let i in group_location_sortby_angle) {
        if (i != 0) {
            group_location_sortby_angle[i].minAngle = group_location_sortby_angle[i - 1].minAngle + (Math.PI * 2 / group_location_sortby_angle.length)
        }
    }

    for (let item in group_location_sortby_angle) {

        let i = group_location_sortby_angle[item].group_id
        let person_angle_list = []
        let company_angle_list = []
        let setPersonMin = false
        let setCompanyMin = false

        for (let j in init_location[i]['vertex_list']['person']) {

            if (!setPersonMin) {
                setPersonMin = true
                init_location[i]['vertex_list']['person'][j].startAngle = group_location_sortby_angle[item].minAngle
            } else {
                init_location[i]['vertex_list']['person'][j].startAngle = Math.max.apply(Math, person_angle_list) + interval_degree
            }
            init_location[i]['vertex_list']['person'][j].endAngle = init_location[i]['vertex_list']['person'][j].startAngle + unit_degree
            person_angle_list.push(init_location[i]['vertex_list']['person'][j].startAngle)
            init_location[i]['vertex_list']['person'][j].midAngle = (init_location[i]['vertex_list']['person'][j].startAngle + init_location[i]['vertex_list']['person'][j].endAngle) / 2

        }
        for (let j in init_location[i]['vertex_list']['company']) {
            // console.log("vertex:", init_location[i]['vertex_list']['company'][j])
            if (!setCompanyMin) {
                setCompanyMin = true
                init_location[i]['vertex_list']['company'][j].startAngle = group_location_sortby_angle[item].minAngle
            } else {
                init_location[i]['vertex_list']['company'][j].startAngle = Math.max.apply(Math, company_angle_list) + Object.keys(init_location[i]['vertex_list']['person']).length / Object.keys(init_location[i]['vertex_list']['company']).length * interval_degree
            }
            init_location[i]['vertex_list']['company'][j].endAngle = init_location[i]['vertex_list']['company'][j].startAngle + Object.keys(init_location[i]['vertex_list']['person']).length / Object.keys(init_location[i]['vertex_list']['company']).length * unit_degree
            company_angle_list.push(init_location[i]['vertex_list']['company'][j].startAngle)
            init_location[i]['vertex_list']['company'][j].midAngle = (init_location[i]['vertex_list']['company'][j].startAngle + init_location[i]['vertex_list']['company'][j].endAngle) / 2
        }
    }

    // console.log("init location: ", init_location)
    // console.log("group_len", group_len)
    return init_location
}


function getArcLocate(d) {
    //company_arc 生成的坐标path  d=  M x1,y1 Ax2,y2 0 x3(0),y3(1),x4,y4 Lx5,y5 A x6,y6 x7(0),y7(0) x8,y8
    // let d = "M-233.6740671520121,45.67026104879466A238.09523809523807,238.09523809523807 0 0,1 -238.05459061389303,4.399351233977671L-208.29776678715643,3.8494323297304627A208.33333333333334,208.33333333333334 0 0,0 -204.4648087580106,39.96147841769533Z"
    // 此函数接收弧生成器所生成的d ，返回左上角，右上角，右下角，左下角坐标
    // 对于人节点，获取左下角右下角坐标， 对于公司节点，获取左上角右上角坐标
    // x1，y1:左上角 x4,y4 右上角 x5,y5 右下角  x8,y8左下角 centroid(d) 正中心
    // 正则表达式匹配
    let reg1 = new RegExp("^M([0-9\-\.]*,[0-9\-\.]*)A[0-9\-\.]*,[0-9\-\.]* 0 0,1 ([0-9\-\.]*,[0-9\-\.]*)L([0-9\-\.]*,[0-9\-\.]*)A[0-9\-\.]*,[0-9\-\.]* 0 0,0 ([0-9\-\.]*,[0-9\-\.]*)Z")

    let result = {}
    result.left_up_location = {
        "x": reg1.exec(d)[1].split(',')[0],
        "y": reg1.exec(d)[1].split(',')[1]
    }

    result.right_up_location = {
        "x": reg1.exec(d)[2].split(',')[0],
        "y": reg1.exec(d)[2].split(',')[1]
    }

    result.right_down_location = {
        "x": reg1.exec(d)[3].split(',')[0],
        "y": reg1.exec(d)[3].split(',')[1]
    }

    result.left_down_location = {
        //!!!right_down_location 有问题 ,需要修复
        "x": reg1.exec(d)[4].split(',')[0],
        "y": reg1.exec(d)[4].split(',')[1]
    }
    // console.log(result)
    return result
}


function getVertexLocation(location) {
    let result = {}
    for (let i in location) {
        for (let j in location[i]['vertex_list']['company']) {
            result[j] = location[i]['vertex_list']['company'][j]
        }
        for (let j in location[i]['vertex_list']['person']) {
            result[j] = location[i]['vertex_list']['person'][j]
        }
    }
    console.log("vertex location", result)
    return result
}

function getGraph(generate_location) {
    let graph = {"company": [], "person": [], "transaction": [], "control": [], "investment": [], "family": []}
    //便于通过id直接找到对应的角度
    for (let i in generate_location) {
        for (let k in generate_location[i]['relation_list']) {
            if (generate_location[i]['relation_list'][k].type == 'CONTROL') {
                graph.control.push({
                    dst_node: generate_location[i]['relation_list'][k].dst_node,
                    group_id: i,
                    src_node: generate_location[i]['relation_list'][k].src_node,
                    importance:generate_location[i].type
                })
            }
            if (generate_location[i]['relation_list'][k].type == 'INVESTMENT') {
                graph.investment.push({
                    dst_node: generate_location[i]['relation_list'][k].dst_node,
                    group_id: i,
                    src_node: generate_location[i]['relation_list'][k].src_node,
                    importance:generate_location[i].type
                })
            }
            if (generate_location[i]['relation_list'][k].type == 'TRANSACTION') {
                graph.transaction.push({
                    dst_node: generate_location[i]['relation_list'][k].dst_node,
                    group_id: i,
                    src_node: generate_location[i]['relation_list'][k].src_node,
                    importance:generate_location[i].type
                })
            }
        }


        for (let j in generate_location[i]['vertex_list']['person']) {
            let data = {
                // person_id:,
                vertex_id: j,
                // name:,i
                group_id: i,
                capital: generate_location[i]['vertex_list']['person'][j].capital,
                importance:generate_location[i].type
            }
            graph['person'].push({
                data: data,
                startAngle: generate_location[i]['vertex_list']['person'][j].startAngle,
                endAngle: generate_location[i]['vertex_list']['person'][j].endAngle,
                padAngle: 0,
                value: generate_location[i]['vertex_list']['person'][j].capital,
            })
        }

        for (let k in generate_location[i]['vertex_list']['company']) {
            let data = {
                // person_id:,
                vertex_id: k,
                // name:,
                group_id: i,
                capital: generate_location[i]['vertex_list']['company'][k].capital,
                importance:generate_location[i].type
            }
            graph['company'].push({
                data: data,
                startAngle: generate_location[i]['vertex_list']['company'][k].startAngle,
                endAngle: generate_location[i]['vertex_list']['company'][k].endAngle,
                padAngle: 0,
                value: generate_location[i]['vertex_list']['company'][k].capital,
            })
        }
    }
    return graph
}


function getRelationLocation(generate_location) {
    //为了跟类型的关系绑定数据
    // 不同类型 起始点 关系和则为总数
    let relation_location = {
        control: {start_index: {}, end_index: {}},
        investment: {start_index: {}, end_index: {}},
        transaction: {start_index: {}, end_index: {}},
        family: {start_index: {}, end_index: {}}
    }
    for (let i in generate_location) {
        for (let j in generate_location[i]['relation_list']) {
            let type = generate_location[i]['relation_list'][j].type.toLowerCase()
            // console.log(type)
            // console.log(relation_location[type]['start_index'])
            // console.log(generate_location[i]['relation_list'][j].src_node)
            if (!(generate_location[i]['relation_list'][j].src_node in relation_location[type]['start_index'])) {
                // console.log('create  vertex',generate_location[i]['relation_list'][j].src_node)
                relation_location[type]['start_index'][generate_location[i]['relation_list'][j].src_node] = []
            }
            if (!(generate_location[i]['relation_list'][j].dst_node in relation_location[type]['end_index'])) {
                relation_location[type]['end_index'][generate_location[i]['relation_list'][j].dst_node] = []
            }
            // console.log(relation_location)
            // relation_location['start_index'][generate_location[i]['relation_list'][j].src_node].push({
            //     node_id: generate_location[i]['relation_list'][j].dst_node,
            //     importance: generate_location[i]['relation_list'][j].importance
            // })
            // if(generate_location[i]['relation_list'][j].type == 'CONTROL'){
            //     relation_location['start_index'][generate_location[i]['relation_list'][j].src_node].push(generate_location[i]['relation_list'][j].dst_node)
            // relation_location['end_index'][generate_location[i]['relation_list'][j].dst_node].push(generate_location[i]['relation_list'][j].src_node)
            //
            // }
            // if(generate_location[i]['relation_list'][j].type == 'CONTROL'){
            //
            // }
            relation_location[type]['start_index'][generate_location[i]['relation_list'][j].src_node].push(generate_location[i]['relation_list'][j].dst_node)
            relation_location[type]['end_index'][generate_location[i]['relation_list'][j].dst_node].push(generate_location[i]['relation_list'][j].src_node)
        }
    }
    console.log("relation_location", relation_location)
    return relation_location
}

function getRelationStartArc() {

}

function getPath(d, relation_location, vertex_location, relation_start_arc, relation_end_arc) {
//计算该项在数组中的位置， 索引和 ，优先顺序 control -> invest -> family   (transaction 不在两个环之间的内部角度的计算范围内)
//     console.log(d)
//     console.log("origin relation location : ", relation_location)

    // 对于控制关系 计算其开始节点的关系序号，以及结束节点的关系序号
    // 对于投资关系

    // 判断该关系是什么关系

    // console.log("---->d type ", d.type)

    let src_relation_count = relation_location[d.type]['start_index'][d.src_node].length
    let dst_relation_count = relation_location[d.type]['end_index'][d.dst_node].length

    // console.log("---->as src relation count ", src_relation_count)
    // console.log("---->as dst relation count ", dst_relation_count)

    let start_index = 0
    let end_index = 0

    switch (d.type) {
        case "control" :
            start_index = relation_location['control']['start_index'][d.src_node].indexOf(d.dst_node);
            break;
        case "investment" :
            start_index = relation_location['investment']['start_index'][d.src_node].indexOf(d.dst_node);
            break;
        case "family" :
            start_index = relation_location['family']['start_index'][d.src_node].indexOf(d.dst_node);
            break;
        default :
            console.log("Type wrong! ", d.type, "is not in consideration !!!")
    }

    switch (d.type) {
        case "control" :
            end_index = relation_location['control']['end_index'][d.dst_node].indexOf(d.src_node);
            break;
        case "investment" :
            end_index = relation_location['investment']['end_index'][d.dst_node].indexOf(d.src_node);
            break;
        case "family" :
            end_index = relation_location['family']['end_index'][d.dst_node].indexOf(d.src_node);
            break;
        default :
            console.log("Type wrong! ", d.type, "is not in consideration !!!")
    }

    // console.log("start_index = ", start_index)
    // console.log("end_index = ", end_index)


    // let index = relation_location['start_index'][d.src_node].indexOf(d.dst_node)
    // 获取关系的起始节点坐标
    let d_source = {
        startAngle: vertex_location[d.src_node].startAngle + start_index * (vertex_location[d.src_node].endAngle - vertex_location[d.src_node].startAngle) / src_relation_count,
        endAngle: vertex_location[d.src_node].startAngle + (start_index + 1) * (vertex_location[d.src_node].endAngle - vertex_location[d.src_node].startAngle) / src_relation_count
    }
    let d_target = {
        startAngle: vertex_location[d.dst_node].startAngle + end_index * (vertex_location[d.dst_node].endAngle - vertex_location[d.dst_node].startAngle) / dst_relation_count,
        endAngle: vertex_location[d.dst_node].startAngle + (end_index + 1) * (vertex_location[d.dst_node].endAngle - vertex_location[d.dst_node].startAngle) / dst_relation_count
    }

    // console.log("d_source:", d_source)
    // console.log("d_target:", d_target)


    //根据起始坐标生成人和公司的弧
    let start_arc = relation_start_arc(d_source)
    let end_arc = relation_end_arc(d_target)

    // console.log(start_arc)
    // console.log(end_arc)

    //截取一段弧start_arc.slice(0,a.length/2+a.slice(a.length/2,a.length).indexOf('A'))

    // let generate_d = start_arc.slice(0,start_arc.length-1) + "L" + end_arc.slice(1,end_arc.length/2) +"L"+getArcLocate(start_arc).left_down_location.x+"," +getArcLocate(start_arc).left_down_location.y +"Z"
    // console.log(generate_d)

    // 画一段贝塞尔曲线
    // 控制点a应该是 假设人节点为x1,y1,与人节点相同弧度的公司左上角点为x2,y2 ,控制点为((x1+x2)/2,(y1+y2)/2)
    // 控制点b应该是 假设公司节点为x1,y1,与公司节点相同弧度的人左上角点为x2,y2 ,控制点为((x1+x2)/2,(y1+y2)/2)
    // 获取控制点
    // console.log("person left down location : x :",getArcLocate(start_arc).left_down_location.x, " y :",getArcLocate(start_arc).left_down_location.y)
    // console.log("company with same arc left down location: x : ",getArcLocate(relation_end_arc(d_source)).left_down_location.x, " y : ", getArcLocate(relation_end_arc(d_source)).left_down_location.y)


    // 控制点a应该是 假设人节点为x1,y1,与人节点相同弧度的公司左上角点为x2,y2 ,控制点为((x1+x2)/2,(y1+y2)/2)
    // 控制点b应该是 假设公司节点为x1,y1,与公司节点相同弧度的人左上角点为x2,y2 ,控制点为((x1+x2)/2,(y1+y2)/2)
    // console.log("For relation d.src_node: ", d.src_node, "d.target_node: ", d.dst_node)
    //
    // console.log("person left down location : x :", getArcLocate(start_arc).left_down_location.x, " y :", getArcLocate(start_arc).left_down_location.y)
    // console.log("company with same arc left down location: x : ", getArcLocate(relation_end_arc(d_source)).left_down_location.x, " y : ", getArcLocate(relation_end_arc(d_source)).left_down_location.y)
    //
    //
    // console.log("person left up location : x :", getArcLocate(start_arc).left_up_location.x, " y :", getArcLocate(start_arc).left_up_location.y)
    // console.log("company with same arc left up location: x : ", getArcLocate(relation_end_arc(d_source)).left_up_location.x, " y : ", getArcLocate(relation_end_arc(d_source)).left_up_location.y)
    //
    // console.log("person right up location : x :", getArcLocate(start_arc).right_up_location.x, " y :", getArcLocate(start_arc).right_up_location.y)
    // console.log("company with same arc right up location: x : ", getArcLocate(relation_end_arc(d_source)).right_up_location.x, " y : ", getArcLocate(relation_end_arc(d_source)).right_up_location.y)
    //
    // console.log("person right down location : x :", getArcLocate(start_arc).right_down_location.x, " y :", getArcLocate(start_arc).right_down_location.y)
    // console.log("company with same arc right down location: x : ", getArcLocate(relation_end_arc(d_source)).right_down_location.x, " y : ", getArcLocate(relation_end_arc(d_source)).right_down_location.y)

    let left_controlPoint_1 = {
        x: (parseFloat(getArcLocate(start_arc).right_down_location.x) + parseFloat(getArcLocate(relation_end_arc(d_source)).right_down_location.x)) / 2,
        y: (parseFloat(getArcLocate(start_arc).right_down_location.y) + parseFloat(getArcLocate(relation_end_arc(d_source)).right_down_location.y)) / 2
    }
    let left_controlPoint_2 = {
        x: (parseFloat(getArcLocate(end_arc).right_down_location.x) + parseFloat(getArcLocate(relation_start_arc(d_target)).right_down_location.x)) / 2,
        y: (parseFloat(getArcLocate(end_arc).right_down_location.y) + parseFloat(getArcLocate(relation_start_arc(d_target)).right_down_location.y)) / 2
    }

    let right_controlPoint_1 = {
        x: (parseFloat(getArcLocate(end_arc).left_down_location.x) + parseFloat(getArcLocate(relation_start_arc(d_target)).left_down_location.x)) / 2,
        y: (parseFloat(getArcLocate(end_arc).left_down_location.y) + parseFloat(getArcLocate(relation_start_arc(d_target)).left_down_location.y)) / 2
    }

    let right_controlPoint_2 = {
        x: (parseFloat(getArcLocate(start_arc).left_down_location.x) + parseFloat(getArcLocate(relation_end_arc(d_source)).left_down_location.x)) / 2,
        y: (parseFloat(getArcLocate(start_arc).left_down_location.y) + parseFloat(getArcLocate(relation_end_arc(d_source)).left_down_location.y)) / 2
    }

    // console.log("Left control point 1 x: ", left_controlPoint_1.x, ",y: ", left_controlPoint_1.y)
    // console.log("Left control point 2 x: ", left_controlPoint_2.x, ",y: ", left_controlPoint_2.y)
    //
    // console.log("Right control point 1 x: ", right_controlPoint_1.x, ",y: ", right_controlPoint_1.y)
    // console.log("Right control point 2 x: ", right_controlPoint_2.x, ",y: ", right_controlPoint_2.y)

    let generate_d =
        // +start_arc.slice(start_arc.length/2,start_arc.length-1)
        start_arc.slice(0, start_arc.length / 2)
        // +"L" + getArcLocate(start_arc).left_down_location.x + " " + getArcLocate(start_arc).left_down_location.y
        + " C " + left_controlPoint_1.x + " " + left_controlPoint_1.y
        + "," + left_controlPoint_2.x + " " + left_controlPoint_2.y
        + ", " + getArcLocate(end_arc).right_down_location.x + " " + getArcLocate(end_arc).right_down_location.y

        // +", "+ getArcLocate(end_arc).left_down_location.x + " " + getArcLocate(end_arc).left_down_location.y
        // +"L "+end_arc.slice(1,end_arc.length/2).slice(0,end_arc.lastIndexOf('A'))
        + end_arc.slice(end_arc.length / 2, end_arc.length - 1)
        + " C " + right_controlPoint_1.x + " " + right_controlPoint_1.y
        + "," + right_controlPoint_2.x + " " + right_controlPoint_2.y
        + ", " + getArcLocate(start_arc).left_up_location.x + " " + getArcLocate(start_arc).left_up_location.y

    // +"L "+ getArcLocate(start_arc).right_up_location.x+","+getArcLocate(start_arc).right_up_location.y


    let generate_d_2 = "M" + end_arc.slice(1, end_arc.length / 2).slice(0, end_arc.lastIndexOf('A'))
        // +
        + " C " + right_controlPoint_1
            .x + " " + right_controlPoint_1.y + "," + right_controlPoint_2.x + " " + right_controlPoint_2.y
        + ", " + getArcLocate(start_arc).right_up_location.x + " " + getArcLocate(start_arc).right_up_location.y

    let testControlPoint = "M" + start_arc.slice(1, start_arc.length - 1) + "L" + end_arc.slice(1, end_arc.length / 2).slice(0, end_arc.lastIndexOf('A')) + "L " + getArcLocate(start_arc).right_up_location.x + "," + getArcLocate(start_arc).right_up_location.y
    // console.log("start_arc ", start_arc.slice(1, start_arc.length - 1))
    // console.log("end_arc ", end_arc)
    // console.log("test d :", testControlPoint)
    //
    // console.log("beisaier d 1:", generate_d)
    // console.log("beisaier d 2:", generate_d_2)


    return generate_d
}

function hightLightRelation(type) {
    // console.log(type)
    if (type == "control") {
        // console.log('enter control')
        d3.selectAll(".main-investment").style("fill-opacity",'0')
        d3.selectAll(".main-control").style("fill-opacity",'1')
    }
    else if (type == "investment") {
        // console.log('enter investment')
        d3.selectAll(".main-investment").style("fill-opacity",'1')
        d3.selectAll(".main-control").style("fill-opacity",'0')
    }
    else{
        // console.log('enter all')
        d3.selectAll(".main-investment").style("fill-opacity",'1')
        d3.selectAll(".main-control").style("fill-opacity",'1')
    }
}

