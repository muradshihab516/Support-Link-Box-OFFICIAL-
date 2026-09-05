import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  Clock, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Video, 
  ShieldCheck, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DailyLink, PostContentType, LinkCategoryType, getPartRange } from '../../types';

interface LinkEditModalProps {
  link: DailyLink;
  isOpen: boolean;
  onClose: () => void;
}

export const LinkEditModal: React.FC<LinkEditModalProps> = ({ link, isOpen, onClose }) => {
  const { currentUser, editDailyLink } = useApp();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'moderator';

  // Form states
  const [postUrl, setPostUrl] = useState(link.postUrl);
  const [postType, setPostType] = useState<PostContentType>(link.postType || 'photo');
  const [caption, setCaption] = useState(link.caption || '');
  const [instruction, setInstruction] = useState(link.instruction || '');
  const [category, setCategory] = useState<LinkCategoryType>((link.category as LinkCategoryType) || 'member');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2-minute countdown timer logic
  // deadline in epoch ms
  const deadline = link.editableUntil || (link.submittedAtTimestamp ? link.submittedAtTimestamp + 120000 : 0);
  
  const calculateRemainingSeconds = () => {
    if (isAdmin) return 9999; // Admins are not restricted
    if (!deadline) return 0;
    const diff = Math.floor((deadline - Date.now()) / 1000);
    return Math.max(0, diff);
  };

  const [secondsRemaining, setSecondsRemaining] = useState<number>(calculateRemainingSeconds);

  useEffect(() => {
    if (!isOpen) return;
    setPostUrl(link.postUrl);
    setPostType(link.postType || 'photo');
    setCaption(link.caption || '');
    setInstruction(link.instruction || '');
    setCategory((link.category as LinkCategoryType) || 'member');
    setErrorMsg(null);
    setSuccessMsg(null);

    setSecondsRemaining(calculateRemainingSeconds());

    if (isAdmin) return;

    const interval = setInterval(() => {
      const remaining = calculateRemainingSeconds();
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, link, isAdmin]);

  if (!isOpen) return null;

  const isExpired = !isAdmin && secondsRemaining <= 0;
  const partInfo = getPartRange(link.partNumber || Math.ceil(link.linkNumber / 20));

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins} মিনিট ${secs.toString().padStart(2, '0')} সেকেন্ড`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) {
      setErrorMsg('২ মিনিটের সময়সীমা পার হয়ে গেছে! এখন আর লিংক পরিবর্তন করা সম্ভব নয়।');
      return;
    }

    if (!postUrl.trim()) {
      setErrorMsg('অনুগ্রহ করে সঠিক ফেসবুক পোস্টের লিংক দিন।');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const result = editDailyLink(link.id, {
      postUrl: postUrl.trim(),
      postType,
      caption: caption.trim(),
      instruction: instruction.trim(),
      category: isAdmin ? category : undefined
    });

    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="link-edit-modal"
        className="w-full max-w-lg bg-[#141416] border border-[#232327] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#232327] flex items-center justify-between bg-[#19191D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">লিংক ও বিবরণ সংশোধন</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  #{link.linkNumber}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {partInfo.label}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                লিংক নাম্বার ও পার্ট অপরিবর্তনীয় থাকবে
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#232327] hover:bg-[#2C2C32] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2-Minute Countdown or Admin Notice Bar */}
        <div className={`px-5 py-3 border-b text-xs flex items-center justify-between transition-colors ${
          isAdmin 
            ? 'bg-purple-950/30 border-purple-900/40 text-purple-300'
            : isExpired
              ? 'bg-rose-950/40 border-rose-900/50 text-rose-300'
              : secondsRemaining <= 30
                ? 'bg-amber-950/40 border-amber-900/50 text-amber-300 animate-pulse'
                : 'bg-indigo-950/30 border-indigo-900/40 text-indigo-300'
        }`}>
          {isAdmin ? (
            <div className="flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>এডমিন ওভাররাইড: আপনি যেকোনো সময় লিংক পরিবর্তন করতে পারবেন।</span>
            </div>
          ) : isExpired ? (
            <div className="flex items-center gap-2 font-semibold">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>২ মিনিটের সময়সীমা পার হয়ে গেছে! লিংকটি লক হয়ে গেছে।</span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>এডিট উইন্ডো বাকি:</span>
                <span className="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/10">
                  {formatCountdown(secondsRemaining)}
                </span>
              </div>
              <span className="text-[11px] text-gray-400">
                (২ মিনিট পর লক হবে)
              </span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Immutable Information Box */}
          <div className="p-3 bg-[#1B1B1F] border border-[#2A2A30] rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-400 block">সাবমিটকারী:</span>
              <span className="text-white font-semibold">{link.memberName} (@{link.memberUsername})</span>
            </div>
            <div className="text-right">
              <span className="text-gray-400 block">নির্ধারিত পার্ট ও নাম্বার:</span>
              <span className="text-indigo-400 font-mono font-bold">Link #{link.linkNumber} • {partInfo.shortLabel}</span>
            </div>
          </div>

          {/* Post URL Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              ফেসবুক পোস্ট / ভিডিও / রিলস লিংক *
            </label>
            <div className="relative">
              <input
                type="url"
                value={postUrl}
                onChange={e => setPostUrl(e.target.value)}
                disabled={isExpired}
                placeholder="https://www.facebook.com/..."
                className="w-full bg-[#1B1B1F] border border-[#2A2A30] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                required
              />
              {postUrl && (
                <a 
                  href={postUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-400"
                  title="লিংক প্রিভিউ"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Post Content Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              পোস্টের ধরন
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isExpired}
                onClick={() => setPostType('photo')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  postType === 'photo'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-[#1B1B1F] border-[#2A2A30] text-gray-400 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>ফটো / টেক্সট পোস্ট</span>
              </button>

              <button
                type="button"
                disabled={isExpired}
                onClick={() => setPostType('video')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  postType === 'video'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-[#1B1B1F] border-[#2A2A30] text-gray-400 hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Video className="w-4 h-4" />
                <span>ভিডিও / রিলস</span>
              </button>
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              ক্যাপশন / শিরোনাম (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              disabled={isExpired}
              placeholder="যেমন: নতুন ফটোগ্রাফি অ্যালবাম / টিউটোরিয়াল ভিডিও..."
              className="w-full bg-[#1B1B1F] border border-[#2A2A30] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Support Instruction */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              সহায়তার নির্দেশাবলী (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              disabled={isExpired}
              placeholder="যেমন: লাভ রিঅ্যাক্ট ও সুন্দর একটি গঠনমূলক কমেন্ট করুন"
              className="w-full bg-[#1B1B1F] border border-[#2A2A30] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Admin Category Option (Admin Only) */}
          {isAdmin && (
            <div>
              <label className="block text-xs font-semibold text-purple-300 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                ক্যাটেগরি পরিবর্তন (এডমিন অনলি)
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as LinkCategoryType)}
                className="w-full bg-[#1B1B1F] border border-[#2A2A30] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="member">মেম্বার পোস্ট (সাধারণ)</option>
                <option value="admin">👑 এডমিন পিন পোস্ট</option>
                <option value="vip">🏆 VIP মেম্বার পোস্ট</option>
                <option value="notice">📢 জরুরি নোটিশ পোস্ট</option>
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-[#232327] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#232327] hover:bg-[#2C2C32] text-gray-300 text-xs font-semibold rounded-xl transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isExpired || isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isSubmitting ? (
                <span>সংরক্ষণ হচ্ছে...</span>
              ) : isExpired ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>লকড (সময় শেষ)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>পরিবর্তন সংরক্ষণ করুন</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
