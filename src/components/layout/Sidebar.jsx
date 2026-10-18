import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Library,
  Search,
  Star,
  FolderTree,
  Settings,
  Plus,
  Cloud,
  LogOut,
  Sparkles,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useKnowledge } from '../../context/KnowledgeContext';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ onCloseMobile }) {
  const { openCreateModal, stats } = useKnowledge();
  const { user, logout, isFirebaseConfigured } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/library', label: 'My Knowledge', icon: Library, badge: stats?.total },
    { to: '/recovery', label: 'Recover Information', icon: Search, highlight: true },
    { to: '/favorites', label: 'Favorites', icon: Star, badge: stats?.favorites },
    { to: '/categories', label: 'Categories', icon: FolderTree },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base">EchoCloud</span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">MVP</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Knowledge Recovery</p>
            </div>
          </div>
        </div>

        {/* Quick Save Action Button */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => {
              openCreateModal();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm rounded-xl shadow-xs hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>Save Knowledge</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  } ${item.highlight ? 'relative font-medium' : ''}`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${item.highlight ? 'text-emerald-600' : ''}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Account / Status */}
      <div className="p-4 border-t border-slate-100 space-y-3">
        {/* Firebase Connection Status Banner */}
        <div
          className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
            isFirebaseConfigured
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {isFirebaseConfigured ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            )}
            <span className="truncate font-medium">
              {isFirebaseConfigured ? 'Firebase Active' : 'Offline / Demo Mode'}
            </span>
          </div>
          <span className="text-[10px] opacity-75 shrink-0 ml-1">
            {isFirebaseConfigured ? 'v9' : 'local'}
          </span>
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {(user.displayName || user.email || 'U')[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user.displayName || 'User'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
