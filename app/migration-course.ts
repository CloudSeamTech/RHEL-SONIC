import catalog from '@/content/migration/migration-lessons.generated.json';

export type MigrationLesson = (typeof catalog.lessons)[number];

export type MigrationStage = {
  id: string;
  title: string;
  plainEnglish: string;
  lessonIds: string[];
};

const stageDefinitions = [
  ['orient', 'Choose the route', 'See the mission, machines, language, and cost boundary.'],
  ['source', 'Build the source agency', 'Create the old agency network, identity, policy, and application.'],
  ['destination', 'Build the destination', 'Create the destination forest, move policy and APP01, and prove rollback.'],
  ['sql', 'Build the SQL workload', 'Install SQL safely, create practice data, and prove backup and restore.'],
  ['mecm', 'Build configuration management', 'Create the MECM lab and understand its Active Directory, SQL, client, and WSUS dependencies.'],
  ['migration-methods', 'Choose the move method', 'Match domain, SQL, and MECM workloads to supported migration methods.'],
  ['azure-foundation', 'Build the Azure destination', 'Plan the cloud boundary, create AZ-DC01, and prove private networking first.'],
  ['azure-move', 'Run the Azure migration wave', 'Control cost, choose supported tools, and execute a rehearsed cutover.'],
  ['availability', 'Practice SQL availability', 'Build optional SQL clustering and use an Azure cloud witness safely.'],
  ['closeout', 'Prove and hand off', 'Troubleshoot, explain the work, shut down safely, and document the handoff.'],
] as const;

export const migrationLessons: MigrationLesson[] = catalog.lessons;

export const migrationStages: MigrationStage[] = stageDefinitions.map(
  ([id, title, plainEnglish]) => ({
    id,
    title,
    plainEnglish,
    lessonIds: migrationLessons
      .filter((lesson) => lesson.stageId === id)
      .map((lesson) => lesson.id),
  }),
);

export const migrationTasks = [
  {
    id: 'build-local-enterprise',
    title: 'Build the agency and destination labs',
    description: 'Create two safe Windows identity environments and a workload you can move and recover.',
    lessonId: 'lab-01',
    state: 'available',
  },
  {
    id: 'move-app-domain',
    title: 'Move a Windows server to a new domain',
    description: 'Prepare identity, DNS, policy, evidence, cutover, and rollback for APP01.',
    lessonId: 'lab-08',
    state: 'available',
  },
  {
    id: 'move-sql-azure',
    title: 'Move a SQL database to Azure',
    description: 'Use a real backup and restore flow without pretending a database backup is an entire server.',
    lessonId: 'move-02',
    state: 'available',
  },
  {
    id: 'azure-wave',
    title: 'Run an agency-to-Azure migration wave',
    description: 'Plan spend, protect the network, select supported tools, cut over, verify, and roll back safely.',
    lessonId: 'lab-14',
    state: 'available',
  },
  {
    id: 'linux-content-management',
    title: 'Manage approved Linux content',
    description: 'Future Foreman + Katello workflow for connected and disconnected environments.',
    state: 'planned',
  },
] as const;

export const migrationLessonById = (id: string | null) =>
  migrationLessons.find((lesson) => lesson.id === id);

export const migrationStageFor = (lessonId: string) =>
  migrationStages.find((stage) => stage.lessonIds.includes(lessonId));
