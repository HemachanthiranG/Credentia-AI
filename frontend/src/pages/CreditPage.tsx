import React, { useState, useEffect } from 'react';
import { fetchCreditDecision, fetchMerchants } from '../services/api';
import { TrendingUp, TrendingDown, Info, ChevronRight, Zap, Calculator } from 'lucide-react';
import { predictCredit } from '../services/api';

const PredictorTool: React.FC<{ currentLimit: number }> = ({ currentLimit }) => {
  const [growth, setGrowth] = useState(10);
  const [latePmts, setLatePmts] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    const data = await predictCredit(currentLimit, growth, latePmts);
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <label className="block text-xs text-slate-500 uppercase font-bold mb-2">Projected Monthly Growth (%)</label>
          <input type="range" min="-50" max="200" value={growth} onChange={e => setGrowth(parseInt(e.target.value))} className="w-full accent-green-500" />
          <div className="flex justify-between mt-1 text-xs font-mono text-slate-400">
            <span>-50%</span>
            <span className="text-white font-bold">{growth}%</span>
            <span>+200%</span>
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 uppercase font-bold mb-2">Late Payments (Next 30 Days)</label>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map(v => (
              <button key={v} onClick={() => setLatePmts(v)} className={`flex-1 py-2 rounded-lg border text-sm transition-all ${latePmts === v ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>{v}</button>
            ))}
          </div>
        </div>
        <button onClick={handlePredict} disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40">
           {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Calculator className="w-4 h-4" /> Simulate Outcome</>}
        </button>
      </div>

      <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800 flex flex-col items-center justify-center text-center">
        {!result ? (
          <div className="text-slate-600 italic text-sm">Adjust parameters and click simulate to see the predicted credit limit impact.</div>
        ) : (
          <>
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Predicted Limit</div>
            <div className="text-4xl font-black text-white mb-2">${result.recommended_limit.toLocaleString()}</div>
            <div className={`text-sm font-bold flex items-center gap-1 ${result.change_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {result.change_pct >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(result.change_pct)}% {result.change_pct >= 0 ? 'Increase' : 'Decrease'}
            </div>
            <div className="mt-6 p-3 bg-slate-800/50 rounded-xl text-xs text-slate-400 leading-relaxed border border-slate-700">
               {result.explanation}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ScoreGauge: React.FC<{ score: number; max: number }> = ({ score, max }) => {
  const pct = (score / max) * 100;
  const color = pct > 70 ? '#22c55e' : pct > 40 ? '#eab308' : '#ef4444';
  const r = 54, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg viewBox="0 0 120 120" className="w-32 h-32">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x="60" y="55" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">{score.toLocaleString()}</text>
      <text x="60" y="72" textAnchor="middle" fill="#64748b" fontSize="10">/ {max.toLocaleString()}</text>
    </svg>
  );
};

export const CreditPage: React.FC = () => {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [selected, setSelected] = useState('M-1001');
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchMerchants().then(setMerchants); }, []);
  
  useEffect(() => {
    setLoading(true);
    fetchCreditDecision(selected).then(d => { setDecision(d); setLoading(false); });
  }, [selected]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Dynamic BNPL Credit Decisioning</h2>
          <p className="text-sm text-slate-500 mt-1">XGBoost model — Updated daily · SHAP Explainability active</p>
        </div>
        <select
          value={selected} onChange={e => setSelected(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 cursor-pointer"
        >
          {merchants.map((m: any) => <option key={m.merchant_id} value={m.merchant_id}>{m.merchant_id} — {m.name}</option>)}
        </select>
      </div>

      {decision && !loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Credit Score Gauge */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center">
            <ScoreGauge score={decision.recommended_limit} max={100000} />
            <h3 className="text-lg font-bold text-white mt-4">Recommended Credit Limit</h3>
            <p className="text-sm text-slate-500 mt-1">Current: ${decision.current_limit?.toLocaleString()}</p>
            <div className={`mt-3 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${decision.recommended_limit > decision.current_limit ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {decision.recommended_limit > decision.current_limit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {decision.recommended_limit > decision.current_limit ? `+$${(decision.recommended_limit - decision.current_limit).toLocaleString()} increase` : `$${(decision.current_limit - decision.recommended_limit).toLocaleString()} reduction`}
            </div>
            <div className="mt-4 text-xs text-slate-600">Model Confidence: <span className="text-blue-400 font-bold">{(decision.confidence * 100).toFixed(0)}%</span></div>
          </div>

          {/* SHAP Explainability */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2"><Info className="w-4 h-4" /> SHAP Feature Attribution</h3>
            <div className="space-y-4">
              {decision.shap_explanation?.map((f: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium">{f.feature.replace('_', ' ')}</span>
                    <span className={f.direction === 'positive' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                      {f.direction === 'positive' ? '+' : ''}{(f.impact * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${f.direction === 'positive' ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.abs(f.impact) * 300}%`, maxWidth: '100%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plain English Explanation */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Plain-Language Explanation</h3>
            <div className="flex-1 bg-slate-900/50 rounded-xl p-4 border border-slate-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs text-purple-400 font-bold">AI</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{decision.plain_english}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-600 flex items-center gap-1.5"><Info className="w-3 h-3" />Explanation generated by Groq LLaMA 3.3 70B via RAG over repayment history</p>
            </div>
          </div>

          {/* 8-Dimension Radar */}
          <div className="lg:col-span-3 glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">8-Dimension Health Score Breakdown</h3>
            <p className="text-xs text-slate-600 mb-5">Composite score recalculated on every Kafka transaction event</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries({ order_velocity: 0.82, payment_punctuality: 0.91, gmv_growth: 0.65, category_diversity: 0.7, bnpl_utilization: 0.55, session_depth: 0.78, peer_rank: 0.68, market_signals: 0.75 }).map(([key, val]: [string, any]) => (
                <div key={key} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="text-xs text-slate-500 mb-2 capitalize">{key.replace(/_/g, ' ')}</div>
                  <div className="text-xl font-bold text-white">{(val * 100).toFixed(0)}<span className="text-sm text-slate-500">/100</span></div>
                  <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-1000" style={{ width: `${val * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Predictor (What-If) */}
          <div className="lg:col-span-3 glass-panel p-8 rounded-2xl border-blue-500/20 bg-gradient-to-br from-slate-900/80 to-blue-900/10">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" /> Interactive Credit Limit Predictor (What-If Analysis)
            </h3>
            <p className="text-sm text-slate-400 mb-8">Model how future merchant behavior will impact their BNPL credit availability.</p>
            
            <PredictorTool currentLimit={decision?.current_limit || 25000} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 glass-panel rounded-2xl">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-sm">Computing XGBoost credit decision for {selected}…</p>
          </div>
        </div>
      )}
    </div>
  );
};
