/* Permission only on a tap. Pair privately through Driver; no subscription upload endpoint. */
'use strict';
(async function notifications() {
  const enable = document.getElementById('push-enable'), setup = document.getElementById('push-setup');
  const panel = document.getElementById('push-pair'), code = document.getElementById('push-code');
  const status = document.getElementById('push-status');
  if (!enable || !('serviceWorker' in navigator)) return;
  let registration, key, subscription;
  const message = text => { status.textContent = text; };
  function pairing() {
    if (!subscription) return;
    const bytes = new Uint8Array(16); crypto.getRandomValues(bytes);
    const nonce = [...bytes].map(x => x.toString(16).padStart(2, '0')).join('');
    const s = subscription.toJSON();
    const data = JSON.stringify({v: 1, nonce, subscription: {endpoint: s.endpoint, keys: s.keys}});
    code.value = 'MYTESLA1.' + btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    panel.hidden = false;
    message('Copy this private code and paste it into your chat with Driver. Each device needs its own code.');
  }
  try {
    registration = await navigator.serviceWorker.register('/sw.js', {scope: '/', updateViaCache: 'none'});
    registration = await navigator.serviceWorker.ready;
    if (!('PushManager' in window) || !('Notification' in window)) {
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      if (ios) message('For notifications, open MyTesla from your Home Screen. If needed, add it using Safari’s Share menu.');
      return;
    }
    const response = await fetch('/data/push-config.json', {cache: 'no-store'});
    if (!response.ok) throw new Error('configuration');
    key = new Uint8Array((await response.json()).applicationServerKey);
    subscription = await registration.pushManager.getSubscription();
    if (subscription && Notification.permission === 'granted') {
      setup.hidden = false; // Enable stays hidden; setup lets you recover a lost pairing code.
    } else if (Notification.permission === 'denied') {
      message('Notifications are off. You can allow MyTesla in your browser or device notification settings.');
      return;
    } else { enable.hidden = false; }
  } catch (_) { message('Notification setup is unavailable. Please try again later.'); return; }
  enable.addEventListener('click', async () => {
    enable.disabled = true;
    try {
      // Call directly from this gesture, before awaiting anything else (required on iPhone).
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { message('Notifications weren’t enabled. You can change this in notification settings.'); return; }
      subscription = await registration.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: key});
      enable.hidden = true; setup.hidden = false; pairing();
    } catch (_) { message('Could not enable notifications. Please try again.'); }
    finally { enable.disabled = false; }
  });
  setup.addEventListener('click', pairing);
  document.getElementById('push-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(code.value); message('Copied. Paste the code into your private chat with Driver.'); }
    catch (_) { code.focus(); code.select(); message('Select and copy the code, then paste it into your private chat with Driver.'); }
  });
  document.getElementById('push-done').addEventListener('click', () => {
    panel.hidden = true; code.value = ''; message('Driver must import your code before this device can receive notifications.');
  });
})();
