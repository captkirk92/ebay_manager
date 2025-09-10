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
  DollarSign,
  Users,
  TrendingUp,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  Edit,
  Filter,
  Calendar,
  Wallet,
  CreditCard,
  PieChart,
  Target,
  Headphones,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Zap,
  Store
} from "lucide-react";
import { MenuConfig } from "../types/menu";

export const menuConfig: MenuConfig = {
  groups: [
    {
      id: "main",
      label: "",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          route: "/dashboard",
          roles: ["admin", "user", "viewer"]
        }
      ]
    },
    {
      id: "orders",
      label: "Orders Management",
      items: [
        {
          id: "orders",
          label: "Orders",
          icon: Package,
          badge: "23",
          route: "/orders",
          roles: ["admin", "user"],
          children: [
            {
              id: "active-orders",
              label: "Active Orders",
              icon: Clock,
              badge: "15",
              route: "/orders/active",
              roles: ["admin", "user"]
            },
            {
              id: "completed-orders",
              label: "Completed Orders",
              icon: CheckCircle,
              route: "/orders/completed",
              roles: ["admin", "user"]
            },
            {
              id: "cancelled-orders",
              label: "Cancelled Orders",
              icon: XCircle,
              route: "/orders/cancelled",
              roles: ["admin", "user"]
            },
            {
              id: "returns",
              label: "Returns & Refunds",
              icon: RotateCcw,
              badge: "3",
              route: "/orders/returns",
              roles: ["admin", "user"]
            }
          ]
        }
      ]
    },
    {
      id: "communication",
      label: "Messages & Support",
      items: [
        {
          id: "messages",
          label: "Messages",
          icon: MessageSquare,
          badge: "7",
          route: "/messages",
          roles: ["admin", "user"],
          children: [
            {
              id: "inbox",
              label: "Inbox",
              icon: MessageSquare,
              badge: "7",
              route: "/messages/inbox",
              roles: ["admin", "user"]
            },
            {
              id: "sent",
              label: "Sent",
              icon: Send,
              route: "/messages/sent",
              roles: ["admin", "user"]
            },
            {
              id: "drafts",
              label: "Drafts",
              icon: FileText,
              badge: "3",
              route: "/messages/drafts",
              roles: ["admin", "user"]
            },
            {
              id: "templates",
              label: "Templates",
              icon: FileText,
              route: "/messages/templates",
              roles: ["admin", "user"]
            }
          ]
        },
        {
          id: "customer-service",
          label: "Customer Service",
          icon: Headphones,
          route: "/customer-service",
          roles: ["admin", "user"]
        }
      ]
    },
    {
      id: "listings",
      label: "Listings & Inventory",
      items: [
        {
          id: "listings",
          label: "Listings",
          icon: Search,
          badge: "15",
          route: "/listings",
          roles: ["admin", "user"],
          children: [
            {
              id: "active-listings",
              label: "Active Listings",
              icon: Eye,
              badge: "12",
              route: "/listings/active",
              roles: ["admin", "user"]
            },
            {
              id: "draft-listings",
              label: "Draft Listings",
              icon: Edit,
              badge: "3",
              route: "/listings/drafts",
              roles: ["admin", "user"]
            },
            {
              id: "ended-listings",
              label: "Ended Listings",
              icon: Archive,
              route: "/listings/ended",
              roles: ["admin", "user"]
            }
          ]
        },
        {
          id: "optimization",
          label: "Listing Optimization",
          icon: Target,
          route: "/listings/optimization",
          roles: ["admin", "user"]
        },
        {
          id: "gallery",
          label: "Photo Gallery",
          icon: Package,
          route: "/gallery",
          roles: ["admin", "user"]
        }
      ]
    },
    {
      id: "financials",
      label: "Financials",
      items: [
        {
          id: "financials",
          label: "Financial Overview",
          icon: DollarSign,
          route: "/financials",
          roles: ["admin", "user"],
          children: [
            {
              id: "revenue",
              label: "Revenue",
              icon: TrendingUp,
              route: "/financials/revenue",
              roles: ["admin", "user"]
            },
            {
              id: "fees",
              label: "eBay Fees",
              icon: CreditCard,
              route: "/financials/fees",
              roles: ["admin", "user"]
            },
            {
              id: "taxes",
              label: "Tax Reports",
              icon: FileText,
              route: "/financials/taxes",
              roles: ["admin"]
            },
            {
              id: "payouts",
              label: "Payouts",
              icon: Wallet,
              route: "/financials/payouts",
              roles: ["admin", "user"]
            }
          ]
        }
      ]
    },
    {
      id: "analytics",
      label: "Analytics & Reports",
      items: [
        {
          id: "analytics",
          label: "Analytics",
          icon: BarChart3,
          route: "/analytics",
          roles: ["admin", "user"],
          children: [
            {
              id: "sales-analytics",
              label: "Sales Analytics",
              icon: TrendingUp,
              route: "/analytics/sales",
              roles: ["admin", "user"]
            },
            {
              id: "customer-analytics",
              label: "Customer Analytics",
              icon: Users,
              route: "/analytics/customers",
              roles: ["admin", "user"]
            },
            {
              id: "product-performance",
              label: "Product Performance",
              icon: PieChart,
              route: "/analytics/products",
              roles: ["admin", "user"]
            }
          ]
        }
      ]
    },
    {
      id: "feedback",
      label: "Feedback & Reviews",
      items: [
        {
          id: "feedback",
          label: "Feedback",
          icon: Star,
          route: "/feedback",
          roles: ["admin", "user"],
          children: [
            {
              id: "received-feedback",
              label: "Received Feedback",
              icon: ThumbsUp,
              route: "/feedback/received",
              roles: ["admin", "user"]
            },
            {
              id: "left-feedback",
              label: "Left Feedback",
              icon: Send,
              route: "/feedback/left",
              roles: ["admin", "user"]
            },
            {
              id: "feedback-reminders",
              label: "Feedback Reminders",
              icon: Bell,
              route: "/feedback/reminders",
              roles: ["admin", "user"]
            }
          ]
        }
      ]
    },
    {
      id: "store-health",
      label: "Store Health",
      items: [
        {
          id: "store-health",
          label: "Store Health Score",
          icon: Shield,
          route: "/store-health",
          roles: ["admin", "user"],
          children: [
            {
              id: "performance-metrics",
              label: "Performance Metrics",
              icon: Target,
              route: "/store-health/metrics",
              roles: ["admin", "user"]
            },
            {
              id: "policy-compliance",
              label: "Policy Compliance",
              icon: CheckCircle,
              route: "/store-health/compliance",
              roles: ["admin", "user"]
            },
            {
              id: "defects",
              label: "Defects & Issues",
              icon: AlertTriangle,
              badge: "3",
              route: "/store-health/defects",
              roles: ["admin", "user"]
            }
          ]
        }
      ]
    },
    {
      id: "ai-tools",
      label: "AI Tools",
      items: [
        {
          id: "ai-assistant",
          label: "AI Assistant",
          icon: Bot,
          route: "/ai-assistant",
          roles: ["admin", "user"]
        },
        {
          id: "automation",
          label: "Workflow Automation",
          icon: Zap,
          route: "/automation",
          roles: ["admin", "user"]
        },
        {
          id: "insights",
          label: "AI Insights",
          icon: Sparkles,
          route: "/insights",
          roles: ["admin", "user"]
        }
      ]
    },
    {
      id: "settings",
      label: "Settings",
      items: [
        {
          id: "account",
          label: "Account Settings",
          icon: Settings,
          route: "/settings/account",
          roles: ["admin", "user"]
        },
        {
          id: "store-settings",
          label: "Store Settings",
          icon: Store,
          route: "/settings/store",
          roles: ["admin"]
        },
        {
          id: "notifications",
          label: "Notifications",
          icon: Bell,
          route: "/settings/notifications",
          roles: ["admin", "user"]
        },
        {
          id: "help",
          label: "Help & Support",
          icon: HelpCircle,
          route: "/help",
          roles: ["admin", "user", "viewer"]
        }
      ]
    },
    {
      id: "quick-actions",
      label: "Quick Actions",
      items: [
        {
          id: "important",
          label: "Important",
          icon: Star,
          badge: "6",
          route: "/important",
          roles: ["admin", "user"]
        },
        {
          id: "archive",
          label: "Archive",
          icon: Archive,
          route: "/archive",
          roles: ["admin", "user"]
        },
        {
          id: "trash",
          label: "Trash",
          icon: Trash2,
          route: "/trash",
          roles: ["admin", "user"]
        }
      ]
    }
  ]
};

// Helper functions for menu management
export const getVisibleMenuGroups = (userRole: string): MenuConfig => {
  const filteredGroups = menuConfig.groups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      !item.roles || item.roles.includes(userRole)
    ).map(item => ({
      ...item,
      children: item.children?.filter(child => 
        !child.roles || child.roles.includes(userRole)
      )
    }))
  })).filter(group => group.items.length > 0);
  
  return { groups: filteredGroups };
};

export const getMenuItemById = (id: string): MenuItem | null => {
  for (const group of menuConfig.groups) {
    for (const item of group.items) {
      if (item.id === id) return item;
      if (item.children) {
        const child = item.children.find(child => child.id === id);
        if (child) return child;
      }
    }
  }
  return null;
};

export const updateMenuItemBadge = (id: string, badge?: string | number): void => {
  const item = getMenuItemById(id);
  if (item) {
    item.badge = badge;
  }
};