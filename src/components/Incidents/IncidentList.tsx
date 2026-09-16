import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ShieldAlert, 
  AlertTriangle, 
  Flame, 
  Play, 
  Bot, 
  CheckCircle2, 
  Clock, 
  User, 
  Layers, 
  ExternalLink 
} from 'lucide-react';
import { SecurityIncident, Severity, IncidentStatus, CloudProvider } from '../../types';

interface IncidentListProps {
  incidents: SecurityIncident[];
  onSelectIncident: (incident: SecurityIncident) => void;
  onQuickContain: (incidentId: string) => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  onSelectIncident,
  onQuickContain,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedProvider, setSelectedProvider] = useState<string>('ALL');

  const filteredIncidents = incidents.filter((incident) => {
    if (selectedSeverity !== 'ALL' && incident.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'ALL' && incident.status !== selectedStatus) return false;
    if (selectedProvider !== 'ALL' && incident.cloudProvider !== selectedProvider) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = incident.title.toLowerCase().includes(q);
      const matchResource = incident.affectedResource.toLowerCase().includes(q);
      const matchIp = incident.rawTelemetry?.sourceIPAddress?.toLowerCase().includes(q);
      const matchMitre = incident.mitreTechnique?.toLowerCase().includes(q);
      if (!matchTitle && !matchResource && !matchIp && !matchMitre) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Filter Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 tactical-grid">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              SOC Incident Triage Queue ({filteredIncidents.length} Records)
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Live multi-cloud security alerts triaged by risk, blast radius, and MITRE ATT&CK technique.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ARN, IP, or attack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <span className="text-slate-500 flex items-center gap-1 mr-1 text-[11px]">
            <Filter className="w-3 h-3" /> Filters:
          </span>

          {/* Cloud Provider */}
          <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            {['ALL', 'AWS', 'GCP', 'AZURE'].map((provider) => (
              <button
                key={provider}
                onClick={() => setSelectedProvider(provider)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  selectedProvider === provider
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {provider}
              </button>
            ))}
          </div>

          {/* Severity */}
          <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  selectedSeverity === sev
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            {['ALL', 'ACTIVE', 'INVESTIGATING', 'CONTAINED'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  selectedStatus === st
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incident List Cards */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/60 rounded-xl border border-slate-800 font-mono text-slate-400 text-sm">
            No security incidents match the selected filter criteria.
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const isCritical = incident.severity === 'CRITICAL';
            const isHigh = incident.severity === 'HIGH';
            const isContained = incident.status === 'CONTAINED' || incident.status === 'RESOLVED';

            const sevBadge = isCritical 
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' 
              : isHigh 
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';

            const statusBadge = isContained
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : incident.status === 'INVESTIGATING'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/30';

            return (
              <div
                key={incident.id}
                className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all duration-200 backdrop-blur-sm relative overflow-hidden group"
              >
                {/* Left accent border */}
                <div 
                  className={`absolute top-0 left-0 bottom-0 w-1 ${
                    isCritical ? 'bg-rose-500' : isHigh ? 'bg-amber-500' : 'bg-yellow-500'
                  }`} 
                />

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pl-2">
                  
                  {/* Main Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">{incident.id}</span>
                      
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${sevBadge}`}>
                        {incident.severity}
                      </span>

                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                        {incident.cloudProvider} • {incident.region}
                      </span>

                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {incident.mitreId} ({incident.mitreTechnique})
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${statusBadge}`}>
                        {incident.status}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => onSelectIncident(incident)}
                      className="text-sm font-semibold font-mono text-white hover:text-cyan-300 cursor-pointer transition-colors"
                    >
                      {incident.title}
                    </h3>

                    {/* Description preview */}
                    <p className="text-xs text-slate-400 font-sans line-clamp-1">
                      {incident.description}
                    </p>

                    {/* Asset & Meta row */}
                    <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                      <span className="text-slate-300 truncate max-w-md">
                        <span className="text-slate-500">Resource:</span> {incident.affectedResource}
                      </span>
                      <span>
                        <span className="text-slate-500">IP:</span> {incident.rawTelemetry.sourceIPAddress}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" /> {incident.timestamp}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <User className="w-3 h-3 text-slate-500" /> {incident.assignee}
                      </span>
                    </div>
                  </div>

                  {/* Blast Radius & Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 shrink-0 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    
                    {/* Blast Radius indicator */}
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-slate-500 text-[10px]">BLAST RADIUS:</span>
                      <span className={`font-bold ${incident.blastRadiusScore > 75 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {incident.blastRadiusScore}/100
                      </span>
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${incident.blastRadiusScore > 75 ? 'bg-rose-500' : 'bg-amber-500'}`} 
                          style={{ width: `${incident.blastRadiusScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {!isContained && (
                        <button
                          onClick={() => onQuickContain(incident.id)}
                          className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3" /> Quick Contain
                        </button>
                      )}

                      <button
                        onClick={() => onSelectIncident(incident)}
                        className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.3)] cursor-pointer"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Investigate</span>
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
