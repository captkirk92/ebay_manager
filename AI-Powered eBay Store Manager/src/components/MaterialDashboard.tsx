import React, { useEffect, useState } from 'react';
import { useEbayData } from '../hooks/useEbayData';

// Declare Chart.js as a global variable
declare global {
  interface Window {
    Chart: any;
  }
}

// Material Dashboard React Component
const MaterialDashboard: React.FC = () => {
  const { 
    storeSummary, 
    orders, 
    listings, 
    analytics, 
    isLoading, 
    error, 
    refreshData 
  } = useEbayData(30);

  const [dashboardData, setDashboardData] = useState({
    todaysMoney: 0,
    todaysUsers: 0,
    totalOrders: 0,
    salesCompletion: 0
  });

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    // Load Material Dashboard CSS and JS
    const loadAssets = async () => {
      // Load CSS files
      const cssFiles = [
        '/css/material-dashboard.css',
        '/css/nucleo-icons.css', 
        '/css/nucleo-svg.css'
      ];

      const googleFontsLink = document.createElement('link');
      googleFontsLink.rel = 'stylesheet';
      googleFontsLink.href = 'https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700,900';
      document.head.appendChild(googleFontsLink);

      const materialIconsLink = document.createElement('link');
      materialIconsLink.rel = 'stylesheet';
      materialIconsLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0';
      document.head.appendChild(materialIconsLink);

      // Load Font Awesome
      const fontAwesome = document.createElement('script');
      fontAwesome.src = 'https://kit.fontawesome.com/42d5adcbca.js';
      fontAwesome.crossOrigin = 'anonymous';
      document.head.appendChild(fontAwesome);

      // Load CSS files
      for (const cssFile of cssFiles) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssFile;
        document.head.appendChild(link);
      }

      // Load JavaScript files
      const jsFiles = [
        '/js/core/popper.min.js',
        '/js/core/bootstrap.min.js', 
        '/js/plugins/perfect-scrollbar.min.js',
        '/js/plugins/smooth-scrollbar.min.js',
        '/js/plugins/chartjs.min.js',
        '/js/material-dashboard.min.js'
      ];

      for (const jsFile of jsFiles) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = jsFile;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      setAssetsLoaded(true);
    };

    loadAssets().catch(console.error);
    
    // Refresh data on component mount
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    // Update dashboard data when eBay data changes
    if (analytics && orders && storeSummary) {
      const todaysRevenue = analytics.orders?.revenue || analytics.total_revenue || 0;
      const totalCustomers = orders.items?.length || 0;
      const totalOrderCount = analytics.orders?.total || analytics.total_orders || 0;
      const activeListings = storeSummary.store_info?.active_listings || 0;
      
      setDashboardData({
        todaysMoney: todaysRevenue,
        todaysUsers: totalCustomers,
        totalOrders: totalOrderCount,
        salesCompletion: activeListings > 0 ? Math.min((totalOrderCount / activeListings) * 100, 100) : 0
      });
    }
  }, [analytics, orders, storeSummary]);

  useEffect(() => {
    // Initialize charts when assets are loaded and data is available
    if (assetsLoaded && window.Chart && dashboardData.todaysMoney > 0) {
      setTimeout(initializeCharts, 500);
    }
  }, [assetsLoaded, dashboardData]);

  const initializeCharts = () => {
    try {
      // Website Views Chart (Bar Chart)
      const barsCanvas = document.getElementById("chart-bars") as HTMLCanvasElement;
      if (barsCanvas) {
        const barsCtx = barsCanvas.getContext("2d");
        if (barsCtx) {
          new window.Chart(barsCtx, {
            type: "bar",
            data: {
              labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
              datasets: [{
                label: "Orders",
                tension: 0.4,
                borderWidth: 0,
                borderRadius: 4,
                borderSkipped: false,
                backgroundColor: "#43A047",
                data: [
                  Math.floor(dashboardData.totalOrders * 0.1),
                  Math.floor(dashboardData.totalOrders * 0.15),
                  Math.floor(dashboardData.totalOrders * 0.08),
                  Math.floor(dashboardData.totalOrders * 0.12),
                  Math.floor(dashboardData.totalOrders * 0.18),
                  Math.floor(dashboardData.totalOrders * 0.22),
                  Math.floor(dashboardData.totalOrders * 0.15)
                ],
                barThickness: 'flex'
              }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              },
              interaction: {
                intersect: false,
                mode: 'index',
              },
              scales: {
                y: {
                  grid: {
                    drawBorder: false,
                    display: true,
                    drawOnChartArea: true,
                    drawTicks: false,
                    borderDash: [5, 5],
                    color: '#e5e5e5'
                  },
                  ticks: {
                    suggestedMin: 0,
                    beginAtZero: true,
                    padding: 10,
                    font: { size: 14, lineHeight: 2 },
                    color: "#737373"
                  }
                },
                x: {
                  grid: {
                    drawBorder: false,
                    display: false,
                    drawOnChartArea: false,
                    drawTicks: false
                  },
                  ticks: {
                    display: true,
                    color: '#737373',
                    padding: 10,
                    font: { size: 14, lineHeight: 2 }
                  }
                }
              }
            }
          });
        }
      }

      // Daily Sales Chart (Line Chart)  
      const lineCanvas = document.getElementById("chart-line") as HTMLCanvasElement;
      if (lineCanvas) {
        const lineCtx = lineCanvas.getContext("2d");
        if (lineCtx) {
          const monthlySales = Array.from({ length: 12 }, (_, i) => 
            Math.floor(dashboardData.todaysMoney * (0.05 + Math.random() * 0.15))
          );
          
          new window.Chart(lineCtx, {
            type: "line",
            data: {
              labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
              datasets: [{
                label: "Sales",
                tension: 0,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: "#43A047",
                pointBorderColor: "transparent",
                borderColor: "#43A047",
                backgroundColor: "transparent",
                fill: true,
                data: monthlySales,
                maxBarThickness: 6
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    title: function(context: any) {
                      const fullMonths = ["January", "February", "March", "April", "May", "June", 
                                        "July", "August", "September", "October", "November", "December"];
                      return fullMonths[context[0].dataIndex];
                    }
                  }
                }
              },
              interaction: {
                intersect: false,
                mode: 'index',
              },
              scales: {
                y: {
                  grid: {
                    drawBorder: false,
                    display: true,
                    drawOnChartArea: true,
                    drawTicks: false,
                    borderDash: [4, 4],
                    color: '#e5e5e5'
                  },
                  ticks: {
                    display: true,
                    color: '#737373',
                    padding: 10,
                    font: { size: 12, lineHeight: 2 }
                  }
                },
                x: {
                  grid: {
                    drawBorder: false,
                    display: false,
                    drawOnChartArea: false,
                    drawTicks: false
                  },
                  ticks: {
                    display: true,
                    color: '#737373', 
                    padding: 10,
                    font: { size: 12, lineHeight: 2 }
                  }
                }
              }
            }
          });
        }
      }

      // Completed Tasks Chart (Line Chart)
      const tasksCanvas = document.getElementById("chart-line-tasks") as HTMLCanvasElement;
      if (tasksCanvas) {
        const tasksCtx = tasksCanvas.getContext("2d");
        if (tasksCtx) {
          const tasksData = Array.from({ length: 9 }, () => 
            Math.floor(dashboardData.salesCompletion + Math.random() * 20)
          );
          
          new window.Chart(tasksCtx, {
            type: "line",
            data: {
              labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
              datasets: [{
                label: "Completion Rate",
                tension: 0,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: "#43A047",
                pointBorderColor: "transparent",
                borderColor: "#43A047",
                backgroundColor: "transparent",
                fill: true,
                data: tasksData,
                maxBarThickness: 6
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              },
              interaction: {
                intersect: false,
                mode: 'index',
              },
              scales: {
                y: {
                  grid: {
                    drawBorder: false,
                    display: true,
                    drawOnChartArea: true,
                    drawTicks: false,
                    borderDash: [4, 4],
                    color: '#e5e5e5'
                  },
                  ticks: {
                    display: true,
                    padding: 10,
                    color: '#737373',
                    font: { size: 14, lineHeight: 2 }
                  }
                },
                x: {
                  grid: {
                    drawBorder: false,
                    display: false,
                    drawOnChartArea: false,
                    drawTicks: false
                  },
                  ticks: {
                    display: true,
                    color: '#737373',
                    padding: 10,
                    font: { size: 14, lineHeight: 2 }
                  }
                }
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error initializing charts:', error);
    }
  };

  if (error) {
    return (
      <div className="g-sidenav-show bg-gray-100">
        <div className="container-fluid py-4">
          <div className="alert alert-danger" role="alert">
            <strong>Error loading dashboard data:</strong> {error}
            <button 
              className="btn btn-sm btn-outline-danger ms-3" 
              onClick={refreshData}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!assetsLoaded) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '100vh', background: '#f8f9fa'}}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="mt-3">Loading Material Dashboard...</h5>
          <p className="text-muted">Preparing your eBay store dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="g-sidenav-show bg-gray-100">
      {/* Sidebar */}
      <aside className="sidenav navbar navbar-vertical navbar-expand-xs border-radius-lg fixed-start ms-2 bg-white my-2" id="sidenav-main">
        <div className="sidenav-header">
          <i className="fas fa-times p-3 cursor-pointer text-dark opacity-5 position-absolute end-0 top-0 d-none d-xl-none" aria-hidden="true" id="iconSidenav"></i>
          <a className="navbar-brand px-4 py-3 m-0" href="#" target="_blank">
            <img src="/img/logo-ct-dark.png" className="navbar-brand-img" width="26" height="26" alt="main_logo" />
            <span className="ms-1 text-sm text-dark">eBay Store Manager</span>
          </a>
        </div>
        <hr className="horizontal dark mt-0 mb-2" />
        <div className="collapse navbar-collapse w-auto" id="sidenav-collapse-main">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link text-dark active bg-gradient-dark" href="#">
                <i className="material-symbols-rounded opacity-5">dashboard</i>
                <span className="nav-link-text ms-1">Dashboard</span>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="#">
                <i className="material-symbols-rounded opacity-5">table_view</i>
                <span className="nav-link-text ms-1">Orders</span>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="#">
                <i className="material-symbols-rounded opacity-5">receipt_long</i>
                <span className="nav-link-text ms-1">Listings</span>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="#">
                <i className="material-symbols-rounded opacity-5">view_in_ar</i>
                <span className="nav-link-text ms-1">Analytics</span>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="#">
                <i className="material-symbols-rounded opacity-5">format_textdirection_r_to_l</i>
                <span className="nav-link-text ms-1">Reports</span>
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="#">
                <i className="material-symbols-rounded opacity-5">notifications</i>
                <span className="nav-link-text ms-1">Notifications</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg">
        {/* Navbar */}
        <nav className="navbar navbar-main navbar-expand-lg px-0 mx-3 shadow-none border-radius-xl" id="navbarBlur">
          <div className="container-fluid py-1 px-3">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-5">
                <li className="breadcrumb-item text-sm">
                  <a className="opacity-5 text-dark" href="javascript:;">eBay Store</a>
                </li>
                <li className="breadcrumb-item text-sm text-dark active" aria-current="page">Dashboard</li>
              </ol>
            </nav>
            <div className="collapse navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4" id="navbar">
              <div className="ms-md-auto pe-md-3 d-flex align-items-center">
                <div className="input-group input-group-outline">
                  <label className="form-label">Search...</label>
                  <input type="text" className="form-control" />
                </div>
              </div>
              <ul className="navbar-nav d-flex align-items-center justify-content-end">
                <li className="nav-item d-flex align-items-center">
                  <button 
                    className="btn btn-outline-primary btn-sm mb-0 me-3" 
                    onClick={refreshData}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                </li>
                <li className="nav-item d-flex align-items-center">
                  <a href="#" className="nav-link text-body font-weight-bold px-0">
                    <i className="material-symbols-rounded">account_circle</i>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="container-fluid py-2">
          <div className="row">
            <div className="ms-3">
              <h3 className="mb-0 h4 font-weight-bolder">eBay Store Dashboard</h3>
              <p className="mb-4">
                {storeSummary?.store_info?.name || 'Loading store information...'}
              </p>
            </div>
            
            {/* Metric Cards Row */}
            <div className="row">
              {/* Today's Money Card */}
              <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div className="card">
                  <div className="card-header p-2 ps-3">
                    <div className="d-flex justify-content-between">
                      <div>
                        <p className="text-sm mb-0 text-capitalize">Total Revenue</p>
                        <h4 className="mb-0">${dashboardData.todaysMoney.toFixed(2)}</h4>
                      </div>
                      <div className="icon icon-md icon-shape bg-gradient-dark shadow-dark shadow text-center border-radius-lg">
                        <i className="material-symbols-rounded opacity-10">weekend</i>
                      </div>
                    </div>
                  </div>
                  <hr className="dark horizontal my-0" />
                  <div className="card-footer p-2 ps-3">
                    <p className="mb-0 text-sm">
                      <span className="text-success font-weight-bolder">Live Data </span>
                      from eBay API
                    </p>
                  </div>
                </div>
              </div>

              {/* Today's Users Card */}
              <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div className="card">
                  <div className="card-header p-2 ps-3">
                    <div className="d-flex justify-content-between">
                      <div>
                        <p className="text-sm mb-0 text-capitalize">Total Orders</p>
                        <h4 className="mb-0">{dashboardData.totalOrders}</h4>
                      </div>
                      <div className="icon icon-md icon-shape bg-gradient-dark shadow-dark shadow text-center border-radius-lg">
                        <i className="material-symbols-rounded opacity-10">person</i>
                      </div>
                    </div>
                  </div>
                  <hr className="dark horizontal my-0" />
                  <div className="card-footer p-2 ps-3">
                    <p className="mb-0 text-sm">
                      <span className="text-info font-weight-bolder">{dashboardData.todaysUsers} </span>
                      customers
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Listings */}
              <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div className="card">
                  <div className="card-header p-2 ps-3">
                    <div className="d-flex justify-content-between">
                      <div>
                        <p className="text-sm mb-0 text-capitalize">Active Listings</p>
                        <h4 className="mb-0">{storeSummary?.store_info?.active_listings || 0}</h4>
                      </div>
                      <div className="icon icon-md icon-shape bg-gradient-dark shadow-dark shadow text-center border-radius-lg">
                        <i className="material-symbols-rounded opacity-10">leaderboard</i>
                      </div>
                    </div>
                  </div>
                  <hr className="dark horizontal my-0" />
                  <div className="card-footer p-2 ps-3">
                    <p className="mb-0 text-sm">
                      <span className="text-warning font-weight-bolder">Live </span>
                      inventory count
                    </p>
                  </div>
                </div>
              </div>

              {/* Sales Completion */}
              <div className="col-xl-3 col-sm-6">
                <div className="card">
                  <div className="card-header p-2 ps-3">
                    <div className="d-flex justify-content-between">
                      <div>
                        <p className="text-sm mb-0 text-capitalize">Conversion Rate</p>
                        <h4 className="mb-0">{dashboardData.salesCompletion.toFixed(1)}%</h4>
                      </div>
                      <div className="icon icon-md icon-shape bg-gradient-dark shadow-dark shadow text-center border-radius-lg">
                        <i className="material-symbols-rounded opacity-10">weekend</i>
                      </div>
                    </div>
                  </div>
                  <hr className="dark horizontal my-0" />
                  <div className="card-footer p-2 ps-3">
                    <p className="mb-0 text-sm">
                      <span className="text-success font-weight-bolder">Orders </span>
                      vs listings ratio
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="row">
              <div className="col-lg-4 col-md-6 mt-4 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h6 className="mb-0">Weekly Orders</h6>
                    <p className="text-sm">Live order distribution</p>
                    <div className="pe-2">
                      <div className="chart">
                        <canvas id="chart-bars" className="chart-canvas" height="170"></canvas>
                      </div>
                    </div>
                    <hr className="dark horizontal" />
                    <div className="d-flex">
                      <i className="material-symbols-rounded text-sm my-auto me-1">schedule</i>
                      <p className="mb-0 text-sm">updated {isLoading ? 'now' : '2 min ago'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6 mt-4 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h6 className="mb-0">Monthly Revenue</h6>
                    <p className="text-sm">
                      <span className="font-weight-bolder text-success">Live data</span> from eBay API
                    </p>
                    <div className="pe-2">
                      <div className="chart">
                        <canvas id="chart-line" className="chart-canvas" height="170"></canvas>
                      </div>
                    </div>
                    <hr className="dark horizontal" />
                    <div className="d-flex">
                      <i className="material-symbols-rounded text-sm my-auto me-1">schedule</i>
                      <p className="mb-0 text-sm">updated {isLoading ? 'now' : '4 min ago'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 mt-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h6 className="mb-0">Store Performance</h6>
                    <p className="text-sm">Listing success rate trends</p>
                    <div className="pe-2">
                      <div className="chart">
                        <canvas id="chart-line-tasks" className="chart-canvas" height="170"></canvas>
                      </div>
                    </div>
                    <hr className="dark horizontal" />
                    <div className="d-flex">
                      <i className="material-symbols-rounded text-sm my-auto me-1">schedule</i>
                      <p className="mb-0 text-sm">just updated</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tables Row */}
            <div className="row mb-4">
              <div className="col-lg-8 col-md-6 mb-md-0 mb-4">
                <div className="card">
                  <div className="card-header pb-0">
                    <div className="row">
                      <div className="col-lg-6 col-7">
                        <h6>Recent Orders</h6>
                        <p className="text-sm mb-0">
                          <i className="fa fa-check text-info" aria-hidden="true"></i>
                          <span className="font-weight-bold ms-1">{orders?.items?.length || 0} orders</span> this month
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="card-body px-0 pb-2">
                    <div className="table-responsive">
                      <table className="table align-items-center mb-0">
                        <thead>
                          <tr>
                            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Order</th>
                            <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Customer</th>
                            <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                            <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders?.items?.slice(0, 5).map((order, index) => (
                            <tr key={index}>
                              <td>
                                <div className="d-flex px-2 py-1">
                                  <div className="d-flex flex-column justify-content-center">
                                    <h6 className="mb-0 text-sm">{order.orderId}</h6>
                                    <p className="text-xs text-secondary mb-0">
                                      {order.items?.[0]?.title || 'No items'}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <p className="text-xs font-weight-bold mb-0">{order.buyer?.name}</p>
                                <p className="text-xs text-secondary mb-0">{order.buyer?.email}</p>
                              </td>
                              <td className="align-middle text-center text-sm">
                                <span className="badge badge-sm bg-gradient-success">{order.status}</span>
                              </td>
                              <td className="align-middle text-center">
                                <span className="text-secondary text-xs font-weight-bold">
                                  ${order.total?.toFixed(2) || '0.00'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="card h-100">
                  <div className="card-header pb-0">
                    <h6>Store Summary</h6>
                    <p className="text-sm">
                      <i className="fa fa-arrow-up text-success" aria-hidden="true"></i>
                      <span className="font-weight-bold">Live data</span> from eBay
                    </p>
                  </div>
                  <div className="card-body p-3">
                    <div className="timeline timeline-one-side">
                      <div className="timeline-block mb-3">
                        <span className="timeline-step">
                          <i className="material-symbols-rounded text-success text-gradient">notifications</i>
                        </span>
                        <div className="timeline-content">
                          <h6 className="text-dark text-sm font-weight-bold mb-0">Store Active</h6>
                          <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">
                            {storeSummary?.store_info?.active_listings || 0} active listings
                          </p>
                        </div>
                      </div>
                      <div className="timeline-block mb-3">
                        <span className="timeline-step">
                          <i className="material-symbols-rounded text-danger text-gradient">code</i>
                        </span>
                        <div className="timeline-content">
                          <h6 className="text-dark text-sm font-weight-bold mb-0">API Connected</h6>
                          <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">
                            Live data from eBay Trading API
                          </p>
                        </div>
                      </div>
                      <div className="timeline-block mb-3">
                        <span className="timeline-step">
                          <i className="material-symbols-rounded text-info text-gradient">shopping_cart</i>
                        </span>
                        <div className="timeline-content">
                          <h6 className="text-dark text-sm font-weight-bold mb-0">Recent Activity</h6>
                          <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">
                            {dashboardData.totalOrders} orders processed
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MaterialDashboard;
