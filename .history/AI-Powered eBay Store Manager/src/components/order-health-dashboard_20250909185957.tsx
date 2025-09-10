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
