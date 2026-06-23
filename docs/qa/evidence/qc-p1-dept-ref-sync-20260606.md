# P1-CC-DEPT-REF-SYNC-QA-01 — U32 local QC gate (D-U31-DEPT-REF-SYNC-01)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-CC-DEPT-REF-SYNC-QA-01` |
| **qc_work_item_id** | `P1-CC-DEPT-REF-SYNC-QC-01` |
| **defect** | `D-U31-DEPT-REF-SYNC-01` (user-reported) |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **qa_evidence_path** | `docs/qa/evidence/p1-dept-ref-sync-qa-20260606.md` |
| **dev_evidence_path** | `docs/qa/evidence/p1-dept-ref-sync-fe-20260606.md` |
| **prior_chain** | `qc-p1-u31-dept-scope-20260606.md` (U31 VPS L2) · user bug `D-U31-DEPT-REF-SYNC-01` |
| **environment** | `http://localhost:5173` **only** (U32 — no VPS / no nip.io) |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **executed_at** | 2026-06-06 |
| **decision** | **GO WITH CONDITIONS** — **D-U31-DEPT-REF-SYNC-01 CLOSED** on local `:5173` slice |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — U32 local ref-tab fix)

| In scope | Out of scope |
|----------|--------------|
| Defect **D-U31-DEPT-REF-SYNC-01**: save `gradeTitleLayout` → **Tham chiếu ORG GRADE** preview | VPS `:8088` / nip.io promotion |
| L2.5 settings cross-view journey (5 QA browser steps) on `:5173` | Full Phase 1 gate (`phase1:gate --strict`) |
| Dev-FE unit regression (`OrgGradeOrgChart.test.tsx`) | HRM embed P-CC-03..08 matrix |
| Static **Chuẩn tập đoàn** unchanged (no false sync) | Corporate PROD-READY columns |
| Infra spot-check (existing custom field visible) | Re-proving infra mô tả reload (prior U31 L2 stands) |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-dept-ref-sync-qa-20260606.md
```

| Result | Detail |
|--------|--------|
| Exit **1** | **2/8** checks |
| Failed checks | `ack_status` (table `\|` format vs colon line), `command_table` (no `pnpm run` exit table) |
| QC adjudication | **Process GWC** — substantive QA evidence complete (5-step L2.5 journey tables, pre-check, residuals, handoff). Same pattern as `qc-p1-u31-dept-scope-20260606.md` (**3/8**). **Does not** block product slice GO on bounded local fix. |

---

## Chain audited

| Artifact | Role | Key signal |
|----------|------|------------|
| `p1-dept-ref-sync-fe-20260606.md` | Dev-FE | Reference tab **Khung đã lưu** + `reload()` on open/save/tab-switch; vitest **159/159** + build exit **0** |
| `p1-dept-ref-sync-qa-20260606.md` | QA | MCP browser L2.5 — 5/5 steps **PASS** on `:5173` |
| `qc-p1-u31-dept-scope-20260606.md` | QC (prior) | U31 VPS L2 PASS but **did not** cover ref-tab cross-view journey (documented gap) |

---

## Classification

| Signal | Type | QC adjudication |
|--------|------|-----------------|
| Step 2 save toast + no 400/500 banner | **PRODUCT** | **PASS** — `gradeTitleLayout` persisted |
| Step 3 **Quay lại → Chi tiết** shows saved marker | **PRODUCT** | **PASS** — round-trip reload works |
| Step 4 **Tham chiếu ORG GRADE → Khung đã lưu** chart shows saved title | **PRODUCT** | **PASS** — closes **D-U31-DEPT-REF-SYNC-01** root cause |
| Step 5 **Chuẩn tập đoàn** static — no QA marker | **PRODUCT** | **PASS** — no false sync to master |
| Infra custom field still listed after navigation | **PRODUCT** | **PASS** — no ref-tab class regression |
| MCP `browser_type` `undefined` prefix on input | **ENV / automation** | **Non-blocking** — marker still persisted; **INFO-QA-MCP-TYPE** P4 |
| Pack verify **2/8** | **PROCESS** | **GWC** — **C-U31REFQC-01** |
| Fix not retested on VPS `:8088` | **DEPLOY / slice** | **GWC** — **C-U31REFQC-02** |
| Matrix row **U31-CC-DEPT-REF-01** absent | **PROCESS** | **GWC** — extends **C-U31QC-04** |

---

## L0 — Local stack (concurred QA pre-check)

| Check | QA result | QC |
|-------|-----------|-----|
| Portal `GET /` on `:5173` | **200** | Concurs QA — local-only slice; no independent QC browser re-run required for bounded gate |
| xbos-api via Vite proxy `:28002` | **YES** | Concurs QA |
| Login `ceo@xe.vn` → `/command-center` | **PASS** | Concurs QA |

**L0 verdict:** **PASS** (local dev stack per QA pre-check).

---

## L2.5 — Settings cross-view journey (mandatory for this defect)

QA MCP browser on `:5173` — QC concurs on classification; journey is **settings-admin L2.5** (save → sibling tab preview), not J-CC/J-HRM.

| Step | Click path | Verdict | Basis |
|------|------------|---------|-------|
| 1 | CC → **CÀI ĐẶT** → **Hệ thống Phòng/Ban** → **Danh mục khung** → **Chi tiết** `PB-ORG-XEVN-01` | **PASS** | Detail editor with Sơ đồ khung CRUD |
| 2 | Add title `QA-REF-SYNC-20260606` → **Lưu khung phòng/ban** | **PASS** | Success toast; no error banner |
| 3 | **Quay lại** → **Chi tiết** same template row | **PASS** | Saved marker visible after reload |
| 4 | Tab **Tham chiếu ORG GRADE** → **Khung đã lưu** dropdown + chart | **PASS** | Read-only preview shows saved title |
| 5 | Expand **Chuẩn tập đoàn (read-only)** | **PASS** | Static 9-level master only |

**L2.5 verdict:** **PASS** — all five mandatory steps for **D-U31-DEPT-REF-SYNC-01**.

---

## L2.5 J-* journey audit (U19)

| Journey | Required for U32 ref-sync? | QC |
|---------|---------------------------|-----|
| **J-CC-01..03** | **No** — settings sub-rail, not CC→HRM deep link | **N/A** |
| **J-HRM-01..07** | **No** | **N/A** |
| **U31-CC-DEPT-REF-01** (proposed matrix row) | **Yes** — this wave closes the gap | **PASS** on `:5173` only |

**U19:** Prior U31 QC correctly marked standard J-* **N/A** for dept list/infra save. This wave adds the missing **save → ref tab preview** sub-journey. QC **does not** NO-GO for missing J-CC/J-HRM; promotes **U31-CC-DEPT-REF-01** for matrix traceability under **C-U31QC-04**.

---

## Unit regression spot-check

```powershell
pnpm --filter web-portal test src/components/org/OrgGradeOrgChart.test.tsx
```

| Run | Exit | Result |
|-----|------|--------|
| QC spot (2026-06-06) | **0** | **2/2 PASS** — custom `titleLayout` vs static master |

Concurs Dev-FE automated evidence in `p1-dept-ref-sync-fe-20260606.md`.

---

## Defect closure register

| ID | Prior severity | Status |
|----|----------------|--------|
| **D-U31-DEPT-REF-SYNC-01** | P0 (user-reported) | **CLOSED** on `localhost:5173` — ref tab shows saved `gradeTitleLayout` |
| INFO-QA-MCP-TYPE | P4 | **OPEN (non-blocking)** — automation typing artifact |
| GWC-U31-DEPT-PREFETCH | P3 | **OPEN (waived)** — **C-U31QC-03** from prior U31 gate |
| **C-U31QC-04** | Process | **OPEN** — add **U31-CC-DEPT-REF-01** to matrix |

---

## QC decision

**GO WITH CONDITIONS** — promote **D-U31-DEPT-REF-SYNC-01 fix** for Command Center **Settings → Hệ thống Phòng/Ban** ref-tab journey on **`localhost:5173`** only (`ceo@xe.vn`).

**NOT** Phase 1 DONE · **NOT** Production GO · **NOT** VPS `:8088` sign-off · **NOT** nip.io re-gate until **C-U31REFQC-02**.

---

## Conditions (explicit)

| ID | Condition | Owner | Expiry / reopen trigger |
|----|-----------|-------|-------------------------|
| **C-U31REFQC-01** | QA evidence: add top-level `ack_status:` colon line + `pnpm run` command table so pack verify exits **0** | **qa** | Next CC settings evidence file |
| **C-U31REFQC-02** | After git merge + VPS deploy of FE ref-sync files, QA retest steps 1–5 on `:8088` (or nip.io when portal synced) | **devops** → **qa** | **2026-06-20** or next VPS redeploy without ref-sync bundle |
| **C-U31QC-04** (extended) | Add matrix row **U31-CC-DEPT-REF-01** (save → **Tham chiếu ORG GRADE** preview) to `PILOT_BUSINESS_FLOW_MATRIX.md` | **pm** / **ba-process** | Same sprint governance |
| **C-U31QC-02** (carry) | PSCP/git parity for portal FE on VPS — ref-sync must ride same deploy path as prior U31 | **devops** | Unchanged from `qc-p1-u31-dept-scope-20260606.md` |

---

## Residual (not blocking this gate)

| Item | Severity | Notes |
|------|----------|-------|
| MCP typing `undefined` prefix | P4 | Cosmetic in saved string; manual QA should use clean fill |
| Infra mô tả reload | — | Not re-proven this session; prior `p1-u31-qa-l2-dept-scope-20260606.md` TC-L2-03 stands |
| Dept tab cold-load prefetch | P3 | **C-U31QC-03** waived |
| VPS / nip.io ref-tab journey | — | **C-U31REFQC-02** — required before promoting beyond local |

---

## pm_dispatch_hint

- Sponsor message: **D-U31-DEPT-REF-SYNC-01 fixed on local dev** — user can verify on `:5173`; **:8088** unchanged until deploy.
- Dispatch **ba-process** to extend **C-U31QC-04** with **U31-CC-DEPT-REF-01** row + journey map note (`dept-ref-tab-journey-gap` lesson).
- Optional: after **C-U31QC-02** git merge, dispatch **qa** for **C-U31REFQC-02** VPS retest (same 5 steps).

---

## completion_report

**Closed (local `:5173` slice):**
- **D-U31-DEPT-REF-SYNC-01** — all five L2.5 browser steps **PASS**; ref tab **Khung đã lưu** shows saved layout; static master unchanged.
- Dev-FE root cause (static-only ref tab + stale list) addressed; unit regression **2/2 PASS** (QC spot concurs).

**Open (bounded, non-blocking for local gate):**
- **C-U31REFQC-01** pack format; **C-U31REFQC-02** VPS retest; **C-U31QC-04** matrix row; carry **C-U31QC-02/03** from prior U31 QC.
- Phase 1 program gates, PROD-READY, full J-* coverage unchanged.

---

## next_owner

**pm**

---

## next_dispatch_prompt

```
work_item_id: P1-CC-DEPT-REF-SYNC-QC-01-INTAKE
from_role: qc
to_role: pm
entry_criteria: QC evidence docs/qa/evidence/qc-p1-dept-ref-sync-20260606.md — GO WITH CONDITIONS D-U31-DEPT-REF-SYNC-01 CLOSED on localhost:5173; QA p1-dept-ref-sync-qa-20260606.md 5/5 L2.5 PASS
exit_criteria: PM inform sponsor local fix verified; dispatch ba-process C-U31QC-04 add U31-CC-DEPT-REF-01 matrix row; after devops C-U31QC-02 merge dispatch qa C-U31REFQC-02 VPS retest; do NOT claim Phase 1 DONE or PROD-READY
evidence_path: docs/qa/evidence/qc-p1-dept-ref-sync-20260606.md
ack_status: PASS_TO_PM
Summary: U32 local QC GO WITH CONDITIONS — D-U31-DEPT-REF-SYNC-01 CLOSED on :5173; ref-tab save→preview journey PASS; VPS promotion blocked until C-U31REFQC-02; matrix C-U31QC-04 extended.
```

---

## evidence_path

`docs/qa/evidence/qc-p1-dept-ref-sync-20260606.md`
