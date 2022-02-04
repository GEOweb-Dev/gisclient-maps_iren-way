//*********************************************************************************************************
//**** Functions for GEOweb - Iren Way integration
//**** OSFC integration functions

var OSFCDataIrenWay = {
    action: 'writeOnOFSC'
};

window.GCComponents.Functions.postMessageHandlerIrenWay = function (event) {
    // **** TODO: validate source
    var postData = event.data;
    if (postData.action == 'centerMapIrenWay') {
        if(postData.x && postData.y) {
            var zoom = typeof (postData.zoom) == 'undefined'?clientConfig.IRENWAY_DEFAULT_ZOOM:postData.zoom;
            var sridDefault = typeof(GisClientMap.map.displayProjection) == 'undefined'?GisClientMap.map.projection:GisClientMap.map.displayProjection;
            var srid = typeof (postData.srid) == 'undefined'?sridDefault:postData.srid;
            window.GCComponents.Functions.centerMap(postData.x, postData.y, srid, zoom)
        }
        else if (postData.layer) {
            var fType = GisClientMap.getFeatureType(postData.layer);
            if (!fType)
                return;

            var values = {};
            var queryString = '';
            for (var i=0; i<fType.properties.length; i++) {
                if (fType.properties[i].searchType == 0)
                    continue;
                var fieldName = fType.properties[i].name;
                var valPlaceholder = 'param' + i;
                if (typeof (postData[fieldName]) != 'undefined') {
                    if (queryString.length == 0) {
                        queryString += fieldName + ' = :' + valPlaceholder;
                    }
                    else {
                        queryString += ' AND ' + fieldName + ' = :' + valPlaceholder;
                    }
                    values[valPlaceholder] = postData[fieldName];
                }
            }
            if (queryString.length > 0) {
                queryString = '(' + queryString + ')';
                window.GCComponents.Functions.centerMapOnFeature(postData.layer, queryString, values);
            }
        }
    }
}

// **** PostMessage
window.addEventListener('message', window.GCComponents.Functions.postMessageHandlerIrenWay, false);

window.GCComponents.Functions.sendToIrenWay = function(irenwayItems) {
    if (irenwayItems.x && irenwayItems.y && irenwayItems.srid) {
        if (irenwayItems.srid !== clientConfig.IRENWAY_SRID)
            return;
        OSFCDataIrenWay.coordx = irenwayItems.x;
        OSFCDataIrenWay.coordy = irenwayItems.y;
    }
    else {
        for (var field in irenwayItems) {
            var fieldVal = (typeof(irenwayItems[field]) === 'undefined')?null:irenwayItems[field];
            OSFCDataIrenWay[field] = fieldVal;
        }
    }
    parent.postMessage(OSFCDataIrenWay,'*');
}

window.GCComponents.Functions.resetIrenWayData = function(){
    OSFCDataIrenWay = {
        action: 'writeOnOFSC'
    };
}
