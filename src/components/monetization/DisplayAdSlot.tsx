import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ExternalLink, Play, Gift, CheckCircle2, Info } from 'lucide-react';
import { DemoVideoAdModal } from './DemoVideoAdModal';

interface DisplayAdSlotProps {
  slotId?: string;
  format?: 'horizontal_banner' | 'medium_rectangle' | 'in_feed' | 'leaderboard' | 'video_reward_card';
  className?: string;
}

export const DisplayAdSlot: React.FC<DisplayAdSlotProps> = ({ 
  slotId = 'slot_default', 
  format = 'horizontal_banner',
  className = '' 
}) => {
  const { settings } = useApp();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [demoBannerClicked, setDemoBannerClicked] = useState(false);

  if (!settings.enableAdSlots) return null;

  const handleBannerAction = () => {
    setDemoBannerClicked(true);
    setTimeout(() => setDemoBannerClicked(false), 3000);
  };

  return (
    <>
      <div className={`my-4 overflow-hidden rounded-2xl border border-[#1E1E20] bg-[#131315] p-3 sm:p-4 text-center relative group shadow-xs ${className}`}>
        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-2">
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold text-[9px] border border-amber-400/30">
              Demo Ad
            </span>
            <Sparkles className="w-3 h-3 text-indigo-400" />
            স্পন্সর ডেমো বিজ্ঞাপন
          </span>
          <span className="text-gray-500 flex items-center gap-1">
            <Info className="w-3 h-3" /> Monetag / AdSense Test
          </span>
        </div>

        {format === 'horizontal_banner' && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-[#0E0E10] rounded-xl border border-[#1E1E20]">
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl shrink-0 shadow-inner">
                ⚡
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>Boost Your Facebook Page Reach with Meta Ads Pro</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono hidden md:inline">
                    Top Partner
                  </span>
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  বাঙালি কনটেন্ট ক্রিয়েটরদের জন্য ভেরিফাইড বুস্টিং ও অর্গানিক গ্রোথ ট্রেনিং।
                </div>
              </div>
            </div>
            <button 
              onClick={() => setShowVideoModal(true)}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shrink-0 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>ডেমো ভিডিও অ্যাড দেখুন</span>
            </button>
          </div>
        )}

        {format === 'leaderboard' && (
          <div className="p-3.5 bg-[#0E0E10] rounded-xl border border-[#1E1E20] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
            <div>
              <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <span>Exclusive Community Offer</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">BDIX 10Gbps</span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                BDIX হাই-স্পিড SSD NVMe ক্লাউড হোস্টিং — মাত্র ১৯৯ টাকা/মাস
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                বিকাশ/নগদ ইনস্ট্যান্ট পেমেন্ট, ফ্রি SSL সার্টিফিকেট ও আনলিমিটেড ব্যান্ডউইথ।
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={handleBannerAction}
                className="px-3.5 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-lg transition-colors border border-gray-700"
              >
                {demoBannerClicked ? '✓ ডেমো টেস্টেড' : 'অফার জানুন'}
              </button>
              <button 
                onClick={() => setShowVideoModal(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                <span>ভিডিও অ্যাড</span>
              </button>
            </div>
          </div>
        )}

        {format === 'in_feed' && (
          <div className="p-3 bg-[#0E0E10] rounded-xl border border-[#1E1E20] text-left space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-white">
                🎬 আপনার ভিডিও ও রিলস এডিটিংয়ের জন্য দক্ষ এডিটর খুঁজছেন?
              </div>
              <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.5 bg-amber-400/10 rounded">
                Verified Freelancers
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              প্রতি রিলস মাত্র ৫০০ টাকা থেকে প্রি-ভেটেড বাংলাদেশি শর্ট ফর্ম ভিডিও এডিটর নিয়োগ করুন।
            </p>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => setShowVideoModal(true)}
                className="text-xs text-indigo-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3" />
                <span>ভিডিও প্রেজেন্টেশন দেখুন (Demo Ad)</span>
              </button>
              <span className="text-[10px] text-gray-500">AdSlot #{slotId}</span>
            </div>
          </div>
        )}

        {format === 'video_reward_card' && (
          <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-[#12121A] to-purple-950/30 rounded-xl border border-indigo-500/30 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black uppercase">
                  Rewarded Video Ad
                </span>
                <span className="text-xs font-bold text-indigo-300">টেস্টিং ডেমো বিজ্ঞাপন</span>
              </div>
              <h5 className="text-sm font-bold text-white">
                ১০ সেকেন্ডের স্পন্সর ডেমো ভিডিও দেখে ৫ বোনাস পয়েন্ট পান!
              </h5>
              <p className="text-[11px] text-gray-400">
                অ্যাডমিন ও মেম্বাররা বিজ্ঞাপন দেখার ও পয়েন্ট যোগ হওয়ার সম্পূর্ণ ফ্লো সরাসরি টেস্ট করতে পারবেন।
              </p>
            </div>

            <button
              onClick={() => setShowVideoModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-black hover:text-white font-extrabold text-xs rounded-xl shrink-0 flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10 active:scale-95 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>ভিডিও দেখুন (+৫ পয়েন্ট)</span>
            </button>
          </div>
        )}
      </div>

      {/* Interactive Video Ad Modal */}
      <DemoVideoAdModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        title="স্পন্সর ডেমো ভিডিও বিজ্ঞাপন"
        rewardPoints={5}
        rewardDescription="৫ বোনাস পয়েন্ট"
      />
    </>
  );
};
