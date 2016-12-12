var mlabs = mlabs || {};
mlabs.xrm = mlabs.xrm || {};

mlabs.xrm.xmlStringBuilder = function () {
    var _xml = "";
    var _tagsStack = [];
    var _openTag = function (tag, attributes) {
        _xml += "<" + tag;

        for (var attr in attributes) {
            if (attributes.hasOwnProperty(attr) && attributes[attr] != null && typeof attributes[attr] !== "undefined") {
                _xml += " " + attr + "=\"" + attributes[attr] + "\"";
            }
        }
        _xml += ">";
        _tagsStack.push("</" + tag + ">");
    };

    var _closeTag = function () {
        _xml += _tagsStack.pop();
    };

    return {
        getXmlString: function () {
            if (_tagsStack.length > 0) {
                console.log("Some of tags were not close. Please use '.closeAllTags()' or validate your building steps");
            }

            return _xml;
        },
        openTag: function (tag, attributes) {
            _openTag(tag, attributes);
            return this;
        },
        insertString: function (xmlString) {
            _xml += xmlString;
        },
        closeTag: function () {
            _closeTag();
            return this;
        },
        closeAllTags: function () {
            while (_tagsStack.length > 0) {
                _closeTag();
            }
            return this;
        }
    };
}

mlabs.xrm.entityBuilder = function (rootElementName, rootElementAttributesNameArray) {
    var _entityLinks = [];
    var _attributes = [];
    var _filters = [];
    var _linkEntities = [];
    var _allAttributesSelected = true;
    var _rootElementName = rootElementName;
    var _rootAttributes = {};
    var _setRootAttribute = function (name) {
        return function (value) {
            _rootAttributes[name] = value;
            return this;
        }
    };

    rootElementAttributesNameArray = rootElementAttributesNameArray || []
    for (var i = 0; i < rootElementAttributesNameArray.length; i++) {

        var methodName = rootElementAttributesNameArray[i];
        methodName = methodName.split('-').map(function (attrName) {
            return attrName.charAt(0).toUpperCase() + attrName.slice(1);
        }).join('');
        this["set" + methodName] = _setRootAttribute(rootElementAttributesNameArray[i]);
    }

    var _conditionBuilder = function () {
        var _values = [];
        var _attributeName = "";
        var _operator = "eq";

        var operator = function (operatorName) {
            return function () {
                _operator = operatorName;
                _values = arguments;

            }
        }

        this.getConditionXml = function () {
            var xmlBuilder = new mlabs.xrm.xmlStringBuilder();
            var rootAttr = { attribute: _attributeName, operator: _operator };

            if (_values.length == 1) {
                rootAttr["value"] = _values[0];
            }

            xmlBuilder.openTag("condition", rootAttr);
            if (_values.length > 1) {
                for (var i = 0; i < _values.length; i++) {
                    xmlBuilder.openTag("value");
                    xmlBuilder.insertString(_values[i]);
                    xmlBuilder.closeTag();
                }
            }
            xmlBuilder.closeTag();

            return xmlBuilder.getXmlString();
        }

        this.builderApi = {
            attribute: function (attributeName) {
                _attributeName = attributeName;
                return {
                    equals: operator("eq"),
                    isNotEqual: operator("ne"),
                    isLessThan: operator("lt"),
                    isLessEqual: operator("le"),
                    isGreaterThan: operator("gt"),
                    isGreaterEqual: operator("ge"),
                    contains: operator("like"),
                    isIn: operator("in"),
                    isBetween: operator("between"),
                    doesNotContain: operator("not-like"),
                    //todo: more operators if needed                
                }
            }
        };
    }

    var _filterBuilder = function () {
        var _conditions = [];
        var _builderFilters = [];
        var _type = "and";

        this.builderApi = {
            type: function (type) {
                type = (type || "").toLowerCase();
                if (type !== "or" && type !== "and") {
                    throw new Error("FetchXml builder: Filter type can only have values: 'or', 'and'")
                }
                _type = type;
                return this;
            },
            addFilter: function (filteringFunction) {
                var builder = new _filterBuilder();
                filteringFunction(builder.builderApi);
                _builderFilters.push(builder.getFilterXml());
                return this;
            },
            addCondition: function (conditionFunction) {
                var conditionBuilder = new _conditionBuilder();
                conditionFunction(conditionBuilder.builderApi);
                _conditions.push(conditionBuilder.getConditionXml());
                return this;
            }
        };

        this.getFilterXml = function () {
            var xmlBuilder = new mlabs.xrm.xmlStringBuilder();
            xmlBuilder.openTag("filter", { "type": _type });
            for (var i = 0; i < _conditions.length; i++) {
                xmlBuilder.insertString(_conditions[i]);
            }

            for (var i = 0; i < _builderFilters.length; i++) {
                xmlBuilder.insertString(_builderFilters[i]);
            }

            xmlBuilder.closeTag();

            return xmlBuilder.getXmlString();
        }
    };

    this.addFilter = function (filteringFunction) {
        var builder = new _filterBuilder();
        filteringFunction(builder.builderApi);
        _filters.push(builder.getFilterXml())
        return this;
    }

    this.setEntityName = function (entityName) {
        _rootAttributes["name"] = entityName;
        return this;
    }

    this.addAttribute = function (attributeName) {
        _attributes.push(attributeName);
        _allAttributesSelected = false;

        return this;
    }

    this.addEntityLink = function (entityLinkBuildingFunction) {
        var builder = new mlabs.xrm.entityBuilder("link-entity", ["from", "to", "name", "link-type"]);
        entityLinkBuildingFunction(builder);
        _entityLinks.push(builder.getEntityXml());
        return this;
    }

    this.getEntityXml = function () {
        var xmlBuilder = new mlabs.xrm.xmlStringBuilder();
        xmlBuilder.openTag(_rootElementName, _rootAttributes);

        if (_attributes.length && !_allAttributesSelected) {
            for (var i = 0; i < _attributes.length; i++) {
                xmlBuilder.openTag("attribute", { name: _attributes[i] });
                xmlBuilder.closeTag();
            }
        } else {
            xmlBuilder.openTag("all-attributes");
            xmlBuilder.closeTag();
        }

        for (var i = 0; i < _filters.length; i++) {
            xmlBuilder.insertString(_filters[i]);
        }

        for (var i = 0; i < _entityLinks.length; i++) {
            xmlBuilder.insertString(_entityLinks[i]);
        }

        xmlBuilder.closeTag();

        return xmlBuilder.getXmlString();
    }

}

mlabs.xrm.fetchXmlBuilder = function () {
    var _count;
    var _top = -1;
    var _distinct = true;

    this.setCount = function (count) {
        _count = count;
        return this;
    }

    this.setTop = function (top) {
        _top = top;
        return this;
    }

    this.setDistinct = function (shouldDistinct) {
        _distinct = shouldDistinct;
    }

    var _getFetchAttributes = function () {
        var attributes = {};
        attributes["count"] = _count || 5000;
        attributes["distinct"] = _distinct || true;
        if (_top > -1) {
            attributes["top"] = _top;
            delete attributes["count"];
        }

        return attributes;
    }

    mlabs.xrm.entityBuilder.call(this, "entity", ["name"]);

    this.getFetchXml = function () {
        var xmlBuilder = new mlabs.xrm.xmlStringBuilder();
        xmlBuilder.openTag("fetch", _getFetchAttributes());
        xmlBuilder.insertString(this.getEntityXml());
        xmlBuilder.closeTag();

        return xmlBuilder.getXmlString();
    }
}

module.exports = mlabs;
