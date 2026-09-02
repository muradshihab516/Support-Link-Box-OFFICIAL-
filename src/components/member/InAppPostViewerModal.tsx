import React, { useState, useEffect } from 'react';
import { DailyLink, Member } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  MessageSquare, 
  Sparkles, 
  Flag,
  Share2,
  ThumbsUp,
  Info,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface InAppPostViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLink: DailyLink | null;
  allLinks: DailyLink[];
  onSelectLink: (link: DailyLink) => void;
  onReportLink?: (linkId: string, memberName: string) => void;
}

const QUICK_COMMENTS = [
  'অসাধারণ পোস্ট ভাই! দারুণ লাগলো 👍❤️',
  'খুবই সুন্দর ও তথ্যবহুল পোস্ট! শুভকামনা রইলো 👏✨',
  'Great content! Keep up the good work 🔥',
  'Valuable insights, thanks for sharing 🙌',
  'অনেক সুন্দর শেয়ার! এগিয়ে যান 💪',
  'Superb post, thoroughly enjoyed reading this! 🌟'
];

export const InAppPostViewerModal: React.FC<InAppPostViewerModalProps> = ({
  isOpen,
  onClose,
  currentLink,
  allLinks,
  onSelectLink,
  onReportLink
}) => {
  const { 
    currentUser, 
    markLinkSupported, 
    unmarkLinkSupported, 
    getTodaySupportStats 
  } = useApp();

  const [copiedComment, setCopiedComment] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [embedError, setEmbedError] = useState(false);

  useEffect(() => {
    setEmbedError(false);
  }, [currentLink?.id]);

  if (!isOpen || !currentLink) return null;

  const stats = currentUser ? getTodaySupportStats(currentUser.id) : null;
  const isSupported = stats?.supportedLinkIds.has(currentLink.id) ?? false;
  const isOwnLink = currentUser ? currentLink.memberId === currentUser.id : false;

  const currentIndex = allLinks.findIndex(l => l.id === currentLink.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allLinks.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      onSelectLink(allLinks[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onSelectLink(allLinks[currentIndex + 1]);
    }
  };

  const handleToggleSupport = () => {
    if (isSupported) {
      unmarkLinkSupported(currentLink.id);
    } else {
      const res = markLinkSupported(currentLink.id);
      if (res.success) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 }
        });
      }
    }
  };

  const handleCopyComment = (comment: string) => {
    navigator.clipboard.writeText(comment);
    setCopiedComment(comment);
    setTimeout(() => setCopiedComment(null), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentLink.postUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenFacebook = () => {
    window.open(currentLink.postUrl, '_blank', 'noopener,noreferrer');
  };

  // Safe Facebook Embed URL
  const fbEmbedUrl = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(currentLink.postUrl)}&show_text=true&width=500`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] bg-[#131315] border border-[#252528] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#202024] bg-[#18181B]/90">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img 
              src={currentLink.memberAvatar} 
              alt={currentLink.memberName}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-indigo-500/30 shrink-0" 
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-sm sm:text-base text-white truncate">
                  {currentLink.memberName}
                </span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 font-mono text-[11px] font-bold rounded-md shrink-0">
                  #{currentLink.linkNumber}
                </span>
              </div>
              <div className="text-xs text-gray-400 truncate">
                @{currentLink.memberUsername} • {currentLink.submittedAt}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Step Counter */}
            <div className="text-xs text-gray-400 font-mono hidden sm:block px-2.5 py-1 bg-[#202024] rounded-lg">
              {currentIndex + 1} / {allLinks.length}
            </div>

            {/* Prev/Next Buttons */}
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              className="p-1.5 sm:p-2 rounded-lg bg-[#202024] hover:bg-[#2A2A2E] disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 transition-colors"
              title="Previous Post"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="p-1.5 sm:p-2 rounded-lg bg-[#202024] hover:bg-[#2A2A2E] disabled:opacity-30 disabled:cursor-not-allowed text-gray-300 transition-colors"
              title="Next Post"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg bg-[#202024] hover:bg-rose-500/20 hover:text-rose-400 text-gray-400 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Submitter Instructions & Quick Notice */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-transparent p-4 rounded-xl border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Task Instructions / সদস্যের রিকুয়েস্ট
                </div>
                <div className="text-sm font-semibold text-white mt-0.5">
                  {currentLink.caption ? `"${currentLink.caption}"` : 'React + Positive Comment'}
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenFacebook}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-md shadow-blue-600/20"
            >
              <span>Open in Facebook App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Embedded Post Preview Container */}
          <div className="bg-[#0A0A0C] border border-[#202024] rounded-xl p-3 sm:p-4 overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1A1A1E] text-xs text-gray-400">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live In-App Post Preview
              </span>
              <button
                onClick={handleCopyLink}
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Embedded Iframe */}
            <div className="w-full min-h-[360px] sm:min-h-[420px] bg-[#121214] rounded-lg overflow-hidden flex flex-col items-center justify-center relative">
              {!embedError ? (
                <iframe
                  src={fbEmbedUrl}
                  width="100%"
                  height="450"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  className="w-full max-w-[500px] rounded-lg"
                  onError={() => setEmbedError(true)}
                  title={`Facebook Post #${currentLink.linkNumber}`}
                />
              ) : null}

              {/* Fallback & Direct Access Helper if Facebook Embed is blocked by browser tracker protection */}
              <div className="p-4 text-center space-y-3 w-full max-w-md my-auto">
                <div className="text-xs text-gray-400 leading-relaxed">
                  ব্রাউজার বা ফেসবুকের প্রাইভেসি নিয়মের কারণে সরাসরি প্রিভিউ লোড না হলে নিচের বাটন দিয়ে সরাসরি ফেসবুক অ্যাপ বা ট্যাবে পোস্টটি খুলুন:
                </div>
                <div className="p-3 bg-[#18181C] rounded-lg border border-[#2A2A2E] text-left text-xs font-mono text-gray-300 break-all select-all">
                  {currentLink.postUrl}
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={handleOpenFacebook}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-blue-600/25 transition-transform active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    ফেসবুকে সরাসরি পোস্টটি খুলুন
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Copy Comments Section */}
          <div className="bg-[#18181B] p-4 rounded-xl border border-[#252528] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-bold text-white">
                  এক ক্লিকে কমেন্ট কপি করুন (One-Click Support Comments)
                </span>
              </div>
              <span className="text-[11px] text-gray-400">ক্লিক করলেই কপি হবে</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_COMMENTS.map((comm, idx) => {
                const isThisCopied = copiedComment === comm;
                return (
                  <button
                    key={idx}
                    onClick={() => handleCopyComment(comm)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between gap-2 group ${
                      isThisCopied 
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                        : 'bg-[#121214] border-[#222226] text-gray-300 hover:border-indigo-500/40 hover:bg-[#1A1A1E]'
                    }`}
                  >
                    <span className="truncate">{comm}</span>
                    <span className="shrink-0 p-1 rounded bg-[#202024] group-hover:bg-indigo-600 text-gray-400 group-hover:text-white transition-colors">
                      {isThisCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
            {copiedComment && (
              <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                কমেন্ট ক্লিপবোর্ডে কপি হয়েছে! এবার ফেসবুকে গিয়ে পেস্ট করুন।
              </div>
            )}
          </div>

        </div>

        {/* Modal Bottom Fixed Action Bar */}
        <div className="px-4 sm:px-6 py-4 border-t border-[#202024] bg-[#161619] flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onReportLink && (
              <button
                onClick={() => {
                  onReportLink(currentLink.id, currentLink.memberName);
                  onClose();
                }}
                className="px-3 py-2 rounded-lg bg-[#202024] hover:bg-rose-950/40 hover:text-rose-400 text-gray-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>রিপোর্ট</span>
              </button>
            )}

            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-lg bg-[#202024] hover:bg-[#2A2A2E] text-gray-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {!isOwnLink ? (
              <button
                onClick={handleToggleSupport}
                className={`flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
                  isSupported
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSupported ? '✓ Supported (সম্পন্ন হয়েছে)' : 'Mark as Supported (সাপোর্ট করেছি)'}</span>
              </button>
            ) : (
              <span className="text-xs text-gray-500 italic px-3 py-2 bg-[#202024] rounded-lg">
                এটি আপনার নিজের পোস্ট
              </span>
            )}

            {hasNext && (
              <button
                onClick={handleNext}
                className="px-4 py-2.5 bg-[#25252A] hover:bg-[#303036] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <span>পরের পোস্ট</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
