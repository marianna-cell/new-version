/**
 * data.js — загрузка учебного плана и банков вопросов.
 *
 * Источники контента:
 *   /data/topics.json      — 5 предметов × 25 тем (план карты 5×5)
 *   /data/banks/<subject>.js — по 10 вопросов на каждую тему
 *
 * Чтобы заменить вопросы — правьте только файл банка нужного предмета.
 * TODO(llm): сюда позже добавится генерация карточек через LLM API.
 */
import { mergeBank } from '../data/banks/format.js';

const BANK_LOADERS = {
  math: () => import('../data/banks/math.js'),
  russian: () => import('../data/banks/russian.js'),
  physics: () => import('../data/banks/physics.js'),
  english: () => import('../data/banks/english.js'),
  ege_math: () => import('../data/banks/ege_math.js'),
};

let planCache = null;
const bankCache = {};

/** Учебный план: { subjects: [...], topics: [...] } */
export async function loadPlan() {
  if (planCache) return planCache;
  const res = await fetch('/data/topics.json');
  if (!res.ok) throw new Error('Не удалось загрузить учебный план');
  planCache = await res.json();
  return planCache;
}

export function getSubjects(plan) {
  return plan.subjects;
}

/** Темы предмета с вопросами (ровно 25, сетка 5×5). */
export async function loadSubject(subject) {
  const plan = await loadPlan();
  const loader = BANK_LOADERS[subject] ?? BANK_LOADERS.math;
  if (!bankCache[subject]) {
    const mod = await loader();
    bankCache[subject] = mod.default;
  }
  return mergeBank(subject, plan.topics, bankCache[subject]);
}

export function cellKey(row, col) {
  return `${row}-${col}`;
}

export const QUESTIONS_PER_TOPIC = 10;
export const PASS_RATIO = 0.8;