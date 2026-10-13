import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowRight,
  LogOut,
  User as UserIcon,
  Settings,
  LayoutDashboard,
  TrendingUp,
  ChevronDown,
  Sparkles,
  Database,
  AlertTriangle,
  PlayCircle,
  RefreshCw,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    logout,
    activeTab,
    navigateTo,
    openCreateCampaign,
    isDemoMode,
    enterDemoMode,
    exitDemoMode,
    dbError,
    clearDbError,
    refreshData,
  } = useApp();

  const [profileOpen, setProfileOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (sectionId: string) => {
    if (activeTab !== 'landing') {
      navigateTo('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateTo('landing')}
              className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 text-left cursor-pointer"
            >
              <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-rose-500/20">
                2D
              </span>
              <span>Comment2DM</span>
            </button>

            {/* Mode Indicator Pill */}
            {isDemoMode ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Demo Mode (Sample Data)</span>
              </span>
            ) : user ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <Database className="w-3 h-3 text-emerald-400" />
                <span>PostgreSQL Live</span>
              </span>
            ) : null}
          </div>

          {/* Zone 2: Navigation Links (on marketing view or general) */}
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

          {/* Zone 3: Auth & Action Area */}
          <div className="flex items-center gap-3 shrink-0">
            {isDemoMode ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('signup')}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Create Live Account</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={exitDemoMode}
                  className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                >
                  Exit Demo
                </button>
              </div>
            ) : !user ? (
              // Logged-out state
              <div className="flex items-center gap-2">
                <button
                  onClick={enterDemoMode}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Try Demo</span>
                </button>
                <button
                  onClick={() => navigateTo('login')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Log In
                </button>
                <button
                  onClick={() => navigateTo('signup')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              // Logged-in state
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleRefresh}
                  title="Reload data from PostgreSQL"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
                </button>

                {activeTab === 'landing' ? (
                  <button
                    onClick={() => navigateTo('dashboard')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </button>
                ) : (
                  <button
                    onClick={() => openCreateCampaign()}
                    className="hidden sm:flex px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all items-center gap-1.5 cursor-pointer"
                  >
                    <span>+ New Campaign</span>
                  </button>
                )}

                {/* Profile Menu Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                    aria-label="User profile menu"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                      {getInitials(user.name)}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-200 leading-tight">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-slate-400 leading-tight">
                        {user.plan || 'Free'} Plan
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        profileOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 text-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-slate-800">
                        <p className="font-semibold text-slate-200 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            {user.plan || 'Free'} Plan
                          </span>
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            PostgreSQL
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            navigateTo('dashboard');
                          }}
                          className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Dashboard</span>
                        </button>

                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            navigateTo('analytics');
                          }}
                          className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Analytics</span>
                        </button>

                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            enterDemoMode();
                          }}
                          className="w-full px-3 py-2 text-left text-amber-300 hover:text-amber-200 hover:bg-amber-950/20 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Switch to Demo Mode</span>
                        </button>

                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            navigateTo('settings');
                          }}
                          className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-400" />
                          <span>Settings</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-800 pt-1">
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            logout();
                          }}
                          className="w-full px-3 py-2 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Database Error Banner (Requirement 6: Real error message in UI, no secrets, no silent fallback) */}
      {dbError && (
        <div className="bg-rose-950/90 border-b border-rose-800 text-rose-200 px-4 py-2.5 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 max-w-4xl truncate">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold text-rose-100 shrink-0">PostgreSQL Database Error:</span>
            <span className="font-mono text-rose-300 truncate">{dbError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              className="px-2 py-0.5 rounded bg-rose-900 hover:bg-rose-800 text-rose-100 text-[11px] font-medium border border-rose-700 cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={clearDbError}
              className="text-rose-400 hover:text-rose-200 text-xs cursor-pointer ml-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};
