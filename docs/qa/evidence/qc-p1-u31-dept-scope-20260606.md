# P1-CC-DEPT-TPL-SCOPE-01 — U31 L3 QC gate (VPS :8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-CC-DEPT-TPL-SCOPE-01-L2-FINAL` |
| **qc_work_item_id** | `P1-CC-DEPT-TPL-SCOPE-01-L3-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **qa_evidence_path** | `docs/qa/evidence/p1-u31-qa-l2-dept-scope-20260606.md` |
| **prior_chain** | `p1-qa-u31-dept-infra-retest-20260606.md` · `p1-qa-u31-vps-retest-20260606.md` · `p1-u31-portal-sync-smoke-20260606.md` · `p1-dept-templates-scope-fix-20260606.md` |
| **environment** | `http://14.225.217.232:8088` (authoritative SoT) |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **executed_at** | 2026-06-06 |
| **decision** | **GO WITH CONDITIONS** — U31 dept-template + infra settings slice promotable on VPS :8088 |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — U31 only)

| In scope | Out of scope |
|----------|--------------|
| L0 VPS :8088 stack smoke (portal + xbos API via probe) | Full Phase 1 gate (`phase1:gate --strict`) |
| L1 CEO JWT probe (`tmp-p1-qa-u31-dept-infra-probe.mjs` exit 0) | nip.io HTTPS perimeter re-certification |
| L2 browser: CC render · **Danh mục khung** tab · **Hạ tầng cơ sở** save | HRM embed P-CC-03..08 matrix |
| Scope parity: dept read holding merge vs write mutation scope | L2.5 **J-CC-*** / **J-HRM-*** cross-nav (not in U31 charter) |
| Close prior P0 defects D-U31-* / D-8088-CC-* on :8088 | Corporate PROD-READY columns |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-u31-qa-l2-dept-scope-20260606.md
```

| Result | Detail |
|--------|--------|
| Exit **1** | **3/8** checks |
| Failed checks | `work_item_id` (table `\|` format vs colon line), `command_table` (uses `node` not `pnpm` + pack regex), `crud_or_matrix` (no explicit C/R/U/D module table) |
| QC adjudication | **Process GWC** — substantive U31 evidence complete (L0–L2 tables, probe exit 0, residuals, handoff). Same pattern as `p1-phase1-qc-mob-p5-jwt-20260605.md` (**2/8**). **Does not** block product slice GO on bounded U31. |

---

## Chain audited

| Artifact | Role | Key signal |
|----------|------|------------|
| `p1-qa-u31-dept-infra-retest-20260606.md` | QA | Pre-deploy **FAIL** — dept 0 items, infra PUT 400, CC blank |
| `p1-qa-u31-vps-retest-20260606.md` | QA | Post xbos-api deploy — API **PASS**, L2 **FAIL** Vite 500 missing `OrgGradeOrgChartEditor` |
| `p1-u31-portal-sync-smoke-20260606.md` | DevOps | PSCP sync + CommandCenterPage **200** + probe exit **0** |
| `p1-u31-qa-l2-dept-scope-20260606.md` | QA | L2 final — 3/3 browser TC **PASS** + probe exit **0** |
| `p1-dept-templates-scope-fix-20260606.md` | Dev-BE | Root cause read `holding` vs write `main`; merge + mutation scope fix |

---

## Classification

| Signal | Type | QC adjudication |
|--------|------|-----------------|
| CEO JWT probe exit **0** — dept **2** @ holding, infra PUT **200** `XBOS-INFRA-201` | **PRODUCT** | **PASS** — closes D-U31-DEPLOY-01, D-U31-DEPT-EMPTY-01, D-U31-INFRA-400-01 |
| L2 browser CC `#root` children, no Vite overlay | **PRODUCT** | **PASS** — closes D-8088-CC-IMPORT-01, D-U31-PORTAL-SYNC-01, D-8088-CC-VITE-500-01 |
| L2 **Danh mục khung** 2 rows + DB source label | **PRODUCT** | **PASS** |
| L2 infra **Lưu danh mục nền** toast, no 400/XBOS-VAL | **PRODUCT** | **PASS** |
| Dept tab cold-load brief `trống` before fetch | **PRODUCT (P3 UX)** | **GWC waived** — **C-U31QC-03** |
| CC KPI rollup informational line `JWT companyId=main` | **PRODUCT (P3)** | **Out of slice** — existing `D-8088-KPI-01` backlog |
| Portal files PSCP-only, not on `main` git | **PROCESS / deploy** | **GWC** — **C-U31QC-02** |
| `GET /api/xbos/health` → **404** on :8088 | **ENV** | **Non-blocking** — login + business APIs **200** via probe; no stack-down |
| Pack verify **3/8** | **PROCESS** | **GWC** — **C-U31QC-01** |

---

## L0 — VPS :8088 stack health

| Check | QC spot (2026-06-06) | Result |
|-------|----------------------|--------|
| `GET http://14.225.217.232:8088/` | HTTP **200** | **PASS** |
| `GET …/src/pages/command-center/CommandCenterPage.tsx` | HTTP **200** (not 500) | **PASS** |
| CEO JWT probe | See L1 below | **PASS** |

**L0 verdict:** **PASS** (authoritative SoT responsive; Vite compile unblocked).

---

## L1 — CEO JWT probe

```powershell
$env:PORTAL_DEV_URL='http://14.225.217.232:8088'
node scripts/tmp-p1-qa-u31-dept-infra-probe.mjs
```

| Run | Exit | Result |
|-----|------|--------|
| QA (`p1-u31-qa-l2-dept-scope-20260606.md`) | **0** | **PASS** |
| QC independent spot | **0** | **PASS** — concurs QA |

| Probe step | HTTP / detail |
|------------|---------------|
| login `ceo@xe.vn` | **201** |
| GET `dept_system_templates/items` | **200** partition=**holding** count=**2** `[q@main, PB-ORG-XEVN-01@xevn]` |
| PUT `infrastructure/settings` (array payload) | **200** `XBOS-INFRA-201` |
| GET `infrastructure/settings` | **200** foundationCategories count=**1** |
| PUT `customFieldDefsByEntity` | **200** |
| GET persisted defs | **200** defs=**1** |

**L1 verdict:** **PASS**.

---

## L2 — Browser matrix rows (U31 slice)

QA MCP browser retest on `:8088` — QC concurs on classification; QC spot-check confirms CommandCenterPage **200** + probe **0** (runtime parity with QA tables).

| Row ID | Layer | Click path | Verdict | Basis |
|--------|-------|------------|---------|-------|
| **P-CC-01-U31** | L2 (extends P-CC-01) | Login → `/command-center` | **PASS** | `#root` children=1; no Vite overlay; Task_Counter + module rail |
| **U31-CC-DEPT-TPL-01** | L2 | CC → **CÀI ĐẶT HỆ THỐNG** → **Hệ thống Phòng/Ban** → tab **Danh mục khung** | **PASS** | Source `DB (business-master) · 2 khung`; rows `q`, `PB-ORG-XEVN-01`; Chi tiết/Xóa actions |
| **U31-CC-INFRA-SAVE-01** | L2 | Settings → **Hạ tầng cơ sở** → **Chi tiết & cấu hình** → edit → **Lưu danh mục nền** | **PASS** | Success toast; `has400=false`; no XBOS-VAL banner |

**Note:** Standard `PILOT_BUSINESS_FLOW_MATRIX.md` has no dedicated U31 rows yet — **C-U31QC-04** (PM/BA matrix delta).

---

## L2.5 J-* journey audit (U19)

| Journey | Required for U31? | QC |
|---------|-------------------|-----|
| **J-CC-01..03** (CC cross-nav) | **No** — U31 is settings sub-rail, not CC→HRM deep link | **N/A** |
| **J-HRM-01..07** | **No** — out of slice | **N/A** |
| Settings tab **within** CC (open settings → Phòng/Ban → save) | L2 tab navigation only | **PASS** per QA TC-L2-02/03 — not promoted as J-* |

**U19:** Bounded U31 charter = **settings dept/infra tabs** with CEO JWT persona. QA correctly marked L2.5 **N/A**. QC **does not** NO-GO for missing J-* on this wave.

---

## Scope parity audit (dept templates)

| Mechanism | Read (list) | Write (upsert/delete) | VPS :8088 runtime |
|-----------|-------------|------------------------|-------------------|
| Resolver | Group read scope → **holding** + legacy merge (`main`, `xevn`) | `resolveXbosGroupLegalMutationScopeContext` → **holding** for `dept_system_templates` | **PASS** |
| Evidence | `BusinessMasterService.list` merge | `BusinessMasterController.resolveWriteScope` | Probe: **2 items** on holding partition; UI shows same 2 rows |
| Prior bug | 200 + `items: []` (read/write partition mismatch) | Save landed in `main`, list read `holding` only | **CLOSED** |

**Scope parity verdict:** **PASS** — read merge and write mutation scope aligned for group CEO on authoritative SoT.

---

## Defect closure register

| ID | Prior severity | Status |
|----|----------------|--------|
| D-U31-DEPLOY-01 | P0 | **CLOSED** — xbos-api redeploy verified |
| D-U31-DEPT-EMPTY-01 | P0 | **CLOSED** — count=2 @ holding |
| D-U31-INFRA-400-01 | P0 | **CLOSED** — array DTO PUT 200 |
| D-8088-CC-IMPORT-01 | P0 | **CLOSED** — CC SPA mounts |
| D-U31-PORTAL-SYNC-01 | P0 | **CLOSED** — OrgGradeOrgChartEditor synced |
| D-8088-CC-VITE-500-01 | P0 | **CLOSED** — CommandCenterPage Vite 200 |
| GWC-U31-DEPT-PREFETCH | P3 | **OPEN (waived)** — **C-U31QC-03** |
| D-8088-KPI-01 | P3 | **OPEN** — out of slice |

---

## QC decision

**GO WITH CONDITIONS** — promote **U31 Command Center dept-template + infra settings slice** on VPS `:8088` for `ceo@xe.vn` after deploy chain (xbos-api + portal PSCP + L2 browser PASS).

**NOT** Phase 1 DONE · **NOT** Production GO · **NOT** full Command Center / HRM matrix sign-off · **NOT** nip.io re-gate.

---

## Conditions (explicit)

| ID | Condition | Owner | Expiry / reopen trigger |
|----|-----------|-------|-------------------------|
| **C-U31QC-01** | QA evidence: add top-level `work_item_id:` line + `pnpm run` command table + C/R/U/D module table so `verify:qc:evidence-pack` exits **0** | **qa** | Next CC settings evidence file |
| **C-U31QC-02** | PSCP-synced `OrgGradeOrgChartEditor.tsx` + `orgGradeLayout.ts` merged to `main` + full VPS git-pull deploy (no manual drift) | **devops** | **2026-06-20** or next VPS redeploy without PSCP |
| **C-U31QC-03** | **GWC-U31-DEPT-PREFETCH** — cold tab shows `trống` briefly before async fetch | **dev-fe** (optional) | **Waived to 2026-07-06** — reopen only if user reports persistent empty table (not flicker) |
| **C-U31QC-04** | Add **U31-CC-DEPT-TPL-01** / **U31-CC-INFRA-SAVE-01** rows to `PILOT_BUSINESS_FLOW_MATRIX.md` | **pm** / **ba-process** | Same sprint governance |

---

## Residual (not blocking this gate)

| Item | Severity | Notes |
|------|----------|-------|
| KPI rollup message on CC dashboard | P3 | `D-8088-KPI-01` — informational |
| Platform-audit `events=0` on probe | P3 | Informational; infra save succeeded |
| Full L2.5 J-* CC/HRM journeys | — | Out of U31 slice; unchanged from prior gates |

---

## pm_dispatch_hint

- Refresh `SERVICE_READINESS` / user-facing status for **:8088** dept-template tab only if PM promotes slice to sponsor.
- Optional: dispatch **dev-fe** prefetch polish under **C-U31QC-03** (non-blocking).
- Next program wave remains independent of U31 closure.

---

## completion_report

**Closed (U31 slice on VPS :8088):**
- L0 portal + Vite compile health; L1 CEO JWT probe exit **0** (QC spot concurs QA).
- L2 browser: CC shell, **Danh mục khung** (2 rows), infra save without 400.
- Scope parity read-merge vs write-mutation **PASS**; six prior P0 defects **CLOSED**.

**Open (bounded, non-blocking):**
- Process pack format **C-U31QC-01**; PSCP git parity **C-U31QC-02**; P3 dept-tab prefetch **C-U31QC-03** (waived); matrix row gap **C-U31QC-04**.
- Phase 1 program gates, PROD-READY, full J-* coverage unchanged.

---

## next_owner

**pm**

---

## next_dispatch_prompt

```
work_item_id: P1-CC-DEPT-TPL-SCOPE-01-L3-QC-INTAKE
from_role: qc
to_role: pm
entry_criteria: QC evidence docs/qa/evidence/qc-p1-u31-dept-scope-20260606.md — GO WITH CONDITIONS U31 dept+infra slice on VPS :8088; QA p1-u31-qa-l2-dept-scope-20260606.md L2 PASS
exit_criteria: PM refresh sponsor status for :8088 dept-template tab (optional); dispatch devops C-U31QC-02 git merge PSCP files to main; dispatch ba-process C-U31QC-04 add U31 matrix rows; do NOT claim Phase 1 DONE or PROD-READY
evidence_path: docs/qa/evidence/qc-p1-u31-dept-scope-20260606.md
ack_status: PASS_TO_PM
Summary: U31 L3 QC GO WITH CONDITIONS — P-CC-01-U31 + U31-CC-DEPT-TPL-01 + U31-CC-INFRA-SAVE-01 PASS; scope parity CLOSED; L2.5 J-* N/A for settings-only slice; conditions C-U31QC-01..04.
```

---

## evidence_path

`docs/qa/evidence/qc-p1-u31-dept-scope-20260606.md`
