import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { DashboardOverview } from "./components/dashboard-overview";
import { OrderManagement } from "./components/order-management";
import { CustomerService } from "./components/customer-service";
import { ListingsOptimization } from "./components/listings-optimization";
import { ListingsGallery } from "./components/listings-gallery";
import { AnalyticsDashboard } from "./components/analytics-dashboard";
import { AIAssistant } from "./components/ai-assistant";
import { EnhancedSidebar } from "./components/navigation/EnhancedSidebar";
import MaterialDashboard from "./components/MaterialDashboard";
import EnhancedMaterialDashboard from "./components/EnhancedMaterialDashboard";
import {
  Bell,
  HelpCircle,
  Settings,
  Sun,
  Moon,
} from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState("material-dashboard");
  const [isAIAssistantExpanded, setIsAIAssistantExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userRole] = useState("admin"); // This could come from auth context

  // If Material Dashboard is active, render it completely independently
  if (activeView === "material-dashboard") {
    return (
      <div className={isDarkMode ? "dark" : ""}>
        <MaterialDashboard />
      </div>
    );
  }

  // If Enhanced Material Dashboard is active
  if (activeView === "enhanced-dashboard") {
    return (
      <div className={isDarkMode ? "dark" : ""}>
        <EnhancedMaterialDashboard />
      </div>
    );
  }

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
      // Default to dark mode or system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getViewTitle = (viewId: string) => {
    switch (viewId) {
      case "customer-service":
        return "Messages";
      case "listings":
        return "Listings";
      case "gallery":
        return "Photo Gallery";
      case "active-orders":
        return "Active Orders";
      case "completed-orders":
        return "Completed Orders";
      case "cancelled-orders":
        return "Cancelled Orders";
      case "returns":
        return "Returns & Refunds";
      case "inbox":
        return "Inbox";
      case "sent":
        return "Sent Messages";
      case "drafts":
        return "Draft Messages";
      case "templates":
        return "Message Templates";
      default:
        return viewId.charAt(0).toUpperCase() + viewId.slice(1);
    }
  };

  const renderContent = () => {
    // Handle Material Dashboard as primary view - render it independently
    if (activeView === "material-dashboard") {
      return (
        <div className="w-full h-full">
          <MaterialDashboard />
        </div>
      );
    }
    
    // Handle nested routes first
    if (activeView.startsWith("orders") || 
        activeView === "active-orders" || 
        activeView === "completed-orders" || 
        activeView === "cancelled-orders" || 
        activeView === "returns") {
      return <OrderManagement />;
    }
    
    if (activeView.startsWith("messages") || 
        activeView === "inbox" || 
        activeView === "sent" || 
        activeView === "drafts" || 
        activeView === "templates" ||
        activeView === "customer-service") {
      return <CustomerService />;
    }
    
    if (activeView.startsWith("listings") || 
        activeView === "active-listings" || 
        activeView === "draft-listings" || 
        activeView === "ended-listings" ||
        activeView === "optimization") {
      return <ListingsOptimization />;
    }

    switch (activeView) {
      case "orders":
        return <OrderManagement />;
      case "customer-service":
        return <CustomerService />;
      case "listings":
        return <ListingsOptimization />;
      case "gallery":
        return <ListingsGallery />;
      case "analytics":
      case "sales-analytics":
      case "customer-analytics":
      case "product-performance":
        return <AnalyticsDashboard />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background">
          <EnhancedSidebar
            activeView={activeView}
            onViewChange={setActiveView}
            isDarkMode={isDarkMode}
            userRole={userRole}
            onAIAssistantToggle={() => setIsAIAssistantExpanded(true)}
          />

          <main className="flex-1 flex flex-col">
            <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-foreground" />
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    {getViewTitle(activeView)}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* AI Status Indicator */}
                <div
                  className={`flex items-center gap-2 px-3 py-1 transition-colors rounded-full border ${
                    isDarkMode
                      ? "bg-green-600/10 border-green-600/20"
                      : "bg-green-50 border-green-200"
                  }`}
                >
                  <div className="size-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span
                    className={`text-xs transition-colors ${
                      isDarkMode ? "text-green-400" : "text-green-600"
                    }`}
                  >
                    AI Active
                  </span>
                </div>

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isDarkMode ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground relative"
                >
                  <Bell className="size-4" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 px-1 min-w-4 h-4 text-xs"
                  >
                    3
                  </Badge>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <HelpCircle className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <Settings className="size-4" />
                </Button>
              </div>
            </header>

            <div className="flex-1 overflow-auto p-6 bg-background">
              {renderContent()}
            </div>
          </main>

          {/* AI Assistant */}
          <AIAssistant
            isExpanded={isAIAssistantExpanded}
            onToggle={() => setIsAIAssistantExpanded(!isAIAssistantExpanded)}
          />
        </div>
      </SidebarProvider>
    </div>
  );
}
