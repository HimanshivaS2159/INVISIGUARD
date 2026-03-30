import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    console.error('[API Error]', message);
    return Promise.reject(error);
  }
);

/* ─── Predict ──────────────────────────────────────────────── */
export interface PredictPayload {
  amount: number;
  is_night: number;
  new_location: number;
  new_device: number;
  user_id?: string;
}

export interface PredictResponse {
  result: 'FRAUD' | 'SAFE';
  risk_score: number;
  confidence: number;
  analysis: {
    ml_model: { probability: number; prediction: string; score: number; processing_time_ms: number };
    behavioral: { score: number; reasons: string[]; transaction_count_24h: number; amount_velocity: number };
    location: { score: number; reason: string; ip_address: string };
  };
  reasons: string[];
  feature_explanations: Record<string, number>;
  transaction_data: { amount: number; currency: string; timestamp: string; user_id: string };
  metadata: { model_version: string; analysis_timestamp: string; processing_time_ms: number };
}

export const predictFraud = (data: PredictPayload) =>
  api.post<PredictResponse>('/predict', data);

/* ─── Health ───────────────────────────────────────────────── */
export const healthCheck = () => api.get('/health');

/* ─── Model Info ───────────────────────────────────────────── */
export interface ModelInfo {
  model_status: string;
  model_type: string;
  features: string[];
  feature_importance: Record<string, number>;
  model_version: string;
}

export const getModelInfo = () => api.get<ModelInfo>('/model/info');

/* ─── User Profile ─────────────────────────────────────────── */
export interface UserProfile {
  user_id: string;
  total_transactions: number;
  avg_risk_score: number;
  risk_level: string;
  transactions: Array<{
    amount: number;
    risk_score: number;
    result: string;
    timestamp: string;
    reasons: string[];
  }>;
  behavioral_patterns: string[];
}

export const getUserProfile = (userId: string) =>
  api.get<UserProfile>(`/user/${userId}/profile`);

/* ─── Analytics ────────────────────────────────────────────── */
export interface AnalyticsSummary {
  total_transactions: number;
  fraud_count: number;
  fraudulent_transactions: number; // alias for fraud_count
  safe_count: number;
  safe_transactions: number;       // alias for safe_count
  fraud_rate: number;
  avg_risk_score: number;
  average_risk_score: number;      // alias for avg_risk_score
  recent_transactions: Array<{
    user_id: string;
    amount: number;
    risk_score: number;
    result: string;
    timestamp: string;
    reasons: string[];
  }>;
  risk_distribution: Record<string, number>;
  hourly_trend: Array<{ hour: number; count: number; fraud: number }>;
  top_risk_factors?: Array<{ factor: string; count: number }>;
  last_updated?: string;
}

export const getAnalyticsSummary = () =>
  api.get<AnalyticsSummary>('/analytics/summary');

export default api;
