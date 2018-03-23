
mtGraph = function(container, model, renderHint, stylesheet)
{
    mxGraph.call(this, container, model, renderHint, stylesheet);

    //hover highlight
    var marker = new mtCellsMarker(this,'#ffff00');
    this.addMouseListener({
        mouseDown:function() {

        },
        mouseMove: function(sender, me)
        {
            marker.process(me);
        },
        mouseUp: function() {}
    });


    this.addListener(mxEvent.CLICK, function(sender, evt)
    {
        var e = evt.getProperty('event'); // mouse event
        var cell = evt.getProperty('cell'); // cell may be null

        if (cell != null)
        {
            var type = cell.value.getAttribute("type");
            if(type != null && type.indexOf("lcb") != -1)
            {
                //环路断路器单击事件
                if(this.markerCellId != null)
                {
                    //消除高亮
                    for(var i = 0; i<this.markers.length; i++)
                    {
                        this.markers[i].unmark();
                        this.markers[i].destroy();
                    }
                    this.markers = [];

                    if(this.markerCellId == cell.id)  //点击同一元件，取消高亮
                    {
                        this.markerCellId = null;
                        return;
                    }
                }
                if(this.markerCellId == null || this.markerCellId != cell.id)
                {
                    //TODO: 获取环路数据
                    var graphId = this.getId();
                    var cellIds = getCircuitCells(graphId, cell.id);

                    //stub
                    cellIds = ["83","84"];
                    if(cell.id == "82")
                    {
                        cellIds = ["85","82"];
                    }

                    for(var i = 0; i<cellIds.length; i++)
                    {
                        var cur = this.getModel().getCell(cellIds[i]);
                        if(cur != null)
                        {
                            var marker = new mxCellMarker(this,'#ffff00');
                            marker.markCell(cur);
                            this.markers.push(marker);
                        }
                    }
                    this.markerCellId = cell.id;
                }
            }
            else{
                //其他元件单击事件
                console.log("click");
            }
            evt.consume();
        }
    });

    this.isHtmlLabel = function(cell)
    {
        var state = this.view.getState(cell);
        var style = (state != null) ? state.style : this.getCellStyle(cell);

        return style['html'] == '1' || style[mxConstants.STYLE_WHITE_SPACE] == 'wrap';
    };

    // HTML entities are displayed as plain text in wrapped plain text labels
    this.cellRenderer.getLabelValue = function(state)
    {
        var result = mxCellRenderer.prototype.getLabelValue.apply(this, arguments);

        if (state.view.graph.isHtmlLabel(state.cell))
        {
            if (state.style['html'] != 1)
            {
                result = mxUtils.htmlEntities(result, false);
            }
            else
            {
                result = state.view.graph.sanitizeHtml(result);
            }
        }

        return result;
    };
};

mxUtils.extend(mtGraph, mxGraph);

//for highlight
mtGraph.prototype.markers = [];
mtGraph.prototype.markerCellId = null;
mtGraph.prototype.id  = null;

mtGraph.prototype.setId = function(id)
{
    this.id = id;
}
mtGraph.prototype.getId = function()
{
    return this.id;
}

mtGraph.prototype.getLabel = function(cell)
{
    var result = mxGraph.prototype.getLabel.apply(this, arguments);

    if (result != null && this.isReplacePlaceholders(cell) && cell.getAttribute('placeholder') == null)
    {
        result = this.replacePlaceholders(cell, result);
    }

    return result;
};

mtGraph.prototype.isReplacePlaceholders = function(cell)
{
    return cell.value != null && typeof(cell.value) == 'object' &&
        cell.value.getAttribute('placeholders') == '1';
};

mtGraph.prototype.replacePlaceholders = function(cell, str)
{
    var result = [];
    var last = 0;
    var math = [];

    while (match = this.placeholderPattern.exec(str))
    {
        var val = match[0];

        if (val.length > 2 && val != '%label%' && val != '%tooltip%')
        {
            var tmp = null;

            if (match.index > last && str.charAt(match.index - 1) == '%')
            {
                tmp = val.substring(1);
            }
            else
            {
                var name = val.substring(1, val.length - 1);

                // Workaround for invalid char for getting attribute in older versions of IE
                if (name.indexOf('{') < 0)
                {
                    var current = cell;

                    while (tmp == null && current != null)
                    {
                        if (current.value != null && typeof(current.value) == 'object')
                        {
                            tmp = (current.hasAttribute(name)) ? ((current.getAttribute(name) != null) ?
                                current.getAttribute(name) : '') : null;
                        }

                        current = this.model.getParent(current);
                    }
                }

                if (tmp == null)
                {
                    tmp = this.getGlobalVariable(name);
                }
            }

            result.push(str.substring(last, match.index) + ((tmp != null) ? tmp : val));
            last = match.index + val.length;
        }
    }

    result.push(str.substring(last));

    return result.join('');
};

mtGraph.prototype.convertValueToString = function(cell)
{
    if (cell.value != null && typeof(cell.value) == 'object')
    {
        if (this.isReplacePlaceholders(cell) && cell.getAttribute('placeholder') != null)
        {
            var name = cell.getAttribute('placeholder');
            var current = cell;
            var result = null;

            while (result == null && current != null)
            {
                if (current.value != null && typeof(current.value) == 'object')
                {
                    result = (current.hasAttribute(name)) ? ((current.getAttribute(name) != null) ?
                        current.getAttribute(name) : '') : null;
                }

                current = this.model.getParent(current);
            }

            return result || '';
        }
        else
        {
            return cell.value.getAttribute('label');
        }
    }

    return mxGraph.prototype.convertValueToString.apply(this, arguments);
};

mtGraph.prototype.sanitizeHtml = function(value, editing)
{
    // Uses https://code.google.com/p/google-caja/wiki/JsHtmlSanitizer
    // NOTE: Original minimized sanitizer was modified to support
    // data URIs for images, mailto and special data:-links.
    // LATER: Add MathML to whitelisted tags
    function urlX(link)
    {
        if (link != null && link.toString().toLowerCase().substring(0, 11) !== 'javascript:')
        {
            return link;
        }

        return null;
    };
    function idX(id) { return id };

    return html_sanitize(value, urlX, idX);
};

mtGraph.prototype.getCursorForCell = function(cell)
{
    if (cell != null )
    {
        return 'pointer';
    }
};