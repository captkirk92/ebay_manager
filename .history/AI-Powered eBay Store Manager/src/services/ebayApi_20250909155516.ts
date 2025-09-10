/**
 * eBay API Service for Dashboard Integration
 * Handles all API calls to the backend eBay integration
 */

const API_BASE_URL =
  process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5001/api";

export interface StoreSummary {
  store_name: string;
  selling_data: {
    active_listings: number;
    total_sales: number;
    total_revenue: number;
  };
  user_id: string;
}

export interface Order {
  OrderID: string;
  OrderStatus: string;
  Total: string;
  CreatedTime: string;
  BuyerUserID: string;
  ShippingAddress: any;
  TransactionArray: any[];
}

export interface OrderResponse {
  OrderArray: Order[];
  PaginationResult: any;
}

export interface Listing {
  ItemID: string;
  Title: string;
  CurrentPrice: string;
  Quantity: number;
  QuantityAvailable: number;
  ListingStatus: string;
  StartTime: string;
  EndTime: string;
  ViewItemURL: string;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
}

export interface ChartDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface RecentCustomer {
  date: string;
  customer: string;
  total: number;
  status: string;
  order_id: string;
}

export interface AnalyticsData {
  orders: {
    total: number;
    revenue: number;
    average_value: number;
  };
  listings: {
    total: number;
  };
  period_days: number;
  chart_data: ChartDataPoint[];
  recent_customers: RecentCustomer[];
}

export interface HealthData {
  health_score: number;
  analysis: {
    overall_health: string;
    strengths: string[];
    concerns: string[];
    action_items: string[];
  };
  standards_data?: any;
  inad_metrics?: any;
  inr_metrics?: any;
  traffic_data?: any;
}

class eBayApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "API request failed");
      }

      return data.data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get store summary information
   */
  async getStoreSummary(): Promise<StoreSummary> {
    return this.request<StoreSummary>("/store/summary");
  }

  /**
   * Get recent orders
   */
  async getOrders(daysBack: number = 30): Promise<OrderResponse> {
    return this.request<OrderResponse>(`/store/orders?days=${daysBack}`);
  }

  /**
   * Get active listings
   */
  async getListings(): Promise<ListingsResponse> {
    return this.request<ListingsResponse>("/store/listings");
  }

  /**
   * Get analytics data
   */
  async getAnalytics(daysBack: number = 30): Promise<AnalyticsData> {
    return this.request<AnalyticsData>(`/store/analytics?days=${daysBack}`);
  }

  /**
   * Get store health analysis
   */
  async getStoreHealth(): Promise<HealthData> {
    return this.request<HealthData>("/store/health");
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>("/health");
  }
}

export const ebayApi = new eBayApiService();
export default ebayApi;
