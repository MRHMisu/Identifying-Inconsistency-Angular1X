/**
 * Created by Misu Be Imp on 7/26/2016.
 */
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