import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, 
  Flame, 
  CheckCircle2, 
  Snowflake, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  ShieldAlert, 
  UserPlus, 
  Trophy, 
  ArrowRight,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { formatBDT } from '../../utils/helpers';
import { AdminTab } from './AdminSidebar';

interface AdminDashboardProps {
  onSelectTab: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectTab }) => {
  const { 
    members, 
    dailyLinks, 
    supportRecords, 
    sponsors, 
    revenueLogs, 
    reports, 
    notices,
    currentWeek 
  } = useApp();

  // Calculate Metrics
  const totalMembers = (members || []).length;
  const activeMembers = (members || []).filter(m => m.status === 'active').length;
  const inactiveMembers = (members || []).filter(m => m.status === 'inactive').length;
  const frozenMembers = (members || []).filter(m => m.status === 'frozen').length;
  const todaySubmitters = (dailyLinks || []).length;
  
  // Total expected vs done supports today
  const totalExpectedSupports = todaySubmitters > 0 ? (todaySubmitters - 1) * todaySubmitters : 0;
  const totalCompletedSupports = (dailyLinks || []).reduce((acc, l) => acc + (l?.supportCount || 0), 0);
  const overallSupportRate = totalExpectedSupports > 0 
    ? Math.round((totalCompletedSupports / totalExpectedSupports) * 100) 
    : 100;

  // Financial metrics
  const totalDirectSponsors = (sponsors || []).reduce((acc, s) => acc + (s?.pricePaid || 0), 0);
  const totalAdRevenue = 14500; // Estimated ad network impressions
  const totalAffiliate = 6200;
  const grandTotalRevenue = totalDirectSponsors + totalAdRevenue + totalAffiliate;

  // Chart data: 7-Day Submissions trend
  const weeklyData = [
    { day: 'Sat', submissions: 182, supports: 3420, activeUsers: 195 },
    { day: 'Sun', submissions: 195, supports: 3705, activeUsers: 210 },
    { day: 'Mon', submissions: 204, supports: 3880, activeUsers: 218 },
    { day: 'Tue', submissions: 189, supports: 3600, activeUsers: 202 },
    { day: 'Wed', submissions: 212, supports: 4120, activeUsers: 226 },
    { day: 'Thu', submissions: 220, supports: 4300, activeUsers: 235 },
    { day: 'Fri (Today)', submissions: todaySubmitters, supports: totalCompletedSupports, activeUsers: activeMembers },
  ];

  // Revenue source breakdown data
  const revenuePieData = [
    { name: 'Direct Sponsors', value: totalDirectSponsors, color: '#4f46e5' },
    { name: 'Google Ads / MediaNet', value: totalAdRevenue, color: '#10b981' },
    { name: 'Affiliate Commissions', value: totalAffiliate, color: '#f59e0b' },
  ];

  const pendingReports = reports.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Community Command Center
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Support Link Box Management Console • Real-time traffic, member audits & monetization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('bulk_import')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={() => onSelectTab('weekly_session')}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Trophy className="w-4 h-4" />
            <span>59th Week Session</span>
          </button>
        </div>
      </div>

      {/* Operational KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        <div 
          onClick={() => onSelectTab('members')}
          className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs cursor-pointer hover:border-indigo-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Members</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">
            {totalMembers}
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">{activeMembers} Active</span>
        </div>

        <div 
          onClick={() => onSelectTab('today_links')}
          className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs cursor-pointer hover:border-orange-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Today's Links</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white mt-1">
            {todaySubmitters}
          </div>
          <span className="text-[10px] text-orange-400 font-semibold mt-0.5 block">Submissions Active</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Support Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">
            {overallSupportRate}%
          </div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">{totalCompletedSupports} completed</span>
        </div>

        <div 
          onClick={() => onSelectTab('inactive_frozen')}
          className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs cursor-pointer hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Inactive</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">
            {inactiveMembers}
          </div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Need reminder</span>
        </div>

        <div 
          onClick={() => onSelectTab('inactive_frozen')}
          className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs cursor-pointer hover:border-blue-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Frozen</span>
            <Snowflake className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-400 mt-1">
            {frozenMembers}
          </div>
          <span className="text-[10px] text-gray-500 mt-0.5 block">Auto-isolated</span>
        </div>

        <div 
          onClick={() => onSelectTab('reports')}
          className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs cursor-pointer hover:border-rose-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Reports</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-400 mt-1">
            {pendingReports.length}
          </div>
          <span className="text-[10px] text-rose-400 font-semibold mt-0.5 block">Pending Review</span>
        </div>

      </div>

      {/* Revenue & Monetization Metrics Highlight */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#131315] border border-[#1E1E20] text-white shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E1E20] pb-3">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Platform Monetization Dashboard
            </span>
            <h3 className="text-lg sm:text-xl font-bold">
              Total Community Revenue: {formatBDT(grandTotalRevenue)}
            </h3>
          </div>
          <button
            onClick={() => onSelectTab('revenue')}
            className="px-3.5 py-1.5 bg-[#0E0E10] hover:bg-[#1E1E20] text-gray-300 hover:text-white text-xs font-semibold rounded-lg border border-[#1E1E20] flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Full Revenue Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="p-3.5 bg-[#0E0E10] rounded-xl border border-[#1E1E20]">
            <span className="text-xs text-gray-400 block">Direct Sponsors (4 Brands)</span>
            <div className="text-xl font-bold text-amber-400 mt-1">{formatBDT(totalDirectSponsors)}</div>
            <span className="text-[11px] text-gray-500">Paid upfront via bKash/Bank</span>
          </div>

          <div className="p-3.5 bg-[#0E0E10] rounded-xl border border-[#1E1E20]">
            <span className="text-xs text-gray-400 block">Ad Networks (Google AdSense)</span>
            <div className="text-xl font-bold text-emerald-400 mt-1">{formatBDT(totalAdRevenue)}</div>
            <span className="text-[11px] text-gray-500">45k page impressions/mo</span>
          </div>

          <div className="p-3.5 bg-[#0E0E10] rounded-xl border border-[#1E1E20]">
            <span className="text-xs text-gray-400 block">Affiliate & Partner Commissions</span>
            <div className="text-xl font-bold text-indigo-400 mt-1">{formatBDT(totalAffiliate)}</div>
            <span className="text-[11px] text-gray-500">Hosting & Creator Tool links</span>
          </div>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Activity Area Chart */}
        <div className="lg:col-span-2 bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                Daily Submissions & Active Community Activity
              </h3>
              <p className="text-xs text-gray-500">7-day continuous link submissions and support volume</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
              Avg 200/day
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
                <XAxis dataKey="day" stroke="#52525b" fontSize={11} />
                <YAxis stroke="#52525b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131315', borderColor: '#1E1E20', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="submissions" name="Link Submissions" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorSub)" />
                <Area type="monotone" dataKey="activeUsers" name="Active Members" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAct)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Breakdown Pie Chart */}
        <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">
              Revenue Stream Breakdown
            </h3>
            <p className="text-xs text-gray-500">Distribution across sponsors and traffic ads</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenuePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenuePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [formatBDT(Number(val)), 'Revenue']}
                  contentStyle={{ backgroundColor: '#131315', borderColor: '#1E1E20', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#1E1E20] text-xs">
            {revenuePieData.map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                  {r.name}
                </span>
                <span className="font-bold text-white font-mono">{formatBDT(r.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
