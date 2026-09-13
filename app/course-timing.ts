// Editorial estimates in minutes; active work excludes optional reading and cloud waits.
export type MinuteRange = readonly [number, number];
export type LessonTiming = {
  handsOn: MinuteRange;
  reading: MinuteRange;
  waiting: MinuteRange;
};
export const lessonTimings: Record<string, LessonTiming> = {
  'wazuh-release-v4': { handsOn: [8, 12], reading: [5, 8], waiting: [0, 0] },
  'wazuh-central-v4': { handsOn: [8, 12], reading: [5, 8], waiting: [10, 25] },
  'wazuh-dashboard-v4': { handsOn: [8, 12], reading: [4, 7], waiting: [0, 0] },
  'wazuh-artifact-v4': { handsOn: [8, 12], reading: [5, 8], waiting: [0, 0] },
  'wazuh-agent-v4': { handsOn: [8, 12], reading: [5, 8], waiting: [2, 5] },
  'wazuh-checkin-v4': { handsOn: [5, 8], reading: [3, 5], waiting: [1, 3] },
  'wazuh-event-v4': { handsOn: [8, 12], reading: [4, 7], waiting: [2, 5] },
  'wazuh-fault-v4': { handsOn: [8, 12], reading: [5, 8], waiting: [1, 3] },
  'wazuh-recover-v4': { handsOn: [10, 15], reading: [5, 8], waiting: [5, 15] },
  'wazuh-close-v4': { handsOn: [5, 8], reading: [2, 4], waiting: [1, 5] },
  'assignment-v2': { handsOn: [7, 10], reading: [4, 7], waiting: [0, 0] },
  'windows-tools-v2': { handsOn: [3, 5], reading: [2, 4], waiting: [0, 0] },
  'azure-scope-v2': { handsOn: [7, 10], reading: [4, 7], waiting: [0, 0] },
  'two-host-plan-v3': { handsOn: [5, 7], reading: [4, 7], waiting: [0, 0] },
  'resource-group-v2': { handsOn: [3, 5], reading: [2, 4], waiting: [0, 0] },
  'network-plan-v2': { handsOn: [6, 9], reading: [4, 7], waiting: [0, 0] },
  'build-storage-v3': { handsOn: [4, 6], reading: [2, 4], waiting: [0, 0] },
  'nsg-v2': { handsOn: [5, 8], reading: [4, 7], waiting: [0, 0] },
  'key-concept-v2': { handsOn: [2, 3], reading: [2, 4], waiting: [0, 0] },
  'key-create-v2': { handsOn: [4, 6], reading: [2, 4], waiting: [0, 0] },
  'vm-provision-v2': { handsOn: [8, 12], reading: [4, 7], waiting: [5, 10] },
  'manager-vm-v3': { handsOn: [8, 12], reading: [4, 7], waiting: [5, 10] },
  'reachability-v2': { handsOn: [2, 3], reading: [2, 4], waiting: [0, 0] },
  'host-trust-v2': { handsOn: [5, 7], reading: [4, 7], waiting: [0, 0] },
  'first-ssh-v2': { handsOn: [3, 4], reading: [2, 4], waiting: [0, 0] },
  'identity-v2': { handsOn: [2, 3], reading: [2, 4], waiting: [0, 0] },
  'host-os-v2': { handsOn: [2, 3], reading: [2, 4], waiting: [0, 0] },
  'guest-network-v2': { handsOn: [2, 3], reading: [2, 4], waiting: [0, 0] },
  'home-files-v2': { handsOn: [2, 3], reading: [2, 4], waiting: [0, 0] },
  'storage-verify-v3': { handsOn: [3, 5], reading: [2, 4], waiting: [0, 0] },
  'paired-access-v3': { handsOn: [4, 6], reading: [2, 4], waiting: [0, 0] },
  'test-file-v3': { handsOn: [2, 3], reading: [2, 4], waiting: [0, 0] },
  'scp-test-v3': { handsOn: [3, 4], reading: [2, 4], waiting: [0, 0] },
  'verify-transfer-v3': { handsOn: [2, 3], reading: [2, 4], waiting: [0, 0] },
  'sftp-test-v3': { handsOn: [3, 5], reading: [2, 4], waiting: [0, 0] },
  'installer-types-v3': { handsOn: [3, 5], reading: [2, 4], waiting: [0, 0] },
  'software-inventory-v3': {
    handsOn: [4, 6],
    reading: [2, 4],
    waiting: [0, 0],
  },
  'baseline-v2': { handsOn: [6, 9], reading: [4, 7], waiting: [0, 0] },
  'rollback-gate-v3': { handsOn: [8, 12], reading: [4, 7], waiting: [0, 0] },
  'deallocate-v2': { handsOn: [2, 3], reading: [2, 4], waiting: [1, 5] },
};
export function timingFor(
  ids: readonly string[],
  completed: ReadonlySet<string> = new Set(),
): LessonTiming {
  const result: Record<keyof LessonTiming, [number, number]> = {
    handsOn: [0, 0],
    reading: [0, 0],
    waiting: [0, 0],
  };
  for (const id of new Set(ids)) {
    if (completed.has(id)) continue;
    const timing = lessonTimings[id];
    if (!timing) throw new Error('Missing lesson timing: ' + id);
    for (const key of ['handsOn', 'reading', 'waiting'] as const) {
      result[key][0] += timing[key][0];
      result[key][1] += timing[key][1];
    }
  }
  return result;
}
export function formatMinutes([min, max]: MinuteRange) {
  if (min === max) return min + ' min';
  if (min >= 60 && min % 60 === 0 && max % 60 === 0)
    return min / 60 + '–' + max / 60 + ' hours';
  return min + '–' + max + ' min';
}
export function lessonTime(id: string) {
  return formatMinutes(lessonTimings[id].handsOn) + ' hands-on';
}
export function stageTime(ids: readonly string[]) {
  return formatMinutes(timingFor(ids).handsOn) + ' hands-on';
}
