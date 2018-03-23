mtCellsMarker = function (graph, validColor, invalidColor, hotspot)
{
    mxCellMarker.call(this, graph, validColor, invalidColor, hotspot);
}

mxUtils.extend(mtCellsMarker, mxCellMarker);

mtCellsMarker.prototype.markers = [];


mtCellsMarker.prototype.setCurrentState = function(state, me, color)
{
    var isValid = (state != null) ? this.isValidState(state) : false;
    color = (color != null) ? color : this.getMarkerColor(me.getEvent(), state, isValid);

    if (isValid)
    {
        this.validState = state;
    }
    else
    {
        this.validState = null;
    }

    if (state != this.markedState || color != this.currentColor)
    {
        this.currentColor = color;

        if (state != null && this.currentColor != null)
        {
            var type = (state != null) ? state.cell.value.getAttribute("type") : null;
            if(type != null && type.indexOf("lcb") != -1)
            {
                this.markedState = state;
                this.mark();

                //获取环路元件列表
                var id = state.cell.id;
                var graphId = this.graph.getId();
                var cellIds = getCircuitCells(graphId, id);

                for(var i = 0; i<cellIds.length; i++)
                {
                    var cur = this.graph.getModel().getCell(cellIds[i]);
                    if(cur != null)
                    {
                        var marker = new mxCellMarker(this.graph,'#ffff00');
                        marker.markCell(cur);
                        this.markers.push(marker);
                    }
                }
            }
        }
        else if (this.markedState != null)
        {
            this.markedState = null;
            this.unmark();
            for(var i=0; i<this.markers.length; i++)
            {
                this.markers[i].unmark();
                this.markers[i].destroy();
            }
            this.markers=[];
        }
    }
};