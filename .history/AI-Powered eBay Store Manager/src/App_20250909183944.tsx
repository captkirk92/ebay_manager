import { useState, useEffect } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { DashboardOverview } from './components/dashboard-overview';
import { OrderManagement } from './components/order-management';
import { CustomerService } from './components/customer-service';
import { ListingsOptimization } from './components/listings-optimization';
import { ListingsGallery } from './components/listings-gallery';
import { AnalyticsDashboard } from './components/analytics-dashboard';
import { AIAssistant } from './components/ai-assistant';
import { 
  LayoutDashboard, 
  Package, 
  MessageSquare, 
  Search, 
  BarChart3, 
  Shield, 
  Bot,
  AlertTriangle,
  Bell,
  HelpCircle,
  Settings,
  Send,
  FileText,
  Archive,
  Trash2,
  Star,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isAIAssistantExpanded, setIsAIAssistantExpanded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      // Default to dark mode or system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: Package, badge: '23' },
    { id: 'customer-service', label: 'Messages', icon: MessageSquare, badge: '7' },
    { id: 'listings', label: 'Listings', icon: Search, badge: '15' },
    { id: 'gallery', label: 'Gallery', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const groupItems = [
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'drafts', label: 'Draft', icon: FileText, badge: '3' },
    { id: 'important', label: 'Important', icon: Star, badge: '6' },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'trash', label: 'Trash', icon: Trash2 }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'orders':
        return <OrderManagement />;
      case 'customer-service':
        return <CustomerService />;
      case 'listings':
        return <ListingsOptimization />;
      case 'gallery':
        return <ListingsGallery />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background">
          <Sidebar className="border-r border-sidebar-border">
            <SidebarHeader className="border-b border-sidebar-border p-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
                  <Bot className="size-4" />
                </div>
                <div>
                  <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>eBay Co-Manager</h2>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-muted-foreground">AI Store Rescue</p>
                    <div className="size-1 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent className="p-4">
              <SidebarMenu>
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        onClick={() => setActiveView(item.id)}
                        isActive={activeView === item.id}
                        className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent rounded-lg p-3 mb-1"
                      >
                        <IconComponent className="size-4" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto text-xs bg-red-600 text-white border-0">
                            {item.badge}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>

              <div className="mt-8">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-3">
                  GROUP
                </div>
                <SidebarMenu>
                  {groupItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton 
                          onClick={() => setActiveView(item.id)}
                          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent rounded-lg p-3 mb-1"
                        >
                          <IconComponent className="size-4" />
                          <span>{item.label}</span>
                          {item.badge && (
                            <Badge variant="outline" className="ml-auto text-xs border-muted-foreground/30 text-muted-foreground">
                              {item.badge}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </div>

              <div className="mt-8 p-4">
                <Card className={`${isDarkMode ? 'bg-orange-600/10 border-orange-600/20' : 'bg-orange-50 border-orange-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`size-4 ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-orange-300' : 'text-orange-700'}`}>Store Health</span>
                    </div>
                    <div className={`text-lg font-bold ${isDarkMode ? 'text-orange-200' : 'text-orange-800'}`}>72/100</div>
                    <p className={`text-xs ${isDarkMode ? 'text-orange-300/80' : 'text-orange-600'} mb-3`}>3 critical issues need attention</p>
                    <div className={`w-full ${isDarkMode ? 'bg-orange-900/30' : 'bg-orange-200'} rounded-full h-1.5`}>
                      <div 
                        className="bg-orange-500 h-1.5 rounded-full" 
                        style={{ width: '72%' }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Assistant Quick Access */}
              <div className="mt-4 p-4">
                <Button 
                  onClick={() => setIsAIAssistantExpanded(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Sparkles className="size-4 mr-2" />
                  Chat with AI Co-Manager
                </Button>
              </div>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 flex flex-col">
            <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-foreground" />
                <div>
                  <h1 className="text-xl font-semibold text-foreground capitalize">
                    {activeView === 'customer-service' ? 'Messages' : 
                     activeView === 'listings' ? 'Listings' : 
                     activeView}
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* AI Status Indicator */}
                <div className={`flex items-center gap-2 px-3 py-1 ${isDarkMode ? 'bg-green-600/10 border-green-600/20' : 'bg-green-50 border-green-200'} border rounded-full`}>
                  <div className="size-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>AI Active</span>
                </div>

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isDarkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </Button>
                
                <Button variant="ghost" size="sm" className="text-muted-foreground relative">
                  <Bell className="size-4" />
                  <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 min-w-4 h-4 text-xs">
                    3
                  </Badge>
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <HelpCircle className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
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