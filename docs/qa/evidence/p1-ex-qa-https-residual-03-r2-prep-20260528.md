# QA Standby Retest Prep — P1-EX-QA-HTTPS-RESIDUAL-03-R2-PREP

- work_item_id: `P1-EX-QA-HTTPS-RESIDUAL-03-R2-PREP`
- from_role: `pm`
- to_role: `qa`
- prepared_at: `2026-05-28`
- environment_target: `https://14-225-217-232.nip.io` (Group CEO slice)
- account: `ceo@xe.vn` / `Xevn@2026`
- scope: `portal=1`, `companyId=main`
- prior_reference: `docs/qa/evidence/p1-ex-qa-https-residual-03-r1-20260528.md`

## Objective of R2 Retest (standby-only; no premature verdict)

Retest two residual gates immediately after PM confirms `READY_FOR_QA` for FE/BE R2 fixes:

1. Browser-session auth residual: 5 mandatory HRM list endpoints must return `200`.
2. Attendance fallback residual: runtime must show zero localhost fallback traffic (`127.0.0.1:54321/rest/v1/*`) and attendance probe must not return `401 HRM-AUTH-001`.

No verdict is issued from this prep artifact. Verdict is only produced after live execution.

## Entry checklist (must be true before execution)

- [ ] PM bus/evidence confirms `READY_FOR_QA` for R2 implementation wave.
- [ ] Target deploy/restart evidence exists and is timestamped after latest code fix.
- [ ] `ceo@xe.vn` credential is valid on HTTPS portal.
- [ ] QA confirms route is reachable: `/command-center/hrm/attendance?portal=1&companyId=main`.
- [ ] No stale browser session from older failed runs (start fresh login).

## Execution checklist (exact retest runbook)

### A) L0 perimeter + login readiness

- [ ] Open `https://14-225-217-232.nip.io/login`.
- [ ] Login as Group CEO (`ceo@xe.vn`).
- [ ] Confirm portal shell loads and no blocking auth redirect loop.

### B) Residual 1 — browser-session auth gate (5 endpoints)

Run this browser-console snippet after login (same session):

```javascript
const BASE = "https://14-225-217-232.nip.io/api/hrm";
const CID = "main";
const ACCESS_TOKEN = window.localStorage.getItem("xevn_access_token") || "";
const PORTAL_TOKEN =
  window.localStorage.getItem("xevn_portal_access_token") ||
  window.sessionStorage.getItem("xevn_portal_access_token") ||
  ACCESS_TOKEN;

const headers = {
  "content-type": "application/json",
  "x-access-token": ACCESS_TOKEN,
  "x-portal-access-token": PORTAL_TOKEN,
};

const checks = [
  { id: "HRM-CON-200", path: `/contracts-insurance/contracts?company_id=${CID}&page=1&page_size=20` },
  { id: "HRM-INS-200", path: `/contracts-insurance/insurance?company_id=${CID}&page=1&page_size=20` },
  { id: "HRM-REC-200", path: `/recruitment/requisitions?company_id=${CID}&page=1&page_size=20` },
  { id: "HRM-ATT-200", path: `/attendance/records?company_id=${CID}&page=1&page_size=20` },
  { id: "HRM-PAY-200", path: `/payroll/payslips?company_id=${CID}&page=1&page_size=20` },
];

const run = async () => {
  const out = [];
  for (const c of checks) {
    const r = await fetch(`${BASE}${c.path}`, { method: "GET", headers, credentials: "include" });
    const body = await r.json().catch(() => ({}));
    out.push({
      id: c.id,
      status: r.status,
      ok: r.ok,
      code: body?.error?.code || body?.code || null,
      message: body?.error?.message || body?.message || null,
      path: c.path,
    });
  }
  console.table(out);
  return out;
};

run();
```

Pass criteria for residual 1:
- [ ] `HRM-CON-200` = 200
- [ ] `HRM-INS-200` = 200
- [ ] `HRM-REC-200` = 200
- [ ] `HRM-ATT-200` = 200
- [ ] `HRM-PAY-200` = 200
- [ ] No `HRM-AUTH-001` in responses

### C) Residual 2 — attendance no-localhost fallback gate

Navigate to:

`https://14-225-217-232.nip.io/command-center/hrm/attendance?portal=1&companyId=main`

Run this browser-console snippet before and after clicking `Kiểm tra lại`:

```javascript
const resources = performance.getEntriesByType("resource").map((r) => r.name);
const fallbackHits = resources.filter((u) => u.includes("127.0.0.1:54321/rest/v1/"));
const attendanceApiHits = resources.filter((u) => u.includes("/api/hrm/attendance/"));

const summary = {
  fallbackAllCount: fallbackHits.length,
  attendanceApiCount: attendanceApiHits.length,
  fallbackSample: fallbackHits.slice(-10),
  attendanceSample: attendanceApiHits.slice(-10),
};

console.log("ATTENDANCE_RESOURCE_SUMMARY", summary);
summary;
```

Then run in-session attendance probe:

```javascript
const probeAttendance = async () => {
  const access = window.localStorage.getItem("xevn_access_token") || "";
  const portal =
    window.localStorage.getItem("xevn_portal_access_token") ||
    window.sessionStorage.getItem("xevn_portal_access_token") ||
    access;
  const r = await fetch(
    "https://14-225-217-232.nip.io/api/hrm/attendance/records?company_id=main&page=1&page_size=20",
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "x-access-token": access,
        "x-portal-access-token": portal,
      },
      credentials: "include",
    },
  );
  const body = await r.json().catch(() => ({}));
  const result = {
    status: r.status,
    ok: r.ok,
    code: body?.error?.code || body?.code || null,
    message: body?.error?.message || body?.message || null,
  };
  console.log("ATTENDANCE_PROBE_RESULT", result);
  return result;
};
probeAttendance();
```

Pass criteria for residual 2:
- [ ] `fallbackAllCount === 0` both before and after `Kiểm tra lại`
- [ ] No resource URL contains `127.0.0.1:54321/rest/v1/`
- [ ] Attendance probe returns `200`
- [ ] Probe response does not include `HRM-AUTH-001`

## Capture template (fill during live retest)

```text
R2_EXECUTION_TIME:
PORTAL_URL:
ACCOUNT:

AUTH_GATE_TABLE:
- HRM-CON-200: status=
- HRM-INS-200: status=
- HRM-REC-200: status=
- HRM-ATT-200: status=
- HRM-PAY-200: status=

AUTH_GATE_OBS:

ATTENDANCE_GATE_BEFORE_RETRY:
- fallbackAllCount=
- attendanceApiCount=
- fallbackSample=

ATTENDANCE_GATE_AFTER_RETRY:
- fallbackAllCount=
- attendanceApiCount=
- fallbackSample=

ATTENDANCE_PROBE:
- status=
- code=
- message=

CONSOLE_EXCERPT:
HTTP_EXCERPT:
FINAL_VERDICT:
```

## Risk flags to watch (blockers)

- Any endpoint in residual 1 returns non-200.
- Any `HRM-AUTH-001` appears in auth or attendance probe.
- Any localhost fallback request appears in attendance resource timeline.
- Browser shows stale script/cache behavior inconsistent with deploy timestamp.

## Handoff contract

- completion_report: `Standby retest package prepared with exact scripts, pass/fail gates, and capture template for immediate R2 execution once READY_FOR_QA is posted. No runtime verdict issued in this prep step.`
- next_owner: `pm`
- next_dispatch_prompt: `Dispatch qa to execute P1-EX-QA-HTTPS-RESIDUAL-03-R2 immediately when READY_FOR_QA is posted. Use docs/qa/evidence/p1-ex-qa-https-residual-03-r2-prep-20260528.md runbook exactly, capture both residual gates (auth 5 endpoints + attendance no-localhost fallback), and publish PASS/FAIL evidence in a new R2 execution file with console and HTTP excerpts.`
- evidence_path: `docs/qa/evidence/p1-ex-qa-https-residual-03-r2-prep-20260528.md`
- ack_status: `PASS_TO_PM`

