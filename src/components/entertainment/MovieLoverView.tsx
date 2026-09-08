import React, { useState, useMemo } from 'react';
import { 
  Film, 
  Search, 
  Star, 
  Calendar, 
  Download, 
  Eye, 
  Layers, 
  Sparkles, 
  Filter,
  Flame,
  Clock,
  Play,
  MessageSquare,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MovieItem } from '../../types';
import { MovieDetailsModal } from './MovieDetailsModal';
import { MovieRequestModal } from './MovieRequestModal';
import { MovieRequestsSection } from './MovieRequestsSection';
import { SponsoredBanner } from '../monetization/SponsoredBanner';
import { 
  NativeMovieGridAd, 
  ModalDownloadBannerAd, 
  TopAnnouncementAd 
} from '../monetization/DemoAdUnits';

export const MovieLoverView: React.FC = () => {
  const { movies, movieRequests, incrementMovieViews } = useApp();

  const [activeSection, setActiveSection] = useState<'catalog' | 'requests'>('catalog');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'downloads' | 'rating' | 'newest'>('downloads');
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);

  // Extract unique genres across all active movies
  const availableGenres = useMemo(() => {
    const genreSet = new Set<string>();
    movies.forEach(m => {
      if (m.status === 'active' && m.genre) {
        m.genre.forEach(g => genreSet.add(g));
      }
    });
    return ['All', ...Array.from(genreSet)];
  }, [movies]);

  // Filtered and sorted movies
  const filteredMovies = useMemo(() => {
    return movies
      .filter(m => {
        // Only active movies for public view
        if (m.status !== 'active') return false;
        
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = m.title.toLowerCase().includes(q);
          const matchDesc = m.description?.toLowerCase().includes(q);
          const matchGenre = m.genre.some(g => g.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchGenre) return false;
        }

        // Genre filter
        if (selectedGenre !== 'All') {
          if (!m.genre.includes(selectedGenre)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'downloads') {
          return (b.totalDownloads || 0) - (a.totalDownloads || 0);
        }
        if (sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (sortBy === 'newest') {
          return (b.releaseYear || 0) - (a.releaseYear || 0);
        }
        return 0;
      });
  }, [movies, searchQuery, selectedGenre, sortBy]);

  const handleOpenMovie = (movie: MovieItem) => {
    incrementMovieViews(movie.id);
    setSelectedMovie(movie);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Announcement Bar */}
      <TopAnnouncementAd />

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/50 via-[#13131a] to-indigo-950/40 border border-purple-500/20 p-5 sm:p-7 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-purple-400" />
                Entertainment Hub
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                Fast Cloud Mirrors
              </span>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="px-2.5 py-0.5 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-bold border border-pink-500/30 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3 text-pink-400" />
                <span>মুভি রিকোয়েস্ট বক্স</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Film className="w-7 h-7 text-indigo-400" />
              Movie Lover Cinema & Downloads
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              আপনার পছন্দের সকল মুভি দেখুন এবং হাই-স্পিড ক্লাউড স্টোরেজ (Pixeldrain, GDFlex, GDFile) থেকে 480p, 720p, 1080p এবং 4K ফরম্যাটে সরাসরি ডাউনলোড করুন। কাঙ্ক্ষিত মুভি না পেলে রিকোয়েস্ট করুন!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800 text-center min-w-[70px]">
              <div className="text-lg font-black text-indigo-400">{movies.filter(m => m.status === 'active').length}</div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Active Movies</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-gray-800 text-center min-w-[70px]">
              <div className="text-lg font-black text-emerald-400">
                {movies.reduce((acc, m) => acc + (m.totalDownloads || 0), 0)}
              </div>
              <div className="text-[10px] text-gray-400 uppercase font-bold">Downloads</div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-purple-500/30 text-center min-w-[70px]">
              <div className="text-lg font-black text-purple-400">{movieRequests.length}</div>
              <div className="text-[10px] text-purple-300 uppercase font-bold">Requests</div>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs: Catalog vs Requests */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-gray-800/80">
          <button
            onClick={() => setActiveSection('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSection === 'catalog'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-black/30 hover:bg-white/10 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>মুভি সংগ্রহ ও ডাউনলোড (Movies Catalog)</span>
          </button>

          <button
            onClick={() => setActiveSection('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSection === 'requests'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-black/30 hover:bg-white/10 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>মুভি রিকোয়েস্ট বক্স (Movie Requests)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeSection === 'requests' ? 'bg-white/20 text-white' : 'bg-purple-500/20 text-purple-300'
            }`}>
              {movieRequests.length}
            </span>
          </button>

          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>মুভি রিকোয়েস্ট করুন</span>
          </button>
        </div>
      </div>

      {/* Sponsor Banner Slot */}
      <SponsoredBanner position="top_banner" />

      {activeSection === 'requests' ? (
        <MovieRequestsSection
          onOpenRequestModal={() => setIsRequestModalOpen(true)}
          onOpenMovieById={(movieId) => {
            const found = movies.find(m => m.id === movieId);
            if (found) {
              handleOpenMovie(found);
            }
          }}
        />
      ) : (
        <>
          {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#121216] border border-gray-800/80 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="মুভির নাম, জঁর বা কিওয়ার্ড লিখে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#18181D] border border-gray-700/60 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> সাজান:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-[#18181D] border border-gray-700/60 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="downloads">জনপ্রিয়তা (বেশি ডাউনলোড)</option>
              <option value="rating">সর্বোচ্চ রেটিং (IMDb)</option>
              <option value="newest">নতুন রিলিজ বছর</option>
            </select>
          </div>
        </div>

        {/* Genre Tags Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {availableGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedGenre === genre
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-[#18181E] text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121216] border border-gray-800 space-y-3">
          <Film className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-base font-bold text-gray-300">কোনো মুভি পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            আপনার খোঁজা কিওয়ার্ড বা ফিল্টারের সাথে মিলে এমন কোনো মুভি পাওয়া যায়নি। দয়া করে অন্য কোনো নাম দিয়ে চেষ্টা করুন।
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedGenre('All'); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
          >
            সকল মুভি দেখুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredMovies.map((movie, index) => {
            const activeLinks = movie.links.filter(l => l.status === 'active');
            const qualities = Array.from(new Set(activeLinks.map(l => l.quality.split(' ')[0])));

            return (
              <React.Fragment key={movie.id}>
                {/* Insert Native Ad in grid position 2 if available */}
                {index === 2 && <NativeMovieGridAd key="native-grid-ad-1" />}

                <div
                  onClick={() => handleOpenMovie(movie)}
                  className="group relative bg-[#131317] hover:bg-[#18181F] border border-gray-800/80 hover:border-indigo-500/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
                >
                  {/* Poster Container */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
                    <img
                      src={movie.thumbnail}
                      alt={movie.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1">
                      {movie.rating ? (
                        <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-amber-500/30 text-amber-300 text-[10px] font-extrabold flex items-center gap-1 shadow">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {movie.rating}
                        </span>
                      ) : <span />}

                      {movie.releaseYear && (
                        <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-gray-300 text-[10px] font-bold border border-white/10 shadow">
                          {movie.releaseYear}
                        </span>
                      )}
                    </div>

                    {/* Hover Quick Action Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                      <div className="p-3 rounded-full bg-indigo-600 text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-white" />
                      </div>
                    </div>

                    {/* Bottom info on poster */}
                    <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                      {qualities.slice(0, 3).map((q, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-[9px] font-extrabold backdrop-blur-xs"
                        >
                          {q}
                        </span>
                      ))}
                      {qualities.length > 3 && (
                        <span className="px-1.5 py-0.5 rounded bg-gray-900/80 text-gray-300 text-[9px] font-bold">
                          +{qualities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Info Details */}
                  <div className="p-3 sm:p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                        {movie.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {movie.genre.slice(0, 2).map((g, idx) => (
                          <span key={idx} className="text-[10px] text-gray-400">
                            {idx > 0 ? '• ' : ''}{g}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
                      <span className="flex items-center gap-1 text-[10px]">
                        <Download className="w-3 h-3 text-emerald-400" />
                        {movie.totalDownloads || 0} dl
                      </span>
                      <span className="text-[10px] text-indigo-400 font-bold group-hover:underline">
                        ফরম্যাট দেখুন →
                      </span>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
      </>
      )}

      {/* Bottom Display Ad Banner */}
      <ModalDownloadBannerAd />

      {/* Movie Details Modal */}
      <MovieDetailsModal
        isOpen={!!selectedMovie}
        onClose={() => setSelectedMovie(null)}
        movie={selectedMovie}
      />

      {/* Movie Request Modal */}
      <MovieRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => setActiveSection('requests')}
      />

    </div>
  );
};
