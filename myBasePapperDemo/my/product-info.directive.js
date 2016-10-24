(function() {
    'use strict';
    function constructor() {
        var directive = {
            templateUrl:"views/productInfo.view.html",
            restrict: 'EA',
            replace: 'true',
            scope:true,
            bindToController: true,
            controller:'productInfoController'
        };
        return directive;
    }
    constructor.$inject = [];
    angular.module('shoppingList').directive('productInfo', constructor);
})();