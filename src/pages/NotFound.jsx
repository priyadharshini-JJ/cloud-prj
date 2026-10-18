import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-2xl mb-4">
        404
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-2">Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        The destination you are looking for does not exist in your EchoCloud repository.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-emerald-700 transition-colors"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => navigate('/recovery')}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-slate-200 transition-colors"
        >
          <Search className="w-4 h-4" />
          Recover Information
        </button>
      </div>
    </div>
  );
}
