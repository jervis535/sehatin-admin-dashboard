(function () {
  'use strict';

  angular
    .module('adminApp')
    .controller('PaymentsRecapController', PaymentsRecapController);

  PaymentsRecapController.$inject = ['ApiService', '$timeout'];
  function PaymentsRecapController(ApiService, $timeout) {
    const vm = this;
    vm.mode = 'daily';
    vm.dataRows = [];
    vm.chart = null;
    vm.chartData = [];
    vm.chartLabels = [];
    vm.loading = false;
    vm.error = '';

    vm.switchMode = switchMode;

    init();

    function init() {
      loadRecap(vm.mode);
    }

    function switchMode(mode) {
      if (vm.mode === mode) return;
      vm.mode = mode;
      loadRecap(mode);
    }

    function loadRecap(mode) {
      vm.loading = true;
      vm.error = '';
      vm.dataRows = [];
      
      if (vm.chart) {
        vm.chart.destroy();
        vm.chart = null;
      }

      const p = mode === 'daily'
        ? ApiService.getDailyPayments()
        : ApiService.getMonthlyPayments();

      p.then(rows => {
        vm.dataRows = rows;
        processChartData(rows);
      })
      .catch(() => vm.error = 'Failed to load data.')
      .finally(() => vm.loading = false);
    }

    function processChartData(rows) {
      const sortedData = [...rows].sort((a, b) => 
        new Date(a.date || a.month) - new Date(b.date || b.month)
      );

      const recentData = sortedData.slice(-7);
      
      vm.chartLabels = recentData.map(item => 
        formatPeriodLabel(item.date || item.month)
      );
      vm.chartData = recentData.map(item => 
        parseFloat(item.total_amount) || 0
      );

      $timeout(() => renderChart(), 0);
    }

    function formatPeriodLabel(dateString) {
      const date = new Date(dateString);
      return vm.mode === 'daily'
        ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    function renderChart() {
      const ctx = document.getElementById('paymentsChart')?.getContext('2d');

      if (!ctx) {
        console.error("Chart.js could not find the canvas context.");
        return;
      }

      const chartTitle = `Last 7 ${vm.mode === 'daily' ? 'Days' : 'Months'} Payments`;
      const backgroundColor = '#4e73df';

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
              text: chartTitle,
              font: {
                size: 16
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `Amount: IDR${context.raw.toFixed(2)}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return `IDR${value}`;
                }
              }
            }
          }
        }
      });
    }
  }
})();