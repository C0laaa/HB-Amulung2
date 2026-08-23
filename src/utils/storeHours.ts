import { StoreConfig } from '../types';

/**
 * Gets current time in Philippine Standard Time (PST, Asia/Manila, UTC+8)
 */
export function getPhilippineCurrentTime(): { hours: number; minutes: number; totalMinutes: number; timeString: string } {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    
    const parts = formatter.formatToParts(new Date());
    let hours = 0;
    let minutes = 0;
    
    for (const part of parts) {
      if (part.type === 'hour') {
        hours = parseInt(part.value, 10);
        if (hours === 24) hours = 0;
      } else if (part.type === 'minute') {
        minutes = parseInt(part.value, 10);
      }
    }

    const displayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const timeString = displayFormatter.format(new Date());

    return {
      hours,
      minutes,
      totalMinutes: hours * 60 + minutes,
      timeString
    };
  } catch (e) {
    // Fallback to local system time if Intl timeZone fails
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return {
      hours,
      minutes,
      totalMinutes: hours * 60 + minutes,
      timeString: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    };
  }
}

/**
 * Parses time strings such as "8:00 AM", "08:00 AM", "3:00 PM", "15:00", "9am", "9:00"
 * into total minutes from midnight (0 - 1439). Returns null if invalid format.
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toLowerCase();

  // Match formats like "8:00 am", "08:30pm", "3 pm", "15:00", "8:00"
  const match = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return null;

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
      currentTimeString: currentPST.timeString
    };
  }

  // 1. Check explicit manual overrides
  if (config.isOpenManualOverride === 'open') {
    return {
      isOpen: true,
      statusText: 'Open Now',
      isManualOverride: true,
      currentTimeString: currentPST.timeString
    };
  }

  if (config.isOpenManualOverride === 'closed') {
    return {
      isOpen: false,
      statusText: 'Closed',
      reason: 'Store is temporarily closed by admin.',
      isManualOverride: true,
      currentTimeString: currentPST.timeString
    };
  }

  // 2. Automated time-based calculation based on Asia/Manila (PST)
  const openMins = parseTimeToMinutes(config.openingTime || '8:00 AM');
  const closeMins = parseTimeToMinutes(config.closingTime || '3:00 PM');

  if (openMins === null || closeMins === null) {
    // If parse failed, default to open
    return {
      isOpen: true,
      statusText: 'Open Now',
      isManualOverride: false,
      currentTimeString: currentPST.timeString
    };
  }

  const currentMins = currentPST.totalMinutes;

  let isOpen = false;
  if (openMins <= closeMins) {
    // Standard schedule, e.g. 8:00 AM (480) to 3:00 PM (900)
    // At 4:00 PM (960), 960 < 900 is false -> Closed
    isOpen = currentMins >= openMins && currentMins < closeMins;
  } else {
    // Overnight schedule, e.g. 6:00 PM to 2:00 AM
    isOpen = currentMins >= openMins || currentMins < closeMins;
  }

  if (isOpen) {
    return {
      isOpen: true,
      statusText: 'Open Now',
      isManualOverride: false,
      currentTimeString: currentPST.timeString
    };
  } else {
    return {
      isOpen: false,
      statusText: 'Closed',
      reason: `Orders are closed outside store hours (${config.openingTime || '8:00 AM'} – ${config.closingTime || '3:00 PM'}).`,
      isManualOverride: false,
      currentTimeString: currentPST.timeString
    };
  }
}
