# QC Gate Decision — QC-HRM-CO-INDUSTRY-01 (2026-07-27)

| Field | Value |
|-------|--------|
| **work_item_id** | `QC-HRM-CO-INDUSTRY-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **execution_date** | `2026-07-27` |
| **decision** | **GO WITH CONDITIONS** |
| **slice** | Company Management «Ngành nghề» display — **local** `:5173` / `:28001` / `:28002` only |
| **qa_handoff** | `docs/qa/evidence/qa-hrm-co-industry-01-20260727.md` (**PASS** / `PASS_TO_PM`) |
| **be_note** | `docs/qa/evidence/be-hrm-co-industry-01-20260727.md` (`business_lines` on `group-member-units`) |
| **persona** | `ceo@xe.vn` · `companyId=main` |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed · no seed in evidence chain |
| **HOLD_DEPLOY** | **YES** — local slice only |
| **Phase1 / PROD / :8088** | **NONE** — **NOT Phase 1 DONE** · **NOT PROD-READY** · **NOT :8088 promote** |

---

## 1. Scope audited

Defect class under gate: FE bound «Ngành nghề» ← `entity_type` (`subsidiary` / `holding`). Contract lock: industry ← `business_lines` (fallback payload industry fields); empty → `-` / `—`.

**In scope (local):**
- `AC-CO-IND-01..04` live browser on `/command-center/hrm/company`
- Headcount regression (`AC-CO-EMP-REG`) card `1109` + row counts
- `J-HRM-CO-01` list → detail/back in same wave
- Design artifacts: TECHSPEC §20 · `DB_DESIGN_HRM_COMPANY_DISPLAY` · `API_DESIGN_HRM_COMPANY_LIST`

**Explicitly not approved:** Phase 1 program DONE · PROD-READY · `:8088` / nip.io promote · matrix Dev8088 column · full HRM UAT · claim that live DB now has populated industry labels.

---

## 2. Evidence pack gate

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qa-hrm-co-industry-01-20260727.md
→ PASS: QC evidence pack ready (8/8)
```

| Check | Result |
|-------|--------|
| Pack integrity | **8/8 PASS** |
| QA MD readable | Yes |
| Screenshots | `qa-hrm-co-industry-01-company-20260727.png` · `qa-hrm-co-industry-01-f5-20260727.png` present |
| Runtime JSON | `qa-hrm-co-industry-01-runtime-20260727.json` — `leakRowsInitial=[]` · `leakRowsAfterF5=[]` |
| L0 spot (`qc:dev-stack`) | HRM/XBOS/portal **HTTP 200** (Windows Node UV assert after success log — **ENV noise**, not product FAIL) |

---

## 3. Design / governance existence (U71)

| Artifact | Path | QC |
|----------|------|----|
| TECHSPEC §20 | `docs/hrm/TECHSPEC.md` §20 «Ngành nghề» vs `entity_type` | **Present** — invariant + forbidden bind |
| DB_DESIGN | `docs/hrm/DB_DESIGN_HRM_COMPANY_DISPLAY.md` | **Present** — `business_lines` SoT; `entity_type` ≠ industry |
| API_DESIGN | `docs/hrm/API_DESIGN_HRM_COMPANY_LIST.md` | **Present** — Mục đích + Nghiệp vụ + Bước SRS UC-HRM-CO-01 |
| BA AC | `AC-CO-IND` / `ba-hrm-co-industry-01-20260727.md` | Cited by QA |
| BE READY | `be-hrm-co-industry-01-20260727.md` | `le.business_lines` in `listGroupMemberUnits` + jest PASS |

**Note:** `API_DESIGN` §1 still documents historical residual «SELECT omits `business_lines`». BE evidence + code now ADD `le.business_lines` — treat API_DESIGN residual as **stale wording** (SA sync condition), not product NO-GO for this gate.

---

## 4. Product audit (QC corroboration)

### 4.1 AC matrix

| AC / Journey | QA | QC corroboration | Verdict |
|--------------|----|------------------|---------|
| **AC-CO-IND-01** no raw `subsidiary`/`holding` in «Ngành nghề» | PASS | Screenshots + runtime: 5/5 `-`; leaks `[]` | **PASS** |
| **AC-CO-IND-02** empty SoT → `-` | PASS | All rows `-` load + F5 | **PASS** |
| **AC-CO-IND-03** non-empty `business_lines` → VI | PASS (not exercised) | Live SoT null/`business_lines` absent on visible rows | **PASS (deferred path)** — condition |
| **AC-CO-IND-04** F5 no re-leak | PASS | F5 screenshot identical; leaks `[]` | **PASS** |
| **AC-CO-EMP-REG** headcount not zero | PASS | Card **1109**; rows **229/220/220/220/220** | **PASS** |
| **J-HRM-CO-01** list→detail/back | PASS | Same-wave detail evidence cited | **PASS** (this slice) |

### 4.2 Classification

| Signal | Class | Action |
|--------|-------|--------|
| Raw `entity_type` in industry column | PRODUCT | **CLOSED** (UI shows `-`, not subsidiary/holding) |
| Empty industry labels on live pilot data | PRODUCT / data | **Honest empty** — AC-CO-IND-02 OK; not a FAIL |
| `qc:dev-stack` UV assert after 200 | ENV | Ignore for product gate |
| OpenAPI thin schema for `business_lines` | PROCESS / doc | Condition — SA/BE follow-up |
| `PROGRAM_JOURNEY_MAP` `J-HRM-CO-01` still ⏳ OPEN | PROCESS | PM should flip to PASS for industry+headcount local after this GWC |

---

## 5. L2.5 journey coverage (U19)

| J-* | In-scope this gate? | Status |
|-----|---------------------|--------|
| **J-HRM-CO-01** | Yes (industry + headcount regression + detail/back) | **PASS** (QA wave + QC screenshot/runtime) |
| Other HRM/CC J-* | No | Deferred — out of slice |

**GO WITH CONDITIONS** lists: **J-HRM-CO-01 PASS**; no other mandatory J-* claimed.

---

## 6. Conditions (bounded)

| ID | Condition | Owner | Expiry / trigger |
|----|-----------|-------|------------------|
| **C-CO-IND-LOCAL-01** | Slice **local only** · **HOLD_DEPLOY** · **NOT** Phase1 / PROD / `:8088` | PM | Until explicit sponsor promote wave |
| **C-CO-IND-03-LIVE** | AC-CO-IND-03 VI path **not exercised** with non-empty live `business_lines` | QA (when data exists) or BA/ops data | Re-open only if industry populated and UI wrong |
| **C-CO-IND-OAPI-01** | OpenAPI / API_DESIGN residual wording vs BE SELECT | SA / BE | Doc sync; not product reopen |
| **C-CO-IND-JMAP-01** | Update `PROGRAM_JOURNEY_MAP` `J-HRM-CO-01` from ⏳ → PASS (local industry+headcount) | PM | Same session preferred |

**Residual risk:** Member CEO / `:8088` / populated-industry VI map **untested** in this gate.

---

## 7. Decision

### **GO WITH CONDITIONS**

- Defect class «Ngành nghề ← `entity_type`» **CLOSED** on local Company Management.
- Headcount regression **OK** (1109 / 229+220×4).
- Design docs **exist** (TECHSPEC §20 + DB_DESIGN + API_DESIGN).
- Evidence pack **8/8**; screenshots + runtime corroborate QA.
- **HOLD_DEPLOY** · **NOT Phase 1 DONE** · **NOT PROD** · **NOT :8088**.

No Dev-FE / Dev-BE reopen for this defect class unless AC-CO-IND-03 live path regresses or raw tokens reappear.

---

## 8. Handoff

### completion_report

- **Closed:** QC gate for `QC-HRM-CO-INDUSTRY-01` — industry display slice local GWC; no raw subsidiary/holding; empty→`-`; F5 stable; headcount regression PASS; J-HRM-CO-01 PASS; U71 design docs present; pack 8/8.
- **Residual / conditions:** HOLD_DEPLOY local-only; AC-CO-IND-03 not live-exercised; OpenAPI/API_DESIGN wording sync; journey map row still ⏳ until PM updates.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PM-HRM-CO-INDUSTRY-CLOSE-01
from_role: qc
to_role: pm
entry: QC-HRM-CO-INDUSTRY-01 GO WITH CONDITIONS — docs/qa/evidence/qc-hrm-co-industry-01-20260727.md
actions:
1) Bus INTAKE + mark industry entity_type leak CLOSED (local)
2) Update PROGRAM_JOURNEY_MAP J-HRM-CO-01 → PASS (local industry+headcount; cite QA+QC evidence)
3) HOLD_DEPLOY — do NOT promote :8088 / Phase1 / PROD from this slice
4) Optional residual_auto_fix (non-blocking): SA sync API_DESIGN §1 residual wording now that BE SELECT includes business_lines; OpenAPI field note
5) Do NOT reopen Dev for empty «-» industry when SoT null
ack_status: PASS_TO_PM
```

### evidence_path

`docs/qa/evidence/qc-hrm-co-industry-01-20260727.md`

### ack_status

**PASS_TO_PM**
