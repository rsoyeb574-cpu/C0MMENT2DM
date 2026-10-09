import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Template } from '../types';
import {
  FileText,
  PlusCircle,
  Copy,
  Edit2,
  Trash2,
  ArrowRight,
  Sparkles,
  BookOpen,
  GraduationCap,
  ShoppingBag,
  Ticket,
  MessageCircle,
  Youtube,
  X,
  AlertCircle,
} from 'lucide-react';

export const TemplatesView: React.FC = () => {
  const {
    templates,
    saveTemplate,
    deleteTemplate,
    duplicateTemplate,
    applyTemplateToNewCampaign,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Form states for modal
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<Template['category']>('pdf');
  const [formKeyword, setFormKeyword] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState('');

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormTitle('New Lead Magnet Template');
    setFormCategory('pdf');
    setFormKeyword('PDF, GUIDE');
    setFormMessage('Hey {{username}}! 📘 Here is the link: {{link}}');
    setFormLink('https://yourwebsite.com/guide.pdf');
    setFormDescription('High-converting automated lead distribution.');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (tpl: Template) => {
    setEditingTemplate(tpl);
    setFormTitle(tpl.title);
    setFormCategory(tpl.category);
    setFormKeyword(tpl.keywordSuggestion);
    setFormMessage(tpl.message);
    setFormLink(tpl.defaultLink);
    setFormDescription(tpl.description);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!formMessage.trim()) {
      setFormError('Message copy is required');
      return;
    }

    saveTemplate({
      id: editingTemplate?.id,
      title: formTitle.trim(),
      category: formCategory,
      keywordSuggestion: formKeyword.trim().toUpperCase(),
      message: formMessage.trim(),
      defaultLink: formLink.trim(),
      description: formDescription.trim(),
    });
    setIsModalOpen(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'pdf':
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case 'course':
        return <GraduationCap className="w-4 h-4 text-indigo-400" />;
      case 'affiliate':
        return <ShoppingBag className="w-4 h-4 text-amber-400" />;
      case 'coupon':
        return <Ticket className="w-4 h-4 text-rose-400" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-emerald-500" />;
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredTemplates = templates.filter((t) =>
    selectedCategory === 'all' ? true : t.category === selectedCategory
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>Direct Message Templates</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Battle-tested direct message copy engineered to turn Instagram comments into clicks, leads, and sales.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Templates' },
          { id: 'pdf', label: 'PDF Lead Magnet' },
          { id: 'course', label: 'Course Enrollment' },
          { id: 'affiliate', label: 'Affiliate Links' },
          { id: 'coupon', label: 'Promo Coupon' },
          { id: 'whatsapp', label: 'WhatsApp VIP' },
          { id: 'youtube', label: 'YouTube Video' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === c.id
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Category & Usage */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    {getCategoryIcon(tpl.category)}
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {tpl.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono tabular-nums text-slate-400">
                  {tpl.usageCount} uses
                </span>
              </div>

              {/* Keyword Recommendation */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="text-slate-500">Trigger:</span>
                <span className="font-mono text-indigo-300 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {tpl.keywordSuggestion}
                </span>
              </div>

              {/* Message preview bubble */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans max-h-36 overflow-y-auto">
                {tpl.message}
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                {tpl.description}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(tpl)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded hover:bg-slate-800"
                  title="Edit Template"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => duplicateTemplate(tpl.id)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded hover:bg-slate-800"
                  title="Duplicate Template"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteTemplate(tpl.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded hover:bg-slate-800"
                  title="Delete Template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => applyTemplateToNewCampaign(tpl)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Use in Campaign</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-100">
                {editingTemplate ? 'Edit DM Template' : 'Create Reusable DM Template'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              {formError && (
                <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Template Title
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Template['category'])}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="pdf">PDF Lead Magnet</option>
                    <option value="course">Course</option>
                    <option value="affiliate">Affiliate</option>
                    <option value="coupon">Coupon</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="youtube">YouTube</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Suggested Keyword
                  </label>
                  <input
                    type="text"
                    value={formKeyword}
                    onChange={(e) => setFormKeyword(e.target.value)}
                    placeholder="e.g. PDF, GUIDE"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Direct Message Text
                </label>
                <textarea
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Tip: Use {'{{username}}'} and {'{{link}}'} tags.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Default Link
                </label>
                <input
                  type="url"
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description / Advice
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
