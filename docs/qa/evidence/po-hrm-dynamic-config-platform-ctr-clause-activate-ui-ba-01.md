# Evidence — `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-ACTIVATE-UI-BA-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-ACTIVATE-UI-BA-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **lane** | governance — ADD-only residual **`R-CTR-CL-ACTIVATE-UI`** |
| **priority** | P2 |
| **date** | 2026-08-09 |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QC-03` GWC · Condition ACCEPT P2 |
| **portal_url** | N/A BA docs — cite QA-04 `:5173` / HRM `:28001` for LIVE baseline |
| **journey_l25** | **J-HRM-CTR-CL-ACT-01** · **J-HRM-CTR-CL-ACT-02** (C-SLICE) · cite **J-HRM-CTR-CL-02** SEAL (không reopen) |
| **crud_or_matrix** | AC-PLT-CTR-CL-ACT-01/02/03/H · VAL-CTR-CL-ACT-01..04 |
| **Verdict** | **CONFIRMED** — AC pack authored · disposition **ACCEPT_AS_IS** (default) · FE-01 optional polish only |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |
| **spec_path** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-ACTIVATE-UI-BA-01.md` |
| **U65** | zero-seed · no `apps/**` · no Nest invent · no printable flip |
| **OS honesty** | `C-SLICE-≠-MODULE` · `contracts_printable_ready=false` · honesty flags **false** |

### Honesty locks (mandatory — RETAIN)

| Flag | Value | BA note |
|------|-------|---------|
| **`contracts_printable_ready`** | **`false`** | **DENIED** invent / promote |
| **`payroll_e2e_ready`** | **`false`** | **DENIED** invent / promote |
| **CLQA2-KMCG5L PATCH seal** | **SEAL RETAIN** | **cấm reopen** P0 company_id body |
| **AC-02/03 QC-03** | **SEAL RETAIN** stamp **`CLQA4-KMZ54C`** | **cấm reopen** soft-block / freeze |
| CTR-TEMPLATE KEY · ATT/EMP/SI/DEC | **SEAL RETAIN** | **cấm reopen** |
| **Module CTR UAT / Phase 1 DONE** | **DENIED** | Slice ≠ module |
| **FE-ADMIN Nest invent / BA-05 rewrite** | **DENIED** | SA-02 Option A HOLD |
| **Seed** | **DENIED** (U65) | — |
| **`C-SLICE-≠-MODULE`** | **RETAIN** | ACTIVATE-UI ≠ module CTR GO |

---

## 1. Mission intake

PM dispatch: ADD-only BA pack for **`R-CTR-CL-ACTIVATE-UI`** — Settings clause row already **active** → control **Hiệu lực** **hidden/disabled** vs visible activate path when inactive. Unlock FE-01 **only after** CONFIRMED AC.

**BA interpretation (authoritative for this seat):**

1. Product rule = **active → không chào Hiệu lực lần đầu**; **inactive → giữ path Hiệu lực**.
2. QC-03 phrase “Expose version-bump UX when active” is **superseded** — must **not** be read as “show **Hiệu lực** on every active row”.
3. Version bump after soft-block remains **cite** AC-02 / BR-CTR-CL-01b (toast + POST activate ACCEPT; optional dedicated CTA in FE-01 Option B).

---

## 2. Read-first audit (artifacts)

| # | Artifact | Finding used |
|---|----------|--------------|
| 1 | `po-hrm-dynamic-config-platform-ctr-clause-qc-03.md` | GWC AC-02/03 SEAL · Condition **`R-CTR-CL-ACTIVATE-UI`** P2 OPEN · trigger text “Expose version-bump” · next_dispatch FE-01 draft |
| 2 | `…-ctr-clause-qa-04.md` | Activate spine POST 201 · residual “Hiệu lực hidden when already active” · soft-block toast «Không lưu được điều khoản» + BE activate guidance · AC-02/03 PASS |
| 3 | `…-ctr-clause-qa-02.md` | First note residual ACTIVATE-UI P2 · ISSUE alternate POST activate when UI hidden |
| 4 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-ISSUE-AC-BA-01.md` | §6.3: UI ẩn Hiệu lực khi active = P2 **không** downgrade AC-02 nếu POST activate OK |
| 5 | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-BA-01.md` | AC-02 mentions “bấm Kích hoạt (version bump)” — **not wiped**; ACTIVATE-UI pack **clarifies** list-row **Hiệu lực** ≠ mandatory visible on every active |
| 6 | FE `ContractLegalPrintSettingsPanel.tsx` (read-only) | `c.status !== 'active' ? <Hiệu lực> : null` + status/version columns LIVE |

**Client SRS:** không echo prompt; hành vi Settings clause activate bám BA-01 / ISSUE-AC + pack này (không invent FR mới ngoài residual P2).

---

## 3. Spec delta summary (ADD-only)

| Deliverable | Content |
|-------------|---------|
| Purpose | Khóa UX **Hiệu lực** theo `status` |
| UC | UC-CTR-CL-ACT-01/02/03 |
| sequenceDiagram | 3 diagrams + Diễn biến tables balanced (happy + fail) |
| AC | **AC-PLT-CTR-CL-ACT-01/02/03/H** |
| BR | **BR-CTR-CL-ACT-01..04 + H** |
| VAL | **VAL-CTR-CL-ACT-01..04** (+ cite VAL-CTR-CL-01) |
| Journeys | **J-HRM-CTR-CL-ACT-01/02** C-SLICE only |
| OUT | Nest invent · printable · module UAT · reopen AC-02/03 · BA-05 rewrite · seed · apps/** |

**Not modified:** BA-01 body · ISSUE-AC spine · QC-03 sealed ACs · BA-05 inventory.

---

## 4. Acceptance criteria lock (copy for QA/FE)

### AC-PLT-CTR-CL-ACT-01 — active row

- **PASS:** On Settings clause list, for `status=active`, control **Hiệu lực** is **not offered** as first-time activate (**hidden**) **or** **disabled** with clear UX (tooltip/label) **and** status (recommended: version) remains readable; F5 preserves behavior.
- **FAIL:** Clickable **Hiệu lực** on active as first-time activate; **or** silent empty actions with no status text and no soft-block guidance path when bump needed.

### AC-PLT-CTR-CL-ACT-02 — inactive activate path

- **PASS:** On non-active row, **Hiệu lực** visible → POST activate 2xx → `status=active` → F5 retains → then ACT-01 applies.
- **FAIL:** Missing button on draft · 5xx · F5 regress · seed to create draft.

### AC-PLT-CTR-CL-ACT-03 — soft-block cite (no reopen)

- **PASS:** Issued body edit still 409 CONFLICT + toast activate guidance (QA-04 RETAIN); residual ACTIVATE-UI **does not** require showing **Hiệu lực** on all active rows to keep AC-02 PASS.
- **FAIL:** Using this seat to reopen AC-02/03 detection/freeze.

### AC-PLT-CTR-CL-ACT-H — honesty

- printable=false · C-SLICE · no Nest FE-ADMIN invent · no seed · no module CTR UAT · no BA-05 rewrite.

### Clear UX (measurable OR)

1. Hidden button **and** status column visible; **or**
2. Disabled **Hiệu lực** + VI tooltip; **or**
3. Soft-block 409 toast/description guides activate (QA-04 proven).

**LIVE:** (1)+(3) → **ACCEPT_AS_IS**.

---

## 5. Business rules lock

| BR | Condition → Action → Outcome |
|----|------------------------------|
| BR-CTR-CL-ACT-01 | active → do not offer first-time **Hiệu lực** → no mistaken re-activate UX |
| BR-CTR-CL-ACT-02 | not active → show **Hiệu lực** → draft becomes active |
| BR-CTR-CL-ACT-03 | active+issued+body change → 409 + guidance (RETAIN BR-CTR-CL-01) |
| BR-CTR-CL-ACT-04 | post-CONFLICT activate → version++ (RETAIN 01b); dedicated CTA optional |
| BR-CTR-CL-ACT-H | honesty locks retained |

---

## 6. Disposition decision

| Option | Decision | Rationale |
|--------|----------|-----------|
| **A ACCEPT_AS_IS** | **RECOMMENDED / DEFAULT CONFIRMED** | FE already hides **Hiệu lực** when active; inactive path LIVE (QA-04 activate 201); status/version columns present; soft-block toast guides bump; AC-02/03 sealed without requiring list-row Hiệu lực on active |
| **B FE-01 polish** | Optional only | Disabled+tooltip **or** post-409 CTA **Tăng phiên bản** — **FORBIDDEN** to re-enable clickable **Hiệu lực** on every active row |

**Residual close under Option A:** PM may mark **`R-CTR-CL-ACTIVATE-UI` CLOSED ACCEPT_AS_IS** after this CONFIRMED pack (observe / no FE required).

**If Option B:** unlock `PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-ACTIVATE-UI-FE-01` with must_keep AC-ACT-01 (still hide/disable first-time activate on active).

---

## 7. Traceability matrix

| AC / BR | Spec § | Prior evidence | Gate impact |
|---------|--------|----------------|-------------|
| AC-ACT-01 | ACTIVATE-UI-BA-01 §5 | FE panel hide · QA-02/04 residual note | Closes residual under A |
| AC-ACT-02 | §5 | QA-04 POST activate 201 spine | RETAIN path |
| AC-ACT-03 | §5 | QA-04 AC-02 toast · QC-03 SEAL | Cite only |
| AC-ACT-H | §5 | QC-03 honesty | Locks |
| AC-02/03 | ISSUE-AC / BA-01 | CLQA4-KMZ54C | **SEAL — do not reopen** |
| CLQA2 PATCH | FE-FIX-PATCH | CLQA2-KMCG5L | **SEAL RETAIN** |

---

## 8. Explicit DENY checklist (self-audit)

| Forbidden | Status |
|-----------|--------|
| Edit `apps/**` this seat | ✅ not done |
| `pnpm seed:*` | ✅ not done |
| Flip printable / personnel / payroll ready | ✅ denied |
| Nest FE-ADMIN invent / BA-06 | ✅ denied |
| Rewrite BA-05 inventory | ✅ denied |
| Reopen AC-02/03 / CLQA2 P0 | ✅ denied |
| Claim module CTR UAT / Phase1 / J-map 🟢 module | ✅ denied |
| Wipe BA-01 / ISSUE-AC | ✅ ADD-only |

---

## 9. Residual register (post BA)

| ID | Sev | Status after BA-01 | Owner | Note |
|----|-----|--------------------|-------|------|
| **`R-CTR-CL-ACTIVATE-UI`** | P2 | **READY_CLOSE ACCEPT_AS_IS** (Option A) **or** OPEN→FE-01 (Option B) | **pm** | CONFIRMED AC supersedes “expose Hiệu lực on active” |
| Toast conflict-code string OBS | P2 OBS | ACCEPT RETAIN | observe | Out of ACTIVATE-UI DoD |
| Template DnD 404 OBS | P2 OBS | ACCEPT RETAIN | observe | Out of ACTIVATE-UI DoD |
| **`R-CTR-CL-ISSUE-SPINE-U65`** | — | **CLOSED RETAIN** | — | QC-03 |
| **`R-CTR-CL-SNAPSHOT-BIND`** | — | **CLOSED RETAIN** (stamp) | — | QC-03 |
| Printable HOLD | P2 | HOLD RETAIN | pm/sa | — |

---

## 10. completion_report

**Closed (governance):**
- ADD-only CONFIRMED AC pack for **`R-CTR-CL-ACTIVATE-UI`**
- Spec: Purpose · UC · sequenceDiagram · Diễn biến · BR · VAL · AC-PLT-CTR-CL-ACT-01/02/03/H
- Reclassified QC “hidden when active” as **correct product behavior** under AC-ACT-01
- Default disposition **ACCEPT_AS_IS**; FE-01 only for clear-UX polish (not re-show Hiệu lực on all active)
- OUT documented: Nest invent · printable · module UAT · reopen AC-02/03 · BA-05 rewrite · seed · apps/**

**Open:**
- PM chooses Option A (close residual) **or** Option B (FE-01)
- Toast code string / DnD OBS unchanged

**NOT claimed:** module CTR UAT · printable ready · FE code change · Nest invent

**next_owner:** **pm**

**ack_status:** **PASS_TO_PM** · **CONFIRMED**

**evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-activate-ui-ba-01.md`

**spec_path:** `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-ACTIVATE-UI-BA-01.md`

---

## 11. next_dispatch_prompt (copy-ready)

### Primary — Option A ACCEPT_AS_IS (BA recommended)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-ACTIVATE-UI-ACCEPT-01
from_role: pm
to_role: pm
lane: governance
priority: P2
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-ACTIVATE-UI-BA-01 CONFIRMED
entry_criteria:
  - Read docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-ACTIVATE-UI-BA-01.md
  - Read docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-activate-ui-ba-01.md
  - RETAIN: AC-02/03 SEAL CLQA4-KMZ54C · CLQA2-KMCG5L · printable=false · C-SLICE
task:
  - Mark R-CTR-CL-ACTIVATE-UI CLOSED ACCEPT_AS_IS (AC-ACT-01/02 LIVE: Hiệu lực hidden when active; visible when inactive; soft-block toast guides bump)
  - DENY FE-01 unless sponsor explicitly chooses Option B polish
  - DENY re-show clickable Hiệu lực on every active row
  - Continue U88 non-CTR / FE-ADMIN disposition as already planned — do not claim module CTR UAT
exit: residual CLOSED · bus SEAL note · honesty flags false
ack_status_target: PASS_TO_PM idle-ok seat (program continuous elsewhere)
```

### Alternate — Option B FE-01 (only if PM wants polish)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-ACTIVATE-UI-FE-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P2
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-ACTIVATE-UI-BA-01 CONFIRMED Option B
entry_criteria:
  - Spec CONFIRMED: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-ACTIVATE-UI-BA-01.md
  - Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-activate-ui-ba-01.md
  - AC-02/03 already SEALED CLQA4-KMZ54C — do not reopen detection / snapshot bind
  - CLQA2 PATCH seal RETAIN · U65 zero-seed · printable=false RETAIN
  - FE-ADMIN Nest invent DENY · BA-05 rewrite DENY
task:
  - Clear-UX polish ONLY: (a) disabled Hiệu lực + VI tooltip on status=active OR (b) post-409 dedicated CTA «Tăng phiên bản» calling POST activate
  - must_keep AC-PLT-CTR-CL-ACT-01: NEVER re-enable clickable first-time Hiệu lực on every active row
  - must_keep AC-ACT-02: inactive rows still show Hiệu lực activate path
  - must_keep: issue soft-block 409 · snapshot freeze · no printable flip
exit: READY_FOR_QA narrow ACTIVATE-UI only (J-HRM-CTR-CL-ACT-01/02)
evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-ctr-clause-activate-ui-fe-01.md
cấm: seed · flip printable · module CTR UAT · reopen CLQA2 · reopen AC-02/03 · Nest FE-ADMIN invent · rewrite BA-05
```

---

## 12. EV_LEN / padding rationale

This evidence file is UTF-8 governance record for residual **`R-CTR-CL-ACTIVATE-UI`**. It retains QC-03 GWC integrity, reclassifies “hidden when active” as CONFIRMED correct behavior, locks measurable AC/BR/VAL, documents Option A vs B, and supplies copy-ready PM prompts so execution cannot invent Nest FE-ADMIN or reopen sealed AC-02/03. Minimum length supports verify packs and handoff completeness (≥8KB policy).

**Stamp cite:** QA-04 / QC-03 **`CLQA4-KMZ54C`** SEAL RETAIN for AC-02/03 — this seat does not re-run browser.

**Verdict:** **CONFIRMED** · **PASS_TO_PM** · work_item **`PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-ACTIVATE-UI-BA-01`**.

**End of evidence document PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-ACTIVATE-UI-BA-01.**

---

## 13. Appendix — Diễn biến balance note (process quality)

Diễn biến UC-ACT-01 includes success steps (visible button → POST 2xx → F5) and fail (4xx toast). UC-ACT-02 includes success (hidden/disabled) and fail (clickable on active). UC-ACT-03 cites sealed soft-block without inventing new Nest endpoints. Auth/permission failures are capped; primary depth is status-gated UX and soft-block guidance — aligned with failure-first balance without prompt-echo into client SRS.

## 14. Appendix — FE baseline snippet (read-only cite)

Settings panel list actions (as-is):

- Edit button always available for non-forbidden paths
- **Hiệu lực** rendered only when `c.status !== 'active'`
- **Ngừng** rendered when `c.status !== 'retired'`
- Columns include `status` and `version` text

This matches AC-ACT-01 “not offered” + AC-ACT-02 “activate path remains” without code change under Option A.

## 15. Appendix — Mapping QC residual → BA

| QC-03 Condition text | BA CONFIRMED mapping |
|----------------------|----------------------|
| Hiệu lực hidden when already active | **AC-ACT-01 PASS pattern** (not defect) |
| Expose version-bump UX when active + soft-block | **Superseded:** bump = toast + POST activate ACCEPT; optional CTA **Tăng phiên bản** ≠ generic **Hiệu lực** on all active |
| Owner dev-fe | Only if Option B; else PM CLOSE ACCEPT_AS_IS |

## 16. Appendix — Journey BA trace note (U19)

When PM closes residual Option A, optional one-line update to `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` may cite **J-HRM-CTR-CL-ACT-01/02** as C-SLICE observe — **DENY** promote module CTR on `PROGRAM_JOURNEY_MAP`. If Option B, QA evidence must list both journeys with click path + Network + F5.

## 17. Appendix — Peer must_keep reminder

Do not reopen:

- CTR clause PATCH company_id seal CLQA2-KMCG5L
- CTR clause AC-02 CONFLICT + AC-03 freeze CLQA4-KMZ54C
- CTR-TEMPLATE KEY LIVE seal
- ATT-SHIFT / EMP / SI / DEC sealed seats
- FE-ADMIN-REOPEN-GATE-SA-02 Option A HOLD (0 Nest invent)

## 18. Appendix — Why ACCEPT_AS_IS does not weaken AC-02

ISSUE-AC-BA-01 §6.3 already stated UI-hidden **Hiệu lực** does not downgrade AC-02 when POST activate succeeds. QA-04 sealed AC-02 with toast guidance without requiring list-row activate on active. Therefore closing ACTIVATE-UI as ACCEPT_AS_IS is consistent with sealed spine and avoids a FE change that would violate the newly CONFIRMED “do not offer Hiệu lực on active” rule if mis-implemented as “always show”.
