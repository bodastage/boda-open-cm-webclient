'use strict';

var dashboardTemplate =  require('html-loader!../templates/processes/dashboard.html');
var leftPaneTemplate = require('html-loader!../templates/processes/left-pane.html');
var rabbitMQTemplate = require('html-loader!../templates/processes/rabbitmq.html');
var airflowTemplate = require('html-loader!../templates/processes/airflow.html');

var ProcessesView = Backbone.View.extend({
    el: 'body',

    //Template
    template: _.template(dashboardTemplate),

    events: {
        'click .launch-airflow': 'showAirflowUI', 
        'click .launch-rabbitmq': 'showRabbitMQUI', 
    },

    tabId: 'tab_processes',
    
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
        //this.loadLeftPanel();
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
            title: '<i class="fa fa-cogs"></i> Processes',
            content: AppUI.I().Loading('<h3>Loading processes module...</h3>')
        });
        AppUI.I().Tabs().show({id: tabId});
        
        AppUI.I().Tabs().setContent({
            id: tabId,
            content: this.template()
        });
    },
    
    /**
     * Load left pane
     * @returns 
     */
    loadLeftPanel: function(){
        //User left menu
        AppUI.I().ModuleMenuBar().setTitle('<i class="fa fa-cogs"></i> Processes');
    },
    
    /**
     * Launch Airflow UI
     * 
     * @returns 
     */
    showAirflowUI: function(){
        var airflowURL = 'http://192.168.99.100:8080';
        
        var tabId = this.tabId + "_airflow";
        var that = this;
        
        AppUI.I().Tabs().addTab({
            id: tabId,
            title: '<img src="'+airflowURL+'/static/pin_100.png" width="16px" class="img-icon"/> ' + ' Airflow',
            content: airflowTemplate
        });
        AppUI.I().Tabs().show({id: tabId});
    },
    
    /**
     * Launch RabbitMQ management UI
     * 
     * @returns 
     */
    showRabbitMQUI: function(){
        var rabbitMQURL = 'http://192.168.99.100:15672';
        
        var tabId = this.tabId + "_rabbitmq";
        var that = this;
        
        AppUI.I().Tabs().addTab({
            id: tabId,
            title: '<img src="'+rabbitMQURL+'/favicon.ico" width="16px" class="img-icon"/> ' + ' RabbitMQ',
            content: rabbitMQTemplate
        });
        AppUI.I().Tabs().show({id: tabId});
    }
});
	
module.exports = ProcessesView;