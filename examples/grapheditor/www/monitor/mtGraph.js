
mtGraph = function(container, model, renderHint, stylesheet)
{
    mxGraph.call(this, container, model, renderHint, stylesheet);

    this.addListener(mxEvent.CLICK, function(sender, evt)
    {
        var e = evt.getProperty('event'); // mouse event
        var cell = evt.getProperty('cell'); // cell may be null

        if (cell != null)
        {
            // Do something useful with cell and consume the event
            console.log("click");
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