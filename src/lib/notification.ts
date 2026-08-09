// Browser & Mobile OS System Pop-Up Notification Manager for Cafe Orders
// Compatible with Chrome (Android/Desktop), Safari (iOS/macOS), Firefox, and Edge

// Request permission for Web Browser Pop-up Notifications in System Status Bar
export function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch((err) => {
        console.warn('Notification permission request denied or blocked:', err);
      });
    }
  }
}

// Trigger gentle phone vibration when pop-up notification fires
export function triggerMobileVibration() {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch (e) {
      // Ignore vibration errors
    }
  }
}

// Send Native OS / System Notification Bar Pop-Up (Phone Notification Bar & Desktop Pop-ups)
export function sendDesktopNotification(title: string, body: string, icon?: string) {
  if (typeof window === 'undefined') return;

  // Trigger mobile vibration
  triggerMobileVibration();

  if (!('Notification' in window)) {
    console.log('Notifications not supported in this browser window.');
    return;
  }

  const notifIcon = icon || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=192&h=192';

  // Check permission status
  if (Notification.permission === 'granted') {
    // 1. Primary approach for Mobile Android Chrome: Service Worker showNotification
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.showNotification(title, {
            body,
            icon: notifIcon,
            badge: notifIcon,
            tag: 'honey-bakes-cafe-' + Date.now(),
            vibrate: [200, 100, 200],
            requireInteraction: false
          } as any);
        })
        .catch(() => {
          // Fallback to standard Notification constructor
          tryStandardNotification(title, body, notifIcon);
        });
    } else {
      tryStandardNotification(title, body, notifIcon);
    }
  } else if (Notification.permission === 'default') {
    // Request permission if not yet decided
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        sendDesktopNotification(title, body, icon);
      }
    });
  }
}

function tryStandardNotification(title: string, body: string, icon: string) {
  try {
    const notif = new Notification(title, {
      body,
      icon,
      tag: 'honey-bakes-cafe-' + Date.now()
    });

    notif.onclick = () => {
      try {
        window.focus();
      } catch (e) {}
      notif.close();
    };
  } catch (err) {
    console.warn('Standard notification constructor failed:', err);
  }
}

// Helper test trigger for system notification bar
export function testNotificationAndSound() {
  requestNotificationPermission();
  sendDesktopNotification(
    'Honey Bakes Cafe Alert 🛎️',
    'System Pop-up Notification bar alert is working successfully!'
  );
}

// Deprecated empty sound trigger kept for backward compatibility if called
export function playNotificationSound(_type?: string) {
  // Sound removed per user request
}
