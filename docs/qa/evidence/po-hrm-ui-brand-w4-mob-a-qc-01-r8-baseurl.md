# PO-HRM-UI-BRAND-W4-MOB-A-QC-01-R8-BASEURL — GWC delta; FE-BASEURL CLOSED

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-MOB-A-QC-01-R8-BASEURL` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | `2026-08-05` |
| **mode** | **Observe-only** — no `apps/**` · no device re-run; audit QA R8 + FE-BASEURL-ADB-02 + QC R5 |
| **decision** | **GO WITH CONDITIONS** (GWC delta) — close **FE-BASEURL-ADB / C-LOGIN-ADB-base-url-10.0.2.2**; reaffirm **C-LOGIN-ADB**; **C-MOB-04** stays CLOSED with OBS; chrome GWC continues |
| **ack_status** | **PASS_TO_PM** |
| **api_base** | `http://10.0.2.2:28001` (emulator → host hrm-api; `adb reverse tcp:28001`) |
| **apk_sha256 (APK-06 SoT)** | `5691A9821B502A78CB2D032B1D9D81929D49C1794345FA35C89FCF1663642D18` |

## Honesty locks (mandatory — QC enforced)

| Flag | Required | QC observed |
|------|----------|-------------|
| **face_live** | false | **false** — no LIVE claim; C-MOB-04b carry |
| **remaster_program_done** | false | **false** |
| **product_go** | false | **false** |
| **attendance_closed** | false | **false** — module not CLOSED; C-MOB-04 network claim remains CLOSED with OBS (R5) |

**Forbidden claims (this gate):** Face LIVE · remaster program DONE · product GO · Attendance module CLOSED · Phase 1 DONE · reopening **C-MOB-04** without new 2xx reopen criteria — **none granted**.

---

## Upstream

| Stage | Evidence | Verdict |
|-------|----------|---------|
| Prior QC R5 | [`po-hrm-ui-brand-w4-mob-a-qc-01-r5.md`](po-hrm-ui-brand-w4-mob-a-qc-01-r5.md) | GWC — **C-LOGIN-ADB CLOSED** · **C-MOB-04 CLOSED with OBS** (pilot) · **FE-BASEURL OPEN** · SoT **APK-04** `C415E592…` |
| FE fix | [`po-hrm-ui-brand-w4-mob-a-fe-baseurl-adb-02.md`](po-hrm-ui-brand-w4-mob-a-fe-baseurl-adb-02.md) | READY — above-fold URL + ScrollView + `fillDevBaseUrlField` |
| Device R8 | [`po-hrm-ui-brand-w4-mob-a-qa-01-r8-baseurl.md`](po-hrm-ui-brand-w4-mob-a-qa-01-r8-baseurl.md) | **PASS_WITH_OBS** |
| Machine JSON | `_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r8-baseurl-device.json` | cases PASS + GPS OBS |

---

## Classification (ENV vs PRODUCT)

| Signal | Class | QC handling |
|--------|-------|-------------|
| Host L0 login **201** + `adb reverse tcp:28001` | ENV OK | Accept stack for base-url matrix |
| Mid-band `login-dev-base-url` y=831 + UI text `http://10.0.2.2:28001` | PRODUCT ACCEPT | Closes layout/focus residual from R7 |
| Logcat `[HRM-MOB]` all hosts `10.0.2.2:28001` · `pilotLeak=false` · **0** hits `:3001` / `14.225.217.232` | PRODUCT ACCEPT | Closes **FE-BASEURL-ADB / C-LOGIN-ADB-base-url-10.0.2.2** |
| C-LOGIN-ADB + J-MOB-01 regression (no base-url override) | PRODUCT ACCEPT | Reaffirm CLOSED — not qa-login sole |
| Optional GPS check-in `ok201=false` on local host | PRODUCT OBS (soft) | **Do not reopen C-MOB-04** — R5 pilot 2xx close stands; local GPS 201 not required for this stamp |
| QA R8 pack verify missing `## Residual` / matrix PASS rows | PROCESS OBS | QC pack below consolidates; not product NO-GO |

---

## Conditions register — R8 adjudication

| ID | Prior (R5) | R8 QA evidence | QC R8 status | Notes |
|----|------------|----------------|--------------|-------|
| **C-SHA-SOT** | CLOSED — **APK-04** `C415E592…` (login / MOB-04 wave) | Pre/install **APK-06** `5691A9821B502A78CB2D032B1D9D81929D49C1794345FA35C89FCF1663642D18` ≠ `01456E71…` (APK-05) ≠ `C415E592…` | **CLOSED** (re-bound for **base-url lane**) | Lineage: R5 stamp remains valid on **APK-04** for login+MOB04; **base-url promotions must cite APK-06** |
| **C-LOGIN-DEEPLINK** | CLOSED (chrome carry) | Not in R8 scope | **CLOSED** (carry) | Chrome GWC continues |
| **C-LOGIN-ADB** | CLOSED | Regression PASS · FE adb · home · no VAL-001 · not qa-login | **CLOSED** (reaffirmed) | R8 regression cold start |
| **C-LOGIN-ADB-base-url-10.0.2.2** / **FE-BASEURL-ADB** | **OPEN** | mid-band y=831 · UI bind · logcat hostOk · pilotLeak=false | **CLOSED** | Closes R5 residual + R7 FAIL class |
| **C-MOB-04b** | CLOSED (carry) | honesty locks held | **CLOSED** (carry) | **face_live=false** |
| **C-MOB-04** | CLOSED with OBS (pilot 2xx) | Optional local GPS **OBS** only (`ok201=false`) | **CLOSED with OBS** (unchanged) | **Do not reopen**; local GPS 201 **not** required |

**Summary:** R5 open residual **FE-BASEURL** is **closed** on **APK-06**. Login + MOB-04 closes from R5 remain. Chrome brand GWC continues. No P0 residual on MOB-A base-url lane.

---

## APK lineage audit (APK-06 — base-url lane)

| Wave / stamp | APK label | sha256 (prefix…) | Scope |
|--------------|-----------|------------------|-------|
| QC R5 / QA R6 | **APK-04** | `C415E592F8D91CC256F1A87735162D583EF47D753D19B64E5A3756F66E006EDB` | **C-LOGIN-ADB** + **C-MOB-04** (pilot) — **historical SoT for that stamp** |
| FE-01 / QA R7 | **APK-05** | `01456E71D09A10493372E0E132D12CF3B6DC7CD924674694BEC68B20FA340C3A` | Superseded — layout FAIL (y≈2064) |
| FE-02 / QA R8 / **QC R8** | **APK-06** | `5691A9821B502A78CB2D032B1D9D81929D49C1794345FA35C89FCF1663642D18` | **FE-BASEURL / mid-band bind** — **current SoT for base-url lane** |

**QC:** Do **not** collapse APK-04 login/MOB04 proof into APK-06 without retest. Base-url ACCEPT applies to **APK-06** on `emulator-5554` only.

---

## Commands (observe cite — QA-executed)

| Command / probe | Result |
|-----------------|--------|
| `pnpm run android:apk:qa-device` (junction + `GRADLE_USE_SUBST=1`) | **PASS** — BUILD SUCCESSFUL · APK-06 |
| Host L0 `POST` mobile login `uat.nv0001@xe.vn` → `:28001` | **PASS** — `http=201` |
| `adb reverse tcp:28001 tcp:28001` · `adb install -r -g` | **PASS** |
| `node scripts/qa/_tmp-po-hrm-ui-brand-w4-mob-a-qa-01-r8-baseurl-device.mjs` | **PASS** — primary + regression; GPS OBS |
| Logcat filter `ReactNativeJS: [HRM-MOB]` primary login | **PASS** — 65× `10.0.2.2:28001` · **0** × `:3001` / `14.225.217.232` |

---

## Journey / MOB matrix — QC promotion (R8)

| ID / journey | R8 QA | QC promoted? | Condition |
|--------------|-------|--------------|-----------|
| **APK-SoT (base-url)** | **PASS** | **Yes** | C-SHA re-bound **APK-06** for this lane |
| **C-LOGIN-ADB-base-url-mid-band** | **PASS** (y=831) | **Yes** | Above-fold vs R7 y≈2064 |
| **C-LOGIN-ADB-base-url-field-ui** | **PASS** | **Yes** | UI = `http://10.0.2.2:28001` |
| **C-LOGIN-ADB-base-url-10.0.2.2** | **PASS** | **Yes** | Logcat bind · **FE-BASEURL CLOSED** |
| **J-MOB-01-login-home** (local base) | **PASS** | **Yes** | FE adb on `api_base` |
| **C-LOGIN-ADB** + **J-MOB-01** regression | **PASS** | **Yes** | Reaffirm CLOSED |
| **C-MOB-04** claim | OBS attempt only | **Carry CLOSED with OBS** | No reopen; pilot 2xx SoT remains R5/APK-04 |
| **face_live** policy | **PASS** | **Yes (governance)** | Not product GO |

**L2.5 journey matrix (device slice):**

| Journey | Verdict | Note |
|---------|---------|------|
| **J-MOB-01** login → home (base-url path) | **PASS** | APK-06 · `10.0.2.2:28001` |
| **J-MOB-01** login → home (regression) | **PASS** | Cold start · no base-url override |
| **J-MOB-04** local-host GPS POST 201 | **OBS** | Not promoted; does not reopen C-MOB-04 |

**Reject:** product GO · remaster DONE · Face LIVE · Attendance module CLOSED · Phase 1 DONE · invent C-MOB-04 reopen from GPS OBS.

**Accept (bounded):** Emulator mid-band **dev base URL** adb → React bind → session traffic on host reverse **APK-06**; login regression holds; prior R5 chrome + pilot GPS closes remain under their APK lineage.

---

## Spot-check (observe-only — no re-run)

| Check | Result |
|-------|--------|
| `base-uat.nv0001-url-node.json` | `y=831` · `midBand=true` · `text=http://10.0.2.2:28001` · `uiShowsLocal=true` |
| `base-uat.nv0001-login-logcat.txt` | **65** hits `10.0.2.2:28001` · **0** hits `14.225.217.232` / `:3001` |
| Device JSON cases | `C-LOGIN-ADB-base-url-10.0.2.2:PASS` · `pilotLeak=false` · `C-MOB-04-local-host-OBS:OBS` (`ok201=false`) |
| Screens disk | 15 PNG under `docs/qa/evidence/screens/po-hrm-ui-brand-w4-mob-a-qa-01-r8-baseurl/` (base-* · reg-* · mob04-*) |
| QA pack `verify:qc:evidence-pack` (R8 QA MD) | **2/8** fail (`crud_or_matrix` · `residual_section`) → **PROCESS OBS**; this QC file consolidates |

---

## L-layer (observe-only)

| Layer | R8 cite | QC |
|-------|---------|-----|
| **L0** | Host hrm-api login **201**; `adb reverse` | **Accept** |
| **L1** | Device session GETs/POSTs on `api_base` (logcat) | **Accept** (device) |
| **L2.5 J-MOB** | **J-MOB-01** PASS (base + regression); GPS local **OBS** | **GWC** — base-url residual closed; chrome GWC continues |

U65: **no seed** — **Accept**. qa-login **not** sole login path — **Accept**.

---

## QC decision

| Gate | Status |
|------|--------|
| **FE-BASEURL-ADB / C-LOGIN-ADB-base-url-10.0.2.2** on **APK-06** | **GO** (CLOSED) |
| **C-LOGIN-ADB** regression | **GO** (CLOSED — reaffirmed) |
| **C-MOB-04** | **GO WITH OBS** (CLOSED — unchanged; no reopen) |
| W4 mobile brand **chrome** GWC | **Continues** (carry) |
| Local GPS POST **201** on `10.0.2.2` | **Not required** this stamp |
| **Full GO** / product GO / remaster DONE / Face LIVE / Attendance CLOSED / Phase 1 DONE | **Denied** |
| **NOT Phase 1 DONE** | Explicit |

---

## Residual

| ID | Owner | Priority | Note |
|----|-------|----------|------|
| **PO-HRM-UI-BRAND-W4-MOB-A-MOB04-LOCAL-GPS-OBS** | `qa-device` (optional) | **P2 OBS** | R8 optional local-host check-in did not assert POST **201** (`ok201=false`) — **does not reopen C-MOB-04**; only reopen if sponsor requires local-host mutate proof with new 2xx criteria |
| Chrome brand GWC (web + device chrome carry) | program | carry | Continues from W4 QC — not closed by this base-url delta |
| Process OBS | QA (optional) | — | R8 QA MD add `## Residual` + journey PASS table for pack script |

**P0 residual for MOB-A base-url lane:** **none remaining**.

**Closed this stamp:** `PO-HRM-UI-BRAND-W4-MOB-A-FE-BASEURL-ADB-01` / `FE-BASEURL-ADB-02` device residual · **C-LOGIN-ADB-base-url-10.0.2.2**.

---

## Evidence pack verify (QC file)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qc-01-r8-baseurl.md
# expect exit 0 (8/8)
```

---

## completion_report

Observe-only audit of QA R8 (`PASS_WITH_OBS`) against FE-BASEURL-ADB-02 and QC R5. **Closed FE-BASEURL-ADB / C-LOGIN-ADB-base-url-10.0.2.2** on APK-06 SoT `5691A982…642D18` (mid-band y=831, UI bind `http://10.0.2.2:28001`, logcat hostOk, pilotLeak=false). **Reaffirmed C-LOGIN-ADB CLOSED** (regression PASS, not qa-login). **C-MOB-04 remains CLOSED with OBS** — R8 GPS OBS only; **not reopened**; local GPS 201 not required. **C-SHA note:** APK-06 is SoT for **base-url lane**; R5 login/MOB04 stamp remains on **APK-04**. Chrome GWC continues. Soft **P2 OBS** only for optional local GPS. **Denied** remaster DONE, Face LIVE, product GO, Attendance module CLOSED, Phase 1 DONE. **No P0 residual** on MOB-A base-url lane → PM idle-ok for this lane.

---

## next_owner

`pm` — **idle-ok** for MOB-A **base-url** lane (chrome GWC already held; no P0 reopen). Optional later: P2 local GPS OBS only if sponsor demands local-host mutate proof.

---

## next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A-QC-01-R8-BASEURL (intake)
from_role: qc
to_role: pm
ack_status: PASS_TO_PM
decision: GO WITH CONDITIONS (GWC delta)
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w4-mob-a-qc-01-r8-baseurl.md
closed: FE-BASEURL-ADB / C-LOGIN-ADB-base-url-10.0.2.2 on APK-06 SHA 5691A9821B502A78CB2D032B1D9D81929D49C1794345FA35C89FCF1663642D18
reaffirmed: C-LOGIN-ADB CLOSED · C-MOB-04 CLOSED with OBS (no reopen; R8 GPS OBS only)
lineage: APK-06 = base-url lane SoT · APK-04 (C415E592…) remains R5 login/MOB04 SoT
locks: face_live=false · remaster_program_done=false · product_go=false · attendance_closed=false · NOT Phase1 DONE
idle_ok: MOB-A base-url lane — no P0 residual; chrome GWC continues; optional P2 local GPS OBS only if sponsor requires
cấm: invent remaster/product/attendance GO · reopen C-MOB-04 without new 2xx criteria
```

---

**ack_status:** `PASS_TO_PM`
