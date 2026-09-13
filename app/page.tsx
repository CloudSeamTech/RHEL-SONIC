'use client';
import { SessionGuide } from './session-guide';
import { formatMinutes, lessonTimings, timingFor } from './course-timing';
import { Fragment, useEffect, useState, useSyncExternalStore } from 'react';
import type { ProgressState } from '@/lib/progress-model';
import {
  KeyDiagram,
  ArchitectureDiagram,
  ProtocolDiagram,
} from './lesson-visuals';
import {
  subscribe,
  snapshot,
  serverSnapshot,
  saveProgress,
} from '@/lib/progress-store';
import {
  ArrowRight,
  ArrowLeft,
  Terminal,
  Cloud,
  Files,
  ShieldCheck,
  Activity,
  RotateCcw,
  LayoutDashboard,
  Route,
  Check,
  Clock3,
  ChevronRight,
  BookOpen,
  Copy,
  ExternalLink,
} from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Progress } from '@/components/ui/progress';
import { lessons, modules, sources, changeMethod, primaryFlow } from './course';
import type { Lesson } from './course';
import { SonicDashboard } from './sonic-dashboard';
import {
  SonicMark,
  SonicWalkthrough,
  SonicCallout,
  ClickPath,
  SonicTerminal,
  CommandBreakdown,
} from './sonic-ui';
function FollowupBlock({ block }: { block: NonNullable<Lesson['followup']> }) {
  const [message, setMessage] = useState('');
  return (
    <section className="followup-block">
      <h3>Where to do the next steps</h3>
      <SessionGuide location={block.shell} />
      <div className="terminal">
        <header>
          <b>{block.shell}</b>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(block.command);
                setMessage('Copied');
              } catch {
                setMessage('Select the commands and copy manually.');
              }
            }}
          >
            <Copy size={14} />
            Copy
          </button>
        </header>
        <pre>
          <code>{block.command}</code>
        </pre>
      </div>
      <output className="notice">{message}</output>
      <details className="explanation" open>
        <summary>Understand this command block</summary>
        <ul>
          {block.args.map((argument) => (
            <li key={argument}>{argument}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}
const icons: Record<string, typeof Terminal> = {
  terminal: Terminal,
  cloud: Cloud,
  file: Files,
  shield: ShieldCheck,
  activity: Activity,
  rollback: RotateCcw,
};
export default function Home() {
  const [view, setView] = useState('dashboard');
  const [step, setStep] = useState(0);
  const progress: ProgressState = JSON.parse(
    useSyncExternalStore(subscribe, snapshot, serverSnapshot),
  );
  const completed = progress.completed;
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: {
              name: string;
              description: string;
              inputSchema: object;
              annotations: object;
              execute: (input: unknown) => object;
            },
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: 'open_module_one_task',
            description:
              'Open a numbered module-one task for reading. Does not execute commands or mark completion.',
            inputSchema: {
              type: 'object',
              properties: {
                task: { type: 'integer', minimum: 1, maximum: lessons.length },
              },
              required: ['task'],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false },
            execute(input) {
              if (
                typeof input !== 'object' ||
                input === null ||
                !('task' in input) ||
                typeof input.task !== 'number' ||
                !Number.isInteger(input.task) ||
                input.task < 1 ||
                input.task > lessons.length
              )
                throw new Error(
                  `task must be an integer from 1 to ${lessons.length}`,
                );
              setStep(input.task - 1);
              setView('lesson');
              setCopied(false);
              setNotice('');
              window.scrollTo({ top: 0 });
              return { task: input.task, title: lessons[input.task - 1].title };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {
      /* Optional browser integration. */
    }
    return () => lifecycle.abort();
  }, []);
  function navigate(next: string) {
    setView(next);
    setCopied(false);
    setNotice('');
    window.scrollTo({ top: 0 });
  }
  function mark() {
    const next = completed.includes(lesson.id)
      ? completed.filter((id) => id !== lesson.id)
      : [...completed, lesson.id];
    if (!saveProgress(next))
      setNotice(
        'Progress is available for this session only; browser storage is unavailable.',
      );
  }
  function selectStep(n: number) {
    setStep(n);
    setCopied(false);
    setNotice('');
    window.scrollTo({ top: 0 });
  }
  function openLesson(id: string) {
    const index = lessons.findIndex((item) => item.id === id);
    if (index >= 0) {
      selectStep(index);
      navigate('lesson');
    }
  }
  function jump(next: string, selector: string) {
    navigate(next);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const target = document.querySelector<HTMLElement>(selector);
        target?.scrollIntoView({ block: 'center' });
        if (target instanceof HTMLDetailsElement) target.open = true;
        const detail = target?.querySelector('details');
        if (detail) detail.open = true;
        target?.focus({ preventScroll: true });
      }),
    );
  }
  function openStage(id: string) {
    const stage = modules.find((item) => item.id === id);
    if (!stage) return;
    const target =
      stage.lessonIds.find((lessonId) => !completed.includes(lessonId)) ??
      stage.lessonIds[0];
    if (target) openLesson(target);
    else jump('path', '#stage-' + id);
  }
  const percent = Math.round((completed.length / lessons.length) * 100);
  const lesson = lessons[step];
  const visualSample =
    lesson.id === 'network-plan-v2' || lesson.id.endsWith('-v4');
  const nextLesson = lessons.find((item) => !completed.includes(item.id));
  const readyStages = modules.filter((stage) => stage.lessonIds.length > 0);
  const currentStage = modules.find((stage) =>
    stage.lessonIds.includes(lesson.id),
  );
  return (
    <SidebarProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Sidebar className="course-sidebar">
        <SidebarHeader className="brand">
          <span className="brand-icon">
            <SonicMark />
          </span>
          <div>
            SONIC<span>RHEL OPERATIONS LAB</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="nav-label">CONSOLE NAVIGATION</div>
          <nav aria-label="Main navigation">
            {[
              { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
              { id: 'path', label: 'Learning path', Icon: Route },
              { id: 'lesson', label: 'Lab lessons', Icon: BookOpen },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                className={'nav-item ' + (view === id ? 'selected' : '')}
                aria-current={view === id ? 'page' : undefined}
                onClick={() => navigate(id)}
              >
                <Icon size={19} />
                {label}
                {view === id && <span className="nav-dot" />}
              </button>
            ))}
            <div className="nav-label">COURSE TOOLS</div>
            <button
              className="nav-item"
              onClick={() => jump('lesson', '.your-turn')}
            >
              <ShieldCheck size={19} />
              Challenges
            </button>
            <button
              className="nav-item"
              onClick={() => jump('dashboard', '#dashboard-progress')}
            >
              <Activity size={19} />
              Progress
            </button>
            <button
              className="nav-item"
              onClick={() => jump('lesson', '.sources')}
            >
              <ExternalLink size={19} />
              Resources
            </button>
            <button
              className="nav-item"
              onClick={() => jump('lesson', '.sonic-terminal, .terminal')}
            >
              <Terminal size={19} />
              Terminal
            </button>
          </nav>
          <div className="sidebar-course">
            <div className="nav-label">THE COURSE</div>
            <p>Wazuh Deployment</p>
            <span>Practical RHEL 9 refresher</span>
            <div className="sidebar-progress">
              <span>MISSION PROGRESS</span>
              <b>{percent}%</b>
            </div>
            <Progress
              value={percent}
              aria-label="Available lab task progress"
            />
            <small>
              {completed.length} of {lessons.length} tasks verified
            </small>
            <div className="mission-next">
              <span>NEXT UNVERIFIED TASK</span>
              <p>{nextLesson?.title ?? 'Preparation verified'}</p>
            </div>
          </div>
          <div className="sidebar-tip">
            <SonicCallout kind="tip">
              Understand it. Run it. Verify it. Mark tasks complete only after
              checking your lab.
            </SonicCallout>
          </div>
        </SidebarContent>
        <SidebarFooter className="sidebar-footer">
          <span className="avatar">YOU</span>
          <div>
            Your lab workspace<small>Progress saved on this browser</small>
          </div>
        </SidebarFooter>
      </Sidebar>
      <div className="workspace">
        <header className="topbar">
          <div>
            <SidebarTrigger />
            <span>
              SONIC <span className="topbar-divider">{'//'}</span> RHEL LAB
            </span>
            <ChevronRight size={15} />
            <b>
              {view === 'lesson'
                ? 'Main lab'
                : view === 'path'
                  ? 'Learning path'
                  : 'Dashboard'}
            </b>
          </div>
          <span className="edition">
            <span /> LOCAL PROGRESS · {percent}%
          </span>
        </header>
        <main
          id="main"
          tabIndex={-1}
          className={
            view === 'lesson' && visualSample
              ? 'sonic-lesson'
              : view === 'dashboard'
                ? 'sonic-dashboard'
                : undefined
          }
        >
          <details className="edition-note">
            <summary>
              SONIC NOTE{' '}
              <span>Continuous lab · deployment and recovery available</span>
            </summary>
            <p>
              Continuous lab: retain your Milestone 2 endpoint and completed
              tasks. New two-host, delivery, and rollback tasks start
              unverified. Advanced Linux deep dives follow the Wazuh deployment
              scenario.
            </p>
          </details>
          {progress.previousEdition.length > 0 && (
            <p className="edition-note">
              Earlier edition: {progress.previousEdition.length}/6 verified
              tasks retained. These expanded lab tasks need fresh verification;
              your previous record has not been erased.
            </p>
          )}
          {view === 'dashboard' ? (
            <SonicDashboard
              completed={completed}
              onOpenLesson={openLesson}
              onOpenStage={openStage}
              onOpenPath={() => navigate('path')}
            />
          ) : view === 'path' ? (
            <>
              <div className="page-title">
                <div>
                  <span className="eyebrow">SYSTEMS TRAINING ENVIRONMENT</span>
                  <h1>
                    {view === 'path'
                      ? 'Your learning path'
                      : 'Wazuh Deployment'}
                  </h1>
                  <p>RHEL 9 administration / Windows → Azure → Linux</p>
                </div>
                <span className="version">
                  COURSE 01 <span>/</span> RHEL 9
                </span>
              </div>
              <section className="path-section">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">MISSION ROADMAP</span>
                    <h2>Learn the workflow. Not just the commands.</h2>
                  </div>
                  <span className="subtle">
                    {readyStages.length} stages ready · Wazuh installation next
                  </span>
                </div>
                <div className="module-grid">
                  {modules.map((m, i) => {
                    const Icon = icons[m.icon] ?? Terminal;
                    const available = m.lessonIds.length > 0;
                    const stageComplete =
                      available &&
                      m.lessonIds.every((id) => completed.includes(id));
                    return (
                      <article
                        className={
                          'module-card ' + (available ? 'available' : '')
                        }
                        id={`stage-${m.id}`}
                        tabIndex={-1}
                        key={m.title}
                      >
                        <div className="module-top">
                          <span className="module-icon">
                            <Icon size={22} />
                          </span>
                          <span
                            className={'status ' + (available ? 'ready' : '')}
                          >
                            {available
                              ? stageComplete
                                ? 'Completed'
                                : 'Ready to learn'
                              : m.later
                                ? 'After the main lab'
                                : 'Planned'}
                          </span>
                        </div>
                        <span className="module-number">
                          STAGE {String(i + 1).padStart(2, '0')}{' '}
                          <span> / {m.tag}</span>
                        </span>
                        <h3>{m.title}</h3>
                        <p>{m.desc}</p>
                        <footer>
                          <span>
                            <Clock3 size={14} />
                            {m.time}
                            {m.lessonIds.length > 0 && (
                              <small className="stage-time">
                                Optional reading:{' '}
                                {formatMinutes(timingFor(m.lessonIds).reading)}{' '}
                                · Passive waits:{' '}
                                {formatMinutes(timingFor(m.lessonIds).waiting)}
                              </small>
                            )}
                          </span>
                          {available ? (
                            <button
                              aria-label={`Open ${m.title}`}
                              onClick={() => {
                                const target =
                                  m.lessonIds.find(
                                    (id) => !completed.includes(id),
                                  ) ?? m.lessonIds[0];
                                setStep(
                                  lessons.findIndex(
                                    (item) => item.id === target,
                                  ),
                                );
                                navigate('lesson');
                              }}
                            >
                              <ArrowRight size={19} />
                            </button>
                          ) : (
                            <span className="coming">
                              {m.later
                                ? 'After deployment and recovery'
                                : 'Detailed lab not yet implemented'}
                            </span>
                          )}
                        </footer>
                        {m.plan && (
                          <details className="stage-plan">
                            <summary>
                              {available
                                ? 'Exercise and acceptance checks'
                                : 'Planned exercise and acceptance checks'}
                            </summary>
                            <ol>
                              {m.plan.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ol>
                          </details>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
              <details className="explanation workflow-overview">
                <summary>
                  The continuous administrator scenario · 22 steps
                </summary>
                <p>
                  VM and storage choices are prepared first. Azure requires the
                  account public key before final Create, so key authorization
                  completes the build; existing endpoint work is retained.
                </p>
                <ol>
                  {primaryFlow.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
                <p>
                  Preparation, central installation, endpoint enrollment, event
                  validation, controlled troubleshooting and recovery are
                  available. Advanced deep dives remain planned.
                </p>
              </details>
              <section className="method">
                <span className="method-icon">
                  <BookOpen />
                </span>
                <div>
                  <h3>Every command has a reason.</h3>
                  <p>{changeMethod.join(' → ')}</p>
                </div>
                <span className="method-tag">LEARN BY DOING</span>
              </section>
            </>
          ) : (
            <>
              <button className="back" onClick={() => navigate('path')}>
                <ArrowLeft size={16} />
                Learning path
              </button>
              <div className="page-title lesson-heading">
                <div>
                  <span className="eyebrow">
                    MAIN LAB / WINDOWS → RHEL → WAZUH
                  </span>
                  <h1>
                    {currentStage?.title ?? 'Continuous administrator lab'}
                  </h1>
                  <p>
                    Windows → Azure → RHEL 9. Your named administrator: rexuser.
                  </p>
                </div>
              </div>
              {visualSample && (
                <dl className="lesson-context">
                  <div>
                    <dt>MISSION</dt>
                    <dd>
                      {lesson.id.endsWith('-v4')
                        ? currentStage?.title
                        : 'Azure infrastructure'}
                    </dd>
                  </div>
                  <div>
                    <dt>CURRENT SYSTEM</dt>
                    <dd>
                      {lesson.id.endsWith('-v4')
                        ? lesson.shell
                        : 'Windows workstation · Azure Portal'}
                    </dd>
                  </div>
                  <div>
                    <dt>IDENTITY</dt>
                    <dd>
                      {lesson.id.endsWith('-v4')
                        ? 'rexuser · sudo only where shown'
                        : 'Your signed-in Azure account'}
                    </dd>
                  </div>
                  <div>
                    <dt>PROGRESS</dt>
                    <dd>
                      Lesson {step + 1} of {lessons.length}
                    </dd>
                  </div>
                  <div className="context-objective">
                    <dt>OBJECTIVE</dt>
                    <dd>{lesson.objective}</dd>
                  </div>
                </dl>
              )}
              <div className="lesson-layout">
                <aside className="lesson-index">
                  <div className="index-title">
                    MISSION PROGRESS <span>{percent}%</span>
                  </div>
                  <Progress value={percent} aria-label="Lesson completion" />
                  <nav aria-label="Module tasks">
                    {lessons.map((l, i) => (
                      <Fragment key={l.id}>
                        {(i === 0 || lessons[i - 1].phase !== l.phase) && (
                          <div className="lesson-phase">{l.phase}</div>
                        )}
                        <button
                          className={step === i ? 'current' : ''}
                          aria-current={step === i ? 'step' : undefined}
                          onClick={() => selectStep(i)}
                        >
                          <span
                            className={completed.includes(l.id) ? 'done' : ''}
                          >
                            {completed.includes(l.id) ? (
                              <Check size={14} />
                            ) : (
                              String(i + 1).padStart(2, '0')
                            )}
                          </span>
                          <div>
                            {l.title}
                            <small>{l.time}</small>
                          </div>
                        </button>
                      </Fragment>
                    ))}
                  </nav>
                  <div className="lab-note">
                    <b>One continuous assignment</b>
                    <p>
                      Retain the Milestone 2 endpoint or build it if new. Add a
                      separately sized RHEL central VM; use rexuser and
                      source-restricted SSH on both. Deliver a harmless file and
                      approve rollback before the next Wazuh installation
                      milestone.
                    </p>
                    <p>
                      Commands are learning examples. This site does not run
                      them on your machines.
                    </p>
                  </div>
                </aside>
                <article className="lesson-content">
                  <div className="task-heading">
                    <span className="eyebrow">
                      TASK {String(step + 1).padStart(2, '0')} OF{' '}
                      {lessons.length}
                    </span>
                    <span>
                      <Clock3 size={15} />
                      {lesson.time}
                    </span>
                  </div>
                  <p className="lesson-timing">
                    Optional reading:{' '}
                    {formatMinutes(lessonTimings[lesson.id].reading)}
                    {lessonTimings[lesson.id].waiting[1] > 0 && (
                      <>
                        {' '}
                        · Passive wait:{' '}
                        {formatMinutes(lessonTimings[lesson.id].waiting)}{' '}
                        (separate)
                      </>
                    )}
                  </p>
                  <h2>{lesson.title}</h2>
                  <p className="task-phase">{lesson.phase}</p>
                  <div className="scenario">
                    <span className="eyebrow">
                      {visualSample ? 'MISSION' : 'THE SCENARIO'}
                    </span>
                    <p>{lesson.scenario}</p>
                  </div>
                  {visualSample && (
                    <SonicCallout kind="note">{lesson.change}</SonicCallout>
                  )}
                  {lesson.vsphere && (
                    <aside className="vsphere-callout">
                      <h3>At Work in vSphere</h3>
                      <p>{lesson.vsphere}</p>
                    </aside>
                  )}
                  <div className="concept-grid">
                    <section>
                      <h3>What you will learn</h3>
                      <p>{lesson.objective}</p>
                    </section>
                    <section>
                      <h3>Why this matters at work</h3>
                      <p>{lesson.why}</p>
                    </section>
                  </div>
                  <section className="planned-change">
                    <h3>What we are about to change</h3>
                    <p>{lesson.change}</p>
                  </section>
                  {lesson.visual === 'keys' && <KeyDiagram key={lesson.id} />}
                  {lesson.visual === 'architecture' && <ArchitectureDiagram />}
                  {lesson.visual === 'protocols' && <ProtocolDiagram />}
                  {lesson.walkthrough ? (
                    <SonicWalkthrough steps={lesson.walkthrough} />
                  ) : (
                    <>
                      <SessionGuide location={lesson.shell} />
                      <h3>
                        {visualSample
                          ? 'COMMAND // WINDOWS POWERSHELL'
                          : 'Type these commands in the app named below'}
                      </h3>
                      {visualSample ? (
                        <SonicTerminal
                          shell={lesson.shell}
                          command={lesson.command}
                          expected={lesson.expected}
                        />
                      ) : (
                        <div className="terminal">
                          <header>
                            <span>
                              <i />
                              <i />
                              <i />
                            </span>
                            <b>{lesson.shell}</b>
                            <button
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(
                                    lesson.command,
                                  );
                                  setCopied(true);
                                } catch {
                                  setNotice(
                                    'Copy unavailable. Select and copy the command manually.',
                                  );
                                }
                              }}
                              aria-label="Copy command"
                            >
                              <Copy size={14} />
                              {copied ? 'Copied' : 'Copy'}
                            </button>
                          </header>
                          <pre>
                            <code>{lesson.command}</code>
                          </pre>
                        </div>
                      )}
                      <p className="terminal-hint">
                        Read first, then run one line at a time in the named
                        environment. Stop at any decision gate. PowerShell
                        planning variables do not create Azure resources.
                      </p>
                      {visualSample ? (
                        <CommandBreakdown arguments={lesson.args} />
                      ) : (
                        <details
                          className="explanation"
                          open
                          key={'args' + step}
                        >
                          <summary>
                            Understand every argument{' '}
                            <span>{lesson.args.length} explanations</span>
                          </summary>
                          <ul>
                            {lesson.args.map((a) => (
                              <li key={a}>{a}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                      {lesson.followup && (
                        <FollowupBlock
                          key={lesson.id}
                          block={lesson.followup}
                        />
                      )}
                      {lesson.portal &&
                        (visualSample ? (
                          <ClickPath
                            title={
                              lesson.id.endsWith('-v4')
                                ? lesson.title
                                : 'CREATE VIRTUAL NETWORK'
                            }
                            context={
                              lesson.id.endsWith('-v4')
                                ? 'GUIDED PROCEDURE'
                                : 'AZURE PORTAL'
                            }
                            steps={lesson.portal}
                          />
                        ) : (
                          <section className="portal-steps">
                            <h3>Work through the Azure Portal</h3>
                            <ol>
                              {lesson.portal.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ol>
                          </section>
                        ))}
                    </>
                  )}
                  {lesson.workplaceWalkthrough && (
                    <details className="explanation" key={'workplace' + step}>
                      <summary>
                        Workplace extension · vSphere snapshots and Veeam
                      </summary>
                      <p>
                        Optional workplace procedure. Use your approved
                        maintenance window and backup policy. This is separate
                        from the Azure lab and adds time beyond its preparation
                        estimate.
                      </p>
                      <SonicWalkthrough steps={lesson.workplaceWalkthrough} />
                    </details>
                  )}
                  <section className="result">
                    <h3>
                      <Terminal size={18} />
                      Expected result
                    </h3>
                    <p>{lesson.expected}</p>
                  </section>
                  {visualSample ? (
                    <SonicCallout kind="verify" title="VERIFY // SONIC CHECK">
                      {lesson.verify}
                    </SonicCallout>
                  ) : (
                    <section className="verify">
                      <h3>
                        <ShieldCheck size={19} />
                        Verify before moving on
                      </h3>
                      <p>{lesson.verify}</p>
                    </section>
                  )}
                  <details className="explanation" key={'trouble' + step}>
                    <summary>
                      {visualSample
                        ? 'TROUBLESHOOT // SONIC WARNING'
                        : 'What could go wrong & how to troubleshoot'}
                    </summary>
                    <p>{lesson.trouble}</p>
                    <h3 className="troubleshooting-heading">
                      Work the problem in this order
                    </h3>
                    <ol className="troubleshooting-steps">
                      {lesson.methodology.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ol>
                  </details>
                  <section className="your-turn">
                    <h3>Your Turn</h3>
                    <p>{lesson.challenge}</p>
                    <details key={'answer' + lesson.id}>
                      <summary>Reveal the reasoning</summary>
                      <p>{lesson.answer}</p>
                    </details>
                  </section>
                  <details className="explanation method-reminder">
                    <summary>The administrator’s change method</summary>
                    <p>{changeMethod.join(' → ')}</p>
                    <p>
                      Use the actual baseline, expected result, and rollback
                      decision for this task. Document deviations and validate
                      the complete outcome before closing the change.
                    </p>
                  </details>
                  <details
                    className={
                      visualSample
                        ? 'explanation rollback-checkpoint'
                        : 'explanation'
                    }
                    key={'rollback' + step}
                  >
                    <summary>
                      {visualSample
                        ? 'ROLLBACK CHECKPOINT'
                        : 'Rollback & change record'}
                    </summary>
                    <p>{lesson.rollback}</p>
                  </details>
                  <div className="completion">
                    <div>
                      <strong>
                        {completed.includes(lesson.id)
                          ? 'Task verified'
                          : 'Ready for the next step?'}
                      </strong>
                      <p>
                        Mark complete only after checking the result in your
                        lab.
                      </p>
                    </div>
                    <button
                      className={
                        completed.includes(lesson.id) ? 'secondary' : 'primary'
                      }
                      onClick={mark}
                    >
                      <Check size={17} />
                      {completed.includes(lesson.id)
                        ? 'Undo completion'
                        : 'Mark as verified'}
                    </button>
                  </div>
                  <output className="notice">{notice}</output>
                  <div className="lesson-navigation">
                    <button
                      disabled={step === 0}
                      onClick={() => selectStep(step - 1)}
                    >
                      <ArrowLeft size={16} />
                      Previous task
                    </button>
                    {step < lessons.length - 1 ? (
                      <button onClick={() => selectStep(step + 1)}>
                        Next task
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button onClick={() => navigate('dashboard')}>
                        Back to dashboard
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                  {percent === 100 && (
                    <div className="finished">
                      <ShieldCheck />
                      <div>
                        <b>Available lab tasks verified.</b>
                        <p>
                          Your deployment, verification and recovery exercises
                          are recorded. This is self-verified course progress,
                          not live telemetry. Rollback and deallocation may
                          intentionally stop monitoring.
                        </p>
                      </div>
                    </div>
                  )}
                  <section className="sources">
                    <h3>Keep the official references close</h3>
                    {lesson.sources.map((key) => (
                      <a
                        key={key}
                        href={sources[key].url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {sources[key].title}
                        <ExternalLink size={13} />
                      </a>
                    ))}
                    <p>
                      References checked September 2026. Follow this course’s
                      rexuser account, RHEL image, and restricted network plan;
                      official quickstarts may use different defaults or deploy
                      resources this lab does not need.
                    </p>
                  </section>
                </article>
              </div>
            </>
          )}
          <footer className="page-footer">
            <span>SONIC / RHEL OPERATIONS LAB</span>
            <span>Wazuh Deployment · Practical RHEL 9 administration</span>
            <span>Deployment-first roadmap</span>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}
