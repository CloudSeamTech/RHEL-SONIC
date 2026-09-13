'use client';
import { preparationLessonIds } from './course-roadmap';
import { formatMinutes, timingFor } from './course-timing';

import { useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Circle,
  Network,
  Play,
  Route,
  ShieldCheck,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { dashboardModel } from '@/lib/dashboard-model';
import { SonicCore } from './sonic-core';
import { ConsoleArchitecture, SonicCallout } from './sonic-ui';
import './sonic-dashboard.css';

type Model = ReturnType<typeof dashboardModel>;
type Navigation = {
  onOpenLesson: (id: string) => void;
  onOpenStage: (id: string) => void;
  onOpenPath: () => void;
};
const statusLabel = {
  completed: 'Completed',
  'in-progress': 'In progress',
  'not-started': 'Not started',
  planned: 'Planned',
};

function OverallProgress({ model }: { model: Model }) {
  const { count, total, percent } = model.overall;
  return (
    <section
      className="mission-overall"
      id="dashboard-progress"
      aria-label="Overall course progress"
      tabIndex={-1}
    >
      <div>
        <h2>OVERALL PROGRESS</h2>
        <strong>{percent}%</strong>
      </div>
      <Progress value={percent ?? 0} aria-label="Available lessons complete" />
      <p>
        <b>
          {count} / {total}
        </b>{' '}
        lessons complete <span>{total - count} remaining</span>
      </p>
      <small>Available lab lessons · saved in this browser</small>
    </section>
  );
}

function MissionPanel({
  model,
  onContinue,
  onOpenPath,
}: {
  model: Model;
  onContinue: () => void;
  onOpenPath: () => void;
}) {
  return (
    <section className="dashboard-mission" aria-label="Start your lab">
      <span className="eyebrow">MISSION / LEARN · BUILD · VERIFY</span>
      <h1>
        RHEL 9 <br />
        ADMINISTRATOR LAB
      </h1>
      <p className="mission-lead">
        From your workstation to a managed Linux endpoint.
      </p>
      <p className="mission-description">
        Build the hosts. Connect securely. Transfer files. Establish a baseline
        and recovery plan.
      </p>
      <div className="mission-start">
        <button className="primary start-here" onClick={onContinue}>
          <Play size={16} fill="currentColor" />
          {model.next
            ? model.overall.count
              ? 'CONTINUE LAB'
              : 'START HERE'
            : 'REVIEW LAB'}
        </button>
        <button className="mission-path-link" onClick={onOpenPath}>
          View learning path <ArrowRight size={14} />
        </button>
      </div>
      <div className="mission-next-lesson">
        <span>
          {model.next ? 'YOUR NEXT LESSON' : 'AVAILABLE LAB COMPLETE'}
        </span>
        <strong>{model.next?.title ?? 'All available lessons verified'}</strong>
      </div>
      <OverallProgress model={model} />
      <p className="course-time">
        <strong>PREPARATION: ~2–3 HOURS HANDS-ON</strong>
        <br />
        {formatMinutes(
          timingFor(preparationLessonIds, model.completed).handsOn,
        )}{' '}
        preparation remaining · deployment time is additional
      </p>
      <p className="mission-boundary">
        Wazuh deployment, event verification and recovery exercises are
        available.
      </p>
    </section>
  );
}

function QuickActions({
  model,
  onContinue,
  onArchitecture,
  onProgress,
  onOpenPath,
}: {
  model: Model;
  onContinue: () => void;
  onArchitecture: () => void;
  onProgress: () => void;
  onOpenPath: () => void;
}) {
  return (
    <aside className="dashboard-actions">
      <section className="dashboard-panel">
        <h2>QUICK ACTIONS</h2>
        <div className="quick-action-buttons">
          <button onClick={onContinue}>
            <Play size={15} />
            {model.next ? 'Continue next lesson' : 'Review lab lessons'}
          </button>
          <button onClick={onArchitecture}>
            <Network size={16} />
            View lab architecture
          </button>
          <button onClick={onProgress}>
            <ShieldCheck size={16} />
            Check progress
          </button>
          <button onClick={onOpenPath}>
            <Route size={16} />
            Learning path
          </button>
        </div>
      </section>
      <section className="dashboard-panel current-mission">
        <h2>CURRENT MISSION</h2>
        <dl>
          <div>
            <dt>STAGE</dt>
            <dd>
              {model.stage
                ? `${String(model.stages.findIndex((stage) => stage.id === model.stage?.id) + 1).padStart(2, '0')} / ${model.stage.title}`
                : 'Available lab complete'}
            </dd>
          </div>
          <div>
            <dt>{model.next ? 'NEXT INCOMPLETE LESSON' : 'STATUS'}</dt>
            <dd>
              {model.next?.title ??
                `All ${model.overall.total} available tasks verified`}
            </dd>
          </div>
          <div>
            <dt>THEN</dt>
            <dd>
              {model.following?.title ?? 'Review the completed lab evidence'}
            </dd>
          </div>
        </dl>
      </section>
    </aside>
  );
}

function LearningPathProgress({
  model,
  onOpenStage,
  onOpenPath,
}: {
  model: Model;
  onOpenStage: (id: string) => void;
  onOpenPath: () => void;
}) {
  const rail = useRef<HTMLDivElement>(null);
  return (
    <section
      className="dashboard-learning-path"
      aria-labelledby="dashboard-path-title"
    >
      <header>
        <div>
          <span className="eyebrow">YOUR COURSE / IN ORDER</span>
          <h2 id="dashboard-path-title">Learning path</h2>
        </div>
        <span>
          {model.stages.length} stages · {model.overall.total} available lessons
        </span>
        <div className="stage-rail-controls">
          <button
            aria-label="Previous stages"
            onClick={() => rail.current?.scrollBy({ left: -520 })}
          >
            <ArrowLeft size={16} />
          </button>
          <button
            aria-label="Next stages"
            onClick={() => rail.current?.scrollBy({ left: 520 })}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </header>
      <div className="stage-progress-rail" ref={rail}>
        {model.stages.map((stage, i) => (
          <button
            key={stage.id}
            className={`stage-progress-card state-${stage.state} ${model.stage?.id === stage.id ? 'is-current' : ''}`}
            data-stage-id={stage.id}
            onClick={() => onOpenStage(stage.id)}
            aria-label={`Open stage ${i + 1}: ${stage.title}`}
          >
            <span className="stage-card-top">
              <span className="stage-card-number">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>
                {model.stage?.id === stage.id
                  ? 'CURRENT STAGE'
                  : statusLabel[stage.state]}
              </span>
              {stage.state === 'completed' && <Check size={16} />}
            </span>
            <strong>{stage.title}</strong>
            <span className="stage-card-description">{stage.desc}</span>
            {stage.total > 0 && (
              <span className="stage-time">
                {stage.time}
                <br />
                {formatMinutes(
                  timingFor(stage.lessonIds, model.completed).handsOn,
                )}{' '}
                remaining
              </span>
            )}
            {stage.percent === null ? (
              <span className="stage-planned-label">
                {stage.later ? 'Later deep dive' : 'Planned exercise'}{' '}
                <ArrowRight size={14} />
              </span>
            ) : (
              <span className="stage-card-progress">
                <span className="stage-meter" aria-hidden="true">
                  <span style={{ width: `${stage.percent}%` }} />
                </span>
                <b>{stage.percent}%</b>
                <small>
                  {stage.count} / {stage.total} verified ·{' '}
                  {model.stage?.id === stage.id
                    ? 'Continue →'
                    : stage.state === 'completed'
                      ? 'Review →'
                      : 'Open →'}
                </small>
              </span>
            )}
          </button>
        ))}
      </div>
      <footer>
        <p>
          Percentages count verified lessons within each stage. Planned stages
          have no completable lessons yet.
        </p>
        <button onClick={onOpenPath}>
          View all stages <ArrowRight size={14} />
        </button>
      </footer>
    </section>
  );
}

function LabTasks({
  model,
  onOpenLesson,
  onOpenStage,
}: { model: Model } & Pick<Navigation, 'onOpenLesson' | 'onOpenStage'>) {
  return (
    <section className="dashboard-panel lab-tasks">
      <header>
        <div>
          <span className="eyebrow">LAB READINESS</span>
          <h2>Lab tasks</h2>
        </div>
        <span>From your verified work</span>
      </header>
      <ul>
        {model.milestones.map((task) => (
          <li key={task.title}>
            <button
              className={`state-${task.state}`}
              onClick={() => {
                const target =
                  task.ids.find((id) => !model.completed.has(id)) ??
                  task.ids[0];
                if (target) onOpenLesson(target);
                else onOpenStage(task.stage);
              }}
            >
              <span className="lab-task-name">
                {task.state === 'completed' ? (
                  <Check size={15} />
                ) : (
                  <Circle size={13} />
                )}
                <span>{task.title}</span>
              </span>
              <span className="lab-task-status">{statusLabel[task.state]}</span>
            </button>
          </li>
        ))}
      </ul>
      <p>Self-verified course tasks, not a live infrastructure health check.</p>
    </section>
  );
}

export function SonicDashboard({
  completed,
  onOpenLesson,
  onOpenStage,
  onOpenPath,
}: { completed: string[] } & Navigation) {
  const model = dashboardModel(completed);
  const architecture = useRef<HTMLDetailsElement>(null);
  const onContinue = () => {
    const target = model.next?.id ?? model.stages[0].lessonIds[0];
    onOpenLesson(target);
  };
  const showArchitecture = () => {
    if (architecture.current) {
      architecture.current.open = true;
      architecture.current.scrollIntoView({ block: 'center' });
      architecture.current.querySelector('summary')?.focus();
    }
  };
  const showProgress = () => {
    const target = document.getElementById('dashboard-progress');
    target?.scrollIntoView({ block: 'center' });
    target?.focus({ preventScroll: true });
  };
  return (
    <div className="sonic-training-dashboard">
      <div className="dashboard-overview">
        <MissionPanel
          model={model}
          onContinue={onContinue}
          onOpenPath={onOpenPath}
        />
        <SonicCore onOpenLesson={onOpenLesson} onOpenRoadmap={onOpenPath} />
        <QuickActions
          model={model}
          onContinue={onContinue}
          onArchitecture={showArchitecture}
          onProgress={showProgress}
          onOpenPath={onOpenPath}
        />
      </div>
      <LearningPathProgress
        model={model}
        onOpenStage={onOpenStage}
        onOpenPath={onOpenPath}
      />
      <div className="dashboard-support">
        <LabTasks
          model={model}
          onOpenLesson={onOpenLesson}
          onOpenStage={onOpenStage}
        />
        <div className="dashboard-reference">
          <details
            ref={architecture}
            className="dashboard-panel architecture-reference"
          >
            <summary>
              <Network size={17} />
              Lab architecture <span>Explore the two-host plan</span>
            </summary>
            <ConsoleArchitecture />
          </details>
          <SonicCallout>
            Your private SSH key stays on your Windows workstation. Verify each
            host before marking its task complete.
          </SonicCallout>
          <div className="dashboard-panel mission-readiness">
            <BookOpen size={20} />
            <div>
              <h2>
                {
                  model.stages.filter((stage) => stage.state === 'completed')
                    .length
                }{' '}
                of {model.stages.filter((stage) => stage.total > 0).length}{' '}
                available stages verified
              </h2>
              <p>
                {model.overall.total - model.overall.count} lab lessons
                remaining.{' '}
                {model.stages.filter((stage) => stage.total === 0).length}{' '}
                stages are planned or later deep dives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
