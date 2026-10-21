export type PracticeServer = {
  id: string;
  name: string;
  os: 'Windows' | 'RHEL';
  pilot: boolean;
  baseline: boolean;
  backup: boolean;
  snapshot: boolean;
  status:
    | 'waiting'
    | 'updating'
    | 'checking'
    | 'passed'
    | 'failed'
    | 'restored';
};
export type PracticeState = { servers: PracticeServer[]; log: string[] };
export const newMaintenancePractice = (): PracticeState => ({
  servers: [
    { id: 'win-pilot', name: 'WIN-PILOT01', os: 'Windows', pilot: true },
    { id: 'rhel-pilot', name: 'RHEL-PILOT01', os: 'RHEL', pilot: true },
    { id: 'win-wave', name: 'WIN-APP02', os: 'Windows', pilot: false },
    { id: 'rhel-wave', name: 'RHEL-APP02', os: 'RHEL', pilot: false },
  ].map(
    (server) =>
      ({
        ...server,
        baseline: false,
        backup: false,
        snapshot: false,
        status: 'waiting',
      }) as PracticeServer,
  ),
  log: ['Practice started. Choose a pilot and check its baseline first.'],
});
export function canPractiseUpdate(state: PracticeState, id: string) {
  const server = state.servers.find((s) => s.id === id);
  if (
    !server ||
    !server.baseline ||
    !server.backup ||
    !server.snapshot ||
    !['waiting', 'restored'].includes(server.status)
  )
    return false;
  if (
    state.servers.some((s) =>
      ['updating', 'checking', 'failed'].includes(s.status),
    )
  )
    return false;
  return (
    server.pilot ||
    state.servers.filter((s) => s.pilot).every((s) => s.status === 'passed')
  );
}
export type PracticeAction =
  | 'baseline'
  | 'backup'
  | 'snapshot'
  | 'update'
  | 'reboot'
  | 'pass'
  | 'fail'
  | 'restore';
export function practiseMaintenance(
  state: PracticeState,
  id: string,
  action: PracticeAction,
): PracticeState {
  const current = state.servers.find((s) => s.id === id);
  if (!current) return state;
  let server = { ...current };
  let message = '';
  if (
    action === 'baseline' &&
    ['waiting', 'restored'].includes(server.status)
  ) {
    server.baseline = true;
    message =
      'Baseline checked: sign-in, service, application and data checks.';
  } else if (
    action === 'backup' &&
    server.baseline &&
    ['waiting', 'restored'].includes(server.status)
  ) {
    server.backup = true;
    message =
      'Practice recovery gate passed: a usable backup and isolated restore test are recorded.';
  } else if (
    action === 'snapshot' &&
    server.backup &&
    ['waiting', 'restored'].includes(server.status)
  ) {
    server.snapshot = true;
    message =
      'Practice pre-change snapshot recorded. This does not replace the backup.';
  } else if (action === 'update' && canPractiseUpdate(state, id)) {
    server.status = 'updating';
    message =
      current.status === 'restored'
        ? 'Revised pilot update started.'
        : 'Update started on this server only. Other servers wait.';
  } else if (action === 'reboot' && server.status === 'updating') {
    server.status = 'checking';
    message =
      'Practice update and reboot finished. Now repeat the real health checks; a Running badge is not enough.';
  } else if (action === 'pass' && server.status === 'checking') {
    server.status = 'passed';
    message =
      'Practice sign-in, service, application and data checks passed. Record the agreed observation period before the next server.';
  } else if (action === 'fail' && server.status === 'checking') {
    server.status = 'failed';
    message =
      'Simulated application check failed. STOP the rollout. Keep evidence and choose the tested recovery route.';
  } else if (action === 'restore' && server.status === 'failed') {
    server.status = 'restored';
    message =
      'Practice restore completed and baseline checks passed. This is the old baseline, not proof the update works. Review the cause and test a revised update before continuing.';
  } else return state;
  return {
    servers: state.servers.map((s) => (s.id === id ? server : s)),
    log: [...state.log, `${server.name}: ${message}`],
  };
}
