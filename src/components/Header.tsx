import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Radio, 
  Volume2, 
  VolumeX, 
  Zap, 
  Bot, 
  Clock, 
  Activity,
  Layers,
  Cloud
} from 'lucide-react';
import { socAudio } from '../utils/audio';

interface HeaderProps {
  activeIncidentsCount: number;
  criticalCount: number;
  onOpenSimulator: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeIncidentsCount,
  criticalCount,
  onOpenSimulator,
  onToggleCopilot,
  isCopilotOpen,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [utcTime, setUtcTime] = useState('');
  const [eps, setEps] = useState(14820);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setUtcTime(now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Subtle live fluctuation in events per second
  useEffect(() => {
    const interval = setInterval(() => {
      setEps((prev) => Math.floor(prev + (Math.random() * 40 - 20)));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const toggleAudio = () => {
    const next = !audioEnabled;
    setAudioEnabled(next);
    socAudio.enabled = next;
    if (next) socAudio.playBlip();
  };

  const defconLevel = criticalCount > 0 ? 'DEFCON 2' : activeIncidentsCount > 0 ? 'DEFCON 3' : 'DEFCON 4';
  const defconColor = criticalCount > 0 
    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
    : 'bg-amber-500/20 text-amber-400 border-amber-500/40';

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & SOC Indicator */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white font-mono">
                  CloudSec<span className="text-cyan-400 font-normal">Monitor</span>
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  SOC v4.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                Multi-Cloud SIEM & SOAR Mesh
              </p>
            </div>
          </div>

          {/* Defcon Indicator Mobile/Desktop */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono font-semibold ${defconColor}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
            <span>{defconLevel}</span>
            <span className="text-[10px] opacity-70 hidden sm:inline">
              {criticalCount > 0 ? '• CRITICAL ALERTS' : '• ELEVATED WATCH'}
            </span>
          </div>
        </div>

        {/* Cloud Connectors & Ingestion Telemetry */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Cloud className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">CONNECTORS:</span>
            <span className="text-emerald-400 flex items-center gap-1">
              AWS <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              GCP <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              AZURE <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            </span>
            <span className="text-emerald-400 flex items-center gap-1">
              K8S <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">INGESTION:</span>
            <span className="text-indigo-300 font-semibold">{eps.toLocaleString()} eps</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{utcTime}</span>
          </div>
        </div>

        {/* Tactical Actions & Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Audio Alert Toggle */}
          <button
            onClick={toggleAudio}
            title={audioEnabled ? "Tactical Audio Alerts: ON" : "Tactical Audio Alerts: MUTED"}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              audioEnabled 
                ? 'bg-slate-900 border-slate-700 text-cyan-400 hover:bg-slate-800' 
                : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Attack Simulator Launcher */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/50 text-rose-300 text-xs font-mono font-medium transition-all shadow-[0_0_12px_rgba(244,63,94,0.15)] active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Inject Attack Sim</span>
          </button>

          {/* AI SecOps Copilot Drawer Toggle */}
          <button
            onClick={onToggleCopilot}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all active:scale-95 ${
              isCopilotOpen
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-cyan-500/40'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>
        </div>

      </div>
    </header>
  );
};
