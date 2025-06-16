(function(){
  'use strict';
  angular
    .module('adminApp')
    .controller('ChatsByPoiController', ChatsByPoiController);

  ChatsByPoiController.$inject = ['ApiService','$q'];
  function ChatsByPoiController(ApiService, $q) {
    const vm = this;
    vm.byPoi = [];

    init();

    function init() {
      $q.all({
        channels: ApiService.getAllChannels(),
        doctors:  ApiService.getAllDoctors(),
        services: ApiService.getAllCustomerServices()
      })
      .then(({channels, doctors, services}) => {
        const poiMap = {};
        doctors.concat(services).forEach(u => {
          if (u.poi_id != null) {
            poiMap[u.user_id] = u.poi_id;
          }
        });

        const countMap = {};
        channels.forEach(ch => {
          [ch.user_id0, ch.user_id1].forEach(uid => {
            const pid = poiMap[uid];
            if (pid != null) {
              countMap[pid] = (countMap[pid] || 0) + 1;
            }
          });
        });

        const poiIds = Object.keys(countMap);
        const promises = poiIds.map(pid =>
          ApiService.fetchPoiName(pid).then(name => ({
            poiId: pid,
            name: name,
            count: countMap[pid]
          }))
        );

        return $q.all(promises);
      })
      .then(results => {
        vm.byPoi = results;
      })
      .catch(() => {
        vm.byPoi = [];
      });
    }
  }
})();
