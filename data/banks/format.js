/**
 * format.js — разбор компактного формата банка вопросов.
 *
 * Каждая тема описана строкой-блоком: по одному вопросу на строку,
 * поля разделены символом «~» (не «|», чтобы не конфликтовать с модулями |x|):
 *     вопрос~правильный ответ~неверный~неверный~неверный
 *
 * Пример:
 *     "Какая буква пропущена: с_бака?~о~а~ы~и"
 *
 * Порядок вариантов перемешивается детерминированно (по индексу темы и вопроса),
 * чтобы правильный ответ не всегда стоял первым, но при перезагрузке не «прыгал».
 */

/** Простой детерминированный хеш строки -> 32-битное число. */
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Детерминированная перестановка массива (Fisher–Yates на seeded PRNG). */
function shuffle(arr, seed) {
  const out = arr.slice();
  let s = seed || 1;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Превращает блок «вопрос|верно|неверно|...» в массив вопросов {q, o, a}.
 * @param {string} block — многострочный текст банка
 * @param {string} topicId — id темы (для seed и уникальности)
 */
export function parseBank(block, topicId) {
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line, i) => {
      const [q, correct, ...wrongs] = line.split('~').map((s) => s.trim());
      const options = shuffle([correct, ...wrongs], hash(topicId + ':' + i));
      return { q, o: options, a: options.indexOf(correct) };
    });
}

/** Собирает темы предмета: план из topics.json + вопросы из банка. */
export function mergeBank(subject, plan, bank) {
  return plan
    .filter((t) => t.subject === subject)
    .map((t) => ({
      ...t,
      questions: bank[t.id] ? parseBank(bank[t.id], t.id) : [],
    }));
}