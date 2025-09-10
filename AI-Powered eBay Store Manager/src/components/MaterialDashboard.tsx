import React, { useEffect, useState } from 'react';
import { useEbayData } from '../hooks/useEbayData';

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

  useEffect(() => {
    // Load Material Dashboard CSS and JS
    const loadAssets = () => {
      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = '/assets/css/material-dashboard.css';
      document.head.appendChild(cssLink);

      const nuclearIconsCSS = document.createElement('link');
      nuclearIconsCSS.rel = 'stylesheet';
      nuclearIconsCSS.href = '/assets/css/nucleo-icons.css';
      document.head.appendChild(nuclearIconsCSS);

      const nuclearSvgCSS = document.createElement('link');
      nuclearSvgCSS.rel = 'stylesheet';
      nuclearSvgCSS.href = '/assets/css/nucleo-svg.css';
      document.head.appendChild(nuclearSvgCSS);

      // Load Google Fonts
      const googleFonts = document.createElement('link');
      googleFonts.rel = 'stylesheet';
      googleFonts.href = 'https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700,900';
      document.head.appendChild(googleFonts);

      const materialIcons = document.createElement('link');
      materialIcons.rel = 'stylesheet';
      materialIcons.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0';
      document.head.appendChild(materialIcons);

      // Load JavaScript
      const chartJS = document.createElement('script');
      chartJS.src = '/assets/js/plugins/chartjs.min.js';
      document.head.appendChild(chartJS);

      const materialDashboardJS = document.createElement('script');
      materialDashboardJS.src = '/assets/js/material-dashboard.min.js';
      document.head.appendChild(materialDashboardJS);
    };

    loadAssets();

    // Refresh data on component mount
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    // Update dashboard data when eBay data changes
    if (analytics && orders && storeSummary) {
      const todaysRevenue = analytics.total_revenue || 0;
      const totalCustomers = orders.items?.length || 0;
      const totalOrderCount = analytics.total_orders || 0;
      const activeListings = storeSummary.store_info?.active_listings || 0;
      
      setDashboardData({
        todaysMoney: todaysRevenue,
        todaysUsers: totalCustomers,
        totalOrders: totalOrderCount,
        salesCompletion: activeListings > 0 ? (totalOrderCount / activeListings) * 100 : 0
      });
    }
  }, [analytics, orders, storeSummary]);

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error loading dashboard data: {error}
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
            <img src="/assets/img/logo-ct-dark.png" className="navbar-brand-img" width="26" height="26" alt="main_logo" />
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
            <div className="row mt-4">
              <div className="col-lg-4 col-md-6 mt-4 mb-4">
                <div className="card z-index-2">
                  <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2 bg-transparent">
                    <div className="bg-gradient-primary shadow-primary border-radius-lg py-3 pe-1">
                      <div className="chart">
                        <canvas id="chart-bars" className="chart-canvas" height="170"></canvas>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <h6 className="mb-0">Website Views</h6>
                    <p className="text-sm">Last Campaign Performance</p>
                    <hr className="dark horizontal" />
                    <div className="d-flex">
                      <i className="material-symbols-rounded text-sm my-auto me-1">schedule</i>
                      <p className="mb-0 text-sm">campaign sent 2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6 mt-4 mb-4">
                <div className="card z-index-2">
                  <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2 bg-transparent">
                    <div className="bg-gradient-success shadow-success border-radius-lg py-3 pe-1">
                      <div className="chart">
                        <canvas id="chart-line" className="chart-canvas" height="170"></canvas>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <h6 className="mb-0">Daily Sales</h6>
                    <p className="text-sm">
                      <i className="fa fa-arrow-up text-success" aria-hidden="true"></i>
                      <span className="font-weight-bold">15%</span> increase in today sales.
                    </p>
                    <hr className="dark horizontal" />
                    <div className="d-flex">
                      <i className="material-symbols-rounded text-sm my-auto me-1">schedule</i>
                      <p className="mb-0 text-sm">updated 4 min ago</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 mt-4 mb-3">
                <div className="card z-index-2">
                  <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2 bg-transparent">
                    <div className="bg-gradient-dark shadow-dark border-radius-lg py-3 pe-1">
                      <div className="chart">
                        <canvas id="chart-line-tasks" className="chart-canvas" height="170"></canvas>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <h6 className="mb-0">Completed Tasks</h6>
                    <p className="text-sm">Last Campaign Performance</p>
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
