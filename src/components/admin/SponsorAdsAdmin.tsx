import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Megaphone, 
  Plus, 
  DollarSign, 
  Eye, 
  MousePointerClick, 
  CheckCircle2, 
  Trash2, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Sponsor } from '../../types';
import { formatBDT } from '../../utils/helpers';

export const SponsorAdsAdmin: React.FC = () => {
  const { sponsors, addSponsor, toggleSponsorStatus, removeSponsor } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [sponsorName, setSponsorName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [position, setPosition] = useState<Sponsor['position']>('leaderboard_top');
  const [pricePaid, setPricePaid] = useState<number>(5000);
  const [durationDays, setDurationDays] = useState<number>(30);

  const totalSponsorEarnings = (sponsors || []).reduce((acc, s) => acc + (s?.pricePaid || 0), 0);
  const totalImpressions = (sponsors || []).reduce((acc, s) => acc + (s?.impressions || 0), 0);
  const totalClicks = (sponsors || []).reduce((acc, s) => acc + (s?.clicks || 0), 0);

  const handleAddSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sponsorName || !destinationUrl) return;

    addSponsor({
      sponsorName,
      title,
      description,
      destinationUrl,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
      position,
      pricePaid,
      durationDays
    });

    setShowAddModal(false);
    setSponsorName('');
    setTitle('');
    setDescription('');
    setDestinationUrl('');
    setImageUrl('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
            <Megaphone className="w-6 h-6 text-indigo-400" />
            Direct Sponsors & Custom Banner Campaigns
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monetize high-traffic daily support member sessions with direct sponsored partnerships and banner placements.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Sponsor Campaign</span>
        </button>
      </div>

      {/* Monetization KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Direct Revenue</div>
          <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{formatBDT(totalSponsorEarnings)}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">{sponsors.length} active partnerships</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Delivered Impressions</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1 font-mono">{totalImpressions.toLocaleString()}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Across member feed & leaderboard</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#131315] border border-[#1E1E20] shadow-xs">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Click-Throughs</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{totalClicks.toLocaleString()}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">CTR: {((totalClicks / (totalImpressions || 1)) * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Sponsors Table */}
      <div className="bg-[#131315] rounded-2xl border border-[#1E1E20] p-5 space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-white">
          Active & Past Sponsor Campaigns ({sponsors.length})
        </h3>

        <div className="overflow-x-auto border border-[#1E1E20] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0E0E10] text-gray-400 font-semibold border-b border-[#1E1E20]">
              <tr>
                <th className="py-2.5 px-3">Partner</th>
                <th className="py-2.5 px-3">Placement</th>
                <th className="py-2.5 px-3 text-center">Amount</th>
                <th className="py-2.5 px-3 text-center">Impressions</th>
                <th className="py-2.5 px-3 text-center">Clicks</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E20]">
              {sponsors.map(sponsor => (
                <tr key={sponsor.id} className="hover:bg-[#18181B] transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img src={sponsor.imageUrl} alt={sponsor.sponsorName} className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#1E1E20]" />
                      <div>
                        <div className="font-bold text-white">{sponsor.sponsorName}</div>
                        <div className="text-[10px] text-gray-500 truncate max-w-[200px]">{sponsor.title}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 capitalize">
                      {sponsor.position.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">
                    {formatBDT(sponsor.pricePaid)}
                  </td>

                  <td className="py-3 px-3 text-center font-mono text-gray-400">
                    {sponsor.impressions.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-400">
                    {sponsor.clicks}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => toggleSponsorStatus(sponsor.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                        sponsor.status === 'active'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          : 'bg-[#1E1E20] text-gray-500'
                      }`}
                    >
                      {sponsor.status}
                    </button>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={sponsor.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-gray-500 hover:text-indigo-400 rounded-lg hover:bg-[#1E1E20] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => {
                          if (confirm(`Delete sponsor ${sponsor.sponsorName}?`)) {
                            removeSponsor(sponsor.id);
                          }
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-[#1E1E20] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sponsor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#131315] rounded-2xl shadow-2xl border border-[#1E1E20] w-full max-w-md p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-400" />
              New Sponsor Campaign
            </h3>

            <form onSubmit={handleAddSponsor} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Creator Academy Pro"
                  value={sponsorName}
                  onChange={e => setSponsorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white placeholder-gray-600 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Tagline / Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50% Off Video Editing Course for Creators"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white placeholder-gray-600 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Destination Link (URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://creatoracademy.com/offer"
                  value={destinationUrl}
                  onChange={e => setDestinationUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white placeholder-gray-600 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Image / Logo URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white placeholder-gray-600 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Placement</label>
                  <select
                    value={position}
                    onChange={e => setPosition(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white focus:border-indigo-500"
                  >
                    <option value="leaderboard_top" className="bg-[#131315]">Top of Leaderboard</option>
                    <option value="top_banner" className="bg-[#131315]">Top Site Banner</option>
                    <option value="feed_middle" className="bg-[#131315]">Inside Daily Feed</option>
                    <option value="sidebar" className="bg-[#131315]">Sidebar Widget</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Revenue Paid (BDT)</label>
                  <input
                    type="number"
                    value={pricePaid}
                    onChange={e => setPricePaid(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-[#0E0E10] border border-[#1E1E20] rounded-xl text-white font-mono font-bold focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-indigo-600/20 transition-colors"
                >
                  Save & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
