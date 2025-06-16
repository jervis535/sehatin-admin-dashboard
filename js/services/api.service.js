(function () {
  'use strict';

  angular
    .module('adminApp')
    .factory('ApiService', ApiService);

  ApiService.$inject = ['$http'];
  function ApiService($http) {
    // const BASE_URL = 'http://localhost:3000';
    const BASE_URL = 'https://sehatin-api-production.up.railway.app';

    return {
      // POI Operations
      getUnverifiedPois: getUnverifiedPois,
      verifyPoi:         verifyPoi,
      deletePoi:         deletePoi,
      fetchPoiName:      fetchPoiName,
      fetchEvidenceImage: fetchEvidenceImage,
      getPoiById:        getPoiById,
      updatePoi:         updatePoi,
      createPoi:         createPoi,

      // Doctor Operations
      getUnverifiedDoctors:    getUnverifiedDoctors,
      verifyDoctor:            verifyDoctor,
      deleteDoctor:            deleteDoctor,
      getAllDoctors:           getAllDoctors,

      // Customer Service Operations
      getUnverifiedCustomerServices: getUnverifiedCustomerServices,
      verifyCustomerService:        verifyCustomerService,
      deleteCustomerService:        deleteCustomerService,
      getAllCustomerServices:       getAllCustomerServices,

      // Admin Operations
      fetchUserInfo:    fetchUserInfo,
      fetchAdminInfo:   fetchAdminInfo,
      getAllAdmins:     getAllAdmins,
      getAdminById:     getAdminById,
      updateAdmin:      updateAdmin,
      changeAdminPassword: changeAdminPassword,
      createAdmin:      createAdmin,

      // Channel Operations
      getChannelCount:  getChannelCount,
      getAllChannels:   getAllChannels,

      // Reviews
      getReviewsForStaff: getReviewsForStaff,

      // Payments
      getDailyPayments:   getDailyPayments,
      getMonthlyPayments: getMonthlyPayments
    };



    function getAdminById(id) {
      return $http.get(`${BASE_URL}/admins/${id}`)
                  .then(r => r.data);
    }
    function updateAdmin(id, payload) {
      return $http.put(`${BASE_URL}/admins/${id}`, payload)
                  .then(r => r.data);
    }
    function getPoiById(id) {
      return $http.get(`${BASE_URL}/pois/${id}`)
                  .then(r => r.data);
    }
    function updatePoi(id, payload) {
      return $http.put(`${BASE_URL}/pois/${id}`, payload)
                  .then(r => r.data);
    }
    
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
      console.log(`${BASE_URL}/customerservices?verified=false`)
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
        .catch(() => {
          return null;
        });
    }
    function createPoi(poiData) {
      return $http
        .post(`${BASE_URL}/pois`, poiData)
        .then(res => res.data);
    }

    function createAdmin(adminData) {
      return $http
        .post(`${BASE_URL}/admins`, adminData)
        .then(res => res.data);
    }
    function fetchAdminInfo(adminId) {
      return $http.get(`${BASE_URL}/admins/${adminId}`).then(res => res.data);
    }

    function getAllAdmins() {
      return $http
        .get(`${BASE_URL}/admins`)
        .then(res => res.data);
    }

    function getAllDoctors() {
      return $http.get(`${BASE_URL}/doctors`).then(res => res.data);
    }

    function getAllCustomerServices() {
      return $http.get(`${BASE_URL}/customerservices`).then(res => res.data);
    }

    function getChannelCount(staffId = '', period = 'day', type = '') {
      let url = `${BASE_URL}/channels_count?period=${period}`;

      if (staffId) {
        url += `&staff_id=${staffId}`;
      }

      if (type) {
        url += `&type=${type}`;
      }

      return $http
        .get(url)
        .then(res => {
          if (res.data && Array.isArray(res.data.data)) {
            return res.data.data;
          } else {
            console.error('Invalid API response:', res.data);
            return [];
          }
        })
        .catch(error => {
          console.error('Error in API request:', error);
          return [];
        });
    }

    function getReviewsForStaff(staffId) {
      return $http
        .get(`${BASE_URL}/reviews?reviewee_id=${staffId}`)
        .then(res => res.data);
    }
    function getAllChannels() {
      return $http
        .get(`${BASE_URL}/channels?all=true`)
        .then(r => r.data);
    }

    function changeAdminPassword(adminId, oldpass, newpass) {
      return $http
        .put(`${BASE_URL}/admins/changepass/${adminId}`, { oldpass, newpass })
        .then(res => res.data);
    }

    function getDailyPayments() {
      return $http
        .get(`${BASE_URL}/payments/daily`)
        .then(res => res.data);
    }
    function getMonthlyPayments() {
      return $http
        .get(`${BASE_URL}/payments/monthly`)
        .then(res => res.data);
    }
  }
})();
