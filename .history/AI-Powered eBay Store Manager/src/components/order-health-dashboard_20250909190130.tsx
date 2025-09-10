import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";

interface OrderAnalysis {
  orderId: string;
  status: string;
  analysis: {
    paymentCheck: string;
    shippingCheck: string;
    returnsCheck: string;
    profitCheck: string;
  };
  profit: {
    gross: number;
    net: number;
    margin: string;
  };
  actionRequired: string[];
  riskScore: number;
}

interface StoreHealthReport {
  reportDate: string;
  totalOrders: number;
  ordersNeedingAttention: number;
  totalRevenue: number;
  totalProfit: number;
  averageMargin: number;
  criticalIssues: string[];
  recommendations: string[];
  healthScore: number;
}

// Chart configurations
const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  profit: {
    label: "Profit", 
    color: "hsl(var(--chart-2))",
  },
  fees: {
    label: "Fees",
    color: "hsl(var(--chart-3))",
  },
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-4))",
  },
};

// Sample financial data for charts
const generateFinancialData = (healthReport: StoreHealthReport | null) => {
  if (!healthReport) return { revenueData: [], feeBreakdown: [], orderStatus: [], profitTrend: [] };

  // Revenue trend over last 7 days (mock data based on current totals)
  const dailyAverage = healthReport.totalRevenue / 7;
  const revenueData = Array.from({ length: 7 }, (_, i) => ({
    day: `Day ${i + 1}`,
    revenue: Math.round((dailyAverage * (0.8 + Math.random() * 0.4)) * 100) / 100,
    profit: Math.round((dailyAverage * 0.4 * (0.8 + Math.random() * 0.4)) * 100) / 100,
    orders: Math.floor(healthReport.totalOrders / 7 * (0.8 + Math.random() * 0.4)),
  }));

  // Fee breakdown
  const totalFees = healthReport.totalRevenue - healthReport.totalProfit;
  const feeBreakdown = [
    { name: "eBay Final Value", value: Math.round(totalFees * 0.65 * 100) / 100, color: "#ef4444" },
    { name: "Payment Processing", value: Math.round(totalFees * 0.25 * 100) / 100, color: "#f97316" },
    { name: "Shipping", value: Math.round(totalFees * 0.10 * 100) / 100, color: "#eab308" },
  ];

  // Order status distribution
  const orderStatus = [
    { name: "Delivered", value: Math.floor(healthReport.totalOrders * 0.6), color: "#22c55e" },
    { name: "Shipped", value: Math.floor(healthReport.totalOrders * 0.25), color: "#3b82f6" },
    { name: "Processing", value: Math.floor(healthReport.totalOrders * 0.1), color: "#f59e0b" },
    { name: "Issues", value: healthReport.ordersNeedingAttention, color: "#ef4444" },
  ];

  // Profit margin trend
  const profitTrend = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    margin: Math.round((healthReport.averageMargin + (Math.random() - 0.5) * 10) * 100) / 100,
  }));

  return { revenueData, feeBreakdown, orderStatus, profitTrend };
};

export function OrderHealthDashboard() {
  const [healthReport, setHealthReport] = useState<StoreHealthReport | null>(
    null
  );
  const [selectedOrder, setSelectedOrder] = useState<OrderAnalysis | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate chart data based on health report
  const chartData = generateFinancialData(healthReport);

  const fetchHealthReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:5001/api/orders/health-report"
      );
      const result = await response.json();

      if (result.success) {
        setHealthReport(result.data);
      } else {
        setError(result.error || "Failed to fetch health report");
      }
    } catch (err) {
      setError("Network error - unable to fetch health report");
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeOrder = async (orderId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/orders/analyze/${orderId}`
      );
      const result = await response.json();

      if (result.success) {
        setSelectedOrder(result.data);
      } else {
        setError(result.error || "Failed to analyze order");
      }
    } catch (err) {
      setError("Network error - unable to analyze order");
    }
  };

  useEffect(() => {
    fetchHealthReport();
  }, []);

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 70) return "text-red-600";
    if (riskScore >= 40) return "text-orange-600";
    return "text-green-600";
  };

  const getRiskBadgeVariant = (riskScore: number) => {
    if (riskScore >= 70) return "destructive";
    if (riskScore >= 40) return "secondary";
    return "outline";
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  if (isLoading && !healthReport) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading order health analysis...</span>
      </div>
    );
  }

  if (error && !healthReport) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
            <div className="text-lg font-medium">
              Unable to load order health data
            </div>
            <div className="text-sm text-muted-foreground">{error}</div>
            <Button onClick={fetchHealthReport}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Order Financial & Fulfillment Analysis
          </h2>
          <p className="text-muted-foreground">
            AI-powered analysis of payment, shipping, returns, and profitability
          </p>
        </div>
        <Button onClick={fetchHealthReport} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial Charts</TabsTrigger>
          <TabsTrigger value="orders">Order Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">

      {/* Store Health Summary */}
      {healthReport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {healthReport.totalOrders}
                  </p>
                  <p className="text-sm font-medium">Total Orders</p>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {healthReport.ordersNeedingAttention}
                  </p>
                  <p className="text-sm font-medium">Need Attention</p>
                  <p className="text-xs text-muted-foreground">
                    High risk orders
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    ${healthReport.totalProfit.toFixed(2)}
                  </p>
                  <p className="text-sm font-medium">Net Profit</p>
                  <p className="text-xs text-muted-foreground">
                    {healthReport.averageMargin.toFixed(1)}% margin
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle
                  className={`h-8 w-8 ${getHealthScoreColor(
                    healthReport.healthScore
                  )}`}
                />
                <div>
                  <p
                    className={`text-2xl font-bold ${getHealthScoreColor(
                      healthReport.healthScore
                    )}`}
                  >
                    {healthReport.healthScore}/100
                  </p>
                  <p className="text-sm font-medium">Health Score</p>
                  <Progress
                    value={healthReport.healthScore}
                    className="w-20 h-2 mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Critical Issues & Recommendations */}
      {healthReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Critical Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {healthReport.criticalIssues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm">{issue}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {healthReport.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
        </TabsContent>

        {/* Financial Charts Tab */}
        <TabsContent value="financial" className="space-y-4">
          {healthReport && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue & Profit Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Revenue & Profit Trend (7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.revenueData}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stackId="1"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.6}
                        />
                        <Area
                          type="monotone"
                          dataKey="profit"
                          stackId="2"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Fee Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-red-600" />
                    Fee Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.feeBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.feeBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        {data.name}
                                      </span>
                                      <span className="font-bold text-muted-foreground">
                                        ${data.value}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="mt-4 grid grid-cols-1 gap-2">
                    {chartData.feeBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">${item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Order Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    Order Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.orderStatus}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {chartData.orderStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Profit Margin Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Profit Margin Trend (30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.profitTrend}>
                        <XAxis dataKey="day" />
                        <YAxis />
                        <ChartTooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        Day {label}
                                      </span>
                                      <span className="font-bold text-muted-foreground">
                                        {payload[0].value}% Margin
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="margin"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Order Analysis Tab */}
        <TabsContent value="orders" className="space-y-4">
          {/* Order Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Order Analysis</CardTitle>
          <p className="text-sm text-muted-foreground">
            Analyze specific orders for payment, shipping, and profitability
            issues
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Order Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Order ID (e.g., 12345)"
                className="flex-1 px-3 py-2 border rounded-md"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      analyzeOrder(target.value.trim());
                    }
                  }
                }}
              />
              <Button
                onClick={() => {
                  const input = document.querySelector(
                    'input[placeholder*="Order ID"]'
                  ) as HTMLInputElement;
                  if (input?.value.trim()) {
                    analyzeOrder(input.value.trim());
                  }
                }}
              >
                Analyze Order
              </Button>
            </div>

            {/* Sample Orders for Demo */}
            <div className="flex gap-2 flex-wrap">
              <p className="text-sm text-muted-foreground mr-2">Quick test:</p>
              {["12345", "12346", "12347"].map((orderId) => (
                <Button
                  key={orderId}
                  variant="outline"
                  size="sm"
                  onClick={() => analyzeOrder(orderId)}
                >
                  Order {orderId}
                </Button>
              ))}
            </div>

            {/* Order Analysis Results */}
            {selectedOrder && (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    Order {selectedOrder.orderId}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getRiskBadgeVariant(selectedOrder.riskScore)}
                    >
                      Risk: {selectedOrder.riskScore}/100
                    </Badge>
                    <Badge variant="outline">{selectedOrder.status}</Badge>
                  </div>
                </div>

                {/* Analysis Checks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Analysis Results</h4>
                    <div className="space-y-1 text-sm">
                      <div>{selectedOrder.analysis.paymentCheck}</div>
                      <div>{selectedOrder.analysis.shippingCheck}</div>
                      <div>{selectedOrder.analysis.returnsCheck}</div>
                      <div>{selectedOrder.analysis.profitCheck}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Profit Analysis</h4>
                    <div className="space-y-1 text-sm">
                      <div>Gross: ${selectedOrder.profit.gross.toFixed(2)}</div>
                      <div>Net: ${selectedOrder.profit.net.toFixed(2)}</div>
                      <div>Margin: {selectedOrder.profit.margin}</div>
                    </div>
                  </div>
                </div>

                {/* Action Items */}
                {selectedOrder.actionRequired.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Action Required</h4>
                    <div className="space-y-1">
                      {selectedOrder.actionRequired.map((action, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          {healthReport && (
            <div className="grid grid-cols-1 gap-6">
              {/* Combined Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Revenue Performance */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Revenue Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Revenue</span>
                          <span className="font-medium">${healthReport.totalRevenue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Daily Average</span>
                          <span className="font-medium">${(healthReport.totalRevenue / 30).toFixed(2)}</span>
                        </div>
                        <Progress 
                          value={Math.min((healthReport.totalRevenue / 1000) * 100, 100)} 
                          className="h-2" 
                        />
                        <span className="text-xs text-muted-foreground">
                          Target: $1,000/month
                        </span>
                      </div>
                    </div>

                    {/* Profit Performance */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Profit Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Net Profit</span>
                          <span className="font-medium">${healthReport.totalProfit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Profit Margin</span>
                          <span className="font-medium">{healthReport.averageMargin.toFixed(1)}%</span>
                        </div>
                        <Progress 
                          value={Math.min(healthReport.averageMargin, 100)} 
                          className="h-2" 
                        />
                        <span className="text-xs text-muted-foreground">
                          Target: 50% margin
                        </span>
                      </div>
                    </div>

                    {/* Order Performance */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Order Performance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Orders</span>
                          <span className="font-medium">{healthReport.totalOrders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Issues</span>
                          <span className="font-medium text-red-600">{healthReport.ordersNeedingAttention}</span>
                        </div>
                        <Progress 
                          value={((healthReport.totalOrders - healthReport.ordersNeedingAttention) / healthReport.totalOrders) * 100} 
                          className="h-2" 
                        />
                        <span className="text-xs text-muted-foreground">
                          Success Rate: {(((healthReport.totalOrders - healthReport.ordersNeedingAttention) / healthReport.totalOrders) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Order Value</p>
                        <p className="text-2xl font-bold">
                          ${(healthReport.totalRevenue / healthReport.totalOrders).toFixed(2)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Revenue/Order</p>
                        <p className="text-2xl font-bold">
                          ${(healthReport.totalRevenue / healthReport.totalOrders).toFixed(2)}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Profit/Order</p>
                        <p className="text-2xl font-bold">
                          ${(healthReport.totalProfit / healthReport.totalOrders).toFixed(2)}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Issue Rate</p>
                        <p className="text-2xl font-bold">
                          {((healthReport.ordersNeedingAttention / healthReport.totalOrders) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
