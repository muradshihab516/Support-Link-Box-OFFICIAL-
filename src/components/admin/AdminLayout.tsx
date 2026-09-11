import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AdminSidebar, AdminTab, ADMIN_MENU_GROUPS } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { MemberManagement } from './MemberManagement';
import { BulkImportModal } from './BulkImportModal';
import { TodayLinksAdmin } from './TodayLinksAdmin';
import { InactiveFrozenManagement } from './InactiveFrozenManagement';
import { NoticesWarningsAdmin } from './NoticesWarningsAdmin';
import { ReportsAdmin } from './ReportsAdmin';
import { WeeklyManagement } from './WeeklyManagement';
import { AuditLogsAdmin } from './AuditLogsAdmin';
import { SettingsAdmin } from './SettingsAdmin';
import { ExportCenter } from './ExportCenter';
import { PunishmentManagement } from './PunishmentManagement';
import { LateSupportReportsAdmin } from './LateSupportReportsAdmin';
import { DataLifecycleAndPoints } from './DataLifecycleAndPoints';
import { UploadMovieAdmin } from './UploadMovieAdmin';
import { AdminRoleManagement } from './AdminRoleManagement';

export const AdminLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('today_links');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileContentOpen, setIsMobileContentOpen] = useState(false);

  // Find active tab info for mobile back button bar
  const currentTabItem = ADMIN_MENU_GROUPS
    .flatMap(g => g.items)
    .find(item => item.id === activeTab);

  const handleSelectTab = (tab: AdminTab) => {
    setActiveTab(tab);
    setIsMobileContentOpen(true); // closes sidebar on mobile, opens content panel
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminDashboard onSelectTab={handleSelectTab} />;
      case 'admin_roles':
        return <AdminRoleManagement />;
      case 'upload_movie':
        return <UploadMovieAdmin />;
      case 'members':
        return <MemberManagement />;
      case 'bulk_import':
        return <BulkImportModal />;
      case 'today_links':
        return <TodayLinksAdmin />;
      case 'inactive_frozen':
        return <InactiveFrozenManagement />;
      case 'punishment':
        return <PunishmentManagement />;
      case 'late_reports':
        return <LateSupportReportsAdmin />;
      case 'notices':
        return <NoticesWarningsAdmin />;
      case 'reports':
        return <ReportsAdmin />;
      case 'weekly_session':
        return <WeeklyManagement />;
      case 'storage_points':
        return <DataLifecycleAndPoints />;
      case 'audit_logs':
        return <AuditLogsAdmin />;
      case 'settings':
        return <SettingsAdmin />;
      case 'export':
        return <ExportCenter />;
      default:
        return <AdminDashboard onSelectTab={handleSelectTab} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row bg-[#0A0A0B] min-h-[calc(100vh-4rem)] rounded-2xl border border-[#1E1E20] overflow-hidden my-2 sm:my-4 shadow-sm w-full">
      {/* Sidebar: In original exact layout. Closes on mobile when content is open */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileContentOpen={isMobileContentOpen}
      />

      {/* Main Admin Content Panel: Full-width on mobile, closes and reopens sidebar on Back */}
      <main className={`flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto w-full min-w-0 max-w-full lg:max-w-7xl ${
        isMobileContentOpen ? 'block' : 'hidden lg:block'
      }`}>
        {/* Mobile Back Button: Closes Content Panel & Reopens Sidebar */}
        <div className="lg:hidden flex items-center justify-between pb-3 mb-4 border-b border-[#1E1E24]">
          <button
            onClick={() => setIsMobileContentOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161622] hover:bg-[#1E1E2C] text-white border border-[#2A2A3C] shadow-sm active:scale-95 transition-all text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400" />
            <span>← ব্যাক (এডমিন মেনু)</span>
          </button>
          
          <div className="text-right">
            <span className="text-[10px] text-gray-500 uppercase font-semibold block leading-tight">বর্তমান বিভাগ</span>
            <span className="text-xs font-bold text-indigo-400 block leading-tight truncate max-w-[160px]">
              {currentTabItem?.label}
            </span>
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
};
