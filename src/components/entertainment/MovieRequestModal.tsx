import React, { useState } from 'react';
import { 
  X, 
  Film, 
  Calendar, 
  Sparkles, 
  Globe, 
  Layers, 
  Link as LinkIcon, 
  MessageSquare, 
  Send,
  AlertCircle,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MovieRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MovieRequestModal: React.FC<MovieRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, submitMovieRequest } = useApp();

  const [title, setTitle] = useState('');
  const [year, setYear] = useState<string>('2024');
  const [language, setLanguage] = useState('English (Dual Audio / Bangla Sub)');
  const [customLanguage, setCustomLanguage] = useState('');
  const [quality, setQuality] = useState('1080p FHD');
  const [imdbOrRefUrl, setImdbOrRefUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim()) {
      setErrorMsg('অনুগ্রহ করে কাঙ্ক্ষিত মুভি বা ওয়েব সিরিজের নাম লিখুন।');
      return;
    }

    setIsSubmitting(true);

    const finalLanguage = language === 'other' ? (customLanguage.trim() || 'অন্যান্য') : language;

    const result = submitMovieRequest({
      title: title.trim(),
      year: year ? parseInt(year, 10) || year : undefined,
      language: finalLanguage,
      preferredQuality: quality,
      imdbOrRefUrl: imdbOrRefUrl.trim() || undefined,
      notes: notes.trim() || undefined
    });

    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg(result.message);
      setTimeout(() => {
        // Reset and close
        setTitle('');
        setNotes('');
        setImdbOrRefUrl('');
        setSuccessMsg('');
        if (onSuccess) onSuccess();
        onClose();
      }, 1400);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111116] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-800 bg-gradient-to-r from-purple-950/40 via-transparent to-indigo-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                <span>মুভি রিকোয়েস্ট বক্স</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Movie Request
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                আপনার পছন্দের মুভিটির নাম ও তথ্য জমা দিন, এডমিন দ্রুত লিংক যুক্ত করবে
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Movie Title */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-gray-200">
              মুভি বা সিরিজের নাম <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: Inception, Pushpa 2, তুফান, Interstellar..."
                className="w-full px-3.5 py-2.5 bg-[#18181F] border border-gray-700/80 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Year & Preferred Quality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block font-semibold text-gray-200 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                রিলিজ সাল (Release Year)
              </label>
              <input
                type="number"
                min="1950"
                max="2030"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                className="w-full px-3 py-2 bg-[#18181F] border border-gray-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-gray-200 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-gray-400" />
                পছন্দের কোয়ালিটি
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full px-3 py-2 bg-[#18181F] border border-gray-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="1080p FHD">1080p Full HD (প্রস্তাবিত)</option>
                <option value="720p HD">720p HD (কম এমবি)</option>
                <option value="480p SD">480p SD (মোবাইল ভার্সন)</option>
                <option value="4K UHD">4K Ultra HD (হাই কোয়ালিটি)</option>
                <option value="যে কোনো ভালো প্রিন্ট">যে কোনো ভালো প্রিন্ট</option>
              </select>
            </div>
          </div>

          {/* Language / Audio Preference */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-gray-200 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-gray-400" />
              ভাষা ও অডিও ফরম্যাট
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-[#18181F] border border-gray-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            >
              <option value="English (Dual Audio / Bangla Sub)">English (Dual Audio / Bangla Sub)</option>
              <option value="বাংলা (Bangla Original / Dubbed)">বাংলা (Bangla Original / Dubbed)</option>
              <option value="Hindi (Original Audio)">Hindi (Original Audio)</option>
              <option value="South Indian (Hindi / Bangla Dubbed)">South Indian (Hindi / Bangla Dubbed)</option>
              <option value="Korean (Bangla / English Sub)">Korean (Bangla / English Sub)</option>
              <option value="other">অন্যান্য (নিচে লিখুন)...</option>
            </select>
            {language === 'other' && (
              <input
                type="text"
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                placeholder="ভাষার বিবরণ লিখুন..."
                className="mt-2 w-full px-3 py-2 bg-[#18181F] border border-gray-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            )}
          </div>

          {/* IMDb or Trailer link (Optional) */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-gray-200 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
              IMDb বা ট্রেলার লিংক (ঐচ্ছিক)
            </label>
            <input
              type="url"
              value={imdbOrRefUrl}
              onChange={(e) => setImdbOrRefUrl(e.target.value)}
              placeholder="https://www.imdb.com/title/..."
              className="w-full px-3 py-2 bg-[#18181F] border border-gray-700/80 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Special Notes */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-gray-200 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
              বিশেষ কোনো নোট বা অনুরোধ (ঐচ্ছিক)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="যেমন: বাংলা সাবটাইটেল আবশ্যক, অথবা থিয়েটার প্রিন্ট বাদ দিয়ে ওটিটি প্রিন্ট চাই..."
              className="w-full px-3 py-2 bg-[#18181F] border border-gray-700/80 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Requester Persona Info */}
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover border border-purple-500/40"
              />
              <div>
                <div className="font-bold text-white text-xs">{currentUser?.name || 'Guest User'}</div>
                <div className="text-[10px] text-gray-400">@{currentUser?.username || 'member'} • রিকোয়েস্টার হিসেবে পোস্ট হবে</div>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ভোট ১টি যোগ হবে
            </span>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'জমা হচ্ছে...' : 'রিকোয়েস্ট সাবমিট করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
