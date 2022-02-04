// *******************************************************************************************
//********************************************************************************************
//**** Custom Controls for GEOweb - Iren Way integration

window.GCComponents["Layers"].addLayer('layer-iren-way-highlight', {
    displayInLayerSwitcher:false,
    styleMap: new OpenLayers.StyleMap({
        'default': {
            fill: false,
            fillColor: "red",
            fillOpacity: 0.9,
            hoverFillColor: "white",
            hoverFillOpacity: 0.9,
            strokeColor: "red",
            strokeOpacity: 0.9,
            strokeWidth: 10,
            strokeLinecap: "round",
            strokeDashstyle: "solid",
            hoverStrokeColor: "red",
            hoverStrokeOpacity: 1,
            hoverStrokeWidth: 10,
            pointRadius: 8,
            hoverPointRadius: 1,
            hoverPointUnit: "%",
            pointerEvents: "visiblePainted",
            cursor: "inherit"
        },
        'select': {
            fill: true,
            fillColor: "red",
            fillOpacity: 0.9,
            hoverFillColor: "white",
            hoverFillOpacity: 0.9,
            strokeColor: "red",
            strokeOpacity: 1,
            strokeWidth: 10,
            strokeLinecap: "round",
            strokeDashstyle: "solid",
            hoverStrokeColor: "red",
            hoverStrokeOpacity: 1,
            hoverStrokeWidth: 10,
            pointRadius: 8,
            hoverPointRadius: 1,
            hoverPointUnit: "%",
            pointerEvents: "visiblePainted",
            cursor: "pointer"
        },
        'temporary': {
            fill: true,
            fillColor: "EEA652",
            fillOpacity: 0.2,
            hoverFillColor: "white",
            hoverFillOpacity: 0.8,
            strokeColor: "#EEA652",
            strokeOpacity: 1,
            strokeLinecap: "round",
            strokeWidth: 4,
            strokeDashstyle: "solid",
            hoverStrokeColor: "red",
            hoverStrokeOpacity: 1,
            hoverStrokeWidth: 0.2,
            pointRadius: 6,
            hoverPointRadius: 1,
            hoverPointUnit: "%",
            pointerEvents: "visiblePainted",
            cursor: "pointer"
        }
    })
}, {
    "sketchcomplete": function(obj) {

    },
    "featureadded": function(obj) {
        var feature = obj.feature;
        var irenwayArrayData = [];

        for (var j=0; j<clientConfig.IRENWAY_LAYERS.length; j++) {
            if (clientConfig.IRENWAY_LAYERS[j].layers.indexOf(feature.featureTypeName) > -1) {
                for (var k = 0; k < clientConfig.IRENWAY_LAYERS[j].fields.length; k++) {
                    var dataField = clientConfig.IRENWAY_LAYERS[j].outvars[k];
                    var dataValue = feature.attributes[clientConfig.IRENWAY_LAYERS[j].fields[k]];
                    if (clientConfig.IRENWAY_LAYERS[j].numfeats > 1) {
                        var tmpObj = {};
                        tmpObj[dataField] = dataValue;
                        irenwayArrayData.push(tmpObj);
                    }
                    else {
                        this.irenwayExportData[dataField] = dataValue;
                    }
                }
                var outItemName = clientConfig.IRENWAY_LAYERS[j].outitem;
                if (typeof(outItemName) != 'undefined') {
                    this.irenwayExportData['irenway_outitem'] = outItemName;
                    if (irenwayArrayData.length > 0) {
                        this.irenwayExportData[outItemName] = irenwayArrayData;
                    }
                }
            }
        }
    }
});


// **** Point marker layer (TODO: style)
window.GCComponents["Layers"].addLayer('layer-iren-way-markpoint', {
    displayInLayerSwitcher:false,
    styleMap: new OpenLayers.StyleMap({
        'default': {
            cursor: "inherit",
            graphicHeight: 32,
            externalGraphic: "../../plugins/gisclient-maps_iren-way/css/images/irenway_marker.png"
        }
    })
}, {
    "sketchcomplete": function(obj) {
        var tmpGeom = obj.feature.geometry.clone();
        var srid = this.map.displayProjection?this.map.displayProjection:this.map.projection;
        if (srid != this.map.projection) {
            tmpGeom.transform(this.map.projection, srid);
        }
        window.GCComponents.Functions.sendToIrenWay({x: tmpGeom.x, y:tmpGeom.y, srid:srid});

        if (typeof(clientConfig.IRENWAY_SRID) !== 'undefined') {
            tmpGeom = obj.feature.geometry.clone();
            srid = clientConfig.IRENWAY_SRID;
            if (srid != this.map.projection) {
                tmpGeom.transform(this.map.projection, srid);
            }
            window.GCComponents.Functions.sendToIrenWay({x: tmpGeom.x, y:tmpGeom.y, srid:srid});
        }

        this.removeAllFeatures();
    },
    "featureadded": function(obj) {
        // **** Get main selection control
        var selectControls = this.map.getControlsBy('gc_id', 'control-querytoolbar');
        if (selectControls.length != 1)
            return;
        if (!selectControls[0].controls)
            return;
        var selectControl = selectControls[0];
        selectControl.controls[0].layers = [];
        // **** insert configured WFS layers
        if (typeof(clientConfig.IRENWAY_LAYERS) === 'undefined') {
            return;
        }
        var resultLayer = this.map.getLayersByName('layer-iren-way-highlight')[0];
        if (resultLayer) {
            resultLayer.irenwayExportData = {};
        }
        else {
            return;
        }
        var featureTypes = '';
        var selectLayers = [];
        var numFeatures = 0;
        var selectControlAuto = this.map.getControlsBy('gc_id', 'control-iren-way-autoselect')[0];

        for (var i=0; i<clientConfig.IRENWAY_LAYERS.length; i++) {
            for (var j=0; j<clientConfig.IRENWAY_LAYERS[i].layers.length; j++) {
                var tmpLayer = selectControl.getLayerFromFeature(clientConfig.IRENWAY_LAYERS[i].layers[j]);
                var idx;
                for (idx = 0; idx < selectLayers.length; idx++)  {
                    if (selectLayers[idx].id === tmpLayer.id)
                        break;
                }
                if (idx === selectLayers.length)
                    selectLayers.push(tmpLayer);
                featureTypes += clientConfig.IRENWAY_LAYERS[i].layers[j] + ',';
            }
            numFeatures += clientConfig.IRENWAY_LAYERS[i].numfeats;
        }
        selectControlAuto.layers = selectLayers;
        selectControlAuto.queryFeatureType = featureTypes.substring(0, featureTypes.length -1);
        selectControlAuto.wfsCache = selectControls[0].wfsCache;
        selectControlAuto.resultLayer = resultLayer;
        selectControlAuto.maxFeatures = numFeatures;
        selectControlAuto.activate();
        selectControlAuto.select(obj.feature.geometry);
        selectControlAuto.deactivate();

        return true;
    }
});

// **** Auto select click control
window.GCComponents["Controls"].addControl('control-iren-way-autoselect', function(map){
    return new OpenLayers.Control.QueryMap(
        OpenLayers.Handler.Click,
        {
            gc_id: 'control-iren-way-autoselect',
            baseUrl: GisClientMap.baseUrl,
            maxFeatures:1,
            deactivateAfterSelect: true,
            vectorFeaturesOverLimit: new Array(),
            eventListeners: {
                'activate': function(){
                    var selectControls = this.map.getControlsBy('gc_id', 'control-querytoolbar');
                    if (selectControls.length != 1)
                        return false;

                },
                'endQueryMap': function(event) {
                    if(event.layer.irenwayExportData) {
                        var irenWayExportData = event.layer.irenwayExportData;
                        var exportToIrenWay = {};
                        $.each(clientConfig.IRENWAY_OUTDATA, function (key, item) {
                            var arrOutData = [];
                            for (var i=0; i<item.length; i++) {
                                var outDataOption = item[i];
                                for (var j=0; j<outDataOption.length; j++) {
                                    var outDataVar = outDataOption[j];
                                    if (outDataVar.hasOwnProperty('const')) {
                                        arrOutData.push(outDataVar.const);
                                    }
                                    else if (outDataVar.hasOwnProperty('var')) {
                                        if (irenWayExportData.hasOwnProperty(outDataVar.var)) {
                                            arrOutData.push(irenWayExportData[outDataVar.var]);
                                        }
                                        else {
                                            arrOutData = [];
                                            break;
                                        }
                                    }
                                    else {
                                        arrOutData = [];
                                        break;
                                    }
                                }
                                if (arrOutData.length > 0) {
                                    break;
                                }
                            }
                            exportToIrenWay[key] = arrOutData.join(clientConfig.IRENWAY_CONCATSTRING);
                        });
                        window.GCComponents.Functions.sendToIrenWay(exportToIrenWay);
                        event.layer.irenwayExportData = {};
                    }
                    if (this.resultLayer.hasOwnProperty('renderQueue')) {
                        delete this.resultLayer.renderQueue;
                    }
                },
            }
        }
    )
});

// **** Point marker draw control
window.GCComponents["Controls"].addControl('control-iren-way-markpoint', function(map){
    return new OpenLayers.Control.DrawFeature(
        map.getLayersByName('layer-iren-way-markpoint')[0],
        OpenLayers.Handler.Point,
        {
            gc_id: 'control-iren-way-markpoint',
            eventListeners: {
                'activate': function(e){
                    if (map.currentControl != this) {
                        map.currentControl.deactivate();
                        var touchControl = map.getControlsByClass("OpenLayers.Control.TouchNavigation");
                        if (touchControl.length > 0) {
                            touchControl[0].dragPan.deactivate();
                        }
                    }
                    map.currentControl=this;
                },
                'deactivate': function(e){
                    var touchControl = map.getControlsByClass("OpenLayers.Control.TouchNavigation");
                    if (touchControl.length > 0) {
                        touchControl[0].dragPan.activate();
                    }

                    var btnControl = map.getControlsBy('id', 'button-iren-way-markpoint')[0];
                    if (btnControl.active)
                        btnControl.deactivate();

                }
            }
        }
    )
});

// **** Toolbar button
window.GCComponents["SideToolbar.Buttons"].addButton (
    'button-iren-way-markpoint',
    'Esporta coordinate per IRENWAY',
    'icon-iren-way',
    function() {
        if (sidebarPanel.handleEvent || typeof(sidebarPanel.handleEvent) === 'undefined')
        {
            this.map.getLayersByName('layer-iren-way-highlight')[0].removeAllFeatures();
            this.map.getLayersByName('layer-iren-way-markpoint')[0].removeAllFeatures();
            window.GCComponents.Functions.resetIrenWayData();
            if (this.active) {
                this.deactivate();
                var drawControl = this.map.getControlsBy('gc_id', 'control-iren-way-markpoint');
                if (drawControl.length == 1)
                    drawControl[0].deactivate();
            }
            else
            {
                this.activate();
                var drawControl = this.map.getControlsBy('gc_id', 'control-iren-way-markpoint');
                if (drawControl.length == 1)
                    drawControl[0].activate();
            }
            if (typeof(sidebarPanel.handleEvent) !== 'undefined')
                sidebarPanel.handleEvent = false;
        }
    },
    {button_group: 'tools'}
);
