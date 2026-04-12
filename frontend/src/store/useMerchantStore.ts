import { create } from 'zustand';

interface Message { role: 'user' | 'agent'; content: string; timestamp: Date; }
interface Alert { merchant_id: string; name: string; score_drop: number; days: number; severity: string; }

interface MerchantStoreState {
  // Global
  healthScore: number;
  activeMerchants: number;
  agentStatus: 'idle' | 'thinking' | 'connected' | 'disconnected';
  activeTab: string;
  selectedMerchantId: string;
  
  // Agent
  messages: Message[];
  
  // Live alerts
  alerts: Alert[];

  // Actions
  setActiveTab: (tab: string) => void;
  setSelectedMerchant: (id: string) => void;
  connectWebSocket: () => void;
  sendMessage: (query: string, merchantId: string) => void;
  updateHealthScore: (score: number) => void;
  setAlerts: (alerts: Alert[]) => void;
}

export const useMerchantStore = create<MerchantStoreState>((set, get) => ({
  healthScore: 724,
  activeMerchants: 5000,
  agentStatus: 'disconnected',
  activeTab: 'overview',
  selectedMerchantId: 'M-1001',
  messages: [],
  alerts: [],

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedMerchant: (id) => set({ selectedMerchantId: id }),
  updateHealthScore: (score) => set({ healthScore: score }),
  setAlerts: (alerts) => set({ alerts }),

  connectWebSocket: () => {
    const ws = new WebSocket('ws://localhost:8000/ws/agent');
    ws.onopen = () => { set({ agentStatus: 'connected' }); };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'thinking') {
          set({ agentStatus: 'thinking' });
        } else if (data.response) {
          set((state) => ({
            messages: [...state.messages, { role: 'agent', content: data.response, timestamp: new Date() }],
            agentStatus: 'connected'
          }));
        }
      } catch {
        set((state) => ({
          messages: [...state.messages, { role: 'agent', content: event.data, timestamp: new Date() }],
          agentStatus: 'connected'
        }));
      }
    };
    ws.onclose = () => set({ agentStatus: 'disconnected' });
    (window as any).__MERCHANT_WS = ws;
  },

  sendMessage: (query, merchantId) => {
    const ws = (window as any).__MERCHANT_WS;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ query, merchant_id: merchantId }));
      set((state) => ({
        messages: [...state.messages, { role: 'user', content: query, timestamp: new Date() }],
        agentStatus: 'thinking'
      }));
    } else {
      // Fallback for offline demo
      set((state) => ({
        messages: [...state.messages, { role: 'user', content: query, timestamp: new Date() }],
        agentStatus: 'thinking'
      }));
      setTimeout(() => {
        set((state) => ({
          messages: [...state.messages, { 
            role: 'agent', 
            content: `[Demo Mode] Analyzing query for merchant ${merchantId}: "${query}". Backend offline — connect GROQ_API_KEY and restart uvicorn for live responses.`,
            timestamp: new Date()
          }],
          agentStatus: 'disconnected'
        }));
      }, 1500);
    }
  }
}));
