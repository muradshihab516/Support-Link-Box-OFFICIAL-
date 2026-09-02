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
export type ReportStatus = 'open' | 'pending' | 'resolved' | 'dismissed';

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

export interface DailyLink {
  id: string;
  memberId: string;
  memberName: string;
  memberAvatar: string;
  memberUsername: string;
  linkNumber: number; // e.g. #57
  postUrl: string;
  caption?: string;
  submittedAt: string; // ISO or human readable
  date: string; // YYYY-MM-DD
  supportCount: number;
  communityId: string;
  verified: boolean;
  category?: 'batch' | 'vip' | 'admin';
  badgeTitle?: string;
}

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

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterUsername?: string;
  category: ReportCategory;
  description: string;
  targetLinkId?: string;
  targetMemberId?: string;
  targetMemberName?: string;
  screenshotUrl?: string;
  status: ReportStatus;
  createdAt: string;
  adminNotes?: string;
  resolvedBy?: string;
  communityId: string;
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
  type: 'support_reminder' | 'deadline' | 'rank_up' | 'streak' | 'warning' | 'announcement' | 'winner';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
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
  enableAdSlots: boolean;
  enableSponsoredLeaderboard: boolean;
  enableFeaturedSponsors: boolean;
  theme: 'light' | 'dark' | 'system';
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
