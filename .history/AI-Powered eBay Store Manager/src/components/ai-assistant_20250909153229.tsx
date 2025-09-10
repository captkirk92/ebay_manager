import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Package,
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  BarChart3,
  Target,
  Zap,
  Settings,
  Workflow,
} from "lucide-react";
import { useEbayData } from "../hooks/useEbayData";
import { WorkflowManager } from "./workflow-manager";

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: Date;
  category?: "suggestion" | "alert" | "insight";
}

interface AIAssistantProps {
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function AIAssistant({
  isExpanded = false,
  onToggle,
}: AIAssistantProps) {
  const {
    storeSummary,
    orders,
    listings,
    analytics,
    health,
    isLoading,
    error,
  } = useEbayData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasAnalyzedData, setHasAnalyzedData] = useState(false);
  const [showWorkflowManager, setShowWorkflowManager] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Analyze real store data and generate insights
  useEffect(() => {
    if (
      !isLoading &&
      !hasAnalyzedData &&
      (storeSummary || listings || analytics || health)
    ) {
      generateIntelligentInsights();
      setHasAnalyzedData(true);
    }
  }, [isLoading, storeSummary, listings, analytics, health, hasAnalyzedData]);

  const generateIntelligentInsights = () => {
    const insights: Message[] = [];
    const now = new Date();

    // Welcome message with store overview
    insights.push({
      id: "welcome",
      type: "ai",
      content: `👋 Hello! I'm your AI Co-Manager for **${
        storeSummary?.store_name || "midnight sun printing"
      }**. I've analyzed your live store data and found several opportunities to improve your performance.`,
      timestamp: new Date(now.getTime() - 300000),
      category: "insight",
    });

    // Analyze listings performance
    if (listings && Array.isArray(listings)) {
      const totalListings = listings.length;
      const activeListings = listings.filter(
        (l) => parseInt(l.quantity) > 0
      ).length;

      if (totalListings > 0) {
        if (activeListings < totalListings) {
          insights.push({
            id: "inventory-alert",
            type: "ai",
            content: `⚠️ **Inventory Alert**: ${
              totalListings - activeListings
            } of your ${totalListings} listings are out of stock. Restocking these could increase your visibility and sales potential.`,
            timestamp: new Date(now.getTime() - 240000),
            category: "alert",
          });
        }

        // Analyze listing titles for optimization
        const hasVariations = listings.filter((l) => l.hasVariations).length;
        if (hasVariations > 0) {
          insights.push({
            id: "variation-insight",
            type: "ai",
            content: `💡 **Optimization Opportunity**: ${hasVariations} of your listings use variations. This is excellent for SEO! Consider adding more variation options to your other products to capture more search traffic.`,
            timestamp: new Date(now.getTime() - 180000),
            category: "suggestion",
          });
        }
      }
    }

    // Analyze sales performance from analytics
    if (analytics) {
      const totalRevenue = analytics.total_revenue || 0;
      const totalOrders = analytics.total_orders || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      if (totalRevenue > 0) {
        insights.push({
          id: "performance-insight",
          type: "ai",
          content: `📊 **Performance Analysis**: You've generated $${totalRevenue.toFixed(
            2
          )} from ${totalOrders} orders (AOV: $${avgOrderValue.toFixed(2)}). ${
            avgOrderValue > 25
              ? "Your AOV is strong!"
              : "Consider bundling products to increase average order value."
          }`,
          timestamp: new Date(now.getTime() - 120000),
          category: "insight",
        });

        if (avgOrderValue < 30) {
          insights.push({
            id: "aov-suggestion",
            type: "ai",
            content: `💰 **Revenue Opportunity**: Your average order value is $${avgOrderValue.toFixed(
              2
            )}. By creating product bundles or offering quantity discounts, you could potentially increase this by 20-40%, adding $${(
              totalRevenue * 0.3
            ).toFixed(2)}+ in additional revenue.`,
            timestamp: new Date(now.getTime() - 60000),
            category: "suggestion",
          });
        }
      } else {
        insights.push({
          id: "sales-opportunity",
          type: "ai",
          content: `🚀 **Growth Opportunity**: I see you have active listings but no recent sales data. Let me help you optimize your listings for better visibility and conversion. Would you like me to analyze your titles and suggest improvements?`,
          timestamp: new Date(now.getTime() - 60000),
          category: "suggestion",
        });
      }
    }

    // Health monitoring insights
    if (health && health.analysis) {
      const healthScore = health.health_score;
      const healthStatus = health.analysis.overall_health;

      // Health score message
      const healthEmoji =
        healthScore >= 90
          ? "🟢"
          : healthScore >= 80
          ? "🟡"
          : healthScore >= 70
          ? "🟠"
          : "🔴";
      insights.push({
        id: "health-score",
        type: "ai",
        content: `${healthEmoji} **Store Health Score: ${healthScore}/100** (${healthStatus})\n\n${
          health.analysis.strengths.length > 0
            ? `**Strengths:**\n${health.analysis.strengths
                .map((s) => `• ${s}`)
                .join("\n")}\n\n`
            : ""
        }${
          health.analysis.concerns.length > 0
            ? `**Areas for Improvement:**\n${health.analysis.concerns
                .map((c) => `• ${c}`)
                .join("\n")}\n\n`
            : ""
        }**Today's Action Items:**\n${health.analysis.action_items
          .slice(0, 3)
          .map((item, i) => `${i + 1}. ${item}`)
          .join("\n")}`,
        timestamp: new Date(now.getTime() - 30000),
        category: healthScore >= 80 ? "insight" : "alert",
      });
    }

    // Add actionable recommendations
    insights.push({
      id: "action-plan",
      type: "ai",
      content: `🎯 **Action Plan**: I've identified 3 key areas for improvement: 1) Inventory management 2) SEO optimization 3) Revenue enhancement. Click the quick actions below to get started, or ask me specific questions about your store performance.`,
      timestamp: now,
      category: "suggestion",
    });

    setMessages(insights);
  };

  const quickActions = [
    { text: "Store health", icon: BarChart3, color: "text-red-400" },
    { text: "Workflow setup", icon: Workflow, color: "text-orange-400" },
    { text: "Analyze inventory", icon: Package, color: "text-blue-400" },
    { text: "Optimize listings", icon: Target, color: "text-green-400" },
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: getAIResponse(inputValue),
        timestamp: new Date(),
        category: "insight",
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    const totalListings = listings?.length || 0;
    const totalRevenue = analytics?.total_revenue || 0;
    const totalOrders = analytics?.total_orders || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    if (input.includes("inventory") || input.includes("analyze inventory")) {
      const outOfStock =
        listings?.filter((l) => parseInt(l.quantity) === 0).length || 0;
      const lowStock =
        listings?.filter((l) => {
          const qty = parseInt(l.quantity);
          return qty > 0 && qty <= 5;
        }).length || 0;

      return `📦 **Live Inventory Analysis**: Out of ${totalListings} listings:\n• ${outOfStock} items are out of stock\n• ${lowStock} items have low stock (≤5 units)\n• ${
        totalListings - outOfStock - lowStock
      } items have healthy stock levels\n\n${
        outOfStock > 0
          ? `⚠️ Priority: Restock ${outOfStock} out-of-stock items to maintain visibility.`
          : "✅ No critical stock issues detected."
      }`;
    }

    if (
      input.includes("optimize") ||
      input.includes("listings") ||
      input.includes("seo")
    ) {
      const withVariations =
        listings?.filter((l) => l.hasVariations).length || 0;
      const customStickers =
        listings?.filter((l) => l.title.toLowerCase().includes("custom"))
          .length || 0;

      return `🎯 **Live SEO Analysis**:\n• ${withVariations}/${totalListings} listings use variations (excellent for SEO!)\n• ${customStickers} listings focus on custom products\n\n💡 **Recommendations**:\n1. Add more size/color variations to capture long-tail keywords\n2. Include trending terms: "waterproof", "premium vinyl", "bulk orders"\n3. Optimize for mobile with shorter, punchier titles\n\nEstimated impact: 15-25% increase in organic visibility.`;
    }

    if (
      input.includes("revenue") ||
      input.includes("insights") ||
      input.includes("growth")
    ) {
      if (totalRevenue > 0) {
        const projectedGrowth = totalRevenue * 0.4;
        return `💰 **Live Revenue Analysis** ($${totalRevenue.toFixed(
          2
        )} current):\n\n📊 **Current Performance**:\n• ${totalOrders} orders completed\n• $${avgOrderValue.toFixed(
          2
        )} average order value\n• $${(totalRevenue / totalListings).toFixed(
          2
        )} revenue per listing\n\n🚀 **Growth Opportunities**:\n1. Bundle products → +$${(
          projectedGrowth * 0.3
        ).toFixed(2)} potential\n2. Upsell variations → +$${(
          projectedGrowth * 0.4
        ).toFixed(2)} potential\n3. Seasonal promotions → +$${(
          projectedGrowth * 0.3
        ).toFixed(
          2
        )} potential\n\n**Total Growth Potential: +$${projectedGrowth.toFixed(
          2
        )}**`;
      } else {
        return `🚀 **Growth Strategy**: Your store has ${totalListings} active listings. Focus on:\n\n1. **SEO Optimization**: Improve search rankings\n2. **Competitive Pricing**: Research competitor prices  \n3. **Enhanced Images**: Add lifestyle photos\n4. **Promotions**: Launch "New Store" discount\n\nPriority: Start with SEO improvements for immediate visibility boost.`;
      }
    }

    if (input.includes("strategy") || input.includes("strategies")) {
      return `🎯 **Personalized Growth Strategies** for ${storeSummary?.store_name}:\n\n**Short-term (1-2 weeks)**:\n• Optimize your top 5 performing listings\n• Add "Fast Shipping" to all titles\n• Create 2-3 product bundles\n\n**Medium-term (1 month)**:\n• Launch seasonal promotion campaigns\n• Expand variation options\n• Implement customer follow-up sequences\n\n**Long-term (3 months)**:\n• Develop exclusive product lines\n• Build customer loyalty program\n• Explore international markets\n\nWhich timeframe interests you most?`;
    }

    if (
      input.includes("health") ||
      input.includes("performance") ||
      input.includes("score")
    ) {
      if (health && health.analysis) {
        const healthScore = health.health_score;
        const healthStatus = health.analysis.overall_health;
        const healthEmoji =
          healthScore >= 90
            ? "🟢"
            : healthScore >= 80
            ? "🟡"
            : healthScore >= 70
            ? "🟠"
            : "🔴";

        return `${healthEmoji} **Store Health Analysis** (Score: ${healthScore}/100)\n\n**Overall Status:** ${healthStatus}\n\n**Key Strengths:**\n${health.analysis.strengths
          .map((s) => `• ${s}`)
          .join(
            "\n"
          )}\n\n**Areas Needing Attention:**\n${health.analysis.concerns
          .map((c) => `• ${c}`)
          .join(
            "\n"
          )}\n\n**Priority Actions for Today:**\n${health.analysis.action_items
          .slice(0, 3)
          .map((item, i) => `${i + 1}. ${item}`)
          .join("\n")}\n\n${
          healthScore < 80
            ? "⚠️ Your store health needs immediate attention. Focus on the action items above to improve your score."
            : "✅ Your store is performing well! Keep monitoring these metrics to maintain your high score."
        }`;
      } else {
        return `🏥 **Store Health Monitoring**: I'm analyzing your store's performance metrics including seller standards, order defects, shipping times, and customer satisfaction. This data helps me provide specific recommendations to improve your store's health score.\n\nWould you like me to run a fresh health analysis?`;
      }
    }

    return `🤖 Analyzing **${
      storeSummary?.store_name || "your store"
    }** with ${totalListings} listings and $${totalRevenue.toFixed(
      2
    )} revenue. I can help with:\n\n• **Inventory management** - Stock optimization\n• **Listing optimization** - SEO & conversions  \n• **Revenue growth** - Pricing & bundling\n• **Performance analysis** - Data-driven insights\n\nWhat specific area interests you most?`;
  };

  const handleQuickAction = (action: string) => {
    if (action === "Workflow setup") {
      setShowWorkflowManager(true);
    } else {
      setInputValue(action);
      handleSendMessage();
    }
  };

  if (!isExpanded) {
    // Floating AI assistant button
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={onToggle}
          className="size-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <Bot className="size-6 text-white" />
        </Button>

        {/* AI status indicator */}
        <div className="absolute -top-2 -right-2">
          <div className="size-4 bg-green-400 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 size-4 bg-green-400 rounded-full animate-ping"></div>
        </div>

        {/* Notification badge */}
        <Badge
          variant="destructive"
          className="absolute -top-1 -left-1 px-1 min-w-5 h-5 text-xs"
        >
          3
        </Badge>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] z-50 shadow-2xl border-2 border-blue-600/20 bg-card/95 backdrop-blur">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Bot className="size-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm text-card-foreground">
                AI Co-Manager
              </CardTitle>
              <div className="flex items-center gap-1">
                <div className="size-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-muted-foreground">
                  Online & analyzing
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="text-muted-foreground hover:text-foreground"
            >
              <Minimize2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-muted/80 text-foreground border border-border"
                  }`}
                >
                  {message.type === "ai" && message.category && (
                    <div className="flex items-center gap-1 mb-2">
                      <Sparkles className="size-3 text-blue-400" />
                      <span className="text-xs font-medium text-blue-400 uppercase tracking-wide">
                        {message.category}
                      </span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-line">
                    {message.content}
                  </div>
                  <div
                    className={`text-xs opacity-70 mt-1 ${
                      message.type === "user"
                        ? "text-blue-100"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted/80 rounded-lg p-3 border border-border">
                  <div className="flex items-center gap-1">
                    <div className="size-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="size-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="size-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions */}
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">
            Quick Actions:
          </div>
          <div className="flex flex-wrap gap-1">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6 px-2 border-border hover:bg-muted"
                  onClick={() => handleQuickAction(action.text)}
                >
                  <IconComponent className={`size-3 mr-1 ${action.color}`} />
                  {action.text}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about your store..."
              className="flex-1 text-sm bg-background border-border"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
