import React, { useState } from 'react';
import { 
  FileCheck2, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  FileText
} from 'lucide-react';
import { MOCK_COMPLIANCE } from '../../data/mockData';
import { ComplianceControl } from '../../types';

export const ComplianceHub: React.FC = () => {
  const [controls] = useState<ComplianceControl[]>(MOCK_COMPLIANCE);
  const [selectedFramework, setSelectedFramework] = useState<string>('ALL');

  const frameworks = [
    { name: 'CIS AWS Foundations', code: 'CIS', score: 86, passing: 48, total: 56, color: 'text-cyan-400' },
    { name: 'SOC 2 Type II', code: 'SOC2', score: 79, passing: 38, total: 48, color: 'text-emerald-400' },
    { name: 'ISO/IEC 27001:2022', code: 'ISO27001', score: 84, passing: 92, total: 110, color: 'text-indigo-400' },
    { name: 'NIST CSF 2.0', code: 'NIST', score: 75, passing: 64, total: 85, color: 'text-amber-400' },
    { name: 'PCI-DSS v4.0', code: 'PCI-DSS', score: 91, passing: 52, total: 57, color: 'text-purple-400' },
  ];

  const filteredControls = selectedFramework === 'ALL'
    ? controls
    : controls.filter((c) => c.framework === selectedFramework);

  // Generate and download audit package
  const handleExportAuditPackage = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      organization: 'Enterprise Cloud Operations',
      globalScore: '83%',
      complianceFrameworks: frameworks,
      controlsAuditLog: controls,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudsec-audit-readiness-report-${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 tactical-grid flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold font-mono text-white tracking-wide uppercase">
              Compliance & Security Audit Readiness Center
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Automated compliance mapping across CIS Benchmarks, SOC 2, ISO 27001, NIST CSF, and PCI-DSS.
          </p>
        </div>

        <button
          onClick={handleExportAuditPackage}
          className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Package (.JSON)</span>
        </button>
      </div>

      {/* Framework Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {frameworks.map((fw) => (
          <div
            key={fw.code}
            onClick={() => setSelectedFramework(fw.code === selectedFramework ? 'ALL' : fw.code)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedFramework === fw.code
                ? 'bg-slate-800/90 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 truncate">
              {fw.name}
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-2xl font-bold font-mono ${fw.color}`}>
                {fw.score}%
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {fw.passing}/{fw.total} Controls
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-indigo-400 h-full" style={{ width: `${fw.score}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Controls Detail Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 tactical-grid">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold font-mono text-white uppercase">
              Control Audit Matrix ({filteredControls.length} Controls)
            </h3>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono">
            <span className="text-slate-400 mr-1 text-[11px]">Filter:</span>
            {['ALL', 'CIS', 'SOC2', 'ISO27001', 'NIST', 'PCI-DSS'].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFramework(f)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  selectedFramework === f
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredControls.map((ctrl) => {
            const isFailed = ctrl.status === 'FAILED';
            const isWarning = ctrl.status === 'WARNING';

            const statusBadge = isFailed
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : isWarning
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';

            return (
              <div
                key={ctrl.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">{ctrl.id}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {ctrl.framework}
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${statusBadge}`}>
                      {ctrl.status}
                    </span>
                    {ctrl.affectedResourcesCount > 0 && (
                      <span className="text-[10px] text-rose-400 font-bold">
                        {ctrl.affectedResourcesCount} Affected Assets
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-white font-sans">{ctrl.title}</div>
                  <p className="text-xs text-slate-400 font-sans">{ctrl.description}</p>
                  <div className="text-[11px] text-emerald-400/90 pt-1">
                    <span className="text-slate-500">Remediation:</span> {ctrl.remediationGuidance}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
