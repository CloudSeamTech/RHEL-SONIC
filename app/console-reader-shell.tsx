'use client';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Home,
  Layers,
  BookOpen,
  FlaskConical,
  Cloud,
  Terminal,
  ShieldCheck,
  Database,
  Monitor,
  LifeBuoy,
  Bookmark,
  Search,
  Menu,
  UserRound,
  ChevronRight,
} from 'lucide-react';
import { learningPathways, pathwayLessons } from './learning-pathways';
import { useAcademy } from './academy-provider';
import './learning-console.css';
import './lesson-reading.css';
const allLessons = learningPathways.flatMap(pathwayLessons);
export function ConsoleReaderShell({
  lessonId,
  children,
  tools,
  activeView,
}: {
  lessonId?: string;
  children: ReactNode;
  tools?: ReactNode;
  activeView?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  const academy = useAcademy();
  const course = learningPathways.find((path) =>
    pathwayLessons(path).some((l) => l.id === lessonId),
  );
  const completed = allLessons.filter((l) =>
    academy.completed.includes(l.id),
  ).length;
  const percent = Math.round((completed / allLessons.length) * 100);
  const courseCount = course
    ? pathwayLessons(course).filter((l) => academy.completed.includes(l.id))
        .length
    : 0;
  return (
    <div className="learning-console console-reader academy-shell">
      <a className="console-skip" href="#reader-content">
        Skip to learning
      </a>
      <aside
        className={'console-sidebar' + (menuOpen ? ' is-open' : '')}
        aria-label="Learning navigation"
      >
        <button
          type="button"
          className="sidebar-close"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        >
          ×
        </button>
        <div className="console-brand">
          <a href="/" className="academy-brand">
            <span className="brand-cloud">
              <Cloud size={30} />
              <span>↗</span>
            </span>
            <span>
              Cloud<span className="brand-purple">Seam</span>Tech
              <small>SONIC-ACADEMY</small>
            </span>
          </a>
        </div>
        <nav className="academy-primary-nav" aria-label="Academy navigation">
          <a href="/" className={activeView === 'dashboard' ? 'active' : ''}>
            <Home size={18} />
            Dashboard
          </a>
          <a
            href="/?view=paths"
            className={activeView === 'paths' ? 'active' : ''}
          >
            <Layers size={18} />
            Learning Paths
          </a>
          <a
            href="/?view=courses"
            className={activeView === 'courses' ? 'active' : ''}
          >
            <BookOpen size={18} />
            All Courses
          </a>
          <a href="/migration#lesson=lab-00">
            <FlaskConical size={18} />
            Start Your Lab
          </a>
        </nav>
        <div className="console-nav-label">YOUR CLASSROOMS</div>
        <nav
          aria-label="Course pathways"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a')) setMenuOpen(false);
          }}
        >
          {learningPathways.map((pathway) => {
            const Icon = pathway.id.includes('sql')
              ? Database
              : pathway.id.includes('security') || pathway.id.includes('nessus')
                ? ShieldCheck
                : pathway.id.includes('azure') ||
                    pathway.id.includes('landing') ||
                    pathway.id === 'migrations'
                  ? Cloud
                  : pathway.id.includes('linux') || pathway.id === 'alma'
                    ? Terminal
                    : Monitor;
            return (
              <details
                className="reader-course"
                key={pathway.id}
                open={pathway.id === course?.id}
              >
                <summary>
                  <Icon size={17} />
                  <span>{pathway.title}</span>
                  <ChevronRight size={13} />
                </summary>
                <div className="console-subnav">
                  {pathway.sections.map((section) => (
                    <details
                      key={section.title}
                      open={section.lessons.some((l) => l.id === lessonId)}
                    >
                      <summary>{section.title}</summary>
                      {section.lessons.map((lesson) => (
                        <a
                          className={
                            'reader-lesson-link' +
                            (lesson.id === lessonId ? ' active' : '')
                          }
                          href={lesson.href}
                          key={lesson.id}
                          aria-current={
                            lesson.id === lessonId ? 'page' : undefined
                          }
                        >
                          {lesson.title}
                        </a>
                      ))}
                    </details>
                  ))}
                </div>
              </details>
            );
          })}
        </nav>
        <div className="academy-secondary-nav">
          <a href="/?view=bookmarks">
            <Bookmark size={17} />
            My Bookmarks
          </a>
          <a href="/migration#lesson=lab-19">
            <LifeBuoy size={17} />
            Troubleshooting
          </a>
        </div>
        <div className="console-sidebar-foot">
          <span>MY PROGRESS</span>
          <div className="sidebar-progress">
            <strong>{percent}%</strong>
            <span>Overall completion</span>
          </div>
          <progress
            value={completed}
            max={allLessons.length}
            aria-label="Overall course completion"
          />
          <small>
            {academy.user
              ? 'Saved to your account'
              : 'Guest · saved in this browser'}
          </small>
        </div>
      </aside>
      <div className="reader-workspace" id="reader-content">
        <header className="console-commandbar">
          <button
            className="console-menu"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={20} />
          </button>
          <form className="academy-search" action="/" role="search">
            <Search size={18} />
            <input
              name="q"
              type="search"
              placeholder="Search courses, labs, or topics…"
              aria-label="Search courses and labs"
            />
          </form>
          <div className="reader-tools">{tools}</div>
          <a
            className="profile-link"
            href="/profile"
            aria-label="My learning profile"
          >
            <span className="profile-avatar">
              {academy.user ? (
                academy.user.name.slice(0, 2).toUpperCase()
              ) : (
                <UserRound size={17} />
              )}
            </span>
            <span>
              <small>
                {academy.user ? 'Welcome back,' : 'YOUR LEARNING PROFILE'}
              </small>
              <strong>{academy.user ? academy.user.name : 'Sign in'}</strong>
            </span>
            <ChevronRight size={14} />
          </a>
        </header>
        {lessonId && course && (
          <div className="course-progress-strip">
            <a
              href="/?view=paths"
              className={activeView === 'paths' ? 'active' : ''}
            >
              {course.title}
            </a>
            <span>
              {courseCount} of {pathwayLessons(course).length} labs complete
            </span>
            <progress
              value={courseCount}
              max={pathwayLessons(course).length}
              aria-label={`${course.title} course progress`}
            />
            <button
              type="button"
              aria-label={
                academy.bookmarks.includes(lessonId)
                  ? 'Remove lab bookmark'
                  : 'Bookmark this lab'
              }
              aria-pressed={academy.bookmarks.includes(lessonId)}
              onClick={() => academy.toggleBookmark(lessonId)}
            >
              <Bookmark size={15} />
              {academy.bookmarks.includes(lessonId) ? 'Saved' : 'Bookmark'}
            </button>
            <a href="/profile">
              {academy.user ? 'Account progress' : 'Save your progress →'}
            </a>
          </div>
        )}
        {/failed|unavailable/i.test(academy.syncMessage) && (
          <p className="account-sync-notice" role="status">
            {academy.syncMessage}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
