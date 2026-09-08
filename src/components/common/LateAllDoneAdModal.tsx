import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Play, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  ExternalLink,
  MessageCircle,
  HelpCircle,
  X,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LatePenaltyRecord } from '../../types';

interface LateAllDoneAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  penaltyRecord?: LatePenaltyRecord | null;
}

export const LateAllDoneAdModal: React.FC<LateAllDoneAdModalProps> = ({
  isOpen,
  onClose,
  penaltyRecord
}) => {
  const { 
    currentUser, 
    latePenalties, 
    watchPenaltyAd, 
    adminSupportLinks,
    settings 
  } = useApp();

  // Find active penalty for current user if not provided
  const activePenalty = penaltyRecord || latePenalties.find(
    p => p.memberId === currentUser?.id && (p.status === 'temp_removed' || p.status === 'suspended')
  );

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(10);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [adSuccess, setAdSuccess] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const requiredAds = activePenalty?.requiredAds || currentUser?.requiredAdsCount || 1;
  const watchedAds = activePenalty?.adsWatched || currentUser?.watchedAdsCount || 0;
  const remainingAds = Math.max(0, requiredAds - watchedAds);

  // Ad Creatives list for pleasant, sensitive simulation
  const AD_CREATIVES = [
    {
      title: 'Digital Marketing Mastery BD',
      sponsor: 'Shikhbe Shobai IT',
      tagline: 'শিখুন ফেসবুক মার্কেটিং ও কনটেন্ট স্ট্র্যাটেজি',
      ctaText: 'কোর্স বিবরণ দেখুন',
      bannerUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      badge: 'Sponsored Partner'
    },
    {
      title: 'Cloud Hosting & Domain BD',
      sponsor: 'DhakaHost Cloud',
      tagline: 'সবচেয়ে দ্রুতগতির NVMe হোস্টিং ও লোকাল বিকাশ পেমেন্ট',
      ctaText: 'অফার জানুন',
      bannerUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
      badge: 'Verified Sponsor'
    },
    {
      title: 'Creative Content Creator Kit',
      sponsor: 'Bangla Creator Hub',
      tagline: 'আপনার ভিডিও ও পোস্টের রিচ বাড়াতে বিশেষ রিসোর্স প্যাক',
      ctaText: 'ডাউনলোড গাইড',
      bannerUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
      badge: 'Creator Special'
    }
  ];

  const currentAdIndex = (watchedAds) % AD_CREATIVES.length;
  const currentCreative = AD_CREATIVES[currentAdIndex];

  // Ad playback timer
  useEffect(() => {
    let timer: any;
    if (isPlaying && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isPlaying && countdown === 0) {
      setIsPlaying(false);
      setAdSuccess(true);
    }
    return () => clearInterval(timer);
  }, [isPlaying, countdown]);

  if (!isOpen || !activePenalty) return null;

  const handleStartAd = () => {
    setIsPlaying(true);
    setCountdown(8); // 8 seconds rewarding experience
    setAdSuccess(false);
  };

  const handleClaimAdReward = () => {
    if (!activePenalty) return;

    const result = watchPenaltyAd(activePenalty.id);
    setAdSuccess(false);

    if (result.isCompleted) {
      setShowCelebration(true);
      setTimeout(() => {
        setShowCelebration(false);
        onClose();
      }, 2500);
    } else {
      setCountdown(8);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#141416] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-gray-100">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-amber-600/30 via-orange-600/30 to-amber-600/20 border-b border-amber-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Late All Done Re-Activation</h3>
              <p className="text-xs text-amber-200/80">দেরিতে অল ডান করায় সাময়িক রিমুভ রিকভারি</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {showCelebration ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 mx-auto bg-emerald-500/20 border-2 border-emerald-500/50 rounded-full flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-emerald-400">অ্যাকাউন্ট সফলভাবে Re-Activated!</h4>
                <p className="text-sm text-gray-300">
                  নির্ধারিত বিজ্ঞাপন দেখা সম্পন্ন হয়েছে। আপনি এখন নিয়মিত লিংক বক্সে পোস্ট ও সাপোর্ট করতে পারবেন।
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-300">
                <ShieldCheck className="w-4 h-4" /> স্ট্যাটাস: Active
              </div>
            </div>
          ) : (
            <>
              {/* Late Explanation Card */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2 text-xs text-amber-200/90 leading-relaxed">
                <div className="flex items-center justify-between font-semibold text-amber-300">
                  <span>অল ডান সময়: রাত ১২:০০ টার পর</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 rounded text-[11px]">
                    {activePenalty.lateDurationFormatted || '১ ঘণ্টা বিলম্বে'}
                  </span>
                </div>
                <p>
                  রাত ১২:০০ টার পর অল ডান করায় আপনাকে স্বয়ংক্রিয়ভাবে সাময়িক রিমুভ করা হয়েছিল। 
                  এখন পুনরায় <strong>Active</strong> হতে মাত্র <strong>{requiredAds}টি</strong> রিওয়ার্ডেড স্পনসর Ad দেখা প্রয়োজন।
                </p>
              </div>

              {/* Ad Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-medium">বিজ্ঞাপন অগ্রগতি:</span>
                  <span className="font-bold text-amber-400">
                    {watchedAds} / {requiredAds} সম্পন্ন
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden p-0.5 border border-gray-700">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (watchedAds / requiredAds) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Rewarded Video Ad Frame */}
              <div className="relative rounded-xl border border-gray-700 bg-gray-900 overflow-hidden shadow-inner">
                {/* Simulated Video Canvas */}
                <div className="relative aspect-video w-full flex flex-col justify-between p-4 bg-gradient-to-t from-black via-gray-900/60 to-black">
                  <img 
                    src={currentCreative.bannerUrl} 
                    alt={currentCreative.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-35"
                  />
                  
                  {/* Top Bar inside Ad */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-amber-300 border border-amber-500/30">
                      {currentCreative.badge}
                    </span>
                    <button 
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-gray-300 transition-colors"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Middle Content */}
                  <div className="relative z-10 text-center space-y-1 px-4">
                    <p className="text-xs text-amber-400 font-semibold">{currentCreative.sponsor}</p>
                    <h5 className="text-base font-bold text-white tracking-wide">{currentCreative.title}</h5>
                    <p className="text-xs text-gray-300">{currentCreative.tagline}</p>
                  </div>

                  {/* Bottom Controls / Countdown */}
                  <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10">
                    <div className="text-[11px] text-gray-400">
                      {isPlaying ? (
                        <span className="flex items-center gap-1.5 text-amber-400 font-mono font-bold">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          বিজ্ঞাপন চলছে... {countdown}s
                        </span>
                      ) : adSuccess ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> বিজ্ঞাপন দেখা সম্পন্ন!
                        </span>
                      ) : (
                        <span>বিজ্ঞাপন দেখার জন্য প্লে চাপুন</span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">Rewarded Ad #{watchedAds + 1}</span>
                  </div>
                </div>

                {/* Progress bar of active ad playback */}
                {isPlaying && (
                  <div className="w-full bg-gray-800 h-1">
                    <div 
                      className="bg-amber-400 h-1 transition-all duration-1000 ease-linear"
                      style={{ width: `${((8 - countdown) / 8) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {!isPlaying && !adSuccess && (
                  <button
                    onClick={handleStartAd}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01]"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    বিজ্ঞাপন দেখুন ({watchedAds + 1}/{requiredAds})
                  </button>
                )}

                {isPlaying && (
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-gray-800 text-gray-400 font-medium text-sm rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    অনুগ্রহ করে বিজ্ঞাপনটি শেষ হওয়া পর্যন্ত অপেক্ষা করুন ({countdown}s)
                  </button>
                )}

                {adSuccess && (
                  <button
                    onClick={handleClaimAdReward}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all animate-pulse"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {remainingAds <= 1 ? 'Re-Activate Account / অ্যাকাউন্ট সচল করুন' : `পরবর্তী বিজ্ঞাপন দেখুন (${remainingAds - 1} টি বাকি)`}
                  </button>
                )}
              </div>

              {/* Admin Support Alternative */}
              <div className="pt-3 border-t border-gray-800 text-center">
                <p className="text-[11px] text-gray-500 mb-2">
                  কোনো সমস্যা হলে সরাসরি অ্যাডমিনের সাথে যোগাযোগ করতে পারেন:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {adminSupportLinks.filter(a => a.isActive).slice(0, 2).map(admin => (
                    <a
                      key={admin.id}
                      href={admin.supportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-300 text-xs border border-gray-700/60 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>{admin.displayLabel || admin.adminName}</span>
                      <ExternalLink className="w-3 h-3 text-gray-500" />
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
