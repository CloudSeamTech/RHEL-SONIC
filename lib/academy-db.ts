import { env } from 'cloudflare:workers';
export function academyDb(): D1Database | undefined {
  return (env as unknown as { DB?: D1Database }).DB;
}
