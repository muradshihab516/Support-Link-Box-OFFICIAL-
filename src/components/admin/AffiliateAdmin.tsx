import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Share2, 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  TrendingUp, 
  DollarSign, 
  MousePointerClick,
  Sparkles
} from 'lucide-react';
import { formatBDT } from '../../utils/helpers';

interface AffiliateProgram {
  id: string;
  name: string;
  category: string;
  commissionRate: string;
  affiliateUrl: string;
  clicks: number;
  conversions: number;
  earnedBDT: number;
}

export const AffiliateAdmin: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [programs, setPrograms] = useState<AffiliateProgram[]>([
    {
      id: 'aff_1',
      name: 'Namecheap Domain & Web Hosting',
      category: 'Web Hosting',
      commissionRate: '35% per purchase',
      affiliateUrl: 'https://namecheap.pxf.io/c/supportlinkbox',
      clicks: 432,
      conversions: 18,
      earnedBDT: 4200
    },
    {
      id: 'aff_2',
      name: 'Canva Pro for Social Creators',
      category: 'Graphic Design',
      commissionRate: '$10 per pro trial',
      affiliateUrl: 'https://partner.canva.com/c/supportlinkbox',
      clicks: 890,
      conversions: 32,
      earnedBDT: 7500
    },
    {
      id: 'aff_3',
      name: 'Descript AI Video Editor',
      category: 'Video Editing',
      commissionRate: '15% recurring',
      affiliateUrl: 'https://descript.com?fpr=supportlinkbox',
      clicks: 310,
      conversions: 9,
      earnedBDT: 3100
    }
  ]);

  const totalClicks = programs.reduce((acc, p) => acc + p.clicks, 0);
  const totalConversions = programs.reduce((acc, p) => acc + p.conversions, 0);
  const totalEarned = programs.reduce((acc, p) => acc + p.earnedBDT, 0);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
          <Share2 className="w-6 h-6 text-indigo-400" />
          Affiliate Marketing & Creator Partner Links
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Generate passive revenue by recommending essential creator tools (Hosting, Canva, Microphones, Video AI).
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Affiliate Revenue</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{formatBDT(totalEarned)}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Across {programs.length} active programs</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Referral Clicks</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1 font-mono">{totalClicks.toLocaleString()}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">From free tools & member hub</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Conversions</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{totalConversions} sales</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Conversion rate: {((totalConversions / totalClicks) * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Programs Table */}
      <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-white">
          Active Affiliate Campaigns
        </h3>

        <div className="overflow-x-auto border border-[#1E1E20] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E0E10] text-gray-400 font-semibold border-b border-[#1E1E20]">
              <tr>
                <th className="py-2.5 px-3">Partner Program</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Commission Rate</th>
                <th className="py-2.5 px-3 text-center">Clicks</th>
                <th className="py-2.5 px-3 text-center">Conversions</th>
                <th className="py-2.5 px-3 text-center">Earned (BDT)</th>
                <th className="py-2.5 px-3 text-right">Referral Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E20]">
              {programs.map(prog => (
                <tr key={prog.id} className="hover:bg-[#18181B] transition-colors">
                  <td className="py-3 px-3 font-bold text-white">
                    {prog.name}
                  </td>
                  <td className="py-3 px-3 text-gray-400">
                    {prog.category}
                  </td>
                  <td className="py-3 px-3 font-semibold text-indigo-400">
                    {prog.commissionRate}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-gray-400">
                    {prog.clicks}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                    {prog.conversions}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                    {formatBDT(prog.earnedBDT)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleCopy(prog.id, prog.affiliateUrl)}
                      className="px-2.5 py-1 bg-[#0E0E10] hover:bg-[#1E1E20] border border-[#1E1E20] text-gray-300 hover:text-white rounded-lg text-[11px] font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      {copiedId === prog.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === prog.id ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
