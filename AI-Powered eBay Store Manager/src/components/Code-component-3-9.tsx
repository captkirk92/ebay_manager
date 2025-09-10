import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { AlertTriangle, TrendingUp, Package, MessageSquare } from "lucide-react";

export function DashboardOverview() {
  const storeHealth = {
    score: 72,
    status: "Needs Attention",
    issues: 3
  };

  const kpis = [
    {
      title: "Monthly Revenue",
      value: "$12,847",
      change: "-15%",
      trend: "down"
    },
    {
      title: "Active Listings",
      value: "248",
      change: "+8%",
      trend: "up"
    },
    {
      title: "Pending Orders",
      value: "23",
      change: "+12%",
      trend: "up"
    },
    {
      title: "Customer Messages",
      value: "7",
      change: "-3%",
      trend: "down"
    }
  ];

  const urgentAlerts = [
    {
      type: "Late Shipment Risk",
      count: 5,
      severity: "high",
      description: "Orders need to ship within 24 hours"
    },
    {
      type: "Policy Violations",
      count: 2,
      severity: "medium",
      description: "Listing titles need optimization"
    },
    {
      type: "Low Inventory",
      count: 12,
      severity: "low",
      description: "Items with less than 5 units"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Store Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-2 bg-orange-500 rounded-full"></div>
            Store Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold">{storeHealth.score}/100</div>
              <Badge variant={storeHealth.score < 80 ? "destructive" : "secondary"}>
                {storeHealth.status}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Issues to fix</div>
              <div className="text-2xl font-semibold text-orange-500">{storeHealth.issues}</div>
            </div>
          </div>
          <Progress value={storeHealth.score} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            Address critical issues to improve your store performance and avoid suspensions.
          </p>
        </CardContent>
      </Card>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`size-4 ${kpi.trend === 'down' ? 'rotate-180' : ''}`} />
                  {kpi.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Urgent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-orange-500" />
            Urgent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {urgentAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`size-3 rounded-full ${
                    alert.severity === 'high' ? 'bg-red-500' :
                    alert.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">{alert.type}</p>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="font-bold">
                  {alert.count}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-4 text-center">
            <Package className="size-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-medium">Process Orders</h3>
            <p className="text-sm text-muted-foreground">23 orders ready to ship</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-4 text-center">
            <MessageSquare className="size-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-medium">Reply to Messages</h3>
            <p className="text-sm text-muted-foreground">7 customer inquiries</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-4 text-center">
            <TrendingUp className="size-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-medium">Optimize Listings</h3>
            <p className="text-sm text-muted-foreground">15 listings need attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}