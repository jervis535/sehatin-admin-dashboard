(function () {
  'use strict';

  angular
    .module('adminApp')
    .controller('RegisterController', RegisterController);

  RegisterController.$inject = ['ApiService', '$location'];
  function RegisterController(ApiService, $location) {
    const vm = this;

    vm.formData = {
      name: '',
      category: '',
      address: '',
      latitude: null,
      longitude: null,
      telno: '',
      email: '',
      level: '',
      password: ''
    };

    vm.errorMessage = '';
    vm.successMessage = '';

    vm.register = function () {
      vm.errorMessage = '';
      vm.successMessage = '';

      const poiPayload = {
        name:       vm.formData.name,
        category:   vm.formData.category,
        address:    vm.formData.address,
        latitude:   parseFloat(vm.formData.latitude),
        longitude:  parseFloat(vm.formData.longitude)
      };

      ApiService.createPoi(poiPayload)
        .then(poiResponse => {
          const newPoiId = poiResponse.id;

          const adminPayload = {
            poi_id:   newPoiId,
            telno:    vm.formData.telno,
            email:    vm.formData.email,
            level:    2,
            password: vm.formData.password
          };

          return ApiService.createAdmin(adminPayload);
        })
        .then(adminResponse => {
          vm.successMessage = 'Registration successful! You can now log in.';
        })
        .catch(err => {
          console.error('Error during registration:', err);
          if (err.data && err.data.error) {
            vm.errorMessage = err.data.error;
          } else {
            vm.errorMessage = 'An unexpected error occurred. Please try again.';
          }
        });
    };
  }
})();
