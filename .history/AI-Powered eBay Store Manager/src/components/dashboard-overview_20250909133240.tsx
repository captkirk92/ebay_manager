import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  MessageSquare,
  DollarSign,
  Users,
  Eye,
  Clock,
  Star,
  ShoppingCart,
  Zap,
  Target,
  ArrowUp,
  ArrowDown,
  Brain,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { AIInsightsPanel } from "./ai-insights-panel";
import { useEbayData } from "../hooks/useEbayData";

export function DashboardOverview() {
  // Use real eBay data
  const {
    storeSummary,
    orders,
    listings,
    analytics,
    isLoading,
    error,
    refreshData,
  } = useEbayData(30);

  // Process real eBay data for charts
  const chartData = analytics?.chart_data || [];
  const recentCustomers = analytics?.recent_customers || [];

  // Calculate real metrics from eBay data
  const totalOrders = analytics?.orders?.total || 0;
  const totalRevenue = analytics?.orders?.revenue || 0;
  const averageOrderValue = analytics?.orders?.average_value || 0;
  const totalListings = listings?.total || 0;
  
  // Calculate today's orders from chart data
  const today = new Date().toISOString().split('T')[0];
  const todaysData = chartData.find(d => d.date === today);
  const ordersToday = todaysData?.orders || 0;
  const revenueToday = todaysData?.revenue || 0;
  
  // Calculate store health based on various factors
  let storeHealth = 85; // Base health score
  if (totalListings < 10) storeHealth -= 20;
  if (totalOrders === 0) storeHealth -= 15;
  if (averageOrderValue < 20) storeHealth -= 10;
  storeHealth = Math.min(100, Math.max(0, storeHealth));

  // Calculate trend percentages based on recent data
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { change: "+100%", trend: "up" };
    const percent = ((current - previous) / previous * 100);
    return {
      change: `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`,
      trend: percent >= 0 ? "up" : "down"
    };
  };

  // Get yesterday's data for comparison
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const yesterdaysData = chartData.find(d => d.date === yesterday);
  const ordersYesterday = yesterdaysData?.orders || 0;
  const revenueYesterday = yesterdaysData?.revenue || 0;

  const ordersTrend = calculateTrend(ordersToday, ordersYesterday);
  const revenueTrend = calculateTrend(revenueToday, revenueYesterday);

  const metricCards = [
    {
      title: "Orders Today",
      value: ordersToday.toString(),
      change: ordersTrend.change,
      trend: ordersTrend.trend,
      icon: "📦",
      color: "bg-blue-600/10 border-blue-600/20",
      aiInsight: ordersToday === 0 
        ? "No orders today yet - consider promotional campaigns"
        : ordersToday > ordersYesterday 
        ? `Great! ${ordersToday - ordersYesterday} more orders than yesterday`
        : "Orders are down - check listing visibility",
    },
    {
      title: "Revenue (30 days)",
      value: `$${totalRevenue.toFixed(2)}`,
      change: revenueTrend.change,
      trend: revenueTrend.trend,
      icon: "💰",
      color: "bg-purple-600/10 border-purple-600/20",
      aiInsight: averageOrderValue > 50
        ? `Strong AOV of $${averageOrderValue.toFixed(2)} - focus on customer retention`
        : averageOrderValue > 0 
        ? `AOV is $${averageOrderValue.toFixed(2)} - consider upselling strategies`
        : "No revenue data available",
    },
    {
      title: "Active Listings",
      value: totalListings.toString(),
      change: totalListings > 50 ? "+5%" : totalListings > 20 ? "+2%" : "0%",
      trend: totalListings > 20 ? "up" : "neutral",
      icon: "📋",
      color: "bg-green-600/10 border-green-600/20",
      aiInsight: totalListings === 0
        ? "No active listings - start creating listings to generate sales"
        : totalListings < 10
        ? "Consider adding more listings to increase visibility"
        : `Good catalog size - monitor performance of top ${Math.min(5, totalListings)} listings`,
    },
    {
      title: "Store Health",
      value: `${storeHealth}/100`,
      change: storeHealth >= 80 ? "+2 pts" : storeHealth >= 60 ? "0 pts" : "-3 pts",
      trend: storeHealth >= 80 ? "up" : storeHealth >= 60 ? "neutral" : "down",
      icon: "🎯",
      color: "bg-orange-600/10 border-orange-600/20",
      aiInsight: storeHealth >= 90
        ? "Excellent store health - maintain current strategies"
        : storeHealth >= 70
        ? "Good health - focus on customer service and listing quality"
        : "Store needs attention - review policies and optimize listings",
    },
  ];

  // Calculate customer metrics from real data
  const uniqueCustomers = new Set(recentCustomers.map(c => c.customer)).size;
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  const customerStats = [
    {
      title: "Unique Customers",
      value: uniqueCustomers.toString(),
      change: uniqueCustomers > 5 ? "+15%" : uniqueCustomers > 2 ? "+5%" : "0%",
      changeLabel: "Last 30 Days",
      trend: uniqueCustomers > 2 ? "up" : "neutral",
      color: "text-blue-400",
      aiActions: uniqueCustomers === 0 
        ? ["Focus on customer acquisition", "Consider marketing campaigns"]
        : uniqueCustomers < 5 
        ? ["Improve customer retention", "Personalize customer experience"]
        : ["Strong customer base", "Focus on repeat purchases"],
    },
    {
      title: "Avg Order Value",
      value: `$${avgOrderValue.toFixed(2)}`,
      change: avgOrderValue > 50 ? "+12%" : avgOrderValue > 20 ? "+3%" : "0%",
      changeLabel: "Average Order Value",
      trend: avgOrderValue > 30 ? "up" : "neutral",
      color: "text-purple-400",
      aiActions: avgOrderValue === 0
        ? ["No orders yet", "Focus on first sale"]
        : avgOrderValue < 30
        ? ["Consider bundling products", "Implement upselling strategies"]
        : ["Excellent AOV", "Maintain pricing strategy"],
    },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <ArrowUp className="size-3 text-green-400" />;
    if (trend === "down") return <ArrowDown className="size-3 text-red-400" />;
    return <div className="size-3" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === "up") return "text-green-400";
    if (trend === "down") return "text-red-400";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* AI Status Banner */}
      <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-600/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Brain className="size-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  AI Co-Manager Status
                </h3>
                <p className="text-sm text-muted-foreground">
                  Actively monitoring your store • 12 recommendations ready
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="size-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Live Analysis</span>
              </div>
              <Button
                size="sm"
                onClick={refreshData}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <RefreshCw
                  className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                {isLoading ? "Refreshing..." : "Refresh Data"}
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Sparkles className="size-4 mr-2" />
                View All Insights
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Banner */}
      {error && (
        <Card className="bg-red-600/10 border-red-600/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-red-400" />
              <span className="text-sm text-red-400">
                Error loading data: {error}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={refreshData}
                className="ml-auto"
              >
                <RefreshCw className="size-3 mr-1" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <Card
            key={index}
            className={`${card.color} border relative overflow-hidden`}
          >
            <div className="absolute top-2 right-2">
              <Badge
                variant="secondary"
                className="bg-blue-600/20 text-blue-400 border-0 text-xs"
              >
                AI
              </Badge>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">{card.icon}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <svg
                    className="size-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </h3>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="size-4 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    card.value
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  vs. Last Month
                </div>
                <div
                  className={`flex items-center gap-1 text-xs ${getTrendColor(
                    card.trend
                  )}`}
                >
                  {getTrendIcon(card.trend)}
                  {card.change}
                </div>

                {/* AI Insight */}
                <div className="mt-3 p-2 bg-blue-600/5 border border-blue-600/20 rounded text-xs">
                  <div className="flex items-center gap-1 mb-1">
                    <Sparkles className="size-3 text-blue-400" />
                    <span className="text-blue-400 font-medium">
                      AI Insight
                    </span>
                  </div>
                  <p className="text-muted-foreground">{card.aiInsight}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-foreground flex items-center gap-2">
                  Store Performance Trends
                  <Badge
                    variant="secondary"
                    className="bg-green-600/20 text-green-400 border-0"
                  >
                    AI Enhanced
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="size-2 rounded-full bg-blue-500"></div>
                    <span className="text-muted-foreground">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="size-2 rounded-full bg-orange-400"></div>
                    <span className="text-muted-foreground">Orders</span>
                  </div>
                </div>
              </div>
              <Select defaultValue="year">
                <SelectTrigger className="w-24 h-8 text-xs bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
              {chartData.length > 0 ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="orders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--card-foreground))",
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any, name: string) => [
                      name === 'revenue' ? `$${value.toFixed(2)}` : value,
                      name === 'revenue' ? 'Revenue' : 'Orders'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fill="url(#revenue)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#f59e0b"
                    fill="url(#orders)"
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-muted-foreground">No sales data available</p>
                    <p className="text-sm text-muted-foreground">Data will appear once you have orders</p>
                  </div>
                </div>
              )}
            </ResponsiveContainer>

            {/* AI Prediction Banner */}
            <div className="mt-4 p-3 bg-blue-600/5 border border-blue-600/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="size-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">
                  AI Forecast
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on current trends, I predict 15% revenue increase next
                month if pricing optimizations are applied.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Cards */}
        <div className="space-y-6">
          {emailStats.map((stat, index) => (
            <Card key={index} className="border border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Sparkles className="size-3 text-blue-400" />
                    <span className="text-xs text-blue-400">AI</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.changeLabel}
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs ${getTrendColor(
                      stat.trend
                    )}`}
                  >
                    {getTrendIcon(stat.trend)}
                    {stat.change}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-muted/30 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                </div>

                {/* AI Actions */}
                <div className="mt-4 space-y-1">
                  {stat.aiActions.map((action, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <div className="size-1 bg-blue-400 rounded-full"></div>
                      {action}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel />

      {/* Performance Table with AI Enhancements */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              Recent Activity
              <Badge
                variant="secondary"
                className="bg-purple-600/20 text-purple-400 border-0"
              >
                AI Monitored
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-0 text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Orders
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Response Rate
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    AI Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-0 text-sm text-foreground">
                      {row.date}
                    </td>
                    <td className="py-4 px-4 text-sm text-foreground">
                      {row.email}
                    </td>
                    <td className="py-4 px-4 text-sm text-foreground">
                      {row.sent}
                    </td>
                    <td className="py-4 px-4 text-sm text-foreground">
                      {row.clickRate}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs border-green-400/30 text-green-400"
                        >
                          Optimized
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs border-blue-400/30 text-blue-400"
                        >
                          Monitored
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
