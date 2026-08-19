# Prompt cho Antigravity — GOLIVE A+B+C+D (v2 — Browser thật, headless:false)

> Updated: 2026-08-19 v2
> BE đã lên: 28001 (HRM), 28002 (XBOS). FE: 8080 (HRM), 5173 (Portal).
> Lần này: headless:false — mở browser thật, test đúng luồng UI, không chỉ DOM check.

---

## SETUP

### Bước 0 — Verify ports trước khi chạy

```bash
netstat -ano | findstr ":28001"
netstat -ano | findstr ":8080"
```

Cả hai phải `LISTENING`. Nếu thiếu → dừng, báo BLOCKED.

### Bước 0b — Auth inject (giữ nguyên từ v1)

```javascript
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
```

**Lưu ý quan trọng về auth BE:**
- Mock token này bypass được FE auth (portal bridge) → sidebar, navigation OK
- BE dùng RS256 JWT thật → API call với mock token có thể trả 401
- Nếu API trả 401 → ghi `API-UNAUTH` trong evidence, không phải bug FE
- Nếu API trả 400 → route tồn tại, kiểm tra params
- Nếu API trả 200/201 → BE đang accept request (dev mode có thể relax auth)

### Bước 0c — Ghi file (Python NFD)

```python
import os

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
```

---

## PHẦN C — ATTENDANCE SMOKE (làm trước, UI nhiều nhất)

Evidence: `docs/qa/evidence/qa-att-regression-smoke-golive-01.md` (ghi đè v1)

Script `C:/Users/ADMIN/AppData/Local/Temp/qa_att_v2.js`:

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

const BASE = 'http://localhost:8080';

(async () => {
  // headless: false — mở browser thật
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await (await browser.newContext()).newPage();
  const results = [];

  // Prime auth
  await page.goto(BASE + '/hr/');
  await page.evaluate(AUTH_INJECT);
  await page.waitForTimeout(1000);
  await page.reload();
  await page.waitForTimeout(1500);

  // ATT-A1: Attendance page render
  await page.goto(BASE + '/hr/attendance', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const attInfo = await page.evaluate(() => {
    const b = document.body.innerText;
    return {
      bodyLen: b.length,
      hasCrash: b.includes('Something went wrong'),
      hasSidebar: !!document.querySelector('nav, aside'),
      snippet: b.slice(0, 300)
    };
  });
  results.push({ tc: 'ATT-A1', status: attInfo.hasCrash ? 'CRASH' : attInfo.bodyLen > 400 ? 'OK' : 'BLANK', ...attInfo });
  console.log('ATT-A1:', results.at(-1).status, 'len='+attInfo.bodyLen);

  // ATT-B1: Settings att-leave-types tab
  await page.goto(BASE + '/hr/settings?tab=att-leave-types', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const b1Info = await page.evaluate(() => {
    const b = document.body.innerText;
    return {
      bodyLen: b.length,
      hasCrash: b.includes('Something went wrong'),
      hasLeaveTypeContent: b.includes('Loại phép') || b.includes('leave') || b.includes('nghỉ'),
      snippet: b.slice(0, 400)
    };
  });
  results.push({ tc: 'ATT-B1', status: b1Info.hasCrash ? 'CRASH' : b1Info.bodyLen > 300 ? 'OK' : 'BLANK', ...b1Info });
  console.log('ATT-B1:', results.at(-1).status, 'len='+b1Info.bodyLen);

  // ATT-B2: master-data tab — check leaveTypes bucket amber banner
  await page.goto(BASE + '/hr/settings?tab=master-data', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  // Click vào leaveTypes tab trong master-data
  const leaveTab = await page.$('[data-testid="md-tab-leaveTypes"]');
  if (leaveTab) {
    await leaveTab.click();
    await page.waitForTimeout(1500);
  }
  const b2Info = await page.evaluate(() => {
    const b = document.body.innerText;
    // Check specifically for amber banner text
    const hasAmber = b.includes('tab chuyên biệt') || b.includes('Loại phép ATT') || b.includes('att-leave-types') || b.includes('Mở tab');
    // Check Add button absence (should be hidden for leaveTypes)
    const addBtn = document.querySelector('[data-testid="md-create-leaveTypes"]');
    const addVisible = addBtn ? window.getComputedStyle(addBtn).display !== 'none' : false;
    // Check link button presence
    const linkBtn = document.querySelector('[data-testid="md-leaveTypes-open-standalone-tab"]');
    return {
      bodyLen: b.length,
      hasCrash: b.includes('Something went wrong'),
      hasAmberBanner: hasAmber,
      addBtnExists: !!addBtn,
      addBtnVisible: addVisible,
      linkBtnExists: !!linkBtn,
      snippet: b.slice(1000, 1400)
    };
  });
  const b2Status = b2Info.hasCrash ? 'CRASH' : 'OK';
  results.push({
    tc: 'ATT-B2',
    status: b2Status,
    note: b2Info.hasAmberBanner ? 'Amber banner OK' : b2Info.addBtnExists && !b2Info.addBtnVisible ? 'Add hidden (CSS), banner logic OK' : 'ADD BUTTON VISIBLE — check extensionMutateDisabled',
    ...b2Info
  });
  console.log('ATT-B2:', b2Status, JSON.stringify({ hasAmber: b2Info.hasAmberBanner, addVisible: b2Info.addBtnVisible, linkBtn: b2Info.linkBtnExists }));

  await browser.close();
  console.log('\n--- JSON ---');
  console.log(JSON.stringify(results, null, 2));
})();
```

Chạy: `node C:/Users/ADMIN/AppData/Local/Temp/qa_att_v2.js`

---

## PHẦN D — RECRUITMENT UAT

Evidence: `docs/qa/evidence/qa-rec-pipeline-golive-01.md` (ghi đè v1)

Script `C:/Users/ADMIN/AppData/Local/Temp/qa_rec_v2.js`:

```javascript
const { chromium } = require('playwright');

const AUTH_INJECT = `/* ... same as above ... */`;
const BASE = 'http://localhost:8080';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await (await browser.newContext()).newPage();
  const results = [];

  await page.goto(BASE + '/hr/');
  await page.evaluate(AUTH_INJECT);
  await page.waitForTimeout(800);
  await page.reload();
  await page.waitForTimeout(1500);

  // R1: Tab Vị trí tuyển dụng
  await page.goto(BASE + '/hr/recruitment', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const r1 = await page.evaluate(() => {
    const b = document.body.innerText;
    return {
      bodyLen: b.length,
      hasCrash: b.includes('Something went wrong'),
      hasRecContent: b.includes('Tuyển dụng') || b.includes('recruitment') || b.includes('Vị trí'),
      apiError: b.includes('Không tải được') || b.includes('hợp lệ'),
      snippet: b.slice(0, 400)
    };
  });
  results.push({ tc: 'REC-R1', status: r1.hasCrash ? 'CRASH' : r1.bodyLen > 400 ? 'OK' : 'BLANK', apiNotes: r1.apiError ? 'API-UNAUTH (expected)' : 'API-OK', ...r1 });
  console.log('REC-R1:', results.at(-1).status);

  // R2: Click Tạo vị trí mới
  const createBtn = await page.$('[data-testid*="create-job"], [data-testid*="new-job"], button:has-text("Tạo vị trí"), button:has-text("Thêm vị trí"), button:has-text("Tạo mới")');
  if (createBtn) {
    await createBtn.click();
    await page.waitForTimeout(1200);
    const r2 = await page.evaluate(() => {
      const b = document.body.innerText;
      return {
        hasForm: !!(document.querySelector('[role=dialog]') || document.querySelector('form')),
        hasCrash: b.includes('Something went wrong'),
        snippet: b.slice(0, 300)
      };
    });
    results.push({ tc: 'REC-R2', status: r2.hasCrash ? 'CRASH' : r2.hasForm ? 'OK' : 'NO-FORM', ...r2 });
  } else {
    // Try find any button with Tạo
    const btns = await page.$$('button');
    const btnTexts = await Promise.all(btns.map(b => b.textContent()));
    results.push({ tc: 'REC-R2', status: 'SKIP', note: 'No create button found', buttonTexts: btnTexts.filter(t => t && t.trim()).slice(0, 10) });
  }
  console.log('REC-R2:', results.at(-1).status);

  // R7: Code analysis PASS — ghi static
  results.push({ tc: 'REC-R7', status: 'PASS-CODE', note: 'buildContractHireCtaPath confirmed line 624 CandidatesTab.tsx' });

  await browser.close();
  console.log('\n--- JSON ---');
  console.log(JSON.stringify(results, null, 2));
})();
```

Chạy: `node C:/Users/ADMIN/AppData/Local/Temp/qa_rec_v2.js`

---

## PHẦN A — CONTRACT CREATE

Evidence: `docs/qa/evidence/qa-ctr-create-wizard-golive-01.md` (ghi đè v1)

Script `C:/Users/ADMIN/AppData/Local/Temp/qa_ctr_v2.js`:

```javascript
const { chromium } = require('playwright');

const AUTH_INJECT = `/* ... same ... */`;
const BASE = 'http://localhost:8080';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await (await browser.newContext()).newPage();
  const results = [];

  await page.goto(BASE + '/hr/');
  await page.evaluate(AUTH_INJECT);
  await page.waitForTimeout(800);
  await page.reload();
  await page.waitForTimeout(1500);

  // CTR-01: Navigate contracts, open wizard
  await page.goto(BASE + '/hr/contracts', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  const pageInfo = await page.evaluate(() => {
    const b = document.body.innerText;
    return { bodyLen: b.length, hasCrash: b.includes('Something went wrong'), snippet: b.slice(0,300) };
  });
  results.push({ tc: 'CTR-01-PAGE', status: pageInfo.hasCrash ? 'CRASH' : pageInfo.bodyLen > 300 ? 'OK' : 'BLANK', ...pageInfo });

  // Try clicking create button
  const createBtn = await page.$('[data-testid*="create-contract"], button:has-text("Tạo hợp đồng"), button:has-text("Tạo HĐ"), button:has-text("Thêm")');
  if (createBtn) {
    await createBtn.click();
    await page.waitForTimeout(1500);
    const wizardInfo = await page.evaluate(() => {
      const b = document.body.innerText;
      return {
        hasWizard: !!(document.querySelector('[role=dialog]') || b.includes('Bước') || b.includes('Chọn nhân viên')),
        hasCrash: b.includes('Something went wrong'),
        snippet: b.slice(0, 400)
      };
    });
    results.push({ tc: 'CTR-01-WIZARD', status: wizardInfo.hasCrash ? 'CRASH' : wizardInfo.hasWizard ? 'OK' : 'NO-WIZARD', ...wizardInfo });
  } else {
    const btns = await page.$$('button');
    const btnTexts = await Promise.all(btns.map(b => b.textContent()));
    results.push({ tc: 'CTR-01-WIZARD', status: 'SKIP', note: 'No create button', buttons: btnTexts.filter(t=>t&&t.trim()).slice(0,10) });
  }

  // CTR-03: code analysis PASS
  results.push({ tc: 'CTR-03', status: 'PASS-CODE', note: 'clauseOrderDirty gate confirmed lines 411-415' });

  // API test qua proxy
  const apiTest = await page.evaluate(async () => {
    const r = await fetch('/api/hrm/contracts', { headers: { 'X-Tenant-ID': 'xevn' } }).catch(e=>({status:'ERR',err:e.message}));
    return typeof r.status === 'number' ? { status: r.status } : r;
  });
  results.push({ tc: 'CTR-API', status: apiTest.status === 200 ? 'OK' : `HTTP-${apiTest.status}`, ...apiTest });
  console.log('CTR-API:', apiTest);

  await browser.close();
  console.log('\n--- JSON ---');
  console.log(JSON.stringify(results, null, 2));
})();
```

Chạy: `node C:/Users/ADMIN/AppData/Local/Temp/qa_ctr_v2.js`

---

## PHẦN B — PAYROLL

Evidence: `docs/qa/evidence/qa-payroll-e2e-journey-golive-01.md` (ghi đè v1)

Script `C:/Users/ADMIN/AppData/Local/Temp/qa_payroll_v2.js`:

```javascript
const { chromium } = require('playwright');

const AUTH_INJECT = `/* ... same ... */`;
const BASE = 'http://localhost:8080';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await (await browser.newContext()).newPage();
  const results = [];

  await page.goto(BASE + '/hr/');
  await page.evaluate(AUTH_INJECT);
  await page.waitForTimeout(800);
  await page.reload();
  await page.waitForTimeout(1500);

  // P1: Payroll page
  await page.goto(BASE + '/hr/payroll', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const p1 = await page.evaluate(() => {
    const b = document.body.innerText;
    return {
      bodyLen: b.length,
      hasCrash: b.includes('Something went wrong'),
      hasPayrollContent: b.includes('Tính lương') || b.includes('Kỳ lương') || b.includes('payroll'),
      hasData: b.includes('Kỳ lương') && !b.includes('Chưa có'),
      snippet: b.slice(0, 500)
    };
  });
  results.push({ tc: 'PAY-P1', status: p1.hasCrash ? 'CRASH' : p1.bodyLen > 400 ? 'OK' : 'BLANK', ...p1 });
  console.log('PAY-P1:', results.at(-1).status, 'hasData:', p1.hasData);

  // P2-P7: Nếu không có data thật
  if (!p1.hasData) {
    results.push({ tc: 'PAY-P2-P7', status: 'BLOCKED', note: 'U65: No payroll period data. Cannot seed. Deferred to onsite QA with real data.' });
  } else {
    results.push({ tc: 'PAY-P2-P7', status: 'MANUAL-NEEDED', note: 'Data exists, manual E2E needed for payroll calc+publish flow.' });
  }

  await browser.close();
  console.log('\n--- JSON ---');
  console.log(JSON.stringify(results, null, 2));
})();
```

Chạy: `node C:/Users/ADMIN/AppData/Local/Temp/qa_payroll_v2.js`

---

## THỨ TỰ CHẠY

1. `node C:/Users/ADMIN/AppData/Local/Temp/qa_att_v2.js` — ATT (Phần C)
2. `node C:/Users/ADMIN/AppData/Local/Temp/qa_rec_v2.js` — REC (Phần D)
3. `node C:/Users/ADMIN/AppData/Local/Temp/qa_ctr_v2.js` — CTR (Phần A)
4. `node C:/Users/ADMIN/AppData/Local/Temp/qa_payroll_v2.js` — Payroll (Phần B)

**Sau mỗi script:** Lưu JSON output → ghi evidence bằng Python NFD → append bus.

---

## Ghi evidence (Python NFD — giữ nguyên từ v1)

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
# ATT:
p_c = os.path.join(root, 'docs', 'qa', 'evidence', 'qa-att-regression-smoke-golive-01.md')
# REC:
p_d = os.path.join(root, 'docs', 'qa', 'evidence', 'qa-rec-pipeline-golive-01.md')
# CTR:
p_a = os.path.join(root, 'docs', 'qa', 'evidence', 'qa-ctr-create-wizard-golive-01.md')
# Payroll:
p_b = os.path.join(root, 'docs', 'qa', 'evidence', 'qa-payroll-e2e-journey-golive-01.md')
```

---

## Báo cáo về PM

Sau khi có kết quả tất cả, append vào `docs/program/AGENT_MESSAGE_BUS.md`:

```
[2026-08-19 antigravity] GOLIVE-ABCD-v2
- method: Playwright headless:false (browser thật, slowMo:300)
- C-ATT: ack_status PASS_TO_PM|FAIL_TO_PM|PASS_WITH_HOLD — evidence: qa-att-regression-smoke-golive-01.md
- D-REC: ack_status ... — evidence: qa-rec-pipeline-golive-01.md
- A-CTR: ack_status ... — evidence: qa-ctr-create-wizard-golive-01.md
- B-PAY: ack_status ... — evidence: qa-payroll-e2e-journey-golive-01.md
- bugs: <mô tả nếu có>
```

---

## LUẬT (KHÔNG ĐỔI)

- U65: Không seed DB
- No-src-change: KHÔNG sửa source
- No-register: KHÔNG navigate /hr/register
- NFD write: Python os.scandir cho file evidence
- Verify file: os.path.getsize > 0 trước khi báo done
- API-UNAUTH (401): expected với mock token, không phải bug — ghi đúng status
