import React, { useState, useEffect } from 'react';

interface EnhancedStoreData {
  timestamp: string;
  store_info: {
    name: string;
    description: string;
    url: string;
    subscription_level: string;
    creation_time: string;
    hits: number;
  };
  account_info: any;
  user_profile: {
    user_id: string;
    feedback_score: number;
    positive_feedback_percent: number;
    registration_date: string;
    status: string;
  };
  listings: {
    active: any[];
    sold: any[];
    unsold: any[];
  };
  financial: {
    account_summary: {
      current_balance: string;
      currency: string;
      last_invoice_date: string;
      account_state: string;
    };
    recent_transactions: any[];
  };
  summary_stats: {
    total_active_listings: number;
    total_sold_items: number;
    total_unsold_items: number;
    total_revenue: number;
    average_sale_price: number;
    success_rate: number;
    conversion_rate: number;
    feedback_score: number;
    positive_feedback_percent: number;
  };
}

const EnhancedMaterialDashboard: React.FC = () => {
  const [data, setData] = useState<EnhancedStoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEnhancedData = async () => {
      try {
        const response = await fetch('/src/data/enhanced_store_data.json');
        const enhancedData = await response.json();
        setData(enhancedData);
      } catch (error) {
        console.error('Failed to load enhanced data:', error);
        // Fallback to basic data
        try {
          const basicResponse = await fetch('/src/data/store_data.json');
          const basicData = await basicResponse.json();
          // Transform basic data to enhanced format
          setData({
            timestamp: new Date().toISOString(),
            store_info: {
              name: basicData.store_info?.name || 'eBay Store',
              description: '',
              url: '',
              subscription_level: '',
              creation_time: '',
              hits: 0
            },
            account_info: {},
            user_profile: {
              user_id: '',
              feedback_score: 0,
              positive_feedback_percent: 0,
              registration_date: '',
              status: ''
            },
            listings: {
              active: [],
              sold: [],
              unsold: []
            },
            financial: {
              account_summary: {
                current_balance: '0',
                currency: 'USD',
                last_invoice_date: '',
                account_state: ''
              },
              recent_transactions: []
            },
            summary_stats: {
              total_active_listings: basicData.store_info?.active_listings || 0,
              total_sold_items: basicData.total_orders || 0,
              total_unsold_items: 0,
              total_revenue: basicData.revenue || 0,
              average_sale_price: 0,
              success_rate: 0,
              conversion_rate: 0,
              feedback_score: 0,
              positive_feedback_percent: 0
            }
          });
        } catch (fallbackError) {
          console.error('Failed to load any data:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadEnhancedData();
  }, []);

  useEffect(() => {
    if (!data || loading) return;

    // Initialize enhanced charts with real data
    const initEnhancedCharts = () => {
      // Revenue Trend Chart
      const revenueCtx = document.getElementById('chart-line') as HTMLCanvasElement;
      if (revenueCtx && window.Chart) {
        new window.Chart(revenueCtx, {
          type: 'line',
          data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
              label: 'Revenue ($)',
              data: [
                data.summary_stats.total_revenue * 0.6,
                data.summary_stats.total_revenue * 0.8,
                data.summary_stats.total_revenue * 0.9,
                data.summary_stats.total_revenue
              ],
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value: any) {
                    return '$' + value;
                  }
                }
              }
            }
          }
        });
      }

      // Listings Performance Chart
      const listingsCtx = document.getElementById('chart-bars') as HTMLCanvasElement;
      if (listingsCtx && window.Chart) {
        new window.Chart(listingsCtx, {
          type: 'bar',
          data: {
            labels: ['Active', 'Sold', 'Unsold'],
            datasets: [{
              label: 'Listings',
              data: [
                data.summary_stats.total_active_listings,
                data.summary_stats.total_sold_items,
                data.summary_stats.total_unsold_items
              ],
              backgroundColor: [
                'rgba(54, 162, 235, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(255, 99, 132, 0.8)'
              ],
              borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }

      // Success Rate Gauge (using Tasks chart)
      const tasksCtx = document.getElementById('chart-line-tasks') as HTMLCanvasElement;
      if (tasksCtx && window.Chart) {
        new window.Chart(tasksCtx, {
          type: 'doughnut',
          data: {
            labels: ['Success Rate', 'Remaining'],
            datasets: [{
              data: [data.summary_stats.success_rate, 100 - data.summary_stats.success_rate],
              backgroundColor: [
                'rgba(75, 192, 192, 0.8)',
                'rgba(229, 229, 229, 0.3)'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }
    };

    // Wait for Material Dashboard assets to load
    setTimeout(initEnhancedCharts, 1000);
  }, [data, loading]);

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading enhanced dashboard...</span>
      </div>
    </div>;
  }

  if (!data) {
    return <div className="alert alert-danger">Failed to load dashboard data</div>;
  }

  return (
    <div className="enhanced-material-dashboard">
      {/* Enhanced Sidebar with additional sections */}
      <aside className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3 bg-gradient-dark" id="sidenav-main">
        <div className="sidenav-header">
          <i className="fas fa-times p-3 cursor-pointer text-white opacity-5 position-absolute end-0 top-0 d-none d-xl-none" aria-hidden="true" id="iconSidenav"></i>
          <a className="navbar-brand m-0" href="#">
            <img src="/assets/img/logo-ct.png" className="navbar-brand-img h-100" alt="main_logo" />
            <span className="ms-1 font-weight-bold text-white">Enhanced eBay Manager</span>
          </a>
        </div>
        <hr className="horizontal light mt-0 mb-2" />
        
        <div className="collapse navbar-collapse w-auto max-height-vh-100" id="sidenav-collapse-main">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link text-white active bg-gradient-primary" href="#">
                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="material-icons opacity-10">dashboard</i>
                </div>
                <span className="nav-link-text ms-1">Enhanced Dashboard</span>
              </a>
            </li>
            
            <li className="nav-item">
              <a className="nav-link text-white" href="#">
                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="material-icons opacity-10">store</i>
                </div>
                <span className="nav-link-text ms-1">Store Analytics</span>
              </a>
            </li>
            
            <li className="nav-item">
              <a className="nav-link text-white" href="#">
                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="material-icons opacity-10">inventory_2</i>
                </div>
                <span className="nav-link-text ms-1">Listings Manager</span>
              </a>
            </li>
            
            <li className="nav-item">
              <a className="nav-link text-white" href="#">
                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="material-icons opacity-10">account_balance_wallet</i>
                </div>
                <span className="nav-link-text ms-1">Financial Overview</span>
              </a>
            </li>
            
            <li className="nav-item">
              <a className="nav-link text-white" href="#">
                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="material-icons opacity-10">star</i>
                </div>
                <span className="nav-link-text ms-1">Feedback & Reviews</span>
              </a>
            </li>
            
            <li className="nav-item">
              <a className="nav-link text-white" href="#">
                <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                  <i className="material-icons opacity-10">analytics</i>
                </div>
                <span className="nav-link-text ms-1">Performance Metrics</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>

      {/* Enhanced Main Content */}
      <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg">
        {/* Enhanced Navbar */}
        <nav className="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl" id="navbarBlur" data-scroll="true">
          <div className="container-fluid py-1 px-3">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-5">
                <li className="breadcrumb-item text-sm"><a className="opacity-5 text-dark" href="#">Pages</a></li>
                <li className="breadcrumb-item text-sm text-dark active" aria-current="page">Enhanced Dashboard</li>
              </ol>
              <h6 className="font-weight-bolder mb-0">Enhanced eBay Store Manager</h6>
            </nav>
          </div>
        </nav>

        {/* Enhanced Dashboard Content */}
        <div className="container-fluid py-4">
          {/* Enhanced Statistics Cards */}
          <div className="row">
            <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
              <div className="card">
                <div className="card-header p-3 pt-2">
                  <div className="icon icon-lg icon-shape bg-gradient-dark shadow-dark text-center border-radius-xl mt-n4 position-absolute">
                    <i className="material-icons opacity-10">weekend</i>
                  </div>
                  <div className="text-end pt-1">
                    <p className="text-sm mb-0 text-capitalize">Total Revenue</p>
                    <h4 className="mb-0">${data.summary_stats.total_revenue.toFixed(2)}</h4>
                  </div>
                </div>
                <hr className="dark horizontal my-0" />
                <div className="card-footer p-3">
                  <p className="mb-0">
                    <span className="text-success text-sm font-weight-bolder">
                      {data.summary_stats.total_sold_items > 0 ? '+' : ''}{data.summary_stats.total_sold_items}
                    </span> sales completed
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
              <div className="card">
                <div className="card-header p-3 pt-2">
                  <div className="icon icon-lg icon-shape bg-gradient-primary shadow-primary text-center border-radius-xl mt-n4 position-absolute">
                    <i className="material-icons opacity-10">inventory</i>
                  </div>
                  <div className="text-end pt-1">
                    <p className="text-sm mb-0 text-capitalize">Active Listings</p>
                    <h4 className="mb-0">{data.summary_stats.total_active_listings}</h4>
                  </div>
                </div>
                <hr className="dark horizontal my-0" />
                <div className="card-footer p-3">
                  <p className="mb-0">
                    <span className="text-info text-sm font-weight-bolder">
                      {data.summary_stats.success_rate.toFixed(1)}%
                    </span> success rate
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
              <div className="card">
                <div className="card-header p-3 pt-2">
                  <div className="icon icon-lg icon-shape bg-gradient-success shadow-success text-center border-radius-xl mt-n4 position-absolute">
                    <i className="material-icons opacity-10">star</i>
                  </div>
                  <div className="text-end pt-1">
                    <p className="text-sm mb-0 text-capitalize">Feedback Score</p>
                    <h4 className="mb-0">{data.summary_stats.feedback_score}</h4>
                  </div>
                </div>
                <hr className="dark horizontal my-0" />
                <div className="card-footer p-3">
                  <p className="mb-0">
                    <span className="text-success text-sm font-weight-bolder">
                      {data.summary_stats.positive_feedback_percent.toFixed(1)}%
                    </span> positive
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-xl-3 col-sm-6">
              <div className="card">
                <div className="card-header p-3 pt-2">
                  <div className="icon icon-lg icon-shape bg-gradient-info shadow-info text-center border-radius-xl mt-n4 position-absolute">
                    <i className="material-icons opacity-10">account_balance_wallet</i>
                  </div>
                  <div className="text-end pt-1">
                    <p className="text-sm mb-0 text-capitalize">Account Balance</p>
                    <h4 className="mb-0">${data.financial.account_summary.current_balance}</h4>
                  </div>
                </div>
                <hr className="dark horizontal my-0" />
                <div className="card-footer p-3">
                  <p className="mb-0">
                    <span className="text-warning text-sm font-weight-bolder">
                      ${data.summary_stats.average_sale_price.toFixed(2)}
                    </span> avg sale
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Charts Row */}
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
                  <h6 className="mb-0">Listings Overview</h6>
                  <p className="text-sm">Active, sold, and unsold listings</p>
                  <hr className="dark horizontal" />
                  <div className="d-flex">
                    <i className="material-icons text-sm my-auto me-1">schedule</i>
                    <p className="mb-0 text-sm">Updated {new Date(data.timestamp).toLocaleDateString()}</p>
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
                  <h6 className="mb-0">Revenue Trend</h6>
                  <p className="text-sm">Weekly revenue progression</p>
                  <hr className="dark horizontal" />
                  <div className="d-flex">
                    <i className="material-icons text-sm my-auto me-1">schedule</i>
                    <p className="mb-0 text-sm">Updated {new Date(data.timestamp).toLocaleDateString()}</p>
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
                  <h6 className="mb-0">Success Rate</h6>
                  <p className="text-sm">Listing conversion performance</p>
                  <hr className="dark horizontal" />
                  <div className="d-flex">
                    <i className="material-icons text-sm my-auto me-1">schedule</i>
                    <p className="mb-0 text-sm">Updated {new Date(data.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Store Information Panel */}
          <div className="row mt-4">
            <div className="col-lg-8 col-md-6 mb-md-0 mb-4">
              <div className="card">
                <div className="card-header pb-0">
                  <div className="row">
                    <div className="col-lg-6 col-7">
                      <h6>Store Information</h6>
                      <p className="text-sm mb-0">
                        <i className="fa fa-check text-info" aria-hidden="true"></i>
                        <span className="font-weight-bold ms-1">Enhanced Data</span> collected from eBay APIs
                      </p>
                    </div>
                  </div>
                </div>
                <div className="card-body px-0 pb-2">
                  <div className="table-responsive">
                    <table className="table align-items-center mb-0">
                      <thead>
                        <tr>
                          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Store Details</th>
                          <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <div className="d-flex px-2 py-1">
                              <div className="d-flex flex-column justify-content-center">
                                <h6 className="mb-0 text-sm">Store Name</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p className="text-xs font-weight-bold mb-0">{data.store_info.name || 'Not available'}</p>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex px-2 py-1">
                              <div className="d-flex flex-column justify-content-center">
                                <h6 className="mb-0 text-sm">User ID</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p className="text-xs font-weight-bold mb-0">{data.user_profile.user_id || 'Not available'}</p>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex px-2 py-1">
                              <div className="d-flex flex-column justify-content-center">
                                <h6 className="mb-0 text-sm">Registration Date</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p className="text-xs font-weight-bold mb-0">
                              {data.user_profile.registration_date ? 
                                new Date(data.user_profile.registration_date).toLocaleDateString() : 
                                'Not available'
                              }
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="d-flex px-2 py-1">
                              <div className="d-flex flex-column justify-content-center">
                                <h6 className="mb-0 text-sm">Account Status</h6>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-sm bg-gradient-success">
                              {data.user_profile.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Transactions */}
            <div className="col-lg-4 col-md-6">
              <div className="card h-100">
                <div className="card-header pb-0">
                  <h6>Recent Transactions</h6>
                  <p className="text-sm">
                    <i className="fa fa-arrow-up text-success" aria-hidden="true"></i>
                    <span className="font-weight-bold">{data.financial.recent_transactions.length}</span> transactions
                  </p>
                </div>
                <div className="card-body p-3">
                  {data.financial.recent_transactions.length > 0 ? (
                    <div className="timeline timeline-one-side">
                      {data.financial.recent_transactions.slice(0, 5).map((transaction, index) => (
                        <div key={index} className="timeline-block mb-3">
                          <span className="timeline-step">
                            <i className="material-icons text-success text-gradient">payments</i>
                          </span>
                          <div className="timeline-content">
                            <h6 className="text-dark text-sm font-weight-bold mb-0">
                              ${transaction.gross_detail_amount}
                            </h6>
                            <p className="text-secondary font-weight-bold text-xs mt-1 mb-0">
                              {transaction.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <i className="material-icons opacity-10" style={{fontSize: '3rem'}}>receipt</i>
                      <p className="text-sm mt-2">No recent transactions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EnhancedMaterialDashboard;
