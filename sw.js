/* Push only. Never cache car data or intercept navigation. */
'use strict';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
function eventTitle(id) {
  if (id.startsWith('rollout:')) return 'New build';
  if (id.startsWith('car:')) return 'Your update';
  if (id.startsWith('odds:')) return 'Update odds';
  if (id.includes(':breakeven:')) return 'Gas break-even';
  if (id.includes(':plan_value:')) return 'Plan value';
  if (id.startsWith('summary:')) return 'Monthly summary';
  return 'Update';
}
const TITLES = new Set(['New build', 'Your update', 'Update odds', 'Gas break-even', 'Plan value', 'Monthly summary', 'Update']);
self.addEventListener('push', event => {
  let message = {};
  try { message = event.data ? event.data.json() : {}; } catch (_) {}
  const id = typeof message.id === 'string' ? message.id : '';
  const title = TITLES.has(message.title) ? message.title : eventTitle(id);
  event.waitUntil(self.registration.showNotification(title, {
    body: typeof message.body === 'string' ? message.body.slice(0, 240) : 'Your Tesla rings have an update.',
    icon: '/assets/icon-192.png', badge: '/assets/icon-192.png',
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
