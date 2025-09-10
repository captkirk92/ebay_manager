import { useState, useEffect } from 'react';
import { ebayApi, StoreSummary, OrderResponse, ListingsResponse, AnalyticsData } from '../services/ebayApi';

export interface UseEbayDataReturn {
  // Data
  storeSummary: StoreSummary | null;
  orders: OrderResponse | null;
  listings: ListingsResponse | null;
  analytics: AnalyticsData | null;
  
  // Loading states
  isLoading: boolean;
  isSummaryLoading: boolean;
  isOrdersLoading: boolean;
  isListingsLoading: boolean;
  isAnalyticsLoading: boolean;
  
  // Error states
  error: string | null;
  summaryError: string | null;
  ordersError: string | null;
  listingsError: string | null;
  analyticsError: string | null;
  
  // Actions
  refreshData: () => Promise<void>;
  refreshSummary: () => Promise<void>;
  refreshOrders: (daysBack?: number) => Promise<void>;
  refreshListings: () => Promise<void>;
  refreshAnalytics: (daysBack?: number) => Promise<void>;
}

export function useEbayData(initialDaysBack: number = 30): UseEbayDataReturn {
  // Data state
  const [storeSummary, setStoreSummary] = useState<StoreSummary | null>(null);
  const [orders, setOrders] = useState<OrderResponse | null>(null);
  const [listings, setListings] = useState<ListingsResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [isListingsLoading, setIsListingsLoading] = useState(false);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Fetch store summary
  const fetchSummary = async () => {
    setIsSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await ebayApi.getStoreSummary();
      setStoreSummary(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch store summary';
      setSummaryError(errorMessage);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = async (daysBack: number = initialDaysBack) => {
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await ebayApi.getOrders(daysBack);
      setOrders(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
      setOrdersError(errorMessage);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  // Fetch listings
  const fetchListings = async () => {
    setIsListingsLoading(true);
    setListingsError(null);
    try {
      const data = await ebayApi.getListings();
      setListings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch listings';
      setListingsError(errorMessage);
    } finally {
      setIsListingsLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async (daysBack: number = initialDaysBack) => {
    setIsAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const data = await ebayApi.getAnalytics(daysBack);
      setAnalytics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setAnalyticsError(errorMessage);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchSummary(),
        fetchOrders(initialDaysBack),
        fetchListings(),
        fetchAnalytics(initialDaysBack)
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Individual refresh functions
  const refreshSummary = async () => {
    await fetchSummary();
  };

  const refreshOrders = async (daysBack?: number) => {
    await fetchOrders(daysBack || initialDaysBack);
  };

  const refreshListings = async () => {
    await fetchListings();
  };

  const refreshAnalytics = async (daysBack?: number) => {
    await fetchAnalytics(daysBack || initialDaysBack);
  };

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, []);

  return {
    // Data
    storeSummary,
    orders,
    listings,
    analytics,
    
    // Loading states
    isLoading,
    isSummaryLoading,
    isOrdersLoading,
    isListingsLoading,
    isAnalyticsLoading,
    
    // Error states
    error,
    summaryError,
    ordersError,
    listingsError,
    analyticsError,
    
    // Actions
    refreshData,
    refreshSummary,
    refreshOrders,
    refreshListings,
    refreshAnalytics,
  };
}
