/** main.js — роутер и каркас приложения. */
import { el, initials } from './ui.js';
import * as store from './store.js';
import { LoginView, MapView, QuizView, ProfileView, LeaderboardView } from './views.js';

const app = document.getElementById('app');
let route = { view: 'map' };

const SUBJECT_LABELS = {
  math: 'Математика',
  russian: 'Русский',
  physics: 'Физика',
  english: 'Английский',
  ege_math: 'ЕГЭ Математика',
};

function go(next) {
  route = next;
  render();
  window.scrollTo({ top: 0 });
}

function render() {
  if (!store.isLoggedIn()) {
    app.replaceChildren(LoginView({ onDone: () => go({ view: 'map' }) }));
    return;
  }

  store.touchStreak();
  const user = store.getState().user;
  const navItems = [
    ['map', 'Карта'],
    ['profile', 'Профиль'],
    ['leaderboard', 'Лидеры'],
  ];

  const nav = el('nav', { class: 'nav', 'aria-label': 'Основная навигация' },
    ...navItems.map(([view, label]) =>
      el('button', {
        class: route.view === view || (view === 'map' && route.view === 'quiz') ? 'active' : '',
        type: 'button',
        onclick: () => go({ view }),
      }, label),
    ),
  );

  // Выбор предмета: карта всегда 5×5, меняется только набор тем.
  const subjectSelect = el('select', {
    class: 'subject-select',
    'aria-label': 'Выбор предмета',
    onchange: (e) => {
      store.setSubject(e.target.value);
      go({ view: 'map' });
    },
  },
    ...store.SUBJECTS.map((s) =>
      el('option', { value: s, selected: store.getSubject() === s }, SUBJECT_LABELS[s] ?? s),
    ),
  );

  const topbar = el('header', { class: 'topbar' },
    el('a', { class: 'brand', href: '/landing.html', 'aria-label': 'На главную' },
      el('i', { class: 'dot' }), 'Knowledge ', el('span', { class: 'accent' }, 'Wars'),
    ),
    nav,
    el('div', { class: 'topbar-right' },
      subjectSelect,
      el('div', { class: 'userchip' },
        el('i', { class: 'avatar', style: `background:${user.color};color:#04070f` }, initials(user.name)),
        el('span', {}, user.name),
        el('span', { class: 'mono', style: 'color:var(--cyan);font-weight:700' }, `${user.points}`),
      ),
    ),
  );

  // Кнопка возврата на лендинг — видна на всех экранах.
  const homeBtn = el('a', { class: 'btn btn-ghost home-btn', href: '/landing.html' }, '← На главную');

  let content;
  switch (route.view) {
    case 'quiz': content = QuizView({ go, topicId: route.topicId }); break;
    case 'profile': content = ProfileView({ go }); break;
    case 'leaderboard': content = LeaderboardView({ go }); break;
    default: content = MapView({ go });
  }

  app.replaceChildren(el('div', { class: 'shell' }, topbar, homeBtn, content));
}

render();

// PWA. В sandbox-превью (без allow-same-origin) доступ к navigator.serviceWorker бросает
// SecurityError — поэтому всё обёрнуто в try/catch.
window.addEventListener('load', () => {
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  } catch {
    /* PWA недоступна в этом окружении */
  }
});