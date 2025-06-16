(function () {
  'use strict';

  angular
    .module('adminApp')
    .controller('DailyChatsController', DailyChatsController);

  DailyChatsController.$inject = ['ApiService', '$q', '$timeout'];
  function DailyChatsController(ApiService, $q, $timeout) {
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
      
      ApiService.getChannelCount('', vm.selectedPeriod, vm.selectedType)
        .then(results => {
          processHistoricalData(results);
          updateChartData();
          vm.loading = false;
        })
        .catch(err => {
          console.error('Error loading activity data:', err);
          vm.errorMessage = 'Failed to load activity data.';
          vm.loading = false;
        });
    }

    function processHistoricalData(results) {
      vm.historicalData = results
        .map(item => ({
          period: item.period,
          count: parseInt(item.chat_count) || 0
        }))
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