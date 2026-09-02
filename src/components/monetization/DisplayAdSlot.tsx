import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ExternalLink } from 'lucide-react';

interface DisplayAdSlotProps {
  slotId?: string;
  format?: 'horizontal_banner' | 'medium_rectangle' | 'in_feed' | 'leaderboard';
  className?: string;
}

export const DisplayAdSlot: React.FC<DisplayAdSlotProps> = ({ 
  slotId = 'slot_default', 
  format = 'horizontal_banner',
  className = '' 
}) => {
  const { settings } = useApp();

  if (!settings.enableAdSlots) return null;

  return (
    <div className={`my-4 overflow-hidden rounded-2xl border border-[#1E1E20] bg-[#131315] p-3 sm:p-4 text-center relative group shadow-xs ${className}`}>
      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-2">
        <span className="flex items-center gap-1 text-gray-400">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Sponsored Advertisement
        </span>
        <span className="hover:text-indigo-400 cursor-pointer">Ad Choices ℹ</span>
      </div>

      {format === 'horizontal_banner' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2.5 bg-[#0E0E10] rounded-xl border border-[#1E1E20]">
          <div className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xl shrink-0">
              ⚡
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">
                Boost Your Facebook Page Reach with Meta Ads Pro
              </div>
              <div className="text-[11px] text-gray-400">
                Official Agency Training & Verified Engagement Strategy in Bangla
              </div>
            </div>
          </div>
          <button 
            onClick={() => window.open('https://example.com/ad-network', '_blank')}
            className="w-full sm:w-auto px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shrink-0 flex items-center justify-center gap-1 transition-colors"
          >
            Learn More <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {format === 'leaderboard' && (
        <div className="p-3 bg-[#0E0E10] rounded-xl border border-[#1E1E20] flex items-center justify-between gap-4">
          <div className="text-left">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              Exclusive Community Offer
            </div>
            <div className="text-sm font-bold text-white">
              Get High-Speed SSD Cloud Hosting from ৳199/month
            </div>
          </div>
          <button 
            onClick={() => window.open('https://example.com/hosting', '_blank')}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
          >
            Claim 50% Off
          </button>
        </div>
      )}

      {format === 'in_feed' && (
        <div className="p-3 bg-[#0E0E10] rounded-xl border border-[#1E1E20] text-left">
          <div className="text-xs font-bold text-white mb-1">
            Need High Quality Bangladeshi Video Editors for Reels?
          </div>
          <p className="text-[11px] text-gray-400 mb-2">
            Hire pre-vetted video creators starting from ৳500 per short form reel.
          </p>
          <span className="text-[10px] text-indigo-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
            Browse Portfolios →
          </span>
        </div>
      )}
    </div>
  );
};
