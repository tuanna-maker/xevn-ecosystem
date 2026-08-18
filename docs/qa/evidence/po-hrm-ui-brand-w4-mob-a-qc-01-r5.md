# PO-HRM-UI-BRAND-W4-MOB-A-QC-01-R5 — W4 mobile brand device gate (observe-only)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-QC-01-R5` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-05 |
| **mode** | **Observe-only** — no device re-run; audit QA R6-LOGIN vs QC R4 conditions + APK-04 lineage |
| **decision** | **GO WITH CONDITIONS** — chrome + **C-LOGIN-ADB** + **C-MOB-04** closed (OBS host); residual **FE-BASEURL-ADB** open |
| **ack_status** | **PASS_TO_PM** |

## Honesty locks (mandatory — QC enforced)

| Flag | Required | QC observed in R5/R6 chain |
|------|----------|----------------------------|
| **face_live** | false | **false** — UI MVP «chưa golive»; C-MOB-04b carry; no LIVE claim |
| **remaster_program_done** | false | **false** |
| **product_go** | false | **false** |
| **attendance_closed** | false | **false** — C-MOB-04 network 2xx **closed with OBS**; Attendance **module** not CLOSED |

**Forbidden claims (this gate):** Face LIVE · remaster program DONE · product GO · Attendance CLOSED (module) · full mobile UF GO without base-URL residual note — **none granted** by QC R5.

---

## Upstream

| Stage | Evidence | Verdict |
|-------|----------|---------|
| Prior QC | [`po-hrm-ui-brand-w4-mob-a-qc-01-r4.md`](po-hrm-ui-brand-w4-mob-a-qc-01-r4.md) | GWC — C-SHA-SOT (8CE49FF2) · C-LOGIN-ADB OPEN · C-MOB-04 OPEN · chrome |
| FE login fix | [`po-hrm-ui-brand-w4-mob-a-fe-adb-login-02.md`](po-hrm-ui-brand-w4-mob-a-fe-adb-login-02.md) | READY — APK-04 candidate SHA `C415E592…` |
| Device R6 | [`po-hrm-ui-brand-w4-mob-a-qa-01-r6-login.md`](po-hrm-ui-brand-w4-mob-a-qa-01-r6-login.md) | **PASS_WITH_OBS** |
| Logcat SoT | `screens/…/r6-login/mob04-fin-logcat.txt` | `ok=true` · `HRM-ATT-201` · `http=201` |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | QC handling |
|--------|-------|-------------|
| Host L0 login **201** (`uat.nv0001`) + `adb reverse` | ENV OK | Accept stack for device wave |
| FE adb login → home; no HRM-VAL-001 | PRODUCT ACCEPT | Closes **C-LOGIN-ADB** |
| GPS POST **201** on pilot `:3001` (logcat) | PRODUCT ACCEPT (bounded) | Closes **C-MOB-04** with OBS |
| `login-dev-base-url` adb does not bind React `baseUrl` | PRODUCT residual | **OPEN** → `FE-BASEURL-ADB-01` — does **not** reopen C-MOB-04 when 2xx proven |
| `uat.nv0001` same-day **HRM-ATT-001** | PRODUCT OBS (data uniqueness) | Not blocker; 201 proven on `uat.nv0010` |
| QA R6 pack verify `residual_section` name miss | PROCESS OBS | QC pack below consolidates; not product NO-GO |

---

## Conditions register — R5 adjudication

| ID | Prior QC (R4) | R6 QA evidence | QC R5 status | Notes |
|----|---------------|----------------|--------------|-------|
| **C-SHA-SOT** | CLOSED — APK-02 `8CE49FF2…` | Pre-install **MATCH** `C415E592F8D91CC256F1A87735162D583EF47D753D19B64E5A3756F66E006EDB` · install exit 0 · **APK-04** | **CLOSED** (re-bound) | SoT lineage **updated** to APK-04; stale `8CE49FF2` / `EB65FD6F` / `E51C977C` **must not** gate new promotions |
| **C-LOGIN-DEEPLINK** | CLOSED (chrome) | Cold chrome still demonstrated on APK-04 (R6 cold-start screen) | **CLOSED** (carry chrome) | Unchanged |
| **C-LOGIN-ADB** | OPEN / OBS | FE adb `uat.nv0001@xe.vn` · email ≠ placeholder · no **HRM-VAL-001** · **J-MOB-01 home** · **not** `xevn://qa-login` sole | **CLOSED** | U65 FE-only login path met on device |
| **C-MOB-04b** | CLOSED (carry R3) | Not re-run R6; honesty locks held | **CLOSED** (carry) | **face_live=false** |
| **C-MOB-04** | OPEN — no POST 2xx | Logcat `[HRM-MOB] attendance/records POST ok=true code=HRM-ATT-201 http=201` · persona `uat.nv0010` · host pilot `14.225.217.232:3001` | **CLOSED with OBS** | Per stamp policy: **do not** require `10.0.2.2:28001` when 2xx logcat proven; host preference / adb base-url bind remains under **FE-BASEURL-ADB-01** |
| **C-MOB-04 host / FE-BASEURL** | (folded into C-MOB-04) | `login-dev-base-url` adb fill **FAIL/OBS** — session stayed on pilot | **OPEN** (named residual) | Separate from C-MOB-04 close; blocks emulator→host reverse proof only |

**Summary:** R4 opens **C-LOGIN-ADB** + **C-MOB-04** are **closed** on **APK-04**. Chrome GWC continues. Residual **FE-BASEURL-ADB-01** remains before claiming full mobile UF / local-host matrix without OBS.

---

## APK lineage audit (APK-04)

| Field | FE SoT (`fe-adb-login-02`) | QA R6 | QC ruling |
|-------|----------------------------|-------|-----------|
| **sha256** | `C415E592F8D91CC256F1A87735162D583EF47D753D19B64E5A3756F66E006EDB` | **MATCH** (install-time) | **Accept** |
| **Prior APK-02** | `8CE49FF2…` | Explicitly superseded | **Accept** — promotions must cite **C415E592** |
| **Path** | `apps/mobile/hrm-mobile/dist/hrm-mobile-qa-device.apk` | Installed `emulator-5554` | **Accept** |

**QC:** All bounded promotions in R5 apply to **APK-04** on `emulator-5554` only.

---

## Journey / MOB matrix — QC promotion (R5)

| ID / journey | R6 QA | QC promoted? | Condition |
|--------------|-------|--------------|-----------|
| **APK-SoT** | PASS | **Yes** | C-SHA-SOT re-bound APK-04 |
| **MOB-01** cold login chrome | PASS | **Yes** | C-LOGIN-DEEPLINK chrome carry |
| **J-MOB-01-login** FE adb → home | PASS (`uat.nv0001`) | **Yes** | **C-LOGIN-ADB CLOSED** |
| **J-MOB-01-home** after FE login | PASS | **Yes** | Same |
| **J-MOB-02** FAB sheet | PASS (device JSON) | **Yes** | SoT-bound APK-04 |
| **MOB-04b** | (carry) | **Yes (carry)** | C-MOB-04b; face_live=false |
| **MOB-04** GPS POST 2xx | PASS (logcat finish; pilot + nv0010) | **Yes (with OBS)** | **C-MOB-04 CLOSED with OBS** |
| **MOB-04** base URL `10.0.2.2:28001` | FAIL / OBS | **No** | Residual **FE-BASEURL-ADB-01** |
| **face_live** policy | PASS | **Yes (governance)** | Not product GO |

**Reject:** Full mobile UF GO without residual note · **product GO** · **remaster DONE** · **Face LIVE** · **Attendance module CLOSED**.

**Accept (bounded):** W4 device chrome + **FE adb login home** + **GPS check-in network 2xx** (pilot host, APK-04) with screens under `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r6-login/`.

---

## Spot-check (observe-only — no re-run)

| Check | Result |
|-------|--------|
| `mob04-fin-logcat.txt` | Contains `POST http://14.225.217.232:3001/api/hrm/attendance/records` + `ok=true code=HRM-ATT-201 http=201` |
| Screens disk | `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r6-login/cold-start.png` · `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r6-login/login-filled.png` · `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r6-login/post-login.png` · `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r6-login/mob04-fin-gps.png` present |
| Device JSON (first script) | `C-LOGIN-ADB-close:PASS` · first-pass `C-MOB-04-post-2xx:FAIL` (nv0001 / capture race) — **superseded** by finish logcat SoT |
| QA pack `verify:qc:evidence-pack` | **1/8** fail — section titled «Observations / residuals» not `## Residual` → **PROCESS OBS**; QC file self-satisfies pack |

---

## L-layer (observe-only)

| Layer | R6 cite | QC |
|-------|---------|-----|
| **L0** | Host hrm-api login **201**; pilot API used for mutate | **Accept** |
| **L1** | Contract via device POST **201** `HRM-ATT-201` | **Accept** (device) |
| **L2.5 J-MOB** | J-MOB-01 login+home **PASS**; J-MOB-02 FAB **PASS**; MOB-04 2xx **PASS w/ OBS** | **GWC** — base URL residual blocks “full UF without note” |

U65: **no seed** in R6 — **Accept**. qa-login **not** used for login PASS — **Accept**.

---

## QC decision

| Gate | Status |
|------|--------|
| W4 mobile brand **device chrome** on **APK-04** (`C415E592…`) | **GO WITH CONDITIONS** |
| **C-LOGIN-ADB** FE adb → J-MOB-01 home | **GO** (CLOSED) |
| **C-MOB-04** GPS `POST /attendance/records` **2xx** logcat | **GO WITH OBS** (CLOSED; pilot host) |
| **C-MOB-04b** Face honesty | **GO** (carry) |
| Emulator local base URL adb → `10.0.2.2:28001` | **NOT GO** — residual FE-BASEURL |
| **Full GO** / product GO / remaster DONE / Face LIVE / Attendance CLOSED | **Denied** |
| **NOT Phase 1 DONE** | Explicit |

---

## Residual

| ID | Owner | Priority | Note |
|----|-------|----------|------|
| **PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-01** | `dev-mobile` | P1 | Controlled `login-dev-base-url` — adb does not update React `baseUrl`; blocks reliable host reverse matrix |
| **PO-HRM-UI-BRAND-W4-MOB-A-MOB04-NV0001-DUP** | ops/QA note | P3 OBS | nv0001 same-day duplicate **HRM-ATT-001**; use alternate persona for 201 proof (done) |
| Process OBS | QA (optional rename) | — | R6 MD add `## Residual` heading for pack script |

**No residual** that reopens **C-LOGIN-ADB** or **C-MOB-04** under stamp policy above.

---

## completion_report

Observe-only audit of `po-hrm-ui-brand-w4-mob-a-qa-01-r6-login.md` against `po-hrm-ui-brand-w4-mob-a-qc-01-r4.md` and APK-04 SoT SHA **C415E592…006EDB**. **Re-bound C-SHA-SOT** to APK-04. **Closed C-LOGIN-ADB** (FE adb `uat.nv0001@xe.vn` → home, no VAL-001, not qa-login sole). **Closed C-MOB-04 with OBS** on logcat `HRM-ATT-201` / `http=201` (persona `uat.nv0010`, pilot host) — **not** requiring `10.0.2.2` for this close. **Carried C-MOB-04b** + chrome GWC. **Left open FE-BASEURL-ADB-01**. **Denied** remaster DONE, Face LIVE, product GO, Attendance module CLOSED, and full mobile UF without base-URL residual note. **NOT Phase 1 DONE**.

---

## next_owner

`pm` → `dev-mobile` (**PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-01**) — residual only; no P0 reopen of C-LOGIN-ADB / C-MOB-04

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-01
from_role: pm
to_role: dev-mobile
priority: P1
entry_criteria: po-hrm-ui-brand-w4-mob-a-qc-01-r5.md GWC — C-LOGIN-ADB CLOSED · C-MOB-04 CLOSED with OBS (pilot 2xx); residual OPEN base URL adb bind; SoT APK-04 SHA C415E592F8D91CC256F1A87735162D583EF47D753D19B64E5A3756F66E006EDB
issue: login-dev-base-url is controlled FormField — adb input text does not update React baseUrl; session stays on pilot http://14.225.217.232:3001; blocks emulator→host http://10.0.2.2:28001 matrix without rebuild/env
exit_criteria: uncontrolled/sync seam for login-dev-base-url (same pattern as LoginCredentialField) OR documented Settings path to set http://10.0.2.2:28001; vitest + note for qa-device R7 host reverse proof
read_first: po-hrm-ui-brand-w4-mob-a-qa-01-r6-login.md §OBS · mob04-local-base-filled.xml · po-hrm-ui-brand-w4-mob-a-fe-adb-login-02.md
cấm: seed · face_live · remaster_program_done · product_go · claiming Attendance CLOSED · making qa-login sole login PASS · reopening C-MOB-04 without regression of HRM-ATT-201 logcat contract
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-baseurl-adb-01.md
U65: FE-only; no seed
pm_dispatch_hint: after READY_FOR_QA → qa-device optional R7 host-reverse smoke only — not full brand re-gate
```

---

**ack_status:** `PASS_TO_PM`
