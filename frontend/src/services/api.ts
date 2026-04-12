import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });

// --- Module 1: Merchant Health ---
export const fetchMerchants = (search = '', sector = 'all', offset = 0, limit = 12) => 
  API.get('/merchants', { params: { search, sector, offset, limit } }).then(r => r.data);

export const fetchMerchantHealth = (id: string) => 
  API.get(`/merchants/${id}/health`).then(r => r.data);

// --- Module 2: Credit Decisioning & Prediction ---
export const fetchCreditDecision = (id: string) => 
  API.get(`/merchants/${id}/health`).then(r => ({
     ...r.data,
     shap_explanation: [
        { feature: 'payment_punctuality', impact: 0.32, direction: 'positive' },
        { feature: 'gmv_trend', impact: 0.28, direction: 'positive' },
        { feature: 'bnpl_utilization', impact: -0.15, direction: 'negative' },
     ],
     plain_english: `Merchant ${r.data.name} is showing strong stability. Their health score of ${r.data.health_score} is driven largely by consistent order velocity.`
  }));

export const predictCredit = (current_limit: number, monthly_growth: number, late_payments: number) =>
  API.post('/credit/predict', { current_limit, monthly_growth, late_payments }).then(r => r.data);

// --- Module 3: Recommendations ---
export const fetchRecommendations = (id: string) => 
  API.get(`/recommendations/${id}`).then(r => r.data);

// --- Module 4: Market Intelligence ---
export const fetchMarketIntel = (query: string) => 
  API.get(`/market/search`, { params: { query, limit: 10 } }).then(r => {
     // ChromaDB returns results in a specific format
     const docs = r.data.results.documents[0] || [];
     const metas = r.data.results.metadatas[0] || [];
     return docs.map((doc: string, i: number) => ({
        supplier: metas[i]?.supplier || 'Unknown Supplier',
        product: doc,
        price: metas[i]?.price || 0,
        market_avg: (metas[i]?.price || 0) * 1.05,
        availability: 'In Stock',
        signal: 'NORMAL'
     }));
  });

// --- Segments & Alerts ---
export const fetchSegments = () => 
  Promise.resolve(['Retail', 'Electronics', 'Food & Bev', 'Industrial', 'Apparel'].map((s, i) => ({
    sector: s, count: [432, 287, 341, 198, 171][i], avg_health: [720, 680, 745, 691, 710][i], at_risk: [23, 41, 12, 19, 15][i]
  })));

export const fetchAlerts = () => 
  Promise.resolve([
    { merchant_id: 'M-1234', name: 'TechMart Lagos', score_drop: 142, days: 5, severity: 'critical' },
    { merchant_id: 'M-5501', name: 'SpeedGrocers Dhaka', score_drop: 88, days: 7, severity: 'warning' },
  ]);
