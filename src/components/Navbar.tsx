import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, LayoutDashboard, Play } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, openCreateCampaign } = useApp();

  const handleNavClick = (sectionId: string) => {
    if (activeTab !== 'landing') {
      setActiveTab('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element brand wordmark */}
        <button
          onClick={() => setActiveTab('landing')}
          className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 text-left"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-rose-500/20">
            2D
          </span>
          <span>Comment2DM</span>
        </button>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <button
            onClick={() => handleNavClick('workflow')}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Workflow
          </button>
          <button
            onClick={() => handleNavClick('how-it-works')}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick('use-cases')}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Use Cases
          </button>
          <button
            onClick={() => handleNavClick('pricing')}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Pricing
          </button>
          <button
            onClick={() => handleNavClick('faq')}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {activeTab === 'landing' ? (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 cursor-pointer"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('landing')}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Landing Page
              </button>
              <button
                onClick={() => openCreateCampaign()}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>+ New Campaign</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
