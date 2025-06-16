(function () {
  'use strict';

  angular
    .module('adminApp')
    .controller('StaffActivityController', StaffActivityController);

  StaffActivityController.$inject = ['ApiService', '$q', 'AuthService'];
  function StaffActivityController(ApiService, $q, AuthService) {
    const vm = this;

    vm.staffActivities = [];
    vm.loading = true;
    vm.errorMessage = '';

    init();

    function init() {
      vm.loading = true;
      const poiIdStr = AuthService.getPoiId();
      const adminPoiId = parseInt(poiIdStr, 10);

      if (isNaN(adminPoiId)) {
        vm.errorMessage = 'Unable to determine your assigned POI.';
        vm.loading = false;
        return;
      }

      $q.all({
        doctors: ApiService.getAllDoctors(),
        services: ApiService.getAllCustomerServices()
      })
        .then(({ doctors, services }) => {
          const filteredDoctors = doctors.filter(d => parseInt(d.poi_id, 10) === adminPoiId);
          const filteredServices = services.filter(s => parseInt(s.poi_id, 10) === adminPoiId);

          const staffPlaceholders = filteredDoctors.map(d => {
            return ApiService.fetchUserInfo(d.user_id).then(user => ({
              staffId: d.user_id,
              name: user.username || `Dr. ${d.user_id}`,
              role: 'doctor'
            }));
          })
          .concat(
            filteredServices.map(s => {
              return ApiService.fetchUserInfo(s.user_id).then(user => ({
                staffId: s.user_id,
                name: user.username || `CS ${s.user_id}`,
                role: 'customer_service'
              }));
            })
          );

          return $q.all(staffPlaceholders).then(staffEntries => {
            return $q.all(staffEntries.map(staff => {
              return $q.all({
                daily: ApiService.getChannelCount(staff.staffId, 'day'),
                monthly: ApiService.getChannelCount(staff.staffId, 'month')
              }).then(({ daily, monthly }) => ({
                staffId: staff.staffId,
                name: staff.name,
                role: staff.role,
                dailyCounts: daily || [],
                monthlyCounts: monthly || []
              }));
            }));
          });
        })
        .then(results => {
          vm.staffActivities = results;
          vm.loading = false;
        })
        .catch(err => {
          console.error('Error loading staff activity:', err);
          vm.errorMessage = 'Failed to load staff activity.';
          vm.loading = false;
        });
    }
  }
})();
