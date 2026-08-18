# PO-HRM-UI-BRAND-W4-MOB-A-QC-01-R3 — W4 mobile brand device gate (observe-only)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-QC-01-R3` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-05 |
| **mode** | **Observe-only** — no device re-run; audit QA R3 vs prior QC conditions |
| **decision** | **GO WITH CONDITIONS** — chrome + SoT lineage improved; login + GPS mutate proof still open |
| **ack_status** | **PASS_TO_PM** |

## Honesty locks (mandatory — QC enforced)

| Flag | Required | QC observed in R3 chain |
|------|----------|-------------------------|
| **face_live** | false | **false** — MOB-04b honesty; no LIVE claim |
| **remaster_program_done** | false | **false** |
| **product_go** | false | **false** |
| **attendance_closed** | false | **false** — GPS submit exercised; mutate not closed (C-MOB-04) |

**Forbidden claims (this gate):** Face LIVE · remaster program DONE · product GO · Attendance CLOSED — **none granted** by QC R3.

---

## Upstream

| Stage | Evidence | Verdict |
|-------|----------|---------|
| Prior QC | [`po-hrm-ui-brand-w4-mob-a-qc-01.md`](po-hrm-ui-brand-w4-mob-a-qc-01.md) | GWC — C-SHA-SOT · C-LOGIN · C-MOB-04 · C-MOB-04b |
| Device R3 | [`po-hrm-ui-brand-w4-mob-a-qa-01-r3.md`](po-hrm-ui-brand-w4-mob-a-qa-01-r3.md) | PASS_TO_PM GWC |
| APK SoT | [`po-hrm-ui-brand-w4-mob-a-apk-01.md`](po-hrm-ui-brand-w4-mob-a-apk-01.md) | SHA `EB65FD6F…` · 71614240 B |

---

## Conditions register — R3 adjudication

| ID | Prior QC (R2 era) | R3 QA evidence | QC R3 status | Notes |
|----|-------------------|----------------|--------------|-------|
| **C-SHA-SOT** | OPEN — R2 SHA `0568F584…` ≠ SoT | Pre-install **MATCH** `EB65FD6FF658FA2575DDFB7299347CDC2DE4985A2AE5FFDA1CEC5ED78DF5D066` · **71614240** B · install exit 0 | **CLOSED** | Device chrome now **bound to SoT APK** |
| **C-MOB-04b** | OPEN — L1 only on device | Retest exit 0 · `face-mvp-honesty-banner` · `check-in-submit` **enabled=false** · `retest-mob04b.png` | **CLOSED** | **Promoted** device MOB-04b 🟢 (honesty UX) |
| **C-LOGIN-DEEPLINK** | OPEN | Cold start FAB/session · no `login-email` / `branded-login-card` in dumps · **`xevn://qa-login` OBS** (201 probe) | **OPEN** | U65-equivalent **FE-only login not demonstrated** |
| **C-MOB-04** | OPEN | GPS submit tapped · **no** `POST /attendance/records` **2xx** in `retest-gps-logcat.txt` (release APK) | **OPEN** | Mutate proof still missing |

**Summary:** 2 of 4 conditions **closed** on SoT build; **2 remain** before full GO on mobile UF / attendance mutate.

---

## APK lineage audit (post-R3)

| Field | Dev SoT (`apk-01`) | QA R3 | QC ruling |
|-------|-------------------|-------|-----------|
| **sha256** | `EB65FD6F…D066` | **MATCH** (pre-install hash logged) | **Accept** |
| **size_bytes** | `71614240` | `71614240` | **Accept** |
| **Stale R2 hash** | N/A | Explicitly not used | **Accept** |

**QC:** C-SHA-SOT exit criteria **met**. J-MOB-01/02 chrome promotions from R2 are **no longer SHA-gated**; they apply to **SoT APK** on `emulator-5554`.

---

## Journey / MOB matrix — QC promotion (R3)

| ID / journey | R3 QA | QC promoted? | Condition |
|--------------|-------|--------------|-----------|
| **APK-SoT** | PASS | **Yes** | C-SHA-SOT closed |
| **MOB-04b** | PASS device | **Yes** | C-MOB-04b closed |
| **J-MOB-02** FAB sheet | PASS | **Yes (chrome + nav to check-in)** | SoT-bound |
| **J-MOB-01** home brand testIDs | PARTIAL (timing) | **Yes (chrome)** — bounded | IDs on `fab-sheet.xml`; home-only dump flaky |
| **MOB-01 / J-MOB-01-login** FE login → home | PARTIAL | **No** | **C-LOGIN-DEEPLINK** |
| **MOB-04** GPS POST 2xx | PARTIAL | **No** | **C-MOB-04** |
| **face_live** policy | PASS | **Yes (governance)** | Not product GO |

**Reject:** Full **J-MOB-01** end-to-end UF closure; **product GO**; **remaster DONE**; **Face LIVE**.

**Accept (bounded):** W4 **Precision Motion chrome** (home bars, FAB sheet, Face MVP honesty) on **SoT qa-device APK** with artifacts under `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r3/`.

---

## L-layer (observe-only)

| Layer | R3 cite | QC |
|-------|---------|-----|
| **L0** | Pilot `GET /api/hrm/` **200** (`14.225.217.232:3001`) | **Accept** |
| **L1** | No regression vs vitest contract (QA statement) | **Accept** — unchanged baseline |
| **L2.5 J-MOB** | J-MOB-02 **PASS**; J-MOB-01 login **PARTIAL** | **GWC** — login blocks strict UF |

U65: **no seed** in R3 — **Accept**. `qa-login` OBS documented — **not** equivalent to FE-only PASS.

---

## QC decision

| Gate | Status |
|------|--------|
| W4 mobile brand **device chrome** on **SoT APK** | **GO WITH CONDITIONS** |
| **MOB-04b** Face honesty (device) | **GO** (condition closed) |
| Full mobile UF / FE login / GPS mutate 2xx | **NOT GO** |
| **Full GO** / product GO / remaster DONE / Face LIVE | **Denied** |

---

## completion_report

Observe-only audit of `po-hrm-ui-brand-w4-mob-a-qa-01-r3.md` against `po-hrm-ui-brand-w4-mob-a-qc-01.md` conditions. **Closed C-SHA-SOT** and **C-MOB-04b** with auditable hash + retest artifacts. **Kept open C-LOGIN-DEEPLINK** and **C-MOB-04** per R3 PARTIAL rows and logcat gap. **Reaffirmed** bounded chrome promotion on SoT build; **denied** full GO and all forbidden honesty upgrades.

**Residual for PM:** Dispatch FE login fix + MOB-04 network proof (R4 or dev-mobile trace) before strict U65 mobile UF or “W4 mobile UAT-ready” narrative.

---

## next_owner

`pm` → `dev-fe` (**PO-HRM-UI-BRAND-W4-MOB-A-FE-LOGIN-01**) and `qa-device` / `dev-mobile` (**PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R4** or MOB-04 trace)

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-FE-LOGIN-01
from_role: pm
to_role: dev-fe
priority: P1
entry_criteria: po-hrm-ui-brand-w4-mob-a-qc-01-r3.md C-LOGIN-DEEPLINK OPEN; SoT APK EB65FD6F installed
issue: Cold start on qa-device APK restores session/FAB — branded login testIDs (login-email, branded-login-card) not reachable for adb FE login; qa-login OBS used in R3
exit_criteria: Fresh install or logout → cold start exposes branded login UI; uat.nv0001@xe.vn login via app UI → home without xevn://qa-login; screenshot + uiautomator dump with login-email
read_first: po-hrm-ui-brand-w4-mob-a-qa-01-r3.md §MOB-01 · login-0.png
cấm: seed · claiming J-MOB-01 UF closed without FE path
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-mob-fe-login-01.md (or qa R4 cross-ref)
U65: browser/mobile UI path only for login proof

---

work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-QA-01-R4
from_role: pm
to_role: qa-device
priority: P1
entry_criteria: po-hrm-ui-brand-w4-mob-a-qc-01-r3.md C-MOB-04 OPEN; EB65FD6F APK · pilot :3001
issue: GPS check-in submit on device — no POST /attendance/records 2xx captured (release logcat empty)
exit_criteria: Zero-seed GPS submit uat.nv0001@xe.vn → documented POST 2xx via OkHttp logcat, Charles/mitm, or qa-device-only network trace hook on same SoT APK
read_first: retest-gps-logcat.txt · retest-gps-post.png · po-hrm-ui-brand-w4-mob-a-qa-01-r3.md §MOB-04
cấm: seed · DB fake attendance · face_live · product_go
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qa-01-r4.md
pm_dispatch_hint: dev-mobile may supply __DEV__ trace build if proxy impractical — still zero-seed U65
```

---

**ack_status:** `PASS_TO_PM`
