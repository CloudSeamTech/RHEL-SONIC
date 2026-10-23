import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
export const learnerProfiles = sqliteTable('learner_profiles', {
  userId: text('user_id').primaryKey(),
  displayName: text('display_name').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
export const learnerProgress = sqliteTable(
  'learner_progress',
  {
    userId: text('user_id').notNull(),
    key: text('progress_key').notNull(),
    payload: text('payload').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.key] })],
);
export const learnerActivity = sqliteTable(
  'learner_activity',
  {
    userId: text('user_id').notNull(),
    lessonId: text('lesson_id').notNull(),
    visitedAt: integer('visited_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);
