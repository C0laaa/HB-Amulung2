// Honey Bakes Cafe - Push & Web Notifications Utility

let swRegistration: ServiceWorkerRegistration | null = null;

// Initialize and register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('Service Worker is not supported in this browser environment.');
    return null;
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    swRegistration = reg;
    console.log('Service Worker registered successfully with scope:', reg.scope);
    return reg;
  } catch (error) {
    console.warn('Service Worker registration failed:', error);
    return null;
  }
}

// Get current notification permission state
export function getNotificationPermissionState(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// Request Notification Permission from User
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    alert('Web Notifications are not supported in this browser. Please use Chrome, Edge, Safari (iOS 16.4+ installed to Home Screen), or Firefox.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Also register SW if not already done
      await registerServiceWorker();
      return true;
    } else if (permission === 'denied') {
      console.warn('Notification permission was denied by the user.');
      return false;
    }
    return false;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return false;
  }
}

// Play distinctive kitchen bell chime using Web Audio API
export function playAlertChime() {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const frequencies = [1046.5, 1318.5, 1567.98]; // C6, E6, G6
    const strokeTimes = [0, 0.22, 0.48];

    strokeTimes.forEach((delay, idx) => {
      const freq = frequencies[idx % frequencies.length];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.8, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.65);
    });
  } catch (err) {
    console.warn('Audio chime playback notice:', err);
  }
}

export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  url?: string;
  requireInteraction?: boolean;
}

// Send local / push notification via Service Worker or Web Notification API
export async function sendWebPushNotification({
  title,
  body,
  icon = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=192&h=192',
  tag,
  url = '/',
  requireInteraction = true
}: PushNotificationOptions): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  // Play audio alert
  playAlertChime();

  // Try via Service Worker registration first (works when tab is in background or phone screen is locked/sleeping)
  if ('serviceWorker' in navigator) {
    try {
      const reg = swRegistration || await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body,
          icon,
          badge: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=96&h=96',
          tag: tag || 'honey-bakes-' + Date.now(),
          renotify: true,
          requireInteraction,
          vibrate: [300, 150, 300, 150, 300],
          data: { url, timestamp: Date.now() },
          actions: [
            { action: 'open', title: '👀 View Order' },
            { action: 'close', title: 'Dismiss' }
          ]
        } as any);
        return true;
      }
    } catch (e) {
      console.warn('SW showNotification fallback:', e);
    }
  }

  // Fallback to standard Notification API
  try {
    const notif = new Notification(title, {
      body,
      icon,
      tag: tag || 'honey-bakes-' + Date.now(),
      requireInteraction
    });

    notif.onclick = () => {
      window.focus();
      notif.close();
    };
    return true;
  } catch (err) {
    console.warn('Notification API fallback failed:', err);
    return false;
  }
}

// Convenience helper to trigger New Order Alert for Admin
export function notifyAdminNewOrder(orderId: string, customerName: string, totalPrice: number, serviceType: string) {
  sendWebPushNotification({
    title: `🔔 New Order Received! (#${orderId})`,
    body: `${customerName} placed a ${serviceType} order for ₱${totalPrice.toLocaleString()}. Tap to view ticket.`,
    tag: `admin-order-${orderId}`,
    url: '/?admin=true',
    requireInteraction: true
  });
}

// Convenience helper to trigger Customer Order Status update
export function notifyCustomerOrderStatus(orderId: string, status: string) {
  let statusMessage = `Your order #${orderId} status is now: ${status}`;
  if (status === 'Preparing') {
    statusMessage = `👩‍🍳 We are now preparing your order #${orderId}!`;
  } else if (status === 'Ready') {
    statusMessage = `🎉 Order #${orderId} is READY for pickup / dispatch!`;
  } else if (status === 'Delivered' || status === 'Completed') {
    statusMessage = `✨ Order #${orderId} has been completed. Enjoy your treats!`;
  } else if (status === 'Cancelled') {
    statusMessage = `Order #${orderId} has been cancelled.`;
  }

  sendWebPushNotification({
    title: `Honey Bakes Cafe Order Update`,
    body: statusMessage,
    tag: `cust-order-${orderId}-${status}`,
    url: '/',
    requireInteraction: true
  });
}
