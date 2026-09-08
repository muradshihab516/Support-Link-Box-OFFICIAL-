import React, { useState, useMemo } from 'react';
import { 
  Film, 
  Search, 
  ThumbsUp, 
  CheckCircle2, 
  Clock, 
  Hourglass, 
  XCircle, 
  ExternalLink, 
  Download, 
  Sparkles, 
  MessageSquare, 
  Trash2, 
  Check, 
  Filter, 
  Globe, 
  Layers, 
  Calendar,
  AlertCircle,
  ChevronDown,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MovieRequestItem, MovieRequestStatus } from '../../types';

interface MovieRequestsSectionProps {
  onOpenRequestModal: () => void;
  onOpenMovieById?: (movieId: string) => void;
}

export const MovieRequestsSection: React.FC<MovieRequestsSectionProps> = ({
  onOpenRequestModal,
  onOpenMovieById
}) => {
  const { 
    currentUser, 
    movieRequests, 
    upvoteMovieRequest, 
    updateMovieRequestStatus, 
    deleteMovieRequest 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MovieRequestStatus>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');
  
  // Admin Reply modal / inline state
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminDownloadLink, setAdminDownloadLink] = useState('');
  const [statusSelect, setStatusSelect] = useState<MovieRequestStatus>('available');

  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin');

  // Filtered and sorted movie requests
  const filteredRequests = useMemo(() => {
    return movieRequests
      .filter(req => {
        // Status filter
        if (statusFilter !== 'all' && req.status !== statusFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = req.title.toLowerCase().includes(q);
          const matchUser = req.requestedByName.toLowerCase().includes(q);
          const matchLang = req.language?.toLowerCase().includes(q);
          const matchNotes = req.notes?.toLowerCase().includes(q);
          if (!matchTitle && !matchUser && !matchLang && !matchNotes) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'votes') {
          const diff = (b.upvotes?.length || 0) - (a.upvotes?.length || 0);
          if (diff !== 0) return diff;
          return b.createdAtTimestamp - a.createdAtTimestamp;
        }
        if (sortBy === 'newest') {
          return b.createdAtTimestamp - a.createdAtTimestamp;
        }
        return 0;
      });
  }, [movieRequests, statusFilter, searchQuery, sortBy]);

  // Counts by status
  const counts = useMemo(() => {
    return {
      all: movieRequests.length,
      pending: movieRequests.filter(r => r.status === 'pending').length,
      processing: movieRequests.filter(r => r.status === 'processing').length,
      available: movieRequests.filter(r => r.status === 'available').length,
      rejected: movieRequests.filter(r => r.status === 'rejected').length
    };
  }, [movieRequests]);

  const handleStartAdminEdit = (req: MovieRequestItem) => {
    setEditingReplyId(req.id);
    setStatusSelect(req.status);
    setAdminReplyText(req.adminReply || '');
    setAdminDownloadLink(req.downloadLink || '');
  };

  const handleSaveAdminUpdate = (requestId: string) => {
    updateMovieRequestStatus(
      requestId,
      statusSelect,
      adminReplyText.trim() || undefined,
      adminDownloadLink.trim() || undefined
    );
    setEditingReplyId(null);
  };

  const getStatusBadge = (status: MovieRequestStatus) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>উপলব্ধ (Available)</span>
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Hourglass className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            <span>প্রক্রিয়াধীন (Processing)</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>অপেক্ষমান (Pending)</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>বাতিল (Rejected)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* Top Controls: Request Call to Action Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-[#14141A] to-indigo-900/30 border border-purple-500/25 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>সদস্যদের জন্য বিশেষ সুবিধা</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            কাঙ্ক্ষিত মুভি বা সিরিজ পাচ্ছেন না?
          </h3>
          <p className="text-xs text-gray-400 max-w-xl">
            আপনার পছন্দের মুভির নাম ও কোয়ালিটি রিকোয়েস্ট করুন। আমাদের টিম দ্রুত ক্লাউড স্টোরেজে লিংক আপলোড করবে। অন্যান্য সদস্যদের রিকোয়েস্টে ভোট দিন!
          </p>
        </div>

        <button
          onClick={onOpenRequestModal}
          className="shrink-0 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Film className="w-4 h-4" />
          <span>+ নতুন মুভি রিকোয়েস্ট করুন</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#121216] border border-gray-800/80 space-y-3 shadow-md">
        
        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-[#191920] text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <span>সকল রিকোয়েস্ট</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{counts.all}</span>
          </button>

          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-[#191920] text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>অপেক্ষমান</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{counts.pending}</span>
          </button>

          <button
            onClick={() => setStatusFilter('processing')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'processing'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-[#191920] text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Hourglass className="w-3.5 h-3.5 text-sky-400" />
            <span>প্রক্রিয়াধীন</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{counts.processing}</span>
          </button>

          <button
            onClick={() => setStatusFilter('available')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'available'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#191920] text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>আপলোড সম্পন্ন (Ready)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{counts.available}</span>
          </button>

          <button
            onClick={() => setStatusFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
              statusFilter === 'rejected'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-[#191920] text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>বাতিল</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">{counts.rejected}</span>
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="মুভির নাম, সদস্য বা ভাষা লিখে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2 bg-[#18181D] border border-gray-700/60 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> সাজান:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-[#18181D] border border-gray-700/60 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500"
            >
              <option value="votes">সর্বোচ্চ ভোট (বেশি চাহিদাসম্পন্ন)</option>
              <option value="newest">সর্বশেষ রিকোয়েস্ট</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-[#121216] border border-gray-800/80 space-y-3">
          <Film className="w-10 h-10 text-gray-600 mx-auto" />
          <h4 className="text-sm font-bold text-gray-300">কোনো মুভি রিকোয়েস্ট পাওয়া যায়নি</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            আপনি প্রথম ব্যক্তি হিসেবে আপনার পছন্দের কোনো মুভি বা ওয়েব সিরিজের রিকোয়েস্ট জমা দিতে পারেন!
          </p>
          <button
            onClick={onOpenRequestModal}
            className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors"
          >
            + মুভি রিকোয়েস্ট জমা দিন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((req) => {
            const currentUserId = currentUser?.id || '';
            const hasUpvoted = req.upvotes?.includes(currentUserId);
            const isOwner = currentUser?.id === req.requestedByUserId;

            return (
              <div 
                key={req.id}
                className="p-4 sm:p-5 rounded-2xl bg-[#121217] border border-gray-800/80 hover:border-purple-500/30 transition-all duration-200 shadow-md space-y-3.5"
              >
                {/* Header Row: Title, Year, Quality, and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                        {req.title}
                      </h3>
                      {req.year && (
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-mono text-xs font-bold">
                          {req.year}
                        </span>
                      )}
                      {req.preferredQuality && (
                        <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                          {req.preferredQuality}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-400">
                      {req.language && (
                        <span className="flex items-center gap-1 text-gray-300">
                          <Globe className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{req.language}</span>
                        </span>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <img 
                          src={req.requestedByAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                          alt="Avatar"
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span>{req.requestedByName}</span>
                      </span>
                      <span>•</span>
                      <span className="text-[11px] text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge & Upvote Button */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {getStatusBadge(req.status)}

                    {/* Upvote Button */}
                    <button
                      onClick={() => upvoteMovieRequest(req.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        hasUpvoted
                          ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-600/25 scale-[1.02]'
                          : 'bg-[#191922] hover:bg-[#22222E] border-gray-700/70 text-gray-300'
                      }`}
                      title={hasUpvoted ? 'ভোট দেওয়া হয়েছে (আবার চাপলে ভোট প্রত্যাহার হবে)' : 'এই মুভিতে ভোট দিন'}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
                      <span>{req.upvotes?.length || 0}</span>
                      <span className="hidden sm:inline text-[11px] font-medium opacity-80">
                        {hasUpvoted ? 'ভোট দেওয়া হয়েছে' : 'আমিও চাই'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Optional Note by Requester */}
                {req.notes && (
                  <div className="p-2.5 rounded-xl bg-black/40 border border-gray-800/80 text-xs text-gray-300 flex items-start gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{req.notes}</span>
                  </div>
                )}

                {/* Reference Link if provided */}
                {req.imdbOrRefUrl && (
                  <div className="text-[11px]">
                    <a
                      href={req.imdbOrRefUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>IMDb / তথ্য রেফারেন্স লিংক দেখুন</span>
                    </a>
                  </div>
                )}

                {/* Admin Reply & Available Download Box */}
                {req.adminReply && (
                  <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/30 to-[#151d18] border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>এডমিন রিপ্লাই ও আপডেট:</span>
                      </div>
                      {req.status === 'available' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                          রেডি টু ডাউনলোড
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-emerald-100 leading-relaxed font-sans">
                      {req.adminReply}
                    </p>

                    {/* Direct link or Movie Hub link */}
                    {req.downloadLink && (
                      <div className="pt-1">
                        <a
                          href={req.downloadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>সরাসরি ডাউনলোড করুন (ক্লাউড মিরর)</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Admin Actions Bar (visible to Admins/Super Admins) */}
                {isAdmin && (
                  <div className="pt-2 border-t border-gray-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400 font-semibold">এডমিন অ্যাকশন:</span>
                      <button
                        onClick={() => handleStartAdminEdit(req)}
                        className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 font-semibold rounded-lg transition-colors"
                      >
                        স্ট্যাটাস ও রিপ্লাই আপডেট করুন
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি "${req.title}" মুভি রিকোয়েস্টটি মুছে ফেলতে চান?`)) {
                            deleteMovieRequest(req.id);
                          }
                        }}
                        className="px-2 py-1 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1"
                        title="রিকোয়েস্ট মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>মুছুন</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Admin Inline Edit Panel if currently selected */}
                {isAdmin && editingReplyId === req.id && (
                  <div className="p-3 sm:p-4 rounded-xl bg-[#16161E] border border-purple-500/40 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>এডমিন কন্ট্রোল: "{req.title}"</span>
                      </h4>
                      <button 
                        onClick={() => setEditingReplyId(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        বাতিল
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] text-gray-300 font-semibold">স্ট্যাটাস নির্বাচন করুন</label>
                        <select
                          value={statusSelect}
                          onChange={(e) => setStatusSelect(e.target.value as MovieRequestStatus)}
                          className="w-full px-3 py-1.5 bg-[#1C1C26] border border-gray-700 rounded-lg text-xs text-white"
                        >
                          <option value="pending">অপেক্ষমান (Pending)</option>
                          <option value="processing">প্রক্রিয়াধীন / খোঁজা হচ্ছে (Processing)</option>
                          <option value="available">আপলোড সম্পন্ন / রেডি (Available)</option>
                          <option value="rejected">বাতিল (Rejected)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-gray-300 font-semibold">ডাউনলোড / মিরর লিংক (ঐচ্ছিক)</label>
                        <input
                          type="url"
                          value={adminDownloadLink}
                          onChange={(e) => setAdminDownloadLink(e.target.value)}
                          placeholder="https://pixeldrain.com/u/... অথবা gdflex লিংক"
                          className="w-full px-3 py-1.5 bg-[#1C1C26] border border-gray-700 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] text-gray-300 font-semibold">এডমিন রিপ্লাই নোট (মেম্বার নোটিফিকেশন পাবে)</label>
                      <input
                        type="text"
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        placeholder="যেমন: মুভিটি আমাদের মুভি হাবে আপলোড হয়েছে, ৭২০p ও ১০৮০p প্রিন্ট অ্যাভেইলেবল।"
                        className="w-full px-3 py-1.5 bg-[#1C1C26] border border-gray-700 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingReplyId(null)}
                        className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs font-semibold"
                      >
                        বন্ধ করুন
                      </button>
                      <button
                        onClick={() => handleSaveAdminUpdate(req.id)}
                        className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>আপডেট সেভ করুন</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
