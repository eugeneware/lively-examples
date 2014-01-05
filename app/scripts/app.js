var app = angular.module('MyApp', ['eugeneware.lively']);
app.controller('MyCtrl', function ($scope, $interval, lively) {
  $scope.test = '';
  $scope.items = [];
  lively('/replicate', $scope, 'test', $scope.test);
});
