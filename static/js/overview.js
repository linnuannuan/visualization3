console.log('inited this page');



/*定义全局变量*/
overview_location = {}




function overview() {
    //中央视图接收到不为空的node_list，对应的group_id的组组的宽度变大，符合模式的节点和边变红
    //输出一个所有节点和关系在全局的位置，起始角度
    // overview_location={"a":1}
    d3.json("/graph_data", function (error, graph) {
        var w = 500;
        var h = 500;

        // graph = graph.
        //创建弧生成器
        var company_outerRadius = w / 3;
        var company_innerRadius = w / 3.1

        var person_outerRadius = w / 2.4;
        var person_innerRadius = w / 2.45;

        var company_arc = d3.svg.arc()
            .innerRadius(company_innerRadius)
            .outerRadius(company_outerRadius)
            .startAngle(function (d) {
                // console.log(d)
                return d.startAngle + (d.endAngle - d.startAngle) * 0.4

            })
            .endAngle(function (d) {
                // console.log(d)
                // if(!!node_list ){
                //     if( d.data.group_id in group_list){
                //         return d.endAngle *3
                //     }
                //     else{
                //         return d.startAngle
                //     }
                // }
                // else return d.endAngle
                return d.endAngle
            })

        var person_arc = d3.svg.arc()
            .innerRadius(person_innerRadius)
            .outerRadius(person_outerRadius)
            .startAngle(function (d) {
                // console.log(d)
                // if(!!node_list ){
                //     if( d.data.group_id in group_list){
                //         return d.startAngle + (d.endAngle - d.startAngle)*0.4
                //     }
                //     else{
                //         return 0
                //     }
                // }
                return d.startAngle + (d.endAngle - d.startAngle) * 0.4
            })
            .endAngle(function (d) {
                // console.log(d)
                // if(!!node_list ){
                //     if( d.data.group_id in group_list){
                //         return d.endAngle *3
                //     }
                //     else{
                //         // return d.startAngle + (d.endAngle - d.startAngle)*0.4
                //         return 0
                //     }
                // }
                // else return d.endAngle
                return d.endAngle
            })

        var chord = d3.svg.chord()
            .source(function (d) {
                return d.src_node;
            })
            .target(function (d, i) {
                return d.dst_node;
            })
            .radius(company_innerRadius)
            .startAngle(function (d) {
                // console.log(d)
                return company_location[d].startAngle - (company_location[d].endAngle - company_location[d].startAngle) * 0.9;
            })
            .endAngle(function (d) {
                return company_location[d].endAngle;
            })
        // .cornerRadius(500)

        //定义人的弦，为了将角度转换为对应的二维坐标
        var person_chord = d3.svg.chord()
            .source(function (d) {
                return d.src_node;
            })
            .target(function (d, i) {
                return d.src_node;
            })
            .radius(person_innerRadius)
            .startAngle(function (d) {
                // if (person_location[d].group_id > 33500 && person_location[d].group_id < 33700) {
                //     console.log(person_location[d].group_id, ":", person_location[d].startAngle/(2*Math.PI) *360)
                // }
                return person_location[d].startAngle;
            })
            .endAngle(function (d) {
                return person_location[d].endAngle;
            })

        var company_chord = d3.svg.chord()
            .source(function (d) {
                // console.log(d)
                return d.dst_node;
            })
            .target(function (d, i) {
                return d.dst_node;
            })
            .radius(company_outerRadius)
            .startAngle(function (d) {
                return company_location[d].startAngle
            })
            .endAngle(function (d) {
                return company_location[d].endAngle
            })

        /*定义一个pie,用layout包裹数据，设value访问器，决定包裹dataset的什么数据*/
        var pie = d3.layout.pie()
            .startAngle(Math.PI * 0)
            .endAngle(Math.PI * 2)
            .value(
                function (d) {
                    // if(!!node_list){
                    //     //若node_list不为空
                    //     if(d['group_id'] in group_list){
                    //         // console.log(d['group_id'])
                    //         return 20
                    //     }
                    //     else{
                    //         return 10
                    //     }
                    // }
                    return d['group_id']
                }
            )  //value访问器决定我们要访问数据集中的什么数据，同时在pie（dataset)也会有
        var color = d3.scale.category20();

        var zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .on("zoom", function (d) {
                d3.select(this).attr("transform", "translate(" + d3.event.translate + ")" +
                    "scale(" + d3.event.scale + ")"
                )
            })

        var small_control_arrow_path = "M4,4 L8 ,6 L4,8 L6,6 L4,4";
        var small_investment_arrow_path = "M4,4 L8,6 L4,8 L6,6 L4,4";
        var small_transaction_arrow_path = "M4,4 L8,6 L4,8 L6,6 L4,4";


        var svg = d3.select("#overview").append("svg")
            .attr("width", w)
            .attr("height", h)
            .call(zoom)


        /*开始对每个扇形（startAngle,endAngle,value）进行绑定,放在透明g元素中*/
        var person_svg = svg.append("g").attr("class", "person")
        var company_svg = svg.append("g").attr("class", "company")
        var transaction_svg = svg.append("g").attr("class", "transaction")
        var control_svg = svg.append("g").attr("class", "control")
        var family_svg = svg.append("g").attr("class", "family")
        var investment_svg = svg.append("g").attr("class", "investment")

        var tooltip = svg
            .append("g")
            .append("text")
            .attr("class", "tooltip")
        console.log("pie-person", pie(graph.person))
        console.log("pie-company", pie(graph.company))

        var person_arcs = person_svg.selectAll("g.arc")
            .data(pie(graph.person))
            .enter()
            .append("g")
            .attr("transform", "translate(" + w / 2 + "," + w / 2 + ")")//放到svg中心
            .attr("class", "person")
            .on("mouseover", function (d) {
                tooltip
                    .attr("left", d3.event.pageX + "px")
                    .attr("top", d3.event.pageY + "px")
                    .attr("opacity", 1)
                    .text(d.data['name'])

                tooltip.style("box-shadow", "10px 0px 0px" + color(i))//添加尾部阴影
                // console.log()
                // console.log(d3.event.pageX)
                // console.log(d3.event.pageY)
            })
            .on("mousemove", function (d) {
                tooltip.style("left", d3.event.pageX + "px")
                    .style("top", d3.event.pageY + "px")
                    .text(d.data['name'])
            })
            .on("mouseout", function (d) {
                // tooltip.style("opacity", 0);
            })

        var company_arcs = company_svg.selectAll("g.arc")
            .data(pie(graph.company))
            .enter()
            .append("g")
            .attr("transform", "translate(" + w / 2 + "," + w / 2 + ")")//放到svg中心


        var transaction_arcs = transaction_svg.selectAll("g.arc")
            .data(graph.transaction)
            .enter()
            .append("g")
            .attr("transform", "translate(" + w / 2 + "," + w / 2 + ")")//放到svg中心


        var investment_arcs = investment_svg.selectAll("g.arc")
            .data(graph.investment)
            .enter()
            .append("g")
            .attr("transform", "translate(" + w / 2 + "," + w / 2 + ")")//放到svg中心

        var control_arcs = control_svg.selectAll("g.arc")
            .data(graph.control)
            .enter()
            .append("g")
            .attr("transform", "translate(" + w / 2 + "," + w / 2 + ")")//放到svg中心


        var defs = d3.selectAll("svg").append("defs")

        var investment_arrowMarker = defs.append("marker")
            .attr("id", "small_investment_arrow")
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", "12")
            .attr("markerHeight", "12")
            .attr("viewBox", "0 0 12 12")
            .attr("refX", "6")
            .attr("refY", "6")
            .attr("orient", "auto")

        var control_arrowMarker = defs.append("marker")
            .attr("id", "small_control_arrow")
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", "12")
            .attr("markerHeight", "12")
            .attr("viewBox", "0 0 12 12")
            .attr("refX", "6")
            .attr("refY", "6")
            .attr("orient", "auto")

        var transaction_arrowMarker = defs.append("marker")
            .attr("id", "small_transaction_arrow")
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", "12")
            .attr("markerHeight", "12")
            .attr("viewBox", "0 0 12 12")
            .attr("refX", "6")
            .attr("refY", "6")
            .attr("orient", "auto")

        control_arrowMarker.append("path")
            .attr("d", small_control_arrow_path)
            .attr("fill", cfg.color_link["control"])
            .attr("stroke-width", "1px")
            .attr('stroke', cfg.color_link["control"])

        investment_arrowMarker.append("path")
            .attr("d", small_investment_arrow_path)
            .attr("fill", cfg.color_link["investment"])
            .attr("stroke-width", "0px")
            .attr("stroke", cfg.color_link["investment"]);

        transaction_arrowMarker.append("path")
            .attr("d", small_control_arrow_path)
            .attr("fill", cfg.color_link["transaction"])
            .attr("stroke-width", "1px")
            .attr('stroke', cfg.color_link["transaction"])
            .attr("transform", "translate(" + w / 2 + "," + w / 2 + ")")

        // 创建一个索引可以直接通过vertex_id 访问company的弧度
        var company_location = {}
        for (var i in pie(graph.company)) {
            // console.log(pie(graph.company)[i].data.vertex_id)
            company_location[pie(graph.company)[i].data.vertex_id] = graph.company[i]
            company_location[pie(graph.company)[i].data.vertex_id].startAngle = pie(graph.company)[i].startAngle + (pie(graph.company)[i].endAngle - pie(graph.company)[i].startAngle) * 0.7
            company_location[pie(graph.company)[i].data.vertex_id].endAngle = pie(graph.company)[i].endAngle
            company_location[pie(graph.company)[i].data.vertex_id].padAngle = pie(graph.company)[i].padAngle
            // company_location[pie(graph.company)[i]['value']] = graph.company[i]
            // company_location[pie(graph.company)[i]['value']].startAngle = pie(graph.company)[i].startAngle
            // company_location[pie(graph.company)[i]['value']].endAngle = pie(graph.company)[i].endAngle
            // company_location[pie(graph.company)[i]['value']].padAngle = pie(graph.company)[i].padAngle
        }
        // console.log("company location",company_location)

        var person_location = {}
        for (var i in pie(graph.person)) {
            person_location[pie(graph.person)[i].data.vertex_id] = graph.person[i]
            person_location[pie(graph.person)[i].data.vertex_id].startAngle = pie(graph.person)[i].startAngle + (pie(graph.person)[i].endAngle - pie(graph.person)[i].startAngle) * 0.7
            person_location[pie(graph.person)[i].data.vertex_id].endAngle = pie(graph.person)[i].endAngle
            person_location[pie(graph.person)[i].data.vertex_id].padAngle = pie(graph.person)[i].padAngle
            // person_location[pie(graph.person)[i]['value']] = graph.person[i]
            // person_location[pie(graph.person)[i]['value']].startAngle = pie(graph.person)[i].startAngle
            // person_location[pie(graph.person)[i]['value']].endAngle = pie(graph.person)[i].endAngle
            // person_location[pie(graph.person)[i]['value']].padAngle = pie(graph.person)[i].padAngle
        }
        // console.log(person_location)

        /*为每个g以弧参数生成路径*/
        /*d当用布局的时候，就不需要再用路径生成器包裹数据了*/
        person_arcs.append("path")
            .attr("fill", function (d, i) {
                return 'pink';
            })
            .attr("d", function (d) {
                // arc.outerRadius(d.value);
                // console.log(person_arc(d))
                return person_arc(d);
            })
            .attr("id", function (d) {
                return "person-" + d['data'].vertex_id
            })


        company_arcs.append("path")
            .attr("fill", function (d, i) {
                return 'lightblue';
            })
            .attr("d", function (d) {
                // arc.outerRadius(d.value);
                return company_arc(d);
            })
            .attr("id", function (d) {
                return "company-" + d['data'].vertex_id
            })


        transaction_arcs.append("path")
            .attr("d", function (d, i) {
                return chord(d)
            })
            .attr("fill", function (d, i) {
                return '#B0E0E6'
            })
            .attr("stroke-width", "2")
            .attr("stroke", function (d) {
                // return cfg.color_link['transaction'];
                return '#B0E0E6'
            })
            .attr("marker-end", function (d) {
                return "url(#small_transaction_arrow)";
            })
            .attr("id", function (d) {
                return "transaction-" + d.src_node + "-" + d.dst_node;
            })


        investment_arcs.append("path")
            .attr("d", function (d, i) {
                // console.log("investment arcs",d)
                var start = person_chord(d).split(",")[0].slice(1,) + "," + person_chord(d).split(",")[1].split("A")[0]
                var end = company_chord(d).split(",")[0].slice(1,) + "," + company_chord(d).split(",")[1].split("A")[0]
                end = calculate(start.split(',')[0], start.split(',')[1], end.split(',')[0], end.split(',')[1], 2).x
                    + "," + calculate(start.split(',')[0], start.split(',')[1], end.split(',')[0], end.split(',')[1], 2).y
                // console.log(person_chord(d))
                // console.log(company_chord(d))
                // console.log("M"+start+" L"+end)
                return "M" + start + " L" + end
            })
            .attr("fill", function (d, i) {
                return cfg.color_link['investment']
            })
            .attr("stroke-width", "2")
            .attr("stroke", function (d) {
                return cfg.color_link['investment'];
            })
            .attr("marker-end", function (d) {
                return "url(#small_investment_arrow)";
            })
            .attr("id", function (d) {
                return "investment-" + d.src_node + "-" + d.dst_node;
            })

        control_arcs.append("path")
            .attr("d", function (d, i) {
                // console.log("investment arcs",d)
                var start = person_chord(d).split(",")[0].slice(1,) + "," + person_chord(d).split(",")[1].split("A")[0]
                var end = company_chord(d).split(",")[0].slice(1,) + "," + company_chord(d).split(",")[1].split("A")[0]
                end = calculate(start.split(',')[0], start.split(',')[1], end.split(',')[0], end.split(',')[1], 2).x
                    + "," + calculate(start.split(',')[0], start.split(',')[1], end.split(',')[0], end.split(',')[1], 2).y
                return "M" + start + " L" + end
            })
            .attr("fill", function (d, i) {
                return cfg.color_link['control']
            })
            .attr("stroke-width", "2")
            .attr("stroke", function (d) {
                return cfg.color_link['control'];
            })
            .attr("marker-end", function (d) {
                return "url(#small_investment_arrow)";
            })
            .attr("id", function (d) {
                return "control-" + d.src_node + "-" + d.dst_node;
            })

        // family_arcs.append("path");


        // person_arcs.append("text")
        //     .attr("transform", function (d) {
        //         let x = person_arc.centroid(d)[0] * 1.4;//文字的x坐标
        //         let y = person_arc.centroid(d)[1] * 1.4;
        //         return "translate(" + x + "," + y + ")";
        //     })
        //     .attr("text-anchor", "middle")
        //     .text(function (d) {
        //         return d.value;
        //     })

        /*添加div提示框*/
        overview_location = {
            "company_location": company_location,
            "person_location": person_location,
        }
    })
}

// overview_position = overview()
overview()
