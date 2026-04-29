# Development Workflow

## Local Dev

```bash
cd c:\Claude_project\English_Learning_PWA
npx serve . --listen 8080
# Mở: http://localhost:8080
```

Push server (chạy riêng nếu cần test notifications):
```bash
cd push-server
npm install
npm start
# Chạy trên: http://localhost:3000
```

## Git & Deploy

```bash
git add <files>
git commit -m "message"
git push origin master
```

- **PWA:** GitHub Pages auto deploy sau khi push master
- **Push Server:** Render.com auto deploy sau khi push master (~30–60s build time)
- **Không chạy `netlify deploy`** — không dùng Netlify cho project này

## GitHub Repo

**URL:** https://github.com/hvuong20/vocabmaster-pwa  
**Branch:** master  
**GitHub Pages:** enabled, source = master branch root

## Checklist sau mỗi thay đổi

### Vocabulary thay đổi (data files)
- [ ] Bump `CACHE_NAME` trong `sw.js` (ví dụ: `v7` → `v8`)
- [ ] Push lên GitHub
- [ ] Chờ ~30s rồi mở PWA trên iPhone, force reload
- [ ] Verify topic mới xuất hiện, từ mới hiển thị đúng

### Push server thay đổi
- [ ] Push lên GitHub
- [ ] Theo dõi Render.com deploy log để xác nhận build thành công
- [ ] Test: mở `https://vocabmaster-push.onrender.com` → phải trả JSON status
- [ ] Test preview notification từ app trên iPhone

### CSS / UI thay đổi
- [ ] Test trên mobile viewport 390px
- [ ] Touch targets ≥ 44px
- [ ] Không horizontal scroll

## Screens trong app

| Screen | ID | Truy cập qua |
|---|---|---|
| Home | `screen-home` | Bottom nav — Trang chủ |
| Flashcard | `screen-flashcard` | Topic card trên Home |
| Quiz Select | `screen-quiz` | Bottom nav — Quiz |
| Quiz Playing | `screen-quiz-play` | Chọn topic trong Quiz |
| Quiz Result | `screen-quiz-result` | Sau khi quiz xong |
| Progress | `screen-progress` | Bottom nav — Tiến trình |
| Lookup | `screen-lookup` | Bottom nav — Tra từ |
| Reminder | `screen-reminder` | Bottom nav — Nhắc nhở |

## Common Tasks

### Thêm topic mới

1. Mở data file đúng level
2. Append topic object vào cuối array `TOPICS_*`
3. Bump `CACHE_NAME` trong `sw.js`
4. Push lên GitHub

### Thêm từ vào topic hiện có

1. Mở data file đúng level
2. Tìm topic theo `id`
3. Push word object vào `topic.words` array
4. Bump `CACHE_NAME` trong `sw.js`
5. Push lên GitHub

### Thêm level mới

1. Tạo `js/data-{level}.js` với global `TOPICS_{LEVEL}`
2. Thêm `<script>` tag trong `index.html` trước `app.js`
3. Update `getActiveTopics()`, `getAllTopics()`, `levelMap` trong `app.js`
4. Thêm level button vào cả 2 `.level-switch` trong `index.html`
5. Thêm chip button vào `.chip-group` trong Reminder screen
6. Thêm vào `ASSETS` trong `sw.js` và bump `CACHE_NAME`
7. Push server đọc tự động nếu tên file đúng pattern `data-{level}.js`

### Thêm screen mới

1. Thêm `<section id="screen-{name}" class="screen">` trong `index.html`
2. Thêm case trong `navigateTo()` trong `app.js`
3. Thêm styles trong `css/style.css` dưới comment header
4. Thêm nav button nếu cần

## Troubleshooting

| Vấn đề | Nguyên nhân | Giải pháp |
|---|---|---|
| iPhone không thấy changes | SW cache cũ | Bump `CACHE_NAME`, push, force reload iPhone |
| Render "not found" | Deployment chưa xong | Chờ 30–60s, refresh |
| Không nhận notification định kỳ | Server sleep | Kiểm tra `RENDER_EXTERNAL_URL` env var đã set chưa |
| Subscription mất sau server restart | Render ephemeral FS | User toggle off/on để re-subscribe |
| Push notification "Subscription not found" | User chưa subscribe | Toggle tắt rồi bật lại trong Reminder screen |
