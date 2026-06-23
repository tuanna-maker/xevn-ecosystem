# MOB-UX-08-TEAM-QC — Team directory (J-MOB-30) device gate @ nip.io

work_item_id: `MOB-UX-08-TEAM-QC`
ack_status: PASS_TO_PM
api_base / pilot: `https://14-225-217-232.nip.io` (mobile device L2.5)
PORTAL_DEV_URL: N/A — mobile device gate; web portal `http://127.0.0.1:5175` not exercised this slice

| Field | Value |
|-------|-------|
| **work_item_id** | `MOB-UX-08-TEAM-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **decision** | **GO WITH CONDITIONS (reduced)** — **MOB-UX-08-TEAM** / **J-MOB-30** team directory **device promotable** @ nip.io emulator (UI shell + L2.5 interactions) |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — MOB-UX-08-TEAM / J-MOB-30 slice)

| In scope | Out of scope |
|----------|--------------|
| **J-MOB-30** tab **Đội nhóm** → search + filter chips + date hint + empty/row shell | Phase 1 DONE / `verify:product:completion` program exit |
| `TeamDirectoryScreen` UX (SET E · Z-P04) | PROD cutover / store release |
| Search no-match filter; **Chấm công của tôi** footer link | Web portal J-HRM-* browser |
| Regression **J-MOB-02**, **J-MOB-31/33**, **J-MOB-06..15** | **MOB-UX-09** payslip/profile tab relabel backlog |
| Account `uat.nv0001@xe.vn` / `xevn-uat-2026` @ nip.io | Physical device matrix beyond emulator-5554 |
| Local API **MOB-W7-5** directory contract (upstream QA) | Full ZenHR benchmark pixel audit |

**Upstream chain:**

| Stage | Evidence | Verdict |
|-------|----------|---------|
| Dev-BE | [`mob-w7-5-directory-be-20260609.md`](mob-w7-5-directory-be-20260609.md) | `view=directory` API local — jest **37/37** |
| Dev-BE QA | [`mob-w7-5-directory-qa-20260609.md`](mob-w7-5-directory-qa-20260609.md) | PASS_TO_PM local VAL-W7-DIR-01..03 |
| Dev-mobile | [`mob-ux-08-team-20260609.md`](mob-ux-08-team-20260609.md) | READY_FOR_QA — vitest **237/237**; `TeamDirectoryScreen` |
| QA-device | [`mob-ux-08-team-qa-device-20260609.md`](mob-ux-08-team-qa-device-20260609.md) | PASS_TO_PM — L2.5 device @ nip.io |
| Machine JSON | [`mob-ux-08-team-qa-device-20260609.json`](mob-ux-08-team-qa-device-20260609.json) | `pass: true`, `primaryPass: true`, `regPass: true` |
| UI dumps | [`mob-ux-08-team-screens/`](mob-ux-08-team-screens/) (22 XML) | QC spot-audit |
| Spec | [`MOBILE_HRM_ESS_UX_BENCHMARK.md`](../../program/MOBILE_HRM_ESS_UX_BENCHMARK.md) §7.5 SET E · J-MOB-30 | Delta aligned |

**APK lineage:** `hrm-mobile-qa-device.apk` · **72,858,553 B** · SHA-256 `A0D5510B29DBF72676B9E05D50AC63B191FF0857671027EA8C71322AE8B0FEC9`

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/mob-ux-08-team-qa-device-20260609.md
# exit 1 — 2/8 checks (2026-06-09 QC audit)
# FAIL: work_item_id, ack_status, command_table, portal_url, crud_or_matrix, residual_section
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Same mobile-device slice class as [`qc-mob-ux-08-p0-20260609.md`](qc-mob-ux-08-p0-20260609.md) and [`qc-mob-ux-10a-20260609.md`](qc-mob-ux-10a-20260609.md):

| Failed check | QC ruling |
|--------------|-----------|
| `work_item_id` / `ack_status` | **Format** — table uses `**field**` not `field:` colon form verifier expects |
| `command_table` | **Format** — adb/node scripts + JSON `commands[]` present; verifier expects `pnpm run` prefix |
| `portal_url` | **N/A mobile device** — `api_base` `https://14-225-217-232.nip.io` documented |
| `crud_or_matrix` | **N/A mobile UX slice** — L2.5 J-MOB-30 matrix present; no portal CRUD |
| `residual_section` | **Carry in QC** — nip.io deploy + row density documented below |

Material pack present: J-MOB-30 primary matrix, J-* regression table, machine JSON booleans, 22 XML dumps, logcat scope audit, valid handoff block — **auditable**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Emulator `emulator-5554` + qa-device APK SHA `A0D5510B…` | ENV | **PASS** |
| `adb pm clear` + install + SHA verify | ENV / L2.5 | **PASS** |
| Deep-link login `uat.nv0001@xe.vn` | ENV / L2.5 | **PASS** |
| nip.io pilot session UUID `6efaa5d6-a4a8-4bfd-805a-3c4f003e4013` | ENV | **PASS** |
| **J-MOB-30-TAB** Đội nhóm tab | PRODUCT / L2.5 | **PASS** — `team-tab-nav.xml`, `team-directory-main.xml` |
| **J-MOB-30-UI** search + chips + date + check-in link | PRODUCT / L2.5 | **PASS** — JSON `screen/search/chips/date/checkInLink=true` |
| **J-MOB-30-SEARCH-FILTER** no-match | PRODUCT / L2.5 | **PASS** — `team-search-nomatch.xml`; JSON `noMatch=true` |
| **J-MOB-30-ROW-BADGES** empty state | PRODUCT / L2.5 | **PASS (empty path)** — JSON `rows=0` `empty=true`; UI handles zero rows |
| nip.io `view=directory` probe **400 HRM-VAL-001** | ENV / deploy gap | **GWC** — pilot hrm-api pre-deploy; local API PASS |
| Standard list `stdTotal=213` on nip.io | ENV / fallback | **PASS** — mobile fallback path viable |
| Populated row + attendance badge parity | PRODUCT / data | **DEFERRED GWC** — no ≥1 row on device this run |
| Logcat `x-company-id: main` / FATAL | Scope / stability | **PASS** — `hasMainHeader=false` |
| Vitest **237/237** (dev handoff) | Regression | **PASS** |
| **J-MOB-02/31/33** + **J-MOB-06..15** regression | PRODUCT / L2.5 | **PASS** — JSON all `pass: true`; FAB/check-in XML |

**Product NO-GO avoided:** J-MOB-30 UI shell and in-scope regression device-verified. **Not** claiming full directory data fidelity until nip.io deploy + row retest.

---

## Module matrix (read-only — team directory module)

| Op | Module | Scope | Result |
|----|--------|-------|--------|
| **read** | `TeamDirectoryScreen` list | Device L2.5 J-MOB-30 | PASS (empty path) |
| create / update / delete | N/A mobile | Out of slice | N/A |

Upstream API **read** matrix: [`mob-w7-5-directory-qa-20260609.md`](mob-w7-5-directory-qa-20260609.md) VAL-W7-DIR-01..03.

## L2.5 matrix (device — no portal CRUD)

| Journey | Tab / action | Device result | QC |
|---------|--------------|---------------|-----|
| J-MOB-30-TAB | Chấm công → Đội nhóm | PASS | GWC UI CLOSED |
| J-MOB-30-UI | Search + chips + date hint | PASS | GWC |
| J-MOB-30-SEARCH-FILTER | No-match query | PASS | GWC |
| J-MOB-30-ROW-BADGES | Empty state (0 rows) | PASS | GWC — row density deferred |

## L2.5 — Journey audit (device @ nip.io emulator)

### Primary — MOB-UX-08-TEAM wave

| Journey | Requirement | QA | XML / JSON | QC verdict |
|---------|-------------|-----|------------|------------|
| **J-MOB-30** | Team tab → search + filter chips + row/empty + check-in link | PASS | `team-directory-main.xml`, `team-search-nomatch.xml` | **PASS — device GWC** (UI CLOSED; data row GWC) |

### Regression (MOB-UX-08-TEAM build)

| Journey | QA | QC ruling |
|---------|-----|-----------|
| **J-MOB-02** | PASS | **PASS — reaffirmed** check-in FAB/sheet |
| **J-MOB-31** | PASS | **PASS — reaffirmed** pending strip |
| **J-MOB-33** | PASS | **PASS — reaffirmed** FAB action sheet |
| **J-MOB-06..15** | PASS | **PASS — reaffirmed** home portal scroll regression |

### API layer (local — not re-run by QC)

| Layer | Evidence | QC ruling |
|-------|----------|-----------|
| VAL-W7-DIR-01..03 local | [`mob-w7-5-directory-qa-20260609.md`](mob-w7-5-directory-qa-20260609.md) | **ACCEPT upstream PASS** |
| nip.io `view=directory` | HRM-VAL-001 in QA JSON | **GWC-DIR-NIP-01** — devops deploy residual |

---

## Defect / condition adjudication

| ID | Severity | Class | State | QC ruling |
|----|----------|-------|-------|-----------|
| **GWC-DIR-NIP-01** | P1 | ENV/deploy | OPEN | **CONDITION** — deploy `view=directory` DTO to nip.io; re-run `tmp-mob-w7-5-directory-probe.mjs` exit 0 |
| **GWC-DIR-ROWS-01** | P1 | PRODUCT/data | OPEN | **CONDITION** — qa-device retest ≥1 directory row + attendance badge vs API after deploy (`uat.nv0002@xe.vn` / trsport slug per W7-5 QA) |
| **R-DIR-EMPTY-01** | INFO | Data/scope | OPEN | **ACCEPTED this wave** — `uat.nv0001` holding UUID scope + nip.io API gap → empty UI; not UI defect |
| **C-W8-DEVICE-01** | Process | Device | CARRY | **CARRY** — emulator-only matrix |
| **D-W8-ESS-PROMISE-01** | P1 UX | PRODUCT | CARRY | **CARRY** — promise snackbar/font; expiry 2026-06-14 |
| **C-W8QC-PACK-02** | Process | Format | CARRY | **CARRY** — pack format normalization |

No P0 product blockers for MOB-UX-08-TEAM UI promotion.

---

## Journey map sync

`PROGRAM_JOURNEY_MAP.md` row **J-MOB-30** updated:

- **J-MOB-30** — team directory tab **✅ device GWC** MOB-UX-08-TEAM [`qc-mob-ux-08-team-20260609.md`](qc-mob-ux-08-team-20260609.md) — conditions **GWC-DIR-NIP-01** + **GWC-DIR-ROWS-01**

---

## Verdict summary

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS (reduced)** | **MOB-UX-08-TEAM promotable** nip.io emulator — UI shell L2.5 |
| **GO (scoped)** | **J-MOB-30** tab/search/filter/empty **device GWC** |
| | **J-MOB-02/31/33** + **J-MOB-06..15** regression **reaffirmed PASS** |
| **CONDITION** | **GWC-DIR-NIP-01** nip.io deploy · **GWC-DIR-ROWS-01** populated row retest |
| **CARRY** | **C-W8-DEVICE-01** · **D-W8-ESS-PROMISE-01** · **C-W8QC-PACK-02** |
| | **NOT Phase 1 DONE** / **NOT PROD** |

---

## Residual (program — outside MOB-UX-08-TEAM UI closure)

| ID | Owner | Trigger |
|----|-------|---------|
| **GWC-DIR-NIP-01** | devops | Deploy hrm-api `view=directory` to nip.io; probe exit 0 |
| **GWC-DIR-ROWS-01** | qa-device | After deploy — directory row density + badge parity on pilot |
| **MOB-UX-09** | dev-mobile | Payslip/Profile tab relabel backlog |
| **D-W8-ESS-PROMISE-01** | dev-mobile | Promise snackbar/font — expiry 2026-06-14 |
| **C-W8QC-PACK-02** | qa-device | Next mobile wave — pack format normalization |

---

## Handoff

**completion_report:** MOB-UX-08-TEAM-QC **GO WITH CONDITIONS (reduced)**. Audited QA-device chain + MOB-W7-5 local API QA + dev-mobile handoff. Pack verify **2/8** process-only (mobile slice N/A). XML/JSON spot-audit confirms J-MOB-30 tab/search/chips/empty + J-MOB-02/31/33/06..15 regression PASS on APK `A0D5510B…`. nip.io `view=directory` **HRM-VAL-001** — deploy gap not UI fail. **J-MOB-30 device GWC** — MOB-UX-08-TEAM UI slice closed; row-density closure deferred **GWC-DIR-ROWS-01**.

**next_owner:** `pm`

**next_dispatch_prompt:**

```
PM intake MOB-UX-08-TEAM-QC PASS_TO_PM (GO WITH CONDITIONS reduced).

Closed: J-MOB-30 team directory UI device GWC @ nip.io — evidence docs/qa/evidence/qc-mob-ux-08-team-20260609.md. MOB-UX-08-TEAM slice complete for UI shell.

Mark MOB-UX-08-TEAM [x] in sprint backlog / PHASE1_PRODUCT_COMPLETION_TODO if listed.

Journey map J-MOB-30 row updated ✅ device GWC.

Next dispatch (priority):
1) devops MOB-W7-5-DIRECTORY-DEPLOY — nip.io view=directory probe exit 0 (GWC-DIR-NIP-01).
2) qa-device MOB-UX-08-TEAM-ROWS — retest ≥1 row + badge after deploy (GWC-DIR-ROWS-01); persona uat.nv0002@xe.vn trsport slug.
3) Carry: D-W8-ESS-PROMISE-01, C-W8QC-PACK-02, MOB-UX-09 tab relabel.
4) Program gates — NOT Phase 1 DONE / NOT PROD.
```

**evidence_path:** `docs/qa/evidence/qc-mob-ux-08-team-20260609.md`

**ack_status:** `PASS_TO_PM`
