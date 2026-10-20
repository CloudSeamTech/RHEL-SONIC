'use client';

import { lazy, Suspense, useEffect, useState } from 'react';
import { LearningConsole } from './learning-console';
const LegacyCourse = lazy(() => import('./legacy-course'));

export default function Home() {
  const [legacy, setLegacy] = useState(false);
  useEffect(() => {
    const sync = () => {
      const params = new URLSearchParams(location.hash.slice(1));
      setLegacy(params.has('lesson') || params.get('view') === 'path');
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  return legacy ? (
    <Suspense fallback={<p role="status">Opening lesson…</p>}>
      <LegacyCourse />
    </Suspense>
  ) : (
    <LearningConsole />
  );
}
