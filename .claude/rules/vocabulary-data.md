# Vocabulary Data

## Tổng quan

| Level | File | Global | Topics | Words |
|---|---|---|---|---|
| B2 | `js/data.js` | `TOPICS` | 18 | 330 |
| C1 | `js/data-c1.js` | `TOPICS_C1` | 23 | 429 |
| C2 | `js/data-c2.js` | `TOPICS_C2` | 15 | 378 |
| IELTS | `js/data-ielts.js` | `TOPICS_IELTS` | 10 | 155 |

**Tổng:** 66 topics, ~1,292 words

## Cấu trúc một topic

```js
{
  id: 'ielts_writing',      // string — unique, dùng làm key localStorage và URL param
  name: 'Academic Writing', // string — hiển thị tiếng Anh
  nameVi: 'Viết Học thuật', // string — hiển thị tiếng Việt
  icon: '✍️',               // emoji — icon trên topic card
  color: '#7C3AED',         // hex — gradient color cho card header
  words: [ /* Word[] */ ]
}
```

## Cấu trúc một word

```js
{
  word:     'albeit',                       // string — từ tiếng Anh
  phonetic: '/ɔːlˈbiːɪt/',                 // string — IPA notation
  meaning:  'mặc dù, dù cho',              // string — nghĩa tiếng Việt
  example:  'The project succeeded, albeit with some delays.'
                                            // string — câu ví dụ tiếng Anh
}
```

**Bắt buộc:** Tất cả 4 field phải có giá trị — không để trống.  
**Phonetic:** Dùng IPA standard, bao trong `/`.  
**Minimum:** Mỗi topic ≥ 15 words.

## B2 Topics (data.js — TOPICS)

`travel`, `work`, `food`, `tech`, `health`, `environment`, `education`, `entertainment`, `sports`, `lifestyle`, `money`, `society`, `crime`, `family`, `fashion`, `animals`, `digital_media`, `politics`

## C1 Topics (data-c1.js — TOPICS_C1)

`c1_academic`, `c1_business`, `c1_society`, `c1_science`, `c1_communication`, `c1_psychology`, `c1_urban`, `c1_culture`, `c1_global`, `c1_books`, `c1_personality`, `c1_space`, `c1_health_med`, `c1_law_justice`, `c1_commerce`, `c1_emotions`, `c1_institutions`, `c1_language`, `c1_journalism`, `c1_arts_music`, `c1_mental_health`, `c1_sport_science`, `c1_other`

## C2 Topics (data-c2.js — TOPICS_C2)

`c2_philosophy`, `c2_law`, `c2_literature`, `c2_arts`, `c2_governance`, `c2_innovation`, `c2_linguistics`, `c2_economics`, `c2_cognition`, `c2_ecology`, `c2_history`, `c2_medicine`, `c2_religion`, `c2_geoscience`, `c2_other`

## IELTS Topics (data-ielts.js — TOPICS_IELTS)

`ielts_writing`, `ielts_urban`, `ielts_global_trade`, `ielts_research`, `ielts_climate`, `ielts_public_health`, `ielts_housing`, `ielts_agriculture`, `ielts_transport`, `ielts_others`

> **`ielts_others`** — topic dành cho từ quan trọng không thuộc topic nào rõ ràng. Khi thêm từ mới IELTS không biết đặt vào đâu → cho vào `ielts_others`.

## Quy tắc thêm topic mới

1. Mở file data đúng level
2. Append object topic vào cuối array `TOPICS_*`
3. `app.js` và `index.html` **không cần sửa** — home và quiz tự render từ arrays
4. Bump `CACHE_NAME` trong `sw.js` (e.g. `vocabmaster-v7` → `v8`) để iOS reload cache

## Push Server đọc vocabulary

`push-server/server.js` đọc trực tiếp từ `js/data*.js` via `new Function()` (Node.js):

```js
const fn = new Function(code + '\nreturn ' + key + ';');
return fn();
```

Không copy vocabulary vào push-server — push server đọc từ parent directory.
