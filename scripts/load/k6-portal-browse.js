import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '20s',
};

const xbos = __ENV.XBOS_API_BASE || 'http://127.0.0.1:28002/api/xbos';

export default function () {
  const res = http.get(`${xbos}/`, { headers: { 'x-request-id': `k6-portal-${__VU}` } });
  check(res, { 'xbos health': (r) => r.status === 200 });
  sleep(1);
}
