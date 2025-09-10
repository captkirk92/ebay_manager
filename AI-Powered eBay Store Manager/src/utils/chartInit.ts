// Chart initialization script for Material Dashboard

// Extend Window interface for Chart.js
declare global {
  interface Window {
    Chart: any;
  }
}

export const initializeCharts = (analytics: any) => {
  // Initialize Chart.js charts with eBay data
  
  // Sales Chart
  const salesCtx = document.getElementById('chart-bars') as HTMLCanvasElement;
  if (salesCtx && window.Chart) {
    const salesChart = new window.Chart(salesCtx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Sales',
          data: analytics?.chart_data?.slice(0, 7).map((item: any) => item.revenue) || [12, 19, 3, 5, 2, 3, 7],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Revenue Chart
  const revenueCtx = document.getElementById('chart-line') as HTMLCanvasElement;
  if (revenueCtx && window.Chart) {
    const revenueChart = new window.Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: analytics?.chart_data?.map((item: any) => item.date) || ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
        datasets: [{
          label: 'Revenue',
          data: analytics?.chart_data?.map((item: any) => item.revenue) || [0, 20, 10, 30, 15],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Tasks Chart
  const tasksCtx = document.getElementById('chart-line-tasks') as HTMLCanvasElement;
  if (tasksCtx && window.Chart) {
    const tasksChart = new window.Chart(tasksCtx, {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Completed Orders',
          data: [50, 100, 75, 125],
          fill: true,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
};
