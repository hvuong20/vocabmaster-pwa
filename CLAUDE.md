# CLAUDE.md — VocabMaster Project Guide

## Project Overview

**VocabMaster** is a Progressive Web App (PWA) for learning English vocabulary across 4 CEFR levels: **B2, C1, C2, and IELTS**. The app runs on mobile browsers and can be installed on iPhone via "Add to Home Screen". Built with vanilla HTML/CSS/JS — no frameworks, no build tools, no dependencies.

**Total vocabulary: 1,272 words across 65 topics and 4 levels.**

## Tech Stack

- **HTML5** — Single-page app shell (`index.html`)
- **Vanilla CSS** — Custom properties, glassmorphism, CSS animations (`css/style.css`)
- **Vanilla JavaScript** — ES6+, no frameworks (`js/app.js`, `js/data.js`, `js/data-c1.js`, `js/data-c2.js`, `js/data-ielts.js`)
- **PWA** — Service Worker (`sw.js`, `CACHE_NAME = 'vocabmaster-v5'`) + Web App Manifest (`manifest.json`)
- **Storage** — localStorage for progress tracking (no backend)
- **TTS** — Web Speech API for pronunciation

## Project Structure

```
English_Learning_PWA/
├── index.html          # App shell — all screens in one file
├── manifest.json       # PWA manifest for iOS/Android install
├── sw.js               # Service Worker (vocabmaster-v5)
├── CLAUDE.md           # This file
├── css/
│   └── style.css       # Complete design system
├── js/
│   ├── data.js         # B2 vocabulary (TOPICS array, 18 topics, 330 words)
│   ├── data-c1.js      # C1 vocabulary (TOPICS_C1 array, 23 topics, 429 words)
│   ├── data-c2.js      # C2 vocabulary (TOPICS_C2 array, 15 topics, 378 words)
│   ├── data-ielts.js   # IELTS vocabulary (TOPICS_IELTS array, 9 topics, 135 words)
│   └── app.js          # App logic: navigation, flashcard, quiz, progress, level switching
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## Vocabulary Levels & Topics

### B2 — Upper-Intermediate (`js/data.js`, `TOPICS`)
18 topics = **330 words**

| ID | Name | Vietnamese |
|---|---|---|
| `travel` | Travel & Tourism | Du lịch |
| `work` | Work & Career | Công việc |
| `food` | Food & Cuisine | Ẩm thực |
| `tech` | Technology | Công nghệ |
| `health` | Health & Wellness | Sức khỏe |
| `environment` | Environment | Môi trường |
| `education` | Education & Learning | Giáo dục |
| `entertainment` | Entertainment & Media | Giải trí & Truyền thông |
| `sports` | Sports & Fitness | Thể thao |
| `lifestyle` | Home & Lifestyle | Cuộc sống gia đình |
| `money` | Money & Finance | Tiền bạc & Tài chính |
| `society` | Society & Community | Xã hội & Cộng đồng |
| `crime` | Crime & Punishment | Tội phạm & Hình phạt |
| `family` | Family & Relationships | Gia đình & Các mối quan hệ |
| `fashion` | Fashion & Clothing | Thời trang & Trang phục |
| `animals` | Animals & Biology | Động vật & Sinh học |
| `digital_media` | Digital Media & Social Networks | Mạng xã hội & Truyền thông số |
| `politics` | Politics & Governance | Chính trị & Quản trị nhà nước |

### C1 — Advanced (`js/data-c1.js`, `TOPICS_C1`)
23 topics = **429 words**

| ID | Name | Vietnamese |
|---|---|---|
| `c1_academic` | Academic & Analysis | Học thuật |
| `c1_business` | Business & Economy | Kinh doanh |
| `c1_society` | Society & Politics | Xã hội & Chính trị |
| `c1_science` | Science & Research | Khoa học |
| `c1_communication` | Communication & Media | Truyền thông |
| `c1_psychology` | Mind & Behavior | Tâm lý & Hành vi |
| `c1_urban` | Urban Life | Cuộc sống thành thị |
| `c1_culture` | Culture & Traditions | Văn hóa & Truyền thống |
| `c1_global` | Global Issues | Vấn đề toàn cầu |
| `c1_books` | Literature & Books | Sách & Văn học |
| `c1_personality` | Human Characteristics | Tính cách con người |
| `c1_space` | Universe & Space | Vũ trụ & Không gian |
| `c1_health_med` | Health & Medical | Sức khỏe & Y tế |
| `c1_law_justice` | Law & Justice | Pháp luật & Công lý |
| `c1_commerce` | Business & Commerce | Kinh doanh & Thương mại |
| `c1_emotions` | Emotions & Wellbeing | Cảm xúc & Sức khỏe Tâm thần |
| `c1_institutions` | Society & Institutions | Xã hội & Thể chế |
| `c1_language` | Language & Learning | Ngôn ngữ & Học thuật |
| `c1_journalism` | Media & Journalism | Truyền thông & Báo chí |
| `c1_arts_music` | Art & Music Appreciation | Nghệ thuật & Âm nhạc |
| `c1_mental_health` | Psychology & Mental Health | Tâm lý học & Sức khỏe tâm thần |
| `c1_sport_science` | Sport Science & Physiology | Khoa học thể thao & Sinh lý học |
| `c1_other` | General Academic Vocabulary | Từ vựng học thuật tổng hợp |

### C2 — Mastery (`js/data-c2.js`, `TOPICS_C2`)
15 topics = **378 words**

| ID | Name | Vietnamese |
|---|---|---|
| `c2_philosophy` | Philosophy & Ethics | Triết học & Đạo đức |
| `c2_law` | Law & Justice | Pháp luật & Công lý |
| `c2_literature` | Literature & Linguistics | Văn học & Ngôn ngữ |
| `c2_arts` | Arts & Criticism | Nghệ thuật & Phê bình |
| `c2_governance` | Governance & Diplomacy | Ngoại giao & Quản trị |
| `c2_innovation` | Innovation & The Future | Đổi mới & Tương lai |
| `c2_linguistics` | Linguistics & Semantics | Ngôn ngữ học |
| `c2_economics` | Economic Theory | Kinh tế học |
| `c2_cognition` | Cognition & Neuroscience | Thần kinh học |
| `c2_ecology` | Ecology & Earth Sciences | Sinh thái học |
| `c2_history` | History & Civilization | Lịch sử & Văn minh |
| `c2_medicine` | Medicine & Bioethics | Y học & Đạo đức sinh học |
| `c2_religion` | Religion & Belief Systems | Tôn giáo & Hệ thống niềm tin |
| `c2_geoscience` | Physical Geography & Earth Science | Địa lý tự nhiên & Khoa học Trái đất |
| `c2_other` | General Academic Vocabulary | Từ vựng học thuật tổng hợp |

### IELTS — Academic (`js/data-ielts.js`, `TOPICS_IELTS`)
9 topics = **135 words**

| ID | Name | Vietnamese |
|---|---|---|
| `ielts_writing` | Academic Writing | Viết Học thuật |
| `ielts_urban` | Urban Planning | Quy hoạch Đô thị |
| `ielts_global_trade` | Global Trade | Thương mại Toàn cầu |
| `ielts_research` | Research & Data | Nghiên cứu & Dữ liệu |
| `ielts_climate` | Climate & Energy | Khí hậu & Năng lượng |
| `ielts_public_health` | Public Health | Y tế Công cộng |
| `ielts_housing` | Housing & Architecture | Nhà ở & Kiến trúc |
| `ielts_agriculture` | Agriculture & Food Production | Nông nghiệp & Sản xuất thực phẩm |
| `ielts_transport` | Transport & Infrastructure | Giao thông & Cơ sở hạ tầng |

## Architecture

### Navigation
- SPA with screen switching via `navigateTo(screenId)` function
- Screens are `<section class="screen">` elements, toggled with `.active` class
- Bottom nav bar with 3 tabs: Home, Quiz, Progress
- Flashcard screen accessed via topic cards on Home

### Level Switching
- 4-button pill switcher: **B2 | C1 | C2 | IELTS**
- `switchLevel(level)` updates `currentLevel`, persists to `localStorage('vm_level')`
- `getActiveTopics()` maps level string → correct `TOPICS_*` array
- `getAllTopics()` returns all 65 topics merged for progress tracking

### Data Flow
- `TOPICS` / `TOPICS_C1` / `TOPICS_C2` / `TOPICS_IELTS` in respective data files → rendered by `app.js`
- `Store` object manages all progress in localStorage under key `vm_progress`
- No server calls — everything is client-side

### Script Load Order (`index.html`)
```html
<script src="js/data.js"></script>
<script src="js/data-c1.js"></script>
<script src="js/data-c2.js"></script>
<script src="js/data-ielts.js"></script>
<script src="js/app.js"></script>
```
All 4 data files **must** load before `app.js` — `app.js` references all four globals.

### Key Modules in app.js
- `Store` — localStorage CRUD, streak tracking, quiz history
- `Flashcard` — card flip, TTS, mark known/unknown
- `Quiz` — question generation, scoring, results
- `navigateTo()` / `goBack()` — screen routing
- `speak()` — Web Speech API wrapper
- `getActiveTopics()` — returns topics for the current level
- `getAllTopics()` — returns all 65 topics (for progress screen)
- `switchLevel(level)` — switches B2/C1/C2/IELTS

## Design Philosophy

### Core Principles
1. **Simple** — Clean layouts, no clutter, generous whitespace
2. **Modern** — Dark theme, subtle glassmorphism, smooth animations
3. **Professional** — Consistent spacing, typography hierarchy, polished details

### Design System (CSS Custom Properties)
```css
--bg-primary: #0F0A1E;        /* Deep dark background */
--bg-secondary: #1A1333;      /* Slightly lighter */
--bg-card: rgba(255,255,255,0.06);  /* Glass card */
--accent: #7C3AED;            /* Purple accent */
--accent-light: #A78BFA;      /* Light purple for text */
--success: #22C55E;           /* Green — correct/known */
--danger: #EF4444;            /* Red — wrong/learning */
--warning: #F59E0B;           /* Amber — streak */
--radius: 16px;               /* Card corners */
--radius-sm: 10px;            /* Button corners */
```

### Typography
- Font: **Inter** (Google Fonts)
- Weights: 400 (body), 500 (medium), 600 (semibold), 700 (bold), 800 (extra bold)
- Scale: 11px labels → 13px small → 14-15px body → 17px section → 24-32px display

### Animations
- Screen transitions: `fadeIn` (opacity + translateY)
- Flashcard: 3D flip via `rotateY(180deg)` with `perspective(1200px)`
- Quiz feedback: `correctPop` (scale bounce) and `shake` (horizontal shake)
- Buttons: `scale(0.95-0.98)` on `:active`
- Speaker button: `pulse` glow animation while speaking

## Mandatory Rules

### After Every Major Change
1. **Take a screenshot** of the affected screen(s)
2. **Compare with the original design** to verify visual consistency
3. **Check mobile viewport** (390×844 iPhone size) — this is the primary target
4. Document any intentional design deviations

### Code Style
- Use `const` / `let`, never `var`
- Arrow functions preferred for callbacks
- Template literals for HTML generation
- Descriptive function names in English
- Comments in Vietnamese for user-facing descriptions, English for technical

### CSS Rules
- Always use CSS custom properties from `:root` — no hardcoded colors
- Mobile-first (max-width: 480px container)
- No `!important` unless absolutely necessary
- Group styles by screen/component with comment headers

### Data / Vocabulary
- Each topic has **15 words minimum**
- Each word must have: `word`, `phonetic` (IPA), `meaning` (Vietnamese), `example` (English sentence)
- Vocabulary level matches the topic's CEFR file: B2 → `data.js`, C1 → `data-c1.js`, etc.
- Phonetic notation follows IPA standard

### PWA / Offline
- After adding new files, update the `ASSETS` array in `sw.js`
- Increment `CACHE_NAME` version when updating cached files (`vocabmaster-v5` currently)
- Test offline mode after changes

## Common Tasks

### Adding a New Topic to an Existing Level
1. Open the correct data file for the level (`data.js` for B2, `data-c1.js` for C1, etc.)
2. Append a topic object to the end of the `TOPICS_*` array:
   ```js
   {
     id: 'b2_newid', name: 'Topic Name', nameVi: 'Tên Tiếng Việt',
     icon: '🎯', color: '#HEXCOL',
     words: [
       { word: '...', phonetic: '/.../', meaning: '...', example: '...' },
       // 14 more words...
     ]
   }
   ```
3. No changes to `app.js` or `index.html` needed — Home and Quiz auto-render from the arrays.

### Adding a Completely New Level
1. Create `js/data-{level}.js` exporting a `TOPICS_{LEVEL}` global array
2. Add `<script src="js/data-{level}.js"></script>` in `index.html` before `app.js`
3. Update `getActiveTopics()`, `getAllTopics()`, and the `levelMap` in `app.js`
4. Add a level button in both `.level-switch` pill containers in `index.html`
5. Add to `ASSETS` array in `sw.js` and bump `CACHE_NAME` version
6. Add to the valid levels list in `switchLevel()` toast map and `DOMContentLoaded` restore logic

### Adding a New Screen
1. Add `<section id="screen-{name}" class="screen">` in `index.html`
2. Add navigation logic in `navigateTo()` in `app.js`
3. Add styles in `css/style.css` under a new comment section

### Modifying Design
1. Prefer changing CSS custom properties in `:root` for global changes
2. For component-specific changes, find the relevant section in `style.css`
3. **Always screenshot before and after** to compare

## Testing Checklist
- [ ] All 4 level buttons (B2, C1, C2, IELTS) render in the pill switcher
- [ ] B2 shows 18 topic cards on Home screen
- [ ] C1 shows 23 topic cards on Home screen
- [ ] C2 shows 15 topic cards on Home screen
- [ ] IELTS shows 9 topic cards on Home screen
- [ ] Selected level persists after page refresh
- [ ] Flashcard flip animation works smoothly
- [ ] TTS speaks the word on button click
- [ ] Quiz generates 4 options with exactly 1 correct
- [ ] Streak increments on daily use
- [ ] Progress percentages update after marking words
- [ ] Progress screen shows all 65 topics (all levels merged)
- [ ] App works offline after first load
- [ ] Bottom nav switches screens correctly
- [ ] Back button returns to previous screen
