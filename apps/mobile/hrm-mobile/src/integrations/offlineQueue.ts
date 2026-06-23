import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HrmRequestResult } from './hrmApiClient';

const QUEUE_KEY = 'hrm_mobile_offline_write_queue_v1';

export type OfflineWriteJob = {
  id: string;
  path: string;
  method: string;
  body: string;
  createdAt: string;
};

async function readQueue(): Promise<OfflineWriteJob[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as OfflineWriteJob[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(jobs: OfflineWriteJob[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(jobs));
}

export async function enqueueOfflineWrite(
  path: string,
  method: string,
  body: Record<string, unknown>,
): Promise<void> {
  const jobs = await readQueue();
  jobs.push({
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    path,
    method,
    body: JSON.stringify(body),
    createdAt: new Date().toISOString(),
  });
  await writeQueue(jobs);
}

export async function flushOfflineQueue(
  request: (path: string, init?: RequestInit) => Promise<HrmRequestResult<unknown>>,
): Promise<{ synced: number; failed: number }> {
  const jobs = await readQueue();
  if (!jobs.length) return { synced: 0, failed: 0 };
  const remaining: OfflineWriteJob[] = [];
  let synced = 0;
  let failed = 0;
  for (const job of jobs) {
    const res = await request(job.path, {
      method: job.method,
      body: job.body,
    });
    if (res.ok) synced += 1;
    else {
      failed += 1;
      remaining.push(job);
    }
  }
  await writeQueue(remaining);
  return { synced, failed };
}

export async function offlineQueueSize(): Promise<number> {
  return (await readQueue()).length;
}
