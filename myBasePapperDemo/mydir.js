var app = angular.module('myapp', []);
app.directive('productTittle', function() {
    return {// use a child
        scope: true,
        restrict: 'AE',
        replace: 'true',
        template: '<h3>vm.title</br>vm.version</h3>',
        bindToController: true,
        controller:'versionController',
    };
});
app.controller('versionController',function()
{
    var vm=this;
    vm.version="1.0.1";
});

app.directive('productDetails', function() {
    return {
        scope: {},// use a new isolated scope
        restrict: 'AE',
        replace: 'true',
        template: '<div>vm.author</br>vm.gitLink</div>',
        bindToController: true,
        controller:'detailsController',
        controllerAs: 'vm'
    };
});
app.controller('detailsController',function()
{
    var vm=this;
    vm.author="MisuBeImp";
    vm.gitLink="http://misubeimp/demo"
});