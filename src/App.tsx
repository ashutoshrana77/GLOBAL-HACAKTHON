import React, { useState } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { AnalysisWorkspace } from './components/AnalysisWorkspace.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { MonitoringView } from './components/MonitoringView.tsx';
import { ApiPlaygroundView } from './components/ApiPlaygroundView.tsx';
import { ExtensionModal } from './components/ExtensionModal.tsx';
import { VerificationResult, ClaimAnalysis } from './types/index.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'landing' | 'workspace' | 'dashboard' | 'monitoring' | 'api'>('landing');
  const [selectedVerification, setSelectedVerification] = useState<VerificationResult | null>(null);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSelectFromDashboard = (result: VerificationResult) => {
    setSelectedVerification(result);
    setCurrentTab('workspace');
  };

  const handleNewVerification = () => {
    setSelectedVerification(null);
    setCurrentTab('workspace');
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans flex flex-col selection:bg-neutral-200">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
        }}
        onOpenExtensionModal={() => setIsExtensionModalOpen(true)}
        onNewVerification={handleNewVerification}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 rounded-md border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-mono text-white shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {notification}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'landing' && (
          <LandingPage
            onStartAnalysis={() => {
              setSelectedVerification(null);
              setCurrentTab('workspace');
            }}
            onExploreDashboard={() => setCurrentTab('dashboard')}
            onOpenApi={() => setCurrentTab('api')}
          />
        )}

        {currentTab === 'workspace' && (
          <AnalysisWorkspace
            initialResult={selectedVerification}
            onSaveToWatchlist={(claim: ClaimAnalysis) => {
              showToast(`Added claim to Continuous Watchlist: "${claim.claimText.slice(0, 35)}..."`);
            }}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            onSelectVerification={handleSelectFromDashboard}
            onNavigateToWorkspace={handleNewVerification}
          />
        )}

        {currentTab === 'monitoring' && <MonitoringView />}

        {currentTab === 'api' && <ApiPlaygroundView />}
      </main>

      {/* Browser Extension Preview Modal */}
      <ExtensionModal
        isOpen={isExtensionModalOpen}
        onClose={() => setIsExtensionModalOpen(false)}
        onTestInWorkspace={() => {
          setSelectedVerification(null);
          setCurrentTab('workspace');
        }}
      />
    </div>
  );
}
