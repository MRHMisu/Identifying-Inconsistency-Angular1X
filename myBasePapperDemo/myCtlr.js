app.controller('appVersionController',function()
{
    var vm=this;
    vm.vm.title="My App";
    vm.validator = {
        'required':true,
        'maxlength':10
    }
});