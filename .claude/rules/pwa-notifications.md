# PWA & Notifications

## Service Worker (sw.js)

**Cache name hiện tại:** `vocabmaster-v7`  
**Rule:** Bump version mỗi khi thay đổi bất kỳ file nào trong `ASSETS` array — bắt buộc để iOS reload.

### SW Events

| Event | Xử lý |
|---|---|
| `install` | Cache tất cả ASSETS, `skipWaiting()` |
| `activate` | Xóa cache cũ, `clients.claim()` |
| `fetch` | Cache-first strategy |
| `push` | Nhận từ push server → `showNotification()` |
| `notificationclick` | Focus tab hiện có hoặc `openWindow('/')` |
| `periodicsync` | Chrome Android — gọi `showScheduledWord()` (đọc từ NOTIF_CACHE) |

### ASSETS Array (phải dùng relative paths)

```js
const ASSETS = [
  './', './index.html', './css/style.css',
  './js/data.js', './js/data-c1.js', './js/data-c2.js',
  './js/data-ielts.js', './js/app.js', './manifest.json'
];
```

> Tại sao relative (`./`): App host trên GitHub Pages tại `/vocabmaster-pwa/` — absolute paths như `/index.html` sẽ resolve sai domain root.

## Push Notification Architecture

### iPhone (iOS 16.4+)
```
User enables reminder → app fetches VAPID key từ /config
→ browser calls pushManager.subscribe()
→ app POSTs subscription + settings lên /subscribe
→ push-server cron job gửi notification mỗi X phút
→ iOS nhận notification system-wide → Xiaomi Watch mirrors qua Xiaomi Wear app
```

### Android (Chrome)
```
Giống iPhone nhưng có thêm: Periodic Background Sync
→ SW periodicsync event fires khi app đóng
→ đọc từ NOTIF_CACHE ('/notif-data') → showScheduledWord()
```

## Push Server (push-server/server.js)

**URL:** https://vocabmaster-push.onrender.com  
**Deploy:** Render.com free tier — auto deploy khi push master

### Endpoints

| Method | Path | Mô tả |
|---|---|---|
| GET | `/` | Status JSON |
| GET | `/health` | Health check (dùng cho self-ping) |
| GET | `/config` | Trả về `vapidPublicKey` |
| POST | `/subscribe` | Đăng ký hoặc update subscription + settings |
| POST | `/unsubscribe` | Xóa subscription |
| POST | `/preview` | Gửi ngay 1 từ test (nút "Xem thử từ ngay") |

### Settings object (lưu trong subscriptions.json)

```js
{
  intervalMinutes: 30,    // 15 | 30 | 60 | 120
  startHour: 8,           // giờ bắt đầu gửi (0–23)
  endHour: 22,            // giờ kết thúc gửi (0–23)
  level: 'B2',            // 'B2' | 'C1' | 'C2' | 'IELTS'
  topicId: 'all',         // topic ID hoặc 'all'
  wordIndex: 0            // vị trí từ tiếp theo trong pool
}
```

### Self-ping (tránh Render free tier sleep)

```js
// Ping mỗi 10 phút qua https.get() (built-in Node — không dùng fetch())
// RENDER_EXTERNAL_URL env var phải được set trong Render dashboard
setInterval(() => {
  https.get(RENDER_URL + '/health', ...);
}, 10 * 60 * 1000);
```

### Subscription storage

File: `push-server/subscriptions.json` — tự tạo khi có subscription đầu tiên.  
Render free tier có thể xóa file này khi restart (ephemeral filesystem).  
User phải toggle off/on trong app để re-subscribe sau khi server restart.

## VAPID Keys

- **Không commit vào git** — lưu trong Render.com Environment Variables
- Biến: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`, `RENDER_EXTERNAL_URL`
- Tham khảo: `push-server/.env.example` (template — không có giá trị thật)
- Tạo keys một lần: `node push-server/generate-keys.js`

## NotificationScheduler (app.js)

### Settings localStorage key: `vm_notif_settings`

```js
{
  enabled: false,
  intervalMinutes: 30,
  startHour: 8,
  endHour: 22,
  level: 'B2',
  topicId: 'all',
  wordIndex: 0,
  serverUrl: 'https://vocabmaster-push.onrender.com',
  pushSubscription: { endpoint, keys } | null
}
```

### Luồng khi user bật toggle

1. `onToggle(true)` → check `Notification.permission`
2. Nếu `serverUrl` có giá trị → server mode (iPhone)
   - Fetch VAPID key từ `/config`
   - `pushManager.subscribe()`  
   - POST `/subscribe` với settings
3. Nếu không có serverUrl → local mode (Android)
   - Lên lịch `setTimeout` theo interval + active hours
   - Register Periodic Background Sync nếu browser hỗ trợ

### `init()` — chạy khi app mở

Nếu đã có subscription trong localStorage → re-sync settings lên server.  
Đảm bảo server biết settings mới nhất sau khi user thay đổi và server restart.

## Reminder Screen (index.html — screen-reminder)

- **Server URL card** — input lưu URL Render.com (chỉ cần cho iPhone)
- **Toggle** — `notif-toggle` checkbox
- **Interval chips** — 15p / 30p / 1h / 2h
- **Time range** — `notif-start` / `notif-end` (type="time")
- **Level chips** — B2 / C1 / C2 / IELTS
- **Topic select** — `notif-topic` dropdown (populated từ active level topics)
- **Preview button** — POST `/preview` với endpoint hiện tại
