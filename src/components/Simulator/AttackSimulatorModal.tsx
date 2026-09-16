import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  Flame, 
  ShieldAlert, 
  Database, 
  Key, 
  Cpu, 
  Globe, 
  CheckCircle2, 
  RotateCw 
} from 'lucide-react';
import { SecurityIncident, CloudProvider } from '../../types';
import { socAudio } from '../../utils/audio';

interface AttackSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectIncident: (incident: SecurityIncident) => void;
}

export const AttackSimulatorModal: React.FC<AttackSimulatorModalProps> = ({
  isOpen,
  onClose,
  onInjectIncident,
}) => {
  const [injectingScenarioId, setInjectingScenarioId] = useState<string | null>(null);

  if (!isOpen) return null;

  const attackScenarios = [
    {
      id: 'SIM-S3-EXFIL',
      title: 'AWS S3 Bucket Mass Exfiltration via Tor Exit Node',
      provider: 'AWS' as CloudProvider,
      region: 'us-east-1',
      resource: 'arn:aws:s3:::prod-customer-pii-vault-2026',
      resourceType: 'S3 Bucket' as const,
      severity: 'CRITICAL' as const,
      category: 'Data Exfiltration' as const,
      mitreTactic: 'Exfiltration',
      mitreTechnique: 'Exfiltration Over Web Service',
      mitreId: 'T1567.002',
      icon: Database,
      description: 'Simulates 5,000 rapid GetObject requests hitting unencrypted PII bucket from Tor IP 185.220.101.42.',
    },
    {
      id: 'SIM-IAM-BACKDOOR',
      title: 'Compromised CI/CD Runner IAM Role Backdoor Access Key',
      provider: 'AWS' as CloudProvider,
      region: 'us-west-2',
      resource: 'arn:aws:iam::482910394012:role/DevopsPipelineRunner',
      resourceType: 'IAM Role' as const,
      severity: 'CRITICAL' as const,
      category: 'Privilege Escalation' as const,
      mitreTactic: 'Privilege Escalation',
      mitreTechnique: 'Cloud Infrastructure Discovery & Escalation',
      mitreId: 'T1098.001',
      icon: Key,
      description: 'Simulates unauthorized CreateAccessKey call generating root-equivalent admin tokens from Russian IP.',
    },
    {
      id: 'SIM-K8S-CRYPTO',
      title: 'GKE Kubernetes Cluster Cryptomining DaemonSet Injection',
      provider: 'GCP' as CloudProvider,
      region: 'us-central1',
      resource: 'gke-prod-billing-us-central1/kube-system/xm-daemon',
      resourceType: 'Kubernetes Pod' as const,
      severity: 'HIGH' as const,
      category: 'Cryptojacking' as const,
      mitreTactic: 'Execution',
      mitreTechnique: 'Deploy Container with Malicious Image',
      mitreId: 'T1610',
      icon: Cpu,
      description: 'Simulates TeamTNT automated worm scheduling XMRig miner across all 12 worker nodes via anonymous kubelet.',
    },
    {
      id: 'SIM-ENTRA-TRAVEL',
      title: 'Azure Entra ID Impossible Travel & Password Spray Attack',
      provider: 'AZURE' as CloudProvider,
      region: 'westeurope',
      resource: 'user:marcus.vance@cloudsec-enterprise.com',
      resourceType: 'IAM Role' as const,
      severity: 'HIGH' as const,
      category: 'Credential Access' as const,
      mitreTactic: 'Credential Access',
      mitreTechnique: 'Password Spraying',
      mitreId: 'T1110.003',
      icon: Globe,
      description: 'Simulates simultaneous login anomalies in Frankfurt and Lagos within 4 minutes triggering token compromise.',
    },
  ];

  const handleInject = (scenario: typeof attackScenarios[0]) => {
    setInjectingScenarioId(scenario.id);
    socAudio.playAlarm();

    setTimeout(() => {
      const newIncident: SecurityIncident = {
        id: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: scenario.title,
        severity: scenario.severity,
        category: scenario.category,
        cloudProvider: scenario.provider,
        region: scenario.region,
        affectedResource: scenario.resource,
        resourceType: scenario.resourceType,
        mitreTactic: scenario.mitreTactic,
        mitreTechnique: scenario.mitreTechnique,
        mitreId: scenario.mitreId,
        timestamp: 'Just now',
        status: 'ACTIVE',
        assignee: 'Unassigned (Automated Triage)',
        description: scenario.description,
        blastRadiusScore: scenario.severity === 'CRITICAL' ? 92 : 74,
        playbookAvailable: 'QUARANTINE_S3_BUCKET',
        rawTelemetry: {
          eventSource: `${scenario.provider.toLowerCase()}.cloudsec.internal`,
          eventName: 'SimulatedAttackTrigger',
          sourceIPAddress: '185.220.101.42',
          rawLog: JSON.stringify({
            scenario_id: scenario.id,
            simulated_by: 'SOC Red Team Injector',
            target: scenario.resource,
            threat_severity: scenario.severity,
          }),
        },
        aiAnalysis: {
          threatActorAnalysis: 'Real-time telemetry signature match: High-velocity adversary penetration campaign detected.',
          rootCause: 'Simulated policy drift or exploited credential leakage in target cloud environment.',
          blastRadius: `Immediate risk to ${scenario.resource}. Connected services tagged for evaluation.`,
          recommendedAction: 'Trigger immediate automated SOAR containment playbook.',
          confidenceScore: 99,
          mitreChain: [scenario.mitreTactic, scenario.mitreTechnique],
          containmentPlaybookSteps: [
            'Isolate network interface and apply strict security group',
            'Revoke active STS credentials and session tokens',
            'Snapshot attached storage volumes for offline forensics',
          ],
          cisoSummary: `A simulated ${scenario.severity} attack scenario was successfully injected into the SOC pipeline.`,
        },
      };

      onInjectIncident(newIncident);
      setInjectingScenarioId(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-[0_0_50px_rgba(244,63,94,0.25)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <Flame className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-white">
                Live Cloud Attack Scenario Injector
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Red Team Adversary Emulation & Playbook Validation Suite
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 font-sans">
          <p className="text-xs text-slate-300">
            Select a realistic cloud threat scenario to inject into your live SIEM ingestion pipeline. This will generate live alerts, trigger DEFCON escalation, and exercise SOAR playbooks.
          </p>

          <div className="space-y-2.5">
            {attackScenarios.map((scenario) => {
              const Icon = scenario.icon;
              const isInjecting = injectingScenarioId === scenario.id;

              return (
                <div
                  key={scenario.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-slate-800 text-slate-300">
                          {scenario.provider}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                          scenario.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}>
                          {scenario.severity}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {scenario.mitreId}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold font-mono text-white group-hover:text-rose-300 transition-colors">
                        {scenario.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5 line-clamp-2">
                        {scenario.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleInject(scenario)}
                    disabled={Boolean(injectingScenarioId)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(244,63,94,0.3)] shrink-0 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <Zap className={`w-3.5 h-3.5 ${isInjecting ? 'animate-spin' : ''}`} />
                    <span>{isInjecting ? 'Injecting Attack...' : 'Launch Attack'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-right">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
