import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Play, 
  Pause, 
  Filter, 
  Terminal, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TelemetryLog, CloudProvider, Severity } from '../../types';
import { INITIAL_TELEMETRY_LOGS } from '../../data/mockData';
import { socAudio } from '../../utils/audio';

interface LiveTelemetryStreamProps {
  onInspectLog?: (log: TelemetryLog) => void;
}

const SAMPLE_GENERATORS: Array<() => Omit<TelemetryLog, 'id' | 'timestamp'>> = [
  () => ({
    provider: 'AWS',
    service: 'CloudTrail',
    eventName: 'AssumeRoleWithWebIdentity',
    principal: 'arn:aws:iam::482910:role/EKS-Worker-Node',
    sourceIp: '10.0.4.19',
    severity: 'INFORMATIONAL',
    isThreat: false,
  }),
  () => ({
    provider: 'AWS',
    service: 'GuardDuty',
    eventName: 'Trojan:EC2/DNSDataExfiltration',
    principal: 'i-098ba42910c',
    sourceIp: '185.220.101.42',
    severity: 'CRITICAL',
    isThreat: true,
  }),
  () => ({
    provider: 'GCP',
    service: 'CloudAudit',
    eventName: 'compute.firewalls.patch',
    principal: 'svc-terraform-runner@gcp.iam.gserviceaccount.com',
    sourceIp: '35.192.14.88',
    severity: 'LOW',
    isThreat: false,
  }),
  () => ({
    provider: 'AZURE',
    service: 'EntraID',
    eventName: 'UserRiskDetection',
    principal: 'j.smith@cloudsec-corp.com',
    sourceIp: '102.89.44.12',
    severity: 'HIGH',
    isThreat: true,
  }),
  () => ({
    provider: 'KUBERNETES',
    service: 'AdmissionWebhook',
    eventName: 'PodSecurityViolation',
    principal: 'system:serviceaccount:default:pipeline',
    sourceIp: '10.244.2.14',
    severity: 'MEDIUM',
    isThreat: false,
  }),
  () => ({
    provider: 'AWS',
    service: 'S3',
    eventName: 'PutBucketAcl',
    principal: 'arn:aws:iam::482910:user/temp-developer',
    sourceIp: '91.240.118.89',
    severity: 'CRITICAL',
    isThreat: true,
  }),
];

export const LiveTelemetryStream: React.FC<LiveTelemetryStreamProps> = ({ onInspectLog }) => {
  const [logs, setLogs] = useState<TelemetryLog[]>(INITIAL_TELEMETRY_LOGS);
  const [isStreaming, setIsStreaming] = useState(true);
  const [filterThreatsOnly, setFilterThreatsOnly] = useState(false);
  const [selectedLog, setSelectedLog] = useState<TelemetryLog | null>(null);

  // Live simulation ticker
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const generator = SAMPLE_GENERATORS[Math.floor(Math.random() * SAMPLE_GENERATORS.length)];
      const sample = generator();
      const now = new Date();
      const timeStr = now.toTimeString().substring(0, 8);

      const newLog: TelemetryLog = {
        ...sample,
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: timeStr,
      };

      if (newLog.isThreat) {
        socAudio.playBlip();
      }

      setLogs((prev) => [newLog, ...prev.slice(0, 24)]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const displayedLogs = filterThreatsOnly ? logs.filter((l) => l.isThreat) : logs;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 tactical-grid relative overflow-hidden backdrop-blur-sm flex flex-col h-[460px]">
      {/* Stream Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold font-mono text-white tracking-wide uppercase">
            Live Telemetry Ingestion Feed
          </h2>
          <span className="flex h-2 w-2 relative">
            {isStreaming && (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setFilterThreatsOnly(!filterThreatsOnly)}
            className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
              filterThreatsOnly
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Threats Only</span>
          </button>

          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isStreaming
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {isStreaming ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isStreaming ? 'Pause' : 'Resume'}</span>
          </button>
        </div>
      </div>

      {/* Log Feed Table/List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px] pr-1">
        {displayedLogs.map((log) => {
          const isSelected = selectedLog?.id === log.id;
          const severityColors = {
            CRITICAL: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
            HIGH: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
            MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
            LOW: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            INFORMATIONAL: 'text-slate-400 bg-slate-800/40 border-slate-700/50',
          }[log.severity];

          return (
            <div
              key={log.id}
              onClick={() => setSelectedLog(isSelected ? null : log)}
              className={`p-2 rounded border transition-colors cursor-pointer flex flex-col gap-1 ${
                log.isThreat 
                  ? 'bg-rose-950/25 border-rose-500/40 hover:bg-rose-900/30' 
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {log.provider}
                  </span>
                  <span className="text-cyan-300 font-semibold truncate">{log.service}</span>
                  <span className="text-slate-300 truncate">::{log.eventName}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${severityColors}`}>
                    {log.severity}
                  </span>
                  {isSelected ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </div>

              {/* Summary line */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 truncate">
                <span className="truncate">Principal: <span className="text-slate-200">{log.principal}</span></span>
                <span className="text-slate-500">IP: <span className="text-slate-300">{log.sourceIp}</span></span>
              </div>

              {/* Expanded JSON Inspector */}
              {isSelected && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 bg-slate-950 p-2.5 rounded text-[10px] font-mono text-cyan-300 overflow-x-auto">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span>EVENT PAYLOAD INSPECTOR</span>
                    <span className="text-emerald-400">SIEM Normalized (OCSF Schema)</span>
                  </div>
                  <pre className="text-slate-300 whitespace-pre-wrap">
{JSON.stringify(
  {
    event_id: log.id,
    timestamp: log.timestamp,
    cloud_provider: log.provider,
    service_name: log.service,
    event_name: log.eventName,
    actor: {
      principal: log.principal,
      source_ip: log.sourceIp,
      threat_confidence: log.isThreat ? 95 : 0,
    },
    risk_assessment: {
      severity: log.severity,
      requires_analyst_review: log.isThreat,
    },
  },
  null,
  2
)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
