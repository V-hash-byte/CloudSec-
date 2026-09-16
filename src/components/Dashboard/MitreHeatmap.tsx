import React, { useState } from 'react';
import { Target, AlertTriangle, ShieldCheck, ChevronRight, Info } from 'lucide-react';
import { SecurityIncident } from '../../types';

interface MitreHeatmapProps {
  incidents: SecurityIncident[];
  onSelectIncident: (incident: SecurityIncident) => void;
}

interface MitreColumn {
  tactic: string;
  techniques: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

const MITRE_TACTICS: MitreColumn[] = [
  {
    tactic: 'Initial Access',
    techniques: [
      { id: 'T1078.004', name: 'Cloud Accounts', description: 'Adversaries compromise valid cloud credentials via leaks or phishing.' },
      { id: 'T1190', name: 'Exploit Public App', description: 'Exploiting internet-facing application vulnerabilities.' },
    ],
  },
  {
    tactic: 'Execution',
    techniques: [
      { id: 'T1059.009', name: 'Cloud API Cmd', description: 'Executing commands via AWS CLI / gcloud / az client.' },
      { id: 'T1610', name: 'Deploy Container', description: 'Deploying unauthorized images or pods in Kubernetes.' },
    ],
  },
  {
    tactic: 'Persistence',
    techniques: [
      { id: 'T1098.001', name: 'Cloud Credentials', description: 'Creating additional IAM access keys or service account tokens.' },
      { id: 'T1574', name: 'Hijack Execution', description: 'Persisting hooks inside CI/CD runners or serverless triggers.' },
    ],
  },
  {
    tactic: 'Privilege Escalation',
    techniques: [
      { id: 'T1098', name: 'Account Manipulation', description: 'Attaching AdministratorAccess or wildcard IAM policies.' },
      { id: 'T1548', name: 'Abuse Elevation', description: 'Circumventing IAM permission boundaries and SCP guards.' },
    ],
  },
  {
    tactic: 'Defense Evasion',
    techniques: [
      { id: 'T1562.001', name: 'Disable CloudTrail', description: 'Stopping multi-region audit trails or GuardDuty detectors.' },
      { id: 'T1578', name: 'Modify Cloud Compute', description: 'Modifying security groups to allow unmonitored egress.' },
    ],
  },
  {
    tactic: 'Credential Access',
    techniques: [
      { id: 'T1110.003', name: 'Password Spraying', description: 'Automated testing of weak passwords across cloud tenants.' },
      { id: 'T1552.005', name: 'Cloud Instance Metadata', description: 'Querying IMDSv1 to extract IAM role credentials.' },
    ],
  },
  {
    tactic: 'Discovery',
    techniques: [
      { id: 'T1046', name: 'Network Port Scan', description: 'Scanning internal VPC subnets for open database/admin ports.' },
      { id: 'T1580', name: 'Cloud Asset Discovery', description: 'Listing buckets, databases, and VMs via describe calls.' },
    ],
  },
  {
    tactic: 'Collection',
    techniques: [
      { id: 'T1530', name: 'Data from Cloud Object', description: 'Bulk retrieval of objects from S3 buckets or Cloud Storage.' },
      { id: 'T1114', name: 'Email Collection', description: 'Harvesting inbox data via Microsoft Graph or Gmail APIs.' },
    ],
  },
  {
    tactic: 'Exfiltration',
    techniques: [
      { id: 'T1567.002', name: 'Exfil over Web Service', description: 'Piping sensitive data to Tor exit nodes or external storage.' },
      { id: 'T1048', name: 'Exfiltration Over Alt Port', description: 'DNS tunneling or HTTPS POST to adversary C2 server.' },
    ],
  },
  {
    tactic: 'Impact',
    techniques: [
      { id: 'T1496', name: 'Resource Hijacking', description: 'Mining cryptocurrency using compromised compute power.' },
      { id: 'T1485', name: 'Data Destruction', description: 'Irreversible deletion of RDS snapshots or S3 archives.' },
    ],
  },
];

export const MitreHeatmap: React.FC<MitreHeatmapProps> = ({ incidents, onSelectIncident }) => {
  const [selectedTechnique, setSelectedTechnique] = useState<{ id: string; name: string; description: string } | null>(null);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 tactical-grid relative overflow-hidden backdrop-blur-sm">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold font-mono text-white tracking-wide uppercase">
            MITRE ATT&CK Cloud Matrix Correlation Heatmap
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"></span> Active Incidents
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <span className="w-2.5 h-2.5 rounded bg-slate-800 inline-block border border-slate-700"></span> Guarded / Monitored
          </span>
        </div>
      </div>

      {/* Horizontal Scrollable Matrix */}
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-[1000px]">
          {MITRE_TACTICS.map((col) => {
            return (
              <div key={col.tactic} className="flex-1 min-w-[140px] bg-slate-950/70 rounded-lg p-2 border border-slate-800/80">
                <div className="text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-wider mb-2 pb-1 border-b border-slate-800 truncate">
                  {col.tactic}
                </div>

                <div className="space-y-1.5">
                  {col.techniques.map((tech) => {
                    // Check if any active incidents match this technique
                    const matchedIncidents = incidents.filter(
                      (i) => i.mitreId.startsWith(tech.id) || i.mitreTechnique.toLowerCase().includes(tech.name.toLowerCase())
                    );
                    const hasActiveAlert = matchedIncidents.length > 0;

                    return (
                      <button
                        key={tech.id}
                        onClick={() => setSelectedTechnique(tech)}
                        className={`w-full text-left p-1.5 rounded text-[10px] font-mono transition-all border block cursor-pointer ${
                          hasActiveAlert
                            ? 'bg-rose-950/40 text-rose-300 border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                            : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-semibold truncate">{tech.name}</span>
                          {hasActiveAlert && (
                            <span className="px-1 py-0.2 rounded bg-rose-500 text-white font-bold text-[8px] animate-pulse">
                              {matchedIncidents.length}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 text-[9px] block">{tech.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Technique Drill-down Panel */}
      {selectedTechnique && (
        <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-cyan-500/30 font-mono text-xs text-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold text-[10px] border border-cyan-500/40">
                {selectedTechnique.id}
              </span>
              <span className="font-bold text-white text-sm">{selectedTechnique.name}</span>
            </div>
            <p className="text-slate-400 text-xs">{selectedTechnique.description}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-400">
              {incidents.filter((i) => i.mitreId.startsWith(selectedTechnique.id)).length} Active Alerts
            </span>
            <button
              onClick={() => setSelectedTechnique(null)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
