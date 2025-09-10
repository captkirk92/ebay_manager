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

export interface HealthData {
  health_score: number;
  analysis: {
    overall_health: string;
    strengths: string[];
    concerns: string[];
    action_items: string[];
  };
}

// Environment type augmentation for Vite
declare interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
