# MOB-W7-5-DIRECTORY-QC-FINAL — J-MOB-30 team directory final gate @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-W7-5-DIRECTORY-QC-FINAL` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **decision** | **GO (scoped)** — **J-MOB-30** team directory **device CLOSED** @ nip.io emulator; **GWC-DIR-NIP-01** + **GWC-DIR-ROWS-01** lifted |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — MOB-W7-5 directory closure / J-MOB-30)

| In scope | Out of scope |
|----------|--------------|
| **J-MOB-30** tab **Đội nhóm** → populated list + search + filter chips + attendance badges @ nip.io | Phase 1 DONE / `verify:product:completion` program exit |
| **GWC-DIR-NIP-01** nip.io `view=directory` deploy closure | PROD cutover / store release |
| **GWC-DIR-ROWS-01** ≥1 row + badge parity (`uat.nv0002@xe.vn` / trsport) | Web portal J-HRM-* browser |
| APK SHA `94DCCD5B…` (page_size-fix lineage) | Physical device matrix beyond emulator-5554 |
| Prior MOB-UX-08-TEAM UI shell (tab/search/empty) | Row tap → colleague detail navigation (display-only row — deferred) |

**Upstream chain:**

| Stage | Evidence | Verdict |
|-------|----------|---------|
| Prior UI QC | [`qc-mob-ux-08-team-20260609.md`](qc-mob-ux-08-team-20260609.md) | GWC — **GWC-DIR-NIP-01** + **GWC-DIR-ROWS-01** OPEN |
| Dev-BE API | [`mob-w7-5-directory-be-20260609.md`](mob-w7-5-directory-be-20260609.md) | `view=directory` jest **37/37** |
| Dev-BE QA | [`mob-w7-5-directory-qa-20260609.md`](mob-w7-5-directory-qa-20260609.md) | VAL-W7-DIR-01..03 PASS local |
| DevOps deploy | [`d-mob-w7-5-directory-deploy-20260609.md`](d-mob-w7-5-directory-deploy-20260609.md) | **GWC-DIR-NIP-01 CLOSED** — probe exit 0 |
| Dev-mobile pagesize | [`mob-w7-5-directory-pagesize-fix-20260609.md`](mob-w7-5-directory-pagesize-fix-20260609.md) | page_size cap + visible API errors |
| QA-device R2 | [`mob-w7-5-directory-nipio-device-rerun-20260609.md`](mob-w7-5-directory-nipio-device-rerun-20260609.md) | **GWC-DIR-ROWS-01 CLOSED** |
| Machine JSON | [`mob-w7-5-directory-nipio-device-rerun-20260609.json`](mob-w7-5-directory-nipio-device-rerun-20260609.json) | `total_match: true`, UI rows=14 badges=7 |
| UI dumps | [`mob-w7-5-directory-screens/`](mob-w7-5-directory-screens/) | QC spot-audit |

**APK lineage:** `hrm-mobile-qa-device.apk` · **68,842,709 B** · SHA-256 `94DCCD5BC08DD71EE0339C5401487F88BCB5CAC9A84ED74E678EAB8FF5F4F2B7`

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/mob-w7-5-directory-nipio-device-rerun-20260609.md
# exit 1 — 6/8 checks (2026-06-09 QC audit)
# FAIL: work_item_id, ack_status, command_table, portal_url, crud_or_matrix, residual_section
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Same mobile-device slice class as [`qc-mob-ux-08-team-20260609.md`](qc-mob-ux-08-team-20260609.md) and [`qc-pcomp-w8-mob-residual-r4-01-20260609.md`](qc-pcomp-w8-mob-residual-r4-01-20260609.md):

| Failed check | QC ruling |
|--------------|-----------|
| `work_item_id` / `ack_status` | **Format** — table uses `**field**` not `field:` colon form verifier expects |
| `command_table` | **Format** — adb/node scripts documented; verifier expects `pnpm run` prefix table |
| `portal_url` | **N/A mobile device** — `api_base` `https://14-225-217-232.nip.io` documented |
| `crud_or_matrix` | **N/A mobile UX slice** — GWC-DIR-ROWS-01 matrix + API probe present |
| `residual_section` | **Format** — handoff lists deferred row-nav; no `## Residual` heading in QA pack |

Material pack present: GWC matrix, API probe JSON, machine booleans, screenshots/XML, logcat scope audit, valid handoff — **auditable**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Emulator `emulator-5554` + APK SHA `94DCCD5B…` verified | ENV / L2.5 | **PASS** |
| nip.io pilot `https://14-225-217-232.nip.io` | ENV | **PASS** |
| Persona `uat.nv0002@xe.vn` / trsport slug UUID scope | ENV / L2.5 | **PASS** — `x-company-id` ≠ `main` |
| **GWC-DIR-NIP-01** deploy `view=directory` | ENV/deploy | **CLOSED** — [`d-mob-w7-5-directory-deploy-20260609.md`](d-mob-w7-5-directory-deploy-20260609.md) HRM-EMP-DIR-200 total=207 |
| **GWC-DIR-NIP-01** probe post-deploy | ENV/API | **PASS** — no HRM-VAL-001 |
| **GWC-DIR-ROWS-01** API total=207 | PRODUCT/API | **PASS** — `directoryTotal=207` `total_match=true` |
| **GWC-DIR-ROWS-01** UI 14 rows + 7 badges + chips | PRODUCT / L2.5 | **CLOSED** — non-empty list, filter chips counts >0 |
| **J-MOB-30-TAB** Đội nhóm populated path | PRODUCT / L2.5 | **PASS** |
| **J-MOB-30-UI** search + chips + date hint | PRODUCT / L2.5 | **PASS** — inherited MOB-UX-08-TEAM + R2 corroboration |
| Tap row → detail | PRODUCT / nav | **DEFER** — `TeamDirectoryRow` display-only; out of MOB-W7-5 closure scope |
| Logcat HRM-VAL-001 / FATAL | Stability | **PASS** — absent |

**Product NO-GO avoided:** Both GWC conditions from prior MOB-UX-08-TEAM QC are device-verified closed on unified APK lineage.

---

## L2.5 — Journey audit (device @ nip.io emulator)

### Primary — MOB-W7-5 final closure

| Journey | Requirement | QA R2 | JSON / evidence | QC verdict |
|---------|-------------|-------|-----------------|------------|
| **J-MOB-30** | Team tab → populated directory + search + chips + badges @ trsport | PASS | rows=14 badges=7 `total_match=true` | **PASS — device CLOSED** |

### Conditions lifted (prior MOB-UX-08-TEAM QC)

| Condition | Prior state | Closure evidence | QC verdict |
|-----------|-------------|------------------|------------|
| **GWC-DIR-NIP-01** | OPEN | Deploy + probe exit 0 | **CLOSED** |
| **GWC-DIR-ROWS-01** | OPEN | R2 device rows+badges | **CLOSED** |

### Inherited UI (MOB-UX-08-TEAM — not re-run this gate)

| Journey | Prior QC | QC ruling |
|---------|----------|-----------|
| **J-MOB-30** tab/search/empty shell | [`qc-mob-ux-08-team-20260609.md`](qc-mob-ux-08-team-20260609.md) | **REAFFIRMED** — data path now closed |

---

## Defect / condition adjudication

| ID | Severity | Class | State | QC ruling |
|----|----------|-------|-------|-----------|
| **GWC-DIR-NIP-01** | P1 | ENV/deploy | **CLOSED** | Deploy evidence + probe exit 0 |
| **GWC-DIR-ROWS-01** | P1 | PRODUCT/data | **CLOSED** | R2 — 14 rows + 7 badges vs API 207 |
| **R-DIR-DETAIL-01** | P2 | PRODUCT/nav | OPEN | **DEFER** — row tap no navigation; backlog MOB-UX-08+ |
| **C-W8-DEVICE-01** | Process | Device | CARRY | **CARRY** — emulator-only matrix |
| **C-W8QC-PACK-02** | Process | Format | CARRY | **CARRY** — pack format normalization |

No P0/P1 blockers for J-MOB-30 directory list promotion.

---

## Journey map sync

`PROGRAM_JOURNEY_MAP.md` row **J-MOB-30** updated:

- **J-MOB-30** — team directory tab **✅ device CLOSED** MOB-W7-5 [`qc-mob-w7-5-directory-final-20260609.md`](qc-mob-w7-5-directory-final-20260609.md) — prior UI [`qc-mob-ux-08-team-20260609.md`](qc-mob-ux-08-team-20260609.md); GWC conditions lifted

---

## Verdict summary

| Decision | Scope |
|----------|-------|
| **GO (scoped)** | **J-MOB-30** team directory **device CLOSED** @ nip.io emulator |
| **CLOSED** | **GWC-DIR-NIP-01** deploy · **GWC-DIR-ROWS-01** populated rows |
| **DEFER** | **R-DIR-DETAIL-01** row→detail navigation |
| **CARRY** | **C-W8-DEVICE-01** · **C-W8QC-PACK-02** |
| | **NOT Phase 1 DONE** / **NOT PROD** |

---

## Residual (program — outside J-MOB-30 list closure)

| ID | Owner | Trigger |
|----|-------|---------|
| **R-DIR-DETAIL-01** | dev-mobile | Add `onPress` / nav on `TeamDirectoryRow` when PM scopes colleague detail |
| **C-W8-DEVICE-01** | qa-device | Physical device matrix expansion |
| **C-W8QC-PACK-02** | qa-device | Pack format normalization (`verify:qc:evidence-pack` 8/8) |
| **D-W8-ESS-PROMISE-01** | dev-mobile | Promise snackbar/font — expiry 2026-06-14 |

---

## Handoff

**completion_report:** MOB-W7-5-DIRECTORY-QC-FINAL **GO (scoped)**. Audited full chain: prior MOB-UX-08-TEAM GWC → devops deploy (**GWC-DIR-NIP-01 CLOSED**) → pagesize-fix APK → qa-device R2 (**GWC-DIR-ROWS-01 CLOSED**). Pack verify **6/8** process-only (mobile slice N/A). JSON spot-audit: API total=207, UI 14 rows + 7 attendance badges, scope UUID, no HRM-VAL-001. **J-MOB-30 device CLOSED** — directory list slice promotable. Row→detail nav deferred **R-DIR-DETAIL-01**.

**next_owner:** `pm`

**next_dispatch_prompt:**

```
PM intake MOB-W7-5-DIRECTORY-QC-FINAL PASS_TO_PM (GO scoped).

Closed: J-MOB-30 team directory device CLOSED @ nip.io — evidence docs/qa/evidence/qc-mob-w7-5-directory-final-20260609.md. GWC-DIR-NIP-01 + GWC-DIR-ROWS-01 lifted.

Mark MOB-W7-5 / MOB-UX-08-TEAM directory items [x] in PHASE1_PRODUCT_COMPLETION_TODO if listed.

Journey map J-MOB-30 row updated ✅ device CLOSED.

Next dispatch (priority):
1) Carry R-DIR-DETAIL-01 to dev-mobile backlog when colleague detail in scope.
2) Program gates — NOT Phase 1 DONE / NOT PROD; continue W8+ mobile residual or next PM_OPEN_BACKLOG item.
3) Carry: D-W8-ESS-PROMISE-01, C-W8QC-PACK-02, C-W8-DEVICE-01.
```

**evidence_path:** `docs/qa/evidence/qc-mob-w7-5-directory-final-20260609.md`

**ack_status:** `PASS_TO_PM`

---

## Amendment (2026-06-09 — R-DIR-DETAIL-01-QC supersedes defer)

| ID | Prior state (this file) | Superseded by | New state |
|----|-------------------------|---------------|-----------|
| **R-DIR-DETAIL-01** | **DEFER** — row tap no navigation | [`qc-r-dir-detail-01-20260609.md`](qc-r-dir-detail-01-20260609.md) | **CLOSED** — J-MOB-30 ext row→detail device-verified @ nip.io |

List slice (**J-MOB-30** tab populated path) verdict unchanged. Journey map **J-MOB-30** row updated with ext CLOSED cite.
