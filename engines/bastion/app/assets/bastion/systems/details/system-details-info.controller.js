/**
 * Copyright 2013 Red Hat, Inc.
 *
 * This software is licensed to you under the GNU General Public
 * License as published by the Free Software Foundation; either version
 * 2 of the License (GPLv2) or (at your option) any later version.
 * There is NO WARRANTY for this software, express or implied,
 * including the implied warranties of MERCHANTABILITY,
 * NON-INFRINGEMENT, or FITNESS FOR A PARTICULAR PURPOSE. You should
 * have received a copy of GPLv2 along with this software; if not, see
 * http://www.gnu.org/licenses/old-licenses/gpl-2.0.txt.
 */

/**
 * @ngdoc object
 * @name  Bastion.systems.controller:SystemDetailsController
 *
 * @requires $scope
 * @requires $q
 * @requires System
 * @requires ContentView
 *
 * @description
 *   Provides the functionality for the system details action pane.
 */
angular.module('Bastion.systems').controller('SystemDetailsInfoController',
    ['$scope', '$q', 'System', 'ContentView',
    function($scope, $q, System, ContentView) {

        $scope.editContentView = false;
        $scope.saveSuccess = false;
        $scope.saveError = false;
        $scope.previousEnvironment = null;

        $scope.$on('system.loaded', function() {
            $scope.setupSelector();
            $scope.systemFacts = dotNotationToObj($scope.system.facts);
            populateExcludedFacts();
        });

        $scope.save = function(system) {
            var deferred = $q.defer();

            system.$update(function(response) {
                deferred.resolve(response);
                $scope.saveSuccess = true;
            }, function(response) {
                deferred.reject(response);
                $scope.saveError = true;
                $scope.errors = response.data.errors;
            });

            return deferred.promise;
        };

        $scope.setEnvironment = function(environmentId) {
            if ($scope.previousEnvironment !== $scope.system.environment.id) {
                $scope.previousEnvironment = $scope.system.environment.id;
                $scope.system.environment.id = environmentId;
                $scope.editContentView = true;
                $scope.$apply();
            }
        };

        $scope.cancelContentViewUpdate = function() {
            if ($scope.editContentView) {
                $scope.editContentView = false;
                $scope.system.environment.id = $scope.previousEnvironment;
                $scope.pathSelector.select($scope.previousEnvironment);
            }
        };

        $scope.releaseVersions = function() {
            var deferred = $q.defer();

            System.releaseVersions({ id: $scope.$stateParams.systemId }, function(response) {
                deferred.resolve(response);
            });

            return deferred.promise;
        };

        $scope.contentViews = function() {
            var deferred = $q.defer();

            ContentView.query({ 'environment_id': $scope.system.environment.id }, function(response) {
                deferred.resolve(response.results);
            });

            return deferred.promise;
        };

        // TODO upgrade to Angular 1.1.4 so we can move this into a directive
        // and use dynamic templates (http://code.angularjs.org/1.1.4/docs/partials/guide/directive.html)
        $scope.getTemplateForType = function(value) {
            var template = 'systems/details/views/partials/system-detail-value.html';
            if (typeof(value) === 'object') {
                template = 'systems/details/views/partials/system-detail-object.html';
            }
            return template;
        };

        function dotNotationToObj(dotString) {
            var dotObject = {}, tempObject, parts, part, key;
            for (var property in dotString) {
                if (dotString.hasOwnProperty(property)) {
                    tempObject = dotObject;
                    parts = property.split('.');
                    key = parts.pop();
                    while (parts.length) {
                        part = parts.shift();
                        tempObject = tempObject[part] = tempObject[part] || {};
                    }
                    tempObject[key] = dotString[property];
                }
            }
            return dotObject;
        }

        function populateExcludedFacts() {
            $scope.advancedInfoLeft = {};
            $scope.advancedInfoRight = {};
            var index = 0;
            angular.forEach($scope.systemFacts, function(value, key) {
                if (index % 2 === 0) {
                    $scope.advancedInfoLeft[key] = value;
                } else {
                    $scope.advancedInfoRight[key] = value;
                }
                index = index + 1;
            });
            $scope.hasAdvancedInfo = Object.keys($scope.advancedInfoLeft).length > 0 ||
                Object.keys($scope.advancedInfoRight).length > 0;

        }
    }]
);
