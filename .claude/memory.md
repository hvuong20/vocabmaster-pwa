# VocabMaster — Project Memory

## Trạng thái hiện tại (cập nhật lần cuối: 2026-04-28)

### Deployment
- **PWA:** https://hvuong20.github.io/vocabmaster-pwa/ (GitHub Pages, auto deploy)
- **Push Server:** https://vocabmaster-push.onrender.com (Render.com free tier)
- **GitHub Repo:** https://github.com/hvuong20/vocabmaster-pwa (branch: master)

### Versions
- Service Worker cache: `vocabmaster-v7`
- IELTS: 10 topics (bao gồm `ielts_others` mới thêm)
- Total vocabulary: ~1,292 words / 66 topics

### VAPID Keys
- Không lưu ở đây — chỉ có trong Render.com Environment Variables
- Biến: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`, `RENDER_EXTERNAL_URL`

## Tính năng đã implement

- [x] Flashcard với 3D flip + TTS
- [x] Quiz (4 lựa chọn, 10 câu, score tracking)
- [x] Progress tracking (localStorage, streak)
- [x] Level switching: B2 / C1 / C2 / IELTS
- [x] Word lookup screen (tra từ)
- [x] Reminder screen với push notifications
- [x] Server-side push (Node.js + web-push) cho iPhone
- [x] Self-ping để Render free tier không sleep
- [x] Periodic Background Sync cho Android Chrome
- [x] Xiaomi Watch mirroring (qua iPhone + Xiaomi Wear app)

## Quyết định kiến trúc đã thực hiện

### Tại sao push server riêng biệt?
iOS Safari kills background JavaScript — app không thể tự nhắc nhở khi bị đóng. Cần server-side push qua Apple APNs để notification hoạt động system-wide trên iPhone (iOS 16.4+).

### Tại sao relative paths trong SW ASSETS?
App host tại `/vocabmaster-pwa/` trên GitHub Pages. Absolute path `/index.html` resolve về domain root, sai. Phải dùng `./index.html`.

### Tại sao https.get() thay vì fetch() cho self-ping?
`fetch()` unreliable trên một số Node.js versions trên Render. `https.get()` là built-in, đáng tin cậy hơn.

### Tại sao bump CACHE_NAME khi update vocabulary?
iOS Safari cache Service Worker aggressively. Không bump version → iPhone tiếp tục serve cached old files → user không thấy changes.

## Issues đã fix

1. `dotenv` missing trong package.json → added `"dotenv": "^16.4.5"`
2. No root GET route → added `app.get('/')` trả JSON status
3. SW absolute paths → changed tất cả ASSETS sang relative `./`
4. SW registration: `/sw.js` → `./sw.js`
5. Manifest `start_url`: `/index.html` → `./index.html`
6. Self-ping: `fetch()` → `https.get()`, 14min → 10min interval
7. IELTS missing từ reminder chips → added chip button cho IELTS
8. `ielts_others` topic missing trên iPhone → bumped cache `v6` → `v7`
9. Duplicate word "albeit" → replaced với "profoundly"
