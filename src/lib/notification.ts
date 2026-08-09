// Web Audio API Sound Synthesizer & Browser Notification Manager for Cafe Orders
// Compatible with Chrome, Safari, Firefox, and mobile browsers

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

// Global user interaction listener to unlock AudioContext on first touch, click or keydown
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}

export function testNotificationAndSound() {
  requestNotificationPermission();
  playNotificationSound('new_order');
  sendDesktopNotification(
    'Honey Bakes Cafe — Notifications Enabled! 🛎️',
    'You will now receive order alerts and sound chimes when new orders arrive.'
  );
}

export function playNotificationSound(type: 'new_order' | 'ready' | 'delivery' | 'completed') {
  try {
    const ctx = getAudioContext();
    
    // Ensure context is running
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume()
          .then(() => playSynthesizedSound(ctx, type))
          .catch(() => playFallbackSound(type));
      } else {
        playSynthesizedSound(ctx, type);
      }
    } else {
      playFallbackSound(type);
    }
  } catch (err) {
    console.warn('Could not play notification sound via Web Audio:', err);
    playFallbackSound(type);
  }
}

function playSynthesizedSound(ctx: AudioContext, type: 'new_order' | 'ready' | 'delivery' | 'completed') {
  const now = ctx.currentTime;

  if (type === 'new_order') {
    // High bright kitchen bell chime: 2 crisp loud tones (D5 -> A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.linearRampToValueAtTime(0.6, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15); // A5
    gain2.gain.setValueAtTime(0.01, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.7, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.85);
  } else if (type === 'ready') {
    // Cheerful 3-note celebration chime (C5 -> E5 -> G5)
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const startTime = now + i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.linearRampToValueAtTime(0.5, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.55);
    });
  } else if (type === 'delivery') {
    // Scooter / double beep tone (650Hz -> 850Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(650, now);
    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.linearRampToValueAtTime(0.25, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(850, now + 0.15);
    gain2.gain.setValueAtTime(0.01, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.17);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.45);
  } else if (type === 'completed') {
    // Soft gentle finish chime (G5 -> C6)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(783.99, now);
    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.linearRampToValueAtTime(0.4, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, now + 0.12);
    gain2.gain.setValueAtTime(0.01, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.5, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.65);
  }
}

// Fallback audio tone
function playFallbackSound(type: string) {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch (e) {
    // Silent catch
  }
}

// Request permission for Web Browser Desktop Pop-up Notifications
export function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch((err) => {
        console.warn('Notification permission request denied or blocked:', err);
      });
    }
  }
}

// Send OS / Browser Desktop Notification (Works when tab is in background or minimized)
export function sendDesktopNotification(title: string, body: string, icon?: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.log('Desktop Notifications not supported in this environment');
    return;
  }

  // Handle Chrome/Safari permission status
  if (Notification.permission === 'granted') {
    try {
      // 1. Try standard Web Notification
      const notif = new Notification(title, {
        body,
        icon: icon || '/icon.png',
        tag: 'honey-bakes-cafe-order'
      });

      notif.onclick = () => {
        try {
          window.focus();
        } catch (e) {}
        notif.close();
      };
    } catch (err) {
      console.warn('Standard Notification constructor failed (common in sandboxed iframes or Chrome/Safari without ServiceWorker):', err);
      
      // 2. Try Service Worker Notification if registered
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((registration) => {
            registration.showNotification(title, {
              body,
              icon: icon || '/icon.png',
              tag: 'honey-bakes-cafe-order'
            });
          })
          .catch((swErr) => {
            console.warn('ServiceWorker showNotification also unavailable:', swErr);
          });
      }
    }
  } else if (Notification.permission === 'default') {
    requestNotificationPermission();
  }
}

