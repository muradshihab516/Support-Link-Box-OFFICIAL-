import React, { useState } from 'react';
import { 
  Palette, 
  Check, 
  X, 
  Sparkles, 
  Sun, 
  Moon, 
  Image as ImageIcon, 
  Sliders, 
  Eye, 
  Link as LinkIcon,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { THEME_PRESETS, DEFAULT_THEME_ID } from '../../data/themePresets';
import { ThemePreset } from '../../types';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentThemeId, 
    customThemeBgUrl, 
    themeOverlayOpacity, 
    activeTheme, 
    setTheme, 
    setThemeOverlayOpacity,
    darkMode,
    toggleDarkMode 
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customUrlInput, setCustomUrlInput] = useState<string>(customThemeBgUrl || '');
  const [customError, setCustomError] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState<string>('');

  if (!isOpen) return null;

  const filteredThemes = THEME_PRESETS.filter(theme => {
    if (selectedCategory === 'all') return true;
    return theme.category === selectedCategory;
  });

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) {
      setCustomError('অনুগ্রহ করে একটি সঠিক ছবির লিঙ্ক (Image URL) দিন');
      return;
    }
    if (!customUrlInput.startsWith('http://') && !customUrlInput.startsWith('https://')) {
      setCustomError('লিঙ্কটি https:// দিয়ে শুরু হতে হবে');
      return;
    }
    setCustomError('');
    setTheme('custom_wallpaper', customUrlInput.trim());
    setCopiedNotification('কাস্টম ব্যাকগ্রাউন্ড সফলভাবে সেট হয়েছে!');
    setTimeout(() => setCopiedNotification(''), 3000);
  };

  const handleSelectTheme = (theme: ThemePreset) => {
    if (theme.id === 'custom_wallpaper') {
      if (customUrlInput) {
        setTheme('custom_wallpaper', customUrlInput);
      } else {
        setTheme('custom_wallpaper');
      }
    } else {
      setTheme(theme.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-colors ${
          darkMode 
            ? 'bg-[#0E0E12]/95 border-white/10 text-white' 
            : 'bg-white/95 border-slate-200 text-slate-900 shadow-indigo-500/10'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
          darkMode ? 'border-white/10 bg-[#14141A]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  থিম ও ব্যাকগ্রাউন্ড গ্যালারি
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  HD Wallpapers
                </span>
              </div>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                আপনার মন মতো সুন্দর ব্যাকগ্রাউন্ড ছবি নির্বাচন করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Day / Night mode toggle inside header */}
            <button
              onClick={toggleDarkMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                darkMode
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-sm'
              }`}
              title="ডার্ক এবং ডে মোড পরিবর্তন করুন"
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>ডে মোড</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span>ডার্ক মোড</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                darkMode ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Active Theme Preview Strip */}
          <div className={`p-4 rounded-2xl border relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            darkMode ? 'bg-[#15151C] border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            <div className="flex items-center gap-3.5">
              <div 
                className="w-14 h-14 rounded-xl overflow-hidden border-2 border-indigo-500 shadow-md bg-cover bg-center shrink-0 relative"
                style={{ 
                  backgroundImage: activeTheme.bgImageUrl ? `url(${activeTheme.bgImageUrl})` : 'none',
                  backgroundColor: '#1E1E24'
                }}
              >
                {!activeTheme.bgImageUrl && (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    Pure
                  </div>
                )}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> সক্রিয় থিম
                  </span>
                  <span className="text-xs font-semibold text-indigo-400">{activeTheme.badgeText}</span>
                </div>
                <h4 className="text-sm font-bold text-current">{activeTheme.banglaName}</h4>
                <p className={`text-[11px] ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  {activeTheme.description}
                </p>
              </div>
            </div>

            {/* Opacity / Tint Controller */}
            <div className={`w-full sm:w-64 p-3 rounded-xl border space-y-2 shrink-0 ${
              darkMode ? 'bg-[#0E0E12] border-white/5' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-medium">
                <span className="flex items-center gap-1.5 text-gray-400">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  ব্যাকগ্রাউন্ড দৃশ্যমানতা (Tint)
                </span>
                <span className="font-bold text-indigo-400">{themeOverlayOpacity}%</span>
              </div>
              <input
                type="range"
                min="45"
                max="95"
                step="5"
                value={themeOverlayOpacity}
                onChange={(e) => setThemeOverlayOpacity(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[9px] text-gray-500">
                <span>স্পষ্ট ছবি (Clear)</span>
                <span>গভীর অন্ধকার (Focus)</span>
              </div>
            </div>
          </div>

          {/* Categories Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'সব থিম (All)' },
              { id: 'cosmic', label: '🌌 মহাকাশ (Cosmic)' },
              { id: 'cyberpunk', label: '🏙️ সাইবারপাঙ্ক (Neon)' },
              { id: 'nature', label: '🌲 প্রকৃতি (Nature)' },
              { id: 'cinema', label: '🎬 সিনেমা (Cinema)' },
              { id: 'sunset', label: '🌅 গোধূলি (Sunset)' },
              { id: 'anime', label: '✨ অ্যানিমে (Anime)' },
              { id: 'minimal', label: '🖤 মিনিমাল (Minimal)' },
              { id: 'custom', label: '🔗 কাস্টম ছবি (Custom)' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : darkMode 
                      ? 'bg-[#15151B] text-gray-300 border-white/5 hover:bg-[#1C1C24]'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Theme Presets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredThemes.map(theme => {
              const isSelected = currentThemeId === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme)}
                  className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 text-left flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-600/10'
                      : darkMode
                        ? 'bg-[#14141B] border-white/10 hover:border-indigo-500/40 hover:bg-[#1A1A24]'
                        : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Image Preview Box */}
                  <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                    {theme.bgImageUrl ? (
                      <img 
                        src={theme.thumbnailUrl || theme.bgImageUrl} 
                        alt={theme.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#121216] flex items-center justify-center">
                        <div className="p-3 rounded-full bg-white/5 border border-white/10">
                          <ImageIcon className="w-6 h-6 text-gray-500" />
                        </div>
                      </div>
                    )}

                    {/* Dark gradient overlay on thumbnail */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Badge top-right */}
                    <div className="absolute top-2.5 right-2.5">
                      {isSelected ? (
                        <span className="px-2 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg">
                          <Check className="w-3 h-3" /> সিলেক্টেড
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-semibold border border-white/10">
                          {theme.badgeText}
                        </span>
                      )}
                    </div>

                    {/* Mini live card look in preview */}
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-bold">
                      <span className="drop-shadow-md">{theme.banglaName}</span>
                      <span 
                        className="w-3 h-3 rounded-full border border-white/40 shadow-sm"
                        style={{ backgroundColor: theme.accentColor }}
                      />
                    </div>
                  </div>

                  {/* Card Info Details */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <p className={`text-xs line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                      {theme.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-white/5">
                      <span className={`text-[10px] font-mono ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                        {theme.category.toUpperCase()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectTheme(theme);
                        }}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : darkMode
                              ? 'bg-white/5 hover:bg-indigo-600 hover:text-white text-gray-300'
                              : 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700'
                        }`}
                      >
                        {isSelected ? 'অ্যাক্টিভ' : 'প্রয়োগ করুন'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Wallpaper Input Box */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
            darkMode ? 'bg-[#15151F] border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-pink-400" />
              <h4 className="text-sm font-bold text-current">
                নিজের পছন্দের যেকোনো ছবির লিংক ব্যবহার করুন (Custom Wallpaper)
              </h4>
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
              যেকোনো সরাসরি ছবির লিংক (যেমন: Unsplash, Imgur, বা আপনার হোস্ট করা ছবি) এখানে পেস্ট করে সরাসরি সাইটের ব্যাকগ্রাউন্ড হিসেবে ব্যবহার করতে পারেন।
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/... বা আপনার ছবির সরাসরি লিংক"
                value={customUrlInput}
                onChange={(e) => {
                  setCustomUrlInput(e.target.value);
                  setCustomError('');
                }}
                className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs border transition-colors ${
                  darkMode 
                    ? 'bg-[#0E0E12] border-white/15 text-white placeholder:text-gray-500 focus:border-pink-500' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-pink-500'
                }`}
              />
              <button
                onClick={handleApplyCustomUrl}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 transition-all shrink-0"
              >
                কাস্টম ওয়ালপেপার সেট করুন
              </button>
            </div>

            {customError && (
              <p className="text-xs font-semibold text-rose-400">{customError}</p>
            )}
            {copiedNotification && (
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> {copiedNotification}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs ${
          darkMode ? 'border-white/10 bg-[#121217]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTheme(DEFAULT_THEME_ID);
                setThemeOverlayOpacity(80);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                darkMode ? 'border-white/10 hover:bg-white/5 text-gray-400' : 'border-slate-300 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              ডিফল্ট রিসেট
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            সম্পন্ন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
