import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Clock, Package, Truck, AlertCircle } from "lucide-react";

export function OrderManagement() {
  const orders = [
    {
      id: "eBay-001-23847",
      buyer: "john_doe_2024",
      item: "Vintage Nike Air Jordan 1985 Sz 10",
      amount: "$450.00",
      status: "Payment Received",
      priority: "urgent",
      timeLeft: "18 hours",
      shippingDeadline: "Tomorrow 5 PM"
    },
    {
      id: "eBay-002-23848",
      buyer: "collector_mike",
      item: "iPhone 15 Pro Max 256GB Blue",
      amount: "$1,200.00",
      status: "Processing",
      priority: "high",
      timeLeft: "2 days",
      shippingDeadline: "Jan 12, 5 PM"
    },
    {
      id: "eBay-003-23849",
      buyer: "tech_enthusiast",
      item: "Gaming Laptop RTX 4080 32GB",
      amount: "$2,800.00",
      status: "Shipped",
      priority: "normal",
      timeLeft: "Completed",
      shippingDeadline: "Delivered"
    },
    {
      id: "eBay-004-23850",
      buyer: "fashion_buyer",
      item: "Designer Handbag Authentic",
      amount: "$680.00",
      status: "Payment Received",
      priority: "urgent",
      timeLeft: "12 hours",
      shippingDeadline: "Today 5 PM"
    }
  ];

  const orderStats = [
    {
      title: "Urgent Orders",
      count: 5,
      icon: AlertCircle,
      color: "text-red-600",
      description: "Need immediate attention"
    },
    {
      title: "Ready to Ship",
      count: 18,
      icon: Package,
      color: "text-blue-600",
      description: "Prepared and ready"
    },
    {
      title: "In Transit",
      count: 32,
      icon: Truck,
      color: "text-green-600",
      description: "Currently shipping"
    },
    {
      title: "Late Risk",
      count: 3,
      icon: Clock,
      color: "text-orange-600",
      description: "May miss deadline"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Shipped': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Payment Received': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {orderStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <IconComponent className={`size-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.count}</p>
                    <p className="text-sm font-medium">{stat.title}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="urgent">Urgent</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.buyer}</TableCell>
                      <TableCell className="max-w-xs truncate">{order.item}</TableCell>
                      <TableCell className="font-bold">{order.amount}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(order.priority)}>
                          {order.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{order.timeLeft}</div>
                          <div className="text-muted-foreground">{order.shippingDeadline}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {order.status === "Payment Received" && (
                            <Button size="sm" className="text-xs">
                              Print Label
                            </Button>
                          )}
                          {order.status === "Processing" && (
                            <Button size="sm" variant="outline" className="text-xs">
                              Update Status
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="urgent">
              <div className="text-center py-8 text-muted-foreground">
                Urgent orders that need immediate attention will appear here.
              </div>
            </TabsContent>
            
            <TabsContent value="processing">
              <div className="text-center py-8 text-muted-foreground">
                Orders currently being processed will appear here.
              </div>
            </TabsContent>
            
            <TabsContent value="shipped">
              <div className="text-center py-8 text-muted-foreground">
                Shipped orders and tracking information will appear here.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">
              <Package className="size-4 mr-2" />
              Bulk Print Labels
            </Button>
            <Button variant="outline">
              <Truck className="size-4 mr-2" />
              Mark Multiple as Shipped
            </Button>
            <Button variant="outline">
              <Clock className="size-4 mr-2" />
              Send Tracking Updates
            </Button>
            <Button variant="outline">
              Update Handling Time
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}