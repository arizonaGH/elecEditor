function getCircuitCells(graphId, cellId)
{
    var cells = [];

    // var ret = (function($) {
    //     return $.ajax({
    //         url : BASE_URL + "/circuits?graph_id="+graphId+"&cell_id="+cellId,
    //         type : 'get',
    //         async: false,
    //     });
    // })(jQuery);
    //
    // if (ret.status == 200) {
    //     var vars = ret.responseJSON;
    //     for (var i = 0; i < vars.length; i++) {
    //         data.sn[i] =   vars[i].sn;
    //         data.name[i] = vars[i].name;
    //     }
    // }
    return cells;
}