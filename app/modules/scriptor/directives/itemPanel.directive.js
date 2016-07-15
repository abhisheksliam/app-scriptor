/**
 * Created by Shipra
 */
"use strict";

angular.module('automationApp.scriptor')
    .directive('itemPanel', ['$timeout', function($timeout) {

        return {
            restrict: 'A',
            templateUrl: 'modules/scriptor/directives/itemPanel.tpl.html',
            scope: {
                'items': '=',
                'methodtypelist': '='
            },
            link: function (scope, element, attributes) {

                $timeout(function(){

                    element.sortable({
                        items: "ol:not(.ui-sort-disabled)",
                        placeholder: "placeholder-ui",
                        handle: ".item-level-0"
                    });

                    element.find( ".li-level-0 .data-items" ).sortable({
                        items: "ol:not(.ui-sort-disabled)",
                        placeholder: "placeholder-ui",
                        handle: ".item-level-1"
                    });

                    element.find( ".li-level-1 .data-items" ).sortable({
                        items: "ol:not(.ui-sort-disabled)",
                        placeholder: "placeholder-ui",
                        handle: ".item-level-2"
                    });


                    element.find(".item-level-0.dd3-content").click(function(event) {

                        event.preventDefault();

                        if($(this).hasClass('bg-primary')) {
                            $(this).siblings(".data-items").hide();
                            $(this).removeClass('bg-primary');
                        }
                        else {
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
                        event.stopPropagation();
                    });

                    var  closeLevel1Elements = function () {
                        //close all child elements if these are opened
                        var level1items = element.find('.selected');
                        level1items.siblings(".data-items").hide();
                        level1items.removeClass('selected');
                    }

                    var  closeLevel2Elements = function () {
                        var level2items = element.find('.item-level-2 .panel-toggle.closed');
                        level2items.toggleClass("closed").parents(".panel:first").find(".panel-content").slideToggle();
                        var content = element.find(".baloo-action-content:visible");
                        if(content.length !=0) {
                            content.siblings(".data-items").width("100%");
                            content.hide();
                        }
                    }


                    element.find(".item-level-0 .panel-close").click(function (event) {
                        event.preventDefault();
                        var $item = $(this).parents(".dd-item:first");

                        bootbox.confirm("Are you sure to delete this item?", function (result) {
                            if (result === true) {
                                $item.addClass("animated bounceOutRight");
                                window.setTimeout(function () {
                                    $item.remove();
                                }, 300);
                            }
                        });
                        event.stopPropagation();
                    });


                    element.find(".item-level-1.dd3-content").click(function (event) {
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
            }
        }
    }]);


