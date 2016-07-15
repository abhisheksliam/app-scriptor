'use strict';

angular.module('automationApp.scriptor')
	.controller('NewScriptController', ['$scope', 'pluginsService', 'applicationService', '$location', '$state', 'scriptorService',
		function($scope, pluginsService, applicationService, $location, $state, scriptorService) {
	
			$scope.scriptor = scriptorService.uiElements;
			$scope.applications =  scriptorService.getApplications();
			$scope.scenarios =  scriptorService.getScenarios();
			$scope.taskJson =  scriptorService.getTaskJson();
			$scope.triggers =	scriptorService.getTriggers();
			$scope.methodtypelist =	scriptorService.getMethodTypeList();

			/* Template Code to be kept in first route to be loaded */
			$scope.$on('$viewContentLoaded', function () {
				pluginsService.init();
				applicationService.customScroll();
				applicationService.handlePanelAction();
				$('.nav.nav-sidebar .nav-active').removeClass('nav-active active');
				$('.nav.nav-sidebar .active:not(.nav-parent)').closest('.nav-parent').addClass('nav-active active');

				if($location.$$path == '/'){
					$('.nav.nav-sidebar .nav-parent').removeClass('nav-active active');
					$('.nav.nav-sidebar .nav-parent .children').removeClass('nav-active active');
					if ($('body').hasClass('sidebar-collapsed') && !$('body').hasClass('sidebar-hover')) return;
					if ($('body').hasClass('submenu-hover')) return;
					$('.nav.nav-sidebar .nav-parent .children').slideUp(200);
					$('.nav-sidebar .arrow').removeClass('active');
					$('body').addClass('dashboard');
				} else {
					$('body').removeClass('dashboard');
				}

			});
	  
			if($scope.scriptor.taskId){
				$scope.taskId = $scope.scriptor.taskId;
			}
			if($scope.scriptor.scenarioType){
				$scope.scenarioType = $scope.scriptor.scenarioType;
			}else{
				$scope.scenarioType = $scope.scenarios[0];
			};

			if($scope.scriptor.applicationName){
				$scope.applicationName = $scope.scriptor.applicationName;
			}else{
				$scope.applicationName = $scope.applications[0];
			}

			$scope.updateData = function(){
				$scope.scriptor.scenarioType = $scope.scenarioType;
				$scope.scriptor.applicationName = $scope.applicationName;
				$scope.scriptor.taskId = $scope.taskId;
			};

			$scope.displayScript = function(){
				$scope.updateData();
				$state.go('displayscript');
			};

			InvalidInputHelper(document.getElementById("taskid"), {
				defaultText: "Please enter a task id!",
				emptyText: "Please enter task id!",
				invalidText: function (input) {
					return 'The task id "' + input.value + '" is invalid!';
				}
			});

		}]);
