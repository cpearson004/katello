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
 * @name  Bastion.systems.controller:SystemsBulkActionController
 *
 * @requires $scope
 * @requires $http
 * @requires SystemGroups
 * @requires Nutupane
 * @requires Routes
 * @requires CurrentOrganization
 *
 * @description
 *   A controller for providing bulk action functionality to the systems page.
 */
angular.module('Bastion.systems').controller('SystemsBulkActionController',
    ['$scope', '$http', 'SystemGroups', 'Nutupane', 'Routes', 'CurrentOrganization',
        function($scope, $http, SystemGroups, Nutupane, Routes, CurrentOrganization) {
            var systemGroups = [];

            var nutupane                       = new Nutupane();
            $scope.systemGroups                = nutupane.table;
            $scope.systemGroups.url            = Routes.apiOrganizationSystemGroupsPath(CurrentOrganization);
            $scope.systemGroups.model          = 'System Groups';
            $scope.systemGroups["active_item"]    = {};
            $scope.working = false;

            nutupane.get();

            $scope.addSystemsToGroups = function() {
                $scope.working = true;
                var getIdFromRow = function(row) {
                    return row["row_id"];
                };
                var selectedSystemGroupRows = $scope.systemGroups.getSelectedRows();
                var systemIds = $.map($scope.table.getSelectedRows(), getIdFromRow);
                var systemGroupIds = $.map(selectedSystemGroupRows, getIdFromRow);
                var data = {"group_ids": systemGroupIds, ids:systemIds};

                $http.post(Routes.bulkAddSystemGroupSystemsPath(), data).then(function(response) {
                    $scope.working = false;
                    // Work around AngularJS not providing direct access to the XHR object
                    response.getResponseHeader = response.headers;

                    // Update the count of systems for each system group
                    if (response.status === 200) {
                        var selectedSystemNames = $.map($scope.systems, function(system) {
                            if (systemIds.indexOf(system.id) >= 0) {
                                return system.name;
                            }
                        });
                        var selectedSystemGroups = $.map(systemGroups, function(systemGroup) {
                            if (systemGroupIds.indexOf(systemGroup.id) >= 0) {
                                return systemGroup;
                            }
                        });

                        // TODO refactor this by providing direct access to the $scope model in alch-tables
                        $.each(selectedSystemGroups, function(groupIndex, systemGroup) {
                            $.each(selectedSystemNames, function(systemIndex, systemName) {
                                if (systemGroup.system.indexOf(systemName) === -1) {
                                    systemGroup.system.push(systemName);
                                    $.each(selectedSystemGroupRows[groupIndex].cells, function(cellIndex, cell) {
                                        if (cell["column_id"] === "num_systems") {
                                            cell.display = systemGroup.system.length;
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            };
        }]
);
