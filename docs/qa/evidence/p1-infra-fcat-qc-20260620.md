# P1-INFRA-FCAT-QC-01 — Foundation Category Wizard + consumer bind L3 gate

**work_item_id:** `P1-INFRA-FCAT-QC-01`  
**Date:** 2026-06-21  
**Role:** qc  
**PORTAL_DEV_URL:** `http://14.225.217.232:8088/`  
**Persona:** `ceo@xe.vn` / `Xevn@2026` · scope `main`  
**QA SoT:** `docs/qa/evidence/p1-infra-fcat-wizard-qa-20260620.md` (§ P1-INFRA-FCAT-CONSUMER-QA-01)  
**Dev-fe chain:** `p1-infra-fcat-wizard-fe-20260620.md` → `p1-infra-fcat-consumer-20260621.md`  
**spec_ref:** `docs/xbos/INFRA_FOUNDATION_CATEGORY_WIZARD_UX.md` §7 · `docs/qa/METADATA_APPLY_PROPAGATION_MATRIX.md` AC-META-PROP-INF-01 / AC-META-PROP-FND-01  
**ack_status:** **PASS_TO_PM**

---

## Command table

| Command | Exit | Verdict | Notes |
|---------|------|---------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-infra-fcat-qc-20260620.md` | 0 | **PASS** | This file (QC gate artifact) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-infra-fcat-wizard-qa-20260620.md` | 1 | FAIL 1/8 | Process — missing `PORTAL_DEV_URL` label (QA uses `:8088` URL only); substance audited by QC |
| `pnpm run qc:dev-stack` | 0 | **PASS** | QC L0 spot — HRM :28001 + XBOS :28002 + portal :5173 |
| `pnpm --filter web-portal exec vitest run src/integrations/infraSiteConsumerContext.test.ts` | 0 | **PASS** | Dev-fe reported 15/15 (consumer bind regression) |

**portal_url:** `http://14.225.217.232:8088/command-center?settings=company_infrastructure` (VPS pilot — sponsor nghiệm thu)

---

## L2 — P-CC infra settings tab

| Check | Route / surface | Expected | QA actual | QC verdict |
|-------|-----------------|----------|-----------|------------|
| Tab load | `/command-center?settings=company_infrastructure` | No ERROR banner; tabs 1+2 reachable | 🟢 No ERROR banner; wizard + site tabs exercised | **PASS** |
| Tab 1 — Danh mục nền | FoundationCategoryWizard | Full-screen wizard; no draft row pollution | 🟢 AC-UF-INF-FCAT-01..03 | **PASS** |
| Tab 2 — Điểm hạ tầng | Site Thêm/Sửa | Consumer custom fields after wizard save | 🟢 `QA-FCAT-FLD-062101` render + F5 persist | **PASS** |
| Console | Infra path | No 409/500 | 🟢 None observed | **PASS** |

*Note:* Dedicated `P-CC-xx` matrix row for infra settings is implicit in CC settings shell (P-CC-01 context); wave scope = **Hạ tầng cơ sở** UF slice on `:8088`, not full P-CC-03..08 HRM embed.

---

## L2.5 J-* journeys

| Journey ID | Account | Click path | Expected | Actual | Verdict |
|------------|---------|------------|----------|--------|---------|
| **J-XBOS-05** | ceo@xe.vn | CC → Cài đặt → **Hạ tầng cơ sở** → tab **1** wizard create (`QA-FCAT-062101`) → scope holding → custom field → **Xác nhận & áp dụng** → tab **2** Thêm/Sửa holding site → field visible → **Lưu** → **F5** | Foundation → scope → sites + custom fields propagate; PUT 200; F5 persist | QA wizard + consumer retest 2026-06-21: PUT 200; label `QA-FCAT-FLD-062101`; value `QA-consumer-retest-0621` after F5 | **PASS** |
| J-CC-01 | ceo@xe.vn | Login → `/command-center` | CC shell loads | Implicit in QA session on `:8088` | **PASS** (context) |

Prior map row J-XBOS-05 (2026-06-06 local) **superseded for :8088** by this wave browser U65 evidence — no regression vs W2 infra fix.

---

## CRUD / UF matrix (in-scope wave)

| Module / AC | Create | Read | Update | Delete | Negative | Verdict |
|-------------|--------|------|--------|--------|----------|---------|
| **AC-UF-INF-FCAT-01** wizard full flow | 🟢 Thêm wizard | 🟢 List row | 🟢 Edit scope +2 entities | n/a | n/a | **PASS** |
| **AC-UF-INF-FCAT-01** step 6 consumer | 🟢 Thêm site + field | 🟢 Sửa site | 🟢 Save custom value | n/a | K5 hide when entity empty | **PASS** — **R-QA-FCAT-01 CLOSED** |
| **AC-UF-INF-FCAT-02** cancel/validation | n/a | 🟢 List count stable | n/a | n/a | 🟢 Inline errors S1/S2 | **PASS** (core) |
| **AC-UF-INF-FCAT-03** scope edit | n/a | 🟢 Pre-fill edit | 🟢 1→2 pháp nhân | n/a | Steps 3–4 FND-01 ⬜ | **PASS** (core edit) |
| **AC-META-PROP-INF-01** | Apply defs | Site form read | Field bind + F5 | n/a | Entity out of scope hide | **PROMOTED** |
| List pollution P0 (DEF-INFRA-FCAT-LIST-01) | n/a | 🟢 No `—` draft row | n/a | n/a | Hủy before save | **CLOSED** |

---

## Consumer field bind audit (R-QA-FCAT-01)

| Check | Evidence | QC finding |
|-------|----------|------------|
| Wizard step 3 saves `customFieldDefs` for holding | QA: modal «3 trường hiển thị»; PUT 200 | **ACCEPTED** |
| Tab 2 renders label after save | QA: `QA-FCAT-FLD-062101` in DOM (Thêm + Sửa) | **CLOSED** |
| BR-META-PROP-01 snapshot sync | Dev-fe: `applyInfrastructureSettingsFromPayload` + `infraSiteConsumerContext.ts` | **ALIGNED** — vitest 15/15 |
| F5 persist on site detail | QA: value `QA-consumer-retest-0621` after reload | **PASS** |
| K5 entity empty → fields hidden | QA: hidden until holding selected on Sửa | **PASS** (expected UX) |

**R-QA-FCAT-01:** **CLOSED** — no dev-fe re-dispatch.

---

## Classification (ENV vs PRODUCT)

| Class | Item | QC treatment |
|-------|------|--------------|
| **ENV** | Local `:5173` vs pilot `:8088` | N/A — gate scoped to **:8088** sponsor path; L0 local stack healthy |
| **PRODUCT (closed)** | P0 list pollution / dual-state draft row | **CLOSED** — wizard FE fix verified |
| **PRODUCT (closed)** | R-QA-FCAT-01 consumer bind missing on tab 2 | **CLOSED** — CONSUMER-QA-01 PASS |
| **PRODUCT (closed in-scope)** | AC-UF-INF-FCAT-01..03 wizard + validation + scope edit core | **PROMOTED** on `:8088` |
| **PRODUCT (P2 carry — waived)** | **R-QA-FCAT-02** — dirty **Hủy** closes without confirm dialog | **WAIVED P2** — SRS §206 expects confirm; UF AC-02 allows 🟡 «document gap»; list integrity PASS (no pollution); **not blocking** infra slice · owner `dev-fe` if sponsor elevates · expiry next UX polish sprint |
| **PRODUCT (deferred — not in sprint)** | **R-QA-FCAT-03** — AC-META-PROP-FND-01 #2–3 (member entity banner on scope shrink / expand re-open site) | **DEFERRED** — QA ⬜ steps 3–4; no regression signal on holding-only path tested · dispatch `qa` only if PM adds FND-01 full matrix to sprint |
| **PROCESS** | QA SoT pack 7/8 — missing `PORTAL_DEV_URL` token | Non-blocking — normalize before next infra QC |

---

## Residual

| ID | Item | Severity | Owner | QC disposition |
|----|------|----------|-------|----------------|
| ~~R-QA-FCAT-01~~ | Consumer field on tab 2 | P0 | — | **CLOSED** |
| **R-QA-FCAT-02** | Dirty Hủy no confirm | **P2** | dev-fe (optional) | **WAIVED** for this gate — list not polluted; SRS gap documented |
| **R-QA-FCAT-03** | FND-01 member scope banner steps 3–4 | P2/P3 | qa (when dispatched) | **CARRY** — out of sprint scope per PM exit criteria |

**No P0/P1 product defect open** for Foundation Category Wizard + infra consumer slice on `:8088`.

---

## QC verdict

**GO WITH CONDITIONS (scoped — P1-INFRA-FCAT wizard + consumer bind on `:8088`)**

### Promoted (closed in-scope)

- **AC-UF-INF-FCAT-01** — full wizard create + list + **step 6 consumer** + F5.
- **AC-UF-INF-FCAT-02** — validation + list integrity (Hủy without confirm = P2 waive only).
- **AC-UF-INF-FCAT-03** — scope edit 1→2 pháp nhân + persist.
- **AC-META-PROP-INF-01** — wizard custom field → **Điểm hạ tầng** consumer visible + F5.
- **J-XBOS-05** — L2.5 cross-tab foundation → sites + custom fields **PASS** on `:8088`.
- **L2** infra settings tab load — no ERROR banner.
- **R-QA-FCAT-01** — **CLOSED**.

### Conditions (explicit — NOT Phase 1 DONE)

1. **R-QA-FCAT-02** — P2 UX confirm on dirty **Hủy** **waived** this gate; re-open only if sponsor mandates AC-FCAT dirty-close before next infra UX wave.
2. **R-QA-FCAT-03** — AC-META-PROP-FND-01 member banner matrix **not executed**; acceptable deferral until PM scopes FND-01 retest.
3. Program gates (`phase1:gate`, G4/G5, full UF matrix) remain open — **this GO does not claim Phase 1 DONE or PROD-READY**.

---

## Handoff packet

**completion_report:** Audited QA PASS on `:8088` for Foundation Category Wizard (AC-UF-INF-FCAT-01..03) + consumer retest closing R-QA-FCAT-01. L2 infra tab + L2.5 J-XBOS-05 PASS. P0 list pollution closed. R-QA-FCAT-02 waived P2 (dirty Hủy confirm). R-QA-FCAT-03 deferred (FND-01 member banner). **NOT Phase 1 DONE.**

**next_owner:** **pm**

**next_dispatch_prompt:** `work_item_id: P1-INFRA-FCAT-PM-CLOSE-01 — entry: docs/qa/evidence/p1-infra-fcat-qc-20260620.md GO WITH CONDITIONS. Update PROGRAM_JOURNEY_MAP J-XBOS-05 footnote :8088 wizard wave; mark infra FCAT slice 🟢 on bus. Optional backlog: R-QA-FCAT-02 → dev-fe dirty-close confirm (P2); R-QA-FCAT-03 → qa FND-01 member banner when sprint includes scope shrink matrix. Do not claim Phase 1 DONE. ack PASS_TO_PM.`

**evidence_path:** `docs/qa/evidence/p1-infra-fcat-qc-20260620.md`

**ack_status:** **PASS_TO_PM**
