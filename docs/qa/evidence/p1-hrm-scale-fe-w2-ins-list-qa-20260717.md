# P1-HRM-SCALE-FE-W2-INS-LIST-QA — Browser Network retest (insurance list mount capped)

- **Date:** 2026-07-17
- **work_item_id:** `P1-HRM-SCALE-FE-W2-INS-LIST-QA`
- **Environment:** `http://14.225.217.232:8088` (VPS Dev8088 · portal-fe + hrm-fe)
- **Persona:** Group CEO `ceo@xe.vn` / BOD / `companyId=main` / `tenantId=xevn`
- **Deploy refs:** VPS HEAD `bf5067b` — `docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-deploy-20260717.md`
- **FE refs:** `docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-20260717.md`
- **Method:** U65 browser-only — BOD session, real clicks, iframe `PerformanceResourceTiming` (+ `responseStatus`). No seed. No API-only PASS.
- **spec_ref:** ADR-HRM-SCALE-1000-USERS §5.5 T-FANOUT · UC-HRM-25 · UF-HRM-04 · J-HRM-02 · closes `COND-SCALE-W2-INS-LIST-FANOUT`
- **NOT claimed:** Phase 1 DONE / PROD-READY

## Verdict

**PASS_TO_PM** — all exit criteria **PASS**. Insurance list mount no longer fans out `page=1..11`; honest API total + capped hint + explicit «Tải thêm» (+1 `page=2` only). Regression W2 picker / ATT-NAV soft-nav leave Attendance / J-HRM-02 T-FANOUT remain green.

Recommend **QC** close `COND-SCALE-W2-INS-LIST-FANOUT`.

---

## Preflight (else FAIL BLOCKED-ENV)

| Probe | Result |
|-------|--------|
| `GET http://14.225.217.232:8088/hr/node_modules/.vite/deps/react-dom.js` | **200** `content-type: text/javascript` |
| Portal `/command-center/hrm/insurance` | **200** |
| iframe `#root` on insurance | **non-empty** (`rootLen=105629`, childCount=4) |
| SPA blank / react-dom 504 | **absent** |

---

## Exit criteria matrix

| # | Criteria | Evidence | Verdict |
|---|----------|----------|---------|
| 1 | Mount GET insurance `page=1` ≤1–2; **0** auto `page=2..11` | Iframe remount `/hr/insurance`: **1×** `GET …/contracts-insurance/insurance?company_id=main&page=1&page_size=100` **200**. **0** page≥2 | **PASS** |
| 2 | Honest total + capped hint + «Tải thêm» → +1 `page=2` | Chip «Tất cả **1043**»; hint `Hiển thị 100 / 1043 bản ghi — tổng từ API…`; subtypes `BHXH ~100` / `BHYT ~100`. Click **Tải thêm** → **1×** `page=2` **200**; display → `200 / 1043`; **0** auto page>2; «Tải thêm» still visible | **PASS** |
| 3a | Regression W2 picker | Open «Thêm bảo hiểm»: **1×** `GET /employees?…page=1&page_size=50` **200**; hint `50/1107`; keyword `NV0001` → **1×** same +`keyword=NV0001` **200**; **0** page≥2 | **PASS** |
| 3b | ATT-NAV soft-nav leave Attendance | Soft-nav Bảo hiểm → Chấm công (view Attendance) → Nhân sự: iframe path `/hr/employees`, UI «Quản lý nhân viên…1107», **not** stalled on Attendance; `_v` stable across soft-nav (`1784276602767`) | **PASS** |
| 3c | J-HRM-02 T-FANOUT | Hard reload Employees: **1×** list `page=1&page_size=50` + **1×** `/employees/summary` (allowed); **0** page≥2. Row HLD-0996 → profile: detail **×1** + work-timeline **×1** **200**; **0** list fan-out. Back → list 1107; `_v` stable (`1784276811876`) | **PASS** |

Screenshot (post load-more, before dialog): `docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-qa-20260717.png`

---

## Network counts (authoritative)

### 1. Insurance mount (COND-SCALE-W2-INS-LIST-FANOUT)

| Action | Request | Count | HTTP |
|--------|---------|------:|------|
| Iframe remount `/hr/insurance` | `/api/hrm/contracts-insurance/insurance?company_id=main&page=1&page_size=100` | **1** | 200 |
| Auto chain `page=2..11` | — | **0** | — |

UI after mount: `Hiển thị 100 / 1043` · chips `Tất cả 1043` · `BHXH ~100` · `BHYT ~100` · button **Tải thêm**.

### 2. Load more

| Action | Request | Count | HTTP |
|--------|---------|------:|------|
| Click **Tải thêm** (timings cleared) | `…/insurance?…page=2&page_size=100` | **1** | 200 |
| Auto dump remaining pages | `page>2` | **0** | — |

UI after: `Hiển thị 200 / 1043` · **Tải thêm** still present.

### 3. W2 Insurance Add picker

| Action | Request | Count | HTTP |
|--------|---------|------:|------|
| Open dialog | `/api/hrm/employees?company_id=main&include_archived=false&page=1&page_size=50` | **1** | 200 |
| Keyword `NV0001` | same + `keyword=NV0001` | **1** | 200 |
| Multi-page employees | `page≥2` | **0** | — |

### 4. ATT-NAV + J-HRM-02

| Step | Result |
|------|--------|
| Soft-nav → Attendance | path `/hr/attendance`; snippet «Đi muộn, về sớm» / tabs; `_v` unchanged |
| Soft-nav → Employees | path `/hr/employees`; list 1107; **stalled=false** |
| Hard reload Employees mount | list GET **×1** page=1 size=50 + summary ×1; fan-out **0** |
| Profile HLD-0996 / Phạm Đức Hùng | `GET /employees/{id}` ×1 + work-timeline ×1; no «Không tìm thấy» |
| Back | list restores; `_v` stable |
| RATE-429 / 5xx on sampled HRM APIs | **0** |

---

## Residuals (không chặn PASS)

| Item | Severity | Owner | Note |
|------|----------|-------|------|
| No insurance **summary** endpoint — financial cards partial when capped | P3 | product / `dev-be` if sponsor wants full-scope sums | Carry from FE evidence |
| Contracts list may still auto-progressive (same class as old INS) | P2 backlog | separate work_item if flagged | Out of this AC |
| Radix DialogTitle a11y on Add Insurance (prior W2 noise) | P3 | `dev-fe` | Not re-scoped this wave |
| T-CONC 1000 VU | NFR W3 | `devops` | Not claimed |

---

## Click path

1. Preflight `react-dom.js` 200 + open `/command-center/hrm/insurance` (BOD session already live)
2. Remount iframe insurance → measure mount Network (AC1)
3. Assert chips/hint → click **Tải thêm** → measure page=2 only (AC2)
4. «Thêm bảo hiểm» → picker Network + keyword `NV0001` → Esc close
5. Soft-nav **Chấm công** → **Nhân sự** (ATT-NAV)
6. Hard reload **Nhân sự** → row HLD-0996 → profile → back (J-HRM-02)

---

## Handoff

- **completion_report:** Browser QA PASS on `:8088` HEAD `bf5067b`. Mount insurance list **1× page=1**, **0** auto page=2..11; honest total 1043 + capped hint + **Tải thêm** → **+1 page=2**. W2 picker / ATT-NAV leave Attendance / J-HRM-02 T-FANOUT regression **PASS**. `COND-SCALE-W2-INS-LIST-FANOUT` ready for QC close.
- **next_owner:** `qc`
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-qa-20260717.md`

### next_dispatch_prompt

```text
work_item_id: P1-HRM-SCALE-FE-W2-INS-LIST-QC
from_role: pm
to_role: qc
subagent_type: qc

entry_criteria: QA PASS_TO_PM; U65 browser evidence docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-qa-20260717.md; deploy docs/qa/evidence/p1-hrm-scale-fe-w2-ins-list-deploy-20260717.md (HEAD bf5067b)
scope: close COND-SCALE-W2-INS-LIST-FANOUT
audit: mount insurance GET page=1 ≤1–2 + 0 auto page=2..11; honest total + Tải thêm → +1 page=2; regression W2 picker / ATT-NAV / J-HRM-02 cited in QA evidence
cấm: seed · Phase1/PROD claim · re-open closed ATT-NAV without new FAIL
evidence_path: docs/qa/evidence/qc-p1-hrm-scale-fe-w2-ins-list-20260717.md
exit: GO / GO WITH CONDITIONS / NO-GO + residual owners
```
