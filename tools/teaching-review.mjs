import fs from 'node:fs';
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const old = ['migration', 'linux', 'alma'].flatMap((group) =>
  Object.keys(read(`content/teaching/${group}-welcome.json`)),
);
const nessus = ['linux', 'windows', 'scanning'].map((n) =>
  read(`content/nessus/${n}.json`),
);
const azure = read('content/azure/maintenance.json');
const steps = azure.lessons.flatMap((lesson) =>
  lesson.steps.map((step, index) => ({
    lessonId: lesson.id,
    step: index + 1,
    title: step.title,
    status: step.screenshot.status,
    assetId: step.screenshot.assetId ?? null,
    captureInstructions: step.screenshot.instructions,
  })),
);
const summary = {
  originalClassesWithReviewedWelcome: old.length,
  nessusLessonsRewritten: nessus.reduce((n, c) => n + c.lessons.length, 0),
  nessusStepsRewritten: nessus.reduce(
    (n, c) => n + c.lessons.reduce((n, l) => n + l.steps.length, 0),
    0,
  ),
  azureMaintenanceLessons: azure.lessons.length,
  azureMaintenanceSteps: steps.length,
  azureStepsWithRealInterfaceReference: steps.filter(
    (s) => s.status === 'reference',
  ).length,
  azureCaptureGaps: steps.filter((s) => s.status === 'capture-needed').length,
  liveAzureOperationsPerformed: 0,
};
fs.mkdirSync('docs/azure-maintenance', { recursive: true });
fs.writeFileSync(
  'docs/azure-maintenance/review-inventory.json',
  JSON.stringify({ summary, steps }, null, 2) + '\n',
);
console.log(JSON.stringify(summary, null, 2));
