(function () {
  'use strict';

  angular
    .module('adminApp')
    .controller('ChartController', ChartController);

  ChartController.$inject = ['$document', '$timeout'];
  function ChartController($document, $timeout) {
    const vm = this;
    vm.title      = 'CHANNELS';
    vm.labels     = ['Consultation', 'Service'];
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
            backgroundColor: [
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 99, 132, 0.7)'
            ],
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
