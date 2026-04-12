import React from 'react';
import { Server, Database, Cpu, GitBranch, Activity, Globe } from 'lucide-react';

const techStack = [
  { layer: 'Streaming', tool: 'Apache Kafka', detail: 'merchant_transactions topic · Consumer Groups', status: 'running', icon: Activity },
  { layer: 'Backend API', tool: 'FastAPI + WebSockets', detail: 'Uvicorn · Celery task queue · Port 8000', status: 'running', icon: Server },
  { layer: 'Agent Orchestration', tool: 'LangGraph + Google ADK', detail: 'MerchantState · Conditional routing · Retry logic', status: 'running', icon: GitBranch },
  { layer: 'LLM Reasoning', tool: 'Groq — LLaMA 3.3 70B', detail: 'Ultra-fast inference · Free tier', status: 'running', icon: Cpu },
  { layer: 'ML — Credit', tool: 'XGBoost + SHAP', detail: 'v2.0.3 · Tabular credit model · Explainability', status: 'trained', icon: Database },
  { layer: 'ML — Anomaly', tool: 'PyTorch LSTM', detail: 'hidden_size=16 · Payment rhythm detection', status: 'trained', icon: Cpu },
  { layer: 'ML — RecSys', tool: 'Two-Tower PyTorch + FAISS', detail: '50k embeddings dim=64 · < 10ms retrieval', status: 'trained', icon: Database },
  { layer: 'ML — Forecasting', tool: 'Facebook Prophet', detail: 'Yearly + Weekly seasonality · Category curves', status: 'trained', icon: Activity },
  { layer: 'ML — Segmentation', tool: 'K-Means + UMAP', detail: '5 cohorts · 8-dimensional behavior space', status: 'trained', icon: GitBranch },
  { layer: 'MLOps', tool: 'MLflow + Sentry', detail: 'Experiment tracking · Error monitoring', status: 'active', icon: GitBranch },
  { layer: 'Primary Database', tool: 'PostgreSQL 15', detail: 'BNPL ledger · Time-series KPIs', status: 'running', icon: Database },
  { layer: 'Feature Store', tool: 'Redis 7', detail: 'Sub-ms ML feature serving · Celery broker', status: 'running', icon: Server },
  { layer: 'Document Store', tool: 'MongoDB 6', detail: 'Scraped intel · Agent conversation history', status: 'running', icon: Database },
  { layer: 'Analytics', tool: 'dbt + Metabase', detail: 'Star schema transform · Signed iframe embed', status: 'active', icon: Globe },
  { layer: 'Scraping', tool: 'Playwright + Scrapy', detail: 'JS-rendered portals + Static feeds', status: 'active', icon: Globe },
  { layer: 'Scheduling', tool: 'Apache Airflow', detail: 'DAG pipelines · Scraping + Retraining', status: 'active', icon: GitBranch },
  { layer: 'Monitoring', tool: 'Prometheus + Grafana', detail: 'API metrics · System health dashboards', status: 'running', icon: Activity },
  { layer: 'DevOps', tool: 'Docker Compose', detail: '8 containers · One-command deploy', status: 'running', icon: Server },
];

const statusCfg: Record<string, any> = {
  running: { label: '● LIVE', cls: 'text-green-400 bg-green-500/10 border-green-500/20' },
  trained: { label: '● TRAINED', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  active: { label: '● ACTIVE', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
};

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">Platform Architecture & Tech Stack</h2>
        <p className="text-sm text-slate-500 mt-1">18 production technologies · Docker-orchestrated · One-command deployment</p>
      </div>

      {/* Architecture Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl text-center">
          <div className="text-3xl font-black text-white mb-1">5</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest">AI Modules</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl text-center">
          <div className="text-3xl font-black text-green-400 mb-1">8</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest">Docker Containers</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl text-center">
          <div className="text-3xl font-black text-blue-400 mb-1">18</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest">Tech Layers</div>
        </div>
      </div>

      {/* Full Stack Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-300">Complete Technology Registry</h3>
        </div>
        <div className="divide-y divide-slate-800/50">
          {techStack.map((t, i) => {
            const cfg = statusCfg[t.status];
            return (
              <div key={i} className="flex items-center px-6 py-4 hover:bg-slate-800/20 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center mr-4 shrink-0">
                  <t.icon className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                </div>
                <div className="w-36 shrink-0">
                  <span className="text-xs text-slate-600 uppercase tracking-widest">{t.layer}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{t.tool}</div>
                  <div className="text-xs text-slate-600 mt-0.5 truncate">{t.detail}</div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${cfg.cls}`}>{cfg.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
