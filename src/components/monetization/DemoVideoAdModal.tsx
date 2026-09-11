import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Gift, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DemoVideoAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed?: (rewardPoints: number) => void;
  title?: string;
  rewardPoints?: number;
  rewardDescription?: string;
}

export const DemoVideoAdModal: React.FC<DemoVideoAdModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
  title = 'স্পন্সর ডেমো ভিডিও বিজ্ঞাপন',
  rewardPoints = 5,
  rewardDescription = '৫ বোনাস পয়েন্ট'
}) => {
  const { currentUser, adjustMemberPoints } = useApp();

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(10);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [claimed, setClaimed] = useState<boolean>(false);
  const [activeAdIndex, setActiveAdIndex] = useState<number>(0);

  // Creative video ads simulation catalogue
  const DEMO_CREATIVES = [
    {
      id: 'meta-ads',
      brand: 'Meta Ads & Reels Pro BD',
      tagline: 'ফেসবুক পেজ রিচ ও মনিটাইজেশন স্ট্র্যাটেজি ২০২৬',
      accentColor: 'from-blue-600 via-indigo-600 to-purple-700',
      badge: 'Official Agency Partner',
      highlight: '৩ দিনে ৩ গুণ এনগেজমেন্ট ও অর্গানিক ফলোয়ার বুস্ট',
      description: 'বাঙালি ক্রিয়েটরদের জন্য সম্পূর্ণ বাংলায় প্র্যাকটিক্যাল ফেসবুক অ্যালগরিদম ও রিলস বুস্টিং গাইডলাইন।',
      icon: TrendingUp,
      stats: '১২,৫০০+ সফল ট্রেইনি'
    },
    {
      id: 'bdix-cloud',
      brand: 'BDIX Ultra NVMe Cloud',
      tagline: 'বাংলাদেশের দ্রুততম ১Gbps NVMe ওয়েব হোস্টিং',
      accentColor: 'from-emerald-600 via-teal-600 to-cyan-700',
      badge: 'Certified BDIX Sponsor',
      highlight: 'মাত্র ১৯৯ টাকায় আনলিমিটেড ব্যান্ডউইথ ও ফ্রি .xyz ডোমেইন',
      description: 'বিকাশ ও নগদ পেমেন্টে সাথে সাথে cPanel অ্যাক্টিভেশন এবং ২৪/৭ বাংলা লাইভ চ্যাট সাপোর্ট।',
      icon: Zap,
      stats: '৯৯.৯৯% আপটাইম গ্যারান্টি'
    },
    {
      id: 'nord-security',
      brand: 'CyberShield VPN & Security',
      tagline: 'নিরাপদ ব্রাউজিং ও আনলিমিটেড হাই স্পিড ব্যান্ডউইথ',
      accentColor: 'from-violet-600 via-purple-600 to-pink-700',
      badge: 'Verified Privacy Partner',
      highlight: '৮২% ছাড় ও ৩ মাস সম্পূর্ণ ফ্রি মেম্বারশিপ',
      description: 'মুভি ডাউনলোড, স্ট্রিমিং ও সোশ্যাল মিডিয়া ব্যবহারে আপনার আসল IP অ্যাড্রেস ১০০% সুরক্ষিত রাখুন।',
      icon: ShieldCheck,
      stats: 'AES-256 বিট মিলিটারি এনক্রিপশন'
    }
  ];

  const currentAd = DEMO_CREATIVES[activeAdIndex % DEMO_CREATIVES.length];
  const IconComponent = currentAd.icon;

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setCountdown(10);
      setIsPlaying(true);
      setIsCompleted(false);
      setClaimed(false);
    }
  }, [isOpen]);

  // Video timer tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOpen && isPlaying && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setIsCompleted(true);
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isPlaying, countdown]);

  if (!isOpen) return null;

  const handleClaimReward = () => {
    if (!isCompleted || claimed) return;
    setClaimed(true);

    if (currentUser) {
      adjustMemberPoints(currentUser.id, rewardPoints, `Rewarded Demo Video Ad: ${currentAd.brand}`);
    }

    if (onRewardClaimed) {
      onRewardClaimed(rewardPoints);
    }

    // Auto close after showing reward celebration
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleSwitchAd = () => {
    setActiveAdIndex(prev => (prev + 1) % DEMO_CREATIVES.length);
    setCountdown(10);
    setIsPlaying(true);
    setIsCompleted(false);
    setClaimed(false);
  };

  const progressPercent = Math.min(100, Math.round(((10 - countdown) / 10) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#121215] border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Header Bar */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-indigo-950/60 via-[#181822] to-purple-950/50 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3" />
              Demo Ad
            </span>
            <span className="text-xs font-bold text-white line-clamp-1">{title}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSwitchAd}
              className="text-[11px] text-gray-400 hover:text-indigo-300 transition-colors font-medium px-2 py-1 rounded bg-gray-800/60"
              title="অন্য ডেমো বিজ্ঞাপন টেস্ট করুন"
            >
              🔄 অন্য অ্যাড
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player Canvas Area */}
        <div className="relative aspect-video w-full bg-gradient-to-br from-[#09090D] via-[#101018] to-[#0A0A0E] overflow-hidden flex flex-col justify-between p-4 sm:p-6 border-b border-gray-800">
          
          {/* Animated Background Pulse */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)] pointer-events-none" />

          {/* Top Video Overlay: Countdown & Mute */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 shadow-md ${
                isCompleted 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : 'bg-black/70 text-amber-300 border border-amber-500/30'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                {isCompleted ? '✓ সম্পূর্ণ হয়েছে' : `${countdown}s বাকি`}
              </span>
              <span className="text-[10px] text-gray-400 hidden sm:inline">
                {isCompleted ? 'পুরস্কার ক্লেইম করুন' : 'পুরস্কারের জন্য পুরোটা দেখুন'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-lg bg-black/60 text-gray-300 hover:text-white border border-gray-700 transition-colors"
                title={isMuted ? 'Unmute (Demo)' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={isCompleted}
                className="p-1.5 rounded-lg bg-black/60 text-gray-300 hover:text-white border border-gray-700 transition-colors disabled:opacity-40"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-indigo-400" />}
              </button>
            </div>
          </div>

          {/* Center Showcase: Brand & Motion Graphic */}
          <div className="relative z-10 text-center my-auto space-y-2.5">
            <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr ${currentAd.accentColor} p-0.5 shadow-xl shadow-indigo-600/30 transform transition-transform ${isPlaying ? 'scale-105 animate-pulse' : ''}`}>
              <div className="w-full h-full bg-[#0E0E14] rounded-2xl flex items-center justify-center text-indigo-300">
                <IconComponent className="w-7 h-7" />
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                {currentAd.badge}
              </div>
              <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                {currentAd.brand}
              </h4>
              <p className="text-xs text-indigo-200 font-medium mt-0.5">
                {currentAd.highlight}
              </p>
            </div>

            <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed line-clamp-2 px-2">
              {currentAd.description}
            </p>
          </div>

          {/* Bottom Video Progress Bar */}
          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                Live Demo Stream
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

        </div>

        {/* Action & Reward Footer */}
        <div className="p-4 sm:p-5 bg-[#141418] space-y-3">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>বিজ্ঞাপন দেখার পুরস্কার:</span>
                  <span className="text-amber-400 font-extrabold">{rewardDescription}</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  {isCompleted ? '✓ ক্লেইম করার জন্য প্রস্তুত!' : 'ভিডিও শেষ হলে বাটনটি সক্রিয় হবে।'}
                </div>
              </div>
            </div>

            <span className="text-[10px] text-gray-500 font-mono">
              Network: Monetag Simulator
            </span>
          </div>

          {/* Main Action Button */}
          {claimed ? (
            <div className="w-full py-3 px-4 bg-emerald-600/30 border border-emerald-500/50 rounded-xl text-center flex items-center justify-center gap-2 text-emerald-300 font-bold text-xs animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>অভিনন্দন! {rewardDescription} আপনার অ্যাকাউন্টে যোগ হয়েছে!</span>
            </div>
          ) : isCompleted ? (
            <button
              onClick={handleClaimReward}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-95 animate-bounce"
            >
              <Gift className="w-4 h-4" />
              <span>পুরস্কার সংগ্রহ করুন ({rewardDescription})</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                disabled
                className="flex-1 py-3 px-4 bg-gray-800/80 border border-gray-700/60 rounded-xl text-gray-400 text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Clock className="w-4 h-4 text-indigo-400 animate-spin" />
                <span>ভিডিও চলছে... ({countdown} সেকেন্ড বাকি)</span>
              </button>
              <button
                onClick={onClose}
                className="px-3 py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs font-semibold rounded-xl border border-gray-700 transition-colors"
                title="বিজ্ঞাপন বন্ধ করুন (কোনো পুরস্কার পাওয়া যাবে না)"
              >
                স্কিপ
              </button>
            </div>
          )}

          {/* Admin Testing Note */}
          <div className="pt-1 text-center">
            <span className="text-[10px] text-gray-500">
              💡 <em>অ্যাডমিনদের টেস্টিংয়ের সুবিধার্থে ডেমো অ্যাড চালু রয়েছে। ডোমেইন যুক্ত করার পর Monetag/AdSense কোড লাইভ হবে।</em>
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
