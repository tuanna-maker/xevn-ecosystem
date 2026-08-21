# 31 — World-standard Test Log (OS)

**Sponsor lock (2026-08-03 / U78):** Mọi lần test phải có **log test** chuẩn thế giới — không chỉ PASS miệng, screenshot đứng, hoặc HTTP 200.

**Ánh xạ chuẩn (research):**

| Standard | Artifact | XeVN maps to |
|----------|----------|--------------|
| **IEEE 829-2008** Level Test Log (LTL) | Chronological record of test execution; identity of tester; pass/fail per case; anomalous events → Anomaly Report | `*-test-log.md` steps + `incidents[]` |
| **IEEE 829** Test Incident / Anomaly Report | Expected vs actual, evidence, impact | `incidents[]` + residual WI |
| **ISO/IEC/IEEE 29119-3:2021** | Test execution log (id, date/time, description, impact); Actual results; Test result (pass/fail vs expected) | `steps[]` + `cases[]` + `summary` |
| **Modern CI** | JUnit XML (`testsuite`/`testcase` + failure/skip) | `summary` counts; optional export later |
| **Allure-style** | Steps + attachments (screenshots, network) | `steps[].attachment` + `attachments[]` |

Sources (public): [IEEE 829 overview / LTL](https://en.wikipedia.org/wiki/Software_test_documentation) · IEEE Std 829-1998/2008 Test Log § · [ISO/IEC/IEEE 29119-3:2021](https://www.iso.org/standard/79429.html) § Test execution log / Test result · [JUnit XML + attachments convention](https://github.com/testmoapp/junitxml) · Allure steps/attachments practice.

---

## 1. Required deliverables mỗi wave QA / qa-device

| File | Role |
|------|------|
| `docs/qa/evidence/<work_item_id-slug>-test-log.md` | Human chronological log (IEEE LTL lean) |
| `docs/qa/evidence/<work_item_id-slug>-test-log.json` | Machine log — schema **`xevn-test-log/v1`** |

Narrative evidence (`*-qa-*.md`) **không thay** test-log. Capability E2E evidence cũng phải kèm cặp test-log (xem project pointer).

Template: `_vibe-team-os/templates/TEST_EXECUTION_LOG.md` · project copy: `docs/qa/TEST_EXECUTION_LOG_TEMPLATE.md`.

---

## 2. Required fields (lean — đủ nghiệm thu)

### Header

- `schema`: `"xevn-test-log/v1"`
- `log_id`: e.g. `TEL-W1B-04-AUTH-FE-RET2-20260803`
- `work_item_id`
- `tester` (role + agent/session id if any)
- `started_at` / `ended_at` (ISO-8601)
- `environment`: URL(s), API ports, device/emulator, commit/HEAD if known
- `hdsd_sot` / `spec_ref` (UC · Diễn biến · FR)
- `hdsd_align` (boolean — U76)
- `u65_zero_seed` (boolean)
- `verdict`: `pass` | `fail` | `blocked` | `partial`
- `evidence_narrative`: path to main QA evidence md

### Chronological `steps[]`

Mỗi bước:

| Field | Required |
|-------|----------|
| `seq` | yes |
| `at` | yes (ISO-8601) |
| `action` | yes (HDSD / harness step name) |
| `expected` | yes |
| `actual` | yes |
| `network` | when HTTP involved (`method`, `url`, `status`, `code`) |
| `result` | `pass` \| `fail` \| `blocked` \| `skipped` |
| `attachment` | path under `docs/qa/evidence/...` if screenshot/log exists |

### `cases[]` (U76 case matrix)

At least: fail-deep (A) · success HDSD (B) · logic/BR (C) when in scope — status + notes.

### `incidents[]`

Anomaly: `id`, `severity`, `expected`, `actual`, `residual_wi`.

### `summary`

`passed` · `failed` · `blocked` · `skipped` · `ack_status`

---

## 3. JSON schema `xevn-test-log/v1` (normative shape)

```json
{
  "schema": "xevn-test-log/v1",
  "log_id": "TEL-…",
  "work_item_id": "W…",
  "tester": { "role": "qa", "agent": "…" },
  "started_at": "2026-08-03T13:22:19.942Z",
  "ended_at": "2026-08-03T13:23:05.936Z",
  "environment": {
    "portal_url": "http://127.0.0.1:5173",
    "hrm_api": "http://127.0.0.1:28001/api/hrm",
    "xbos_api": "http://127.0.0.1:28002/api/xbos",
    "notes": "optional"
  },
  "spec_ref": "FR-UC-…",
  "hdsd_sot": "path or label",
  "hdsd_align": true,
  "u65_zero_seed": true,
  "evidence_narrative": "docs/qa/evidence/….md",
  "steps": [],
  "cases": [],
  "incidents": [],
  "attachments": [],
  "summary": {
    "passed": 0,
    "failed": 0,
    "blocked": 0,
    "skipped": 0,
    "verdict": "fail",
    "ack_status": "FAIL"
  }
}
```

---

## 4. Reject rules (INVALID-HANDOFF / NO-GO QA)

| Reject | Why |
|--------|-----|
| PASS/FAIL without chronological steps | Violates IEEE LTL + U78 |
| MD log without JSON (or vice versa) | Machine log mandatory |
| Idle screenshot / viewport-only, no clicks + network | Anti-idle + U65 |
| Seed / API fake then claim UF 🟢 | U65 |
| Attachment paths that do not exist | Evidence integrity |
| Invent UF 🟢 from unit/vitest alone | U63/U65 |

---

## 5. PM dispatch (mandatory)

```text
test_log_required: true
test_log_md: docs/qa/evidence/<WI-slug>-test-log.md
test_log_json: docs/qa/evidence/<WI-slug>-test-log.json
```

Cross-links: OS `30` HDSD-aligned QA · project `docs/qa/WORLD_STANDARD_TEST_LOG.md` · rule `.cursor/rules/qa-world-standard-test-log.mdc`.
