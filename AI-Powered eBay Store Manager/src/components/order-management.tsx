import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Clock, Package, Truck, AlertCircle, Loader2 } from "lucide-react";
import { useEbayData } from "../hooks/useEbayData";
import { useMemo } from "react";

export function OrderManagement() {
  const { orders, isOrdersLoading, ordersError, refreshOrders } = useEbayData();

  // Process real orders data
  const processedOrders = useMemo(() => {
    if (!orders?.OrderArray) return [];
    
    return orders.OrderArray.map((order, index) => {
      // Calculate priority based on order status and creation time
      const createdDate = new Date(order.CreatedTime);
      const now = new Date();
      const hoursSinceCreated = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
      
      let priority = "normal";
      if (order.OrderStatus === "Pending" && hoursSinceCreated > 24) {
        priority = "urgent";
      } else if (order.OrderStatus === "Pending" && hoursSinceCreated > 12) {
        priority = "high";
      }

      // Get the first transaction item for display
      const firstTransaction = order.TransactionArray?.[0];
      const itemTitle = firstTransaction?.Item?.Title || "Order Item";

      // Calculate time left for shipping
      let timeLeft = "N/A";
      let shippingDeadline = "N/A";
      if (order.OrderStatus === "Pending") {
        const deadlineHours = 48 - hoursSinceCreated;
        if (deadlineHours > 0) {
          timeLeft = deadlineHours > 24 ? `${Math.ceil(deadlineHours / 24)} days` : `${Math.ceil(deadlineHours)} hours`;
          const deadline = new Date(createdDate.getTime() + (48 * 60 * 60 * 1000));
          shippingDeadline = deadline.toLocaleDateString() + " " + deadline.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        } else {
          timeLeft = "Overdue";
          shippingDeadline = "Past due";
        }
      } else if (order.OrderStatus === "Completed") {
        timeLeft = "Completed";
        shippingDeadline = "Delivered";
      }

      return {
        id: order.OrderID,
        buyer: order.BuyerUserID || "Unknown",
        item: itemTitle.length > 50 ? itemTitle.substring(0, 50) + "..." : itemTitle,
        amount: order.Total || "$0.00",
        status: order.OrderStatus || "Unknown",
        priority,
        timeLeft,
        shippingDeadline,
        createdTime: order.CreatedTime
      };
    });
  }, [orders]);

  // Calculate order statistics from real data
  const orderStats = useMemo(() => {
    if (!processedOrders.length) {
      return [
        { title: "Urgent Orders", count: 0, icon: AlertCircle, color: "text-red-600", description: "Need immediate attention" },
        { title: "Ready to Ship", count: 0, icon: Package, color: "text-blue-600", description: "Prepared and ready" },
        { title: "In Transit", count: 0, icon: Truck, color: "text-green-600", description: "Currently shipping" },
        { title: "Late Risk", count: 0, icon: Clock, color: "text-orange-600", description: "May miss deadline" }
      ];
    }

    const urgentCount = processedOrders.filter(order => order.priority === "urgent").length;
    const readyToShipCount = processedOrders.filter(order => order.status === "Pending").length;
    const inTransitCount = processedOrders.filter(order => order.status === "Shipped").length;
    const lateRiskCount = processedOrders.filter(order => order.timeLeft === "Overdue").length;

    return [
      { title: "Urgent Orders", count: urgentCount, icon: AlertCircle, color: "text-red-600", description: "Need immediate attention" },
      { title: "Ready to Ship", count: readyToShipCount, icon: Package, color: "text-blue-600", description: "Prepared and ready" },
      { title: "In Transit", count: inTransitCount, icon: Truck, color: "text-green-600", description: "Currently shipping" },
      { title: "Late Risk", count: lateRiskCount, icon: Clock, color: "text-orange-600", description: "May miss deadline" }
    ];
  }, [processedOrders]);

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

  // Show loading state
  if (isOrdersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading orders...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (ordersError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Orders</h3>
            <p className="text-muted-foreground mb-4">{ordersError}</p>
            <Button onClick={() => refreshOrders()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                  {processedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    processedOrders.map((order) => (
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
                            {order.status === "Pending" && (
                              <Button size="sm" className="text-xs">
                                Print Label
                              </Button>
                            )}
                            {order.status === "Active" && (
                              <Button size="sm" variant="outline" className="text-xs">
                                Update Status
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="urgent">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedOrders.filter(order => order.priority === "urgent").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No urgent orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    processedOrders.filter(order => order.priority === "urgent").map((order) => (
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
                          <div className="text-sm">
                            <div className="font-medium">{order.timeLeft}</div>
                            <div className="text-muted-foreground">{order.shippingDeadline}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" className="text-xs">
                            Print Label
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="processing">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedOrders.filter(order => order.status === "Active" || order.status === "Pending").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No orders currently being processed
                      </TableCell>
                    </TableRow>
                  ) : (
                    processedOrders.filter(order => order.status === "Active" || order.status === "Pending").map((order) => (
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
                          <Button size="sm" variant="outline" className="text-xs">
                            Update Status
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            
            <TabsContent value="shipped">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Shipped Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedOrders.filter(order => order.status === "Shipped" || order.status === "Completed").length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No shipped orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    processedOrders.filter(order => order.status === "Shipped" || order.status === "Completed").map((order) => (
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
                          {order.createdTime ? new Date(order.createdTime).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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