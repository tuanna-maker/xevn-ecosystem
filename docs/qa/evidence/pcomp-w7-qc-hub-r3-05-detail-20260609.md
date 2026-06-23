# PCOMP-W7-QC-HUB-R3-05-DETAIL — J-MOB-09 device promotion @ nip.io

| Field | Value |
|-------|-------|
| **work_item_id** | `PCOMP-W7-QC-HUB-R3-05-DETAIL` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-06-09 |
| **decision** | **GO WITH CONDITIONS (reduced)** — **J-MOB-09 device L2.5 CLOSED**; hub R3-05 detail wave promotable nip.io emulator; **C-W7QC-DEVICE-01 J-MOB-09 slice CLOSED** |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope (bounded — hub R3-05 detail @ nip.io emulator)

| In scope | Out of scope |
|----------|--------------|
| **J-MOB-09** full device L2.5: «Ai nghỉ hôm nay (1)» → tap Huỳnh → «Chi tiết nghỉ» fields | Phase 1 DONE / `verify:product:completion` program exit |
| **J-MOB-06/07/08** hub regression on same APK scroll | PROD cutover / store release |
| **D-W8-ESS-PROMISE-01** no promise snackbar on Home | Web portal embed J-HRM-* browser |
| Cold boot after `pm clear` (APK-02 boot fix chain) | J-AVT-02 native avatar picker (separate track) |
| Account `uat.nv0001@xe.vn` / `xevn-uat-2026` @ `https://14-225-217-232.nip.io` | Full Gradle release rebuild (MAX_PATH) |

**Upstream QA:** `docs/qa/evidence/pcomp-w7-qa-hub-r3-05-detail-rerun-20260609.md`  
**Machine JSON:** `docs/qa/evidence/pcomp-w7-qa-hub-r3-05-detail-rerun-20260609.json`  
**UI dumps:** `docs/qa/evidence/pcomp-w7-qa-hub-r3-05-detail-rerun-screens/`  
**Evidence chain:** R3-05-RERUN FAIL → `PCOMP-W7-MOB-WHOS-DETAIL-01` → detail rerun PASS

| Chain step | Artifact | QC audit |
|------------|----------|----------|
| R3-05-RERUN FAIL | `pcomp-w7-qa-hub-r3-05-rerun-20260609.md` | Boot PASS; detail «Không tìm thấy đơn» — root cause documented |
| APK-02 boot fix | `pcomp-w8-mob-home-portal-apk-02-20260609.md` | Cold boot PASS reaffirmed R3-05-DETAIL |
| WHOS-DETAIL-01 fix | `pcomp-w7-mob-whos-detail-01-20260609.md` | `employeeId` pass-through; vitest 188/188 |
| Detail rerun PASS | `pcomp-w7-qa-hub-r3-05-detail-rerun-20260609.md` | J-MOB-09 full PASS; JSON `pass: true` |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w7-qa-hub-r3-05-detail-rerun-20260609.md
# exit 1 — 4/8 checks (2026-06-09 QC audit)
# FAIL: ack_status (format), command_table (exit codes), portal_url, residual_section
```

**QC adjudication:** **PROCESS NOTE — not product NO-GO.** Failures are **format / slice-appropriate** for mobile device pack (consistent with `pcomp-w8-mob-ess-dash-qc-01`, `pcomp-w7-qc-hub-04b-r3`):

| Failed check | QC ruling |
|--------------|-----------|
| `ack_status` | **Format** — table has `**PASS_TO_PM**`; verifier expects colon-line variant |
| `command_table` | **Format** — commands listed with inline exit notes; missing normalized PASS/FAIL column |
| `portal_url` | **N/A mobile** — `api_base` nip.io documented; no web portal probe in device slice |
| `residual_section` | **Format** — residuals in `pm_dispatch_hint` + completion_report; no `## Residual` heading |

Material pack present: exit criteria matrix 8/8, journey table J-MOB-06..09, API probe who=1, XML dumps + PNG, JSON machine results, valid handoff fields — **auditable**.

---

## Classification (ENV vs PRODUCT)

| Signal | Type | QC verdict |
|--------|------|------------|
| Emulator `emulator-5554` + adb install qa-device APK | ENV | **PASS** |
| nip.io API `holding` hub probe tasks=10 mgr=2 cel=3 who=1 | ENV / contract | **PASS** |
| Cold boot after `pm clear` — no «App entry not found» | PRODUCT / APK-02 | **PASS** |
| Deep-link login `home_reached=true` | ENV / L2.5 | **PASS** |
| **J-MOB-09** section «Ai nghỉ hôm nay (1)» | PRODUCT / L2.5 | **PASS** — `whos-scroll.xml` |
| **J-MOB-09** tap Huỳnh whos-out row → detail | PRODUCT / L2.5 | **PASS** — `whos-detail.xml`: «Chi tiết nghỉ», Từ ngày, Đã duyệt, Huỳnh Văn An; **no** «Không tìm thấy đơn» |
| **J-MOB-06/07/08** hub regression scroll | PRODUCT / L2.5 | **PASS** — JSON + aggregate XML |
| **D-W8-ESS-PROMISE-01** no promise snackbar | PRODUCT / UX | **PASS** on this APK session |
| Prior R3-05-RERUN «Không tìm thấy đơn» | PRODUCT (fixed) | **CLOSED** — WHOS-DETAIL-01 |
| **J-AVT-02** native picker upload | Separate wave | **OUT OF SCOPE** — remains **C-W4QC-AVT-MOB-01** / **C-W7QC-DEVICE-01** J-AVT slice |
| `findContainsBounds('Huỳnh')` automation false-negative | SCRIPT | **Not product** — birthday avatar y≈1599 vs whos-out y≈1982; manual tap substantiated |

**Product NO-GO avoided:** Prior P0 detail empty state closed; leave_id `6c887177-…` resolves with colleague `employeeId` filter.

---

## L2.5 — J-MOB audit (device @ nip.io emulator)

| Journey | Requirement | QA R3-05-DETAIL | QC verdict | Evidence |
|---------|-------------|-------------------|------------|----------|
| **J-MOB-01** | Login → Home ≤60s | PASS | **PASS (reaffirmed)** | Deep-link intent exit 0 |
| **J-MOB-06** | «Việc cần làm» visible | PASS | **PASS** | `detail-rerun-scroll-*.xml` |
| **J-MOB-07** | «Cần duyệt (2)» = API mgr=2 | PASS | **PASS** | JSON `device=2 api=2` |
| **J-MOB-08** | «Sinh nhật hôm nay» + avatars; no birth year | PASS | **PASS** | JSON `api_cel=3 noYear=true` |
| **J-MOB-09** | «Ai nghỉ hôm nay (n≥1)» section | PASS | **PASS** | `whos-scroll.xml` section `(1)` |
| **J-MOB-09** | Tap whos-out row → LeaveRequestDetail fields | PASS | **PASS** | `whos-detail.xml` + `whos-detail.png` |
| **D-W8-ESS-PROMISE-01** | No unhandled promise snackbar | PASS | **PASS** | Logcat + scroll audit |
| **J-AVT-02** | Profile → native picker → save | Not run | **DEFERRED** | Separate QC track |

**Journey map:** J-MOB-09 → **device PASS QC CLOSED** (this gate); `PROGRAM_JOURNEY_MAP.md` synced.

---

## Condition closure

| Condition | Prior state | QC verdict |
|-----------|-------------|------------|
| **C-W7QC-DEVICE-01** J-MOB-09 slice | OPEN since R3-02 | **CLOSED** — full L2.5 device PASS R3-05-DETAIL |
| **C-W7QC-DEVICE-01** J-AVT-02 slice | OPEN | **REMAINS OPEN** — out of this wave scope |
| R3-05-RERUN detail empty state | FAIL | **CLOSED** |
| D-W8-ESS-PROMISE-01 (this session) | GWC carry | **PASS** on qa-device APK — prior GWC device note may remain until ess-w8 cross-APK audit |

---

## GO WITH CONDITIONS (reduced) — explicit scope

### Promotable (this wave)

- **J-MOB-09 device L2.5** @ nip.io emulator, qa-device APK SHA `C2F76C2C…56FBA`
- **J-MOB-06/07/08** hub regression on same artifact (reaffirmed)
- **D-W8-ESS-PROMISE-01** PASS on this session

### Not promoted / residual

| ID | Owner | Notes |
|----|-------|-------|
| **J-AVT-02** | `qa-device` + `dev-mobile` | **C-W4QC-AVT-MOB-01** — native picker not device-closed |
| **C-W7QC-DEVICE-01** (J-AVT slice only) | `qa-device` | J-MOB-09 slice **closed**; umbrella remains until J-AVT-02 PASS |
| **C-W8-DEVICE-01** | `dev-mobile` | PORTAL-APK-01 track — separate from this gate |
| Program exit | PM | **NOT Phase 1 DONE** / **NOT PROD-READY** |

---

## completion_report

- Audited evidence chain R3-05-RERUN FAIL → WHOS-DETAIL-01 → R3-05-DETAIL PASS; root cause and fix concurred.
- Spot-read `whos-detail.xml`: «Chi tiết nghỉ», Từ ngày, Đã duyệt, Huỳnh Văn An present; «Không tìm thấy đơn» **absent**.
- **J-MOB-09 device L2.5 PROMOTED**; `PROGRAM_JOURNEY_MAP.md` synced with QC reference.
- **C-W7QC-DEVICE-01 J-MOB-09 slice CLOSED**.
- Pack verify **4/8** — process format only; material pack auditable.
- **Residual:** **J-AVT-02** / **C-W7QC-DEVICE-01** J-AVT slice remains open.

## next_owner

`pm` — sync `PM_ORCHESTRATION_STATE.json` / `TEAM_LIVE_STATUS.md`; optional dispatch J-AVT-02 or W8 queue

## next_dispatch_prompt

```
work_item_id: PCOMP-W7-PM-JMAP-SYNC-01
from_role: pm
to_role: pm
lane: governance

entry_criteria:
- PCOMP-W7-QC-HUB-R3-05-DETAIL PASS_TO_PM — J-MOB-09 device GO GWC reduced
- C-W7QC-DEVICE-01 J-MOB-09 slice CLOSED; J-AVT-02 residual open

action:
1. Update PM_ORCHESTRATION_STATE.json — note C-W7QC-DEVICE-01 partial close (J-AVT-02 only)
2. Update TEAM_LIVE_STATUS.md + PHASE1_PRODUCT_COMPLETION_TODO PCOMP-W7-QA-HUB-04b → [x] J-MOB-09
3. Dispatch qa-device J-AVT-02 retest OR advance PCOMP-W8-MOB-ESS-LEAVE-01-R3 per backlog priority

exit_criteria:
- bus PM -> ALL summary; no duplicate QC dispatch R3-05-DETAIL
```

## evidence_path

`docs/qa/evidence/pcomp-w7-qc-hub-r3-05-detail-20260609.md`

## ack_status

**PASS_TO_PM**
