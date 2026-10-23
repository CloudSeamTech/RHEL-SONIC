'use client';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  Layers,
  TrendingUp,
  Cloud,
  Terminal,
  Monitor,
  ShieldCheck,
  Database,
  Bookmark,
  LifeBuoy,
  FolderOpen,
  ChevronRight,
} from 'lucide-react';
import { ConsoleReaderShell } from './console-reader-shell';
import {
  learningPathways,
  pathwayLessons,
  type LearningPathway,
} from './learning-pathways';
import { useAcademy } from './academy-provider';
const lessons = learningPathways.flatMap(pathwayLessons);
function PathIcon({ id }: { id: string }) {
  const Icon =
    id === 'sql'
      ? Database
      : id.includes('security') || id.includes('nessus')
        ? ShieldCheck
        : id === 'linux' || id === 'alma'
          ? Terminal
          : id.includes('azure') ||
              id.includes('landing') ||
              id === 'migrations'
            ? Cloud
            : Monitor;
  return <Icon size={30} />;
}
export function LearningConsole(_props: { initialPathId?: string } = {}) {
  const academy = useAcademy();
  const [query, setQuery] = useState(''),
    [view, setView] = useState('dashboard');
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get('q') ?? '');
    setView(params.get('view') ?? 'dashboard');
  }, []);
  const complete = new Set(
    academy.completed.filter((id) => lessons.some((l) => l.id === id)),
  );
  const viewed = new Set(academy.activity.map((a) => a.lesson_id));
  const inProgress = learningPathways.filter((p) => {
    const items = pathwayLessons(p);
    const count = items.filter((l) => complete.has(l.id)).length;
    return (
      count < items.length && (count > 0 || items.some((l) => viewed.has(l.id)))
    );
  });
  const recent = academy.activity
    .map((a) => ({ ...a, lesson: lessons.find((l) => l.id === a.lesson_id) }))
    .filter((a) => a.lesson);
  const recentPath = learningPathways.find((p) =>
    pathwayLessons(p).some((l) => l.id === recent[0]?.lesson_id),
  );
  const resume = recentPath
    ? (pathwayLessons(recentPath).find((l) => !complete.has(l.id)) ??
      lessons.find((l) => !complete.has(l.id)) ??
      pathwayLessons(recentPath)[0])
    : (lessons.find((l) => !complete.has(l.id)) ?? lessons[0]);
  const resumePath = learningPathways.find((p) =>
    pathwayLessons(p).some((l) => l.id === resume.id),
  )!;
  const resumeCount = pathwayLessons(resumePath).filter((l) =>
    complete.has(l.id),
  ).length;
  const percent = Math.round((complete.size / lessons.length) * 100);
  const features = ['azure', 'linux', 'active-directory', 'security'].map(
    (id) => learningPathways.find((p) => p.id === id)!,
  );
  const filtered = lessons.filter(
    (l) =>
      (view !== 'bookmarks' || academy.bookmarks.includes(l.id)) &&
      `${l.title} ${l.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  const showLibrary =
    Boolean(query) || ['courses', 'paths', 'bookmarks'].includes(view);
  function pathCard(path: LearningPathway) {
    const items = pathwayLessons(path),
      count = items.filter((l) => complete.has(l.id)).length;
    return (
      <a
        className={`path-card path-${path.id}`}
        href={items.find((l) => !complete.has(l.id))?.href ?? items[0].href}
        key={path.id}
      >
        <span className="path-icon">
          <PathIcon id={path.id} />
        </span>
        <h3>{path.title}</h3>
        <p>{path.prerequisite}</p>
        <progress
          value={count}
          max={items.length}
          aria-label={`${path.title} progress`}
        />
        <div>
          <span>{items.length} labs</span>
          <strong>{Math.round((count / items.length) * 100)}%</strong>
        </div>
      </a>
    );
  }
  return (
    <ConsoleReaderShell activeView={view}>
      <main className="academy-dashboard">
        <div className="dashboard-main">
          {!showLibrary ? (
            <>
              <section className="academy-hero">
                <div>
                  <span className="eyebrow">SONIC ACADEMY</span>
                  <h1>
                    Real Skills.
                    <br className="hero-mobile-break" /> <span>
                      Seamless
                    </span>{' '}
                    Growth.
                  </h1>
                  <p>
                    Step-by-step, hands-on training for Linux, Windows, Azure,
                    security, and more—built for real-world environments.
                  </p>
                  <div className="hero-actions">
                    <a className="primary-button" href={resume.href}>
                      {recent.length || complete.size
                        ? 'Continue Learning'
                        : 'Start Learning'}
                      <ArrowRight size={17} />
                    </a>
                    <a className="secondary-button" href="/?view=courses">
                      Browse All Courses
                    </a>
                  </div>
                </div>
                <img
                  src="/academy-hero.png"
                  alt="A zipper opens a lavender cloud to reveal training servers"
                />
              </section>
              <section
                className="dashboard-metrics"
                aria-label="Your learning progress"
              >
                {[
                  {
                    label: 'Courses in Progress',
                    value: inProgress.length,
                    note: inProgress.length
                      ? 'Keep going!'
                      : 'Choose your first course',
                    Icon: BookOpen,
                  },
                  {
                    label: 'Labs Completed',
                    value: complete.size,
                    note: 'Self-verified in your lab',
                    Icon: FlaskConical,
                  },
                  {
                    label: 'Learning Paths',
                    value: learningPathways.length,
                    note: 'Explore your next skill',
                    Icon: Layers,
                  },
                  {
                    label: 'Overall Progress',
                    value: `${percent}%`,
                    note: `${complete.size} of ${lessons.length} labs`,
                    Icon: TrendingUp,
                  },
                ].map(({ label, value, note, Icon }) => (
                  <article key={label}>
                    <span className="metric-icon">
                      <Icon size={25} />
                    </span>
                    <div>
                      <p>{label}</p>
                      <strong>{value}</strong>
                      {label === 'Overall Progress' ? (
                        <progress
                          value={complete.size}
                          max={lessons.length}
                          aria-label="Overall progress"
                        />
                      ) : (
                        <small>{note}</small>
                      )}
                    </div>
                  </article>
                ))}
              </section>
              <section className="featured-paths">
                <header>
                  <h2>Featured Learning Paths</h2>
                  <a href="/?view=paths">
                    View All Paths <ArrowRight size={14} />
                  </a>
                </header>
                <div className="path-grid">{features.map(pathCard)}</div>
              </section>
              <section className="explore-courses">
                <header>
                  <h2>Explore More Courses</h2>
                  <a href="/?view=courses">
                    View All Courses <ArrowRight size={14} />
                  </a>
                </header>
                <div className="course-grid">
                  {['splunk', 'mecm', 'wsus', 'alma'].map((id) => {
                    const path = learningPathways.find((p) => p.id === id)!;
                    return (
                      <a href={pathwayLessons(path)[0].href} key={id}>
                        <span className="path-icon">
                          <PathIcon id={id} />
                        </span>
                        <div>
                          <h3>{path.title}</h3>
                          <p>{pathwayLessons(path).length} self-paced labs</p>
                          <small>Guided practice</small>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </section>
              <section className="learning-guide">
                <h2>Your lab, at your pace</h2>
                <p>
                  Choose a subject, read its short lab summary, and follow one
                  step at a time. Each lab explains where to work, why the
                  action matters, and what to check before moving on.
                </p>
                <a href="/migration#lesson=lab-00">
                  New here? Set up your practice lab <ArrowRight size={15} />
                </a>
              </section>
            </>
          ) : (
            <section className="course-library">
              <header>
                <div>
                  <span className="eyebrow">YOUR NEXT SKILL STARTS HERE</span>
                  <h1>
                    {query
                      ? 'Search results'
                      : view === 'bookmarks'
                        ? 'My Bookmarks'
                        : view === 'paths'
                          ? 'Learning Paths'
                          : 'All Courses'}
                  </h1>
                  <p>
                    {query
                      ? `Labs matching “${query}”`
                      : 'Choose your subject. Follow the installation, configuration, and daily operations in order.'}
                  </p>
                </div>
                <a href="/">Back to dashboard</a>
              </header>
              {(view === 'paths' || view === 'courses') && !query ? (
                <div className="path-grid">
                  {learningPathways.map(pathCard)}
                </div>
              ) : (
                <div className="lab-library-list">
                  {filtered.map((l) => (
                    <article key={l.id}>
                      <a href={l.href}>
                        <h2>{l.title}</h2>
                        <p>{l.description}</p>
                        <span>
                          {complete.has(l.id) ? 'Completed' : 'Open guided lab'}{' '}
                          <ChevronRight size={14} />
                        </span>
                      </a>
                      <button
                        type="button"
                        aria-label={`${academy.bookmarks.includes(l.id) ? 'Remove bookmark for' : 'Bookmark'} ${l.title}`}
                        aria-pressed={academy.bookmarks.includes(l.id)}
                        onClick={() => academy.toggleBookmark(l.id)}
                      >
                        <Bookmark
                          size={18}
                          fill={
                            academy.bookmarks.includes(l.id)
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      </button>
                    </article>
                  ))}
                  {!filtered.length && (
                    <p>
                      {view === 'bookmarks'
                        ? 'Save a lab using its bookmark button in All Courses.'
                        : 'No matching labs. Try a different title or topic.'}
                    </p>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
        <aside className="dashboard-right" aria-label="Your learning activity">
          <section className="resume-card">
            <h2>Resume Learning</h2>
            <div className="resume-progress">
              <span>
                {resumeCount} of {pathwayLessons(resumePath).length} labs
                complete
              </span>
              <strong>
                {Math.round(
                  (resumeCount / pathwayLessons(resumePath).length) * 100,
                )}
                %
              </strong>
            </div>
            <progress
              value={resumeCount}
              max={pathwayLessons(resumePath).length}
              aria-label="Resume course progress"
            />
            <div className="resume-lesson">
              <span className="path-icon">
                <PathIcon id={resumePath.id} />
              </span>
              <div>
                <h3>{resume.title}</h3>
                <p>{resumePath.title}</p>
              </div>
            </div>
            <a className="primary-button" href={resume.href}>
              {recent.length || complete.size
                ? 'Continue'
                : 'Begin your first lab'}
              <ArrowRight size={16} />
            </a>
          </section>
          <section className="recent-card">
            <header>
              <h2>Recent Activity</h2>
              <a href="/profile">My profile</a>
            </header>
            {recent.length ? (
              recent.slice(0, 5).map((a) => (
                <a
                  className="activity-row"
                  href={a.lesson!.href}
                  key={a.lesson_id}
                >
                  <span className="activity-icon">
                    <BookOpen size={17} />
                  </span>
                  <div>
                    <h3>{a.lesson!.title}</h3>
                    <p>
                      {complete.has(a.lesson_id) ? 'Completed' : 'Opened'} ·{' '}
                      {new Date(a.visited_at).toLocaleDateString()}
                    </p>
                  </div>
                </a>
              ))
            ) : (
              <p className="empty-activity">
                Your learning journey starts here. Open a lab and your recent
                activity will appear in this space.
              </p>
            )}
          </section>
          <section className="quick-card">
            <h2>Quick Links</h2>
            <div>
              <a href="/migration#lesson=lab-00">
                <FlaskConical size={20} />
                Practice Labs
              </a>
              <a href="/?view=courses">
                <FolderOpen size={20} />
                Course Library
              </a>
              <a href="/migration#lesson=lab-19">
                <LifeBuoy size={20} />
                Troubleshooting
              </a>
              <a href="/?view=bookmarks">
                <Bookmark size={20} />
                My Bookmarks
              </a>
            </div>
          </section>
          <section className="account-card">
            <h3>
              {academy.user
                ? `Your space, ${academy.user.name}`
                : 'Make your progress yours'}
            </h3>
            <p>
              {academy.user
                ? academy.syncMessage
                : 'Sign in to save your progress across devices. You can also learn as a guest.'}
            </p>
            <a href="/profile">
              {academy.user ? 'Manage profile' : 'Set up my profile'}{' '}
              <ArrowRight size={14} />
            </a>
          </section>
        </aside>
      </main>
    </ConsoleReaderShell>
  );
}
