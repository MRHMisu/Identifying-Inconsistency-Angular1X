(function() {
    'use strict';
    function constructor() {
        var directive = {
            templateUrl:"views/productDetails.view.html",
            restrict: 'EA',
            replace: 'true',
            scope:false,
            bindToController: true,
            controller:'productDetailsController',
            controllerAs: 'vm',
        };
        return directive;
    }
    constructor.$inject = [];
    angular.module('shoppingList').directive('productDetails', constructor);
})();