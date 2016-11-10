(function () {
    'use strict';
    angular.module('searchApp', ['ngRoute']);
    angular.module('searchApp').config(function ($routeProvider) {
        $routeProvider.when(' /', {
            controller: 'searchController',
            templateUrl: 'search.view.html',
            controllerAs:'vm'
        });
        $routeProvider.when(' /results/:userId', {
            controller: 'resultController',
            templateUrl: 'results.view.html',
            controllerAs:'vm'
        });
        $routeProvider.otherwise({
            redirectTo: ' /'
        });
    });
})();




