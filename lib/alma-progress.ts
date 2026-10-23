import course from '../content/alma/desktop-lessons.json' with { type: 'json' };
export const almaProgressKey = 'sonic-alma-desktop-v1';
const validIds = new Set(course.lessons.map((lesson) => lesson.id));
export const almaServerSnapshot = () => '[]';
export function almaSnapshot() {
  try {
    const value = JSON.parse(localStorage.getItem(almaProgressKey) ?? '[]');
    return JSON.stringify(
      Array.isArray(value)
        ? [...new Set(value.filter((id) => validIds.has(id)))]
        : [],
    );
  } catch {
    return '[]';
  }
}
export function subscribeAlma(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('focus', callback);
  window.addEventListener('sonic-alma-progress', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('focus', callback);
    window.removeEventListener('sonic-alma-progress', callback);
  };
}
export function toggleAlmaLesson(id: string) {
  if (!validIds.has(id)) return false;
  try {
    const current = JSON.parse(almaSnapshot()) as string[];
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    localStorage.setItem(almaProgressKey, JSON.stringify(next));
    window.dispatchEvent(new Event('sonic-academy-progress'));
    window.dispatchEvent(new Event('sonic-alma-progress'));
    return true;
  } catch {
    return false;
  }
}
