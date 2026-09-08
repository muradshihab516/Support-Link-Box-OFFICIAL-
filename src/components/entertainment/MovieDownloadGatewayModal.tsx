import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Download, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  Server,
  Sparkles,
  Lock
} from 'lucide-react';
import { MovieItem, MovieFormatLink } from '../../types';
import { useApp } from '../../context/AppContext';
import { GatewayInterstitialAd } from '../monetization/DemoAdUnits';

interface MovieDownloadGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: MovieItem | null;
  link: MovieFormatLink | null;
}

export const MovieDownloadGatewayModal: React.FC<MovieDownloadGatewayModalProps> = ({
  isOpen,
  onClose,
  movie,
  link
}) => {
  const { resolveDownloadToken, recordDownloadClick } = useApp();
  
  const timerDuration = movie?.adSettings?.gatewayTimerSeconds || 4;
  const [countdown, setCountdown] = useState<number>(timerDuration);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [resolvedResult, setResolvedResult] = useState<{ success: boolean; destinationUrl?: string; error?: string } | null>(null);
  const [hasStartedDownload, setHasStartedDownload] = useState(false);

  useEffect(() => {
    if (isOpen && link) {
      // Validate token using secure context resolver
      const res = resolveDownloadToken(link.downloadToken);
      setResolvedResult(res);
      setCountdown(timerDuration);
      setIsReady(false);
      setHasStartedDownload(false);

      if (res.success) {
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setIsReady(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(interval);
      }
    }
  }, [isOpen, link]);

  if (!isOpen || !movie || !link) return null;

  const handleFinalProceed = () => {
    if (!resolvedResult?.success || !resolvedResult.destinationUrl) return;
    
    // Record analytics click
    recordDownloadClick(link.downloadToken);
    setHasStartedDownload(true);

    // Open destination in external host (Pixeldrain / GDFlex / GDFile)
    window.open(resolvedResult.destinationUrl, '_blank', 'noopener,noreferrer');
  };

  const progressPercent = Math.min(100, Math.round(((timerDuration - countdown) / timerDuration) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#121215] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-950/50 via-purple-950/30 to-[#121215] border-b border-gray-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Secure Download Gateway
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  Token: #{link.downloadToken}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1 mt-0.5">
                {movie.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          
          {/* Format Spec Summary Card */}
          <div className="p-4 rounded-xl bg-[#18181D] border border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                {link.quality}
              </span>
              <span className="flex items-center gap-1 text-gray-300">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                {link.serverName}
              </span>
            </div>
            {link.fileSize && (
              <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-300 font-medium">
                Size: {link.fileSize}
              </span>
            )}
          </div>

          {/* Validation Failure Warning */}
          {resolvedResult && !resolvedResult.success ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>লিংক যাচাই ব্যর্থ হয়েছে</span>
              </div>
              <p>{resolvedResult.error || 'টোকেনটি অবৈধ অথবা ফাইলটি বর্তমানে ডাউনলোডের জন্য প্রস্তুত নয়।'}</p>
              <button
                onClick={onClose}
                className="mt-2 w-full py-2 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors"
              >
                ফিরে যান
              </button>
            </div>
          ) : (
            <>
              {/* High-Converting Interstitial Demo Ad */}
              <GatewayInterstitialAd />

              {/* Sponsored / Ad Verification Slot */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/20 via-[#1e1a14] to-[#16161a] border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Sponsored Community Hub
                  </span>
                  <span className="text-gray-400 text-[10px]">Cloud Storage Mirror</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  {movie.adSettings?.sponsorNote || 'মুভি লিংকটি সুরক্ষিত ক্লাউড মিরর (Pixeldrain / GDFlex / GDFile) থেকে পরিবেশন করা হচ্ছে। নিরাপদ লিংকের জন্য অপেক্ষা করুন।'}
                </p>
              </div>

              {/* Countdown & Security Progress */}
              <div className="p-4 rounded-xl bg-[#16161A] border border-gray-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 flex items-center gap-1.5 font-medium">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    নিরাপদ লিংক ভেরিফিকেশন চলছে...
                  </span>
                  <span className="font-bold text-indigo-400 font-mono">
                    {isReady ? 'Ready (100%)' : `${countdown} সেকেন্ড বাকি`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> Direct Cloud Routing
                  </span>
                  <span>Anti-Scraping Protected</span>
                </div>
              </div>

              {/* Action Button */}
              {!isReady ? (
                <button
                  disabled
                  className="w-full py-3.5 px-4 bg-gray-800/80 border border-gray-700/50 text-gray-400 font-bold rounded-xl flex items-center justify-center gap-2 text-sm cursor-not-allowed"
                >
                  <Clock className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>লিংক প্রস্তুত হচ্ছে ({countdown}s)...</span>
                </button>
              ) : (
                <button
                  onClick={handleFinalProceed}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 animate-pulse"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {hasStartedDownload ? 'আবার ওপেন করুন' : `Download / Stream on ${link.serverName}`}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
                </button>
              )}

              {hasStartedDownload && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>ফাইল হোস্ট পেজটি নতুন ট্যাবে ওপেন হয়েছে। ডাউনলোড শুরু না হলে বাটনটিতে আবার চাপুন।</span>
                </div>
              )}
            </>
          )}

          {/* Legal Disclaimer & Safe Harbor */}
          <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-[11px] text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-400">Disclaimer:</span> এই ওয়েবসাইট কোনো ভিডিও ফাইল বা কনটেন্ট নিজস্ব সার্ভারে হোস্ট করে না। সকল ফাইল Pixeldrain, GDFlex, GDFile প্রভৃতি থার্ড-পার্টি ক্লাউড ড্রাইভে সংরক্ষিত।
          </div>

        </div>

      </div>
    </div>
  );
};
