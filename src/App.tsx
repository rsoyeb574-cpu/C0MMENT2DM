import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import { LandingPage } from './pages/LandingPage';
import { DashboardView } from './pages/DashboardView';
import { CampaignsView } from './pages/CampaignsView';
import { SimulatorView } from './pages/SimulatorView';
import { TemplatesView } from './pages/TemplatesView';
import { AnalyticsView } from './pages/AnalyticsView';
import { InstagramView } from './pages/InstagramView';
import { SettingsView } from './pages/SettingsView';
import { LeadInboxView } from './pages/LeadInboxView';
import { OnboardingView } from './pages/OnboardingView';
import { CampaignCoachView } from './pages/CampaignCoachView';
import { FollowUpAssistantView } from './pages/FollowUpAssistantView';
import { LoginPage, SignupPage, ForgotPasswordPage } from './pages/AuthPages';
import { CampaignEditorModal } from './pages/CampaignEditorModal';
import {
  LayoutDashboard,
  Layers,
  FlaskConical,
  FileText,
  TrendingUp,
  Instagram,
  Settings,
  Inbox,
  Compass,
  BrainCircuit,
  MessageSquareHeart,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, activeTab, navigateTo } = useApp();

  // Route routing logic
  const renderCurrentView = () => {
    // Public Auth Pages
    if (activeTab === 'login') {
      return <LoginPage />;
    }
    if (activeTab === 'signup') {
      return <SignupPage />;
    }
    if (activeTab === 'forgot-password') {
      return <ForgotPasswordPage />;
    }

    // Public Landing Page
    if (activeTab === 'landing') {
      return <LandingPage />;
    }

    // Protected Route Fallback Guard: if user is not logged in, redirect directly to Login
    if (!user) {
      return <LoginPage />;
    }

    // Authenticated Workspace Routes
    return (
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Desktop Workspace Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Tab Navigation Bar */}
        <div className="md:hidden flex items-center justify-around bg-slate-900 border-b border-slate-800 p-2 overflow-x-auto">
          <button
            onClick={() => navigateTo('dashboard')}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] ${
              activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigateTo('campaigns')}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] ${
              activeTab === 'campaigns' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Campaigns</span>
          </button>
          <button
            onClick={() => navigateTo('inbox')}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] ${
              activeTab === 'inbox' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Leads</span>
          </button>
          <button
            onClick={() => navigateTo('onboarding')}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] ${
              activeTab === 'onboarding' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Guide</span>
          </button>
          <button
            onClick={() => navigateTo('simulator')}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] ${
              activeTab === 'simulator' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Simulator</span>
          </button>
          <button
            onClick={() => navigateTo('templates')}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] ${
              activeTab === 'templates' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Templates</span>
          </button>
          <button
            onClick={() => navigateTo('instagram')}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] ${
              activeTab === 'instagram' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Instagram className="w-4 h-4" />
            <span>Instagram</span>
          </button>
          <button
            onClick={() => navigateTo('settings')}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] ${
              activeTab === 'settings' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* SaaS Viewport Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'campaigns' && <CampaignsView />}
          {activeTab === 'inbox' && <LeadInboxView />}
          {activeTab === 'onboarding' && <OnboardingView />}
          {activeTab === 'simulator' && <SimulatorView />}
          {activeTab === 'templates' && <TemplatesView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'coach' && <CampaignCoachView />}
          {activeTab === 'followup' && <FollowUpAssistantView />}
          {activeTab === 'instagram' && <InstagramView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Bar adhering to Top Bar Contract */}
      <Navbar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col">
        {renderCurrentView()}
      </div>

      {/* Smart Campaign Create/Edit Modal */}
      <CampaignEditorModal />

      {/* Floating Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
