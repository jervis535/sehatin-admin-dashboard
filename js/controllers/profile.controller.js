(function(){
  'use strict';
  angular
    .module('adminApp')
    .controller('ProfileController', ProfileController);

  ProfileController.$inject = ['AuthService','ApiService','$location'];
  function ProfileController(AuthService, ApiService, $location) {
    const vm = this;
    vm.admin               = {};
    vm.poi                 = {};
    vm.isLevel2            = AuthService.getLevel() === '2';

    vm.currentEmailInfo    = '';
    vm.currentPasswordInfo = '';

    vm.currentEmailPoi     = '';
    vm.currentPasswordPoi  = '';

    vm.currentEmailPwd     = '';
    vm.currentPasswordPwd  = '';
    vm.newPassword         = '';
    vm.confirmPassword     = '';

    vm.errorMessage        = '';
    vm.successMessage      = '';

    vm.updatePersonalInfo = updatePersonalInfo;
    vm.updatePoiInfo      = updatePoiInfo;
    vm.updatePassword     = updatePassword;
    vm.logout             = () => {
      AuthService.logout();
      $location.path('/login');
    };

    init();

    function init() {
      const adminId = AuthService.getAdminId();
      ApiService.getAdminById(adminId)
        .then(a => {
          vm.admin.id    = a.id;
          vm.admin.email = a.email;
          vm.admin.telno = a.telno;
          vm.admin.level = a.level;
          if (vm.isLevel2 && a.poi_id) {
            return ApiService.getPoiById(a.poi_id)
                     .then(p => vm.poi = angular.copy(p));
          }
        })
        .catch(() => vm.errorMessage = 'Failed to load profile.');
    }

    function updatePersonalInfo() {
      vm.errorMessage   = '';
      vm.successMessage = '';

      AuthService.login(vm.currentEmailInfo, vm.currentPasswordInfo)
        .then(() => {
          const payload = {
            poi_id: vm.isLevel2 ? vm.poi.id : null,
            telno:  vm.admin.telno,
            email:  vm.admin.email,
            level:  vm.admin.level
          };
          return ApiService.updateAdmin(vm.admin.id, payload);
        })
        .then(() => {
          vm.successMessage = 'Personal info updated.';
          vm.currentPasswordInfo = '';
          vm.currentEmailInfo = '';
        })
        .catch(err => {
          if (err.status === 401) {
            vm.errorMessage = 'Current password or email is incorrect.';
          } else {
            vm.errorMessage = 'Failed to update personal info.';
          }
        });
    }

    function updatePoiInfo() {
      vm.errorMessage   = '';
      vm.successMessage = '';

      if (!vm.currentPasswordPoi) {
        vm.errorMessage = 'Enter current password to update POI.';
        return;
      }

      AuthService.login(vm.currentEmailPoi, vm.currentPasswordPoi)
        .then(() => {
          const payload = {
            name:      vm.poi.name,
            category:  vm.poi.category,
            address:   vm.poi.address,
            latitude:  vm.poi.latitude,
            longitude: vm.poi.longitude
          };
          return ApiService.updatePoi(vm.poi.id, payload);
        })
        .then(() => {
          vm.successMessage = 'POI info updated.';
          vm.currentPasswordPoi = '';
          vm.currentEmailPoi = '';
        })
        .catch(err => {
          if (err.status === 401) {
            vm.errorMessage = 'Current password or email is incorrect.';
          } else {
            vm.errorMessage = 'Failed to update POI info.';
          }
        });
    }

    function updatePassword() {
      vm.errorMessage   = '';
      vm.successMessage = '';

      if (vm.newPassword !== vm.confirmPassword) {
        vm.errorMessage = 'New passwords do not match.';
        return;
      }

      AuthService.login(vm.currentEmailPwd, vm.currentPasswordPwd)
        .then(() => {
          return ApiService.changeAdminPassword(vm.admin.id, vm.currentPasswordPwd, vm.newPassword);
        })
        .then(() => {
          vm.successMessage = 'Password changed successfully.';
          vm.currentPasswordPwd = vm.newPassword = vm.confirmPassword = '';
          vm.currentEmailPwd = '';
        })
        .catch(err => {
          if (err.status === 400 && err.data.error === 'Old password is incorrect') {
            vm.errorMessage = 'Current password or email is incorrect.';
          } else {
            vm.errorMessage = 'Failed to change password.';
          }
        });
    }
  }
})();
