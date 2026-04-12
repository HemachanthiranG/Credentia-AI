import React, { useState, useEffect } from 'react';
import { fetchRecommendations, fetchMerchants } from '../services/api';
import { ShoppingBag, TrendingUp, Clock, Star } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [selected, setSelected] = useState('M-1001');
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchMerchants().then(setMerchants); }, []);
  useEffect(() => {
    setLoading(true);
    fetchRecommendations(selected).then(r => { setRecs(r); setLoading(false); });
  }, [selected]);

  const categories = ['all', ...new Set(recs.map((r: any) => r.category))];
  const filtered = filter === 'all' ? recs : recs.filter((r: any) => r.category === filter);

  const signalBadge = (price: number, avg: number) => {
    const pct = ((avg - price) / avg) * 100;
    if (pct > 10) return { label: '🟢 BELOW MARKET', cls: 'bg-green-500/10 text-green-400 border-green-500/20' };
    if (pct < -5) return { label: '🔴 ABOVE MARKET', cls: 'bg-red-500/10 text-red-400 border-red-500/20' };
    return { label: '⚪ MARKET RATE', cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">B2B Product Recommendation Engine</h2>
          <p className="text-sm text-slate-500 mt-1">Two-Tower PyTorch · FAISS sub-10ms retrieval · Prophet seasonal overlay</p>
        </div>
        <select value={selected} onChange={e => setSelected(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500">
          {merchants.map((m: any) => <option key={m.merchant_id} value={m.merchant_id}>{m.merchant_id} — {m.name}</option>)}
        </select>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'FAISS Index Size', value: '50,000', sub: 'Product embeddings (dim=64)', icon: Star },
          { label: 'Retrieval Latency', value: '< 8ms', sub: 'ANN approximate search', icon: Clock },
          { label: 'Prophet Forecast', value: 'Active', sub: 'Seasonal demand curves loaded', icon: TrendingUp },
        ].map((s, i) => (
          <div key={i} className="glass-panel p-4 rounded-xl flex items-center gap-4">
            <div className="p-2.5 bg-slate-800 rounded-xl"><s.icon className="w-5 h-5 text-blue-400" /></div>
            <div>
              <div className="text-lg font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
              <div className="text-xs text-slate-600">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === c ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}>
            {c === 'all' ? 'All Products' : c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 glass-panel rounded-2xl">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r: any, i: number) => {
            const sig = signalBadge(r.price, r.market_avg);
            const saving = r.market_avg - r.price;
            return (
              <div key={i} className="glass-panel p-5 rounded-2xl hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(34,197,94,0.1)] transition-all duration-300 group cursor-pointer border border-transparent hover:border-green-500/20">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-md border ${sig.cls}`}>{sig.label}</span>
                  <span className="text-xs font-bold text-white">#{i + 1}</span>
                </div>
                <div className="mb-3">
                  <h4 className="font-semibold text-slate-200 group-hover:text-white transition-colors">{r.name}</h4>
                  <span className="text-xs text-slate-500 mt-0.5 block">{r.category} · Score: <span className="text-blue-400 font-bold">{(r.score * 100).toFixed(0)}%</span></span>
                </div>
                <div className="flex items-end justify-between mt-4 pt-4 border-t border-slate-800">
                  <div>
                    <div className="text-2xl font-bold text-white">${r.price?.toFixed(2)}</div>
                    <div className="text-xs text-slate-600 line-through">${r.market_avg?.toFixed(2)} avg</div>
                  </div>
                  <div className="text-right">
                    {saving > 0 ? (
                      <div className="text-xs text-green-400 font-semibold">Save ${saving.toFixed(2)}</div>
                    ) : (
                      <div className="text-xs text-red-400 font-semibold">${Math.abs(saving).toFixed(2)} above avg</div>
                    )}
                    <div className="text-[10px] text-slate-600 mt-1">Peak in {r.demand_peak_days}d</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
