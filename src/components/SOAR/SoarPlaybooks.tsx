import React, { useState } from 'react';
import { 
  Workflow, 
  Play, 
  Code2, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  FileCode2, 
  Copy, 
  Check, 
  RotateCw,
  Sparkles
} from 'lucide-react';
import { MOCK_PLAYBOOKS } from '../../data/mockData';
import { Playbook } from '../../types';
import { socAudio } from '../../utils/audio';

export const SoarPlaybooks: React.FC = () => {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(MOCK_PLAYBOOKS);
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook>(playbooks[0]);
  const [runningPlaybookId, setRunningPlaybookId] = useState<string | null>(null);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  
  // Sigma Rule Studio state
  const [activeRuleTitle, setActiveRuleTitle] = useState('AWS S3 Bulk Exfiltration via External Tor Proxy');
  const [sigmaCode, setSigmaCode] = useState(`title: AWS S3 Bulk Exfiltration via External Tor Proxy
id: a7f10b28-89c0-4211-9a1b-e54728901234
status: production
description: Detects high-velocity S3 GetObject API calls originating from known Tor exit nodes or unverified proxy IPs.
references:
  - https://attack.mitre.org/techniques/T1567/002/
author: CloudSec SOC Lead
date: 2026-09-15
logsource:
  product: aws
  service: cloudtrail
detection:
  selection:
    eventSource: 's3.amazonaws.com'
    eventName: 'GetObject'
  filter_known_subnets:
    sourceIPAddress|startswith: '10.'
  filter_tor_exit_nodes:
    sourceIPAddress:
      - '185.220.101.42'
      - '91.240.118.89'
  timeframe: 2m
  condition: selection and filter_tor_exit_nodes and not filter_known_subnets | count() by sourceIPAddress > 50
level: critical
tags:
  - attack.exfiltration
  - attack.t1567.002
  - attack.t1530`);

  const [ruleTestResult, setRuleTestResult] = useState<string | null>(null);
  const [isTestingRule, setIsTestingRule] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleRunPlaybook = async (pb: Playbook) => {
    setRunningPlaybookId(pb.id);
    socAudio.playBlip();
    setSimulationLogs([`[0.00s] Dispatching manual SOAR dry-run: ${pb.name}...`]);

    for (let i = 0; i < pb.steps.length; i++) {
      const step = pb.steps[i];
      await new Promise((r) => setTimeout(r, 600));
      setSimulationLogs((prev) => [
        ...prev,
        `[+${(i * 0.6 + 0.3).toFixed(2)}s] [STEP ${i + 1}/${pb.steps.length}] Executing ${step.name}...`,
        `[+${(i * 0.6 + 0.6).toFixed(2)}s] [OK] Completed with returncode 0.`,
      ]);
    }

    await new Promise((r) => setTimeout(r, 400));
    socAudio.playSuccess();
    setSimulationLogs((prev) => [
      ...prev,
      `[COMPLETE] Playbook ${pb.id} executed successfully. Telemetry checkpoint committed.`,
    ]);
    setRunningPlaybookId(null);

    // Increment run count
    setPlaybooks((prev) =>
      prev.map((item) => (item.id === pb.id ? { ...item, runsCount: item.runsCount + 1 } : item))
    );
  };

  const handleTestRule = () => {
    setIsTestingRule(true);
    setRuleTestResult(null);
    socAudio.playBlip();

    setTimeout(() => {
      setIsTestingRule(false);
      setRuleTestResult(
        'Rule validated successfully against CloudTrail stream (14,820 eps). 2 active alerts triggered in last 10m window.'
      );
      socAudio.playSuccess();
    }, 900);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sigmaCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 tactical-grid">
        <div className="flex items-center gap-2 mb-1">
          <Workflow className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
            SOAR Automated Playbooks & Detection Engineering Studio
          </h2>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Orchestrate automated containment workflows and craft cloud-native Sigma detection rules with live ingestion testing.
        </p>
      </div>

      {/* Playbooks Grid & Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Playbook List */}
        <div className="lg:col-span-1 space-y-2.5">
          <span className="text-xs font-mono font-bold uppercase text-slate-400 block mb-1">
            Registered SOAR Playbooks ({playbooks.length})
          </span>
          {playbooks.map((pb) => {
            const isSelected = selectedPlaybook.id === pb.id;
            return (
              <div
                key={pb.id}
                onClick={() => setSelectedPlaybook(pb)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-cyan-300 truncate">{pb.name}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                    {pb.estimatedTime}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans line-clamp-2 mb-2">
                  {pb.description}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
                  <span>Runs: {pb.runsCount}</span>
                  <span>Target: {pb.targetType}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Playbook Details & Runner */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-4 tactical-grid flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
              <div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  {selectedPlaybook.category} Playbook
                </span>
                <h3 className="text-base font-bold font-mono text-white mt-1">
                  {selectedPlaybook.name}
                </h3>
              </div>

              <button
                onClick={() => handleRunPlaybook(selectedPlaybook)}
                disabled={Boolean(runningPlaybookId)}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{runningPlaybookId === selectedPlaybook.id ? 'Running Playbook...' : 'Execute Dry-Run'}</span>
              </button>
            </div>

            {/* Sequence steps */}
            <div className="space-y-2 mb-4">
              <span className="text-xs font-mono font-bold uppercase text-slate-400 block mb-1">
                Execution Workflow Steps:
              </span>
              {selectedPlaybook.steps.map((step, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 font-bold text-[10px]">
                        Step {idx + 1}
                      </span>
                      <span className="text-white font-semibold">{step.name}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">Automated</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{step.action}</div>
                  <div className="mt-1 text-[10px] text-slate-500 font-mono">
                    CLI: <code className="text-cyan-300">{step.cliPreview}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulation Output Drawer */}
          {simulationLogs.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>Simulation Console Log</span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 text-slate-300 text-[11px]">
                {simulationLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sigma Detection Rules Studio */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 tactical-grid">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold font-mono text-white uppercase">
                Sigma / YARA-L Cloud Detection Rule Studio
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Deploy cross-platform SIEM rules to detect adversarial cloud maneuvers before privilege escalation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy Sigma'}</span>
            </button>

            <button
              onClick={handleTestRule}
              disabled={isTestingRule}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isTestingRule ? 'animate-spin' : ''}`} />
              <span>{isTestingRule ? 'Testing...' : 'Test Against CloudTrail Stream'}</span>
            </button>
          </div>
        </div>

        {/* Sigma Code Editor */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 font-mono text-xs">
          <textarea
            value={sigmaCode}
            onChange={(e) => setSigmaCode(e.target.value)}
            rows={12}
            className="w-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>

        {ruleTestResult && (
          <div className="mt-3 p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{ruleTestResult}</span>
          </div>
        )}
      </div>
    </div>
  );
};
