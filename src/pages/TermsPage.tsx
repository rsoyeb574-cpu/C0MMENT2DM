import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Shield,
  ArrowLeft,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
} from 'lucide-react';

export const TermsPage: React.FC = () => {
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
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>Platform Agreement</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400">
          Last updated: October 13, 2026 • Effective Date: October 13, 2026
        </p>
      </div>

      {/* Highlights Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span>Summary of Terms & Compliance Standards</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block">Official Meta Integration</strong>
              <span>You connect exclusively through Meta OAuth. We never ask for or store your Instagram password.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block">Authorized Post Monitoring</strong>
              <span>We only listen to comments on posts you explicitly publish on your connected business account.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block">Responsive Messaging</strong>
              <span>Automated DMs are sent strictly in response to voluntary user comments matching your keyword triggers.</span>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200 block">Full User Control</strong>
              <span>You may disconnect your account and permanently erase all stored data at any time.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Body */}
      <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Comment2DM, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">2. Meta Platform Policy & Acceptable Use</h2>
          <p>
            You agree to use Comment2DM strictly in compliance with Meta's Terms of Service and Instagram Community Guidelines:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong>No Spam or Unsolicited Outreach:</strong> You must not use Comment2DM to send unsolicited messages, spam, or misleading content. Automated replies must be directly relevant to the user's voluntary comment.
            </li>
            <li>
              <strong>Honest Offers:</strong> Any links, digital downloads, or promotions delivered via automated DMs must accurately reflect what was promised in the original post caption.
            </li>
            <li>
              <strong>Rate Limiting & Safety:</strong> You must not attempt to circumvent API quotas or platform-enforced delivery safety intervals.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">3. Instagram Account Permissions</h2>
          <p>
            To enable automation, you authorize Comment2DM to access your connected Instagram Professional account via the Meta Graph API with the following explicit scopes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li><code className="text-indigo-300 font-mono">instagram_business_basic</code>: Reads your account identity and profile metadata.</li>
            <li><code className="text-indigo-300 font-mono">instagram_business_manage_comments</code>: Receives webhook notifications for new comments and posts public replies.</li>
            <li><code className="text-indigo-300 font-mono">instagram_business_manage_messages</code>: Sends direct private replies to commenters as permitted by Meta policy.</li>
          </ul>
          <p className="text-slate-400">
            We will <strong className="text-slate-200">never request your Instagram password</strong> or access unrelated personal messages.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">4. Subscription, Billing & Quotas</h2>
          <p>
            Comment2DM plans include monthly usage allowances for automated DM dispatches and comment webhook processing. Accounts that exceed monthly allowances may have automation temporarily paused until the next billing cycle or until upgrading to a higher plan tier.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white">5. Cancellation & Data Removal</h2>
          <p>
            You may cancel your subscription or terminate your account at any time. Upon termination, you may request complete data deletion via our{' '}
            <button
              onClick={() => navigateTo('data-deletion')}
              className="text-indigo-400 hover:text-indigo-300 underline font-semibold cursor-pointer"
            >
              Data Deletion Page
            </button>
            , which permanently removes your account, campaigns, leads, and tokens from our PostgreSQL database.
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-800 pt-6">
          <h2 className="text-base font-bold text-white">6. Inquiries & Support</h2>
          <p>
            For questions regarding these Terms of Service or commercial agreements, please contact:
          </p>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <Mail className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">Legal & Support Inquiries:</span>
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
          onClick={() => navigateTo('privacy')}
          className="hover:text-slate-200 transition-colors cursor-pointer"
        >
          View Privacy Policy →
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
