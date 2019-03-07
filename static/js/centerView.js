function centerView(node_list) {
    var width = '100%',
        height = 500,
        shiftKey, ctrlKey;


    var center_svg = d3.select("#center_view").append("svg")
        .attr("width", width).attr("height", height)
    // center_svg.append("path").attr("d","M2,2 S6,4 10,2")
    //     .attr("stroke-width",1).attr("stroke","red")
    //     .attr("fill","#fff")


// center_svg.append("circle").attr("r","7").attr("fill","red")
// center_svg.append("path").attr("d","M100,20 L50,0 L0,50 L50,0").attr("stroke","red").attr("stroke-width","5").attr("fill","#fff")


    var link = center_svg.append("g")
        .attr("class", "link")
        .selectAll("line");

    var node = center_svg.append("g")
        .attr("class", "node")
        .selectAll("circle");

    var defs = center_svg.append("defs")
    var transaction_arrowMarker = defs.append("marker")
        .attr("id", "transaction_arrow")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", "12")
        .attr("markerHeight", "12")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", "6")
        .attr("refY", "6")
        .attr("orient", "auto")
    var family_arrowMarker = defs.append("marker")
        .attr("id", "family_arrow")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", "12")
        .attr("markerHeight", "12")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", "6")
        .attr("refY", "6")
        .attr("orient", "auto")
    var investment_arrowMarker = defs.append("marker")
        .attr("id", "investment_arrow")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", "12")
        .attr("markerHeight", "12")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", "6")
        .attr("refY", "6")
        .attr("orient", "auto")
    var control_arrowMarker = defs.append("marker")
        .attr("id", "control_arrow")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", "12")
        .attr("markerHeight", "12")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", "6")
        .attr("refY", "6")
        .attr("orient", "auto")
    var control_arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
    var investment_arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
    var family_arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";
    var trans_arrow_path = "M2,2 L10,6 L2,10 L6,6 L2,2";

    family_arrowMarker.append("path")
        .attr("d", family_arrow_path)
        // .attr("stroke-width", "0px")
        .attr("stroke", cfg.color_link["family"]);

    control_arrowMarker.append("path")
        .attr("d", control_arrow_path)
        // .attr("fill", cfg.color_link["control"])
        // .attr("stroke-width", "1px")
        .attr('stroke', cfg.color_link["control"]);

    investment_arrowMarker.append("path")
        .attr("d", investment_arrow_path)
        // .attr("stroke-width", "0px")
        .attr("stroke", cfg.color_link["investment"]);

    transaction_arrowMarker.append("path")
        .attr("d", trans_arrow_path)
        .attr("stroke", cfg.color_link["transaction"]);


    var xScale = d3.scale.linear()
        .domain([current_view.min_x, current_view.max_x])
        .range([50, 600]);

    // var yScale = d3.scale.linear()
    //     .domain([min_y, max_y])
    //     .range([100, 500]);

    var rScale =  d3.scale.linear()
        .domain([0, 20])
        .range([8, 15]);

    var lineScale = d3.scale.linear()
        .domain([0, 800])
        .range([2, 6]);

    var drag = d3.behavior.drag()
        //设置元素拖拽行为的原点，设置为圆心的位置可以避免明显的元素跳动
        .origin(function () {
                var t = d3.select(this);
                return {
                    x:t.attr("cx"),
                    y:t.attr("cy")
                }
            }
        )
        .on("drag",dragmove)
    function dragmove(d){
        d3.select(this)
            .attr("cx",
                function () {
                    return d.cx = d3.event.x
                }
            )
            .attr("cy",
                function () {
                    return d.cY = d3.event.y
                })
    }

//根据小地图的 min_x,min_y,max_x,max_y   刷新中央视图，取出范围内的node & relationship
    d3.json("./static/data/graph.json", function (error, graph) {
        // d3.json("./static/data/dg-sm.json", function (error, graph) {
        var center_nodeGraph = {
            nodes: [],
            links: {
                "vertical_link":[],
                "horizontal_link":[],
            }
        };
        var dt = {
            nodes: {}
        }
        for (var i = 0; i < graph.nodes.length; i++) {
            if (graph.nodes[i].x < current_view.max_x && graph.nodes[i].y < current_view.max_y
                && graph.nodes[i].x > current_view.min_x && graph.nodes[i].y > current_view.min_y
            ) {
                //获取中心视图内的节点
                graph.nodes[i].x = xScale(graph.nodes[i].x)
                dt.nodes[graph.nodes[i].id] = graph.nodes[i]
                center_nodeGraph.nodes.push(graph.nodes[i])
                // dt.nodes[graph.nodes[i].id].x = graph.nodes[i].x
            }
        }

        for (var i = 0; i < graph.links.length; i++) {
            if (dt.nodes.hasOwnProperty(graph.links[i].sid) && dt.nodes.hasOwnProperty(graph.links[i].tid)) {
                // console.log(d)
                if(graph.links[i].type == "transaction"||graph.links[i].type == "family"){
                    center_nodeGraph.links.horizontal_link.push(
                        {
                            source: dt.nodes[graph.links[i].sid],
                            target: dt.nodes[graph.links[i].tid],
                            type:graph.links[i].type,
                            importance:graph.links[i].importance
                        }
                    )
                }
                if(graph.links[i].type == "investment"||graph.links[i].type == "control") {
                    center_nodeGraph.links.vertical_link.push(
                        {
                            source: dt.nodes[graph.links[i].sid],
                            target: dt.nodes[graph.links[i].tid],
                            type: graph.links[i].type,
                            importance: graph.links[i].importance
                        }
                    )
                }
                // center_nodeGraph.links[i].source = dt.nodes[graph.links[i].sid];
                // center_nodeGraph.links[i].target = dt.nodes[graph.links[i].tid];
            }
        }
        node = node.data(center_nodeGraph.nodes).enter().append("circle")
            .attr("r", function (d){
                return rScale(d.r)
            })
            .attr('fill', function (d) {
                if(node_list!=null && node_list.indexOf(d.id)>=0){
                    return '#DB879C'
                }
                else {
                    return '#98ADC9'
                }
            })
            .attr("cx",function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            })
            .attr("stroke", "#CEC3D6")
            .call(drag)
        // console.log(dt)
        // 计算箭头末端位置
        // location = calculate(dt.nodes[d.sid].x,dt.nodes[d.sid].y,dt.nodes[d.tid].x,dt.nodes[d.tid].y,r:圆的半径)
        vertical_link = link.data(center_nodeGraph.links.vertical_link).enter().append("line")
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return calculate(d.source.x, d.source.y, d.target.x, d.target.y, rScale(d.target.r) + 10).x;
            })
            .attr("y2", function (d) {
                return calculate(d.source.x, d.source.y, d.target.x, d.target.y, rScale(d.target.r) + 10).y;
            })
            .attr("stroke", function (d) {
                return cfg.color_link[d.type];
            })
            .attr("stroke-width", function (d) {
                return 3
                // return lineScale(d.importance);
            })
            .attr("marker-end", function (d) {
                // console.log(d)
                return "url(#" + d.type + "_arrow)";
            })
        horizontal_link = link.data(center_nodeGraph.links.horizontal_link).enter().append("path")
            // .attr("d", "M150,2 S250,60 400,2")
            .attr("d",function (d) {
                console.log("d","M"+d.source.x+","+d.source.y+" S"+ (d.source.x+d.target.x)/2+ "," +(d.source.y+10)+" "+d.target.x+","+d.target.y)
                return "M"+d.source.x+","+d.source.y+" S"+ (d.source.x+d.target.x)/2+ "," +(d.source.y+10)+" "+d.target.x+","+d.target.y
            })
            .attr("stroke", function (d) {
                return cfg.color_link[d.type];
            })
            .attr("stroke-width", function (d) {
                return 3
                // return lineScale(d.importance);
            })
            .attr("marker-end", function (d) {
                // console.log(d)
                return "url(#" + d.type + "_arrow)";
            })
            .attr("fill","#fff")
    })
}
centerView()