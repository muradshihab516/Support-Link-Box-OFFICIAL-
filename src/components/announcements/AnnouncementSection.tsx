import React, { useState, useMemo } from 'react';
import { useApp, isStaffOrAdminMember } from '../../context/AppContext';
import { AnnouncementItem, AnnouncementType } from '../../types';
import { 
  Megaphone, 
  Pin, 
  AlertCircle, 
  Sparkles, 
  Trophy, 
  Calendar, 
  AlertTriangle, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCheck, 
  Eye, 
  Clock, 
  X, 
  Check, 
  Image as ImageIcon,
  Share2,
  BellRing
} from 'lucide-react';

interface AnnouncementSectionProps {
  onNavigate?: (view: string) => void;
}

export const AnnouncementSection: React.FC<AnnouncementSectionProps> = ({ onNavigate }) => {
  const { 
    currentUser, 
    announcements, 
    createAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement, 
    markAnnouncementAsRead, 
    togglePinAnnouncement,
    darkMode 
  } = useApp();

  const isStaff = isStaffOrAdminMember(currentUser);

  // Filter & Search states
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyUnread, setOnlyUnread] = useState<boolean>(false);
  const [onlyPinned, setOnlyPinned] = useState<boolean>(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [expandedAnnId, setExpandedAnnId] = useState<string | null>(null);

  // Form states for Create/Edit
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formType, setFormType] = useState<AnnouncementType>('general');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsImportant, setFormIsImportant] = useState(false);
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formActiveTab, setFormActiveTab] = useState<'write' | 'preview'>('write');

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingAnnouncement(null);
    setFormTitle('');
    setFormMessage('');
    setFormType('general');
    setFormImageUrl('');
    setFormIsImportant(false);
    setFormIsPinned(false);
    setFormError('');
    setFormSuccess('');
    setFormActiveTab('write');
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (ann: AnnouncementItem) => {
    setEditingAnnouncement(ann);
    setFormTitle(ann.title);
    setFormMessage(ann.message);
    setFormType(ann.type);
    setFormImageUrl(ann.imageUrl || '');
    setFormIsImportant(Boolean(ann.isImportant));
    setFormIsPinned(Boolean(ann.isPinned));
    setFormError('');
    setFormSuccess('');
    setFormActiveTab('write');
    setIsCreateModalOpen(true);
  };

  // Submit Create or Edit
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formTitle.trim()) {
      setFormError('দয়া করে অ্যানাউন্সমেন্টের শিরোনাম প্রদান করুন।');
      return;
    }
    if (!formMessage.trim()) {
      setFormError('দয়া করে বিস্তারিত বার্তা লিখুন।');
      return;
    }

    if (editingAnnouncement) {
      const res = updateAnnouncement(editingAnnouncement.id, {
        title: formTitle.trim(),
        message: formMessage.trim(),
        type: formType,
        imageUrl: formImageUrl.trim() || undefined,
        isImportant: formIsImportant,
        isPinned: formIsPinned
      });
      if (res.success) {
        setFormSuccess('সফলভাবে আপডেট করা হয়েছে!');
        setTimeout(() => setIsCreateModalOpen(false), 800);
      } else {
        setFormError(res.message);
      }
    } else {
      const res = createAnnouncement({
        title: formTitle.trim(),
        message: formMessage.trim(),
        type: formType,
        imageUrl: formImageUrl.trim() || undefined,
        isImportant: formIsImportant,
        isPinned: formIsPinned
      });
      if (res.success) {
        setFormSuccess('নতুন অ্যানাউন্সমেন্ট সফলভাবে প্রকাশিত হয়েছে!');
        setTimeout(() => setIsCreateModalOpen(false), 800);
      } else {
        setFormError(res.message);
      }
    }
  };

  // Mark all unread announcements as read
  const handleMarkAllRead = () => {
    if (!currentUser) return;
    announcements.forEach(ann => {
      if (!ann.readBy?.includes(currentUser.id)) {
        markAnnouncementAsRead(ann.id, currentUser.id);
      }
    });
  };

  // Handle Card Click (Auto mark read & expand)
  const handleToggleCard = (ann: AnnouncementItem) => {
    if (currentUser && !ann.readBy?.includes(currentUser.id)) {
      markAnnouncementAsRead(ann.id, currentUser.id);
    }
    setExpandedAnnId(prev => prev === ann.id ? null : ann.id);
  };

  // Helper Badge Styling
  const getTypeBadge = (type: AnnouncementType) => {
    switch (type) {
      case 'fastest_supporters':
        return {
          label: 'Fastest Supporters',
          bn: 'টপ সাপোর্টার্স',
          icon: Trophy,
          badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        };
      case 'important':
        return {
          label: 'Important',
          bn: 'জরুরি নোটিশ',
          icon: AlertCircle,
          badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
        };
      case 'update':
        return {
          label: 'System Update',
          bn: 'সিস্টেম আপডেট',
          icon: Sparkles,
          badgeClass: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
        };
      case 'warning':
        return {
          label: 'Warning',
          bn: 'সতর্কবার্তা',
          icon: AlertTriangle,
          badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30'
        };
      case 'event':
        return {
          label: 'Community Event',
          bn: 'ইভেন্ট',
          icon: Calendar,
          badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
        };
      default:
        return {
          label: 'General Notice',
          bn: 'সাধারণ নোটিশ',
          icon: Megaphone,
          badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        };
    }
  };

  // Unread Count
  const unreadCount = useMemo(() => {
    if (!currentUser) return 0;
    return announcements.filter(a => !a.readBy?.includes(currentUser.id)).length;
  }, [announcements, currentUser]);

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter(ann => {
      // Type filter
      if (activeTypeFilter !== 'all' && ann.type !== activeTypeFilter) {
        return false;
      }
      // Pinned filter
      if (onlyPinned && !ann.isPinned) {
        return false;
      }
      // Unread filter
      if (onlyUnread && currentUser && ann.readBy?.includes(currentUser.id)) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ann.title.toLowerCase().includes(q);
        const matchesMsg = ann.message.toLowerCase().includes(q);
        const matchesAuthor = ann.issuedBy.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg && !matchesAuthor) return false;
      }
      return true;
    }).sort((a, b) => {
      // Pinned always on top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [announcements, activeTypeFilter, onlyPinned, onlyUnread, searchQuery, currentUser]);

  // Featured Pinned Announcement (Top 1 pinned)
  const topPinnedAnnouncement = useMemo(() => {
    return announcements.find(a => a.isPinned);
  }, [announcements]);

  return (
    <div id="announcement-section" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 border border-indigo-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                Live Notice Board
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-sm shadow-rose-500/40">
                  {unreadCount} নতুন
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Megaphone className="w-7 h-7 text-indigo-400 shrink-0" />
              অফিশিয়াল অ্যানাউন্সমেন্ট ও নোটিশ
            </h1>
            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
              সাপোর্ট লিংক বক্সের সার্বিক নিয়মাবলী, গুরুত্বপূর্ণ আপডেট, এবং শীর্ষ ৫ জন দ্রুততম সাপোর্টারদের ঘোষণা।
            </p>
          </div>

          <div className="flex items-center gap-2 sm:self-center shrink-0">
            {unreadCount > 0 && (
              <button
                id="btn-mark-all-read"
                onClick={handleMarkAllRead}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1E1E24] hover:bg-[#282830] text-gray-300 hover:text-white border border-[#2E2E38] transition-all flex items-center gap-1.5"
                title="সকল অ্যানাউন্সমেন্ট পঠিত হিসেবে চিহ্নিত করুন"
              >
                <CheckCheck className="w-4 h-4 text-emerald-400" />
                <span>সব পঠিত করুন</span>
              </button>
            )}

            {isStaff && (
              <button
                id="btn-create-announcement"
                onClick={handleOpenCreateModal}
                className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন অ্যানাউন্সমেন্ট</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Featured Pinned Announcement Spotlight (if any) */}
      {topPinnedAnnouncement && (
        <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/30 p-4 sm:p-5 relative overflow-hidden backdrop-blur-md shadow-md">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Pin className="w-5 h-5 fill-current" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  📌 পিন করা বিশেষ নোটিশ
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  {topPinnedAnnouncement.timeBst}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {topPinnedAnnouncement.title}
              </h3>
              <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed whitespace-pre-line">
                {topPinnedAnnouncement.message}
              </p>
            </div>
            <button
              onClick={() => handleToggleCard(topPinnedAnnouncement)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold transition-colors shrink-0"
            >
              বিস্তারিত দেখুন
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#131316] border border-[#222228] p-3 rounded-xl">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              activeTypeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1E1E24]'
            }`}
          >
            সব ({announcements.length})
          </button>
          <button
            onClick={() => setActiveTypeFilter('fastest_supporters')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTypeFilter === 'fastest_supporters'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-amber-400 hover:bg-[#1E1E24]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            টপ সাপোর্টার্স
          </button>
          <button
            onClick={() => setActiveTypeFilter('important')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTypeFilter === 'important'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-rose-400 hover:bg-[#1E1E24]'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            জরুরি
          </button>
          <button
            onClick={() => setActiveTypeFilter('update')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTypeFilter === 'update'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-indigo-400 hover:bg-[#1E1E24]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            আপডেট
          </button>
          <button
            onClick={() => setActiveTypeFilter('general')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
              activeTypeFilter === 'general'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-emerald-400 hover:bg-[#1E1E24]'
            }`}
          >
            সাধারণ
          </button>
        </div>

        {/* Search & Quick Toggles */}
        <div className="flex items-center gap-2">
          {currentUser && (
            <button
              onClick={() => setOnlyUnread(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shrink-0 ${
                onlyUnread
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-gray-400 hover:text-white bg-[#1A1A20]'
              }`}
            >
              <span>অপঠিত</span>
              {unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
            </button>
          )}

          <button
            onClick={() => setOnlyPinned(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shrink-0 ${
              onlyPinned
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-gray-400 hover:text-white bg-[#1A1A20]'
            }`}
          >
            <Pin className="w-3 h-3" />
            <span>পিন করা</span>
          </button>

          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="খুঁজুন..."
              className="w-full bg-[#1A1A20] text-gray-200 placeholder-gray-500 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-[#282830] focus:outline-none focus:border-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Announcements Feed List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-[#121215] border border-[#202026]">
            <Megaphone className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-semibold text-gray-300">কোনো অ্যানাউন্সমেন্ট পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              আপনার ফিল্টার অনুযায়ী কোনো বার্তা মেলেনি। অন্য ফিল্টার বেছে নিন বা নতুন নোটিশের জন্য অপেক্ষা করুন।
            </p>
          </div>
        ) : (
          filteredAnnouncements.map(ann => {
            const typeInfo = getTypeBadge(ann.type);
            const IconComp = typeInfo.icon;
            const isRead = currentUser ? ann.readBy?.includes(currentUser.id) : true;
            const isExpanded = expandedAnnId === ann.id;

            return (
              <article
                key={ann.id}
                id={`announcement-${ann.id}`}
                className={`relative rounded-xl border transition-all duration-200 overflow-hidden ${
                  ann.isPinned
                    ? 'bg-[#15151B] border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : isRead
                    ? 'bg-[#121216] border-[#222228] hover:border-[#32323C]'
                    : 'bg-[#14141C] border-indigo-500/40 shadow-md shadow-indigo-500/5'
                }`}
              >
                {/* Unread Top Highlight Stripe */}
                {!isRead && (
                  <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                )}

                <div className="p-5 sm:p-6 space-y-3.5">
                  
                  {/* Top Bar: Issuer Info + Time + Badges + Admin Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        {ann.issuedByAvatar ? (
                          <img
                            src={ann.issuedByAvatar}
                            alt={ann.issuedBy}
                            className="w-10 h-10 rounded-full object-cover border border-[#2E2E38]"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-white font-bold text-sm">
                            {ann.issuedBy.charAt(0)}
                          </div>
                        )}
                        {ann.isPinned && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-black">
                            <Pin className="w-2.5 h-2.5 fill-current" />
                          </div>
                        )}
                      </div>

                      {/* Name & Role */}
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-white tracking-tight">
                            {ann.issuedBy}
                          </span>
                          <span className={`px-1.5 py-0.2 text-[10px] font-semibold rounded ${
                            ann.issuedByRole === 'Developer'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : ann.issuedByRole === 'Super Admin'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : ann.issuedByRole === 'System'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          }`}>
                            {ann.issuedByRole}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-500" />
                            {ann.timeBst}
                          </span>
                          <span>•</span>
                          <span>{ann.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Badges & Admin Controls */}
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${typeInfo.badgeClass}`}>
                        <IconComp className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{typeInfo.bn}</span>
                      </span>

                      {!isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" title="অপঠিত নোটিশ" />
                      )}

                      {/* Admin Tools */}
                      {isStaff && (
                        <div className="flex items-center gap-1 border-l border-[#282832] pl-2 ml-1">
                          <button
                            onClick={() => togglePinAnnouncement(ann.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              ann.isPinned
                                ? 'text-amber-400 hover:bg-amber-500/20 bg-amber-500/10'
                                : 'text-gray-400 hover:text-white hover:bg-[#202028]'
                            }`}
                            title={ann.isPinned ? 'পিন সরান' : 'পিন করুন'}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(ann)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#202028] transition-colors"
                            title="এডিট করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('আপনি কি এই অ্যানাউন্সমেন্টটি মুছে ফেলতে চান?')) {
                                deleteAnnouncement(ann.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    {ann.title}
                  </h2>

                  {/* Message Content */}
                  <div className={`text-sm text-gray-300 leading-relaxed whitespace-pre-line ${
                    isExpanded ? '' : 'line-clamp-3'
                  }`}>
                    {ann.message}
                  </div>

                  {/* Optional Attached Image */}
                  {ann.imageUrl && (
                    <div className="pt-2">
                      <img
                        src={ann.imageUrl}
                        alt="Announcement Attachment"
                        className="max-h-80 w-auto rounded-xl border border-[#2E2E38] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => setPreviewImageUrl(ann.imageUrl || null)}
                      />
                    </div>
                  )}

                  {/* Footer Bar: Read Status + Expand Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1F1F26] text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                      {isRead ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>পঠিত</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => currentUser && markAnnouncementAsRead(ann.id, currentUser.id)}
                          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>পঠিত হিসেবে চিহ্নিত করুন</span>
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleCard(ann)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                    >
                      {isExpanded ? 'সংক্ষিপ্ত করুন ▲' : 'সম্পূর্ণ পড়ুন ▼'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Admin Create / Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-[#141418] border border-[#2A2A32] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#22222A] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingAnnouncement ? 'অ্যানাউন্সমেন্ট সম্পাদনা করুন' : 'নতুন অ্যানাউন্সমেন্ট তৈরি করুন'}
                  </h3>
                  <p className="text-xs text-gray-400">মেম্বারদের জন্য গুরুত্বপূর্ণ বার্তা বা নোটিশ প্রকাশ করুন</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#202028] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs (Write / Preview) */}
            <div className="px-6 pt-3 flex items-center gap-2 border-b border-[#1E1E26] text-xs">
              <button
                onClick={() => setFormActiveTab('write')}
                className={`pb-2 px-1 font-semibold border-b-2 transition-colors ${
                  formActiveTab === 'write'
                    ? 'text-indigo-400 border-indigo-500'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                বার্তা লিখুন
              </button>
              <button
                onClick={() => setFormActiveTab('preview')}
                className={`pb-2 px-1 font-semibold border-b-2 transition-colors ${
                  formActiveTab === 'preview'
                    ? 'text-indigo-400 border-indigo-500'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                লাইভ প্রিভিউ
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveAnnouncement} className="p-6 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {formActiveTab === 'write' ? (
                <>
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      অ্যানাউন্সমেন্ট শিরোনাম <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={e => setFormTitle(e.target.value)}
                      placeholder="যেমন: আজকের সাপোর্ট রুলস সংক্রান্ত জরুরি নোটিশ"
                      className="w-full bg-[#1A1A22] text-white text-sm rounded-xl px-3.5 py-2.5 border border-[#2E2E3A] focus:outline-none focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>

                  {/* Type Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'general', label: 'সাধারণ নোটিশ', icon: Megaphone },
                      { id: 'fastest_supporters', label: 'টপ সাপোর্টার্স', icon: Trophy },
                      { id: 'important', label: 'জরুরি নোটিশ', icon: AlertCircle },
                      { id: 'update', label: 'সিস্টেম আপডেট', icon: Sparkles },
                      { id: 'warning', label: 'সতর্কবার্তা', icon: AlertTriangle },
                      { id: 'event', label: 'কমিউনিটি ইভেন্ট', icon: Calendar }
                    ].map(t => {
                      const Icon = t.icon;
                      const isSelected = formType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFormType(t.id as AnnouncementType)}
                          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                              : 'bg-[#181820] border-[#2A2A34] text-gray-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Message Content */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      বিস্তারিত বার্তা <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      value={formMessage}
                      onChange={e => setFormMessage(e.target.value)}
                      rows={5}
                      placeholder="বিস্তারিত তথ্য লিখুন... (নতুন লাইন ও বুলেট পয়েন্ট গ্রহণযোগ্য)"
                      className="w-full bg-[#1A1A22] text-white text-sm rounded-xl p-3 border border-[#2E2E3A] focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
                      required
                    />
                  </div>

                  {/* Optional Image URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>সংযুক্ত ছবির লিংক (ঐচ্ছিক)</span>
                    </label>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={e => setFormImageUrl(e.target.value)}
                      placeholder="https://example.com/banner.png"
                      className="w-full bg-[#1A1A22] text-white text-xs rounded-xl px-3 py-2 border border-[#2E2E3A] focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Checkboxes: Pin & Important */}
                  <div className="flex flex-wrap items-center gap-6 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-300">
                      <input
                        type="checkbox"
                        checked={formIsPinned}
                        onChange={e => setFormIsPinned(e.target.checked)}
                        className="rounded bg-[#1E1E28] border-gray-600 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      <span className="flex items-center gap-1">
                        <Pin className="w-3.5 h-3.5 text-amber-400" />
                        নোটিশ বোর্ডের শীর্ষে পিন করে রাখুন
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-300">
                      <input
                        type="checkbox"
                        checked={formIsImportant}
                        onChange={e => setFormIsImportant(e.target.checked)}
                        className="rounded bg-[#1E1E28] border-gray-600 text-rose-600 focus:ring-rose-500 w-4 h-4"
                      />
                      <span className="flex items-center gap-1 text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5" />
                        জরুরি নোটিশ হিসেবে মার্ক করুন
                      </span>
                    </label>
                  </div>
                </>
              ) : (
                /* Live Preview Tab */
                <div className="p-4 rounded-xl bg-[#181820] border border-[#2E2E3A] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {formType}
                    </span>
                    {formIsPinned && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white">
                    {formTitle || 'শিরোনাম এখানে প্রদর্শিত হবে'}
                  </h4>
                  <div className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">
                    {formMessage || 'বিস্তারিত বার্তা এখানে প্রদর্শিত হবে...'}
                  </div>
                  {formImageUrl && (
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="max-h-48 rounded-lg border border-[#2E2E3A] object-cover"
                    />
                  )}
                </div>
              )}

              {/* Form Buttons */}
              <div className="pt-3 border-t border-[#22222A] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#202028] transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingAnnouncement ? 'পরিবর্তন সংরক্ষণ করুন' : 'এখনই প্রকাশ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {previewImageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageUrl}
              alt="Expanded Announcement"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

    </div>
  );
};
