import React, { useState } from 'react';
import { 
  X, 
  Film, 
  Star, 
  Calendar, 
  Clock, 
  Globe, 
  Download, 
  Server, 
  ShieldCheck, 
  Eye, 
  Sparkles,
  Layers,
  Share2,
  Check
} from 'lucide-react';
import { MovieItem, MovieFormatLink } from '../../types';
import { MovieDownloadGatewayModal } from './MovieDownloadGatewayModal';
import { ModalDownloadBannerAd } from '../monetization/DemoAdUnits';

interface MovieDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: MovieItem | null;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  isOpen,
  onClose,
  movie
}) => {
  const [selectedFormatLink, setSelectedFormatLink] = useState<MovieFormatLink | null>(null);
  const [showGateway, setShowGateway] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !movie) return null;

  const handleSelectFormat = (link: MovieFormatLink) => {
    setSelectedFormatLink(link);
    setShowGateway(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const activeLinks = movie.links.filter(l => l.status === 'active');

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-2xl bg-[#111114] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Top Hero Bar with Backdrop effect */}
          <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-t from-[#111114] to-black">
            <img
              src={movie.thumbnail}
              alt={movie.title}
              className="w-full h-full object-cover object-center opacity-35 filter blur-xs scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-[#111114]/70 to-transparent" />
            
            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/10 text-gray-300 hover:text-white transition-all text-xs flex items-center gap-1"
                title="শেয়ার করুন"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-black/60 hover:bg-black/80 border border-white/10 text-gray-300 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Poster thumbnail overlay */}
            <div className="absolute -bottom-2 left-5 sm:left-6 flex items-end gap-4">
              <div className="w-24 sm:w-28 h-32 sm:h-36 rounded-xl overflow-hidden shadow-2xl border-2 border-indigo-500/40 bg-gray-900 shrink-0">
                <img
                  src={movie.thumbnail}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="pb-4">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {movie.rating && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {movie.rating}
                    </span>
                  )}
                  {movie.releaseYear && (
                    <span className="px-2 py-0.5 rounded bg-gray-800/80 text-gray-300 text-xs font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {movie.releaseYear}
                    </span>
                  )}
                  {movie.duration && (
                    <span className="px-2 py-0.5 rounded bg-gray-800/80 text-gray-300 text-xs font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {movie.duration}
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white line-clamp-2 leading-tight">
                  {movie.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
            
            {/* Meta tags & language */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {movie.genre.map((g, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-[#1a1a20] border border-gray-800 text-xs text-indigo-300 font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
              {movie.language && (
                <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-900 px-2.5 py-1 rounded-lg border border-gray-800">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  {movie.language}
                </span>
              )}
            </div>

            {/* Synopsis */}
            {movie.description && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  কাহিনী সংক্ষেপ / Synopsis
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed bg-[#16161a] p-3.5 rounded-xl border border-gray-800/60">
                  {movie.description}
                </p>
              </div>
            )}

            {/* Demo Ad Placement before download links */}
            <ModalDownloadBannerAd />

            {/* Formats & Download Options Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  উপলব্ধ ফরম্যাট ও ডাউনলোড লিংক ({activeLinks.length})
                </h4>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> High-Speed Cloud
                </span>
              </div>

              {activeLinks.length === 0 ? (
                <div className="p-4 rounded-xl bg-gray-900 text-center text-xs text-gray-400">
                  বর্তমানে এই মুভির কোনো ডাউনলোড লিংক সক্রিয় নেই।
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeLinks.map((link) => (
                    <div
                      key={link.id}
                      className="p-3.5 rounded-xl bg-[#17171C] hover:bg-[#1E1E24] border border-gray-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between gap-3 shadow-sm group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black">
                            {link.quality}
                          </span>
                          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-300 font-medium">
                            <Server className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{link.serverName}</span>
                          </div>
                        </div>
                        {link.fileSize && (
                          <span className="text-xs font-mono font-semibold text-gray-400 bg-gray-800/80 px-2 py-0.5 rounded">
                            {link.fileSize}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-gray-800/60">
                        <span className="text-[11px] text-gray-400">
                          {link.clickCount || 0} বার ডাউনলোড হয়েছে
                        </span>
                        <button
                          onClick={() => handleSelectFormat(link)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-md group-hover:bg-indigo-500"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>ডাউনলোড করুন</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy & Download Notice */}
            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-2.5 text-xs text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                ডাউনলোড বাটনে চাপলে বিজ্ঞাপন যাচাই ও কাউন্টডাউন গেটওয়ের মাধ্যমে সরাসরি Pixeldrain, GDFlex বা GDFile মিরর সার্ভারে রিডাইরেক্ট হবে।
              </p>
            </div>

          </div>

          {/* Footer Bar */}
          <div className="p-3.5 bg-[#0D0D10] border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-gray-400" />
              ভিউ: {movie.totalViews || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-gray-400" />
              মোট ডাউনলোড: {movie.totalDownloads || 0}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>

        </div>
      </div>

      {/* Gateway Modal */}
      <MovieDownloadGatewayModal
        isOpen={showGateway}
        onClose={() => setShowGateway(false)}
        movie={movie}
        link={selectedFormatLink}
      />
    </>
  );
};
