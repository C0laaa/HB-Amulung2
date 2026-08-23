import { StoreConfig } from '../types';

/**
 * Gets current time in Philippine Standard Time (PST, Asia/Manila, UTC+8).
 * Asia/Manila is strictly UTC+8 year-round with no daylight saving time (DST).
 */
export function getPhilippineCurrentTime(): {
  hours: number;
  minutes: number;
  totalMinutes: number;
  timeString: string;
} {
  const now = new Date();
  // UTC time in milliseconds + 8 hours for Philippine Standard Time
  const utcTimestamp = now.getTime() + now.getTimezoneOffset() * 60000;
  const manilaTimestamp = utcTimestamp + 8 * 3600 * 1000;
  const manilaDate = new Date(manilaTimestamp);

  const hours = manilaDate.getHours(); // 0 - 23 in Manila time
  const minutes = manilaDate.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Format display string, e.g. "4:15 PM"
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const period = hours >= 12 ? 'PM' : 'AM';
  const timeString = `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;

  return {
    hours,
    minutes,
    totalMinutes,
    timeString,
  };
}

/**
 * Parses time strings such as "8:00 AM", "08:00 AM", "2:00 PM", "14:00", "2pm", "2:00"
 * into total minutes from midnight (0 - 1439).
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  // Normalize all spaces (narrow no-break space \u202F, non-breaking \u00A0), dots, etc.
  const clean = timeStr
    .replace(/[\u202F\u00A0\u2000-\u200B\s]+/g, ' ')
    .replace(/\./g, '')
    .trim()
    .toLowerCase();

  // Match formats like "8:00 am", "02:00 pm", "2:00pm", "2 pm", "14:00", "8:00"
  const match = clean.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const period = match[3];

    if (isNaN(hours) || isNaN(minutes) || minutes < 0 || minutes > 59) {
      return null;
    }

    if (period === 'pm' && hours < 12) {
      hours += 12;
    } else if (period === 'am' && hours === 12) {
      hours = 0;
    }

    if (hours < 0 || hours > 23) return null;
    return hours * 60 + minutes;
  }

  // Fallback relaxed regex parser
  const relaxed = clean.match(/(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?/);
  if (relaxed) {
    let hours = parseInt(relaxed[1], 10);
    const minutes = relaxed[2] ? parseInt(relaxed[2], 10) : 0;
    const period = relaxed[3];

    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return hours * 60 + minutes;
    }
  }

  return null;
}

/**
 * Checks if the store is currently open based on Philippine Standard Time (PST) and StoreConfig.
 */
export function isStoreCurrentlyOpen(config?: StoreConfig): {
  isOpen: boolean;
  statusText: string;
  reason?: string;
  isManualOverride: boolean;
  currentTimeString: string;
} {
  const currentPST = getPhilippineCurrentTime();

  if (!config) {
    return {
      isOpen: true,
      statusText: 'Open Now',
      isManualOverride: false,
      currentTimeString: currentPST.timeString,
    };
  }

  // 1. Explicit manual overrides
  if (config.isOpenManualOverride === 'open') {
    return {
      isOpen: true,
      statusText: 'Open Now',
      isManualOverride: true,
      currentTimeString: currentPST.timeString,
    };
  }

  if (config.isOpenManualOverride === 'closed') {
    return {
      isOpen: false,
      statusText: 'Closed',
      reason: 'Store is temporarily closed by admin.',
      isManualOverride: true,
      currentTimeString: currentPST.timeString,
    };
  }

  // 2. Automated time-based calculation (Philippine Time UTC+8)
  const openMins = parseTimeToMinutes(config.openingTime || '8:00 AM') ?? 480; // 8:00 AM default
  const closeMins = parseTimeToMinutes(config.closingTime || '2:00 PM') ?? 840; // 2:00 PM default
  const currentMins = currentPST.totalMinutes;

  let isOpen = false;
  if (openMins <= closeMins) {
    // Standard schedule (e.g. 8:00 AM [480] to 2:00 PM [840])
    // At 4:00 PM [960], 960 >= 480 is true, but 960 < 840 is false -> isOpen = false
    isOpen = currentMins >= openMins && currentMins < closeMins;
  } else {
    // Overnight schedule (e.g. 6:00 PM to 2:00 AM)
    isOpen = currentMins >= openMins || currentMins < closeMins;
  }

  if (isOpen) {
    return {
      isOpen: true,
      statusText: 'Open Now',
      isManualOverride: false,
      currentTimeString: currentPST.timeString,
    };
  } else {
    return {
      isOpen: false,
      statusText: 'Closed',
      reason: `Orders are closed outside store hours (${config.openingTime || '8:00 AM'} – ${config.closingTime || '2:00 PM'}). Current time: ${currentPST.timeString} PST.`,
      isManualOverride: false,
      currentTimeString: currentPST.timeString,
    };
  }
}
