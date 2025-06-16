(function () {
  'use strict';

  angular
    .module('adminApp')
    .factory('AuthService', AuthService);

  AuthService.$inject = ['$http', '$window', 'ApiService'];

  function AuthService($http, $window, ApiService) {
    const BASE_URL = 'https://sehatin-api-production.up.railway.app';
    const tokenKey    = 'adminToken';
    const levelKey    = 'adminLevel';
    const poiIdKey    = 'adminPoiId';

    return {
      login:           login,
      logout:          logout,
      getToken:        getToken,
      isAuthenticated: isAuthenticated,
      getLevel:        getLevel,
      getPoiId:        getPoiId,
      getAdminId:      getAdminId
    };

    function login(email, password) {
      return $http
        .post(`${BASE_URL}/admins/login`, { email, password })
        .then(res => {
          const admin = res.data.admin;
          const token = res.data.token;
          const level = res.data.admin.level;
          const poiId = res.data.admin.poi_id;

          if (level === 2) {
            if (!poiId) {
              return Promise.reject('Level 2 admin has no POI assigned.');
            }
            return ApiService.getPoiById(poiId).then(poi => {
              if (!poi.verified) {
                return Promise.reject('POI is not verified. Access denied.');
              }
              storeCredentials(token, level, admin.id, poiId);
              return res.data;
            });
          }
          storeCredentials(token, level, admin.id, poiId);
          return res.data;
        });
    }

    function storeCredentials(token, level, adminId, poiId) {
      if (token) {
        $window.localStorage.setItem(tokenKey, token);
        $window.localStorage.setItem(levelKey, level.toString());
        $window.localStorage.setItem('adminId', adminId.toString());

        if (poiId !== null && poiId !== undefined) {
          $window.localStorage.setItem(poiIdKey, poiId.toString());
        } else {
          $window.localStorage.removeItem(poiIdKey);
        }
      }
    }

    function logout() {
      $window.localStorage.removeItem(tokenKey);
      $window.localStorage.removeItem(levelKey);
      $window.localStorage.removeItem(poiIdKey);
    }

    function getToken() {
      return $window.localStorage.getItem(tokenKey);
    }
    function isAuthenticated() {
      return !!$window.localStorage.getItem(tokenKey);
    }
    function getLevel() {
      return $window.localStorage.getItem(levelKey);
    }
    function getPoiId() {
      return $window.localStorage.getItem(poiIdKey);
    }
    function getAdminId() {
      return parseInt($window.localStorage.getItem('adminId'), 10);
    }
  }
})();
