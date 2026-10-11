import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Instagram,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  Webhook,
  KeyRound,
  ExternalLink,
  RefreshCw,
  Lock,
  Clock,
  Send,
  Sparkles,
  Info,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const InstagramView: React.FC = () => {
  const { isInstagramConnected, toggleInstagramConnection, addToast } = useApp();

  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [tokenExpiresInDays, setTokenExpiresInDays] = useState(59);

  // Private Reply tester states
  const [testCommentId, setTestCommentId] = useState('comment_987654321');
  const [testCommentAgeDays, setTestCommentAgeDays] = useState(1);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    ruleViolated?: string;
    message: string;
    details?: string;
  } | null>(null);

  const [repliedCommentsSet, setRepliedCommentsSet] = useState<Set<string>>(new Set());

  // Permissions list required by Instagram API with Instagram Login
  const businessPermissions = [
    {
      scope: 'instagram_business_basic',
      description: 'Read Instagram Business account profile metadata, follower counts, and media list.',
      status: isInstagramConnected ? 'Active' : 'Not configured',
    },
    {
      scope: 'instagram_business_manage_comments',
      description: 'Subscribe to real-time comments webhook and read comment text for keyword triggers.',
      status: isInstagramConnected ? 'Active' : 'Not configured',
    },
    {
      scope: 'instagram_business_manage_messages',
      description: 'Dispatch automated private replies to comments via POST /<IG_USER_ID>/messages within 7 days.',
      status: isInstagramConnected ? 'Active' : 'Not configured',
    },
  ];

  // Token refresh simulation
  const handleRefreshToken = async () => {
    setIsRefreshingToken(true);
    await new Promise((r) => setTimeout(r, 700));
    setTokenExpiresInDays(60);
    setIsRefreshingToken(false);
    addToast('Long-lived token refreshed successfully! 60-day expiry renewed via graph.instagram.com.', 'success');
  };

  // Test private reply rules
  const handleTestPrivateReply = () => {
    if (!testCommentId.trim()) {
      addToast('Please enter a comment ID to test.', 'error');
      return;
    }

    // Check Rule 1: Once per comment
    if (repliedCommentsSet.has(testCommentId)) {
      setTestResult({
        success: false,
        ruleViolated: 'ONCE_PER_COMMENT',
        message: 'Blocked: Private reply already sent for this comment ID.',
        details: 'Meta Graph API strictly restricts private replies to exactly once per comment. Multiple automated replies to the same comment are rejected.',
      });
      return;
    }

    // Check Rule 2: 7-day limit
    if (testCommentAgeDays > 7) {
      setTestResult({
        success: false,
        ruleViolated: 'EXPIRED_7_DAYS',
        message: `Blocked: Comment is ${testCommentAgeDays} days old (exceeds 7-day limit).`,
        details: 'Instagram only allows Private Replies within 7 days of the comment creation timestamp. Older comments cannot be messaged privately.',
      });
      return;
    }

    // Success
    setRepliedCommentsSet((prev) => new Set([...prev, testCommentId]));
    setTestResult({
      success: true,
      message: `Private reply dispatched via POST /17841400012345678/messages!`,
      details: `Recipient: {"comment_id": "${testCommentId}"}. Message delivered within the 7-day window.`,
    });
    addToast('Simulated Private Reply delivered successfully!', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-amber-500/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Instagram API with Instagram Login (Business Login)
            </h2>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
              v21.0 Private Reply Engine
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Comment2DM utilizes official Instagram Business Login and long-lived 60-day user tokens stored with AES-256-GCM encryption. DMs are dispatched as Private Replies to comments within Meta's 7-day window.
          </p>
        </div>
      </div>

      {/* Account Connection Card */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 shrink-0">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>Instagram Business Account</span>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  Business Login for Instagram
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isInstagramConnected
                  ? 'Connected: @creator_studio_in (IG ID: 17841400012345678)'
                  : 'No account linked. Click below to initiate Business Login authorization.'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleInstagramConnection}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              isInstagramConnected
                ? 'bg-slate-800 text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 border border-slate-700'
                : 'bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95'
            }`}
          >
            <Instagram className="w-4 h-4" />
            <span>{isInstagramConnected ? 'Disconnect Account' : 'Connect with Instagram Login'}</span>
          </button>
        </div>

        {isInstagramConnected ? (
          <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Account Linked: <strong>@creator_studio_in</strong> via Instagram Business Login
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Encrypted (AES-256-GCM)
              </span>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Expires in {tokenExpiresInDays} days
              </span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              Click "Connect with Instagram Login" to authorize your Instagram Business account with the 3 required scopes.
            </span>
          </div>
        )}
      </div>

      {/* Permissions Breakdown */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            <span>Required Instagram Business Permissions</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configured through Meta for Developers using Instagram API with Instagram Login:
          </p>
        </div>

        <div className="space-y-3">
          {businessPermissions.map((perm, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono font-semibold text-indigo-300">
                    {perm.scope}
                  </code>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{perm.description}</p>
              </div>

              <span
                className={`text-[11px] font-medium px-2.5 py-0.5 rounded self-start sm:self-center shrink-0 ${
                  perm.status === 'Active'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {perm.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Token Encryption & Refresh Section */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Token Security & 60-Day Renewal Engine</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Long-lived access tokens are stored encrypted at rest using AES-256-GCM and refreshed before the 60-day expiry.
            </p>
          </div>

          <button
            onClick={handleRefreshToken}
            disabled={isRefreshingToken}
            className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingToken ? 'animate-spin' : ''}`} />
            <span>Test Token Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Encryption Standard</span>
            <span className="text-xs font-semibold text-emerald-400 font-mono block">AES-256-GCM Authenticated</span>
            <span className="text-[11px] text-slate-400 block">Random 12-byte IV + 16-byte Auth Tag</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Token Lifespan</span>
            <span className="text-xs font-semibold text-indigo-300 font-mono block">60 Days (Long-Lived)</span>
            <span className="text-[11px] text-slate-400 block">Exchanged via graph.instagram.com</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase font-medium">Auto-Refresh Trigger</span>
            <span className="text-xs font-semibold text-slate-200 font-mono block">At Day 53 (7 days before expiry)</span>
            <span className="text-[11px] text-slate-400 block">Preserves 24/7 automation uninterrupted</span>
          </div>
        </div>
      </div>

      {/* Private Reply Rules & Interactive Tester */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Send className="w-4 h-4 text-rose-400" />
            <span>Private Reply Specification & Rules Engine</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Meta Instagram Graph API enforces 2 mandatory rules on Private Replies:
          </p>
        </div>

        {/* 2 Mandatory Rules Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Rule 1: Exactly Once Per Comment</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Instagram only allows a single automated private reply per comment ID. Subsequent attempts receive an error from Meta.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <Clock className="w-4 h-4" />
              <span>Rule 2: Within 7 Days of Comment</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Private replies are only permitted within 7 days of the comment timestamp. Comments older than 7 days cannot be messaged.
            </p>
          </div>
        </div>

        {/* Private Reply Tester Simulator */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              Interactive Private Reply Rule Tester
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              POST /&lt;IG_USER_ID&gt;/messages
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Instagram Comment ID
              </label>
              <input
                type="text"
                value={testCommentId}
                onChange={(e) => setTestCommentId(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Comment Age (Testing 7-Day Limit)
              </label>
              <select
                value={testCommentAgeDays}
                onChange={(e) => setTestCommentAgeDays(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={1}>1 day ago (Valid &lt; 7 days)</option>
                <option value={3}>3 days ago (Valid &lt; 7 days)</option>
                <option value={6}>6 days ago (Valid &lt; 7 days)</option>
                <option value={8}>8 days ago (Expired &gt; 7 days)</option>
                <option value={14}>14 days ago (Expired &gt; 7 days)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              onClick={() => {
                setTestCommentId('comment_' + Math.random().toString(36).substring(2, 9));
                setTestResult(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Generate New Comment ID
            </button>

            <button
              onClick={handleTestPrivateReply}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simulate Private Reply Call</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg border text-xs space-y-1 animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{testResult.message}</span>
              </div>
              <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">
                {testResult.details}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Webhook Specification for Comments Field */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
          <Webhook className="w-3.5 h-3.5 text-indigo-400" />
          <span>Webhooks Subscription: comments Topic</span>
        </h4>
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
          <pre>
{`POST /api/webhooks/instagram
Payload field: "comments"
{
  "id": "17841400012345678",
  "changes": [{
    "field": "comments",
    "value": {
      "id": "comment_987654321",
      "text": "PDF please!",
      "created_time": 1728567890,
      "from": { "id": "user_123", "username": "follower" }
    }
  }]
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};
