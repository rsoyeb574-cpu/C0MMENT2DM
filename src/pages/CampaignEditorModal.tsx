import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Campaign, MatchType } from '../types';
import { PhoneMockup } from '../components/PhoneMockup';
import { generateCampaignSuggestions } from '../services/aiSuggestService';
import {
  X,
  Sparkles,
  Check,
  Link as LinkIcon,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Info,
} from 'lucide-react';

export const CampaignEditorModal: React.FC = () => {
  const {
    isEditorOpen,
    closeEditor,
    editingCampaign,
    saveCampaign,
    posts,
    isInstagramConnected,
    addToast,
  } = useApp();

  // Wizard Step: 1 to 6
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form states
  const [name, setName] = useState('');
  const [offer, setOffer] = useState('');
  const [postId, setPostId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [matchType, setMatchType] = useState<MatchType>('contains');
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [sendOncePerUser, setSendOncePerUser] = useState(true);
  const [publicCommentReply, setPublicCommentReply] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [callToAction, setCallToAction] = useState('');
  const [qualificationQuestions, setQualificationQuestions] = useState<string[]>([]);
  const [newQuestionInput, setNewQuestionInput] = useState('');
  const [setupVerified, setSetupVerified] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedReplies, setAiGeneratedReplies] = useState<string[]>([]);

  useEffect(() => {
    if (editingCampaign) {
      setName(editingCampaign.name || '');
      setOffer(editingCampaign.offer || '');
      setPostId(editingCampaign.postId || posts[0]?.id || '');
      setKeyword(editingCampaign.keyword || '');
      setMatchType(editingCampaign.matchType || 'contains');
      setCaseInsensitive(editingCampaign.caseInsensitive ?? true);
      setSendOncePerUser(editingCampaign.sendOncePerUser ?? true);
      setPublicCommentReply(editingCampaign.publicCommentReply || 'Sent you a DM! Check your inbox 🚀');
      setMessage(editingCampaign.message || '');
      setLink(editingCampaign.link || '');
      setCallToAction(editingCampaign.callToAction || 'View Resource');
      setQualificationQuestions(editingCampaign.qualificationQuestions || []);
      setSetupVerified(editingCampaign.setupVerified ?? true);
      setCurrentStep(1);
    } else {
      // Default initial states
      setName('Free AI Blueprint & Playbook');
      setOffer('Free 35-page guide to building automated workflows');
      setPostId(posts[0]?.id || '');
      setKeyword('BLUEPRINT, GUIDE, PDF');
      setMatchType('contains');
      setCaseInsensitive(true);
      setSendOncePerUser(true);
      setPublicCommentReply('Sent you a DM! Check your inbox for the download link 🚀');
      setMessage('Hey {{username}}! 🙌 Here is your free blueprint as promised:\n\n{{link}}\n\nLet me know once you download it! Happy building!');
      setLink('https://gumroad.com/l/free-blueprint');
      setCallToAction('Download Free Blueprint');
      setQualificationQuestions(['What is your primary goal this quarter?']);
      setSetupVerified(false);
      setCurrentStep(1);
    }
    setValidationError('');
  }, [editingCampaign, isEditorOpen, posts]);

  if (!isEditorOpen) return null;

  const handleInsertVariable = (varTag: string) => {
    setMessage((prev) => prev + ' ' + varTag);
  };

  const handleAddQuestion = () => {
    if (!newQuestionInput.trim()) return;
    setQualificationQuestions((prev) => [...prev, newQuestionInput.trim()]);
    setNewQuestionInput('');
  };

  const handleRemoveQuestion = (index: number) => {
    setQualificationQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // AI Suggest handler
  const handleAISuggest = async () => {
    if (!offer.trim() && !name.trim()) {
      setValidationError('Please enter what offer or resource you are sharing so AI can suggest tailored copy.');
      return;
    }
    setValidationError('');
    setIsGeneratingAI(true);
    try {
      const suggestion = await generateCampaignSuggestions(offer.trim() || name.trim());
      setKeyword(suggestion.keywords.join(', '));
      setAiGeneratedReplies(suggestion.publicReplies);
      if (suggestion.publicReplies.length > 0) {
        setPublicCommentReply(suggestion.publicReplies[0]);
      }
      setMessage(suggestion.dmMessage);
      setCallToAction(suggestion.callToAction);
      if (suggestion.qualificationQuestions.length > 0) {
        setQualificationQuestions(suggestion.qualificationQuestions);
      }
      addToast('AI suggestion applied! Review and customize each draft.', 'success');
    } catch {
      addToast('AI suggestion failed. Please try again.', 'error');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Step validation
  const validateCurrentStep = (step: number): boolean => {
    setValidationError('');
    if (step === 1) {
      if (!name.trim()) {
        setValidationError('Campaign name is required.');
        return false;
      }
      if (!offer.trim()) {
        setValidationError('Please describe the offer or lead magnet.');
        return false;
      }
    }
    if (step === 2) {
      if (!postId) {
        setValidationError('Please select an Instagram Reel or Post to monitor.');
        return false;
      }
    }
    if (step === 3) {
      if (!keyword.trim()) {
        setValidationError('At least one trigger keyword is required (e.g. PDF, GUIDE).');
        return false;
      }
    }
    if (step === 4) {
      if (!link.trim()) {
        setValidationError('Destination URL link is required.');
        return false;
      }
      if (!message.trim()) {
        setValidationError('Private direct message copy cannot be empty.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handleBack = () => {
    setValidationError('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Final submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCurrentStep(1) || !validateCurrentStep(3) || !validateCurrentStep(4)) {
      return;
    }

    if (!setupVerified) {
      setValidationError('Verification required: Please confirm that you have verified this automated sequence before activating.');
      return;
    }

    const selectedPost = posts.find((p) => p.id === postId) || posts[0];

    const success = saveCampaign({
      name: name.trim(),
      offer: offer.trim(),
      postId: selectedPost.id,
      postThumbnail: selectedPost.thumbnail,
      postCaption: selectedPost.caption,
      keyword: keyword.trim().toUpperCase(),
      matchType,
      caseInsensitive,
      sendOncePerUser,
      publicCommentReply: publicCommentReply.trim(),
      message: message.trim(),
      link: link.trim(),
      callToAction: callToAction.trim() || 'View Link',
      qualificationQuestions,
      setupVerified: true,
      status: 'active',
    });

    if (success) {
      closeEditor();
    }
  };

  // Preview formatted text
  const previewText = message
    .replace(/{{username}}/g, '@priya_creator')
    .replace(/{{first_name}}/g, 'Priya')
    .replace(/{{link}}/g, link || 'https://gumroad.com/l/free-blueprint');

  const selectedPost = posts.find((p) => p.id === postId) || posts[0];

  const stepsList = [
    { num: 1, label: 'Basics & Offer' },
    { num: 2, label: 'Target Post' },
    { num: 3, label: 'Keywords' },
    { num: 4, label: 'Reply & DM' },
    { num: 5, label: 'Questions' },
    { num: 6, label: 'Verify & Activate' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Wizard Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                Smart Campaign Builder
              </span>
              <span className="text-xs text-slate-400">Step {currentStep} of 6</span>
            </div>
            <h2 className="text-base font-semibold text-slate-100 mt-1">
              {editingCampaign?.id ? 'Edit Comment-to-DM Campaign' : 'Create High-Converting Campaign'}
            </h2>
          </div>
          <button
            onClick={closeEditor}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 py-2.5 bg-slate-900/90 border-b border-slate-800/80 overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between min-w-[540px] text-xs">
            {stepsList.map((s, idx) => {
              const isPassed = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <button
                  type="button"
                  key={s.num}
                  onClick={() => {
                    if (s.num < currentStep || validateCurrentStep(currentStep)) {
                      setCurrentStep(s.num);
                    }
                  }}
                  className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isCurrent
                      ? 'text-indigo-400 font-bold'
                      : isPassed
                      ? 'text-slate-300'
                      : 'text-slate-500'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-indigo-600 text-white'
                        : isPassed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isPassed ? <Check className="w-3 h-3" /> : s.num}
                  </div>
                  <span>{s.label}</span>
                  {idx < stepsList.length - 1 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 ml-1 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Current Step Content */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="space-y-5">
              {validationError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* STEP 1: Basics & The Offer */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-semibold text-slate-100">Step 1: Campaign Name & Offer</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Name your campaign and define what value you are delivering to followers.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Campaign Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Free 32-Page SaaS Blueprint PDF"
                      className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        The Offer / Value Proposition <span className="text-rose-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAISuggest}
                        disabled={isGeneratingAI}
                        className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-md border border-indigo-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                        <span>{isGeneratingAI ? 'Generating Copy...' : 'AI Suggest Copy'}</span>
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={offer}
                      onChange={(e) => setOffer(e.target.value)}
                      placeholder="e.g. Free 40-page blueprint PDF on how I grew my agency to $20k/mo without paid ads"
                      className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      💡 Tip: Click <strong>"AI Suggest Copy"</strong> to automatically generate trigger keywords, public replies, DM drafts, and CTAs tailored to this offer.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Target Post / Reel */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-semibold text-slate-100">Step 2: Choose Instagram Reel or Post</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Select which media post will trigger automated comments and private DMs.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                    {posts.map((post) => {
                      const isSelected = postId === post.id;
                      return (
                        <button
                          type="button"
                          key={post.id}
                          onClick={() => setPostId(post.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-950/40 border-indigo-500 text-slate-100 ring-1 ring-indigo-500/50'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                          }`}
                        >
                          <div className="w-14 h-14 rounded-lg bg-slate-800 shrink-0 overflow-hidden relative border border-slate-700/60">
                            <img
                              src={post.thumbnail}
                              alt="Post thumbnail"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/70 text-[9px] text-white font-mono uppercase">
                              {post.type}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-medium">
                              {post.caption}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                              <span>❤️ {post.likes.toLocaleString()}</span>
                              <span>💬 {post.comments.toLocaleString()}</span>
                              <span>🕒 {post.date}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Trigger Keywords & Matching Rules */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">Step 3: Trigger Keywords & Rules</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Define which words in user comments will trigger your automated workflow.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAISuggest}
                      disabled={isGeneratingAI}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Keywords</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Trigger Keywords (Comma separated) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="e.g. PDF, BLUEPRINT, GUIDE"
                      className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono tracking-wide uppercase"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {keyword
                        .split(',')
                        .map((k) => k.trim())
                        .filter(Boolean)
                        .map((kw, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30"
                          >
                            #{kw}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1.5">
                        Keyword Matching Type
                      </label>
                      <select
                        value={matchType}
                        onChange={(e) => setMatchType(e.target.value as MatchType)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700/80 text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="contains">Contains (e.g. "Send PDF please")</option>
                        <option value="exact">Exact Match (Comment must equal keyword only)</option>
                      </select>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={caseInsensitive}
                          onChange={(e) => setCaseInsensitive(e.target.checked)}
                          className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                        />
                        <span>Case-insensitive (matches "pdf", "Pdf", "PDF")</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sendOncePerUser}
                          onChange={(e) => setSendOncePerUser(e.target.checked)}
                          className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                        />
                        <span>Send once per user (prevent duplicate spam)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Public Reply, Private DM & Destination Link */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">Step 4: Public Reply & Private DM</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Customize what appears in public post comments and private direct messages.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAISuggest}
                      disabled={isGeneratingAI}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Drafts</span>
                    </button>
                  </div>

                  {/* Public comment reply */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Public Comment Reply Draft
                    </label>
                    <input
                      type="text"
                      value={publicCommentReply}
                      onChange={(e) => setPublicCommentReply(e.target.value)}
                      placeholder="e.g. Sent you a DM! Check your inbox 🚀"
                      className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    {aiGeneratedReplies.length > 1 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] text-slate-400 self-center">AI Alternatives:</span>
                        {aiGeneratedReplies.map((reply, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setPublicCommentReply(reply)}
                            className="text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700"
                          >
                            Option {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Destination Link URL */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Destination Link URL <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://yourwebsite.com/resource"
                        className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Call to action button text */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Call to Action (CTA) Button Label
                    </label>
                    <input
                      type="text"
                      value={callToAction}
                      onChange={(e) => setCallToAction(e.target.value)}
                      placeholder="e.g. Download Free Blueprint"
                      className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Private DM message */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Private Direct Message Copy <span className="text-rose-400">*</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500">Insert tag:</span>
                        <button
                          type="button"
                          onClick={() => handleInsertVariable('{{username}}')}
                          className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 hover:bg-slate-700 rounded border border-slate-700 cursor-pointer"
                        >
                          {'{{username}}'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertVariable('{{link}}')}
                          className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 hover:bg-slate-700 rounded border border-slate-700 cursor-pointer"
                        >
                          {'{{link}}'}
                        </button>
                      </div>
                    </div>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hey {{username}}! Thanks for commenting..."
                      className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: Optional Qualification Questions */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">Step 5: Optional Qualification Questions</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Ask leads questions in follow-up DMs to qualify their budget, intent, or requirements.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newQuestionInput}
                      onChange={(e) => setNewQuestionInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddQuestion())}
                      placeholder="e.g. What is your estimated project budget?"
                      className="flex-1 px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {qualificationQuestions.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center">
                        <HelpCircle className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                        <p className="text-xs text-slate-400 font-medium">No qualification questions added</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Questions are optional. They allow you to qualify leads in your Lead Inbox.
                        </p>
                      </div>
                    ) : (
                      qualificationQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold text-slate-400 shrink-0">
                              {idx + 1}
                            </span>
                            <span className="truncate">{q}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* STEP 6: Live Preview & Setup Verification */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-semibold text-slate-100">Step 6: Preview & Setup Verification</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Verify configuration before activating this automated campaign.
                    </p>
                  </div>

                  {/* Verification Checklist */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Setup Verification Checklist</span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">Instagram Connection:</span>
                        <span className={`font-medium ${isInstagramConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {isInstagramConnected ? 'Connected ✓' : 'Demo Mode Active'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">Trigger Keywords:</span>
                        <span className="text-slate-200 font-mono font-bold">{keyword}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">Destination Link:</span>
                        <span className="text-indigo-400 truncate max-w-[200px]">{link}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-900">
                        <span className="text-slate-400">Meta Rule Compliance:</span>
                        <span className="text-emerald-400">Checked (7-day window & single reply limit) ✓</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/30 text-xs text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={setupVerified}
                          onChange={(e) => setSetupVerified(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 shrink-0"
                        />
                        <div>
                          <span className="font-semibold text-indigo-300">
                            I verify and approve this automation setup
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            I confirm that the destination link and message copy comply with Meta Platform terms.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between mt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={closeEditor}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
              )}

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 cursor-pointer transition-all"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!setupVerified}
                  className={`px-6 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                    setupVerified
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Activate Campaign</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Live Instagram Phone Mockup Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-center mb-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Live Instagram Direct Preview
              </span>
              <p className="text-[11px] text-slate-500">
                Visualizing follower interaction flow
              </p>
            </div>

            <PhoneMockup
              username="priya_creator"
              userAvatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
              commentText={`${keyword.split(',')[0].trim() || 'PDF'} please!`}
              replyText={previewText}
              link={link}
              postThumbnail={selectedPost.thumbnail}
            />

            {publicCommentReply && (
              <div className="mt-4 w-full max-w-[280px] p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                <span className="text-[10px] font-semibold text-indigo-400 block mb-1">
                  Public Comment Reply:
                </span>
                <p className="text-slate-300 leading-relaxed italic">
                  "{publicCommentReply}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
