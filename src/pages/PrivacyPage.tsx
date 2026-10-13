import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Lock,
  Eye,
  KeyRound,
  Trash2,
  Mail,
  CheckCircle2,
  ArrowLeft,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { navigateTo } = useApp();
  const [contactEmail, setContactEmail] = useState<string>(
    import.meta.env.VITE_CONTACT_EMAIL || 'support@comment2dm.com'
  );

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data?.contactEmail) setContactEmail(data.contactEmail);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Top back button */}
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Official Meta Graph API Privacy Disclosure</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400">
          Last updated: October 13, 2026 • Effective Date: October 13, 2026
        </p>
      </div>

      {/* Key Guarantees Box */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-indigo-400" />
          <span>Our Privacy & Security Core Guarantees</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block">Official Meta Login Only</strong>
              <span className="text-slate-400">
                We connect to your Instagram business account exclusively through Meta's official OAuth authorization screen.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block">Never Ask for Instagram Passwords</strong>
              <span className="text-slate-400">
                We never ask for, view, or store your Instagram password. Authentication uses encrypted server-side OAuth tokens.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block">Comments on Your Posts Only</strong>
              <span className="text-slate-400">
                We only read comments left on your own published Instagram posts and reels to identify trigger keywords.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block">DM Only in Response to Comments</strong>
              <span className="text-slate-400">
                We dispatch direct messages strictly as direct private replies to users who voluntarily commented on your post.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
          <p>
            Comment2DM ("we", "our", or "the Service") operates on the principle of data minimization. We only collect the minimal data required to provide comment-to-DM automation:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong className="text-slate-200">Account Credentials:</strong> Full name, email address, and cryptographically hashed passwords (using bcrypt). We do not store plaintext credentials.
            </li>
            <li>
              <strong className="text-slate-200">Connected Instagram Profile Data:</strong> Instagram Business Account ID, username, profile picture URL, and scoped access tokens generated by Meta OAuth.
            </li>
            <li>
              <strong className="text-slate-200">Webhook Interaction Events:</strong> Comment text, commenter public username, post ID, comment ID, and timestamps received through Meta's webhook system.
            </li>
            <li>
              <strong className="text-slate-200">Campaign Automation Configs:</strong> Trigger keywords, direct message copy templates, offer links, and destination URLs you configure.
            </li>
            <li>
              <strong className="text-slate-200">Performance Analytics:</strong> Aggregate count of comments detected, DMs dispatched, and tracked link clicks recorded.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">2. How We Use Your Information</h2>
          <p>We use collected data solely for the following business purposes:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>Listening to real-time comment webhook notifications from Meta on your authorized posts.</li>
            <li>Evaluating trigger keywords to match your automated campaigns.</li>
            <li>Dispatching automated direct messages and public comment replies through the official Meta Graph API.</li>
            <li>Preventing duplicate message delivery via Meta's strict single-private-reply policy.</li>
            <li>Providing conversion reporting, CRM lead timelines, and click-tracking analytics in your dashboard.</li>
          </ul>
          <p className="text-slate-400">
            We <strong className="text-slate-200">never sell, rent, or monetize</strong> your personal data or your followers' information to advertisers or data brokers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">3. Meta Platform & Instagram API Compliance</h2>
          <p>
            Comment2DM operates in strict compliance with the Meta Platform Terms, Developer Policies, and Instagram Graph API Guidelines:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong>No Password Gathering:</strong> We never prompt for or handle Instagram passwords. All authentication occurs directly on Meta's secure servers via OAuth 2.0.
            </li>
            <li>
              <strong>Private Replies Policy:</strong> Direct messages sent to commenters are delivered via Meta's private replies endpoint (<code className="text-indigo-300 font-mono">POST /v21.0/{'{comment_id}'}/messages</code>). Meta enforces that private replies can only be sent once per comment within 7 days of the comment.
            </li>
            <li>
              <strong>Token Encryption:</strong> OAuth access tokens are encrypted at rest using AES-256-GCM before storage in our PostgreSQL database.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">4. User Rights, Disconnection & Data Deletion</h2>
          <p>
            You retain absolute ownership of your data at all times. You have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong className="text-slate-200">Disconnect Instagram:</strong> You can disconnect your Instagram business account at any time through our Settings page or by revoking access in the Instagram app under <em>Settings → Apps and Websites</em>.
            </li>
            <li>
              <strong className="text-slate-200">Delete All Data:</strong> You can request immediate and permanent deletion of your account and all associated campaigns, leads, and tokens through our dedicated{' '}
              <button
                onClick={() => navigateTo('data-deletion')}
                className="text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer"
              >
                Data Deletion Page
              </button>
              .
            </li>
            <li>
              <strong className="text-slate-200">Automated Meta Deletion Callback:</strong> When you remove Comment2DM in your Facebook/Instagram app settings, Meta triggers our automated server deletion callback (<code className="text-indigo-300 font-mono">POST /api/webhooks/instagram/data-deletion</code>), which automatically purges all your data from our database.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">5. Security & Infrastructure</h2>
          <p>
            We implement industry-standard technical measures including encrypted SSL/TLS data transmission in transit, serverless PostgreSQL connection pooling with strict tenant isolation, httpOnly session cookies, and bcrypt cryptographic password hashing.
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-800 pt-6">
          <h2 className="text-base font-bold text-white">6. Contact Information</h2>
          <p>
            If you have any questions, inquiries, or privacy concerns regarding this policy, please reach out directly:
          </p>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">Official Support & Privacy Inquiries:</span>
              <a
                href={`mailto:${contactEmail}`}
                className="text-indigo-400 hover:text-indigo-300 font-mono font-medium text-xs underline"
              >
                {contactEmail}
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
        <button
          onClick={() => navigateTo('terms')}
          className="hover:text-slate-200 transition-colors cursor-pointer"
        >
          View Terms of Service →
        </button>
        <button
          onClick={() => navigateTo('data-deletion')}
          className="text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
        >
          Request Data Deletion Instructions →
        </button>
      </div>
    </div>
  );
};
