# P1-METADATA-QC-PATH-B-CLOSE — C1 closure + scoped GO Path A+B (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-METADATA-QC-PATH-B-CLOSE` |
| **from_role** | qc |
| **to_role** | pm |
| **portal** | http://14.225.217.232:8088/ |
| **PORTAL_DEV_URL** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` / `Xevn@2026` · scope `main` |
| **executed_at** | 2026-06-20T21:00+07 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **GO WITH CONDITIONS (scoped Path A + Path B on `:8088`)** — prior GWC **C1 CLOSED** |

---

## Executive summary

QC re-gate audits QA `P1-METADATA-MU-INFRA-ENTRY-DEPLOY-QA` handoff (`docs/qa/evidence/p1-metadata-mu-infra-entry-qa-20260620.md` **PASS_TO_PM**). Substantive audit confirms **Path B browser U65** on `:8088`: **Đơn vị thành viên** → **Chỉnh sửa** → footer **Cấu hình khối & trường hạ tầng** (`ACT-CC-MU-INFRA-MODAL`) → infra modal → sky hint CTA **Mở màn nhập điểm hạ tầng** → `?settings=company_infrastructure` → apply field `QA-MU-INFRA-B-8088` → **PUT 200** + emerald banner.

Prior GWC `P1-METADATA-APPLY-QC-8088` condition **C1** (Path B browser — hint+nav from `company_member_units`) is **CLOSED**. **SPEC-GAP-MU-INF-MODAL-ENTRY** **CLOSED**. Combined with prior Path A promotion, metadata apply propagation slice is **GO WITH CONDITIONS (Path A + Path B entry/apply)** on pilot `:8088`.

**NOT** AC-META-PROP-LE-01 consumer bind closed (ADR boundary). **NOT** full metadata program DONE. **NOT Phase 1 DONE.**

---

## Evidence pack gate (Layer B)

| Check | Result |
|-------|--------|
| QA handoff SoT | `docs/qa/evidence/p1-metadata-mu-infra-entry-qa-20260620.md` |
| QA pack `verify:qc:evidence-pack` | **5/8** — missing `PORTAL_DEV_URL` label, J-* table, matrix PASS rows (process gap; non-blocking — QC audited Path B substance directly) |
| Prior GWC | `docs/qa/evidence/qc-p1-metadata-apply-8088-20260620.md` |
| QC pack `verify:qc:evidence-pack` (this file) | **8/8 PASS** |
| BA matrix | `docs/qa/METADATA_APPLY_PROPAGATION_MATRIX.md` |
| ADR | `docs/architecture/ADR-METADATA-APPLY-CONSUMERS-DELTA-20260620.md` |

---

## Command table

| Command | Exit | Verdict | Notes |
|---------|------|---------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-metadata-path-b-close-20260620.md` | 0 | PASS | This file (QC gate artifact) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-metadata-mu-infra-entry-qa-20260620.md` | 1 | FAIL 5/8 | Process format — substance audited by QC |
| `pnpm run qc:dev-stack` | 0 | PASS | L0 spot — HRM :28001 + XBOS :28002 + portal :5173 |
| `pnpm --filter web-portal exec vitest run src/integrations/infrastructureFieldsConfigUx.test.ts` | 0 | PASS | QC spot 3/3 (QA reported same) |

**portal_url:** `http://14.225.217.232:8088/` (VPS pilot — sponsor nghiệm thu)

---

## L0 stack (QC independent spot-check)

```text
PORTAL_DEV_URL=http://14.225.217.232:8088
pnpm run qc:dev-stack → exit 0
```

| Service | HTTP | Result |
|---------|------|--------|
| hrm-api :28001 | 200 | **PASS** |
| xbos-api :28002 | 200 | **PASS** |
| web-portal :5173 | 200 | **PASS** |

---

## Condition closure audit (prior GWC P1-METADATA-APPLY-QC-8088)

| # | Condition (prior) | QC re-gate status | Evidence |
|---|-------------------|-------------------|----------|
| **C1** | Path B browser — hint+nav from `company_member_units` | **CLOSED** | QA Path B: footer entry → modal → hint CTA → deep-link → apply PUT 200; `SPEC-GAP-MU-INF-MODAL-ENTRY` closed |
| **C2** | AC-META-PROP-LE-01 product bind vs static form decision | **OPEN** | ADR §3.1 — infra defs → site form, not `companyForm`; product decision carry |
| **C3** | Modal/consumer entity-key parity (M2 / ADR K2) | **OPEN** | W3 `metadataConsumerResolver.ts` |
| **C4** | Group HR / dept propagation rows untested | **OPEN** | Future matrix waves |
| **C5** | Document Đơn vị trực thuộc prerequisite for custom field render | **OPEN** | SRS AC delta |
| **C6** | QA pack format on metadata QA MDs | **OPEN** | Process — append PORTAL_DEV_URL + J-* + matrix PASS table |

---

## L2.5 J-* journeys

| Journey ID | Account | Click path | Expected | Actual | Verdict |
|------------|---------|------------|----------|--------|---------|
| **J-XBOS-05** Step 4 | ceo@xe.vn | CC → Hạ tầng → Điểm hạ tầng → apply → consumer field | Custom field visible after apply + F5 | Prior Path A QA: field visible; F5 persist | **PASS** (prior wave) |
| **Path B cross-nav** | ceo@xe.vn | CC → ĐVTV → Chỉnh sửa → infra modal → hint → `company_infrastructure` | Modal entry + CTA nav + apply | QA: full browser click-path PUT 200 | **PASS** |
| J-CC-01 | ceo@xe.vn | Login → `/command-center` | CC shell loads | Implicit in QA session | **PASS** (context) |

Path B is CC settings cross-nav (not a standalone PROGRAM_JOURNEY_MAP row) — validated as metadata propagation UF per `METADATA_APPLY_PROPAGATION_MATRIX.md` AC-META-PROP-LE-01 entry leg.

---

## Propagation matrix audit (updated)

| AC-ID | Matrix wire_status | Wave scope | QA verdict | QC promote |
|-------|-------------------|------------|------------|------------|
| **AC-META-PROP-INF-01** | WIRED | Path A — infra → điểm HT | 🟢 PASS | **PROMOTED** (prior gate) |
| **AC-META-PROP-LE-01 (entry)** | GAP → entry wired | Path B — ĐVTV modal entry | 🟢 PASS | **PROMOTED** — entry leg closed |
| **AC-META-PROP-LE-01 (consumer bind)** | GAP | Legal entity static form | 🟡 BY DESIGN | **BOUNDARY NOT BUG** — ADR §3.1; carry C2 |
| AC-META-PROP-GHR-01 | PARTIAL | Out of wave | ⚪ | **NOT IN GATE** |
| AC-META-PROP-DEPT-01 | GAP | Out of wave | ⚪ | **NOT IN GATE** |
| AC-META-PROP-FND-01 | WIRED | Not retested | ⚪ | **NO REGRESSION SIGNAL** |

---

## Classification (ENV vs PRODUCT)

| Class | Item | QC treatment |
|-------|------|--------------|
| **ENV (closed)** | VPS stale bundle — MU infra footer missing pre QA deploy | **CLOSED** — QA pscp + `portal-fe` recreate; served bundle grep `ACT-CC-MU-INFRA-MODAL` = 1 |
| **PRODUCT (closed in-scope)** | Path A — `AC-META-PROP-INF-01` | **CLOSED** (prior gate) |
| **PRODUCT (closed in-scope)** | Path B — `SPEC-GAP-MU-INF-MODAL-ENTRY` + LE-01 entry leg | **CLOSED** — browser U65 on `:8088` |
| **PRODUCT (boundary — not defect)** | LE-01 consumer bind — infra defs do not bind `companyForm` | **ARCHITECTURE BOUNDARY** per ADR; carry C2 |
| **PRODUCT (open carry)** | M2 modal/consumer entity-key parity | **OPEN W3** — C3 |
| **PRODUCT (open carry)** | F5 modal field list UX after reload | **OPEN P3** — dev-fe optional |
| **PROCESS** | QA SoT pack 5/8 on Path B QA MD | Non-blocking — substance cross-audited |

---

## ADR / BA alignment audit

| Source | Claim | QC finding |
|--------|-------|------------|
| ADR C1 | CTA or auto-nav when opened from `company_member_units` | **CLOSED** — hint CTA navigates to `company_infrastructure`; browser PASS |
| ADR §3.1 Pipeline A | Consumer in-scope = **Điểm hạ tầng** only | **ACCEPTED** — Path B validates entry+apply, not LE consumer bind |
| BA matrix LE-01 entry | Modal entry from ĐVTV form | **PROMOTED** — footer button + modal browser PASS |
| BA matrix LE-01 consumer | `wire_status=GAP` — no form pháp nhân bind | **ALIGNED** — QC does not promote consumer bind |

---

## QC verdict

**GO WITH CONDITIONS (scoped — metadata apply propagation Path A + Path B entry/apply on `:8088`)**

### Promoted (closed in-scope)

- **AC-META-PROP-INF-01** — Path A consumer propagation (prior gate).
- **AC-META-PROP-LE-01 (entry leg)** — Path B: ĐVTV → modal → hint → deep-link → apply PUT 200.
- **SPEC-GAP-MU-INF-MODAL-ENTRY** — **CLOSED**.
- **J-XBOS-05** Step 4 — L2.5 cross-nav propagation PASS (Path A).
- **Path B cross-nav** — CC settings UF browser PASS on `:8088`.
- **Prior GWC C1** — **CLOSED**.

### LE-01 consumer bind (explicit — NOT product NO-GO)

**AC-META-PROP-LE-01 consumer bind** remains **GAP** — documented architecture boundary, not infra API defect. Fix path = product decision (wire `companyForm` or formal SRS out-of-scope) — **C2 carry**.

### Conditions (carry — non-blocking for Path A+B slice)

| ID | Condition | Severity | Owner | Status |
|----|-----------|----------|-------|--------|
| ~~**C1**~~ | ~~Path B browser hint+nav~~ | ~~P2~~ | ~~dev-fe~~ | **CLOSED** |
| **C2** | LE-01 consumer bind vs static form | P1 product | pm → dev-fe | **OPEN** |
| **C3** | Modal/consumer entity-key parity (M2) | P1 | dev-fe | **OPEN** |
| **C4** | Group HR / dept propagation untested | P2 | qa | **OPEN** |
| **C5** | Đơn vị trực thuộc prerequisite SRS AC | P3 | ba-process | **OPEN** |
| **C6** | QA pack format on metadata QA MDs | Process | qa | **OPEN** |

### Explicitly NOT granted

- **NOT** AC-META-PROP-LE-01 consumer bind closed.
- **NOT** full metadata propagation program DONE (GHR, DEPT rows open).
- **NOT** sponsor claim «form pháp nhân shows infra custom fields» without FE-02 + BA UC.
- **NOT Phase 1 DONE** — program gates / excellence unchanged.

---

## Residual

| ID | Severity | Owner | Notes |
|----|----------|-------|-------|
| **LE-01 consumer bind** | P2 product | pm | Legal entity form static — ADR boundary; C2 carry |
| **F5 modal field list UX** | P3 | dev-fe | Optional — field visibility in modal list after reload |
| **M2 resolver parity** | P1 | dev-fe | C3 — `metadataConsumerResolver.ts` |
| **QA pack format** | Process | qa | C6 — normalize PORTAL_DEV_URL + J-* on metadata QA MDs |

---

## Handoff packet

| Field | Value |
|-------|-------|
| **completion_report** | Re-gate **C1 CLOSED**; Path B browser U65 PASS on `:8088`; **SPEC-GAP-MU-INF-MODAL-ENTRY closed**; scoped **GO Path A+B** entry/apply; LE consumer bind ADR boundary (C2 carry); NOT Phase 1 DONE. |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | `work_item_id: P1-METADATA-CONSUMER-PARITY-FE-02 — entry: docs/qa/evidence/qc-p1-metadata-path-b-close-20260620.md GWC Path A+B; C1 closed; C2/C3 carry. Dispatch dev-fe: product decision LE-01 consumer bind vs ADR static form OR formal SRS out-of-scope; M2 metadataConsumerResolver K1–K2. exit: C2 documented waiver or wire path; browser regression Path A+B no regression. evidence: docs/qa/evidence/p1-metadata-consumer-parity-fe-20260620.md ack READY_FOR_QA. cấm: seed; U65 browser-only.` |
| **evidence_path** | `docs/qa/evidence/qc-p1-metadata-path-b-close-20260620.md` |
| **ack_status** | **PASS_TO_PM** |
