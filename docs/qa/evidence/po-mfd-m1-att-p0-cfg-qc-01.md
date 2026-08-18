# Evidence — `PO-MFD-M1-ATT-P0-CFG-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M1-ATT-P0-CFG-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-04 |
| **lane** | L3 gate — P0 HRM-AT-14 CFG persist (rules + work-sites GPS + D4 stubs) |
| **priority** | P0 |
| **portal_url** | `http://127.0.0.1:5173/hr/attendance?portal=1&companyId=main` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **entry** | QA [`po-mfd-m1-att-p0-cfg-qa-01.md`](po-mfd-m1-att-p0-cfg-qa-01.md) PASS_TO_PM · BE [`po-mfd-m1-att-p0-cfg-be-01.md`](po-mfd-m1-att-p0-cfg-be-01.md) · FE [`po-mfd-m1-att-p0-cfg-fe-01.md`](po-mfd-m1-att-p0-cfg-fe-01.md) · ADR [`ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) |
| **spec_ref** | HRM-AT-14 · ADR D2–D4 · `docs/qa/professional/by-uc/HRM-AT-14.md` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no seed · FE mutate cleanup PATCH restore notify_late · pilot GPS row from UI POST not seed script |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · full Attendance STUB cluster · ScanFace / rules-tab ambiguity · HRM-ATT-GEO-001 check-in · `uat_done` remains **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — bounded P0 CFG slice only: Rules→Chung **PATCH 200** + F5 persist (`notify_late=false` UI + GET) · App→GPS work-site **POST 201** + F5 + GET list has site · D4 sidebars honest stubs (banner + `/settings` link, **no** fake general save) · Face ID GĐ1 banner present. U65 zero-seed honored. Network SoT from `_tmp-po-mfd-m1-att-p0-cfg-qa-01-browser.json` + Rules Chung PNG + Face ID PNG corroborate. GEO-001 check-in not run this seat (allowed CONDITION). GPS screenshot file is byte-identical to Face ID shot (process OBS — does not demote Network POST/F5 PASS).

---

## Entry audit (handoff chain)

| Artifact | ack / claim | QC |
|----------|-------------|-----|
| `docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md` | Accepted · D2 rules table · D3 work-sites SoT · D4 stubs no fake Save · Face ID OUT GĐ1 | **ACCEPT** |
| `docs/qa/evidence/po-mfd-m1-att-p0-cfg-be-01.md` | READY_FOR_QA · GET/PATCH rules · work-sites CRUD · ensureDefaultWorkSite removed (U65) · faceid forced false | **ACCEPT** |
| `docs/qa/evidence/po-mfd-m1-att-p0-cfg-fe-01.md` | READY_FOR_QA · Nest wire · D4 stubs · Face ID banner | **ACCEPT** |
| `docs/qa/evidence/po-mfd-m1-att-p0-cfg-qa-01.md` | PASS_TO_PM · AT-14-01..04 PASS · u65 · uat_done false | **ACCEPT** |
| `_tmp-po-mfd-m1-att-p0-cfg-qa-01-browser.json` | verdict PASS_TO_PM · 4 steps PASS · u65 true · uat_done false | **ACCEPT** |
| Screens `docs/qa/evidence/screens/po-mfd-m1-att-p0-cfg-qa-01/` | **3** PNG on disk | **ACCEPT** with OBS (see EC2) |

---

## Independent spot-check (QC)

### EC1 — Rules→Chung Lưu → PATCH → F5

| Check | Result |
|-------|--------|
| Runtime `AT-14-rules-chung-save-f5` | **PASS** · PATCH `/api/hrm/attendance/rules?company_id=main` **200** · GET after `notify_late=false` · `ui_notify_after=false` |
| Screen | `docs/qa/evidence/screens/po-mfd-m1-att-p0-cfg-qa-01/rules-chung-f5.png` — Chung tab · «Thông báo khi nhân viên đi muộn/về sớm» **unchecked** · Lưu thay đổi visible |
| Cleanup | QA post-test PATCH restore `notify_late=true` — mutate cleanup, **not** seed |

**PASS**

### EC2 — App→GPS work-site add → POST → F5

| Check | Result |
|-------|--------|
| Runtime `AT-14-gps-work-site-crud` | **PASS** · POST `/api/hrm/attendance/work-sites` **201** · `visible_after_add` · `visible_after_f5` · GET work-sites **200** · `api_has_site=true` · site `QA-GPS-e86a38` |
| Screen `docs/qa/evidence/screens/po-mfd-m1-att-p0-cfg-qa-01/gps-app-f5.png` | App tab · GPS method **Đang bật** · Face ID banner — **does not show** work-site row; **SHA256 identical** to `docs/qa/evidence/screens/po-mfd-m1-att-p0-cfg-qa-01/faceid-app-tab.png` |
| Honesty | Network + JSON SoT holds product PASS; duplicate PNG = **OBS process P3** |

**PASS** (product) · **OBS** (PNG GPS row visual gap)

### EC3 — D4 stub sidebars (no fake-green LIVE save)

| Sidebar | Runtime | FE code | QC |
|---------|---------|---------|-----|
| Quy định làm thêm | stub_visible · `fake_save=false` · settings_link | `att-cfg-stub-overtime` Alert + `/settings` only | **PASS** |
| Quy định nghỉ | same | `att-cfg-stub-leave-rules` | **PASS** |
| Quy định đi muộn - về sớm | same | `att-cfg-stub-late-early` | **PASS** |
| Quy định làm đơn | same | `att-cfg-stub-request-rules` | **PASS** |

FE `Attendance.tsx` D4 path returns Alert redirect only — **no** `att-rules-general-save` on stub sidebars. QA harness asserts `fake_save=false`.

**PASS** — no fake-green LIVE save on D4 stubs.

### EC4 — Face ID GĐ1 banner

| Check | Result |
|-------|--------|
| Runtime `AT-14-faceid-readonly` | **PASS** · `banner=true` · toggle `n/a` (not rendered) |
| Screen | `docs/qa/evidence/screens/po-mfd-m1-att-p0-cfg-qa-01/faceid-app-tab.png` — banner «Face ID — ngoài phạm vi GĐ1» · method «Chưa hỗ trợ» |
| ADR D4 | Face ID OUT GĐ1 · column false · UI disabled/banner | **aligned** |

**PASS**

### EC5 — U65 / must_keep honesty

| Check | Result |
|-------|--------|
| Seed | QA + BE + FE + QC: **no** `pnpm seed:*` · no DB fake inbox |
| Mutate path | Browser UI → Nest PATCH/POST only |
| Pilot GPS row | Real FE POST artifact `QA-GPS-e86a38` — documented residual, not seed cheat |
| OOS seats | ScanFace / rules-tab ambiguity / full STUB cluster — **not claimed** |
| `uat_done` | **false** |

**PASS**

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this P0 | QC |
|---------|------------------|-----|
| **J-HRM-06** surface (attendance embed → Thiết lập → Quy định → Chung ↔ App) | In-scope CFG persist cross-nav | **PASS** this seat (subtab click · no 404/409 on rules/work-sites) |
| **J-HRM-06b** sheet grid | Out of this P0 | **untouched / not claimed** |
| HRM-ATT-GEO-001 check-in inside/outside | Optional CONDITION (dispatch) | **DEFERRED** · owner qa-device / clock-in wave |
| Full Attendance STUB cluster | Out of scope | **not claimed** |

Mandatory in-scope for this gate: **AT-14 rules persist + GPS admin add + D4 honest stubs + Face ID banner** **PASS**. No untested mandatory J-* claimed PASS beyond this slice. Full Phase1 journey closure **not** claimed.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Chung PATCH **200** + F5 `notify_late=false` · work-sites POST **201** + F5 + GET has site · D4 stubs no fake save · Face ID GĐ1 banner |
| **PROCESS** | QA pack `verify:qc:evidence-pack` **2/8** (missing command_table · residual_section heading) — process-only; GPS PNG byte-identical to Face ID (OBS) — does not demote Network SoT |
| **ENV** | None driving verdict (L0 hrm_api/portal **200** during QA) |
| **OUT-OF-SCOPE / CONDITION** | GEO-001 check-in · customize columns non-persist · ScanFace · rules-tab ambiguity · full STUB cluster · Phase1/UAT DONE |

ENV does not drive verdict. Process pack gap + PNG OBS do **not** demote P0 CFG close.

---

## Residual

| Id | Status | Sev | Owner | Blocks this P0 GO? |
|----|--------|-----|-------|--------------------|
| **R-ATT-CFG-GEO-001** | OPEN CONDITION | P2 | qa-device / clock-in wave | No — optional per dispatch |
| **OBS-ATT-CFG-GPS-PNG-DUP** | OPEN info | P3 | qa | No — re-capture GPS list row on next QA MD |
| **C-ATT-CFG-QA-PACK-FMT-01** | OPEN process | P3 | qa | No — add command_table + `## Residual` on next QA MD |
| Customize columns non-persist | ADR OOS | — | program | No |
| GPS edit-in-place UI | deferred | P3 | dev-fe backlog | No — delete+add only OK for P0 |
| Pilot row `QA-GPS-e86a38` | info | — | ops/qa cleanup optional | No — real FE mutate |
| Phase1 / UAT DONE | — | — | — | No — **not claimed** (`uat_done: false`) |

**No residual product P0** open for this CFG persist slice.

---

## Conditions (explicit)

1. **NOT Phase 1 DONE · NOT product UAT DONE · NOT PROD-READY** from this GWC alone.
2. **GEO-001** check-in inside/outside radius remains **CONDITION** — do not invent PASS.
3. Do **not** reopen CFG persist without new FAIL (PATCH≠2xx / F5 mismatch / POST work-site fail / fake-save on D4).
4. Do **not** claim full Attendance menu STUB cluster closed.
5. Do **not** claim ScanFace / rules-tab ambiguity seats from this gate.
6. U65: **no seed** for CFG evidence; pilot GPS row from FE POST only.
7. OBS GPS PNG duplicate — backlog for next QA visual; Network SoT stands.

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m1-att-p0-cfg-qa-01.md
→ FAIL 2/8 — missing command_table, residual_section
```

**PROCESS GWC** — product browser + runtime independently verified; does not demote P0 close.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m1-att-p0-cfg-qc-01.md
→ PASS exit 0 (8/8) [target after write]
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m1-att-p0-cfg-qc-01.md --check-assets
→ PASS exit 0 · PNG refs OK [target after write]
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m1-att-p0-cfg-qa-01.md` | **FAIL** exit **1** · **2/8** missing command_table / residual_section (process) |
| Disk check 3 PNG under screens/po-mfd-m1-att-p0-cfg-qa-01/ | **PASS** · rules-chung-f5 · gps-app-f5 · faceid-app-tab present |
| Runtime cross-check `docs/qa/evidence/_tmp-po-mfd-m1-att-p0-cfg-qa-01-browser.json` | **PASS** · 4 steps PASS · PATCH 200 · POST 201 · D4 fake_save=false · Face banner · u65 · uat_done false |
| Spot visual `docs/qa/evidence/screens/po-mfd-m1-att-p0-cfg-qa-01/rules-chung-f5.png` | **PASS** · Chung · notify-late unchecked · Lưu |
| Spot visual `docs/qa/evidence/screens/po-mfd-m1-att-p0-cfg-qa-01/faceid-app-tab.png` | **PASS** · Face ID GĐ1 banner · Chưa hỗ trợ |
| Spot visual `docs/qa/evidence/screens/po-mfd-m1-att-p0-cfg-qa-01/gps-app-f5.png` | **OBS** · App tab OK · SHA256=faceid · no work-site row |
| FE code spot D4 stubs `Attendance.tsx` `att-cfg-stub-*` | **PASS** · Alert + settings link only |
| `node scripts/qa/_tmp-po-mfd-m1-att-p0-cfg-qa-01.mjs` (QA prior) | **PASS** (seat evidence; QC observe) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m1-att-p0-cfg-qc-01.md` | **PASS** exit **0** (8/8) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-mfd-m1-att-p0-cfg-qc-01.md --check-assets` | **PASS** exit **0** |

---

## Case / journey matrix (CRUD-or-matrix)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** read-only | stack health | **PASS** | hrm_api/portal 200 |
| **LOGIN** group CEO | `ceo@xe.vn` main | **PASS** | browser JSON env |
| **UPDATE** rules Chung | PATCH 200 + F5 persist | **PASS** | browser JSON · `docs/qa/evidence/screens/po-mfd-m1-att-p0-cfg-qa-01/rules-chung-f5.png` |
| **CREATE** work-site GPS | POST 201 + F5 list | **PASS** | browser JSON Network SoT |
| **READ** work-sites GET | site in list | **PASS** | `api_has_site=true` |
| **D4 stubs** | no fake save · settings link | **PASS** | browser JSON · FE stub Alert |
| **Face ID GĐ1** | banner present | **PASS** | `docs/qa/evidence/screens/po-mfd-m1-att-p0-cfg-qa-01/faceid-app-tab.png` |
| **J-HRM-06** L2.5 | Thiết lập → Quy định Chung↔App | **PASS** | this seat CFG path |
| **GEO-001** | check-in radius | **DEFERRED** | optional CONDITION |
| Customize columns | persist | **OOS** | ADR |

---

## Forbidden compliance (QC)

- No seed
- No rewrite `apps/**`
- Did not invent product UAT / Phase 1 DONE
- Did not invent GEO-001 PASS
- Did not NO-GO solely on QA pack format gap or GPS PNG duplicate OBS
- Did not GO without opening QA MD + runtime JSON + PNG spot-check + ADR D4
- Did not claim full Attendance STUB / ScanFace / rules-tab seats

---

## completion_report

**Closed:** L3 QC gate `PO-MFD-M1-ATT-P0-CFG-QC-01` for P0 HRM-AT-14 CFG persist. Spot-check Network PATCH **200** + F5 Chung · POST work-sites **201** + F5 · D4 stubs honest (no fake-green) · Face ID GĐ1 banner PNG. ADR D2–D4 aligned. U65 zero-seed. **`uat_done: false`**.

**Residual / conditions:** GEO-001 deferred; OBS GPS PNG duplicate P3; QA pack format P3; customize columns OOS; **NOT** Phase1/UAT DONE.

**Verdict:** **GO WITH CONDITIONS**  
**next_owner:** pm  
**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/po-mfd-m1-att-p0-cfg-qc-01.md`

---

## next_dispatch_prompt

```text
work_item_id: PO-MFD-M1-ATT-P0-CFG-QC-01-PM-CLOSE
role: pm
priority: P0
entry_criteria:
  - docs/qa/evidence/po-mfd-m1-att-p0-cfg-qc-01.md Verdict GO WITH CONDITIONS · ack_status PASS_TO_PM
  - P0 CFG persist CLOSED for AT-14 rules + GPS admin add + D4 stubs + Face ID banner
  - GEO-001 optional CONDITION open; uat_done false
action:
  1) Bus INTAKE PO-MFD-M1-ATT-P0-CFG-QC-01 PASS_TO_PM + mark PO-MFD-M1-ATT-P0-CFG wave CLOSED on backlog / TEAM_WORKING_NOW
  2) Promote HRM-AT-14 code_readiness / execution stamp (BA/QA trace) if still open
  3) Continue next open MFD / PM_OPEN_BACKLOG item (ScanFace QA / rules-tab ambiguity / wire-balance QC as already in flight — do not idle)
  4) Do NOT claim product UAT DONE / Phase 1 DONE from this GWC
  5) Optional backlog: R-ATT-CFG-GEO-001 (qa-device/clock-in); OBS-ATT-CFG-GPS-PNG-DUP (qa re-shot); C-ATT-CFG-QA-PACK-FMT-01
cấm: seed · invent GEO-001 PASS · invent UAT DONE · reopen CFG persist without new FAIL
```

---

## pm_dispatch_hint

Close P0 CFG wave; keep GEO-001 as optional; next MFD seats already on bus — continue dispatch.
