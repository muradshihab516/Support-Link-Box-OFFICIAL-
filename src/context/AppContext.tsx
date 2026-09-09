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
  ScheduleStatus,
  AdminSupportLink,
  LatePenaltyRecord,
  PointsHistoryRecord,
  AdDailyRollup,
  DataCleanupLog,
  RewardRedemption,
  StorageOptimizationStats,
  LateSupportReport,
  LateSupportReportStatus,
  MovieItem,
  MovieFormatLink,
  MovieRequestItem,
  MovieRequestStatus,
  ThemePreset,
  NameChangeRequest
} from '../types';
import { THEME_PRESETS, DEFAULT_THEME_ID } from '../data/themePresets';
import { normalizeFacebookName, validateAndExtractFacebookId } from '../utils/facebookIdentity';
import { exportToCSV, exportToTextFile } from '../utils/helpers';
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
  INITIAL_SCHEDULED_LINKS,
  INITIAL_ADMIN_SUPPORT_LINKS,
  INITIAL_LATE_PENALTIES,
  INITIAL_POINTS_HISTORY,
  INITIAL_AD_DAILY_ROLLUPS,
  INITIAL_DATA_CLEANUP_LOGS,
  INITIAL_REWARD_REDEMPTIONS,
  INITIAL_LATE_SUPPORT_REPORTS
} from '../data/seedData';
import { INITIAL_MOVIES, INITIAL_MOVIE_REQUESTS, generateRandomToken } from '../data/mockMovies';

import { cleanAndFormatFacebookUrl } from '../utils/facebookLinks';
import { 
  supabase, 
  isSupabaseConfigured, 
  supabaseDb, 
  supabaseAuth 
} from '../lib/supabase';
import { 
  checkBangladeshSubmissionWindow, 
  getBangladeshCurrentTime12h, 
  checkLateSupportPunishment, 
  LateSupportStatus,
  checkBangladeshLateReportEligibility,
  isSameBangladeshWeek,
  calculateLateRecoveryDeadline
} from '../utils/bangladeshTime';

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

  // Theme Presets & Wallpaper
  currentThemeId: string;
  customThemeBgUrl: string;
  themeOverlayOpacity: number;
  activeTheme: ThemePreset;
  setTheme: (themeId: string, customBgUrl?: string) => void;
  setThemeOverlayOpacity: (opacity: number) => void;

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

  // Auth & Identity Verification (Supabase Auth Architecture)
  loginAs: (memberId: string) => void;
  logout: () => void;
  loginWithEmailAndPassword: (email: string, password: string) => { success: boolean; message: string; member?: Member };
  registerMember: (data: { 
    name?: string; 
    facebookName?: string; 
    username?: string; 
    email: string; 
    password?: string; 
    facebookUrl: string; 
    avatar?: string;
  }) => { success: boolean; message: string; member?: Member };
  approveMemberRegistration: (memberId: string) => { success: boolean; message: string };
  rejectMemberRegistration: (memberId: string, reason?: string) => { success: boolean; message: string };
  nameChangeRequests: NameChangeRequest[];
  requestNameChange: (data: { memberId: string; requestedName: string; reason?: string }) => { success: boolean; message: string; request?: NameChangeRequest };
  reviewNameChangeRequest: (requestId: string, status: 'approved' | 'rejected', adminNote?: string) => { success: boolean; message: string };
  adminUpdateMemberFacebookName: (memberId: string, newFacebookName: string, adminNote?: string) => { success: boolean; message: string };
  toggleMemberNameLock: (memberId: string, locked?: boolean) => { success: boolean; message: string };
  toggleMemberNameMismatch: (memberId: string, flagged?: boolean, note?: string) => { success: boolean; message: string };
  exportGapCheckerMemberList: (format?: 'txt' | 'csv') => void;
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

  // Supabase Database & Auth State
  isSupabaseActive: boolean;
  supabaseSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  syncDataWithSupabase: () => Promise<void>;
  verifyDatabaseSystemAdmin: (member?: Member | null) => Promise<boolean>;

  // Admin Actions
  isDeveloper: (member?: Member | null) => boolean;
  promoteToAdmin: (targetMemberId: string, note?: string) => { success: boolean; message: string };
  demoteAdminToMember: (targetMemberId: string, note?: string) => { success: boolean; message: string };
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

  // Punishment & Auto-Admin
  latePenalties: LatePenaltyRecord[];
  adminSupportLinks: AdminSupportLink[];
  toggleMemberLinkSubmitPermission: (memberId: string, allowed?: boolean, reason?: string) => { success: boolean; message: string };
  completeLateAllDone: (memberId: string) => { success: boolean; lateStatus?: LateSupportStatus; penaltyRecord?: LatePenaltyRecord };
  watchPenaltyAd: (penaltyId: string) => { success: boolean; adsWatched: number; requiredAds: number; isCompleted: boolean };
  adminReactivateMember: (memberId: string, notes?: string) => { success: boolean; message: string };
  adminWaivePenalty: (penaltyId: string, notes?: string) => { success: boolean; message: string };
  adminRevokeLinkSubmit: (memberId: string, reason?: string) => { success: boolean; message: string };
  adminRestoreLinkSubmit: (memberId: string) => { success: boolean; message: string };
  addOrUpdateAdminSupportLink: (data: Partial<AdminSupportLink>) => { success: boolean; message: string };
  deleteAdminSupportLink: (id: string) => { success: boolean; message: string };
  runAutoAdminPunishmentCheck: (options?: { forceMidnightCheck?: boolean; forceCutoffCheck?: boolean }) => { checkedCount: number; tempRemovedCount: number; suspendedCount: number; message: string };
  deletePenaltyRecord: (id: string) => { success: boolean; message: string };

  // Storage & Points Lifecycle Architecture
  pointsHistory: PointsHistoryRecord[];
  adDailyRollups: AdDailyRollup[];
  dataCleanupLogs: DataCleanupLog[];
  rewardRedemptions: RewardRedemption[];
  purgedSupportRecordsCount: number;
  fastestSupportersList: { memberId: string; memberName: string; time: string; rank: number; bonusPoints: number }[];
  awardActionPoints: (
    memberId: string, 
    actionType: 'support' | 'submission' | 'all_done' | 'fastest_bonus' | 'streak_bonus', 
    referenceId: string, 
    customAmount?: number
  ) => { success: boolean; pointsAwarded: number; newTotal: number };
  redeemReward: (memberId: string, rewardType: RewardRedemption['rewardType'], pointsCost: number, title: string) => { success: boolean; message: string };
  generateDailyPointsHistory: (targetDate?: string) => { success: boolean; rowsCreated: number; message: string };
  runDataLifecycleCleanup: (options?: { forceDays?: number; triggeredBy?: string }) => DataCleanupLog;
  exportDataToGoogleSheetsArchive: (options?: { format?: 'csv' | 'json'; sendWebhook?: boolean }) => { success: boolean; message: string; downloadUrl?: string; summaryText?: string; csvContent?: string };
  getStorageOptimizationStats: () => StorageOptimizationStats;

  // Late Support Report System
  lateSupportReports: LateSupportReport[];
  submitLateSupportReport: (
    reason: string,
    details: string,
    screenshotUrl?: string,
    memberIdOverride?: string,
    bypassTimeCheckForTest?: boolean
  ) => { success: boolean; message: string; report?: LateSupportReport };
  adminApproveLateReport: (reportId: string, notes?: string) => { success: boolean; message: string };
  adminRejectLateReport: (reportId: string, rejectionReason: string) => { success: boolean; message: string };
  evaluateLateSupportReports: () => { expiredCount: number; activeCount: number };
  getMemberWeeklyLateReportsCount: (memberId: string) => number;
  canMemberSubmitLateReportToday: (memberId: string) => { canSubmit: boolean; reason?: string; remainingInWeek: number; eligibility?: any };
  getMemberActiveLateReport: (memberId: string) => LateSupportReport | null;
  deleteLateSupportReport: (reportId: string) => { success: boolean; message: string };

  // Entertainment & Movie Lover Module
  movies: MovieItem[];
  addMovie: (movieData: Omit<MovieItem, 'id' | 'createdAt' | 'updatedAt' | 'totalViews' | 'totalDownloads'>) => { success: boolean; movie: MovieItem };
  updateMovie: (id: string, updates: Partial<MovieItem>) => { success: boolean; message: string };
  deleteMovie: (id: string) => { success: boolean; message: string };
  toggleMovieStatus: (id: string) => { success: boolean; newStatus: 'active' | 'draft' | 'archived' };
  incrementMovieViews: (id: string) => void;
  resolveDownloadToken: (token: string) => { success: boolean; destinationUrl?: string; movie?: MovieItem; link?: MovieFormatLink; error?: string };
  recordDownloadClick: (token: string) => void;

  // Movie Request System
  movieRequests: MovieRequestItem[];
  submitMovieRequest: (data: {
    title: string;
    year?: number | string;
    language?: string;
    preferredQuality?: string;
    imdbOrRefUrl?: string;
    notes?: string;
  }) => { success: boolean; message: string; request?: MovieRequestItem };
  upvoteMovieRequest: (requestId: string) => { success: boolean; upvoted: boolean; count: number; message: string };
  updateMovieRequestStatus: (
    requestId: string,
    status: MovieRequestStatus,
    adminReply?: string,
    downloadLink?: string,
    fulfilledMovieId?: string
  ) => { success: boolean; message: string };
  deleteMovieRequest: (requestId: string) => { success: boolean; message: string };
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
  SCHEDULED_LINKS: 'slb_scheduled_links_v4',
  ADMIN_SUPPORT_LINKS: 'slb_admin_support_links_v4',
  LATE_PENALTIES: 'slb_late_penalties_v4',
  POINTS_HISTORY: 'slb_points_history_v4',
  AD_ROLLUPS: 'slb_ad_rollups_v4',
  CLEANUP_LOGS: 'slb_cleanup_logs_v4',
  REWARD_REDEMPTIONS: 'slb_reward_redemptions_v4',
  PURGED_SUPPORTS_COUNT: 'slb_purged_supports_count_v4',
  PROCESSED_POINT_ACTIONS: 'slb_processed_points_v4',
  FASTEST_SUPPORTERS: 'slb_fastest_supporters_v4',
  LATE_SUPPORT_REPORTS: 'slb_late_support_reports_v4',
  MOVIES: 'slb_movies_v4',
  MOVIE_REQUESTS: 'slb_movie_requests_v4',
  NAME_CHANGE_REQUESTS: 'slb_name_change_requests_v4',
  THEME_ID: 'slb_theme_id_v4',
  CUSTOM_BG_URL: 'slb_custom_bg_url_v4',
  THEME_OPACITY: 'slb_theme_opacity_v4'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const TODAY = '2026-08-28';

  // State initialization from localStorage with seed fallback
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    const rawList: Member[] = saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    return rawList.map(m => {
      const fbName = m.facebookName || m.name;
      const normName = m.normalizedName || normalizeFacebookName(fbName);
      const extracted = validateAndExtractFacebookId(m.facebookUrl);
      const fallbackFbId = extracted.isValid && extracted.normalizedFbId ? extracted.normalizedFbId : m.username.replace('@', '').toLowerCase();
      return {
        ...m,
        authUserId: m.authUserId || m.id,
        facebookName: fbName,
        normalizedName: normName,
        normalizedFbId: m.normalizedFbId || fallbackFbId,
        nameLocked: m.nameLocked !== undefined ? m.nameLocked : true,
        nameMismatchFlag: m.nameMismatchFlag !== undefined ? m.nameMismatchFlag : false,
        password: m.password || '123456'
      };
    });
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

  const [adminSupportLinks, setAdminSupportLinks] = useState<AdminSupportLink[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_SUPPORT_LINKS);
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_SUPPORT_LINKS;
  });

  const [latePenalties, setLatePenalties] = useState<LatePenaltyRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LATE_PENALTIES);
    return saved ? JSON.parse(saved) : INITIAL_LATE_PENALTIES;
  });

  const [pointsHistory, setPointsHistory] = useState<PointsHistoryRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POINTS_HISTORY);
    return saved ? JSON.parse(saved) : INITIAL_POINTS_HISTORY;
  });

  const [adDailyRollups, setAdDailyRollups] = useState<AdDailyRollup[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AD_ROLLUPS);
    return saved ? JSON.parse(saved) : INITIAL_AD_DAILY_ROLLUPS;
  });

  const [dataCleanupLogs, setDataCleanupLogs] = useState<DataCleanupLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLEANUP_LOGS);
    return saved ? JSON.parse(saved) : INITIAL_DATA_CLEANUP_LOGS;
  });

  const [rewardRedemptions, setRewardRedemptions] = useState<RewardRedemption[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REWARD_REDEMPTIONS);
    return saved ? JSON.parse(saved) : INITIAL_REWARD_REDEMPTIONS;
  });

  const [purgedSupportRecordsCount, setPurgedSupportRecordsCount] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURGED_SUPPORTS_COUNT);
    return saved ? Number(saved) : 38450;
  });

  const [processedPointActions, setProcessedPointActions] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROCESSED_POINT_ACTIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [fastestSupportersMap, setFastestSupportersMap] = useState<Record<string, { memberId: string; memberName: string; time: string; rank: number; bonusPoints: number }[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FASTEST_SUPPORTERS);
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      '2026-08-28': [
        { memberId: 'user_tanzim', memberName: 'Tanzimul Islam', time: '12:04 PM', rank: 1, bonusPoints: 10 },
        { memberId: 'user_rakib', memberName: 'Rakibul Hasan', time: '12:11 PM', rank: 2, bonusPoints: 8 },
        { memberId: 'user_sakib', memberName: 'Sakib All Hasan', time: '12:18 PM', rank: 3, bonusPoints: 6 }
      ]
    };
  });

  const [lateSupportReports, setLateSupportReports] = useState<LateSupportReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LATE_SUPPORT_REPORTS);
    return saved ? JSON.parse(saved) : INITIAL_LATE_SUPPORT_REPORTS;
  });

  const [movies, setMovies] = useState<MovieItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOVIES);
    return saved ? JSON.parse(saved) : INITIAL_MOVIES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));
    } catch {}
  }, [movies]);

  const [movieRequests, setMovieRequests] = useState<MovieRequestItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOVIE_REQUESTS);
    return saved ? JSON.parse(saved) : INITIAL_MOVIE_REQUESTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVIE_REQUESTS, JSON.stringify(movieRequests));
    } catch {}
  }, [movieRequests]);

  const [nameChangeRequests, setNameChangeRequests] = useState<NameChangeRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NAME_CHANGE_REQUESTS);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NAME_CHANGE_REQUESTS, JSON.stringify(nameChangeRequests));
    } catch {}
  }, [nameChangeRequests]);

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

  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME_ID) || DEFAULT_THEME_ID;
  });

  const [customThemeBgUrl, setCustomThemeBgUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_BG_URL) || '';
  });

  const [themeOverlayOpacity, setThemeOverlayOpacity] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME_OPACITY);
    if (!saved || saved === '80') return 30;
    return Number(saved);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME_ID, currentThemeId);
  }, [currentThemeId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_BG_URL, customThemeBgUrl);
  }, [customThemeBgUrl]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME_OPACITY, themeOverlayOpacity.toString());
  }, [themeOverlayOpacity]);

  const activeTheme = useMemo<ThemePreset>(() => {
    const found = THEME_PRESETS.find(t => t.id === currentThemeId) || THEME_PRESETS[0];
    if (currentThemeId === 'custom_wallpaper' && customThemeBgUrl) {
      return {
        ...found,
        bgImageUrl: customThemeBgUrl,
        thumbnailUrl: customThemeBgUrl
      };
    }
    return found;
  }, [currentThemeId, customThemeBgUrl]);

  const setTheme = (themeId: string, customBgUrl?: string) => {
    setCurrentThemeId(themeId);
    if (customBgUrl !== undefined) {
      setCustomThemeBgUrl(customBgUrl);
    }
  };

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
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ADMIN_SUPPORT_LINKS, JSON.stringify(adminSupportLinks)); }, [adminSupportLinks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LATE_PENALTIES, JSON.stringify(latePenalties)); }, [latePenalties]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.POINTS_HISTORY, JSON.stringify(pointsHistory)); }, [pointsHistory]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AD_ROLLUPS, JSON.stringify(adDailyRollups)); }, [adDailyRollups]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CLEANUP_LOGS, JSON.stringify(dataCleanupLogs)); }, [dataCleanupLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.REWARD_REDEMPTIONS, JSON.stringify(rewardRedemptions)); }, [rewardRedemptions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PURGED_SUPPORTS_COUNT, purgedSupportRecordsCount.toString()); }, [purgedSupportRecordsCount]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PROCESSED_POINT_ACTIONS, JSON.stringify(processedPointActions)); }, [processedPointActions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.FASTEST_SUPPORTERS, JSON.stringify(fastestSupportersMap)); }, [fastestSupportersMap]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LATE_SUPPORT_REPORTS, JSON.stringify(lateSupportReports)); }, [lateSupportReports]);

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

  // Supabase Database & Auth Synchronization Engine
  const isSupabaseActive = isSupabaseConfigured();
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>(() => {
    return isSupabaseConfigured() ? 'syncing' : 'offline';
  });

  const syncDataWithSupabase = async () => {
    if (!isSupabaseConfigured()) {
      setSupabaseSyncStatus('offline');
      return;
    }
    setSupabaseSyncStatus('syncing');
    try {
      // 1. Fetch remote members from Supabase
      const remoteMembers = await supabaseDb.fetchMembers();
      if (remoteMembers && remoteMembers.length > 0) {
        setMembers(remoteMembers);
      } else {
        // If Supabase table is initialized but empty, seed initial members to Supabase
        for (const m of members) {
          await supabaseDb.upsertMember(m);
        }
      }

      // 2. Fetch daily links
      const remoteLinks = await supabaseDb.fetchDailyLinks(selectedDate);
      if (remoteLinks && remoteLinks.length > 0) {
        setDailyLinks(remoteLinks);
      }

      setSupabaseSyncStatus('synced');
    } catch (err) {
      console.error('Supabase synchronization error:', err);
      setSupabaseSyncStatus('error');
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured()) {
      syncDataWithSupabase();

      // Realtime Supabase Auth state change listener
      const { data: authSub } = supabaseAuth.onAuthStateChange((_event, session) => {
        if (session?.user?.email) {
          const authEmail = session.user.email.toLowerCase();
          const matched = members.find(m => m.email.toLowerCase() === authEmail);
          if (matched) {
            setCurrentUserId(matched.id);
          }
        }
      });

      return () => {
        authSub?.subscription?.unsubscribe();
      };
    }
  }, []);

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

  // Helper Audit Logger (Synced with Supabase Audit Logs)
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

    if (isSupabaseConfigured()) {
      supabaseDb.insertAuditLog(newLog).catch(console.error);
    }
  };

  // Auth Operations (Supabase Auth Architecture)
  const loginAs = (memberId: string) => {
    const member = members.find(m => m.id === memberId || m.authUserId === memberId);
    if (member) {
      setCurrentUserId(member.id);
    }
  };

  const logout = () => {
    setCurrentUserId(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch {}
  };

  const loginWithEmailAndPassword = (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const found = members.find(m => m.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { success: false, message: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি।' };
    }

    // Check status: If pending_approval, block login until admin approves!
    if (found.status === 'pending_approval') {
      return { 
        success: false, 
        message: '⚠️ আপনার অ্যাকাউন্টটি এখনও এডমিন এপ্রুভালের অপেক্ষায় রয়েছে (Pending Approval)। এডমিন আপনার তথ্য ও ফেসবুক প্রোফাইল যাচাই করে অনুমোদন দিলে আপনি লগইন করতে পারবেন।',
        member: found
      };
    }

    if (found.status === 'suspended' || found.status === 'removed' || found.status === 'temp_removed') {
      return { 
        success: false, 
        message: 'আপনার অ্যাকাউন্টটি স্থগিত বা নিষ্ক্রিয় করা রয়েছে। বিস্তারিত তথ্যের জন্য এডমিনের সাথে যোগাযোগ করুন।',
        member: found
      };
    }

    // Developer / System Admin special password handling ("Password পরে সেট করবো")
    const isDev = isDeveloper(found);
    if (isDev) {
      // If developer enters a password now or in future, store/update it smoothly
      if (password && password.trim().length > 0 && found.password !== password.trim()) {
        setMembers(prev => prev.map(m => m.id === found.id ? { ...m, password: password.trim() } : m));
      }
    } else {
      // Check password if configured, or default demo password '123456'
      if (found.password && found.password !== password && password !== '123456') {
        return { success: false, message: 'পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' };
      }
    }

    if (isSupabaseConfigured() && password) {
      supabaseAuth.signIn(cleanEmail, password).catch(() => {});
    }

    setCurrentUserId(found.id);
    // Explicitly persist in browser localStorage as requested: "একবার লগইন করলে তথ্য ব্রাউজারে সেভ রেখো"
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, found.id);
      localStorage.setItem('slb_last_logged_email', found.email);
    } catch {}

    return { success: true, message: `স্বাগতম ${found.name}! সফলভাবে লগইন সম্পন্ন হয়েছে।`, member: found };
  };

  const registerMember = (data: { 
    name?: string; 
    facebookName?: string; 
    username?: string; 
    email: string; 
    password?: string; 
    facebookUrl: string; 
    avatar?: string;
  }) => {
    // 1. Validate Facebook URL with strict profile verification & reject /share/
    const fbValidation = validateAndExtractFacebookId(data.facebookUrl);
    if (!fbValidation.isValid) {
      return { 
        success: false, 
        message: fbValidation.error || 'সঠিক ফেসবুক প্রোফাইল লিংক প্রদান করুন।' 
      };
    }

    const normalizedFbId = fbValidation.normalizedFbId!;
    const canonicalProfileUrl = fbValidation.canonicalUrl || data.facebookUrl.trim();

    // 2. Validate Facebook Profile Name
    const rawFbName = (data.facebookName || data.name || '').trim();
    if (!rawFbName) {
      return {
        success: false,
        message: 'ফেসবুক প্রোফাইল নাম প্রদান করা আবশ্যক।'
      };
    }

    const normalizedName = normalizeFacebookName(rawFbName);

    // 3. Check Duplicate normalized_fb_id (Duplicate Prevention)
    const duplicateFb = members.find(m => 
      m.normalizedFbId && m.normalizedFbId.toLowerCase() === normalizedFbId.toLowerCase()
    );
    if (duplicateFb) {
      return {
        success: false,
        message: `এই ফেসবুক প্রোফাইল দিয়ে ইতিমধ্যে সদস্য #${duplicateFb.memberNumber} (${duplicateFb.name}) নিবন্ধিত আছে! একই ফেসবুক আইডি দিয়ে একাধিক অ্যাকাউন্ট খোলা সম্পূর্ণ নিষিদ্ধ।`
      };
    }

    // 4. Check Duplicate Email
    const cleanEmail = data.email.trim().toLowerCase();
    const duplicateEmail = members.find(m => m.email.toLowerCase() === cleanEmail);
    if (duplicateEmail) {
      return {
        success: false,
        message: `"${cleanEmail}" ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট নিবন্ধিত রয়েছে। অনুগ্রহ করে লগইন করুন।`
      };
    }

    // 5. Determine Username
    let cleanUsername = (data.username || '').replace('@', '').trim().toLowerCase();
    if (!cleanUsername) {
      cleanUsername = (normalizedFbId || rawFbName.replace(/\s+/g, '_')).toLowerCase().replace(/[^a-z0-9_]/g, '');
    }
    if (!cleanUsername) cleanUsername = `member_${Date.now().toString().slice(-4)}`;

    let finalUsername = cleanUsername;
    let counter = 1;
    while (members.some(m => m.username.toLowerCase() === finalUsername)) {
      finalUsername = `${cleanUsername}${counter}`;
      counter++;
    }

    // 6. Generate UUID (auth_user_id) for Supabase Auth architecture
    const authUserId = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? `usr_${crypto.randomUUID()}` 
      : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const nextNumber = Math.max(...members.map(m => m.memberNumber), 100) + 1;

    // Use uploaded/provided avatar or high quality profile portrait
    const memberAvatar = data.avatar?.trim() || `https://images.unsplash.com/photo-${1500000000000 + (nextNumber * 100000)}?w=150&auto=format&fit=crop&q=80`;

    const newMember: Member = {
      id: authUserId, // auth_user_id is the technical identity for RLS and permissions
      authUserId: authUserId,
      memberNumber: nextNumber,
      name: rawFbName,
      facebookName: rawFbName,
      normalizedName: normalizedName,
      username: finalUsername,
      email: cleanEmail,
      password: data.password || '123456',
      avatar: memberAvatar,
      facebookUrl: canonicalProfileUrl,
      normalizedFbId: normalizedFbId,
      nameLocked: true, // Will remain locked for GapChecker consistency once approved
      nameMismatchFlag: false,
      joinDate: TODAY,
      joinedAt: new Date().toISOString(),
      role: 'member',
      status: 'pending_approval', // User requested: New registrations MUST be approved by Admin before login!
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
    // NOTE: We deliberately DO NOT call setCurrentUserId(newMember.id) here, because the user must wait for admin approval!

    addAuditLog(
      'REGISTER_MEMBER_PENDING', 
      'member', 
      newMember.id, 
      newMember.name, 
      `New registration submitted awaiting Admin approval. FB Name: "${rawFbName}", FB ID: "${normalizedFbId}", UUID: ${authUserId}`
    );

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        userId: 'all',
        type: 'announcement',
        title: 'নতুন সদস্যের আবেদন জমা পড়েছে',
        message: `${rawFbName} (#${nextNumber}) সদস্যপদের জন্য আবেদন করেছেন। এডমিন এপ্রুভালের অপেক্ষায় আছে।`,
        timestamp: 'Just now',
        read: false
      },
      ...prev
    ]);

    return {
      success: true,
      message: `আপনার রেজিস্ট্রেশন রিকোয়েস্ট সফলভাবে জমা হয়েছে! এডমিন আপনার প্রোফাইল ও তথ্য যাচাই করে এপ্রুভাল (Approve) দিলে আপনি ইমেইল ও পাসওয়ার্ড দিয়ে লগইন করতে পারবেন।`,
      member: newMember
    };
  };

  const approveMemberRegistration = (memberId: string) => {
    const target = members.find(m => m.id === memberId);
    if (!target) return { success: false, message: 'সদস্য পাওয়া যায়নি।' };

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          status: 'active' as MemberStatus,
          nameLocked: true,
          joinDate: TODAY,
          joinedAt: new Date().toISOString()
        };
      }
      return m;
    }));

    addAuditLog(
      'APPROVE_MEMBER_REGISTRATION',
      'member',
      target.id,
      target.name,
      `Member #${target.memberNumber} (${target.name}) registration approved by Admin. Account status set to Active.`
    );

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        userId: 'all',
        type: 'announcement',
        title: 'সদস্য অনুমোদন সম্পন্ন',
        message: `${target.name} (#${target.memberNumber}) এর রেজিস্ট্রেশন অনুমোদন করা হয়েছে। তিনি এখন লগইন করতে পারবেন।`,
        timestamp: 'Just now',
        read: false
      },
      ...prev
    ]);

    return {
      success: true,
      message: `সদস্য #${target.memberNumber} (${target.name}) এর আবেদন সফলভাবে অনুমোদন (Approved) করা হয়েছে!`
    };
  };

  const rejectMemberRegistration = (memberId: string, reason?: string) => {
    const target = members.find(m => m.id === memberId);
    if (!target) return { success: false, message: 'সদস্য পাওয়া যায়নি।' };

    setMembers(prev => prev.filter(m => m.id !== memberId));

    addAuditLog(
      'REJECT_MEMBER_REGISTRATION',
      'member',
      target.id,
      target.name,
      `Member registration for "${target.name}" (${target.email}) was rejected. Reason: ${reason || 'Not specified'}`
    );

    return {
      success: true,
      message: `সদস্যের রেজিস্ট্রেশন আবেদন বাতিল (Rejected) করা হয়েছে।`
    };
  };

  const requestNameChange = (data: { memberId: string; requestedName: string; reason?: string }) => {
    const member = members.find(m => m.id === data.memberId);
    if (!member) return { success: false, message: 'সদস্য পাওয়া যায়নি।' };

    const cleanReq = data.requestedName.trim();
    if (!cleanReq) return { success: false, message: 'নতুন ফেসবুক নাম প্রদান করুন।' };

    const newRequest: NameChangeRequest = {
      id: `ncr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      memberId: member.id,
      memberNumber: member.memberNumber,
      oldName: member.facebookName || member.name,
      requestedName: cleanReq,
      normalizedRequestedName: normalizeFacebookName(cleanReq),
      reason: data.reason?.trim() || 'ফেসবুকে নাম পরিবর্তন করা হয়েছে',
      facebookProfileUrl: member.facebookUrl,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      createdAtTimestamp: Date.now()
    };

    setNameChangeRequests(prev => [newRequest, ...prev]);

    addAuditLog(
      'NAME_CHANGE_REQUESTED',
      'member',
      member.id,
      member.name,
      `Requested name change from "${newRequest.oldName}" to "${cleanReq}". Reason: ${newRequest.reason}`
    );

    return { success: true, message: '✓ নাম পরিবর্তনের আবেদন অ্যাডমিনের নিকট সফলভাবে জমা হয়েছে। অ্যাডমিন ভেরিফাই করে অনুমোদন করবেন।', request: newRequest };
  };

  const reviewNameChangeRequest = (requestId: string, status: 'approved' | 'rejected', adminNote?: string) => {
    const req = nameChangeRequests.find(r => r.id === requestId);
    if (!req) return { success: false, message: 'রিকোয়েস্ট পাওয়া যায়নি।' };

    const adminName = currentUser?.name || 'Admin';

    setNameChangeRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status,
          reviewedBy: adminName,
          reviewedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          adminNote
        };
      }
      return r;
    }));

    if (status === 'approved') {
      setMembers(prev => prev.map(m => {
        if (m.id === req.memberId) {
          return {
            ...m,
            name: req.requestedName,
            facebookName: req.requestedName,
            normalizedName: req.normalizedRequestedName,
            nameLocked: true, // Keep locked
            nameMismatchFlag: false // Clear flag
          };
        }
        return m;
      }));

      addAuditLog(
        'NAME_CHANGE_APPROVED',
        'admin',
        req.memberId,
        req.requestedName,
        `Admin ${adminName} approved name change from "${req.oldName}" to "${req.requestedName}". Note: ${adminNote || 'Approved'}`
      );

      setNotifications(prev => [{
        id: `notif_${Date.now()}_nc_app`,
        userId: req.memberId,
        type: 'announcement',
        title: '✓ নাম পরিবর্তনের আবেদন অনুমোদিত হয়েছে',
        message: `আপনার ফেসবুক নাম "${req.requestedName}" হিসেবে সফলভাবে আপডেট করা হয়েছে।`,
        timestamp: 'এইমাত্র',
        read: false,
        actionUrl: 'profile'
      }, ...prev]);

      return { success: true, message: `✓ "${req.requestedName}" নাম সফলভাবে অনুমোদন ও আপডেট করা হয়েছে।` };
    } else {
      addAuditLog(
        'NAME_CHANGE_REJECTED',
        'admin',
        req.memberId,
        req.oldName,
        `Admin ${adminName} rejected name change to "${req.requestedName}". Reason: ${adminNote || 'Rejected'}`
      );

      setNotifications(prev => [{
        id: `notif_${Date.now()}_nc_rej`,
        userId: req.memberId,
        type: 'warning',
        title: '✕ নাম পরিবর্তনের আবেদন বাতিল করা হয়েছে',
        message: adminNote ? `কারণ: ${adminNote}` : 'আপনার নাম পরিবর্তনের আবেদনটি অ্যাডমিন কর্তৃক বাতিল করা হয়েছে।',
        timestamp: 'এইমাত্র',
        read: false,
        actionUrl: 'profile'
      }, ...prev]);

      return { success: true, message: 'আবেদনটি বাতিল করা হয়েছে।' };
    }
  };

  const adminUpdateMemberFacebookName = (memberId: string, newFacebookName: string, adminNote?: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return { success: false, message: 'সদস্য পাওয়া যায়নি।' };

    const clean = newFacebookName.trim();
    if (!clean) return { success: false, message: 'সঠিক নাম লিখুন।' };

    const oldName = member.facebookName || member.name;
    const norm = normalizeFacebookName(clean);
    const adminName = currentUser?.name || 'Admin';

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          name: clean,
          facebookName: clean,
          normalizedName: norm,
          nameLocked: true,
          nameMismatchFlag: false
        };
      }
      return m;
    }));

    addAuditLog(
      'ADMIN_EDIT_MEMBER_NAME',
      'admin',
      memberId,
      clean,
      `Admin ${adminName} directly updated member #${member.memberNumber} name from "${oldName}" to "${clean}". Note: ${adminNote || 'N/A'}`
    );

    return { success: true, message: `✓ সদস্য #${member.memberNumber} এর ফেসবুক নাম "${clean}" আপডেট করা হয়েছে।` };
  };

  const toggleMemberNameLock = (memberId: string, locked?: boolean) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return { success: false, message: 'সদস্য পাওয়া যায়নি।' };

    const newLocked = locked !== undefined ? locked : !member.nameLocked;
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, nameLocked: newLocked } : m));

    addAuditLog(
      'TOGGLE_NAME_LOCK',
      'admin',
      memberId,
      member.name,
      `Admin toggled name lock for #${member.memberNumber}: ${newLocked ? 'Locked' : 'Unlocked'}`
    );

    return { success: true, message: `✓ নাম ${newLocked ? 'লক' : 'আনলক'} করা হয়েছে।` };
  };

  const toggleMemberNameMismatch = (memberId: string, flagged?: boolean, note?: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return { success: false, message: 'সদস্য পাওয়া যায়নি।' };

    const newFlag = flagged !== undefined ? flagged : !member.nameMismatchFlag;
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, nameMismatchFlag: newFlag, nameMismatchNote: note } : m));

    if (newFlag) {
      setNotifications(prev => [{
        id: `notif_${Date.now()}_mismatch`,
        userId: memberId,
        type: 'warning',
        title: '⚠️ ফেসবুক নাম অমিল (Name Mismatch Flag)',
        message: note || 'সাপ্তাহিক সাপোর্টে আপনার ফেসবুক নামের সাথে কমেন্টের মিল পাওয়া যায়নি। প্রোফাইল থেকে সঠিক নাম আপডেট করার জন্য অনুরোধ করা হলো।',
        timestamp: 'এইমাত্র',
        read: false,
        actionUrl: 'profile'
      }, ...prev]);
    }

    addAuditLog(
      'TOGGLE_NAME_MISMATCH',
      'admin',
      memberId,
      member.name,
      `Admin flagged name mismatch for #${member.memberNumber}: ${newFlag ? 'Flagged' : 'Cleared'}. Note: ${note || 'None'}`
    );

    return { success: true, message: `✓ সদস্যকে Name Mismatch ${newFlag ? 'চিহ্নিত' : 'মুক্ত'} করা হয়েছে।` };
  };

  const exportGapCheckerMemberList = (format: 'txt' | 'csv' = 'txt') => {
    const activeMembers = members.filter(m => m.status === 'active');

    if (format === 'txt') {
      // Clean list of active members' facebook_name (one per line) for GapChecker
      const lines = activeMembers.map(m => (m.facebookName || m.name).trim()).filter(Boolean);
      const textContent = lines.join('\n');
      exportToTextFile(`GapChecker_Active_Members_${activeMembers.length}`, textContent);
    } else {
      const csvData = activeMembers.map(m => ({
        'Member #': m.memberNumber,
        'Facebook Name (Raw)': m.facebookName || m.name,
        'Normalized Name (Matching)': m.normalizedName || normalizeFacebookName(m.name),
        'Facebook Profile URL': m.facebookUrl,
        'Normalized FB ID': m.normalizedFbId || '',
        'Status': m.status,
        'Name Locked': m.nameLocked ? 'YES' : 'NO',
        'Mismatch Flag': m.nameMismatchFlag ? 'FLAGGED' : 'CLEAN',
        'Email': m.email
      }));
      exportToCSV(`GapChecker_Members_Directory_${activeMembers.length}`, csvData);
    }
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

    // Link Submission Permission Revocation check (Admin Revocation)
    if (!isAdmin && effectiveMember.canSubmitLink === false) {
      return { 
        success: false, 
        message: `🔒 Link Submission Disabled: এডমিন কর্তৃক আপনার লিংক সাবমিট করার ক্ষমতা সাময়িকভাবে স্থগিত করা হয়েছে।${effectiveMember.canSubmitLinkRevokeReason ? ` (কারণ: ${effectiveMember.canSubmitLinkRevokeReason})` : ''}` 
      };
    }

    if (!isAdmin && effectiveMember.status === 'temp_removed') {
      return {
        success: false,
        message: '⚠️ আপনি লিংক বক্স থেকে সাময়িকভাবে রিমুভ অবস্থায় আছেন। গতকালকের/আজকের পেন্ডিং সাপোর্ট সম্পূর্ণ করে অল ডান করুন এবং রি-অ্যাক্টিভেশন সম্পন্ন করুন।'
      };
    }

    if (!isAdmin && (effectiveMember.status === 'suspended' || effectiveMember.status === 'removed')) {
      return { success: false, message: `আপনার অ্যাকাউন্ট ${effectiveMember.status} অবস্থায় আছে। লিংক সাবমিট করার জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।` };
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

    // Sync with Supabase Database
    if (isSupabaseConfigured()) {
      supabaseDb.insertDailyLink(newLink).catch(console.error);
    }

    // Update member stats and award real-time submission points
    const subPts = settings.pointRules?.submissionPoints ?? 5;
    awardActionPoints(effectiveMember.id, 'submission', newLink.id, subPts);

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

    // Award real-time support points
    const suppPts = settings.pointRules?.supportPoints ?? 1;
    awardActionPoints(currentUser.id, 'support', dailyLinkId, suppPts);

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

    // Trigger All-Done & Fastest Supporter evaluation
    setTimeout(() => {
      if (currentUser?.id) {
        checkMemberAllDoneStatus(currentUser.id);
      }
    }, 50);

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

    if (!isAdmin && targetMember.status === 'temp_removed') {
      return {
        success: false,
        message: '⚠️ আপনি লিংক বক্স থেকে সাময়িকভাবে রিমুভ অবস্থায় আছেন। পেন্ডিং সাপোর্ট সম্পন্ন করে রি-অ্যাক্টিভেশন ছাড়া শিডিউল করা সম্ভব নয়।'
      };
    }

    // Check Link Submit Permission (canSubmitLink)
    if (!isAdmin && targetMember.canSubmitLink === false) {
      return {
        success: false,
        message: `🔒 Link Submission Disabled: এডমিন কর্তৃক আপনার লিংক সাবমিট করার ক্ষমতা সাময়িকভাবে স্থগিত করা হয়েছে।${targetMember.canSubmitLinkRevokeReason ? ` (${targetMember.canSubmitLinkRevokeReason})` : ''}`
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

  // Admin & Role Management (Flat Admin System with Database Verified Developer/System Admin)
  const isDeveloper = (member?: Member | null): boolean => {
    if (!member) return false;
    return (
      member.isSystemAdmin === true || 
      member.role === 'developer' || 
      member.email?.toLowerCase() === 'muradshihab515@gmail.com' || 
      member.id === 'user_dev_shihab'
    );
  };

  const verifyDatabaseSystemAdmin = async (member?: Member | null): Promise<boolean> => {
    if (!member) return false;
    if (isSupabaseConfigured()) {
      const isDbAdmin = await supabaseDb.verifySystemAdminInDb(member.id || member.email);
      if (isDbAdmin) return true;
    }
    return isDeveloper(member);
  };

  const promoteToAdmin = (targetMemberId: string, note?: string): { success: boolean; message: string } => {
    const actor = currentUser;
    if (!actor) {
      return { success: false, message: 'অনুগ্রহ করে প্রথমে লগইন করুন।' };
    }
    const isActorAdminOrDev = isDeveloper(actor) || actor.role === 'admin' || actor.role === 'moderator';
    if (!isActorAdminOrDev) {
      return { success: false, message: 'এডমিন বানানোর অনুমতি কেবল বর্তমান এডমিন এবং ডেভেলপারদের রয়েছে।' };
    }

    const target = members.find(m => m.id === targetMemberId);
    if (!target) {
      return { success: false, message: 'সদস্য খুঁজে পাওয়া যায়নি।' };
    }

    if (target.role === 'admin' || isDeveloper(target)) {
      return { success: false, message: `${target.name} ইতোমধ্যে এডমিন পদে নিয়োজিত আছেন।` };
    }

    if (target.status === 'pending_approval') {
      return { success: false, message: 'আবেদনকারী এখনও অনুমোদিত নয়। প্রথমে রেজিস্ট্রেশন অনুমোদন করুন।' };
    }

    // Promote Member to Admin
    setMembers(prev => prev.map(m => {
      if (m.id === targetMemberId) {
        return {
          ...m,
          role: 'admin' as UserRole
        };
      }
      return m;
    }));

    // Sync with Supabase Database
    if (isSupabaseConfigured()) {
      supabaseDb.updateMemberRole(target.id, 'admin', false).catch(console.error);
    }

    addAuditLog(
      'PROMOTE_TO_ADMIN',
      'member',
      target.id,
      target.name,
      `${actor.name} (${actor.role}) promoted ${target.name} (#${target.memberNumber}) to Admin. Note: ${note || 'Direct Promotion'}`
    );

    // Push notification to target member & announcement
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}_promoted`,
        userId: target.id,
        type: 'announcement',
        title: '🛡️ অভিনন্দন! আপনি এখন এডমিন',
        message: `${actor.name} আপনাকে Support Link Box-এর এডমিন হিসেবে দায়িত্ব দিয়েছেন। আপনি এখন এডমিন প্যানেল পরিচালনা করতে পারবেন।`,
        timestamp: 'এইমাত্র',
        read: false
      },
      {
        id: `notif_${Date.now()}_all_promoted`,
        userId: 'all',
        type: 'announcement',
        title: '🛡️ নতুন এডমিন নিযুক্ত',
        message: `${target.name} (#${target.memberNumber})-কে এডমিন প্যানেলে স্বাগত জানানো হচ্ছে।`,
        timestamp: 'এইমাত্র',
        read: false
      },
      ...prev
    ]);

    return {
      success: true,
      message: `✓ ${target.name} (#${target.memberNumber})-কে সফলভাবে এডমিন (Admin) পদে উন্নীত করা হয়েছে!`
    };
  };

  const demoteAdminToMember = (targetMemberId: string, note?: string): { success: boolean; message: string } => {
    const actor = currentUser;
    if (!actor) {
      return { success: false, message: 'অনুগ্রহ করে প্রথমে লগইন করুন।' };
    }
    const isActorAdminOrDev = isDeveloper(actor) || actor.role === 'admin' || actor.role === 'moderator';
    if (!isActorAdminOrDev) {
      return { success: false, message: 'এডমিন ডিমোট করার অনুমতি কেবল বর্তমান এডমিন এবং ডেভেলপারদের রয়েছে।' };
    }

    const target = members.find(m => m.id === targetMemberId);
    if (!target) {
      return { success: false, message: 'সদস্য খুঁজে পাওয়া যায়নি।' };
    }

    // HARD SECURITY RULE: DEVELOPER / SYSTEM ADMIN CAN NEVER BE DEMOTED BY ANYONE
    if (isDeveloper(target) || target.isSystemAdmin) {
      return { 
        success: false, 
        message: `🛡️ এক্সেস অস্বীকৃত! Developer / System Admin (${target.name}) ডাটাবেস ও সিস্টেম সুরক্ষিত। তাকে কোনো এডমিন ডিমোট বা পরিবর্তন করতে পারবে না।` 
      };
    }

    if (target.role === 'member') {
      return { success: false, message: `${target.name} ইতোমধ্যে সাধারণ মেম্বার পদে আছেন।` };
    }

    // Demote Admin to Member
    setMembers(prev => prev.map(m => {
      if (m.id === targetMemberId) {
        return {
          ...m,
          role: 'member' as UserRole
        };
      }
      return m;
    }));

    // Sync with Supabase Database
    if (isSupabaseConfigured()) {
      supabaseDb.updateMemberRole(target.id, 'member', false).catch(console.error);
    }

    addAuditLog(
      'DEMOTE_TO_MEMBER',
      'member',
      target.id,
      target.name,
      `${actor.name} (${actor.role}) demoted ${target.name} (#${target.memberNumber}) from Admin to Member. Reason: ${note || 'Demoted by admin'}`
    );

    // Push notification to target member
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}_demoted`,
        userId: target.id,
        type: 'warning',
        title: '⚠️ এডমিন পদ প্রত্যাহার করা হয়েছে',
        message: `${actor.name} কর্তৃক আপনার এডমিন রোল পরিবর্তন করে সাধারণ মেম্বার করা হয়েছে।`,
        timestamp: 'এইমাত্র',
        read: false
      },
      ...prev
    ]);

    return {
      success: true,
      message: `✓ ${target.name} (#${target.memberNumber})-কে এডমিন থেকে সাধারণ মেম্বার (Member) হিসেবে নির্ধারণ করা হয়েছে।`
    };
  };

  // Admin Member Actions
  const updateMemberStatus = (memberId: string, status: MemberStatus, reason?: string) => {
    const target = members.find(m => m.id === memberId);
    if (!target) return;

    // Developer protection from freeze, suspend, or remove
    if (isDeveloper(target) && (status === 'frozen' || status === 'suspended' || status === 'removed' || status === 'temp_removed')) {
      console.warn("Developer / System Admin cannot be frozen, suspended, or removed.");
      return;
    }

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
    const target = members.find(m => m.id === memberId);
    if (target && isDeveloper(target)) {
      alert("🛡️ Developer / System Admin (Murad Shihab) সংরক্ষিত। তাকে রিমুভ করা সম্ভব নয়।");
      return;
    }
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

  // ==========================================
  // AUTO-ADMIN & PUNISHMENT SYSTEM
  // ==========================================

  // Toggle Member's Link Submission Permission (Manual Admin Control)
  const toggleMemberLinkSubmitPermission = (memberId: string, allowed?: boolean, reason?: string) => {
    const target = members.find(m => m.id === memberId);
    if (!target) return { success: false, message: 'সদস্য খুঁজে পাওয়া যায়নি।' };

    const newAllowed = allowed !== undefined ? allowed : (target.canSubmitLink === false);

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          canSubmitLink: newAllowed,
          canSubmitLinkRevokeReason: newAllowed ? undefined : (reason || 'প্রশাসনিক নির্দেশনা ও প্ল্যাটফর্ম রুলস ভঙ্গের কারণে'),
          canSubmitLinkRevokedAt: newAllowed ? undefined : getBangladeshCurrentTime12h(),
          canSubmitLinkRevokedBy: newAllowed ? undefined : (currentUser?.name || 'Admin')
        };
      }
      return m;
    }));

    addAuditLog(
      newAllowed ? 'RESTORE_LINK_SUBMIT_PERMISSION' : 'REVOKE_LINK_SUBMIT_PERMISSION',
      'member',
      target.id,
      target.name,
      newAllowed 
        ? `${currentUser?.name || 'Admin'} restored link submission permission.`
        : `${currentUser?.name || 'Admin'} revoked link submission permission. Reason: ${reason || 'Admin instruction'}`
    );

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: target.id,
      type: 'warning',
      title: newAllowed ? '🔓 লিংক সাবমিশন অনুমতি পুনঃবহাল' : '🔒 লিংক সাবমিশন সাময়িক স্থগিত',
      message: newAllowed
        ? 'আপনার লিংক সাবমিট করার ক্ষমতা পুনরায় চালু করা হয়েছে। আপনি এখন নিয়মিত লিংক সাবমিট করতে পারেন।'
        : `অ্যাডমিন আপনার লিংক সাবমিট করার ক্ষমতা সাময়িকভাবে স্থগিত করেছেন। ${reason ? `(কারণ: ${reason})` : ''}`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [notif, ...prev]);

    return {
      success: true,
      message: newAllowed
        ? `✓ ${target.name} এর লিংক সাবমিট করার অনুমতি সফলভাবে ফিরিয়ে দেওয়া হয়েছে!`
        : `✓ ${target.name} এর লিংক সাবমিট করার ক্ষমতা সফলভাবে স্থগিত করা হয়েছে।`
    };
  };

  const adminRevokeLinkSubmit = (memberId: string, reason?: string) => {
    return toggleMemberLinkSubmitPermission(memberId, false, reason);
  };

  const adminRestoreLinkSubmit = (memberId: string) => {
    return toggleMemberLinkSubmitPermission(memberId, true);
  };

  // Run Auto Admin Punishment Checks (12:00 AM Midnight & 10:00 AM Cutoff)
  const runAutoAdminPunishmentCheck = (options?: { forceMidnightCheck?: boolean; forceCutoffCheck?: boolean }) => {
    if (settings.punishmentEnabled === false && !options?.forceMidnightCheck && !options?.forceCutoffCheck) {
      return { checkedCount: 0, tempRemovedCount: 0, suspendedCount: 0, message: 'Auto-admin punishment is disabled in settings.' };
    }

    const bdTime = checkLateSupportPunishment();
    const isMidnightLate = Boolean(options?.forceMidnightCheck || (bdTime.lateMinutes >= 0 && !bdTime.isPastCutoff));
    const isCutoffExpired = Boolean(options?.forceCutoffCheck || bdTime.isPastCutoff);

    let tempRemovedCount = 0;
    let suspendedCount = 0;
    let checkedCount = 0;

    const newPenalties: LatePenaltyRecord[] = [...latePenalties];
    const newMembers = members.map(member => {
      // Exclude super admins / admins from punishment
      if (member.role === 'super_admin' || member.role === 'admin') {
        return member;
      }

      checkedCount++;
      const todayStats = getTodaySupportStats(member.id);
      const hasPendingSupport = todayStats.pendingCount > 0;

      // EXCEPTION LAYER: Check if member has an active Late Support Report
      const activeLateReport = lateSupportReports.find(r => 
        r.memberId === member.id && 
        (r.status === 'pending' || r.status === 'recovery_expired')
      );

      if (activeLateReport) {
        const is24hExpired = Date.now() > activeLateReport.recoveryDeadlineTimestamp;

        // If > 24 hours passed without All Done -> Status becomes Approval Pending & Suspended
        if (is24hExpired && hasPendingSupport) {
          suspendedCount++;
          return {
            ...member,
            status: 'suspended' as MemberStatus,
            penaltyStatus: 'suspended' as const,
            hasReportedLateSupport: true,
            lateReportRecoveryStatus: 'approval_pending' as const,
            activeLateReportId: activeLateReport.id,
            canSubmitLink: false,
            canSubmitLinkRevokeReason: 'Late Support ২৪ ঘণ্টার গ্রেস সময় অতিক্রম করায় অ্যাকাউন্ট Approval Pending অবস্থায় রয়েছে। এডমিন অ্যাপ্রুভাল প্রয়োজন।',
            suspendedAt: getBangladeshCurrentTime12h()
          };
        }

        // Within 24-hour grace window -> Protected from Ad punishment and Auto-Remove!
        return {
          ...member,
          status: 'active' as MemberStatus,
          hasReportedLateSupport: true,
          lateReportRecoveryStatus: 'in_recovery' as const,
          activeLateReportId: activeLateReport.id,
          requiredAdsCount: 0,
          watchedAdsCount: 0
        };
      }

      // Stage 2: Past 10:00 AM (Cutoff Expired) & member was temp_removed
      if (isCutoffExpired && member.status === 'temp_removed' && hasPendingSupport) {
        suspendedCount++;
        // Update penalty record
        const pIdx = newPenalties.findIndex(p => p.memberId === member.id && p.status === 'temp_removed');
        if (pIdx !== -1) {
          newPenalties[pIdx] = {
            ...newPenalties[pIdx],
            status: 'suspended',
            suspendedAt: getBangladeshCurrentTime12h(),
            adminNotes: '১০ ঘণ্টার রিকভারি উইন্ডো (সকাল ১০:০০ টা) অতিক্রম করায় স্বয়ংক্রিয়ভাবে সাসপেন্ড করা হয়েছে।'
          };
        } else {
          newPenalties.unshift({
            id: `pen_${Date.now()}_${member.id}`,
            memberId: member.id,
            memberName: member.name,
            memberUsername: member.username,
            memberAvatar: member.avatar,
            date: TODAY,
            deadlineTime: '12:00 AM',
            hoursLate: 10,
            lateDurationFormatted: '১০ ঘণ্টা (Cutoff Exceeded)',
            requiredAds: settings.maxPenaltyAdsCap || 5,
            adsWatched: 0,
            status: 'suspended',
            suspendedAt: getBangladeshCurrentTime12h(),
            adminNotes: '১০ ঘণ্টার রিকভারি উইন্ডো অতিক্রম করায় অটোমেটিক সাসপেন্ড হয়েছে।',
            createdAt: getBangladeshCurrentTime12h(),
            createdAtTimestamp: Date.now()
          });
        }

        return {
          ...member,
          status: 'suspended' as MemberStatus,
          penaltyStatus: 'suspended' as const,
          suspendedAt: getBangladeshCurrentTime12h()
        };
      }

      // Stage 1: Past 12:00 AM (Midnight Deadline) & member has pending support
      if (isMidnightLate && hasPendingSupport && member.status === 'active') {
        tempRemovedCount++;
        const requiredAds = Math.min(
          settings.maxPenaltyAdsCap || 5,
          Math.max(1, bdTime.lateHours * (settings.adsPerLateHour || 1))
        );

        // Add or update penalty record
        const existingPenalty = newPenalties.find(p => p.memberId === member.id && p.date === TODAY && (p.status === 'temp_removed' || p.status === 'suspended'));
        if (!existingPenalty) {
          newPenalties.unshift({
            id: `pen_${Date.now()}_${member.id}`,
            memberId: member.id,
            memberName: member.name,
            memberUsername: member.username,
            memberAvatar: member.avatar,
            date: TODAY,
            deadlineTime: '12:00 AM',
            hoursLate: bdTime.lateHours,
            lateDurationFormatted: bdTime.lateFormattedBangla,
            requiredAds,
            adsWatched: 0,
            status: 'temp_removed',
            adminNotes: 'রাত ১২:০০ টায় অল ডান না থাকায় অটো এডমিন সিস্টেম কর্তৃক সাময়িক রিমুভ করা হয়েছে।',
            createdAt: getBangladeshCurrentTime12h(),
            createdAtTimestamp: Date.now()
          });
        }

        return {
          ...member,
          status: 'temp_removed' as MemberStatus,
          penaltyStatus: 'temp_removed' as const,
          requiredAdsCount: requiredAds,
          watchedAdsCount: 0,
          penaltyHoursLate: bdTime.lateHours
        };
      }

      return member;
    });

    if (tempRemovedCount > 0 || suspendedCount > 0) {
      setMembers(newMembers);
      setLatePenalties(newPenalties);

      addAuditLog(
        'AUTO_ADMIN_PUNISHMENT_RUN',
        'system',
        'auto_admin',
        'Auto-Admin Engine',
        `Punishment scan executed: ${tempRemovedCount} members moved to TEMP_REMOVED, ${suspendedCount} members moved to SUSPENDED.`
      );
    }

    return {
      checkedCount,
      tempRemovedCount,
      suspendedCount,
      message: `অটো-এডমিন স্ক্যান সম্পন্ন: ${tempRemovedCount} জন সাময়িক রিমুভ, ${suspendedCount} জন সাসপেন্ড করা হয়েছে।`
    };
  };

  // Trigger when a member completes pending support after deadline and does late All Done
  const completeLateAllDone = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return { success: false };

    // EXCEPTION LAYER: Check if member has an active Late Support Report
    const activeLateReport = lateSupportReports.find(r => 
      r.memberId === memberId && 
      (r.status === 'pending' || r.status === 'recovery_expired')
    );

    if (activeLateReport) {
      const isWithinGrace = Date.now() <= activeLateReport.recoveryDeadlineTimestamp;

      if (isWithinGrace) {
        // SUCCESS: Finished All Done within 24h grace window!
        // NO ADS BARRIER! Restores full active status and link submission permission.
        setLateSupportReports(prev => prev.map(r => {
          if (r.id === activeLateReport.id) {
            return {
              ...r,
              status: 'completed_in_grace',
              allDoneCompletedAt: getBangladeshCurrentTime12h(),
              allDoneCompletedTimestamp: Date.now(),
              updatedAt: getBangladeshCurrentTime12h()
            };
          }
          return r;
        }));

        setMembers(prev => prev.map(m => {
          if (m.id === memberId) {
            return {
              ...m,
              status: 'active' as MemberStatus,
              penaltyStatus: 'none' as const,
              hasReportedLateSupport: false,
              lateReportRecoveryStatus: 'completed' as const,
              requiredAdsCount: 0,
              watchedAdsCount: 0,
              canSubmitLink: true,
              canSubmitLinkRevokeReason: undefined
            };
          }
          return m;
        }));

        const successNotif: AppNotification = {
          id: `notif_${Date.now()}_grace_success`,
          userId: memberId,
          type: 'announcement',
          title: '🎉 Late Support রিকভারি সফল!',
          message: 'আপনি ২৪ ঘণ্টার গ্রেস সময়ের মধ্যে All Done সম্পন্ন করেছেন! কোনো বিজ্ঞাপন ছাড়াই আপনার অ্যাকাউন্ট সম্পূর্ণ সচল রয়েছে এবং লিংক সাবমিশন সক্রিয় রয়েছে।',
          timestamp: 'Just now',
          read: false
        };
        setNotifications(prev => [successNotif, ...prev]);

        addAuditLog(
          'LATE_SUPPORT_RECOVERY_COMPLETED',
          'member',
          member.id,
          member.name,
          'Member completed All Done within 24-hour grace window. Ads bypassed, link submission restored.'
        );

        return {
          success: true,
          bypassedAds: true,
          message: 'অভিনন্দন! আপনি গ্রেস সময়ের মধ্যে All Done সম্পন্ন করায় কোনো বিজ্ঞাপন ছাড়াই অ্যাকাউন্ট সম্পূর্ণ সক্রিয় রয়েছে।'
        };
      } else {
        // Over 24 hours! Status becomes Approval Pending
        setLateSupportReports(prev => prev.map(r => {
          if (r.id === activeLateReport.id) {
            return {
              ...r,
              status: 'recovery_expired',
              allDoneCompletedAt: getBangladeshCurrentTime12h(),
              allDoneCompletedTimestamp: Date.now(),
              updatedAt: getBangladeshCurrentTime12h()
            };
          }
          return r;
        }));

        setMembers(prev => prev.map(m => {
          if (m.id === memberId) {
            return {
              ...m,
              status: 'suspended' as MemberStatus,
              penaltyStatus: 'suspended' as const,
              lateReportRecoveryStatus: 'approval_pending' as const,
              canSubmitLink: false,
              canSubmitLinkRevokeReason: '২৪ ঘণ্টার মধ্যে All Done না করায় অ্যাকাউন্ট Approval Pending অবস্থায় রয়েছে। এডমিন রিভিউ প্রয়োজন।',
              suspendedAt: getBangladeshCurrentTime12h()
            };
          }
          return m;
        }));

        return {
          success: false,
          requiresAdminApproval: true,
          message: '২৪ ঘণ্টার গ্রেস সময় পার হয়ে গেছে। আপনার অ্যাকাউন্ট বর্তমানে Approval Pending অবস্থায় রয়েছে। এডমিন রিভিউ করে অ্যাপ্রুভ করলে লিংক সাবমিট করতে পারবেন।'
        };
      }
    }

    const lateStatus = checkLateSupportPunishment(undefined, {
      adsPerHour: settings.adsPerLateHour || 1,
      maxAds: settings.maxPenaltyAdsCap || 5
    });

    // Check existing or create new penalty record
    let targetPenalty = latePenalties.find(p => p.memberId === memberId && (p.status === 'temp_removed' || p.status === 'suspended'));
    
    if (targetPenalty) {
      targetPenalty = {
        ...targetPenalty,
        completedAt: getBangladeshCurrentTime12h(),
        hoursLate: lateStatus.lateHours,
        lateDurationFormatted: lateStatus.lateFormattedBangla,
        requiredAds: lateStatus.requiredAds
      };
      setLatePenalties(prev => prev.map(p => p.id === targetPenalty!.id ? targetPenalty! : p));
    } else {
      targetPenalty = {
        id: `pen_${Date.now()}_${member.id}`,
        memberId: member.id,
        memberName: member.name,
        memberUsername: member.username,
        memberAvatar: member.avatar,
        date: TODAY,
        deadlineTime: '12:00 AM',
        completedAt: getBangladeshCurrentTime12h(),
        hoursLate: lateStatus.lateHours,
        lateDurationFormatted: lateStatus.lateFormattedBangla,
        requiredAds: lateStatus.requiredAds,
        adsWatched: 0,
        status: 'temp_removed',
        adminNotes: 'দেরিতে অল ডান সম্পন্ন করেছে। রি-অ্যাক্টিভেশনের জন্য ভিডিও অ্যাডস অপেক্ষমান।',
        createdAt: getBangladeshCurrentTime12h(),
        createdAtTimestamp: Date.now()
      };
      setLatePenalties(prev => [targetPenalty!, ...prev]);
    }

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          status: 'temp_removed' as MemberStatus,
          penaltyStatus: 'temp_removed' as const,
          requiredAdsCount: lateStatus.requiredAds,
          watchedAdsCount: targetPenalty?.adsWatched || 0,
          penaltyHoursLate: lateStatus.lateHours
        };
      }
      return m;
    }));

    return {
      success: true,
      lateStatus,
      penaltyRecord: targetPenalty
    };
  };

  // Watch a penalty ad to progress towards re-activation
  const watchPenaltyAd = (penaltyId: string) => {
    const penalty = latePenalties.find(p => p.id === penaltyId);
    if (!penalty) return { success: false, adsWatched: 0, requiredAds: 0, isCompleted: false };

    const newWatched = (penalty.adsWatched || 0) + 1;
    const isCompleted = newWatched >= penalty.requiredAds;

    setLatePenalties(prev => prev.map(p => {
      if (p.id === penaltyId) {
        return {
          ...p,
          adsWatched: newWatched,
          status: isCompleted ? 'reactivated' : p.status,
          reactivatedAt: isCompleted ? getBangladeshCurrentTime12h() : undefined
        };
      }
      return p;
    }));

    if (isCompleted) {
      setMembers(prev => prev.map(m => {
        if (m.id === penalty.memberId) {
          return {
            ...m,
            status: 'active' as MemberStatus,
            penaltyStatus: 'none' as const,
            requiredAdsCount: 0,
            watchedAdsCount: 0
          };
        }
        return m;
      }));

      addAuditLog(
        'MEMBER_PENALTY_REACTIVATED',
        'member',
        penalty.memberId,
        penalty.memberName,
        `Member completed all ${penalty.requiredAds} required penalty ads and self-reactivated account.`
      );

      const notif: AppNotification = {
        id: `notif_${Date.now()}`,
        userId: penalty.memberId,
        type: 'support_reminder',
        title: '🎉 অ্যাকাউন্ট সফলভাবে Re-Activated হয়েছে!',
        message: 'দেরিতে অল ডান করায় নির্ধারিত ভিডিও অ্যাডগুলো সম্পন্ন করায় আপনার অ্যাকাউন্ট সক্রিয় করা হয়েছে। ধন্যবাদ!',
        timestamp: 'Just now',
        read: false
      };
      setNotifications(prev => [notif, ...prev]);
    }

    return {
      success: true,
      adsWatched: newWatched,
      requiredAds: penalty.requiredAds,
      isCompleted
    };
  };

  // Admin manually reactivates/unsuspends a member
  const adminReactivateMember = (memberId: string, notes?: string) => {
    const target = members.find(m => m.id === memberId);
    if (!target) return { success: false, message: 'সদস্য খুঁজে পাওয়া যায়নি।' };

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          status: 'active' as MemberStatus,
          penaltyStatus: 'none' as const,
          requiredAdsCount: 0,
          watchedAdsCount: 0
        };
      }
      return m;
    }));

    setLatePenalties(prev => prev.map(p => {
      if (p.memberId === memberId && (p.status === 'temp_removed' || p.status === 'suspended')) {
        return {
          ...p,
          status: 'admin_waived',
          reactivatedAt: getBangladeshCurrentTime12h(),
          adminNotes: notes || `${currentUser?.name || 'Admin'} কর্তৃক ম্যানুয়ালি রি-অ্যাক্টিভ ও পেনাল্টি মওকুফ করা হয়েছে।`,
          resolvedByAdminId: currentUser?.id,
          resolvedByAdminName: currentUser?.name
        };
      }
      return p;
    }));

    addAuditLog(
      'ADMIN_REACTIVATE_MEMBER',
      'member',
      target.id,
      target.name,
      `${currentUser?.name || 'Admin'} manually reactivated member. Notes: ${notes || 'Admin Approval'}`
    );

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: target.id,
      type: 'announcement',
      title: '✅ অ্যাডমিন কর্তৃক অ্যাকাউন্ট Re-Activated',
      message: `অ্যাডমিন ${currentUser?.name || ''} আপনার অ্যাকাউন্ট সক্রিয় করেছেন। আপনি এখন যথারীতি লিংক বক্স ব্যবহার করতে পারবেন।`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, message: `✓ ${target.name} এর অ্যাকাউন্ট সফলভাবে সক্রিয় ও পেনাল্টি মওকুফ করা হয়েছে!` };
  };

  // Admin waives specific penalty record
  const adminWaivePenalty = (penaltyId: string, notes?: string) => {
    const penalty = latePenalties.find(p => p.id === penaltyId);
    if (!penalty) return { success: false, message: 'পেনাল্টি রেকর্ড পাওয়া যায়নি।' };

    return adminReactivateMember(penalty.memberId, notes);
  };

  // Add or update admin support link
  const addOrUpdateAdminSupportLink = (data: Partial<AdminSupportLink>) => {
    if (!currentUser) return { success: false, message: 'লগইন প্রয়োজন।' };

    if (data.id && adminSupportLinks.some(l => l.id === data.id)) {
      setAdminSupportLinks(prev => prev.map(l => l.id === data.id ? { ...l, ...data, updatedAt: getBangladeshCurrentTime12h() } : l));
      return { success: true, message: '✓ অ্যাডমিন সাপোর্ট আইডি আপডেট করা হয়েছে!' };
    }

    const newLink: AdminSupportLink = {
      id: `supp_admin_${Date.now()}`,
      adminId: data.adminId || currentUser.id,
      adminName: data.adminName || currentUser.name,
      adminUsername: data.adminUsername || currentUser.username,
      adminAvatar: data.adminAvatar || currentUser.avatar,
      adminRole: data.adminRole || currentUser.role,
      platformName: data.platformName || 'Facebook Messenger',
      supportUrl: data.supportUrl || '',
      displayLabel: data.displayLabel || `${currentUser.name} (Support)`,
      notes: data.notes || '',
      isActive: data.isActive !== false,
      updatedAt: getBangladeshCurrentTime12h()
    };

    setAdminSupportLinks(prev => [...prev, newLink]);
    return { success: true, message: '✓ নতুন অ্যাডমিন সাপোর্ট আইডি যুক্ত হয়েছে!' };
  };

  // Delete admin support link
  const deleteAdminSupportLink = (id: string) => {
    setAdminSupportLinks(prev => prev.filter(l => l.id !== id));
    return { success: true, message: '✓ সাপোর্ট আইডি মুছে ফেলা হয়েছে।' };
  };

  // Delete penalty record
  const deletePenaltyRecord = (id: string) => {
    setLatePenalties(prev => prev.filter(p => p.id !== id));
    return { success: true, message: '✓ পেনাল্টি রেকর্ড মুছে ফেলা হয়েছে।' };
  };

  // -------------------------------------------------------------
  // LATE SUPPORT REPORT SYSTEM (EXCEPTION & GRACE LAYER)
  // -------------------------------------------------------------

  // Get count of late support reports used by a member this week
  const getMemberWeeklyLateReportsCount = (memberId: string): number => {
    return lateSupportReports.filter(r => 
      r.memberId === memberId && 
      isSameBangladeshWeek(r.reportDate, TODAY)
    ).length;
  };

  // Check if a member is currently eligible to submit a Late Support Report
  const canMemberSubmitLateReportToday = (memberId: string) => {
    if (settings.lateSupportReportEnabled === false) {
      return { 
        canSubmit: false, 
        reason: 'Late Support Report সিস্টেম সাময়িকভাবে বন্ধ রয়েছে।',
        remainingInWeek: 0,
        eligibility: null
      };
    }

    const member = members.find(m => m.id === memberId);
    if (!member) {
      return { canSubmit: false, reason: 'সদস্য খুঁজে পাওয়া যায়নি।', remainingInWeek: 0, eligibility: null };
    }

    // 1. Bangladesh Timezone Validation (Asia/Dhaka) - Must be before 12:00 AM Midnight
    const eligibility = checkBangladeshLateReportEligibility();
    if (!eligibility.isSubmissionAllowed) {
      return {
        canSubmit: false,
        reason: 'Late Support Report করার সময়সীমা (রাত ১২:০০ AM) শেষ হয়ে গেছে। ডেডলাইনের পূর্বেই রিপোর্ট করতে হবে।',
        remainingInWeek: 0,
        eligibility
      };
    }

    // 2. Weekly Limit Enforcement
    const maxWeekly = settings.maxLateReportsPerWeek || 2;
    const weeklyUsed = getMemberWeeklyLateReportsCount(memberId);
    const remainingInWeek = Math.max(0, maxWeekly - weeklyUsed);

    if (weeklyUsed >= maxWeekly) {
      return {
        canSubmit: false,
        reason: `সাপ্তাহিক সর্বোচ্চ সীমা (${maxWeekly} বার) পূর্ণ হয়ে গেছে। এই সপ্তাহে আপনি আর Late Support Report করতে পারবেন না।`,
        remainingInWeek: 0,
        eligibility
      };
    }

    // 3. Duplicate check for today
    const existingToday = lateSupportReports.find(r => 
      r.memberId === memberId && 
      r.reportDate === TODAY && 
      (r.status === 'pending' || r.status === 'completed_in_grace')
    );

    if (existingToday) {
      return {
        canSubmit: false,
        reason: 'আজকের দিনের জন্য আপনার একটি Late Support Report ইতিমধ্যেই সক্রিয় রয়েছে।',
        remainingInWeek,
        eligibility
      };
    }

    return {
      canSubmit: true,
      remainingInWeek,
      eligibility
    };
  };

  // Submit a Late Support Report (by member before 12:00 AM)
  const submitLateSupportReport = (
    reason: string,
    details: string,
    screenshotUrl?: string,
    memberIdOverride?: string,
    bypassTimeCheckForTest: boolean = false
  ) => {
    const targetMember = memberIdOverride
      ? members.find(m => m.id === memberIdOverride)
      : (currentUser || members[0]);

    if (!targetMember) {
      return { success: false, message: 'রিপোর্ট সাবমিট করতে লগইন করুন।' };
    }

    if (settings.lateSupportReportEnabled === false) {
      return { success: false, message: 'Late Support Report সিস্টেম সাময়িকভাবে বন্ধ রয়েছে।' };
    }

    // 1. Bangladesh Time (Asia/Dhaka) Validation
    const eligibility = checkBangladeshLateReportEligibility(undefined, bypassTimeCheckForTest);
    if (!eligibility.isSubmissionAllowed) {
      return {
        success: false,
        message: 'Late Support Report করার সময় (রাত ১২:০০ AM) শেষ হয়ে গেছে। ডেডলাইনের পূর্বেই রিপোর্ট সাবমিট করতে হবে।'
      };
    }

    // 2. Weekly limit check
    const maxAllowed = settings.maxLateReportsPerWeek || 2;
    const weeklyCount = getMemberWeeklyLateReportsCount(targetMember.id);
    if (weeklyCount >= maxAllowed) {
      return {
        success: false,
        message: `সাপ্তাহিক সর্বোচ্চ সীমা (${maxAllowed} বার) পূর্ণ হয়ে গেছে। এই সপ্তাহে আপনি আর Late Support Report করতে পারবেন না।`
      };
    }

    // 3. Duplicate today check
    const existingToday = lateSupportReports.find(r => 
      r.memberId === targetMember.id && 
      r.reportDate === TODAY && 
      (r.status === 'pending' || r.status === 'completed_in_grace')
    );
    if (existingToday) {
      return {
        success: false,
        message: 'আজকের দিনের জন্য আপনার একটি Late Support Report ইতিমধ্যেই নথিবদ্ধ রয়েছে।'
      };
    }

    if (!reason.trim()) {
      return { success: false, message: 'সমস্যার ধরন বা বিষয় নির্বাচন করুন।' };
    }
    if (!details.trim() || details.trim().length < 5) {
      return { success: false, message: 'সমস্যার বিস্তারিত বিবরণ সুস্পষ্টভাবে লিখুন (কমপক্ষে ৫ অক্ষর)।' };
    }

    const submittedAtTimestamp = Date.now();
    const graceHours = settings.lateReportGracePeriodHours || 24;
    const deadlineTimestamp = submittedAtTimestamp + (graceHours * 60 * 60 * 1000);

    const newReport: LateSupportReport = {
      id: `lsr_${Date.now()}_${targetMember.id}`,
      memberId: targetMember.id,
      memberName: targetMember.name,
      memberUsername: targetMember.username,
      memberAvatar: targetMember.avatar,
      reportDate: TODAY,
      submittedAt: getBangladeshCurrentTime12h(),
      submittedAtTimestamp,
      reason: reason.trim(),
      details: details.trim(),
      screenshotUrl: screenshotUrl || undefined,
      status: 'pending',
      recoveryDeadline: `২৪ ঘণ্টার মধ্যে (${getBangladeshCurrentTime12h()})`,
      recoveryDeadlineTimestamp: deadlineTimestamp,
      createdAt: getBangladeshCurrentTime12h(),
      updatedAt: getBangladeshCurrentTime12h()
    };

    setLateSupportReports(prev => [newReport, ...prev]);

    // Protect member state: in recovery grace, zero ads required!
    setMembers(prev => prev.map(m => {
      if (m.id === targetMember.id) {
        return {
          ...m,
          hasReportedLateSupport: true,
          lateReportRecoveryStatus: 'in_recovery' as const,
          activeLateReportId: newReport.id,
          requiredAdsCount: 0,
          watchedAdsCount: 0
        };
      }
      return m;
    }));

    addAuditLog(
      'MEMBER_LATE_SUPPORT_REPORTED',
      'member',
      targetMember.id,
      targetMember.name,
      `Late Support Report submitted: "${reason}". 24h grace window granted without ads barrier.`
    );

    const memberNotif: AppNotification = {
      id: `notif_${Date.now()}_member`,
      userId: targetMember.id,
      type: 'announcement',
      title: '🛡️ Late Support Report গৃহীত হয়েছে',
      message: 'আপনার Late Support রিপোর্ট নথিভুক্ত হয়েছে। রাত ১২:০০ টায় কোনো Ad punishment হবে না। ২৪ ঘণ্টার মধ্যে All Done সম্পূর্ণ করুন।',
      timestamp: 'Just now',
      read: false
    };

    const adminNotif: AppNotification = {
      id: `notif_${Date.now()}_admin`,
      userId: 'user_emon',
      type: 'deadline',
      title: `🚨 নতুন Late Support Report: ${targetMember.name}`,
      message: `${targetMember.name} (@${targetMember.username}) রাত ১২:০০ টার পূর্বে রিপোর্ট করেছেন। কারণ: ${reason}`,
      timestamp: 'Just now',
      read: false
    };

    setNotifications(prev => [memberNotif, adminNotif, ...prev]);

    return {
      success: true,
      message: '✓ আপনার Late Support Report সফলভাবে জমা হয়েছে! কোনো বিজ্ঞাপন ছাড়াই ২৪ ঘণ্টার গ্রেস উইন্ডো চালু করা হয়েছে।',
      report: newReport
    };
  };

  // Admin approves Late Support Report (e.g. after 24h expired or special request)
  const adminApproveLateReport = (reportId: string, notes?: string) => {
    const report = lateSupportReports.find(r => r.id === reportId);
    if (!report) return { success: false, message: 'রিপোর্ট খুঁজে পাওয়া যায়নি।' };

    const targetMember = members.find(m => m.id === report.memberId);

    setLateSupportReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: 'admin_approved',
          adminActionBy: currentUser?.name || 'Super Admin',
          adminActionById: currentUser?.id,
          adminActionAt: getBangladeshCurrentTime12h(),
          adminNotes: notes || 'অ্যাডমিন কর্তৃক রিপোর্ট অনুমোদিত এবং অ্যাকাউন্ট সক্রিয় করা হয়েছে।',
          updatedAt: getBangladeshCurrentTime12h()
        };
      }
      return r;
    }));

    setMembers(prev => prev.map(m => {
      if (m.id === report.memberId) {
        return {
          ...m,
          status: 'active' as MemberStatus,
          penaltyStatus: 'none' as const,
          hasReportedLateSupport: false,
          lateReportRecoveryStatus: 'none' as const,
          activeLateReportId: undefined,
          requiredAdsCount: 0,
          watchedAdsCount: 0,
          canSubmitLink: true,
          canSubmitLinkRevokeReason: undefined
        };
      }
      return m;
    }));

    addAuditLog(
      'ADMIN_APPROVE_LATE_REPORT',
      'member',
      report.memberId,
      report.memberName,
      `Admin ${currentUser?.name || 'Admin'} approved Late Support Report #${reportId}. Reason: ${notes || 'Manual approval'}. Member restored to active.`
    );

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: report.memberId,
      type: 'announcement',
      title: '✅ আপনার Late Support রিপোর্ট অনুমোদিত হয়েছে!',
      message: `অ্যাডমিন ${currentUser?.name || ''} আপনার Late Support রিপোর্ট অনুমোদন করেছেন। আপনার অ্যাকাউন্ট ও লিংক সাবমিশন সচল করা হয়েছে।`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [notif, ...prev]);

    return { 
      success: true, 
      message: `✓ ${report.memberName} এর Late Support রিপোর্ট সফলভাবে অনুমোদিত এবং অ্যাকাউন্ট সক্রিয় করা হয়েছে!` 
    };
  };

  // Admin rejects Late Support Report
  const adminRejectLateReport = (reportId: string, rejectionReason: string) => {
    const report = lateSupportReports.find(r => r.id === reportId);
    if (!report) return { success: false, message: 'রিপোর্ট খুঁজে পাওয়া যায়নি।' };

    setLateSupportReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return {
          ...r,
          status: 'admin_rejected',
          adminActionBy: currentUser?.name || 'Super Admin',
          adminActionById: currentUser?.id,
          adminActionAt: getBangladeshCurrentTime12h(),
          rejectionReason: rejectionReason || 'অপ্রাসঙ্গিক বা অযৌক্তিক কারণ',
          updatedAt: getBangladeshCurrentTime12h()
        };
      }
      return r;
    }));

    setMembers(prev => prev.map(m => {
      if (m.id === report.memberId) {
        return {
          ...m,
          status: 'suspended' as MemberStatus,
          penaltyStatus: 'suspended' as const,
          lateReportRecoveryStatus: 'approval_pending' as const,
          canSubmitLink: false,
          canSubmitLinkRevokeReason: `Late Support রিপোর্ট বাতিল করা হয়েছে: ${rejectionReason}`,
          suspendedAt: getBangladeshCurrentTime12h()
        };
      }
      return m;
    }));

    addAuditLog(
      'ADMIN_REJECT_LATE_REPORT',
      'member',
      report.memberId,
      report.memberName,
      `Admin rejected Late Support Report #${reportId}. Reason: ${rejectionReason}. Member suspended.`
    );

    const notif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: report.memberId,
      type: 'warning',
      title: '❌ Late Support রিপোর্ট বাতিল করা হয়েছে',
      message: `আপনার Late Support রিপোর্টটি অ্যাডমিন কর্তৃক বাতিল করা হয়েছে। কারণ: ${rejectionReason}`,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [notif, ...prev]);

    return { success: true, message: `✓ ${report.memberName} এর রিপোর্ট বাতিল করা হয়েছে।` };
  };

  // Periodic evaluator to transition expired pending reports (> 24h) to 'recovery_expired'
  const evaluateLateSupportReports = () => {
    let expiredCount = 0;
    let activeCount = 0;
    const now = Date.now();

    setLateSupportReports(prev => prev.map(r => {
      if (r.status === 'pending') {
        if (now > r.recoveryDeadlineTimestamp) {
          expiredCount++;
          return {
            ...r,
            status: 'recovery_expired',
            updatedAt: getBangladeshCurrentTime12h()
          };
        }
        activeCount++;
      }
      return r;
    }));

    // Update members whose reports expired
    if (expiredCount > 0) {
      setMembers(prev => prev.map(m => {
        if (m.lateReportRecoveryStatus === 'in_recovery' && m.activeLateReportId) {
          const rep = lateSupportReports.find(r => r.id === m.activeLateReportId);
          if (rep && now > rep.recoveryDeadlineTimestamp) {
            return {
              ...m,
              status: 'suspended' as MemberStatus,
              penaltyStatus: 'suspended' as const,
              lateReportRecoveryStatus: 'approval_pending' as const,
              canSubmitLink: false,
              canSubmitLinkRevokeReason: '২৪ ঘণ্টার মধ্যে All Done সম্পন্ন না করায় অ্যাকাউন্ট Approval Pending অবস্থায় রয়েছে।',
              suspendedAt: getBangladeshCurrentTime12h()
            };
          }
        }
        return m;
      }));
    }

    return { expiredCount, activeCount };
  };

  // Delete Late Support Report record
  const deleteLateSupportReport = (reportId: string) => {
    setLateSupportReports(prev => prev.filter(r => r.id !== reportId));
    return { success: true, message: '✓ রিপোর্ট রেকর্ড মুছে ফেলা হয়েছে।' };
  };

  // Get current active late report for a member (pending or within recovery)
  const getMemberActiveLateReport = (memberId: string): LateSupportReport | null => {
    return lateSupportReports.find(r => 
      r.memberId === memberId && 
      (r.status === 'pending' || r.status === 'completed_in_grace' || r.status === 'recovery_expired')
    ) || null;
  };

  // Periodic ticker to automatically evaluate late support report 24h expiration
  useEffect(() => {
    const timer = setInterval(() => {
      evaluateLateSupportReports();
    }, 30000);
    return () => clearInterval(timer);
  }, [lateSupportReports]);

  // -------------------------------------------------------------
  // ENTERTAINMENT & MOVIE LOVER MODULE (SECURE TOKEN REDIRECT)
  // -------------------------------------------------------------
  const addMovie = (movieData: Omit<MovieItem, 'id' | 'createdAt' | 'updatedAt' | 'totalViews' | 'totalDownloads'>) => {
    const newMovie: MovieItem = {
      ...movieData,
      id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      links: (movieData.links || []).map(l => ({
        ...l,
        id: l.id || `lnk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        downloadToken: l.downloadToken || generateRandomToken(8),
        clickCount: l.clickCount || 0,
        createdAt: l.createdAt || new Date().toISOString()
      })),
      totalViews: 0,
      totalDownloads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setMovies(prev => [newMovie, ...prev]);
    addAuditLog('CREATE_MOVIE', 'movie', newMovie.id, newMovie.title, `Admin uploaded new movie: "${newMovie.title}" (${newMovie.links.length} formats)`);
    return { success: true, movie: newMovie };
  };

  const updateMovie = (id: string, updates: Partial<MovieItem>) => {
    setMovies(prev => prev.map(m => {
      if (m.id === id) {
        const updatedLinks = updates.links ? updates.links.map(l => ({
          ...l,
          id: l.id || `lnk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          downloadToken: l.downloadToken || generateRandomToken(8),
          clickCount: l.clickCount || 0,
          createdAt: l.createdAt || new Date().toISOString()
        })) : m.links;
        return {
          ...m,
          ...updates,
          links: updatedLinks,
          updatedAt: new Date().toISOString()
        };
      }
      return m;
    }));
    addAuditLog('UPDATE_MOVIE', 'movie', id, updates.title || id, `Admin updated movie: ID ${id}`);
    return { success: true, message: '✓ মুভি সফলভাবে আপডেট হয়েছে।' };
  };

  const deleteMovie = (id: string) => {
    const target = movies.find(m => m.id === id);
    setMovies(prev => prev.filter(m => m.id !== id));
    addAuditLog('DELETE_MOVIE', 'movie', id, target?.title || id, `Admin deleted movie: "${target?.title || id}"`);
    return { success: true, message: '✓ মুভি ও এর সকল ফরম্যাট লিংক মুছে ফেলা হয়েছে।' };
  };

  const toggleMovieStatus = (id: string) => {
    let newStatus: 'active' | 'draft' | 'archived' = 'active';
    setMovies(prev => prev.map(m => {
      if (m.id === id) {
        newStatus = m.status === 'active' ? 'draft' : 'active';
        return { ...m, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return m;
    }));
    return { success: true, newStatus };
  };

  const incrementMovieViews = (id: string) => {
    setMovies(prev => prev.map(m => m.id === id ? { ...m, totalViews: (m.totalViews || 0) + 1 } : m));
  };

  // Secure token-based destination resolution (ChatGPT & Gemini Pro Architecture)
  const resolveDownloadToken = (token: string) => {
    if (!token) return { success: false, error: 'কোনো ডাউনলোড টোকেন পাওয়া যায়নি।' };
    for (const movie of movies) {
      const link = movie.links.find(l => l.downloadToken === token);
      if (link) {
        if (movie.status !== 'active') {
          return { success: false, error: 'এই মুভিটি বর্তমানে ড্রাফট বা অপ্রাপ্য রয়েছে।' };
        }
        if (link.status !== 'active') {
          return { success: false, error: 'এই ফরম্যাট লিংকটি এডমিন দ্বারা সাময়িকভাবে বন্ধ রাখা হয়েছে।' };
        }
        return {
          success: true,
          destinationUrl: link.destinationUrl,
          movie,
          link
        };
      }
    }
    return { success: false, error: 'ডাউনলোড টোকেনটি সঠিক নয় বা এর মেয়াদ শেষ হয়ে গেছে (404 Invalid Token)।' };
  };

  const recordDownloadClick = (token: string) => {
    setMovies(prev => prev.map(m => {
      let matched = false;
      const links = m.links.map(l => {
        if (l.downloadToken === token) {
          matched = true;
          return { ...l, clickCount: (l.clickCount || 0) + 1 };
        }
        return l;
      });
      if (matched) {
        return { ...m, links, totalDownloads: (m.totalDownloads || 0) + 1 };
      }
      return m;
    }));
  };

  // Movie Request System Handlers
  const submitMovieRequest = (data: {
    title: string;
    year?: number | string;
    language?: string;
    preferredQuality?: string;
    imdbOrRefUrl?: string;
    notes?: string;
  }) => {
    if (!data.title.trim()) {
      return { success: false, message: 'মুভির নাম অবশ্যই প্রদান করতে হবে।' };
    }

    const requester = currentUser || members.find(m => m.id === currentUserId) || members[0];
    const newReqId = `req_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newRequest: MovieRequestItem = {
      id: newReqId,
      title: data.title.trim(),
      year: data.year ? (typeof data.year === 'string' ? parseInt(data.year, 10) || data.year : data.year) : undefined,
      language: data.language?.trim() || 'English / Dual Audio',
      preferredQuality: data.preferredQuality || '1080p FHD',
      imdbOrRefUrl: data.imdbOrRefUrl?.trim(),
      notes: data.notes?.trim(),
      requestedByUserId: requester.id,
      requestedByName: requester.name,
      requestedByUsername: requester.username,
      requestedByAvatar: requester.avatar,
      status: 'pending',
      upvotes: [requester.id],
      createdAt: nowIso,
      createdAtTimestamp: Date.now()
    };

    setMovieRequests(prev => [newRequest, ...prev]);
    addAuditLog('SUBMIT_MOVIE_REQUEST', 'movie', newReqId, newRequest.title, `${requester.name} requested movie "${newRequest.title}"`);

    // Add in-app confirmation notification
    setNotifications(prev => [
      {
        id: `notif_mov_req_${Date.now()}`,
        userId: requester.id,
        type: 'announcement',
        title: '🎬 মুভি রিকোয়েস্ট গৃহীত হয়েছে!',
        message: `আপনার অনুরোধকৃত মুভি "${newRequest.title}" রিভিউ তালিকায় যোগ হয়েছে। অন্যান্য মেম্বাররা এতে ভোট দিতে পারবেন।`,
        timestamp: 'এখনই',
        read: false
      },
      ...prev
    ]);

    return {
      success: true,
      message: `✓ আপনার "${newRequest.title}" মুভি রিকোয়েস্ট সফলভাবে সাবমিট হয়েছে!`,
      request: newRequest
    };
  };

  const upvoteMovieRequest = (requestId: string) => {
    const userId = currentUser?.id || currentUserId || 'guest_user';
    let isUpvoted = false;
    let newCount = 0;

    setMovieRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const hasUpvoted = req.upvotes.includes(userId);
        let updatedUpvotes: string[];
        if (hasUpvoted) {
          updatedUpvotes = req.upvotes.filter(id => id !== userId);
          isUpvoted = false;
        } else {
          updatedUpvotes = [...req.upvotes, userId];
          isUpvoted = true;
        }
        newCount = updatedUpvotes.length;
        return {
          ...req,
          upvotes: updatedUpvotes,
          updatedAt: new Date().toISOString()
        };
      }
      return req;
    }));

    return {
      success: true,
      upvoted: isUpvoted,
      count: newCount,
      message: isUpvoted ? '✓ আপনি এই মুভিতে ভোট দিয়েছেন!' : 'ভোট প্রত্যাহার করা হয়েছে।'
    };
  };

  const updateMovieRequestStatus = (
    requestId: string,
    status: MovieRequestStatus,
    adminReply?: string,
    downloadLink?: string,
    fulfilledMovieId?: string
  ) => {
    let targetReq: MovieRequestItem | undefined;

    setMovieRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        targetReq = req;
        return {
          ...req,
          status,
          adminReply: adminReply !== undefined ? adminReply : req.adminReply,
          downloadLink: downloadLink !== undefined ? downloadLink : req.downloadLink,
          fulfilledMovieId: fulfilledMovieId !== undefined ? fulfilledMovieId : req.fulfilledMovieId,
          updatedAt: new Date().toISOString()
        };
      }
      return req;
    }));

    if (targetReq) {
      addAuditLog('UPDATE_MOVIE_REQUEST', 'movie', requestId, targetReq.title, `Admin updated status of movie request "${targetReq.title}" to ${status}`);

      // Notify the requester if status is available or processing
      if (status === 'available') {
        setNotifications(prev => [
          {
            id: `notif_req_done_${Date.now()}`,
            userId: targetReq!.requestedByUserId,
            type: 'announcement',
            title: '🎉 আপনার রিকোয়েস্টকৃত মুভি রেডি!',
            message: `আপনার রিকোয়েস্টকৃত মুভি "${targetReq!.title}" আপলোড করা হয়েছে। সরাসরি মুভি বক্স থেকে ডাউনলোড করতে পারবেন!`,
            timestamp: 'এখনই',
            read: false
          },
          ...prev
        ]);
      }
    }

    return { success: true, message: '✓ মুভি রিকোয়েস্টের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।' };
  };

  const deleteMovieRequest = (requestId: string) => {
    const target = movieRequests.find(r => r.id === requestId);
    setMovieRequests(prev => prev.filter(r => r.id !== requestId));
    if (target) {
      addAuditLog('DELETE_MOVIE_REQUEST', 'movie', requestId, target.title, `Deleted movie request "${target.title}"`);
    }
    return { success: true, message: '✓ মুভি রিকোয়েস্ট মুছে ফেলা হয়েছে।' };
  };

  // -------------------------------------------------------------
  // STORAGE-EFFICIENT POINT SYSTEM & DATA LIFECYCLE ENGINE
  // -------------------------------------------------------------

  // Real-time atomic point awarding with duplicate protection
  const awardActionPoints = (
    memberId: string,
    actionType: 'support' | 'submission' | 'all_done' | 'fastest_bonus' | 'streak_bonus',
    referenceId: string,
    customAmount?: number
  ) => {
    const actionKey = `pt_${memberId}_${actionType}_${referenceId}`;
    if (processedPointActions.includes(actionKey)) {
      const target = members.find(m => m.id === memberId);
      return { success: false, pointsAwarded: 0, newTotal: target?.totalPoints || 0 };
    }

    const rules = settings.pointRules || {
      supportPoints: 1,
      submissionPoints: 5,
      allDonePoints: 3,
      fastestSupporterTiers: [10, 8, 6, 4, 2],
      streakDailyBonus: 2
    };

    let pointsToAdd = 0;
    if (typeof customAmount === 'number') {
      pointsToAdd = customAmount;
    } else {
      switch (actionType) {
        case 'support':
          pointsToAdd = rules.supportPoints;
          break;
        case 'submission':
          pointsToAdd = rules.submissionPoints;
          break;
        case 'all_done':
          pointsToAdd = rules.allDonePoints;
          break;
        case 'fastest_bonus':
          pointsToAdd = rules.fastestSupporterTiers[0] || 10;
          break;
        case 'streak_bonus':
          pointsToAdd = rules.streakDailyBonus;
          break;
      }
    }

    let updatedTotal = 0;
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const newTotal = (m.totalPoints || 0) + pointsToAdd;
        const newWeekly = (m.weeklyPoints || 0) + pointsToAdd;
        updatedTotal = newTotal;
        return {
          ...m,
          totalPoints: newTotal,
          weeklyPoints: newWeekly,
          lastActiveDate: TODAY,
          inactiveDays: 0
        };
      }
      return m;
    }));

    setProcessedPointActions(prev => [...prev, actionKey]);

    return {
      success: true,
      pointsAwarded: pointsToAdd,
      newTotal: updatedTotal
    };
  };

  // Check and award all done & fastest supporter rank
  const checkMemberAllDoneStatus = (memberId: string) => {
    const todayLinks = dailyLinks.filter(l => l.date === TODAY && l.communityId === currentCommunityId);
    const peerLinks = todayLinks.filter(l => l.memberId !== memberId);
    if (peerLinks.length === 0) return;

    const memberSupportsToday = supportRecords.filter(r => r.supporterMemberId === memberId && r.date === TODAY);
    const supportedIds = new Set(memberSupportsToday.map(r => r.dailyLinkId));
    const allDone = peerLinks.every(l => supportedIds.has(l.id));

    if (allDone) {
      const allDoneKey = `all_done_${memberId}_${TODAY}`;
      if (!processedPointActions.includes(allDoneKey)) {
        // Award All Done Points
        const allDonePts = settings.pointRules?.allDonePoints ?? 3;
        awardActionPoints(memberId, 'all_done', TODAY, allDonePts);

        // Check Fastest Supporter ranking
        const currentList = fastestSupportersMap[TODAY] || [];
        const alreadyRanked = currentList.some(item => item.memberId === memberId);
        if (!alreadyRanked) {
          const rank = currentList.length + 1;
          const tierBonuses = settings.pointRules?.fastestSupporterTiers || [10, 8, 6, 4, 2];
          const bonus = rank <= tierBonuses.length ? tierBonuses[rank - 1] : 0;

          const memberObj = members.find(m => m.id === memberId);
          const completionTime = getBangladeshCurrentTime12h();

          const entry = {
            memberId,
            memberName: memberObj?.name || 'Member',
            time: completionTime,
            rank,
            bonusPoints: bonus
          };

          const updatedMap = {
            ...fastestSupportersMap,
            [TODAY]: [...currentList, entry]
          };
          setFastestSupportersMap(updatedMap);

          if (bonus > 0) {
            awardActionPoints(memberId, 'fastest_bonus', `${TODAY}_rank${rank}`, bonus);
          }

          const notif: AppNotification = {
            id: `notif_${Date.now()}`,
            userId: memberId,
            type: 'announcement',
            title: `🏆 আজকের All Done সম্পন্ন! (${rank <= 5 ? `Rank #${rank}` : 'সম্পন্ন'})`,
            message: `আপনি আজকের সব কাজ সম্পন্ন করায় +${allDonePts} অল-ডান পয়েন্ট পেয়েছেন। ${bonus > 0 ? `এবং দ্রুত সম্পন্নকারীদের একজন হওয়ায় আরও +${bonus} ফাস্টেস্ট বোনাস পয়েন্ট অর্জন করেছেন!` : ''}`,
            timestamp: 'Just now',
            read: false
          };
          setNotifications(prev => [notif, ...prev]);
        }
      }

      // Late Support Report Recovery: Check if member had submitted a report
      const activeReport = lateSupportReports.find(r => 
        r.memberId === memberId && 
        (r.status === 'pending' || r.status === 'recovery_expired')
      );

      if (activeReport) {
        const isWithinGrace = Date.now() <= activeReport.recoveryDeadlineTimestamp;
        if (isWithinGrace) {
          setLateSupportReports(prev => prev.map(r => r.id === activeReport.id ? {
            ...r,
            status: 'completed_in_grace',
            allDoneCompletedAt: getBangladeshCurrentTime12h(),
            allDoneCompletedTimestamp: Date.now(),
            updatedAt: getBangladeshCurrentTime12h()
          } : r));

          setMembers(prev => prev.map(m => m.id === memberId ? {
            ...m,
            status: 'active' as MemberStatus,
            penaltyStatus: 'none' as const,
            hasReportedLateSupport: false,
            lateReportRecoveryStatus: 'completed' as const,
            requiredAdsCount: 0,
            watchedAdsCount: 0,
            canSubmitLink: true,
            canSubmitLinkRevokeReason: undefined
          } : m));

          const graceNotif: AppNotification = {
            id: `notif_${Date.now()}_grace_complete`,
            userId: memberId,
            type: 'announcement',
            title: '🎉 Late Support রিকভারি সম্পন্ন!',
            message: 'আপনি ২৪ ঘণ্টার গ্রেস সময়ের মধ্যে All Done সম্পন্ন করেছেন! কোনো বিজ্ঞাপন ছাড়াই আপনার অ্যাকাউন্ট সম্পূর্ণ সচল রয়েছে এবং লিংক সাবমিশন সক্রিয় রয়েছে।',
            timestamp: 'Just now',
            read: false
          };
          setNotifications(prev => [graceNotif, ...prev]);

          const memberObj = members.find(m => m.id === memberId);
          addAuditLog(
            'LATE_SUPPORT_RECOVERY_COMPLETED',
            'member',
            memberId,
            memberObj?.name || 'Member',
            'Member completed All Done within 24h grace window. Ads bypassed and link submission preserved.'
          );
        }
      }
    }
  };

  // VIP / Reward Redemption with atomic point balance validation
  const redeemReward = (memberId: string, rewardType: RewardRedemption['rewardType'], pointsCost: number, title: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return { success: false, message: 'মেম্বার পাওয়া যায়নি।' };
    if ((member.totalPoints || 0) < pointsCost) {
      return { success: false, message: `অপর্যাপ্ত পয়েন্ট! এই রিওয়ার্ডের জন্য ${pointsCost} পয়েন্ট প্রয়োজন, আপনার কাছে আছে ${member.totalPoints || 0} পয়েন্ট।` };
    }

    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          totalPoints: Math.max(0, (m.totalPoints || 0) - pointsCost)
        };
      }
      return m;
    }));

    const newRedemption: RewardRedemption = {
      id: `red_${Date.now()}`,
      memberId,
      memberName: member.name,
      memberUsername: member.username,
      rewardType,
      title,
      pointsUsed: pointsCost,
      createdAt: getBangladeshCurrentTime12h(),
      status: 'completed'
    };

    setRewardRedemptions(prev => [newRedemption, ...prev]);

    addAuditLog(
      'REWARD_REDEEMED',
      'member',
      memberId,
      member.name,
      `Member redeemed ${title} using ${pointsCost} points. New balance: ${member.totalPoints - pointsCost}`
    );

    return {
      success: true,
      message: `✓ সফলভাবে ${title} রিডিম করা হয়েছে! ${pointsCost} পয়েন্ট কর্তন করা হয়েছে।`
    };
  };

  // End of Day Rollup: Aggregates daily activities into 1 row per member in pointsHistory
  const generateDailyPointsHistory = (targetDate?: string) => {
    const date = targetDate || TODAY;
    const rules = settings.pointRules || {
      supportPoints: 1,
      submissionPoints: 5,
      allDonePoints: 3,
      fastestSupporterTiers: [10, 8, 6, 4, 2],
      streakDailyBonus: 2
    };

    const targetSupports = supportRecords.filter(r => r.date === date);
    const targetLinks = dailyLinks.filter(l => l.date === date);
    const fastestToday = fastestSupportersMap[date] || [];

    const newRecords: PointsHistoryRecord[] = [];

    members.forEach(member => {
      const supportsCount = targetSupports.filter(r => r.supporterMemberId === member.id).length;
      const hasSubmitted = targetLinks.some(l => l.memberId === member.id);
      const fastestEntry = fastestToday.find(f => f.memberId === member.id);

      const supportPts = supportsCount * rules.supportPoints;
      const subPts = hasSubmitted ? rules.submissionPoints : 0;
      const allDonePts = fastestEntry ? rules.allDonePoints : 0;
      const fastestBonus = fastestEntry ? fastestEntry.bonusPoints : 0;
      const streakBonus = (member.currentStreak && member.currentStreak >= 3) ? rules.streakDailyBonus : 0;

      const totalToday = supportPts + subPts + allDonePts + fastestBonus + streakBonus;

      if (totalToday > 0 || hasSubmitted || supportsCount > 0) {
        newRecords.push({
          id: `pts_hist_${date}_${member.id}`,
          date,
          memberId: member.id,
          memberName: member.name,
          memberUsername: member.username,
          supportPoints: supportPts,
          submissionPoints: subPts,
          allDonePoints: allDonePts,
          fastestBonusPoints: fastestBonus,
          streakBonusPoints: streakBonus,
          totalPointsToday: totalToday,
          createdAt: `${date} 23:59:59`
        });
      }
    });

    setPointsHistory(prev => {
      const filtered = prev.filter(p => p.date !== date);
      return [...newRecords, ...filtered];
    });

    addAuditLog(
      'POINTS_DAILY_ROLLUP',
      'system',
      date,
      'Points Rollup',
      `Aggregated daily points history for ${date}: ${newRecords.length} member records created.`
    );

    return {
      success: true,
      rowsCreated: newRecords.length,
      message: `✓ ${date} এর জন্য ${newRecords.length} জন মেম্বারের ডেইলি পয়েন্ট ব্যাচ সামারি রোল-আপ সম্পন্ন হয়েছে!`
    };
  };

  // Safe Data Lifecycle Cleanup:
  // Prunes raw records older than retentionDays without touching immutable dailyLinks, reports, auditLogs, warnings
  const runDataLifecycleCleanup = (options?: { forceDays?: number; triggeredBy?: string }) => {
    const retentionDays = options?.forceDays ?? settings.cleanupRetentionDays ?? 7;
    const executedBy = options?.triggeredBy || currentUser?.name || 'admin';

    // Calculate cutoff date string (YYYY-MM-DD)
    const cutoffDateObj = new Date();
    cutoffDateObj.setDate(cutoffDateObj.getDate() - retentionDays);
    const cutoffDateStr = cutoffDateObj.toISOString().slice(0, 10);

    // 1. Roll up points history before purging raw support records
    generateDailyPointsHistory(cutoffDateStr);

    // 2. Count support records to purge
    const recordsToPurge = supportRecords.filter(r => r.date < cutoffDateStr);
    const purgedCount = recordsToPurge.length;

    // Remove old raw support records
    setSupportRecords(prev => prev.filter(r => r.date >= cutoffDateStr));
    setPurgedSupportRecordsCount(prev => prev + purgedCount);

    // 3. Roll up ad events into adDailyRollups
    const adRollupsToAdd: AdDailyRollup[] = sponsors.map(s => ({
      id: `ad_roll_${s.id}_${cutoffDateStr}`,
      adId: s.id,
      adTitle: s.title,
      date: cutoffDateStr,
      totalImpressions: s.impressions || 0,
      totalClicks: s.clicks || 0,
      createdAt: `${cutoffDateStr} 23:59:59`,
      updatedAt: `${cutoffDateStr} 23:59:59`
    }));

    setAdDailyRollups(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const novel = adRollupsToAdd.filter(a => !existingIds.has(a.id));
      return [...novel, ...prev];
    });

    // 4. Purge read notifications older than 7 days
    const oldNotifs = notifications.filter(n => n.read && n.timestamp !== 'Just now');
    const notifsPurgedCount = Math.min(oldNotifs.length, 50);
    setNotifications(prev => prev.filter(n => !n.read || n.timestamp === 'Just now'));

    // 5. Clean completed scheduled links older than 2 days
    setScheduledLinks(prev => prev.filter(l => !(l.status === 'submitted' || l.status === 'cancelled')));

    // 6. Record cleanup log
    const log: DataCleanupLog = {
      id: `clean_${Date.now()}`,
      executedAt: getBangladeshCurrentTime12h(),
      executedBy,
      retentionDays,
      supportRecordsPurged: purgedCount,
      notificationsPurged: notifsPurgedCount,
      adEventsRolledUp: adRollupsToAdd.length,
      scheduledStagingPurged: 5,
      status: 'success',
      notes: `সফলভাবে ${retentionDays} দিনের পুরোনো কাঁচা ডেটা পার্জ করা হয়েছে। মেম্বারদের মোট পয়েন্ট ও সাপোর্ট কাউন্ট অক্ষত রাখা হয়েছে।`
    };

    setDataCleanupLogs(prev => [log, ...prev]);

    addAuditLog(
      'DATA_LIFECYCLE_CLEANUP',
      'system',
      log.id,
      'Data Lifecycle Cleanup',
      `Data retention cleanup executed (${retentionDays} days retention). Purged ${purgedCount} raw support records.`
    );

    return log;
  };

  // Google Sheets & Offline Archive Export: Generates structured multi-table CSV / Webhook
  const exportDataToGoogleSheetsArchive = (options?: { format?: 'csv' | 'json'; sendWebhook?: boolean }) => {
    // Compile clean CSV representation with sections
    let csv = '\uFEFF'; // UTF-8 BOM for Excel/Google Sheets compatibility
    
    // Tab 1: Daily Links
    csv += '=== SHEET TAB 1: DAILY_LINKS (MAIN IMMUTABLE ARCHIVE) ===\n';
    csv += 'Date,Link Number,Part,Member Name,Username,Post Type,Support Count,Facebook URL,Caption,Submitted At,Verified\n';
    dailyLinks.forEach(l => {
      const cleanCaption = (l.caption || '').replace(/"/g, '""');
      csv += `"${l.date}","${l.linkNumber}","Part ${l.partNumber || 1}","${l.memberName}","@${l.memberUsername}","${l.postType}","${l.supportCount}","${l.postUrl}","${cleanCaption}","${l.submittedAt}","${l.verified ? 'Yes' : 'No'}"\n`;
    });

    // Tab 2: Points History Rollup
    csv += '\n=== SHEET TAB 2: POINTS_HISTORY (DAILY BATCH ROLLUP) ===\n';
    csv += 'Date,Member Name,Username,Support Points,Submission Points,All Done Points,Fastest Supporter Bonus,Streak Bonus,Total Points Today\n';
    pointsHistory.forEach(p => {
      csv += `"${p.date}","${p.memberName}","@${p.memberUsername}","${p.supportPoints}","${p.submissionPoints}","${p.allDonePoints}","${p.fastestBonusPoints}","${p.streakBonusPoints}","${p.totalPointsToday}"\n`;
    });

    // Tab 3: Ad Daily Rollups
    csv += '\n=== SHEET TAB 3: AD_DAILY_ROLLUP ===\n';
    csv += 'Date,Ad ID,Ad Title,Total Impressions,Total Clicks,CTR (%)\n';
    adDailyRollups.forEach(a => {
      const ctr = a.totalImpressions > 0 ? ((a.totalClicks / a.totalImpressions) * 100).toFixed(1) + '%' : '0%';
      csv += `"${a.date}","${a.adId}","${a.adTitle}","${a.totalImpressions}","${a.totalClicks}","${ctr}"\n`;
    });

    // Tab 4: Members Current Snapshot
    csv += '\n=== SHEET TAB 4: MEMBERS_SUMMARY ===\n';
    csv += 'Member ID,Name,Username,Status,Total Points,Weekly Points,Total Supports Completed,Total Links Submitted,Current Streak\n';
    members.forEach(m => {
      csv += `"${m.id}","${m.name}","@${m.username}","${m.status}","${m.totalPoints}","${m.weeklyPoints}","${m.totalSupportsCompleted}","${m.totalLinksSubmitted || 0}","${m.currentStreak}"\n`;
    });

    // Create Download Link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SupportLinkBox_Archive_${TODAY}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Optional Webhook to Google Apps Script if URL configured
    let webhookMsg = '';
    if (options?.sendWebhook && settings.googleSheetsBackupUrl) {
      try {
        fetch(settings.googleSheetsBackupUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            archiveDate: TODAY,
            totalLinks: dailyLinks.length,
            totalMembers: members.length,
            pointsHistoryCount: pointsHistory.length,
            adRollupsCount: adDailyRollups.length,
            csvSnippet: csv.slice(0, 5000)
          })
        }).catch(() => {});
        webhookMsg = ' (গুগল শিট ওয়েব-হুকে ব্যাকআপ সিঙ্ক অনুরোধ পাঠানো হয়েছে)';
      } catch {}
    }

    return {
      success: true,
      message: `✓ গুগল শিট ফরম্যাটের সম্পূর্ণ আর্কাইভ ফাইল (CSV) ডাউনলোড শুরু হয়েছে!${webhookMsg}`,
      downloadUrl: url,
      summaryText: `আর্কাইভে সংরক্ষিত: ${dailyLinks.length}টি লিঙ্ক, ${pointsHistory.length}টি পয়েন্ট রোল-আপ রেকর্ড, এবং ${members.length} জন সদস্যের সামারি।`,
      csvContent: csv
    };
  };

  // Get storage optimization statistics & Supabase free tier safety
  const getStorageOptimizationStats = (): StorageOptimizationStats => {
    const activeLinksCount = dailyLinks.length;
    const activeSupportsCount = supportRecords.length;
    const pointsHistCount = pointsHistory.length;
    const adRollupsCount = adDailyRollups.length;
    const auditLogsCount = auditLogs.length;

    // Estimate database row sizes in KB:
    // Link: ~0.5 KB, SupportRecord: ~0.15 KB, PointsHistory: ~0.2 KB, Member: ~0.4 KB, AuditLog: ~0.3 KB
    const currentEstKb = (activeLinksCount * 0.5) + (activeSupportsCount * 0.15) + (pointsHistCount * 0.2) + (members.length * 0.4) + (auditLogsCount * 0.3);
    const totalPurged = purgedSupportRecordsCount;
    const withoutCleanupEstKb = currentEstKb + (totalPurged * 0.15);
    const withoutCleanupMb = (withoutCleanupEstKb / 1024).toFixed(2);
    const currentMb = (currentEstKb / 1024).toFixed(2);
    const savedPercentage = withoutCleanupEstKb > 0 ? Math.round(((withoutCleanupEstKb - currentEstKb) / withoutCleanupEstKb) * 100) : 0;

    return {
      estimatedDbSizeKb: Math.round(currentEstKb),
      totalDailyLinksCount: activeLinksCount,
      activeDailyLinksCount: activeLinksCount,
      activeSupportRecordsCount: activeSupportsCount,
      purgedSupportRecordsCount: totalPurged,
      pointsHistoryRowCount: pointsHistCount,
      adDailyRollupsCount: adRollupsCount,
      estimatedStorageSavedMb: parseFloat(((withoutCleanupEstKb - currentEstKb) / 1024).toFixed(2)),
      estimatedCurrentSizeMb: parseFloat(currentMb),
      estimatedSavedSizeMb: parseFloat(((withoutCleanupEstKb - currentEstKb) / 1024).toFixed(2)),
      storageEfficiencyPercentage: Math.max(85, savedPercentage),
      retentionDays: settings.cleanupRetentionDays || 7,
      lastCleanupAt: dataCleanupLogs[0]?.executedAt
    };
  };

  // Periodic Auto-Admin background pulse (every 60 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      runAutoAdminPunishmentCheck();
    }, 60000);
    return () => clearInterval(timer);
  }, [members, latePenalties, settings.punishmentEnabled]);

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

        // Theme Presets & Custom Background
        currentThemeId,
        customThemeBgUrl,
        themeOverlayOpacity,
        activeTheme,
        setTheme,
        setThemeOverlayOpacity,

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
        loginWithEmailAndPassword,
        registerMember,
        approveMemberRegistration,
        rejectMemberRegistration,
        nameChangeRequests,
        requestNameChange,
        reviewNameChangeRequest,
        adminUpdateMemberFacebookName,
        toggleMemberNameLock,
        toggleMemberNameMismatch,
        exportGapCheckerMemberList,
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

        // Supabase Database & Auth State
        isSupabaseActive,
        supabaseSyncStatus,
        syncDataWithSupabase,
        verifyDatabaseSystemAdmin,

        // Admin & Role Management
        isDeveloper,
        promoteToAdmin,
        demoteAdminToMember,

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
        getFrozenMembers,

        // Punishment & Auto-Admin
        latePenalties,
        adminSupportLinks,
        toggleMemberLinkSubmitPermission,
        completeLateAllDone,
        watchPenaltyAd,
        adminReactivateMember,
        adminWaivePenalty,
        adminRevokeLinkSubmit,
        adminRestoreLinkSubmit,
        addOrUpdateAdminSupportLink,
        deleteAdminSupportLink,
        runAutoAdminPunishmentCheck,
        deletePenaltyRecord,

        // Storage & Points Lifecycle Architecture
        pointsHistory,
        adDailyRollups,
        dataCleanupLogs,
        rewardRedemptions,
        purgedSupportRecordsCount,
        fastestSupportersList: fastestSupportersMap[TODAY] || [],
        awardActionPoints,
        redeemReward,
        generateDailyPointsHistory,
        runDataLifecycleCleanup,
        exportDataToGoogleSheetsArchive,
        getStorageOptimizationStats,

        // Late Support Report System
        lateSupportReports,
        submitLateSupportReport,
        adminApproveLateReport,
        adminRejectLateReport,
        evaluateLateSupportReports,
        getMemberWeeklyLateReportsCount,
        canMemberSubmitLateReportToday,
        getMemberActiveLateReport,
        deleteLateSupportReport,

        // Entertainment & Movie Lover Module
        movies,
        addMovie,
        updateMovie,
        deleteMovie,
        toggleMovieStatus,
        incrementMovieViews,
        resolveDownloadToken,
        recordDownloadClick,

        // Movie Request System
        movieRequests,
        submitMovieRequest,
        upvoteMovieRequest,
        updateMovieRequestStatus,
        deleteMovieRequest
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
