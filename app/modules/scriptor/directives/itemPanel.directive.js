/**
 * Created by Shipra
 */
"use strict";

angular.module('automationApp.scriptor')
    .directive('itemPanel', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            templateUrl: 'modules/scriptor/directives/views/itemPanel.tpl.html',
            scope: {
                'items': '=',
                'index': '=',
                'editableiteminput': '='
                },
            link: function (scope, element) {

                $timeout(function(){

                    element.on('click',"#add-item-link a",function(event) {

                        var newItemTemplate = {
                            "init": true,
                            "methods": [
                                {
                                    "init": true,
                                    "type": "Ribbon",
                                    "balooActions": [
                                        {
                                            "text": ""
                                        }
                                    ],
                                    "actions": [

                                    ],
                                    "group": "NOT_FOUND"
                                }

                            ],
                            "skip": false,
                            "text": ""
                        };
                        scope.items[0].items.push(newItemTemplate);

                        if(!scope.$$phase) {
                            scope.$apply();
                        }

                        scope.$emit('SCRIPTOR_NEW_ITEM_ADDED', "");
                    });

                    element.on('click',".add-method-link a",function(event) {
                        event.preventDefault();

                        var newMethodTemplate = {
                            "init": true,
                            "type": "Ribbon",
                            "balooActions": [
                                {
                                    "text": ""
                                }
                            ],
                            "actions": [

                            ],
                            "group": "NOT_FOUND"
                        };


                        var itemNumber = $(this).closest('.li-level-0').parent().index();
                        scope.items[0].items[itemNumber].methods.push(newMethodTemplate);

                        if(!scope.$$phase) {
                            scope.$apply();
                        }

                        scope.$emit('SCRIPTOR_NEW_ITEM_ADDED', "");
                        
                        event.stopPropagation();
                    });

                    element.on('click',".item-level-0.dd3-content",function(event) {

                        event.preventDefault();

                        if($(this).hasClass('bg-primary')) {
                            $(this).siblings(".data-items").hide();
                            $(this).removeClass('bg-primary');

                            $(this).find('.item-text-edit-icon').hide();
                            scope.editableiteminput.editorenabled = -1;
                        }
                        else {
                            scope.editableiteminput.editorenabled = -1;
                            $('.item-text-edit-icon').hide();
                            $(this).find('.item-text-edit-icon').show();

                            var activeElement = element.find('.bg-primary');
                            if(activeElement.length != 0) {
                                activeElement.siblings(".data-items").hide();
                                activeElement.removeClass('bg-primary');
                            }

                            $(this).siblings(".data-items").show();
                            $(this).addClass('bg-primary');
                        }

                        closeLevel1Elements();
                        closeLevel2Elements();
                        scope.$apply();
                        event.stopPropagation();
                    });

                    element.on('click',".item-text-correct",function(event) {

                        event.preventDefault();
                        scope.editableiteminput.editorenabled = -1;
                        var index = $(this).attr('data-index');
                        scope.items[0].items[parseInt(index)].text = $(this).siblings('.item-textarea').val();

                        scope.$apply();
                        event.stopPropagation();
                    });

                    element.on('click',".item-text-edit-icon",function(event) {

                        event.preventDefault();
                        var index = $(this).attr('data-index');
                        scope.editableiteminput.enableEditor(parseInt(index));

                        var text = scope.items[0].items[parseInt(index)].text;
                        $(this).closest('.item-level-0').find('.item-textarea').val(text);

                        scope.$apply();
                        event.stopPropagation();
                    });

                    $(document).on('click', function(e) {
                        if ( e.target.class != 'item-textarea' ) {
                            scope.editableiteminput.editorenabled = -1;
                            scope.$apply();
                        }
                    });

                    var  closeLevel1Elements = function () {
                        //close all child elements if these are opened
                        var level1items = element.find('.selected');
                        level1items.siblings(".data-items").hide();
                        level1items.removeClass('selected');
                    };

                    var  closeLevel2Elements = function () {
                        var level2items = element.find('.item-level-2 .panel-toggle.closed');
                        level2items.toggleClass("closed").parents(".panel:first").find(".panel-content").slideToggle();
                        var content = element.find(".baloo-action-content:visible");
                        if(content.length !=0) {
                            content.siblings(".data-items").width("100%");
                            content.hide();
                        }
                    };

                    element.on('click',".item-level-0 .panel-close",function (event) {
                        event.preventDefault();
                        var itemNumber = $(this).closest('.li-level-0').parent().index();
                        var $item = $(this).parents(".dd-item:first");

                        bootbox.confirm("Are you sure to delete this item?", function (result) {
                            if (result === true) {
                                $item.addClass("animated bounceOutRight");
                                window.setTimeout(function () {
                                    scope.items[0].items.splice(itemNumber, 1);
                                    scope.$apply();
                                }, 300);
                            }
                        });
                        event.stopPropagation();
                    });

                    element.on('click',".item-level-0 .panel-copy",function (event) {
                        event.preventDefault();
                        var itemNumber = parseInt($(this).closest('.dd-list').index());
                        var itemToCopy = angular.copy(scope.items[0].items[itemNumber]);

                        scope.items[0].items.splice(itemNumber, 0, itemToCopy);
                        scope.$apply();

                        scope.$emit('SCRIPTOR_NEW_ITEM_ADDED', "");
                        event.stopPropagation();
                    });

                    element.on('click',".item-level-1.dd3-content",function (event) {
                        event.preventDefault();

                        if($(this).hasClass('selected')) {
                            $(this).siblings(".data-items").hide();
                            $(this).removeClass('selected');
                        }
                        else {
                            var activeElement = element.find('.selected');
                            if(activeElement.length != 0) {
                                activeElement.siblings(".data-items").hide();
                                activeElement.removeClass('selected');
                            }
                            $(this).siblings(".data-items").show();
                            $(this).addClass('selected');
                        }
                        closeLevel2Elements();
                    });

                });

                scope.$watch('items', function(newValue) {
                    if (newValue !== undefined) {
                        var initialItemIndex;

                        element.sortable({
                            items: "ol:not(.ui-sort-disabled)",
                            placeholder: "placeholder-ui",
                            handle: ".item-level-0",
                            start:  function(event, ui) {
                                initialItemIndex = ui.item.index();
                            },
                            stop:  function(event, ui) {
                                var newItemIndex = ui.item.index();

                                if (initialItemIndex !== newItemIndex) {
                                    var itemArr = scope.items[0].items;
                                    itemArr.splice(newItemIndex, 0, itemArr.splice(initialItemIndex, 1)[0]);
                                    scope.$apply();
                                }
                            }
                        });

                    }
                });

                scope.$on('INTIALIZE_METHOD_SORTABLE', function(event) {
                    var initialMethodIndex;
                    element.find( ".li-level-0 .data-items" ).sortable({
                        items: "ol:not(.ui-sort-disabled)",
                        placeholder: "placeholder-ui",
                        handle: ".item-level-1",
                        start:  function(event, ui) {
                            initialMethodIndex = ui.item.index();
                        },
                        stop:  function(event, ui) {
                            var newMethodIndex = ui.item.index();

                            if (initialMethodIndex !== newMethodIndex) {
                                var methodArr = ui.item.scope().item.methods;
                                methodArr.splice(newMethodIndex, 0, methodArr.splice(initialMethodIndex, 1)[0]);
                                scope.$apply();
                            }
                        }
                    });
                });

                scope.$on('INTIALIZE_TRIGGER_SORTABLE', function(event) {
                    var initialTriggerIndex;
                    element.find( ".li-level-1 .data-items" ).sortable({
                        items: "ol:not(.ui-sort-disabled)",
                        placeholder: "placeholder-ui",
                        handle: ".item-level-2",
                        helper : 'clone',
                        start:  function(event, ui) {
                            initialTriggerIndex = ui.item.index();
                        },
                        stop:  function(event, ui) {
                            var newTriggerIndex = ui.item.index();

                            if (initialTriggerIndex !== newTriggerIndex) {
                                var triggerArr = ui.item.scope().method.actions;
                                triggerArr.splice(newTriggerIndex, 0, triggerArr.splice(initialTriggerIndex, 1)[0]);
                                scope.$apply();
                            }
                        }
                    });
                });
            }
        }
    }]);


