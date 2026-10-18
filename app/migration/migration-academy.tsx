'use client';
/* oxlint-disable next/no-html-link-for-pages -- Vinext's client router currently crashes on these cross-page transitions; native navigation is intentional. */

import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleDollarSign,
  Cloud,
  Copy,
  ExternalLink,
  Play,
  RotateCcw,
  ShieldCheck,
  TerminalSquare,
  Wrench,
} from 'lucide-react';
import {
  migrationLessonById,
  migrationLessons,
  migrationStageFor,
  migrationStages,
  migrationTasks,
  type MigrationLesson,
} from '../migration-course';
import { parseMigrationContent, type MigrationBlock } from '@/lib/migration-content';
import {
  readMigrationProgress,
  writeMigrationProgress,
} from '@/lib/migration-progress';
import { LabTerminal } from '../lab-terminal/lab-terminal';
import './migration.css';

type Mode = 'home' | 'learn' | 'job' | 'lesson' | 'terminal';
const lessonIds = migrationLessons.map((lesson) => lesson.id);

function cleanInline(value: string) {
  return value
    .replaceAll('**', '')
    .replaceAll('`', '')
    .replaceAll('&gt;', '>')
    .replaceAll('&lt;', '<');
}

function Inline({ text }: { text: string }) {
  const chunks = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {chunks.map((chunk, index) => {
        if (chunk.startsWith('**') && chunk.endsWith('**')) {
          return <strong key={index}>{chunk.slice(2, -2)}</strong>;
        }
        if (chunk.startsWith('`') && chunk.endsWith('`')) {
          return <code key={index}>{chunk.slice(1, -1)}</code>;
        }
        return <Fragment key={index}>{cleanInline(chunk)}</Fragment>;
      })}
    </>
  );
}

function CopyCommand({ lines }: { lines: string[] }) {
  const [copied, setCopied] = useState(false);
  const command = lines.join('\n');
  return (
    <section className="migration-command" aria-label="Command or code">
      <header>
        <span><TerminalSquare size={15} /> COMMAND / EXACT INPUT</span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(command);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            } catch {
              setCopied(false);
            }
          }}
        >
          <Copy size={14} /> {copied ? 'Copied' : 'Copy'}
        </button>
      </header>
      <pre><code>{command}</code></pre>
      <p><b>Where:</b> use the named machine and shell shown by this lesson. Read the surrounding step before running anything.</p>
    </section>
  );
}

function ContentBlock({ block }: { block: MigrationBlock }) {
  if (block.type === 'heading') {
    if (block.level === 1) return null;
    return block.level === 2 ? <h2><Inline text={block.text} /></h2> : <h3><Inline text={block.text} /></h3>;
  }
  if (block.type === 'paragraph') return <p><Inline text={block.text} /></p>;
  if (block.type === 'command') return <CopyCommand lines={block.lines} />;
  if (block.type === 'checklist') {
    return (
      <section className="migration-pane pane-action">
        <span className="pane-label">DO THIS · ONE CHECK AT A TIME</span>
        <ol className="action-list">
          {block.items.map((item, index) => <li key={index}><span>{index + 1}</span><Inline text={item} /></li>)}
        </ol>
      </section>
    );
  }
  if (block.type === 'table') {
    const [header, ...rows] = block.rows;
    return (
      <div className="migration-table-wrap" aria-label="Scrollable course table">
        <table>
          <thead><tr>{header.map((cell, index) => <th key={index}><Inline text={cell} /></th>)}</tr></thead>
          <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, index) => <td key={index}><Inline text={cell} /></td>)}</tr>)}</tbody>
        </table>
      </div>
    );
  }
  return (
    <aside className={`migration-pane pane-${block.tone}`}>
      <span className="pane-label">{block.label}</span>
      <p><Inline text={block.text} /></p>
    </aside>
  );
}

function StageRail({ completed, openLesson }: { completed: string[]; openLesson: (id: string) => void }) {
  return (
    <section className="migration-stage-rail" aria-labelledby="stage-rail-title">
      <header><div><span className="eyebrow">SMALL STAGES</span><h2 id="stage-rail-title">One achievable outcome at a time</h2></div><span>{migrationStages.length} stages · progress stays local</span></header>
      <div className="migration-stage-grid">
        {migrationStages.map((stage, index) => {
          const count = stage.lessonIds.filter((id) => completed.includes(id)).length;
          const next = stage.lessonIds.find((id) => !completed.includes(id)) ?? stage.lessonIds[0];
          const percent = Math.round((count / stage.lessonIds.length) * 100);
          const first = migrationLessonById(stage.lessonIds[0])!;
          const last = migrationLessonById(stage.lessonIds.at(-1)!)!;
          return (
            <button key={stage.id} onClick={() => openLesson(next)} className="migration-stage-card">
              <span className="stage-number">{String(index + 1).padStart(2, '0')}</span>
              <strong>{stage.title}</strong>
              <span>{stage.plainEnglish}</span>
              <span className="stage-meter"><span style={{ width: `${percent}%` }} /></span>
              <small>{first.code} → {last.code} · {count} of {stage.lessonIds.length} verified</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TaskCard({ task, openLesson }: { task: (typeof migrationTasks)[number]; openLesson: (id: string) => void }) {
  const lesson = migrationLessonById(task.lessonId)!;
  return (
    <button className="migration-task-card" onClick={() => openLesson(task.lessonId)}>
      <span className="task-card-top"><Cloud size={21} /><b>{lesson.code}</b></span>
      <span className="task-machine">{task.machine}</span>
      <h2>{task.title}</h2>
      <p>{task.description}</p>
      <span className="task-open">Open this exact workflow <ArrowRight size={14} /></span>
    </button>
  );
}

function ProjectDirectory({ completed, openLesson }: { completed: string[]; openLesson: (id: string) => void }) {
  return (
    <section className="project-directory" aria-labelledby="project-directory-title">
      <header>
        <span className="eyebrow">EVERY WINDOWS PROJECT / GROUPED BY STAGE</span>
        <h2 id="project-directory-title">Open the exact project you need</h2>
        <p>Open one stage at a time. Every listed project is implemented and opens the same authoritative lesson used by Learn It.</p>
      </header>
      <div className="project-stage-list">
        {migrationStages.map((stage, stageIndex) => {
          const first = migrationLessonById(stage.lessonIds[0])!;
          const last = migrationLessonById(stage.lessonIds.at(-1)!)!;
          const count = stage.lessonIds.filter((id) => completed.includes(id)).length;
          return (
            <details key={stage.id} className="project-stage" open={stageIndex === 0}>
              <summary>
                <span className="project-stage-number">{String(stageIndex + 1).padStart(2, '0')}</span>
                <span><strong>{stage.title}</strong><small>{first.code} → {last.code} · {count} of {stage.lessonIds.length} verified</small></span>
                <ChevronRight size={17} />
              </summary>
              <p>{stage.plainEnglish}</p>
              <ol>
                {stage.lessonIds.map((id) => {
                  const project = migrationLessonById(id)!;
                  return (
                    <li key={id}>
                      <button onClick={() => openLesson(id)}>
                        <span>{completed.includes(id) ? <Check size={15} /> : project.code}</span>
                        <b>{project.title}</b>
                        <small>{project.surface}</small>
                        <ArrowRight size={14} />
                      </button>
                    </li>
                  );
                })}
              </ol>
            </details>
          );
        })}
      </div>
    </section>
  );
}

function HomeView({ completed, setMode, openLesson }: { completed: string[]; setMode: (mode: Mode) => void; openLesson: (id: string) => void }) {
  const next = migrationLessons.find((lesson) => !completed.includes(lesson.id)) ?? migrationLessons[0];
  return (
    <>
      <section className="migration-hero">
        <div className="migration-hero-copy">
          <span className="eyebrow">SONIC / WINDOWS AGENCY-TO-AZURE MIGRATION</span>
          <h1>BUILD IT.<br /><span>MOVE IT SAFELY.</span></h1>
          <p>Build named Windows machines, move one workload at a time, prove what happened, and keep a tested way back.</p>
          <section className="migration-start-panel" aria-label="Start here">
            <div><span>START HERE</span><h2>{completed.length ? `Continue with ${next.code}` : 'Begin with LAB 00'}</h2><p>{completed.length ? next.title : 'Choose your training route, name every machine, and check the cost boundary before building.'}</p></div>
            <ol><li><b>1</b><span>Open the next project.</span></li><li><b>2</b><span>Work only on the named machine.</span></li><li><b>3</b><span>Pass the check before continuing.</span></li></ol>
            <button className="migration-primary" onClick={() => openLesson(next.id)}><Play size={17} fill="currentColor" />{completed.length ? `CONTINUE · ${next.code}` : 'START · LAB 00'}</button>
          </section>
          <div className="mode-cards">
            <button onClick={() => setMode('learn')}><BookOpen size={22} /><span><b>LEARN IT</b><small>Teach me from the beginning.</small></span><ArrowRight size={18} /></button>
            <button onClick={() => setMode('job')}><Wrench size={22} /><span><b>DO THE JOB</b><small>Choose one exact Windows outcome.</small></span><ArrowRight size={18} /></button>
          </div>
        </div>
        <div className="migration-orbit" aria-label="Migration architecture preview">
          <span className="orbit-core">AZURE</span>
          <span className="orbit-node source">AGENCY</span>
          <span className="orbit-node identity">IDENTITY</span>
          <span className="orbit-node data">DATA</span>
          <span className="orbit-node recovery">ROLLBACK</span>
        </div>
      </section>
      <section className="migration-task-feature">
        <header><span className="eyebrow">WHAT EXACT WINDOWS JOB ARE YOU TRYING TO DO?</span><h2>Choose a named system and outcome</h2><p>Each glass card opens a real project. Nothing below is a vague placeholder.</p></header>
        <div className="migration-task-grid">
          {migrationTasks.map((task) => <TaskCard key={task.id} task={task} openLesson={openLesson} />)}
        </div>
      </section>
      <StageRail completed={completed} openLesson={openLesson} />
    </>
  );
}

function LearnView({ completed, openLesson }: { completed: string[]; openLesson: (id: string) => void }) {
  return (
    <section className="migration-index">
      <header><span className="eyebrow">LEARN IT / IN ORDER</span><h1>Windows Agency-to-Azure project path</h1><p>Start at LAB 00. Open one stage, complete one named outcome, prove it, and then continue.</p></header>
      <ProjectDirectory completed={completed} openLesson={openLesson} />
    </section>
  );
}

function JobView({ completed, openLesson }: { completed: string[]; openLesson: (id: string) => void }) {
  return (
    <section className="migration-index job-index">
      <header><span className="eyebrow">DO THE JOB / EXACT WINDOWS TASK</span><h1>Which named system are you working on?</h1><p>Choose a specific outcome. The project opens directly, but its prerequisite and safety gates still apply.</p></header>
      <div className="migration-task-grid">
        {migrationTasks.map((task) => <TaskCard key={task.id} task={task} openLesson={openLesson} />)}
      </div>
      <ProjectDirectory completed={completed} openLesson={openLesson} />
    </section>
  );
}

function LessonView({ lesson, completed, toggle, openLesson }: { lesson: MigrationLesson; completed: string[]; toggle: () => void; openLesson: (id: string) => void }) {
  const blocks = useMemo(() => parseMigrationContent(lesson.body), [lesson.body]);
  const stage = migrationStageFor(lesson.id)!;
  const stageIndex = stage.lessonIds.indexOf(lesson.id);
  const globalIndex = migrationLessons.findIndex((item) => item.id === lesson.id);
  const stageCompleted = stage.lessonIds.filter((id) => completed.includes(id)).length;
  const next = migrationLessons[globalIndex + 1];
  const previous = migrationLessons[globalIndex - 1];
  return (
    <article className="migration-lesson">
      <nav className="you-are-here" aria-label="You are here"><span>YOU ARE HERE</span><a href="/">SONIC</a><ChevronRight size={13} /><a href="/migration">Windows Migration</a><ChevronRight size={13} /><button onClick={() => openLesson(stage.lessonIds[0])}>{stage.title}</button><ChevronRight size={13} /><b>{lesson.code}</b></nav>
      <header className="lesson-hero">
        <div><span className="eyebrow">{stage.title.toUpperCase()} · {stageIndex + 1} OF {stage.lessonIds.length}</span><h1>{lesson.title}</h1><p><b>Named workspace:</b> {lesson.surface}</p></div>
        <div className="stage-progress"><strong>{stageCompleted} / {stage.lessonIds.length}</strong><span>stage projects verified</span><span className="stage-meter"><span style={{ width: `${Math.round((stageCompleted / stage.lessonIds.length) * 100)}%` }} /></span></div>
      </header>
      <section className="migration-pane pane-mission"><span className="pane-label">YOUR ONE JOB IN THIS PROJECT</span><p><b>{lesson.title}.</b> Work only on <b>{lesson.surface}</b>, capture real evidence, and stop rather than guess when the expected result does not match.</p></section>
      <section className="migration-pane pane-info"><span className="pane-label">IN PLAIN ENGLISH</span><p>{stage.plainEnglish} This project teaches the next necessary piece and keeps the recovery path visible.</p></section>
      <section className="project-rhythm" aria-label="How to complete this project"><span><b>1</b> Understand the question</span><span><b>2</b> Follow one action at a time</span><span><b>3</b> Compare actual evidence</span><span><b>4</b> Mark verified only when it passes</span></section>
      <div className="lesson-content">{blocks.map((block, index) => <ContentBlock key={index} block={block} />)}</div>
      <details className="engineer-detail"><summary>LEVEL 3 · ENGINEER DETAIL / SOURCE TRACE</summary><p>Authoritative workbook section <b>{lesson.code} / {lesson.sourceLabel}</b>, source lines {lesson.sourceStartLine}–{lesson.sourceEndLine}. The complete approved section is rendered above; the source copy remains in <code>docs/sources</code>.</p></details>
      <section className="migration-pane pane-warning"><span className="pane-label">BUDGET + CHANGE GATE</span><p>For Azure work, review estimated cost and approved limits before Create. For state-changing work, record the rollback first. SONIC does not execute cloud changes silently.</p></section>
      <section className="lesson-complete">
        <div><ShieldCheck size={22} /><span><b>SELF-VERIFICATION</b><small>Mark complete only after your actual lab evidence matches the pass check.</small></span></div>
        <button onClick={toggle} className={completed.includes(lesson.id) ? 'is-complete' : ''}>{completed.includes(lesson.id) ? <Check size={17} /> : <span className="empty-check" />} {completed.includes(lesson.id) ? 'VERIFIED' : 'MARK VERIFIED'}</button>
      </section>
      <nav className="lesson-pagination" aria-label="Lesson navigation">{previous ? <button onClick={() => openLesson(previous.id)}><ArrowLeft size={15} /><span><small>PREVIOUS · {previous.code}</small>{previous.title}</span></button> : <span />}{next ? <button onClick={() => openLesson(next.id)}><span><small>NEXT · {next.code}</small>{next.title}</span><ArrowRight size={15} /></button> : <span>COURSE ROUTE COMPLETE</span>}</nav>
    </article>
  );
}

export function MigrationAcademy() {
  const [mode, setModeState] = useState<Mode>('home');
  const [lesson, setLesson] = useState<MigrationLesson | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [storageNotice, setStorageNotice] = useState('');

  useEffect(() => {
    const syncHash = () => {
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const selected = migrationLessonById(params.get('lesson'));
      if (selected) { setLesson(selected); setModeState('lesson'); }
      else if (params.get('view') === 'learn') setModeState('learn');
      else if (params.get('view') === 'job') setModeState('job');
      else if (params.get('view') === 'terminal') setModeState('terminal');
      else { setLesson(null); setModeState('home'); }
    };
    const initialSync = window.setTimeout(() => {
      setCompleted(readMigrationProgress(lessonIds).completed);
      syncHash();
    }, 0);
    window.addEventListener('hashchange', syncHash);
    return () => {
      window.clearTimeout(initialSync);
      window.removeEventListener('hashchange', syncHash);
    };
  }, []);

  const setMode = (next: Mode) => {
    setModeState(next);
    setLesson(null);
    window.location.hash = next === 'home' ? '' : `view=${next}`;
    window.scrollTo({ top: 0 });
  };
  const openLesson = (id: string) => {
    const selected = migrationLessonById(id);
    if (!selected) return;
    setLesson(selected);
    setModeState('lesson');
    window.location.hash = `lesson=${id}`;
    window.scrollTo({ top: 0 });
  };
  const toggle = () => {
    if (!lesson) return;
    const next = completed.includes(lesson.id) ? completed.filter((id) => id !== lesson.id) : [...completed, lesson.id];
    setCompleted(next);
    if (!writeMigrationProgress({ version: 1, completed: next })) setStorageNotice('Progress is kept for this session because browser storage is unavailable.');
  };
  const percent = Math.round((completed.length / migrationLessons.length) * 100);

  return (
    <div className="migration-shell">
      <header className="migration-topbar"><a href="/" className="migration-brand"><span>SONIC</span><small>WINDOWS AGENCY-TO-AZURE MIGRATION</small></a><nav><button aria-current={mode === 'home' ? 'page' : undefined} onClick={() => setMode('home')}>Start Here</button><button aria-current={mode === 'learn' ? 'page' : undefined} onClick={() => setMode('learn')}>All Projects</button><button aria-current={mode === 'job' ? 'page' : undefined} onClick={() => setMode('job')}>Exact Jobs</button><button aria-current={mode === 'terminal' ? 'page' : undefined} onClick={() => setMode('terminal')}><TerminalSquare size={15} /> Lab Terminal</button></nav><span className="migration-progress"><i style={{ width: `${percent}%` }} />{percent}% MIGRATION VERIFIED</span></header>
      <main>
        {mode === 'home' && <HomeView completed={completed} setMode={setMode} openLesson={openLesson} />}
        {mode === 'learn' && <LearnView completed={completed} openLesson={openLesson} />}
        {mode === 'job' && <JobView completed={completed} openLesson={openLesson} />}
        {mode === 'lesson' && lesson && <LessonView lesson={lesson} completed={completed} toggle={toggle} openLesson={openLesson} />}
        {mode === 'terminal' && <LabTerminal />}
        {storageNotice && <p className="storage-notice">{storageNotice}</p>}
      </main>
      <footer className="migration-footer"><span>SONIC / AGENCY-TO-AZURE</span><span><RotateCcw size={14} /> Rollback before risk</span><span><CircleDollarSign size={14} /> Budget before Create</span><a href="/">RHEL / Wazuh course <ExternalLink size={13} /></a></footer>
    </div>
  );
}
