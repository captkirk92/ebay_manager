import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "../ui/sidebar";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import {
  Bot,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { MenuItem, MenuGroup } from "../../types/menu";
import { getVisibleMenuGroups } from "../../config/menu-config";
import { cn } from "../ui/utils";

interface EnhancedSidebarProps {
  activeView: string;
  onViewChange: (viewId: string) => void;
  isDarkMode: boolean;
  userRole?: string;
  onAIAssistantToggle: () => void;
}

export function EnhancedSidebar({
  activeView,
  onViewChange,
  isDarkMode,
  userRole = "admin",
  onAIAssistantToggle,
}: EnhancedSidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const menuConfig = getVisibleMenuGroups(userRole);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (item: MenuItem): boolean => {
    if (item.id === activeView) return true;
    if (item.children) {
      return item.children.some(child => child.id === activeView);
    }
    return false;
  };

  const renderMenuItem = (item: MenuItem, isSubItem = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const itemIsActive = isActive(item);

    if (hasChildren) {
      return (
        <Collapsible
          key={item.id}
          open={isExpanded}
          onOpenChange={() => toggleExpanded(item.id)}
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                isActive={itemIsActive}
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent rounded-lg p-3 mb-1 group transition-all duration-200",
                  itemIsActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                  !isSubItem && "pl-3",
                  isSubItem && "pl-6"
                )}
                tooltip={item.label}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "ml-2 text-xs border-0 transition-colors",
                      itemIsActive
                        ? "bg-background/20 text-sidebar-accent-foreground"
                        : "bg-red-600 text-white"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
                <div className="ml-auto">
                  {isExpanded ? (
                    <ChevronDown className="size-4 transition-transform" />
                  ) : (
                    <ChevronRight className="size-4 transition-transform" />
                  )}
                </div>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1">
              <SidebarMenuSub>
                {item.children?.map(child => (
                  <SidebarMenuSubItem key={child.id}>
                    <SidebarMenuSubButton
                      onClick={() => onViewChange(child.id)}
                      isActive={child.id === activeView}
                      className={cn(
                        "w-full justify-start rounded-md transition-all duration-200 hover:bg-sidebar-accent/70",
                        child.id === activeView && 
                        "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                    >
                      <child.icon className="size-4 shrink-0" />
                      <span className="flex-1">{child.label}</span>
                      {child.badge && (
                        <Badge
                          variant="outline"
                          className="ml-auto text-xs border-muted-foreground/30 text-muted-foreground"
                        >
                          {child.badge}
                        </Badge>
                      )}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    }

    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          onClick={() => onViewChange(item.id)}
          isActive={item.id === activeView}
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent rounded-lg p-3 mb-1 transition-all duration-200",
            item.id === activeView && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
            !isSubItem && "pl-3",
            isSubItem && "pl-6"
          )}
          tooltip={item.label}
        >
          <item.icon className="size-4 shrink-0" />
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <Badge
              variant="secondary"
              className={cn(
                "ml-auto text-xs border-0",
                item.id === activeView
                  ? "bg-background/20 text-sidebar-accent-foreground"
                  : "bg-red-600 text-white"
              )}
            >
              {item.badge}
            </Badge>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderMenuGroup = (group: MenuGroup) => {
    if (group.label === "") {
      // Main group without label
      return (
        <div key={group.id} className="mb-4">
          <SidebarMenu>
            {group.items.map(item => renderMenuItem(item))}
          </SidebarMenu>
        </div>
      );
    }

    return (
      <SidebarGroup key={group.id}>
        <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-3 font-medium">
          {group.label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {group.items.map(item => renderMenuItem(item))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-md">
            <Bot className="size-4" />
          </div>
          <div className="flex-1">
            <h2
              className={`font-semibold transition-colors ${
                isDarkMode ? "text-white" : "text-foreground"
              }`}
            >
              eBay Co-Manager
            </h2>
            <div className="flex items-center gap-1">
              <p className="text-xs text-muted-foreground">AI Store Rescue</p>
              <div className="size-1 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-6">
        {menuConfig.groups.map(group => renderMenuGroup(group))}

        {/* Store Health Card */}
        <div className="mt-8">
          <Card
            className={cn(
              "transition-colors duration-200",
              isDarkMode
                ? "bg-orange-600/10 border-orange-600/20 hover:bg-orange-600/15"
                : "bg-orange-50 border-orange-200 hover:bg-orange-100"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle
                  className={cn(
                    "size-4 transition-colors",
                    isDarkMode ? "text-orange-400" : "text-orange-600"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isDarkMode ? "text-orange-300" : "text-orange-700"
                  )}
                >
                  Store Health Score
                </span>
              </div>
              <div
                className={cn(
                  "text-2xl font-bold transition-colors",
                  isDarkMode ? "text-orange-200" : "text-orange-800"
                )}
              >
                72/100
              </div>
              <p
                className={cn(
                  "text-xs mb-3 transition-colors",
                  isDarkMode ? "text-orange-300/80" : "text-orange-600"
                )}
              >
                3 critical issues need attention
              </p>
              <div
                className={cn(
                  "w-full rounded-full h-2 transition-colors",
                  isDarkMode ? "bg-orange-900/30" : "bg-orange-200"
                )}
              >
                <div
                  className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: "72%" }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Quick Access */}
        <div className="mt-4">
          <Button
            onClick={onAIAssistantToggle}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <Sparkles className="size-4 mr-2" />
            Chat with AI Co-Manager
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}