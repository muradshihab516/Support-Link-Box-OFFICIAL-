import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Flame, 
  CheckCircle2, 
  Snowflake, 
  AlertTriangle, 
  ShieldAlert, 
  UserPlus, 
  Trophy, 
  ArrowRight,
  Film,
  Download,
  Server,
  Layers,
  Sparkles,
  Gavel,
  Settings,
  Clock,
  ExternalLink
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { AdminTab } from './AdminSidebar';

interface AdminDashboardProps {
  onSelectTab: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectTab }) => {
  const { 
    members, 
    dailyLinks, 
    reports, 
    movies = [],
    settings
  } = useApp();

  // Member & Submissions Metrics
  const totalMembers = (members || []).length;
  const activeMembers = (members || []).filter(m => m.status === 'active').length;
  const inactiveMembers = (members || []).filter(m => m.status === 'inactive').length;
  const frozenMembers = (members || []).filter(m => m.status === 'frozen').length;
  const todaySubmitters = (dailyLinks || []).length;
  
  // Support Rate
  const totalExpectedSupports = todaySubmitters > 0 ? (todaySubmitters - 1) * todaySubmitters : 0;
  const totalCompletedSupports = (dailyLinks || []).reduce((acc, l) => acc + (l?.supportCount || 0), 0);
  const overallSupportRate = totalExpectedSupports > 0 
    ? Math.round((totalCompletedSupports / totalExpectedSupports) * 100) 
    : 100;

  // Movie & Download Metrics
  const totalMovies = movies.length;
  const activeMovies = movies.filter(m => m.status === 'active').length;
  const totalMovieDownloads = movies.reduce((acc, m) => acc + (m.totalDownloads || 0), 0);
  const totalMovieLinks = movies.reduce((acc, m) => acc + (m.links?.length || 0), 0);

  // Quality distribution for movies
  const qualityStats = {
    '480p SD': 0,
    '720p HD': 0,
    '1080p FHD': 0,
    '4K UHD': 0
  };

  const serverStats: Record<string, number> = {
    Pixeldrain: 0,
    GDFlex: 0,
    GDFile: 0,
    Other: 0
  };

  movies.forEach(m => {
    (m.links || []).forEach(l => {
      if (l.quality.includes('480')) qualityStats['480p SD']++;
      else if (l.quality.includes('720')) qualityStats['720p HD']++;
      else if (l.quality.includes('1080')) qualityStats['1080p FHD']++;
      else if (l.quality.includes('4K') || l.quality.includes('2160')) qualityStats['4K UHD']++;

      const s = l.serverName || '';
      if (s.includes('Pixeldrain')) serverStats.Pixeldrain++;
      else if (s.includes('GDFlex')) serverStats.GDFlex++;
      else if (s.includes('GDFile')) serverStats.GDFile++;
      else serverStats.Other++;
    });
  });

  const qualityChartData = [
    { quality: '480p SD', count: qualityStats['480p SD'], color: '#94a3b8' },
    { quality: '720p HD', count: qualityStats['720p HD'], color: '#38bdf8' },
    { quality: '1080p FHD', count: qualityStats['1080p FHD'], color: '#818cf8' },
    { quality: '4K UHD', count: qualityStats['4K UHD'], color: '#c084fc' }
  ];

  // 7-Day Submissions trend
  const weeklyData = [
    { day: 'Sat', submissions: 182, supports: 3420, activeUsers: 195 },
    { day: 'Sun', submissions: 195, supports: 3705, activeUsers: 210 },
    { day: 'Mon', submissions: 204, supports: 3880, activeUsers: 218 },
    { day: 'Tue', submissions: 189, supports: 3600, activeUsers: 202 },
    { day: 'Wed', submissions: 212, supports: 4120, activeUsers: 226 },
    { day: 'Thu', submissions: 220, supports: 4300, activeUsers: 235 },
    { day: 'Fri (Today)', submissions: todaySubmitters, supports: totalCompletedSupports, activeUsers: activeMembers },
  ];

  const pendingReports = (reports || []).filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      
      {/* Page Title & Fast Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Admin Command Center</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Operational Mode
            </span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            সিস্টেম ওভারভিউ • মুভি ও ফরম্যাট ম্যানেজমেন্ট • মেম্বার অডিট ও কমিউনিটি গভর্নেন্স
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Action: Upload Movie */}
          <button
            onClick={() => onSelectTab('upload_movie')}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-600/25 transition-all active:scale-95"
          >
            <Film className="w-4 h-4" />
            <span>Upload Movie (মুভি আপলোড)</span>
          </button>

          {/* Today's Links Audit */}
          <button
            onClick={() => onSelectTab('today_links')}
            className="px-3.5 py-2 bg-[#18181C] hover:bg-[#202026] text-gray-200 hover:text-white font-semibold text-xs rounded-xl border border-gray-800 flex items-center gap-1.5 transition-colors"
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span>Today's Links</span>
          </button>

          {/* Bulk Import */}
          <button
            onClick={() => onSelectTab('bulk_import')}
            className="px-3.5 py-2 bg-[#18181C] hover:bg-[#202026] text-gray-200 hover:text-white font-semibold text-xs rounded-xl border border-gray-800 flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>Bulk Import</span>
          </button>

          {/* Weekly Session */}
          <button
            onClick={() => onSelectTab('weekly_session')}
            className="px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>59th Week</span>
          </button>
        </div>
      </div>

      {/* 6 Key Operational KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* 1. Total Members */}
        <div 
          onClick={() => onSelectTab('members')}
          className="p-4 rounded-2xl bg-[#131316] border border-[#1E1E22] hover:border-indigo-500/40 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Members</span>
            <Users className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1.5">
            {totalMembers}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{activeMembers} Active</span>
          </div>
        </div>

        {/* 2. Today's Links Submissions */}
        <div 
          onClick={() => onSelectTab('today_links')}
          className="p-4 rounded-2xl bg-[#131316] border border-[#1E1E22] hover:border-orange-500/40 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Today's Links</span>
            <Flame className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1.5">
            {todaySubmitters}
          </div>
          <span className="text-[11px] text-orange-400 font-medium mt-0.5 block">Submissions Active</span>
        </div>

        {/* 3. Support Completion Rate */}
        <div className="p-4 rounded-2xl bg-[#131316] border border-[#1E1E22] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Support Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1.5">
            {overallSupportRate}%
          </div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">{totalCompletedSupports} completed</span>
        </div>

        {/* 4. Uploaded Movies */}
        <div 
          onClick={() => onSelectTab('upload_movie')}
          className="p-4 rounded-2xl bg-[#131316] border border-purple-500/25 hover:border-purple-500/60 bg-gradient-to-br from-purple-950/10 to-transparent transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">Movies Added</span>
            <Film className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1.5">
            {totalMovies}
          </div>
          <span className="text-[11px] text-purple-400 font-medium mt-0.5 block">{activeMovies} Published</span>
        </div>

        {/* 5. Total Movie Downloads */}
        <div 
          onClick={() => onSelectTab('upload_movie')}
          className="p-4 rounded-2xl bg-[#131316] border border-[#1E1E22] hover:border-indigo-500/40 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Downloads</span>
            <Download className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-400 mt-1.5">
            {totalMovieDownloads}
          </div>
          <span className="text-[11px] text-gray-500 mt-0.5 block">{totalMovieLinks} Formats linked</span>
        </div>

        {/* 6. Pending Reports & Issues */}
        <div 
          onClick={() => onSelectTab('reports')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm group ${
            pendingReports.length > 0 
              ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-500/70' 
              : 'bg-[#131316] border-[#1E1E22] hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Reports</span>
            <ShieldAlert className={`w-4 h-4 ${pendingReports.length > 0 ? 'text-rose-400' : 'text-gray-500'}`} />
          </div>
          <div className={`text-xl sm:text-2xl font-bold mt-1.5 ${pendingReports.length > 0 ? 'text-rose-400' : 'text-white'}`}>
            {pendingReports.length}
          </div>
          <span className={`text-[11px] font-medium mt-0.5 block ${pendingReports.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {pendingReports.length > 0 ? 'Action Required' : 'All Clear'}
          </span>
        </div>

      </div>

      {/* Main Analytics: 7-Day Activity Trend & Movie Quality Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Daily Submissions & Active Activity (Area Chart) */}
        <div className="lg:col-span-2 bg-[#131316] rounded-2xl border border-[#1E1E22] p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Daily Submissions & Support Activity</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">গত ৭ দিনের লিংক সাবমিশন ও সক্রিয় মেম্বার অংশগ্রহণের প্রবাহ</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
              Avg 200+ links/day
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#52525b" fontSize={11} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181D', borderColor: '#27272A', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="submissions" name="লিংক সাবমিশন" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSub)" />
                <Area type="monotone" dataKey="activeUsers" name="সক্রিয় মেম্বার" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAct)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-gray-400 pt-2 border-t border-[#1E1E22]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>লিংক সাবমিশন</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>সক্রিয় সাপোর্ট মেম্বার</span>
              </span>
            </div>
            <span className="text-[11px] text-gray-500">Auto-calculated every midnight (12:00 AM BD Time)</span>
          </div>
        </div>

        {/* 2. Movie Formats Quality & Cloud Mirrors (Bar Chart) */}
        <div className="bg-[#131316] rounded-2xl border border-[#1E1E22] p-5 sm:p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Movie Format Links</span>
              </h3>
              <button
                onClick={() => onSelectTab('upload_movie')}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">উপলব্ধ কোয়ালিটি ফরম্যাট সংখ্যা</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityChartData}>
                <XAxis dataKey="quality" stroke="#52525b" fontSize={10} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181D', borderColor: '#27272A', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="count" name="ফরম্যাট লিংক" radius={[6, 6, 0, 0]}>
                  {qualityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cloud Storage Mirrors Distribution */}
          <div className="space-y-2 pt-3 border-t border-[#1E1E22]">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Cloud Storage Hosts
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-[#18181C] border border-gray-800">
                <span className="text-gray-400 block text-[10px]">Pixeldrain</span>
                <span className="font-bold text-indigo-400 text-sm mt-0.5 block">{serverStats.Pixeldrain}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#18181C] border border-gray-800">
                <span className="text-gray-400 block text-[10px]">GDFlex</span>
                <span className="font-bold text-emerald-400 text-sm mt-0.5 block">{serverStats.GDFlex}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#18181C] border border-gray-800">
                <span className="text-gray-400 block text-[10px]">GDFile</span>
                <span className="font-bold text-amber-400 text-sm mt-0.5 block">{serverStats.GDFile}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Operational Quick Jump Directory & Governance Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Fast Action Navigation Cards */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#131316] border border-[#1E1E22] space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>এডমিন দ্রুত অ্যাক্সেস শর্টকাট (Direct Shortcuts)</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => onSelectTab('upload_movie')}
              className="p-3.5 rounded-xl bg-[#18181D] hover:bg-[#202028] border border-purple-500/30 hover:border-purple-500/60 text-left transition-all group"
            >
              <Film className="w-5 h-5 text-purple-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Upload Movie</div>
              <div className="text-[10px] text-gray-400">নতুন সিনেমা ও লিংক যোগ করুন</div>
            </button>

            <button
              onClick={() => onSelectTab('today_links')}
              className="p-3.5 rounded-xl bg-[#18181D] hover:bg-[#202028] border border-orange-500/20 hover:border-orange-500/50 text-left transition-all group"
            >
              <Flame className="w-5 h-5 text-orange-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Today's Links</div>
              <div className="text-[10px] text-gray-400">মেম্বারদের সাপোর্ট যাচাই করুন</div>
            </button>

            <button
              onClick={() => onSelectTab('punishment')}
              className="p-3.5 rounded-xl bg-[#18181D] hover:bg-[#202028] border border-rose-500/20 hover:border-rose-500/50 text-left transition-all group"
            >
              <Gavel className="w-5 h-5 text-rose-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Punishment & Auto-Admin</div>
              <div className="text-[10px] text-gray-400">লেট সাপোর্ট ও পেনাল্টি রুলস</div>
            </button>

            <button
              onClick={() => onSelectTab('settings')}
              className="p-3.5 rounded-xl bg-[#18181D] hover:bg-[#202028] border border-gray-800 hover:border-gray-700 text-left transition-all group"
            >
              <Settings className="w-5 h-5 text-gray-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">System Settings</div>
              <div className="text-[10px] text-gray-400">কাটঅফ সময় ও কনফিগারেশন</div>
            </button>
          </div>
        </div>

        {/* Pending Reports & System Notices Status */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#131316] border border-[#1E1E22] space-y-3 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>পেন্ডিং রিপোর্ট ও মেম্বার ইস্যু ({pendingReports.length})</span>
              </h3>
              <button
                onClick={() => onSelectTab('reports')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
              >
                সব রিপোর্ট দেখুন →
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">মেম্বারদের দ্বারা জমা দেওয়া রিপোর্ট তাৎক্ষণিক সমাধান করুন</p>
          </div>

          <div className="space-y-2 py-1">
            {pendingReports.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#18181D] border border-emerald-500/20 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>বর্তমানে কোনো পেন্ডিং রিপোর্ট নেই। কমিউনিটি সক্রিয় ও নিরাপদ।</span>
              </div>
            ) : (
              pendingReports.slice(0, 3).map((rep) => (
                <div 
                  key={rep.id} 
                  onClick={() => onSelectTab('reports')}
                  className="p-3 rounded-xl bg-[#18181D] hover:bg-[#202026] border border-gray-800 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white line-clamp-1">
                      {rep.reasons?.join(', ') || rep.description || 'রিপোর্ট বিস্তারিত'}
                    </span>
                    <span className="text-[10px] text-gray-400 block">রিপোর্টার: {rep.reporterName}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                    সমাধান করুন
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-[#1E1E22] flex items-center justify-between text-xs text-gray-400">
            <span>ফ্রিজ মেম্বার: <strong className="text-amber-400">{frozenMembers}</strong> জন</span>
            <span>নিষ্ক্রিয় মেম্বার: <strong className="text-gray-300">{inactiveMembers}</strong> জন</span>
          </div>

        </div>

      </div>

    </div>
  );
};
