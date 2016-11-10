(function (angular) {
    'use strict';
    function constructor($location) {
        var vm = this;
//MODEL - Search
        vm.userName = "";
//CONTROLLER - SearchCtrl
        vm.searchUser = function () {
            var id = getUserId(vm.userName);
            if
            (id >= 0) {
                $location.path(' / results /' + id);
            }
        }
    }
    constructor.$inject = ['$location'];
    angular.module('searchApp').controller('searchController', constructor);
})(window.angular);
