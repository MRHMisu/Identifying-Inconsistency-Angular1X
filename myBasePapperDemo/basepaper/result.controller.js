(function (angular) {
    'use strict';
    function constructor($routeParams) {
        var vm = this;
        vm.userData = {
            movieList: getList($routeParams.userId),
            intro: "Welcome User #" + $routeParams.userId,
            display: true,
            count: "two"
        };
        vm.movieForms = {
            one: '{}movie',
            other: '{}movies'
        }
        ;
        vm.alertUserName =
            function () {
                alert("The user is " +
                    vm.userName);
            };
    }
    constructor.$inject = ['$routeParams'];
    angular.module('searchApp').controller('resultController', constructor);
})(window.angular);
