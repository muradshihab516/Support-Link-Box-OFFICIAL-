import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  FileText, 
  HelpCircle,
  Calendar,
  Sparkles,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { checkBangladeshLateReportEligibility, getBangladeshCurrentTime12h } from '../../utils/bangladeshTime';

interface LateSupportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COMMON_REASONS = [
  'বিদ্যুৎ বিভ্রাট / লোডশেডিং (Power Outage / Load Shedding)',
  'ইন্টারনেট বা নেটওয়ার্ক সমস্যা (Internet / Wi-Fi Down)',
  'অফিস / কর্মব্যস্ততা / ভ্রমণ (Work / Office / Travel)',
  'শারীরিক অসুস্থতা / জরুরি অবস্থা (Medical / Health Issue)',
  'পরীক্ষা / পড়াশোনা (Exam / Academic Pressure)',
  'পারিবারিক জরুরি কাজ (Family Emergency)',
  'অন্যান্য যৌক্তিক কারণ (Other Urgent Reason)'
];

export const LateSupportReportModal: React.FC<LateSupportReportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { 
    currentUser, 
    settings,
    submitLateSupportReport, 
    canMemberSubmitLateReportToday,
    getMemberWeeklyLateReportsCount 
  } = useApp();

  const [selectedReason, setSelectedReason] = useState<string>(COMMON_REASONS[0]);
  const [details, setDetails] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [testBypassTime, setTestBypassTime] = useState(false);

  if (!isOpen || !currentUser) return null;

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';
  const checkResult = canMemberSubmitLateReportToday(currentUser.id);
  const weeklyCount = getMemberWeeklyLateReportsCount(currentUser.id);
  const maxWeekly = settings.maxLateReportsPerWeek || 2;
  const bdEligibility = checkBangladeshLateReportEligibility(undefined, testBypassTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedReason.trim()) {
      setErrorMsg('অনুগ্রহ করে সমস্যার ধরন নির্বাচন করুন।');
      return;
    }
    if (!details.trim() || details.trim().length < 5) {
      setErrorMsg('সমস্যার বিস্তারিত বিবরণ কমপক্ষে ৫ অক্ষরে লিখুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = submitLateSupportReport(
        selectedReason,
        details,
        screenshotUrl,
        currentUser.id,
        testBypassTime
      );

      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'রিপোর্ট জমা দিতে ব্যর্থ হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#141418] border border-[#262632] rounded-2xl shadow-2xl overflow-hidden text-white"
        id="late-support-report-modal"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#24242E] flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-indigo-950/30 to-[#141418]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                Report a Late Support
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                  Grace System
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                রাত ১২:০০ টার আগে রিপোর্ট করে Ad Punishment এড়ান
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Bangladesh Timezone Status Banner */}
          <div className="p-3 sm:p-4 rounded-xl bg-[#1A1A22] border border-[#282836] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-300 font-medium">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>বাংলাদেশ সময় (Asia/Dhaka):</span>
              </div>
              <span className="font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-gray-700/50">
                {bdEligibility.currentBdTime12h}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-800">
              <span className="text-gray-400">১২:০০ AM ডেডলাইনের বাকি:</span>
              <span className={`font-extrabold ${bdEligibility.isSubmissionAllowed ? 'text-amber-400' : 'text-rose-400'}`}>
                {bdEligibility.formattedRemainingBangla}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-800">
              <span className="text-gray-400">এই সপ্তাহের কোটা ব্যবহার:</span>
              <span className="font-bold text-indigo-300">
                {weeklyCount} / {maxWeekly} বার
              </span>
            </div>
          </div>

          {/* Core Rules Guide Card */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5 text-xs text-amber-200/90">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>দেরিতে সাপোর্টের নিয়মাবলী:</span>
            </div>
            <ul className="space-y-1 list-disc list-inside text-gray-300 text-[11px] sm:text-xs">
              <li>রাত ১২:০০ টার <strong>পূর্বেই</strong> রিপোর্ট জমা দিতে হবে (পরে দেওয়া যাবে না)।</li>
              <li>রিপোর্ট করলে রাত ১২:০০ টায় কোনো <strong>Ad punishment বা সাময়িক রিমুভ হবে না</strong>।</li>
              <li>১২:০০ টার পর থেকে <strong>২৪ ঘণ্টার মধ্যে All Done</strong> শেষ করলে কোনো Ad দেখা ছাড়াই স্বয়ংক্রিয়ভাবে লিংক সাবমিট করার সুযোগ পাবেন।</li>
              <li>২৪ ঘণ্টার বেশি পার হলে স্ট্যাটাস <strong>Approval Pending</strong> হবে এবং এডমিন অ্যাপ্রুভাল লাগবে।</li>
            </ul>
          </div>

          {/* Time Expiration Notice */}
          {!bdEligibility.isSubmissionAllowed && !testBypassTime && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong>সময় অতিক্রান্ত:</strong> রাত ১২:০০ AM এর ডেডলাইন অতিক্রম হয়ে গেছে। সিস্টেমের নিয়মানুযায়ী রাত ১২:০০ টার পূর্বেই Late Support Report করতে হয়।
              </div>
            </div>
          )}

          {/* Weekly Limit Reached Notice */}
          {weeklyCount >= maxWeekly && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong>সাপ্তাহিক সীমা পূর্ণ:</strong> আপনি এই সপ্তাহে ইতিমধ্যে {weeklyCount} বার Late Support সুবিধা নিয়েছেন। সপ্তাহে সর্বোচ্চ {maxWeekly} বার অনুমতি দেওয়া হয়।
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Reason Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span>সমস্যার ধরন (Reason) *</span>
                <span className="text-[11px] text-gray-500">নির্বাচন করুন</span>
              </label>
              <select
                value={selectedReason}
                onChange={e => setSelectedReason(e.target.value)}
                className="w-full px-3 py-2 bg-[#1A1A22] border border-[#2E2E3C] focus:border-amber-500/60 rounded-xl text-xs sm:text-sm text-white focus:outline-none transition-colors"
                disabled={!bdEligibility.isSubmissionAllowed && !testBypassTime}
              >
                {COMMON_REASONS.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Detailed Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span>সমস্যার বিবরণ (Details) *</span>
                <span className="text-[11px] text-gray-500">কমপক্ষে ৫ অক্ষর</span>
              </label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="আপনার সমস্যার কথা সংক্ষেপে ও স্পষ্টভাবে লিখুন (যেমন: হঠাৎ এলাকা জুড়ে লোডশেডিং বা হাসপাতালে অবস্থান করায় ১২টার আগে সব সাপোর্ট করা সম্ভব হয়নি...)"
                rows={3}
                className="w-full px-3 py-2 bg-[#1A1A22] border border-[#2E2E3C] focus:border-amber-500/60 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors resize-none"
                disabled={!bdEligibility.isSubmissionAllowed && !testBypassTime}
              />
            </div>

            {/* Optional Proof / Screenshot URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-gray-400" />
                  <span>স্ক্রিনশট / প্রমাণ লিংক (ঐচ্ছিক)</span>
                </span>
                <span className="text-[11px] text-gray-500">Optional</span>
              </label>
              <input
                type="url"
                value={screenshotUrl}
                onChange={e => setScreenshotUrl(e.target.value)}
                placeholder="https://i.ibb.co/... বা গুগল ড্রাইভ ইমেজ লিংক"
                className="w-full px-3 py-2 bg-[#1A1A22] border border-[#2E2E3C] focus:border-indigo-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
              />
            </div>

            {/* Admin / Dev Testing Option */}
            {isAdmin && (
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>[Admin Test Mode] রাত ১২:০০ টার টাইম চেক বাইপাস করুন</span>
                </div>
                <input
                  type="checkbox"
                  checked={testBypassTime}
                  onChange={e => setTestBypassTime(e.target.checked)}
                  className="rounded border-gray-700 text-purple-600 focus:ring-0 cursor-pointer"
                />
              </div>
            )}

            {/* Error and Success Feedback */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#1E1E26] hover:bg-[#282834] text-gray-300 text-xs font-semibold rounded-xl transition-colors"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (!bdEligibility.isSubmissionAllowed && !testBypassTime) || weeklyCount >= maxWeekly}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
              >
                {isSubmitting ? (
                  <span>জমা হচ্ছে...</span>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>রিপোর্ট সাবমিট করুন</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
