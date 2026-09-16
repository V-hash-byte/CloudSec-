import React, { useState } from 'react';
import { 
  Server, 
  Search, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  ExternalLink,
  Layers,
  Database,
  Lock,
  Radio
} from 'lucide-react';
import { CloudAsset, CloudProvider } from '../../types';
import { socAudio } from '../../utils/audio';

interface AssetInventoryProps {
  assets: CloudAsset[];
  onRemediateAsset: (assetId: string) => void;
}

export const AssetInventory: React.FC<AssetInventoryProps> = ({ assets, onRemediateAsset }) => {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [remediatingId, setRemediatingId] = useState<string | null>(null);

  const filteredAssets = assets.filter((asset) => {
    if (providerFilter !== 'ALL' && asset.provider !== providerFilter) return false;
    if (statusFilter !== 'ALL' && asset.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        asset.name.toLowerCase().includes(q) ||
        asset.type.toLowerCase().includes(q) ||
        asset.region.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRemediate = (assetId: string) => {
    setRemediatingId(assetId);
    socAudio.playBlip();
    setTimeout(() => {
      onRemediateAsset(assetId);
      setRemediatingId(null);
      socAudio.playSuccess();
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 tactical-grid">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              Multi-Cloud Asset Posture & CSPM Inventory ({filteredAssets.length} Assets)
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Continuous security posture assessment across compute, storage, identity, and container workloads.
            </p>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter asset name, type, region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <span className="text-slate-500 text-[11px]">Provider:</span>
          <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            {['ALL', 'AWS', 'GCP', 'AZURE', 'KUBERNETES'].map((p) => (
              <button
                key={p}
                onClick={() => setProviderFilter(p)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  providerFilter === p
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <span className="text-slate-500 text-[11px] ml-2">Posture:</span>
          <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800">
            {['ALL', 'Vulnerable', 'Warning', 'Secure', 'Isolated'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  statusFilter === st
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

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredAssets.map((asset) => {
          const isVulnerable = asset.status === 'Vulnerable';
          const isWarning = asset.status === 'Warning';
          const isIsolated = asset.status === 'Isolated';
          const isRemediating = remediatingId === asset.id;

          const statusBadge = isVulnerable
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            : isWarning
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            : isIsolated
            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

          return (
            <div
              key={asset.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all backdrop-blur-sm relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                      {asset.provider}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{asset.type} • {asset.region}</span>
                  </div>
                  <h3 className="text-sm font-bold font-mono text-white truncate max-w-sm">
                    {asset.name}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${statusBadge}`}>
                    {asset.status}
                  </span>
                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    Risk: <span className={asset.riskScore > 70 ? 'text-rose-400 font-bold' : 'text-slate-300'}>{asset.riskScore}/100</span>
                  </div>
                </div>
              </div>

              {/* Tags & Scanned row */}
              <div className="flex flex-wrap items-center gap-1.5 my-2.5">
                {Object.entries(asset.tags).map(([k, v]) => (
                  <span key={k} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                    {k}: <span className="text-slate-300">{v}</span>
                  </span>
                ))}
              </div>

              {/* Misconfiguration & Action */}
              {asset.remediationAction ? (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="text-rose-300/90 text-[11px] truncate flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{asset.remediationAction}</span>
                  </div>

                  <button
                    onClick={() => handleRemediate(asset.id)}
                    disabled={isRemediating}
                    className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Wrench className={`w-3 h-3 ${isRemediating ? 'animate-spin' : ''}`} />
                    <span>{isRemediating ? 'Hardening...' : 'Auto-Remediate'}</span>
                  </button>
                </div>
              ) : (
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-emerald-400/90">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Posture Hardened & Scanned
                  </span>
                  <span className="text-slate-500 text-[10px]">Scanned: {asset.lastScanned}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
