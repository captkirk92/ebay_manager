import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { MessageSquare, Clock, Star, AlertCircle, Send } from "lucide-react";
import { useState } from "react";

export function CustomerService() {
  const [replyText, setReplyText] = useState("");
  
  const messages = [
    {
      id: 1,
      buyer: "john_electronics",
      subject: "Question about iPhone condition",
      preview: "Hi, I wanted to ask about the battery health of the iPhone...",
      priority: "high",
      status: "unread",
      timeAgo: "2 hours ago",
      orderId: "eBay-001-23847",
      fullMessage: "Hi, I wanted to ask about the battery health of the iPhone you have listed. Can you provide the battery percentage and any other details about the device condition? Also, do you offer returns if there are any issues?",
      suggestedReply: "Thank you for your interest! The iPhone has 89% battery health and is in excellent condition with minor wear on the corners. Yes, we offer 30-day returns for any issues. Would you like additional photos of the device?"
    },
    {
      id: 2,
      buyer: "collector_vintage",
      subject: "Shipping question for Jordan shoes",
      preview: "When will you ship the Air Jordans? I need them by Friday...",
      priority: "urgent",
      status: "unread",
      timeAgo: "45 minutes ago",
      orderId: "eBay-002-23848",
      fullMessage: "When will you ship the Air Jordans? I need them by Friday for a gift. Can you expedite shipping? I'm willing to pay extra for faster delivery.",
      suggestedReply: "Hi! I can ship your Air Jordans today via Priority Express for Friday delivery. The additional cost would be $25. Please let me know if you'd like me to upgrade your shipping method."
    },
    {
      id: 3,
      buyer: "tech_buyer_99",
      subject: "Item not as described",
      preview: "The laptop I received doesn't match the description...",
      priority: "urgent",
      status: "dispute",
      timeAgo: "6 hours ago",
      orderId: "eBay-003-23849",
      fullMessage: "The laptop I received doesn't match the description. The RAM is 16GB not 32GB as listed. I want to return this item and get a full refund. This is very disappointing.",
      suggestedReply: "I sincerely apologize for this error. You're absolutely right, and I take full responsibility. I'll immediately send you a prepaid return label and process a full refund once I receive the item. I'm also including a $50 credit for your inconvenience."
    }
  ];

  const serviceStats = [
    {
      title: "Pending Messages",
      count: 7,
      icon: MessageSquare,
      color: "text-blue-600",
      change: "+2 from yesterday"
    },
    {
      title: "Avg Response Time",
      count: "2.4h",
      icon: Clock,
      color: "text-orange-600",
      change: "Target: <2h"
    },
    {
      title: "Customer Rating",
      count: "4.7",
      icon: Star,
      color: "text-yellow-600",
      change: "+0.1 this month"
    },
    {
      title: "Active Disputes",
      count: 1,
      icon: AlertCircle,
      color: "text-red-600",
      change: "Needs attention"
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
      case 'unread': return 'bg-blue-100 text-blue-800';
      case 'replied': return 'bg-green-100 text-green-800';
      case 'dispute': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {serviceStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <IconComponent className={`size-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{stat.count}</p>
                    <p className="text-sm font-medium">{stat.title}</p>
                    <p className="text-xs text-muted-foreground">{stat.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Messages Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customer Messages</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-sm">{message.buyer}</div>
                    <Badge variant={getPriorityColor(message.priority)} className="text-xs">
                      {message.priority}
                    </Badge>
                  </div>
                  <div className="font-medium text-sm mb-1">{message.subject}</div>
                  <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {message.preview}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                      {message.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{message.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message Detail & Reply */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Message from {messages[0].buyer}</CardTitle>
                <p className="text-sm text-muted-foreground">Order: {messages[0].orderId}</p>
              </div>
              <Badge variant={getPriorityColor(messages[0].priority)}>
                {messages[0].priority} priority
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Original Message */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="font-medium text-sm mb-2">{messages[0].subject}</div>
              <p className="text-sm">{messages[0].fullMessage}</p>
              <p className="text-xs text-muted-foreground mt-2">{messages[0].timeAgo}</p>
            </div>

            {/* AI Suggested Reply */}
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-sm">AI Suggested Reply</span>
              </div>
              <p className="text-sm mb-3">{messages[0].suggestedReply}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReplyText(messages[0].suggestedReply)}
              >
                Use This Reply
              </Button>
            </div>

            {/* Reply Form */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Your Reply</label>
              <Textarea
                placeholder="Type your message here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
              />
              <div className="flex items-center gap-2">
                <Button className="flex items-center gap-2">
                  <Send className="size-4" />
                  Send Reply
                </Button>
                <Button variant="outline">
                  Save Draft
                </Button>
                <Button variant="outline">
                  Mark as Resolved
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Service Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates">
            <TabsList>
              <TabsTrigger value="templates">Message Templates</TabsTrigger>
              <TabsTrigger value="automation">Auto-Responses</TabsTrigger>
              <TabsTrigger value="analytics">Response Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="space-y-3 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start h-auto p-3">
                  <div className="text-left">
                    <div className="font-medium">Shipping Delay</div>
                    <div className="text-xs text-muted-foreground">Apologize and provide update</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-3">
                  <div className="text-left">
                    <div className="font-medium">Item Condition</div>
                    <div className="text-xs text-muted-foreground">Detailed condition description</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-3">
                  <div className="text-left">
                    <div className="font-medium">Return Process</div>
                    <div className="text-xs text-muted-foreground">Step-by-step return instructions</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-3">
                  <div className="text-left">
                    <div className="font-medium">Thank You</div>
                    <div className="text-xs text-muted-foreground">Post-purchase appreciation</div>
                  </div>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="automation">
              <div className="text-center py-8 text-muted-foreground">
                Auto-response configuration will appear here.
              </div>
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="text-center py-8 text-muted-foreground">
                Response time analytics and customer satisfaction metrics will appear here.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}