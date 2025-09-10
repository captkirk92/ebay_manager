import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { EnhancedSidebar } from "./components/navigation/EnhancedSidebar";
import {
  Bell,
  HelpCircle,
  Settings,
  Sun,
  Moon,
} from "lucide-react";

export default function DemoApp() {
  const [activeView, setActiveView] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userRole] = useState("admin");

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
    } else {
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
    return (
      <div className="space-y-6">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">
            Enhanced Sidebar Demo
          </h2>
          <p className="text-muted-foreground mb-4">
            This demo showcases the new enhanced sidebar for the eBay AI Co-Manager dashboard.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">✅ Key Features Implemented:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Hierarchical menu structure with groups</li>
                <li>• Expandable/collapsible nested menus</li>
                <li>• Dynamic configuration system</li>
                <li>• Role-based access control</li>
                <li>• Badge notifications</li>
                <li>• Active state highlighting</li>
                <li>• Dark/light mode support</li>
                <li>• Responsive design</li>
                <li>• Modern UI with smooth animations</li>
                <li>• Accessibility support</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">📁 Menu Structure:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Dashboard</li>
                <li>• Orders Management (expandable)</li>
                <li>• Messages & Support (expandable)</li>
                <li>• Listings & Inventory (expandable)</li>
                <li>• Financials (expandable)</li>
                <li>• Analytics & Reports (expandable)</li>
                <li>• Feedback & Reviews (expandable)</li>
                <li>• Store Health (expandable)</li>
                <li>• AI Tools</li>
                <li>• Settings</li>
                <li>• Quick Actions</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-3 text-foreground">Current View: {getViewTitle(activeView)}</h3>
          <p className="text-muted-foreground">
            Click on any menu item in the sidebar to see the navigation in action. 
            Try expanding the "Orders", "Messages", or other expandable menu sections 
            to see the nested navigation structure.
          </p>
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Active View ID:</strong> <code className="bg-background px-2 py-1 rounded">{activeView}</code>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              <strong>User Role:</strong> <code className="bg-background px-2 py-1 rounded">{userRole}</code>
            </p>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-3 text-foreground">Technical Implementation</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">Components:</h4>
              <ul className="space-y-1">
                <li>• EnhancedSidebar.tsx - Main sidebar component</li>
                <li>• menu-config.ts - Dynamic configuration</li>
                <li>• menu.ts - Type definitions</li>
                <li>• Shadcn/UI components for styling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Features:</h4>
              <ul className="space-y-1">
                <li>• React state management</li>
                <li>• TypeScript for type safety</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Lucide React icons</li>
                <li>• Accessibility compliance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
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
            onAIAssistantToggle={() => console.log("AI Assistant toggled")}
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
        </div>
      </SidebarProvider>
    </div>
  );
}