'use client';

import { useState, type ReactNode } from 'react';
import { learningPathways } from './learning-pathways';
import './learning-console.css';
import './engineering-system.css';
import './lesson-reading.css';

export function ConsoleReaderShell({
  lessonId,
  children,
  tools,
}: {
  lessonId?: string;
  children: ReactNode;
  tools?: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="learning-console console-reader">
      <a className="console-skip" href="#reader-content">
        Skip to lesson
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
          <b>learner@sonic:~$</b> lesson
          <br />
          --guided-mode<br />
          <span>Lab domain: cloudseam.tech</span>
        </div>
        <div className="console-nav-label">SYSTEM</div>
        <a className="console-nav" href="/">
          ▦ <span>Dashboard</span>
        </a>
        <a className="console-nav" href="/migration#lesson=lab-00">
          ▤ <span>Start Here</span>
        </a>
        <div className="console-divider" />
        <div className="console-nav-label">COURSE LIBRARY / IN ORDER</div>
        <nav
          aria-label="Course pathways"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest('a')) setMenuOpen(false);
          }}
        >
          {learningPathways.map((pathway, index) => (
            <details
              className="reader-course"
              key={pathway.id}
              open={pathway.sections.some((section) =>
                section.lessons.some((lesson) => lesson.id === lessonId),
              )}
            >
              <summary>
                {pathway.title}
                <small>
                  {pathway.id === 'linux'
                    ? '↗'
                    : String(index + 1).padStart(2, '0')}
                </small>
              </summary>
              <div className="console-subnav">
                {pathway.sections.map((section) => (
                  <details
                    key={section.title}
                    open={section.lessons.some(
                      (lesson) => lesson.id === lessonId,
                    )}
                  >
                    <summary>
                      {section.title}
                      {section.optional ? ' · OPTIONAL' : ''}
                    </summary>
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
          ))}
        </nav>
        <div className="console-divider" />
        <div className="console-nav-label">TOOLS</div>
        <a className="console-nav" href="/migration#view=terminal">
          ⌘ <span>Lab Terminal</span>
        </a>
        <a className="console-nav" href="/migration#lesson=lab-19">
          ⌁ <span>Troubleshooting</span>
        </a>
        <a className="console-nav" href="/">
          ▤ <span>Learning Dashboard</span>
        </a>
        <div className="console-sidebar-foot">
          <b>● SELF-GUIDED LEARNING</b>
          <div>
            <span>PROGRESS</span>
            <span>THIS BROWSER</span>
          </div>
          <div>
            <span>COMMANDS</span>
            <span>YOUR OWN LAB</span>
          </div>
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
            ☰
          </button>
          <a href="/">
            Learning workspace
          </a>
          <div className="reader-tools">{tools}</div>
        </header>
        {children}
      </div>
    </div>
  );
}
