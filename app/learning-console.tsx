'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { lessons as linuxLessons } from './course';
import {
  almaSnapshot,
  almaServerSnapshot,
  subscribeAlma,
} from '@/lib/alma-progress';
import {
  nessusSnapshot,
  nessusServerSnapshot,
  subscribeNessus,
} from '@/lib/nessus-progress';
import { migrationLessons } from './migration-course';
import { readMigrationProgress } from '@/lib/migration-progress';
import { snapshot, serverSnapshot, subscribe } from '@/lib/progress-store';
import {
  learningPathways,
  pathwayLessons,
  type ConsoleLesson,
} from './learning-pathways';
import './learning-console.css';

const number = (n: number) => String(n).padStart(2, '0');

export function LearningConsole({
  initialPathId = 'windows',
}: {
  initialPathId?: string;
}) {
  const [pathId, setPathId] = useState(initialPathId);
  const [selectedId, setSelectedId] = useState(
    initialPathId === 'windows'
      ? 'lab-04'
      : pathwayLessons(
          learningPathways.find((path) => path.id === initialPathId)!,
        )[0].id,
  );
  const [expanded, setExpanded] = useState<string[]>([initialPathId]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState<string[]>([]);
  const [tool, setTool] = useState<'terminal' | 'progress'>('terminal');
  const almaCompleted = JSON.parse(
    useSyncExternalStore(subscribeAlma, almaSnapshot, almaServerSnapshot),
  ) as string[];
  const nessusProgress = JSON.parse(
    useSyncExternalStore(subscribeNessus, nessusSnapshot, nessusServerSnapshot),
  ) as { verified: string[] };
  const linuxProgress = JSON.parse(
    useSyncExternalStore(subscribe, snapshot, serverSnapshot),
  ) as { completed: string[] };
  useEffect(() => {
    const sync = () =>
      setMigrationCompleted(
        readMigrationProgress(migrationLessons.map((lesson) => lesson.id))
          .completed,
      );
    sync();
    window.addEventListener('focus', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('focus', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  const pathway = learningPathways.find((path) => path.id === pathId)!;
  const available = pathwayLessons(pathway);
  const selected =
    available.find((lesson) => lesson.id === selectedId) ?? available[0];
  const completed = [
    ...new Set([
      ...almaCompleted,
      ...linuxProgress.completed,
      ...migrationCompleted,
      ...nessusProgress.verified,
    ]),
  ];
  const next = available.find((lesson) => !completed.includes(lesson.id));
  const section = pathway.sections.find((item) =>
    item.lessons.some((lesson) => lesson.id === selected.id),
  )!;
  const core = pathway.sections
    .filter((item) => !item.optional)
    .flatMap((item) => item.lessons);
  const count = available.filter((lesson) =>
    completed.includes(lesson.id),
  ).length;
  function chooseCourse(id: string) {
    setPathId(id);
    setSelectedId(
      pathwayLessons(learningPathways.find((path) => path.id === id)!)[0].id,
    );
    setExpanded((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  }
  function chooseLesson(id: string, lesson: ConsoleLesson) {
    setPathId(id);
    setSelectedId(lesson.id);
    setMenuOpen(false);
  }
  const linux = linuxLessons.find((lesson) => lesson.id === selected.id);
  const command =
    selected.source === 'security-lab'
      ? 'Get-MpComputerStatus | Select-Object AntivirusEnabled,RealTimeProtectionEnabled'
      : selected.source === 'nessus'
      ? pathId === 'nessus-windows'
        ? "Get-Service -DisplayName 'Tenable Nessus'"
        : 'systemctl status nessusd --no-pager'
      : selected.source === 'alma'
        ? 'cat /etc/os-release'
        : selected.id === 'lab-04'
          ? 'Get-ADDomain -Identity cloudseam.tech'
          : selected.id === 'lab-07'
            ? 'repadmin /replsummary'
            : selected.id.startsWith('sql-')
              ? "RESTORE VERIFYONLY FROM DISK = N'C:\\LabBackups\\Practice.bak';"
              : selected.source === 'linux'
                ? (linux?.command.split('\n')[0] ?? 'systemctl status sshd')
                : 'Get-ComputerInfo | Select-Object CsName, WindowsProductName';
  return (
    <div className="learning-console">
      <a className="console-skip" href="#console-main">
        Skip to dashboard
      </a>
      <aside
        className={'console-sidebar' + (menuOpen ? ' is-open' : '')}
        aria-label="Learning navigation"
      >
        <div className="console-brand">
          <a href="/">SONIC-Academy</a>
          <small>ENTERPRISE IT LEARNING CONSOLE</small>
        </div>
        <div className="console-session">
          <b>learner@sonic:~$</b> dashboard
          <br />
          --learning-mode
        </div>
        <div className="console-nav-label">SYSTEM</div>
        <button
          className="console-nav current"
          onClick={() => {
            setTool('terminal');
            setMenuOpen(false);
          }}
        >
          ▦ <span>Dashboard</span>
        </button>
        <button
          className="console-nav"
          onClick={() => {
            setPathId('windows');
            setSelectedId('lab-00');
            setExpanded(['windows']);
            setMenuOpen(false);
          }}
        >
          ▤ <span>Start Here</span>
        </button>
        <div className="console-divider" />
        <div className="console-nav-label">COURSE LIBRARY / IN ORDER</div>
        <nav aria-label="Course pathways">
          {learningPathways.map((path, index) => (
            <div key={path.id}>
              <button
                className={
                  'console-nav course' + (pathId === path.id ? ' chosen' : '')
                }
                aria-expanded={expanded.includes(path.id)}
                aria-controls={`course-${path.id}`}
                onClick={() => chooseCourse(path.id)}
              >
                <span className="console-chevron">
                  {expanded.includes(path.id) ? '⌄' : '›'}
                </span>
                <span>{path.title}</span>
                <small>{path.id === 'linux' ? '↗' : number(index + 1)}</small>
              </button>
              {expanded.includes(path.id) && (
                <div id={`course-${path.id}`} className="console-subnav">
                  {path.sections.map((group) => (
                    <details
                      key={group.title}
                      open={group.lessons.some(
                        (lesson) => lesson.id === selected.id,
                      )}
                    >
                      <summary>
                        {group.title}
                        {group.optional ? ' · OPTIONAL' : ''}
                      </summary>
                      {group.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          className={selected.id === lesson.id ? 'active' : ''}
                          aria-current={
                            selected.id === lesson.id ? 'true' : undefined
                          }
                          onClick={() => chooseLesson(path.id, lesson)}
                        >
                          {lesson.title}
                        </button>
                      ))}
                    </details>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="console-divider" />
        <div className="console-nav-label">TOOLS</div>
        <a className="console-nav" href={selected.href}>
          ⌘ <span>Practice Labs</span>
        </a>
        <a className="console-nav" href="/migration#lesson=lab-19">
          ⌁ <span>Troubleshooting</span>
        </a>
        <button
          className="console-nav"
          onClick={() => {
            setTool('terminal');
            document
              .getElementById('console-terminal')
              ?.scrollIntoView({ behavior: 'smooth' });
            setMenuOpen(false);
          }}
        >
          ▣ <span>Terminal Examples</span>
        </button>
        <button
          className="console-nav"
          onClick={() => {
            setTool('progress');
            document
              .getElementById('console-terminal')
              ?.scrollIntoView({ behavior: 'smooth' });
            setMenuOpen(false);
          }}
        >
          ▤ <span>My Progress</span>
        </button>
        <div className="console-sidebar-foot">
          <b>● LEARNING CONSOLE</b>
          <div>
            <span>STORAGE</span>
            <span>THIS BROWSER</span>
          </div>
          <div>
            <span>MODE</span>
            <span>SELF-GUIDED</span>
          </div>
        </div>
      </aside>
      <main id="console-main" className="console-main">
        <header className="console-commandbar">
          <button
            className="console-menu"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
          <div>
            <span className="console-green">[learner@sonic ~]#</span>{' '}
            <span>learning-console --overview</span>
          </div>
          <span className="console-workspace-state">● LOCAL WORKSPACE</span>
        </header>
        <div className="console-metrics">
          <Metric
            color="cyan"
            label="CURRENT COURSE"
            value={pathway.title}
            status={
              pathway.id === 'linux'
                ? 'PARALLEL'
                : number(learningPathways.indexOf(pathway) + 1)
            }
            caption={pathway.prerequisite}
          />
          <Metric
            color="green"
            label="AVAILABLE LESSONS"
            status={`${number(available.length)} TOTAL`}
            value={`${core.length} core lessons`}
            caption={`${available.length - core.length} optional extension lessons`}
          />
          <Metric
            color="amber"
            label="NEXT TASK"
            status={next ? 'UNVERIFIED' : 'VERIFIED'}
            value={next?.title ?? 'Pathway complete'}
            caption="First unverified lesson in this pathway"
          />
          <Metric
            color="pink"
            label="WORKSPACE STATUS"
            status="GUIDED"
            value="Learning Console"
            caption="Examples are simulations · bring your own lab"
          />
        </div>
        <div className="console-middle">
          <section className="console-panel">
            <header className="console-panel-head">
              <span className="console-green">COURSE MODULES</span>
              <span>{number(available.length)} AVAILABLE</span>
            </header>
            <div className="console-module-list">
              {pathway.sections.map((group) => (
                <div key={group.title}>
                  <h2>
                    {group.title}
                    <span>{group.optional ? 'OPTIONAL' : 'CORE'}</span>
                  </h2>
                  {group.optional && (
                    <p className="console-extension-note">
                      {pathway.id === 'windows'
                        ? 'After SQL01 backup / restore; complete WSUS before MECM updates.'
                        : 'After SQL backup / restore and Azure foundations; two healthy cluster nodes required.'}
                    </p>
                  )}
                  {group.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      className={
                        'console-lesson-row' +
                        (selected.id === lesson.id ? ' active' : '')
                      }
                      onClick={() => setSelectedId(lesson.id)}
                      aria-pressed={selected.id === lesson.id}
                    >
                      <span className="console-row-number">
                        {number(available.indexOf(lesson) + 1)}
                      </span>
                      <span>{lesson.title}</span>
                      <small>
                        {selected.id === lesson.id
                          ? 'SELECTED ●'
                          : completed.includes(lesson.id)
                            ? 'VERIFIED ✓'
                            : 'OPEN ›'}
                      </small>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </section>
          <section className="console-panel console-overview">
            <header className="console-panel-head">
              <span className="console-amber">SELECTED CLASS // OVERVIEW</span>
              <span>LESSON PREVIEW</span>
            </header>
            <div className="console-overview-body">
              <div className="console-lesson-header">
                <div className="console-eyebrow">
                  {pathway.title} / {selected.id}
                </div>
                <h1>{selected.title}</h1>
                <p>{selected.description}</p>
              </div>
              {section.optional && (
                <p className="console-optional">
                  OPTIONAL EXTENSION ·{' '}
                  {pathway.id === 'windows'
                    ? 'Finish the SQL Server core pathway before MECM.'
                    : 'Finish core SQL recovery and Azure foundations first.'}
                </p>
              )}
              <ol className="console-steps">
                {selected.steps.map((step, index) => (
                  <li key={step}>
                    <span>{number(index + 1)}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <a className="console-action" href={selected.href}>
                OPEN GUIDED LAB <span>→</span>
              </a>
            </div>
          </section>
        </div>
        <section id="console-terminal" className="console-terminal">
          <header className="console-panel-head">
            <span className="console-green">
              {tool === 'progress'
                ? 'PATHWAY / PROGRESS'
                : 'TERMINAL / LAB PREVIEW'}
            </span>
            <span>
              {tool === 'progress'
                ? 'SELF-REPORTED · THIS BROWSER'
                : 'SIMULATION · NOT A LIVE HOST'}
            </span>
          </header>
          <div
            className="console-log"
            role="log"
            aria-label={
              tool === 'progress'
                ? 'Pathway progress'
                : 'Simulated terminal example'
            }
          >
            {tool === 'progress' ? (
              <>
                <p>
                  <time>[LOCAL]</time> <b className="console-cyan">[PATH]</b>{' '}
                  {pathway.title}
                </p>
                <p>
                  <time>[LOCAL]</time> <b className="console-green">[DONE]</b>{' '}
                  {count} of {available.length} available lessons verified
                </p>
                <p>
                  <time>[LOCAL]</time> <b className="console-amber">[NEXT]</b>{' '}
                  {next?.title ?? 'All pathway lessons verified'}
                </p>
                <p>
                  <time>[LOCAL]</time> <b className="console-pink">[NOTE]</b>{' '}
                  Verification is recorded inside each lesson after checking
                  your actual lab.
                </p>
              </>
            ) : (
              <>
                <p>
                  <time>[EXAMPLE]</time> <b className="console-cyan">[CMD]</b>{' '}
                  {command}
                </p>
                <p>
                  <time>[EXAMPLE]</time> <b className="console-green">[INFO]</b>{' '}
                  Target: {selected.metadata}
                </p>
                <p>
                  <time>[EXAMPLE]</time>{' '}
                  <b className="console-amber">[CHECK]</b> Compare actual output
                  with the lesson pass checks.
                </p>
                <p>
                  <time>[EXAMPLE]</time> <b className="console-cyan">[NEXT]</b>{' '}
                  {selected.steps[2] ??
                    selected.steps[selected.steps.length - 1]}
                </p>
                <p>
                  <time>[EXAMPLE]</time> <b className="console-amber">[HINT]</b>{' '}
                  {selected.id === 'lab-04'
                    ? 'Confirm DNS resolves cloudseam.tech before adding AG-DC02.'
                    : 'Read the complete lesson before running commands.'}
                </p>
                <p>
                  <time>[EXAMPLE]</time> <b className="console-pink">[PATH]</b>{' '}
                  {pathway.title} / {selected.title}
                </p>
                <p>
                  <time>[EXAMPLE]</time> <b className="console-pink">[MODE]</b>{' '}
                  Static simulation; no commands have been executed.
                </p>
              </>
            )}
          </div>
        </section>
        <footer className="console-footer">
          <span>SONIC-Academy // LEARN · PRACTICE · VERIFY</span>
          <span>WINDOWS / AD → SQL → AZURE → MIGRATIONS</span>
        </footer>
      </main>
    </div>
  );
}

function Metric({
  color,
  label,
  status,
  value,
  caption,
}: {
  color: string;
  label: string;
  status: string;
  value: string;
  caption: string;
}) {
  return (
    <section className={`console-metric console-${color}`}>
      <div>
        <span>{label}</span>
        <span>{status}</span>
      </div>
      <span className="console-accent-rule" aria-hidden="true" />
      <h2 title={value}>{value}</h2>
      <p title={caption}>{caption}</p>
    </section>
  );
}
