import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, Link as LinkIcon, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LinkSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LinkSubmissionModal: React.FC<LinkSubmissionModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, submitDailyLink } = useApp();
  const [postUrl, setPostUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string; linkNumber?: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setIsSubmitting(true);

    const res = submitDailyLink(postUrl.trim(), caption.trim());
    setIsSubmitting(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message, linkNumber: res.linkNumber });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      setTimeout(() => {
        setPostUrl('');
        setCaption('');
        setStatusMsg(null);
        onClose();
      }, 2000);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#131315] rounded-2xl shadow-2xl border border-[#1E1E20] w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E1E20] flex items-center justify-between bg-[#0E0E10]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Submit Today's Facebook Link
              </h3>
              <p className="text-[11px] text-gray-500">
                1 link per member per day • Mutual community support
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1E1E20] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {statusMsg && (
            <div className={`p-4 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-2.5 ${
              statusMsg.type === 'success'
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">{statusMsg.text}</div>
                {statusMsg.type === 'success' && (
                  <div className="text-xs text-green-400/80 mt-1">
                    Your post is now active on the community board! Remember to support your peers before midnight.
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
              <span>Facebook Post / Video / Reel URL *</span>
              <span className="text-[10px] text-gray-500 font-normal">Must be public</span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                placeholder="https://facebook.com/yourname/posts/123456789"
                value={postUrl}
                onChange={e => setPostUrl(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 text-xs sm:text-sm bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-gray-600"
              />
              <span className="absolute right-3 top-2.5 text-gray-500 text-xs">
                🌐
              </span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              Supports: facebook.com/posts, fb.watch, facebook.com/reel, or group post links.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
              <span>Caption / Target Reaction Note (Optional)</span>
              <span className="text-[10px] text-gray-500 font-normal">{caption.length}/150</span>
            </label>
            <textarea
              maxLength={150}
              rows={2}
              placeholder="e.g. New travel video! Love reaction & meaningful comment please ❤️"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-gray-600 resize-none"
            />
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
            ⚖️ <strong>Community Fair Rule:</strong> By submitting today's link, you agree to support all other active members' submitted links before the 11:59 PM deadline.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#1E1E20] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !postUrl.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Verifying...' : 'Submit Today\'s Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
