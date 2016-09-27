/**
 * Created by Shipra
 */
"use strict";

angular.module('automationApp.scriptor')
    .directive('actionList', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            templateUrl: 'modules/scriptor/directives/views/actionList.tpl.html',
            scope: {
                'triggers': '='
            },
            link: function(scope, element, attributes){
                scope.searchActionText = "";

                scope.$on('ACTION_SEARCH_RESET', function(event) {
                    scope.searchActionText = "";

                    $timeout(function(){
                        $('#triggerlist .nestable').mCustomScrollbar("update");
                    });
                });
            }
        }
    }]);

