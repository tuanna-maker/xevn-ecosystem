# Prompt cho Antigravity — GOLIVE Menu Sweep (Phần E)

> Updated: 2026-08-19 (sửa lỗi spec: thay F12 Console bằng Playwright page.evaluate)

---

## Nhiệm vụ

Chạy **PHẦN E — Menu Sweep** của GOLIVE lane:
- Navigate 17 URLs của HRM app
- Kiểm tra mỗi URL: render OK / CRASH / API-ERROR / BLANK
- Ghi evidence vào `docs/qa/evidence/qa-menu-sweep-golive-01.md`

**KHÔNG cần BE port 3001 hay 3002 — làm được ngay.**

---

## Bước 1 — Xác nhận HRM FE đang chạy

Chạy lệnh Bash:

```
netstat -ano | findstr ":8080"
```

Nếu thấy `LISTENING` → OK, tiếp tục.
Nếu không → dừng, ghi `BLOCKED: HRM FE port 8080 không chạy`.

---

## Bước 2 — Viết script Playwright

Tạo file tạm `C:/Users/ADMIN/AppData/Local/Temp/hrm_menu_sweep.js`:

```javascript
const { chromium } = require('playwright');

const AUTH_INJECT = `
  const exp = Date.now() + 86400000;
  sessionStorage.setItem('xevn.portal.accessToken', 'mock-qa-golive');
  sessionStorage.setItem('xevn.portal.tokenExpiresAt', String(exp));
  localStorage.setItem('xevn.portal.accessToken', 'mock-qa-golive');
  localStorage.setItem('xevn.portal.tokenExpiresAt', String(exp));
  localStorage.setItem('xevn.portal.user', JSON.stringify({userId:'ceo@xe.vn',displayName:'CEO Test'}));
  sessionStorage.setItem('xevn.portal.user', JSON.stringify({userId:'ceo@xe.vn',displayName:'CEO Test'}));
  localStorage.setItem('hrm_current_company_id','main');
`;

const URLS = [
  { n: 1,  path: '/hr/',                                label: 'Dashboard' },
  { n: 2,  path: '/hr/employees',                       label: 'Nhan su' },
  { n: 3,  path: '/hr/contracts',                       label: 'Hop dong' },
  { n: 4,  path: '/hr/attendance',                      label: 'Cham cong' },
  { n: 5,  path: '/hr/payroll',                         label: 'Luong' },
  { n: 6,  path: '/hr/recruitment',                     label: 'Tuyen dung' },
  { n: 7,  path: '/hr/insurance',                       label: 'Bao hiem' },
  { n: 8,  path: '/hr/decisions',                       label: 'Quyet dinh' },
  { n: 9,  path: '/hr/fleet',                           label: 'Phuong tien' },
  { n: 10, path: '/hr/settings?tab=account',            label: 'Settings-account' },
  { n: 11, path: '/hr/settings?tab=branding',           label: 'Settings-branding' },
  { n: 12, path: '/hr/settings?tab=master-data',        label: 'Settings-master-data' },
  { n: 13, path: '/hr/settings?tab=contract-clauses',   label: 'Settings-contract-clauses' },
  { n: 14, path: '/hr/settings?tab=att-leave-types',    label: 'Settings-att-leave-types' },
  { n: 15, path: '/hr/settings?tab=jd-master-library',  label: 'Settings-jd-master-library' },
  { n: 16, path: '/hr/settings?tab=rec-pipeline-stages',label: 'Settings-rec-pipeline-stages' },
  { n: 17, path: '/hr/settings?tab=settings-defaults',  label: 'Settings-defaults' },
];

const BASE = 'http://localhost:8080';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();

  // Prime auth on root first
  await page.goto(BASE + '/hr/');
  await page.evaluate(AUTH_INJECT);
  await new Promise(r => setTimeout(r, 500));

  const results = [];

  for (const { n, path, label } of URLS) {
    try {
      await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 12000 });
      // Re-inject + reload if redirected away
      const cur = page.url();
      const expectedSeg = path.split('?')[0].replace('/hr/', '').replace('/', '');
      if (expectedSeg && !cur.includes(expectedSeg === '' ? '/hr/' : expectedSeg)) {
        await page.evaluate(AUTH_INJECT);
        await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 12000 });
        await new Promise(r => setTimeout(r, 800));
      }

      const info = await page.evaluate(() => {
        const body = document.body ? document.body.innerText : '';
        return {
          bodyLen: body.length,
          hasSidebar: !!(document.querySelector('nav') || document.querySelector('aside') || document.querySelector('[class*="sidebar"]') || document.querySelector('[class*="Sidebar"]')),
          hasReactError: body.includes('Something went wrong') || body.includes('Cannot read') || body.includes('Uncaught'),
          finalUrl: location.href,
          snippet: body.slice(0, 150).replace(/\n/g, ' ')
        };
      });

      let status = 'OK';
      if (info.hasReactError) status = 'CRASH';
      else if (info.bodyLen < 200) status = 'BLANK';

      results.push({ n, path, label, status, ...info });
      console.log(`#${n} ${status} len=${info.bodyLen} sidebar=${info.hasSidebar} | ${label}`);
    } catch (err) {
      results.push({ n, path, label, status: 'CRASH', error: err.message });
      console.log(`#${n} CRASH | ${label} | ${err.message}`);
    }
  }

  await browser.close();

  console.log('\n--- JSON RESULTS ---');
  console.log(JSON.stringify(results, null, 2));
})();
```

---

## Bước 3 — Chạy script

```bash
cd C:/Users/ADMIN/AppData/Local/Temp
node hrm_menu_sweep.js 2>&1
```

Nếu lỗi `Cannot find module 'playwright'`:
```bash
cd C:/Users/ADMIN/AppData/Local/Temp
npm install playwright
npx playwright install chromium
node hrm_menu_sweep.js 2>&1
```

Lưu toàn bộ output (kể cả JSON cuối) để dùng ở Bước 4.

---

## Bước 4 — Ghi evidence vào repo

**Quan trọng: KHÔNG dùng Write tool trực tiếp — dùng Python để ghi đúng NFD path.**

Viết script `C:/Users/ADMIN/AppData/Local/Temp/write_evidence.py`:

```python
import os, json

def find_root():
    base = r'C:\Users\ADMIN\OneDrive'
    for e in os.scandir(base):
        if not e.is_dir(): continue
        for s in os.scandir(e.path):
            if not s.is_dir() or s.name != 'Vibe Coding': continue
            for s2 in os.scandir(s.path):
                if not s2.is_dir() or s2.name != 'projects': continue
                for s3 in os.scandir(s2.path):
                    if s3.name == 'xevn-ecosystem' and os.path.exists(os.path.join(s3.path, '.git')):
                        return s3.path

root = find_root()
p = os.path.join(root, 'docs', 'qa', 'evidence', 'qa-menu-sweep-golive-01.md')

# Thay RESULTS_JSON bằng mảng JSON thật từ output bước 3
RESULTS_JSON = []  # <- paste results array here

rows = []
for r in RESULTS_JSON:
    icon = 'OK' if r['status'] == 'OK' else ('❌ CRASH' if r['status'] == 'CRASH' else '⚠ BLANK')
    rows.append(f"| {r['n']} | `{r['path']}` | {r['label']} | {icon} | {r.get('bodyLen',0)} | {'Y' if r.get('hasSidebar') else 'N'} |")

rows_str = '\n'.join(rows)

content = f"""# QA Evidence — Menu Sweep Golive
**Date:** 2026-08-19
**Tester:** antigravity (Playwright headless)
**Method:** Playwright page.evaluate() auth inject — no source change

## Kết quả

| # | URL | Label | Status | Body len | Sidebar |
|---|-----|-------|--------|----------|---------|
{rows_str}

## Raw JSON

```json
{json.dumps(RESULTS_JSON, indent=2, ensure_ascii=False)}
```
"""

with open(p, 'w', encoding='utf-8') as f:
    f.write(content)

ok = os.path.exists(p)
sz = os.path.getsize(p)
print(f'Written: {ok}, size={sz}, path={p}')
```

Sau đó chạy: `python3 C:/Users/ADMIN/AppData/Local/Temp/write_evidence.py`

Verify: `ls` hoặc `os.path.getsize(p) > 0` trước khi báo done.

---

## Bước 5 — Báo cáo về PM

Append vào `docs/program/AGENT_MESSAGE_BUS.md` (dùng Python write_evidence.py tương tự):

```
[2026-08-19 antigravity] GOLIVE-E-MENU-SWEEP
- ack_status: PASS_TO_PM | FAIL_TO_PM | PASS_WITH_HOLD
- evidence: docs/qa/evidence/qa-menu-sweep-golive-01.md
- bugs/blockers: <mô tả nếu có, hoặc "none">
```

---

## Luật bắt buộc

| # | Luật |
|---|------|
| U65 | Không seed DB. Không tạo data giả. |
| No-src-change | KHÔNG sửa source code. Script Playwright là file tạm ở /Temp — không commit vào repo. |
| No-register | KHÔNG navigate tới /hr/register trong bất kỳ trường hợp nào. |
| NFD write | Ghi file evidence = Python os.scandir (không dùng Write tool). |
| Evidence | Ghi evidence dù PASS / FAIL / BLOCKED. Không báo done nếu chưa có file evidence. |
| Verify file | Sau khi ghi: `os.path.getsize(p) > 0` — paste result vào evidence. |
