export interface ListingItem {
  id: string;
  title: string;
  quantity: string;
  hasVariations: boolean;
  status: string;
}

export interface OrderItem {
  orderId: string;
  status: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
  }>;
  buyer: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export interface AnalyticsData {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  revenue_by_period: Array<{
    period: string;
    revenue: number;
    orders: number;
  }>;
}

export interface ListingsResponse {
  items: ListingItem[];
  total: number;
}

export interface OrdersResponse {
  items: OrderItem[];
  total: number;
}

export interface StoreSummary {
  store_name: string;
  total_listings: number;
  active_listings: number;
  total_sales: number;
  feedback_score: number;
}
