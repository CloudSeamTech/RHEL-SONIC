import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const [sourceArg, outputArg, sourceCopyArg, contractArg, contractCopyArg] = process.argv.slice(2);

if (!sourceArg || !outputArg || !sourceCopyArg) {
  throw new Error(
    'Usage: node tools/generate-migration-catalog.mjs WORKBOOK.md OUTPUT.json SOURCE_COPY.md',
  );
}

const sourcePath = resolve(sourceArg);
const outputPath = resolve(outputArg);
const sourceCopyPath = resolve(sourceCopyArg);
const markdown = await readFile(sourcePath, 'utf8');
const lines = markdown.replaceAll('\r\n', '\n').split('\n');

const marker = /^(LAB \d{2}|SQL-\d{2}|MECM-\d{2}|MOVE-\d{2}|AZ-\d{2}|HA-\d{2}|FIELD-\d{2}|UPGRADE-\d{2}) \/ (.+)$/;
const sections = new Map();
const cleanBody = (value) =>
  value
    .replace(/<table>[\s\S]*?<\/table>/g, (table) =>
      table
        .replace(/<\/p>/g, '\n\n')
        .replace(/<br\s*\/?\s*>/g, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim(),
    )
    .replaceAll('\\[ \\]', '[ ]')
    .replaceAll('\\*', '*')
    .replaceAll('\\|', '|')
    .replaceAll('\\>', '>')
    .trim();

for (let index = 0; index < lines.length; index += 1) {
  const match = lines[index].match(marker);
  if (!match) continue;
  const next = lines.findIndex(
    (line, candidate) => candidate > index && marker.test(line),
  );
  const end = next === -1 ? lines.length : next;
  const titleLine = lines.slice(index + 1, end).find((line) => line.startsWith('# '));
  if (!titleLine) throw new Error(`Missing title after ${match[1]}`);
  sections.set(match[1], {
    code: match[1],
    sourceLabel: match[2],
    title: titleLine.slice(2).trim(),
    body: cleanBody(lines.slice(index + 1, end).join('\n')),
    sourceStartLine: index + 1,
    sourceEndLine: end,
  });
}

const sequence = [
  ...Array.from({ length: 14 }, (_, i) => `LAB ${String(i).padStart(2, '0')}`),
  ...Array.from({ length: 5 }, (_, i) => `SQL-${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 5 }, (_, i) => `MECM-${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 4 }, (_, i) => `MOVE-${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 4 }, (_, i) => `LAB ${String(i + 14).padStart(2, '0')}`),
  ...Array.from({ length: 3 }, (_, i) => `AZ-${String(i + 1).padStart(2, '0')}`),
  'UPGRADE-01',
  ...Array.from({ length: 5 }, (_, i) => `HA-${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 3 }, (_, i) => `LAB ${String(i + 18).padStart(2, '0')}`),
  'FIELD-01',
];

const stageFor = (code) => {
  if (code === 'LAB 00' || code === 'LAB 01') return 'orient';
  if (/^LAB 0[2-7]$/.test(code)) return 'source';
  if (/^LAB (0[8-9]|1[0-3])$/.test(code)) return 'destination';
  if (code.startsWith('SQL-')) return 'sql';
  if (code.startsWith('MECM-')) return 'mecm';
  if (code.startsWith('MOVE-')) return 'migration-methods';
  if (/^LAB 1[4-7]$/.test(code)) return 'azure-foundation';
  if (code.startsWith('AZ-') || code.startsWith('UPGRADE-')) return 'azure-move';
  if (code.startsWith('HA-')) return 'availability';
  return 'closeout';
};

const surfaceFor = (code) => {
  if (/^(LAB 14|LAB 15|LAB 16|LAB 17|AZ-|UPGRADE-|HA-03)/.test(code)) return 'Azure portal + Windows lab';
  if (/^(SQL-|MECM-|HA-)/.test(code)) return 'Windows PowerShell / product UI';
  if (/^(MOVE-|FIELD-|LAB 00|LAB 01|LAB 18|LAB 19|LAB 20)/.test(code)) return 'Course workspace';
  return 'Windows Server / VMware lab';
};

const lessons = sequence.map((code, index) => {
  const section = sections.get(code);
  if (!section) throw new Error(`Workbook section not found: ${code}`);
  return {
    id: code.toLowerCase().replace(' ', '-'),
    ...section,
    order: index + 1,
    stageId: stageFor(code),
    surface: surfaceFor(code),
    route: `/migration#lesson=${code.toLowerCase().replace(' ', '-')}`,
  };
});

if (lessons.length !== 45) {
  throw new Error(`Expected 45 authored lessons, found ${lessons.length}`);
}

await mkdir(dirname(outputPath), { recursive: true });
await mkdir(dirname(sourceCopyPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({ version: 4, lessons }, null, 2)}\n`);
await writeFile(sourceCopyPath, markdown);
if (contractArg && contractCopyArg) {
  const contract = await readFile(resolve(contractArg), 'utf8');
  const contractCopyPath = resolve(contractCopyArg);
  await mkdir(dirname(contractCopyPath), { recursive: true });
  await writeFile(contractCopyPath, contract);
  console.log(`Copied implementation contract to ${contractCopyPath}`);
}

console.log(`Generated ${lessons.length} lessons at ${outputPath}`);
console.log(`Copied authoritative source to ${sourceCopyPath}`);
