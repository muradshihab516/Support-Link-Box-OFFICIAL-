/**
 * Bangladesh Standard Time (BST = UTC+6) Utility
 * 
 * Provides time calculation strictly in Asia/Dhaka timezone,
 * completely independent of client/device/browser local timezones.
 */

export interface BDTimeWindowStatus {
  nowBD: Date;
  currentTimeStr: string; // e.g. "14:25"
  currentFormatted12h: string; // e.g. "02:25 PM"
  currentFormattedBangla: string; // e.g. "দুপুর ০২:২৫"
  windowStartStr: string; // e.g. "10:00"
  windowEndStr: string; // e.g. "16:50"
  formattedStart12h: string; // e.g. "10:00 AM"
  formattedEnd12h: string; // e.g. "04:50 PM"
  isOpenNow: boolean; // inside window AND submissionOpen is true
  isBeforeWindow: boolean;
  isAfterWindow: boolean;
  isEmergencyClosed: boolean; // if admin manually closed it
  windowEnabled: boolean;
  remainingMinutesToStart: number;
  remainingMinutesToEnd: number;
  statusBadgeText: string;
  statusMessageBengali: string;
}

/**
 * Returns detailed Bangladesh Time parts in Asia/Dhaka (+06:00)
 * accurately extracted without local browser timezone distortion.
 */
export interface BangladeshTimeInfo {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  time24: string; // e.g. "14:25"
  dateIso: string; // e.g. "2026-09-04"
}

export function getBangladeshTimeInfo(): BangladeshTimeInfo {
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const p: Record<string, string> = {};
    parts.forEach(part => { p[part.type] = part.value; });

    let h = parseInt(p.hour || '0', 10);
    if (h === 24) h = 0; // standard 0-23
    const m = parseInt(p.minute || '0', 10);
    const s = parseInt(p.second || '0', 10);
    const y = parseInt(p.year || '2026', 10);
    const mo = parseInt(p.month || '1', 10);
    const d = parseInt(p.day || '1', 10);

    const curHStr = h < 10 ? `0${h}` : `${h}`;
    const curMStr = m < 10 ? `0${m}` : `${m}`;
    const curMoStr = mo < 10 ? `0${mo}` : `${mo}`;
    const curDStr = d < 10 ? `0${d}` : `${d}`;

    return {
      year: y,
      month: mo,
      day: d,
      hours: h,
      minutes: m,
      seconds: s,
      time24: `${curHStr}:${curMStr}`,
      dateIso: `${y}-${curMoStr}-${curDStr}`
    };
  } catch {
    // Fallback: UTC + 6 hours
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const bdTime = new Date(utcTime + (3600000 * 6));
    const h = bdTime.getUTCHours();
    const m = bdTime.getUTCMinutes();
    const s = bdTime.getUTCSeconds();
    const y = bdTime.getUTCFullYear();
    const mo = bdTime.getUTCMonth() + 1;
    const d = bdTime.getUTCDate();
    const curHStr = h < 10 ? `0${h}` : `${h}`;
    const curMStr = m < 10 ? `0${m}` : `${m}`;
    const curMoStr = mo < 10 ? `0${mo}` : `${mo}`;
    const curDStr = d < 10 ? `0${d}` : `${d}`;

    return {
      year: y,
      month: mo,
      day: d,
      hours: h,
      minutes: m,
      seconds: s,
      time24: `${curHStr}:${curMStr}`,
      dateIso: `${y}-${curMoStr}-${curDStr}`
    };
  }
}

/**
 * Returns formatted 12-hour time in Bangladesh Standard Time (e.g. "02:35 PM")
 */
export function getBangladeshCurrentTime12h(): string {
  const { time24 } = getBangladeshTimeInfo();
  return formatTimeTo12Hour(time24);
}

/**
 * Returns current Date object shifted to Asia/Dhaka (+06:00)
 */
export function getBangladeshCurrentDate(): Date {
  const info = getBangladeshTimeInfo();
  return new Date(`${info.dateIso}T${info.time24}:00+06:00`);
}

/**
 * Converts English digits to Bengali numerals
 */
export function toBengaliNumerals(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, w => bnDigits[+w]);
}

/**
 * Formats "HH:MM" 24h time to 12h representation e.g. "10:00 AM" or "04:50 PM"
 */
export function formatTimeTo12Hour(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const hDisplay = h12 < 10 ? `0${h12}` : `${h12}`;
  const mDisplay = m < 10 ? `0${m}` : `${m}`;
  return `${hDisplay}:${mDisplay} ${period}`;
}

/**
 * Formats "HH:MM" 24h time to Bengali display e.g. "সকাল ১০:০০" বা "বিকেল ০৪:৫০"
 */
export function formatTimeToBangla(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr || '0', 10);
  const m = parseInt(mStr || '0', 10);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const hDisplay = toBengaliNumerals(h12 < 10 ? `০${h12}` : `${h12}`);
  const mDisplay = toBengaliNumerals(m < 10 ? `০${m}` : `${m}`);
  
  let period = 'সকাল';
  if (h >= 12 && h < 15) period = 'দুপুর';
  else if (h >= 15 && h < 18) period = 'বিকেল';
  else if (h >= 18 && h < 20) period = 'সন্ধ্যা';
  else if (h >= 20 || h < 4) period = 'রাত';
  else if (h >= 4 && h < 6) period = 'ভোর';

  return `${period} ${hDisplay}:${mDisplay}`;
}

/**
 * Evaluates current status of Bangladesh link submission window
 */
export function checkBangladeshSubmissionWindow(
  windowStart: string = '10:00',
  windowEnd: string = '16:50',
  windowEnabled: boolean = true,
  submissionOpen: boolean = true
): BDTimeWindowStatus {
  const bdInfo = getBangladeshTimeInfo();
  const nowBD = new Date(`${bdInfo.dateIso}T${bdInfo.time24}:00+06:00`);
  const currentHours = bdInfo.hours;
  const currentMinutes = bdInfo.minutes;
  const currentTotalMinutes = (currentHours * 60) + currentMinutes;

  const [startH, startM] = windowStart.split(':').map(Number);
  const [endH, endM] = windowEnd.split(':').map(Number);

  const startTotalMinutes = (startH * 60) + (startM || 0);
  const endTotalMinutes = (endH * 60) + (endM || 0);

  const currentTimeStr = bdInfo.time24;

  const currentFormatted12h = formatTimeTo12Hour(currentTimeStr);
  const currentFormattedBangla = formatTimeToBangla(currentTimeStr);
  const formattedStart12h = formatTimeTo12Hour(windowStart);
  const formattedEnd12h = formatTimeTo12Hour(windowEnd);

  const isEmergencyClosed = submissionOpen === false;
  const isBeforeWindow = windowEnabled && currentTotalMinutes < startTotalMinutes;
  const isAfterWindow = windowEnabled && currentTotalMinutes > endTotalMinutes;
  const isInWindowTime = !windowEnabled || (currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes);
  const isOpenNow = !isEmergencyClosed && isInWindowTime;

  const remainingMinutesToStart = Math.max(0, startTotalMinutes - currentTotalMinutes);
  const remainingMinutesToEnd = Math.max(0, endTotalMinutes - currentTotalMinutes);

  let statusBadgeText = 'সাবমিশন বন্ধ';
  let statusMessageBengali = '';

  if (isEmergencyClosed) {
    statusBadgeText = 'সাময়িকভাবে বন্ধ';
    statusMessageBengali = 'এডমিন প্যানেল থেকে লিংক সাবমিশন সাময়িকভাবে স্থগিত রাখা হয়েছে।';
  } else if (!windowEnabled) {
    statusBadgeText = '২৪/৭ উন্মুক্ত';
    statusMessageBengali = 'লিংক সাবমিশন ২৪ ঘণ্টা উন্মুক্ত রাখা আছে।';
  } else if (isBeforeWindow) {
    const hours = Math.floor(remainingMinutesToStart / 60);
    const mins = remainingMinutesToStart % 60;
    const timeRemainingStr = hours > 0 
      ? `${toBengaliNumerals(hours)} ঘণ্টা ${toBengaliNumerals(mins)} মিনিট`
      : `${toBengaliNumerals(mins)} মিনিট`;

    statusBadgeText = 'দেরি আছে';
    statusMessageBengali = `আজকের লিংক সাবমিশন শুরু হবে ${formatTimeToBangla(windowStart)}-এ (বাকি: ${timeRemainingStr})`;
  } else if (isAfterWindow) {
    statusBadgeText = 'আজকের সময় শেষ';
    statusMessageBengali = `আজকের সাবমিশনের সময় শেষ হয়েছে (${formatTimeToBangla(windowEnd)} পর্যন্ত ছিল)। পরবর্তী সাবমিশন আগামীকাল ${formatTimeToBangla(windowStart)}-এ।`;
  } else {
    const hours = Math.floor(remainingMinutesToEnd / 60);
    const mins = remainingMinutesToEnd % 60;
    const timeRemainingStr = hours > 0 
      ? `${toBengaliNumerals(hours)} ঘণ্টা ${toBengaliNumerals(mins)} মিনিট`
      : `${toBengaliNumerals(mins)} মিনিট`;

    statusBadgeText = 'উন্মুক্ত আছে';
    statusMessageBengali = `লিংক সাবমিশন চলছে! আজ ${formatTimeToBangla(windowEnd)} পর্যন্ত সাবমিট করতে পারবেন (বাকি: ${timeRemainingStr})`;
  }

  return {
    nowBD,
    currentTimeStr,
    currentFormatted12h,
    currentFormattedBangla,
    windowStartStr: windowStart,
    windowEndStr: windowEnd,
    formattedStart12h,
    formattedEnd12h,
    isOpenNow,
    isBeforeWindow,
    isAfterWindow,
    isEmergencyClosed,
    windowEnabled,
    remainingMinutesToStart,
    remainingMinutesToEnd,
    statusBadgeText,
    statusMessageBengali
  };
}

export interface LateSupportStatus {
  isLate: boolean; // is past 12:00 AM deadline
  isPastCutoff: boolean; // is past 10:00 AM cutoff (10 hours window)
  lateMinutes: number;
  lateHours: number; // bucketed e.g. 1, 2, 3...
  lateFormattedBangla: string; // e.g. "১ ঘণ্টা ৩৫ মিনিট"
  requiredAds: number;
  timeString12h: string;
}

/**
 * Calculates late time status against midnight (12:00 AM BST)
 * and 10:00 AM BST cutoff
 */
export function checkLateSupportPunishment(
  targetDate?: Date,
  options?: {
    deadlineTime?: string; // "00:00"
    cutoffTime?: string; // "10:00"
    adsPerHour?: number; // 1
    maxAds?: number; // 5 or 10
  }
): LateSupportStatus {
  const bdInfo = getBangladeshTimeInfo();
  const now = targetDate || new Date();
  
  // Hours and minutes in Bangladesh
  let hours = bdInfo.hours;
  let minutes = bdInfo.minutes;

  // If a custom targetDate was passed, format it to BD
  if (targetDate) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const parts = formatter.formatToParts(targetDate);
      const p: Record<string, string> = {};
      parts.forEach(part => { p[part.type] = part.value; });
      hours = parseInt(p.hour || '0', 10);
      if (hours === 24) hours = 0;
      minutes = parseInt(p.minute || '0', 10);
    } catch {}
  }

  const adsPerHour = options?.adsPerHour ?? 1;
  const maxAds = options?.maxAds ?? 5;

  // Midnight is 00:00.
  // Window: 00:00 to 10:00 AM (10 hours)
  const isLate = hours >= 0 && hours < 24; // If checked after deadline
  const isPastCutoff = hours >= 10 && hours < 24;

  let totalMinutesLate = 0;
  if (hours < 10) {
    // Between 00:00 and 09:59
    totalMinutesLate = (hours * 60) + minutes;
  } else {
    // Past 10:00 AM
    totalMinutesLate = (10 * 60); // Max 10 hours
  }

  const lateHours = Math.max(1, Math.min(10, Math.ceil(totalMinutesLate / 60)));
  const hLate = Math.floor(totalMinutesLate / 60);
  const mLate = totalMinutesLate % 60;

  const lateFormattedBangla = hLate > 0 
    ? `${toBengaliNumerals(hLate)} ঘণ্টা ${toBengaliNumerals(mLate)} মিনিট`
    : `${toBengaliNumerals(mLate)} মিনিট`;

  const requiredAds = Math.min(maxAds, Math.max(1, lateHours * adsPerHour));

  return {
    isLate: true,
    isPastCutoff,
    lateMinutes: totalMinutesLate,
    lateHours,
    lateFormattedBangla,
    requiredAds,
    timeString12h: getBangladeshCurrentTime12h()
  };
}

/**
 * Late Support Report Eligibility Status
 */
export interface BDTimeLateReportEligibility {
  isBeforeMidnight: boolean;
  minutesRemainingToMidnight: number;
  formattedRemainingBangla: string;
  formattedRemainingEn: string;
  currentBdTime12h: string;
  currentBdTime24h: string;
  isSubmissionAllowed: boolean;
  errorMessage?: string;
}

/**
 * Validates if member is allowed to submit a Late Support Report.
 * Strict rule: Must submit BEFORE 12:00 AM Midnight in Bangladesh Time (Asia/Dhaka).
 * If 12:00 AM has arrived or passed (overnight until 10:00 AM), submission is blocked.
 */
export function checkBangladeshLateReportEligibility(
  targetDate?: Date,
  allowOverrideForTesting: boolean = false
): BDTimeLateReportEligibility {
  const bdInfo = getBangladeshTimeInfo();
  let hours = bdInfo.hours;
  let minutes = bdInfo.minutes;

  if (targetDate) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      const parts = formatter.formatToParts(targetDate);
      const p: Record<string, string> = {};
      parts.forEach(part => { p[part.type] = part.value; });
      hours = parseInt(p.hour || '0', 10);
      if (hours === 24) hours = 0;
      minutes = parseInt(p.minute || '0', 10);
    } catch {}
  }

  // Midnight is 00:00. 
  // Daytime (10:00 AM to 23:59:59 PM) is active daily link & support window.
  // Overnight (00:00 AM to 09:59 AM) is past midnight deadline.
  const isOvernightPastMidnight = hours >= 0 && hours < 10;
  const isBeforeMidnight = !isOvernightPastMidnight;

  let minutesRemainingToMidnight = 0;
  if (isBeforeMidnight) {
    // Minutes remaining until 24:00 (12:00 AM)
    const currentTotalMinutes = (hours * 60) + minutes;
    const midnightTotalMinutes = 24 * 60;
    minutesRemainingToMidnight = Math.max(0, midnightTotalMinutes - currentTotalMinutes);
  }

  const hRem = Math.floor(minutesRemainingToMidnight / 60);
  const mRem = minutesRemainingToMidnight % 60;

  const formattedRemainingBangla = isBeforeMidnight 
    ? (hRem > 0 ? `${toBengaliNumerals(hRem)} ঘণ্টা ${toBengaliNumerals(mRem)} মিনিট` : `${toBengaliNumerals(mRem)} মিনিট`)
    : 'সময় অতিক্রান্ত (রাত ১২:০০ টার পর)';

  const formattedRemainingEn = isBeforeMidnight 
    ? `${hRem}h ${mRem}m` 
    : 'Expired';

  const isSubmissionAllowed = allowOverrideForTesting || isBeforeMidnight;
  const errorMessage = !isSubmissionAllowed
    ? 'Late Support Report করার নির্ধারিত সময় (রাত ১২:০০ AM) শেষ হয়ে গেছে। ডেডলাইনের পূর্বেই রিপোর্ট সাবমিট করতে হবে।'
    : undefined;

  return {
    isBeforeMidnight,
    minutesRemainingToMidnight,
    formattedRemainingBangla,
    formattedRemainingEn,
    currentBdTime12h: getBangladeshCurrentTime12h(),
    currentBdTime24h: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    isSubmissionAllowed,
    errorMessage
  };
}

/**
 * Checks if two date strings (YYYY-MM-DD) belong to the same week in Bangladesh
 */
export function isSameBangladeshWeek(dateStr1: string, dateStr2: string): boolean {
  if (!dateStr1 || !dateStr2) return false;
  if (dateStr1 === dateStr2) return true;

  try {
    const d1 = new Date(`${dateStr1}T12:00:00+06:00`);
    const d2 = new Date(`${dateStr2}T12:00:00+06:00`);
    const diffDays = Math.abs((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays >= 7) return false;

    // ISO week calculation (Monday to Sunday)
    const getWeekNumber = (d: Date) => {
      const target = new Date(d.valueOf());
      const dayNr = (d.getDay() + 6) % 7;
      target.setDate(target.getDate() - dayNr + 3);
      const firstThursday = target.valueOf();
      target.setMonth(0, 1);
      if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
      }
      return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    };

    return d1.getFullYear() === d2.getFullYear() && getWeekNumber(d1) === getWeekNumber(d2);
  } catch {
    return false;
  }
}

/**
 * Calculates 24-hour late recovery window details
 */
export function calculateLateRecoveryDeadline(
  submittedTimestamp: number,
  graceHours: number = 24
): {
  deadlineTimestamp: number;
  isExpired: boolean;
  remainingMs: number;
  remainingFormattedBangla: string;
  remainingFormattedEn: string;
} {
  const deadlineTimestamp = submittedTimestamp + (graceHours * 60 * 60 * 1000);
  const now = Date.now();
  const remainingMs = Math.max(0, deadlineTimestamp - now);
  const isExpired = now >= deadlineTimestamp;

  const totalMinutes = Math.floor(remainingMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const remainingFormattedBangla = isExpired 
    ? '২৪ ঘণ্টার সময় অতিক্রান্ত (Approval Pending)'
    : (hours > 0 ? `${toBengaliNumerals(hours)} ঘণ্টা ${toBengaliNumerals(minutes)} মিনিট` : `${toBengaliNumerals(minutes)} মিনিট`);

  const remainingFormattedEn = isExpired 
    ? 'Expired (>24h)'
    : `${hours}h ${minutes}m`;

  return {
    deadlineTimestamp,
    isExpired,
    remainingMs,
    remainingFormattedBangla,
    remainingFormattedEn
  };
}

