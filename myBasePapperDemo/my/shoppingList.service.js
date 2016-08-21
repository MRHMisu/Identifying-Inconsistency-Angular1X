(function() {
'use strict';
    function constructor() {
        var productList;
        function init()
        {
            productList=[
                {
                    'name':"Milk",
                    'price':200
                },
                {
                    'name':"Mango",
                    'price':230
                }
            ];
        }
        function getProductList(){return productList;}
        function getProduct(index){return productList[index];}
        init();
        this.getProductList=getProductList;
        this.getProduct=getProduct;
    }
    constructor.$inject = [];
    angular.module('shoppingList').service('productService', constructor);
})();