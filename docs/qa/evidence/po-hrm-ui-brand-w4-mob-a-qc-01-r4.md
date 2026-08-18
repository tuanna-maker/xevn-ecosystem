# PO-HRM-UI-BRAND-W4-MOB-A-QC-01-R4 — W4 mobile brand device gate (observe-only)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-QC-01-R4` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-05 |
| **mode** | **Observe-only** — no device re-run; audit QA R4 vs QC R3 conditions + APK-02 lineage |
| **decision** | **GO WITH CONDITIONS** — cold-start login chrome + new SoT hash; GPS mutate + FE adb login still open |
| **ack_status** | **PASS_TO_PM** |

## Honesty locks (mandatory — QC enforced)

| Flag | Required | QC observed in R4 chain |
|------|----------|-------------------------|
| **face_live** | false | **false** — no LIVE claim; MOB-04b not re-run (inherits R3 honesty) |
| **remaster_program_done** | false | **false** |
| **product_go** | false | **false** |
| **attendance_closed** | false | **false** — C-MOB-04 OPEN (no POST 2xx on device) |

**Forbidden claims (this gate):** Face LIVE · remaster program DONE · product GO · Attendance CLOSED · full J-MOB-01 UF without FE login — **none granted** by QC R4.

---

## Upstream

| Stage | Evidence | Verdict |
|-------|----------|---------|
| Prior QC | [`po-hrm-ui-brand-w4-mob-a-qc-01-r3.md`](po-hrm-ui-brand-w4-mob-a-qc-01-r3.md) | GWC — C-SHA-SOT (EB65FD6F) · C-LOGIN-DEEPLINK OPEN · C-MOB-04 OPEN |
| Build SoT | [`po-hrm-ui-brand-w4-mob-a-apk-02.md`](po-hrm-ui-brand-w4-mob-a-apk-02.md) | READY — SHA `8CE49FF2…` · **71615020** B |
| Device R4 | [`po-hrm-ui-brand-w4-mob-a-qa-01-r4.md`](po-hrm-ui-brand-w4-mob-a-qa-01-r4.md) | **PASS_WITH_OBS** |

---

## Conditions register — R4 adjudication

| ID | Prior QC (R3) | R4 QA evidence | QC R4 status | Notes |
|----|---------------|----------------|--------------|-------|
| **C-SHA-SOT** | CLOSED — `EB65FD6F…` · 71614240 B | Pre-install **MATCH** `8CE49FF25D76F690775DFB4B19B41FC6BF681F11C1D350F8823FC17734A4F765` · **71615020** B · install exit 0 · **APK-02** supersedes APK-01 | **CLOSED** (re-bound) | SoT lineage **updated** to post–FE-LOGIN-01 rebuild; stale `EB65FD6F` **must not** be used for new gates |
| **C-LOGIN-DEEPLINK** | OPEN — cold start hid login | `pm clear` → `login-screen-root`, `branded-login-card`, `login-email` visible · `login-0.png` | **CLOSED** (chrome) | Session-restore blocker from R3 **resolved** on APK-02 |
| **C-LOGIN-ADB** | N/A (folded into deeplink) | `adb input text` — email placeholder unchanged · **qa-login OBS** for downstream · `login-filled.xml` | **OPEN / OBS** | U65 **FE-only login → home** not demonstrated without deeplink; separate from chrome closure |
| **C-MOB-04b** | CLOSED (R3 device) | Not re-run R4 | **CLOSED** (carry) | Face honesty unchanged; **face_live=false** |
| **C-MOB-04** | OPEN | GPS path blocked (permission overlay / timing); retest exit 0 but submit not enabled; **no** `POST /attendance/records` **2xx** in release logcat | **OPEN** | Mutate proof still missing on **8CE49FF2** build |

**Summary:** **C-SHA-SOT** re-closed on **new hash**; **cold-start login chrome** closed; **C-MOB-04** and **C-LOGIN-ADB** remain before strict mobile UF / attendance mutate GO.

---

## APK lineage audit (APK-02)

| Field | Dev SoT (`apk-02`) | QA R4 | QC ruling |
|-------|-------------------|-------|-----------|
| **sha256** | `8CE49FF25D76F690775DFB4B19B41FC6BF681F11C1D350F8823FC17734A4F765` | **MATCH** (pre-install logged) | **Accept** |
| **size_bytes** | `71615020` | `71615020` | **Accept** |
| **Prior APK-01** | `EB65FD6F…` · 71614240 | Explicitly superseded | **Accept** — promotions must cite **8CE49FF2** |

**QC:** All bounded chrome promotions in R4 apply to **APK-02** on `emulator-5554` only.

---

## Journey / MOB matrix — QC promotion (R4)

| ID / journey | R4 QA | QC promoted? | Condition |
|--------------|-------|--------------|-----------|
| **APK-SoT** | PASS | **Yes** | C-SHA-SOT closed on 8CE49FF2 |
| **MOB-01** cold login chrome | PASS | **Yes** | C-LOGIN-DEEPLINK (chrome) |
| **MOB-04b** | (carry R3) | **Yes (carry)** | C-MOB-04b; not re-run |
| **J-MOB-02** FAB sheet | PASS | **Yes** | SoT-bound APK-02 |
| **J-MOB-01-home** brand testIDs | PASS | **Yes (chrome)** | After session (incl. qa-login OBS) |
| **J-MOB-01-login** FE adb → home | PARTIAL | **No** | **C-LOGIN-ADB** OPEN/OBS |
| **MOB-04** GPS POST 2xx | FAIL | **No** | **C-MOB-04** |
| **face_live** policy | PASS | **Yes (governance)** | Not product GO |

**Reject:** Full **J-MOB-01** end-to-end UF; **product GO**; **remaster DONE**; **Face LIVE**; **attendance CLOSED**.

**Accept (bounded):** W4 **Precision Motion chrome** (cold branded login, home bars, FAB sheet) on **SoT APK-02** with artifacts under `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r4/`.

---

## L-layer (observe-only)

| Layer | R4 cite | QC |
|-------|---------|-----|
| **L0** | Pilot `GET /api/hrm/` **200** (`14.225.217.232:3001`) | **Accept** |
| **L1** | No regression claim vs prior vitest baseline (QA statement) | **Accept** — unchanged |
| **L2.5 J-MOB** | J-MOB-02 **PASS**; J-MOB-01 login **PARTIAL** (adb + OBS) | **GWC** — strict UF blocked |

U65: **no seed** in R4 — **Accept**. `qa-login` OBS used after adb failure — **documented**; **not** equivalent to sole FE-only PASS for **C-LOGIN-ADB**.

---

## QC decision

| Gate | Status |
|------|--------|
| W4 mobile brand **device chrome** on **APK-02** (`8CE49FF2…`) | **GO WITH CONDITIONS** |
| **Cold-start branded login** (post `pm clear`) | **GO** (C-LOGIN-DEEPLINK chrome) |
| **MOB-04b** Face honesty (carry R3) | **GO** (unchallenged) |
| **MOB-04** GPS `POST /attendance/records` **2xx** on device | **NOT GO** |
| **FE adb login** without deeplink | **NOT GO** (OBS) |
| **Full GO** / product GO / remaster DONE / Face LIVE | **Denied** |

---

## completion_report

Observe-only audit of `po-hrm-ui-brand-w4-mob-a-qa-01-r4.md` against `po-hrm-ui-brand-w4-mob-a-qc-01-r3.md` and `po-hrm-ui-brand-w4-mob-a-apk-02.md`. **Re-bound C-SHA-SOT** to SHA256 **8CE49FF2…** (71615020 B). **Closed C-LOGIN-DEEPLINK** for cold-start login chrome after FE-LOGIN-01 rebuild. **Kept open C-MOB-04** (no POST 2xx on pilot from device). **Opened/observed C-LOGIN-ADB** (adb typing failed; qa-login OBS for matrix continuation). **Reaffirmed** bounded chrome GWC; **denied** remaster DONE, Face LIVE, product GO, and full mobile UF closure.

**Residual for PM:** MOB-04 network proof on **same SoT APK**; optional FE adb login helper for strict U65 login path.

---

## next_owner

`pm` → `dev-mobile` (**PO-HRM-UI-BRAND-W4-MOB-A-MOB04-NET-01** or equivalent) · optional `dev-fe` (**PO-HRM-UI-BRAND-W4-MOB-A-FE-ADB-LOGIN-01**)

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-MOB04-NET-01
from_role: pm
to_role: dev-mobile
priority: P0
entry_criteria: po-hrm-ui-brand-w4-mob-a-qc-01-r4.md C-MOB-04 OPEN; SoT APK SHA 8CE49FF25D76F690775DFB4B19B41FC6BF681F11C1D350F8823FC17734A4F765 installed on qa-device seat; pilot :3001 L0 200
issue: GPS check-in on emulator-5554 — no POST /attendance/records 2xx captured on release build (logcat silent); FAB→check-in sometimes blocked by notification permission overlay; retest could not enable GPS submit
exit_criteria: Zero-seed GPS submit as uat.nv0001@xe.vn → auditable POST /attendance/records 2xx (OkHttp/__DEV__ QA log hook, mitm, or qa-device-only network trace) on **same SHA 8CE49FF2…** APK; screenshot + log excerpt; dismiss/handle permission overlay in qa-device script if needed
read_first: po-hrm-ui-brand-w4-mob-a-qa-01-r4.md §MOB-04 · retest-gps.png · _tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r4-retest.json
cấm: seed · DB fake attendance · face_live · product_go · claiming C-MOB-04 closed without 2xx on 8CE49FF2 build
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-mob04-net-01.md
U65: mutate from app UI only; no seed
pm_dispatch_hint: qa-device re-run MOB-04 after dev-mobile trace lands — work_item PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R5 optional

---

work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-FE-ADB-LOGIN-01
from_role: pm
to_role: dev-fe
priority: P2
entry_criteria: po-hrm-ui-brand-w4-mob-a-qc-01-r4.md C-LOGIN-ADB OPEN/OBS; MOB-01 cold chrome PASS on APK-02
issue: adb input text does not replace login-email placeholder (dev URL panel focus)
exit_criteria: login-email accepts UIAutomator/setText or default focus allows adb login matrix without xevn://qa-login
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-fe-adb-login-01.md
cấm: seed · claiming J-MOB-01 UF closed without FE path
```

---

**ack_status:** `PASS_TO_PM`
