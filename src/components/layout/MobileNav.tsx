import React from 'react';
import { LayoutDashboard, Flame, Trophy, Wrench, Shield, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const { currentUser, getTodaySupportStats } = useApp();
  const stats = currentUser ? getTodaySupportStats(currentUser.id) : null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E0E10]/95 backdrop-blur-lg border-t border-[#1E1E20] pb-safe transition-colors">
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto px-2">
        {/* Dashboard */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            currentView === 'dashboard'
              ? 'text-indigo-400 font-bold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Today</span>
        </button>

        {/* Daily Links */}
        <button
          onClick={() => onNavigate('daily_links')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            currentView === 'daily_links'
              ? 'text-indigo-400 font-bold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <div className="relative">
            <Flame className="w-5 h-5 text-orange-500" />
            {stats && stats.pendingCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-red-500 text-white rounded-full text-[9px] font-bold">
                {stats.pendingCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Links</span>
        </button>

        {/* Leaderboard */}
        <button
          onClick={() => onNavigate('leaderboard')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            currentView === 'leaderboard'
              ? 'text-indigo-400 font-bold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-[10px]">Ranks</span>
        </button>

        {/* Free Tools */}
        <button
          onClick={() => onNavigate('free_tools')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            currentView === 'free_tools'
              ? 'text-indigo-400 font-bold'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Wrench className="w-5 h-5 text-emerald-500" />
          <span className="text-[10px]">Tools</span>
        </button>

        {/* Profile / Admin */}
        {currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin') ? (
          <button
            onClick={() => onNavigate('admin')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              currentView.startsWith('admin')
                ? 'text-indigo-400 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-5 h-5 text-indigo-400" />
            <span className="text-[10px]">Admin</span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('profile')}
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              currentView === 'profile'
                ? 'text-indigo-400 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Profile</span>
          </button>
        )}
      </div>
    </div>
  );
};
