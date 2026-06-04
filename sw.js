// sw.js - Service Worker for PWA Web Push Notifications
const ICON_URL = 'images/logo.png';

// 1. รับ Push Notification จากเซิร์ฟเวอร์
self.addEventListener('push', event => {
    let data = { title: 'แจ้งเตือนร้านแม่น้อย', body: 'มีข่าวสารใหม่จากร้านแม่น้อย!', url: 'index.html' };
    try {
        data = event.data.json();
    } catch (e) {
        if (event.data) data.body = event.data.text();
    }

    const options = {
        body: data.body || 'มีข้อความใหม่',
        icon: data.icon || ICON_URL,
        badge: ICON_URL,
        tag: data.tag || 'pwa-general',
        data: { url: data.url || 'index.html' },
        vibrate: [200, 100, 200],
        requireInteraction: false,
        actions: [
            { action: 'open', title: '📱 เปิดแอป' },
            { action: 'close', title: '✕ ปิด' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'แจ้งเตือน', options)
    );
});

// 2. เมื่อกดเปิดการแจ้งเตือน
self.addEventListener('notificationclick', event => {
    event.notification.close();
    if (event.action === 'close') return;

    let targetPath = (event.notification.data && event.notification.data.url)
        ? event.notification.data.url
        : 'index.html';

    if (targetPath.startsWith('/')) {
        targetPath = targetPath.slice(1);
    }

    const swUrl = self.location.href;
    const baseDir = swUrl.substring(0, swUrl.lastIndexOf('/') + 1);
    let urlToOpen = new URL(targetPath, baseDir).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // ค้นหาว่าหน้าต่างเว็บหลักร้านค้าถูกเปิดทิ้งไว้แล้วหรือไม่
            for (const client of clientList) {
                if (client.url.startsWith(baseDir) && 'focus' in client) {
                    return client.focus();
                }
            }
            // ถ้าไม่เปิด ให้เปิดหน้าต่างใหม่
            if (clients.openWindow) return clients.openWindow(urlToOpen);
        })
    );
});
