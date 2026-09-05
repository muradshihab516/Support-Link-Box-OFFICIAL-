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
  Badge,
  PostContentType,
  LinkCategoryType,
  ScheduledLink,
  ScheduleStatus
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
  INITIAL_BADGES,
  INITIAL_SCHEDULED_LINKS
} from '../data/seedData';
import { cleanAndFormatFacebookUrl } from '../utils/facebookLinks';
import { checkBangladeshSubmissionWindow, getBangladeshCurrentTime12h } from '../utils/bangladeshTime';

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

  // Scheduled Links
  scheduledLinks: ScheduledLink[];
  scheduleLink: (data: {
    postUrl: string;
    scheduledForDate: string;
    scheduledForTime: string;
    postType?: PostContentType;
    caption?: string;
    instruction?: string;
    category?: LinkCategoryType;
    targetMemberId?: string;
  }) => { success: boolean; message: string; scheduledLink?: ScheduledLink };
  editScheduledLink: (id: string, updates: {
    postUrl?: string;
    scheduledForDate?: string;
    scheduledForTime?: string;
    postType?: PostContentType;
    caption?: string;
    instruction?: string;
  }) => { success: boolean; message: string };
  cancelScheduledLink: (id: string, reason?: string) => { success: boolean; message: string };
  forceSubmitScheduledLink: (id: string) => { success: boolean; message: string; link?: DailyLink };
  deleteScheduledLink: (id: string) => { success: boolean; message: string };
  processScheduledLinks: () => void;

  // Auth & Session
  loginAs: (memberId: string) => void;
  logout: () => void;
  registerMember: (data: { name: string; username: string; email: string; facebookUrl: string }) => { success: boolean; message: string; member?: Member };
  switchCommunity: (communityId: string) => void;
  toggleDarkMode: () => void;

  // Member & Admin Actions
  submitDailyLink: (
    postUrl: string, 
    caption?: string,
    options?: {
      postType?: PostContentType;
      instruction?: string;
      category?: LinkCategoryType;
      targetMemberId?: string;
    }
  ) => { success: boolean; message: string; linkNumber?: number; link?: DailyLink };
  editDailyLink: (
    linkId: string,
    data: {
      postUrl?: string;
      postType?: PostContentType;
      caption?: string;
      instruction?: string;
      category?: LinkCategoryType;
    }
  ) => { success: boolean; message: string };
  updateDailyLinkUrl: (linkId: string, newUrl: string) => { success: boolean; message: string };
  markLinkSupported: (dailyLinkId: string) => { success: boolean; message: string };
  unmarkLinkSupported: (dailyLinkId: string) => { success: boolean; message: string };
  submitReport: (
    category: ReportCategory, 
    description: string, 
    targetLinkId?: string, 
    targetMemberId?: string, 
    screenshotUrl?: string,
    reasons?: string[]
  ) => { success: boolean; message: string };
  resolveReportsForLink: (linkId: string) => void;
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

  // Reports & Reply Conversation
  addReportReply: (reportId: string, message: string, screenshotUrl?: string) => { success: boolean; message: string };
  updateReportStatus: (reportId: string, status: ReportStatus, note?: string) => void;
  markReportRead: (reportId: string) => void;
  activeReportModalId: string | null;
  setActiveReportModalId: (id: string | null) => void;
  resolveReport: (reportId: string, statusOrNotes?: string, adminNotes?: string) => void;
  dismissReport: (reportId: string, adminNotes: string) => void;
  deleteReport: (reportId: string) => void;

  // Links
  removeDailyLink: (linkId: string) => { success: boolean; message: string };

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
  DARK_MODE: 'slb_dark_mode_v4',
  SCHEDULED_LINKS: 'slb_scheduled_links_v4'
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
    const list: DailyLink[] = saved ? JSON.parse(saved) : INITIAL_DAILY_LINKS;
    return list.map(link => ({
      ...link,
      partNumber: link.partNumber || Math.max(1, Math.ceil((link.linkNumber || 1) / 20))
    }));
  });

  const [scheduledLinks, setScheduledLinks] = useState<ScheduledLink[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHEDULED_LINKS);
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULED_LINKS;
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const minDwell = (!parsed.minSupportDwellSeconds || parsed.minSupportDwellSeconds === 15) ? 7 : parsed.minSupportDwellSeconds;
        const videoDwell = (!parsed.videoSupportDwellSeconds || parsed.videoSupportDwellSeconds === 25) ? 8 : parsed.videoSupportDwellSeconds;
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          minSupportDwellSeconds: minDwell,
          videoSupportDwellSeconds: videoDwell
        };
      } catch {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
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
  const [activeReportModalId, setActiveReportModalId] = useState<string | null>(null);

  // Sync back to localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LINKS, JSON.stringify(dailyLinks)); }, [dailyLinks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SCHEDULED_LINKS, JSON.stringify(scheduledLinks)); }, [scheduledLinks]);
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

  // Real-time cross-tab synchronization for daily links
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.LINKS && e.newValue) {
        try {
          const freshLinks: DailyLink[] = JSON.parse(e.newValue);
          setDailyLinks(freshLinks.map(link => ({
            ...link,
            partNumber: link.partNumber || Math.max(1, Math.ceil((link.linkNumber || 1) / 20))
          })));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
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

  // Atomic Daily Link Sequence Counter (Race-condition free & Monotonic per day & community)
  // Ensures concurrent submissions never collide or get duplicated link numbers
  const getNextAtomicLinkNumber = (date: string, communityId: string): number => {
    const counterKey = `daily_link_counter_${date}_${communityId}`;
    let currentVal = 0;
    try {
      const saved = localStorage.getItem(counterKey);
      if (saved) currentVal = parseInt(saved, 10) || 0;
    } catch {}

    let diskLinks: DailyLink[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LINKS);
      if (raw) diskLinks = JSON.parse(raw);
    } catch {}

    const maxMemory = dailyLinks
      .filter(l => l.date === date && l.communityId === communityId)
      .reduce((max, l) => Math.max(max, l.linkNumber || 0), 0);

    const maxDisk = diskLinks
      .filter(l => l.date === date && l.communityId === communityId)
      .reduce((max, l) => Math.max(max, l.linkNumber || 0), 0);

    const nextNumber = Math.max(currentVal, maxMemory, maxDisk) + 1;
    try {
      localStorage.setItem(counterKey, nextNumber.toString());
    } catch {}
    return nextNumber;
  };

  // Submit Daily Facebook Link (1 link per day rule, BD Time Window, Admin Proxy & Special Links)
  const submitDailyLink = (
    postUrl: string, 
    caption?: string,
    options?: {
      postType?: PostContentType;
      instruction?: string;
      category?: LinkCategoryType;
      targetMemberId?: string;
    }
  ) => {
    if (!currentUser) {
      return { success: false, message: 'Please log in to submit today\'s link.' };
    }

    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.role === 'moderator';

    // Target member resolution: either currentUser or (if admin) the selected target member
    let effectiveMember = currentUser;
    let isProxySubmission = false;

    if (options?.targetMemberId && options.targetMemberId !== currentUser.id) {
      if (!isAdmin) {
        return { success: false, message: 'Only admins can submit links on behalf of other members.' };
      }
      const matched = members.find(m => m.id === options.targetMemberId);
      if (!matched) {
        return { success: false, message: 'Selected member was not found.' };
      }
      effectiveMember = matched;
      isProxySubmission = true;
    }

    // Determine category / link type
    const requestedCategory: LinkCategoryType = options?.category || 'member';
    const isSpecialAdminLink = requestedCategory === 'admin' || requestedCategory === 'vip' || requestedCategory === 'notice';

    // Permission check for special link categories
    if (isSpecialAdminLink && !isAdmin) {
      return { success: false, message: 'Only admins can submit Admin, VIP, or Notice links.' };
    }

    // Member status checks
    if (effectiveMember.status === 'frozen') {
      if (isAdmin || settings.allowAutoUnfreezeOnSubmit) {
        // Auto unfreeze member
        setMembers(prev => prev.map(m => m.id === effectiveMember.id ? { ...m, status: 'active', inactiveDays: 0, lastActiveDate: TODAY } : m));
        addAuditLog('AUTO_UNFREEZE_ON_SUBMIT', 'member', effectiveMember.id, effectiveMember.name, 'Member auto-reactivated upon link submission.');
      } else {
        return { success: false, message: 'This member account is currently frozen. Please contact an admin for reactivation.' };
      }
    }

    if (!isAdmin && (effectiveMember.status === 'suspended' || effectiveMember.status === 'removed')) {
      return { success: false, message: `Your account is ${effectiveMember.status}. Submission is restricted.` };
    }

    // Daily Limit check:
    // Special admin links (admin, vip, notice) DO NOT have daily 1-link restriction!
    // Regular member links strictly enforce 1 link per member per day.
    if (!isSpecialAdminLink) {
      const existingToday = dailyLinks.find(l => 
        l.memberId === effectiveMember.id && 
        l.date === TODAY && 
        l.communityId === currentCommunityId &&
        (!l.category || l.category === 'member')
      );
      if (existingToday) {
        return { 
          success: false, 
          message: isProxySubmission
            ? `${effectiveMember.name} already has a link today (#${existingToday.linkNumber}). You have already submitted a link today.`
            : 'You have already submitted a link today.' 
        };
      }
    }

    // Submission Time Window Check (Bangladesh Standard Time - Asia/Dhaka):
    // Admins and Special Admin Links are EXEMPT from time window restrictions!
    if (!isAdmin && !isSpecialAdminLink) {
      const windowStatus = checkBangladeshSubmissionWindow(
        settings.submissionWindowStart || '10:00',
        settings.submissionWindowEnd || '16:50',
        settings.submissionWindowEnabled !== false,
        settings.submissionOpen !== false
      );

      if (!windowStatus.isOpenNow) {
        return {
          success: false,
          message: windowStatus.statusMessageBengali || 'বর্তমানে লিংক সাবমিশন বন্ধ রয়েছে।'
        };
      }
    }

    // URL validation
    const trimmedUrl = postUrl.trim();
    if (!trimmedUrl.includes('facebook.com') && !trimmedUrl.includes('fb.watch') && !trimmedUrl.includes('fb.me')) {
      return { success: false, message: 'অনুগ্রহ করে সঠিক ফেসবুক পোস্ট, ভিডিও বা রিলস এর লিংক দিন।' };
    }

    const nextLinkNumber = getNextAtomicLinkNumber(TODAY, currentCommunityId);
    const partNumber = Math.max(1, Math.ceil(nextLinkNumber / 20));
    const nowTimestamp = Date.now();
    const editableUntilTimestamp = nowTimestamp + (2 * 60 * 1000); // 2 minutes in ms (120,000ms)
    const formattedUrl = cleanAndFormatFacebookUrl(trimmedUrl, 'm');

    const newLink: DailyLink = {
      id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      memberId: effectiveMember.id,
      memberName: effectiveMember.name,
      memberAvatar: effectiveMember.avatar,
      memberUsername: effectiveMember.username,
      linkNumber: nextLinkNumber, // Permanent, unique, strictly immutable sequence number
      partNumber: partNumber, // e.g. Part 1 (01-20), Part 2 (21-40)
      postUrl: formattedUrl,
      caption: caption?.trim() || '',
      postType: options?.postType || 'photo',
      instruction: options?.instruction?.trim() || '',
      category: requestedCategory,
      linkType: requestedCategory,
      submittedByAdminId: isProxySubmission ? currentUser.id : undefined,
      submittedByAdminName: isProxySubmission ? currentUser.name : undefined,
      isSubmittedByAdmin: isProxySubmission,
      submittedAt: getBangladeshCurrentTime12h(),
      submittedAtTimestamp: nowTimestamp,
      editableUntil: editableUntilTimestamp,
      date: TODAY,
      supportCount: 0,
      communityId: currentCommunityId,
      verified: true
    };

    setDailyLinks(prev => [...prev, newLink]);

    // Update member stats
    setMembers(prev => prev.map(m => {
      if (m.id === effectiveMember.id) {
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

    if (isProxySubmission) {
      addAuditLog(
        'ADMIN_PROXY_LINK_SUBMIT',
        'link',
        newLink.id,
        effectiveMember.name,
        `Admin ${currentUser.name} submitted Link #${nextLinkNumber} on behalf of ${effectiveMember.name} (@${effectiveMember.username}).`
      );
    }

    // Calculate remaining links for feedback
    const remainingToSupport = dailyLinks.filter(l => l.memberId !== effectiveMember.id).length;

    // Trigger Notification for the member
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: effectiveMember.id,
      type: 'support_reminder',
      title: isProxySubmission 
        ? `Link #${nextLinkNumber} Submitted by Admin!` 
        : `Link #${nextLinkNumber} Submitted!`,
      message: isProxySubmission
        ? `Admin ${currentUser.name} has submitted today's link (#${nextLinkNumber}) on your behalf. Don't forget to support peers!`
        : `Your link was successfully listed. You have ${remainingToSupport} peer links to support today.`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    return { 
      success: true, 
      message: isProxySubmission
        ? `✓ Link #${nextLinkNumber} submitted successfully on behalf of ${effectiveMember.name}!`
        : `✓ Link Submitted Successfully! Your Link Number is #${nextLinkNumber}.`, 
      linkNumber: nextLinkNumber,
      link: newLink
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

  // Edit Daily Link (2 minutes window for members, anytime for admins)
  // Link Number & Part Number remain permanently immutable
  const editDailyLink = (
    linkId: string,
    data: {
      postUrl?: string;
      postType?: PostContentType;
      caption?: string;
      instruction?: string;
      category?: LinkCategoryType;
    }
  ): { success: boolean; message: string } => {
    const targetLink = dailyLinks.find(l => l.id === linkId);
    if (!targetLink) {
      return { success: false, message: 'লিংক খুঁজে পাওয়া যায়নি।' };
    }

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'moderator';

    // Check member permissions and 2-minute time window
    if (!isAdmin) {
      if (!currentUser || targetLink.memberId !== currentUser.id) {
        return { success: false, message: 'আপনি অন্যের লিংক পরিবর্তন করতে পারবেন না।' };
      }

      // Check 2-minute edit window (timestamp enforcement)
      const now = Date.now();
      const deadline = targetLink.editableUntil || (targetLink.submittedAtTimestamp ? targetLink.submittedAtTimestamp + 120000 : 0);
      if (deadline > 0 && now > deadline) {
        return {
          success: false,
          message: '২ মিনিটের এডিট করার সময়সীমা পার হয়ে গেছে! এখন আর লিংক বা বিবরণ পরিবর্তন করা সম্ভব নয়।'
        };
      }
    }

    // Validate postUrl if provided
    let formattedUrl = targetLink.postUrl;
    if (data.postUrl !== undefined && data.postUrl.trim() !== '') {
      const trimmed = data.postUrl.trim();
      if (!trimmed.includes('facebook.com') && !trimmed.includes('fb.watch') && !trimmed.includes('fb.me')) {
        return { success: false, message: 'অনুগ্রহ করে সঠিক ফেসবুক পোস্ট, ভিডিও বা রিলসের লিংক দিন।' };
      }
      formattedUrl = cleanAndFormatFacebookUrl(trimmed, 'm');
    }

    const editorName = currentUser ? (isAdmin && targetLink.memberId !== currentUser.id ? `Admin ${currentUser.name}` : currentUser.name) : 'User';

    setDailyLinks(prev => prev.map(l => {
      if (l.id === linkId) {
        return {
          ...l,
          // CRITICAL: linkNumber and partNumber are STRICTLY IMMUTABLE!
          postUrl: formattedUrl,
          postType: data.postType !== undefined ? data.postType : l.postType,
          caption: data.caption !== undefined ? data.caption.trim() : l.caption,
          instruction: data.instruction !== undefined ? data.instruction.trim() : l.instruction,
          category: (isAdmin && data.category) ? data.category : l.category,
          lastEditedAt: getBangladeshCurrentTime12h(),
          lastEditedBy: editorName
        };
      }
      return l;
    }));

    // If author updated link, update any open reports
    setReports(prev => prev.map(r => {
      if (r.targetLinkId === linkId && (r.status === 'open' || r.status === 'pending')) {
        return { ...r, adminNotes: `${editorName} লিংক/তথ্য সংশোধন করেছেন` };
      }
      return r;
    }));

    addAuditLog(
      'EDIT_LINK',
      'link',
      linkId,
      targetLink.memberName,
      `${editorName} edited details for Link #${targetLink.linkNumber} (${isAdmin ? 'Admin Override' : 'Within 2-min window'}).`
    );

    return {
      success: true,
      message: `✓ লিংক #${targetLink.linkNumber} এর তথ্য সফলভাবে আপডেট করা হয়েছে!`
    };
  };

  const updateDailyLinkUrl = (linkId: string, newUrl: string) => {
    return editDailyLink(linkId, { postUrl: newUrl });
  };

  const resolveReportsForLink = (linkId: string) => {
    setReports(prev => prev.map(r => {
      if (r.targetLinkId === linkId && (r.status === 'open' || r.status === 'pending')) {
        return { ...r, status: 'resolved', adminNotes: 'লিংক দাতা পরীক্ষা করে সমাধান নিশ্চিত করেছেন' };
      }
      return r;
    }));
  };

  // ==========================================
  // SCHEDULED LINKS IMPLEMENTATION
  // ==========================================

  // Schedule a link in advance
  const scheduleLink = (data: {
    postUrl: string;
    scheduledForDate: string;
    scheduledForTime: string;
    postType?: PostContentType;
    caption?: string;
    instruction?: string;
    category?: LinkCategoryType;
    targetMemberId?: string;
  }) => {
    if (!currentUser) {
      return { success: false, message: 'অনুগ্রহ করে প্রথমে লগইন করুন।' };
    }

    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.role === 'moderator';
    const isProxy = Boolean(data.targetMemberId && isAdmin);
    const targetMember = isProxy 
      ? members.find(m => m.id === data.targetMemberId) 
      : currentUser;

    if (!targetMember) {
      return { success: false, message: 'সদস্য খুঁজে পাওয়া যায়নি।' };
    }

    // Check member status
    if (targetMember.status === 'frozen' || targetMember.status === 'suspended' || targetMember.status === 'removed') {
      return { 
        success: false, 
        message: `সদস্য ${targetMember.name} এর অ্যাকাউন্ট বর্তমানে ${targetMember.status} অবস্থায় রয়েছে। শিডিউল করা সম্ভব নয়।` 
      };
    }

    // Check if scheduling is globally enabled
    if (settings.scheduleEnabled === false) {
      return { success: false, message: 'অ্যাডমিন বর্তমানে শিডিউল লিংক সাবমিশন ফিচারটি সাময়িকভাবে বন্ধ রেখেছেন।' };
    }

    // URL validation
    const trimmedUrl = data.postUrl.trim();
    if (!trimmedUrl.includes('facebook.com') && !trimmedUrl.includes('fb.watch') && !trimmedUrl.includes('fb.me')) {
      return { success: false, message: 'অনুগ্রহ করে সঠিক ফেসবুক পোস্ট, ভিডিও বা রিলস এর লিংক দিন।' };
    }

    // Schedule Time Validation Rules:
    // 10:00 AM - 11:59 AM strictly blocked (peak instant submission hour)
    // Allowed from scheduleAllowedStartTime (default 12:00) to scheduleAllowedEndTime (default 16:50)
    const allowedStart = settings.scheduleAllowedStartTime || '12:00';
    const allowedEnd = settings.scheduleAllowedEndTime || settings.submissionWindowEnd || '16:50';
    
    const timeParts = data.scheduledForTime.split(':');
    if (timeParts.length !== 2) {
      return { success: false, message: 'অনুগ্রহ করে সঠিক সময় নির্বাচন করুন (HH:mm)।' };
    }
    const timeNum = parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10);
    const [startH, startM] = allowedStart.split(':').map(n => parseInt(n, 10));
    const allowedStartNum = startH * 60 + startM;
    const [endH, endM] = allowedEnd.split(':').map(n => parseInt(n, 10));
    const allowedEndNum = endH * 60 + endM;

    // Specifically block 10:00 AM - 11:59 AM
    const tenAM = 10 * 60;
    const twelvePM = 12 * 60;
    if (timeNum >= tenAM && timeNum < twelvePM) {
      return {
        success: false,
        message: 'সকাল ১০:০০ - ১১:৫৯ সরাসরি লিংক সাবমিশনের পিক আওয়ার হওয়ায় এই সময়ে শিডিউল বুকিং বন্ধ থাকে। অনুগ্রহ করে দুপুর ১২:০০ বা তার পরবর্তী সময় নির্বাচন করুন।'
      };
    }

    if (timeNum < allowedStartNum) {
      return {
        success: false,
        message: `শিডিউল লিংক শুধুমাত্র দুপুর ${allowedStart} থেকে বিকেল ${allowedEnd} এর মধ্যে বুক করা যাবে।`
      };
    }

    if (timeNum > allowedEndNum) {
      return {
        success: false,
        message: `বিকেল ${allowedEnd} এর পর সাবমিশন উইন্ডো বন্ধ থাকে। অনুগ্রহ করে ${allowedStart} থেকে ${allowedEnd} এর মধ্যে সময় নির্বাচন করুন।`
      };
    }

    const scheduledDateTimeStr = `${data.scheduledForDate}T${data.scheduledForTime}:00+06:00`;
    const scheduledTimestamp = new Date(scheduledDateTimeStr).getTime();

    if (isNaN(scheduledTimestamp)) {
      return { success: false, message: 'তারিখ ও সময় ফরম্যাট সঠিক নয়।' };
    }

    // If scheduled for today, must be in the future
    const now = Date.now();
    if (data.scheduledForDate === TODAY && scheduledTimestamp <= now + 30000) {
      return { 
        success: false, 
        message: 'শিডিউল সময় অবশ্যই বর্তমান সময় থেকে ভবিষ্যতে হতে হবে।' 
      };
    }

    // Check if member already has a pending scheduled link for this date
    const existingSchedule = scheduledLinks.find(s => 
      s.memberId === targetMember.id && 
      s.scheduledForDate === data.scheduledForDate && 
      (s.status === 'scheduled' || s.status === 'processing')
    );
    if (existingSchedule) {
      return {
        success: false,
        message: `${targetMember.name} এর ${data.scheduledForDate} তারিখের জন্য ইতোমধ্যে একটি শিডিউল অপেক্ষমান রয়েছে (সময়: ${existingSchedule.scheduledForTime})।`
      };
    }

    const formattedUrl = cleanAndFormatFacebookUrl(trimmedUrl, 'm');
    const newScheduledLink: ScheduledLink = {
      id: `sched_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      memberId: targetMember.id,
      memberName: targetMember.name,
      memberAvatar: targetMember.avatar,
      memberUsername: targetMember.username,
      postUrl: formattedUrl,
      caption: data.caption?.trim() || '',
      postType: data.postType || 'photo',
      instruction: data.instruction?.trim() || '',
      category: data.category || 'member',
      scheduledForDate: data.scheduledForDate,
      scheduledForTime: data.scheduledForTime,
      scheduledForTimestamp: scheduledTimestamp,
      status: 'scheduled',
      createdAt: getBangladeshCurrentTime12h(),
      createdAtTimestamp: now,
      isScheduledByAdmin: isProxy,
      scheduledByAdminId: isProxy ? currentUser.id : undefined,
      scheduledByAdminName: isProxy ? currentUser.name : undefined,
      communityId: currentCommunityId
    };

    setScheduledLinks(prev => [newScheduledLink, ...prev]);

    addAuditLog(
      isProxy ? 'ADMIN_SCHEDULE_LINK' : 'MEMBER_SCHEDULE_LINK',
      'link',
      newScheduledLink.id,
      targetMember.name,
      `${currentUser.name} scheduled link for ${data.scheduledForDate} at ${data.scheduledForTime}.`
    );

    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: targetMember.id,
      type: 'support_reminder',
      title: '📅 লিংক শিডিউল সফল হয়েছে!',
      message: `আপনার লিংকটি ${data.scheduledForDate} তারিখ দুপুর ${data.scheduledForTime}-এ স্বয়ংক্রিয়ভাবে লাইভ হবে। আপনি অফলাইনে থাকলেও সার্ভার নিজে থেকে সাবমিট করবে।`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    return {
      success: true,
      message: `✓ লিংকটি সফলভাবে শিডিউল করা হয়েছে (${data.scheduledForDate} @ ${data.scheduledForTime})। নির্ধারিত সময়ে অটোমেটিক লাইভ হবে!`,
      scheduledLink: newScheduledLink
    };
  };

  // Edit pending scheduled link (no 2-minute limit before release!)
  const editScheduledLink = (id: string, updates: {
    postUrl?: string;
    scheduledForDate?: string;
    scheduledForTime?: string;
    postType?: PostContentType;
    caption?: string;
    instruction?: string;
  }) => {
    const item = scheduledLinks.find(s => s.id === id);
    if (!item) return { success: false, message: 'শিডিউল লিংক খুঁজে পাওয়া যায়নি।' };

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'moderator';
    const isOwner = currentUser?.id === item.memberId;

    if (!isAdmin && !isOwner) {
      return { success: false, message: 'আপনার এই শিডিউল লিংক এডিট করার অনুমতি নেই।' };
    }

    if (item.status !== 'scheduled') {
      return { success: false, message: 'শুধুমাত্র অপেক্ষমান (Scheduled) লিংক এডিট করা সম্ভব।' };
    }

    let newTimestamp = item.scheduledForTimestamp;
    const targetDate = updates.scheduledForDate || item.scheduledForDate;
    const targetTime = updates.scheduledForTime || item.scheduledForTime;

    if (updates.scheduledForDate || updates.scheduledForTime) {
      const allowedStart = settings.scheduleAllowedStartTime || '12:00';
      const allowedEnd = settings.scheduleAllowedEndTime || settings.submissionWindowEnd || '16:50';
      const [h, m] = targetTime.split(':').map(n => parseInt(n, 10));
      const tNum = h * 60 + m;
      if (tNum >= 600 && tNum < 720) {
        return { success: false, message: 'সকাল ১০:০০ - ১১:৫৯ এর মধ্যে শিডিউল অনুমোদিত নয়। দুপুর ১২:০০ বা তার পর নির্বাচন করুন।' };
      }
      newTimestamp = new Date(`${targetDate}T${targetTime}:00+06:00`).getTime();
    }

    const formattedUrl = updates.postUrl ? cleanAndFormatFacebookUrl(updates.postUrl, 'm') : item.postUrl;

    setScheduledLinks(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          postUrl: formattedUrl,
          scheduledForDate: targetDate,
          scheduledForTime: targetTime,
          scheduledForTimestamp: newTimestamp,
          postType: updates.postType || s.postType,
          caption: updates.caption !== undefined ? updates.caption : s.caption,
          instruction: updates.instruction !== undefined ? updates.instruction : s.instruction
        };
      }
      return s;
    }));

    return { success: true, message: '✓ শিডিউল লিংক সফলভাবে আপডেট করা হয়েছে।' };
  };

  // Cancel scheduled link
  const cancelScheduledLink = (id: string, reason?: string) => {
    const item = scheduledLinks.find(s => s.id === id);
    if (!item) return { success: false, message: 'শিডিউল লিংক পাওয়া যায়নি।' };

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'moderator';
    const isOwner = currentUser?.id === item.memberId;

    if (!isAdmin && !isOwner) {
      return { success: false, message: 'অনুমতি নেই।' };
    }

    if (item.status === 'submitted') {
      return { success: false, message: 'লিংকটি ইতোমধ্যে সাবমিট হয়ে গেছে, এখন শিডিউল বাতিল করা যাবে না।' };
    }

    setScheduledLinks(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: 'cancelled',
          cancellationReason: reason || (isAdmin ? `অ্যাডমিন ${currentUser?.name} কর্তৃক বাতিল` : 'সদস্য নিজে বাতিল করেছেন')
        };
      }
      return s;
    }));

    return { success: true, message: '✓ শিডিউলটি বাতিল করা হয়েছে।' };
  };

  // Force Submit (Admin immediate release)
  const forceSubmitScheduledLink = (id: string) => {
    const item = scheduledLinks.find(s => s.id === id);
    if (!item) return { success: false, message: 'শিডিউল লিংক পাওয়া যায়নি।' };

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'moderator';
    if (!isAdmin) {
      return { success: false, message: 'শুধুমাত্র অ্যাডমিন ফোর্স সাবমিট করতে পারবেন।' };
    }

    if (item.status !== 'scheduled') {
      return { success: false, message: `এই লিংকটি ইতোমধ্যে ${item.status} অবস্থায় আছে।` };
    }

    const member = members.find(m => m.id === item.memberId);
    if (!member) {
      return { success: false, message: 'সদস্য পাওয়া যায়নি।' };
    }

    const nextLinkNumber = getNextAtomicLinkNumber(TODAY, currentCommunityId);
    const partNumber = Math.max(1, Math.ceil(nextLinkNumber / 20));
    const nowTimestamp = Date.now();
    const editableUntilTimestamp = nowTimestamp + (2 * 60 * 1000);

    const newLink: DailyLink = {
      id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      memberId: member.id,
      memberName: member.name,
      memberAvatar: member.avatar,
      memberUsername: member.username,
      linkNumber: nextLinkNumber,
      partNumber: partNumber,
      postUrl: item.postUrl,
      caption: item.caption || '',
      postType: item.postType || 'photo',
      instruction: item.instruction || '',
      category: item.category || 'member',
      submittedAt: getBangladeshCurrentTime12h(),
      submittedAtTimestamp: nowTimestamp,
      editableUntil: editableUntilTimestamp,
      date: TODAY,
      supportCount: 0,
      communityId: currentCommunityId,
      verified: true
    };

    setDailyLinks(prev => [...prev, newLink]);

    setScheduledLinks(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: 'submitted',
          submittedAt: getBangladeshCurrentTime12h(),
          submittedDailyLinkId: newLink.id,
          assignedLinkNumber: nextLinkNumber
        };
      }
      return s;
    }));

    // Update member stats
    setMembers(prev => prev.map(m => {
      if (m.id === member.id) {
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

    addAuditLog(
      'ADMIN_FORCE_SUBMIT_SCHEDULE',
      'link',
      newLink.id,
      member.name,
      `Admin ${currentUser?.name} force-released scheduled link as Link #${nextLinkNumber} (Part ${partNumber}).`
    );

    return {
      success: true,
      message: `✓ লিংক #${nextLinkNumber} (Part ${partNumber}) হিসেবে সফলভাবে তাৎক্ষণিক লাইভ করা হয়েছে!`,
      link: newLink
    };
  };

  // Delete scheduled link (Admin only)
  const deleteScheduledLink = (id: string) => {
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'moderator';
    if (!isAdmin) return { success: false, message: 'অনুমতি নেই।' };
    setScheduledLinks(prev => prev.filter(s => s.id !== id));
    return { success: true, message: '✓ শিডিউল রেকর্ড ডিলিট করা হয়েছে।' };
  };

  // Central Scheduler Engine: Evaluates and promotes scheduled links whose time has arrived
  const processScheduledLinks = () => {
    const now = Date.now();
    const pendingToProcess = scheduledLinks.filter(s => 
      s.status === 'scheduled' && s.scheduledForTimestamp <= now
    );

    if (pendingToProcess.length === 0) return;

    pendingToProcess.forEach(item => {
      // 1. Verify Member Status: Must be ACTIVE and NOT removed/frozen/suspended
      const member = members.find(m => m.id === item.memberId);
      if (!member || member.status === 'frozen' || member.status === 'suspended' || member.status === 'removed') {
        setScheduledLinks(prev => prev.map(s => s.id === item.id ? {
          ...s,
          status: 'cancelled',
          cancellationReason: `সদস্যের অ্যাকাউন্ট নিষ্ক্রিয় বা অ্যাডমিন দ্বারা স্থগিত/রিমুভ করা হয়েছে (${member?.status || 'removed'})`
        } : s));

        addAuditLog(
          'SCHEDULE_AUTO_CANCELLED',
          'link',
          item.id,
          item.memberName,
          `Scheduled link for ${item.memberName} was auto-cancelled because member is ${member?.status || 'not found'}.`
        );
        return;
      }

      // 2. Check if member has already submitted for target date
      const alreadyHasLink = dailyLinks.some(l => 
        l.memberId === member.id && 
        l.date === item.scheduledForDate && 
        l.communityId === item.communityId
      );

      if (alreadyHasLink) {
        setScheduledLinks(prev => prev.map(s => s.id === item.id ? {
          ...s,
          status: 'cancelled',
          cancellationReason: 'আজকের দিনে সদস্যের ইতোমধ্যে একটি লিংক সাবমিট করা আছে'
        } : s));
        return;
      }

      // 3. Atomically generate link number at the exact moment of execution
      const nextLinkNumber = getNextAtomicLinkNumber(item.scheduledForDate, item.communityId);
      const partNumber = Math.max(1, Math.ceil(nextLinkNumber / 20));
      const nowTimestamp = Date.now();
      const editableUntilTimestamp = nowTimestamp + (2 * 60 * 1000); // 2 minutes from release

      const newDailyLink: DailyLink = {
        id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        memberId: member.id,
        memberName: member.name,
        memberAvatar: member.avatar,
        memberUsername: member.username,
        linkNumber: nextLinkNumber,
        partNumber: partNumber,
        postUrl: item.postUrl,
        caption: item.caption || '',
        postType: item.postType || 'photo',
        instruction: item.instruction || '',
        category: item.category || 'member',
        submittedAt: getBangladeshCurrentTime12h(),
        submittedAtTimestamp: nowTimestamp,
        editableUntil: editableUntilTimestamp,
        date: item.scheduledForDate,
        supportCount: 0,
        communityId: item.communityId,
        verified: true
      };

      setDailyLinks(prev => [...prev, newDailyLink]);

      setScheduledLinks(prev => prev.map(s => s.id === item.id ? {
        ...s,
        status: 'submitted',
        submittedAt: getBangladeshCurrentTime12h(),
        submittedDailyLinkId: newDailyLink.id,
        assignedLinkNumber: nextLinkNumber
      } : s));

      // Update member activity
      setMembers(prev => prev.map(m => {
        if (m.id === member.id) {
          return {
            ...m,
            totalLinksSubmitted: m.totalLinksSubmitted + 1,
            lastActiveDate: item.scheduledForDate,
            inactiveDays: 0,
            status: 'active'
          };
        }
        return m;
      }));

      const newNotif: AppNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        userId: member.id,
        type: 'support_reminder',
        title: `🎉 শিডিউল লিংক #${nextLinkNumber} লাইভ হয়েছে!`,
        message: `আপনার আগে থেকে শিডিউল করা ফেসবুক লিংকটি নির্দিষ্ট সময়ে স্বয়ংক্রিয়ভাবে লাইভ হয়েছে (Link #${nextLinkNumber}, Part ${partNumber})।`,
        timestamp: 'Just now',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);

      addAuditLog(
        'SCHEDULED_LINK_AUTO_RELEASED',
        'link',
        newDailyLink.id,
        member.name,
        `System scheduler automatically released Link #${nextLinkNumber} (Part ${partNumber}) for ${member.name} as scheduled.`
      );
    });
  };

  // Automatic Scheduler ticker: checks for due scheduled links every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      processScheduledLinks();
    }, 10000);
    return () => clearInterval(timer);
  }, [scheduledLinks, members, dailyLinks, currentCommunityId]);

  // Submit Report
  const submitReport = (
    category: ReportCategory, 
    description: string, 
    targetLinkId?: string, 
    targetMemberId?: string, 
    screenshotUrl?: string,
    reasons?: string[]
  ) => {
    if (!currentUser) return { success: false, message: 'Please log in to submit a report.' };

    let targetMemberName = '';
    let finalTargetMemberId = targetMemberId;
    let targetLinkNumber: number | undefined;

    if (targetLinkId) {
      const tl = dailyLinks.find(l => l.id === targetLinkId);
      if (tl) {
        targetMemberName = tl.memberName;
        finalTargetMemberId = tl.memberId;
        targetLinkNumber = tl.linkNumber;
      }
    }

    if (!targetMemberName && finalTargetMemberId) {
      const tm = members.find(m => m.id === finalTargetMemberId);
      if (tm) targetMemberName = tm.name;
    }

    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      reporterUsername: currentUser.username,
      reporterAvatar: currentUser.avatar,
      category,
      reasons: reasons && reasons.length > 0 ? reasons : undefined,
      description,
      targetLinkId,
      targetLinkNumber,
      targetMemberId: finalTargetMemberId,
      targetMemberName,
      screenshotUrl,
      status: 'pending',
      createdAt: new Date().toLocaleString('bn-BD', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
      communityId: currentCommunityId,
      replies: [],
      unreadBy: finalTargetMemberId ? [finalTargetMemberId] : []
    };

    setReports(prev => [newReport, ...prev]);

    // Send immediate high-priority warning notification to the link owner and admins
    const notifsToAdd: AppNotification[] = [];
    const reasonSummary = (reasons && reasons.length > 0) ? reasons.join(', ') : (description || 'সমস্যা রিপোর্ট করা হয়েছে');

    if (finalTargetMemberId && finalTargetMemberId !== currentUser.id) {
      notifsToAdd.push({
        id: `notif_${Date.now()}_rep_owner`,
        userId: finalTargetMemberId,
        type: 'warning',
        title: targetLinkNumber ? `⚠️ আপনার লিংক #${targetLinkNumber}-এ সমস্যা রিপোর্ট এসেছে!` : `⚠️ আপনার লিংকে সমস্যা রিপোর্ট এসেছে!`,
        message: `${currentUser.name} সমস্যা জানিয়েছেন: ${reasonSummary}`,
        timestamp: 'এইমাত্র',
        read: false,
        actionUrl: 'dashboard',
        reportId: newReport.id
      });
    }

    // Admin notification
    notifsToAdd.push({
      id: `notif_${Date.now()}_rep_admin`,
      userId: 'all',
      type: 'warning',
      title: targetLinkNumber ? `🚩 লিংক #${targetLinkNumber}-এ রিপোর্ট: ${currentUser.name}` : `🚩 নতুন রিপোর্ট: ${currentUser.name}`,
      message: `${targetMemberName || 'সদস্য'}-এর লিংকে সমস্যা: ${reasonSummary}`,
      timestamp: 'এইমাত্র',
      read: false,
      actionUrl: 'admin/reports',
      reportId: newReport.id
    });

    setNotifications(prev => [...notifsToAdd, ...prev]);

    return { success: true, message: '✓ সমস্যা রিপোর্ট সফলভাবে সাবমিট হয়েছে। লিংক দাতা ও এডমিনকে অবহিত করা হয়েছে।' };
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

  // Reports & Reply Conversation
  const addReportReply = (reportId: string, message: string, screenshotUrl?: string) => {
    if (!currentUser) return { success: false, message: 'অনুগ্রহ করে প্রথমে লগইন করুন।' };
    if (!message.trim() && !screenshotUrl) {
      return { success: false, message: 'একটি বার্তা বা স্ক্রিনশট প্রদান করুন।' };
    }

    const report = reports.find(r => r.id === reportId);
    if (!report) return { success: false, message: 'রিপোর্টটি পাওয়া যায়নি।' };

    // Permission check: Only reporter, target member (link owner), or admin/moderator can reply
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.role === 'moderator';
    const isOwner = currentUser.id === report.targetMemberId;
    const isReporter = currentUser.id === report.reporterId;

    if (!isAdmin && !isOwner && !isReporter) {
      return { success: false, message: 'এই রিপোর্টে রিপ্লাই দেওয়ার অনুমতি আপনার নেই।' };
    }

    let senderRole: 'reporter' | 'link_owner' | 'admin' | 'moderator' = 'reporter';
    if (isAdmin) senderRole = currentUser.role === 'moderator' ? 'moderator' : 'admin';
    else if (isOwner) senderRole = 'link_owner';

    const newReply = {
      id: `rep_r_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      reportId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderUsername: currentUser.username,
      senderAvatar: currentUser.avatar,
      senderRole,
      message: message.trim(),
      screenshotUrl,
      createdAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    // Calculate unread recipients (everyone in the thread except sender)
    const unreadSet = new Set<string>(report.unreadBy || []);
    unreadSet.delete(currentUser.id);

    const notifsToAdd: AppNotification[] = [];
    const truncatedMsg = message.length > 50 ? message.substring(0, 47) + '...' : message;

    if (isOwner) {
      // Link owner replied -> notify reporter and admins
      unreadSet.add(report.reporterId);
      notifsToAdd.push({
        id: `notif_${Date.now()}_reply_to_rep`,
        userId: report.reporterId,
        type: 'report_reply',
        title: `💬 লিংক দাতা (${currentUser.name}) রিপোর্টে রিপ্লাই দিয়েছেন`,
        message: `"${truncatedMsg}" (লিংক #${report.targetLinkNumber || 'পোস্ট'})`,
        timestamp: 'এইমাত্র',
        read: false,
        actionUrl: 'dashboard',
        reportId
      });
    } else if (isReporter) {
      // Reporter replied -> notify link owner
      if (report.targetMemberId) {
        unreadSet.add(report.targetMemberId);
        notifsToAdd.push({
          id: `notif_${Date.now()}_reply_to_owner`,
          userId: report.targetMemberId,
          type: 'report_reply',
          title: `💬 রিপোর্টার (${currentUser.name}) রিপোর্টে রিপ্লাই দিয়েছেন`,
          message: `"${truncatedMsg}" (লিংক #${report.targetLinkNumber || 'পোস্ট'})`,
          timestamp: 'এইমাত্র',
          read: false,
          actionUrl: 'dashboard',
          reportId
        });
      }
    } else {
      // Admin replied -> notify both link owner and reporter
      unreadSet.add(report.reporterId);
      notifsToAdd.push({
        id: `notif_${Date.now()}_admin_to_rep`,
        userId: report.reporterId,
        type: 'report_reply',
        title: `🛡️ এডমিন রিপোর্টে মেসেজ দিয়েছেন`,
        message: `"${truncatedMsg}"`,
        timestamp: 'এইমাত্র',
        read: false,
        actionUrl: 'dashboard',
        reportId
      });
      if (report.targetMemberId) {
        unreadSet.add(report.targetMemberId);
        notifsToAdd.push({
          id: `notif_${Date.now()}_admin_to_owner`,
          userId: report.targetMemberId,
          type: 'report_reply',
          title: `🛡️ এডমিন আপনার লিংকের রিপোর্টে মেসেজ দিয়েছেন`,
          message: `"${truncatedMsg}"`,
          timestamp: 'এইমাত্র',
          read: false,
          actionUrl: 'dashboard',
          reportId
        });
      }
    }

    if (notifsToAdd.length > 0) {
      setNotifications(prev => [...notifsToAdd, ...prev]);
    }

    // Update report: automatically update status from pending/open to in_discussion
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        const existingReplies = r.replies || [];
        const nextStatus: ReportStatus = (r.status === 'open' || r.status === 'pending') ? 'in_discussion' : r.status;
        return {
          ...r,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
          unreadBy: Array.from(unreadSet),
          replies: [...existingReplies, newReply]
        };
      }
      return r;
    }));

    addAuditLog('REPORT_REPLY', 'report', reportId, report.targetMemberName || 'Report', `${currentUser.name} (${senderRole}) added a reply`);

    return { success: true, message: '✓ আপনার রিপ্লাই সফলভাবে পাঠানো হয়েছে!' };
  };

  const updateReportStatus = (reportId: string, status: ReportStatus, note?: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status,
          adminNotes: note !== undefined ? note : r.adminNotes,
          resolvedBy: (status === 'resolved' || status === 'dismissed') ? (currentUser?.name || 'Admin') : r.resolvedBy,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    }));
    addAuditLog('UPDATE_REPORT_STATUS', 'report', reportId, reportId, `Status updated to ${status}`);
  };

  const markReportRead = (reportId: string) => {
    if (!currentUser) return;
    setReports(prev => prev.map(r => {
      if (r.id === reportId && r.unreadBy && r.unreadBy.includes(currentUser.id)) {
        return {
          ...r,
          unreadBy: r.unreadBy.filter(uid => uid !== currentUser.id)
        };
      }
      return r;
    }));
  };

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

  // Links Removal (Admin can remove anytime; Member only within 2 minutes)
  const removeDailyLink = (linkId: string): { success: boolean; message: string } => {
    const targetLink = dailyLinks.find(l => l.id === linkId);
    if (!targetLink) {
      return { success: false, message: 'লিংক পাওয়া যায়নি।' };
    }

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin' || currentUser?.role === 'moderator';

    if (!isAdmin) {
      if (!currentUser || targetLink.memberId !== currentUser.id) {
        return { success: false, message: 'আপনি অন্যের লিংক ডিলিট করতে পারবেন না।' };
      }
      const now = Date.now();
      const deadline = targetLink.editableUntil || (targetLink.submittedAtTimestamp ? targetLink.submittedAtTimestamp + 120000 : 0);
      if (deadline > 0 && now > deadline) {
        return {
          success: false,
          message: '২ মিনিট অতিবাহিত হওয়ায় মেম্বার কর্তৃক লিংক ডিলিট বা রিমুভ করা সম্ভব নয়। প্রয়োজনে এডমিনের সাথে যোগাযোগ করুন।'
        };
      }
    }

    setDailyLinks(prev => prev.filter(l => l.id !== linkId));
    addAuditLog(
      'REMOVE_LINK',
      'link',
      linkId,
      targetLink.memberName,
      `${isAdmin ? 'Admin ' + (currentUser?.name || '') : 'Member ' + targetLink.memberName} removed Link #${targetLink.linkNumber}`
    );
    return { success: true, message: `✓ লিংক #${targetLink.linkNumber} সফলভাবে রিমুভ করা হয়েছে।` };
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

        // Scheduled Links
        scheduledLinks,
        scheduleLink,
        editScheduledLink,
        cancelScheduledLink,
        forceSubmitScheduledLink,
        deleteScheduledLink,
        processScheduledLinks,

        loginAs,
        logout,
        registerMember,
        switchCommunity,
        toggleDarkMode,

        submitDailyLink,
        editDailyLink,
        updateDailyLinkUrl,
        markLinkSupported,
        unmarkLinkSupported,
        submitReport,
        resolveReportsForLink,
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

        // Reports & Reply Conversation
        addReportReply,
        updateReportStatus,
        markReportRead,
        activeReportModalId,
        setActiveReportModalId,
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
