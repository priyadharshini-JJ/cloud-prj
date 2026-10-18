import React from 'react';
import { Menu, Plus, Search, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKnowledge } from '../../context/KnowledgeContext';

export default function Navbar({ onOpenMobileMenu }) {
  const navigate = useNavigate();
  const { openCreateModal } = useKnowledge();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Mobile Menu & Logo */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Cloud className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 text-sm">EchoCloud</span>
        </div>
      </div>

      {/* Global Quick Search Shortcut Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          type="button"
          onClick={() => navigate('/recovery')}
          className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-400 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            <span className="text-xs text-slate-500 font-normal">
              Quick recover knowledge (title, notes, tags)...
            </span>
          </div>
          <kbd className="hidden sm:inline-block text-[10px] font-semibold bg-white border border-slate-200 text-slate-400 px-1.5 py-0.5 rounded shadow-2xs">
            /
          </kbd>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/recovery')}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => openCreateModal()}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-2xs hover:shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Quick Add</span>
        </button>
      </div>
    </header>
  );
}
