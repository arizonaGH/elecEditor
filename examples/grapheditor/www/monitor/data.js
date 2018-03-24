function loadFile(id){
    var ret = (function($) {
        return $.ajax({
            url : BASE_URL + OPEN_URL+"/"+id,
            type : 'get',
            async: false,
        });
    })(jQuery);

    if (ret.status == 200) {
        return ret.responseJSON;
    }
    else {
        mxUtils.error('Get graph failed.', 200, false);
        return null;
    }

}

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

function getRealtimeData(graphId) {
    var data = [];

    var ret = (function($) {
        return $.ajax({
            url : BASE_URL + "/vars/realtimedata?graph_id="+graphId+"&ids=11,13,15,18",
            type : 'get',
            async: false,
        });
    })(jQuery);

    if (ret.status == 200) {
        data = ret.responseJSON;
    }
    return data;
}