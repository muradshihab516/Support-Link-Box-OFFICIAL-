import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Megaphone,
  AlertTriangle
} from 'lucide-react';
import { CommunitySettings } from '../../types';

export const SettingsAdmin: React.FC = () => {
  const { settings, updateSettings, resetToDefaultSeed } = useApp();

  const [form, setForm] = useState<CommunitySettings>({ ...settings });
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSuccessMsg('Settings saved successfully!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleResetSeed = () => {
    if (confirm('Warning: This will reload the default 2,000+ member demo database and reset all test links. Proceed?')) {
      resetToDefaultSeed();
      setSuccessMsg('System reset to default seed data!');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
          <Settings className="w-6 h-6 text-indigo-400" />
          Community Rules & System Settings
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure operational deadlines, automated freeze rules, point formulas, and monetization toggles.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 text-emerald-400 text-xs font-bold border border-emerald-900/50 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* General Community Info */}
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-white">
            General Community Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Community Name</label>
              <input
                type="text"
                value={form.communityName}
                onChange={e => setForm({ ...form, communityName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white font-semibold focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Tagline</label>
              <input
                type="text"
                value={form.communityTagline}
                onChange={e => setForm({ ...form, communityTagline: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Operational & Deadlines */}
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-white">
            Daily Task Deadlines & Inactivity Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Daily Support Deadline</label>
              <input
                type="text"
                value={form.dailyDeadlineTime}
                onChange={e => setForm({ ...form, dailyDeadlineTime: e.target.value })}
                placeholder="23:59 BST"
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white font-mono focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Max Daily Submissions / Member</label>
              <input
                type="number"
                value={form.maxDailySubmissionsPerMember}
                onChange={e => setForm({ ...form, maxDailySubmissionsPerMember: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white font-mono focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Auto-Freeze Inactivity Days</label>
              <input
                type="number"
                value={form.inactivityThresholdDays}
                onChange={e => setForm({ ...form, inactivityThresholdDays: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white font-mono focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allowDuplicateLinks}
                onChange={e => setForm({ ...form, allowDuplicateLinks: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 bg-[#0E0E10] border-[#1E1E20]"
              />
              <span>Allow members to submit the same Facebook post URL multiple times across different days</span>
            </label>
          </div>
        </div>

        {/* Monetization Engine Toggles */}
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-indigo-400" />
            Monetization & Ads Switchboard
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-[#0E0E10] border border-[#1E1E20] rounded-xl cursor-pointer hover:border-gray-700 transition-colors">
              <div>
                <div className="text-xs font-bold text-white">Enable Display Ad Slots</div>
                <div className="text-[11px] text-gray-500">Show Google AdSense / banner ad slots in leaderboards and feed</div>
              </div>
              <input
                type="checkbox"
                checked={form.enableAdSlots}
                onChange={e => setForm({ ...form, enableAdSlots: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-[#0E0E10] border-[#1E1E20]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#0E0E10] border border-[#1E1E20] rounded-xl cursor-pointer hover:border-gray-700 transition-colors">
              <div>
                <div className="text-xs font-bold text-white">Enable Featured Brand Sponsors</div>
                <div className="text-[11px] text-gray-500">Display direct sponsor partner cards and leaderboard header banners</div>
              </div>
              <input
                type="checkbox"
                checked={form.enableFeaturedSponsors}
                onChange={e => setForm({ ...form, enableFeaturedSponsors: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-[#0E0E10] border-[#1E1E20]"
              />
            </label>
          </div>
        </div>

        {/* Save & Reset Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleResetSeed}
            className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors border border-rose-900/60"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Database to Default Seed</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
};
