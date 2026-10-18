import { timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';

export const LOOPBACK_HOST = '127.0.0.1';
export const DEFAULT_PORT = 43127;
export const MAX_SESSIONS = 3;
export const MAX_INPUT_BYTES = 16 * 1024;
export const IDLE_TIMEOUT_MS = 20 * 60 * 1000;

export function isLoopbackAddress(address = '') {
  const normalized = address.replace(/^::ffff:/, '');
  return normalized === '127.0.0.1' || normalized === '::1';
}

export function isAllowedOrigin(origin = '') {
  try {
    const url = new URL(origin);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]')
    );
  } catch {
    return false;
  }
}

export function matchesToken(received, expected) {
  const a = Buffer.from(String(received ?? ''));
  const b = Buffer.from(String(expected ?? ''));
  return a.length === b.length && a.length >= 32 && timingSafeEqual(a, b);
}

export function validPort(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1024 && parsed <= 65535 ? parsed : DEFAULT_PORT;
}

export function assertLoopbackBinding(host) {
  if (host !== LOOPBACK_HOST && host !== '::1' && !(isIP(host) && isLoopbackAddress(host))) {
    throw new Error('SONIC companion may bind only to a loopback address.');
  }
}
