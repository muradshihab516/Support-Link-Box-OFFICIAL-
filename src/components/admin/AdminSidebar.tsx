import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Flame, 
  Snowflake, 
  ShieldAlert, 
  Flag, 
  Trophy, 
  FileText, 
  Settings, 
  Download,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Database,
  Clock,
  Film,
  ShieldCheck,
  X
} from 'lucide-react';

export type AdminTab = 
  | 'overview'
  | 'admin_roles'
  | 'upload_movie'
  | 'members'
  | 'bulk_import'
  | 'today_links'
  | 'inactive_frozen'
  | 'punishment'
  | 'late_reports'
  | 'notices'
  | 'reports'
  | 'weekly_session'
  | 'storage_points'
  | 'audit_logs'
  | 'settings'
  | 'export';

export interface AdminMenuGroup {
  title: string;
  items: {
    id: AdminTab;
    label: string;
    shortLabel?: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export const ADMIN_MENU_GROUPS: AdminMenuGroup[] = [
  {
    title: 'Operations',
    items: [
      { id: 'overview', label: 'Admin Overview', shortLabel: 'ওভারভিউ', icon: LayoutDashboard },
      { id: 'admin_roles', label: 'Admins & Roles (এডমিন ও রোল)', shortLabel: 'এডমিন ও রোল', icon: ShieldCheck },
      { id: 'upload_movie', label: 'Upload Movie (মুভি আপলোড)', shortLabel: 'মুভি আপলোড', icon: Film },
      { id: 'members', label: 'Members Directory', shortLabel: 'মেম্বারস', icon: Users },
      { id: 'bulk_import', label: 'Bulk Import', shortLabel: 'বাল্ক ইমপোর্ট', icon: UserPlus },
      { id: 'today_links', label: "Today's Links & Audit", shortLabel: 'আজকের লিংক', icon: Flame },
      { id: 'inactive_frozen', label: 'Inactive & Frozen', shortLabel: 'ইনঅ্যাক্টিভ', icon: Snowflake },
    ]
  },
  {
    title: 'Community Governance',
    items: [
      { id: 'punishment', label: 'Punishment & Auto-Admin', shortLabel: 'শাস্তি ও রুলস', icon: Gavel },
      { id: 'late_reports', label: 'Late Support Reports', shortLabel: 'দেরি রিপোর্ট', icon: Clock },
      { id: 'notices', label: 'Notices & Warnings', shortLabel: 'নোটিশ', icon: ShieldAlert },
      { id: 'reports', label: 'Member Reports', shortLabel: 'রিপোর্টস', icon: Flag },
      { id: 'weekly_session', label: 'Weekly Championship', shortLabel: 'উইকলি চ্যাম্পিয়ন', icon: Trophy },
    ]
  },
  {
    title: 'System & Tools',
    items: [
      { id: 'storage_points', label: 'Storage & Points Lifecycle', shortLabel: 'স্টোরেজ ও পয়েন্ট', icon: Database },
      { id: 'audit_logs', label: 'Audit Logs', shortLabel: 'অডিট লগ', icon: FileText },
      { id: 'export', label: 'Export Center (CSV)', shortLabel: 'এক্সপোর্ট', icon: Download },
      { id: 'settings', label: 'System Settings', shortLabel: 'সেটিংস', icon: Settings },
    ]
  }
];

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileContentOpen?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileContentOpen = false
}) => {
  return (
    <aside className={`transition-all duration-200 bg-[#0E0E10] border-r border-[#1E1E20] flex flex-col justify-between shrink-0 ${
      isMobileContentOpen ? 'hidden lg:flex' : 'flex w-full'
    } ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}`}>
      {/* Top Menu Items */}
      <div className="p-3 space-y-6 overflow-y-auto">
        {ADMIN_MENU_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              {group.title}
            </div>
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-[#131315]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className={`truncate ${isCollapsed ? 'lg:hidden' : 'block'}`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Toggle Collapse (Desktop only) */}
      <div className="hidden lg:block p-3 border-t border-[#1E1E20]">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-300 rounded-xl hover:bg-[#131315] transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2 text-xs font-medium">
              <ChevronLeft className="w-4 h-4" /> 
              <span>Collapse Menu</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
