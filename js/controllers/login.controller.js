(function () {
  'use strict';

  angular
    .module('adminApp')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['AuthService', '$location'];
  function LoginController(AuthService, $location) {
    const vm = this;
    vm.email = '';
    vm.password = '';
    vm.errorMessage = '';

    vm.login = function () {
      vm.errorMessage = '';
      AuthService.login(vm.email, vm.password)
        .then(response => {
          const level = AuthService.getLevel();

          if (level === '1') {
            $location.path('/verify');
          } else if (level === '2') {
            $location.path('/verify');
          } else {
            vm.errorMessage = 'Invalid admin level returned. Please try again.';
            AuthService.logout();
          }
        })
        .catch(err => {
          if (err.status === 401) {
            vm.errorMessage = 'Invalid email or password';
          } 
          else if (typeof err === 'string' && err === 'POI is not verified. Access denied.') {
            vm.errorMessage = 'POI is not verified. Access denied.';
          }
          else {
            vm.errorMessage = 'An error occurred. Please try again.';
          }
        });
    };
  }
})();
