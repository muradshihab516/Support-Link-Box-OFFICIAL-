export type UserRole = 'member' | 'admin' | 'super_admin' | 'moderator' | 'finance_admin';
export type MemberRole = UserRole;

export type MemberStatus = 'active' | 'inactive' | 'frozen' | 'suspended' | 'removed';

export type DailySupportStatusType = 'completed' | 'partially_completed' | 'failed' | 'excused';

export type NoticeType = 'simple_warning' | 'alert_warning' | 'kickout_warning' | 'announcement';

export type SponsorPosition = 
  | 'top_banner' 
  | 'dashboard_banner' 
  | 'leaderboard_sponsor' 
  | 'leaderboard_top'
  | 'sidebar' 
  | 'between_content' 
  | 'footer';

export type ReportCategory = 'broken_link' | 'fake_support' | 'inappropriate_content' | 'profile_issue' | 'other';
export type ReportStatus = 'open' | 'pending' | 'in_discussion' | 'resolved' | 'dismissed';

export type Sponsor = SponsorAd;
export type RevenueLog = RevenueRecord;
export type CommunitySettings = SystemSettings;

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt?: string;
  color: string;
}

export interface Member {
  id: string;
  memberNumber: number; // e.g. 102
  name: string;
  username: string; // e.g. @emon123
  email: string;
  avatar: string;
  facebookUrl: string;
  joinDate: string;
  joinedAt?: string;
  role: UserRole;
  status: MemberStatus;
  totalLinksSubmitted: number;
  linksSubmitted?: number;
  totalSupportsCompleted: number;
  supportsCompleted?: number;
  completionRate?: number;
  dailySupportsDone?: number;
  totalPoints: number;
  weeklyPoints: number;
  currentRank: number;
  currentStreak: number;
  longestStreak: number;
  warningCount: number;
  inactiveDays: number;
  inactivityDays?: number;
  lastActiveDate: string;
  badges: string[]; // Badge IDs
  communityId: string;
  notes?: string;
  frozenAt?: string;
  suspendedAt?: string;
}

export type PostContentType = 'photo' | 'video';
export type LinkCategoryType = 'member' | 'admin' | 'vip' | 'notice';
export type ScheduleStatus = 'scheduled' | 'processing' | 'submitted' | 'cancelled' | 'failed';

export interface ScheduledLink {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  memberUsername: string;
  postUrl: string;
  caption?: string;
  postType: PostContentType;
  instruction?: string;
  category?: LinkCategoryType;
  scheduledForDate: string; // YYYY-MM-DD
  scheduledForTime: string; // HH:mm (e.g. "12:00", "14:30")
  scheduledForTimestamp: number; // Epoch ms when the backend triggers release
  status: ScheduleStatus;
  createdAt: string; // Human or ISO
  createdAtTimestamp: number;
  submittedAt?: string;
  submittedDailyLinkId?: string;
  assignedLinkNumber?: number;
  cancellationReason?: string;
  scheduledByAdminId?: string;
  scheduledByAdminName?: string;
  isScheduledByAdmin?: boolean;
  communityId: string;
}

export interface DailyLink {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  memberUsername: string;
  linkNumber: number; // e.g. #57 (unique, immutable)
  partNumber?: number; // e.g. 1 for 1-20, 2 for 21-40
  postUrl: string;
  caption?: string;
  postType?: PostContentType; // 'photo' | 'video'
  instruction?: string; // e.g. "React + Comment করবেন"
  category?: LinkCategoryType | 'batch';
  linkType?: LinkCategoryType;
  submittedByAdminId?: string; // If submitted by admin on behalf of member
  submittedByAdminName?: string;
  isSubmittedByAdmin?: boolean;
  submittedAt: string; // ISO or human readable
  submittedAtTimestamp?: number; // epoch ms
  editableUntil?: number; // epoch ms (submittedAtTimestamp + 2 * 60 * 1000)
  lastEditedAt?: string;
  lastEditedBy?: string;
  date: string; // YYYY-MM-DD
  supportCount: number;
  communityId: string;
  verified: boolean;
  badgeTitle?: string;
}

// 20 links per Part utilities
export const getPartNumber = (linkNumber: number): number => {
  return Math.max(1, Math.ceil(linkNumber / 20));
};

export const getPartRange = (partNumber: number): { start: number; end: number; label: string; shortLabel: string } => {
  const safePart = Math.max(1, partNumber);
  const start = (safePart - 1) * 20 + 1;
  const end = safePart * 20;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    start,
    end,
    label: `Part ${safePart} (${pad(start)}–${pad(end)})`,
    shortLabel: `Part ${safePart}`
  };
};

export interface SupportRecord {
  id: string;
  dailyLinkId: string;
  supporterMemberId: string;
  supportedPostOwnerId: string;
  supportedAt: string;
  date: string; // YYYY-MM-DD
  status: 'verified' | 'pending_review' | 'flagged';
  communityId: string;
  supporterName?: string;
  supporterUsername?: string;
  supporterAvatar?: string;
}

export interface WeeklyWinner {
  rank: number;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  pointsAwarded: number;
  totalSupports: number;
  completionRate: number;
}

export interface WeeklySession {
  id: string;
  weekNumber: number; // e.g. 59
  title: string; // "59th Week"
  startDate: string;
  endDate: string;
  status: 'active' | 'archived';
  totalLinks: number;
  totalSupports: number;
  winners: WeeklyWinner[];
  communityId: string;
  totalParticipants?: number;
  totalLinksExchanged?: number;
  topPerformerName?: string;
  topPerformerPoints?: number;
}

export interface Notice {
  id: string;
  targetMemberId: string; // 'all' or memberId
  targetMemberName?: string;
  type: NoticeType;
  title: string;
  message: string;
  issuedBy: string;
  issuedAt: string;
  active: boolean;
  acknowledged?: boolean;
  communityId: string;
}

export interface ReportReply {
  id: string;
  reportId: string;
  senderId: string;
  senderName: string;
  senderUsername?: string;
  senderAvatar?: string;
  senderRole: 'reporter' | 'link_owner' | 'admin' | 'moderator';
  message: string;
  screenshotUrl?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterUsername?: string;
  reporterAvatar?: string;
  category: ReportCategory;
  reasons?: string[]; // Pre-defined Bengali reasons e.g. ['লিংক কাজ করছে না', 'কমেন্ট বন্ধ করা আছে']
  description: string;
  targetLinkId?: string;
  targetLinkNumber?: number;
  targetMemberId?: string;
  targetMemberName?: string;
  screenshotUrl?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt?: string;
  adminNotes?: string;
  resolvedBy?: string;
  communityId: string;
  replies?: ReportReply[];
  unreadBy?: string[]; // List of user IDs who have not viewed latest update
}

export interface SponsorAd {
  id: string;
  sponsorName: string;
  title: string;
  description: string;
  imageUrl: string;
  destinationUrl: string;
  startDate: string;
  endDate: string;
  position: SponsorPosition;
  priority: number;
  status: 'active' | 'paused' | 'expired';
  impressions: number;
  clicks: number;
  pricePaid?: number;
  packageType: 'basic_banner' | 'premium_banner' | 'leaderboard_sponsor' | 'featured_sponsor';
  communityId: string;
  createdAt?: string;
}

export interface AffiliateCampaign {
  id: string;
  name: string;
  bannerUrl: string;
  destinationUrl: string;
  trackingUrl: string;
  startDate: string;
  endDate: string;
  clicks: number;
  conversions: number;
  estimatedRevenue: number;
  status: 'active' | 'paused' | 'completed';
  communityId: string;
}

export interface AuditLog {
  id: string;
  adminName: string;
  adminRole: string;
  action: string;
  targetType: 'member' | 'link' | 'sponsor' | 'week' | 'settings' | 'report' | 'notice';
  targetId: string;
  targetName?: string;
  details: string;
  timestamp: string;
  communityId: string;
}

export interface AppNotification {
  id: string;
  userId: string; // 'all' or memberId
  type: 'support_reminder' | 'deadline' | 'rank_up' | 'streak' | 'warning' | 'announcement' | 'winner' | 'report_reply';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  reportId?: string;
}

export interface Community {
  id: string;
  name: string;
  tagline: string;
  memberCount: number;
  isDefault: boolean;
  avatar?: string;
}

export interface SystemSettings {
  communityName: string;
  tagline: string;
  communityTagline?: string;
  supportDeadlineTime: string; // e.g. "23:59" or "12:00 AM"
  dailyDeadlineTime?: string;
  timezone: string;
  submissionWindowStart: string; // e.g. "10:00"
  submissionWindowEnd: string; // e.g. "16:50"
  submissionWindowEnabled: boolean;
  submissionOpen: boolean; // master emergency toggle
  pointsSchema: {
    first: number;
    second: number;
    third: number;
    fourth: number;
    fifth: number;
  };
  maxDailySubmissionsPerMember?: number;
  inactivityThresholdDays?: number;
  allowDuplicateLinks?: boolean;
  autoFreezeAfterDays: number;
  minSupportRequiredPercent: number;
  allowAutoUnfreezeOnSubmit: boolean;
  minSupportDwellSeconds?: number; // e.g. 15 seconds minimum for photo posts
  videoSupportDwellSeconds?: number; // e.g. 25 seconds minimum for video posts
  enableAdSlots: boolean;
  enableSponsoredLeaderboard: boolean;
  enableFeaturedSponsors: boolean;
  theme: 'light' | 'dark' | 'system';
  scheduleEnabled?: boolean;
  scheduleStartHourOffset?: number; // default 2 hours after opening (e.g. 10:00 -> 12:00)
  scheduleAllowedStartTime?: string; // default "12:00"
  scheduleAllowedEndTime?: string; // default "16:50"
}

export interface RevenueRecord {
  id: string;
  source: 'direct_sponsor' | 'ad_network' | 'affiliate' | 'custom' | 'sponsor_direct';
  sponsorOrNetworkName: string;
  amount: number;
  currency: string;
  period: string; // e.g. "2026-08"
  date: string;
  note?: string;
  notes?: string;
  reference?: string;
}
