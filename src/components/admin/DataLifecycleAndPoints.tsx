import React, { useState } from 'react';
import { 
  Database, 
  FileSpreadsheet, 
  Coins, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Download, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Layers, 
  ExternalLink,
  Award,
  Sparkles,
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RewardRedemption } from '../../types';

export const DataLifecycleAndPoints: React.FC = () => {
  const {
    dailyLinks,
    supportRecords,
    pointsHistory,
    adDailyRollups,
    dataCleanupLogs,
    rewardRedemptions,
    fastestSupportersList,
    purgedSupportRecordsCount,
    settings,
    updateSettings,
    generateDailyPointsHistory,
    runDataLifecycleCleanup,
    exportDataToGoogleSheetsArchive,
    getStorageOptimizationStats,
    currentUser,
    members
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'storage_lifecycle' | 'google_sheets' | 'points_rules' | 'daily_rollup'>('storage_lifecycle');
  const [retentionDaysInput, setRetentionDaysInput] = useState<number>(settings.cleanupRetentionDays || 7);
  const [googleSheetsUrlInput, setGoogleSheetsUrlInput] = useState<string>(settings.googleSheetsBackupUrl || '');
  const [isCleaning, setIsCleaning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRollingUp, setIsRollingUp] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showCleanupConfirmModal, setShowCleanupConfirmModal] = useState(false);

  // Point rules state
  const [pointRulesState, setPointRulesState] = useState({
    supportPoints: settings.pointRules?.supportPoints ?? 1,
    submissionPoints: settings.pointRules?.submissionPoints ?? 5,
    allDonePoints: settings.pointRules?.allDonePoints ?? 3,
    fastestSupporterTiers: settings.pointRules?.fastestSupporterTiers ?? [10, 8, 6, 4, 2],
    streakDailyBonus: settings.pointRules?.streakDailyBonus ?? 2
  });

  const stats = getStorageOptimizationStats();

  const handleSaveRetention = () => {
    updateSettings({ cleanupRetentionDays: retentionDaysInput });
    setStatusMessage({
      type: 'success',
      text: `✓ ডেটা রিটেনশন সময়সীমা সফলভাবে ${retentionDaysInput} দিন হিসেবে সংরক্ষণ করা হয়েছে!`
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSaveGoogleSheetsUrl = () => {
    updateSettings({ googleSheetsBackupUrl: googleSheetsUrlInput.trim() });
    setStatusMessage({
      type: 'success',
      text: '✓ গুগল শিটস ওয়েব-হুক ব্যাকআপ URL সফলভাবে আপডেট করা হয়েছে!'
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSavePointRules = () => {
    updateSettings({ pointRules: pointRulesState });
    setStatusMessage({
      type: 'success',
      text: '✓ রিয়েল-টাইম পয়েন্ট সিস্টেমের রুলস সফলভাবে আপডেট করা হয়েছে!'
    });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleExecuteCleanup = () => {
    setIsCleaning(true);
    setShowCleanupConfirmModal(false);
    setTimeout(() => {
      try {
        const result = runDataLifecycleCleanup({ forceDays: retentionDaysInput, triggeredBy: currentUser?.name || 'Admin' });
        setIsCleaning(false);
        setStatusMessage({
          type: 'success',
          text: `✓ নিরাপদ ডেটা ক্লিনআপ সফল! ${result.supportRecordsPurged}টি পুরোনো কাঁচা সাপোর্ট রেকর্ড পার্জ করা হয়েছে। মেম্বারদের মোট পয়েন্ট ও সাপোর্ট কাউন্টার অপরিবর্তিত রাখা হয়েছে।`
        });
      } catch (err: any) {
        setIsCleaning(false);
        setStatusMessage({
          type: 'error',
          text: `ক্লিনআপে সমস্যা হয়েছে: ${err?.message || 'অজানা ত্রুটি'}`
        });
      }
      setTimeout(() => setStatusMessage(null), 6000);
    }, 600);
  };

  const handleExportCsv = () => {
    setIsExporting(true);
    setTimeout(() => {
      const res = exportDataToGoogleSheetsArchive({ format: 'csv', sendWebhook: Boolean(settings.googleSheetsBackupUrl) });
      setIsExporting(false);
      setStatusMessage({
        type: 'success',
        text: res.message
      });
      setTimeout(() => setStatusMessage(null), 6000);
    }, 400);
  };

  const handleManualRollup = () => {
    setIsRollingUp(true);
    setTimeout(() => {
      const res = generateDailyPointsHistory();
      setIsRollingUp(false);
      setStatusMessage({
        type: 'success',
        text: res.message
      });
      setTimeout(() => setStatusMessage(null), 5000);
    }, 500);
  };

  return (
    <div className="space-y-6 text-gray-200">
      {/* Top Banner Header */}
      <div className="bg-[#121214] border border-[#222226] rounded-xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                <Database className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">
                স্টোরেজ ও পয়েন্ট লাইফসাইকেল আর্কিটেকচার
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                Supabase Free-Tier Safe
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-3xl">
              সুপাবেসের ফ্রি ৫০০ এমবি কোটা আজীবন সুরক্ষিত রাখতে লাইভ কাউন্টার ও ৭ দিনের ব্যাচ হিস্ট্রি সিস্টেম। কোনো মূল লিঙ্ক বা রিপোর্ট না হারিয়ে লাখ লাখ রো সংরক্ষণ।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCleanupConfirmModal(true)}
              disabled={isCleaning}
              className="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              {isCleaning ? 'ক্লিনআপ চলছে...' : 'Run Safe Cleanup'}
            </button>
            <button
              onClick={handleExportCsv}
              disabled={isExporting}
              className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              {isExporting ? 'তৈরি হচ্ছে...' : 'Export to Google Sheets CSV'}
            </button>
            <button
              onClick={handleManualRollup}
              disabled={isRollingUp}
              className="px-3.5 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-amber-400 ${isRollingUp ? 'animate-spin' : ''}`} />
              Rollup Today
            </button>
          </div>
        </div>

        {/* Status notification toast */}
        {statusMessage && (
          <div className={`mt-4 p-3 rounded-lg border text-sm flex items-center gap-2.5 transition-all animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
          }`}>
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0" />}
            {statusMessage.type === 'info' && <Info className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#222226] overflow-x-auto gap-2">
        <button
          onClick={() => setActiveSubTab('storage_lifecycle')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeSubTab === 'storage_lifecycle'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Database className="w-4 h-4" />
          স্টোরেজ ও অটো-ক্লিনআপ
        </button>
        <button
          onClick={() => setActiveSubTab('google_sheets')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeSubTab === 'google_sheets'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          গুগল শিটস ব্যাকআপ সেন্টার
        </button>
        <button
          onClick={() => setActiveSubTab('points_rules')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeSubTab === 'points_rules'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          রিয়েল-টাইম পয়েন্ট সিস্টেম ও রুলস
        </button>
        <button
          onClick={() => setActiveSubTab('daily_rollup')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeSubTab === 'daily_rollup'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          <History className="w-4 h-4" />
          ডেইলি পয়েন্ট হিস্ট্রি ({pointsHistory.length})
        </button>
      </div>

      {/* Sub-Tab 1: Storage Optimization & Lifecycle */}
      {activeSubTab === 'storage_lifecycle' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#141417] border border-[#232328] rounded-xl p-4 space-y-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">সুপাবেস ডেটাবেজ সাইজ</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">~{stats.estimatedCurrentSizeMb} MB</span>
                <span className="text-xs text-gray-500">/ 500 MB Free</span>
              </div>
              <div className="w-full bg-[#202025] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(1, (stats.estimatedCurrentSizeMb / 500) * 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> ফ্রি লিমিটের মাত্র {((stats.estimatedCurrentSizeMb / 500) * 100).toFixed(2)}% ব্যবহৃত
              </span>
            </div>

            <div className="bg-[#141417] border border-[#232328] rounded-xl p-4 space-y-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">নিরাপদে সেভ করা স্টোরেজ</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-400">+{stats.estimatedSavedSizeMb} MB</span>
                <span className="text-xs text-emerald-500/80 font-semibold">({stats.storageEfficiencyPercentage}% সেভড)</span>
              </div>
              <p className="text-xs text-gray-400">
                পুরোনো কাঁচা সাপোর্ট রেকর্ড প্রুন করে রো-ভলিউম অপ্টিমাইজ করা হয়েছে।
              </p>
            </div>

            <div className="bg-[#141417] border border-[#232328] rounded-xl p-4 space-y-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">মোট পার্জ করা কাঁচা রেকর্ড</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-400">{purgedSupportRecordsCount.toLocaleString()}</span>
                <span className="text-xs text-gray-500">Rows</span>
              </div>
              <p className="text-xs text-gray-400">
                মেম্বারদের মোট সাপোর্ট কাউন্টার ও পয়েন্ট ডাটা শতভাগ অপরিবর্তিত।
              </p>
            </div>

            <div className="bg-[#141417] border border-[#232328] rounded-xl p-4 space-y-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">অ্যাক্টিভ লাইভ রেকর্ডস</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-blue-400">{dailyLinks.length} Links</span>
                <span className="text-xs text-gray-500">/ {supportRecords.length} Supports</span>
              </div>
              <p className="text-xs text-gray-400">
                রিটেনশন উইন্ডো: {stats.retentionDays} দিন (রানিং উইক ডাটা)
              </p>
            </div>
          </div>

          {/* Safe Architecture Principles */}
          <div className="bg-[#141417] border border-[#232328] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">
                জিরো-ল্যাক ও জিরো-ডেটালস আর্কিটেকচার নীতি (Zero Data Loss Guarantees)
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#1A1A1F] p-3.5 rounded-lg border border-[#2B2B32] space-y-1.5">
                <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ১. Daily Links কখনো মোছা হয় না (Immutable)
                </span>
                <p className="text-gray-400 leading-relaxed">
                  মেম্বারদের সাবমিট করা প্রতিটি ফেসবুক পোস্ট লিংক চিরস্থায়ীভাবে ডেটাবেজে থেকে যায়। লিংক হিস্ট্রি, অডিট এবং প্রিভিউ কখনোই ক্লিনআপের অংশ হয় না।
                </p>
              </div>

              <div className="bg-[#1A1A1F] p-3.5 rounded-lg border border-[#2B2B32] space-y-1.5">
                <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ২. Support Records ৭ দিনের রুল (Rolling Window)
                </span>
                <p className="text-gray-400 leading-relaxed">
                  মেম্বারদের <code className="text-emerald-300 font-mono">totalSupportsCompleted</code> লাইভ কাউন্টারে রিয়েল-টাইমে যোগ হয়। তাই ৭ দিন পর সাপোর্ট ইভেন্ট টেবিল ক্লিন করলে কারো মোট স্কোর বা পদমর্যাদা কমে না।
                </p>
              </div>

              <div className="bg-[#1A1A1F] p-3.5 rounded-lg border border-[#2B2B32] space-y-1.5">
                <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ৩. Points History ব্যাচ সামারি (1 Row per Day)
                </span>
                <p className="text-gray-400 leading-relaxed">
                  প্রতিদিনের প্রতিটি আলাদা ক্লিক/ইভেন্ট রো যোগ না করে দিনশেষে মাত্র ১টি সামারি রো তৈরি হয়। এতে ডেটাবেজের হাজার হাজার অপ্রয়োজনীয় রো বেঁচে যায়।
                </p>
              </div>

              <div className="bg-[#1A1A1F] p-3.5 rounded-lg border border-[#2B2B32] space-y-1.5">
                <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ৪. Reports, Warnings ও Audit Logs শতভাগ অক্ষত
                </span>
                <p className="text-gray-400 leading-relaxed">
                  কোনো নিয়মভঙ্গ, নোটিশ, অ্যাডমিন লগ বা অডিট রেকর্ড ডিলিট হয় না। কমিউনিটির স্বচ্ছতা ও জবাবদিহিতা আজীবন সুরক্ষিত।
                </p>
              </div>
            </div>
          </div>

          {/* Retention & Execution Controls */}
          <div className="bg-[#141417] border border-[#232328] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              ডেটা রিটেনশন ও অটোমেশন সেটিংস
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">কাঁচা সাপোর্ট রেকর্ড রিটেনশন (দিন)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={3}
                    max={90}
                    value={retentionDaysInput}
                    onChange={(e) => setRetentionDaysInput(Math.max(3, parseInt(e.target.value) || 7))}
                    className="w-full bg-[#1B1B20] border border-[#2E2E36] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-gray-400 whitespace-nowrap">দিন</span>
                </div>
                <span className="text-[11px] text-gray-500">প্রস্তাবিত: ৭ দিন (সাপ্তাহিক চক্র অনুযায়ী সেরা)</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">অটো-ক্লিনআপ সক্রিয়করণ</label>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="autoCleanCheck"
                    checked={settings.autoCleanupEnabled !== false}
                    onChange={(e) => updateSettings({ autoCleanupEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-500 bg-[#1B1B20] border-[#2E2E36]"
                  />
                  <label htmlFor="autoCleanCheck" className="text-xs text-gray-300 font-medium cursor-pointer">
                    সাপ্তাহিক শেষে স্বয়ংক্রিয় ক্লিনআপ চালু রাখুন
                  </label>
                </div>
              </div>

              <div>
                <button
                  onClick={handleSaveRetention}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
                >
                  সেটিংস সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </div>

          {/* Cleanup Logs Table */}
          <div className="bg-[#141417] border border-[#232328] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#232328] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                পূর্ববর্তী ক্লিনআপ এক্সিকিউশন লগ ({dataCleanupLogs.length})
              </h3>
              <span className="text-xs text-gray-500 font-mono">Status: Automated</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#1A1A1F] text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#232328]">
                  <tr>
                    <th className="py-2.5 px-4">তারিখ ও সময়</th>
                    <th className="py-2.5 px-4">এক্সিকিউট করেছেন</th>
                    <th className="py-2.5 px-4">রিটেনশন</th>
                    <th className="py-2.5 px-4 text-amber-400">সাপোর্ট পার্জড</th>
                    <th className="py-2.5 px-4">নোটিফিকেশন পার্জড</th>
                    <th className="py-2.5 px-4 text-right">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202025]">
                  {dataCleanupLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-500">
                        এখনো কোনো ক্লিনআপ রান করা হয়নি।
                      </td>
                    </tr>
                  ) : (
                    dataCleanupLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#1A1A20]/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-gray-200">{log.executedAt}</td>
                        <td className="py-3 px-4 font-medium text-gray-300">{log.executedBy}</td>
                        <td className="py-3 px-4">{log.retentionDays} দিন</td>
                        <td className="py-3 px-4 text-amber-300 font-semibold">{log.supportRecordsPurged.toLocaleString()} rows</td>
                        <td className="py-3 px-4">{log.notificationsPurged} rows</td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-medium border border-emerald-500/30">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Google Sheets Archive Center */}
      {activeSubTab === 'google_sheets' && (
        <div className="space-y-6">
          {/* Architecture guidance */}
          <div className="bg-[#141417] border border-[#232328] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">
                সুপাবেস + গুগল শিটস মার্জ করার বাস্তবধর্মী গাইডলাইন
              </h2>
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-lg space-y-2 text-xs">
              <h4 className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                সুপারিশ: গুগল শিটসকে লাইভ ডেটাবেজ হিসেবে নয়, মাসিক কোল্ড আর্কাইভ হিসেবে ব্যবহার করুন!
              </h4>
              <p className="text-gray-300 leading-relaxed">
                অনেক ইউজার যখন একসাথে গ্রুপে লিংক সাবমিট করে বা অল-ডান ক্লিক করে, তখন গুগল শিটসের API রেট লিমিট (১০০ রিকোয়েস্ট/১০০ সেকেন্ড) অতিক্রম করে ডেটা ওভাররাইট বা গ্লিচ হতে পারে।
                কিন্তু <strong>সুপাবেসে লাইভ ডাটা চালানো এবং দিনশেষে বা মাসশেষে গুগল শিটসে আর্কাইভ রাখা</strong> ১০০% নিরাপদ, কোনো গ্লিচ হয় না এবং সুপাবেসের ফ্রি ট্রায়াল আজীবন চালানো সম্ভব!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#1B1B20] p-3.5 rounded-lg border border-[#2E2E36] space-y-1">
                <span className="font-semibold text-gray-200">১. শিট ট্যাব: daily_links</span>
                <p className="text-gray-400">প্রতিটি পোস্ট লিংক, পার্ট নম্বর, মেম্বার আইডি এবং সাপোর্ট কাউন্ট সংরক্ষিত হয়।</p>
              </div>
              <div className="bg-[#1B1B20] p-3.5 rounded-lg border border-[#2E2E36] space-y-1">
                <span className="font-semibold text-gray-200">২. শিট ট্যাব: points_history</span>
                <p className="text-gray-400">প্রতিটি মেম্বারের অল-ডান, বোনাস, সাপোর্ট পয়েন্টের দিনভিত্তিক সামারি।</p>
              </div>
              <div className="bg-[#1B1B20] p-3.5 rounded-lg border border-[#2E2E36] space-y-1">
                <span className="font-semibold text-gray-200">৩. শিট ট্যাব: ad_daily_rollups</span>
                <p className="text-gray-400">বিজ্ঞাপনদাতাদের ইমপ্রেশন ও ক্লিক এনালাইটিক্স নির্ভুল হিসেব।</p>
              </div>
            </div>
          </div>

          {/* Export Action Card */}
          <div className="bg-[#141417] border border-[#232328] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              ওয়ান-ক্লিক গুগল শিটস / এক্সেল আর্কাইভ ডাউনলোড
            </h3>
            <p className="text-xs text-gray-400">
              নিচের বাটনে ক্লিক করলে সমস্ত ডেটাবেজের মাল্টি-ট্যাব স্ট্রাকচারড UTF-8 ফরম্যাটে CSV ফাইল হিসেবে ডাউনলোড হবে, যা যেকোনো গুগল শিটস বা মাইক্রোসফট এক্সেলে সরাসরি ওপেন করা যায়।
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleExportCsv}
                disabled={isExporting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'আর্কাইভ এক্সপোর্ট হচ্ছে...' : 'সম্পূর্ণ আর্কাইভ ডাউনলোড করুন (.CSV)'}
              </button>
              <span className="text-xs text-gray-500">
                UTF-8 এনকোডেড (বাংলা ফন্ট সাপোর্ট সহ)
              </span>
            </div>
          </div>

          {/* Webhook Sync Setup (Optional) */}
          <div className="bg-[#141417] border border-[#232328] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-400" />
              গুগল অ্যাপস স্ক্রিপ্ট ওয়েব-হুক (Google Apps Script Webhook)
            </h3>
            <p className="text-xs text-gray-400">
              আপনি যদি আপনার গুগল ড্রাইভের নির্দিষ্ট একটি গুগল শিটে স্বয়ংক্রিয়ভাবে প্রতি সপ্তাহে ডেটা পাঠাতে চান, তবে আপনার গুগল শিটের Apps Script Web App URL এখানে পেস্ট করুন।
            </p>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-medium">Google Sheets Webhook URL (ঐচ্ছিক)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={googleSheetsUrlInput}
                  onChange={(e) => setGoogleSheetsUrlInput(e.target.value)}
                  className="flex-1 bg-[#1B1B20] border border-[#2E2E36] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  onClick={handleSaveGoogleSheetsUrl}
                  className="px-4 py-2 bg-[#26262D] hover:bg-[#303038] text-white rounded-lg text-xs font-medium transition-all"
                >
                  Save URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Points Rules & Real-time Total */}
      {activeSubTab === 'points_rules' && (
        <div className="space-y-6">
          <div className="bg-[#141417] border border-[#232328] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  রিয়েল-টাইম পয়েন্ট সিস্টেম কনফিগারেশন
                </h2>
                <p className="text-xs text-gray-400">
                  সদস্যদের প্রতিটি সফল অ্যাকশনে <code className="text-amber-300 font-mono">members.total_points</code> লাইভ আপডেট হয়।
                </p>
              </div>
              <button
                onClick={handleSavePointRules}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
              >
                রুলস সংরক্ষণ করুন
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#1B1B20] border border-[#2E2E36] rounded-lg p-3.5 space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">সাপোর্ট পয়েন্ট (প্রতি লিঙ্কে)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={pointRulesState.supportPoints}
                    onChange={(e) => setPointRulesState({ ...pointRulesState, supportPoints: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#121215] border border-[#2E2E36] rounded px-3 py-1.5 text-sm text-white font-semibold"
                  />
                  <span className="text-xs text-amber-400 font-medium">পয়েন্ট</span>
                </div>
                <span className="text-[11px] text-gray-500">অন্যান্যদের পোস্টে রিঅ্যাক্ট ও কমেন্ট করার জন্য</span>
              </div>

              <div className="bg-[#1B1B20] border border-[#2E2E36] rounded-lg p-3.5 space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">লিঙ্ক সাবমিশন পয়েন্ট</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={pointRulesState.submissionPoints}
                    onChange={(e) => setPointRulesState({ ...pointRulesState, submissionPoints: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#121215] border border-[#2E2E36] rounded px-3 py-1.5 text-sm text-white font-semibold"
                  />
                  <span className="text-xs text-amber-400 font-medium">পয়েন্ট</span>
                </div>
                <span className="text-[11px] text-gray-500">প্রতিদিন সঠিক সময়ে নিজের লিংক যোগ করার জন্য</span>
              </div>

              <div className="bg-[#1B1B20] border border-[#2E2E36] rounded-lg p-3.5 space-y-1.5">
                <label className="text-xs text-gray-400 font-medium">অল-ডান বোনাস (All Done Bonus)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={pointRulesState.allDonePoints}
                    onChange={(e) => setPointRulesState({ ...pointRulesState, allDonePoints: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#121215] border border-[#2E2E36] rounded px-3 py-1.5 text-sm text-white font-semibold"
                  />
                  <span className="text-xs text-amber-400 font-medium">পয়েন্ট</span>
                </div>
                <span className="text-[11px] text-gray-500">আজকের সবগুলো নির্ধারিত লিংক সফলভাবে শেষ করলে</span>
              </div>
            </div>

            {/* Fastest Supporter Tiers */}
            <div className="bg-[#1B1B20] border border-[#2E2E36] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> দ্রুততম ফাস্টেস্ট বোনাস টিয়ার (Fastest Supporter Tiers)
                </span>
                <span className="text-[11px] text-gray-400">টপ ৫ জনকে অতিরিক্ত বোনাস</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                {pointRulesState.fastestSupporterTiers.map((tierPts, idx) => (
                  <div key={idx} className="bg-[#121215] p-2.5 rounded border border-[#26262D] space-y-1">
                    <span className="text-gray-400 font-medium">Rank #{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={tierPts}
                        onChange={(e) => {
                          const newTiers = [...pointRulesState.fastestSupporterTiers] as [number, number, number, number, number];
                          newTiers[idx] = parseInt(e.target.value) || 0;
                          setPointRulesState({ ...pointRulesState, fastestSupporterTiers: newTiers });
                        }}
                        className="w-full bg-transparent border-b border-[#33333C] py-0.5 text-sm font-bold text-amber-300"
                      />
                      <span className="text-gray-500 text-[10px]">pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Fastest Supporters */}
          <div className="bg-[#141417] border border-[#232328] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#232328] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                আজকের দ্রুততম ফাস্টেস্ট সাপোর্টার বোর্ড (Today's Fastest Supporters)
              </h3>
              <span className="text-xs text-gray-400 font-mono">Date: Today</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#1A1A1F] text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#232328]">
                  <tr>
                    <th className="py-2.5 px-4">র‌্যাঙ্ক</th>
                    <th className="py-2.5 px-4">মেম্বার</th>
                    <th className="py-2.5 px-4">সম্পন্নের সময়</th>
                    <th className="py-2.5 px-4 text-right">বোনাস পয়েন্ট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202025]">
                  {fastestSupportersList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-500">
                        আজকে এখনো কেউ অল-ডান সম্পন্ন করেনি।
                      </td>
                    </tr>
                  ) : (
                    fastestSupportersList.map((entry) => (
                      <tr key={entry.memberId} className="hover:bg-[#1A1A20]/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-amber-400">#{entry.rank}</td>
                        <td className="py-3 px-4 font-medium text-white">{entry.memberName}</td>
                        <td className="py-3 px-4 font-mono text-gray-400">{entry.time}</td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-400">+{entry.bonusPoints} pts</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reward Redemptions Log */}
          <div className="bg-[#141417] border border-[#232328] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#232328] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                পয়েন্ট রিওয়ার্ড রিডেম্পশন হিস্ট্রি ({rewardRedemptions.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#1A1A1F] text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#232328]">
                  <tr>
                    <th className="py-2.5 px-4">সময়</th>
                    <th className="py-2.5 px-4">মেম্বার</th>
                    <th className="py-2.5 px-4">রিওয়ার্ডের নাম</th>
                    <th className="py-2.5 px-4">খরচকৃত পয়েন্ট</th>
                    <th className="py-2.5 px-4 text-right">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202025]">
                  {rewardRedemptions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">
                        এখনো কোনো রিওয়ার্ড রিডিম করা হয়নি।
                      </td>
                    </tr>
                  ) : (
                    rewardRedemptions.map((red) => (
                      <tr key={red.id} className="hover:bg-[#1A1A20]/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-gray-400">{red.createdAt}</td>
                        <td className="py-3 px-4 font-medium text-white">{red.memberName}</td>
                        <td className="py-3 px-4 text-purple-300">{red.title}</td>
                        <td className="py-3 px-4 font-bold text-amber-400">-{red.pointsUsed} pts</td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-medium border border-emerald-500/30">
                            {red.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Daily Points Batch History */}
      {activeSubTab === 'daily_rollup' && (
        <div className="space-y-6">
          <div className="bg-[#141417] border border-[#232328] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                ডেইলি পয়েন্ট ব্যাচ সামারি রোল-আপ
              </h2>
              <p className="text-xs text-gray-400">
                প্রতিদিন প্রতিটি সদস্যের জন্য মাত্র ১টি রো তে সাপোর্ট, সাবমিশন, অল-ডান ও বোনাস একত্রিত থাকে।
              </p>
            </div>
            <button
              onClick={handleManualRollup}
              disabled={isRollingUp}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRollingUp ? 'animate-spin' : ''}`} />
              {isRollingUp ? 'রোল-আপ হচ্ছে...' : 'আজকের রোল-আপ রান করুন'}
            </button>
          </div>

          <div className="bg-[#141417] border border-[#232328] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#1A1A1F] text-gray-400 uppercase text-[10px] tracking-wider border-b border-[#232328]">
                  <tr>
                    <th className="py-2.5 px-4">তারিখ</th>
                    <th className="py-2.5 px-4">সদস্য</th>
                    <th className="py-2.5 px-4">সাপোর্ট পয়েন্ট</th>
                    <th className="py-2.5 px-4">সাবমিশন পয়েন্ট</th>
                    <th className="py-2.5 px-4">অল-ডান</th>
                    <th className="py-2.5 px-4">ফাস্টেস্ট বোনাস</th>
                    <th className="py-2.5 px-4">স্ট্রিম বোনাস</th>
                    <th className="py-2.5 px-4 text-right text-emerald-400">মোট পয়েন্ট</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202025]">
                  {pointsHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        কোনো হিস্ট্রি রেকর্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    pointsHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-[#1A1A20]/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-gray-300">{item.date}</td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-white block">{item.memberName}</span>
                          <span className="text-[10px] text-gray-500">@{item.memberUsername}</span>
                        </td>
                        <td className="py-3 px-4 font-mono">{item.supportPoints}</td>
                        <td className="py-3 px-4 font-mono">{item.submissionPoints}</td>
                        <td className="py-3 px-4 font-mono">{item.allDonePoints}</td>
                        <td className="py-3 px-4 font-mono text-amber-300">{item.fastestBonusPoints}</td>
                        <td className="py-3 px-4 font-mono text-orange-300">{item.streakBonusPoints}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-400 text-sm">
                          {item.totalPointsToday}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Data Cleanup */}
      {showCleanupConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#141418] border border-[#2D2D35] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">নিরাপদ ডেটা ক্লিনআপ নিশ্চিতকরণ</h3>
            </div>

            <div className="space-y-3 text-xs text-gray-300">
              <p>
                আপনি কি <strong className="text-emerald-400">{retentionDaysInput} দিনের পুরোনো</strong> কাঁচা সাপোর্ট রেকর্ড পার্জ করতে চান?
              </p>

              <div className="bg-[#1B1B22] p-3 rounded-lg border border-[#2B2B33] space-y-1.5">
                <span className="text-emerald-300 font-semibold block">নিরাপত্তা নিশ্চয়তা:</span>
                <ul className="list-disc pl-4 space-y-1 text-gray-400">
                  <li>মূল <strong>Daily Links</strong> কোনো অবস্থাতেই ডিলিট হবে না।</li>
                  <li>মেম্বারদের <strong>মোট পয়েন্ট ও সাপোর্ট কাউন্টার</strong> অক্ষত থাকবে।</li>
                  <li>ক্লিনআপের পূর্বে আজকের পয়েন্ট ব্যাচ রোল-আপ স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।</li>
                  <li>রিপোর্ট, নোটিশ বা অডিট রেকর্ড অপরিবর্তিত থাকবে।</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCleanupConfirmModal(false)}
                className="px-4 py-2 bg-[#25252D] hover:bg-[#30303A] text-gray-300 rounded-lg text-xs font-medium transition-all"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleExecuteCleanup}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md"
              >
                হ্যাঁ, ক্লিনআপ সম্পন্ন করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
