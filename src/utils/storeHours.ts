import { StoreConfig } from '../types';

/**
 * Parses time strings such as "9:00 AM", "09:00 AM", "9:30 PM", "21:00", "9am", "9:00"
 * into total minutes from midnight (0 - 1439). Returns null if invalid format.
 */
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim().toLowerCase();

  // Match formats like "9:00 am", "09:30pm", "9 am", "14:30", "9:00"
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
 * Checks if the store is currently open based on current local time and StoreConfig.
 */
export function isStoreCurrentlyOpen(config?: StoreConfig): {
  isOpen: boolean;
  statusText: string;
  reason?: string;
  isManualOverride: boolean;
} {
  if (!config) {
    return {
      isOpen: true,
      statusText: 'Open Now',
      isManualOverride: false,
    };
  }

  // 1. Check explicit manual overrides
  if (config.isOpenManualOverride === 'open') {
    return {
      isOpen: true,
      statusText: 'Open Now',
      isManualOverride: true,
    };
  }

  if (config.isOpenManualOverride === 'closed') {
    return {
      isOpen: false,
      statusText: 'Closed',
      reason: 'Store is temporarily closed by admin.',
      isManualOverride: true,
    };
  }

  // 2. Automated time-based calculation
  const openMins = parseTimeToMinutes(config.openingTime || '9:00 AM');
  const closeMins = parseTimeToMinutes(config.closingTime || '9:00 PM');

  if (openMins === null || closeMins === null) {
    // If parse failed, default to open
    return {
      isOpen: true,
      statusText: 'Open Now',
      isManualOverride: false,
    };
  }

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  let isOpen = false;
  if (openMins <= closeMins) {
    // Standard schedule, e.g. 9:00 AM (540) to 9:00 PM (1260)
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
    };
  } else {
    return {
      isOpen: false,
      statusText: 'Closed',
      reason: `Orders are closed outside store hours (${config.openingTime} – ${config.closingTime}).`,
      isManualOverride: false,
    };
  }
}
