import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, AlertTriangle, Send } from 'lucide-react';
import { ReportCategory } from '../../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetLinkId?: string;
  targetMemberId?: string;
  targetName?: string;
  prefilledLinkInfo?: { id: string; number: number; member: string };
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetLinkId,
  targetMemberId,
  targetName,
  prefilledLinkInfo
}) => {
  const effectiveLinkId = prefilledLinkInfo?.id || targetLinkId;
  const effectiveTargetName = prefilledLinkInfo ? `${prefilledLinkInfo.member} (Link #${prefilledLinkInfo.number})` : targetName;
  const { submitReport } = useApp();
  const [category, setCategory] = useState<ReportCategory>('broken_link');
  const [description, setDescription] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setStatusMsg({ type: 'error', text: 'Please describe the issue in detail.' });
      return;
    }

    const res = submitReport(category, description.trim(), effectiveLinkId, targetMemberId, screenshotUrl.trim());
    if (res.success) {
      setStatusMsg({ type: 'success', text: res.message });
      setTimeout(() => {
        setStatusMsg(null);
        setDescription('');
        setScreenshotUrl('');
        onClose();
      }, 1500);
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#131315] rounded-2xl shadow-2xl border border-[#1E1E20] w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-[#1E1E20] flex items-center justify-between bg-[#0E0E10]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Report Issue / Suspicious Activity
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1E1E20]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
          {targetName && (
            <div className="text-xs p-2.5 bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-gray-300">
              Reporting: <strong className="text-white">{targetName}</strong> {targetLinkId ? `(Link #${targetLinkId.replace('link_', '')})` : ''}
            </div>
          )}

          {statusMsg && (
            <div className={`p-3 rounded-xl text-xs font-medium ${
              statusMsg.type === 'success' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {statusMsg.text}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Issue Category *</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as ReportCategory)}
              className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:border-indigo-500 text-white"
            >
              <option value="broken_link" className="bg-[#131315] text-white">Broken / 404 Facebook Link</option>
              <option value="fake_support" className="bg-[#131315] text-white">Fake Support / No Reaction on Post</option>
              <option value="inappropriate_content" className="bg-[#131315] text-white">Inappropriate / Prohibited Content</option>
              <option value="profile_issue" className="bg-[#131315] text-white">Fake or Inactive Facebook Profile</option>
              <option value="other" className="bg-[#131315] text-white">Other System Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Description / Details *</label>
            <textarea
              required
              rows={3}
              placeholder="Explain the problem clearly for community moderators..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-gray-600 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Screenshot Link (Optional)</label>
            <input
              type="url"
              placeholder="https://imgur.com/... or cloud image link"
              value={screenshotUrl}
              onChange={e => setScreenshotUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-gray-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-[#1E1E20] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Send className="w-3.5 h-3.5" /> Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
