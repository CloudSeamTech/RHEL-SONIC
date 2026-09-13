'use client';
import { lessons } from '@/app/course';
import { decodeProgress, emptyProgress } from './progress-model';
const key = 'wazuh-foundations-v2';
const legacyKey = 'wazuh-module-one-v1';
const validIds = lessons.map((lesson) => lesson.id);
const initial = JSON.stringify(emptyProgress);
let memory = initial;
export function snapshot() {
  return memory;
}
export function serverSnapshot() {
  return initial;
}
export function subscribe(callback: () => void) {
  const sync = (event?: StorageEvent) => {
    if (
      event &&
      event.key !== null &&
      event.key !== key &&
      event.key !== legacyKey
    )
      return;
    try {
      memory = JSON.stringify(
        decodeProgress(
          localStorage.getItem(key),
          localStorage.getItem(legacyKey),
          validIds,
        ),
      );
    } catch {
      /* Retain session state when browser storage cannot be read. */
    }
    callback();
  };
  sync();
  window.addEventListener('storage', sync);
  window.addEventListener('wazuh-progress', callback);
  return () => {
    window.removeEventListener('storage', sync);
    window.removeEventListener('wazuh-progress', callback);
  };
}
export function saveProgress(completed: string[]) {
  const current = decodeProgress(memory, null, validIds);
  memory = JSON.stringify(
    decodeProgress(JSON.stringify({ ...current, completed }), null, validIds),
  );
  let persisted = true;
  try {
    localStorage.setItem(key, memory);
  } catch {
    persisted = false;
  }
  window.dispatchEvent(new Event('wazuh-progress'));
  return persisted;
}
