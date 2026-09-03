import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  Moon, 
  Sun, 
  Shield, 
  User, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  LogOut, 
  Flame, 
  ExternalLink,
  Layers,
  Wrench,
  Trophy,
  LayoutDashboard,
  Play
} from 'lucide-react';
import { AuthModal } from '../auth/AuthModal';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onSubmitLink?: () => void;
  onOpenAuthModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onSubmitLink, onOpenAuthModal }) => {
  const { 
    currentUser, 
    currentCommunity, 
    communities, 
    switchCommunity, 
    darkMode, 
    toggleDarkMode, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    settings,
    logout
  } = useApp();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showCommDropdown, setShowCommDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Live countdown to midnight deadline
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      const diff = midnight.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Deadline reached');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${mins}m ${secs}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadNotifs = notifications.filter(n => !n.read && (n.userId === currentUser?.id || n.userId === 'all'));

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0E0E10]/95 backdrop-blur-md border-b border-[#1E1E20] transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Logo & Community Switcher */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2.5 text-left group focus:outline-none"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform shrink-0">
                  <span>SL</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                    Support Link Box
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-indigo-600/10 text-indigo-400 rounded border border-indigo-500/20">
                      v2.0
                    </span>
                  </span>
                  <span className="text-[11px] text-gray-500 block -mt-0.5">
                    Submit • Support • Grow
                  </span>
                </div>
              </button>

              {/* Multi-Community Dropdown for SaaS capability */}
              <div className="relative ml-1 hidden md:block">
                <button
                  onClick={() => setShowCommDropdown(!showCommDropdown)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-300 bg-[#131315] hover:bg-[#1E1E20] rounded-lg border border-[#1E1E20] transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="max-w-[130px] truncate">{currentCommunity.name}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {showCommDropdown && (
                  <div className="absolute left-0 mt-2 w-64 bg-[#0E0E10] rounded-xl shadow-2xl border border-[#1E1E20] py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Switch Community Space
                    </div>
                    {communities.map(comm => (
                      <button
                        key={comm.id}
                        onClick={() => { switchCommunity(comm.id); setShowCommDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#1E1E20] ${
                          comm.id === currentCommunity.id ? 'text-indigo-400 font-semibold bg-indigo-600/10 border-l-2 border-indigo-500' : 'text-gray-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{comm.name}</div>
                          <div className="text-[10px] text-gray-500">{comm.memberCount} members</div>
                        </div>
                        {comm.id === currentCommunity.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Desktop Navigation links */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'dashboard'
                    ? 'text-indigo-400 bg-indigo-600/10 border border-indigo-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#1E1E20]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>

              <button
                onClick={() => onNavigate('daily_links')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'daily_links'
                    ? 'text-indigo-400 bg-indigo-600/10 border border-indigo-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#1E1E20]'
                }`}
              >
                <Flame className="w-4 h-4 text-orange-500" />
                Today's Links
              </button>

              <button
                onClick={() => onNavigate('support_session')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'support_session' || currentView === 'youtube_player'
                    ? 'text-red-400 bg-red-600/15 border border-red-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-[#1E1E20]'
                }`}
                title="ইউটিউব স্টাইল সাপোর্ট সেশন (প্লেয়ার ভিউ)"
              >
                <Play className="w-3.5 h-3.5 text-red-500 fill-current" />
                <span>Player Session</span>
              </button>

              <button
                onClick={() => onNavigate('leaderboard')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'leaderboard'
                    ? 'text-indigo-400 bg-indigo-600/10 border border-indigo-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#1E1E20]'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                Leaderboard
              </button>

              <button
                onClick={() => onNavigate('free_tools')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  currentView === 'free_tools'
                    ? 'text-indigo-400 bg-indigo-600/10 border border-indigo-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-[#1E1E20]'
                }`}
              >
                <Wrench className="w-4 h-4 text-emerald-500" />
                Free Tools
              </button>

              {currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentView.startsWith('admin')
                      ? 'text-indigo-300 bg-indigo-600/20 border border-indigo-500/30'
                      : 'text-indigo-400 hover:bg-indigo-600/10'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </button>
              )}
            </nav>

            {/* Right: Actions, Deadline, Notification, Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Daily Support Deadline Timer Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#131315] border border-[#1E1E20] rounded-lg text-indigo-300 text-xs font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span className="font-mono font-semibold">{timeRemaining}</span>
                <span className="text-[10px] text-gray-500">left</span>
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                aria-label="Toggle theme"
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1E1E20] transition-colors border border-transparent hover:border-[#1E1E20]"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notification Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-[#1E1E20] relative transition-colors border border-transparent hover:border-[#1E1E20]"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0E0E10]" />
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0E0E10] rounded-2xl shadow-2xl border border-[#1E1E20] py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-[#1E1E20] flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        Notifications ({unreadNotifs.length})
                      </span>
                      {unreadNotifs.length > 0 && (
                        <button 
                          onClick={markAllNotificationsRead}
                          className="text-[11px] text-indigo-400 hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-[#1E1E20]">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 8).map(notif => (
                          <div 
                            key={notif.id}
                            onClick={() => markNotificationRead(notif.id)}
                            className={`p-3 text-xs cursor-pointer hover:bg-[#1E1E20] transition-colors ${
                              !notif.read ? 'bg-indigo-600/10' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-white line-clamp-1">
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-gray-500 shrink-0">{notif.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Account / Role Badge */}
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-full sm:rounded-lg border border-[#1E1E20] bg-[#131315] hover:bg-[#1E1E20] transition-colors"
                  >
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-700" 
                    />
                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-bold text-white line-clamp-1">
                        {currentUser.name}
                      </div>
                      <div className="text-[10px] text-gray-400 capitalize">
                        {currentUser.role.replace('_', ' ')}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#0E0E10] rounded-2xl shadow-2xl border border-[#1E1E20] py-1.5 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3.5 py-2.5 border-b border-[#1E1E20]">
                        <div className="text-xs font-bold text-white">{currentUser.name}</div>
                        <div className="text-[11px] text-gray-400">@{currentUser.username} • #{currentUser.memberNumber}</div>
                        <div className="mt-1 flex items-center gap-2 text-[10px]">
                          <span className="font-semibold text-orange-500 flex items-center gap-0.5">
                            <Flame className="w-3 h-3" /> {currentUser.currentStreak}d Streak
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-indigo-400">{currentUser.totalPoints} Pts</span>
                        </div>
                      </div>

                      <button
                        onClick={() => { onNavigate('profile'); setShowUserDropdown(false); }}
                        className="w-full text-left px-3.5 py-2 text-xs text-gray-300 hover:bg-[#1E1E20] flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        My Profile & History
                      </button>

                      <button
                        onClick={() => { setShowAuthModal(true); setShowUserDropdown(false); }}
                        className="w-full text-left px-3.5 py-2 text-xs text-indigo-400 hover:bg-[#1E1E20] flex items-center gap-2 font-medium"
                      >
                        <Sparkles className="w-4 h-4" />
                        Switch Persona / Account
                      </button>

                      {currentUser.role !== 'member' && (
                        <button
                          onClick={() => { onNavigate('admin'); setShowUserDropdown(false); }}
                          className="w-full text-left px-3.5 py-2 text-xs text-indigo-400 hover:bg-[#1E1E20] flex items-center gap-2 font-medium"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Console
                        </button>
                      )}

                      <div className="border-t border-[#1E1E20] my-1" />

                      <button
                        onClick={() => { logout(); setShowUserDropdown(false); }}
                        className="w-full text-left px-3.5 py-2 text-xs text-rose-400 hover:bg-[#1E1E20] flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Account Switcher / Registration Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};
