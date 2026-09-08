import React, { useState } from 'react';
import { 
  Film, 
  Plus, 
  Upload, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ExternalLink, 
  Eye, 
  Download, 
  Server, 
  Sparkles, 
  Layers, 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  Clock,
  Star,
  Calendar,
  Globe
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MovieItem, MovieFormatLink } from '../../types';
import { generateRandomToken } from '../../data/mockMovies';
import { MovieDetailsModal } from '../entertainment/MovieDetailsModal';
import { MovieDownloadGatewayModal } from '../entertainment/MovieDownloadGatewayModal';

const GENRE_OPTIONS = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 
  'Drama', 'Fantasy', 'History', 'Horror', 'Mystery', 'Romance', 
  'Sci-Fi', 'Thriller', 'War', 'Bangla', 'Hindi', 'English', 'South Dubbed'
];

const SERVER_OPTIONS = [
  'Pixeldrain',
  'GDFlex Fast',
  'GDFile Cloud',
  'Google Drive Mirror',
  'Mega.nz',
  'Direct Server CDN',
  'Other Cloud Host'
];

const QUALITY_PRESETS = [
  '480p SD',
  '720p HD Web-DL',
  '1080p FHD 10bit',
  '1080p 60FPS',
  '4K UHD HDR'
];

export const UploadMovieAdmin: React.FC = () => {
  const { movies, addMovie, updateMovie, deleteMovie, toggleMovieStatus } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [previewMovie, setPreviewMovie] = useState<MovieItem | null>(null);
  const [testGatewayLink, setTestGatewayLink] = useState<{ movie: MovieItem; link: MovieFormatLink } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Action']);
  const [customGenre, setCustomGenre] = useState('');
  const [releaseYear, setReleaseYear] = useState<number>(new Date().getFullYear());
  const [duration, setDuration] = useState('2h 10m');
  const [language, setLanguage] = useState('Bangla Dubbed / English Dual');
  const [rating, setRating] = useState<number>(8.2);
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState<'active' | 'draft'>('active');

  // Ad & Gateway Settings
  const [enableTimerGateway, setEnableTimerGateway] = useState(true);
  const [gatewayTimerSeconds, setGatewayTimerSeconds] = useState(4);
  const [sponsorNote, setSponsorNote] = useState('Support Link Box Community Movie Hub');

  // Multi-format links repeater
  const [formatLinks, setFormatLinks] = useState<Array<{
    id?: string;
    quality: string;
    serverName: string;
    destinationUrl: string;
    downloadToken: string;
    fileSize: string;
    status: 'active' | 'inactive';
  }>>([
    {
      quality: '720p HD Web-DL',
      serverName: 'Pixeldrain',
      destinationUrl: '',
      downloadToken: generateRandomToken(8),
      fileSize: '1.1 GB',
      status: 'active'
    },
    {
      quality: '1080p FHD 10bit',
      serverName: 'GDFlex Fast',
      destinationUrl: '',
      downloadToken: generateRandomToken(8),
      fileSize: '2.4 GB',
      status: 'active'
    }
  ]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const resetForm = () => {
    setTitle('');
    setThumbnail('');
    setDescription('');
    setSelectedGenres(['Action']);
    setCustomGenre('');
    setReleaseYear(new Date().getFullYear());
    setDuration('2h 15m');
    setLanguage('Bangla Dubbed / English Dual');
    setRating(8.0);
    setIsFeatured(false);
    setStatus('active');
    setEnableTimerGateway(true);
    setGatewayTimerSeconds(4);
    setSponsorNote('Support Link Box Community Movie Hub');
    setFormatLinks([
      {
        quality: '720p HD Web-DL',
        serverName: 'Pixeldrain',
        destinationUrl: '',
        downloadToken: generateRandomToken(8),
        fileSize: '1.2 GB',
        status: 'active'
      },
      {
        quality: '1080p FHD 10bit',
        serverName: 'GDFlex Fast',
        destinationUrl: '',
        downloadToken: generateRandomToken(8),
        fileSize: '2.5 GB',
        status: 'active'
      }
    ]);
    setEditingMovieId(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditMovie = (movie: MovieItem) => {
    setEditingMovieId(movie.id);
    setTitle(movie.title);
    setThumbnail(movie.thumbnail);
    setDescription(movie.description || '');
    setSelectedGenres(movie.genre || ['Action']);
    setReleaseYear(movie.releaseYear || new Date().getFullYear());
    setDuration(movie.duration || '2h 10m');
    setLanguage(movie.language || 'Bangla');
    setRating(movie.rating || 8.0);
    setIsFeatured(!!movie.isFeatured);
    setStatus(movie.status === 'archived' ? 'draft' : movie.status);
    setEnableTimerGateway(movie.adSettings?.enableTimerGateway ?? true);
    setGatewayTimerSeconds(movie.adSettings?.gatewayTimerSeconds || 4);
    setSponsorNote(movie.adSettings?.sponsorNote || '');
    setFormatLinks(movie.links.map(l => ({
      id: l.id,
      quality: l.quality,
      serverName: l.serverName,
      destinationUrl: l.destinationUrl,
      downloadToken: l.downloadToken,
      fileSize: l.fileSize || '',
      status: l.status
    })));
    setIsModalOpen(true);
  };

  const handleAddFormatRow = () => {
    setFormatLinks(prev => [
      ...prev,
      {
        quality: '1080p FHD 10bit',
        serverName: 'GDFile Cloud',
        destinationUrl: '',
        downloadToken: generateRandomToken(8),
        fileSize: '2.2 GB',
        status: 'active'
      }
    ]);
  };

  const handleRemoveFormatRow = (index: number) => {
    if (formatLinks.length <= 1) {
      showToast('কমপক্ষে ১টি ফরম্যাট লিংক থাকতে হবে।', 'error');
      return;
    }
    setFormatLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateFormatRow = (index: number, field: string, value: any) => {
    setFormatLinks(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const handleRefreshRowToken = (index: number) => {
    handleUpdateFormatRow(index, 'downloadToken', generateRandomToken(8));
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleAddCustomGenre = () => {
    if (!customGenre.trim()) return;
    const clean = customGenre.trim();
    if (!selectedGenres.includes(clean)) {
      setSelectedGenres(prev => [...prev, clean]);
    }
    setCustomGenre('');
  };

  const handleSubmitMovie = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('মুভির নাম প্রদান করুন।', 'error');
      return;
    }
    if (!thumbnail.trim()) {
      showToast('মুভির থাম্বনেইল / পোস্টার লিংক প্রদান করুন।', 'error');
      return;
    }
    if (selectedGenres.length === 0) {
      showToast('কমপক্ষে ১টি জঁর (Genre) সিলেক্ট করুন।', 'error');
      return;
    }

    // Validate links
    const validLinks: MovieFormatLink[] = formatLinks.map((l, idx) => ({
      id: l.id || `lnk_${Date.now()}_${idx}`,
      quality: l.quality.trim() || '720p HD',
      serverName: l.serverName || 'Pixeldrain',
      destinationUrl: l.destinationUrl.trim() || 'https://pixeldrain.com',
      downloadToken: l.downloadToken || generateRandomToken(8),
      fileSize: l.fileSize.trim() || '1.0 GB',
      status: l.status,
      clickCount: 0,
      createdAt: new Date().toISOString()
    }));

    if (editingMovieId) {
      // Update
      const res = updateMovie(editingMovieId, {
        title: title.trim(),
        thumbnail: thumbnail.trim(),
        description: description.trim(),
        genre: selectedGenres,
        releaseYear: Number(releaseYear),
        duration: duration.trim(),
        language: language.trim(),
        rating: Number(rating),
        isFeatured,
        status,
        adSettings: {
          enableTimerGateway,
          gatewayTimerSeconds: Number(gatewayTimerSeconds),
          sponsorNote: sponsorNote.trim()
        },
        links: validLinks
      });
      if (res.success) {
        showToast('✓ মুভি তথ্য সফলভাবে আপডেট হয়েছে!');
        setIsModalOpen(false);
      }
    } else {
      // Create new
      const res = addMovie({
        title: title.trim(),
        thumbnail: thumbnail.trim(),
        description: description.trim(),
        genre: selectedGenres,
        releaseYear: Number(releaseYear),
        duration: duration.trim(),
        language: language.trim(),
        rating: Number(rating),
        isFeatured,
        status,
        adSettings: {
          enableTimerGateway,
          gatewayTimerSeconds: Number(gatewayTimerSeconds),
          sponsorNote: sponsorNote.trim()
        },
        links: validLinks
      });
      if (res.success) {
        showToast(`✓ "${res.movie.title}" মুভিটি সফলভাবে আপলোড হয়েছে!`);
        setIsModalOpen(false);
      }
    }
  };

  // Stats
  const totalMovies = movies.length;
  const activeMovies = movies.filter(m => m.status === 'active').length;
  const totalFormats = movies.reduce((acc, m) => acc + (m.links?.length || 0), 0);
  const totalDownloads = movies.reduce((acc, m) => acc + (m.totalDownloads || 0), 0);

  const filteredMovies = movies.filter(m => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return m.title.toLowerCase().includes(q) || m.genre.some(g => g.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`p-4 rounded-xl text-sm font-bold flex items-center justify-between border shadow-lg animate-in fade-in duration-200 ${
          notification.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
            : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Stats Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Film className="w-6 h-6 text-indigo-400" />
              Movie Lover & Cloud Uploads Management
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              Entertainment
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            বিভিন্ন ক্লাউড স্টোরেজে (Pixeldrain, GDFlex, GDFile) মুভি আপলোড করে একাধিক ফরম্যাট (480p, 720p, 1080p, 4K) লিংক যুক্ত করুন।
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-indigo-600/30 transition-all shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Movie</span>
        </button>
      </div>

      {/* Analytics Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#121215] border border-gray-800">
          <div className="text-xs text-gray-400 font-medium">মোট মুভি আপলোড</div>
          <div className="text-2xl font-black text-white mt-1">{totalMovies}</div>
          <div className="text-[11px] text-emerald-400 mt-0.5">{activeMovies} টি সক্রিয় রয়েছে</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121215] border border-gray-800">
          <div className="text-xs text-gray-400 font-medium">মোট ফরম্যাট মিরর লিংক</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">{totalFormats}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">গড়ে {(totalFormats / (totalMovies || 1)).toFixed(1)} কোয়ালিটি/মুভি</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121215] border border-gray-800">
          <div className="text-xs text-gray-400 font-medium">মোট ডাউনলোড ট্রাফিক</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{totalDownloads}</div>
          <div className="text-[11px] text-gray-400 mt-0.5">সিকিউর টোকেন রিডাইরেক্ট</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121215] border border-gray-800">
          <div className="text-xs text-gray-400 font-medium">নিরাপত্তা মেকানিজম</div>
          <div className="text-xs font-bold text-amber-400 mt-1.5 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" />
            Opaque Token + Interstitial
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">Anti-Scrape Protection</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-3.5 rounded-2xl bg-[#121215] border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="মুভির নাম বা ক্যাটাগরি দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-2 bg-[#18181D] border border-gray-700/60 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-gray-400 font-medium">
          প্রদর্শিত হচ্ছে: <span className="font-bold text-white">{filteredMovies.length}</span> টি মুভি
        </div>
      </div>

      {/* Movies Table / List */}
      <div className="rounded-2xl bg-[#121215] border border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#18181E] border-b border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">মুভি ও পোস্টার</th>
                <th className="p-3.5">ক্যাটাগরি ও রিলিজ</th>
                <th className="p-3.5">উপলব্ধ ফরম্যাটসমূহ</th>
                <th className="p-3.5">ভিউ ও ডাউনলোড</th>
                <th className="p-3.5">স্ট্যাটাস</th>
                <th className="p-3.5 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filteredMovies.map((movie) => (
                <tr key={movie.id} className="hover:bg-[#16161B] transition-colors">
                  
                  {/* Poster & Title */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-14 rounded-lg overflow-hidden bg-gray-900 border border-gray-700 shrink-0">
                        <img
                          src={movie.thumbnail}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm line-clamp-1">
                          {movie.title}
                        </h4>
                        <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                          <span>{movie.duration}</span>
                          {movie.rating && (
                            <span className="text-amber-400 font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400" /> {movie.rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Genres & Year */}
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {movie.genre.slice(0, 3).map((g, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px] font-medium">
                          {g}
                        </span>
                      ))}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">
                      রিলিজ: {movie.releaseYear || 'N/A'} • {movie.language || 'Bangla'}
                    </div>
                  </td>

                  {/* Formats list */}
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {movie.links.map((l) => (
                        <span
                          key={l.id}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            l.status === 'active'
                              ? 'bg-indigo-950/60 border-indigo-500/30 text-indigo-300'
                              : 'bg-gray-800 border-gray-700 text-gray-500 line-through'
                          }`}
                          title={`${l.serverName} - ${l.fileSize || ''}`}
                        >
                          {l.quality}
                        </span>
                      ))}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {movie.links.length} টি হোস্ট লিংক
                    </div>
                  </td>

                  {/* Views & Downloads */}
                  <td className="p-3.5">
                    <div className="text-white font-bold flex items-center gap-1">
                      <Download className="w-3 h-3 text-emerald-400" />
                      {movie.totalDownloads || 0}
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Eye className="w-3 h-3" />
                      {movie.totalViews || 0} ভিউ
                    </div>
                  </td>

                  {/* Status Toggle */}
                  <td className="p-3.5">
                    <button
                      onClick={() => toggleMovieStatus(movie.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                        movie.status === 'active'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                      }`}
                    >
                      {movie.status === 'active' ? 'Active' : 'Draft / Paused'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPreviewMovie(movie)}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-indigo-600 text-gray-300 hover:text-white transition-colors"
                        title="ইউজার ভিউ প্রিভিউ"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleEditMovie(movie)}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-emerald-600 text-gray-300 hover:text-white transition-colors"
                        title="সম্পাদনা করুন"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`আপনি কি "${movie.title}" মুভিটি সম্পূর্ণ ডিলিট করতে চান?`)) {
                            deleteMovie(movie.id);
                            showToast('✓ মুভি মুছে ফেলা হয়েছে।');
                          }
                        }}
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-rose-600 text-gray-300 hover:text-white transition-colors"
                        title="ডিলিট করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload / Edit Movie Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-[#111114] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#17171D] border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {editingMovieId ? 'Edit Movie & Formats' : 'Upload New Movie & Multi-Links'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Pixeldrain, GDFlex, GDFile মিরর স্টোরেজ থেকে লিংক অ্যাড করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSubmitMovie} className="p-5 sm:p-6 overflow-y-auto space-y-6">
              
              {/* Basic Movie Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">
                    মুভির নাম (Title) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="যেমন: Inception (2010) Dual Audio [Bangla Sub]"
                    className="w-full px-3.5 py-2.5 bg-[#18181E] border border-gray-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Thumbnail Image URL & Live Preview */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">
                    থাম্বনেইল / পোস্টার ইমেজ লিংক (Poster URL) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://... (Direct image link)"
                    className="w-full px-3.5 py-2.5 bg-[#18181E] border border-gray-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-2 text-[10px] text-gray-400">
                    <span>কুইক ডেমো পোস্টার:</span>
                    <button
                      type="button"
                      onClick={() => setThumbnail('https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=600&auto=format&fit=crop&q=80')}
                      className="text-indigo-400 hover:underline"
                    >
                      Poster 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setThumbnail('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80')}
                      className="text-indigo-400 hover:underline"
                    >
                      Poster 2
                    </button>
                  </div>
                </div>

                {/* Thumbnail Preview Box */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">পোস্টার প্রিভিউ</label>
                  <div className="h-20 rounded-xl border border-gray-700 bg-gray-900 overflow-hidden flex items-center gap-3 p-2">
                    {thumbnail ? (
                      <>
                        <img
                          src={thumbnail}
                          alt="Poster preview"
                          className="h-full w-14 object-cover rounded"
                          onError={(e) => { (e.target as any).src = 'https://via.placeholder.com/150x200?text=No+Image'; }}
                        />
                        <div className="text-[11px] text-emerald-400">✓ পোস্টার ইমেজ লিংকটি লোড হচ্ছে</div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-500 px-3">ইমেজ লিংক পেস্ট করলে এখানে প্রিভিউ দেখা যাবে</div>
                    )}
                  </div>
                </div>

                {/* Release Year, Duration, Rating, Language */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">রিলিজের বছর (Year)</label>
                  <input
                    type="number"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#18181E] border border-gray-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">মুভির ব্যাপ্তি (Duration)</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="2h 15m"
                    className="w-full px-3.5 py-2.5 bg-[#18181E] border border-gray-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">ভাষা / অডিও (Language)</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="Bangla Dubbed / Dual Audio"
                    className="w-full px-3.5 py-2.5 bg-[#18181E] border border-gray-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">IMDb রেটিং (Rating 1.0 - 10.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#18181E] border border-gray-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

              </div>

              {/* Genre Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">
                  জঁর / ক্যাটাগরি সিলেক্ট করুন (Genres) <span className="text-rose-400">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {GENRE_OPTIONS.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        selectedGenres.includes(genre)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-[#18181E] text-gray-400 hover:text-white border border-gray-700'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>

                {/* Custom Genre Input */}
                <div className="flex items-center gap-2 pt-1 max-w-sm">
                  <input
                    type="text"
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    placeholder="কাস্টম ক্যাটাগরি যোগ করুন..."
                    className="flex-1 px-3 py-1.5 bg-[#18181E] border border-gray-700 rounded-lg text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomGenre}
                    className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-lg"
                  >
                    যোগ করুন
                  </button>
                </div>
              </div>

              {/* Storyline / Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">মুভির বর্ণনা / সারসংক্ষেপ (Synopsis)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="মুভির সংক্ষিপ্ত কাহিনী লিখুন..."
                  className="w-full px-3.5 py-2.5 bg-[#18181E] border border-gray-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* FORMATS & MULTI-LINKS REPEATER */}
              <div className="space-y-3 pt-2 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      মুভি ফরম্যাট ও ক্লাউড স্টোরেজ লিংকসমূহ ({formatLinks.length})
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      প্রত্যেকটি কোয়ালিটির জন্য পৃথক ডাউনলোড লিংক (Pixeldrain / GDFlex / GDFile)
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddFormatRow}
                    className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-xs font-bold rounded-lg flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ ফরম্যাট যোগ করুন</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formatLinks.map((row, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl bg-[#16161B] border border-gray-800 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-400">
                          ফরম্যাট #{index + 1}
                        </span>
                        {formatLinks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFormatRow(index)}
                            className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px]"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> মুছুন
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        
                        {/* Quality Preset */}
                        <div>
                          <label className="text-[11px] text-gray-400">কোয়ালিটি ফরম্যাট</label>
                          <input
                            type="text"
                            value={row.quality}
                            onChange={(e) => handleUpdateFormatRow(index, 'quality', e.target.value)}
                            placeholder="যেমন: 720p HD"
                            className="w-full px-2.5 py-1.5 bg-[#1F1F26] border border-gray-700 rounded-lg text-xs text-white"
                          />
                        </div>

                        {/* Server Host */}
                        <div>
                          <label className="text-[11px] text-gray-400">স্টোরেজ সার্ভার</label>
                          <select
                            value={row.serverName}
                            onChange={(e) => handleUpdateFormatRow(index, 'serverName', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-[#1F1F26] border border-gray-700 rounded-lg text-xs text-white"
                          >
                            {SERVER_OPTIONS.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        {/* File Size */}
                        <div>
                          <label className="text-[11px] text-gray-400">ফাইল সাইজ (Size)</label>
                          <input
                            type="text"
                            value={row.fileSize}
                            onChange={(e) => handleUpdateFormatRow(index, 'fileSize', e.target.value)}
                            placeholder="যেমন: 1.2 GB"
                            className="w-full px-2.5 py-1.5 bg-[#1F1F26] border border-gray-700 rounded-lg text-xs text-white"
                          />
                        </div>

                      </div>

                      {/* Destination URL */}
                      <div>
                        <label className="text-[11px] text-gray-400">
                          আসল স্টোরেজ লিংক (Destination URL) <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="url"
                          required
                          value={row.destinationUrl}
                          onChange={(e) => handleUpdateFormatRow(index, 'destinationUrl', e.target.value)}
                          placeholder="https://pixeldrain.com/u/... অথবা https://gdflex.xyz/file/..."
                          className="w-full px-3 py-2 bg-[#1F1F26] border border-gray-700 rounded-lg text-xs text-white font-mono"
                        />
                      </div>

                      {/* Token & Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                          <span>Secure Token: #{row.downloadToken}</span>
                          <button
                            type="button"
                            onClick={() => handleRefreshRowToken(index)}
                            className="text-indigo-400 hover:text-indigo-300"
                            title="নতুন টোকেন জেনারেট করুন"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-300 flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={row.status === 'active'}
                              onChange={(e) => handleUpdateFormatRow(index, 'status', e.target.checked ? 'active' : 'inactive')}
                              className="rounded border-gray-700 text-indigo-600 focus:ring-0"
                            />
                            <span>সক্রিয় লিংক</span>
                          </label>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Ad & Gateway Interstitial Settings */}
              <div className="p-4 rounded-xl bg-[#16161B] border border-gray-800 space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  বিজ্ঞাপন ও গেটওয়ে সেটিংস (Monetization & Protection)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableTimerGateway}
                      onChange={(e) => setEnableTimerGateway(e.target.checked)}
                      className="rounded border-gray-700 text-indigo-600"
                    />
                    <span>ডাউনলোডের পূর্বে কাউন্টডাউন গেটওয়ে চালু রাখুন</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">কাউন্টডাউন সময়:</span>
                    <input
                      type="number"
                      min="2"
                      max="15"
                      value={gatewayTimerSeconds}
                      onChange={(e) => setGatewayTimerSeconds(Number(e.target.value))}
                      className="w-16 px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white text-center"
                    />
                    <span className="text-xs text-gray-400">সেকেন্ড</span>
                  </div>
                </div>

                <input
                  type="text"
                  value={sponsorNote}
                  onChange={(e) => setSponsorNote(e.target.value)}
                  placeholder="স্পন্সর / বিজ্ঞাপন নোট..."
                  className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs text-white"
                />
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
                >
                  {editingMovieId ? 'আপডেট সেভ করুন' : 'মুভি আপলোড সম্পন্ন করুন'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* User View Preview Modal */}
      <MovieDetailsModal
        isOpen={!!previewMovie}
        onClose={() => setPreviewMovie(null)}
        movie={previewMovie}
      />

      {/* Test Gateway Modal */}
      {testGatewayLink && (
        <MovieDownloadGatewayModal
          isOpen={true}
          onClose={() => setTestGatewayLink(null)}
          movie={testGatewayLink.movie}
          link={testGatewayLink.link}
        />
      )}

    </div>
  );
};
