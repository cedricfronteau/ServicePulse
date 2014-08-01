'use strict';

angular.module('conversation', [])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/conversation/:id', { templateUrl: 'js/conversation/conversation.tpl.html', controller: 'ConversationCtrl' });
    }])
    .controller('ConversationCtrl', ['$scope', '$routeParams', 'serviceControlService', function ($scope, $routeParams, serviceControlService) {

        $scope.model = { conversationId: $routeParams.id || '', total: 0, conversationMessages: [] };
        $scope.loadingData = false;
        $scope.disableLoadingData = false;
        
        var page = 1;

        function init() {
            page = 1;
            $scope.model.conversationMessages = [];
            $scope.disableLoadingData = false;
        }
        
        function load() {
            if ($scope.loadingData) {
                return;
            }

            $scope.loadingData = true;
            
            serviceControlService.getConversation($scope.model.conversationId, 'time_sent', page).then(function (response) {
                $scope.model.conversationMessages = $scope.model.conversationMessages.concat(response.data);
                $scope.model.total = response.total;

                if ($scope.model.conversationMessages.length >= $scope.model.total) {
                    $scope.disableLoadingData = true;
                }
                
                $scope.loadingData = false;
                page++;
            });
        };

        $scope.togglePanel = function (row, panelnum) {

            if (row.messageBody === undefined) {
                serviceControlService.getMessageBody(row.message_id).then(function (message) {
                    row.messageBody = message.data;
                }, function () {
                    row.bodyUnavailable = "message body unavailable";
                });
            }

            row.panel = panelnum;
            return false;
        };

        $scope.isStatusSuccessful = function(status) {
            var successfulStatuses = ['successful', 'resolvedsuccessfully'];
            return successfulStatuses.indexOf(status) > -1;
        };

        $scope.loadMoreResults = function () {
            load(); 
        };
        
        $scope.refreshResults = function () {
            init();
            load();
        };
    }]);