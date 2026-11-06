/* Push only. Never cache car data or intercept navigation. */
'use strict';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('push', event => {
  let message = {};
  try { message = event.data ? event.data.json() : {}; } catch (_) {}
  event.waitUntil(self.registration.showNotification('MyTesla', {
    body: typeof message.body === 'string' ? message.body.slice(0, 240) : 'Your Tesla rings have an update.',
    icon: '/assets/icon-ecg-192.png', badge: '/assets/icon-ecg-192.png',
    tag: typeof message.id === 'string' ? message.id.slice(0, 140) : 'mytesla-update',
    renotify: false, data: {url: '/'}
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = new URL('/', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(async clients => {
    for (const client of clients) {
      if (new URL(client.url).origin === self.location.origin) {
        await client.navigate(url); return client.focus();
      }
    }
    return self.clients.openWindow(url);
  }));
});
