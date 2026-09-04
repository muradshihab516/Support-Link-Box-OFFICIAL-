import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Report, ReportStatus, ReportReply } from '../../types';
import { 
  X, 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  Shield, 
  UserCheck, 
  CornerDownRight,
  Sparkles,
  Info,
  Check,
  RotateCcw
} from 'lucide-react';
import { cleanAndFormatFacebookUrl } from '../../utils/facebookLinks';

interface ReportConversationModalProps {
  reportId: string | null;
  onClose: () => void;
}

export const ReportConversationModal: React.FC<ReportConversationModalProps> = ({
  reportId,
  onClose
}) => {
  const { 
    reports, 
    dailyLinks, 
    members, 
    currentUser, 
    addReportReply, 
    updateReportStatus, 
    markReportRead 
  } = useApp();

  const [message, setMessage] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showAdminStatusControls, setShowAdminStatusControls] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const report = reports.find(r => r.id === reportId) || null;

  // Mark as read when opened
  useEffect(() => {
    if (report && currentUser) {
      markReportRead(report.id);
    }
  }, [report?.id, currentUser?.id]);

  // Auto scroll to bottom
  useEffect(() => {
    if (report) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [report?.replies?.length]);

  if (!report) return null;

  // Check matched link
  const matchedLink = report.targetLinkId 
    ? dailyLinks.find(l => l.id === report.targetLinkId) 
    : dailyLinks.find(l => l.memberId === report.targetMemberId);
  const linkNumber = report.targetLinkNumber || matchedLink?.linkNumber;
  const postUrl = matchedLink?.postUrl;

  // Check roles
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'moderator';
  const isLinkOwner = currentUser?.id === report.targetMemberId;
  const isReporter = currentUser?.id === report.reporterId;
  const hasAccess = isAdmin || isLinkOwner || isReporter;

  // Status badges
  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'in_discussion':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            আলোচনা চলছে (In Discussion)
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            সমাধান হয়েছে (Resolved)
          </span>
        );
      case 'dismissed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <X className="w-3.5 h-3.5" />
            বাতিল / ডিসমিস
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            পেন্ডিং (Pending)
          </span>
        );
    }
  };

  // Quick reply options based on role
  const quickReplies = isLinkOwner ? [
    'আমি এখনই কমেন্ট চালু করে দিচ্ছি ✅',
    'লিংকটি ঠিক করা হয়েছে, দয়া করে আবার চেক করুন 🔄',
    'পোস্টটি এখন Public করা হয়েছে 👍',
    'জানানোর জন্য ধন্যবাদ, সমাধান করেছি 🙏'
  ] : isReporter ? [
    'এখন চেক করেছি, ঠিক হয়েছে 👍',
    'এখনও সমস্যা হচ্ছে, কাজ করছে না ⚠️',
    'ধন্যবাদ সমাধানের জন্য!'
  ] : [
    'লিংকটি দ্রুত আপডেট করার অনুরোধ করা হলো ⏳',
    'সমস্যা সমাধান সম্পন্ন হলে এখানে কনফার্ম করুন।',
    'এডমিন টিম কর্তৃক বিষয়টি পর্যালোচনা করা হয়েছে।'
  ];

  // Handle image upload from device
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('ছবির আকার সর্বোচ্চ ৪ মেগাবাইট হতে পারবে।');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
      alert('ছবি আপলোড করতে সমস্যা হয়েছে।');
    };
    reader.readAsDataURL(file);
  };

  // Handle Send Reply
  const handleSendReply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() && !screenshotUrl) return;

    const res = addReportReply(report.id, message.trim(), screenshotUrl || undefined);
    if (res.success) {
      setMessage('');
      setScreenshotUrl(null);
      setSendSuccessMsg('✓ বার্তা পাঠানো হয়েছে!');
      setTimeout(() => setSendSuccessMsg(null), 2500);
    } else {
      alert(res.message);
    }
  };

  // Handle Quick Reply Click
  const handleSelectQuickReply = (text: string) => {
    setMessage(text);
  };

  // Mark as Resolved by Owner or Admin
  const handleMarkResolved = () => {
    updateReportStatus(report.id, 'resolved', 'সদস্য/এডমিন কর্তৃক সমস্যা সমাধান করা হয়েছে।');
    addReportReply(report.id, '✅ সমস্যা সমাধান করা হয়েছে (Marked as Resolved)।');
  };

  // Reopen Report
  const handleReopen = () => {
    updateReportStatus(report.id, 'in_discussion', 'রিপোর্ট পুনরায় ওপেন করা হয়েছে।');
    addReportReply(report.id, '🔄 সমস্যা এখনও বিদ্যমান থাকায় রিপোর্ট রি-ওপেন করা হলো।');
  };

  return (
    <div 
      id="report_conversation_backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="report_conversation_modal"
        className="relative w-full max-w-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-[#16161C] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  সমস্যা রিপোর্ট ও আলোচনা
                </h3>
                {linkNumber && (
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    লিংক #{linkNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                রিপোর্টার, লিংক দাতা এবং এডমিনদের জন্য প্রাইভেট থ্রেড
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {getStatusBadge(report.status)}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Permission warning if user has no right */}
          {!hasAccess ? (
            <div className="p-6 text-center bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <Shield className="w-8 h-8 mx-auto mb-2 text-rose-500" />
              <h4 className="font-bold text-sm">প্রাইভেসি সীমাবদ্ধতা</h4>
              <p className="text-xs mt-1">
                এই রিপোর্টটি ব্যক্তিগত। শুধুমাত্র সংশ্লিষ্ট লিংক দাতা, রিপোর্টার এবং এডমিনরা এই আলোচনা দেখতে ও অংশ নিতে পারবেন।
              </p>
            </div>
          ) : (
            <>
              {/* Report Summary Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">অভিযোগকারী:</span>
                    <span className="text-rose-500 font-bold">{report.reporterName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">লিংক দাতা:</span>
                    <span className="text-indigo-400 font-bold">{report.targetMemberName || 'সদস্য'}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{report.createdAt}</div>
                </div>

                {/* Problem chips / reasons */}
                {report.reasons && report.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {report.reasons.map((reason, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {reason}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                {report.description && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-black/20 p-2.5 rounded-lg border border-slate-200 dark:border-white/5 leading-relaxed">
                    {report.description}
                  </p>
                )}

                {/* Attached Screenshot from original report */}
                {report.screenshotUrl && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                      সংযুক্ত স্ক্রিনশট:
                    </span>
                    <button
                      onClick={() => setLightboxImage(report.screenshotUrl!)}
                      className="group relative rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 max-h-36 block"
                    >
                      <img
                        src={report.screenshotUrl}
                        alt="Report attachment"
                        className="w-full max-h-36 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                        বড় করে দেখুন
                      </div>
                    </button>
                  </div>
                )}

                {/* Direct Post Link Check Button */}
                {postUrl && (
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <a
                      href={cleanAndFormatFacebookUrl(postUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 dark:text-blue-400 border border-blue-500/20 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      ফেসবুক পোস্টটি চেক করুন
                    </a>

                    {isLinkOwner && report.status !== 'resolved' && (
                      <button
                        onClick={handleMarkResolved}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        সমস্যার সমাধান করেছি
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Conversation Messages Thread */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5" />
                  আলোচনা বার্তা সমূহ ({report.replies?.length || 0})
                </div>

                {(!report.replies || report.replies.length === 0) ? (
                  <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 text-xs text-slate-400">
                    এখনও কোনো রিপ্লাই দেওয়া হয়নি। নিচের বক্সে আপনার উত্তর লিখুন।
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.replies.map((reply) => {
                      const isMe = reply.senderId === currentUser?.id;
                      const isReplyOwner = reply.senderRole === 'link_owner';
                      const isReplyAdmin = reply.senderRole === 'admin' || reply.senderRole === 'moderator';
                      const isReplyReporter = reply.senderRole === 'reporter';

                      return (
                        <div
                          key={reply.id}
                          className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {/* Avatar */}
                          <div className="shrink-0">
                            {reply.senderAvatar ? (
                              <img
                                src={reply.senderAvatar}
                                alt={reply.senderName}
                                className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-white/10"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                {reply.senderName.charAt(0)}
                              </div>
                            )}
                          </div>

                          {/* Message Body */}
                          <div className={`max-w-[82%] space-y-1 ${isMe ? 'items-end text-right' : 'items-start text-left'}`}>
                            {/* Sender Info & Role Tag */}
                            <div className={`flex items-center gap-1.5 text-[11px] ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <span className="font-bold text-slate-700 dark:text-slate-200">
                                {isMe ? 'আপনি' : reply.senderName}
                              </span>

                              {isReplyAdmin && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                  <Shield className="w-2.5 h-2.5" /> এডমিন
                                </span>
                              )}

                              {isReplyOwner && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                  👑 লিংক দাতা
                                </span>
                              )}

                              {isReplyReporter && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  🚩 রিপোর্টার
                                </span>
                              )}

                              <span className="text-slate-400 text-[10px]">{reply.createdAt}</span>
                            </div>

                            {/* Bubble */}
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                isMe
                                  ? 'bg-indigo-600 text-white rounded-tr-xs'
                                  : isReplyAdmin
                                  ? 'bg-sky-500/10 dark:bg-sky-950/40 text-slate-900 dark:text-sky-100 border border-sky-500/20 rounded-tl-xs'
                                  : isReplyOwner
                                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-slate-900 dark:text-indigo-100 border border-indigo-500/20 rounded-tl-xs'
                                  : 'bg-slate-100 dark:bg-white/[0.05] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 rounded-tl-xs'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{reply.message}</p>

                              {/* Screenshot attachment in reply */}
                              {reply.screenshotUrl && (
                                <div className="mt-2">
                                  <button
                                    onClick={() => setLightboxImage(reply.screenshotUrl!)}
                                    className="rounded-lg overflow-hidden border border-white/20 max-h-32 block hover:opacity-90"
                                  >
                                    <img
                                      src={reply.screenshotUrl}
                                      alt="Attachment"
                                      className="max-h-32 object-cover"
                                    />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Status Action Buttons for Admin or Reporter */}
              {report.status === 'resolved' ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs text-emerald-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>এই সমস্যাটি সমাধান (Resolved) হিসেবে চিহ্নিত হয়েছে।</span>
                  </div>
                  {(isAdmin || isReporter) && (
                    <button
                      onClick={handleReopen}
                      className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold transition-colors"
                    >
                      রি-ওপেন করুন
                    </button>
                  )}
                </div>
              ) : null}

              {/* Admin moderation bar */}
              {isAdmin && (
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs flex flex-wrap items-center justify-between gap-2">
                  <span className="text-gray-400 flex items-center gap-1.5 font-semibold">
                    <Shield className="w-3.5 h-3.5 text-sky-400" />
                    এডমিন কন্ট্রোল:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => updateReportStatus(report.id, 'in_discussion')}
                      className={`px-2 py-1 rounded text-[11px] font-bold ${
                        report.status === 'in_discussion' 
                          ? 'bg-sky-600 text-white' 
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      ইন ডিসকাশন
                    </button>
                    <button
                      onClick={() => updateReportStatus(report.id, 'resolved')}
                      className={`px-2 py-1 rounded text-[11px] font-bold ${
                        report.status === 'resolved' 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                      }`}
                    >
                      মার্ক রেজলভ
                    </button>
                    <button
                      onClick={() => updateReportStatus(report.id, 'dismissed')}
                      className={`px-2 py-1 rounded text-[11px] font-bold ${
                        report.status === 'dismissed' 
                          ? 'bg-slate-600 text-white' 
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      ডিসমিস
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer / Reply Input Form */}
        {hasAccess && (
          <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-[#16161C] space-y-2">
            {/* Quick Reply Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-[11px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                কুইক রিপ্লাই:
              </span>
              {quickReplies.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectQuickReply(qr)}
                  className="shrink-0 px-2.5 py-1 rounded-full text-[11px] bg-slate-200/70 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-white/5 transition-colors whitespace-nowrap"
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* Attached Screenshot Preview if any */}
            {screenshotUrl && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <img
                  src={screenshotUrl}
                  alt="Attachment preview"
                  className="w-10 h-10 object-cover rounded"
                />
                <div className="flex-1 text-xs text-indigo-300 truncate">
                  স্ক্রিনশট সংযুক্ত করা হয়েছে
                </div>
                <button
                  onClick={() => setScreenshotUrl(null)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendReply} className="flex items-end gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-2.5 text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-200/60 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition-colors shrink-0"
                title="স্ক্রিনশট বা ছবি সংযুক্ত করুন"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  placeholder={
                    isLinkOwner
                      ? 'লিংক দাতা হিসেবে রিপ্লাই লিখুন (Enter চাপুন)...'
                      : isReporter
                      ? 'রিপোর্টার হিসেবে মেসেজ লিখুন...'
                      : 'এডমিন হিসেবে দিকনির্দেশনা লিখুন...'
                  }
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0E0E12] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={!message.trim() && !screenshotUrl}
                className={`p-2.5 rounded-xl font-bold transition-all shrink-0 flex items-center justify-center ${
                  message.trim() || screenshotUrl
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                }`}
                title="পাঠান"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>

            {/* Success toast */}
            {sendSuccessMsg && (
              <p className="text-[11px] text-emerald-500 dark:text-emerald-400 text-center font-bold">
                {sendSuccessMsg}
              </p>
            )}
          </div>
        )}

        {/* Lightbox for full image viewing */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setLightboxImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={lightboxImage}
                alt="Full preview"
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-black"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
