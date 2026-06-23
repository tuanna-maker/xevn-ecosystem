import { existsSync } from 'node:fs';

const HRM_DOCKER_HOSTS = ['hrm-be', 'xevn-hrm-be-dev'] as const;

/** UF-XBOS-09/15 — xbos-be must reach hrm-be on docker network (port 3001), not localhost. */
export function resolveHrmApiBaseUrl(): string {
  const explicit = process.env.HRM_API_URL?.trim();
  if (explicit) {
    const normalized = explicit.replace(/\/+$/, '');
    if (!normalized.includes('localhost') && !normalized.includes('127.0.0.1')) {
      return normalized;
    }
  }
  const composeDefault = process.env.XEVN_HRM_API_URL?.trim();
  if (composeDefault) {
    return composeDefault.replace(/\/+$/, '');
  }
  const hostPort = process.env.HRM_BE_PORT?.trim() || '28001';
  const containerPort = process.env.HRM_BE_CONTAINER_PORT?.trim() || '3001';
  let inDocker = false;
  try {
    inDocker = existsSync('/.dockerenv');
  } catch {
    inDocker = false;
  }
  if (inDocker || process.env.DOCKER === '1' || process.env.KUBERNETES_SERVICE_HOST) {
    return `http://${HRM_DOCKER_HOSTS[0]}:${containerPort}`;
  }
  return `http://127.0.0.1:${hostPort}`;
}
