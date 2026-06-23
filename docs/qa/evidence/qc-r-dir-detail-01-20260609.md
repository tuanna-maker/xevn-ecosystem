# R-DIR-DETAIL-01-QC — Team directory row → colleague detail device gate @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `R-DIR-DETAIL-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **decision** | **GO (scoped)** — **R-DIR-DETAIL-01** row→detail **device CLOSED**; **J-MOB-30 ext** promotable @ nip.io emulator |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — R-DIR-DETAIL-01 / J-MOB-30 extension)

| In scope | Out of scope |
|----------|--------------|
| **J-MOB-30 ext** tab **Đội nhóm** → row tap → **Thông tin nhân viên** detail (Phòng ban, Chức danh) → back preserves search + filter chips | Phase 1 DONE / `verify:product:completion` program exit |
| Persona `uat.nv0002@xe.vn` / `trsport` @ nip.io | PROD cutover / store release |
| APK SHA `8063446E…` (unified qa-device lineage post MOB-APK-UNIFY-R1) | Physical device matrix beyond emulator-5554 |
| Lifts prior **R-DIR-DETAIL-01** defer from [`qc-mob-w7-5-directory-final-20260609.md`](qc-mob-w7-5-directory-final-20260609.md) | Web portal J-HRM-* browser |
| Inherited **J-MOB-30** list slice (MOB-W7-5) — not re-run | Multi-row detail matrix / edit colleague |

**Upstream chain:**

| Stage | Evidence | Verdict |
|-------|----------|---------|
| Dev-mobile | [`r-dir-detail-01-20260609.md`](r-dir-detail-01-20260609.md) | READY_FOR_QA — vitest **245/245**; `TeamColleagueDetailScreen` + `fetchEmployeeDirectoryDetail` |
| APK unify | [`mob-apk-unify-r1-20260609.md`](mob-apk-unify-r1-20260609.md) | Canonical SHA `8063446E…` |
| QA-device | [`r-dir-detail-01-qa-device-20260609.md`](r-dir-detail-01-qa-device-20260609.md) | **PASS_TO_PM** — L2.5 device @ nip.io |
| UI dumps | [`r-dir-detail-01-screens/`](r-dir-detail-01-screens/) | QC spot-audit `rdir-detail.xml`, `rdir-back.xml` |
| Prior list QC | [`qc-mob-w7-5-directory-final-20260609.md`](qc-mob-w7-5-directory-final-20260609.md) | **J-MOB-30** list CLOSED; **R-DIR-DETAIL-01** was DEFER → **CLOSED** this gate |

**APK lineage:** `hrm-mobile-qa-device.apk` · **68,849,340 B** · SHA-256 `8063446E2E51528A273C79D92C6D40594DABD22126D586680194052148993BED`

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/r-dir-detail-01-qa-device-20260609.md
# exit 1 — 5/8 checks (2026-06-09 QC audit)
# FAIL: work_item_id, ack_status, command_table, portal_url, crud_or_matrix
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Same mobile-device slice class as [`qc-mob-w7-5-directory-final-20260609.md`](qc-mob-w7-5-directory-final-20260609.md):

| Failed check | QC ruling |
|--------------|-----------|
| `work_item_id` / `ack_status` | **Format** — table uses `**field**` not `field:` colon form verifier expects |
| `command_table` | **Format** — adb/node scripts documented; verifier expects `pnpm run` prefix table |
| `portal_url` | **N/A mobile device** — `api_base` `https://14-225-217-232.nip.io` documented |
| `crud_or_matrix` | **N/A read-only nav slice** — row tap → detail display; no C/R/U/D in wave |

Material pack present: machine JSON booleans all true, UIAutomator XML (list/detail/back), APK SHA verify, `## Residual` section, valid handoff — **auditable**.

**Process carry (resolved C-W8QC-PACK-02):** PNGs **on disk** at `r-dir-detail-01-screens/` (4 files); `verify:qc:evidence-pack --check-assets` PASS; `--check-git` FAIL until `git add`. QC spot-audit may use XML or PNG.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Emulator `emulator-5554` + APK SHA `8063446E…` | ENV / L2.5 | **PASS** |
| nip.io pilot `https://14-225-217-232.nip.io` | ENV | **PASS** |
| Persona `uat.nv0002@xe.vn` / trsport slug | ENV / L2.5 | **PASS** |
| Login deep-link `home_reached: true` | ENV / L2.5 | **PASS** |
| **J-MOB-30 ext** list screen loads (`team-directory-screen`) | PRODUCT / L2.5 | **PASS** — inherited MOB-W7-5 |
| Row tap → `team-colleague-detail` / title **Thông tin nhân viên** | PRODUCT / L2.5 | **PASS** — spot XML |
| Detail fields Phòng ban **CNTT**, Chức danh **HR SPECIALIST** | PRODUCT / data | **PASS** — `rdir-detail.xml` |
| Hardware back → search + chips **Tất cả** / **Đã chấm** preserved | PRODUCT / L2.5 | **PASS** — `rdir-back.xml` |
| Masked email `u***@xe.vn` (ESS viewer policy) | PRODUCT / policy | **PASS** — expected |
| Smoke script `tmp-r-dir-detail-01-smoke.mjs` exit 0 | Process | **PASS** |
| PNG screenshots missing from repo | Process | **CARRY** — **C-W8QC-PACK-02** |

**Product NO-GO avoided:** L2.5 cross-nav row→detail→back verified with machine JSON + UIAutomator XML corroboration.

---

## L2.5 — Journey audit (device @ nip.io emulator)

### Primary — R-DIR-DETAIL-01 wave

| Journey | Requirement | QA | XML / evidence | QC verdict |
|---------|-------------|-----|----------------|------------|
| **J-MOB-30 ext** | Đội nhóm → row tap → colleague detail → back preserves search/chips | PASS | `rdir-list.xml`, `rdir-detail.xml`, `rdir-back.xml` | **PASS — device CLOSED** |

### Inherited (not re-run this gate)

| Journey | Prior QC | QC ruling |
|---------|----------|-----------|
| **J-MOB-30** list + badges + search/chips | [`qc-mob-w7-5-directory-final-20260609.md`](qc-mob-w7-5-directory-final-20260609.md) | **REAFFIRMED** — list slice remains CLOSED |

---

## Defect / condition adjudication

| ID | Severity | Class | Prior state | QC ruling |
|----|----------|-------|-------------|-----------|
| **R-DIR-DETAIL-01** | P2 | PRODUCT/nav | **DEFER** (MOB-W7-5 QC) | **CLOSED** — row nav device-verified |
| **GWC-DIR-NIP-01** | P1 | ENV/deploy | CLOSED | **REAFFIRMED** |
| **GWC-DIR-ROWS-01** | P1 | PRODUCT/data | CLOSED | **REAFFIRMED** |
| **C-W8-DEVICE-01** | Process | Device | CARRY | **CARRY** — emulator-only matrix |
| **C-W8QC-PACK-02** | Process | Format | CARRY | **CARRY** — pack format + missing PNG refs |
| **D-W8-ESS-PROMISE-01** | P1 UX | PRODUCT | OPEN | **CARRY** — unrelated; expiry 2026-06-14 |

No P0/P1 blockers for R-DIR-DETAIL-01 / J-MOB-30 extension promotion.

---

## Supersedes prior defer (qc-mob-w7-5-directory-final)

[`qc-mob-w7-5-directory-final-20260609.md`](qc-mob-w7-5-directory-final-20260609.md) § Residual listed **R-DIR-DETAIL-01** as **DEFER** (display-only row). This gate **CLOSES** that defer with device evidence above. List slice verdict unchanged.

---

## Journey map sync

`PROGRAM_JOURNEY_MAP.md` row **J-MOB-30** updated:

- **J-MOB-30** — team directory tab **✅ device CLOSED** MOB-W7-5 + **ext ✅ row→detail CLOSED** R-DIR-DETAIL-01 — this QC file

---

## Verdict summary

| Decision | Scope |
|----------|-------|
| **GO (scoped)** | **R-DIR-DETAIL-01** + **J-MOB-30 ext** row→detail **device CLOSED** @ nip.io emulator |
| **CLOSED** | **R-DIR-DETAIL-01** (lifts MOB-W7-5 defer) |
| **CARRY** | **C-W8-DEVICE-01** · **C-W8QC-PACK-02** · **D-W8-ESS-PROMISE-01** |
| | **NOT Phase 1 DONE** / **NOT PROD** |

---

## Residual (program — outside R-DIR-DETAIL-01 slice)

| ID | Owner | Trigger |
|----|-------|---------|
| **C-W8-DEVICE-01** | qa-device | Physical device matrix expansion |
| **C-W8QC-PACK-02** | qa-device | Pack format normalization + attach PNG screenshots to device packs |
| **D-W8-ESS-PROMISE-01** | dev-mobile | Promise snackbar/font — expiry 2026-06-14 |

---

## Handoff

**completion_report:** R-DIR-DETAIL-01-QC **GO (scoped)**. Audited QA-device chain: dev-mobile vitest 245/245 → unified APK SHA `8063446E…` → qa-device smoke exit 0. Pack verify **5/8** process-only (mobile slice N/A). Spot XML: `team-colleague-detail`, **Thông tin nhân viên**, Phòng ban CNTT, Chức danh HR SPECIALIST; back preserves search + filter chips. **R-DIR-DETAIL-01 CLOSED** — lifts defer from MOB-W7-5 QC. **J-MOB-30 ext device CLOSED**. Journey map synced.

**next_owner:** `pm`

**next_dispatch_prompt:**

```
PM intake R-DIR-DETAIL-01-QC PASS_TO_PM (GO scoped).

Closed: R-DIR-DETAIL-01 row→detail device CLOSED @ nip.io — evidence docs/qa/evidence/qc-r-dir-detail-01-20260609.md. J-MOB-30 ext synced on PROGRAM_JOURNEY_MAP.md. Prior defer lifted from qc-mob-w7-5-directory-final-20260609.md.

Mark R-DIR-DETAIL-01 [x] in PHASE1_PRODUCT_COMPLETION_TODO if listed.

Next dispatch (priority):
1) MOB-APK-UNIFY-R1-QA if not yet device-verified on unified SHA for D-W8-ESS-PROMISE-01 persona.
2) Program gates — NOT Phase 1 DONE / NOT PROD; continue PM_OPEN_BACKLOG top item.
3) Carry: C-W8QC-PACK-02 (attach PNG to device packs), C-W8-DEVICE-01, D-W8-ESS-PROMISE-01.
```

**evidence_path:** `docs/qa/evidence/qc-r-dir-detail-01-20260609.md`

**ack_status:** `PASS_TO_PM`
