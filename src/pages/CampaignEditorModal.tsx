import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Campaign, MatchType } from '../types';
import { PhoneMockup } from '../components/PhoneMockup';
import { X, Sparkles, Check, Link as LinkIcon, MessageSquare, AlertCircle } from 'lucide-react';

export const CampaignEditorModal: React.FC = () => {
  const { isEditorOpen, closeEditor, editingCampaign, saveCampaign, posts, setActiveTab } = useApp();

  const [name, setName] = useState('');
  const [postId, setPostId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [matchType, setMatchType] = useState<MatchType>('contains');
  const [caseInsensitive, setCaseInsensitive] = useState(true);
  const [sendOncePerUser, setSendOncePerUser] = useState(true);
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (editingCampaign) {
      setName(editingCampaign.name || '');
      setPostId(editingCampaign.postId || posts[0]?.id || '');
      setKeyword(editingCampaign.keyword || '');
      setMatchType(editingCampaign.matchType || 'contains');
      setCaseInsensitive(editingCampaign.caseInsensitive ?? true);
      setSendOncePerUser(editingCampaign.sendOncePerUser ?? true);
      setMessage(editingCampaign.message || '');
      setLink(editingCampaign.link || '');
    } else {
      // Default new campaign
      setName('Free AI Resource PDF');
      setPostId(posts[0]?.id || '');
      setKeyword('PDF, GUIDE');
      setMatchType('contains');
      setCaseInsensitive(true);
      setSendOncePerUser(true);
      setMessage('Hey {{username}}! 🙌 Here is the free guide you requested:\n\n{{link}}\n\nLet me know once you go through it!');
      setLink('https://gumroad.com/l/free-guide');
    }
    setValidationError('');
  }, [editingCampaign, isEditorOpen, posts]);

  if (!isEditorOpen) return null;

  const handleInsertVariable = (varTag: string) => {
    setMessage((prev) => prev + ' ' + varTag);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Campaign name is required.');
      return;
    }
    if (!keyword.trim()) {
      setValidationError('At least one trigger keyword is required.');
      return;
    }
    if (!message.trim()) {
      setValidationError('DM message content cannot be empty.');
      return;
    }
    if (!link.trim()) {
      setValidationError('Resource link URL is required.');
      return;
    }

    const selectedPost = posts.find((p) => p.id === postId) || posts[0];

    saveCampaign({
      name: name.trim(),
      postId: selectedPost.id,
      postThumbnail: selectedPost.thumbnail,
      postCaption: selectedPost.caption,
      keyword: keyword.trim().toUpperCase(),
      matchType,
      caseInsensitive,
      sendOncePerUser,
      message: message.trim(),
      link: link.trim(),
    });
  };

  // Preview formatting
  const previewText = message
    .replace(/{{username}}/g, '@priya_creator')
    .replace(/{{first_name}}/g, 'Priya')
    .replace(/{{link}}/g, link || 'https://gumroad.com/l/free-guide');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              {editingCampaign?.id ? 'Edit Automation Campaign' : 'Create New Comment-to-DM Campaign'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Set trigger keywords and customize automated direct message responses.
            </p>
          </div>
          <button
            onClick={closeEditor}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Fields */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-5">
            {validationError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Campaign Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Campaign Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Free 32-Page SaaS Blueprint PDF"
                className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Target Instagram Post/Reel */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Select Instagram Reel / Post to Monitor
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {posts.map((post) => {
                  const isSelected = postId === post.id;
                  return (
                    <button
                      type="button"
                      key={post.id}
                      onClick={() => setPostId(post.id)}
                      className={`p-2.5 rounded-lg border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 text-slate-100 ring-1 ring-indigo-500/50'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="w-12 h-12 rounded bg-slate-800 shrink-0 overflow-hidden relative border border-slate-700/60">
                        <img
                          src={post.thumbnail}
                          alt="Post thumbnail"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-0.5 right-0.5 text-[8px] uppercase font-bold bg-black/80 px-1 rounded text-white">
                          {post.type}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-slate-200 line-clamp-2 leading-snug">
                          {post.caption}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono mt-1 block tabular-nums">
                          {post.comments} comments · {post.likes} likes
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trigger Keyword & Match Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Trigger Keyword(s)
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. PDF, GUIDE, EBOOK"
                  className="w-full px-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Separate multiple triggers with commas
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Matching Engine
                </label>
                <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setMatchType('contains')}
                    className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      matchType === 'contains'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Contains Keyword
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchType('exact')}
                    className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      matchType === 'exact'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Exact Match Only
                  </button>
                </div>
              </div>
            </div>

            {/* Toggle Switches */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-medium text-slate-300 block">Case-insensitive</span>
                  <span className="text-[10px] text-slate-500 block">Matches "pdf", "Pdf", "PDF"</span>
                </div>
                <input
                  type="checkbox"
                  checked={caseInsensitive}
                  onChange={(e) => setCaseInsensitive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-medium text-slate-300 block">Send once per user</span>
                  <span className="text-[10px] text-slate-500 block">Prevents duplicate DMs to same person</span>
                </div>
                <input
                  type="checkbox"
                  checked={sendOncePerUser}
                  onChange={(e) => setSendOncePerUser(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0"
                />
              </label>
            </div>

            {/* Destination Link */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Resource Destination Link</span>
                <span className="text-[10px] text-slate-500 font-mono">Mapped to {'{{link}}'}</span>
              </label>
              <div className="relative">
                <LinkIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://gumroad.com/l/free-guide"
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* DM Message Content */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Direct Message Copy</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Insert:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable('{{username}}')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono text-[10px] border border-slate-700 cursor-pointer"
                  >
                    + {'{{username}}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable('{{first_name}}')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono text-[10px] border border-slate-700 cursor-pointer"
                  >
                    + {'{{first_name}}'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertVariable('{{link}}')}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 font-mono text-[10px] border border-slate-700 cursor-pointer"
                  >
                    + {'{{link}}'}
                  </button>
                </div>
              </div>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hey {{username}}! Thanks for commenting. Here is your link: {{link}}"
                className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-slate-950 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={closeEditor}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {editingCampaign?.id ? 'Save Changes' : 'Launch Campaign'}
              </button>
            </div>
          </form>

          {/* Right Column: Live Instagram DM Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
            <div className="w-full mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Direct Message Preview</span>
              </div>
              <span className="text-[10px] text-slate-500">Updates in real time</span>
            </div>

            <PhoneMockup
              senderHandle="creator_studio"
              recipientHandle="priya_creator"
              messageText={previewText}
              linkUrl={link}
              timeString="Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
