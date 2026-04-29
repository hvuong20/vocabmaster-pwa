// ═══════════════════════════════════════════════════════════
//  VocabMaster — Main Application Logic
// ═══════════════════════════════════════════════════════════

// ── Progress Store (localStorage) ──────────────
const Store = {
  KEY: 'vm_progress',
  _data: null,

  defaults() {
    return {
      streak: 0,
      lastActiveDate: null,
      knownWords: {},      // { "travel:itinerary": true }
      todayWords: [],      // words reviewed today
      todayDate: null,
      quizHistory: [],     // [{ date, score, total, topicId }]
      dailyGoal: 10
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      this._data = raw ? { ...this.defaults(), ...JSON.parse(raw) } : this.defaults();
    } catch { this._data = this.defaults(); }
    this._updateStreak();
    return this._data;
  },

  save() {
    localStorage.setItem(this.KEY, JSON.stringify(this._data));
  },

  get() {
    if (!this._data) this.load();
    return this._data;
  },

  _todayStr() {
    return new Date().toISOString().slice(0, 10);
  },

  _updateStreak() {
    const d = this._data;
    const today = this._todayStr();
    if (d.todayDate !== today) {
      // New day
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      if (d.lastActiveDate === yStr) {
        // Consecutive day — streak continues
      } else if (d.lastActiveDate !== today) {
        d.streak = 0; // streak broken
      }
      d.todayWords = [];
      d.todayDate = today;
      this.save();
    }
  },

  markWordReviewed(topicId, word) {
    const d = this.get();
    const key = topicId + ':' + word;
    const today = this._todayStr();
    if (!d.todayWords.includes(key)) {
      d.todayWords.push(key);
    }
    if (d.todayDate !== today) {
      d.todayDate = today;
      d.todayWords = [key];
    }
    // Update streak if first activity today
    if (d.lastActiveDate !== today) {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      d.streak = (d.lastActiveDate === yStr) ? d.streak + 1 : 1;
      d.lastActiveDate = today;
    }
    this.save();
  },

  markWordKnown(topicId, word) {
    const d = this.get();
    d.knownWords[topicId + ':' + word] = true;
    this.save();
  },

  unmarkWordKnown(topicId, word) {
    const d = this.get();
    delete d.knownWords[topicId + ':' + word];
    this.save();
  },

  isKnown(topicId, word) {
    return !!this.get().knownWords[topicId + ':' + word];
  },

  getTopicProgress(topicId) {
    const topic = getAllTopics().find(t => t.id === topicId);
    if (!topic) return 0;
    const known = topic.words.filter(w => this.isKnown(topicId, w.word)).length;
    return Math.round((known / topic.words.length) * 100);
  },

  addQuizResult(topicId, score, total) {
    const d = this.get();
    d.quizHistory.push({ date: this._todayStr(), score, total, topicId });
    // Keep last 50
    if (d.quizHistory.length > 50) d.quizHistory = d.quizHistory.slice(-50);
    this.markWordReviewed(topicId || 'quiz', 'quiz-' + Date.now());
    this.save();
  },

  getAvgQuizScore() {
    const h = this.get().quizHistory;
    if (!h.length) return 0;
    const avg = h.reduce((s, q) => s + (q.score / q.total), 0) / h.length;
    return Math.round(avg * 100);
  },

  getTotalKnown() {
    return Object.keys(this.get().knownWords).length;
  },

  reset() {
    this._data = this.defaults();
    this.save();
  }
};

// ── Level Management ───────────────────────────
let currentLevel = 'B2';

function getActiveTopics() {
  const map = { 'B2': TOPICS, 'C1': TOPICS_C1, 'C2': TOPICS_C2, 'IELTS': TOPICS_IELTS };
  return map[currentLevel] || TOPICS;
}

function getAllTopics() {
  return [...TOPICS, ...TOPICS_C1, ...TOPICS_C2, ...TOPICS_IELTS];
}

function switchLevel(level) {
  if (level === currentLevel) return;
  currentLevel = level;

  // Update all level buttons across screens
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === level);
  });

  // Refresh current screen
  localStorage.setItem('vm_level', level);

  refreshHome();
  renderQuizTopics();
  refreshProgress();

  const toasts = {
    'B2': '📘 Chuyển sang B2 Upper-Intermediate',
    'C1': '🎓 Chuyển sang C1 Advanced',
    'C2': '🏆 Chuyển sang C2 Mastery',
    'IELTS': '🎯 Chuyển sang IELTS Academic'
  };
  showToast(toasts[level]);
}

// ── Navigation ─────────────────────────────────
let currentScreen = 'home';
let screenHistory = [];

function navigateTo(screen) {
  if (screen === currentScreen) return;

  // Hide all screens
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + screen).classList.add('active');

  // Update nav
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.screen === screen);
  });

  // Header
  const mainScreens = ['home', 'quiz', 'progress', 'reminder', 'lookup'];
  const isMain = mainScreens.includes(screen);
  document.getElementById('header-back').style.display = isMain ? 'none' : 'block';
  const center = document.getElementById('header-center');
  if (isMain) {
    center.innerHTML = '<div class="logo">Vocab<span>Master</span></div>';
  }

  if (currentScreen !== screen) screenHistory.push(currentScreen);
  currentScreen = screen;

  // Refresh screen data
  if (screen === 'home') refreshHome();
  if (screen === 'progress') refreshProgress();
  if (screen === 'quiz') renderQuizTopics();
  if (screen === 'reminder') refreshReminder();

  // Scroll to top
  document.getElementById('screens').scrollTop = 0;
}

function goBack() {
  const prev = screenHistory.pop() || 'home';
  currentScreen = '___'; // force navigate
  navigateTo(prev);
}

// ── Home Screen ────────────────────────────────
function refreshHome() {
  const d = Store.get();
  document.getElementById('home-streak').textContent = d.streak;
  document.getElementById('home-words').textContent = Store.getTotalKnown();
  document.getElementById('home-quiz').textContent = Store.getAvgQuizScore() + '%';

  // Daily goal
  const todayCount = d.todayWords.length;
  const pct = Math.min(100, Math.round((todayCount / d.dailyGoal) * 100));
  document.getElementById('daily-fill').style.width = pct + '%';
  document.getElementById('daily-text').textContent = todayCount + ' / ' + d.dailyGoal + ' từ';

  // Greeting
  const h = new Date().getHours();
  const greet = h < 12 ? 'Chào buổi sáng 👋' : h < 18 ? 'Chào buổi chiều ☀️' : 'Chào buổi tối 🌙';
  document.querySelector('.greeting').textContent = greet;

  // Topics
  const container = document.getElementById('home-topics');
  const topics = getActiveTopics();
  container.innerHTML = topics.map(t => {
    const pct = Store.getTopicProgress(t.id);
    return `<div class="topic-card" onclick="Flashcard.start('${t.id}')">
      <div class="topic-icon">${t.icon}</div>
      <div class="topic-name">${t.nameVi}</div>
      <div class="topic-count">${t.words.length} từ</div>
      <div class="topic-progress"><div class="topic-progress-fill" style="width:${pct}%;background:${t.color}"></div></div>
    </div>`;
  }).join('');
}

// ── Text-to-Speech ─────────────────────────────
function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.85;
  u.pitch = 1;

  // Try to use a good English voice
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'))
    || voices.find(v => v.lang.startsWith('en-US'))
    || voices.find(v => v.lang.startsWith('en'));
  if (enVoice) u.voice = enVoice;

  const btn = document.getElementById('fc-speak');
  if (btn) btn.classList.add('speaking');
  u.onend = () => { if (btn) btn.classList.remove('speaking'); };
  u.onerror = () => { if (btn) btn.classList.remove('speaking'); };

  window.speechSynthesis.speak(u);
}

// Load voices
if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}

// ── Flashcard Module ───────────────────────────
const Flashcard = {
  topic: null,
  words: [],
  index: 0,

  start(topicId) {
    this.topic = getAllTopics().find(t => t.id === topicId);
    if (!this.topic) return;

    // Shuffle words, prioritize unknown
    const unknown = this.topic.words.filter(w => !Store.isKnown(topicId, w.word));
    const known = this.topic.words.filter(w => Store.isKnown(topicId, w.word));
    this.words = [...shuffle(unknown), ...shuffle(known)];
    this.index = 0;

    // Update header
    const center = document.getElementById('header-center');
    center.innerHTML = `<span id="header-title">${this.topic.icon} ${this.topic.nameVi}</span>`;

    navigateTo('flashcard');
    this.render();
  },

  render() {
    const w = this.words[this.index];
    if (!w) return;

    document.getElementById('fc-counter').textContent = (this.index + 1) + ' / ' + this.words.length;
    document.getElementById('fc-word').textContent = w.word;
    document.getElementById('fc-phonetic').textContent = w.phonetic;
    document.getElementById('fc-meaning').textContent = w.meaning;
    document.getElementById('fc-example').textContent = '"' + w.example + '"';

    // Reset flip
    document.getElementById('fc-card').classList.remove('flipped');

    // Update buttons
    const isKnown = Store.isKnown(this.topic.id, w.word);
    const knowBtn = document.querySelector('.fc-action-btn.know');
    knowBtn.innerHTML = isKnown ? '✅ Đã biết' : '✅ Đánh dấu biết';
  },

  flip() {
    document.getElementById('fc-card').classList.toggle('flipped');
  },

  speak() {
    const w = this.words[this.index];
    if (w) speak(w.word);
  },

  mark(known) {
    const w = this.words[this.index];
    if (!w) return;

    if (known) {
      Store.markWordKnown(this.topic.id, w.word);
      showToast('✅ Đã đánh dấu biết!');
    } else {
      Store.unmarkWordKnown(this.topic.id, w.word);
      showToast('🔄 Sẽ ôn lại từ này');
    }
    Store.markWordReviewed(this.topic.id, w.word);

    // Next card
    if (this.index < this.words.length - 1) {
      this.index++;
      this.render();
    } else {
      showToast('🎉 Hoàn thành chủ đề!');
      setTimeout(() => navigateTo('home'), 800);
    }
  }
};

// ── Quiz Module ────────────────────────────────
const Quiz = {
  questions: [],
  current: 0,
  score: 0,
  topicId: null,
  answered: false,

  startTopic(topicId) {
    this.topicId = topicId;
    const topic = getActiveTopics().find(t => t.id === topicId);
    if (!topic) return;

    this._generateQuestions(topic.words, topicId);

    const center = document.getElementById('header-center');
    center.innerHTML = `<span id="header-title">🧠 Quiz: ${topic.nameVi}</span>`;
    navigateTo('quiz-play');
    this.renderQuestion();
  },

  startRandom() {
    this.topicId = 'random';
    const allWords = [];
    getActiveTopics().forEach(t => t.words.forEach(w => allWords.push({ ...w, _topicId: t.id })));
    this._generateQuestions(allWords, 'random');

    const center = document.getElementById('header-center');
    center.innerHTML = `<span id="header-title">🧠 Quiz ngẫu nhiên</span>`;
    navigateTo('quiz-play');
    this.renderQuestion();
  },

  _generateQuestions(wordPool, topicId) {
    const selected = shuffle([...wordPool]).slice(0, 10);
    const allMeanings = getActiveTopics().flatMap(t => t.words.map(w => w.meaning));

    this.questions = selected.map(w => {
      // 3 wrong answers
      const wrongs = shuffle(allMeanings.filter(m => m !== w.meaning)).slice(0, 3);
      const options = shuffle([w.meaning, ...wrongs]);
      return {
        word: w.word,
        phonetic: w.phonetic,
        correct: w.meaning,
        options,
        topicId: w._topicId || topicId
      };
    });
    this.current = 0;
    this.score = 0;
    this.answered = false;
  },

  renderQuestion() {
    const q = this.questions[this.current];
    if (!q) return;

    document.getElementById('qz-score').textContent = this.score + ' điểm';
    document.getElementById('qz-counter').textContent = (this.current + 1) + ' / ' + this.questions.length;
    document.getElementById('qz-bar').style.width = ((this.current / this.questions.length) * 100) + '%';
    document.getElementById('qz-word').textContent = q.word;
    document.getElementById('qz-phonetic').textContent = q.phonetic;

    const container = document.getElementById('qz-options');
    container.innerHTML = q.options.map((opt, i) =>
      `<button class="quiz-option" onclick="Quiz.answer(${i})">${opt}</button>`
    ).join('');

    this.answered = false;
    speak(q.word);
  },

  answer(idx) {
    if (this.answered) return;
    this.answered = true;

    const q = this.questions[this.current];
    const btns = document.querySelectorAll('.quiz-option');
    const selected = q.options[idx];
    const correctIdx = q.options.indexOf(q.correct);

    // Mark correct
    btns[correctIdx].classList.add('correct');

    if (selected === q.correct) {
      this.score++;
      document.getElementById('qz-score').textContent = this.score + ' điểm';
    } else {
      btns[idx].classList.add('wrong');
    }

    // Disable all
    btns.forEach(b => b.classList.add('disabled'));

    // Next after delay
    setTimeout(() => {
      this.current++;
      if (this.current < this.questions.length) {
        this.renderQuestion();
      } else {
        this.showResult();
      }
    }, 1200);
  },

  showResult() {
    const total = this.questions.length;
    const pct = Math.round((this.score / total) * 100);

    Store.addQuizResult(this.topicId, this.score, total);

    let icon, title;
    if (pct >= 90) { icon = '🏆'; title = 'Xuất sắc!'; }
    else if (pct >= 70) { icon = '🎉'; title = 'Tuyệt vời!'; }
    else if (pct >= 50) { icon = '💪'; title = 'Khá tốt!'; }
    else { icon = '📖'; title = 'Cần ôn thêm!'; }

    document.getElementById('qr-icon').textContent = icon;
    document.getElementById('qr-title').textContent = title;
    document.getElementById('qr-score').textContent = this.score + ' / ' + total + ' câu đúng (' + pct + '%)';

    const barColor = pct >= 70 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
    const bar = document.getElementById('qr-bar');
    bar.style.background = barColor;
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = pct + '%'; }, 100);

    navigateTo('quiz-result');
  },

  restart() {
    if (this.topicId === 'random') {
      this.startRandom();
    } else {
      this.startTopic(this.topicId);
    }
  }
};

function renderQuizTopics() {
  const container = document.getElementById('quiz-topics');
  container.innerHTML = getActiveTopics().map(t =>
    `<button class="quiz-topic-btn" onclick="Quiz.startTopic('${t.id}')">
      <div class="qt-icon">${t.icon}</div>
      <div class="qt-name">${t.nameVi}</div>
    </button>`
  ).join('');
}

// ── Progress Screen ────────────────────────────
function refreshProgress() {
  const d = Store.get();
  document.getElementById('pg-streak').textContent = d.streak;
  document.getElementById('pg-total').textContent = Store.getTotalKnown();
  document.getElementById('pg-today').textContent = d.todayWords.length;
  document.getElementById('pg-quizzes').textContent = d.quizHistory.length;
  document.getElementById('pg-avg').textContent = Store.getAvgQuizScore() + '%';

  const container = document.getElementById('pg-topics');
  const allT = [...TOPICS, ...TOPICS_C1];
  container.innerHTML = allT.map(t => {
    const pct = Store.getTopicProgress(t.id);
    return `<div class="tp-item">
      <span class="tp-icon">${t.icon}</span>
      <div class="tp-info">
        <div class="tp-name">${t.nameVi}</div>
        <div class="tp-bar"><div class="tp-fill" style="width:${pct}%;background:${t.color}"></div></div>
      </div>
      <span class="tp-pct">${pct}%</span>
    </div>`;
  }).join('');
}

// ── Utilities ──────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2000);
}

function resetProgress() {
  if (confirm('Bạn chắc chắn muốn xóa toàn bộ tiến trình?')) {
    Store.reset();
    refreshHome();
    refreshProgress();
    showToast('🗑️ Đã xóa tiến trình');
  }
}

// ── Notification Scheduler ─────────────────────
const NotificationScheduler = {
  SETTINGS_KEY: 'vm_notif_settings',
  _timer: null,

  defaults() {
    return {
      enabled: false,
      intervalMinutes: 30,
      startHour: 8,
      endHour: 22,
      wordIndex: 0,
      level: 'B2',
      topicId: 'all',
      lastShownAt: null,
      serverUrl: '',        // URL Render.com, ví dụ: https://vocabmaster-push.onrender.com
      pushSubscription: null // JSON của PushSubscription (lưu để sync settings)
    };
  },

  getSettings() {
    try {
      const raw = localStorage.getItem(this.SETTINGS_KEY);
      return raw ? { ...this.defaults(), ...JSON.parse(raw) } : this.defaults();
    } catch { return this.defaults(); }
  },

  _save(s) {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(s));
    if (!s.serverUrl) this._syncToSW(s); // chỉ sync SW cache khi dùng local mode
  },

  // ── Vocabulary helpers ──────────────────────
  getWordPool(settings) {
    const s = settings || this.getSettings();
    const levelMap = { 'B2': TOPICS, 'C1': TOPICS_C1, 'C2': TOPICS_C2, 'IELTS': TOPICS_IELTS };
    const topics = levelMap[s.level] || TOPICS;
    if (s.topicId === 'all') return topics.flatMap(t => t.words.map(w => ({ ...w, topicId: t.id })));
    const topic = topics.find(t => t.id === s.topicId);
    return topic ? topic.words.map(w => ({ ...w, topicId: topic.id })) : [];
  },

  getNextWord() {
    const s = this.getSettings();
    const pool = this.getWordPool(s);
    if (!pool.length) return null;
    const unknown = pool.filter(w => !Store.isKnown(w.topicId, w.word));
    const wordList = unknown.length > 0 ? unknown : pool;
    const idx = s.wordIndex % wordList.length;
    s.wordIndex = (idx + 1) % wordList.length;
    this._save(s);
    return wordList[idx];
  },

  isWithinActiveHours() {
    const { startHour, endHour } = this.getSettings();
    const h = new Date().getHours();
    return h >= startHour && h < endHour;
  },

  // ── Permission ──────────────────────────────
  async requestPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    return (await Notification.requestPermission()) === 'granted';
  },

  // ── Local mode (Android / foreground) ───────
  async showNotification(word) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const body = word.phonetic + '\n' + word.meaning;
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification('📚 ' + word.word, {
        body, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png',
        tag: 'vocab-word', renotify: true, data: { url: '/' }
      });
    } catch (_) {
      new Notification('📚 ' + word.word, { body, icon: '/icons/icon-192.png' });
    }
    const s = this.getSettings();
    s.lastShownAt = new Date().toISOString();
    this._save(s);
  },

  _scheduleNext() {
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    const s = this.getSettings();
    if (!s.enabled || s.serverUrl) return; // server mode không cần local timer

    const intervalMs = s.intervalMinutes * 60 * 1000;
    const elapsed    = Date.now() - (s.lastShownAt ? new Date(s.lastShownAt).getTime() : 0);
    const remaining  = Math.max(5000, intervalMs - elapsed);

    this._timer = setTimeout(async () => {
      if (!this.getSettings().enabled) return;
      if (this.isWithinActiveHours()) {
        const word = this.getNextWord();
        if (word) await this.showNotification(word);
      }
      this._scheduleNext();
    }, remaining);
  },

  async _syncToSW(settings) {
    try {
      if (!('caches' in window)) return;
      const cache = await caches.open('vm-notif-v1');
      await cache.put('/notif-data', new Response(
        JSON.stringify({ settings, wordQueue: this.getWordPool(settings).slice(0, 100) }),
        { headers: { 'Content-Type': 'application/json' } }
      ));
    } catch (_) {}
  },

  async _registerPeriodicSync(intervalMinutes) {
    try {
      const reg = await navigator.serviceWorker.ready;
      if ('periodicSync' in reg)
        await reg.periodicSync.register('vocab-reminder', { minInterval: intervalMinutes * 60 * 1000 });
    } catch (_) {}
  },

  async _unregisterPeriodicSync() {
    try {
      const reg = await navigator.serviceWorker.ready;
      if ('periodicSync' in reg) await reg.periodicSync.unregister('vocab-reminder');
    } catch (_) {}
  },

  // ── Server push mode (iPhone compatible) ────
  _urlB64ToUint8Array(base64) {
    const pad = '='.repeat((4 - base64.length % 4) % 4);
    const b64 = (base64 + pad).replace(/-/g, '+').replace(/_/g, '/');
    return Uint8Array.from([...atob(b64)].map(c => c.charCodeAt(0)));
  },

  async _fetchVapidKey(serverUrl) {
    const res = await fetch(serverUrl + '/config');
    if (!res.ok) throw new Error('Server không phản hồi');
    const { vapidPublicKey } = await res.json();
    return vapidPublicKey;
  },

  async _subscribeToPush(vapidPublicKey) {
    const reg = await navigator.serviceWorker.ready;
    // Hủy subscription cũ nếu có
    const existing = await reg.pushManager.getSubscription();
    if (existing) await existing.unsubscribe();

    return reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this._urlB64ToUint8Array(vapidPublicKey)
    });
  },

  async _sendToServer(subscriptionObj, settings) {
    const url = settings.serverUrl;
    if (!url) return false;
    const res = await fetch(url + '/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscriptionObj.toJSON ? subscriptionObj.toJSON() : subscriptionObj,
        settings: {
          intervalMinutes: settings.intervalMinutes,
          startHour:       settings.startHour,
          endHour:         settings.endHour,
          utcOffset:       -(new Date().getTimezoneOffset() / 60), // +7 cho Việt Nam
          level:           settings.level,
          topicId:         settings.topicId
        }
      })
    });
    return res.ok;
  },

  async _removeFromServer(serverUrl, endpoint) {
    try {
      await fetch(serverUrl + '/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint })
      });
    } catch (_) {}
  },

  // Gọi sau mỗi lần thay đổi settings khi đang dùng server mode
  async _syncServerSettings() {
    const s = this.getSettings();
    if (!s.enabled || !s.serverUrl || !s.pushSubscription) return;
    try {
      await this._sendToServer(JSON.parse(s.pushSubscription), s);
    } catch (_) {}
  },

  // ── Public API ───────────────────────────────
  setServerUrl(url) {
    const s = this.getSettings();
    s.serverUrl = url.trim().replace(/\/$/, '');
    this._save(s);
  },

  async onToggle(enabled) {
    if (enabled) {
      const granted = await this.requestPermission();
      if (!granted) {
        showToast('❌ Cần cấp quyền thông báo trong cài đặt trình duyệt');
        document.getElementById('notif-toggle').checked = false;
        return;
      }
      const s = this.getSettings();

      if (s.serverUrl) {
        // ─ Server push mode ─
        try {
          showToast('⏳ Đang kết nối server...');
          const vapidKey      = await this._fetchVapidKey(s.serverUrl);
          const subscription  = await this._subscribeToPush(vapidKey);
          const ok            = await this._sendToServer(subscription, s);
          if (!ok) throw new Error('Server từ chối đăng ký');

          s.enabled          = true;
          s.pushSubscription = JSON.stringify(subscription.toJSON());
          this._save(s);
          showToast('✅ Đã bật — server sẽ nhắc đúng giờ trên iPhone!');
        } catch (e) {
          showToast('❌ Lỗi: ' + e.message);
          document.getElementById('notif-toggle').checked = false;
          return;
        }
      } else {
        // ─ Local mode (Android foreground) ─
        s.enabled = true;
        this._save(s);
        this._scheduleNext();
        await this._registerPeriodicSync(s.intervalMinutes);
        showToast('✅ Đã bật nhắc nhở (chế độ local)');
      }
    } else {
      const s = this.getSettings();
      if (s.serverUrl && s.pushSubscription) {
        try {
          const sub = JSON.parse(s.pushSubscription);
          await this._removeFromServer(s.serverUrl, sub.endpoint);
        } catch (_) {}
        // Hủy push subscription trong browser
        try {
          const reg      = await navigator.serviceWorker.ready;
          const existing = await reg.pushManager.getSubscription();
          if (existing) await existing.unsubscribe();
        } catch (_) {}
      }
      s.enabled = false;
      s.pushSubscription = null;
      this._save(s);
      if (this._timer) { clearTimeout(this._timer); this._timer = null; }
      await this._unregisterPeriodicSync();
      showToast('🔕 Đã tắt nhắc nhở');
    }
    refreshReminder();
  },

  setIntervalPref(minutes) {
    const s = this.getSettings();
    s.intervalMinutes = minutes;
    this._save(s);
    if (s.enabled && !s.serverUrl) this._scheduleNext();
    this._syncServerSettings();
    refreshReminder();
  },

  setStartHour(timeStr) {
    const s = this.getSettings();
    s.startHour = parseInt(timeStr.split(':')[0], 10);
    this._save(s);
    this._syncServerSettings();
  },

  setEndHour(timeStr) {
    const s = this.getSettings();
    s.endHour = parseInt(timeStr.split(':')[0], 10);
    this._save(s);
    this._syncServerSettings();
  },

  setLevel(level) {
    const s = this.getSettings();
    s.level = level; s.topicId = 'all'; s.wordIndex = 0;
    this._save(s);
    this._syncServerSettings();
    refreshReminder();
  },

  setTopic(topicId) {
    const s = this.getSettings();
    s.topicId = topicId; s.wordIndex = 0;
    this._save(s);
    this._syncServerSettings();
  },

  async preview() {
    const s = this.getSettings();
    if (s.serverUrl && s.pushSubscription) {
      // Yêu cầu server gửi ngay 1 từ
      try {
        const res = await fetch(s.serverUrl + '/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: JSON.parse(s.pushSubscription).endpoint })
        });
        if (res.ok) { showToast('📱 Server đã gửi thông báo thử!'); return; }
      } catch (_) {}
    }
    // Fallback: local notification
    const granted = await this.requestPermission();
    if (!granted) { showToast('❌ Cần cấp quyền thông báo'); return; }
    const word = this.getNextWord();
    if (!word) { showToast('❌ Không có từ nào trong bộ đã chọn'); return; }
    await this.showNotification(word);
    showToast('📱 Đã gửi thông báo thử!');
  },

  async init() {
    const s = this.getSettings();
    if (!s.enabled) return;
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      s.enabled = false; this._save(s); return;
    }
    if (s.serverUrl) {
      // Server mode: lấy subscription live từ browser, tự recover nếu expired
      try {
        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          // Subscription đã expired hoặc bị xóa — subscribe lại
          const vapidKey = await this._fetchVapidKey(s.serverUrl);
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this._urlB64ToUint8Array(vapidKey)
          });
        }
        // Sync subscription hiện tại (dù mới hay cũ) lên server
        const subJson = sub.toJSON ? sub.toJSON() : sub;
        await this._sendToServer(subJson, s);
        s.pushSubscription = JSON.stringify(subJson);
        this._save(s);
      } catch (_) {}
    } else {
      // Local mode
      this._scheduleNext();
      await this._registerPeriodicSync(s.intervalMinutes);
    }
  }
};

// ── Reminder Screen ────────────────────────────
function refreshReminder() {
  const s = NotificationScheduler.getSettings();

  const toggle = document.getElementById('notif-toggle');
  if (toggle) toggle.checked = s.enabled;

  const statusText = document.getElementById('notif-status-text');
  if (statusText) {
    if (!('Notification' in window)) {
      statusText.textContent = 'Trình duyệt không hỗ trợ thông báo';
    } else if (Notification.permission === 'denied') {
      statusText.textContent = '🚫 Bị chặn — mở cài đặt trình duyệt để cấp quyền';
    } else if (s.enabled) {
      const label = s.intervalMinutes < 60 ? s.intervalMinutes + ' phút' : (s.intervalMinutes / 60) + ' giờ';
      statusText.textContent = '✅ Đang bật — nhắc mỗi ' + label;
    } else {
      statusText.textContent = 'Chưa bật';
    }
  }

  // Interval chips
  document.querySelectorAll('.chip-btn[data-min]').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.min, 10) === s.intervalMinutes);
  });

  // Level chips
  document.querySelectorAll('.chip-btn[data-nlevel]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.nlevel === s.level);
  });

  // Time inputs
  const startInput = document.getElementById('notif-start');
  const endInput = document.getElementById('notif-end');
  if (startInput) startInput.value = String(s.startHour).padStart(2, '0') + ':00';
  if (endInput) endInput.value = String(s.endHour).padStart(2, '0') + ':00';

  // Topic select — rebuild options for current level
  const topicSelect = document.getElementById('notif-topic');
  if (topicSelect) {
    const levelMap = { 'B2': TOPICS, 'C1': TOPICS_C1, 'C2': TOPICS_C2, 'IELTS': TOPICS_IELTS };
    const topics = levelMap[s.level] || TOPICS;
    topicSelect.innerHTML = '<option value="all">Tất cả chủ đề</option>' +
      topics.map(t =>
        `<option value="${t.id}"${t.id === s.topicId ? ' selected' : ''}>${t.icon} ${t.nameVi}</option>`
      ).join('');
  }

  // Server URL input
  const urlInput = document.getElementById('server-url-input');
  if (urlInput && !urlInput.matches(':focus')) urlInput.value = s.serverUrl || '';

  // Server status
  const serverStatus = document.getElementById('server-status');
  if (serverStatus) {
    if (s.serverUrl) {
      serverStatus.textContent = s.enabled && s.pushSubscription
        ? '✅ Đã kết nối server — nhận thông báo cả khi đóng app'
        : '⚡ URL đã lưu — bật nhắc nhở để đăng ký';
    } else {
      serverStatus.textContent = 'Chế độ local: chỉ hoạt động khi app đang mở (Android)';
    }
  }

  // Bell badge on nav if enabled
  const navReminder = document.getElementById('nav-reminder');
  if (navReminder) {
    navReminder.querySelector('.nav-icon').textContent = s.enabled ? '🔔' : '🔕';
  }
}

// ── Word Lookup Module ─────────────────────────
const WordLookup = {
  current: null,

  async search() {
    const input = document.getElementById('lookup-input');
    const word = (input?.value || '').trim();
    if (!word) return;

    const resultEl = document.getElementById('lookup-result');
    resultEl.classList.remove('hidden');
    resultEl.innerHTML = '<div class="lookup-loading">⏳ Đang tra từ...</div>';

    const btn = document.querySelector('.lookup-btn');
    if (btn) btn.disabled = true;

    try {
      const res = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(word));
      if (!res.ok) throw new Error('not found');
      const [entry] = await res.json();

      const phonetic    = (entry.phonetics || []).find(p => p.text)?.text || entry.phonetic || '';
      const meaning     = (entry.meanings || [])[0];
      const def         = (meaning?.definitions || [])[0];

      this.current = {
        word:         entry.word || word,
        phonetic,
        definition:   def?.definition   || '',
        example:      def?.example      || '',
        partOfSpeech: meaning?.partOfSpeech || ''
      };
      this.renderResult();
    } catch {
      resultEl.innerHTML = '<div class="lookup-not-found">❌ Không tìm thấy từ "<strong>' +
        word.replace(/</g, '&lt;') + '</strong>".<br>Thử kiểm tra lại chính tả.</div>';
    } finally {
      if (btn) btn.disabled = false;
    }
  },

  renderResult() {
    const c = this.current;
    const resultEl = document.getElementById('lookup-result');
    const safeWord = c.word.replace(/'/g, '&#39;');

    resultEl.innerHTML =
      '<div class="lookup-word-card">' +
        '<div class="lookup-word-header">' +
          '<div class="lookup-word-text">' + c.word + '</div>' +
          '<button class="lookup-speak-btn" onclick="speak(\'' + safeWord + '\')" aria-label="Phát âm">🔊</button>' +
        '</div>' +
        (c.phonetic ? '<div class="lookup-phonetic">' + c.phonetic + '</div>' : '') +
        (c.partOfSpeech ? '<span class="lookup-pos">' + c.partOfSpeech + '</span>' : '') +
        '<div class="lookup-def-label">Định nghĩa (EN)</div>' +
        '<div class="lookup-def-text">' + (c.definition || '—') + '</div>' +
      '</div>' +
      '<div class="lookup-save-card">' +
        '<div class="lookup-field-gap">' +
          '<div class="lookup-field-label">Câu ví dụ</div>' +
          '<textarea id="lookup-example-input" class="lookup-textarea" rows="2">' + c.example + '</textarea>' +
        '</div>' +
        '<div class="lookup-field-gap">' +
          '<div class="lookup-field-label">Nghĩa tiếng Việt <span style="color:var(--danger)">*</span></div>' +
          '<input id="lookup-vi-input" type="text" class="lookup-vi-input"' +
          ' placeholder="Nhập nghĩa tiếng Việt..." autocomplete="off">' +
        '</div>' +
        '<div class="lookup-field-gap">' +
          '<div class="lookup-field-label">Lưu vào chủ đề</div>' +
          '<select id="lookup-topic-select" class="lookup-topic-select">' + this._buildTopicOptions() + '</select>' +
        '</div>' +
        '<button class="lookup-save-btn" onclick="WordLookup.save()">⭐ Lưu vào từ vựng</button>' +
      '</div>';
  },

  _buildTopicOptions() {
    const levels = [
      { label: 'B2 — Upper Intermediate', topics: TOPICS },
      { label: 'C1 — Advanced',           topics: TOPICS_C1 },
      { label: 'C2 — Mastery',            topics: TOPICS_C2 },
      { label: 'IELTS Academic',           topics: TOPICS_IELTS }
    ];
    const defaultId = getActiveTopics()[0]?.id || '';
    return levels.map(lvl =>
      '<optgroup label="' + lvl.label + '">' +
      lvl.topics.map(t =>
        '<option value="' + t.id + '"' + (t.id === defaultId ? ' selected' : '') + '>' +
        t.icon + ' ' + t.nameVi + '</option>'
      ).join('') +
      '</optgroup>'
    ).join('');
  },

  save() {
    if (!this.current) return;
    const topicId   = document.getElementById('lookup-topic-select').value;
    const viMeaning = document.getElementById('lookup-vi-input').value.trim();
    const example   = document.getElementById('lookup-example-input').value.trim();

    if (!viMeaning) { showToast('⚠️ Vui lòng nhập nghĩa tiếng Việt!'); return; }

    const custom = JSON.parse(localStorage.getItem('vm_custom_words') || '{}');
    if (!custom[topicId]) custom[topicId] = [];

    const wordObj = {
      word:     this.current.word,
      phonetic: this.current.phonetic,
      meaning:  viMeaning,
      example:  example || this.current.example
    };

    if (!custom[topicId].find(w => w.word === wordObj.word)) {
      custom[topicId].push(wordObj);
      const topic = getAllTopics().find(t => t.id === topicId);
      if (topic && !topic.words.find(w => w.word === wordObj.word)) topic.words.push(wordObj);
    }

    localStorage.setItem('vm_custom_words', JSON.stringify(custom));
    const topicName = getAllTopics().find(t => t.id === topicId)?.nameVi || topicId;
    showToast('⭐ Đã lưu "' + wordObj.word + '" vào ' + topicName);

    document.getElementById('lookup-input').value = '';
    document.getElementById('lookup-result').classList.add('hidden');
    this.current = null;
  }
};

// ── Init ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Store.load();

  // Merge user-added custom words into in-memory topic arrays
  try {
    const custom = JSON.parse(localStorage.getItem('vm_custom_words') || '{}');
    for (const [topicId, words] of Object.entries(custom)) {
      const topic = getAllTopics().find(t => t.id === topicId);
      if (topic) {
        words.forEach(w => {
          if (!topic.words.find(x => x.word === w.word)) topic.words.push(w);
        });
      }
    }
  } catch (_) {}

  const savedLevel = localStorage.getItem('vm_level');
  if (savedLevel && ['B2', 'C1', 'C2', 'IELTS'].includes(savedLevel)) {
    currentLevel = savedLevel;
    document.querySelectorAll('.level-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === savedLevel);
    });
  }
  refreshHome();
  NotificationScheduler.init();
});
