# Coding Standards

## Triết lý bất biến

- **Vanilla JS** — không React, không Vue, không framework
- **Không npm trong PWA** — không `node_modules`, không bundler trong thư mục gốc
- **Push server** là Node.js riêng biệt trong `push-server/` với `package.json` riêng
- Mở thẳng `index.html` trên browser — không cần build step

## JavaScript

- Dùng `const` / `let`, tuyệt đối không dùng `var`
- Arrow functions cho callbacks: `arr.map(x => x.word)`
- Template literals cho HTML generation: `` `<div class="${cls}">${val}</div>` ``
- **Window globals** để share giữa các script:
  - `window.NotificationScheduler` — quản lý push notifications
  - `window.Store` — localStorage CRUD
  - `window.Flashcard`, `window.Quiz` — exposed nếu cần gọi từ inline onclick
- Script load order trong `index.html`: data files trước, `app.js` cuối cùng

## Script Load Order

```html
<script src="js/data.js"></script>       <!-- TOPICS -->
<script src="js/data-c1.js"></script>    <!-- TOPICS_C1 -->
<script src="js/data-c2.js"></script>    <!-- TOPICS_C2 -->
<script src="js/data-ielts.js"></script> <!-- TOPICS_IELTS -->
<script src="js/app.js"></script>        <!-- depends on all data globals -->
```

## CSS

- Tất cả màu và spacing dùng CSS custom properties từ `:root` — không hardcode `#hex`
- Mobile-first: base styles cho `320px`, dùng `min-width` breakpoints
- Không dùng `!important` trừ khi không còn cách nào khác
- Comment header cho mỗi screen/component trong `style.css`

## Naming Conventions

| Context | Convention | Ví dụ |
|---|---|---|
| CSS classes | kebab-case | `.fc-card`, `.quiz-option`, `.level-btn` |
| JS variables | camelCase | `wordQueue`, `startHour`, `intervalMinutes` |
| JS objects/classes | PascalCase | `Store`, `Flashcard`, `NotificationScheduler` |
| HTML IDs | kebab-case | `fc-word`, `notif-toggle`, `server-url-input` |
| localStorage keys | `vm_` prefix | `vm_progress`, `vm_level`, `vm_notif_settings` |
| Data file globals | UPPER_SNAKE | `TOPICS`, `TOPICS_C1`, `TOPICS_IELTS` |

## Service Worker — Quy tắc Cache

- Mỗi khi thay đổi nội dung cached files → **phải bump `CACHE_NAME`**:
  - Hiện tại: `vocabmaster-v7`
  - Bump lên `v8` khi update vocabulary, CSS, hoặc JS
- Tại sao: iOS Safari cache SW aggressively — phiên bản cũ vẫn được serve nếu không bump
- `ASSETS` array trong `sw.js` dùng relative paths (`./index.html`) vì app host trên GitHub Pages subpath

## localStorage Keys

| Key | Nội dung |
|---|---|
| `vm_progress` | Object: `{ [topicId]: { known: Set, total: n } }` |
| `vm_level` | String: `'B2'` \| `'C1'` \| `'C2'` \| `'IELTS'` |
| `vm_streak` | Object: `{ count, lastDate }` |
| `vm_notif_settings` | Object: NotificationScheduler settings |
| `vm_quiz_history` | Array: quiz results `{ score, total, date }` |

## Comments

- Comments kỹ thuật bằng tiếng Anh
- Comments giải thích WHY (không giải thích WHAT mà tên hàm đã nói rõ)
- Không viết comment cho code tự giải thích được
