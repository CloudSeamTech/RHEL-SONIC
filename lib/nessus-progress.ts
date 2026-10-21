import { nessusLessons } from './nessus-curriculum.ts';
export type NessusProgress = {
  version: 1;
  checked: string[];
  verified: string[];
  answers: Record<string, number[]>;
};
export const nessusProgressKey = 'sonic-academy-nessus-v1';
const eventName = 'sonic-nessus-progress';
const empty: NessusProgress = {
  version: 1,
  checked: [],
  verified: [],
  answers: {},
};
const lessonById = new Map(nessusLessons.map((lesson) => [lesson.id, lesson]));
const validChecks = new Set(
  nessusLessons.flatMap((lesson) => [
    ...lesson.steps.map((_, index) => `${lesson.id}:step:${index}`),
    `${lesson.id}:exercise`,
  ]),
);
export function normalizeNessusProgress(value: unknown): NessusProgress {
  if (
    !value ||
    typeof value !== 'object' ||
    !('version' in value) ||
    value.version !== 1
  )
    return { ...empty, checked: [], verified: [], answers: {} };
  const input = value as Partial<NessusProgress>;
  const checked = [
    ...new Set(
      Array.isArray(input.checked)
        ? input.checked.filter(
            (id) => typeof id === 'string' && validChecks.has(id),
          )
        : [],
    ),
  ];
  const answers: Record<string, number[]> = {};
  for (const lesson of nessusLessons) {
    const saved = input.answers?.[lesson.id];
    if (
      Array.isArray(saved) &&
      saved.length === lesson.quiz.length &&
      saved.every(
        (answer, i) =>
          Number.isInteger(answer) &&
          answer >= 0 &&
          answer < lesson.quiz[i].options.length,
      )
    )
      answers[lesson.id] = saved;
  }
  const verified = [
    ...new Set(
      Array.isArray(input.verified)
        ? input.verified.filter(
            (id) =>
              typeof id === 'string' &&
              lessonById.has(id) &&
              canVerifyNessusLesson(id, {
                version: 1,
                checked,
                verified: [],
                answers,
              }),
          )
        : [],
    ),
  ];
  return { version: 1, checked, answers, verified };
}
export function canVerifyNessusLesson(
  id: string,
  progress: NessusProgress,
): boolean {
  const lesson = lessonById.get(id);
  if (!lesson) return false;
  return (
    lesson.steps.every((_, i) =>
      progress.checked.includes(`${id}:step:${i}`),
    ) &&
    progress.checked.includes(`${id}:exercise`) &&
    lesson.quiz.every(
      (question, i) => progress.answers[id]?.[i] === question.answer,
    )
  );
}
export const nessusServerSnapshot = () => JSON.stringify(empty);
export function nessusSnapshot() {
  try {
    return JSON.stringify(
      normalizeNessusProgress(
        JSON.parse(localStorage.getItem(nessusProgressKey) ?? 'null'),
      ),
    );
  } catch {
    return nessusServerSnapshot();
  }
}
export function subscribeNessus(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('focus', callback);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('focus', callback);
    window.removeEventListener(eventName, callback);
  };
}
export function updateNessusProgress(
  update: (current: NessusProgress) => NessusProgress,
) {
  try {
    const next = normalizeNessusProgress(update(JSON.parse(nessusSnapshot())));
    localStorage.setItem(nessusProgressKey, JSON.stringify(next));
    window.dispatchEvent(new Event(eventName));
    return true;
  } catch {
    return false;
  }
}
