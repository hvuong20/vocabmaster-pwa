# VocabMaster — Project Overview

**VocabMaster** là PWA học từ vựng tiếng Anh với 4 cấp độ CEFR: B2, C1, C2, IELTS.  
Cài lên iPhone qua Safari → Add to Home Screen. Không framework, không build tool.

## Tech Stack

| Layer | Công nghệ |
|---|---|
| Frontend | HTML5 + CSS3 + Vanilla JS (ES6+) |
| Storage | localStorage — không backend |
| PWA | Service Worker + Web App Manifest |
| TTS | Web Speech API |
| Push Notification | web-push (VAPID) + Node.js push server |
| Hosting (PWA) | GitHub Pages — https://hvuong20.github.io/vocabmaster-pwa/ |
| Hosting (Push Server) | Render.com — https://vocabmaster-push.onrender.com |

> **Triết lý bất biến:** Vanilla JS, không npm, không bundler trong PWA. Push server là Node.js độc lập trong thư mục `push-server/`.

## File Structure

```
English_Learning_PWA/
├── index.html              # SPA shell — tất cả screens trong 1 file
├── manifest.json           # PWA manifest (start_url: ./index.html)
├── sw.js                   # Service Worker (CACHE_NAME: vocabmaster-v7)
├── render.yaml             # Render.com IaC config cho push server
├── CLAUDE.md               # Index → .claude/rules/
├── css/
│   └── style.css           # Design system đầy đủ
├── js/
│   ├── data.js             # B2 (TOPICS — 18 topics, 330 words)
│   ├── data-c1.js          # C1 (TOPICS_C1 — 23 topics, 429 words)
│   ├── data-c2.js          # C2 (TOPICS_C2 — 15 topics, 378 words)
│   ├── data-ielts.js       # IELTS (TOPICS_IELTS — 10 topics, 155 words)
│   └── app.js              # App logic (Store, Flashcard, Quiz, NotificationScheduler...)
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── push-server/
    ├── server.js           # Express + web-push + node-cron
    ├── package.json
    ├── generate-keys.js    # Chạy 1 lần để tạo VAPID keys
    └── .env.example
```

## Deployment

| | URL | Deploy |
|---|---|---|
| PWA | https://hvuong20.github.io/vocabmaster-pwa/ | Auto khi push master |
| Push Server | https://vocabmaster-push.onrender.com | Auto khi push master |

**Local dev:**
```bash
npx serve . --listen 8080
# Mở: http://localhost:8080
```

## Out of Scope

- Native iOS/Android app
- User accounts / backend database
- CMS cho vocabulary (sửa trực tiếp trong data files)
- Multi-device sync tiến trình học
