export type ProgressState = {
  version: 2;
  completed: string[];
  previousEdition: number[];
};
export const emptyProgress: ProgressState = {
  version: 2,
  completed: [],
  previousEdition: [],
};
const parse = (raw: string | null): unknown => {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const legacyTasks = (value: unknown): number[] =>
  Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (n): n is number =>
              typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < 6,
          ),
        ),
      ]
    : [];
export function decodeProgress(
  raw: string | null,
  legacyRaw: string | null,
  validIds: readonly string[],
): ProgressState {
  const value = parse(raw);
  if (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    value.version === 2
  ) {
    const record = value as Record<string, unknown>;
    return {
      version: 2,
      completed: Array.isArray(record.completed)
        ? [
            ...new Set(
              record.completed.filter(
                (id): id is string =>
                  typeof id === 'string' && validIds.includes(id),
              ),
            ),
          ]
        : [],
      previousEdition: legacyTasks(record.previousEdition),
    };
  }
  return {
    version: 2,
    completed: [],
    previousEdition: legacyTasks(parse(legacyRaw)),
  };
}
