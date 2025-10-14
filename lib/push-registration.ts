// lib/push-registration.ts

export async function registerPushNotifications() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported');
    return;
  }

  // --- IMPROVEMENT: Check for the key upfront ---
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    const error = new Error('VAPID public key is not defined. Please check your .env.local file and ensure NEXT_PUBLIC_VAPID_PUBLIC_KEY is set.');
    console.error(error.message);
    // You could also show a toast notification to the user here
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // Now we can safely use the variable
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // Safely get the keys with null checks
    const p256dhKey = subscription.getKey('p256dh');
    const authKey = subscription.getKey('auth');
    
    if (!p256dhKey || !authKey) {
      throw new Error('Failed to get subscription keys');
    }

    await fetch(`${apiUrl}/api/notifications/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(p256dhKey),
          auth: arrayBufferToBase64(authKey),
        },
      }),
    });

    console.log('Push notifications registered');
  } catch (error) {
    console.error('Push registration error:', error);
  }
}

// This function is now only called after we've confirmed the key exists
function urlBase64ToUint8Array(base64String: string) {
  if (!base64String) {
    // This error should now be impossible to hit, but it's good practice to keep it
    throw new Error('Base64 string is required');
  }
  
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  if (!buffer) {
    throw new Error('ArrayBuffer is required');
  }
  
  const bytes = new Uint8Array(buffer);
  
  if (!bytes || bytes.length === 0) {
    throw new Error('ArrayBuffer is empty');
  }
  
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}