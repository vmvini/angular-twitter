/**
*/

'use strict';

angular.module('myApp').controller('HomeCtrl', ['$scope', '$nbTwitter', function($scope, $nbTwitter) {
	//TODO - put any directive code here

    $scope.connect()
    {
        $nbTwitter.connect();
    };


}]);