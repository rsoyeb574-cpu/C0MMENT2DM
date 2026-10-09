import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PhoneMockup } from '../components/PhoneMockup';
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
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveTab, openCreateCampaign, templates, applyTemplateToNewCampaign } = useApp();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  // Workflow visual active tab
  const [workflowKeyword, setWorkflowKeyword] = useState<'PDF' | 'PRO' | 'GEAR'>('PDF');

  const workflowExamples = {
    PDF: {
      comment: 'PDF please! Sending this to my team 🚀',
      detected: 'Keyword "PDF" detected in comment',
      dm: 'Hey @follower! 🙌 Here is the 32-Page SaaS Blueprint as promised: https://gumroad.com/l/saas-free',
      link: 'https://gumroad.com/l/saas-free',
    },
    PRO: {
      comment: 'PRO discount code please!',
      detected: 'Keyword "PRO" detected in comment',
      dm: 'Hey @follower! 🚀 50% discount coupon SAVE50 is active: https://learncode.dev/bootcamp?coupon=SAVE50',
      link: 'https://learncode.dev/bootcamp?coupon=SAVE50',
    },
    GEAR: {
      comment: 'What camera is that? GEAR please',
      detected: 'Keyword "GEAR" detected in comment',
      dm: 'Hey @follower! ✨ Here are direct affiliate links for my setup: https://kit.co/creatorhub/desk-setup',
      link: 'https://kit.co/creatorhub/desk-setup',
    },
  };

  const selectedFlow = workflowExamples[workflowKeyword];

  const faqs = [
    {
      q: 'Does this comply with Instagram and Meta policies?',
      a: 'Yes! Automated comment-to-DM triggers are officially supported by Meta through the Instagram Messaging and Graph APIs. In real production, Comment2DM operates within Meta rate limits and requires official creator authorization.',
    },
    {
      q: 'How fast is the DM sent after someone comments?',
      a: 'Direct messages are prepared and dispatched in under 1.2 seconds after the follower posts their comment on your Reel or post. In our interactive demo simulator, you can watch each pipeline step happen in real time.',
    },
    {
      q: 'Can I personalize the message with the follower’s name?',
      a: 'Absolutely! You can insert dynamic tags like {{username}} and {{first_name}} directly into your message templates, ensuring each direct message feels authentic, personal, and conversational.',
    },
    {
      q: 'What happens if a follower comments multiple times?',
      a: 'Comment2DM includes a built-in "Send once per user" anti-spam protection toggle. When enabled, each follower receives your automated DM only once per post, keeping your inbox clean and compliant.',
    },
    {
      q: 'How does this Phase 1 Demo mode work?',
      a: 'Phase 1 is a complete, self-contained interactive browser sandbox. It stores campaigns, copy templates, and simulated analytics locally in your browser so you can test campaigns, preview direct messages, and run comment simulations without needing Meta credentials.',
    },
    {
      q: 'Can I trigger different links for different keywords on the same reel?',
      a: 'Yes! You can configure multiple active campaigns for the same post or reel, each listening for distinct trigger words (e.g. "PDF" for your guide, "COMMUNITY" for WhatsApp, and "CONSULT" for a booking link).',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Tagline kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Automate Instagram Leads & Conversions</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] text-balance">
            Comment karo.{' '}
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              DM automatically chala jayega.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance">
            Stop losing sales to manual DMs. Turn viral Instagram Reel comments into instant PDF downloads, course sales, affiliate revenue, and community members on 24/7 autopilot.
          </p>

          {/* Hero CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab('simulator')}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Try Live Simulator (Free Sandbox)</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              No Instagram login required for demo
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Instant interactive pipeline
            </span>
          </div>
        </div>

        {/* Workflow Visual Section */}
        <div id="workflow" className="mt-16 pt-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  How The Automation Works
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-1">
                  Comment → Keyword Detected → Automatic DM → Link Delivered
                </h3>
              </div>

              {/* Keyword switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start sm:self-auto">
                <span className="text-xs text-slate-400 px-2 font-medium">Test Trigger:</span>
                {(['PDF', 'PRO', 'GEAR'] as const).map((kw) => (
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

            {/* 4 Interactive Visual Workflow Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1: Comment */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative group">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-indigo-400 font-semibold">01. Inbound Comment</span>
                  <span className="w-2 h-2 rounded-full bg-slate-700" />
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">
                  <span className="text-[10px] text-slate-500 font-mono block mb-1">
                    @user_growth on Reel:
                  </span>
                  <p className="font-medium text-slate-100">"{selectedFlow.comment}"</p>
                </div>
                <p className="text-[11px] text-slate-400">
                  Follower leaves a comment on your targeted Reel or Carousel post.
                </p>
              </div>

              {/* Step 2: Keyword Detected */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-emerald-400 font-semibold">02. Keyword Detected</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300">
                  <span className="text-[10px] text-emerald-400/80 font-mono block mb-1">
                    Matching Engine (95ms):
                  </span>
                  <p className="font-mono font-semibold">{selectedFlow.detected}</p>
                </div>
                <p className="text-[11px] text-slate-400">
                  Engine filters punctuation and detects trigger keyword rule instantly.
                </p>
              </div>

              {/* Step 3: Automatic DM */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-purple-400 font-semibold">03. Automatic DM</span>
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                </div>
                <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/30 text-xs text-purple-300">
                  <span className="text-[10px] text-purple-400/80 font-mono block mb-1">
                    Dynamic Template:
                  </span>
                  <p className="truncate text-slate-200">Personalized for @follower</p>
                </div>
                <p className="text-[11px] text-slate-400">
                  Custom message generated with {'{{username}}'} and tracking URL parameters.
                </p>
              </div>

              {/* Step 4: Link Delivered */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono text-rose-400 font-semibold">04. Link Delivered</span>
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                </div>
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300">
                  <span className="text-[10px] text-rose-400/80 font-mono block mb-1">
                    Recipient Inbox:
                  </span>
                  <p className="font-semibold text-white">Direct Link Ready to Tap</p>
                </div>
                <p className="text-[11px] text-slate-400">
                  Follower taps link right inside their Instagram direct message inbox.
                </p>
              </div>
            </div>

            {/* Quick interactive test button */}
            <div className="pt-2 text-center">
              <button
                onClick={() => setActiveTab('simulator')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <span>Run this exact flow in the Test Simulator Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Simple 3-Step Setup
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Set it up once. Works 24/7 forever.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            No complicated chatbots or messy decision trees. Just clean, reliable comment triggers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              Pick Your Reel & Set Keywords
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select the Instagram Reel or Post you want to monitor. Pick your trigger words (like "PDF", "COURSE", "LINK", or "SAVE50"). Supports exact match and case-insensitive options.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center font-mono font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              Write Your DM & Destination Link
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Add your personalized direct message template. Insert dynamic variables like {'{{username}}'} and provide your destination link (Gumroad, YouTube, WhatsApp, or shop).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              Watch Leads & Clicks Multiply
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Whenever a follower comments on your post, Comment2DM dispatches the direct message in 1.2s. Track real-time views, DMs sent, and link click-through conversions in your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
            High-Converting Use Cases
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Built for Every Creator & Business Model
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Explore 6 ready-to-deploy comment automation workflows with pre-built copy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. PDF / Ebook */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">PDF & Ebook Lead Magnet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Comment 'PDF' to get our free 32-page guide." Collect emails and build your warm audience with frictionless DM delivery.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                Trigger: "PDF, GUIDE, EBOOK"
              </div>
            </div>
            <button
              onClick={() => {
                const tpl = templates.find((t) => t.category === 'pdf') || templates[0];
                applyTemplateToNewCampaign(tpl);
              }}
              className="w-full py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Use PDF Template</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Course */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">Course Enrollment & Syllabus</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Comment 'PRO' for curriculum + early bird coupon." Direct interested students straight to your checkout without link-in-bio friction.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                Trigger: "PRO, COURSE, LEARN"
              </div>
            </div>
            <button
              onClick={() => {
                const tpl = templates.find((t) => t.category === 'course') || templates[1];
                applyTemplateToNewCampaign(tpl);
              }}
              className="w-full py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Use Course Template</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3. Affiliate */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">Affiliate Link & Outfit Tagging</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Comment 'GEAR' for direct Amazon & store links." Deliver exact affiliate product URLs right when buyer intent is highest.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                Trigger: "GEAR, OUTFIT, LINK"
              </div>
            </div>
            <button
              onClick={() => {
                const tpl = templates.find((t) => t.category === 'affiliate') || templates[2];
                applyTemplateToNewCampaign(tpl);
              }}
              className="w-full py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Use Affiliate Template</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4. Coupon */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">Exclusive Flash Coupon Code</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Comment 'SAVE20' to claim exclusive 20% OFF." Create urgency for product launches, flash sales, and holiday events.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                Trigger: "SAVE20, DEAL, DISCOUNT"
              </div>
            </div>
            <button
              onClick={() => {
                const tpl = templates.find((t) => t.category === 'coupon') || templates[3];
                applyTemplateToNewCampaign(tpl);
              }}
              className="w-full py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Use Coupon Template</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 5. WhatsApp */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">VIP WhatsApp Community</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Comment 'COMMUNITY' to join our private WhatsApp group." Move Instagram followers into high-retention chat channels.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                Trigger: "COMMUNITY, VIP, JOIN"
              </div>
            </div>
            <button
              onClick={() => {
                const tpl = templates.find((t) => t.category === 'whatsapp') || templates[4];
                applyTemplateToNewCampaign(tpl);
              }}
              className="w-full py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Use Community Template</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 6. YouTube */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                <Youtube className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-100">YouTube Video & Podcast</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Comment 'VIDEO' for the uncut 40-minute deep dive." Funnel viral reel viewers directly into long-form YouTube views.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                Trigger: "VIDEO, YOUTUBE, FULL"
              </div>
            </div>
            <button
              onClick={() => {
                const tpl = templates.find((t) => t.category === 'youtube') || templates[5];
                applyTemplateToNewCampaign(tpl);
              }}
              className="w-full py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Use Video Template</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Simple Transparent Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Plans for Creators at Every Stage
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            No per-comment surprise surcharges. Upgrade or downgrade anytime.
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
          {/* Free Tier */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-slate-400">For beginners & testing</span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">Starter Demo</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                    ₹0
                  </span>
                  <span className="text-xs text-slate-400">/ forever</span>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Up to 3 Active Campaigns</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>250 Simulated DMs / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Full Interactive Test Simulator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Exact & Contains Keyword Matching</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Basic Analytics & Conversion Tracking</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setActiveTab('simulator')}
              className="w-full py-2.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Get Started Free
            </button>
          </div>

          {/* Pro Tier (Popular) */}
          <div className="p-6 rounded-2xl bg-slate-900 border-2 border-indigo-500/80 flex flex-col justify-between space-y-6 relative shadow-xl shadow-indigo-600/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-indigo-400">For active creators</span>
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
                  <span>Dynamic personalization (name, link)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Send-once-per-user spam guard</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setActiveTab('campaigns')}
              className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Business Tier */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-slate-400">For agencies & brands</span>
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
                  <span>Multiple Instagram Creator handles (up to 5)</span>
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
                  <span>Custom UTM campaign attribution</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Priority Meta API integration support</span>
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

      {/* FAQ Section */}
      <section id="faq" className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Everything you need to know
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Common questions regarding comment automation, delivery speeds, and Phase 1 demo mode.
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
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                      isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
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
              "Comment karo. DM automatically chala jayega." Automated Instagram growth infrastructure.
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
              onClick={() => setActiveTab('templates')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              DM Templates
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
            DEMO MODE EDITION · Independent software simulation, not officially affiliated with Meta or Instagram.
          </p>
        </div>
      </footer>
    </div>
  );
};
