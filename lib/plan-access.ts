/** Prelaunch catalog classification. This is not a content authorization boundary. */
export type PlanTier = 'free' | 'apex';
export const planLabel = (value: unknown) =>
  value === 'apex' ? 'Apex Tier' : 'Free Tier';
export const normalizePlanTier = (value: unknown): PlanTier =>
  value === 'apex' ? 'apex' : 'free';
const freeLessons = new Set([
  'lab-00',
  'lab-01',
  'lab-02',
  'lab-03',
  'lab-04-vmware',
  'lab-04-windows',
  'lab-04',
  'az-01',
  'assignment-v2',
  'windows-tools-v2',
  'azure-scope-v2',
  'two-host-plan-v3',
  'resource-group-v2',
  'network-plan-v2',
  'build-storage-v3',
  'nsg-v2',
  'key-concept-v2',
  'key-create-v2',
  'vm-provision-v2',
  'manager-vm-v3',
  'reachability-v2',
  'host-trust-v2',
  'first-ssh-v2',
  'identity-v2',
  'host-os-v2',
  'guest-network-v2',
  'home-files-v2',
  'rollback-gate-v3',
  'deallocate-v2',
  'alma-plan',
  'alma-install',
  'alma-first-login',
  'alma-terminal',
  'alma-files',
  'alma-apps',
  'splunk-start',
  'splunk-install',
  'splunk-upload',
  'splunk-navigate',
  'splunk-search',
  'splunk-fields',
  'splunk-pipeline',
]);
export const freeLessonIds = [...freeLessons];
export const lessonTier = (id: string): PlanTier =>
  freeLessons.has(id) ? 'free' : 'apex';
