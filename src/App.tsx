import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { MetricsRow } from './components/Dashboard/MetricsRow';
import { MultiCloudTopology } from './components/Dashboard/MultiCloudTopology';
import { LiveTelemetryStream } from './components/Dashboard/LiveTelemetryStream';
import { MitreHeatmap } from './components/Dashboard/MitreHeatmap';
import { IncidentList } from './components/Incidents/IncidentList';
import { IncidentDetailModal } from './components/Incidents/IncidentDetailModal';
import { AssetInventory } from './components/Assets/AssetInventory';
import { ThreatIntelView } from './components/ThreatIntel/ThreatIntelView';
import { SoarPlaybooks } from './components/SOAR/SoarPlaybooks';
import { ComplianceHub } from './components/Compliance/ComplianceHub';
import { AiCopilotDrawer } from './components/Copilot/AiCopilotDrawer';
import { AttackSimulatorModal } from './components/Simulator/AttackSimulatorModal';

import { INITIAL_INCIDENTS, MOCK_ASSETS } from './data/mockData';
import { SecurityIncident, IncidentStatus, CloudAsset } from './types';
import { socAudio } from './utils/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('COMMAND_CENTER');
  const [incidents, setIncidents] = useState<SecurityIncident[]>(INITIAL_INCIDENTS);
  const [assets, setAssets] = useState<CloudAsset[]>(MOCK_ASSETS);
  
  // Modals and Drawers
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  
  // Banner notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Status updates from modal or quick action
  const handleUpdateStatus = (id: string, newStatus: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc))
    );
    if (selectedIncident && selectedIncident.id === id) {
      setSelectedIncident((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    showToast(`Incident #${id} status updated to ${newStatus}`);
  };

  // Quick contain action
  const handleQuickContain = (incidentId: string) => {
    handleUpdateStatus(incidentId, 'CONTAINED');
    socAudio.playSuccess();
  };

  // Remediate asset
  const handleRemediateAsset = (assetId: string) => {
    setAssets((prev) =>
      prev.map((a) =>
        a.id === assetId
          ? {
              ...a,
              status: 'Secure',
              riskScore: Math.max(10, a.riskScore - 60),
              vulnerabilitiesCount: 0,
              compliancePassed: true,
              remediationAction: undefined,
              lastScanned: 'Just now (Hardened)',
            }
          : a
      )
    );
    showToast(`Asset #${assetId} hardened. Security controls enforced.`);
  };

  // Inject attack from simulator
  const handleInjectIncident = (newIncident: SecurityIncident) => {
    setIncidents((prev) => [newIncident, ...prev]);
    showToast(`ALERT: Injected ${newIncident.severity} threat: ${newIncident.title}`);
    // Open the new incident for triage
    setSelectedIncident(newIncident);
  };

  const activeIncidents = incidents.filter((i) => i.status === 'ACTIVE' || i.status === 'INVESTIGATING');
  const criticalIncidents = activeIncidents.filter((i) => i.severity === 'CRITICAL');
  const highIncidents = activeIncidents.filter((i) => i.severity === 'HIGH');
  const vulnerableAssets = assets.filter((a) => a.status === 'Vulnerable' || a.status === 'Warning');

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-300 font-mono text-xs px-4 py-2.5 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeIncidentsCount={activeIncidents.length}
        criticalCount={criticalIncidents.length}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
        isCopilotOpen={isCopilotOpen}
      />

      {/* Navigation Bar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeIncidentsCount={activeIncidents.length}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* VIEW 1: COMMAND CENTER */}
        {currentTab === 'COMMAND_CENTER' && (
          <div className="space-y-6">
            {/* Top KPI Metrics Row */}
            <MetricsRow
              securityScore={78}
              criticalIncidentsCount={criticalIncidents.length}
              highIncidentsCount={highIncidents.length}
              totalAssetsCount={assets.length}
              vulnerableAssetsCount={vulnerableAssets.length}
              onNavigateToIncidents={() => setCurrentTab('INCIDENTS')}
              onNavigateToAssets={() => setCurrentTab('CSPM_ASSETS')}
            />

            {/* Regional Attack Surface & Cloud Topology */}
            <MultiCloudTopology
              incidents={activeIncidents}
              onSelectIncident={(incident) => setSelectedIncident(incident)}
            />

            {/* Telemetry Stream & MITRE ATT&CK Matrix Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiveTelemetryStream />
              <MitreHeatmap
                incidents={incidents}
                onSelectIncident={(incident) => setSelectedIncident(incident)}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: INCIDENT WORKBENCH */}
        {currentTab === 'INCIDENTS' && (
          <IncidentList
            incidents={incidents}
            onSelectIncident={(incident) => setSelectedIncident(incident)}
            onQuickContain={handleQuickContain}
          />
        )}

        {/* VIEW 3: MULTI-CLOUD ASSETS & POSTURE (CSPM) */}
        {currentTab === 'CSPM_ASSETS' && (
          <AssetInventory
            assets={assets}
            onRemediateAsset={handleRemediateAsset}
          />
        )}

        {/* VIEW 4: THREAT INTEL & IOCS */}
        {currentTab === 'THREAT_INTEL' && <ThreatIntelView />}

        {/* VIEW 5: SOAR PLAYBOOKS & DETECTION RULES */}
        {currentTab === 'SOAR_PLAYBOOKS' && <SoarPlaybooks />}

        {/* VIEW 6: COMPLIANCE & AUDIT HUB */}
        {currentTab === 'COMPLIANCE' && <ComplianceHub />}

      </main>

      {/* Incident Drill-Down Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Red Team Attack Scenario Injector Modal */}
      <AttackSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onInjectIncident={handleInjectIncident}
      />

      {/* AI SecOps Copilot Drawer */}
      <AiCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        activeIncidentsCount={activeIncidents.length}
      />

      {/* Persistent Footer Status Bar */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-2.5 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>CloudSec SOC Mesh: ALL 4 CLOUD AGENTS NOMINAL</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>SIEM OCSF Standard v1.2</span>
            <span>MITRE ATT&CK v15</span>
            <span className="text-cyan-400">Gemini 3.8 Flash Ready</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
