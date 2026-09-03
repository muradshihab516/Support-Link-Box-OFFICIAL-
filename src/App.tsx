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
import { AuthModal } from './components/auth/AuthModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const AppContent: React.FC = () => {
  const { currentMember } = useApp();
  const [currentView, setCurrentView] = useState<string>('dashboard');
  
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
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 flex flex-col font-sans transition-colors duration-200 selection:bg-indigo-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onSubmitLink={() => setIsSubmitModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-12 pt-2">
        {renderView()}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onSubmitLink={() => setIsSubmitModalOpen(true)}
      />

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
