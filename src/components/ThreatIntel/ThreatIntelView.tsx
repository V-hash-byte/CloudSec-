import React, { useState } from 'react';
import { 
  Crosshair, 
  Search, 
  ShieldAlert, 
  Globe, 
  ExternalLink, 
  AlertOctagon, 
  CheckCircle2, 
  Terminal,
  Database,
  Users
} from 'lucide-react';
import { ThreatFeedItem } from '../../types';
import { MOCK_THREAT_FEED } from '../../data/mockData';

export const ThreatIntelView: React.FC = () => {
  const [feed] = useState<ThreatFeedItem[]>(MOCK_THREAT_FEED);
  const [searchQuery, setSearchQuery] = useState('');
  const [lookupValue, setLookupValue] = useState('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupValue) return;

    setIsSearching(true);
    setTimeout(() => {
      // Check if matches known mock IOC
      const matched = feed.find((item) => item.value.toLowerCase() === lookupValue.toLowerCase().trim());
      if (matched) {
        setLookupResult({
          value: matched.value,
          reputation: 'MALICIOUS',
          threatGroup: matched.threatGroup,
          confidence: matched.confidence,
          malwareFamily: matched.malwareFamily,
          firstSeen: '2026-08-14',
          lastSeen: matched.lastSeen,
          detections: `${matched.reportsCount}/72 Security Vendors Flagged`,
          details: 'Known command-and-control IP relay actively targeting AWS IAM credentials and S3 buckets.',
        });
      } else {
        // Synthetic reputation check
        const isSuspicious = lookupValue.includes('185.') || lookupValue.includes('tor') || lookupValue.includes('dark');
        setLookupResult({
          value: lookupValue,
          reputation: isSuspicious ? 'SUSPICIOUS' : 'BENIGN / UNKNOWN',
          threatGroup: isSuspicious ? 'Potential Bulletproof Hoster' : 'Clean / Enterprise ASN',
          confidence: isSuspicious ? 78 : 12,
          malwareFamily: isSuspicious ? 'Automated Scanner' : 'None',
          firstSeen: '2026-09-01',
          lastSeen: '10 mins ago',
          detections: isSuspicious ? '18/72 Vendors Flagged' : '0/72 Vendors Flagged',
          details: isSuspicious
            ? 'IP exhibits abnormal port scan cadence against cloud perimeter endpoints.'
            : 'No active malicious telemetry linked to this indicator across global SOC feeds.',
        });
      }
      setIsSearching(false);
    }, 600);
  };

  const aptDossiers = [
    {
      name: 'Scattered Spider (UNC3944)',
      origin: 'Financially Motivated',
      targets: 'Cloud Identity, Okta, AWS IAM, Azure Entra',
      tradecraft: 'SIM swapping, SMS phishing, STS token abuse, S3 mass exfiltration',
      threatLevel: 'CRITICAL',
    },
    {
      name: 'APT29 / Nobelium (Midnight Blizzard)',
      origin: 'Nation State / SVR',
      targets: 'Cloud Tenants, Microsoft 365, OAuth Apps, Federated Trusts',
      tradecraft: 'Password spraying, MagicWeb DLL hijacking, malicious OAuth grants',
      threatLevel: 'CRITICAL',
    },
    {
      name: 'TeamTNT / Kinsing',
      origin: 'Cybercrime Cartel',
      targets: 'Kubernetes Clusters, Docker APIs, Redis, AWS EC2',
      tradecraft: 'Kubelet exploit (port 10250), container escape, XMRig cryptojacking',
      threatLevel: 'HIGH',
    },
    {
      name: 'Lazarus Group',
      origin: 'State-Sponsored',
      targets: 'Crypto Exchanges, Web3 Infrastructure, Cloud Key Vaults',
      tradecraft: 'Trojanized CLI tools, supply-chain npm packages, memory injection',
      threatLevel: 'CRITICAL',
    },
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* Search & Lookup Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 tactical-grid">
        <div className="flex items-center gap-2 mb-2">
          <Crosshair className="w-5 h-5 text-rose-400" />
          <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
            IOC Hunter & Threat Reputation Radar
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono mb-3">
          Query live adversary indicators against multi-cloud global threat feeds (AbuseIPDB, VirusTotal, AlienVault OTX).
        </p>

        <form onSubmit={handleLookup} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Enter IP (e.g. 185.220.101.42), Domain, or SHA256 Hash..."
              value={lookupValue}
              onChange={(e) => setLookupValue(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)] shrink-0"
          >
            {isSearching ? 'Scanning Feeds...' : 'Query Threat Radar'}
          </button>
        </form>

        {/* Quick Sample Links */}
        <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-slate-400">
          <span>Try quick sample:</span>
          <button
            type="button"
            onClick={() => setLookupValue('185.220.101.42')}
            className="text-cyan-400 hover:underline cursor-pointer"
          >
            185.220.101.42 (Tor Exit)
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setLookupValue('91.240.118.89')}
            className="text-cyan-400 hover:underline cursor-pointer"
          >
            91.240.118.89 (APT29)
          </button>
        </div>

        {/* Lookup Result Box */}
        {lookupResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-700 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  lookupResult.reputation === 'MALICIOUS'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : lookupResult.reputation === 'SUSPICIOUS'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {lookupResult.reputation}
                </span>
                <span className="text-white font-bold text-sm truncate">{lookupResult.value}</span>
              </div>
              <span className="text-slate-400 text-[11px]">{lookupResult.detections}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 my-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">THREAT ACTOR</span>
                <span className="text-cyan-300 font-semibold">{lookupResult.threatGroup}</span>
              </div>
              <div>
                <span className="text-slate-500 block">MALWARE FAMILY</span>
                <span className="text-rose-400 font-semibold">{lookupResult.malwareFamily}</span>
              </div>
              <div>
                <span className="text-slate-500 block">CONFIDENCE SCORE</span>
                <span className="text-white font-semibold">{lookupResult.confidence}%</span>
              </div>
            </div>

            <p className="text-slate-300 text-xs font-sans mt-2 pt-2 border-t border-slate-800">
              {lookupResult.details}
            </p>
          </div>
        )}
      </div>

      {/* Active IOCs Feed Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 tactical-grid">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-mono text-white uppercase">
              Curated Indicators of Compromise (IOC) Feed
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Sync: 1 min ago</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-wider">
                <th className="pb-2">Type</th>
                <th className="pb-2">Indicator Value</th>
                <th className="pb-2">Associated Threat Group</th>
                <th className="pb-2">Malware Family</th>
                <th className="pb-2">Confidence</th>
                <th className="pb-2">Reports</th>
                <th className="pb-2">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {feed.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-2.5 font-bold text-white truncate max-w-xs">{item.value}</td>
                  <td className="py-2.5 text-cyan-300">{item.threatGroup}</td>
                  <td className="py-2.5 text-slate-300">{item.malwareFamily}</td>
                  <td className="py-2.5 text-slate-400">{item.confidence}%</td>
                  <td className="py-2.5 text-slate-400">{item.reportsCount}</td>
                  <td className="py-2.5">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                      item.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    }`}>
                      {item.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Threat Actor Profiles */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 tactical-grid">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold font-mono text-white uppercase">
            Active Cloud Adversary Dossiers
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {aptDossiers.map((apt) => (
            <div key={apt.name} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-white font-bold text-sm">{apt.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[9px] font-bold">
                  {apt.threatLevel}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mb-2">
                Origin / Class: <span className="text-slate-200">{apt.origin}</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div>
                  <span className="text-slate-500">Target Vectors:</span>{' '}
                  <span className="text-cyan-300">{apt.targets}</span>
                </div>
                <div>
                  <span className="text-slate-500">Primary Tradecraft:</span>{' '}
                  <span className="text-slate-300">{apt.tradecraft}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
