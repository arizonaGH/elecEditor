function getCircuitCells(graphId, cellId)
{
    var cells = [];

    var ret = (function($) {
        return $.ajax({
            url : BASE_URL + "/circuits?graph_id="+graphId+"&cell_id="+cellId,
            type : 'get',
            async: false,
        });
    })(jQuery);

    if (ret.status == 200) {
        cells = ret.responseJSON;
    }
    return cells;
}