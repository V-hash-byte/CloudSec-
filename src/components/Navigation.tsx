import React from 'react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  Server, 
  Crosshair, 
  Workflow, 
  FileCheck2,
  BadgeAlert
} from 'lucide-react';

export type NavTab = 
  | 'COMMAND_CENTER' 
  | 'INCIDENTS' 
  | 'CSPM_ASSETS' 
  | 'THREAT_INTEL' 
  | 'SOAR_PLAYBOOKS' 
  | 'COMPLIANCE';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeIncidentsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  activeIncidentsCount,
}) => {
  const tabs = [
    {
      id: 'COMMAND_CENTER' as NavTab,
      label: 'Command Center',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'INCIDENTS' as NavTab,
      label: 'Incident Workbench',
      icon: AlertTriangle,
      badge: activeIncidentsCount > 0 ? activeIncidentsCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'CSPM_ASSETS' as NavTab,
      label: 'Cloud Assets & Posture',
      icon: Server,
      badge: '4 Misconfigs',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'THREAT_INTEL' as NavTab,
      label: 'Threat Intel & IOCs',
      icon: Crosshair,
      badge: null,
    },
    {
      id: 'SOAR_PLAYBOOKS' as NavTab,
      label: 'SOAR & Detection Rules',
      icon: Workflow,
      badge: '4 Active',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    },
    {
      id: 'COMPLIANCE' as NavTab,
      label: 'Compliance & Audit',
      icon: FileCheck2,
      badge: '84% Pass',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
    },
  ];

  return (
    <nav className="bg-slate-900/70 border-b border-slate-800/80 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${tab.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
