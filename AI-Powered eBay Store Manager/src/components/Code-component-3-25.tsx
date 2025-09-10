import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart } from "lucide-react";

export function AnalyticsDashboard() {
  const revenueData = [
    { month: "Jul", revenue: 15420, orders: 67 },
    { month: "Aug", revenue: 18340, orders: 78 },
    { month: "Sep", revenue: 14230, orders: 62 },
    { month: "Oct", revenue: 16780, orders: 71 },
    { month: "Nov", revenue: 12890, orders: 58 },
    { month: "Dec", revenue: 13450, orders: 61 },
    { month: "Jan", revenue: 12847, orders: 56 }
  ];

  const categoryData = [
    { name: "Electronics", value: 45, color: "#8884d8" },
    { name: "Fashion", value: 25, color: "#82ca9d" },
    { name: "Collectibles", value: 15, color: "#ffc658" },
    { name: "Sports", value: 10, color: "#ff7300" },
    { name: "Other", value: 5, color: "#00ff00" }
  ];

  const topProducts = [
    {
      name: "iPhone 15 Pro Max",
      revenue: "$3,600",
      units: 3,
      margin: "22%",
      trend: "up"
    },
    {
      name: "Gaming Laptop RTX 4080",
      revenue: "$2,800",
      units: 1,
      margin: "18%",
      trend: "up"
    },
    {
      name: "Air Jordan Retro",
      revenue: "$1,350",
      units: 3,
      margin: "35%",
      trend: "down"
    },
    {
      name: "Designer Handbag",
      revenue: "$1,200",
      units: 2,
      margin: "28%",
      trend: "up"
    }
  ];

  const kpiMetrics = [
    {
      title: "Total Revenue",
      value: "$12,847",
      change: "-15.2%",
      trend: "down",
      icon: DollarSign,
      description: "vs last month"
    },
    {
      title: "Gross Profit",
      value: "$3,847",
      change: "+8.4%",
      trend: "up",
      icon: TrendingUp,
      description: "30% margin"
    },
    {
      title: "Total Orders",
      value: "56",
      change: "-12.3%",
      trend: "down",
      icon: ShoppingCart,
      description: "vs last month"
    },
    {
      title: "Avg Order Value",
      value: "$229",
      change: "+5.7%",
      trend: "up",
      icon: Users,
      description: "per transaction"
    }
  ];

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? TrendingUp : TrendingDown;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          const TrendIcon = getTrendIcon(metric.trend);
          
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className="size-6 text-muted-foreground" />
                  <div className={`flex items-center gap-1 text-sm ${getTrendColor(metric.trend)}`}>
                    <TrendIcon className="size-4" />
                    {metric.change}
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.title}</div>
                <div className="text-xs text-muted-foreground">{metric.description}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: "#8884d8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, "Share"]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="size-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm">{category.name} ({category.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="products">
            <TabsList>
              <TabsTrigger value="products">Top Products</TabsTrigger>
              <TabsTrigger value="growth">Growth Metrics</TabsTrigger>
              <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
              <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="products" className="space-y-4">
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="font-medium">{index + 1}.</div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.units} units sold
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold">{product.revenue}</div>
                        <div className="text-sm text-muted-foreground">{product.margin} margin</div>
                      </div>
                      <div className={`flex items-center ${getTrendColor(product.trend)}`}>
                        {product.trend === 'up' ? (
                          <TrendingUp className="size-4" />
                        ) : (
                          <TrendingDown className="size-4" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="growth" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600 mb-1">-15.2%</div>
                    <div className="text-sm font-medium">Revenue Growth</div>
                    <div className="text-xs text-muted-foreground">Month over month</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600 mb-1">+8.4%</div>
                    <div className="text-sm font-medium">Profit Growth</div>
                    <div className="text-xs text-muted-foreground">Improving margins</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-orange-600 mb-1">+5.7%</div>
                    <div className="text-sm font-medium">AOV Growth</div>
                    <div className="text-xs text-muted-foreground">Customer value up</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="forecasting" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-3">30-Day Forecast</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Projected Revenue:</span>
                      <span className="font-bold">$14,200 - $16,800</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected Orders:</span>
                      <span className="font-bold">62 - 73</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence Level:</span>
                      <Badge variant="secondary">78%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-4">
              <div className="space-y-3">
                <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📈 Focus on High-Margin Items</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Your collectibles category has the highest margins (35%). Consider listing more similar items.
                  </p>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    View Recommendations
                  </Button>
                </div>
                
                <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">💰 Optimize Pricing</h4>
                  <p className="text-sm text-green-800 mb-2">
                    15 of your listings are priced below market average. Price optimization could increase revenue by $2,340.
                  </p>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Auto-Optimize Pricing
                  </Button>
                </div>
                
                <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">🎯 Improve Visibility</h4>
                  <p className="text-sm text-purple-800 mb-2">
                    23 listings have low view counts. SEO improvements could increase visibility by 40%.
                  </p>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Optimize SEO
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}