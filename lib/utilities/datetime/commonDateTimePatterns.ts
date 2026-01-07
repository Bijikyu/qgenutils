/**
 * Common Date/Time Utilities
 * 
 * Centralized date/time utilities to eliminate code duplication across
 * codebase. These utilities handle common date manipulation patterns
 * including formatting, parsing, validation, and calculations.
 */

/**
 * Date formatting options
 */
interface DateFormatOptions {
  includeTime?: boolean;
  locale?: string;
  timezone?: string;
  format?: string;
}

/**
 * Time duration interface
 */
interface TimeDuration {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

/**
 * Formats a date according to various common patterns
 * @param date - Date to format
 * @param options - Formatting options
 * @returns Formatted date string
 */
export function formatDate(date: Date, options: DateFormatOptions = {}): string {
  const { includeTime = true, locale = 'en-US', format } = options;
  
  if (format) {
    // Use custom format
    return format.replace(/YYYY/g, date.getFullYear().toString())
      .replace(/MM/g, (date.getMonth() + 1).toString().padStart(2, '0'))
      .replace(/DD/g, date.getDate().toString().padStart(2, '0'))
      .replace(/HH/g, date.getHours().toString().padStart(2, '0'))
      .replace(/mm/g, date.getMinutes().toString().padStart(2, '0'))
      .replace(/ss/g, date.getSeconds().toString().padStart(2, '0'));
  }
  
  // Use locale-specific formatting
  if (includeTime) {
    return date.toLocaleString(locale);
  } else {
    return date.toLocaleDateString(locale);
  }
}

/**
 * Parses a date string with multiple format support
 * @param dateString - Date string to parse
 * @param formats - Array of formats to try
 * @returns Parsed date or null
 */
export function parseDate(dateString: string, formats: string[] = []): Date | null {
  if (!dateString) return null;
  
  // Try built-in Date parsing first
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }
  
  // Try custom formats
  const defaultFormats = [
    'YYYY-MM-DD',
    'MM/DD/YYYY',
    'DD/MM/YYYY',
    'YYYY-MM-DDTHH:mm:ss',
    'ISO8601'
  ];
  
  const allFormats = formats.length > 0 ? formats : defaultFormats;
  
  for (const format of allFormats) {
    try {
      const parsed = parseWithFormat(dateString, format);
      if (parsed) return parsed;
    } catch {
      continue;
    }
  }
  
  return null;
}

/**
 * Parses date string with specific format
 * @param dateString - Date string
 * @param format - Date format
 * @returns Parsed date or null
 */
function parseWithFormat(dateString: string, format: string): Date | null {
  const mapping: Record<string, string> = {
    'YYYY': '(\\d{4})',
    'MM': '(\\d{2})',
    'DD': '(\\d{2})',
    'HH': '(\\d{2})',
    'mm': '(\\d{2})',
    'ss': '(\\d{2})'
  };
  
  let regex = format;
  for (const [key, pattern] of Object.entries(mapping)) {
    regex = regex.replace(key, pattern);
  }
  
  const match = new RegExp(`^${regex}$`).exec(dateString);
  if (!match) return null;
  
  const year = parseInt(match[1]);
  const month = parseInt(match[2]) - 1;
  const day = parseInt(match[3]);
  const hour = parseInt(match[4] || '0');
  const minute = parseInt(match[5] || '0');
  const second = parseInt(match[6] || '0');
  
  return new Date(year, month, day, hour, minute, second);
}

/**
 * Adds time to a date
 * @param date - Base date
 * @param options - Time addition options
 * @returns New date with added time
 */
export function addTime(date: Date, options: {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
} = {}): Date {
  const {
    years = 0,
    months = 0,
    days = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
    milliseconds = 0
  } = options;
  
  const result = new Date(date.getTime());
  
  if (years > 0) result.setFullYear(result.getFullYear() + years);
  if (months > 0) result.setMonth(result.getMonth() + months);
  if (days > 0) result.setDate(result.getDate() + days);
  if (hours > 0) result.setHours(result.getHours() + hours);
  if (minutes > 0) result.setMinutes(result.getMinutes() + minutes);
  if (seconds > 0) result.setSeconds(result.getSeconds() + seconds);
  if (milliseconds > 0) result.setMilliseconds(result.getMilliseconds() + milliseconds);
  
  return result;
}

/**
 * Subtracts time from a date
 * @param date - Base date
 * @param options - Time subtraction options
 * @returns New date with subtracted time
 */
export function subtractTime(date: Date, options: {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
} = {}): Date {
return addTime(date, {
    years: -(options.years || 0),
    months: -(options.months || 0),
    days: -(options.days || 0),
    hours: -(options.hours || 0),
    minutes: -(options.minutes || 0),
    seconds: -(options.seconds || 0),
    milliseconds: -(options.milliseconds || 0),
  });
}

/**
 * Calculates time difference between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Time duration object
 */
export function timeDifference(startDate: Date, endDate: Date): TimeDuration {
  const diffMs = endDate.getTime() - startDate.getTime();
  
  if (diffMs < 0) {
    return {
      years: 0, months: 0, days: 0,
      hours: 0, minutes: 0, seconds: 0,
      milliseconds: 0
    };
  }
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  // Approximate months and years
  const monthsApprox = Math.floor(days / 30.44);
  const yearsApprox = Math.floor(monthsApprox / 12);
  
  const remainingDays = days % 30.44;
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;
  
  return {
    years: yearsApprox,
    months: monthsApprox % 12,
    days: Math.floor(remainingDays),
    hours: remainingHours,
    minutes: remainingMinutes,
    seconds: remainingSeconds,
    milliseconds: diffMs % 1000
  };
}

/**
 * Checks if a date is valid
 * @param date - Date to validate
 * @returns True if date is valid
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Checks if a date is within range
 * @param date - Date to check
 * @param startDate - Start of range
 * @param endDate - End of range
 * @param inclusive - Whether to include boundaries
 * @returns True if date is within range
 */
export function isDateInRange(
  date: Date,
  startDate: Date,
  endDate: Date,
  inclusive: boolean = true
): boolean {
  if (inclusive) {
    return date >= startDate && date <= endDate;
  } else {
    return date > startDate && date < endDate;
  }
}

/**
 * Gets start of day for a date
 * @param date - Base date
 * @returns Start of day
 */
export function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Gets end of day for a date
 * @param date - Base date
 * @returns End of day
 */
export function getEndOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Gets start of week for a date
 * @param date - Base date
 * @returns Start of week
 */
export function getStartOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Gets end of week for a date
 * @param date - Base date
 * @returns End of week
 */
export function getEndOfWeek(date: Date): Date {
  const startOfWeek = getStartOfWeek(date);
  return addTime(startOfWeek, { days: 6, hours: 23, minutes: 59, seconds: 59 });
}

/**
 * Gets start of month for a date
 * @param date - Base date
 * @returns Start of month
 */
export function getStartOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Gets end of month for a date
 * @param date - Base date
 * @returns End of month
 */
export function getEndOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0);
  result.setDate(0); // First day of next month minus 1 = last day of current month
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Gets start of year for a date
 * @param date - Base date
 * @returns Start of year
 */
export function getStartOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Gets end of year for a date
 * @param date - Base date
 * @returns End of year
 */
export function getEndOfYear(date: Date): Date {
  const startOfYear = getStartOfYear(date);
  return addTime(startOfYear, { years: 1, milliseconds: -1 });
}

/**
 * Formats duration in human readable format
 * @param duration - Time duration object
 * @param options - Formatting options
 * @returns Formatted duration string
 */
export function formatDuration(
  duration: TimeDuration,
  options: {
    precision?: number;
    largestUnit?: string;
    showLargestOnly?: boolean;
  } = {}
): string {
  const { precision = 2, largestUnit = 'years', showLargestOnly = false } = options;
  
  if (showLargestOnly) {
    const units = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];
    const index = units.indexOf(largestUnit);
    const relevantDuration = index >= 0 ? duration : duration;
    
    for (let i = 0; i < units.length; i++) {
      if (i < index) continue;
      const unit = units[i] as keyof TimeDuration;
      const value = (relevantDuration as any)[unit];
      if (value > 0) {
        return `${value.toFixed(precision)} ${unit}`;
      }
    }
    return '0';
  }
  
  const parts: string[] = [];
  
  if (duration.years > 0) {
    parts.push(`${duration.years}y`);
  }
  if (duration.months > 0) {
    parts.push(`${duration.months}M`);
  }
  if (duration.days > 0) {
    parts.push(`${duration.days}d`);
  }
  if (duration.hours > 0) {
    parts.push(`${duration.hours}h`);
  }
  if (duration.minutes > 0) {
    parts.push(`${duration.minutes}m`);
  }
  if (duration.seconds > 0 || duration.milliseconds > 0) {
    const totalSeconds = duration.seconds + duration.milliseconds / 1000;
    parts.push(`${totalSeconds.toFixed(precision)}s`);
  }
  
  return parts.join(' ');
}

/**
 * Creates relative time string
 * @param date - Date to format
 * @param baseDate - Base date for comparison
 * @returns Relative time string
 */
export function getRelativeTime(date: Date, baseDate: Date = new Date()): string {
  const diff = timeDifference(baseDate, date);
  const diffMs = date.getTime() - baseDate.getTime();
  
  // Future dates
  if (diffMs > 0) {
    if (diff.years > 0) return `in ${diff.years} years`;
    if (diff.months > 0) return `in ${diff.months} months`;
    if (diff.days > 0) return `in ${diff.days} days`;
    if (diff.hours > 0) return `in ${diff.hours} hours`;
    if (diff.minutes > 0) return `in ${diff.minutes} minutes`;
    return `in ${diff.seconds} seconds`;
  }
  
  // Past dates
  if (diff.years > 0) return `${diff.years} years ago`;
  if (diff.months > 0) return `${diff.months} months ago`;
  if (diff.days > 0) return `${diff.days} days ago`;
  if (diff.hours > 0) return `${diff.hours} hours ago`;
  if (diff.minutes > 0) return `${diff.minutes} minutes ago`;
  return `${diff.seconds} seconds ago`;
}

/**
 * Date validation utilities
 */
export const DateValidation = {
  /**
   * Checks if date is in the future
   */
  isFuture: (date: Date, referenceDate: Date = new Date()) => {
    return date > referenceDate;
  },

  /**
   * Checks if date is in the past
   */
  isPast: (date: Date, referenceDate: Date = new Date()) => {
    return date < referenceDate;
  },

  /**
   * Checks if date is today
   */
  isToday: (date: Date, referenceDate: Date = new Date()) => {
    return date.toDateString() === referenceDate.toDateString();
  },

  /**
   * Checks if date is this year
   */
  isThisYear: (date: Date, referenceDate: Date = new Date()) => {
    return date.getFullYear() === referenceDate.getFullYear();
  },

  /**
   * Checks if date is a weekday (Mon-Fri)
   */
  isWeekday: (date: Date) => {
    const day = date.getDay();
    return day >= 1 && day <= 5;
  },

  /**
   * Checks if date is a weekend (Sat-Sun)
   */
  isWeekend: (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  },

  /**
   * Checks if date is within last N days
   */
  isWithinLastDays: (date: Date, days: number, referenceDate: Date = new Date()) => {
    const cutoffDate = new Date(referenceDate.getTime() - (days * 24 * 60 * 60 * 1000));
    return date >= cutoffDate;
  },

  /**
   * Checks if date is within next N days
   */
  isWithinNextDays: (date: Date, days: number, referenceDate: Date = new Date()) => {
    const cutoffDate = new Date(referenceDate.getTime() + (days * 24 * 60 * 60 * 1000));
    return date <= cutoffDate;
  }
};

/**
 * Date constants and helpers
 */
export const DateConstants = {
  /**
   * Milliseconds per unit
   */
  MILLISECOND: 1,
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,

  /**
   * Common date formats
   */
  FORMATS: {
    ISO8601: 'YYYY-MM-DDTHH:mm:ss.sssZ',
    DATE_ONLY: 'YYYY-MM-DD',
    TIME_ONLY: 'HH:mm:ss',
    US_DATE: 'MM/DD/YYYY',
    EU_DATE: 'DD/MM/YYYY',
    READABLE: 'MMMM DD, YYYY'
  } as const,

  /**
   * Timezone offsets
   */
  TIMEZONES: {
    UTC: 'UTC',
    EST: 'America/New_York',
    PST: 'America/Los_Angeles',
    GMT: 'Europe/London',
    JST: 'Asia/Tokyo'
  } as const
};

/**
 * Date calculation utilities
 */
export const DateCalculations = {
  /**
   * Gets age from birthdate
   */
  getAge: (birthdate: Date, referenceDate: Date = new Date()) => {
    let age = referenceDate.getFullYear() - birthdate.getFullYear();
    const monthDiff = referenceDate.getMonth() - birthdate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthdate.getDate())) {
      age--;
    }
    
    return age;
  },

  /**
   * Gets quarter from date
   */
  getQuarter: (date: Date) => {
    return Math.floor((date.getMonth() + 3) / 3);
  },

  /**
   * Gets week number from date
   */
  getWeekNumber: (date: Date) => {
    const startOfYear = getStartOfYear(date);
    const diff = date.getTime() - startOfYear.getTime();
    const weekNumber = Math.ceil(diff / (7 * DateConstants.DAY));
    return weekNumber;
  },

  /**
   * Checks if leap year
   */
  isLeapYear: (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  },

  /**
   * Gets days in month
   */
  getDaysInMonth: (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Next month
    const firstDay = new Date(year, month, 0);
    const lastDay = new Date(year, month, 0);
    lastDay.setDate(0); // Last day of previous month
    
    return lastDay.getDate();
  }
};