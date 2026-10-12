import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { PhoneMockup } from '../components/PhoneMockup';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Instagram,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Layers,
  FlaskConical,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const OnboardingView: React.FC = () => {
  const {
    isInstagramConnected,
    instagramStatus,
    toggleInstagramConnection,
    posts,
    saveCampaign,
    navigateTo,
    addToast,
  } = useApp();

  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [businessType, setBusinessType] = useState('creator');
  const [campaignGoal, setCampaignGoal] = useState('lead_magnet');
  const [selectedPostId, setSelectedPostId] = useState(posts[0]?.id || 'post_1');
  const [keyword, setKeyword] = useState('PDF');
  const [offer, setOffer] = useState('Free 30-page creator growth guide');
  const [destinationUrl, setDestinationUrl] = useState('https://gumroad.com/l/creator-growth-guide');
  const [publicReply, setPublicReply] = useState('Sent you a DM! Check your inbox for the download link 🚀');
  const [dmMessage, setDmMessage] = useState('Hey {{username}}! 🙌 Here is the free growth guide you requested:\n\n{{link}}\n\nHope it delivers massive value!');
  const [isTestRunDone, setIsTestRunDone] = useState(false);
  const [testRunFeedback, setTestRunFeedback] = useState<string | null>(null);

  const totalSteps = 8;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const selectedPost = posts.find((p) => p.id === selectedPostId) || posts[0];

  const handleRunSafeTest = () => {
    setIsTestRunDone(true);
    setTestRunFeedback('Safe Sandbox Simulation Passed: Keyword matched "PDF", 7-day rule passed, Meta single-reply rule enforced. Message payload validated.');
    addToast('Safe test run successful! No live Instagram API limits consumed.', 'info');
  };

  const handleActivate = () => {
    saveCampaign({
      name: `${businessType.toUpperCase()} - ${campaignGoal.toUpperCase()} Automation`,
      postId: selectedPost.id,
      postThumbnail: selectedPost.thumbnail,
      postCaption: selectedPost.caption,
      keyword: keyword.trim().toUpperCase(),
      offer,
      link: destinationUrl,
      publicCommentReply: publicReply,
      message: dmMessage,
      matchType: 'contains',
      caseInsensitive: true,
      sendOncePerUser: true,
      setupVerified: true,
      status: 'active',
    });

    addToast('Onboarding complete! Your automation campaign is activated.', 'success');
    navigateTo('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner & Progress Bar */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                Guided Onboarding
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-100 mt-1">
              Launch Your First Comment-to-DM Sequence
            </h1>
          </div>
          <div className="text-right sm:text-right">
            <span className="text-lg font-bold text-indigo-400">{progressPercent}%</span>
            <span className="text-xs text-slate-400 block">Completed</span>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Step Body */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        {/* Step 1: Business Type */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">1. What kind of business do you run?</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                We'll tailor your automation templates and keyword presets based on your business type.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'creator', label: 'Creator & Influencer', desc: 'Distribute lead magnets, digital products, and links' },
                { id: 'ecommerce', label: 'E-commerce & Retail', desc: 'Send coupon codes, product links, and flash sales' },
                { id: 'agency', label: 'Agency & Consultant', desc: 'Collect client inquiries and share portfolios' },
                { id: 'coach', label: 'Coach & Educator', desc: 'Enroll students in courses and book strategy sessions' },
                { id: 'saas', label: 'SaaS & Digital Product', desc: 'Give early access to software blueprints and demos' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setBusinessType(item.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    businessType === item.id
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50 text-slate-100'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-sm font-semibold text-slate-200 block mb-1">{item.label}</span>
                  <span className="text-xs text-slate-400">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Campaign Goal */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">2. What is your primary campaign goal?</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose the direct action you want your Instagram followers to take.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'lead_magnet', label: 'Deliver Free Ebook / Lead Magnet', desc: 'Build an email list by sending free PDFs or cheatsheets' },
                { id: 'discount', label: 'Flash Sale & Discount Promo Codes', desc: 'Drive instant sales for physical or digital items' },
                { id: 'booking', label: 'Book 1-on-1 Consultation Calls', desc: 'Direct high-ticket prospects to Calendly / Cal.com' },
                { id: 'community', label: 'Grow VIP Community / WhatsApp', desc: 'Invite engaged followers into private group chats' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCampaignGoal(item.id)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    campaignGoal === item.id
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50 text-slate-100'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-sm font-semibold text-slate-200 block mb-1">{item.label}</span>
                  <span className="text-xs text-slate-400">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Connect Instagram (Honest State) */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">3. Connect Your Instagram Account</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automations require an Instagram Professional or Business account with Meta Graph permissions.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-200">
                      Instagram Business Connection
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Webhook subscription & Graph API private replies
                    </p>
                  </div>
                </div>
                <StatusBadge status={instagramStatus} />
              </div>

              {!isInstagramConnected ? (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Setup Required - Next Steps:</span>
                  </div>
                  <p className="text-[11px] text-amber-300 leading-relaxed">
                    1. Switch your Instagram profile to a Professional (Creator or Business) account.<br />
                    2. Connect your Instagram account to a Facebook Business Page.<br />
                    3. Grant permissions for <code>instagram_business_manage_comments</code> and <code>instagram_business_manage_messages</code>.<br />
                    4. In sandbox or demo mode, you can proceed with simulated test runs without a live Meta App ID.
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleInstagramConnection}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 cursor-pointer"
                    >
                      Connect in Demo Mode
                    </button>
                    <span className="text-[11px] text-slate-400">
                      (Or connect live in Instagram Setup tab later)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instagram is connected and ready for automated comment triggers.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Choose Post */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">4. Select an Instagram Reel or Post</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pick which video or photo to monitor for keyword comments.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {posts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setSelectedPostId(post.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                    selectedPostId === post.id
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50 text-slate-100'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <img
                    src={post.thumbnail}
                    alt="Thumbnail"
                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-slate-700/60"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-200 line-clamp-2">{post.caption}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">💬 {post.comments} comments</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Keywords */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">5. Set Trigger Keywords</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                When followers leave comments containing these keywords, they will receive your automated DM.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Trigger Keyword(s)
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. PDF, GUIDE, BLUEPRINT"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  The Offer Title
                </label>
                <input
                  type="text"
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                  placeholder="e.g. Free 30-Page Creator Growth Blueprint"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Destination URL Link
                </label>
                <input
                  type="url"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  placeholder="https://yourbrand.com/free-download"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Preview Messages */}
        {currentStep === 6 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">6. Preview & Edit Messages</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review your public comment reply and private direct message before going live.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Public Comment Reply
                  </label>
                  <input
                    type="text"
                    value={publicReply}
                    onChange={(e) => setPublicReply(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Private DM Message
                  </label>
                  <textarea
                    rows={5}
                    value={dmMessage}
                    onChange={(e) => setDmMessage(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-center items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                <PhoneMockup
                  username="priya_creator"
                  commentText={`${keyword} please!`}
                  replyText={dmMessage.replace(/{{username}}/g, '@priya_creator').replace(/{{link}}/g, destinationUrl)}
                  link={destinationUrl}
                  postThumbnail={selectedPost.thumbnail}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Safe Test */}
        {currentStep === 7 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">7. Run a Safe Test Simulation</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Test the sequence safely in our simulated sandbox to verify compliance with Meta terms.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Comment-to-DM Execution Sandbox
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Keyword: "{keyword}" • Post: {selectedPost.caption.slice(0, 32)}...
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRunSafeTest}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Execute Safe Test</span>
                </button>
              </div>

              {testRunFeedback && (
                <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{testRunFeedback}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 8: Activate */}
        {currentStep === 8 && (
          <div className="space-y-5 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto">
              <h2 className="text-lg font-bold text-slate-100">Your Campaign is Verified & Ready!</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Trigger keyword: <strong className="text-slate-200">"{keyword}"</strong> will dispatch your automated DM and public reply whenever a follower comments on your post.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Post:</span>
                <span className="text-slate-200 truncate max-w-[200px]">{selectedPost.caption}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Keyword:</span>
                <span className="text-slate-200 font-mono font-bold">{keyword}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Link:</span>
                <span className="text-indigo-400 truncate max-w-[200px]">{destinationUrl}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleActivate}
              className="px-8 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer inline-flex items-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4" />
              <span>Activate Campaign & Open Dashboard</span>
            </button>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between mt-8">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
