# P1-METADATA-APPLY-QC-8088 — L3 gate (infra metadata apply propagation)

**work_item_id:** `P1-METADATA-APPLY-QC-8088`  
**Date:** 2026-06-20  
**Role:** qc  
**PORTAL_DEV_URL:** `http://14.225.217.232:8088/`  
**Persona:** `ceo@xe.vn` / `Xevn@2026` · scope `main`  
**QA SoT:** `docs/qa/evidence/p1-metadata-apply-qa-8088-20260620.md`  
**BA matrix:** `docs/qa/METADATA_APPLY_PROPAGATION_MATRIX.md`  
**ADR:** `docs/architecture/ADR-METADATA-APPLY-CONSUMERS-DELTA-20260620.md`  
**Program:** `docs/program/P1-METADATA-APPLY-PROPAGATION-PROGRAM.md` (E4)  
**Dev-fe handoff:** `docs/qa/evidence/p1-metadata-apply-ux-fe-20260620.md`

---

## Command table

| Command | Exit | Verdict | Notes |
|---------|------|---------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-metadata-apply-8088-20260620.md` | 0 | PASS | This file (QC gate artifact) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-metadata-apply-qa-8088-20260620.md` | 1 | FAIL 5/8 | Process format — missing PORTAL_DEV_URL label, J-* table, matrix PASS rows; substance audited by QC |
| `pnpm run qc:dev-stack` | 0 | PASS | L0 spot — HRM :28001 + XBOS :28002 + portal :5173 |
| `pnpm --filter web-portal exec vitest run src/integrations/infrastructureFieldsConfigUx.test.ts` | 0 | PASS | QC spot 3/3 (QA reported same) |

**portal_url:** `http://14.225.217.232:8088/` (VPS pilot — sponsor nghiệm thu)

---

## L2.5 J-* journeys

| Journey ID | Account | Click path | Expected | Actual | Verdict |
|------------|---------|------------|----------|--------|---------|
| **J-XBOS-05** Step 4 | ceo@xe.vn | CC → Hạ tầng cơ sở → Điểm hạ tầng → Thêm → Mở cấu hình khối & trường → apply → chọn Đơn vị trực thuộc → site form | Custom field visible after apply + F5; PUT 200 `XBOS-INFRA-201` | QA Path A: field `QA-META-INF-F5-8088` visible; emerald banner; F5 `hasField:true` | **PASS** |
| J-CC-01 | ceo@xe.vn | Login → `/command-center` | CC shell loads | Implicit in QA session | **PASS** (context) |

Path B (member_units → hint → deep-link) **not L2.5 PASS** — no browser entry to infra modal from ĐVTV form; documented as spec_gap + ADR boundary (see Classification).

---

## Propagation matrix audit (in-scope wave)

| AC-ID | Matrix wire_status | Wave scope | QA verdict | QC promote |
|-------|-------------------|------------|------------|------------|
| **AC-META-PROP-INF-01** | WIRED | Path A — infra → điểm HT | 🟢 PASS browser U65 | **PROMOTED** — E3 UX U1–U4 + C2 satisfied on `:8088` |
| **AC-META-PROP-LE-01** | GAP (documented) | Path B — ĐVTV → form pháp nhân | 🟡 PARTIAL | **BOUNDARY NOT BUG** — ADR §3.1 M1 + §9; carry FE-02 / product decision |
| AC-META-PROP-GHR-01 | PARTIAL | Out of wave | ⚪ | **NOT IN GATE** — future QA row |
| AC-META-PROP-DEPT-01 | GAP | Out of wave | ⚪ | **NOT IN GATE** — program W3+ |
| AC-META-PROP-FND-01 | WIRED | Not retested | ⚪ | **NO REGRESSION SIGNAL** — prior WIRED; not re-opened |

---

## Classification (ENV vs PRODUCT)

| Class | Item | QC treatment |
|-------|------|--------------|
| **ENV (closed)** | VPS stale bundle — `infrastructureFieldsConfigUx.ts` missing pre QA deploy | Closed — QA recreate `portal-fe`; served file 200 post-deploy |
| **PRODUCT (closed in-scope)** | Path A — apply UX + consumer propagation `AC-META-PROP-INF-01` | **CLOSED** — browser U65 on `:8088` |
| **PRODUCT (boundary — not defect)** | **AC-META-PROP-LE-01** — infra defs do not bind `companyForm` | **ARCHITECTURE BOUNDARY** per ADR-METADATA-APPLY-CONSUMERS-DELTA §3.1 / §9 / BR-META-PROP-03; sponsor incident M1 = wrong consumer expectation |
| **PRODUCT (open carry)** | Path B — `SPEC-GAP-MU-INF-MODAL-ENTRY` — no modal entry from `company_member_units` | **OPEN P2** — dev-fe or BA delta; blocks full Path B browser UF |
| **PRODUCT (open carry)** | **M2** modal direct key vs `resolveInfraScopedRecord` parity | **OPEN W3** — `P1-METADATA-CONSUMER-PARITY-FE-02` (ADR K2) |
| **PRODUCT (open carry)** | **UX-INF-OPERATING-ENTITY** — custom fields hidden until Đơn vị trực thuộc chosen | **OPEN P3** — SRS AC delta |
| **PROCESS** | QA SoT pack 5/8 on `p1-metadata-apply-qa-8088-20260620.md` | Non-blocking — substance cross-audited; normalize before next metadata QC |

---

## ADR / BA alignment audit

| Source | Claim | QC finding |
|--------|-------|------------|
| ADR §3.1 Pipeline A | Consumer in-scope = **Điểm hạ tầng** only; legal entity form **out-of-scope** | **ACCEPTED** — QA Path A proves correct consumer; LE-01 Step 1 FAIL is expected until FE-02 or new UC |
| ADR C1 | CTA or auto-nav when opened from `company_member_units` | **PARTIAL** — hint logic unit PASS + deploy parity; browser blocked by missing modal entry (not CTA failure alone) |
| BA matrix row LE-01 | `wire_status=GAP` — do not claim form pháp nhân updated | **ALIGNED** — QC does not promote LE-01 as closed |
| Program E4 | QC GO scoped — no ⬜ consumer in **this wave** scope | **MET** — INF-01 only mandatory AC for W4/W5 gate |

---

## UX apply contract (ADR U1–U4)

| Check | Evidence | Verdict |
|-------|----------|---------|
| U1 Loader2 / busy on apply | QA: button `[busy]` during save | **PASS** |
| U2 Success close + banner | QA: modal closes; emerald `[role=status]` page banner | **PASS** |
| U3 Error path | Not exercised this wave — no regression signal | **N/A** |
| U4 GET refresh after PUT | QA: GET persisted `qa_meta_inf_f5_8088`; F5 consumer | **PASS** |

---

## QC verdict

**GO WITH CONDITIONS (scoped — infra metadata apply propagation Path A on `:8088`)**

### Promoted (closed in-scope)

- **AC-META-PROP-INF-01** — Config apply → **Điểm hạ tầng** consumer visible change after apply + **F5**; Network PUT **200** `XBOS-INFRA-201`; U65 browser-only.
- **Program E3** (W2 UX apply) — Loader2, success banner, modal close, post-PUT refresh verified on pilot `:8088`.
- **J-XBOS-05** Step 4 — L2.5 cross-nav propagation PASS for group CEO infra slice.

### LE-01 boundary (explicit — NOT product NO-GO for this gate)

**AC-META-PROP-LE-01** remains **GAP** in BA matrix but QC classifies as **documented architecture boundary**, not infra API defect:

- Infra `customFieldDefsByEntity` feeds **site detail** (`infraForm`), not static **Hồ sơ pháp nhân** (`companyForm`).
- Fix path = UX routing (CTA to `company_infrastructure`) + optional W3 resolver — **not** silent merge of infra SoT into org-foundation legal payload without BA UC delta.

### Conditions (carry — non-blocking for Path A slice)

| ID | Condition | Severity | Owner | Work item |
|----|-----------|----------|-------|-----------|
| **C1** | Path B browser — hint+nav from `company_member_units` | P2 | dev-fe / ba-process | `P1-METADATA-CONSUMER-PARITY-FE-02` — modal entry or SRS copy |
| **C2** | **AC-META-PROP-LE-01** product bind vs static form decision | P1 product | pm → dev-fe | Same FE-02 — wire `companyForm` **or** formal out-of-scope SRS |
| **C3** | Modal/consumer entity-key parity (M2 / ADR K2) | P1 | dev-fe | W3 `metadataConsumerResolver.ts` |
| **C4** | Group HR / dept propagation rows untested | P2 | qa | Future matrix waves |
| **C5** | Document **Đơn vị trực thuộc** prerequisite for custom field render | P3 | ba-process | SRS AC delta |
| **C6** | QA pack format 5/8 on QA MD | Process | qa | Append PORTAL_DEV_URL + J-* + matrix PASS table |

### Explicitly NOT granted

- **NOT** full metadata propagation program DONE (GHR, DEPT, FND rows open).
- **NOT** AC-META-PROP-LE-01 closed — boundary documented; browser Path B incomplete.
- **NOT** sponsor claim «form pháp nhân shows infra custom fields» without FE-02 + BA UC.
- **NOT Phase 1 DONE** — program gates / excellence unchanged.

---

## Residual

- Path B full browser UF blocked until ĐVTV modal entry exists (`SPEC-GAP-MU-INF-MODAL-ENTRY`).
- LE-01 legal entity consumer bind deferred to `P1-METADATA-CONSUMER-PARITY-FE-02` per QA handoff.
- No regression asserted on AC-META-PROP-FND-01 this wave.

---

**ack_status:** `PASS_TO_PM`

**completion_report:** L3 QC gate — **AC-META-PROP-INF-01 + J-XBOS-05 Step 4 CLOSED** on `:8088`; **LE-01 documented as ADR architecture boundary** (not infra bug); **GO WITH CONDITIONS** scoped Path A; carry Path B + FE-02 + M2 resolver; NOT Phase 1 DONE.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: P1-METADATA-CONSUMER-PARITY-FE-02
entry: docs/qa/evidence/qc-p1-metadata-apply-8088-20260620.md — QC GWC Path A closed; C1/C2/C3 carry
exit: (1) ĐVTV modal entry OR BA SRS copy for Path B; (2) product decision LE-01 bind vs static form; (3) metadataConsumerResolver K1–K2; Path B browser hint+nav 🟢
evidence: docs/qa/evidence/p1-metadata-consumer-parity-fe-20260620.md
spec_ref: ADR-METADATA-APPLY-CONSUMERS-DELTA-20260620 §4–§5; METADATA_APPLY_PROPAGATION_MATRIX AC-META-PROP-LE-01
ack_status: READY_FOR_QA
cấm: seed; U65 browser-only
```

---

## Addendum — P1-METADATA-QC-PATH-B-CLOSE (2026-06-20)

**Supersedes:** GWC condition **C1** partial status in this file.  
**QA SoT:** `docs/qa/evidence/p1-metadata-mu-infra-entry-qa-20260620.md` (**PASS_TO_PM**)  
**QC close:** `docs/qa/evidence/qc-p1-metadata-path-b-close-20260620.md`

### C1 closure

| Item | Prior (this file) | After re-gate |
|------|-------------------|---------------|
| **C1** Path B browser hint+nav from `company_member_units` | **OPEN P2** — `SPEC-GAP-MU-INF-MODAL-ENTRY` | **CLOSED** — footer `ACT-CC-MU-INFRA-MODAL` → modal → hint CTA → `company_infrastructure` → apply PUT 200 |
| **SPEC-GAP-MU-INF-MODAL-ENTRY** | OPEN carry | **CLOSED** |
| **AC-META-PROP-LE-01 (entry)** | 🟡 PARTIAL | **PROMOTED** — entry leg browser PASS |
| **AC-META-PROP-LE-01 (consumer bind)** | BOUNDARY NOT BUG | **Unchanged** — ADR §3.1; C2 carry |
| Path B L2.5 row (§ L2.5 above) | not L2.5 PASS | **PASS** — see close evidence |

### Updated verdict (scoped)

**GO WITH CONDITIONS (Path A + Path B entry/apply on `:8088`)** — supersedes Path-A-only GWC scope for metadata apply propagation slice.

**Still carry:** C2 (LE consumer bind), C3 (M2 resolver), C4–C6 per original table.  
**NOT** full LE-01 closed · **NOT** metadata program DONE · **NOT Phase 1 DONE.**
