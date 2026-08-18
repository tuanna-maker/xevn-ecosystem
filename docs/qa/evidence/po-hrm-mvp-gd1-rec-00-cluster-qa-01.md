# Evidence — PO-HRM-MVP-GD1-REC-00-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** Wave-5 seat #7) |
| **lane** | execution · **qa** · U65 zero-seed |
| **Date** | 2026-08-09 |
| **stamp** | **REC00QA-MSL06DF5** |
| **ack_status** | **FAIL_TO_PM** |
| **uc_ids** | `UC-BP-REC-00` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · DENY flip |
| **depends_on** | BE-01 READY_FOR_QA · FE-01 READY_FOR_QA |
| **env** | portal `:5173` · hrm-api `:28001` (**rebuild+restart** — status+publish LIVE) · commit `git rev-parse` at run |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-00-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-00-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-00-cluster-qa-01/` (blank whitescreen) |
| **hdsd_align** | true — Tuyển dụng → Thư viện JD (blocked mount) |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ba** | `docs/program/specs/PO-HRM-MVP-GD1-REC-00-CLUSTER-BA-01.md` AC-REC-JD-00-01..05 · P01–P05 · O1–O7 · J-HRM-REC-JD-00-01..04 |
| **api** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-API-01.md` F-JD-01..04 · PUB-* · physical `/recruitment/job-templates*` |
| **be** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-be-01.md` READY_FOR_QA · jest 41 |
| **fe** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-fe-01.md` READY_FOR_QA · vitest 65 |
| **journey** | `PROGRAM_JOURNEY_MAP.md` J-HRM-REC-JD-00-01..04 |

**cấm respected:** no `pnpm seed:*` · no API-only UF PASS · no honesty flip · no Nest `/rec` SoT claim · no `recruitment_uat` / `jd_dynamic_done` claim · C-SLICE.

---

## L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` | hrm-api **200** · xbos **200** · portal `:5173` **200** |
| `qc:fe-be-health` | **ALL PASS** (token + employees + catalog-sync + portal proxy) |
| Dist freshness | Intake: LIVE process **stale** (no `status` field · POST publish = `Cannot POST` 404) → **QA rebuild `hrm-api` + restart `dist/main`** → sealed LIVE |
| Verdict | 🟢 **PASS** (after rebuild/restart) |

---

## L1 / API spot (supporting — **not** UF 🟢)

| Probe | Network | After | Verdict |
|-------|---------|-------|---------|
| GET `…/recruitment/job-templates?page_size=5&company_id=main` | **200** `HRM-REC-JD-200` | items include **`status`** (sample `active`) + `is_active` | 🟢 LIVE |
| POST `…/job-templates/{fake}/publish` | **404** `HRM-REC-JD-404` «Resource not found» | **not** `Cannot POST` — route mapped | 🟢 LIVE |
| GET `…/api/hrm/rec/job-descriptions` | **404** | Nest `/rec` dual DENY | 🟢 |
| GET `…/job-templates?bindable=true` | **200** | count=7 · statuses=`["active"]` only | 🟢 |
| Create empty layout (probe) | **400** `HRM-JD-LAYOUT-EMPTY` | publish/create gate family present | 🟢 OBS |

---

## U65 browser UF (HDSD) — **BLOCKED P0 FE**

Persona inject portal auth · URL `http://127.0.0.1:5173/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=jd-library`

### Root cause (P0)

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| **R-REC-00-FE-COMMENT-ASTERISK** | **P0** | `JobTemplatesTab.tsx` CODE-MEMORY line ~81 contains `PUB-*/CODE-DUP` — the `*/` **terminates the block comment early** → Vite SWC transform **500** → dynamic import `Recruitment.tsx` fails → **blank whitescreen** on `/hr/recruitment` | **dev-fe** |

**Vite error (excerpt):**
```text
Expected ';', '}' or <eof>
JobTemplatesTab.tsx:81
What: … Phát hành → POST …/publish;
soft-retire … toast PUB-*/CODE-DUP/YCTD-STATUS via toErrorMessage
```

**Console / pageerror:**
- `Failed to fetch dynamically imported module: …/Recruitment.tsx`
- React error boundary on `PermissionRoute` → Lazy Recruitment

**Screenshot:** `01-jd-library.png` = blank white (no Thư viện JD chrome).

**Fix hint (FE):** escape comment text — e.g. `PUB-* / CODE-DUP` (space) or `PUB-*\/CODE-DUP` — **do not** leave `*/` inside `/** … */`.

---

### Journey / AC matrix

| ID | Verdict | Evidence |
|----|---------|----------|
| **J-HRM-REC-JD-00-01** | 🔴 **FAIL** | No GET `/recruitment/job-templates` from browser · precision/filter/chips not mounted · F5 N/A |
| **AC-REC-JD-00-01** | 🔴 FAIL | same |
| **J-HRM-REC-JD-00-02** | 🔴 **FAIL** | Cannot Thêm / Lưu nháp / Phát hành — page not mounted |
| **AC-REC-JD-00-02 / P04** | 🔴 FAIL | no POST create |
| **AC-REC-JD-00-03** | 🔴 FAIL | publish btn missing (page down) |
| **AC-REC-JD-00-P01/P02** | ⬜ SKIP / blocked | need UI Phát hành |
| **AC-REC-JD-00-P05** | 🔴 FAIL | no FE create → no 409 CODE-DUP toast path |
| **J-HRM-REC-JD-00-03** | 🟡 **PASS (L1 smoke only)** | bindable active-only API OK; YCTD create UI not opened (`create_btn_missing` — Recruitment down). **Not** promoted as full U65 UF |
| **AC-REC-JD-00-04** | 🟡 PASS L1-only | same caveat |
| **AC-REC-JD-00-EX-05** | ⬜ SKIP | no draft id from FE |
| **J-HRM-REC-JD-00-04** | ⬜ **BLOCKED_DATA** | no Hiệu lực row via FE this run |
| **AC-REC-JD-00-05 / P03** | ⬜ BLOCKED_DATA | depends on publish path |

**Network path O1:** browser never reached job-templates (mount fail). L1 Nest `/rec` = 404 DENY held.

---

## Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
C-SLICE ≠ module REC UAT
U65 zero-seed
Nest /rec dual DENY
boolean-only UI PASS DENY
no claim recruitment_uat / jd_dynamic_done
```

---

## completion_report

- **Closed:** L0 PASS; BE-01 **LIVE sealed** after rebuild/restart (`status` on list + POST `/publish` mapped); Nest `/rec` 404; bindable active-only L1; browser runner + evidence authored; **root-cause isolated** to FE CODE-MEMORY `*/` break.
- **Residual P0:** **R-REC-00-FE-COMMENT-ASTERISK** — JobTemplatesTab whitescreen → all J-HRM-REC-JD-00-01/02/04 browser UF blocked.
- **Residual follow:** After FE fix → **re-dispatch QA-02** same mission (chips · Lưu nháp · publish · CODE-DUP · Ngừng · YCTD STATUS toast).
- **DENY held:** no seed · no honesty flip · no module REC UAT claim.

| Field | Value |
|-------|--------|
| **ack_status** | **FAIL_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-qa-01.md` |
| **next_owner** | **dev-fe** |
| **next_work_item_id** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-FE-02` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-00-CLUSTER-FE-02
lane: execution · dev-fe · U65
uc_ids: UC-BP-REC-00
depends_on: QA-01 FAIL R-REC-00-FE-COMMENT-ASTERISK · docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-qa-01.md
entry: Vite 500 on JobTemplatesTab.tsx line ~81 CODE-MEMORY «PUB-*/CODE-DUP» closes block comment → Recruitment whitescreen
MISSION: FIX comment only (or minimal) so `*/` does not terminate /**/; verify Vite GET JobTemplatesTab.tsx HTTP 200; /hr/recruitment?tab=jd-library mounts rec-jd-library-tab-precision; RETAIN chips/publish/Ngừng wire from FE-01; DENY honesty flip · /rec dual · seed · rewrite W1–W4
exit: evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-fe-02.md · READY_FOR_QA
then: PM Task qa PO-HRM-MVP-GD1-REC-00-CLUSTER-QA-02 same J-HRM-REC-JD-00-01..04 mission
```
