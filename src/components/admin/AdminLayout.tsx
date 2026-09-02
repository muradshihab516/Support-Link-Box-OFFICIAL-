import React, { useState } from 'react';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { MemberManagement } from './MemberManagement';
import { BulkImportModal } from './BulkImportModal';
import { TodayLinksAdmin } from './TodayLinksAdmin';
import { InactiveFrozenManagement } from './InactiveFrozenManagement';
import { NoticesWarningsAdmin } from './NoticesWarningsAdmin';
import { ReportsAdmin } from './ReportsAdmin';
import { WeeklyManagement } from './WeeklyManagement';
import { SponsorAdsAdmin } from './SponsorAdsAdmin';
import { AffiliateAdmin } from './AffiliateAdmin';
import { RevenueAnalytics } from './RevenueAnalytics';
import { AuditLogsAdmin } from './AuditLogsAdmin';
import { SettingsAdmin } from './SettingsAdmin';
import { ExportCenter } from './ExportCenter';

export const AdminLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminDashboard onSelectTab={setActiveTab} />;
      case 'members':
        return <MemberManagement />;
      case 'bulk_import':
        return <BulkImportModal />;
      case 'today_links':
        return <TodayLinksAdmin />;
      case 'inactive_frozen':
        return <InactiveFrozenManagement />;
      case 'notices':
        return <NoticesWarningsAdmin />;
      case 'reports':
        return <ReportsAdmin />;
      case 'weekly_session':
        return <WeeklyManagement />;
      case 'sponsors':
        return <SponsorAdsAdmin />;
      case 'affiliate':
        return <AffiliateAdmin />;
      case 'revenue':
        return <RevenueAnalytics />;
      case 'audit_logs':
        return <AuditLogsAdmin />;
      case 'settings':
        return <SettingsAdmin />;
      case 'export':
        return <ExportCenter />;
      default:
        return <AdminDashboard onSelectTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex bg-[#0A0A0B] min-h-[calc(100vh-4rem)] rounded-2xl border border-[#1E1E20] overflow-hidden my-4 shadow-sm">
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl">
        {renderContent()}
      </main>
    </div>
  );
};
