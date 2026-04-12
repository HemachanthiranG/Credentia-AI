import React, { useState, useEffect, useRef } from 'react';
import { Activity, ShieldCheck, ShoppingBag, Globe, BrainCircuit, Send, Loader2, ChevronRight, Zap, TrendingUp, X } from 'lucide-react';
import { useMerchantStore } from './store/useMerchantStore';
import { OverviewPage } from './pages/OverviewPage';
import { CreditPage } from './pages/CreditPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { MarketIntelPage } from './pages/MarketIntelPage';


const NAV_ITEMS = [
  { id: 'overview', icon: Activity, label: 'Live Portfolio', sub: 'Health · Anomalies · Alerts' },
  { id: 'credit', icon: ShieldCheck, label: 'Credit Engine', sub: 'XGBoost · SHAP · Limits' },
  { id: 'recommendations', icon: ShoppingBag, label: 'Recommendations', sub: 'Two-Tower · FAISS · Prophet' },
  { id: 'market', icon: Globe, label: 'Market Intel', sub: 'Scrapy · ChromaDB · LLM' },
];

const EXAMPLE_QUERIES = [
  'Why did merchant M-1001 credit limit change?',
  'Recommend products for a retail merchant',
  'What are the latest steel price trends?',
  'Analyze payment risk for M-1234',
];

function App() {
  const [chatInput, setChatInput] = useState('');
  const [chatOpen, setChatOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activeTab, setActiveTab, messages, agentStatus, selectedMerchantId, connectWebSocket, sendMessage } = useMerchantStore();

  useEffect(() => { connectWebSocket(); }, [connectWebSocket]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput.trim(), selectedMerchantId);
    setChatInput('');
  };

  const activePage = {
    overview: <OverviewPage />, credit: <CreditPage />,
    recommendations: <RecommendationsPage />, market: <MarketIntelPage />
  }[activeTab] || <OverviewPage />;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#0f172a', color: '#e2e8f0' }}>
      
      {/* Sidebar */}
      <aside style={{ width: '260px', minWidth: '260px', backgroundColor: 'rgba(15,23,42,0.95)', borderRight: '1px solid #1e293b', backdropFilter: 'blur(20px)' }} className="flex flex-col py-6 z-20">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 mb-8">
          <div style={{ padding: '8px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '12px', boxShadow: '0 0 20px rgba(34,197,94,0.15)' }}>
            <BrainCircuit style={{ width: '22px', height: '22px', color: '#22c55e' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>Merchant<span style={{ color: '#22c55e' }}>IQ</span></h1>
            <p style={{ fontSize: '10px', color: '#475569', letterSpacing: '0.05em' }}>B2B INTELLIGENCE PLATFORM</p>
          </div>
        </div>

        {/* WS Status */}
        <div style={{ margin: '0 16px 20px', padding: '10px 14px', borderRadius: '12px', border: `1px solid ${agentStatus === 'connected' || agentStatus === 'thinking' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, background: agentStatus === 'connected' || agentStatus === 'thinking' ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: agentStatus === 'connected' || agentStatus === 'thinking' ? '#22c55e' : '#ef4444', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: '11px', fontWeight: '600', color: agentStatus === 'connected' || agentStatus === 'thinking' ? '#22c55e' : '#ef4444' }}>
            {agentStatus === 'connected' ? 'AI Supervisor Online' : agentStatus === 'thinking' ? 'Agent Reasoning...' : 'Backend Offline'}
          </span>
        </div>

        {/* Nav */}
        <nav style={{ padding: '0 10px', flex: 1 }}>
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', marginBottom: '4px', transition: 'all 0.2s', cursor: 'pointer', background: active ? 'rgba(34,197,94,0.08)' : 'transparent', border: active ? '1px solid rgba(34,197,94,0.25)' : '1px solid transparent', textAlign: 'left' }}>
                <div style={{ padding: '7px', borderRadius: '9px', background: active ? 'rgba(34,197,94,0.15)' : 'rgba(30,41,59,0.8)' }}>
                  <item.icon style={{ width: '15px', height: '15px', color: active ? '#22c55e' : '#64748b' }} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: active ? '#f1f5f9' : '#94a3b8' }}>{item.label}</div>
                  <div style={{ fontSize: '10px', color: '#475569', marginTop: '1px' }}>{item.sub}</div>
                </div>
                {active && <ChevronRight style={{ width: '14px', height: '14px', color: '#22c55e', marginLeft: 'auto' }} />}
              </button>
            );
          })}
        </nav>

        {/* Bottom badges */}
        <div style={{ padding: '16px', borderTop: '1px solid #1e293b', marginTop: 'auto' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['Kafka', 'XGBoost', 'PyTorch', 'ChromaDB', 'LangGraph'].map(t => (
              <span key={t} style={{ fontSize: '9px', padding: '3px 7px', background: '#1e293b', borderRadius: '6px', color: '#475569', border: '1px solid #334155', fontWeight: '600' }}>{t}</span>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        {/* Header */}
        <header style={{ padding: '20px 28px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)', position: 'relative', zIndex: 10 }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>
              {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Intelligence Canvas'}
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0' }}>
              {NAV_ITEMS.find(n => n.id === activeTab)?.sub}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '20px' }}>
              <Zap style={{ width: '12px', height: '12px', color: '#22c55e' }} />
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#22c55e' }}>5,000 Merchants Live</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '20px' }}>
              <TrendingUp style={{ width: '12px', height: '12px', color: '#60a5fa' }} />
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#60a5fa' }}>Groq LLaMA 3.3 70B</span>
            </div>
            <button onClick={() => setChatOpen(!chatOpen)} style={{ padding: '8px 16px', background: chatOpen ? 'rgba(34,197,94,0.15)' : '#1e293b', border: chatOpen ? '1px solid rgba(34,197,94,0.3)' : '1px solid #334155', borderRadius: '10px', color: chatOpen ? '#22c55e' : '#64748b', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
              <BrainCircuit style={{ width: '13px', height: '13px' }} />
              AI Advisor {chatOpen ? '▸' : '◂'}
            </button>
          </div>
        </header>

        {/* Content + Chat */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 5 }}>
          {/* Page Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
            {activePage}
          </div>

          {/* AI Advisor Panel */}
          {chatOpen && (
            <div style={{ width: '360px', minWidth: '360px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #1e293b', background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)' }}>
              {/* Chat header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BrainCircuit style={{ width: '16px', height: '16px', color: '#a855f7' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9' }}>Merchant AI Advisor</div>
                    <div style={{ fontSize: '10px', color: '#475569' }}>LangGraph · RAG · Groq LLaMA 3.3</div>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}><X style={{ width: '14px', height: '14px' }} /></button>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.length === 0 && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', paddingBottom: '20px' }}>
                    <BrainCircuit style={{ width: '32px', height: '32px', color: '#334155' }} />
                    <p style={{ fontSize: '12px', color: '#475569', textAlign: 'center', maxWidth: '240px', lineHeight: '1.6' }}>Ask me about credit limits, product recommendations, or market prices</p>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {EXAMPLE_QUERIES.map((q, i) => (
                        <button key={i} onClick={() => sendMessage(q, selectedMerchantId)} style={{ width: '100%', textAlign: 'left', padding: '10px 14px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s', lineHeight: '1.4' }}
                          onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'rgba(34,197,94,0.3)'; (e.target as HTMLElement).style.color = '#f1f5f9'; }}
                          onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = '#334155'; (e.target as HTMLElement).style.color = '#94a3b8'; }}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '8px', alignItems: 'flex-start' }}>
                    {msg.role === 'agent' && (
                      <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <BrainCircuit style={{ width: '12px', height: '12px', color: '#a855f7' }} />
                      </div>
                    )}
                    <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', fontSize: '13px', lineHeight: '1.6', background: msg.role === 'user' ? '#16a34a' : '#1e293b', color: '#f1f5f9', border: msg.role === 'agent' ? '1px solid #334155' : 'none' }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {agentStatus === 'thinking' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '8px', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BrainCircuit style={{ width: '12px', height: '12px', color: '#a855f7' }} />
                    </div>
                    <div style={{ padding: '10px 14px', borderRadius: '14px 14px 14px 4px', background: '#1e293b', border: '1px solid #334155', display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {[0, 1, 2].map(d => <div key={d} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#a855f7', animation: `bounce 1.4s ease-in-out ${d * 0.16}s infinite` }} />)}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '14px 16px', borderTop: '1px solid #1e293b', background: 'rgba(15,23,42,0.9)' }}>
                <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask about credit, products, market prices..."
                    style={{ flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#f1f5f9', outline: 'none', transition: 'border-color 0.2s' }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(34,197,94,0.5)')}
                    onBlur={e => (e.target.style.borderColor = '#334155')}
                  />
                  <button type="submit" disabled={!chatInput.trim() || agentStatus === 'thinking'}
                    style={{ padding: '10px', background: chatInput.trim() ? '#16a34a' : '#1e293b', border: 'none', borderRadius: '10px', cursor: chatInput.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: chatInput.trim() ? '0 0 15px rgba(34,197,94,0.3)' : 'none' }}>
                    {agentStatus === 'thinking' ? <Loader2 style={{ width: '15px', height: '15px', color: '#64748b', animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: '15px', height: '15px', color: chatInput.trim() ? 'white' : '#475569' }} />}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0f172a; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        @keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-8px); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .glass-panel { background: rgba(30,41,59,0.5); backdrop-filter: blur(12px); border: 1px solid rgba(51,65,85,0.6); }
        button:focus { outline: none; }
      `}</style>
    </div>
  );
}

export default App;
