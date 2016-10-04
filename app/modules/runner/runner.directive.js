"use strict";

angular.module('automationApp.runner')
    .directive('runnerLauncher', ['$timeout', '$http', '$rootScope','scriptorService', function($timeout, $http, $rootScope,scriptorService) {
        return {
            restrict: 'A',
            templateUrl: 'modules/runner/runnerLauncher.tpl.html',
            scope:{
                'items' : '='
            },
            link: function (scope, element, attributes) {

                scope.methodSelection = {};

                var initRunConfig = setInterval(function(){

                    $http.get('data/runner_configuration.json').then(function(res) {
                        scope.runnerConfig =  res.data;
                        scope.host = scope.runnerConfig.run.defaults.host;
                        scope.os = scope.runnerConfig.run.defaults.os;
                        scope.browser = scope.runnerConfig.run.defaults.browser;
                        scope.brversion = scope.runnerConfig.run.defaults.brversion;
                        scope.appurl = scope.runnerConfig.run.defaults.appurl;
                        scope.screenresolution = scope.runnerConfig.run.defaults.screenresolution;
                        scope.brnode = username;
                        scope.simsbuild = "";
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

                scope.selectRunTaskItems = function(){

                    if ( $("input.runner-item-check").is(":checked")) {
                           $(".run-task-btn").attr("disabled", false);
                           $(".run-task-btn").removeClass("disablebtn");
                    } else {
                           $(".run-task-btn").attr("disabled", true);
                           $(".run-task-btn").addClass("disablebtn");
                    }

                    event.stopPropagation();
                }

                scope.$watch('items', function(newValue) {
                    if (newValue !== undefined) {
                        if( scope.items[0] !== undefined && scope.items[0].items !== 0 ) {
                            for(var i=0; i <  scope.items[0].items.length; i++) {
                                scope.methodSelection[i] = i+1 + "/1";
                            }
                        }

                        if( scope.items[1] !== undefined && scope.items[1].length !== 0 ) {
                            $(".run-pathway").attr("disabled", false);
                            $(".run-pathway").removeClass("disablebtn");
                        }
                    }
                });

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
                        event.preventDefault();

                        var delIndex = $(this).closest('.pathway-list').index() - 2;
                        scope.items[1].splice(delIndex, 1);
                        scope.$apply();

                        if( scope.items[1] !== undefined && scope.items[1].length === 0 ) {
                            $(".run-pathway").attr("disabled", true);
                            $(".run-pathway").addClass("disablebtn");
                        }

                        $rootScope.showNotify('<div class="alert alert-success"><p><strong>' + 'Pathway deleted successfully!' + '</p></div>','#quickview-sidebar');
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
                                "group" : $(".pathway-group").val().join()
                            };

                            if(scope.items[1] === undefined) {
                                scope.items[1] = [ obj ];
                            } else {
                                scope.items[1].splice(scope.items[1].length, 0, obj);
                            }

                            scope.$apply();

                            if( scope.items[1] !== undefined && scope.items[1].length !== 0 ) {
                                $(".run-pathway").attr("disabled", false);
                                $(".run-pathway").removeClass("disablebtn");
                            }

                            $rootScope.showNotify('<div class="alert alert-success"><p><strong>' + 'Pathway added successfully!' + '</p></div>','#quickview-sidebar');
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
                            $(".run-pathway").attr("disabled", false);
                            $(".run-pathway").removeClass("disablebtn");
                        }

                        $rootScope.showNotify('<div class="alert alert-success"><p><strong>' + 'Pathways generated successfully!' + '</p></div>','#quickview-sidebar');

                        event.stopPropagation();
                    });

                    element.on('click',".run-task-btn",function(event) {
                        event.preventDefault();

                        var baseUrl = scope.runnerConfig.runner.url;

                        var scenarioId = scope.items[0].id + '.' + scope.items[0].scenario;

                        var filename = (scenarioId).replace(/\./gi, "_").trim();

                        window.open (baseUrl,",","menubar=1,resizable=1,width=1200,height=800");

                        var xmlContent = getXmlContent();
                        var javaContent = getJavaContent(filename);

                        $timeout(function(){
                            postDataToRunner(scenarioId, filename, xmlContent, js_beautify(javaContent));
                        },1000);

                        event.stopPropagation();
                    });

                    element.on('click',".run-pathway",function(event) {
                        event.preventDefault();

                        var baseUrl = scope.runnerConfig.runner.url;

                        var scenarioId = scope.items[0].id + '.' + scope.items[0].scenario;

                        var filename = (scenarioId).replace(/\./gi, "_").trim();

                        var xmlContent;

                        window.open (baseUrl,",","menubar=1,resizable=1,width=1300,height=700");

                        var xmlQueryParam = '?format=xml';
                        var javaQueryParam = '?format=java';

                        $http.get('/api/tasks/' + scenarioId + xmlQueryParam).then(function(res) {
                            xmlContent =  res.data;

                            $http.get('/api/tasks/' + scenarioId + javaQueryParam).then(function(res) {

                                postDataToRunner(scenarioId, filename, xmlContent, js_beautify(res.data));

                            });

                        });

                        event.stopPropagation();
                    });

                    function postDataToRunner(scenarioId, filename, xmlContent, javaContent){

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
                                "java": javaContent
                            }
                        };

                        // process the form
                        $.ajax({
                            type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
                            url         : baseUrl + runnerAPI, // the url where we want to POST
                            data        : formData, // our data object
                            dataType    : 'json' // what type of data do we expect back from the server
                        });
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

                $(".publish-svn").click(function(){
                    var taskData = scope.items[0];
                    scriptorService.exportSvn(taskData.id, taskData.scenario, taskData.appName).then(function (res) {
                        console.log(res);
                        $rootScope.showNotify('<div class="alert alert-success m-r-30"><p><strong>' + 'Request for commit sent !' + '</p></div>');
                        // todo: show commit status to user.
                    });
                });
            }
        }
    }]);

