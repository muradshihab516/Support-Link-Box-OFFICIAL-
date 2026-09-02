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
  Megaphone, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Settings, 
  Download,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type AdminTab = 
  | 'overview'
  | 'members'
  | 'bulk_import'
  | 'today_links'
  | 'inactive_frozen'
  | 'notices'
  | 'reports'
  | 'weekly_session'
  | 'sponsors'
  | 'affiliate'
  | 'revenue'
  | 'audit_logs'
  | 'settings'
  | 'export';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse
}) => {
  const menuGroups = [
    {
      title: 'Operations',
      items: [
        { id: 'overview', label: 'Admin Overview', icon: LayoutDashboard },
        { id: 'members', label: 'Members Directory', icon: Users },
        { id: 'bulk_import', label: 'Bulk Import', icon: UserPlus },
        { id: 'today_links', label: "Today's Links & Audit", icon: Flame },
        { id: 'inactive_frozen', label: 'Inactive & Frozen', icon: Snowflake },
      ]
    },
    {
      title: 'Community Governance',
      items: [
        { id: 'notices', label: 'Notices & Warnings', icon: ShieldAlert },
        { id: 'reports', label: 'Member Reports', icon: Flag },
        { id: 'weekly_session', label: 'Weekly Championship', icon: Trophy },
      ]
    },
    {
      title: 'Monetization & Growth',
      items: [
        { id: 'sponsors', label: 'Sponsors & Ads', icon: Megaphone },
        { id: 'affiliate', label: 'Affiliate Marketing', icon: Share2 },
        { id: 'revenue', label: 'Revenue Analytics', icon: DollarSign },
      ]
    },
    {
      title: 'System & Tools',
      items: [
        { id: 'audit_logs', label: 'Audit Logs', icon: FileText },
        { id: 'export', label: 'Export Center (CSV)', icon: Download },
        { id: 'settings', label: 'System Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className={`transition-all duration-200 bg-[#0E0E10] border-r border-[#1E1E20] flex flex-col justify-between shrink-0 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Top Menu Items */}
      <div className="p-3 space-y-6 overflow-y-auto">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                {group.title}
              </div>
            )}
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id as AdminTab)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400 font-bold border border-indigo-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-[#131315]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Toggle Collapse */}
      <div className="p-3 border-t border-[#1E1E20]">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-300 rounded-xl hover:bg-[#131315] transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <div className="flex items-center gap-2 text-xs font-medium"><ChevronLeft className="w-4 h-4" /> <span>Collapse Menu</span></div>}
        </button>
      </div>
    </aside>
  );
};
