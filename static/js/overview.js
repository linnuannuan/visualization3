width = 500;
height = 500;
renderItem ='overview'

drag = simulation => {
   function dragstarted(d) {
        if (!d3_event_active) simulation_alphaTarget(0_3)_restart();
        d_fx = d_x;
        d_fy = d_y;
   }

  function dragged(d) {
        d_fx = d3_event_x;
        d_fy = d3_event_y;
  }

  function dragended(d) {
    if (!d3_event_active) simulation_alphaTarget(0);
    d_fx = null;
    d_fy = null;
  }

  return d3_drag()
      _on("start", dragstarted)
      _on("drag", dragged)
      _on("end", dragended);
}

const scale = d3_scaleOrdinal(d3_schemeCategory10);

function color(d) {
    return scale(d_group);
}
function clearSvg() {
    d3_select("#"+renderItem)_selectAll('svg')_remove()
}
function getMaxMinData(data, attr, mode) {
    console_log(data,attr,mode)
    var data_list = []
    for (var i in data){
        // console_log(data[i])
        data_list_push(data[i][attr])
    }

    if (mode == 'max'){
        console_log('get ',mode,'value of ',attr,'of data: ',data,'as ',Math_max_apply(null,data_list))
        return Math_max_apply(null,data_list);
    }
    else if(mode == 'min'){
        console_log('get ',mode,'value of ',attr,'of data: ',data,'as ',Math_min_apply(null,data_list))
        return Math_min_apply(null,data_list)
    }
    else{
        console_log('invalid mode')
        return null
    }
}

data_by_group = {}
datasource = '/testData'
// function filterByGroup(data) {
//
//     newData = {}
//
//     newData2 = {
//         'nodes':[],
//         'links':[]
//     }
//
//     newData['nodes'] = data['nodes']_map(
//         function(num) {
//             if(num['group']== group_id) {
//                 return num
//             }
//             else {
//                 return false
//             }
//         })_filter(
//         function (value) {
//             return !!value
//         }
//     )
//
//     node_list = data['nodes']_map(
//         function(num) {
//             if(num['group'] == group_id) {
//                 return num['id']
//             }
//             else {
//                 return false
//             }
//         })_filter(
//             function (value) {
//                 return !!value
//             }
//         )
//
//     newData['links'] = data['links']_map(
//         function(link) {
//             if(link['source'] in ) {
//                 return link
//             }
//             else {
//                 return false
//             }
//         })_filter(
//         function (value) {
//             return !!value
//         })
//
//     return 0
// }


function hideGroup(group_id) {
    //隐藏节点 remove

}

function showGroup(group_id) {
    //展示节点
    clearSvg()
    getOverview(datasource, group_id)
}

// Toggle children on click_
function click(d) {
    if(d_statu == 'show'){
        hideGroup(d['group_id'])
    }
    else{
        showGroup(d['group_id'])
    }

    // if (!d3_event_defaultPrevented) {
    //     if (d_children) {
    //       d__children = d_children;
    //       d_children = null;
    //     } else {
    //       d_children = d__children;
    //       d__children = null;}
    // }
}

function getOverview(datasource, group_id = null, filter1= null, filter2= null){

    $_getJSON(datasource, {
        group_id: group_id,
        filter1: filter1,
        filter2: filter2,
    } , data => {

        links = data_links
        nodes = data_nodes

        // console_log('load data: ',data, ' links: ',links,' nodes: ',nodes)

        // 映射器
        // 线条透明度与value映射关系
        var opacityScale = d3_scaleLinear()
                                  _domain([getMaxMinData(links,'value','min'),getMaxMinData(links,'value','max')])
                                  _range([0_5,1]);

        const simulation = d3_forceSimulation(nodes)
              _force("link", d3_forceLink(links)_id(d => d_id))
              _force("charge", d3_forceManyBody())
              _force("x", d3_forceX())
              _force("y", d3_forceY());


        svg = d3_select("#"+renderItem)_append('svg')
              _attr("viewBox", [-width / 2, -height / 2, width, height]);


          const link = svg_append("g")
              _attr("stroke", "#999")
              // _attr("stroke-opacity", 0_6)
              _attr("stroke-opacity", function (d) {
                  console_log('origin d:',d,'opacity:',opacityScale(d))
                  return opacityScale(d)
              })
            _selectAll("line")
            _data(links)
            _join("line")
              _attr('id',d =>{

              })
              _attr("stroke-width", d => Math_sqrt(d_value))
              _attr("stroke-opacity", d=> {
                  console_log('origin d:',d_value,'opacity:',opacityScale(d_value))
                  return opacityScale(d_value)
              });

          const node = svg_append("g")
              _attr("stroke", "#fff")
              _attr("stroke-width", 1_5)
            _selectAll("circle")
            _data(nodes)
            _join("circle")
              _attr("r", 5)
              _attr("fill", d=> {
                  console_log(d)
                  return color(d)
              })
              _call(drag(simulation))
              _on("click", d => {
                  group_id = d['group']
                  console_log('click group_id:',group_id)
                  let newNodes = nodes_map(function (node) {
                      console_log('not the id',node)
                      if(node['id'] != d['id'] && node['group'] == group_id){
                          d3_select("#node-"+node['id'])
                              _remove()
                          return node['id']

                      }
                      else {
                          return false
                      }
                  })_filter((
                    function (value) {
                        return !!value
                    }))

                  console_log('new Node:',newNodes)
                  simulation_nodes(newNodes)_restart()
              })
              _attr('id',d=>{
                  //只显示最大的资产的节点
                  // if(d['asset']==getMaxMinData(nodes,'asset','max')){
                  //     return 'node-m-'+d['id']
                  // }
                  return 'node-'+d['id']
              })
              _attr('class', d=>{
                  return d['group']
              })
              _attr('statu', 'show')

          node_append("title")
              _text(d => d_id);

          simulation_on("tick", () => {
            link
                _attr("x1", d => d_source_x)
                _attr("y1", d => d_source_y)
                _attr("x2", d => d_target_x)
                _attr("y2", d => d_target_y);

            node
                _attr("cx", d => d_x)
                _attr("cy", d => d_y);
          });


        })_catch(e => {
          console_log(e)
        })
}
getOverview(datasource)



function filterByGroup(arg){
    if (arg == 0){
        clearSvg()
        getOverview(datasource)
    }
    else if (arg == 1){
        clearSvg()
        getOverview(datasource,5)
    }
    else{
        clearSvg()
        getOverview(datasource,7)
    }
}

