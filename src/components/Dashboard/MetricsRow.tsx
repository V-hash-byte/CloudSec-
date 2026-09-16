import React from 'react';
import { 
  ShieldCheck, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Server, 
  TrendingDown, 
  TrendingUp 
} from 'lucide-react';

interface MetricsRowProps {
  securityScore: number;
  criticalIncidentsCount: number;
  highIncidentsCount: number;
  totalAssetsCount: number;
  vulnerableAssetsCount: number;
  onNavigateToIncidents: () => void;
  onNavigateToAssets: () => void;
}

export const MetricsRow: React.FC<MetricsRowProps> = ({
  securityScore,
  criticalIncidentsCount,
  highIncidentsCount,
  totalAssetsCount,
  vulnerableAssetsCount,
  onNavigateToIncidents,
  onNavigateToAssets,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      
      {/* Metric 1: Global Security Posture */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Cloud Posture Index</span>
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
        </div>
        
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold font-mono text-white tracking-tight">
            {securityScore}<span className="text-sm font-normal text-slate-500">/100</span>
          </span>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            GRADE B+
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1 text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4.2% this week</span>
          </div>
          <span className="text-slate-500">CIS Benchmark: 86%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-700" 
            style={{ width: `${securityScore}%` }}
          />
        </div>
      </div>

      {/* Metric 2: Active High & Critical Threats */}
      <div 
        onClick={onNavigateToIncidents}
        className="bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm cursor-pointer transition-all group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Threats</span>
          <AlertOctagon className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-mono text-rose-400 tracking-tight">
            {criticalIncidentsCount + highIncidentsCount}
          </span>
          <span className="text-xs font-mono text-slate-400">UNCONTAINED</span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] font-mono">
          <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
            {criticalIncidentsCount} CRITICAL
          </span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
            {highIncidentsCount} HIGH
          </span>
        </div>

        <div className="mt-2.5 text-[11px] font-mono text-rose-400/80 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" /> High Attack Velocity
          </span>
          <span className="underline group-hover:text-rose-300">Triage Queue →</span>
        </div>
      </div>

      {/* Metric 3: MTTD & MTTR Velocity */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Detection & Resolution</span>
          <Clock className="w-4 h-4 text-indigo-400" />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <div className="text-[10px] font-mono text-slate-400">MTTD (DETECT)</div>
            <div className="text-xl font-bold font-mono text-white">3.4 <span className="text-xs font-normal text-slate-400">min</span></div>
            <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" /> -42s avg
            </div>
          </div>

          <div className="border-l border-slate-800 pl-2">
            <div className="text-[10px] font-mono text-slate-400">MTTR (RESOLVE)</div>
            <div className="text-xl font-bold font-mono text-white">16.8 <span className="text-xs font-normal text-slate-400">min</span></div>
            <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" /> SOAR auto
            </div>
          </div>
        </div>

        <div className="mt-2.5 text-[10px] font-mono text-slate-500">
          88% of incidents quarantined via playbook in &lt; 30s
        </div>
      </div>

      {/* Metric 4: Multi-Cloud Inventory Posture */}
      <div 
        onClick={onNavigateToAssets}
        className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm cursor-pointer transition-all group"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Monitored Assets</span>
          <Server className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold font-mono text-white tracking-tight">
            {totalAssetsCount}
          </span>
          <span className="text-xs font-mono text-slate-400">ACROSS 4 CLOUDS</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
          <span className="text-rose-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            {vulnerableAssetsCount} Misconfigured
          </span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {totalAssetsCount - vulnerableAssetsCount} Hardened
          </span>
        </div>

        <div className="mt-2.5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span className="text-slate-500">AWS • GCP • AZURE • K8S</span>
          <span className="text-cyan-400 underline group-hover:text-cyan-300">Inventory →</span>
        </div>
      </div>

    </div>
  );
};
