import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Bot, 
  Play, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Terminal, 
  Layers, 
  Server, 
  FileText, 
  Clock, 
  ExternalLink,
  RotateCw,
  Zap
} from 'lucide-react';
import { SecurityIncident, IncidentStatus, AIAnalysis } from '../../types';
import { MOCK_PLAYBOOKS } from '../../data/mockData';
import { socAudio } from '../../utils/audio';

interface IncidentDetailModalProps {
  incident: SecurityIncident;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: IncidentStatus) => void;
}

type ModalTab = 'AI_ANALYSIS' | 'SOAR_PLAYBOOK' | 'RAW_TELEMETRY' | 'BLAST_RADIUS' | 'TIMELINE';

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('AI_ANALYSIS');
  const [copiedJson, setCopiedJson] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>(incident.aiAnalysis || {});
  
  // SOAR Execution state
  const [isPlayingPlaybook, setIsPlayingPlaybook] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [playbookCompleted, setPlaybookCompleted] = useState(incident.status === 'CONTAINED' || incident.status === 'RESOLVED');
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);

  // Find playbook if available
  const playbook = MOCK_PLAYBOOKS.find((p) => p.id === incident.playbookAvailable) || MOCK_PLAYBOOKS[0];

  const handleCopyTelemetry = () => {
    navigator.clipboard.writeText(JSON.stringify(incident.rawTelemetry, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Re-run Gemini AI investigation
  const handleReanalyzeWithAI = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/soc/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident }),
      });
      const data = await res.json();
      if (data?.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Failed to analyze with AI:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Execute SOAR Playbook
  const handleExecutePlaybook = async () => {
    if (isPlayingPlaybook || playbookCompleted) return;
    setIsPlayingPlaybook(true);
    setExecutionLogs([`[0.00s] Initializing SOAR Playbook: ${playbook.name}`]);
    setCurrentStepIndex(0);

    for (let i = 0; i < playbook.steps.length; i++) {
      setCurrentStepIndex(i);
      const step = playbook.steps[i];
      
      // Simulate real cloud step execution
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      setExecutionLogs((prev) => [
        ...prev,
        `[+${(i * 0.8 + 0.4).toFixed(2)}s] [EXEC] ${step.cliPreview}`,
        `[+${(i * 0.8 + 0.8).toFixed(2)}s] [SUCCESS] ${step.name} completed successfully.`,
      ]);
    }

    // Call server to log remediation event
    try {
      await fetch('/api/soc/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playbookId: playbook.id,
          incidentId: incident.id,
          resourceId: incident.affectedResource,
        }),
      });
    } catch {
      // Ignore
    }

    setIsPlayingPlaybook(false);
    setPlaybookCompleted(true);
    onUpdateStatus(incident.id, 'CONTAINED');
    socAudio.playSuccess();
    setExecutionLogs((prev) => [
      ...prev,
      `[COMPLETE] Incident ${incident.id} marked as CONTAINED. Quarantine active.`,
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">{incident.id}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                incident.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              }`}>
                {incident.severity}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-cyan-300 border border-slate-700">
                {incident.cloudProvider} ({incident.region})
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {incident.mitreId} - {incident.mitreTechnique}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold font-mono text-white tracking-wide">
              {incident.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Status Selector */}
            <select
              value={incident.status}
              onChange={(e) => onUpdateStatus(incident.id, e.target.value as IncidentStatus)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded px-2.5 py-1 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="ACTIVE">Status: ACTIVE</option>
              <option value="INVESTIGATING">Status: INVESTIGATING</option>
              <option value="CONTAINED">Status: CONTAINED</option>
              <option value="RESOLVED">Status: RESOLVED</option>
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-slate-800 bg-slate-950/40 px-4 pt-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'AI_ANALYSIS' as ModalTab, label: 'Gemini AI Investigation', icon: Bot },
            { id: 'SOAR_PLAYBOOK' as ModalTab, label: 'SOAR Containment', icon: Play },
            { id: 'BLAST_RADIUS' as ModalTab, label: 'Blast Radius Map', icon: Layers },
            { id: 'RAW_TELEMETRY' as ModalTab, label: 'Raw Audit Telemetry', icon: Terminal },
            { id: 'TIMELINE' as ModalTab, label: 'Timeline & Notes', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium rounded-t-lg transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-cyan-300 border-t border-x border-slate-700 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-sans">
          
          {/* TAB 1: AI INVESTIGATION */}
          {activeTab === 'AI_ANALYSIS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold font-mono text-cyan-300 uppercase">
                      Gemini SecOps Intelligence Report
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Confidence Score: {aiAnalysis.confidenceScore || 96}% • Zero-shot Multi-Cloud TTP Triage
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReanalyzeWithAI}
                  disabled={isAnalyzing}
                  className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-mono font-semibold text-xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Re-Analyze'}</span>
                </button>
              </div>

              {/* CISO Executive Briefing */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block mb-1">
                  Executive Briefing (CISO / Board Ready):
                </span>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {aiAnalysis.cisoSummary || 'Analyzing telemetry to formulate executive brief...'}
                </p>
              </div>

              {/* Root Cause & Threat Actor Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono font-bold uppercase text-rose-400 tracking-wider block mb-1">
                    Definitive Root Cause:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {aiAnalysis.rootCause || 'Root cause derivation in progress.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400 tracking-wider block mb-1">
                    Adversary Attribution & TTPs:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {aiAnalysis.threatActorAnalysis || 'Attribution correlation matching known cloud APT signatures.'}
                  </p>
                </div>
              </div>

              {/* Recommended Playbook Steps */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 tracking-wider block mb-2">
                  Prescribed Containment Sequence:
                </span>
                <div className="space-y-2 font-mono text-xs">
                  {(aiAnalysis.containmentPlaybookSteps || [
                    'Apply emergency quarantine security group',
                    'Invalidate active STS session tokens',
                    'Snapshot attached storage volume for forensics',
                  ]).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800">
                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => setActiveTab('SOAR_PLAYBOOK')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Proceed to SOAR Execution →</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SOAR PLAYBOOK */}
          {activeTab === 'SOAR_PLAYBOOK' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                      <Play className="w-4 h-4 text-emerald-400" />
                      {playbook.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      {playbook.description}
                    </p>
                  </div>

                  <button
                    onClick={handleExecutePlaybook}
                    disabled={isPlayingPlaybook || playbookCompleted}
                    className={`px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      playbookCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : isPlayingPlaybook
                        ? 'bg-amber-500 text-slate-950 animate-pulse'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                    }`}
                  >
                    {playbookCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Containment Active</span>
                      </>
                    ) : isPlayingPlaybook ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Executing Playbook...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Execute Containment Playbook</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Steps Visualizer */}
                <div className="space-y-2 mt-4">
                  {playbook.steps.map((step, idx) => {
                    const isDone = playbookCompleted || (isPlayingPlaybook && currentStepIndex > idx);
                    const isCurrent = isPlayingPlaybook && currentStepIndex === idx;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border font-mono text-xs transition-all ${
                          isDone
                            ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                            : isCurrent
                            ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border border-current">
                              {isDone ? '✓' : idx + 1}
                            </span>
                            <span className="font-semibold">{step.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {isDone ? 'COMPLETED' : isCurrent ? 'EXECUTING...' : 'PENDING'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 pl-7">{step.action}</div>
                        <div className="mt-1.5 pl-7 text-[10px] text-slate-500 font-mono">
                          CLI: <code className="text-cyan-400 bg-slate-950 px-1.5 py-0.5 rounded">{step.cliPreview}</code>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Execution Terminal Logs */}
              {executionLogs.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px]">
                  <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>SOAR Automation Execution Ledger</span>
                  </div>
                  <div className="bg-slate-900/90 rounded p-2.5 max-h-40 overflow-y-auto space-y-1 text-slate-300">
                    {executionLogs.map((line, i) => (
                      <div key={i} className="leading-tight">
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: BLAST RADIUS */}
          {activeTab === 'BLAST_RADIUS' && (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-white">
                      Blast Radius & Connected Cloud Topology
                    </h3>
                    <p className="text-xs text-slate-400">
                      Calculated dependency impact across VPC boundaries, attached IAM policies, and shared storage.
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-400 block">IMPACT SCORE</span>
                    <span className="text-xl font-bold text-rose-400">{incident.blastRadiusScore}/100</span>
                  </div>
                </div>

                {/* Topology Graph Visualizer */}
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 flex flex-col md:flex-row items-center justify-center gap-4 text-xs font-mono">
                  {/* Origin */}
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/60 text-center w-48">
                    <span className="text-[9px] text-rose-400 font-bold block uppercase">Primary Compromise</span>
                    <span className="text-white font-bold block truncate mt-1">{incident.affectedResource.split(':').pop()}</span>
                    <span className="text-[10px] text-slate-400">{incident.resourceType}</span>
                  </div>

                  <span className="text-slate-500 font-bold hidden md:inline">──────►</span>
                  <span className="text-slate-500 font-bold md:hidden">▼</span>

                  {/* Intermediary IAM */}
                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/50 text-center w-48">
                    <span className="text-[9px] text-amber-400 font-bold block uppercase">Assumed Permissions</span>
                    <span className="text-white font-bold block truncate mt-1">Cross-Account Trust</span>
                    <span className="text-[10px] text-slate-400">IAM Role Token</span>
                  </div>

                  <span className="text-slate-500 font-bold hidden md:inline">──────►</span>
                  <span className="text-slate-500 font-bold md:hidden">▼</span>

                  {/* Downstream Assets */}
                  <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/50 text-center w-48">
                    <span className="text-[9px] text-indigo-400 font-bold block uppercase">Exposed Boundaries</span>
                    <span className="text-white font-bold block truncate mt-1">Production VPC & S3</span>
                    <span className="text-[10px] text-slate-400">3 Cloud Services</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">DATA CLASSIFICATION</span>
                    <span className="text-rose-400 font-semibold">Restricted / PII Vault</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">LATERAL MOVEMENT RISK</span>
                    <span className="text-amber-400 font-semibold">Elevated (Active STS)</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">QUARANTINE READINESS</span>
                    <span className="text-emerald-400 font-semibold">100% (SOAR Armed)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RAW TELEMETRY */}
          {activeTab === 'RAW_TELEMETRY' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">
                  Raw SIEM / CloudTrail OCSF Forensic Record
                </span>
                <button
                  onClick={handleCopyTelemetry}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 overflow-x-auto text-[11px] text-cyan-300">
                <pre>{JSON.stringify(incident.rawTelemetry, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* TAB 5: TIMELINE & NOTES */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-4">
              <div className="space-y-3 font-mono text-xs">
                <div className="border-l-2 border-cyan-500 pl-3 space-y-1">
                  <span className="text-[10px] text-slate-500">{incident.timestamp}</span>
                  <div className="text-white font-semibold">Alert Triggered by Detection Engine</div>
                  <p className="text-slate-400 text-[11px] font-sans">
                    Rule "High-velocity S3 Exfiltration via External Proxy" matched CloudTrail stream.
                  </p>
                </div>

                <div className="border-l-2 border-indigo-500 pl-3 space-y-1">
                  <span className="text-[10px] text-slate-500">1 min later</span>
                  <div className="text-white font-semibold">Incident Assigned to {incident.assignee}</div>
                  <p className="text-slate-400 text-[11px] font-sans">
                    Automated triage dispatch assigned ticket to Cloud SecOps Tier-2 queue.
                  </p>
                </div>

                {playbookCompleted && (
                  <div className="border-l-2 border-emerald-500 pl-3 space-y-1">
                    <span className="text-[10px] text-emerald-400">Just now</span>
                    <div className="text-emerald-300 font-semibold">SOAR Containment Playbook Executed</div>
                    <p className="text-slate-400 text-[11px] font-sans">
                      Automated quarantine policy applied. Target resource isolated from network.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-500 hidden sm:inline">
            Incident Ledger Hash: #0x9a8f29104c9e
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
            >
              Close Workbench
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
