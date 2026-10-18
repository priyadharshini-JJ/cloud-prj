import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useKnowledge } from '../context/KnowledgeContext';
import { useToast } from '../components/common/Toast';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  User,
  Mail,
  KeyRound,
  Download,
  Trash2,
  LogOut,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle,
  HardDrive
} from 'lucide-react';

export default function Settings() {
  const { user, updateProfileName, sendPasswordReset, logout, isFirebaseConfigured } = useAuth();
  const { exportData, wipeAllData, stats } = useKnowledge();
  const toast = useToast();

  // Profile Form State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Password Reset State
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Export State
  const [isExporting, setIsExporting] = useState(false);

  // Wipe Data State
  const [showWipeDialog, setShowWipeDialog] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  // Update Name
  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setIsUpdatingName(true);
    try {
      await updateProfileName(displayName.trim());
      toast.success('Display name updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update name');
    } finally {
      setIsUpdatingName(false);
    }
  };

  // Send Password Reset Email
  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSendingReset(true);
    try {
      await sendPasswordReset(user.email);
      toast.success(`Password reset link sent to ${user.email}`);
    } catch (err) {
      toast.error(err.message || 'Failed to send password reset');
    } finally {
      setIsSendingReset(false);
    }
  };

  // Export Knowledge as JSON
  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute(
        'download',
        `echocloud-backup-${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Knowledge base exported successfully as JSON');
    } catch (err) {
      toast.error('Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Wipe Data Action
  const handleWipeData = async () => {
    setIsWiping(true);
    try {
      await wipeAllData();
      toast.success('All personal knowledge records and attachments have been permanently deleted.');
      setShowWipeDialog(false);
    } catch (err) {
      toast.error('Failed to wipe data: ' + err.message);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Account & System Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your personal profile, security credentials, data exports, and Firebase environment.
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          <span>Profile Information</span>
        </h2>

        <form onSubmit={handleUpdateName} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{user?.email || 'user@example.com'}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Authenticated user account identifier.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isUpdatingName || displayName === user?.displayName}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50 transition-colors"
            >
              {isUpdatingName ? 'Updating...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Credentials */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-emerald-600" />
          <span>Security & Authentication</span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Password Reset</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Send a secure password reset link to your registered email address.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePasswordReset}
            disabled={isSendingReset}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 shrink-0"
          >
            {isSendingReset ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Sign Out</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              End your active session on this device.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Data Management & Portability */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-emerald-600" />
          <span>Data Portability & Privacy</span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
          <div>
            <h3 className="text-sm font-semibold text-emerald-950">Export Knowledge Archive</h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              Download your complete library metadata ({stats.total} items, categories, tags, and URLs) as structured JSON.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportJSON}
            disabled={isExporting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export JSON Archive'}</span>
          </button>
        </div>

        {/* Account Data Deletion Danger Zone */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-rose-50/60 rounded-xl border border-rose-200">
          <div>
            <h3 className="text-sm font-semibold text-rose-950">Wipe All Personal Data</h3>
            <p className="text-xs text-rose-800 mt-0.5">
              Permanently delete all knowledge records, categories, and Storage attachments. This cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowWipeDialog(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete All Data</span>
          </button>
        </div>
      </div>

      {/* Firebase Environment Status & Guidance */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          {isFirebaseConfigured ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          )}
          <span>Firebase Connection Diagnostics</span>
        </h2>

        <div className="p-4 rounded-xl text-xs space-y-2 bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Status:</span>
            <span
              className={`px-2 py-0.5 rounded font-semibold ${
                isFirebaseConfigured
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {isFirebaseConfigured
                ? 'Production Connected (Firebase Web SDK Active)'
                : 'Local Preview / Demo Mode (Keys Pending in .env)'}
            </span>
          </div>

          <p className="text-slate-600 leading-relaxed">
            {isFirebaseConfigured
              ? 'Your application is connected to Cloud Firestore, Firebase Authentication, and Firebase Storage.'
              : 'To enable your live Firebase cloud backend, copy your Web App credentials into a local .env file. See README.md for the step-by-step console guide.'}
          </p>
        </div>
      </div>

      {/* Wipe Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showWipeDialog}
        onClose={() => setShowWipeDialog(false)}
        onConfirm={handleWipeData}
        title="Permanently Delete All Account Data"
        message="Are you completely sure you want to delete all your saved knowledge items, categories, and uploaded attachments? This action is permanent and cannot be recovered."
        confirmText="Confirm Permanent Wipe"
        isDanger={true}
        isLoading={isWiping}
      />
    </div>
  );
}
