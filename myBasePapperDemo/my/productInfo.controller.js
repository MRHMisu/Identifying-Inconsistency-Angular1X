(function() {
    'use strict';
    function constructor()
    {
        var vm = this;
        function init() {
            vm.validator =
            {'required':true,
                'minlength':1,
                'maxlength':10
            }
        }
        init();
    }
    constructor.$inject = [];
    angular.module('shoppingList').controller('productInfoController', constructor);
})();