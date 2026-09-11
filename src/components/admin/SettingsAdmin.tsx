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
  AlertTriangle,
  Globe,
  Radio,
  Database,
  RefreshCw,
  Crown,
  ExternalLink,
  Shield,
  Copy
} from 'lucide-react';
import { SystemSettings } from '../../types';
import { 
  formatTimeToBangla, 
  formatTimeTo12Hour, 
  checkBangladeshSubmissionWindow 
} from '../../utils/bangladeshTime';

export const SettingsAdmin: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    resetToDefaultSeed,
    isSupabaseActive,
    supabaseSyncStatus,
    syncDataWithSupabase
  } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const ALL_DONE_SQL = `-- Create All Done & Announcements Tables for Supabase
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    issued_by TEXT NOT NULL,
    issued_by_role TEXT DEFAULT 'admin',
    issued_by_avatar TEXT,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    time_bst TEXT NOT NULL,
    image_url TEXT,
    is_important BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'published',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    read_by JSONB DEFAULT '[]'::jsonb,
    community_id TEXT DEFAULT 'comm_default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.all_done (
    id TEXT PRIMARY KEY,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    member_number INTEGER NOT NULL,
    member_avatar TEXT,
    date DATE DEFAULT CURRENT_DATE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    submitted_at_timestamp BIGINT NOT NULL,
    submitted_time_bst TEXT NOT NULL,
    message TEXT,
    other_ids TEXT,
    other_id_links TEXT,
    fastest_rank INTEGER,
    bonus_points INTEGER DEFAULT 0,
    base_points INTEGER DEFAULT 3,
    status TEXT DEFAULT 'verified',
    community_id TEXT DEFAULT 'comm_default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_member_all_done_per_day UNIQUE (member_id, date)
);

CREATE TABLE IF NOT EXISTS public.alt_id_disclosures (
    id TEXT PRIMARY KEY,
    all_done_id TEXT REFERENCES public.all_done(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES public.members(id) ON DELETE CASCADE,
    member_name TEXT NOT NULL,
    member_number INTEGER NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    alt_names TEXT NOT NULL,
    alt_id_links TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.all_done ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alt_id_disclosures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Allow insert/update to announcements" ON public.announcements FOR ALL USING (true);
CREATE POLICY "Allow public read access to all_done" ON public.all_done FOR SELECT USING (true);
CREATE POLICY "Allow insert/update to all_done" ON public.all_done FOR ALL USING (true);
CREATE POLICY "Allow public read access to alt_id_disclosures" ON public.alt_id_disclosures FOR SELECT USING (true);
CREATE POLICY "Allow insert/update to alt_id_disclosures" ON public.alt_id_disclosures FOR ALL USING (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(ALL_DONE_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      await syncDataWithSupabase();
      setSyncFeedback('✓ Supabase ডাটাবেসের সাথে সফলভাবে ডেটা সিঙ্ক সম্পন্ন হয়েছে!');
    } catch (err: any) {
      setSyncFeedback('⚠️ সিঙ্ক করার সময় সমস্যা হয়েছে। অনুগ্রহ করে ইন্টারনেট ও পরিবেশ ভেরিয়েবল চেক করুন।');
    } finally {
      setIsSyncing(false);
    }
  };

  const [form, setForm] = useState<SystemSettings>({ 
    ...settings,
    submissionWindowStart: settings.submissionWindowStart || '10:00',
    submissionWindowEnd: settings.submissionWindowEnd || '16:50',
    submissionWindowEnabled: settings.submissionWindowEnabled !== false,
    submissionOpen: settings.submissionOpen !== false
  });
  const [successMsg, setSuccessMsg] = useState('');

  // Live BD window preview based on current form values
  const previewBdWindow = checkBangladeshSubmissionWindow(
    form.submissionWindowStart || '10:00',
    form.submissionWindowEnd || '16:50',
    form.submissionWindowEnabled !== false,
    form.submissionOpen !== false
  );

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
        
        {/* Supabase Database & Authentication Architecture */}
        <div className="bg-[#131315] rounded-2xl border border-emerald-500/20 p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E1E20] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Supabase ডাটাবেস ও অথেন্টিকেশন স্ট্যাটাস</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                সিস্টেমের সমস্ত ডাটা, মেম্বার টেবিল, অডিট লগ এবং অথেন্টিকেশন Supabase ক্লাউড ডাটাবেসের সাথে সংযুক্ত।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border flex items-center gap-1.5 ${
                isSupabaseActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isSupabaseActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isSupabaseActive ? 'Supabase Active' : 'Local Fallback Storage'}
              </span>

              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'সিঙ্ক হচ্ছে...' : 'Sync Now'}
              </button>
            </div>
          </div>

          {syncFeedback && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-medium">
              {syncFeedback}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-[#0E0E10] border border-[#1E1E20] rounded-xl space-y-2">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Developer & System Admin Account</span>
              </div>
              <div className="text-xs text-gray-300 space-y-1">
                <div>নাম: <span className="font-semibold text-white">Md Shihab Khan</span></div>
                <div>ইমেইল: <span className="font-mono text-emerald-400">Muradshihab515@gmail.com</span></div>
                <div className="flex items-center gap-1">
                  ফেসবুক: <a href="https://www.facebook.com/SmShihab2.0" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline flex items-center gap-0.5">https://www.facebook.com/SmShihab2.0 <ExternalLink className="w-3 h-3" /></a>
                </div>
                <div className="text-[11px] text-gray-400 pt-1 border-t border-[#1E1E20]">
                  পাসওয়ার্ড: যেকোনো সময় লগইন স্ক্রিন বা প্রোফাইল থেকে সেট/আপডেট করা যাবে।
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-[#0E0E10] border border-[#1E1E20] rounded-xl space-y-2">
              <div className="text-xs font-bold text-indigo-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Supabase PostgreSQL Schema & RLS</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedSql ? 'কপি হয়েছে!' : 'All Done SQL কপি করুন'}</span>
                </button>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                ডাটাবেসের সম্পূর্ণ SQL স্ক্রিপ্ট <code className="text-indigo-300 bg-[#16161A] px-1 py-0.5 rounded font-mono">supabase-schema.sql</code> ফাইলে প্রস্তুত রয়েছে। Supabase রিমোটে <code className="text-indigo-300 bg-[#16161A] px-1 py-0.5 rounded font-mono">all_done</code> বা <code className="text-indigo-300 bg-[#16161A] px-1 py-0.5 rounded font-mono">announcements</code> টেবিল মাইগ্রেশন বাকি থাকলেও স্বয়ংক্রিয়ভাবে LocalStorage এবং notices টেবিল ফলব্যাক নির্বিঘ্নে ডেটা পরিচালনা করে।
              </p>
            </div>
          </div>
        </div>

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

        {/* Link Submission Window & Timezone Settings (Bangladesh Standard Time - BST) */}
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E1E20] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>লিংক সাবমিশন সময়সীমা (Bangladesh Timezone BST)</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">
                বাংলাদেশ সময় অনুযায়ী মেম্বারদের লিংক দেওয়ার সময়সীমা নির্ধারণ করুন। এডমিনরা যেকোনো সময় সাবমিট করতে পারবেন।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 font-medium">লাইভ BST স্ট্যাটাস:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                previewBdWindow.isOpenNow
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                {previewBdWindow.statusBadgeText} ({previewBdWindow.currentFormattedBangla})
              </span>
            </div>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
                <span>সাবমিশন শুরুর সময় (Window Start)</span>
                <span className="text-[11px] text-indigo-400 font-bold">
                  {formatTimeToBangla(form.submissionWindowStart || '10:00')} ({formatTimeTo12Hour(form.submissionWindowStart || '10:00')})
                </span>
              </label>
              <input
                type="time"
                value={form.submissionWindowStart || '10:00'}
                onChange={e => setForm({ ...form, submissionWindowStart: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white font-mono focus:border-indigo-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                ডিফল্ট: সকাল ১০:০০ (10:00 AM BST)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
                <span>সাবমিশন সমাপ্তির সময় (Window End)</span>
                <span className="text-[11px] text-indigo-400 font-bold">
                  {formatTimeToBangla(form.submissionWindowEnd || '16:50')} ({formatTimeTo12Hour(form.submissionWindowEnd || '16:50')})
                </span>
              </label>
              <input
                type="time"
                value={form.submissionWindowEnd || '16:50'}
                onChange={e => setForm({ ...form, submissionWindowEnd: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white font-mono focus:border-indigo-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                ডিফল্ট: বিকেল ০৪:৫০ (04:50 PM BST)
              </p>
            </div>
          </div>

          {/* Controls & Toggles */}
          <div className="space-y-2 pt-2 border-t border-[#1E1E20]">
            <label className="flex items-center justify-between p-3 bg-[#0E0E10] border border-[#1E1E20] rounded-xl cursor-pointer hover:border-gray-700 transition-colors">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>নির্ধারিত সময়সীমা কার্যকর রাখুন (Enforce Time Window)</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  চালু থাকলে সাধারণ মেম্বাররা শুধুমাত্র নির্ধারিত সময়ের ({formatTimeToBangla(form.submissionWindowStart || '10:00')} থেকে {formatTimeToBangla(form.submissionWindowEnd || '16:50')}) মধ্যে লিংক সাবমিট করতে পারবে।
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.submissionWindowEnabled !== false}
                onChange={e => setForm({ ...form, submissionWindowEnabled: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-[#0E0E10] border-[#1E1E20]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-[#0E0E10] border border-[#1E1E20] rounded-xl cursor-pointer hover:border-gray-700 transition-colors">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>জরুরি মাস্টার সুইচ: লিংক সাবমিশন উন্মুক্ত (Master Submission Open)</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  জরুরি অবস্থায় বা রক্ষণাবেক্ষণের সময় বন্ধ রাখলে সাময়িকভাবে কোনো মেম্বার নতুন লিংক দিতে পারবে না।
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.submissionOpen !== false}
                onChange={e => setForm({ ...form, submissionOpen: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-[#0E0E10] border-[#1E1E20]"
              />
            </label>
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

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                ফটো সাপোর্ট কাউন্টডাউন (সেকেন্ড)
              </label>
              <input
                type="number"
                min="3"
                max="120"
                value={form.minSupportDwellSeconds ?? 7}
                onChange={e => setForm({ ...form, minSupportDwellSeconds: Math.max(3, Number(e.target.value)) })}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white font-mono focus:border-indigo-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">ডিফল্ট: ৭ সেকেন্ড</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                ভিডিও সাপোর্ট কাউন্টডাউন (সেকেন্ড)
              </label>
              <input
                type="number"
                min="3"
                max="180"
                value={form.videoSupportDwellSeconds ?? 8}
                onChange={e => setForm({ ...form, videoSupportDwellSeconds: Math.max(3, Number(e.target.value)) })}
                className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white font-mono focus:border-indigo-500"
              />
              <p className="text-[10px] text-gray-500 mt-1">ডিফল্ট: ৮ সেকেন্ড</p>
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

        {/* Late Support Exception & Grace Settings (Bangladesh Time BST) */}
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="border-b border-[#1E1E20] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Late Support Exception System (দেরিতে সাপোর্টের সেটিংস)</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              রাত ১২:০০ টার আগে মেম্বারদের "Report a Late Support" আবেদন, Ad punishment ছাড় এবং ২৪ ঘণ্টার গ্রেস উইন্ডো কনফিগার করুন।
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-[#0E0E10] border border-[#1E1E20] rounded-xl cursor-pointer hover:border-gray-700 transition-colors">
              <div>
                <div className="text-xs font-bold text-white">Enable "Report a Late Support" System</div>
                <div className="text-[11px] text-gray-500">মেম্বারদের সামনে ১২:০০ AM এর আগে রিপোর্ট করার বাটন ও গ্রেস সিস্টেম চালু থাকবে</div>
              </div>
              <input
                type="checkbox"
                checked={form.lateSupportReportEnabled !== false}
                onChange={e => setForm({ ...form, lateSupportReportEnabled: e.target.checked })}
                className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 bg-[#0E0E10] border-[#1E1E20]"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  সাপ্তাহিক সর্বোচ্চ রিপোর্ট সীমা (Max Weekly Reports)
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={form.maxLateReportsPerWeek ?? 2}
                  onChange={e => setForm({ ...form, maxLateReportsPerWeek: Math.max(1, Number(e.target.value)) })}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white font-mono focus:border-amber-500"
                />
                <p className="text-[10px] text-gray-500 mt-1">ডিফল্ট: ২ বার প্রতি সপ্তাহে</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  রিকভারি গ্রেস সময়সীমা (ঘণ্টা) (Grace Period Hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="48"
                  value={form.lateReportGracePeriodHours ?? 24}
                  onChange={e => setForm({ ...form, lateReportGracePeriodHours: Math.max(1, Number(e.target.value)) })}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white font-mono focus:border-amber-500"
                />
                <p className="text-[10px] text-gray-500 mt-1">ডিফল্ট: ২৪ ঘণ্টা (২৪ ঘণ্টার মধ্যে All Done করলে লিংক দিতে পারবে, কোনো Ads শো হবে না)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monetization Engine Toggles */}
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-400" />
              Monetization & Ads Switchboard
            </h3>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
              Demo Ads Mode Active
            </span>
          </div>

          <div className="p-3 bg-gradient-to-r from-indigo-950/40 via-[#13131D] to-purple-950/30 border border-indigo-500/30 rounded-xl text-xs text-indigo-200">
            <p className="font-semibold text-white">💡 অ্যাডমিন টেস্টিং মোড সক্রিয়:</p>
            <p className="mt-0.5 text-gray-400 leading-relaxed">
              ডোমেইন কেনার আগ পর্যন্ত Monetag বা AdSense লাইভ করার পরিবর্তে সব জায়গায় ইন্টারঅ্যাক্টিভ <strong>ডেমো ব্যানার, ইন-ফিড অ্যাড এবং ১০ সেকেন্ডের রিওয়ার্ডেড ভিডিও অ্যাড</strong> চালু রাখা হয়েছে। বাকি অ্যাডমিনরা সম্পূর্ণ ইউজার ফ্লো ও পয়েন্ট রিওয়ার্ড টেস্ট করতে পারবেন।
            </p>
          </div>

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
