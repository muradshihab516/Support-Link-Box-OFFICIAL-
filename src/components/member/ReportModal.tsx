import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  AlertTriangle, 
  Send, 
  Check, 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { ReportCategory } from '../../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLinkId?: string;
  targetMemberId?: string;
  targetName?: string;
  prefilledLinkInfo?: { id: string; number: number; member: string; url?: string };
}

// Pre-defined options exactly as requested by the user
export const REPORT_PREDEFINED_REASONS = [
  { id: 'broken_link', label: 'লিংক কাজ করছে না', icon: '🔗', category: 'broken_link' as ReportCategory },
  { id: 'comments_off', label: 'কমেন্ট বন্ধ করা আছে', icon: '💬', category: 'broken_link' as ReportCategory },
  { id: 'private_post', label: 'পোস্ট পাবলিক নয়', icon: '🔒', category: 'broken_link' as ReportCategory },
  { id: 'react_comment_off', label: 'রিয়েক্ট & কমেন্ট দুটোই বন্ধ', icon: '🚫', category: 'broken_link' as ReportCategory },
  { id: 'adult_content', label: 'বয়স ভিত্তিক এডাল্ট পোস্ট 🔞', icon: '🔞', category: 'inappropriate_content' as ReportCategory },
  { id: 'political_post', label: 'রাজনৈতিক পোস্ট', icon: '⚖️', category: 'inappropriate_content' as ReportCategory },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetLinkId,
  targetMemberId,
  targetName,
  prefilledLinkInfo
}) => {
  const { submitReport, dailyLinks } = useApp();

  const effectiveLinkId = prefilledLinkInfo?.id || targetLinkId;
  const matchedDailyLink = dailyLinks.find(l => l.id === effectiveLinkId);
  
  const linkNumber = prefilledLinkInfo?.number || matchedDailyLink?.linkNumber;
  const memberName = prefilledLinkInfo?.member || matchedDailyLink?.memberName || targetName || 'সদস্য';
  const postUrl = prefilledLinkInfo?.url || matchedDailyLink?.postUrl;
  const finalMemberId = targetMemberId || matchedDailyLink?.memberId;

  // Selected quick tags (multiple select)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  // Free text
  const [description, setDescription] = useState('');
  // Screenshot (base64 or URL)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const toggleReason = (label: string) => {
    setSelectedReasons(prev => 
      prev.includes(label) 
        ? prev.filter(r => r !== label) 
        : [...prev, label]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMsg({ type: 'error', text: 'অনুগ্রহ করে শুধুমাত্র ছবি (PNG, JPG, WebP) নির্বাচন করুন।' });
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে।' });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshotPreview(event.target?.result as string);
      setIsUploading(false);
      setStatusMsg(null);
    };
    reader.onerror = () => {
      setIsUploading(false);
      setStatusMsg({ type: 'error', text: 'ছবি লোড করতে সমস্যা হয়েছে।' });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotPreview(null);
    setManualUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedReasons.length === 0 && !description.trim()) {
      setStatusMsg({ 
        type: 'error', 
        text: 'অনুগ্রহ করে অন্তত একটি সমস্যা নির্বাচন করুন অথবা নিচে বিস্তারিত লিখে জানান।' 
      });
      return;
    }

    // Determine category based on selection
    let determinedCategory: ReportCategory = 'broken_link';
    if (selectedReasons.includes('বয়স ভিত্তিক এডাল্ট পোস্ট 🔞') || selectedReasons.includes('রাজনৈতিক পোস্ট')) {
      determinedCategory = 'inappropriate_content';
    }

    const finalScreenshot = screenshotPreview || (manualUrl.trim() || undefined);
    const fullDescription = description.trim() || selectedReasons.join(', ');

    const res = submitReport(
      determinedCategory,
      fullDescription,
      effectiveLinkId,
      finalMemberId,
      finalScreenshot,
      selectedReasons
    );

    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setStatusMsg(null);
        setSelectedReasons([]);
        setDescription('');
        setScreenshotPreview(null);
        setManualUrl('');
        onClose();
      }, 1400);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#121216] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#24242E] w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#20202A] flex items-center justify-between bg-[#16161C] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                Report a Problem / সমস্যা রিপোর্ট
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                লিংকটিতে সমস্যা থাকলে নিচে নির্বাচন করে এডমিন ও লিংক দাতাকে জানান
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#202028] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          
          {/* Target Link Context Card */}
          {linkNumber && (
            <div className="p-3 bg-[#0C0C10] border border-[#1E1E28] rounded-xl flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">রিপোর্টকৃত পোস্ট:</span>
                <div className="font-bold text-white truncate text-xs sm:text-sm flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300 font-mono text-[11px]">#{linkNumber}</span>
                  <span className="truncate">{memberName}</span>
                </div>
              </div>
              {postUrl && (
                <a
                  href={postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-[#181822] hover:bg-[#222230] border border-[#2A2A3A] text-gray-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                  title="লিংকটি টেস্ট করুন"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                  <span>পোস্ট দেখুন</span>
                </a>
              )}
            </div>
          )}

          {/* Feedback Alert */}
          {statusMsg && (
            <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              statusMsg.type === 'success' 
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
            }`}>
              {statusMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Pre-defined Quick Selection Chips (Multiple Choice) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300">
              কী সমস্যা হচ্ছে? (নিচে ট্যাপ করে এক বা একাধিক সিলেক্ট করুন):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {REPORT_PREDEFINED_REASONS.map(item => {
                const isSelected = selectedReasons.includes(item.label);
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => toggleReason(item.label)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all duration-150 active:scale-[0.98] ${
                      isSelected
                        ? 'bg-rose-500/20 border-rose-500/60 text-white shadow-xs font-bold'
                        : 'bg-[#16161E] border-[#22222E] text-gray-300 hover:border-gray-600 hover:bg-[#1C1C26]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{item.icon}</span>
                      <span className="text-xs leading-snug">{item.label}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-600 bg-transparent'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Free-text Description Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300">
              নিজের ভাষায় সমস্যার কথা লিখুন (ঐচ্ছিক):
            </label>
            <textarea
              rows={3}
              placeholder="যেমন: ভাই পোস্টে ঢুকে দেখি কমেন্ট অপশন নেই, প্রাইভেসি অনলি মি করা..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-[#0E0E12] border border-[#22222E] rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-gray-600 resize-none transition-colors"
            />
          </div>

          {/* Screenshot Upload (Optional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-300">
                স্ক্রিনশট প্রুফ (ঐচ্ছিক):
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                {showUrlInput ? 'ফাইল আপলোড ব্যবহার করুন' : 'অথবা ছবির URL দিন'}
              </button>
            </div>

            {showUrlInput ? (
              <input
                type="url"
                placeholder="https://i.imgur.com/... অথবা যেকোনো ছবির সরাসরি লিংক"
                value={manualUrl}
                onChange={e => {
                  setManualUrl(e.target.value);
                  if (e.target.value) setScreenshotPreview(e.target.value);
                }}
                className="w-full px-3 py-2 text-xs bg-[#0E0E12] border border-[#22222E] rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-gray-600"
              />
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="report-screenshot-upload"
                />

                {!screenshotPreview ? (
                  <label
                    htmlFor="report-screenshot-upload"
                    className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-[#282836] hover:border-indigo-500/50 rounded-xl cursor-pointer bg-[#0E0E12] hover:bg-[#14141A] transition-colors group"
                  >
                    <UploadCloud className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transition-colors mb-1" />
                    <span className="text-xs font-semibold text-gray-300">
                      {isUploading ? 'ছবি লোড হচ্ছে...' : 'স্ক্রিনশট আপলোড করতে ক্লিক করুন'}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-0.5">PNG, JPG, WebP (সর্বোচ্চ 5MB)</span>
                  </label>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-[#2E2E3E] bg-[#0E0E12] p-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <img 
                        src={screenshotPreview} 
                        alt="Screenshot Preview" 
                        className="w-12 h-12 object-cover rounded-lg border border-[#3A3A4E] shrink-0" 
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">স্ক্রিনশট যুক্ত হয়েছে ✓</span>
                        <span className="text-[10px] text-gray-400">রিপোর্টের সাথে এটা দেখা যাবে</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors"
                      title="স্ক্রিনশট মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 border-t border-[#1C1C26] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-[#1E1E26] rounded-xl transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={selectedReasons.length === 0 && !description.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-rose-600/25 transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" /> 
              <span>SUBMIT REPORT / রিপোর্ট পাঠান</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
