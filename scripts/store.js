/**
 * store.js — слой данных и состояния.
 *
 * Сейчас всё хранится в localStorage (fallback-режим, работает без бэкенда).
 * TODO(supabase): когда появится Supabase — заменить register()/loginWithPassword()/saveState()
 *   на вызовы supabase.auth (email + пароль) и таблицы:
 *     profiles (id, email, name, color, points, streak, last_active_day)
 *     progress (user_id, subject, topic_id, best_score, captured, attempts)
 *   Интерфейс наружу (getState, login, submitAttempt) менять не придётся.
 */

const STORAGE_KEY = 'knowledge-wars:v1';
const ACCOUNTS_KEY = 'kw:accounts';
const SUBJECT_KEY = 'kw:subject';

export const COLORS = ['#22d3ee', '#f472b6', '#a3e635', '#fbbf24', '#c084fc'];
export const SUBJECTS = ['math', 'russian', 'physics', 'english', 'ege_math'];

/** Захардкоженные соперники для лидерборда. TODO(supabase): заменить реальными профилями. */
const RIVALS = [
  { id: 'r1', name: 'NeoMatrix', points: 4820, color: '#22d3ee', captured: 14 },
  { id: 'r2', name: 'Ksenia_Pro', points: 4310, color: '#f472b6', captured: 12 },
  { id: 'r3', name: 'IntegralBoss', points: 3990, color: '#a3e635', captured: 11 },
  { id: 'r4', name: 'ZeroDivide', points: 3120, color: '#fbbf24', captured: 9 },
  { id: 'r5', name: 'Logarifmich', points: 2480, color: '#c084fc', captured: 7 },
];

/** Клетки, изначально занятые соперниками. TODO(duels): отбивать их в реальном PvP-матче. */
const RIVAL_CELLS = {
  '0-0': 'r1', '0-4': 'r2', '4-0': 'r3', '4-4': 'r4', '2-4': 'r5',
};

const START_CELL = '2-2';

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

/* ---------------- Аккаунты (email + пароль) ---------------- */

/**
 * Простое хеширование пароля. НЕ криптостойко — только чтобы не хранить открытый текст.
 * TODO(supabase): убрать, пароли будет хранить Supabase Auth (bcrypt).
 */
function hashPassword(password) {
  const salted = 'kw::' + password + '::wars';
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < salted.length; i++) {
    const c = salted.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 + c, 2246822519) >>> 0;
  }
  return h1.toString(36) + '.' + h2.toString(36);
}

function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.warn('Не удалось сохранить аккаунты', e);
  }
}

function normaliseEmail(email) {
  return String(email || '').trim().toLowerCase();
}

/* ---------------- Состояние сессии ---------------- */

function emptyState() {
  return { user: null, progress: {} };
}

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptyState();
    return { user: parsed.user ?? null, progress: parsed.progress ?? {} };
  } catch {
    return emptyState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Не удалось сохранить состояние', e);
  }
}

/** Сохраняет прогресс текущего пользователя в его аккаунт. */
function syncProgressToAccount() {
  if (!state.user?.email) return;
  const accounts = loadAccounts();
  const acc = accounts[state.user.email];
  if (!acc) return;
  acc.progress = state.progress;
  acc.user = state.user;
  saveAccounts(accounts);
}

export function getState() {
  return state;
}

export function isLoggedIn() {
  return Boolean(state.user);
}

/* ---------------- Предмет ---------------- */

export function getSubject() {
  try {
    const stored = localStorage.getItem(SUBJECT_KEY);
    if (stored && SUBJECTS.includes(stored)) return stored;
  } catch { /* ignore */ }
  return state.user?.subject ?? 'math';
}

export function setSubject(subject) {
  const next = SUBJECTS.includes(subject) ? subject : 'math';
  try {
    localStorage.setItem(SUBJECT_KEY, next);
  } catch { /* ignore */ }
  if (state.user) {
    state.user.subject = next;
    saveState();
    syncProgressToAccount();
  }
  return next;
}

/* ---------------- Вход / регистрация ---------------- */

/**
 * Регистрация по email + паролю.
 * @throws {Error} если email занят или данные некорректны
 */
export function register(email, password, name) {
  const mail = normaliseEmail(email);
  const clean = String(name || '').trim().slice(0, 24);

  if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) throw new Error('Введите корректный email');
  if (!password || String(password).length < 6) throw new Error('Пароль должен быть не короче 6 символов');
  if (!clean) throw new Error('Введите имя');

  const accounts = loadAccounts();
  if (accounts[mail]) throw new Error('Пользователь с таким email уже существует');

  const user = {
    id: mail,
    email: mail,
    name: clean,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    points: 0,
    streak: 1,
    lastActiveDay: todayKey(),
    createdAt: new Date().toISOString(),
    subject: getSubject(),
  };

  accounts[mail] = { password: hashPassword(password), name: clean, progress: {}, user };
  saveAccounts(accounts);

  state = { user, progress: {} };
  saveState();
  return user;
}

/**
 * Вход по email + паролю. Восстанавливает прогресс аккаунта.
 * @throws {Error} «Пользователь не найден» / «Неверный пароль»
 */
export function loginWithPassword(email, password) {
  const mail = normaliseEmail(email);
  if (!mail) throw new Error('Введите email');
  if (!password) throw new Error('Введите пароль');

  const accounts = loadAccounts();
  const acc = accounts[mail];
  if (!acc) throw new Error('Пользователь не найден');
  if (acc.password !== hashPassword(password)) throw new Error('Неверный пароль');

  const user = acc.user ?? {
    id: mail,
    email: mail,
    name: acc.name,
    color: COLORS[0],
    points: 0,
    streak: 1,
    lastActiveDay: todayKey(),
    createdAt: new Date().toISOString(),
  };
  user.email = mail;
  user.subject = getSubject();

  state = { user, progress: acc.progress ?? {} };
  touchStreak();
  saveState();
  syncProgressToAccount();
  return state.user;
}

/**
 * Быстрый вход по имени без пароля (оставлен для совместимости).
 * TODO(supabase): удалить после подключения полноценной аутентификации.
 */
export function login(name) {
  const clean = String(name || '').trim().slice(0, 24);
  if (!clean) throw new Error('Введите имя');
  const existing = state.user;
  state.user = {
    id: existing?.id ?? 'me',
    name: clean,
    color: existing?.color ?? COLORS[Math.floor(Math.random() * COLORS.length)],
    points: existing?.points ?? 0,
    streak: existing?.streak ?? 1,
    lastActiveDay: existing?.lastActiveDay ?? todayKey(),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    subject: getSubject(),
  };
  touchStreak();
  saveState();
  return state.user;
}

export function logout() {
  syncProgressToAccount();
  state = emptyState();
  saveState();
}

/** Обновляет streak: +1 если заходил вчера, сброс если пропустил день. */
export function touchStreak() {
  const user = state.user;
  if (!user) return;
  const today = todayKey();
  if (user.lastActiveDay === today) return;
  const yesterday = todayKey(new Date(Date.now() - 86400000));
  user.streak = user.lastActiveDay === yesterday ? user.streak + 1 : 1;
  user.lastActiveDay = today;
  saveState();
}

/* ---------------- Прогресс ---------------- */

/** Ключ прогресса: предмет + тема (у каждого предмета своя карта). */
function progressKey(topicId) {
  return `${getSubject()}::${topicId}`;
}

export function getProgress(topicId) {
  return state.progress[progressKey(topicId)] ?? { best: 0, captured: false, attempts: 0 };
}

export function isCaptured(topicId) {
  return getProgress(topicId).captured;
}

export function rivalOwner(cellKey) {
  return RIVAL_CELLS[cellKey] ?? null;
}

export function isStartCell(cellKey) {
  return cellKey === START_CELL;
}

export function rivalById(id) {
  return RIVALS.find((r) => r.id === id) ?? null;
}

/**
 * Сохраняет результат прохождения темы.
 * 8/10 (80%) и выше → клетка захвачена, прогресс 100%.
 * TODO(supabase): upsert в таблицу progress + RPC инкремента очков.
 */
export function submitAttempt(topicId, correct, total) {
  const pct = Math.round((correct / total) * 100);
  const key = progressKey(topicId);
  const prev = state.progress[key] ?? { best: 0, captured: false, attempts: 0 };
  const captured = pct >= 80 ? true : prev.captured;
  const next = {
    best: Math.max(prev.best, pct),
    captured,
    attempts: prev.attempts + 1,
  };
  state.progress[key] = next;

  if (state.user) {
    // Очки: 20 за правильный ответ + 150 бонус за захват клетки.
    let gained = correct * 20;
    if (captured && !prev.captured) gained += 150;
    state.user.points += gained;
    touchStreak();
    saveState();
    syncProgressToAccount();
    return { pct, captured, gained, justCaptured: captured && !prev.captured };
  }
  saveState();
  return { pct, captured, gained: 0, justCaptured: false };
}

/** Сколько клеток захвачено в текущем предмете. */
export function capturedCount() {
  const prefix = getSubject() + '::';
  return Object.entries(state.progress)
    .filter(([k, p]) => k.startsWith(prefix) && p.captured)
    .length;
}

/** Топ-10: соперники + текущий пользователь. */
export function leaderboard() {
  const rows = RIVALS.map((r) => ({ ...r, isMe: false }));
  if (state.user) {
    rows.push({
      id: state.user.id,
      name: state.user.name,
      points: state.user.points,
      color: state.user.color,
      captured: capturedCount(),
      isMe: true,
    });
  }
  return rows.sort((a, b) => b.points - a.points).slice(0, 10);
}

export function resetAll() {
  if (state.user?.email) {
    const accounts = loadAccounts();
    if (accounts[state.user.email]) {
      accounts[state.user.email].progress = {};
      accounts[state.user.email].user.points = 0;
      saveAccounts(accounts);
    }
  }
  state = emptyState();
  saveState();
}