const paths = [
  'EmployeeFormDialog.tsx',
  'EmployeeWorkTimeline.tsx',
  'EmployeeContracts.tsx',
  'EmployeeSalary.tsx',
  'EmployeeProfile.tsx',
];
const bases = ['http://127.0.0.1:8080/hr', 'http://127.0.0.1:5173/hr'];

for (const base of bases) {
  console.log('===', base);
  for (const p of paths) {
    const prefix = p === 'EmployeeProfile.tsx' ? 'src/pages/' : 'src/components/employee/';
    const u = `${base}/${prefix}${p}`;
    try {
      const r = await fetch(u);
      const t = await r.text();
      const resolve = [...t.matchAll(/Failed to resolve import "([^"]+)" from "([^"]+)"/g)].map(
        (x) => x[0],
      );
      console.log(p, 'status', r.status, 'resolve', resolve.slice(0, 12));
      if (!resolve.length && (r.status !== 200 || /Internal Server Error/i.test(t))) {
        console.log(t.slice(0, 900));
      }
    } catch (e) {
      console.log(p, String(e));
    }
  }
}
