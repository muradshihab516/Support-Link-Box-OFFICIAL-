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
