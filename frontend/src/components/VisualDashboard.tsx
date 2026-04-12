import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, AreaChart, Area, Cell, PieChart, Pie
} from 'recharts';

interface VisualDashboardProps {
  view: string;
}

const mockData = [
  { name: 'Mon', score: 720, volume: 4500, risk: 12 },
  { name: 'Tue', score: 715, volume: 5200, risk: 14 },
  { name: 'Wed', score: 735, volume: 4100, risk: 10 },
  { name: 'Thu', score: 680, volume: 8900, risk: 25 },
  { name: 'Fri', score: 705, volume: 6300, risk: 18 },
  { name: 'Sat', score: 740, volume: 2100, risk: 8 },
  { name: 'Sun', score: 755, volume: 1800, risk: 5 },
];

const sectorData = [
  { name: 'Retail', value: 400, color: '#3b82f6' },
  { name: 'Electronics', value: 300, color: '#22c55e' },
  { name: 'Food/Bev', value: 200, color: '#eab308' },
  { name: 'Industrial', value: 278, color: '#ef4444' },
];

export const VisualDashboard: React.FC<VisualDashboardProps> = ({ view }) => {
  return (
    <div className="w-full h-full space-y-6">
      <div className="grid grid-cols-2 gap-6 h-[250px]">
        {/* Trend Analysis */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Merchant Health Velocity</h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis domain={[600, 800]} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                itemStyle={{ color: '#22c55e' }}
              />
              <Area type="monotone" dataKey="score" stroke="#22c55e" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Sector Distribution */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Portfolio Segmentation</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex flex-col flex-1 min-h-[300px]">
        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Transaction Anomaly Log (LSTM Inference)</h4>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {[1,2,3,4,5].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${i === 2 ? 'bg-red-500 animate-pulse' : 'bg-brand-500'}`}></div>
                        <div>
                            <div className="text-sm font-medium text-slate-200">TXN-98234{i} - Merchant M-120{i}</div>
                            <div className="text-[10px] text-slate-500">Predicted Risk: {i === 2 ? 'High (Anomaly Detected)' : 'Normal Sequence'}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-slate-300">USD { (Math.random() * 5000 + 1000).toFixed(2) }</div>
                        <div className="text-[10px] text-slate-500">2 mins ago</div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
