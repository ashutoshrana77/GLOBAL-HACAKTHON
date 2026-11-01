import React from 'react';
import { ShieldCheck, Compass, BarChart3, Clock, Terminal, Chrome, Plus } from 'lucide-react';

interface NavbarProps {
  currentTab: 'landing' | 'workspace' | 'dashboard' | 'monitoring' | 'api';
  onSelectTab: (tab: 'landing' | 'workspace' | 'dashboard' | 'monitoring' | 'api') => void;
  onOpenExtensionModal: () => void;
  onNewVerification: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenExtensionModal,
  onNewVerification,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onSelectTab('landing')}
            className="flex items-center space-x-2.5 text-left group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-emerald-800 transition-colors group-hover:border-emerald-600 group-hover:text-emerald-700">
              <ShieldCheck className="h-4.5 w-4.5 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold tracking-tight text-neutral-900 text-sm">FreshCheck</span>
                <span className="rounded border border-neutral-200 bg-neutral-100 px-1 py-0.2 text-[10px] font-mono font-medium text-neutral-600">
                  AI
                </span>
              </div>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onSelectTab('landing')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                currentTab === 'landing'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onSelectTab('workspace')}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                currentTab === 'workspace'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Compass className="h-3.5 w-3.5 stroke-[1.8]" />
              <span>Workspace</span>
            </button>
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 stroke-[1.8]" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => onSelectTab('monitoring')}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                currentTab === 'monitoring'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Clock className="h-3.5 w-3.5 stroke-[1.8]" />
              <span>Continuous Watch</span>
            </button>
            <button
              onClick={() => onSelectTab('api')}
              className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                currentTab === 'api'
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Terminal className="h-3.5 w-3.5 stroke-[1.8]" />
              <span>API Playground</span>
            </button>
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenExtensionModal}
            className="hidden sm:flex items-center space-x-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Chrome className="h-3.5 w-3.5 text-neutral-500 stroke-[1.8]" />
            <span>Extension</span>
          </button>

          <div className="hidden lg:flex items-center space-x-1.5 rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-mono text-neutral-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-700"></span>
            <span>Grounding Active</span>
          </div>

          <button
            onClick={() => {
              onSelectTab('workspace');
              onNewVerification();
            }}
            className="flex items-center space-x-1.5 rounded-md bg-emerald-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2]" />
            <span>Verify Response</span>
          </button>
        </div>
      </div>
    </header>
  );
};
