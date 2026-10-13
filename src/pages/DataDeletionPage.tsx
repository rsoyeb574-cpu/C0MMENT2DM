import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trash2,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Mail,
  Search,
  KeyRound,
  ExternalLink,
  Lock,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';

export const DataDeletionPage: React.FC = () => {
  const { navigateTo } = useApp();

  const [contactEmail, setContactEmail] = useState<string>(
    import.meta.env.VITE_CONTACT_EMAIL || 'support@comment2dm.com'
  );

  // Form states
  const [email, setEmail] = useState('');
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<{
    confirmationCode: string;
    message: string;
    statusUrl: string;
    timestamp: string;
  } | null>(null);

  // Lookup state
  const [lookupCode, setLookupCode] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<{
    confirmationCode: string;
    status: string;
    message: string;
    timestamp: string;
  } | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data?.contactEmail) setContactEmail(data.contactEmail);
      })
      .catch(() => {});

    // Check if URL has ?code=...
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const codeFromUrl = urlParams.get('code');
      if (codeFromUrl) {
        setLookupCode(codeFromUrl);
        handleLookup(codeFromUrl);
      }
    }
  }, []);

  const handleSubmitDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!email.trim() || !email.includes('@')) {
      setFormError('Please provide a valid account email address.');
      return;
    }

    if (!confirmCheckbox) {
      setFormError('Please check the confirmation box to authorize permanent deletion.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user/delete-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit deletion request.');
      }

      setFormSuccess({
        confirmationCode: data.confirmationCode,
        message: data.message,
        statusUrl: data.statusUrl,
        timestamp: data.timestamp || new Date().toISOString(),
      });
      setEmail('');
      setConfirmCheckbox(false);
    } catch (err: any) {
      setFormError(err.message || 'Deletion request failed. Please contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLookup = async (codeToQuery?: string) => {
    const code = (codeToQuery || lookupCode).trim();
    if (!code) {
      setLookupError('Please enter a confirmation code.');
      return;
    }

    setLookupError(null);
    setLookupResult(null);
    setLookupLoading(true);

    try {
      const res = await fetch(`/api/auth/data-deletion/status/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Confirmation code not found.');
      }
      setLookupResult({
        confirmationCode: data.confirmationCode || code,
        status: data.status || 'completed',
        message: data.message || 'All user data and credentials have been permanently deleted from PostgreSQL.',
        timestamp: data.timestamp || new Date().toISOString(),
      });
    } catch (err: any) {
      setLookupError(err.message || 'Failed to verify deletion status.');
    } finally {
      setLookupLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigateTo('landing')}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Homepage</span>
        </button>
      </div>

      {/* Header */}
      <div className="space-y-3 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>Meta & GDPR User Data Deletion Instructions</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Data Deletion & Privacy Rights
        </h1>
        <p className="text-xs text-slate-400">
          In accordance with Meta Platform Rules, GDPR, and CCPA, you retain complete ownership and control over your data.
        </p>
      </div>

      {/* Security & Access Boundary Disclosures */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-400" />
          <span>How Comment2DM Handles Your Data</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <strong className="text-slate-100 block mb-1">1. Official Meta Login Only</strong>
            <p className="text-slate-400">
              We connect to Instagram exclusively through Meta's official OAuth flow. We <span className="text-rose-300 font-semibold">never ask for, view, or store your Instagram password</span>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <strong className="text-slate-100 block mb-1">2. Monitored on Your Own Posts Only</strong>
            <p className="text-slate-400">
              We only read comments left by users on your own published posts and reels. We never access your personal browsing or private messages.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <strong className="text-slate-100 block mb-1">3. DM Sent Only In Response to Comments</strong>
            <p className="text-slate-400">
              Direct messages are sent strictly as private replies to comments matching your keywords, in accordance with Meta's 7-day exactly-once rule.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <strong className="text-slate-100 block mb-1">4. Minimal Storage & Instant Erasure</strong>
            <p className="text-slate-400">
              We store only what is required to execute your automations. You can disconnect your account and permanently erase all data at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Workflow Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Self-Service Deletion Form */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Submit Instant Data Deletion Request</span>
            </h3>
            <p className="text-xs text-slate-400">
              Enter your Comment2DM account email to permanently purge your profile, campaigns, leads, and tokens from PostgreSQL.
            </p>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs space-y-3">
              <div className="flex items-center gap-2 font-semibold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Data Deletion Completed</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {formSuccess.message}
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-emerald-500/30 font-mono text-[11px] flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[9px]">CONFIRMATION CODE</span>
                  <span className="text-emerald-400 font-bold">{formSuccess.confirmationCode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(formSuccess.confirmationCode)}
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                  title="Copy confirmation code"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Timestamp: {new Date(formSuccess.timestamp).toLocaleString()}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitDeletion} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="creator@example.com"
                    required
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-slate-300 text-[11px]">
                  <input
                    type="checkbox"
                    checked={confirmCheckbox}
                    onChange={(e) => setConfirmCheckbox(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-900 text-rose-600 focus:ring-0"
                  />
                  <span>
                    I understand that this action is irreversible and permanently deletes all campaigns, lead entries, OAuth tokens, and analytics from the database.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Deletion...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete My Data</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Step-by-Step Meta App Removal Instructions */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>How to Revoke via Instagram App</span>
            </h3>
            <p className="text-slate-400">
              You can also revoke Comment2DM's API permissions directly from the Meta mobile application:
            </p>
          </div>

          <ol className="space-y-3 pl-2 text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                1
              </span>
              <span>
                Open the <strong>Instagram App</strong> and go to your profile.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                2
              </span>
              <span>
                Tap the menu icon (☰) and select <strong>Settings and activity</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                3
              </span>
              <span>
                Scroll to <strong>Your app and media permissions</strong> → <strong>Apps and websites</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                4
              </span>
              <span>
                Locate <strong>Comment2DM</strong> under the <em>Active</em> tab and tap <strong>Remove</strong>.
              </span>
            </li>
          </ol>

          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-indigo-200">
            <strong className="block mb-0.5">Automated Meta Deletion Callback:</strong>
            When you tap <em>Remove</em> in Instagram, Meta automatically notifies our server callback (<code className="font-mono text-indigo-300">POST /api/webhooks/instagram/data-deletion</code>), which purges your tokens and records instantly.
          </div>
        </div>
      </div>

      {/* Deletion Status Verification Tool */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-indigo-400" />
            <span>Check Deletion Request Status</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Meta reviewers and users can verify the status of any completed data deletion request using its confirmation code:
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-lg">
          <div className="relative flex-1">
            <input
              type="text"
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              placeholder="e.g. c2dm_del_1791888..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={() => handleLookup()}
            disabled={lookupLoading}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {lookupLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span>Verify Status</span>
          </button>
        </div>

        {lookupError && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 max-w-lg">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{lookupError}</span>
          </div>
        )}

        {lookupResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs space-y-2 max-w-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Status: {lookupResult.status.toUpperCase()}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(lookupResult.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p className="text-slate-300 text-[11px]">{lookupResult.message}</p>
            <div className="text-[10px] text-slate-400 font-mono truncate">
              Code: {lookupResult.confirmationCode}
            </div>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-semibold text-slate-200 block">Need assistance with your data?</span>
          <span className="text-slate-400 text-[11px]">
            You can email our data protection officer directly at{' '}
            <a href={`mailto:${contactEmail}`} className="text-indigo-400 underline font-mono">
              {contactEmail}
            </a>
          </span>
        </div>
        <a
          href={`mailto:${contactEmail}`}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors shrink-0"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};
