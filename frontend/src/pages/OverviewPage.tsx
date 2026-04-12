import React, { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell } from 'recharts';
import { fetchMerchants, fetchAlerts, fetchSegments } from '../services/api';
import { Activity, AlertTriangle, TrendingUp, Users, Shield, Zap, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', score: 720, volume: 4500, anomalies: 2 }, { day: 'Tue', score: 715, volume: 5200, anomalies: 3 },
  { day: 'Wed', score: 735, volume: 4100, anomalies: 1 }, { day: 'Thu', score: 680, volume: 8900, anomalies: 8 },
  { day: 'Fri', score: 705, volume: 6300, anomalies: 4 }, { day: 'Sat', score: 740, volume: 2100, anomalies: 0 },
  { day: 'Sun', score: 755, volume: 1800, anomalies: 0 },
];

export const OverviewPage: React.FC = () => {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchMerchants(search, sector, offset).then(data => {
      setMerchants(data.merchants || []);
      setTotal(data.total || 0);
    });
    fetchAlerts().then(setAlerts);
    fetchSegments().then(setSegments);
  }, [search, sector, offset]);

  const segmentColors = ['#3b82f6','#22c55e','#eab308','#ef4444','#a855f7'];

  return (
    <div className="space-y-8">
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl border-green-500/20">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
           <input 
             type="text" 
             placeholder="Search 5,000+ merchants by name or ID..." 
             className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-green-500 transition-all"
             value={search}
             onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
           />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-green-500"
            value={sector}
            onChange={(e) => { setSector(e.target.value); setOffset(0); }}
          >
            <option value="all">All Sectors</option>
            {['Retail', 'Electronics', 'Food & Bev', 'Industrial', 'Apparel', 'Medical', 'Agriculture', 'Chemical', 'Packaging'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-xl border border-slate-700">
             <span className="text-[10px] text-slate-500 uppercase font-bold">Total:</span>
             <span className="text-xs text-white font-mono">{total}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Merchants Monitored', value: '5,000', sub: '+12% this week', icon: Users, color: 'brand' },
          { label: 'Avg Health Score', value: '724 / 1000', sub: 'Live PyTorch LSTM', icon: Activity, color: 'blue' },
          { label: 'Intervention Queue', value: alerts.length.toString(), sub: 'Score drop > 100pts', icon: AlertTriangle, color: 'red' },
          { label: 'BNPL Exposure', value: '$2.4M', sub: 'XGBoost managed', icon: Shield, color: 'purple' },
        ].map((kpi, i) => (
          <div key={i} className="glass-panel p-5 rounded-2xl group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">{kpi.label}</span>
              <kpi.icon className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{kpi.value}</div>
            <div className={`text-xs mt-2 px-2 py-1 rounded-md inline-block font-medium ${kpi.color === 'brand' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : kpi.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : kpi.color === 'red' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Velocity Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5">Portfolio Health Velocity — 7 Day Kafka Stream</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="day" stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis domain={[600, 800]} stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="score" stroke="#22c55e" fill="url(#g1)" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Distribution */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5">Merchant Segmentation</h3>
          <div className="space-y-3">
            {segments.map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-xs text-slate-400 w-20 shrink-0">{s.sector}</div>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(s.count / 500) * 100}%`, backgroundColor: segmentColors[i] }} />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-slate-800">
            <h4 className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-medium">K-Means Cohorts Active</h4>
            <div className="flex gap-2">
              {['Premium', 'Growth', 'Stable', 'At-Risk', 'New'].map((c, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className="w-full h-1 rounded-full mb-1" style={{ backgroundColor: segmentColors[i] }} />
                  <span className="text-[9px] text-slate-600">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Intervention Queue */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> LSTM Anomaly Detection — Intervention Queue</h3>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-md">{alerts.length} active alerts</span>
        </div>
        <div className="divide-y divide-slate-800/50">
          {alerts.map((a: any, i: number) => (
            <div key={i} className="flex items-center px-6 py-4 hover:bg-slate-800/30 transition-colors cursor-pointer group">
              <div className={`w-2 h-2 rounded-full mr-4 shrink-0 ${a.severity === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-200">{a.name}</span>
                  <span className="text-xs text-slate-500 font-mono">{a.merchant_id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>{a.severity.toUpperCase()}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Score dropped <span className="text-red-400 font-bold">-{a.score_drop} pts</span> over {a.days} days</div>
              </div>
              <button className="ml-4 text-xs text-slate-600 group-hover:text-brand-400 transition-colors border border-transparent group-hover:border-brand-500/30 px-3 py-1.5 rounded-lg">Investigate →</button>
            </div>
          ))}
        </div>
      </div>

      {/* Merchant Grid */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Merchant Portfolio — Live Health Feed</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {merchants.map((m: any, i: number) => (
            <div key={i} className="glass-panel p-4 rounded-xl hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(34,197,94,0.1)] transition-all duration-300 cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-mono text-slate-500">{m.merchant_id}</span>
                <span className={`w-2 h-2 rounded-full ${m.health_score > 700 ? 'bg-green-500' : m.health_score > 600 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              </div>
              <div className="text-sm font-semibold text-slate-200 mb-1">{m.name}</div>
              <div className="text-xs text-slate-500 mb-3">{m.sector}</div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl font-bold text-white">{m.health_score}</div>
                  <div className="text-[10px] text-slate-600">/ 1000</div>
                </div>
                <div className="h-8 w-16">
                  <svg viewBox="0 0 60 30" className="w-full h-full">
                    <polyline points={`0,${30 - (m.health_score / 1000) * 30} 15,${30 - (m.health_score / 1000 * 0.9) * 30} 30,${30 - (m.health_score / 1000 * 1.05) * 30} 45,${30 - (m.health_score / 1000 * 0.95) * 30} 60,${30 - (m.health_score / 1000) * 30}`}
                      fill="none" stroke={m.health_score > 700 ? '#22c55e' : '#eab308'} strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {total > 12 && (
          <div className="mt-8 flex items-center justify-center gap-4">
             <button 
               disabled={offset === 0}
               onClick={() => setOffset(Math.max(0, offset - 12))}
               className="p-2 rounded-full border border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
             >
               <ChevronLeft className="w-5 h-5" />
             </button>
             <span className="text-xs text-slate-500 font-mono">
                Showing {offset + 1}-{Math.min(offset + 12, total)} of {total}
             </span>
             <button 
               disabled={offset + 12 >= total}
               onClick={() => setOffset(offset + 12)}
               className="p-2 rounded-full border border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
             >
               <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
