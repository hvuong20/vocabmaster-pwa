// ═══════════════════════════════════════════════════════════
//  VocabMaster Push Server
//  Deploy lên Render.com (free tier)
// ═══════════════════════════════════════════════════════════
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors    = require('cors');
const webpush = require('web-push');
const cron    = require('node-cron');
const fs      = require('fs');
const path    = require('path');

// ── VAPID setup ────────────────────────────────
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL   = process.env.VAPID_EMAIL || 'mailto:admin@vocabmaster.app';

if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  console.error('❌  Thiếu VAPID keys. Chạy: node generate-keys.js');
  process.exit(1);
}
webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);

// ── Vocabulary loading ─────────────────────────
// Đọc trực tiếp từ js/ của PWA (cùng repo) mà không cần copy
const VOCAB_DIR = path.join(__dirname, '..', 'js');

function loadTopics(filename) {
  try {
    const code    = fs.readFileSync(path.join(VOCAB_DIR, filename), 'utf8');
    // Tên biến trong mỗi file: TOPICS / TOPICS_C1 / TOPICS_C2 / TOPICS_IELTS
    const varName = filename.replace(/^data-?/, '').replace('.js', '').toUpperCase();
    const key     = varName === '' ? 'TOPICS' : 'TOPICS_' + varName;
    // Dùng Function để chạy code browser-format trong Node
    const fn = new Function(code + '\nreturn ' + key + ';');
    return fn();
  } catch (e) {
    console.warn('Không load được ' + filename + ':', e.message);
    return [];
  }
}

const VOCAB = {
  B2:    loadTopics('data.js'),
  C1:    loadTopics('data-c1.js'),
  C2:    loadTopics('data-c2.js'),
  IELTS: loadTopics('data-ielts.js'),
};

const totalWords = Object.values(VOCAB).flat().reduce((s, t) => s + (t.words || []).length, 0);
console.log(`📚 Vocabulary: ${totalWords} từ (B2:${VOCAB.B2.length} C1:${VOCAB.C1.length} C2:${VOCAB.C2.length} IELTS:${VOCAB.IELTS.length} topics)`);

function getWordPool(settings) {
  const topics = VOCAB[settings.level] || VOCAB.B2;
  if (settings.topicId === 'all') {
    return topics.flatMap(t => t.words.map(w => ({ ...w, topicId: t.id })));
  }
  const topic = topics.find(t => t.id === settings.topicId);
  return topic ? topic.words.map(w => ({ ...w, topicId: topic.id })) : [];
}

// ── Subscription storage ───────────────────────
const SUBS_FILE = path.join(__dirname, 'subscriptions.json');
let subscriptions = [];

function loadSubs() {
  try {
    subscriptions = JSON.parse(fs.readFileSync(SUBS_FILE, 'utf8'));
    console.log(`Loaded ${subscriptions.length} subscription(s)`);
  } catch (_) { subscriptions = []; }
}

function saveSubs() {
  try { fs.writeFileSync(SUBS_FILE, JSON.stringify(subscriptions, null, 2)); } catch (_) {}
}

loadSubs();

// ── Express app ────────────────────────────────
const app = express();
app.use(express.json());
app.use(cors()); // cho phép PWA từ mọi origin gọi vào

app.get('/', (_, res) => {
  res.json({
    name: 'VocabMaster Push Server',
    status: 'running',
    subscriptions: subscriptions.length,
    words: totalWords,
    endpoints: ['/config', '/subscribe', '/unsubscribe', '/preview', '/health']
  });
});

app.get('/health', (_, res) => {
  res.json({ ok: true, subs: subscriptions.length, words: totalWords });
});

// PWA lấy VAPID public key để subscribe
app.get('/config', (_, res) => {
  res.json({ vapidPublicKey: VAPID_PUBLIC });
});

// PWA đăng ký hoặc cập nhật subscription + settings
app.post('/subscribe', (req, res) => {
  const { subscription, settings } = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: 'Invalid subscription' });

  const defaults = { intervalMinutes: 30, startHour: 8, endHour: 22, level: 'B2', topicId: 'all', wordIndex: 0 };
  const merged   = { ...defaults, ...settings };

  const existing = subscriptions.find(s => s.subscription.endpoint === subscription.endpoint);
  if (existing) {
    // Giữ lại wordIndex và lastSentAt khi chỉ update settings
    existing.settings    = { ...merged, wordIndex: existing.settings.wordIndex ?? 0 };
    existing.subscription = subscription;
  } else {
    subscriptions.push({ subscription, settings: merged, lastSentAt: null });
    console.log(`New subscription (total: ${subscriptions.length})`);
  }

  saveSubs();
  res.json({ ok: true });
});

// Gửi ngay 1 từ để test (nút "Xem thử từ ngay")
app.post('/preview', async (req, res) => {
  const { endpoint } = req.body;
  const sub = subscriptions.find(s => s.subscription.endpoint === endpoint);
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });

  const pool = getWordPool(sub.settings);
  if (!pool.length) return res.status(400).json({ error: 'No words available' });

  const word = pool[Math.floor(Math.random() * pool.length)];
  try {
    await webpush.sendNotification(
      sub.subscription,
      JSON.stringify({ word: word.word, phonetic: word.phonetic, meaning: word.meaning })
    );
    res.json({ ok: true, word: word.word });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PWA hủy đăng ký
app.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  const before = subscriptions.length;
  subscriptions = subscriptions.filter(s => s.subscription.endpoint !== endpoint);
  saveSubs();
  console.log(`Unsubscribed (${before} → ${subscriptions.length})`);
  res.json({ ok: true });
});

// ── Cron: kiểm tra mỗi phút ───────────────────
cron.schedule('* * * * *', async () => {
  if (!subscriptions.length) return;

  const now  = Date.now();
  const hour = new Date().getHours();
  let changed = false;

  for (const sub of [...subscriptions]) {
    const { settings, lastSentAt } = sub;

    // Kiểm tra giờ hoạt động
    if (hour < settings.startHour || hour >= settings.endHour) continue;

    // Kiểm tra interval
    const intervalMs = (settings.intervalMinutes || 30) * 60 * 1000;
    if (lastSentAt && now - new Date(lastSentAt).getTime() < intervalMs) continue;

    // Lấy từ tiếp theo
    const pool = getWordPool(settings);
    if (!pool.length) continue;
    const idx  = (settings.wordIndex || 0) % pool.length;
    const word = pool[idx];
    settings.wordIndex = (idx + 1) % pool.length;

    try {
      await webpush.sendNotification(
        sub.subscription,
        JSON.stringify({ word: word.word, phonetic: word.phonetic, meaning: word.meaning })
      );
      sub.lastSentAt = new Date().toISOString();
      changed = true;
      console.log(`✉️  Sent "${word.word}" → ...${sub.subscription.endpoint.slice(-15)}`);
    } catch (err) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Subscription hết hạn, xóa đi
        subscriptions = subscriptions.filter(s => s.subscription.endpoint !== sub.subscription.endpoint);
        console.log('🗑️  Removed expired subscription');
      } else {
        console.error('Push error:', err.message);
      }
      changed = true;
    }
  }

  if (changed) saveSubs();
});

// ── Self-ping để Render free tier không sleep ──
// Render free tier sleep sau 15 phút không có request
// Self-ping mỗi 14 phút giữ server luôn sống
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_URL) {
  setInterval(() => {
    fetch(RENDER_URL + '/health')
      .then(() => console.log('🏓 Self-ping OK'))
      .catch(() => {});
  }, 14 * 60 * 1000);
  console.log('🏓 Self-ping enabled:', RENDER_URL);
}

// ── Start ──────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 VocabMaster Push Server chạy trên port ${PORT}`);
  console.log(`   /health  →  kiểm tra server`);
  console.log(`   /config  →  lấy VAPID public key`);
  console.log(`   /subscribe, /unsubscribe  →  quản lý subscriptions\n`);
});
