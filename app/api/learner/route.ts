import { academyDb } from '@/lib/academy-db';
import { isProgressKey } from '@/lib/academy-tracking';
import { learningPathways, pathwayLessons } from '@/app/learning-pathways';
export const dynamic = 'force-dynamic';
const validLessons = new Set(
  learningPathways.flatMap(pathwayLessons).map((l) => l.id),
);
const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' },
  });
function identity(request: Request) {
  const id = request.headers.get('oai-authenticated-user-id');
  if (!id || id.length > 200) return null;
  const email = request.headers.get('oai-authenticated-user-email') ?? '';
  let name = request.headers.get('oai-authenticated-user-full-name') ?? '';
  if (
    request.headers.get('oai-authenticated-user-full-name-encoding') ===
    'percent-encoded-utf-8'
  ) {
    try {
      name = decodeURIComponent(name);
    } catch {
      name = '';
    }
  }
  return { id, name: name || email.split('@')[0] || 'Learner' };
}
export async function GET(request: Request) {
  const db = academyDb();
  if (!db)
    return json({
      accountAvailable: false,
      user: null,
      records: {},
      activity: [],
    });
  const user = identity(request);
  if (!user)
    return json({
      accountAvailable: true,
      user: null,
      records: {},
      activity: [],
    });
  const [profile, records, activity] = await Promise.all([
    db
      .prepare('SELECT display_name FROM learner_profiles WHERE user_id = ?')
      .bind(user.id)
      .first<{ display_name: string }>(),
    db
      .prepare(
        'SELECT progress_key, payload FROM learner_progress WHERE user_id = ?',
      )
      .bind(user.id)
      .all<{ progress_key: string; payload: string }>(),
    db
      .prepare(
        'SELECT lesson_id, visited_at FROM learner_activity WHERE user_id = ? ORDER BY visited_at DESC LIMIT 12',
      )
      .bind(user.id)
      .all<{ lesson_id: string; visited_at: number }>(),
  ]);
  return json({
    accountAvailable: true,
    user: { id: user.id, name: profile?.display_name ?? user.name },
    records: Object.fromEntries(
      records.results.map((r) => [r.progress_key, r.payload]),
    ),
    activity: activity.results,
  });
}
export async function POST(request: Request) {
  const db = academyDb();
  if (!db)
    return json(
      { error: 'Account storage is not connected on this host.' },
      503,
    );
  const user = identity(request);
  if (!user) return json({ error: 'Sign in to save course progress.' }, 401);
  if (request.headers.get('origin') !== new URL(request.url).origin)
    return json({ error: 'This change must come from this academy.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json'))
    return json({ error: 'Use a JSON request.' }, 415);
  if (Number(request.headers.get('content-length') ?? 0) > 180000)
    return json({ error: 'Progress update is too large.' }, 413);
  const raw = await request.text();
  if (raw.length > 180000)
    return json({ error: 'Progress update is too large.' }, 413);
  let body: {
    accountId?: string;
    records?: Record<string, string>;
    name?: string;
    lessonId?: string;
  };
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: 'Invalid progress update.' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return json({ error: 'Invalid progress update.' }, 400);
  if (body.accountId !== user.id)
    return json({ error: 'Your account changed. Reload before saving.' }, 409);
  const tasks: D1PreparedStatement[] = [];
  const now = Date.now();
  if (body.name !== undefined) {
    if (
      typeof body.name !== 'string' ||
      body.name.trim().length < 1 ||
      body.name.length > 80
    )
      return json(
        { error: 'Use a display name between 1 and 80 characters.' },
        400,
      );
    tasks.push(
      db
        .prepare(
          'INSERT INTO learner_profiles(user_id,display_name,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET display_name=excluded.display_name,updated_at=excluded.updated_at',
        )
        .bind(user.id, body.name.trim(), now),
    );
  }
  if (body.records !== undefined) {
    if (
      !body.records ||
      typeof body.records !== 'object' ||
      Array.isArray(body.records) ||
      Object.keys(body.records).length > 35
    )
      return json({ error: 'Invalid progress records.' }, 400);
    for (const [key, value] of Object.entries(body.records)) {
      if (
        !isProgressKey(key) ||
        typeof value !== 'string' ||
        value.length > 60000
      )
        return json({ error: 'Invalid progress record.' }, 400);
      try {
        JSON.parse(value);
      } catch {
        return json({ error: 'Progress must contain valid JSON.' }, 400);
      }
      tasks.push(
        db
          .prepare(
            'INSERT INTO learner_progress(user_id,progress_key,payload,updated_at) VALUES(?,?,?,?) ON CONFLICT(user_id,progress_key) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at',
          )
          .bind(user.id, key, value, now),
      );
    }
  }
  if (body.lessonId !== undefined) {
    if (typeof body.lessonId !== 'string' || !validLessons.has(body.lessonId))
      return json({ error: 'Unknown lesson.' }, 400);
    tasks.push(
      db
        .prepare(
          'INSERT INTO learner_activity(user_id,lesson_id,visited_at) VALUES(?,?,?) ON CONFLICT(user_id,lesson_id) DO UPDATE SET visited_at=excluded.visited_at',
        )
        .bind(user.id, body.lessonId, now),
    );
  }
  if (!tasks.length) return json({ error: 'No changes supplied.' }, 400);
  await db.batch(tasks);
  return json({ saved: true, updatedAt: now });
}
