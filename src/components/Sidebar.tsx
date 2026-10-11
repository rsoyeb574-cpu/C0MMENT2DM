import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  FileText,
  TrendingUp,
  Instagram,
  Settings,
  PlusCircle,
  FlaskConical,
  ExternalLink,
  LogOut,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    user,
    logout,
    activeTab,
    navigateTo,
    openCreateCampaign,
    activeCampaignsCount,
    isInstagramConnected,
  } = useApp();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'campaigns', label: 'Campaigns', icon: Layers, badge: activeCampaignsCount },
    { id: 'simulator', label: 'Test Simulator', icon: FlaskConical },
    { id: 'templates', label: 'DM Templates', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    {
      id: 'instagram',
      label: 'Instagram Setup',
      icon: Instagram,
      badge: isInstagramConnected ? 'Connected' : 'Demo',
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'CS';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Workspace Profile / Brand Indicator */}
      <div className="p-4 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {getInitials(user?.name)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate">
                {user?.name || 'Creator Studio'}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {user?.email || '@creator_studio_in'}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-medium text-amber-400/90 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
            {user?.plan || 'Demo'}
          </span>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="p-3">
        <button
          onClick={() => openCreateCampaign()}
          className="w-full py-2 px-3 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-[10px] font-mono tabular-nums text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sandbox Notice & Logout */}
      <div className="p-3 border-t border-slate-800/60 mt-auto space-y-2">
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-amber-400 font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Demo Sandbox</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Instagram comment triggers and DM dispatches are simulated safely.
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 py-1 transition-colors cursor-pointer"
          >
            <span>Landing Page</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 py-1 transition-colors cursor-pointer"
          >
            <LogOut className="w-3 h-3" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
