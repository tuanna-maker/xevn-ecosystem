import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

const base = __ENV.HRM_API_BASE || 'http://127.0.0.1:28001/api/hrm';

export default function () {
  const res = http.get(`${base}/`, { headers: { 'x-request-id': `k6-${__VU}-${__ITER}` } });
  check(res, { 'health 200': (r) => r.status === 200 });
  sleep(0.5);
}
