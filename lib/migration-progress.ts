'use client';

const storageKey = 'sonic-agency-azure-migration-v1';

export type MigrationProgress = { version: 1; completed: string[] };

export function readMigrationProgress(validIds: readonly string[]): MigrationProgress {
  if (typeof window === 'undefined') return { version: 1, completed: [] };
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    if (parsed?.version !== 1 || !Array.isArray(parsed.completed)) {
      return { version: 1, completed: [] };
    }
    return {
      version: 1,
      completed: [...new Set(parsed.completed)].filter(
        (id): id is string => typeof id === 'string' && validIds.includes(id),
      ),
    };
  } catch {
    return { version: 1, completed: [] };
  }
}

export function writeMigrationProgress(progress: MigrationProgress) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

export const migrationProgressKey = storageKey;
