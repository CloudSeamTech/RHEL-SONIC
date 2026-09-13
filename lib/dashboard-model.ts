import { deploymentGroups } from '../app/wazuh-lessons.ts';
import { lessons, modules } from '../app/course.ts';

export function completionFor(
  ids: readonly string[],
  completed: ReadonlySet<string>,
) {
  const total = ids.length;
  const count = ids.filter((id) => completed.has(id)).length;
  return {
    total,
    count,
    percent: total ? Math.round((count / total) * 100) : null,
    state:
      total === 0
        ? 'planned'
        : count === total
          ? 'completed'
          : count > 0
            ? 'in-progress'
            : 'not-started',
  } as const;
}

// Dashboard groupings summarize existing tasks; they do not redefine stages.
export const labMilestones = [
  {
    title: 'Windows prerequisites',
    ids: ['assignment-v2', 'windows-tools-v2'],
    stage: 'build',
  },
  {
    title: 'Azure network setup',
    ids: ['resource-group-v2', 'network-plan-v2', 'nsg-v2'],
    stage: 'build',
  },
  { title: 'RHEL endpoint', ids: ['vm-provision-v2'], stage: 'build' },
  { title: 'RHEL manager', ids: ['manager-vm-v3'], stage: 'build' },
  {
    title: 'SSH keys and access',
    ids: ['key-create-v2', 'host-trust-v2', 'first-ssh-v2', 'paired-access-v3'],
    stage: 'build',
  },
  {
    title: 'Transfer and verify a file',
    ids: ['test-file-v3', 'scp-test-v3', 'verify-transfer-v3', 'sftp-test-v3'],
    stage: 'transfer',
  },
  {
    title: 'Baseline and rollback plan',
    ids: ['baseline-v2', 'rollback-gate-v3'],
    stage: 'prechange',
  },
  {
    title: 'Install Wazuh',
    ids: [...deploymentGroups.central, ...deploymentGroups.agent],
    stage: 'central',
  },
  {
    title: 'Verify agent check-in',
    ids: deploymentGroups.checkin,
    stage: 'checkin',
  },
  {
    title: 'Recovery exercise',
    ids: [...deploymentGroups.fault, ...deploymentGroups.recover],
    stage: 'recover',
  },
];

export function dashboardModel(completedIds: readonly string[]) {
  const validIds = new Set(lessons.map((lesson) => lesson.id));
  const completed = new Set(completedIds.filter((id) => validIds.has(id)));
  const next = lessons.find((lesson) => !completed.has(lesson.id));
  const following = next
    ? lessons
        .slice(lessons.indexOf(next) + 1)
        .find((lesson) => !completed.has(lesson.id))
    : undefined;
  const stage = next
    ? modules.find((module) => module.lessonIds.includes(next.id))
    : undefined;
  return {
    completed,
    next,
    following,
    stage,
    overall: completionFor(
      lessons.map((lesson) => lesson.id),
      completed,
    ),
    stages: modules.map((module) => ({
      ...module,
      ...completionFor(module.lessonIds, completed),
    })),
    milestones: labMilestones.map((milestone) => ({
      ...milestone,
      ...completionFor(milestone.ids, completed),
    })),
  };
}
