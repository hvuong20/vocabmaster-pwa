# Design System

## Theme

Dark glassmorphism theme. Primary color: purple accent trên nền dark navy.

## CSS Custom Properties (css/style.css — :root)

| Token | Value | Dùng cho |
|---|---|---|
| `--bg-primary` | `#0F0A1E` | Page background (deep dark navy) |
| `--bg-secondary` | `#1A1333` | Slightly lighter panels |
| `--bg-card` | `rgba(255,255,255,0.06)` | Glassmorphism cards |
| `--accent` | `#7C3AED` | Purple — buttons, active states |
| `--accent-light` | `#A78BFA` | Light purple — text links, tags |
| `--success` | `#22C55E` | Green — correct/known |
| `--danger` | `#EF4444` | Red — wrong/learning |
| `--warning` | `#F59E0B` | Amber — streak, score |
| `--text-primary` | `#F1F5F9` | Main text |
| `--text-secondary` | `rgba(255,255,255,0.6)` | Labels, hints |
| `--border` | `rgba(255,255,255,0.1)` | Card borders |
| `--radius` | `16px` | Card border-radius |
| `--radius-sm` | `10px` | Button border-radius |

## Typography

- **Font:** `'Inter', system-ui, sans-serif` — load từ Google Fonts
- **Weights:** 400, 500, 600, 700, 800
- **Scale:**

| Size | Dùng cho |
|---|---|
| 11px | Small labels, badges |
| 13px | Secondary text, hints |
| 14–15px | Body text |
| 17px | Section titles |
| 24–32px | Display text (word on flashcard) |

## Animations

| Class / Keyframe | Dùng cho |
|---|---|
| `fadeIn` | Screen transitions (opacity + translateY) |
| `rotateY(180deg)` | Flashcard 3D flip (`perspective: 1200px`) |
| `correctPop` | Scale bounce khi quiz đúng |
| `shake` | Horizontal shake khi quiz sai |
| `pulse` | Glow effect trên speaker button khi TTS đang chạy |
| `scale(0.95–0.98)` | Button `:active` feedback |

## Screens & UI Components

### Header
```
position: fixed; top: 0; width: 100%; height: ~56px
background: linear-gradient transparent → blur backdrop
```

### Bottom Navigation
```
position: fixed; bottom: 0; width: 100%
5 tabs: Trang chủ | Quiz | Tiến trình | Tra từ | Nhắc nhở
```

### Flashcard
```
3D flip: .fc-card với perspective; .fc-front / .fc-back
Flip trigger: click trên card → Flashcard.flip()
```

### Quiz Options
```
4 buttons — correct: success green, wrong: danger red + shake
Disabled sau khi chọn, auto-advance sau 0.8s
```

### Level Switcher Pill
```
.level-switch — flex row, 4 buttons: B2 | C1 | C2 | IELTS
Active button: background accent color
```

### Toast Notification
```
#toast — fixed bottom center, auto-hide sau 2.5s
```

## Mobile Targets

- Container max-width: `480px`
- Touch targets: tối thiểu `44px × 44px`
- Primary device: iPhone 12–15 (390×844px)
- Test viewport: 390px width
