import React, { useState } from 'react';
import { Cloud, ShieldAlert, CheckCircle, AlertTriangle, Globe, MapPin, Zap } from 'lucide-react';
import { CloudProvider, SecurityIncident } from '../../types';

interface MultiCloudTopologyProps {
  incidents: SecurityIncident[];
  onSelectIncident: (incident: SecurityIncident) => void;
}

export const MultiCloudTopology: React.FC<MultiCloudTopologyProps> = ({
  incidents,
  onSelectIncident,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const cloudNodes = [
    {
      id: 'aws-east',
      name: 'AWS us-east-1 (N. Virginia)',
      provider: 'AWS' as CloudProvider,
      activeIncidents: incidents.filter((i) => i.cloudProvider === 'AWS' && i.region === 'us-east-1'),
      status: 'CRITICAL',
      assetCount: 142,
      vpcCount: 6,
      latency: '24ms',
    },
    {
      id: 'aws-west',
      name: 'AWS us-west-2 (Oregon)',
      provider: 'AWS' as CloudProvider,
      activeIncidents: incidents.filter((i) => i.cloudProvider === 'AWS' && i.region === 'us-west-2'),
      status: 'CRITICAL',
      assetCount: 89,
      vpcCount: 4,
      latency: '48ms',
    },
    {
      id: 'gcp-central',
      name: 'GCP us-central1 (Iowa)',
      provider: 'GCP' as CloudProvider,
      activeIncidents: incidents.filter((i) => i.cloudProvider === 'GCP' && i.region === 'us-central1'),
      status: 'HIGH',
      assetCount: 110,
      vpcCount: 3,
      latency: '36ms',
    },
    {
      id: 'gcp-europe',
      name: 'GCP europe-west1 (Belgium)',
      provider: 'GCP' as CloudProvider,
      activeIncidents: incidents.filter((i) => i.cloudProvider === 'GCP' && i.region === 'europe-west1'),
      status: 'MEDIUM',
      assetCount: 64,
      vpcCount: 2,
      latency: '92ms',
    },
    {
      id: 'az-westeurope',
      name: 'Azure West Europe (Amsterdam)',
      provider: 'AZURE' as CloudProvider,
      activeIncidents: incidents.filter((i) => i.cloudProvider === 'AZURE' && i.region === 'westeurope'),
      status: 'HIGH',
      assetCount: 95,
      vpcCount: 5,
      latency: '88ms',
    },
    {
      id: 'k8s-mesh',
      name: 'Kubernetes Multi-Cluster Mesh',
      provider: 'KUBERNETES' as CloudProvider,
      activeIncidents: incidents.filter((i) => i.cloudProvider === 'KUBERNETES'),
      status: 'SECURE',
      assetCount: 320,
      vpcCount: 12,
      latency: '12ms',
    },
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 tactical-grid relative overflow-hidden backdrop-blur-sm">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold font-mono text-white tracking-wide uppercase">
            Multi-Cloud Attack Surface & Regional Nodes
          </h2>
        </div>
        
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Active Threat Target
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Nominal Posture
          </span>
        </div>
      </div>

      {/* Grid of Cloud Regions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {cloudNodes.map((node) => {
          const hasCritical = node.activeIncidents.some((i) => i.severity === 'CRITICAL');
          const hasHigh = node.activeIncidents.some((i) => i.severity === 'HIGH');
          const hasThreats = node.activeIncidents.length > 0;

          const borderColor = hasCritical 
            ? 'border-rose-500/50 bg-rose-950/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]' 
            : hasHigh 
            ? 'border-amber-500/40 bg-amber-950/15' 
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700';

          return (
            <div 
              key={node.id} 
              className={`rounded-lg p-3.5 border transition-all relative overflow-hidden ${borderColor}`}
            >
              {/* Radar pulse badge */}
              {hasThreats && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  <Zap className="w-3 h-3 text-rose-400" />
                  <span>{node.activeIncidents.length} THREAT{node.activeIncidents.length > 1 ? 'S' : ''}</span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-cyan-300 border border-slate-700">
                  {node.provider}
                </span>
                <span className="text-xs font-semibold font-mono text-white truncate">
                  {node.name}
                </span>
              </div>

              {/* Node Stats */}
              <div className="grid grid-cols-3 gap-1.5 my-2.5 py-2 px-2 bg-slate-950/60 rounded border border-slate-800/60 text-[10px] font-mono text-slate-400">
                <div>
                  <span className="block text-slate-500">ASSETS</span>
                  <span className="text-white font-semibold">{node.assetCount}</span>
                </div>
                <div>
                  <span className="block text-slate-500">NETWORKS</span>
                  <span className="text-white font-semibold">{node.vpcCount} VPCs</span>
                </div>
                <div>
                  <span className="block text-slate-500">TELEMETRY</span>
                  <span className="text-cyan-400 font-semibold">{node.latency}</span>
                </div>
              </div>

              {/* Incidents attached to this node */}
              {node.activeIncidents.length > 0 ? (
                <div className="space-y-1.5 mt-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Active Vector:
                  </span>
                  {node.activeIncidents.map((incident) => (
                    <button
                      key={incident.id}
                      onClick={() => onSelectIncident(incident)}
                      className="w-full text-left p-1.5 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                    >
                      <div className="truncate flex items-center gap-1.5 text-xs font-mono">
                        <span className={`w-1.5 h-1.5 rounded-full ${incident.severity === 'CRITICAL' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                        <span className="text-slate-200 group-hover:text-cyan-300 truncate text-[11px]">
                          {incident.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 shrink-0 group-hover:underline">
                        Investigate →
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/90 mt-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Zero detected anomalies in this zone</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
