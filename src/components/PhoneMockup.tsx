import React from 'react';
import { ArrowLeft, Phone, Video, Info, Send, Image as ImageIcon, Heart, ExternalLink, CheckCheck } from 'lucide-react';

interface PhoneMockupProps {
  senderName?: string;
  senderHandle?: string;
  recipientHandle?: string;
  messageText: string;
  linkUrl?: string;
  onLinkClick?: () => void;
  hasClicked?: boolean;
  timeString?: string;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  senderName = 'Creator Studio',
  senderHandle = 'creator_hub',
  recipientHandle = 'follower_user',
  messageText,
  linkUrl,
  onLinkClick,
  hasClicked = false,
  timeString = 'Just now',
}) => {
  // Format message text for linebreaks
  const formattedText = messageText || 'Hey {{username}}! Here is your link: {{link}}';

  return (
    <div className="w-full max-w-[340px] mx-auto rounded-[36px] p-3 bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col items-center">
      {/* Device speaker & camera pill */}
      <div className="w-24 h-4 bg-slate-950 rounded-full mb-2 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
      </div>

      {/* Screen container */}
      <div className="w-full bg-slate-950 rounded-[28px] overflow-hidden flex flex-col border border-slate-800/80 h-[520px]">
        {/* Instagram DM Header */}
        <div className="px-3 py-2.5 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-slate-300" />
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px] shrink-0">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-[10px] font-bold text-white">
                C
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-100 flex items-center gap-1">
                {senderHandle}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] text-slate-400">Active now</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <Phone className="w-3.5 h-3.5" />
            <Video className="w-3.5 h-3.5" />
            <Info className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 flex flex-col justify-end bg-gradient-to-b from-slate-950 to-slate-900/60">
          {/* Incoming simulated trigger context */}
          <div className="text-center my-1">
            <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded bg-slate-900/60">
              Direct message sent via Comment2DM trigger
            </span>
          </div>

          {/* DM Bubble from Creator */}
          <div className="flex items-end gap-2 max-w-[92%]">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0 mb-1">
              C
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-bl-xs p-3 text-xs leading-relaxed shadow-md">
                <p className="whitespace-pre-wrap break-words">{formattedText}</p>

                {/* If link is included, display actionable link preview card */}
                {linkUrl && (
                  <div className="mt-2.5 pt-2.5 border-t border-white/20">
                    <div className="bg-black/30 rounded-lg p-2 flex flex-col gap-1.5 text-left">
                      <div className="flex items-center gap-1 text-[11px] font-medium text-white/90 truncate">
                        <ExternalLink className="w-3 h-3 text-indigo-200 shrink-0" />
                        <span className="truncate">{linkUrl}</span>
                      </div>
                      <button
                        type="button"
                        onClick={onLinkClick}
                        className={`w-full py-1.5 px-2.5 rounded text-[11px] font-semibold text-center transition-all flex items-center justify-center gap-1.5 ${
                          hasClicked
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white text-indigo-900 hover:bg-indigo-50 active:scale-95'
                        }`}
                      >
                        {hasClicked ? (
                          <>
                            <CheckCheck className="w-3 h-3" /> Link Clicked (+1 CTR)
                          </>
                        ) : (
                          <>Open Destination Link</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>{timeString}</span>
                <span className="flex items-center gap-0.5 text-slate-400">
                  Seen <CheckCheck className="w-3 h-3 text-indigo-400" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Instagram DM Input Bar */}
        <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center shrink-0">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 bg-slate-800/80 rounded-full px-3 py-1.5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Message @{senderHandle}...</span>
          </div>
          <Heart className="w-4 h-4 text-slate-400 shrink-0" />
          <Send className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </div>
    </div>
  );
};
