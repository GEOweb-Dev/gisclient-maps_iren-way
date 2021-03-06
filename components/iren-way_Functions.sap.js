//*********************************************************************************************************
//**** Functions for GEOweb - Iren Way integration
//**** SAP integration functions

window.GCComponents.InitFunctions.centerMapIrenWay = function () {
    var queryStringItems = window.GCComponents.Functions.parseQueryString();
    if(queryStringItems.x && queryStringItems.y) {
        var zoom = typeof (queryStringItems.zoom) == 'undefined'?clientConfig.IRENWAY_DEFAULT_ZOOM:queryStringItems.zoom;
        var sridDefault = typeof(GisClientMap.map.displayProjection) == 'undefined'?GisClientMap.map.projection:GisClientMap.map.displayProjection;
        var srid = typeof (queryStringItems.srid) == 'undefined'?sridDefault:queryStringItems.srid;
        window.GCComponents.Functions.centerMap(queryStringItems.x, queryStringItems.y, srid, zoom)
    }
    else if (queryStringItems.layer) {
        var fType = GisClientMap.getFeatureType(queryStringItems.layer);
        if (!fType)
            return;

        var values = {};
        var queryString = '';
        for (var i=0; i<fType.properties.length; i++) {
            if (fType.properties[i].searchType == 0)
                continue;
            var fieldName = fType.properties[i].name;
            var valPlaceholder = 'param' + i;
            if (typeof (queryStringItems[fieldName]) != 'undefined') {
                if (queryString.length == 0) {
                    queryString += fieldName + ' = :' + valPlaceholder;
                }
                else {
                    queryString += ' AND ' + fieldName + ' = :' + valPlaceholder;
                }
                values[valPlaceholder] = queryStringItems[fieldName];
            }
        }
        if (queryString.length > 0) {
            queryString = '(' + queryString + ')';
            window.GCComponents.Functions.centerMapOnFeature(queryStringItems.layer, queryString, values);
        }
    }
}

window.GCComponents.Functions.sendToIrenWay = function(irenwayItems) {
    window.GCComponents.Functions.updateQueryString(irenwayItems);
}

window.GCComponents.Functions.resetIrenWayData = function(){
    if (history.pushState) {
        var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        newUrl += '?mapset=' + GisClientMap.map.config.mapsetName;
        window.history.pushState({path:newUrl},'',newUrl);
    }
}
