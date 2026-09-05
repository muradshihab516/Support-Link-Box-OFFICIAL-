import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ExternalLink, 
  Zap, 
  Edit3, 
  AlertTriangle,
  Image as ImageIcon,
  Video,
  Info,
  User,
  Plus
} from 'lucide-react';
import { ScheduledLink, PostContentType } from '../../types';

interface ScheduledLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenScheduleNew?: () => void;
}

export const ScheduledLinksModal: React.FC<ScheduledLinksModalProps> = ({
  isOpen,
  onClose,
  onOpenScheduleNew
}) => {
  const { 
    currentUser, 
    scheduledLinks, 
    cancelScheduledLink, 
    forceSubmitScheduledLink, 
    deleteScheduledLink,
    editScheduledLink
  } = useApp();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'moderator';

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'submitted' | 'cancelled'>('all');
  
  // Editing state
  const [editingItem, setEditingItem] = useState<ScheduledLink | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editType, setEditType] = useState<PostContentType>('photo');
  const [editCaption, setEditCaption] = useState('');
  const [editInstruction, setEditInstruction] = useState('');
  const [editError, setEditError] = useState('');

  // Action feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  // Filter links: non-admin sees only own links, admin sees all
  const visibleLinks = scheduledLinks.filter(item => {
    if (!isAdmin && item.memberId !== currentUser?.id) return false;
    if (statusFilter === 'all') return true;
    return item.status === statusFilter;
  });

  const handleStartEdit = (item: ScheduledLink) => {
    setEditingItem(item);
    setEditUrl(item.postUrl);
    setEditDate(item.scheduledForDate);
    setEditTime(item.scheduledForTime);
    setEditType(item.postType || 'photo');
    setEditCaption(item.caption || '');
    setEditInstruction(item.instruction || '');
    setEditError('');
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    if (!editUrl.trim()) {
      setEditError('ফেসবুক লিংক দেওয়া আবশ্যক');
      return;
    }
    const res = editScheduledLink(editingItem.id, {
      postUrl: editUrl.trim(),
      scheduledForDate: editDate,
      scheduledForTime: editTime,
      postType: editType,
      caption: editCaption,
      instruction: editInstruction
    });
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setEditingItem(null);
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setEditError(res.message);
    }
  };

  const handleCancel = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই শিডিউল লিংকটি বাতিল করতে চান?')) {
      const res = cancelScheduledLink(id);
      setFeedback({ type: res.success ? 'success' : 'error', message: res.message });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleForceRelease = (id: string) => {
    if (window.confirm('অ্যাডমিন অ্যাকশন: আপনি কি এখনই এই শিডিউল লিংকটি দৈনিক লিংকে রিলিজ করতে চান? এর ফলে এখনই একটি সিরিয়াল নাম্বার বরাদ্দ হবে।')) {
      const res = forceSubmitScheduledLink(id);
      setFeedback({ type: res.success ? 'success' : 'error', message: res.message });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('এই শিডিউল রেকর্ডটি সম্পূর্ণরূপে ডিলিট করতে চান?')) {
      const res = deleteScheduledLink(id);
      setFeedback({ type: res.success ? 'success' : 'error', message: res.message });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const getRemainingTimeText = (timestamp: number, status: string) => {
    if (status === 'submitted') return '✅ সাবমিট সম্পন্ন';
    if (status === 'cancelled') return '❌ বাতিল করা হয়েছে';
    if (status === 'failed') return '⚠️ ব্যর্থ হয়েছে';

    const now = Date.now();
    const diff = timestamp - now;
    if (diff <= 0) return '⏳ এখন প্রসেসিং হচ্ছে...';

    const totalMinutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `⏳ আর ${days} দিন ${hours % 24} ঘণ্টা বাকি`;
    }
    if (hours > 0) {
      return `⏳ আর ${hours} ঘণ্টা ${mins} মিনিট বাকি`;
    }
    return `⏳ আর ${mins} মিনিট বাকি`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-[#111114] border border-[#24242A] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#24242A] flex items-center justify-between bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>শিডিউল লিংক বুকিং তালিকা</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {visibleLinks.length} টি
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                {isAdmin ? 'সকল মেম্বারের শিডিউল লিংক নিয়ন্ত্রণ ও মনিটরিং' : 'আপনার আগে থেকে বুক করা শিডিউল লিংকসমূহের স্ট্যাটাস'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenScheduleNew && (
              <button
                onClick={() => {
                  onClose();
                  onOpenScheduleNew();
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">নতুন শিডিউল</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informative Reassurance Banner */}
        <div className="px-4 py-2.5 bg-indigo-950/30 border-b border-indigo-900/30 flex items-start gap-2.5 text-xs text-indigo-300">
          <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            <strong>সার্ভার-সাইড শিডিউলার:</strong> নির্দিষ্ট সময়ে আপনার ডিভাইস অন না থাকলেও ব্যাকএন্ড স্বয়ংক্রিয়ভাবে লিংকটি সাবমিট করবে। রিলিজের মুহূর্তে যে সিরিয়াল নম্বর পাওয়া যাবে সেটিই বরাদ্দ হবে।
          </span>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mx-4 mt-3 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="px-4 pt-3 pb-2 flex items-center gap-2 overflow-x-auto border-b border-[#1E1E24]">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'all' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            সকল ({scheduledLinks.filter(l => isAdmin || l.memberId === currentUser?.id).length})
          </button>
          <button
            onClick={() => setStatusFilter('scheduled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'scheduled' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            অপেক্ষমান ({scheduledLinks.filter(l => (isAdmin || l.memberId === currentUser?.id) && l.status === 'scheduled').length})
          </button>
          <button
            onClick={() => setStatusFilter('submitted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'submitted' 
                ? 'bg-green-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            লাইভ হয়েছে ({scheduledLinks.filter(l => (isAdmin || l.memberId === currentUser?.id) && l.status === 'submitted').length})
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'cancelled' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            বাতিল ({scheduledLinks.filter(l => (isAdmin || l.memberId === currentUser?.id) && l.status === 'cancelled').length})
          </button>
        </div>

        {/* List Content */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {visibleLinks.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30 text-indigo-400" />
              <p className="text-sm font-semibold text-gray-400">কোনো শিডিউল লিংক পাওয়া যায়নি</p>
              <p className="text-xs text-gray-500 mt-1">
                ভবিষ্যতের জন্য লিংক বুক করতে "নতুন শিডিউল" বাটনে ক্লিক করুন।
              </p>
            </div>
          ) : (
            visibleLinks.map(item => {
              const isOwner = currentUser?.id === item.memberId;
              const canModify = (isAdmin || isOwner) && item.status === 'scheduled';
              const remaining = getRemainingTimeText(item.scheduledForTimestamp, item.status);

              return (
                <div 
                  key={item.id}
                  className="p-4 rounded-xl bg-[#141418] border border-[#222228] hover:border-[#2C2C35] transition-all space-y-3"
                >
                  {/* Top row: Member + Status Badge */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.memberAvatar}
                        alt={item.memberName}
                        className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover"
                      />
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                          <span>{item.memberName}</span>
                          <span className="text-[11px] text-gray-400 font-normal">(@{item.memberUsername})</span>
                          {item.isScheduledByAdmin && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                              Admin Proxy
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2">
                          <span>📅 {item.scheduledForDate}</span>
                          <span>•</span>
                          <span>⏰ {item.scheduledForTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'scheduled' && (
                        <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-lg flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>{remaining}</span>
                        </span>
                      )}
                      {item.status === 'submitted' && (
                        <span className="px-2.5 py-1 bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-bold rounded-lg flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>লিংক #{item.assignedLinkNumber || 'Live'} হিসেবে প্রকাশিত</span>
                        </span>
                      )}
                      {item.status === 'cancelled' && (
                        <span className="px-2.5 py-1 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-lg flex items-center gap-1.5" title={item.cancellationReason}>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>বাতিল: {item.cancellationReason || 'Admin Action'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle row: Post URL & Details */}
                  <div className="p-2.5 rounded-lg bg-[#0C0C0E] border border-[#1C1C22] text-xs space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={item.postUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 hover:underline truncate font-mono text-[11px] flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.postUrl}</span>
                      </a>
                      <span className="px-2 py-0.5 rounded-sm bg-white/5 text-gray-300 text-[10px] uppercase font-bold shrink-0">
                        {item.postType || 'photo'}
                      </span>
                    </div>

                    {item.caption && (
                      <p className="text-gray-300 italic text-[11px] truncate">
                        "{item.caption}"
                      </p>
                    )}
                    {item.instruction && (
                      <p className="text-gray-400 text-[11px]">
                        নির্দেশনা: <span className="text-gray-200">{item.instruction}</span>
                      </p>
                    )}
                  </div>

                  {/* Bottom row: Action Buttons */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[10px] text-gray-500">
                      বুকিং সময়: {item.createdAt}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Admin Force Release */}
                      {isAdmin && item.status === 'scheduled' && (
                        <button
                          onClick={() => handleForceRelease(item.id)}
                          className="px-2.5 py-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                          title="নির্ধারিত সময়ের আগেই এখনই লাইভ করুন"
                        >
                          <Zap className="w-3 h-3 fill-white" />
                          <span>⚡ এখনই রিলিজ</span>
                        </button>
                      )}

                      {/* Edit Button (available while scheduled) */}
                      {canModify && (
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="px-2.5 py-1 bg-[#1F1F26] hover:bg-[#2A2A33] border border-[#2E2E38] text-gray-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Edit3 className="w-3 h-3 text-indigo-400" />
                          <span>এডিট</span>
                        </button>
                      )}

                      {/* Cancel Button */}
                      {canModify && (
                        <button
                          onClick={() => handleCancel(item.id)}
                          className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 hover:text-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          <span>বাতিল</span>
                        </button>
                      )}

                      {/* Admin Delete */}
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                          title="রেকর্ড ডিলিট করুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-[#24242A] bg-[#0E0E11] flex items-center justify-between text-xs text-gray-400">
          <span>
            মোট {visibleLinks.length} টি শিডিউল রেকর্ড
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1F1F26] hover:bg-[#2A2A33] text-gray-200 hover:text-white rounded-lg font-semibold transition-colors"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>

      {/* Embedded Edit Sub-Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#141418] border border-[#2E2E38] rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#24242A] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>শিডিউল লিংক তথ্য পরিবর্তন</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
                {editError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">ফেসবুক পোস্টের লিংক</label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={e => setEditUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0C0C0E] border border-[#222228] rounded-lg text-white font-mono text-xs focus:outline-hidden focus:border-indigo-500"
                  placeholder="https://www.facebook.com/..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">তারিখ</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0C0C0E] border border-[#222228] rounded-lg text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-semibold mb-1">সময় (১২:০০ PM - ০৪:৫০ PM)</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={e => setEditTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0C0C0E] border border-[#222228] rounded-lg text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                ⚠️ মনে রাখবেন: সকাল ১০:০০ থেকে ১১:৫৯ সরাসরি সাবমিশন পিক আওয়ার হওয়ায় দুপুর ১২:০০ এর আগে শিডিউল বুকিং করা যায় না।
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">ক্যাপশন (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={e => setEditCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0C0C0E] border border-[#222228] rounded-lg text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  placeholder="পোস্টের ক্যাপশন..."
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">সাপোর্ট নির্দেশনা (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={editInstruction}
                  onChange={e => setEditInstruction(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0C0C0E] border border-[#222228] rounded-lg text-white text-xs focus:outline-hidden focus:border-indigo-500"
                  placeholder="উদাঃ Love react + 1 Comment"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#24242A]">
              <button
                onClick={() => setEditingItem(null)}
                className="px-3 py-1.5 bg-[#1F1F26] text-gray-300 hover:text-white rounded-lg text-xs font-semibold"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                আপডেট সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
