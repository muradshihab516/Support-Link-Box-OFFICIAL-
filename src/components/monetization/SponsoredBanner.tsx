import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SponsorPosition } from '../../types';
import { ExternalLink, Flame } from 'lucide-react';

interface SponsoredBannerProps {
  position: SponsorPosition;
  className?: string;
}

export const SponsoredBanner: React.FC<SponsoredBannerProps> = ({ position, className = '' }) => {
  const { sponsors, trackSponsorImpression, trackSponsorClick, settings } = useApp();

  if (!settings.enableFeaturedSponsors) return null;

  const activeSponsors = sponsors.filter(s => s.position === position && s.status === 'active');
  if (activeSponsors.length === 0) return null;

  // Pick highest priority
  const sponsor = activeSponsors.sort((a, b) => a.priority - b.priority)[0];

  useEffect(() => {
    trackSponsorImpression(sponsor.id);
  }, [sponsor.id]);

  const handleClick = () => {
    trackSponsorClick(sponsor.id);
    window.open(sponsor.destinationUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      onClick={handleClick}
      className={`group cursor-pointer overflow-hidden rounded-2xl border border-[#1E1E20] bg-gradient-to-r from-[#18181B] via-[#131315] to-[#0E0E10] text-white p-3.5 sm:p-4 shadow-sm hover:border-indigo-500/50 transition-all duration-200 ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          {sponsor.imageUrl && (
            <img 
              src={sponsor.imageUrl} 
              alt={sponsor.title}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover ring-1 ring-[#1E1E20] shrink-0" 
            />
          )}
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="bg-amber-400 text-slate-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded tracking-wider uppercase">
                SPONSOR
              </span>
              <span className="text-xs text-indigo-400 font-medium">
                {sponsor.sponsorName}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
              {sponsor.title}
            </h4>
            <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
              {sponsor.description}
            </p>
          </div>
        </div>

        <button 
          className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs"
        >
          <span>Visit Sponsor</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const FeaturedSponsorCard: React.FC = () => {
  const { sponsors, trackSponsorImpression, trackSponsorClick, settings } = useApp();

  if (!settings.enableFeaturedSponsors) return null;

  const featured = sponsors.find(s => s.packageType === 'featured_sponsor' && s.status === 'active') || sponsors[0];
  if (!featured) return null;

  useEffect(() => {
    trackSponsorImpression(featured.id);
  }, [featured.id]);

  const handleClick = () => {
    trackSponsorClick(featured.id);
    window.open(featured.destinationUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      onClick={handleClick}
      className="cursor-pointer rounded-2xl border border-amber-500/20 bg-[#131315] p-4 relative overflow-hidden group hover:border-amber-500/40 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
          <Flame className="w-3 h-3 text-amber-400" /> Featured Community Partner
        </span>
        <span className="text-[10px] text-gray-500">Sponsored</span>
      </div>

      <div className="flex items-center gap-3">
        {featured.imageUrl && (
          <img src={featured.imageUrl} alt={featured.title} className="w-11 h-11 rounded-xl object-cover ring-1 ring-[#1E1E20] shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-400">
            {featured.title}
          </div>
          <div className="text-[11px] text-gray-400 line-clamp-1">
            by {featured.sponsorName} — {featured.description}
          </div>
        </div>
      </div>
    </div>
  );
};
