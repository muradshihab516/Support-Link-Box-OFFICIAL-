import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Member,
  DailyLink,
  SupportRecord,
  WeeklySession,
  Notice,
  Report,
  SponsorAd,
  AffiliateCampaign,
  AuditLog,
  AppNotification,
  Community,
  SystemSettings,
  RevenueRecord,
  UserRole,
  MemberStatus,
  NoticeType,
  ReportCategory,
  ReportStatus,
  Badge
} from '../types';
import {
  INITIAL_MEMBERS,
  INITIAL_DAILY_LINKS,
  INITIAL_SUPPORT_RECORDS,
  INITIAL_WEEKLY_SESSIONS,
  INITIAL_SPONSORS,
  INITIAL_AFFILIATES,
  INITIAL_NOTICES,
  INITIAL_REPORTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REVENUE,
  INITIAL_SETTINGS,
  INITIAL_COMMUNITIES,
  INITIAL_BADGES
} from '../data/seedData';
import { cleanAndFormatFacebookUrl } from '../utils/facebookLinks';

interface AppContextType {
  // State
  currentUser: Member | null;
  currentMember: Member | null;
  currentCommunity: Community;
  communities: Community[];
  members: Member[];
  dailyLinks: DailyLink[];
  supportRecords: SupportRecord[];
  weeklySessions: WeeklySession[];
  weeklyHistory: WeeklySession[];
  activeWeekSession: WeeklySession;
  currentWeek: number;
  sponsors: SponsorAd[];
  affiliates: AffiliateCampaign[];
  notices: Notice[];
  reports: Report[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  revenueRecords: RevenueRecord[];
  revenueLogs: RevenueRecord[];
  settings: SystemSettings;
  badges: Badge[];
  darkMode: boolean;
  selectedDate: string; // YYYY-MM-DD (defaults to today)

  // Auth & Session
  loginAs: (memberId: string) => void;
  logout: () => void;
  registerMember: (data: { name: string; username: string; email: string; facebookUrl: string }) => { success: boolean; message: string; member?: Member };
  switchCommunity: (communityId: string) => void;
  toggleDarkMode: () => void;

  // Member Actions
  submitDailyLink: (postUrl: string, caption?: string) => { success: boolean; message: string; linkNumber?: number };
  markLinkSupported: (dailyLinkId: string) => { success: boolean; message: string };
  unmarkLinkSupported: (dailyLinkId: string) => { success: boolean; message: string };
  submitReport: (category: ReportCategory, description: string, targetLinkId?: string, targetMemberId?: string, screenshotUrl?: string) => { success: boolean; message: string };
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;

  // Admin Actions
  updateMemberStatus: (memberId: string, status: MemberStatus, reason?: string) => void;
  freezeMember: (memberId: string, reason: string) => void;
  unfreezeMember: (memberId: string) => void;
  removeMember: (memberId: string) => void;
  bulkUpdateMemberStatus: (memberIds: string[], status: MemberStatus) => void;
  adjustMemberPoints: (memberId: string, pointsDelta: number, reason: string) => void;
  updateMemberPoints: (memberId: string, newPoints: number) => void;
  resetMemberStreak: (memberId: string, reason: string) => void;
  editMemberProfile: (memberId: string, updates: Partial<Member>) => void;
  createMember: (memberData: Partial<Member>) => Member;
  bulkImportMembers: (entries: { name: string; username: string; facebookUrl?: string }[]) => { imported: number; duplicates: any[] };

  // Notices & Warnings
  issueNotice: (typeOrTitle: any, titleOrMessage: string, messageOrType?: any, targetMemberId?: string) => void;
  deleteNotice: (noticeId: string) => void;

  // Reports
  resolveReport: (reportId: string, statusOrNotes?: string, adminNotes?: string) => void;
  dismissReport: (reportId: string, adminNotes: string) => void;
  deleteReport: (reportId: string) => void;

  // Links
  removeDailyLink: (linkId: string) => void;

  // Sponsors & Monetization
  createSponsor: (sponsorData: Omit<SponsorAd, 'id' | 'impressions' | 'clicks'>) => void;
  addSponsor: (sponsorData: any) => void;
  updateSponsor: (id: string, updates: Partial<SponsorAd>) => void;
  toggleSponsorStatus: (sponsorId: string) => void;
  deleteSponsor: (id: string) => void;
  removeSponsor: (id: string) => void;
  trackSponsorImpression: (sponsorId: string) => void;
  trackSponsorClick: (sponsorId: string) => void;
  addRevenueRecord: (data: Omit<RevenueRecord, 'id'>) => void;
  addRevenueLog: (logData: any) => void;

  // Weekly Sessions & Leaderboard
  advanceWeeklySession: () => void;
  advanceWeek: () => void;
  overrideWeekNumber: (newWeekNumber: number) => void;

  // System Settings & Config
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  addAuditLog: (action: string, targetType: any, targetId: string, targetName: string, details: string) => void;
  resetAllToSeed: () => void;
  resetToDefaultSeed: () => void;

  // Computed & Helpers
  getTodaySupportStats: (memberId: string) => {
    hasSubmittedToday: boolean;
    submittedLink: DailyLink | null;
    requiredCount: number;
    completedCount: number;
    pendingCount: number;
    progressPercentage: number;
    status: 'completed' | 'partially_completed' | 'pending' | 'excused';
    supportedLinkIds: Set<string>;
  };
  getLeaderboard: (timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time') => Member[];
  getInactiveMembers: (filterDays?: number) => Member[];
  getFrozenMembers: () => Member[];
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEYS = {
  MEMBERS: 'slb_members_v4',
  LINKS: 'slb_links_v4',
  SUPPORTS: 'slb_supports_v4',
  WEEKS: 'slb_weeks_v4',
  SPONSORS: 'slb_sponsors_v4',
  AFFILIATES: 'slb_affiliates_v4',
  NOTICES: 'slb_notices_v4',
  REPORTS: 'slb_reports_v4',
  LOGS: 'slb_logs_v4',
  NOTIFS: 'slb_notifs_v4',
  REVENUE: 'slb_revenue_v4',
  SETTINGS: 'slb_settings_v4',
  COMMUNITIES: 'slb_communities_v4',
  CURRENT_USER_ID: 'slb_current_user_id_v4',
  COMMUNITY_ID: 'slb_current_comm_id_v4',
  DARK_MODE: 'slb_dark_mode_v4'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const TODAY = '2026-08-28';

  // State initialization from localStorage with seed fallback
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [dailyLinks, setDailyLinks] = useState<DailyLink[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LINKS);
    return saved ? JSON.parse(saved) : INITIAL_DAILY_LINKS;
  });

  const [supportRecords, setSupportRecords] = useState<SupportRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPORTS);
    return saved ? JSON.parse(saved) : INITIAL_SUPPORT_RECORDS;
  });

  const [weeklySessions, setWeeklySessions] = useState<WeeklySession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WEEKS);
    return saved ? JSON.parse(saved) : INITIAL_WEEKLY_SESSIONS;
  });

  const [sponsors, setSponsors] = useState<SponsorAd[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SPONSORS);
    return saved ? JSON.parse(saved) : INITIAL_SPONSORS;
  });

  const [affiliates, setAffiliates] = useState<AffiliateCampaign[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AFFILIATES);
    return saved ? JSON.parse(saved) : INITIAL_AFFILIATES;
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTICES);
    return saved ? JSON.parse(saved) : INITIAL_NOTICES;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [revenueRecords, setRevenueRecords] = useState<RevenueRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVENUE);
    return saved ? JSON.parse(saved) : INITIAL_REVENUE;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [communities, setCommunities] = useState<Community[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMMUNITIES);
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITIES;
  });

  const [currentCommunityId, setCurrentCommunityId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.COMMUNITY_ID) || 'comm_default';
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || 'user_emon'; // Default logged in as Md Emon for demo
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [selectedDate] = useState<string>(TODAY);

  // Sync back to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(dailyLinks)); }, [dailyLinks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SUPPORTS, JSON.stringify(supportRecords)); }, [supportRecords]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.WEEKS, JSON.stringify(weeklySessions)); }, [weeklySessions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(sponsors)); }, [sponsors]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AFFILIATES, JSON.stringify(affiliates)); }, [affiliates]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices)); }, [notices]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports)); }, [reports]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.REVENUE, JSON.stringify(revenueRecords)); }, [revenueRecords]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.COMMUNITIES, JSON.stringify(communities)); }, [communities]);
  useEffect(() => { 
    if (currentUserId) localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  }, [currentUserId]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.COMMUNITY_ID, currentCommunityId); }, [currentCommunityId]);
  useEffect(() => { 
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Derived current objects
  const currentUser = useMemo(() => {
    return members.find(m => m.id === currentUserId) || null;
  }, [members, currentUserId]);

  const currentCommunity = useMemo(() => {
    return communities.find(c => c.id === currentCommunityId) || communities[0];
  }, [communities, currentCommunityId]);

  const activeWeekSession = useMemo(() => {
    return weeklySessions.find(w => w.status === 'active') || weeklySessions[0] || INITIAL_WEEKLY_SESSIONS[0];
  }, [weeklySessions]);

  const currentWeek = useMemo(() => {
    return activeWeekSession ? activeWeekSession.weekNumber : 59;
  }, [activeWeekSession]);

  // Helper Audit Logger
  const addAuditLog = (action: string, targetType: any, targetId: string, targetName: string, details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      adminName: currentUser ? currentUser.name : 'System Admin',
      adminRole: currentUser ? currentUser.role : 'admin',
      action,
      targetType,
      targetId,
      targetName,
      details,
      timestamp: new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' }),
      communityId: currentCommunityId
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Auth Operations
  const loginAs = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setCurrentUserId(member.id);
    }
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  const registerMember = (data: { name: string; username: string; email: string; facebookUrl: string }) => {
    // Check duplicates
    const cleanUsername = data.username.replace('@', '').toLowerCase();
    const existing = members.find(m => 
      m.username.toLowerCase().replace('@', '') === cleanUsername || 
      m.email.toLowerCase() === data.email.toLowerCase()
    );

    if (existing) {
      return { success: false, message: `Member with username @${cleanUsername} or email already registered.` };
    }

    const nextNumber = Math.max(...members.map(m => m.memberNumber), 100) + 1;
    const newMember: Member = {
      id: `user_${Date.now()}`,
      memberNumber: nextNumber,
      name: data.name,
      username: cleanUsername,
      email: data.email,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + (nextNumber * 100000)}?w=150&auto=format&fit=crop&q=80`,
      facebookUrl: data.facebookUrl,
      joinDate: TODAY,
      role: 'member',
      status: 'active',
      totalLinksSubmitted: 0,
      totalSupportsCompleted: 0,
      totalPoints: 0,
      weeklyPoints: 0,
      currentRank: members.length + 1,
      currentStreak: 0,
      longestStreak: 0,
      warningCount: 0,
      inactiveDays: 0,
      lastActiveDate: TODAY,
      badges: [],
      communityId: currentCommunityId
    };

    setMembers(prev => [...prev, newMember]);
    setCurrentUserId(newMember.id);
    addAuditLog('REGISTER_MEMBER', 'member', newMember.id, newMember.name, `New member registration ID #${newMember.memberNumber} (@${newMember.username})`);
    
    return { success: true, message: `Welcome ${data.name}! You are registered with Member ID #${nextNumber}`, member: newMember };
  };

  const switchCommunity = (commId: string) => {
    setCurrentCommunityId(commId);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Submit Daily Facebook Link (1 link per day rule)
  const submitDailyLink = (postUrl: string, caption?: string) => {
    if (!currentUser) {
      return { success: false, message: 'Please log in to submit today\'s link.' };
    }

    if (currentUser.status === 'frozen') {
      if (settings.allowAutoUnfreezeOnSubmit) {
        // Auto unfreeze member
        setMembers(prev => prev.map(m => m.id === currentUser.id ? { ...m, status: 'active', inactiveDays: 0, lastActiveDate: TODAY } : m));
        addAuditLog('AUTO_UNFREEZE_ON_SUBMIT', 'member', currentUser.id, currentUser.name, 'Member auto-reactivated upon submitting new link.');
      } else {
        return { success: false, message: 'Your account is currently frozen. Please contact an admin for reactivation.' };
      }
    }

    if (currentUser.status === 'suspended' || currentUser.status === 'removed') {
      return { success: false, message: `Your account is ${currentUser.status}. Submission is restricted.` };
    }

    // Check if already submitted today
    const existingToday = dailyLinks.find(l => l.memberId === currentUser.id && l.date === TODAY && l.communityId === currentCommunityId);
    if (existingToday) {
      return { success: false, message: `You have already submitted today's link (Link #${existingToday.linkNumber}). Maximum 1 submission per day.` };
    }

    // URL validation
    if (!postUrl.includes('facebook.com') && !postUrl.includes('fb.watch') && !postUrl.includes('fb.me')) {
      return { success: false, message: 'Please provide a valid Facebook post, video, or reel URL.' };
    }

    const todayCommunityLinks = dailyLinks.filter(l => l.date === TODAY && l.communityId === currentCommunityId);
    const nextLinkNumber = todayCommunityLinks.length + 1;

    const formattedUrl = cleanAndFormatFacebookUrl(postUrl, 'm');

    const newLink: DailyLink = {
      id: `link_${Date.now()}`,
      memberId: currentUser.id,
      memberName: currentUser.name,
      memberAvatar: currentUser.avatar,
      memberUsername: currentUser.username,
      linkNumber: nextLinkNumber,
      postUrl: formattedUrl,
      caption: caption || '',
      submittedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: TODAY,
      supportCount: 0,
      communityId: currentCommunityId,
      verified: true
    };

    setDailyLinks(prev => [...prev, newLink]);

    // Update member stats
    setMembers(prev => prev.map(m => {
      if (m.id === currentUser.id) {
        return {
          ...m,
          totalLinksSubmitted: m.totalLinksSubmitted + 1,
          lastActiveDate: TODAY,
          inactiveDays: 0,
          status: 'active'
        };
      }
      return m;
    }));

    // Calculate remaining links for feedback
    const remainingToSupport = todayCommunityLinks.length;

    // Trigger Notification
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      type: 'support_reminder',
      title: `Link #${nextLinkNumber} Submitted!`,
      message: `Your link was successfully listed. You have ${remainingToSupport} peer links to support today.`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    return { 
      success: true, 
      message: `✓ Link Submitted Successfully! Your Link Number is #${nextLinkNumber}.`, 
      linkNumber: nextLinkNumber 
    };
  };

  // Mark / Unmark Link Support
  const markLinkSupported = (dailyLinkId: string) => {
    if (!currentUser) {
      return { success: false, message: 'Please log in to support links.' };
    }

    const targetLink = dailyLinks.find(l => l.id === dailyLinkId);
    if (!targetLink) {
      return { success: false, message: 'Link not found.' };
    }

    if (targetLink.memberId === currentUser.id) {
      return { success: false, message: 'You cannot mark your own link as supported.' };
    }

    // Check if already supported
    const existing = supportRecords.find(r => 
      r.dailyLinkId === dailyLinkId && 
      r.supporterMemberId === currentUser.id && 
      r.date === TODAY
    );

    if (existing) {
      return { success: false, message: 'You have already marked this link as supported.' };
    }

    const newRecord: SupportRecord = {
      id: `supp_${dailyLinkId}_${currentUser.id}_${Date.now()}`,
      dailyLinkId,
      supporterMemberId: currentUser.id,
      supportedPostOwnerId: targetLink.memberId,
      supportedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      date: TODAY,
      status: 'verified',
      communityId: currentCommunityId
    };

    setSupportRecords(prev => [...prev, newRecord]);

    // Increment supportCount on the target daily link
    setDailyLinks(prev => prev.map(l => l.id === dailyLinkId ? { ...l, supportCount: l.supportCount + 1 } : l));

    // Update supporter member's total supports and activity
    setMembers(prev => prev.map(m => {
      if (m.id === currentUser.id) {
        return {
          ...m,
          totalSupportsCompleted: m.totalSupportsCompleted + 1,
          lastActiveDate: TODAY,
          inactiveDays: 0
        };
      }
      return m;
    }));

    return { success: true, message: `✓ Marked support for #${targetLink.linkNumber} (${targetLink.memberName})` };
  };

  const unmarkLinkSupported = (dailyLinkId: string) => {
    if (!currentUser) return { success: false, message: 'Please log in.' };

    const record = supportRecords.find(r => 
      r.dailyLinkId === dailyLinkId && 
      r.supporterMemberId === currentUser.id && 
      r.date === TODAY
    );

    if (!record) return { success: false, message: 'Record not found.' };

    setSupportRecords(prev => prev.filter(r => r.id !== record.id));
    setDailyLinks(prev => prev.map(l => l.id === dailyLinkId ? { ...l, supportCount: Math.max(0, l.supportCount - 1) } : l));
    setMembers(prev => prev.map(m => {
      if (m.id === currentUser.id) {
        return {
          ...m,
          totalSupportsCompleted: Math.max(0, m.totalSupportsCompleted - 1)
        };
      }
      return m;
    }));

    return { success: true, message: 'Support un-marked.' };
  };

  // Submit Report
  const submitReport = (category: ReportCategory, description: string, targetLinkId?: string, targetMemberId?: string, screenshotUrl?: string) => {
    if (!currentUser) return { success: false, message: 'Please log in to submit a report.' };

    let targetMemberName = '';
    if (targetMemberId) {
      const tm = members.find(m => m.id === targetMemberId);
      if (tm) targetMemberName = tm.name;
    } else if (targetLinkId) {
      const tl = dailyLinks.find(l => l.id === targetLinkId);
      if (tl) targetMemberName = tl.memberName;
    }

    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      category,
      description,
      targetLinkId,
      targetMemberId,
      targetMemberName,
      screenshotUrl,
      status: 'open',
      createdAt: new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
      communityId: currentCommunityId
    };

    setReports(prev => [newReport, ...prev]);
    return { success: true, message: '✓ Report submitted to community admins. Thank you for keeping Support Link Box clean!' };
  };

  // Notifications
  const markNotificationRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Admin Member Actions
  const updateMemberStatus = (memberId: string, status: MemberStatus, reason?: string) => {
    const target = members.find(m => m.id === memberId);
    if (!target) return;

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const updates: Partial<Member> = { status };
        if (status === 'frozen') updates.frozenAt = TODAY;
        if (status === 'suspended') updates.suspendedAt = TODAY;
        if (status === 'active') {
          updates.inactiveDays = 0;
          updates.frozenAt = undefined;
          updates.suspendedAt = undefined;
        }
        if (reason) updates.notes = reason;
        return { ...m, ...updates };
      }
      return m;
    }));

    addAuditLog('UPDATE_MEMBER_STATUS', 'member', memberId, target.name, `Changed status from ${target.status} to ${status}. ${reason ? `Reason: ${reason}` : ''}`);
  };

  const freezeMember = (memberId: string, reason: string) => {
    updateMemberStatus(memberId, 'frozen', reason);
  };

  const unfreezeMember = (memberId: string) => {
    updateMemberStatus(memberId, 'active', 'Manually unfrozen by administrator.');
  };

  const bulkUpdateMemberStatus = (memberIds: string[], status: MemberStatus) => {
    setMembers(prev => prev.map(m => {
      if (memberIds.includes(m.id)) {
        return { ...m, status, inactiveDays: status === 'active' ? 0 : m.inactiveDays };
      }
      return m;
    }));
    addAuditLog('BULK_UPDATE_STATUS', 'member', 'bulk', `${memberIds.length} members`, `Bulk status set to ${status}`);
  };

  const adjustMemberPoints = (memberId: string, pointsDelta: number, reason: string) => {
    const target = members.find(m => m.id === memberId);
    if (!target) return;

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          totalPoints: Math.max(0, m.totalPoints + pointsDelta),
          weeklyPoints: Math.max(0, m.weeklyPoints + pointsDelta)
        };
      }
      return m;
    }));

    addAuditLog('ADJUST_POINTS', 'member', memberId, target.name, `Adjusted points by ${pointsDelta > 0 ? `+${pointsDelta}` : pointsDelta}. Reason: ${reason}`);
  };

  const resetMemberStreak = (memberId: string, reason: string) => {
    const target = members.find(m => m.id === memberId);
    if (!target) return;

    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, currentStreak: 0 } : m));
    addAuditLog('RESET_STREAK', 'member', memberId, target.name, `Reset streak from ${target.currentStreak} to 0. Reason: ${reason}`);
  };

  const editMemberProfile = (memberId: string, updates: Partial<Member>) => {
    const target = members.find(m => m.id === memberId);
    if (!target) return;

    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, ...updates } : m));
    addAuditLog('EDIT_MEMBER', 'member', memberId, target.name, `Updated profile details: ${Object.keys(updates).join(', ')}`);
  };

  const createMember = (memberData: Partial<Member>): Member => {
    const nextNumber = Math.max(...members.map(m => m.memberNumber), 100) + 1;
    const cleanUsername = (memberData.username || `member_${nextNumber}`).replace('@', '').toLowerCase();
    
    const newMember: Member = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      memberNumber: nextNumber,
      name: memberData.name || 'New Member',
      username: cleanUsername,
      email: memberData.email || `${cleanUsername}@supportlinkbox.com`,
      avatar: memberData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      facebookUrl: memberData.facebookUrl || `https://facebook.com/${cleanUsername}`,
      joinDate: TODAY,
      role: memberData.role || 'member',
      status: memberData.status || 'active',
      totalLinksSubmitted: 0,
      totalSupportsCompleted: 0,
      totalPoints: 0,
      weeklyPoints: 0,
      currentRank: members.length + 1,
      currentStreak: 0,
      longestStreak: 0,
      warningCount: 0,
      inactiveDays: 0,
      lastActiveDate: TODAY,
      badges: [],
      communityId: currentCommunityId
    };

    setMembers(prev => [...prev, newMember]);
    addAuditLog('CREATE_MEMBER', 'member', newMember.id, newMember.name, `Admin created member ID #${nextNumber}`);
    return newMember;
  };

  const bulkImportMembers = (entries: { name: string; username: string; facebookUrl?: string }[]) => {
    let imported = 0;
    const duplicates: any[] = [];
    const newMembersList: Member[] = [];
    let currentMaxNumber = Math.max(...members.map(m => m.memberNumber), 100);

    for (const entry of entries) {
      const cleanUsername = entry.username.replace('@', '').trim().toLowerCase();
      const existing = members.find(m => 
        m.username.toLowerCase().replace('@', '') === cleanUsername || 
        m.name.toLowerCase() === entry.name.toLowerCase()
      );

      if (existing) {
        duplicates.push({
          existing,
          newEntry: entry
        });
      } else {
        currentMaxNumber += 1;
        const newM: Member = {
          id: `user_bulk_${Date.now()}_${currentMaxNumber}`,
          memberNumber: currentMaxNumber,
          name: entry.name.trim(),
          username: cleanUsername,
          email: `${cleanUsername}@gmail.com`,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          facebookUrl: entry.facebookUrl || `https://facebook.com/${cleanUsername}`,
          joinDate: TODAY,
          role: 'member',
          status: 'active',
          totalLinksSubmitted: 0,
          totalSupportsCompleted: 0,
          totalPoints: 0,
          weeklyPoints: 0,
          currentRank: members.length + 1,
          currentStreak: 0,
          longestStreak: 0,
          warningCount: 0,
          inactiveDays: 0,
          lastActiveDate: TODAY,
          badges: [],
          communityId: currentCommunityId
        };
        newMembersList.push(newM);
        imported++;
      }
    }

    if (newMembersList.length > 0) {
      setMembers(prev => [...prev, ...newMembersList]);
      addAuditLog('BULK_IMPORT', 'member', 'bulk', `${newMembersList.length} members`, `Imported ${imported} new members successfully.`);
    }

    return { imported, duplicates };
  };

  // Notices
  const issueNotice = (typeOrTitle: any, titleOrMessage: string, messageOrType?: any, targetMemberId?: string) => {
    let type: NoticeType = 'announcement';
    let title = '';
    let message = '';
    let target = 'all';

    if (typeOrTitle === 'simple_warning' || typeOrTitle === 'alert_warning' || typeOrTitle === 'kickout_warning' || typeOrTitle === 'announcement') {
      type = typeOrTitle;
      title = titleOrMessage;
      message = (messageOrType as string) || '';
      target = targetMemberId || 'all';
    } else {
      title = typeOrTitle;
      message = titleOrMessage;
      if (messageOrType === 'simple_warning' || messageOrType === 'alert_warning' || messageOrType === 'kickout_warning' || messageOrType === 'announcement') {
        type = messageOrType;
      }
      target = targetMemberId || 'all';
    }

    let targetMemberName = 'All Members';
    if (target && target !== 'all') {
      const m = members.find(mb => mb.id === target);
      if (m) {
        targetMemberName = m.name;
        // increment warning count if warning type
        if (type === 'simple_warning' || type === 'alert_warning' || type === 'kickout_warning') {
          setMembers(prev => prev.map(mb => mb.id === target ? { ...mb, warningCount: (mb.warningCount || 0) + 1 } : mb));
        }
      }
    }

    const newNotice: Notice = {
      id: `not_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      targetMemberId: target,
      targetMemberName,
      type,
      title,
      message,
      issuedBy: currentUser ? currentUser.name : 'Administrator',
      issuedAt: new Date().toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short', year: 'numeric' }),
      active: true,
      communityId: currentCommunityId
    };

    setNotices(prev => [newNotice, ...prev]);
    addAuditLog('ISSUE_NOTICE', 'notice', newNotice.id, targetMemberName, `Issued ${type}: "${title}"`);
  };

  const deleteNotice = (noticeId: string) => {
    setNotices(prev => prev.filter(n => n.id !== noticeId));
  };

  // Reports
  const resolveReport = (reportId: string, statusOrNotes?: string, maybeNotes?: string) => {
    let finalStatus: ReportStatus = 'resolved';
    let finalNotes = '';
    if (statusOrNotes === 'resolved' || statusOrNotes === 'dismissed' || statusOrNotes === 'open') {
      finalStatus = statusOrNotes;
      finalNotes = maybeNotes || '';
    } else {
      finalNotes = statusOrNotes || '';
    }

    setReports(prev => prev.map(r => r.id === reportId ? { 
      ...r, 
      status: finalStatus, 
      adminNotes: finalNotes, 
      resolvedBy: currentUser ? currentUser.name : 'Admin' 
    } : r));
    addAuditLog('RESOLVE_REPORT', 'report', reportId, reportId, `Report marked as ${finalStatus}. Notes: ${finalNotes}`);
  };

  const dismissReport = (reportId: string, adminNotes: string) => {
    setReports(prev => prev.map(r => r.id === reportId ? { 
      ...r, 
      status: 'dismissed', 
      adminNotes, 
      resolvedBy: currentUser ? currentUser.name : 'Admin' 
    } : r));
  };

  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  // Links
  const removeDailyLink = (linkId: string) => {
    setDailyLinks(prev => prev.filter(l => l.id !== linkId));
    addAuditLog('REMOVE_LINK', 'link', linkId, linkId, `Removed link ID ${linkId}`);
  };

  // Member points and status helper
  const removeMember = (memberId: string) => {
    updateMemberStatus(memberId, 'removed', 'Permanently removed by administrator.');
  };

  const updateMemberPoints = (memberId: string, newPoints: number) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, totalPoints: newPoints } : m));
  };

  // Sponsors
  const createSponsor = (sponsorData: Omit<SponsorAd, 'id' | 'impressions' | 'clicks'>) => {
    const newSponsor: SponsorAd = {
      ...sponsorData,
      id: `spons_${Date.now()}`,
      impressions: 0,
      clicks: 0
    };
    setSponsors(prev => [newSponsor, ...prev]);
    if (sponsorData.pricePaid && sponsorData.pricePaid > 0) {
      addRevenueRecord({
        source: 'direct_sponsor',
        sponsorOrNetworkName: sponsorData.sponsorName,
        amount: sponsorData.pricePaid,
        currency: 'BDT',
        period: '2026-08',
        date: TODAY,
        note: `${sponsorData.packageType} for ${sponsorData.title}`
      });
    }
    addAuditLog('CREATE_SPONSOR', 'sponsor', newSponsor.id, newSponsor.sponsorName, `Added sponsor: ${newSponsor.title}`);
  };

  const addSponsor = (sponsorData: any) => {
    createSponsor({
      sponsorName: sponsorData.sponsorName || 'New Sponsor',
      title: sponsorData.title || sponsorData.sponsorName || 'Sponsored Partner',
      description: sponsorData.description || '',
      imageUrl: sponsorData.imageUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
      destinationUrl: sponsorData.destinationUrl || 'https://facebook.com',
      startDate: sponsorData.startDate || TODAY,
      endDate: sponsorData.endDate || '2026-09-28',
      position: sponsorData.position || 'leaderboard_sponsor',
      priority: sponsorData.priority || 1,
      status: sponsorData.status || 'active',
      pricePaid: Number(sponsorData.pricePaid) || 0,
      packageType: sponsorData.packageType || 'basic_banner',
      communityId: currentCommunityId
    });
  };

  const toggleSponsorStatus = (sponsorId: string) => {
    setSponsors(prev => prev.map(s => {
      if (s.id === sponsorId) {
        const nextStatus = s.status === 'active' ? 'paused' : 'active';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const updateSponsor = (id: string, updates: Partial<SponsorAd>) => {
    setSponsors(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSponsor = (id: string) => {
    setSponsors(prev => prev.filter(s => s.id !== id));
  };

  const removeSponsor = (id: string) => {
    deleteSponsor(id);
  };

  const trackSponsorImpression = (sponsorId: string) => {
    setSponsors(prev => prev.map(s => s.id === sponsorId ? { ...s, impressions: s.impressions + 1 } : s));
  };

  const trackSponsorClick = (sponsorId: string) => {
    setSponsors(prev => prev.map(s => s.id === sponsorId ? { ...s, clicks: s.clicks + 1 } : s));
  };

  const addRevenueRecord = (data: Omit<RevenueRecord, 'id'>) => {
    const newRev: RevenueRecord = {
      ...data,
      id: `rev_${Date.now()}`
    };
    setRevenueRecords(prev => [newRev, ...prev]);
  };

  const addRevenueLog = (logData: any) => {
    addRevenueRecord({
      source: logData.source === 'sponsor_direct' ? 'direct_sponsor' : logData.source || 'direct_sponsor',
      sponsorOrNetworkName: logData.sponsorOrNetworkName || 'Direct Payment',
      amount: Number(logData.amount) || 0,
      currency: logData.currency || 'BDT',
      period: logData.period || '2026-08',
      date: logData.date || TODAY,
      note: logData.notes || logData.note || 'Manual revenue entry'
    });
  };

  // Weekly Session Advancement
  const advanceWeeklySession = () => {
    const activeWeek = weeklySessions.find(w => w.status === 'active') || weeklySessions[0];
    const nextWeekNum = (activeWeek ? activeWeek.weekNumber : 59) + 1;

    // Calculate Top 5 from active members for this week
    const sortedMembers = [...members]
      .filter(m => m.status === 'active')
      .sort((a, b) => b.weeklyPoints - a.weeklyPoints || b.totalSupportsCompleted - a.totalSupportsCompleted);

    const pointsSchema = [
      settings.pointsSchema.first,
      settings.pointsSchema.second,
      settings.pointsSchema.third,
      settings.pointsSchema.fourth,
      settings.pointsSchema.fifth
    ];

    const winners: any[] = [];
    sortedMembers.slice(0, 5).forEach((m, idx) => {
      const awarded = pointsSchema[idx] || 1;
      winners.push({
        rank: idx + 1,
        memberId: m.id,
        memberName: m.name,
        memberAvatar: m.avatar,
        pointsAwarded: awarded,
        totalSupports: m.totalSupportsCompleted,
        completionRate: 100 - idx
      });

      // Add points to total points
      setMembers(prev => prev.map(mb => mb.id === m.id ? { 
        ...mb, 
        totalPoints: mb.totalPoints + awarded,
        badges: idx === 0 && !mb.badges.includes('badge_champ') ? [...mb.badges, 'badge_champ'] : mb.badges
      } : mb));
    });

    // Archive current active session
    const archivedWeek: WeeklySession = {
      ...activeWeek,
      status: 'archived',
      winners
    };

    // Create new active session
    const newActiveWeek: WeeklySession = {
      id: `week_${nextWeekNum}`,
      weekNumber: nextWeekNum,
      title: `${nextWeekNum}th Week Championship`,
      startDate: TODAY,
      endDate: '2026-09-04',
      status: 'active',
      totalLinks: 0,
      totalSupports: 0,
      winners: [],
      communityId: currentCommunityId
    };

    setWeeklySessions(prev => [newActiveWeek, archivedWeek, ...prev.filter(w => w.id !== activeWeek.id)]);

    // Reset weekly points for all members
    setMembers(prev => prev.map(m => ({ ...m, weeklyPoints: 0 })));

    addAuditLog('ADVANCE_WEEK_SESSION', 'week', newActiveWeek.id, newActiveWeek.title, `Archived week ${activeWeek.weekNumber} and advanced to week ${nextWeekNum}. Top 5 points awarded.`);
  };

  const overrideWeekNumber = (newWeekNum: number) => {
    setWeeklySessions(prev => prev.map(w => w.status === 'active' ? { 
      ...w, 
      weekNumber: newWeekNum, 
      title: `${newWeekNum}th Week Championship` 
    } : w));
    addAuditLog('OVERRIDE_WEEK_NUMBER', 'week', 'active', `${newWeekNum}th Week`, `Manually adjusted current active week to #${newWeekNum}`);
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addAuditLog('UPDATE_SETTINGS', 'settings', 'config', 'System Settings', `Updated: ${Object.keys(newSettings).join(', ')}`);
  };

  const resetAllToSeed = () => {
    localStorage.clear();
    setMembers(INITIAL_MEMBERS);
    setDailyLinks(INITIAL_DAILY_LINKS);
    setSupportRecords(INITIAL_SUPPORT_RECORDS);
    setWeeklySessions(INITIAL_WEEKLY_SESSIONS);
    setSponsors(INITIAL_SPONSORS);
    setAffiliates(INITIAL_AFFILIATES);
    setNotices(INITIAL_NOTICES);
    setReports(INITIAL_REPORTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setRevenueRecords(INITIAL_REVENUE);
    setSettings(INITIAL_SETTINGS);
    setCommunities(INITIAL_COMMUNITIES);
    setCurrentUserId('user_emon');
    setDarkMode(false);
  };

  // Helper Computations
  const getTodaySupportStats = (memberId: string) => {
    const todayLinks = dailyLinks.filter(l => l.date === TODAY && l.communityId === currentCommunityId);
    const submittedLink = todayLinks.find(l => l.memberId === memberId) || null;
    const hasSubmittedToday = Boolean(submittedLink);

    // Eligible peer links (exclude user's own link)
    const eligibleLinks = todayLinks.filter(l => l.memberId !== memberId);
    const requiredCount = eligibleLinks.length;

    // Supported records by this member today
    const memberSupportsToday = supportRecords.filter(r => r.supporterMemberId === memberId && r.date === TODAY && r.communityId === currentCommunityId);
    const supportedLinkIds = new Set(memberSupportsToday.map(r => r.dailyLinkId));

    let completedCount = 0;
    eligibleLinks.forEach(l => {
      if (supportedLinkIds.has(l.id)) completedCount++;
    });

    const pendingCount = Math.max(0, requiredCount - completedCount);
    const progressPercentage = requiredCount > 0 ? Math.round((completedCount / requiredCount) * 100) : 100;

    let status: 'completed' | 'partially_completed' | 'pending' | 'excused' = 'pending';
    if (!hasSubmittedToday) {
      status = 'pending';
    } else if (completedCount >= requiredCount && requiredCount > 0) {
      status = 'completed';
    } else if (completedCount > 0) {
      status = 'partially_completed';
    }

    return {
      hasSubmittedToday,
      submittedLink,
      requiredCount,
      completedCount,
      pendingCount,
      progressPercentage,
      status,
      supportedLinkIds
    };
  };

  const getLeaderboard = (timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time') => {
    const activeList = members.filter(m => m.status === 'active');
    
    return [...activeList].sort((a, b) => {
      if (timeframe === 'weekly') {
        return b.weeklyPoints - a.weeklyPoints || b.totalSupportsCompleted - a.totalSupportsCompleted;
      }
      if (timeframe === 'daily') {
        const aStats = getTodaySupportStats(a.id);
        const bStats = getTodaySupportStats(b.id);
        return bStats.completedCount - aStats.completedCount || b.currentStreak - a.currentStreak;
      }
      if (timeframe === 'monthly') {
        return (b.weeklyPoints * 4) - (a.weeklyPoints * 4) || b.totalSupportsCompleted - a.totalSupportsCompleted;
      }
      // all_time
      return b.totalPoints - a.totalPoints || b.totalSupportsCompleted - a.totalSupportsCompleted;
    });
  };

  const getInactiveMembers = (filterDays?: number) => {
    return members.filter(m => {
      if (m.status !== 'inactive' && m.inactiveDays === 0) return false;
      if (filterDays !== undefined) {
        return m.inactiveDays >= filterDays;
      }
      return m.inactiveDays > 0 || m.status === 'inactive';
    });
  };

  const getFrozenMembers = () => {
    return members.filter(m => m.status === 'frozen');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentMember: currentUser,
        currentCommunity,
        communities,
        members,
        dailyLinks,
        supportRecords,
        weeklySessions,
        weeklyHistory: weeklySessions,
        activeWeekSession,
        currentWeek,
        sponsors,
        affiliates,
        notices,
        reports,
        auditLogs,
        notifications,
        revenueRecords,
        revenueLogs: revenueRecords,
        settings,
        badges: INITIAL_BADGES,
        darkMode,
        selectedDate,

        loginAs,
        logout,
        registerMember,
        switchCommunity,
        toggleDarkMode,

        submitDailyLink,
        markLinkSupported,
        unmarkLinkSupported,
        submitReport,
        markNotificationRead,
        markAllNotificationsRead,

        updateMemberStatus,
        freezeMember,
        unfreezeMember,
        removeMember,
        bulkUpdateMemberStatus,
        adjustMemberPoints,
        updateMemberPoints,
        resetMemberStreak,
        editMemberProfile,
        createMember,
        bulkImportMembers,

        issueNotice,
        deleteNotice,

        resolveReport,
        dismissReport,
        deleteReport,

        removeDailyLink,

        createSponsor,
        addSponsor,
        updateSponsor,
        toggleSponsorStatus,
        deleteSponsor,
        removeSponsor,
        trackSponsorImpression,
        trackSponsorClick,
        addRevenueRecord,
        addRevenueLog,

        advanceWeeklySession,
        advanceWeek: advanceWeeklySession,
        overrideWeekNumber,

        updateSettings,
        addAuditLog,
        resetAllToSeed,
        resetToDefaultSeed: resetAllToSeed,

        getTodaySupportStats,
        getLeaderboard,
        getInactiveMembers,
        getFrozenMembers
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
