'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, BookOpen, CheckCircle2, Cloud, Database, GraduationCap,
  Layers3, Monitor, Search, Server, Shield, Terminal, Workflow,
} from 'lucide-react';
import { ConsoleReaderShell } from './console-reader-shell';
import { learningPathways, pathwayLessons, type LearningPathway } from './learning-pathways';
import './learning-console.css';

type Category = 'All' | 'Infrastructure' | 'Cloud' | 'Security' | 'Linux' | 'Data';
const categories: Category[] = ['All', 'Infrastructure', 'Cloud', 'Security', 'Linux', 'Data'];
const groups: Record<string, Category> = {
  windows: 'Infrastructure', 'active-directory': 'Infrastructure', wsus: 'Infrastructure',
  mecm: 'Infrastructure', helpdesk: 'Infrastructure',
  sql: 'Data',
  azure: 'Cloud', 'landing-zone': 'Cloud', 'azure-operations': 'Cloud', migrations: 'Cloud',
  linux: 'Linux', alma: 'Linux',
  security: 'Security',
};
function groupFor(id: string): Category {
  return groups[id] ?? (id.includes('nessus') ? 'Security' : 'Infrastructure');
}
function TrackIcon({ id, size = 22 }: { id: string; size?: number }) {
  const props = { size, strokeWidth: 1.9, 'aria-hidden': true as const };
  if (id === 'linux' || id === 'alma') return <Terminal {...props} />;
  if (id === 'sql') return <Database {...props} />;
  if (id === 'azure' || id === 'landing-zone' || id === 'azure-operations' || id === 'migrations') return <Cloud {...props} />;
  if (id === 'security' || id.startsWith('nessus')) return <Shield {...props} />;
  if (id === 'mecm' || id === 'wsus') return <Workflow {...props} />;
  if (id === 'active-directory') return <Layers3 {...props} />;
  if (id === 'helpdesk') return <Monitor {...props} />;
  return <Server {...props} />;
}
function safeRead(key: string): unknown {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function savedCompleted(): string[] {
  if (typeof window === 'undefined') return [];
  const linux = safeRead('wazuh-foundations-v2');
  const migration = safeRead('sonic-agency-azure-migration-v1');
  const alma = safeRead('sonic-alma-desktop-v1');
  const guided = safeRead('sonic-academy-nessus-v1');
  const ids = [
    ...(linux && typeof linux === 'object' && 'completed' in linux && Array.isArray(linux.completed) ? linux.completed : []),
    ...(migration && typeof migration === 'object' && 'completed' in migration && Array.isArray(migration.completed) ? migration.completed : []),
    ...(Array.isArray(alma) ? alma : []),
    ...(guided && typeof guided === 'object' && 'verified' in guided && Array.isArray(guided.verified) ? guided.verified : []),
  ];
  return [...new Set(ids.filter((item): item is string => typeof item === 'string'))];
}
function pathInfo(path: LearningPathway, done: Set<string>) {
  const list = pathwayLessons(path);
  const verified = list.filter(item => done.has(item.id)).length;
  const next = list.find(item => !done.has(item.id)) ?? list[0];
  return { path, list, verified, next, percent: list.length ? Math.round(100 * verified / list.length) : 0 };
}
const highlighted = ['windows', 'active-directory', 'linux', 'azure', 'sql', 'security'];

export function LearningConsole(_props: { initialPathId?: string } = {}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [finished, setFinished] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    const refresh = () => { setFinished(savedCompleted()); setLoaded(true); };
    refresh();
    const names = ['storage', 'focus', 'wazuh-progress', 'sonic-alma-progress', 'sonic-nessus-progress'];
    names.forEach(name => window.addEventListener(name, refresh));
    return () => names.forEach(name => window.removeEventListener(name, refresh));
  }, []);
  const done = useMemo(() => new Set(finished), [finished]);
  const tracks = useMemo(() => learningPathways.map(path => pathInfo(path, done)), [done]);
  const totalLessons = useMemo(() => new Set(learningPathways.flatMap(path => pathwayLessons(path).map(item => item.id))).size, []);
  const completedCount = [...done].filter(id => learningPathways.some(path => pathwayLessons(path).some(lesson => lesson.id === id))).length;
  const active = tracks.filter(track => track.verified > 0 && track.verified < track.list.length);
  const first = active[0]?.next ?? tracks.find(track => track.path.id === 'windows')?.next;
  const candidates = tracks
    .filter(track => category === 'All' || groupFor(track.path.id) === category)
    .filter(track => {
      const text = [track.path.title, track.path.prerequisite, ...track.list.map(lesson => lesson.title)].join(' ').toLowerCase();
      return text.includes(query.trim().toLowerCase());
    });
  const listed = query || category !== 'All' || showAll
    ? candidates
    : [...candidates].sort((a, b) => Number(highlighted.includes(b.path.id)) - Number(highlighted.includes(a.path.id))).slice(0, 8);

  return <ConsoleReaderShell>
    <main className="academy-home academy-refresh-home" id="academy-main">
      <header className="academy-home-heading">
        <div>
          <div className="academy-kicker"><span className="academy-status-dot" /> YOUR LEARNING WORKSPACE</div>
          <h1>Build skills that work <em>in the real world.</em></h1>
          <p>Structured enterprise IT training. Clear lessons, hands-on practice, verifiable results, and production context—without the noise.</p>
        </div>
        <a href="/migration#lesson=lab-00" className="academy-heading-action">New here? Start with lab setup <ArrowRight size={16} /></a>
      </header>

      <div className="academy-hero-grid">
        <section className="academy-feature">
          <div className="academy-hero-overline">SONIC ACADEMY / YOUR NEXT MOVE</div>
          <div className="academy-hero-icon"><GraduationCap size={24} /></div>
          <h2>{active.length > 0 ? 'Pick up where you left off.' : 'Start with a strong foundation.'}</h2>
          <p>{active.length > 0 ? 'Your verified lesson progress is saved on this device. Continue from the next step in your learning path.' : 'Work through a real environment in a safe practice lab. Learn what to do, why it matters, and how engineers verify results.'}</p>
          {first && <a className="academy-primary-link" href={first.href}>{active.length > 0 ? 'Continue learning' : 'Start first lab'} <ArrowRight size={17} /></a>}
          <div className="academy-feature-detail"><span>UP NEXT</span><strong>{first?.title ?? 'Explore the catalog'}</strong></div>
        </section>
        <aside className="academy-playbook" aria-label="How SONIC lessons work">
          <div className="academy-playbook-heading"><Terminal size={17} /> TRAINING OPERATIONS / METHOD</div>
          <h2>Learn. Build. Verify.</h2>
          <p>A familiar operations-console structure—now organized around training, not alerts.</p>
          <ol>
            <li><span>01</span><div><strong>Understand</strong><small>Know the goal and what the operation changes.</small></div></li>
            <li><span>02</span><div><strong>Practice</strong><small>Follow one action at a time in your own lab.</small></div></li>
            <li><span>03</span><div><strong>Validate</strong><small>Compare evidence with the expected result.</small></div></li>
            <li><span>04</span><div><strong>Apply professionally</strong><small>Review production safeguards and rollback.</small></div></li>
          </ol>
        </aside>
      </div>

      <section className="academy-stats" aria-label="Actual catalog and local progress">
        <div><BookOpen size={19} /><span>Learning pathways</span><strong>{learningPathways.length}</strong><small>Available in the catalog</small></div>
        <div><Layers3 size={19} /><span>Unique lessons</span><strong>{totalLessons}</strong><small>Across all pathways</small></div>
        <div><CheckCircle2 size={19} /><span>Verified lessons</span><strong>{loaded ? completedCount : '—'}</strong><small>Saved in this browser</small></div>
        <div><GraduationCap size={19} /><span>Paths in progress</span><strong>{loaded ? active.length : '—'}</strong><small>Based on saved verification</small></div>
      </section>

      {active.length > 0 && <section className="academy-continue-section">
        <div className="academy-section-head"><div><span className="academy-kicker">MY LEARNING</span><h2>Continue your pathways</h2></div></div>
        <div className="academy-continue-grid">
          {active.slice(0, 3).map(track => <a key={track.path.id} href={track.next?.href ?? '#catalog'} className="academy-continue-card">
            <span className="academy-track-icon"><TrackIcon id={track.path.id} /></span>
            <div><strong>{track.path.title}</strong><small>{track.verified} of {track.list.length} lessons verified</small><div className="academy-progress-track"><i style={{width: track.percent + '%'}} /></div><span>Next: {track.next?.title}</span></div>
            <ArrowRight size={16} />
          </a>)}
        </div>
      </section>}

      <section className="academy-catalog" id="catalog">
        <div className="academy-section-head"><div><span className="academy-kicker">EXPLORE THE LIBRARY</span><h2>Choose a learning pathway</h2><p>Pick your technology. Every pathway opens real lessons already in SONIC Academy.</p></div></div>
        <div className="academy-catalog-tools">
          <label className="academy-search"><Search size={18} /><span className="sr-only">Search lessons or pathways</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search paths, skills, or lab titles…" /></label>
          <div className="academy-filters" role="group" aria-label="Filter by subject">
            {categories.map(item => <button key={item} type="button" className={category === item ? 'selected' : ''} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
        </div>
        <div className="academy-path-grid">
          {listed.map(track => {
            const firstLesson = track.next ?? track.list[0];
            return <article className="academy-path-card" key={track.path.id}>
              <div className="academy-path-card-top"><span className="academy-track-icon"><TrackIcon id={track.path.id} /></span><span className="academy-category">{groupFor(track.path.id)}</span></div>
              <h3>{track.path.title}</h3>
              <p>{track.path.prerequisite}</p>
              <div className="academy-card-foot">
                <span>{track.list.length} lessons</span>
                {track.verified > 0 ? <span>{track.verified} verified · {track.percent}%</span> : <span>Self-paced</span>}
              </div>
              {track.verified > 0 && <div className="academy-progress-track"><i style={{width: track.percent + '%'}} /></div>}
              {firstLesson && <a href={firstLesson.href} className="academy-path-link">{track.verified > 0 ? 'Continue pathway' : 'Explore pathway'} <ArrowRight size={15} /></a>}
            </article>;
          })}
        </div>
        {listed.length === 0 && <p className="academy-empty">No pathways match your search. Try another keyword or choose All.</p>}
        {!query && category === 'All' && !showAll && candidates.length > listed.length && <button type="button" className="academy-show-all" onClick={() => setShowAll(true)}>Show all {candidates.length} learning pathways <ArrowRight size={16}/></button>}
      </section>
      <section className="academy-learning-note">
        <div><span className="academy-track-icon"><Shield size={21} /></span></div>
        <div><h2>Lab results are yours to verify.</h2><p>SONIC Academy guides your work but does not run commands against your systems. Production examples include approval, security controls, backups, and rollback. Your saved progress stays on this browser.</p></div>
        <a href="/migration#lesson=lab-19">Troubleshooting lab <ArrowRight size={16} /></a>
      </section>
    </main>
  </ConsoleReaderShell>;
}
