'use strict';

var dashboardTemplate =  require('html-loader!../templates/settings/dashboard.html');
var leftPaneTemplate = require('html-loader!../templates/settings/left-pane.html');
var SettingsCollection = require('../collections/settings_collection');
var CMMenuTmpl = require('html-loader!../templates/settings/cm-settings-options.html');
var CMScheduleTmpl = require('html-loader!../templates/settings/cm-settings-schedule.html');
var CMFileFetchTmpl = require('html-loader!../templates/settings/cm-settings-file-fetch.html');
var CMFileFormatsTmpl = require('html-loader!../templates/settings/cm-settings-file-formats.html');
var SupportedVendorsTechTmpl = require('html-loader!../templates/settings/nw-supported-vendors-techs.html');

var VendorsCollection = require('../collections/vendors_collection');
var TechCollection = require('../collections/technologies_collection');

var SettingsView = Backbone.View.extend({
    el: 'body',

    //Template
    template: _.template(dashboardTemplate),

    tabId: 'tab_settings',
    
    events: {
        "click .launch-cm-menu": "showCMSettingsMenu",
        "click .show-cm-schedule": "showCMSchedule",
        "click .save-cm-schedule": "saveCMSchedule",
        "click .show-cm-file-fetch": "showFileFetch",
        "click .show-cm-file-formats": "showCMFileFormats",
        "click .show-supported-vendors-techs": "showSupportedVendorTechs",
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
            id: tabId,
            title: '<i class="fa fa-cog"></i> Settings',
            content: this.template()
        });
        AppUI.I().Tabs().show({id: tabId});

        /**
        $('#'+tabId + ' .bd-notice').html(AppUI.I().Loading("Loading settings..."));
        
        var settingsCollection = new SettingsCollection();
        settingsCollection.url = window.API_URL + '/api/settings/category/configuration_management';
        settingsCollection.fetch({
            success: function(collection, response, options){
                _(collection.models).each(function(_s){
                    var h  = '<tr><td>'+_s.get('label')+'</td><td>'+_s.get('value')+'</td><td><a href="#" data-id='+_s.get("id")+'><i class="fa fa-edit" title="Update setting"></a></i></td></tr>';
                    $('#'+tabId + ' #dt_settings tbody').append(h);
                });//eof:.each
                
                //Reset progress notice
                $('#'+tabId + ' .bd-notice').html('');
            },
            error: function(){
                $('#'+tabId + ' .bd-notice').html(AppUI.I().Alerts({close:true}).Error("Error occured!"));
            }
        });
        **/

    },
    
    showCMSettingsMenu: function(){
        AppUI.I().ModuleMenuBar().setTitle('<i class="fa fa-cog"></i> Configuration Management');
        AppUI.I().getLeftModuleArea().html(_.template(CMMenuTmpl));
    },
    
    /**
     * Show CM schedule
     */
    showCMSchedule: function(){
        require('fuelux/dist/css/fuelux.min.css');
        var fueluxScheduler = require('fuelux/js/scheduler');
        
        var that = this;
        var tabId = this.tabId + "_cm_schedule";
        AppUI.I().Tabs().addTab({
            id: tabId,
            title: '<i class="fa fa-hourglass"></i> CM ETL Scheduling',
            content: (_.template(CMScheduleTmpl))()
        });
        
        $('#' + tabId + ' .bd-notice').html(AppUI.I().Loading('Initialising...'));
        
        //Get default
        $.ajax({
            "url": window.API_URL + '/api/settings/2',
            "type": "GET",
            "dataType": "json",
            "contentType": 'application/json',
            "success": function(data){
                var initialValue = JSON.parse(data.value);
                
                $('#cmScheduler').scheduler();
                $('#cmScheduler').scheduler('value',initialValue.scheduleValue);
                
                AppUI.I().Tabs().show({id: tabId});
                 
                $('#' + tabId + ' .bd-notice').html("");
            }
        });
        
        
        
       
        
        //Handle change event
        //$('#cmScheduler').on('changed.fu.scheduler', function () {
        //});
    },
    
    /**
     * Save CM ETL Schedule
     * 
     * @version 1.0.0
     * @since 1.0.0
     */
    saveCMSchedule: function(){
        var that = this;
        var tabId = this.tabId + "_cm_schedule";
        
        $('#' + tabId + ' .bd-notice').html(AppUI.I().Loading('Updating schedule...'));
        
          var scheduleValue = $('#cmScheduler').scheduler('value');
          console.log(scheduleValue);
          
          var scheduleInterval = "0 0 * * *";
          
          var recurrencePatterns = scheduleValue.recurrencePattern.split(";");
          
          for(var i=0; i < recurrencePatterns.length; i++){
              var rp = recurrencePatterns[i].split("=");
              
              if(rp[0] === 'FREQ'){
                if( rp[1] === 'HOURLY'){
                    scheduleInterval = "0 * * * *";
                }
                if( rp[1] === 'DAILY'){
                    scheduleInterval = "0 0 * * *";
                }
                if( rp[1] === 'WEEKLY'){
                    scheduleInterval = "0 0 * * 0";
                }
                if( rp[1] === 'MONTHLY'){
                    scheduleInterval = "0 0 1 * *";
                }
                if( rp[1] === 'YEARLY'){
                    scheduleInterval = "0 0 1 1 *";
                }
              }

          }
          
          $.ajax({
              "url": API_URL + '/api/settings/1',
              "type": "POST",
              "dataType": "json",
              contentType: 'application/json',
              "data": JSON.stringify({
                    'data_type': 'string',
                    'name': 'cm_dag_schedule_interval',
                    'value': scheduleInterval }),
                "success": function(data){
                  
                  //Update start date
                    $.ajax({
                        "url": API_URL + '/api/settings/2',
                        "type": "POST",
                        "dataType": "json",
                        contentType: 'application/json',
                        "data": JSON.stringify({
                            'data_type': 'text',
                            'name': 'cm_dag_fuelux_scheduler_value',
                            'value': JSON.stringify({scheduleValue}) 
                        }),
                        "success": function(data){
                            $('#' + tabId + ' .bd-notice').html(AppUI.I().Alerts({close:true}).Success("Schedule updated"));
                        }
                    });
                  

              }
          });
    },
    
    /**
     * Show file fetch settings
     * 
     * @version 1.0.0
     * @since 1.0.0
     */
    showFileFetch: function(){
        var that = this;
        var tabId = this.tabId + "_cm_file_fetch";
        AppUI.I().Tabs().addTab({
            id: tabId,
            title: '<i class="fa fa-cog"></i> CM File Fetch',
            content: (_.template(CMFileFetchTmpl))()
        });
    },
    
    /**
     * Show file format settings
     * 
     * @version 1.0.0
     * @since 1.0.0
     */
    showCMFileFormats: function(){
        var that = this;
        var tabId = this.tabId + "_cm_file_formats";
        AppUI.I().Tabs().addTab({
            id: tabId,
            title: '<i class="fa fa-cog"></i> CM ETL File Formats',
            content: (_.template(CMFileFormatsTmpl))()
        });
        
        var tableDTId = 'cm_file_formats_dt';
        
        var cmFileFormatsDT = $('#'+tableDTId).DataTable({
             "scrollX": true,
             "scrollY": true,
             "pagingType": 'full_numbers',  
             "processing": true,
             "serverSide": true,
              colReorder: true,
             "ajax": {
                 "url": API_URL + '/api/settings/cm/vendor_format_map/dt',
                 "type": "GET",
                 'contentType': 'application/json',
             },
             "columns": [
                 {name:'vendor', data: "vendor" , title: "Vendor"},
                 {name:'technology', data: "technology" , title: "Technology"},
                 {name:'format', data: "format" , title: "Format"},
             ],
             "language": {
                 "zeroRecords": "No matching data found",
                 "emptyTable": "There is no data."
             },
             "dom": 
                 "<'row'<'col-sm-9'l><'col-sm-3'f>>" +
                 "<'row'<'col-sm-12'tr>>" +
                 "<'row'<'col-sm-5'i><'col-sm-7'p>>", 
             "initComplete": function(){
                 //Refresh button
                 $('#'+tableDTId + '_wrapper .dataTables_length').append(' <span class="btn btn-default" title="Refresh"><i class="fa fa-refresh"></i></span>');
                 $('#'+tableDTId + '_wrapper .dataTables_length .fa-refresh').click(function(){
                     cmFileFormatsDT.api().ajax.reload();
                 });

             }
         });//end
                
    },
    
    /**
     * Show supported vendors and technologies
     * 
     * @version 1.0.0
     * @since 1.0.0
     */
    showSupportedVendorTechs: function(){
        var that = this;
        var tabId = that.tabId + "_supported_vendors_techs";
        AppUI.I().Tabs().addTab({
            id: tabId,
            title: '<i class="fa fa-cog"></i> Supported Vendors and Technologies',
            content: (_.template(SupportedVendorsTechTmpl))()
        });
        
        
       var tableDTId = 'nw_supported_vendors_techs_dt';
        
        var jqDT = $('#'+tableDTId).DataTable({
             //"scrollX": true,
             //"scrollY": true,
             "pagingType": 'full_numbers',  
             "processing": true,
             "serverSide": true,
             // colReorder: true,
             "ajax": {
                 "url": API_URL + '/api/settings/network/technologies/dt',
                 "type": "GET",
                 'contentType': 'application/json',
             },
             "columns": [
                 {name:'vendor', data: "vendor" , title: "Vendor"},
                 {name:'technology', data: "technology" , title: "Technology"},
                 {name:'pk', data: "pk" , title: "&nbsp;"},
             ],
              "columnDefs": [
                  {
                        "render": function ( data, type, row ) {
                            return  '<a href="#" data-pk="'+data+'"><i class="fa fa-minus-circle text-danger"></i></a>';
                        },
                        "targets": 2
                  }
              ],
             "language": {
                 "zeroRecords": "No matching data found",
                 "emptyTable": "There is no data."
             },
             "dom": 
                 "<'row'<'col-sm-9'l><'col-sm-3'f>>" +
                 "<'row'<'col-sm-12'tr>>" +
                 "<'row'<'col-sm-5'i><'col-sm-7'p>>", 
             "initComplete": function(){
                 //Refresh button
                 $('#'+tableDTId + '_wrapper .dataTables_length').append(' <span class="btn btn-default" title="Refresh"><i class="fa fa-refresh"></i></span>');
                 $('#'+tableDTId + '_wrapper .dataTables_length .fa-refresh').click(function(){
                     jqDT.api().ajax.reload();
                 });

             }
         });//end
         
         
         //Load vendor and technology forms
        //Add vendors
        var vendorsCollection = new VendorsCollection();
        //vendorsCollection.fetch({async:false});
        var vendorField = $(that.$el).find('#nw_supported_vendors_techs_form [name=vendor]');
        vendorsCollection.fetch({success: function(collection,response,options){
            _(collection.models).each(function(vendor){
                    var _h = '<option value="'+vendor.get("id")+'">'+vendor.get("name")+'</option>';
                    $(vendorField).append(_h);
            });
        }});
        
        //Add technolgoies
        var techCollection = new TechCollection();
        var techField = $(that.$el).find('#nw_supported_vendors_techs_form [name=technology]');
        techCollection.fetch({success: function(collection,response,options){
            _(collection.models).each(function(tech){
                
                //Only consider 2G,3G,4G,and 5G
                if ( tech.get("id") > 4 ) return;
                
                var _h = '<option value="'+tech.get("id")+'">'+tech.get("name")+'</option>';
                $(techField).append(_h);
            });
        }});
         
        //Submit vendor and tech
        $('#' + tabId ).find('#nw_supported_vendors_techs_form [type=submit]').click(function(){
            console.log('tech:' + $(techField).val());
            console.log('vendor:' +$(vendorField).val());
            var tech_pk = $(techField).val();
            var vendor_pk = $(vendorField).val();
            
            if(tech_pk == 0 || vendor_pk == 0 ){
               $(that.$el).find('.bd-notice').html(AppUI.I()
                       .Alerts({close:true})
                       .Error('Select a technology and vendor')
                    );
            }else{
                
            }
        });
        
    }
});
	
module.exports = SettingsView;