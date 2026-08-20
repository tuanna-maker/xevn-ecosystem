const urls = [
  'http://127.0.0.1:8080/hr/src/pages/EmployeeProfile.tsx',
  'http://127.0.0.1:5173/hr/src/pages/EmployeeProfile.tsx',
];
for (const u of urls) {
  try {
    const r = await fetch(u);
    const t = await r.text();
    console.log('URL', u, 'status', r.status, 'len', t.length);
    const resolve = [...t.matchAll(/Failed to resolve import "([^"]+)" from "([^"]+)"/g)].map(
      (x) => x[0],
    );
    console.log('resolve', resolve.slice(0, 10));
    const err = [...t.matchAll(/Internal server error[\s\S]{0,400}/gi)].map((x) => x[0]);
    console.log('errSnippet', err.slice(0, 2));
    if (!resolve.length) console.log(t.slice(0, 800));
  } catch (e) {
    console.log(u, String(e));
  }
}
