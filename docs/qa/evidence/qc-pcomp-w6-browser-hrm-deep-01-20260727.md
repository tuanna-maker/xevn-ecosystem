# QC Gate — QC-PCOMP-W6-BROWSER-HRM-DEEP-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-PCOMP-W6-BROWSER-HRM-DEEP-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **lane** | governance |
| **date** | `2026-07-27` |
| **environment** | Local portal `http://127.0.0.1:5173/hr` · hrm-api `:28001` **dist-uat-w6** · xbos `:28002` |
| **portal_url** | `http://127.0.0.1:5173` · `PORTAL_DEV_URL=http://127.0.0.1:5173` |
| **persona** | Group CEO `ceo@xe.vn` · `companyId=main` · `tenantId=xevn` |
| **decision** | **GO WITH CONDITIONS** — bounded W6 deep HRM browser P0 + leave create CLOSED |
| **scope_claim** | UF-HRM-01/03/10/12 + J-HRM-01/03/06 + leave-request create UF (cite supersede) only |
| **phase1_done_claim** | **NO** — **NOT Phase 1 DONE** |
| **prod_ready_claim** | **NO** — **NOT PROD-READY** · **HOLD_DEPLOY** · **NOT** `:8088` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — browser-only; no seed in QA/QC chain |
| **U70** | cấm deploy before sponsor confirm |

---

## Scope (bounded)

| In scope | Explicitly out |
|----------|----------------|
| Audit QA deep pack P0 UF/J on `:5173` + `dist-uat-w6` | Phase 1 DONE · `phase1:gate --strict` |
| Cite leave create **superseded CLOSED** (§7 201+F5) | PROD-READY · portal.xe.vn · U70 deploy |
| L2.5 J-HRM-01 / 03 / 06 in-scope PASS | Full Wave 2 UF-HRM-09/11/13… 11/11 |
| HOLD_DEPLOY / U65 / NOT `:8088` matrix rewrite | FE slug prefer P1 (optional; GWC without wait) |

---

## Evidence chain audited

| Artifact | Role | Signal |
|----------|------|--------|
| `docs/qa/evidence/qa-pcomp-w6-browser-hrm-deep-01-20260727.md` | QA primary | Deep P0 PASS_TO_PM · UF-01/03/10/12 🟢 · J-01/03/06 🟢 · Leave 🟡 **at time of deep** |
| `docs/qa/evidence/_tmp-qa-pcomp-w6-browser-hrm-deep-01-runtime.json` | Runtime | hardFail none · PATCH 200 · GET detail 200 · leave list 200 · LEAVE-CREATE BLOCKED cite |
| `docs/qa/evidence/screens/qa-pcomp-w6-browser-hrm-deep-01/` | Screens | **13 PNG** (list/detail/edit/F5/contracts/att/settings/rec) |
| `docs/qa/evidence/qa-hrm-leave-req-create-01-20260727.md` §7 | QA leave retest | **PASS** — POST **201** `HRM-LEAVE-201` · F5 list row · **supersedes** deep 🟡 |
| `docs/qa/evidence/_tmp-qa-hrm-leave-req-create-01-f5.png` | Leave F5 | Danh sách yêu cầu · PORTAL-GCEO / Phép năm / Chờ duyệt |
| `docs/qa/evidence/qa-hrm-settings-md-pos-browser-01-20260727.md` | Cite POS | UF-HRM-10 spot + prior POST **201** GWC |
| `docs/program/PROGRAM_JOURNEY_MAP.md` | Journey SoT | J-HRM-01 / 03 / 06 mandatory rows already ✅; this WI corroborates local W6 deep |
| PM dispatch | Entry | Leave 🟡 superseded CLOSED — **do not reopen** as blocker · FE slug in-flight OK |

---

## Evidence pack gate (Layer B)

### Command table

| # | Command | Result | Classification |
|---|---------|--------|----------------|
| 1 | `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-pcomp-w6-browser-hrm-deep-01-20260727.md` | **PASS** exit **0** (8/8) | PROCESS OK — primary QA pack |
| 2 | `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-leave-req-create-01-20260727.md` | **FAIL** exit **1** (1/8) `residual_section` heading name | **PROCESS P3** — substance §5/§7.3 Residuals + §7 PASS complete; format-only; **not** product NO-GO |
| 3 | `pnpm run qc:dev-stack` | ✓ hrm `:28001` · ✓ xbos `:28002` · ✓ portal `:5173` (UV abort noise after ✓ probes) | **ENV** P3 Windows flake — stack healthy |
| 4 | QC spot-read runtime JSON + 13 screens + leave F5 PNG | Corroborates UF/J PASS + leave 201 CLOSED | PRODUCT OK |
| 5 | Seed | **none** | U65 PASS |

**Portal URL:** `http://127.0.0.1:5173` · HRM embed `/hr` · `dist-uat-w6` freeze.

**QC adjudication:** Primary deep pack Layer B **8/8 PASS**. Leave pack format residual ≠ product reopen. Leave create P0 **CLOSED** by §7 retest — deep-report 🟡 **superseded**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC finding |
|--------|------|------------|
| UF-HRM-01 / J-HRM-01 list→detail GET **200** | PRODUCT | **PASS** |
| UF-HRM-03 edit→PATCH **200**→F5 persist `W6QA` | PRODUCT | **PASS** |
| UF-HRM-10 Settings Chức danh form + catalog GET **200** (+ cite POS 201) | PRODUCT | **PASS** (bounded spot) |
| UF-HRM-12 requisition Chi tiết GET **200** | PRODUCT | **PASS** |
| J-HRM-03 contracts → Chi tiết dialog | PRODUCT | **PASS** |
| J-HRM-06 attendance + leave list GET **200** | PRODUCT | **PASS** (load) |
| Leave create deep 🟡 `HRM-ATT-LEAVE-TYPE` | PRODUCT | **CLOSED** — superseded by leave §7 **201** + F5 |
| FE POST `company_id` UUID vs slug prefer | PRODUCT P1 optional | **Condition OK** — GWC without waiting (UF already 201) |
| `qc:dev-stack` UV abort after ✓ | ENV P3 | Condition OK |
| Employee `W6QA` marker leftover | ENV/data P3 | Soft hygiene — not blocker |
| Leave pack verify residual_section | PROCESS P3 | Format-only |
| Phase1 / PROD / `:8088` / U70 deploy | OUT OF SLICE | **NOT claimed** · HOLD_DEPLOY |

---

## journey_l25 (in-scope)

| J-ID | Result | Evidence | Promotable this gate |
|------|--------|----------|----------------------|
| **J-HRM-01** | **PASS** | Deep: employees row click → `/employees/{id}` · GET detail **200** · screen `02-employee-detail.png` | Yes (local W6 deep) |
| **J-HRM-03** | **PASS** | Deep: contracts → dialog **Chi tiết hợp đồng** `HLD-0006-HD` | Yes |
| **J-HRM-06** | **PASS** | Deep: attendance + leave list **200**; leave **mutate** promoted via leave §7 **201**+F5 (not deep-only load) | Yes (load+create cite) |

**Deferred / out of this gate:** Full Wave 2 remaining UF; J-* outside 01/03/06; member-CEO / mobile.

---

## UF rollup adjudication

| ID | Deep QA | Leave §7 | QC |
|----|---------|----------|-----|
| UF-HRM-01 | 🟢 | — | **PASS** |
| UF-HRM-03 | 🟢 | — | **PASS** |
| UF-HRM-10 | 🟢 spot+cite | — | **PASS** (bounded) |
| UF-HRM-12 | 🟢 | — | **PASS** |
| Leave create | 🟡 at deep | 🟢 **201** `HRM-LEAVE-201` + F5 | **CLOSED** — do **not** reopen P0 |

---

## Conditions (GO WITH CONDITIONS)

| ID | Condition | Owner | Status |
|----|-----------|-------|--------|
| **C-PCOMP-W6-HOLD-DEPLOY** | HOLD_DEPLOY · keep `dist-uat-w6` · cấm U70 deploy / `:8088` rewrite without sponsor confirm | pm / sponsor | **OPEN** (standing) |
| **C-PCOMP-W6-NOT-PHASE1** | Explicit **NOT Phase 1 DONE** · **NOT PROD-READY** | pm | **OPEN** (standing) |
| **C-PCOMP-W6-WAVE2-PARTIAL** | Full Wave 2 11/11 (UF-09/11/13…) not claimed | pm | **OPEN** P2 program |
| **C-PCOMP-W6-FE-SLUG-OPT** | Optional FE prefer POST `company_id` slug `main`/`holding` (P1) — product already maps UUID→`holding` | dev-fe optional | **OPEN** OK — **no wait** for this GWC |
| Leave create P0 | Was deep 🟡 | — | **CLOSED** cite leave §7 |
| Leave pack Layer B format | `## Residual` heading | qa optional hygiene | **OPEN** P3 non-blocking |

---

## Residual

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| HOLD_DEPLOY / sponsor visual SP-01 | P1 program | pm/sponsor | This WI ≠ sponsor UAT-PASS |
| Full Wave 2 remainder | P2 | pm | Out of deep P0 slice |
| FE company_id slug prefer | P1 optional | dev-fe | Not blocking UF 201 |
| W6QA name marker on QA employee | P3 | qa hygiene | Soft |
| Leave evidence `residual_section` regex | P3 process | qa | Rename `## Residuals` → `## Residual` if re-verify needed |
| No residual product P0 in-scope | — | — | Leave CLOSED · deep P0 PASS |

---

## Decision

**GO WITH CONDITIONS** for bounded local W6 HRM deep browser slice (`:5173` + `dist-uat-w6`, U65).

- In-scope UF/J **PASS**; leave create **CLOSED** by later retest (**cite both** QA packs).
- **NOT** Phase 1 DONE · **NOT** PROD · **HOLD_DEPLOY** · **cấm** `:8088` matrix rewrite / U70 deploy before sponsor.
- FE slug smoke may remain in flight — **GWC without waiting**.

---

## Handoff

```yaml
work_item_id: QC-PCOMP-W6-BROWSER-HRM-DEEP-01
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/qc-pcomp-w6-browser-hrm-deep-01-20260727.md
decision: GO WITH CONDITIONS
completion_report: |
  Closed QC gate for W6 deep HRM browser P0 on local :5173 + dist-uat-w6 (U65).
  Primary QA pack verify 8/8 PASS; L0 stack healthy; 13 screens + runtime corroborated.
  PASS: UF-HRM-01/03/10/12 + J-HRM-01/03/06.
  Leave create: deep-report 🟡 superseded CLOSED by qa-hrm-leave-req-create-01 §7
  (POST 201 HRM-LEAVE-201 + F5) — not reopened as blocker.
  Conditions: HOLD_DEPLOY, NOT Phase1/PROD, Wave2 partial, optional FE slug P1 (no wait).
  Cấm: :8088 rewrite · seed · U70 deploy before sponsor.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: PCOMP-W6-SP-01 (or next W6 program item)
  from_role: pm
  to_role: pm (sponsor invite) OR devops/qa as roadmap
  entry: QC-PCOMP-W6-BROWSER-HRM-DEEP-01 GO WITH CONDITIONS
  evidence: docs/qa/evidence/qc-pcomp-w6-browser-hrm-deep-01-20260727.md
  summary: Local deep HRM P0 + leave create CLOSED; HOLD_DEPLOY dist-uat-w6.
  action: Invite sponsor visual/UAT prep PCOMP-W6-SP-01 when ready — do NOT treat as Phase1/PROD.
  optional: D-HRM-LEAVE-REQ-CREATE-FE-01 slug prefer (P1, non-blocking).
  cấm: seed · :8088 matrix rewrite · U70 deploy before sponsor confirm · reopen leave P0.
pm_dispatch_hint: Proceed W6 sponsor prep under HOLD_DEPLOY; leave P0 CLOSED; FE slug optional
```
