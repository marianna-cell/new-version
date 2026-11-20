/**
 * views.js — экраны приложения: вход → карта → тема → профиль → лидерборд.
 * Каждая функция возвращает DOM-узел и получает объект ctx { go }.
 */
import { el, initials, toast, confetti } from './ui.js';
import * as store from './store.js';
import { loadSubject, cellKey, QUESTIONS_PER_TOPIC } from './data.js';

/* ---------------- Вход / регистрация ---------------- */
export function LoginView({ onDone }) {
  const email = el('input', {
    id: 'email', type: 'email', placeholder: 'you@example.com',
    autocomplete: 'email', required: true,
  });
  const password = el('input', {
    id: 'password', type: 'password', placeholder: 'Минимум 6 символов',
    autocomplete: 'current-password', required: true,
  });
  const name = el('input', {
    id: 'name', type: 'text', placeholder: 'Как тебя зовут?',
    autocomplete: 'nickname', maxlength: '24',
  });

  const emailErr = el('p', { class: 'err', role: 'alert' });
  const passErr = el('p', { class: 'err', role: 'alert' });
  const nameErr = el('p', { class: 'err', role: 'alert' });
  const formErr = el('p', { class: 'err', role: 'alert' });

  const nameField = el('div', { class: 'field' },
    el('label', { for: 'name' }, 'Имя (для регистрации)'),
    name,
    nameErr,
  );

  function clearErrors() {
    emailErr.textContent = '';
    passErr.textContent = '';
    nameErr.textContent = '';
    formErr.textContent = '';
  }

  function handle(action) {
    clearErrors();
    try {
      if (action === 'register') {
        store.register(email.value, password.value, name.value);
      } else {
        store.loginWithPassword(email.value, password.value);
      }
      onDone();
    } catch (err) {
      const msg = err.message;
      if (msg.includes('email')) emailErr.textContent = msg;
      else if (msg.includes('Пароль') || msg.includes('пароль')) passErr.textContent = msg;
      else if (msg.includes('имя') || msg.includes('Имя')) nameErr.textContent = msg;
      else formErr.textContent = msg;
    }
  }

  const form = el('form', {
    onsubmit: (e) => {
      e.preventDefault();
      handle('login');
    },
  },
    el('div', { class: 'field' },
      el('label', { for: 'email' }, 'Email'),
      email,
      emailErr,
    ),
    el('div', { class: 'field' },
      el('label', { for: 'password' }, 'Пароль'),
      password,
      passErr,
    ),
    nameField,
    formErr,
    el('div', { class: 'auth-actions' },
      el('button', { class: 'btn btn-primary', type: 'submit' }, 'Войти'),
      el('button', {
        class: 'btn',
        type: 'button',
        onclick: () => handle('register'),
      }, 'Зарегистрироваться'),
    ),
  );

  setTimeout(() => email.focus(), 60);

  return el('div', { class: 'login-wrap' },
    el('div', { class: 'login-card fade-up' },
      el('div', { class: 'brand', style: 'margin-bottom:1.25rem' },
        el('i', { class: 'dot' }), 'Knowledge ', el('span', { class: 'accent' }, 'Wars'),
      ),
      el('h1', {}, 'Захвати ', el('em', {}, 'знания')),
      el('p', { class: 'sub' },
        'Проходи карточки, отвечай верно и забирай клетки карты. 8 из 10 — клетка твоя.',
      ),
      form,
      el('p', { class: 'muted', style: 'font-size:0.75rem;margin-top:1rem' },
        'MVP: аккаунты и прогресс хранятся локально в браузере.',
      ),
    ),
  );
}

/* ---------------- Карта знаний ---------------- */
export function MapView({ go }) {
  const wrap = el('div', { class: 'fade-up' });
  const grid = el('div', { class: 'map-grid' });
  const subject = store.getSubject();

  loadSubject(subject).then((topics) => {
    const captured = store.capturedCount();
    const user = store.getState().user;

    wrap.append(
      el('div', { class: 'page-head' },
        el('h2', {}, 'Карта знаний'),
        el('p', {}, `${topics.length} тем · захвачено ${captured} · 10 вопросов в теме`),
      ),
      el('div', { class: 'stats-row' },
        stat('Клеток', `${captured}/${topics.length}`),
        stat('Очки', user.points),
        stat('Streak', user.streak + ' дн.'),
      ),
      grid,
    );

    topics.forEach((topic, i) => {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const key = cellKey(row, col);
      const progress = store.getProgress(topic.id);
      const enemyId = store.rivalOwner(key);
      const enemy = enemyId ? store.rivalById(enemyId) : null;

      const unlocked = store.isStartCell(key) || progress.captured || hasCapturedNeighbour(row, col, topics);

      let cls = 'cell';
      if (progress.captured) cls += ' mine';
      else if (enemy) cls += ' enemy';
      else if (!unlocked) cls += ' locked';
      if (store.isStartCell(key)) cls += ' start';

      const pct = progress.captured ? 100 : progress.best;

      grid.append(el('button', {
        class: cls,
        type: 'button',
        'aria-label': `${topic.title}: ${progress.captured ? 'захвачено' : enemy ? 'занято ' + enemy.name : unlocked ? 'доступно' : 'закрыто'}, прогресс ${pct}%`,
        onclick: () => {
          if (enemy) return toast(`Клетка занята: ${enemy.name}. Дуэли — в следующем этапе.`);
          if (!unlocked) return toast('Сначала захвати соседнюю клетку');
          go({ view: 'quiz', topicId: topic.id });
        },
      },
        el('span', { class: 'icon' }, topic.icon),
        el('span', { class: 'name' }, topic.title),
        el('span', { class: 'meta' },
          progress.captured ? 'захвачено' : `${pct}% · ${topic.questions.length} вопр.`,
        ),
        enemy && !progress.captured ? el('span', { class: 'owner' }, enemy.name) : null,
        !unlocked && !enemy
          ? el('span', { class: 'lock', html: '<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>' })
          : null,
        el('span', { class: 'bar' }, el('i', { style: `width:${pct}%` })),
      ));
    });
  }).catch((e) => {
    wrap.append(el('p', { class: 'err' }, 'Ошибка загрузки карты: ' + e.message));
  });

  return wrap;
}

function stat(k, v) {
  return el('div', { class: 'stat' },
    el('div', { class: 'k' }, k),
    el('div', { class: 'v' }, String(v)),
  );
}

function hasCapturedNeighbour(row, col, topics) {
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  return dirs.some(([dr, dc]) => {
    const r = row + dr;
    const c = col + dc;
    if (r < 0 || r > 4 || c < 0 || c > 4) return false;
    const t = topics[r * 5 + c];
    return t && store.isCaptured(t.id);
  });
}

/* ---------------- Экран темы (квиз) ---------------- */
export function QuizView({ go, topicId }) {
  const wrap = el('div', { class: 'fade-up' });
  let topic = null;
  let index = 0;
  let correct = 0;
  const answers = [];

  loadSubject(store.getSubject()).then((topics) => {
    topic = topics.find((t) => t.id === topicId);
    if (!topic) {
      wrap.append(el('p', { class: 'err' }, 'Тема не найдена'));
      return;
    }
    renderQuestion();
  });

  const progressBar = el('div', { class: 'quiz-progress' });
  const panel = el('div', { class: 'card-panel' });
  const title = el('h2', { style: 'font-size:1.35rem' });

  const head = el('div', { class: 'quiz-head' },
    el('div', { class: 'quiz-head-row' },
      title,
      progressBar,
    ),
  );
  wrap.append(
    el('div', { class: 'quiz-wrap' },
      el('button', { class: 'btn btn-ghost back', onclick: () => go({ view: 'map' }) }, '← Карта'),
      head,
      panel,
    ),
  );

  function renderQuestion() {
    const q = topic.questions[index];
    title.textContent = `${topic.title} · ${index + 1}/${topic.questions.length}`;
    progressBar.replaceChildren(
      ...topic.questions.map((_, i) =>
        el('i', { class: i < index ? (answers[i] ? 'done' : 'bad') : '' }),
      ),
    );

    const optionNodes = q.o.map((text, i) =>
      el('button', {
        class: 'option',
        type: 'button',
        onclick: (e) => answer(i, e.currentTarget),
      },
        el('span', { class: 'key' }, 'ABCD'[i]),
        el('span', {}, text),
      ),
    );

    panel.replaceChildren(
      el('p', { class: 'q' }, q.q),
      el('div', { class: 'options' }, ...optionNodes),
    );
  }

  function answer(choice, node) {
    const q = topic.questions[index];
    const isRight = choice === q.a;
    answers[index] = isRight;
    if (isRight) correct++;

    const buttons = [...panel.querySelectorAll('.option')];
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (i === q.a) b.classList.add('correct');
      else if (i === choice) b.classList.add('wrong');
    });
    node.classList.add(isRight ? 'correct' : 'wrong');

    setTimeout(() => {
      index++;
      if (index < topic.questions.length) renderQuestion();
      else renderResult();
    }, 750);
  }

  function renderResult() {
    const total = topic.questions.length;
    const result = store.submitAttempt(topic.id, correct, total);
    const win = result.captured;
    progressBar.replaceChildren(...answers.map((a) => el('i', { class: a ? 'done' : 'bad' })));
    title.textContent = topic.title;

    if (result.justCaptured) {
      confetti();
      toast('Клетка захвачена! +150 очков');
    }

    panel.replaceChildren(
      el('div', { class: `result ${win ? 'win' : 'lose'}` },
        el('div', { class: 'score' }, `${correct}/${total}`),
        el('div', { class: 'verdict' }, win ? 'Клетка твоя! 🎉' : 'Почти получилось'),
        el('p', { class: 'hint' },
          win
            ? `Точность ${result.pct}% · +${result.gained} очков`
            : `Нужно 80% (8 из ${total}). Твой лучший результат: ${store.getProgress(topic.id).best}%`,
        ),
        el('div', { class: 'actions' },
          el('button', { class: 'btn btn-primary', onclick: () => go({ view: 'map' }) }, 'К карте'),
          !win ? el('button', { class: 'btn', onclick: () => go({ view: 'quiz', topicId: topic.id }) }, 'Ещё раз') : null,
        ),
      ),
    );
  }

  return wrap;
}

/* ---------------- Профиль ---------------- */
export function ProfileView({ go }) {
  const user = store.getState().user;
  const captured = store.capturedCount();

  return el('div', { class: 'fade-up' },
    el('div', { class: 'page-head' },
      el('h2', {}, 'Профиль'),
      el('p', {}, 'Статистика твоего прогресса'),
    ),
    el('div', { class: 'panel' },
      el('div', { class: 'profile-top' },
        el('div', { class: 'avatar', style: `background:${user.color};color:#04070f` }, initials(user.name)),
        el('div', {},
          el('h2', {}, user.name),
          el('p', { class: 'sub', style: 'color:var(--muted)' }, user.email ?? 'Игрок Knowledge Wars'),
        ),
      ),
      el('div', { class: 'stats-row stats-4', style: 'margin-bottom:0' },
        stat('Захвачено', `${captured}/25`),
        stat('Очки', user.points),
        stat('Streak', user.streak + ' дн.'),
        stat('Прогресс', Math.round((captured / 25) * 100) + '%'),
      ),
    ),
    el('div', { class: 'panel' },
      el('h3', { style: 'font-size:1rem;margin-bottom:0.75rem' }, 'Аккаунт'),
      el('p', { class: 'muted', style: 'font-size:0.85rem;line-height:1.6;margin-bottom:1rem' },
        'Данные хранятся локально (localStorage). После подключения Supabase профиль будет синхронизироваться между устройствами.',
      ),
      el('div', { style: 'display:flex;gap:0.6rem;flex-wrap:wrap' },
        el('button', { class: 'btn btn-primary', onclick: () => go({ view: 'map' }) }, 'Играть'),
        el('button', {
          class: 'btn',
          onclick: () => {
            if (confirm('Сбросить весь прогресс?')) {
              store.resetAll();
              go({ view: 'login' });
            }
          },
        }, 'Сбросить прогресс'),
        el('button', {
          class: 'btn btn-ghost',
          onclick: () => { store.logout(); go({ view: 'login' }); },
        }, 'Выйти'),
      ),
    ),
  );
}

/* ---------------- Лидерборд ---------------- */
export function LeaderboardView({ go }) {
  const rows = store.leaderboard();
  const list = el('div', { class: 'lb-list' });

  rows.forEach((r, i) => {
    const rank = i + 1;
    list.append(
      el('div', {
        class: `lb-row${r.isMe ? ' me' : ''}${rank <= 3 ? ' top' + rank : ''}`,
      },
        el('span', { class: 'rank' }, String(rank).padStart(2, '0')),
        el('span', { class: 'who' },
          el('i', { class: 'avatar', style: `background:${r.color};color:#04070f;width:24px;height:24px;font-size:0.68rem` }, initials(r.name)),
          r.name,
          r.isMe ? el('span', { style: 'font-size:0.65rem;color:var(--cyan);font-weight:700' }, 'ТЫ') : null,
        ),
        el('span', { class: 'cells' }, `${r.captured} клеток`),
        el('span', { class: 'pts' }, r.points.toLocaleString('ru-RU')),
      ),
    );
  });

  return el('div', { class: 'fade-up' },
    el('div', { class: 'page-head' },
      el('h2', {}, 'Лидерборд'),
      el('p', {}, 'Топ-10 по очкам'),
    ),
    el('div', { class: 'panel' }, list),
    el('div', { style: 'margin-top:1rem' },
      el('button', { class: 'btn btn-primary', onclick: () => go({ view: 'map' }) }, 'Захватить больше клеток'),
    ),
  );
}