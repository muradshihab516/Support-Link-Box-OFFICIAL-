import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { Member, DailyLink, AuditLog, Notice, Report, UserRole, AnnouncementItem, AllDoneRecord, AltIdDisclosure } from '../types';

// Retrieve Supabase credentials from environment variables (supports VITE_ prefix and standard GitHub secret names)
const env = (import.meta as any).env || {};
const rawUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || (typeof process !== 'undefined' ? (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL) : '') || '';
const rawAnonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? (process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY) : '') || '';

export const supabaseUrl: string = typeof rawUrl === 'string' ? rawUrl.trim().replace(/^['"]|['"]$/g, '') : '';
export const supabaseAnonKey: string = typeof rawAnonKey === 'string' ? rawAnonKey.trim().replace(/^['"]|['"]$/g, '') : '';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    supabaseUrl.startsWith('http') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 0
  );
};

// Initialize Supabase client if credentials exist
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Database Types for Supabase
export interface SupabaseMemberRow {
  id: string;
  member_number: number;
  name: string;
  facebook_name: string | null;
  normalized_name: string | null;
  username: string;
  email: string;
  avatar: string | null;
  facebook_url: string;
  normalized_fb_id: string | null;
  name_locked: boolean;
  name_mismatch_flag: boolean;
  name_mismatch_note: string | null;
  role: string;
  is_system_admin: boolean;
  status: string;
  total_links_submitted: number;
  total_supports_completed: number;
  total_points: number;
  weekly_points: number;
  current_rank: number;
  current_streak: number;
  longest_streak: number;
  warning_count: number;
  inactive_days: number;
  last_active_date: string | null;
  badges: string[] | null;
  community_id: string;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

export const mapSupabaseToMember = (row: SupabaseMemberRow): Member => {
  return {
    id: row.id,
    authUserId: row.id,
    memberNumber: row.member_number,
    name: row.name,
    facebookName: row.facebook_name || row.name,
    normalizedName: row.normalized_name || row.name.toLowerCase().replace(/\s+/g, ''),
    username: row.username,
    email: row.email,
    avatar: row.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    facebookUrl: row.facebook_url,
    normalizedFbId: row.normalized_fb_id || undefined,
    nameLocked: Boolean(row.name_locked),
    nameMismatchFlag: Boolean(row.name_mismatch_flag),
    nameMismatchNote: row.name_mismatch_note || undefined,
    joinDate: row.created_at ? row.created_at.split('T')[0] : '2025-01-01',
    role: (row.role as UserRole) || (row.is_system_admin ? 'developer' : 'member'),
    isSystemAdmin: Boolean(row.is_system_admin || row.role === 'developer'),
    status: (row.status as any) || 'active',
    totalLinksSubmitted: row.total_links_submitted || 0,
    totalSupportsCompleted: row.total_supports_completed || 0,
    totalPoints: row.total_points || 0,
    weeklyPoints: row.weekly_points || 0,
    currentRank: row.current_rank || 1,
    currentStreak: row.current_streak || 0,
    longestStreak: row.longest_streak || 0,
    warningCount: row.warning_count || 0,
    inactiveDays: row.inactive_days || 0,
    lastActiveDate: row.last_active_date || new Date().toISOString().split('T')[0],
    badges: Array.isArray(row.badges) ? row.badges : [],
    communityId: row.community_id || 'comm_default',
    notes: row.notes || undefined
  };
};

export const mapMemberToSupabase = (member: Member): Partial<SupabaseMemberRow> => {
  return {
    id: member.id,
    member_number: member.memberNumber,
    name: member.name,
    facebook_name: member.facebookName || member.name,
    normalized_name: member.normalizedName || member.name.toLowerCase().replace(/\s+/g, ''),
    username: member.username,
    email: member.email,
    avatar: member.avatar,
    facebook_url: member.facebookUrl,
    normalized_fb_id: member.normalizedFbId || null,
    name_locked: Boolean(member.nameLocked),
    name_mismatch_flag: Boolean(member.nameMismatchFlag),
    name_mismatch_note: member.nameMismatchNote || null,
    role: member.role,
    is_system_admin: Boolean(member.isSystemAdmin || member.role === 'developer'),
    status: member.status,
    total_links_submitted: member.totalLinksSubmitted || 0,
    total_supports_completed: member.totalSupportsCompleted || 0,
    total_points: member.totalPoints || 0,
    weekly_points: member.weeklyPoints || 0,
    current_rank: member.currentRank || 1,
    current_streak: member.currentStreak || 0,
    longest_streak: member.longestStreak || 0,
    warning_count: member.warningCount || 0,
    inactive_days: member.inactiveDays || 0,
    last_active_date: member.lastActiveDate,
    badges: member.badges,
    community_id: member.communityId,
    notes: member.notes || null,
    updated_at: new Date().toISOString()
  };
};

// Track tables that are not yet provisioned in the remote database to avoid repeated network errors and console noise
const unprovisionedTables = new Set<string>();

export const isTableMissingError = (error: any): boolean => {
  if (!error) return false;
  const code = error.code || '';
  const msg = typeof error.message === 'string' ? error.message.toLowerCase() : '';
  const details = typeof error.details === 'string' ? error.details.toLowerCase() : '';
  const hint = typeof error.hint === 'string' ? error.hint.toLowerCase() : '';
  return (
    code === 'PGRST205' ||
    code === '42P01' || // PostgreSQL undefined_table
    msg.includes('schema cache') ||
    msg.includes('could not find the table') ||
    details.includes('schema cache') ||
    hint.includes('perhaps you meant')
  );
};

export const getMissingSupabaseTables = (): string[] => Array.from(unprovisionedTables);

// Supabase Database API Service
export const supabaseDb = {
  // Verify system admin status directly from database (eliminates hardcoding risk)
  async verifySystemAdminInDb(identifier: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      const clean = identifier.trim().toLowerCase();
      const { data, error } = await supabase
        .from('members')
        .select('is_system_admin, role, email')
        .or(`email.ilike.${clean},id.eq.${identifier}`)
        .limit(1);

      if (error || !data || data.length === 0) {
        return false;
      }

      const row = data[0];
      return Boolean(row.is_system_admin === true || row.role === 'developer');
    } catch (err) {
      console.error('Supabase verifySystemAdminInDb error:', err);
      return false;
    }
  },

  // Fetch all members
  async fetchMembers(): Promise<Member[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('member_number', { ascending: true });

      if (error) {
        console.error('Supabase fetchMembers error:', error);
        return null;
      }

      return (data as SupabaseMemberRow[]).map(mapSupabaseToMember);
    } catch (err) {
      console.error('Supabase fetchMembers exception:', err);
      return null;
    }
  },

  // Upsert member
  async upsertMember(member: Member): Promise<boolean> {
    if (!supabase) return false;
    try {
      const row = mapMemberToSupabase(member);
      const { error } = await supabase
        .from('members')
        .upsert(row, { onConflict: 'id' });

      if (error) {
        console.error('Supabase upsertMember error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase upsertMember exception:', err);
      return false;
    }
  },

  // Update member role with database guard
  async updateMemberRole(
    memberId: string, 
    newRole: UserRole, 
    isSystemAdmin: boolean = false
  ): Promise<{ success: boolean; message: string }> {
    if (!supabase) return { success: false, message: 'Supabase is not configured.' };
    try {
      // Security check: Check if target member in DB is already a protected system admin
      const isProtected = await this.verifySystemAdminInDb(memberId);
      if (isProtected && newRole !== 'developer') {
        return { 
          success: false, 
          message: 'নিরাপত্তা সুরক্ষা: ডাটাবেসে এই অ্যাকাউন্টটি Developer/System Admin হিসেবে সংরক্ষিত। একে ডিমোট করা নিষিদ্ধ।' 
        };
      }

      const { error } = await supabase
        .from('members')
        .update({ 
          role: newRole, 
          is_system_admin: isSystemAdmin || newRole === 'developer',
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId);

      if (error) {
        console.error('Supabase updateMemberRole error:', error);
        return { success: false, message: error.message };
      }

      return { success: true, message: 'ডাটাবেসে রোল সফলভাবে আপডেট হয়েছে।' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Database update failed' };
    }
  },

  // Daily Links
  async fetchDailyLinks(date?: string): Promise<DailyLink[] | null> {
    if (!supabase) return null;
    try {
      let query = supabase.from('daily_links').select('*');
      if (date) {
        query = query.eq('date', date);
      }
      const { data, error } = await query.order('link_number', { ascending: true });
      if (error) {
        console.error('Supabase fetchDailyLinks error:', error);
        return null;
      }
      return (data || []).map((row: any): DailyLink => ({
        id: row.id,
        memberId: row.member_id,
        memberName: row.member_name,
        memberAvatar: row.member_avatar || '',
        memberUsername: row.member_name?.toLowerCase().replace(/\s+/g, '_') || 'member',
        linkNumber: row.link_number || 1,
        postUrl: row.post_url,
        caption: row.caption || '',
        category: row.category || 'member',
        date: row.date || new Date().toISOString().split('T')[0],
        submittedAt: row.created_at || new Date().toISOString(),
        supportCount: row.total_supports_received || row.support_count || 0,
        verified: Boolean(row.verified ?? true),
        communityId: row.community_id || 'comm_default'
      }));
    } catch (err) {
      console.error('Supabase fetchDailyLinks exception:', err);
      return null;
    }
  },

  async insertDailyLink(link: DailyLink): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('daily_links').insert({
        id: link.id,
        member_id: link.memberId,
        member_name: link.memberName,
        member_avatar: link.memberAvatar || null,
        link_number: link.linkNumber || 1,
        post_url: link.postUrl,
        caption: link.caption || null,
        category: link.category || 'member',
        status: 'active',
        date: link.date || new Date().toISOString().split('T')[0],
        total_supports_received: link.supportCount || 0
      });
      if (error) {
        console.error('Supabase insertDailyLink error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase insertDailyLink exception:', err);
      return false;
    }
  },

  // Audit Logs
  async insertAuditLog(log: AuditLog): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('audit_logs').insert({
        id: log.id,
        timestamp: log.timestamp,
        admin_name: log.adminName,
        admin_role: log.adminRole,
        action: log.action,
        target_type: log.targetType,
        target_id: log.targetId,
        target_name: log.targetName || null,
        details: log.details,
        community_id: log.communityId || 'main'
      });
      if (error) {
        console.error('Supabase insertAuditLog error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Supabase insertAuditLog exception:', err);
      return false;
    }
  },

  async fetchAuditLogs(): Promise<AuditLog[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Supabase fetchAuditLogs error:', error);
        return null;
      }
      return (data || []).map((row: any) => ({
        id: row.id,
        timestamp: row.timestamp,
        adminName: row.admin_name || row.actor_name || 'Admin',
        adminRole: row.admin_role || 'admin',
        action: row.action,
        targetType: row.target_type,
        targetId: row.target_id,
        targetName: row.target_name,
        details: row.details,
        communityId: row.community_id || 'main'
      }));
    } catch (err) {
      console.error('Supabase fetchAuditLogs exception:', err);
      return null;
    }
  },

  // Announcements API
  async fetchAnnouncements(): Promise<AnnouncementItem[] | null> {
    if (!supabase) return null;
    if (unprovisionedTables.has('announcements')) {
      return this.fetchNoticesFallback();
    }
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) {
        if (isTableMissingError(error)) {
          unprovisionedTables.add('announcements');
          return this.fetchNoticesFallback();
        }
        console.warn('Supabase fetchAnnouncements warning:', error.message);
        return null;
      }
      return (data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        message: r.message,
        type: r.type || 'general',
        issuedBy: r.issued_by,
        issuedByRole: r.issued_by_role,
        issuedByAvatar: r.issued_by_avatar,
        publishedAt: r.published_at,
        date: r.date,
        timeBst: r.time_bst,
        imageUrl: r.image_url,
        isImportant: Boolean(r.is_important),
        isPinned: Boolean(r.is_pinned),
        status: r.status || 'published',
        scheduledAt: r.scheduled_at,
        readBy: Array.isArray(r.read_by) ? r.read_by : [],
        createdAt: r.created_at || r.published_at,
        communityId: r.community_id || 'comm_default'
      }));
    } catch (err: any) {
      if (isTableMissingError(err)) {
        unprovisionedTables.add('announcements');
        return this.fetchNoticesFallback();
      }
      console.warn('Supabase fetchAnnouncements exception:', err?.message || err);
      return null;
    }
  },

  async fetchNoticesFallback(): Promise<AnnouncementItem[] | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return null;
      return (data || []).map((r: any): AnnouncementItem => ({
        id: r.id,
        title: r.title,
        message: r.message,
        type: (r.type as any) || 'general',
        issuedBy: 'Admin Notice',
        issuedByRole: 'Admin',
        publishedAt: r.created_at || new Date().toISOString(),
        date: r.created_at ? r.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        timeBst: 'BST',
        isImportant: r.type === 'alert_warning' || r.type === 'kickout_warning',
        isPinned: false,
        status: r.is_active ? 'published' : 'draft',
        readBy: [],
        createdAt: r.created_at || new Date().toISOString(),
        communityId: 'comm_default'
      }));
    } catch {
      return null;
    }
  },

  async insertAnnouncement(ann: AnnouncementItem): Promise<boolean> {
    if (!supabase) return false;
    if (unprovisionedTables.has('announcements')) {
      return this.insertNoticeFallback(ann);
    }
    try {
      const { error } = await supabase.from('announcements').upsert({
        id: ann.id,
        title: ann.title,
        message: ann.message,
        type: ann.type,
        issued_by: ann.issuedBy,
        issued_by_role: ann.issuedByRole,
        issued_by_avatar: ann.issuedByAvatar,
        published_at: ann.publishedAt,
        date: ann.date,
        time_bst: ann.timeBst,
        image_url: ann.imageUrl,
        is_important: ann.isImportant,
        is_pinned: ann.isPinned,
        status: ann.status,
        scheduled_at: ann.scheduledAt,
        read_by: ann.readBy || [],
        community_id: ann.communityId || 'comm_default'
      });
      if (error) {
        if (isTableMissingError(error)) {
          unprovisionedTables.add('announcements');
          return this.insertNoticeFallback(ann);
        }
        console.warn('Supabase insertAnnouncement warning:', error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      if (isTableMissingError(err)) {
        unprovisionedTables.add('announcements');
        return this.insertNoticeFallback(ann);
      }
      console.warn('Supabase insertAnnouncement exception:', err?.message || err);
      return false;
    }
  },

  async insertNoticeFallback(ann: AnnouncementItem): Promise<boolean> {
    if (!supabase) return false;
    try {
      const { error } = await supabase.from('notices').upsert({
        id: ann.id,
        title: ann.title,
        message: ann.message,
        type: ann.type || 'announcement',
        target_type: 'all',
        is_active: ann.status === 'published',
        created_at: ann.publishedAt || new Date().toISOString()
      });
      return !error;
    } catch {
      return false;
    }
  },

  async deleteAnnouncement(id: string): Promise<boolean> {
    if (!supabase) return false;
    try {
      if (!unprovisionedTables.has('announcements')) {
        await supabase.from('announcements').delete().eq('id', id);
      }
      await supabase.from('notices').delete().eq('id', id);
      return true;
    } catch {
      return false;
    }
  },

  // All Done API
  async fetchAllDone(date?: string): Promise<AllDoneRecord[] | null> {
    if (!supabase) return null;
    if (unprovisionedTables.has('all_done')) return null;
    try {
      let query = supabase.from('all_done').select('*').order('submitted_at', { ascending: true });
      if (date) {
        query = query.eq('date', date);
      }
      const { data, error } = await query;
      if (error) {
        if (isTableMissingError(error)) {
          unprovisionedTables.add('all_done');
          return null;
        }
        console.warn('Supabase fetchAllDone warning:', error.message);
        return null;
      }
      return (data || []).map((r: any) => ({
        id: r.id,
        memberId: r.member_id,
        memberName: r.member_name,
        memberNumber: r.member_number,
        memberAvatar: r.member_avatar,
        date: r.date,
        submittedAt: r.submitted_at,
        submittedAtTimestamp: Number(r.submitted_at_timestamp) || new Date(r.submitted_at).getTime(),
        submittedTimeBst: r.submitted_time_bst,
        message: r.message,
        otherIds: r.other_ids,
        otherIdLinks: r.other_id_links,
        fastestRank: r.fastest_rank,
        bonusPoints: Number(r.bonus_points) || 0,
        basePoints: Number(r.base_points) || 3,
        status: r.status || 'verified',
        communityId: r.community_id || 'comm_default'
      }));
    } catch (err: any) {
      if (isTableMissingError(err)) {
        unprovisionedTables.add('all_done');
      }
      return null;
    }
  },

  async insertAllDone(record: AllDoneRecord): Promise<{ success: boolean; message: string }> {
    if (!supabase) return { success: true, message: 'Saved locally' };
    if (unprovisionedTables.has('all_done')) {
      return { success: true, message: 'All Done locally saved (Supabase table pending)' };
    }
    try {
      const { error } = await supabase.from('all_done').insert({
        id: record.id,
        member_id: record.memberId,
        member_name: record.memberName,
        member_number: record.memberNumber,
        member_avatar: record.memberAvatar,
        date: record.date,
        submitted_at: record.submittedAt,
        submitted_at_timestamp: record.submittedAtTimestamp,
        submitted_time_bst: record.submittedTimeBst,
        message: record.message,
        other_ids: record.otherIds,
        other_id_links: record.otherIdLinks,
        fastest_rank: record.fastestRank,
        bonus_points: record.bonusPoints,
        base_points: record.basePoints,
        status: record.status,
        community_id: record.communityId
      });
      if (error) {
        if (error.code === '23505') {
          return { success: false, message: 'আপনি আজ ইতোমধ্যে All Done সাবমিট করেছেন।' };
        }
        if (isTableMissingError(error)) {
          unprovisionedTables.add('all_done');
          return { success: true, message: 'All Done locally saved (Supabase table pending)' };
        }
        console.warn('Supabase insertAllDone warning:', error.message);
        return { success: false, message: error.message };
      }
      return { success: true, message: 'All Done successfully recorded in Supabase' };
    } catch (err: any) {
      if (isTableMissingError(err)) {
        unprovisionedTables.add('all_done');
        return { success: true, message: 'All Done locally saved' };
      }
      return { success: false, message: err?.message || 'Error saving to Supabase' };
    }
  },

  async insertAltIdDisclosure(disclosure: AltIdDisclosure): Promise<boolean> {
    if (!supabase) return true;
    if (unprovisionedTables.has('alt_id_disclosures') || unprovisionedTables.has('all_done')) {
      return true;
    }
    try {
      const { error } = await supabase.from('alt_id_disclosures').insert({
        id: disclosure.id,
        all_done_id: disclosure.allDoneId,
        member_id: disclosure.memberId,
        member_name: disclosure.memberName,
        member_number: disclosure.memberNumber,
        date: disclosure.date,
        alt_names: disclosure.altNames,
        alt_id_links: disclosure.altIdLinks,
        created_at: disclosure.createdAt
      });
      if (error) {
        if (isTableMissingError(error)) {
          unprovisionedTables.add('alt_id_disclosures');
          return true;
        }
        return false;
      }
      return true;
    } catch (err: any) {
      if (isTableMissingError(err)) {
        unprovisionedTables.add('alt_id_disclosures');
      }
      return true;
    }
  }
};

// Supabase Authentication Service
export const supabaseAuth = {
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    if (!supabase) throw new Error('Supabase is not configured.');
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
  },

  async signIn(email: string, password: string) {
    if (!supabase) throw new Error('Supabase is not configured.');
    return await supabase.auth.signInWithPassword({
      email,
      password
    });
  },

  async signOut() {
    if (!supabase) return;
    return await supabase.auth.signOut();
  },

  async getSession(): Promise<Session | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getUser(): Promise<User | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
    return supabase.auth.onAuthStateChange(callback);
  }
};
