import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowRight,
  Sparkles,
  MessageSquare,
  Zap,
  CheckCircle2,
  ChevronDown,
  BookOpen,
  GraduationCap,
  ShoppingBag,
  Ticket,
  MessageCircle,
  Youtube,
  Shield,
  Layers,
  FlaskConical,
  ExternalLink,
  Lock,
  TrendingDown,
  Clock,
  Ban,
  HelpCircle,
  BrainCircuit,
  MousePointerClick,
  Users,
  ShieldCheck,
  Check,
  Calendar,
  Briefcase,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveTab, templates, applyTemplateToNewCampaign } = useApp();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // Workflow visual active tab
  const [workflowKeyword, setWorkflowKeyword] = useState<'PDF' | 'PRO' | 'GEAR' | 'VIP'>('PDF');

  const workflowExamples = {
    PDF: {
      tag: 'Lead Magnet Workflow',
      comment: 'PDF please! Sending this to my marketing team 🚀',
      detected: 'Keyword "PDF" matched (stripped punctuation, case-insensitive)',
      latency: '820ms',
      dm: 'Hey @alex_marketing! 🙌 Here is your 32-Page SaaS Scaling Blueprint as promised:\n👉 https://c2dm.link/r/camp_01\n\nEnjoy the read! What stage is your product in?',
      link: 'https://c2dm.link/r/camp_01',
      outcome: 'Lead added to CRM as "New" → Link click verified via tracked redirect',
    },
    PRO: {
      tag: 'Course Sale Workflow',
      comment: 'PRO coupon code please! Looking to join the bootcamp 🔥',
      detected: 'Keyword "PRO" matched against Course Launch campaign',
      latency: '740ms',
      dm: 'Hey @priya_code! 🚀 Exclusive 40% OFF coupon CODE40 has been applied for you:\n👉 https://c2dm.link/r/camp_02\n\nEnrollment closes this Sunday at midnight!',
      link: 'https://c2dm.link/r/camp_02',
      outcome: 'Lead tagged as "Interested" → 40% checkout direct link opened in DM browser',
    },
    GEAR: {
      tag: 'Affiliate Workflow',
      comment: 'What camera setup & mic is that? GEAR please ✨',
      detected: 'Keyword "GEAR" matched with Desk Setup Affiliate list',
      latency: '690ms',
      dm: 'Hey @creator_sam! ✨ Here is the complete breakdown of every item on my desk:\n👉 https://c2dm.link/r/camp_03\n\nLet me know if you want the lighting presets too!',
      link: 'https://c2dm.link/r/camp_03',
      outcome: 'Direct affiliate partner click recorded in audit analytics',
    },
    VIP: {
      tag: 'High-Ticket Qualification Workflow',
      comment: 'VIP consultation needed for our Q3 marketing rollout 💼',
      detected: 'Keyword "VIP" matched with High-Ticket Consultation funnel',
      latency: '910ms',
      dm: 'Hey @founder_karan! 💼 We only accept 4 growth clients monthly. Schedule your 20-min intake session:\n👉 https://c2dm.link/r/camp_04\n\nWhat is your current monthly ad spend?',
      link: 'https://c2dm.link/r/camp_04',
      outcome: 'Follow-up Assistant generated custom consultation questionnaire',
    },
  };

  const selectedFlow = workflowExamples[workflowKeyword];

  const problemPoints = [
    {
      icon: Clock,
      title: 'The 15-Minute Decay Cliff',
      stat: '85% Drop-off',
      description:
        'Follower purchase intent plummets 85% within 15 minutes of leaving a comment on a Reel. If you manually reply hours later, they have already scrolled away and forgotten your brand.',
    },
    {
      icon: TrendingDown,
      title: 'The "Link in Bio" Friction Trap',
      stat: '80%+ Abandonment',
      description:
        'Telling viewers to "click the link in my bio" forces them to navigate out of the Reel, search your profile, and hunt through Linktree. 8 out of 10 users drop off before ever loading your website.',
    },
    {
      icon: Ban,
      title: 'Manual DM Spam Throttling',
      stat: 'Account Flag Risk',
      description:
        'Copy-pasting the same DM link manually to 150 commenters in an hour triggers Instagram automated spam tripwires, leading to shadowbans and blocked outbound messaging.',
    },
    {
      icon: HelpCircle,
      title: 'Zero Conversion Attribution',
      stat: 'Blind Marketing',
      description:
        'Standard Instagram insights tell you views and likes, but cannot tell you which comment generated which click, lead, or checkout. You run promotions completely blind.',
    },
  ];

  const targetAudiences = [
    {
      role: 'Course Creators & Educators',
      icon: GraduationCap,
      badge: 'High Conversion',
      headline: 'Fill bootcamps and sell digital courses on autopilot',
      benefits: [
        'Deliver curriculum PDFs and discount codes within 1 second of commenting.',
        'Qualify prospective students with automated multi-choice screening questions.',
        'Eliminate manual copy-pasting during high-stakes launch weeks.',
      ],
      templateCategory: 'course',
    },
    {
      role: 'Digital Product & SaaS Founders',
      icon: BookOpen,
      badge: 'Zero Friction',
      headline: 'Turn viral Reels into high-intent free trial signups and ebook downloads',
      benefits: [
        'Deliver Gumroad and Stripe checkout links directly into the follower DM inbox.',
        'Attribute exact click counts via tracked server redirects without inflated estimates.',
        'Seamlessly hand off warm prospects to the Follow-up Assistant queue.',
      ],
      templateCategory: 'pdf',
    },
    {
      role: 'Coaches & Service Agencies',
      icon: Briefcase,
      badge: 'Pre-Qualified Inbound',
      headline: 'Book high-ticket client discovery calls directly from comment threads',
      benefits: [
        'Ask budget and timeline questions before sharing your booking calendar link.',
        'Capture organized contact records in Lead Inbox with status timelines.',
        'Review AI-drafted 1-on-1 follow-ups with full human editorial control.',
      ],
      templateCategory: 'whatsapp',
    },
    {
      role: 'Affiliate Creators & D2C Brands',
      icon: ShoppingBag,
      badge: 'Instant ROI',
      headline: 'Send exact product & affiliate links right when buyer curiosity peaks',
      benefits: [
        'Deliver outfit and gear URLs while the follower is watching the Reel.',
        'Track verified link clicks across different trigger keywords.',
        'Comply 100% with Meta anti-spam policies with one-message-per-comment guardrails.',
      ],
      templateCategory: 'affiliate',
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Sub-Second Private Reply Pipeline',
      description:
        'Built strictly upon the official Instagram Graph API Private Reply endpoint. Responds to Reel and Carousel comments in under 1.2s within the allowed 7-day window.',
    },
    {
      icon: Sparkles,
      title: 'Intelligent Keyword Engine',
      description:
        'Flexible trigger rules supporting exact match, contains, and multi-keyword sets. Strips emojis and punctuation cleanly so typos never break your automation.',
    },
    {
      icon: MousePointerClick,
      title: 'Tracked Link Redirects & Verified Events',
      description:
        'Every outbound link routes through a dedicated tracked redirect station. Click counts and conversion timestamps are verified from real events — never invented or estimated.',
    },
    {
      icon: Users,
      title: 'Full-Lifecycle Lead Inbox',
      description:
        'Six pipeline stages (New, Interested, Needs follow-up, Link sent, Converted, Not interested). Complete per-comment status audit trail from detection to delivery confirmation.',
    },
    {
      icon: BrainCircuit,
      title: 'Campaign Coach AI Intelligence',
      description:
        'Analyzes your actual recorded metrics to answer which campaign performs best, which keywords bring qualified leads, where followers drop off, and what structured experiment to run next.',
    },
    {
      icon: ShieldCheck,
      title: 'Anti-Spam & Messaging Window Guardrails',
      description:
        'Send-once-per-user deduplication, 7-day cutoff timers, and mandatory human review for all custom follow-ups. Zero mass blasts to protect your Instagram Business reputation.',
    },
  ];

  const faqs = [
    {
      q: 'Does this comply with Instagram and Meta official policies?',
      a: 'Yes, 100%. Comment2DM connects via the official Instagram API with Instagram Login, requesting the exact approved permissions (instagram_business_basic, instagram_business_manage_comments, instagram_business_manage_messages). DMs are delivered using the official Private Reply endpoint, which allows a single direct message per comment within 7 days of posting.',
    },
    {
      q: 'How does the interactive demo work without connecting Instagram?',
      a: 'We built a zero-credential Interactive Sandbox studio right into the app. You can build full campaigns, simulate incoming Reel comments, test trigger keywords, inspect webhook payloads, and test tracked redirects in real time using local storage persistence — completely free without needing Meta API keys.',
    },
    {
      q: 'What happens when I connect my real Instagram Business account?',
      a: 'In live production mode, Comment2DM executes an OAuth 2.0 flow with CSRF state protection, exchanges short-lived tokens for 60-day long-lived tokens encrypted with AES-256-GCM on the server, and verifies real-time Meta webhooks using SHA-256 HMAC signatures before dispatching DMs.',
    },
    {
      q: 'How are link clicks and analytics tracked without fabricating numbers?',
      a: 'Unlike tools that estimate click-through rates, Comment2DM routes destination URLs through an internal tracked redirect endpoint (/r/:code or /api/redirect/:code). Every click records an immutable timestamp, campaign ID, and referrer header. In our Analytics and Coach views, every metric is clearly labeled as Measured, Estimated, or Unavailable.',
    },
    {
      q: 'Can the bot send spam or bulk blast my followers?',
      a: 'No. Comment2DM strictly prohibits and technically blocks bulk unsolicited messaging. DMs are only triggered in direct response to an explicit user comment. Furthermore, our Follow-up Assistant enforces human review: AI generates personalized drafts based on verified facts, but an operator must click "Approve & Send" for every outbound follow-up message.',
    },
    {
      q: 'Can I run different keywords for different offers on the same Reel?',
      a: 'Yes! You can attach multiple active campaigns to the same Instagram Reel or Post. For example, a follower commenting "PDF" receives your free guide, while a follower commenting "VIP" receives your consultation calendar link.',
    },
    {
      q: 'What Instagram account type is required for live Meta integration?',
      a: 'To use live Meta webhooks, you need an Instagram Professional account (Creator or Business) linked to a Meta Developer App. Personal Instagram accounts are not supported by Meta Graph APIs.',
    },
  ];

  return (
    <div className="space-y-28 pb-24 text-slate-100">
      {/* 1. Hero Section: Outcome-Focused */}
      <section className="pt-10 sm:pt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-xs text-indigo-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-semibold">Official Meta Graph API Architecture & Sandbox Studio</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.12] text-balance">
            Turn Viral Instagram Reel Comments into{' '}
            <span className="bg-gradient-to-r from-rose-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
              Verified Leads & Automated Sales.
            </span>
          </h1>

          {/* Hinglish tagline + English Subtitle */}
          <div className="space-y-2">
            <p className="text-lg sm:text-2xl font-bold text-indigo-300 tracking-wide">
              "Comment karo. DM automatically chala jayega."
            </p>
            <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance">
              Stop losing 80% of warm buyers to link-in-bio friction. Deliver ebooks, course discounts, affiliate links, and consultation bookings in direct messages in <strong>under 1.2 seconds</strong> — 24/7 on complete autopilot.
            </p>
          </div>

          {/* Hero Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => setActiveTab('simulator')}
              className="w-full sm:w-auto px-7 py-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Launch Interactive Simulator (Free Sandbox)</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto px-6 py-4 text-sm font-semibold text-slate-200 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="w-4 h-4 text-indigo-400" />
            </button>
          </div>

          {/* Trust proof points */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              No Instagram login required to test
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Official Meta 7-day Private Reply API
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Real event-verified analytics (No fake CTR)
            </span>
          </div>
        </div>

        {/* 2. Interactive Workflow Demo */}
        <div id="workflow" className="mt-16 pt-2">
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Live Pipeline Demonstration
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Latency: {selectedFlow.latency}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 mt-1">
                  From Comment to Tracked Conversion in 4 Automated Steps
                </h3>
              </div>

              {/* Trigger Keyword Selector */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start sm:self-auto">
                <span className="text-xs text-slate-400 px-2 font-medium">Select Trigger:</span>
                {(['PDF', 'PRO', 'GEAR', 'VIP'] as const).map((kw) => (
                  <button
                    key={kw}
                    onClick={() => setWorkflowKeyword(kw)}
                    className={`px-3 py-1 text-xs font-mono font-bold rounded-md transition-all cursor-pointer ${
                      workflowKeyword === kw
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    "{kw}"
                  </button>
                ))}
              </div>
            </div>

            {/* 4 Connected Pipeline Stages */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1: Inbound Comment */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3 relative group">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-indigo-400 font-semibold">01. Inbound Comment</span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">
                  <span className="text-[10px] text-slate-400 font-mono block mb-1">
                    @follower on your Reel:
                  </span>
                  <p className="font-medium text-slate-100">"{selectedFlow.comment}"</p>
                </div>
                <p className="text-[11px] text-slate-400">
                  Follower interacts directly on your targeted Instagram Reel or Carousel post.
                </p>
              </div>

              {/* Step 2: Trigger Engine */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3 relative">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-emerald-400 font-semibold">02. Trigger Matched</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300">
                  <span className="text-[10px] text-emerald-400/80 font-mono block mb-1">
                    Matching Rule (Sub-90ms):
                  </span>
                  <p className="font-mono text-[11px] font-semibold">{selectedFlow.detected}</p>
                </div>
                <p className="text-[11px] text-slate-400">
                  Engine verifies deduplication rules and checks against the 7-day reply eligibility window.
                </p>
              </div>

              {/* Step 3: Personalized DM */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3 relative">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-purple-400 font-semibold">03. Private Reply DM</span>
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                </div>
                <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 font-mono text-[11px] leading-relaxed line-clamp-3">
                  {selectedFlow.dm}
                </div>
                <p className="text-[11px] text-slate-400">
                  Meta Graph API confirms delivery receipt with tracked destination URL parameters.
                </p>
              </div>

              {/* Step 4: Tracked Link Click */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3 relative">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-rose-400 font-semibold">04. Verified Attribution</span>
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                </div>
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300">
                  <span className="text-[10px] text-rose-400/80 font-mono block mb-1">
                    Audit Outcome:
                  </span>
                  <p className="text-[11px] font-semibold text-slate-100">{selectedFlow.outcome}</p>
                </div>
                <p className="text-[11px] text-slate-400">
                  Click recorded via redirect station; contact automatically synched into Lead Inbox.
                </p>
              </div>
            </div>

            {/* Bottom demo CTA banner */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-300">
                Want to test this with custom comments and see live HTTP payload logs?
              </span>
              <button
                onClick={() => setActiveTab('simulator')}
                className="inline-flex items-center gap-1.5 font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <span>Open Interactive Test Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Problem Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
            The Growth Bottleneck
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Why Manual Comment Replies Cost Creators 70%+ of Inbound Revenue
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Going viral on Instagram is useless if your conversion pipeline leaks every single time a follower shows buyer intent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problemPoints.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-rose-400 font-mono bg-rose-950/50 px-2 py-0.5 rounded border border-rose-900/50">
                      {item.stat}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Target Users Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Tailored Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Engineered for Creators, Brands & Growth Teams
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Whether you sell $27 ebooks, $499 courses, $2,000 services, or affiliate products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {targetAudiences.map((aud, idx) => {
            const Icon = aud.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all space-y-5 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-base font-bold text-slate-100">{aud.role}</span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-800/60">
                      {aud.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-indigo-200/90 leading-snug">
                    {aud.headline}
                  </h3>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {aud.benefits.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => {
                      const tpl =
                        templates.find((t) => t.category === aud.templateCategory) || templates[0];
                      applyTemplateToNewCampaign(tpl);
                    }}
                    className="w-full py-2.5 px-3 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Use {aud.role.split(' ')[0]} Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Complete Feature Suite */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Enterprise Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Built for Reliability, Speed, and Strict Compliance
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Everything you need to automate Instagram comment interactions without compromising account safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-100">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Honest Demo vs Live Architecture Section */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 shadow-2xl space-y-8">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Transparency & Dual Mode Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Test Safely in the Sandbox. Deploy With Real Meta Webhooks.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              We never show fake connection states or pretend an API is connected when it is not.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Mode 1: Sandbox */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-indigo-500/30 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Mode 01: Zero-Credential Sandbox
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active by Default
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  Instant Interactive Simulator
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Design campaigns, configure keywords, generate AI suggestions, simulate incoming Reel comments, and inspect delivery payloads instantly. Stored locally with zero credentials required.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>No Meta app or Facebook review needed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Test trigger variations and emoji filters safely</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verify tracked redirects without live audience risk</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setActiveTab('simulator')}
                className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
              >
                Open Sandbox Studio
              </button>
            </div>

            {/* Mode 2: Real Meta Integration */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Mode 02: Official Meta Production
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                    1-Click Connect
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  Real Instagram API with Instagram Login
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Production-grade backend with CSRF state validation, AES-256 token encryption, SHA-256 webhook HMAC verification, and 7-day Private Reply dispatch confirmation.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Official permissions: basic, manage_comments, manage_messages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Real-time webhook listener with de-duplication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Audit trail records real Meta Graph API response IDs</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setActiveTab('instagram')}
                className="w-full py-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                View Instagram API Setup Guide
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Pricing Section */}
      <section id="pricing" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Transparent Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Predictable Plans for Growth at Every Scale
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Zero per-comment surprise surcharges. Upgrade, downgrade, or pause anytime.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <span
              className={`text-xs ${
                billingCycle === 'monthly' ? 'text-white font-semibold' : 'text-slate-400'
              }`}
            >
              Monthly Billing
            </span>
            <button
              onClick={() =>
                setBillingCycle((prev) => (prev === 'monthly' ? 'yearly' : 'monthly'))
              }
              className="w-12 h-6 rounded-full bg-slate-800 p-1 flex items-center border border-slate-700 cursor-pointer"
              aria-label="Toggle annual billing"
            >
              <div
                className={`w-4 h-4 rounded-full bg-indigo-500 transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-xs flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'text-white font-semibold' : 'text-slate-400'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Free Starter Demo */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-slate-400">For testing & sandboxing</span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">Starter Sandbox</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                    ₹0
                  </span>
                  <span className="text-xs text-slate-400">/ forever free</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Up to 3 Active Campaigns</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Interactive Test Simulator & Webhook Inspector</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>9 Production Templates with Copy</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Tracked Link Redirect Station</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Local persistence in browser storage</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setActiveTab('simulator')}
              className="w-full py-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Launch Free Simulator
            </button>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="p-6 rounded-2xl bg-slate-900 border-2 border-indigo-500/80 flex flex-col justify-between space-y-6 relative shadow-xl shadow-indigo-600/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-indigo-400">For active creators & founders</span>
                  <h3 className="text-lg font-bold text-slate-100 mt-1">Creator Pro</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500 text-white px-2 py-0.5 rounded">
                  Most Popular
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  {billingCycle === 'monthly' ? '₹1,499' : '₹1,199'}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span><strong>Unlimited</strong> Active Campaigns</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>15,000 Automated DMs / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Sub-second &lt;1.2s dispatch pipeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Campaign Coach AI Intelligence</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Follow-up Assistant & Human Approval Queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Send-once-per-user anti-spam protection</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setActiveTab('signup')}
              className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all cursor-pointer font-bold"
            >
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Business Tier */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-slate-400">For agencies & high-volume brands</span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">Scale Business</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                    {billingCycle === 'monthly' ? '₹3,999' : '₹3,199'}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Connect up to 5 Instagram Creator/Business accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Unlimited Automated Direct Messages</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Dedicated high-throughput webhook runner</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Custom domain tracked redirect links</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Priority Meta API integration support & onboarding</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setActiveTab('campaigns')}
              className="w-full py-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section id="faq" className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Straightforward Answers to Common Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Everything you need to know about Meta compliance, rate limits, tracking, and the sandbox.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                      isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-16 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black">
                2D
              </span>
              <span className="text-base font-bold text-white">Comment2DM</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              "Comment karo. DM automatically chala jayega." Instagram comment-to-DM growth infrastructure.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Test Simulator
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab('coach')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Campaign Coach
            </button>
            <button
              onClick={() => setActiveTab('followup')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Follow-up Assistant
            </button>
            <button
              onClick={() => setActiveTab('instagram')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Instagram Setup
            </button>
          </div>
        </div>

        <div className="border-t border-slate-900 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 Comment2DM. All rights reserved.</p>
          <p className="text-slate-400 text-center sm:text-right">
            Independent software architecture. Designed for official Meta Graph API compliance.
          </p>
        </div>
      </footer>
    </div>
  );
};
