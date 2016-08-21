(function() {
    'use strict';
    function constructor($routeParams,productService)
    {
        var vm = this;
        var index = $routeParams.index;
        vm.product= productService.getProduct(index);
    }
    constructor.$inject = ['$routeParams','productService'];
    angular.module('shoppingList').controller('productDetailsController', constructor);
})();