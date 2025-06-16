(function () {
  'use strict';

  angular
    .module('adminApp')
    .controller('VerifyController', VerifyController);

    VerifyController.$inject = ['ApiService', '$q', 'AuthService'];
    function VerifyController(ApiService, $q, AuthService) {
    const vm = this;
    vm.pois = [];
    vm.doctors = [];
    vm.customerServices = [];

    vm.adminLevel = parseInt(AuthService.getLevel(), 10);
    vm.adminPoiId = parseInt(AuthService.getPoiId(), 10) || -1;

    vm.refreshAll              = refreshAll;
    vm.verifyPoi               = verifyPoi;
    vm.denyPoi                 = denyPoi;
    vm.verifyDoctor            = verifyDoctor;
    vm.denyDoctor              = denyDoctor;
    vm.verifyCustomerService   = verifyCustomerService;
    vm.denyCustomerService     = denyCustomerService;

    refreshAll();

    function refreshAll() {

      $q.all({
        pois: ApiService.getUnverifiedPois(),
        admins: ApiService.getAllAdmins()
      })
      .then(({ pois, admins }) => {
        pois = pois.filter(poi => !poi.verified);

        const augmentedPois = pois.map(poi => {
          const admin = admins.find(a => a.poi_id === poi.id);
          return {
            id:          poi.id,
            name:        poi.name,
            category:    poi.category,
            address:     poi.address,
            latitude:    poi.latitude,
            longitude:   poi.longitude,
            adminTel:    admin ? admin.telno : 'N/A',
            adminEmail:  admin ? admin.email : 'N/A'
          };
        });

        vm.pois = augmentedPois;
      })
      .catch(err => console.error('Error loading POIs or Admins:', err));

      ApiService.getUnverifiedDoctors()
        .then(doctors => {
          doctors = doctors.filter(d => !d.verified && d.poi_id === vm.adminPoiId);
          return $q.all(
            doctors.map(item =>
              $q.all([
                ApiService.fetchUserInfo(item.user_id),
                ApiService.fetchPoiName(item.poi_id),
                ApiService.fetchEvidenceImage(item.user_id)
              ]).then(([userInfo, poiName, imageBase64]) => ({
                user_id:     item.user_id,
                poi_id:      item.poi_id,
                verified:    item.verified,
                username:    userInfo.username,
                email:       userInfo.email,
                poiName:     poiName,
                imageBase64: imageBase64
              }))
            )
          );
        })
        .then(augmentedDoctors => {
          vm.doctors = augmentedDoctors;
        })
        .catch(err => console.error('Error loading doctors:', err));

      ApiService.getUnverifiedCustomerServices()
        .then(services => {
          services = services.filter(s => !s.verified && s.poi_id === vm.adminPoiId);;
          return $q.all(
            services.map(item =>
              $q.all([
                ApiService.fetchUserInfo(item.user_id),
                ApiService.fetchPoiName(item.poi_id),
                ApiService.fetchEvidenceImage(item.user_id)
              ]).then(([userInfo, poiName, imageBase64]) => ({
                user_id:     item.user_id,
                poi_id:      item.poi_id,
                verified:    item.verified,
                username:    userInfo.username,
                email:       userInfo.email,
                poiName:     poiName,
                imageBase64: imageBase64
              }))
            )
          );
        })
        .then(augmentedServices => {
          vm.customerServices = augmentedServices;
        })
        .catch(err => console.error('Error loading customer services:', err));
    }

    function verifyPoi(poiId) {
      ApiService.verifyPoi(poiId)
        .then(() => refreshAll())
        .catch(err => console.error('Error verifying POI:', err));
    }
    function denyPoi(poiId) {
      ApiService.deletePoi(poiId)
        .then(() => refreshAll())
        .catch(err => console.error('Error deleting POI:', err));
    }

    function verifyDoctor(userId) {
      ApiService.verifyDoctor(userId)
        .then(() => refreshAll())
        .catch(err => console.error('Error verifying doctor:', err));
    }
    function denyDoctor(userId) {
      ApiService.deleteDoctor(userId)
        .then(() => refreshAll())
        .catch(err => console.error('Error deleting doctor:', err));
    }

    function verifyCustomerService(userId) {
      ApiService.verifyCustomerService(userId)
        .then(() => refreshAll())
        .catch(err => console.error('Error verifying customer service:', err));
    }
    function denyCustomerService(userId) {
      ApiService.deleteCustomerService(userId)
        .then(() => refreshAll())
        .catch(err => console.error('Error deleting customer service:', err));
    }
  }
})();
