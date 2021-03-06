'use strict';
/**
 * GIS Module
 * 
 * @version 1.0.0
 * @author Bodastage Solutions<info@bodastage.com>
 */

var dashboardTemplate = require('html-loader!../templates/gis/dashboard.html');
var leftPaneTemplate = require('html-loader!../templates/dashboard/left-pane.html');

var GISView = Backbone.View.extend({
    el: 'body',

    //tab Id for the network audit dashboard
    tabId: 'tab_gis',

    //Template
    template: _.template(dashboardTemplate),
    
    /**
     * Install of map
     */
    map : null, 
    nbrLayer: null,
    
    /**
     * Carrier color map
     * 
     * @Get color map from settings 
     */
    freqColorMap: {
        "4154": "#FF5733",
        "9837": "#FFC300",
        "9882": "#33FF57",
        "9763": "#0000FF",
        
        
        "10737": "#FF5733",
        "10712": "#FFC300",
        "10762": "#33FF57",
        "3086": "#0000FF"
    },
                
    /**
     * Reloading the module.
     * 
     * @since 1.0.0
     * @version 1.0.0
     */
    reload: function () {
        this.render();
    },
    render: function () {
        this.loadDashboard();
    },
    
    /**
     * Load module dashboard
     *  
     * @version 1.0.0
     * @return void
     */
    loadDashboard: function () {
        var tabId = this.tabId;
        var that = this;
        
        AppUI.I().Tabs().addTab({
            id: this.tabId,
            title: '<i class="fa fa-globe"></i> GIS Tools',
            content: AppUI.I().Loading('<h3>Loading GIS Tools module...</h3>')
        });
        AppUI.I().Tabs().show({id: this.tabId});
        
        AppUI.I().Tabs().setContent({
            'id': this.tabId,
            'content': dashboardTemplate
        });
        
        $('#'+tabId+ ' .bd-notice').html(AppUI.I().Loading('Loading map...'));

        $('#network_map').height($(window).height());
        
        //Load map
        this.map = L.map('network_map', {
            selectArea: true,
            fullscreenControl: true,
            fullscreenControlOptions: {
                position: 'topleft'
            }
        });
        //this.nbrLayer = new L.Control.Layers().addTo(this.map);
        
        //List for area selection
        this.map.on('areaselected', (e) => {
            that.handleAreaSelection(e);
        });
        
        //this.map.selectArea.setCtrlKey(true); 

        //Clear loading indicator on load
        this.map.on('load',function(){
            $('.bd-notice').html('');
        });
        
        //Add ruler to measure distance
        L.control.ruler({'position':'topleft'}).addTo(this.map);
        
        /**
        //Add carrier color map 
        var carrierColorMapControl = L.control({
            position: 'topleft'
        });
        carrierColorMapControl.onAdd = function(map){
            var div = L.DomUtil.create('div', 'bd_carrier_color_map');
            div.innerHTML += 'Carrier Scale here';
            return div;
        };
        carrierColorMapControl.addTo(this.map);
        **/
        
        //Pick this from the settings
        var latitude = 0;
        var longitude = 0;

        //Set center from a ramdom cell 
        $.ajax({
            'url': API_URL + '/api/network/live/cells/3g',
            'dataFormat': 'json',
            'data': { page: 0, size: 1 },
            success: function(data){
                latitude = data.content[0].latitude;
                longitude = data.content[0].longitude;
                        
                that.map.setView([latitude, longitude], 13);

                L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(that.map);
                
                $('#'+tabId+ ' .bd-notice').html('');

            }
        });
       


        //Add weather
//        var owmLayer = 'temp_new'; //wind_new'; //pressure_new'; //precipitation_new'; //clouds_new';
//        L.tileLayer('http://tile.openweathermap.org/map/' + owmLayer + '/{z}/{x}/{y}.png?appid=dda1d81056528b36f336ce401a3b7cbd', {
//            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
//        }).addTo(this.map);


    },
    
    /**
     * Fetch cells from server 
     * 
     * @param page
     * @param recurse 
     * 
     * @returns {undefined}
     */
    fetchCells: function(page, size, recurse){
        var that = this;
        var tabId = that.tabId;
        
        $.ajax({
            'url': API_URL + '/api/network/live/cells/3g',
            'data': { page: page, size: size },
            'dataFormat': 'json',
            success: function(data){
                var last = data.last;
                //var totalPages = data.total_pages;
                //var totalElements = data.total;
                var size = data.size;
                //var number = data.total;
                //var sort = data.sort;
                //var numberOfElements = data.numberOfElements;
                //var first = data.first;
                
                
                //Check if tab is still open 
                if($('#'+tabId).length === 0) return;
                
                if (data.total === 0){
                    $('#'+tabId + ' .bd-notice').html(AppUI.I().Alerts({close:true}).Success( 'There are no cells to load'));   
                    return;
                }
                
                that.loadCells(data.content);
                
                if(last === false && recurse === true ){
                    $('#'+tabId + ' .bd-notice').html( AppUI.I().Loading('Loading cells... [' + page*size + '/' + data.total  + ' loaded]'));
                    that.fetchCells(page+1, size, true);
                }
                
                if(last === true ){
                    $('#'+tabId + ' .bd-notice').html(AppUI.I().Alerts({close:true}).Success( data.total + ' cells loaded'));   
                }

            }
        });
        
    },
    
    /**
     * Load the cells on the map
     * 
     * @returns 
     */
    loadCells : function(cellList){
        var that = this;
        
        $.each(cellList,function(key, value){
            //var sectorCarrier = value.siteSectorCarrier.substr(value.siteSectorCarrier.length-4);

            var color = that.freqColorMap[value.uarfcn_ul];
            //var color = that.freqColorMap[value.uarfcn_dl];
            
            //var color = colors[sectorCarrier];
            var sector = L.semiCircle([value.latitude, value.longitude], {radius: 1000, color: color})
            .setDirection(value.azimuth, 45)
            .addTo(that.map);
    
            var h = '';
            h += '<button class="btn btn-info">Details</button> ';
            h += '<button class="btn ">Show neighbours</button>';
            h += '<br />';
            h += '<div style="height:400px; overflow:auto;">';
            h += '<table class="table">';
            $.each(value, function(k, v){
                if( k == 'pk' || k == 'sitePk' || k == 'cellPk' || k == 'notes' || k == 'vendorPk' ||
                    k == 'technologyPk' || k == 'dateAdded' || k == 'dateModified' || 
                            k == 'addedBy' || k == 'modifiedBy') return;

                if(k=='dateAdded') v = new Date(v);
                h += '<tr><td>' + k + '</td><td>' + v + '</td></tr>'; 
            });
            h += '</table>';
            h += '</div>';

            sector.bindPopup(h);
        });        
    },
    
    loadAllCells: function(){
        $('#'+tabId + ' .bd-notice').html( AppUI.I().Loading('Loading cells...') + '<br />');
        that.fetchCells(0,100, true);
    },
    
    handleAreaSelection: function(event){
        console.log(event.bounds.toBBoxString()); // lon, lat, lon, lat 
    }

});
module.exports = GISView;