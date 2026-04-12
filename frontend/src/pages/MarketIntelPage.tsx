import React, { useState, useEffect } from 'react';
import { fetchMarketIntel } from '../services/api';
import { Search, TrendingUp, TrendingDown, AlertCircle, Database } from 'lucide-react';

const priceData = [
  { week: 'W1', steel: 1380, electronics: 11.2, food: 310 },
  { week: 'W2', steel: 1340, electronics: 10.8, food: 325 },
  { week: 'W3', steel: 1290, electronics: 9.5, food: 319 },
  { week: 'W4', steel: 1240, electronics: 8.4, food: 340 },
];

export const MarketIntelPage: React.FC = () => {
  const [query, setQuery] = useState('steel');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated] = useState(new Date().toLocaleTimeString());

  const search = (q: string) => {
    setLoading(true);
    fetchMarketIntel(q).then(r => { setResults(r); setLoading(false); });
  };

  useEffect(() => { search(query); }, []);

  const signalConfig: Record<string, any> = {
    BUY_SIGNAL: { label: '📈 BUY SIGNAL', cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
    PRICE_DROP: { label: '⬇️ PRICE DROP', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    PRICE_SPIKE: { label: '⬆️ PRICE SPIKE', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
    NORMAL: { label: '➡️ NORMAL', cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">Live Market Intelligence Pipeline</h2>
        <p className="text-sm text-slate-500 mt-1">Playwright + Scrapy scrapers · Groq LLaMA 3.3 entity extraction · ChromaDB semantic search</p>
      </div>

      {/* Pipeline Status */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Playwright Scrapers', status: 'Running', count: '12 portals', color: 'green' },
          { label: 'Scrapy Feeds', status: 'Active', count: '8 feeds', color: 'green' },
          { label: 'ChromaDB Index', status: 'Loaded', count: '4,210 docs', color: 'blue' },
          { label: 'LLM Extraction', status: 'LLaMA 3.3', count: `Updated ${lastUpdated}`, color: 'purple' },
        ].map((s, i) => (
          <div key={i} className="glass-panel p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${s.color === 'green' ? 'bg-green-500' : s.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'}`} />
              <span className="text-xs text-slate-400 font-medium">{s.label}</span>
            </div>
            <div className="text-sm font-bold text-white">{s.status}</div>
            <div className="text-xs text-slate-600 mt-0.5">{s.count}</div>
          </div>
        ))}
      </div>

      {/* Semantic Search */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Database className="w-4 h-4" />ChromaDB Semantic Search</h3>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search(query)}
              placeholder="Search market intelligence ('steel', 'electronics', 'packaging')..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-green-500 focus:shadow-[0_0_0_2px_rgba(34,197,94,0.15)] transition-all"
            />
          </div>
          <button onClick={() => search(query)}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-sm font-medium text-white transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Search'}
          </button>
        </div>
        <p className="text-xs text-slate-600 mt-2">Using bge-large-en embeddings for semantic retrieval · Airflow pipeline refreshes every 6 hours</p>
      </div>

      {/* Results Grid */}
      {results.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Supplier Intelligence — Live Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {results.map((r: any, i: number) => {
              const sig = signalConfig[r.signal] || signalConfig.NORMAL;
              const pct = ((r.market_avg - r.price) / r.market_avg * 100);
              return (
                <div key={i} className="glass-panel p-6 rounded-2xl hover:border hover:border-green-500/20 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-200 group-hover:text-white">{r.product}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Supplier: <span className="text-slate-400">{r.supplier}</span></p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${sig.cls}`}>{sig.label}</span>
                  </div>
                  <div className="flex items-end gap-6">
                    <div>
                      <div className="text-2xl font-bold text-white">${r.price?.toFixed(2)}</div>
                      <div className="text-xs text-slate-600 line-through">${r.market_avg?.toFixed(2)} market avg</div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-sm font-bold ${pct > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pct > 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                      {Math.abs(pct).toFixed(1)}% {pct > 0 ? 'below' : 'above'} market
                    </div>
                    <div className={`ml-auto text-xs px-2 py-1 rounded-md ${r.availability === 'In Stock' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                      {r.availability}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Trend Comparison */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400" />Supplier Price Disruption Alerts — 4-Week Trend
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-xs text-slate-500 uppercase tracking-widest font-medium">Commodity</th>
                {priceData.map(w => <th key={w.week} className="text-right py-3 px-4 text-xs text-slate-500 uppercase tracking-widest font-medium">{w.week}</th>)}
                <th className="text-right py-3 px-4 text-xs text-slate-500 uppercase tracking-widest font-medium">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {[
                { name: 'HR Steel Coil', key: 'steel', unit: '/tonne' },
                { name: 'Arduino ESP32', key: 'electronics', unit: '/unit' },
                { name: 'PET Film Roll', key: 'food', unit: '/roll' },
              ].map(row => {
                const first = (priceData[0] as any)[row.key];
                const last = (priceData[priceData.length - 1] as any)[row.key];
                const chg = ((last - first) / first) * 100;
                return (
                  <tr key={row.key} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-4 text-slate-300 font-medium">{row.name}<span className="text-slate-600 ml-1 text-xs">{row.unit}</span></td>
                    {priceData.map(w => <td key={w.week} className="py-4 px-4 text-right text-slate-400 font-mono">${(w as any)[row.key]}</td>)}
                    <td className={`py-4 px-4 text-right font-bold ${chg < 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {chg < 0 ? '↓' : '↑'} {Math.abs(chg).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
