/**
 * Created by Misu Be Imp on 7/25/2016.
 */

angular.module('searchApp', ['ngRoute']);
angular.module('searchApp').config(function ($routeProvider) {
    $routeProvider.when(' /', {
        controller: 'SearchCtrl',
        templateUrl: 'search.html'
    });
    $routeProvider.when(' /results/:userId', {
        controller: 'ResultsCtrl',
        templateUrl: 'results.html'
    });
    $routeProvider.otherwise({
        redirectTo: ' /'
    });
});

/**
 * Created by Misu Be Imp on 7/25/2016.
 */
angular.module('searchApp').controller('SearchCtrl',function ($scope, $location) {
//MODEL - Search
        $scope.userName = "";
//CONTROLLER - SearchCtrl
        $scope.searchUser = function () {
            var id = getUserId($scope.userName);
            if
            (id >= 0) {
                $location.path(' / results /' + id);
            }
        }
    }
);

angular.module('searchApp').controller('ResultsCtrl', function ($scope, $routeParams) {
//MODEL - Results
        $scope.userData = {
            movieList: getList($routeParams.userId),
            intro: "Welcome User #" +
            $routeParams.userId,
            display: true,
            count: "two"
        };
        $scope.movieForms = {
            one: '{}movie',
            other: '{}movies'
        }
        ;
//CONTROLLER - ResultsCtrl
        $scope.alertUserName =
            function () {
                alert("The user is " +
                    $scope.userName);
            };
    }
);