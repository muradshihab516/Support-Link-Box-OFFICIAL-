import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { LandingPage } from './components/public/LandingPage';
import { MemberDashboard } from './components/member/MemberDashboard';
import { DailyLinksView } from './components/member/DailyLinksView';
import { LeaderboardView } from './components/member/LeaderboardView';
import { MemberProfileView } from './components/member/MemberProfileView';
import { PlaylistSupportSession } from './components/member/PlaylistSupportSession';
import { FreeToolsHub } from './components/tools/FreeToolsHub';
import { AdminLayout } from './components/admin/AdminLayout';
import { LinkSubmissionModal } from './components/member/LinkSubmissionModal';
import { ReportModal } from './components/member/ReportModal';
import { ReportConversationModal } from './components/member/ReportConversationModal';
import { AuthModal } from './components/auth/AuthModal';
import { LoginPage } from './components/auth/LoginPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AnnouncementSection } from './components/announcements/AnnouncementSection';
import { AllDoneSection } from './components/alldone/AllDoneSection';

const VALID_VIEWS = ['dashboard', 'daily_links', 'support_session', 'leaderboard', 'announcements', 'all_done', 'profile', 'free_tools', 'admin', 'login'];

const getInitialView = (): string => {
  try {
    const hash = window.location.hash.replace('#', '');
    if (hash && VALID_VIEWS.includes(hash)) {
      return hash;
    }
    const saved = localStorage.getItem('slb_current_view');
    if (saved && VALID_VIEWS.includes(saved)) {
      return saved;
    }
  } catch {}
  return 'daily_links';
};

const AppContent: React.FC = () => {
  const { 
    currentMember, 
    activeReportModalId, 
    setActiveReportModalId,
    darkMode,
    activeTheme,
    themeOverlayOpacity
  } = useApp();
  const [currentView, setCurrentViewState] = useState<string>(getInitialView);

  // Sync dark mode class on document element
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Dynamic CSS variables for active theme colors
  React.useEffect(() => {
    if (activeTheme?.accentColor) {
      document.documentElement.style.setProperty('--theme-accent', activeTheme.accentColor);
      document.documentElement.style.setProperty('--theme-glow', activeTheme.glowColor);
    }
  }, [activeTheme]);

  const setCurrentView = (view: string) => {
    setCurrentViewState(view);
    try {
      localStorage.setItem('slb_current_view', view);
      window.location.hash = view;
    } catch {}
  };

  React.useEffect(() => {
    const handleHashChange = () => {
      try {
        const hash = window.location.hash.replace('#', '');
        if (hash && VALID_VIEWS.includes(hash)) {
          setCurrentViewState(hash);
          localStorage.setItem('slb_current_view', hash);
        }
      } catch {}
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Modals state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [reportTargetLink, setReportTargetLink] = useState<{ id: string; number: number; member: string } | undefined>(undefined);

  const handleOpenReport = (linkInfo?: { id: string; number: number; member: string }) => {
    setReportTargetLink(linkInfo);
    setIsReportModalOpen(true);
  };

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return (
          <LandingPage
            onEnterApp={() => setCurrentView('dashboard')}
            onNavigate={(view) => setCurrentView(view)}
          />
        );
      case 'dashboard':
        return (
          <MemberDashboard
            onNavigate={(view) => setCurrentView(view)}
            onSubmitLink={() => setIsSubmitModalOpen(true)}
            onOpenReport={handleOpenReport}
          />
        );
      case 'daily_links':
        return (
          <DailyLinksView
            onSubmitLink={() => setIsSubmitModalOpen(true)}
            onOpenReport={handleOpenReport}
          />
        );
      case 'support_session':
      case 'youtube_player':
        return (
          <div className="py-2 sm:py-4">
            <PlaylistSupportSession
              onClose={() => setCurrentView('daily_links')}
            />
          </div>
        );
      case 'leaderboard':
        return (
          <LeaderboardView
            onNavigate={(view) => setCurrentView(view)}
          />
        );
      case 'announcements':
        return (
          <AnnouncementSection
            onNavigate={(view) => setCurrentView(view)}
          />
        );
      case 'all_done':
        return (
          <AllDoneSection
            onNavigate={(view) => setCurrentView(view)}
          />
        );
      case 'profile':
        return (
          <MemberProfileView
            onOpenReport={handleOpenReport}
          />
        );
      case 'free_tools':
        return (
          <FreeToolsHub />
        );
      case 'admin':
        return (
          <AdminLayout />
        );
      case 'login':
        return (
          <LoginPage 
            onLoginSuccess={() => setCurrentView('daily_links')} 
            onNavigate={(v) => setCurrentView(v)} 
          />
        );
      default:
        return (
          <MemberDashboard
            onNavigate={(view) => setCurrentView(view)}
            onSubmitLink={() => setIsSubmitModalOpen(true)}
            onOpenReport={handleOpenReport}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen relative flex flex-col font-sans transition-colors duration-300 selection:bg-indigo-600 selection:text-white ${
      darkMode ? 'text-gray-200' : 'text-slate-800'
    }`}>
      
      {/* Dynamic HD Theme Background Wallpaper & Gradient Engine */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-700 ease-out"
        style={{ 
          background: activeTheme?.gradientFallback || (darkMode ? 'linear-gradient(135deg, #090B18 0%, #150C28 50%, #05050A 100%)' : 'linear-gradient(135deg, #F8FAFC 0%, #EDF2F7 100%)')
        }}
      >
        {activeTheme?.bgImageUrl && (
          <img 
            key={activeTheme.id + (activeTheme.bgImageUrl || '')}
            src={activeTheme.bgImageUrl}
            alt={activeTheme.name}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            className="w-full h-full object-cover select-none transition-opacity duration-700"
            style={{ 
              filter: darkMode ? 'brightness(0.9) contrast(1.08)' : 'brightness(0.96) contrast(1.02)'
            }}
          />
        )}

        {/* Day / Dark overlay tint - smooth gradient to guarantee perfect contrast and readability */}
        <div 
          className={`absolute inset-0 transition-colors duration-500 ${
            darkMode 
              ? 'bg-gradient-to-b from-[#08080C]/65 via-[#08080C]/35 to-[#08080C]/75' 
              : 'bg-gradient-to-b from-white/75 via-white/50 to-white/80'
          }`}
          style={{ opacity: Math.min(0.9, Math.max(0.05, themeOverlayOpacity / 100)) }}
        />
      </div>

      {/* Top Navigation */}
      <div className="relative z-40">
        <Navbar
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onSubmitLink={() => setIsSubmitModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
      </div>

      {/* Main View Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pb-20 sm:pb-12 pt-2">
        {renderView()}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="relative z-40">
        <MobileNav
          currentView={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onSubmitLink={() => setIsSubmitModalOpen(true)}
        />
      </div>

      {/* Modals */}
      <LinkSubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => {
          setIsReportModalOpen(false);
          setReportTargetLink(undefined);
        }}
        prefilledLinkInfo={reportTargetLink}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {activeReportModalId && (
        <ReportConversationModal
          reportId={activeReportModalId}
          onClose={() => setActiveReportModalId(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
