(function() {
'use strict';
    function constructor(productService,$location)
    {
        var vm = this;
        function init() {
            vm.products=productService.getProductList();
        }
        function addProduct(name,price) { vm.products.push({'name':name,'price':price}); }
        function removeProduct(index) {if (index > -1)vm.products.splice(index, 1);}
        function getDetails(index) {$location.path('/product/'+index);}
        vm.addProduct=addProduct;
        vm.removeProduct=removeProduct;
        vm.getDetails=getDetails;
        init();
    }
    constructor.$inject = ['productService','$location'];
    angular.module('shoppingList').controller('productListController', constructor);
})();