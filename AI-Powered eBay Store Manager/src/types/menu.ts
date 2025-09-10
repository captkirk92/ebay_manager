import { LucideIcon } from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  route?: string;
  isActive?: boolean;
  children?: MenuItem[];
  roles?: string[]; // Role-based visibility
  isVisible?: boolean;
}

export interface MenuGroup {
  id: string;
  label: string;
  items: MenuItem[];
  roles?: string[];
  isVisible?: boolean;
}

export interface MenuConfig {
  groups: MenuGroup[];
}

export interface User {
  role: string;
  permissions: string[];
}