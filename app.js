(function () {
  'use strict';

  angular
    .module('adminApp', ['ngRoute'])
    .config(configureRoutes)
    .run(setupRootScope)
    .factory('ApiService', ApiService)
    .controller('VerifyController', VerifyController)
    .controller('ChartController', ChartController);

  configureRoutes.$inject = ['$routeProvider', '$locationProvider'];
  function configureRoutes($routeProvider, $locationProvider) {
    $routeProvider
      .when('/verify', {
        templateUrl: 'templates/verify.html',
        controller: 'VerifyController',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/verify'
      });
    $locationProvider.hashPrefix('!');
  }

  setupRootScope.$inject = ['$rootScope', '$location'];
  function setupRootScope($rootScope, $location) {
    $rootScope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  }

  ApiService.$inject = ['$http'];
  function ApiService($http) {
    const BASE_URL = 'http://localhost:3000';

    return {
      getUnverifiedPois: getUnverifiedPois,
      verifyPoi: verifyPoi,
      deletePoi: deletePoi,

      getUnverifiedDoctors: getUnverifiedDoctors,
      verifyDoctor: verifyDoctor,
      deleteDoctor: deleteDoctor,

      getUnverifiedCustomerServices: getUnverifiedCustomerServices,
      verifyCustomerService: verifyCustomerService,
      deleteCustomerService: deleteCustomerService,

      fetchUserInfo: fetchUserInfo,
      fetchPoiName: fetchPoiName,
      fetchEvidenceImage: fetchEvidenceImage
    };

    function getUnverifiedPois() {
      return $http
        .get(`${BASE_URL}/pois?verified=false`)
        .then(res => res.data);
    }
    function verifyPoi(id) {
      return $http
        .put(`${BASE_URL}/pois/verify/${id}`)
        .then(res => res.data);
    }
    function deletePoi(id) {
      return $http
        .delete(`${BASE_URL}/pois/${id}`)
        .then(res => res.data);
    }

    function getUnverifiedDoctors() {
      return $http
        .get(`${BASE_URL}/doctors?verified=false`)
        .then(res => res.data);
    }
    function verifyDoctor(userId) {
      return $http
        .put(`${BASE_URL}/doctors/verify/${userId}`)
        .then(res => res.data);
    }
    function deleteDoctor(userId) {
      return $http
        .delete(`${BASE_URL}/users/${userId}`)
        .then(res => res.data);
    }

    function getUnverifiedCustomerServices() {
      return $http
        .get(`${BASE_URL}/customerservices?verified=false`)
        .then(res => res.data);
    }
    function verifyCustomerService(userId) {
      return $http
        .put(`${BASE_URL}/customerservices/verify/${userId}`)
        .then(res => res.data);
    }
    function deleteCustomerService(userId) {
      return $http
        .delete(`${BASE_URL}/users/${userId}`)
        .then(res => res.data);
    }

    function fetchUserInfo(userId) {
      return $http
        .get(`${BASE_URL}/users/${userId}`)
        .then(res => res.data);
    }
    function fetchPoiName(poiId) {
      return $http
        .get(`${BASE_URL}/pois/${poiId}`)
        .then(res => res.data.name);
    }
    function fetchEvidenceImage(userId) {
      return $http
        .get(`${BASE_URL}/evidences/${userId}`)
        .then(res => {
          return res.data.image || null;
        })
        .catch(err => {
          return null;
        });
    }
  }

  VerifyController.$inject = ['ApiService', '$q'];
  function VerifyController(ApiService, $q) {
    const vm = this;
    vm.pois = [];
    vm.doctors = [];
    vm.customerServices = [];

    vm.refreshAll = refreshAll;
    vm.verifyPoi = verifyPoi;
    vm.denyPoi = denyPoi;
    vm.verifyDoctor = verifyDoctor;
    vm.denyDoctor = denyDoctor;
    vm.verifyCustomerService = verifyCustomerService;
    vm.denyCustomerService = denyCustomerService;

    refreshAll();

    function refreshAll() {
      ApiService.getUnverifiedPois()
        .then(data => {
          vm.pois = data.filter(item => !item.verified);
        })
        .catch(err => console.error('Error loading POIs:', err));
      ApiService.getUnverifiedDoctors()
        .then(doctors => {
          doctors = doctors.filter(d => !d.verified);
          return $q.all(
            doctors.map(item =>
              $q
                .all([
                  ApiService.fetchUserInfo(item.user_id),
                  ApiService.fetchPoiName(item.poi_id),
                  ApiService.fetchEvidenceImage(item.user_id)
                ])
                .then(([userInfo, poiName, imageBase64]) => {
                  return {
                    user_id: item.user_id,
                    poi_id: item.poi_id,
                    verified: item.verified,
                    username: userInfo.username,
                    email: userInfo.email,
                    telno: userInfo.telno,
                    poiName: poiName,
                    imageBase64: imageBase64
                  };
                })
            )
          );
        })
        .then(augmentedDoctors => {
          vm.doctors = augmentedDoctors;
        })
        .catch(err => console.error('Error loading doctors:', err));

      ApiService.getUnverifiedCustomerServices()
        .then(services => {
          services = services.filter(s => !s.verified);

          return $q.all(
            services.map(item =>
              $q
                .all([
                  ApiService.fetchUserInfo(item.user_id),
                  ApiService.fetchPoiName(item.poi_id),
                  ApiService.fetchEvidenceImage(item.user_id)
                ])
                .then(([userInfo, poiName, imageBase64]) => {
                  return {
                    user_id: item.user_id,
                    poi_id: item.poi_id,
                    verified: item.verified,
                    username: userInfo.username,
                    email: userInfo.email,
                    telno: userInfo.telno,
                    poiName: poiName,
                    imageBase64: imageBase64
                  };
                })
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

  ChartController.$inject = ['$document', '$timeout'];
  function ChartController($document, $timeout) {
    const vm = this;
    vm.title = 'CHANNELS';
    vm.labels = ['Consultation', 'Service'];
    vm.dataValues = [3, 3];

    $timeout(() => {
      const canvas = $document[0].getElementById('dataChart');
      if (!canvas) {
        console.error('ChartController: <canvas id="dataChart"> not found!');
        return;
      }
      const ctx = canvas.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: vm.labels,
          datasets: [{
            label: 'Value',
            data: vm.dataValues,
            backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(255, 99, 132, 0.7)'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: vm.title,
              font: { size: 18, weight: 'bold' }
            },
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 6,
              title: { display: true, text: 'Chat Per Day' },
              ticks: { stepSize: 1 }
            },
            x: {
              title: { display: true, text: 'User Chats' }
            }
          }
        }
      });
    }, 0);
  }
})();
