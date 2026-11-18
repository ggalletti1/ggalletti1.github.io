/* Self-unregistering stub (2026-11-17). Replaces the pre-move root push worker (scope /) after Giovanni re-paired at /mytesla/.
   No push or fetch handlers. Delete this file on or after 2026-12-17 (see ~/tesla/README_SETUP.md). */
'use strict';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.registration.unregister()));
