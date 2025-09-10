import { ChartDataPoint, RecentCustomer, HealthData } from '../types/types';
import {
  StoreSummary,
  OrderResponse,
  ListingsResponse,
  AnalyticsData
} from './ebayApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'An error occurred while fetching the data.');
  }
  return response.json();
}

// Transform functions for eBay API data
export function transformOrder(orderData: any) {
  return {
    orderId: orderData.OrderID || orderData.orderId || '',
    createdAt: orderData.CreatedTime || orderData.createdAt || new Date().toISOString(),
    total: parseFloat(orderData.Total?.value || orderData.total || '0'),
    status: orderData.OrderStatus || orderData.status || 'Unknown',
    buyer: {
      name: orderData.BuyerUserID || orderData.buyer?.name || 'Unknown Buyer',
      email: orderData.buyer?.email || ''
    },
    items: orderData.TransactionArray || orderData.items || []
  };
}

export function transformListing(listingData: any) {
  return {
    itemId: listingData.ItemID || listingData.itemId || '',
    title: listingData.Title || listingData.title || '',
    price: parseFloat(listingData.StartPrice?.value || listingData.price || '0'),
    quantity: parseInt(listingData.Quantity || listingData.quantity || '0'),
    condition: listingData.ConditionDescription || listingData.condition || 'New',
    category: listingData.PrimaryCategory?.CategoryName || listingData.category || 'Other',
    images: listingData.PictureDetails?.PictureURL || listingData.images || [],
    listingType: listingData.ListingType || listingData.listingType || 'FixedPriceItem',
    endTime: listingData.EndTime || listingData.endTime || new Date().toISOString()
  };
}

export const ebayApi = {
  async getStoreSummary(): Promise<StoreSummary> {
    const response = await fetch(`${API_BASE_URL}/store/summary`);
    const data = await handleResponse<any>(response);
    return data.success ? data.data : data;
  },

  async getOrders(): Promise<OrderResponse> {
    const response = await fetch(`${API_BASE_URL}/store/orders`);
    const data = await handleResponse<any>(response);
    const orders = data.success ? data.data : data;
    return {
      items: orders.OrderArray ? orders.OrderArray.map(transformOrder) : [],
      total: orders.OrderArray ? orders.OrderArray.length : 0
    };
  },

  async getListings(): Promise<ListingsResponse> {
    const response = await fetch(`${API_BASE_URL}/store/listings`);
    const data = await handleResponse<any>(response);
    const listings = data.success ? data.data : data;
    return {
      items: listings.listings ? listings.listings.map(transformListing) : [],
      total: listings.total || 0
    };
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const response = await fetch(`${API_BASE_URL}/store/analytics`);
    const data = await handleResponse<any>(response);
    const analytics = data.success ? data.data : data;
    return {
      orders: {
        total: analytics.orders?.total || 0,
        revenue: analytics.orders?.revenue || 0,
        average_value: analytics.orders?.average_value || 0
      },
      listings: {
        total: analytics.listings?.total || 0
      },
      period_days: analytics.period_days || 30,
      chart_data: analytics.chart_data || [],
      recent_customers: analytics.recent_customers || [],
      total_revenue: analytics.orders?.revenue || 0,
      total_orders: analytics.orders?.total || 0,
      average_order_value: analytics.orders?.average_value || 0,
      revenue_by_period: analytics.chart_data ? analytics.chart_data.map((point: ChartDataPoint) => ({
        period: point.date,
        revenue: point.revenue,
        orders: point.orders
      })) : []
    };
  },

  async getHealth(): Promise<HealthData> {
    const response = await fetch(`${API_BASE_URL}/store/health`);
    const data = await handleResponse<any>(response);
    return data.success ? data.data : data;
  },

  // Additional API methods...
};
