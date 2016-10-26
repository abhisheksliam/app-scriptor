"use strict";

angular.module('automationApp.runner')
    .directive('runnerLauncher', ['$timeout', '$http', '$rootScope', 'scriptorService', function($timeout, $http, $rootScope, scriptorService) {
        return {
            restrict: 'A',
            templateUrl: 'modules/runner/runnerLauncher.tpl.html',
            scope:{
                'items' : '='
            },
            link: function (scope, element, attributes) {

                scope.methodSelection = {};

                var childWindow = $rootScope.childWindow;

                var initRunConfig = setInterval(function(){

                    $http.get('data/runner_configuration.json').then(function(res) {
                        scope.runnerConfig =  res.data;

                        /**
                         * If previous run config exist & version match
                         */
                        var userRunConfig = scriptorService.getLocalStorageValue('userRunConfig');
                        if (userRunConfig && (userRunConfig.version == scope.runnerConfig.run.defaults.version)) {

                            scope.host = userRunConfig.defaults.host;
                            scope.os = userRunConfig.defaults.os;
                            scope.browser = userRunConfig.defaults.browser;
                            scope.brversion = userRunConfig.defaults.brversion;
                            scope.appurl = userRunConfig.defaults.appurl;
                            scope.screenresolution = userRunConfig.defaults.screenresolution;
                            scope.brnode = userRunConfig.defaults.username;
                            scope.simsbuild = userRunConfig.defaults.simsbuild;

                        } else {
                            /**
                             * Else set config from defaults
                             */
                            scope.host = scope.runnerConfig.run.defaults.host;
                            scope.os = scope.runnerConfig.run.defaults.os;
                            scope.browser = scope.runnerConfig.run.defaults.browser;
                            scope.brversion = scope.runnerConfig.run.defaults.brversion;
                            scope.appurl = scope.runnerConfig.run.defaults.appurl;
                            scope.screenresolution = scope.runnerConfig.run.defaults.screenresolution;
                            scope.brnode = username;
                            scope.simsbuild = "";
                        }

                        /**
                         * set src of iframe
                         */
                        $('#commit-status-frame').attr("src", (scope.runnerConfig.runner.url + '/svn'));

                    });

                    if (scope.runnerConfig){
                        $timeout(function(){
                            //    for dd
                            var runnerConfigDD = element.find('select').select2({
                                dropdownCssClass: 'form-white',
                                minimumResultsForSearch: -1
                            });
                            element.find('.hostselect').select2('val', scope.host);
                            element.find('.osselect').select2('val', scope.os);
                            element.find('.brselect').select2('val', scope.browser);
                        }, 1000);
                        clearInterval(initRunConfig );
                    }
                }, 500);

                scope.iCheckOptions = {
                    checkboxClass: 'icheckbox_square-blue',
                    radioClass: 'iradio_minimal',
                    inheritClass: true
                };

                /* Open / Close right sidebar */
                $('.quickview-header').on('click', '.close', function (ev) {
                    $('#quickview-sidebar').addClass('closing');
                    $('#quickview-sidebar').removeClass('open');
                    setTimeout(function () {
                        $('#quickview-sidebar').removeClass('closing');
                    }, 400);

                });

                scope.selectRunTaskItems = function(){

                    if ( $("input.runner-item-check").is(":checked")) {
                           $(".run-task").removeAttr("disabled");
                           $(".run-task").removeClass("disabled");
                    } else {
                           $(".run-task").attr("disabled", true);
                           $(".run-task").addClass("disabled");
                    }

                    event.stopPropagation();
                }

                scope.$watch('items', function(newValue) {
                    if (newValue !== undefined) {
                        window.setTimeout(function () {
                            methodValidation();
                        },2000);

                        if( scope.items[1] !== undefined && scope.items[1].length !== 0 ) {
                            $(".run-pathway").removeAttr("disabled");
                            $(".run-pathway").removeClass("disabled");
                            $(".default-pathway-text").hide();
                            $(".publish-svn").removeAttr("disabled");
                            $(".publish-svn").removeClass("disabled");
                        }
                    }
                }, true);

                var methodValidation = function(){
                    if( scope.items[0] !== undefined && scope.items[0].items !== 0 ) {
                        for(var i=0; i <  scope.items[0].items.length; i++) {
                            var disableItem = true;
                            var defaultMethodSelection = 0;
                            // check for actions in each method and disable method in case of zero actions
                            for(var m=0; m < scope.items[0].items[i].methods.length; m++ ) {

                                if(scope.items[0].items[i].methods[m].actions !== undefined && scope.items[0].items[i].methods[m].actions.length >= 1) {
                                    $("#method-radio-" + i + "-" + m).removeClass("disabled");
                                    $("#method-radio-" + i + "-" + m).removeAttr("disabled");
                                    $("#method-radio-" + i + "-" + m).parent().removeClass("disableCursor");
                                    if(defaultMethodSelection == 0 ) {
                                        defaultMethodSelection = m+1;
                                    }
                                    disableItem = false;
                                }
                                else {
                                    if($("#method-radio-" + i + "-" + m).is(':checked')) {
                                        $("#method-radio-" + i + "-" + m).iCheck('uncheck');
                                    }
                                    $("#method-radio-" + i + "-" + m).addClass("disabled");
                                    $("#method-radio-" + i + "-" + m).attr("disabled", true);
                                    $("#method-radio-" + i + "-" + m).parent().addClass("disableCursor");
                                }
                            }

                            if(defaultMethodSelection != 0) {
                                scope.methodSelection[i] = i+1 + "/" + defaultMethodSelection;
                            }

                            if(disableItem) {
                                $("#run-item-" + i).addClass("disabled");
                                $("#run-item-" + i).attr("disabled", true);
                                if($("#run-item-" + i).is(':checked')) {
                                    $("#run-item-" + i).iCheck('uncheck');
                                }
                                $("#run-item-" + i).parent().addClass("disableCursor");
                            }
                            else {
                                $("#run-item-" + i).parent().removeClass("disableCursor");
                                $("#run-item-" + i).removeClass("disabled");
                                $("#run-item-" + i).removeAttr("disabled");
                            }
                        }
                        scope.$apply();
                    }
                };

                $timeout(function(){
                    $(".pathway-group").val($rootScope.globalConstants.methodtypelist[0]);

                    element.on('click',".item-level-0.dd3-content",function(event) {

                        event.preventDefault();

                        if($(this).hasClass('bg-primary')) {
                            $(this).siblings(".data-items").hide();
                            $(this).removeClass('bg-primary');
                        }
                        else {
                            $(this).siblings(".data-items").show();
                            $(this).addClass('bg-primary');
                        }

                        event.stopPropagation();
                    });

                    element.on('click',".delete-pathway",function(event) {
                        var delIndex = $(this).closest('.pathway-list').index() - 2;
                        $(this).closest('.pathway-list').hide("slow", function(){

                            element.find(".pathway-list[style='display: none;']").remove();
                            scope.items[1].splice(delIndex, 1);

                            if( scope.items[1] !== undefined && scope.items[1].length === 0 ) {
                                $(".run-pathway").attr("disabled", true);
                                $(".run-pathway").addClass("disabled");
                                $(".default-pathway-text").show();
                                $(".publish-svn").attr("disabled", true);
                                $(".publish-svn").addClass("disabled");
                            }
                        });

                        scope.$apply();
                        event.stopPropagation();
                    });


                    element.on('click',".add-pathway",function(event) {
                        event.preventDefault();

                        var isDuplicatePathway = false;
                        var pathwayInfo = $.map(scope.items[0].items, function(value, index) {
                            return $('input[name=method-radio-'+index +']:checked').val();
                        });

                        if(scope.items[1] !== undefined) {
                            for (var indx = 0; indx < scope.items[1].length; indx++) {
                                if (scope.items[1][indx].pathway.join() == pathwayInfo.join()) {
                                    isDuplicatePathway = true;
                                    break;
                                }
                            }
                        } else {
                            isDuplicatePathway = false;
                        }

                        if(isDuplicatePathway) {
                            $rootScope.showNotify('<div class="alert alert-danger"><p><strong>' + 'Pathway already exists !!' + '</p></div>','#quickview-sidebar');
                        }
                        else {
                            var obj = {
                                "pathway" : pathwayInfo,
                                "group" : $("#pathway-grp").val().join(', ')
                            };

                            if(scope.items[1] === undefined) {
                                scope.items[1] = [ obj ];
                            } else {
                                scope.items[1].splice(scope.items[1].length, 0, obj);
                            }

                            scope.$apply();

                            if( scope.items[1] !== undefined && scope.items[1].length !== 0 ) {
                                $(".run-pathway").removeAttr("disabled");
                                $(".run-pathway").removeClass("disabled");
                                $(".default-pathway-text").hide();
                                $(".publish-svn").removeAttr("disabled");
                                $(".publish-svn").removeClass("disabled");
                            }
                        }

                        event.stopPropagation();
                    });

                    element.on('click',".generate-pathway",function(event) {
                        event.preventDefault();

                        var itemArr = scope.items[0].items;
                        var methodMaxCount = itemArr[0].methods.length;

                        for(var i=1; i < itemArr.length; i++) {
                            if(methodMaxCount < itemArr[i].methods.length)
                                methodMaxCount = itemArr[i].methods.length;
                        }

                        var pathwaySet = [];
                        for(var c=0; c<methodMaxCount; c++)
                        {
                            var pathwayObj = {group: '', pathway:[]};
                            var grpArr = [];
                            var isPrimary = '';
                            grpArr.push('Primary');
                            for(var r=0; r<itemArr.length; r++)
                            {
                                isPrimary += (r+1) + '/' + '1,';
                                if(itemArr[r].methods[c] === undefined) {
                                    if(grpArr.indexOf(itemArr[r].methods[0].type) === -1 ) {
                                        grpArr.push(itemArr[r].methods[0].type);
                                    }
                                    pathwayObj.pathway.push((r+1) + '/' + '1');
                                }
                                else {
                                    if(grpArr.indexOf(itemArr[r].methods[c].type) === -1 ) {
                                        grpArr.push(itemArr[r].methods[c].type);
                                    }
                                    pathwayObj.pathway.push((r+1) + '/' + (c+1));
                                }
                            }
                            if(!(isPrimary == (pathwayObj.pathway.join() + ','))) {
                                grpArr.shift();
                            }
                            pathwayObj.group = grpArr.join(', ');
                            pathwaySet.push(pathwayObj);
                        }

                        scope.items[1] = pathwaySet;

                        scope.$apply();

                        if( scope.items[1] !== undefined && scope.items[1].length !== 0 ) {
                            $(".run-pathway").removeAttr("disabled");
                            $(".run-pathway").removeClass("disabled");
                            $(".default-pathway-text").hide();
                            $(".publish-svn").removeAttr("disabled");
                            $(".publish-svn").removeClass("disabled");
                        }
                        event.stopPropagation();
                    });


                    element.on('click',".run-task",function(event) {
                        event.preventDefault();


                        /**
                         * Update user run config to lsm
                         */
                        scriptorService.setLocalStorageValue('userRunConfig',getUserConfigObject());

                        var baseUrl = scope.runnerConfig.runner.url;

                        var scenarioId = scope.items[0].id + '.' + scope.items[0].scenario;

                        var filename = (scenarioId).replace(/\./gi, "_").trim();

                        if (childWindow === undefined || childWindow === null || childWindow.closed) {
                            childWindow = window.open(baseUrl,"WindowForRunTask","menubar=1,resizable=1,width=1200,height=800");
                            $rootScope.childWindow = childWindow;
                        }
                        else {
                            childWindow.focus();
                        }

                        var xmlContent = getXmlContent();
                        var javaContent = getJavaContent(filename);

                        $timeout(function(){
                            postDataToRunner(scenarioId, filename, xmlContent, js_beautify(javaContent),false);
                        },1000);

                        event.stopPropagation();
                    });

                    element.on('click',".run-pathway",function(event) {
                        event.preventDefault();

                        /**
                         * Update user run config to lsm
                         */

                        scriptorService.setLocalStorageValue('userRunConfig',JSON.stringify(getUserConfigObject()));

                        /**
                         * Run
                         */

                        var baseUrl = scope.runnerConfig.runner.url;

                        var scenarioId = scope.items[0].id + '.' + scope.items[0].scenario;

                        var filename = (scenarioId).replace(/\./gi, "_").trim();

                        var xmlContent;

                        if (childWindow === undefined || childWindow === null || childWindow.closed) {
                            childWindow = window.open(baseUrl,"WindowForRunTask","menubar=1,resizable=1,width=1200,height=800");
                            $rootScope.childWindow = childWindow;
                        }
                        else {
                            childWindow.focus();
                        }

                        var xmlQueryParam = '?format=xml';
                        var javaQueryParam = '?format=java';

                        $http.get('/api/tasks/' + scenarioId + xmlQueryParam).then(function(res) {
                            xmlContent =  res.data;

                            $http.get('/api/tasks/' + scenarioId + javaQueryParam).then(function(res) {

                                postDataToRunner(scenarioId, filename, xmlContent, js_beautify(res.data),false);

                            });

                        });

                        event.stopPropagation();
                    });

                    element.on('click',".publish-svn",function(event) {
                        event.preventDefault();
                        scope.errorList = [];

                        if(scope.items[0].items !== undefined && scope.items[1]!== undefined) {
                            var totItem = scope.items[0].items.length;
                            for(var i=0; i<scope.items[1].length; i++) {
                                // check1: number of items in scriptor should be equal to number of pathway methods in runner
                                if(totItem == scope.items[1][i].pathway.length) {
                                    for(var m=0; m < scope.items[1][i].pathway.length; m++) {

                                        //check2: method number must be a valid number
                                        var methNum = (scope.items[1][i].pathway[m].split("/")[1]) - 1;
                                        if(scope.items[0].items[m].methods[methNum] !== undefined) {  // check if method exists in task json
                                        }
                                        else {
                                            scope.errorList.push("Method-" + (methNum+1) + " doesn't exists for Item-" + (m+1) + " in Pathway-" + (i+1));
                                            // pathway contains method but doesnot exists in item
                                        }

                                    }
                                }
                                else {
                                    scope.errorList.push("Incorrect number of items in pathway-" + (i+1));
                                }
                            }

                            // check 3: parse method of each item in task json for action validation
                            for(var iNum=0; iNum < scope.items[0].items.length; iNum++) {  // item loop
                                for(var mNum=0; mNum < scope.items[0].items[iNum].methods.length; mNum++) {  // method loop

                                    if(scope.items[0].items[iNum].methods[mNum].actions.length >=1) {

                                         for(var actNum=0; actNum < scope.items[0].items[iNum].methods[mNum].actions.length; actNum++) {  // // action loop
                                             for(var valNum=0; valNum<scope.items[0].items[iNum].methods[mNum].actions[actNum]["values"].length; valNum++) { // action VALUES LOOP
                                                 var actVal = scope.items[0].items[iNum].methods[mNum].actions[actNum]["values"][valNum];
                                                 if(actVal == undefined || actVal==null || actVal=='') {
                                                     scope.errorList.push("Blank elements found in Item-" + (iNum+1) +
                                                        ":Method-" + (mNum+1) + ":Action-" + (actNum+1));
                                                 }
                                             }
                                         }
                                    }
                                    else {
                                        scope.errorList.push("No action exists for Item-" + (iNum+1) + ":Method-" + (mNum+1));
                                    }
                                }
                            }


                            } else {
                            scope.errorList = undefined;
                        }

                        if(scope.errorList.length > 0) {
                            $('.err-list').removeClass("hide");
                            $(".err-list").addClass("show");
                        } else {
                            $rootScope.showNotify('<div class="alert alert-success"><p><strong>' + 'Publishing Task to SVN !!' + '</p></div>','#quickview-sidebar');

                            var scenarioId = scope.items[0].id + '.' + scope.items[0].scenario;

                            var filename = (scenarioId).replace(/\./gi, "_").trim();

                            var xmlContent;

                            var xmlQueryParam = '?format=xml';
                            var javaQueryParam = '?format=java';

                            $http.get('/api/tasks/' + scenarioId + xmlQueryParam).then(function(res) {
                                xmlContent =  res.data;

                                $http.get('/api/tasks/' + scenarioId + javaQueryParam).then(function(res) {

                                    postDataToRunner(scenarioId, filename, xmlContent, js_beautify(res.data), true);

                                });

                            });
                        };

                        scope.$apply();
                        event.stopPropagation();
                    });

                    $('.err-list').on('click', '.close', function (event) {
                        $('.err-list').removeClass("show");
                        $(".err-list").addClass("hide");
                        scope.errorList=[];
                    });

                    function postDataToRunner(scenarioId, filename, xmlContent, javaContent, commit){

                        var appName = scope.items[0].appName;
                        var baseUrl = scope.runnerConfig.runner.url;
                        var runnerAPI = scope.runnerConfig.runner.api;

                        var formData =   {
                            "user" : {
                                "name" : username,
                                "ip" : _clientIp,
                                "userdata" : {}
                            },
                            "run" : {
                                "env" : scope.host,
                                "os" : scope.os,
                                "resolution": scope.screenresolution,
                                "app" : {
                                    "url" : scope.appurl,
                                    "build" : scope.simsbuild
                                },
                                "browser" : {
                                    "node" : scope.brnode,
                                    "name" : scope.browser,
                                    "version" : scope.brversion
                                }
                            },
                            "task": {
                                "filename": filename,
                                "appName" : appName,
                                "xml": xmlContent,
                                "java": javaContent,
                                "commit": commit,
                                "xpaths": []
                            },
                            "svn": {
                                "url": "",
                                "username":"",
                                "password":""
                            }
                        };

                        if (commit) {   // for commit

                            scriptorService.getUserDetails(username).then(function(res) {
                                if(res.data.errors){
                                    $rootScope.showNotify('<div class="alert alert-danger m-r-30"><p><strong>' + res.data.errors.errorMessage + '</p></div>');
                                }
                                else {

                                    try{

                                        try{
                                            formData.svn.username = res.data.profile.svn_credentials.username;
                                            formData.svn.password = res.data.profile.svn_credentials.password;

                                        } catch (err){
                                            scope.errorList.push("Error in getting svn credentials !");
                                        }
                                        getXpathsToCommit(filename, function(xpaths){

                                            formData.task.xpaths = xpaths;

                                            $('.svn-commit-status').removeClass("hide");
                                            $(".svn-commit-status").addClass("show");

                                            $.ajax({
                                                type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                                                url         : baseUrl + runnerAPI, // the url where we want to POST
                                                data        : formData, // our data object
                                                dataType    : 'json', // what type of data do we expect back from the server
                                                success: function(d){
                                                    console.log(d);
                                                },
                                                error: function(er) {
                                                    console.log('error');
                                                    console.log(er);
                                                }
                                            });

                                        })

                                    } catch (er){

                                        scope.errorList.push("Error in posting commit data !");

                                    } finally {
                                        if(scope.errorList.length > 0) {
                                            $('.err-list').removeClass("hide");
                                            $(".err-list").addClass("show");
                                        }
                                    }

                                };
                            });

                        } else { // for run
                            $.ajax({
                                type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                                url         : baseUrl + runnerAPI, // the url where we want to POST
                                data        : formData, // our data object
                                dataType    : 'json', // what type of data do we expect back from the server
                                success: function(d){
                                    console.log(d);
                                },
                                error: function(er) {
                                    console.log('error');
                                    console.log(er);
                            }
                            });
                        }
                    }

                var getXmlContent = function() {
                   var taskData = scope.items[0];

                   var xmlPre = '<?xml version="1.0" encoding="UTF-8"  standalone="no"?><Task TemplateVersion="V1" id="'+ taskData.id +'" name="'+ taskData.name +'">  <description>'+ taskData.description +'</description>  <friendlyTaskID>'+ taskData.id + '.'+taskData.scenario +'</friendlyTaskID>  <scenario name="'+ taskData.scenario +'">';

                    var xmlPost =   '</scenario>    </Task>';

                    var taskDataPre = '<Items count="'+taskData.items.length+'">';
                    var taskDataPost = '</Items>';

                    for(var i=0;i<taskData.items.length;i++){

                       // if(taskData.items[i].init){
                            taskDataPre = taskDataPre + '<Item sno="'+(i+1)+'">';

                            for(var j=0;j<taskData.items[i].methods.length;j++){

                                var jin=0;

                                //if(taskData.items[i].methods[j].init){
                                    taskDataPre = taskDataPre + '<Method group="'+taskData.items[i].methods[j].group+'" name="'+taskData.items[i].methods[j].type+'" sno="'+(j+1)+'"><Actions>';

                                    var methodChecked = $('input[name=method-radio-'+i +']:checked').data('method');

                                    for(var k=0; k<taskData.items[i].methods[j].actions.length; k++){
                                      //  if(taskData.items[i].methods[j].actions[k].init){

                                            if(i>0 && jin==0){
                                                if($('#run-item-'+(i-1)).not(':checked').length === 1){
                                                    if(methodChecked == (j+1)){
                                                        jin = $("input:checkbox:not(:checked)").length;
                                                        for(var _jin=0; _jin < jin;_jin++){
                                                            taskDataPre = taskDataPre + '<Action sno="'+(_jin+1)+'"><actionType name="skiptonextitem"></actionType></Action>';
                                                        }
                                                    }
                                                };
                                            }
                                            taskDataPre = taskDataPre + '<Action sno="'+(k+jin+1)+'"><actionType name="'+(taskData.items[i].methods[j].actions[k].name).toString().trim().replace("()","")+'">';

                                            for(var l=0;l<taskData.items[i].methods[j].actions[k].values.length;l++){
                                                taskDataPre = taskDataPre + '<'+taskData.items[i].methods[j].actions[k].values[l].actKey+'>'+taskData.items[i].methods[j].actions[k].values[l].actVal+'</'+taskData.items[i].methods[j].actions[k].values[l].actKey+'>';
                                            }
                                            taskDataPre = taskDataPre + '</actionType></Action>';
                                       // }
                                    }
                                    taskDataPre = taskDataPre + '</Actions></Method>';
                             //   }
                            }
                            taskDataPre = taskDataPre + '</Item>';
                     //   }
                    }

                    return (xmlPre + taskDataPre + taskDataPost + xmlPost);
                }

                var getJavaContent = function(filename) {
                    var taskData = scope.items[0];

                    var preJ = 'package testcase.' + taskData.appName + ';' +
                        'import org.testng.annotations.Test;    import runner.TestRunner;' +
                        'public class Test_' + filename + ' extends TestRunner {    ';

                    var postJout = ' }';

                    var runJ = '';
                    var testCount = 0;

                    var preJin = '' +
                        '@Test (groups = {' +
                        '"Acceptance", "Primary"' +
                        '})        public void ' +
                        filename + (++testCount).toString()
                        +
                        '() throws Exception {            System.out.println("START..");            ';

                    var postJ = 'Thread.sleep(3000);            ' +
                        'System.out.println("DONE.");        }   ';

                    for(var i=0;i<taskData.items.length;i++){

                       // if(taskData.items[i].init){

                            if($('#run-item-'+(i)).is(':checked') == true){

                                var methodChecked = $('input[name=method-radio-'+i +']:checked').val();

                                runJ = runJ + 'executeItem(' +
                                    '"' + taskData.id.trim() + '.' + taskData.scenario.trim() + '", ' +
                                    '"' + taskData.scenario.trim() + '", ' +
                                    '"' + methodChecked.toString().split('/').join('","') + '"' +
                                    ');';
                            }

                      //  }
                    };

                    return (preJ + preJin + runJ + postJ + postJout);
                }

                },200);

                element.on('click',".config-tab",function(event) {
                    event.preventDefault();
                    $('#runner-settings').removeClass('active in');
                    $('#runner-config').addClass('active in');

                    $('.settings-tab').parent().removeClass('active');
                    $('.config-tab').parent().addClass('active');

                    event.stopPropagation();
                });

                element.on('click',".settings-tab",function(event) {
                    event.preventDefault();
                    $('#runner-settings').addClass('active in');
                    $('#runner-config').removeClass('active in');

                    $('.settings-tab').parent().addClass('active');
                    $('.config-tab').parent().removeClass('active');

                    event.stopPropagation();
                });

                function getUserConfigObject(){

                    var _conf = {
                        version: scope.runnerConfig.run.defaults.version,
                        defaults: {
                            host: scope.host,
                            os:   scope.os,
                            browser: scope.browser,
                            brversion: scope.brversion,
                            appurl: scope.appurl,
                            screenresolution: scope.screenresolution,
                            brnode: scope.brnode,
                            simsbuild: scope.simsbuild
                        }
                    };

                    return _conf;
                }

                function getXpathsToCommit(task_id, done){
                    scriptorService.getTaskXpaths(task_id.replace(/_/g, '.')).then(function(xpaths) {
                        var xpathsToCommit = []
                        if (xpaths.data.length){
                            for(var i in xpaths.data) {
                                var _temp = (xpaths.data[i].xpath.key.trim()).replace(/ /g, "\\ ") + ' = ' + (xpaths.data[i].xpath.value.trim()).replace(/ /g, "\\ ");
                                xpathsToCommit.push(_temp)
                            }
                        }
                        done(xpathsToCommit);
                    });
                };

            }
        }
    }]);

