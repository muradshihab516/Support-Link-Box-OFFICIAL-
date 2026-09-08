import React, { useState } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Zap, 
  Cloud, 
  Send, 
  CheckCircle2, 
  X,
  Lock,
  ArrowRight
} from 'lucide-react';

// 1. NATIVE MOVIE GRID AD
// Renders inside the movie poster grid looking like a premium sponsored card
export const NativeMovieGridAd: React.FC = () => {
  const [clicked, setClicked] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClicked(true);
    setTimeout(() => setClicked(false), 3000);
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#1C1A2E] via-[#151324] to-[#0E0E14] border border-purple-500/30 hover:border-purple-400/70 transition-all duration-300 shadow-xl cursor-pointer flex flex-col justify-between"
    >
      {/* Top Graphic / Poster simulation */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#181628] flex flex-col items-center justify-center p-4 text-center">
        {/* Ad Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-black text-[9px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Sponsored
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="px-1.5 py-0.5 rounded bg-black/60 text-gray-400 text-[9px] font-mono">
            Demo Ad
          </span>
        </div>

        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-indigo-600/10 to-transparent" />

        {/* Icon & Brand Title */}
        <div className="relative z-10 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
            <div className="w-full h-full bg-[#131120] rounded-2xl flex items-center justify-center text-purple-400">
              <Zap className="w-7 h-7" />
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">High Speed Cloud</div>
            <h4 className="text-sm font-black text-white leading-tight mt-0.5">
              GDFlex & Pixeldrain 10Gbps VIP Pass
            </h4>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed px-2 line-clamp-3">
            মুভি ডাউনলোডে পান আনলিমিটেড স্পিড, নো-ক্যাপ ব্যান্ডউইথ ও ডিরেক্ট ক্লাউড লিংক স্টোরেজ।
          </p>
        </div>

        {/* Bottom overlay badge */}
        <div className="absolute bottom-2 inset-x-2 z-10">
          <span className="w-full block py-1 px-2 rounded-lg bg-indigo-600/30 border border-indigo-500/30 text-indigo-200 text-[10px] font-bold text-center">
            ⚡ 1-Click Fast Mirror
          </span>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-3 bg-[#111018] border-t border-purple-500/20 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          {clicked ? '✓ ডেমো লিংক টেস্টেড' : 'স্পন্সর অফার দেখুন'}
        </span>
        <div className="px-2.5 py-1 rounded-lg bg-purple-600 group-hover:bg-purple-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors">
          <span>Get Offer</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};

// 2. MODAL DOWNLOAD BANNER AD
// Renders inside MovieDetailsModal above or below format links
export const ModalDownloadBannerAd: React.FC = () => {
  const [copied, setCopied] = useState(false);

  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-[#181628] via-[#14141E] to-[#121218] border border-purple-500/30 shadow-md space-y-3">
      <div className="flex items-center justify-between">
        <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Sponsored Partner
        </span>
        <span className="text-[10px] text-gray-500 font-mono">AD-728x90</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-bold text-white">
              🛡️ ডাউনলোডের পূর্বে আপনার IP ও পরিচয় নিরাপদ রাখুন
            </h5>
            <p className="text-[11px] text-gray-400 mt-0.5">
              NordVPN সুপারফাস্ট BDIX অপ্টিমাইজড সার্ভার — ৮২% ডিসকাউন্টে ৩ মাস ফ্রি।
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shrink-0 flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>ডেমো অফার সক্রিয়</span>
            </>
          ) : (
            <>
              <span>Claim Discount</span>
              <ExternalLink className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// 3. GATEWAY INTERSTITIAL AD
// Renders inside MovieDownloadGatewayModal during the countdown timer
export const GatewayInterstitialAd: React.FC = () => {
  const [joined, setJoined] = useState(false);

  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-[#161622] to-purple-950/30 border border-indigo-500/30 space-y-2.5">
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
          <Send className="w-3 h-3" /> Telegram VIP Community
        </span>
        <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[9px]">
          Free Join
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-white">
            নতুন মুভির ডিরেক্ট গুগল ড্রাইভ ও Pixeldrain লিংক চান?
          </div>
          <p className="text-[11px] text-gray-300 mt-0.5">
            আমাদের অফিশিয়াল মুভি লাভার টেলিগ্রাম চ্যানেলে যুক্ত হয়ে সবার আগে রিলিজ নোটিফিকেশন পান।
          </p>
        </div>

        <button
          onClick={() => {
            setJoined(true);
            setTimeout(() => setJoined(false), 3000);
          }}
          className="px-3 py-1.5 rounded-lg bg-[#229ED9] hover:bg-[#1e8ec4] text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          <Send className="w-3 h-3" />
          <span>{joined ? '✓ কানেক্টেড' : 'টেলিগ্রামে জয়েন'}</span>
        </button>
      </div>
    </div>
  );
};

// 4. TOP STICKY / HEADER ANNOUNCEMENT AD
export const TopAnnouncementAd: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-purple-900/80 border-b border-purple-500/30 px-3 py-2 text-xs text-white">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="px-1.5 py-0.5 rounded bg-amber-400 text-black text-[9px] font-black uppercase shrink-0">
            স্পন্সর অফার
          </span>
          <span className="truncate text-[11px] text-purple-100">
            ⚡ <strong>BDIX High Speed NVMe Hosting:</strong> মাত্র ১৯৯ টাকা/মাসে আনলিমিটেড ব্যান্ডউইথ ও ফ্রি SSL!
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#hosting-offer"
            onClick={(e) => { e.preventDefault(); alert('ডেমো অ্যাড: স্পন্সর লিংক ওপেন হবে।'); }}
            className="px-2.5 py-1 rounded bg-white text-slate-950 hover:bg-gray-100 text-[11px] font-bold flex items-center gap-1 transition-colors"
          >
            অফার নিন <ArrowRight className="w-3 h-3" />
          </a>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white transition-colors"
            title="বন্ধ করুন"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
