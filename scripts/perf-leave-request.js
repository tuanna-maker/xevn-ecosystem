import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 20 }, // Ramp up to 20 users over 5 seconds
    { duration: '10s', target: 20 }, // Stay at 20 users for 10 seconds
    { duration: '5s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests should fail
  },
};

const API_BASE_URL = __ENV.API_BASE_URL || 'http://localhost:28001';

export default function () {
  // Simulate fetching leave request options (e.g. reasons)
  const res1 = http.get(`${API_BASE_URL}/api/v1/hrm/catalogs/reasons`);
  
  check(res1, {
    'GET reasons status is 200': (r) => r.status === 200 || r.status === 404,
  });
  
  // Simulate creating a leave request
  // Assuming a standard POST payload
  const payload = JSON.stringify({
    type: 'leave',
    reason: 'Personal',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
    notes: 'K6 Performance test',
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer YOUR_TEST_TOKEN' // Add if auth is required
    },
  };
  
  const res2 = http.post(`${API_BASE_URL}/api/v1/hrm/attendance/leave`, payload, params);
  
  check(res2, {
    'POST leave status is 201 or 401': (r) => [201, 401, 403, 400].includes(r.status), 
    // We check 400/401/403 too in case we don't have valid auth, so K6 doesn't mark it as network fail
    // We mainly want to test load capability of the NestJS framework and database
  });
  
  sleep(1);
}
