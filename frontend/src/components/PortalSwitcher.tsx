import React, { useState } from 'react';
import { usePortal, PortalType } from '../contexts/PortalContext';
import { Shield, Users, UserCheck, Layers, ChevronUp, ChevronDown } from 'lucide-react';

export function PortalSwitcher() {
  const { currentPortal, setPortal } = usePortal();
  const [minimized, setMinimized] = useState(false);

  const portals: { id: PortalType; fullLabel: string; shortLabel: string; icon: any }[] = [
    { id: 'admin', fullLabel: 'Super Admin', shortLabel: 'Admin', icon: Shield },
    { id: 'officials', fullLabel: 'Officials Portal', shortLabel: 'Officials', icon: Users },
    { id: 'members', fullLabel: 'Member Portal', shortLabel: 'Member', icon: UserCheck },
  ];

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-20 lg:bottom-5 right-4 z-40 px-3 py-2 bg-gray-900/90 hover:bg-gray-900 text-white rounded-full shadow-2xl border border-white/20 hover:scale-105 transition-all flex items-center gap-1.5 text-xs font-bold backdrop-blur-md"
        title="Open Portal Switcher"
      >
        <Layers className="w-3.5 h-3.5 text-brand-accent" />
        <span className="text-[11px]">Portals</span>
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 lg:bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] sm:max-w-max flex items-center gap-1 p-1 bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
      <div className="flex items-center gap-0.5 sm:gap-1">
        {portals.map((portal) => {
          const Icon = portal.icon;
          const isActive = currentPortal === portal.id;
          return (
            <button
              key={portal.id}
              onClick={() => setPortal(portal.id)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-brand-accent text-white shadow-md'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="sm:hidden">{portal.shortLabel}</span>
              <span className="hidden sm:inline">{portal.fullLabel}</span>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => setMinimized(true)}
        className="p-1 sm:p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-0.5"
        title="Minimize"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
