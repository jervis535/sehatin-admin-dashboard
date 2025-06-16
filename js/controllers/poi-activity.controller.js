(function () {
  'use strict';

  angular
    .module('adminApp')
    .controller('PoiActivityController', PoiActivityController);

  PoiActivityController.$inject = ['ApiService', '$q', 'AuthService', '$timeout'];
  function PoiActivityController(ApiService, $q, AuthService, $timeout) {
    const vm = this;

    vm.historicalData = [];
    vm.chartData = [];
    vm.chartLabels = [];

    vm.selectedType = 'consultation';
    vm.selectedPeriod = 'day';
    vm.selectedDays = 7;

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

          const staffIds = filteredDoctors.map(d => d.user_id)
            .concat(filteredServices.map(s => s.user_id));

          return $q.all(staffIds.map(staffId => {
            return ApiService.getChannelCount(staffId, vm.selectedPeriod, vm.selectedType);
          }));
        })
        .then(results => {
          processHistoricalData(results);
          updateChartData();
          vm.loading = false;
        })
        .catch(err => {
          console.error('Error loading staff activity data:', err);
          vm.errorMessage = 'Failed to load staff activity data.';
          vm.loading = false;
        });
    }

    function processHistoricalData(results) {
      const allPeriods = results.flat();

      const periodMap = new Map();
      
      allPeriods.forEach(item => {
        const count = parseInt(item.chat_count) || 0;
        if (periodMap.has(item.period)) {
          periodMap.set(item.period, periodMap.get(item.period) + count);
        } else {
          periodMap.set(item.period, count);
        }
      });

      vm.historicalData = Array.from(periodMap.entries())
        .map(([period, count]) => ({ period, count }))
        .sort((a, b) => new Date(a.period) - new Date(b.period));

      if (vm.historicalData.length > vm.selectedDays) {
        vm.historicalData = vm.historicalData.slice(-vm.selectedDays);
      }
    }

    function updateChartData() {
      if (vm.chart) {
        vm.chart.destroy();
      }

      vm.chartLabels = vm.historicalData.map(item => formatPeriodLabel(item.period));
      vm.chartData = vm.historicalData.map(item => item.count);

      $timeout(() => renderChart(), 0);
    }

    function formatPeriodLabel(period) {
      const date = new Date(period);
      if (vm.selectedPeriod === 'day') {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
    }

    function renderChart() {
      const ctx = document.getElementById('activityChart')?.getContext('2d');

      if (!ctx) {
        console.error("Chart.js could not find the canvas context.");
        return;
      }

      const chartTitle = `${vm.selectedPeriod === 'day' ? 'Daily' : 'Monthly'} ${vm.selectedType === 'consultation' ? 'Consultation' : 'Service'} Chats`;
      const backgroundColor = vm.selectedType === 'consultation' ? '#4e73df' : '#1cc88a';

      vm.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: vm.chartLabels,
          datasets: [{
            label: chartTitle,
            data: vm.chartData,
            backgroundColor: backgroundColor,
            borderColor: backgroundColor,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `Last ${vm.selectedDays} ${vm.selectedPeriod === 'day' ? 'Days' : 'Months'}`,
              font: {
                size: 16
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${Math.round(context.raw)}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                callback: function(value) {
                  if (value % 1 === 0) {
                    return value;
                  }
                }
              }
            }
          }
        }
      });
    }

    vm.updateChart = function () {
      vm.loading = true;
      init();
    };
  }
})();