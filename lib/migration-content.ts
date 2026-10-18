export type MigrationBlock =
  | { type: 'heading'; text: string; level: number }
  | { type: 'paragraph'; text: string }
  | { type: 'checklist'; items: string[] }
  | { type: 'command'; lines: string[] }
  | { type: 'table'; rows: string[][] }
  | { type: 'callout'; label: string; text: string; tone: 'good' | 'warning' | 'danger' | 'info' };

type CalloutTone = Extract<MigrationBlock, { type: 'callout' }>['tone'];

const calloutTone = (label: string): CalloutTone => {
  if (/PASS CHECK|GOOD|SUCCESS/i.test(label)) return 'good';
  if (/STOP|WATCH OUT|DANGER|ROLLBACK/i.test(label)) return 'danger';
  if (/IF IT FAILS|BUDGET|COST|CHECK/i.test(label)) return 'warning';
  return 'info';
};

const boldLabel = /^\*\*([^*]+)\*\*\s*(.*)$/;

export function parseMigrationContent(markdown: string): MigrationBlock[] {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const blocks: MigrationBlock[] = [];

  for (let index = 0; index < lines.length; ) {
    const line = lines[index].trimEnd();
    if (!line.trim()) {
      index += 1;
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] });
      index += 1;
      continue;
    }
    if (line.startsWith('|')) {
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        const cells = lines[index]
          .trim()
          .slice(1, -1)
          .split('|')
          .map((cell) => cell.trim());
        if (!cells.every((cell) => /^:?-{3,}:?$/.test(cell))) rows.push(cells);
        index += 1;
      }
      if (rows.length) blocks.push({ type: 'table', rows });
      continue;
    }
    if (/^\[ \]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\[ \]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\[ \]\s+/, ''));
        index += 1;
      }
      blocks.push({ type: 'checklist', items });
      continue;
    }
    if (/^>\s?/.test(line)) {
      const commandLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        commandLines.push(lines[index].trim().replace(/^>\s?/, '').replace(/\s{2}$/, ''));
        index += 1;
      }
      blocks.push({ type: 'command', lines: commandLines });
      continue;
    }
    const label = line.trim().match(boldLabel);
    if (label) {
      const text: string[] = [label[2]].filter(Boolean);
      index += 1;
      while (
        index < lines.length &&
        lines[index].trim() &&
        !/^(#{1,4})\s+/.test(lines[index].trim()) &&
        !lines[index].trim().startsWith('|') &&
        !/^\[ \]\s+/.test(lines[index].trim()) &&
        !/^>\s?/.test(lines[index].trim()) &&
        !boldLabel.test(lines[index].trim())
      ) {
        text.push(lines[index].trim());
        index += 1;
      }
      blocks.push({
        type: 'callout',
        label: label[1],
        text: text.join(' '),
        tone: calloutTone(label[1]),
      });
      continue;
    }
    const paragraph = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,4})\s+/.test(lines[index].trim()) &&
      !lines[index].trim().startsWith('|') &&
      !/^\[ \]\s+/.test(lines[index].trim()) &&
      !/^>\s?/.test(lines[index].trim()) &&
      !boldLabel.test(lines[index].trim())
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
  }

  return blocks;
}
