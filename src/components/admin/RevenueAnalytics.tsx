import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Calendar, 
  Download, 
  CreditCard, 
  CheckCircle2,
  PieChart as PieIcon,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { formatBDT, exportToCSV } from '../../utils/helpers';
import { RevenueLog } from '../../types';

export const RevenueAnalytics: React.FC = () => {
  const { sponsors, revenueLogs, addRevenueLog } = useApp();

  const [showAddLog, setShowAddLog] = useState(false);
  const [source, setSource] = useState<RevenueLog['source']>('sponsor_direct');
  const [amount, setAmount] = useState<number>(3500);
  const [currency, setCurrency] = useState('BDT');
  const [notes, setNotes] = useState('');
  const [reference, setReference] = useState('');

  const totalDirectSponsors = (sponsors || []).reduce((acc, s) => acc + (s?.pricePaid || 0), 0);
  const totalLoggedOther = (revenueLogs || []).reduce((acc, l) => acc + (l?.amount || 0), 0);
  const totalRevenue = totalDirectSponsors + totalLoggedOther;

  // Monthly revenue trend mock for visualization
  const monthlyData = [
    { month: 'Apr', sponsors: 12000, ads: 4500, affiliate: 2100, total: 18600 },
    { month: 'May', sponsors: 15000, ads: 6200, affiliate: 3400, total: 24600 },
    { month: 'Jun', sponsors: 18500, ads: 8100, affiliate: 4500, total: 31100 },
    { month: 'Jul', sponsors: 22000, ads: 11400, affiliate: 5200, total: 38600 },
    { month: 'Aug (Current)', sponsors: totalDirectSponsors, ads: 14500, affiliate: 6200, total: totalRevenue },
  ];

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;

    addRevenueLog({
      source,
      amount,
      currency,
      notes: notes.trim() || 'Manual payment entry',
      reference: reference.trim() || undefined
    });

    setShowAddLog(false);
    setAmount(3500);
    setNotes('');
    setReference('');
  };

  const handleExportFinancials = () => {
    const data = [
      ...sponsors.map(s => ({
        Type: 'Direct Sponsor',
        Partner: s.sponsorName,
        Amount: s.pricePaid,
        Currency: 'BDT',
        Status: s.status,
        Date: s.createdAt
      })),
      ...revenueLogs.map(l => ({
        Type: l.source,
        Partner: l.notes,
        Amount: l.amount,
        Currency: l.currency,
        Status: 'Received',
        Date: l.date
      }))
    ];
    exportToCSV('Support_Link_Box_Revenue_Ledger', data);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Monetization & Financial Ledger
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Transparent revenue tracking across direct sponsor banner slots, Google AdSense, and affiliate payouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportFinancials}
            className="px-3 py-2 bg-[#0E0E10] hover:bg-[#1E1E20] border border-[#1E1E20] text-gray-300 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Export Ledger CSV
          </button>
          <button
            onClick={() => setShowAddLog(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" /> Log Received Payment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Lifetime Revenue</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">{formatBDT(totalRevenue)}</div>
          <div className="text-[10px] text-emerald-400 font-bold mt-0.5">+28% growth MoM</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Direct Sponsor Revenue</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1 font-mono">{formatBDT(totalDirectSponsors)}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">{sponsors.length} brand deals</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Ad Network Revenue</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{formatBDT(14500)}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Google AdSense / MediaNet</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Manual Logs / Other</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{formatBDT(totalLoggedOther)}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">{revenueLogs.length} receipts logged</div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 sm:p-6 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-white">
          Monthly Revenue Trajectory (BDT)
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} tickFormatter={(v) => `৳${v/1000}k`} />
              <Tooltip 
                formatter={(val: any) => [formatBDT(Number(val)), 'Amount']}
                contentStyle={{ backgroundColor: '#131315', borderColor: '#1E1E20', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
              />
              <Bar dataKey="sponsors" name="Direct Sponsors" fill="#6366f1" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="ads" name="Ad Networks" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="affiliate" name="Affiliate Sales" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Manual Transactions Ledger Table */}
      <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-white">
          Recent Payment Logs ({revenueLogs.length})
        </h3>

        <div className="overflow-x-auto border border-[#1E1E20] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E0E10] text-gray-400 font-semibold border-b border-[#1E1E20]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Revenue Source</th>
                <th className="py-2.5 px-3">Description / Partner</th>
                <th className="py-2.5 px-3">Reference / TrxID</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E20]">
              {revenueLogs.map(log => (
                <tr key={log.id} className="hover:bg-[#18181B] transition-colors">
                  <td className="py-3 px-3 text-gray-500 font-mono">{log.date}</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 capitalize">
                      {log.source.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {log.notes}
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-500">
                    {log.reference || 'N/A'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    +{formatBDT(log.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Revenue Log Modal */}
      {showAddLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#131315] rounded-2xl shadow-2xl border border-[#1E1E20] w-full max-w-md p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Log Received Community Revenue
            </h3>

            <form onSubmit={handleAddLog} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Revenue Channel *</label>
                <select
                  value={source}
                  onChange={e => setSource(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white font-semibold focus:border-indigo-500"
                >
                  <option value="sponsor_direct" className="bg-[#131315]">Direct Sponsor Deal</option>
                  <option value="ad_network" className="bg-[#131315]">Google AdSense / MediaNet</option>
                  <option value="affiliate" className="bg-[#131315]">Affiliate Commission Payout</option>
                  <option value="donation" className="bg-[#131315]">Community Tip / Donation</option>
                  <option value="saas_subscription" className="bg-[#131315]">SaaS Subscription (Future)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Amount (BDT) *</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white font-mono font-bold focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Partner / Note</label>
                <input
                  type="text"
                  placeholder="e.g. bKash payment from Sponsor X"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white placeholder-gray-600 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Transaction Reference / TrxID</label>
                <input
                  type="text"
                  placeholder="e.g. BKASH_8X992A"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white font-mono placeholder-gray-600 focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLog(false)}
                  className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-emerald-600/20"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
