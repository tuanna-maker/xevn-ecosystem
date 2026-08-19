# PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01 — API F.1 · F-ATT-RULE-01 RETAIN cite + residual XOR mode/bands/scope/off (Option A PHYSICAL)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (**U89** — Wave-25 seat **#27**) |
| **lane** | governance · sa |
| **change_mode** | **RETAIN cite** **F-ATT-RULE-01** physical **`GET/PATCH /api/hrm/attendance/rules*`** (+ optional `…/late-penalty` **same controller family**) · **RETAIN cite peers** work-sites / work-shifts / late_early / punch / sheet funnel · **ADD residual wire** mode · bands · scope · latePenaltyEnabled/off · display-ready envelope · paper `/att/*` + `/core` **alias only** · Nest `@Controller('core')` **DENY** · **must_keep** PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 DONE · **OUT invent** PAY / printable / Word DONE · **NO CODE** `apps/**` this seat · **no seed** · **preserve_default** · **no migrate invent this seat** |
| **Date** | 2026-08-09 |
| **Status** | **CONFIRMED** — F.1 physical Option A · LIVE CFG/source/shift/funnel **HOLD RETAIN** · mode\|bands\|scope\|off **ABSENT PROVEN** → residual **ADD stamped closable** (DATA-01) → unlock **Dev-BE residual REQUIRED** (not FE-only) · then FE+QA · FE may bind RETAIN peers **parallel** · **DENY** Nest `/core` dual · invent PAY/printable · claim CFG=ATT-02 DONE · ATT module UAT |
| **uc_ids** | `UC-BP-ATT-02` · `FR-UC-BP-ATT-02` |
| **depends_on** | DATA-01 **CONFIRMED HOLD** · residual ADD mode/bands/scope/off stamped closable · BA-01 O1–O12 **CONFIRMED** · SA-01 Option **A LOCKED** · **R-ATT-02-MODE/SCOPE/SRC/EVAL/OFF** · **R-ATT-02-≠-CFG-DONE** · **R-ATT-02-≠-LER-DONE** · **R-ATT-02-≠-UAT** · **R-ATT-02-PAY-OUT** · **R-ATT-02-HONESTY** · printable **false** · QC **`PLT01QC1-MSLPUQIU`** · peer≠PLT DONE · merge≠platform UAT · **`CORE10QC1-MSLP0EJB`** · **`CORE09QC1-MSLNBA89`** printable false · ≠ CORE-09 DONE · **`CORE07QC1-KZJTSHNT`** · soft≠DONE · Nest `/core` DENY · PAY invent DONE **OUT** |
| **ref_data** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md) — HOLD RETAIN spines · residual ADD stamped · display-ready cite |
| **ref_ba** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md) · O1–O12 · AC-ATT-02-* · J-HRM-ATT-02-01..06 DRAFT |
| **ref_sa** | [`PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01.md`](./PO-HRM-MVP-GD1-ATT-02-CLUSTER-SA-01.md) Option A · XOR BR-BP-SHF-02 · paper alias |
| **ref_plt_api** | [`PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-PLT-01-CLUSTER-API-01.md) — MergeToken · stamp `PLT01QC1-MSLPUQIU` |
| **ref_core10_api** | [`PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md) — SI · `CORE10QC1-MSLP0EJB` |
| **ref_core09_api** | [`PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-09-CLUSTER-API-01.md) — printable **false** · ≠ CORE-09 DONE |
| **ref_core07_api** | [`PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md`](./PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md) — GATE/ACT · Nest DENY |
| **ref_srs** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-02** · Diễn biến **#1–#5 + Thành công** · **BR-BP-SHF-02** · partner **TIME-002** |
| **ref_paper_api** | **F-ATT-RULE-01** · **F-ATT-PUNCH-01** · **F-ATT-CAT-WS-*** · **F-ATT-CAT-SHIFT-*** · Nest `@Controller('core')` **ABSENT** · paper `/att/*` + `/core` **alias only** |
| **ref_adr** | SA Option **A** · Nest physical prefer `/api/hrm/attendance/*` · paper `/att` + `/core` alias only · U19 · soft-delete · **DENY** Nest `/core` dual |
| **ref_code_cite** | `attendance.controller` `@Controller('attendance')` `GET/PATCH rules` · work-sites · work-shifts · late-early-requests · `POST records` · sheet aggregate/`late_penalty_hours` · Nest `@Controller('core')` **ABSENT** — **read-only cite** · **no** `apps/**` edit this seat |
| **Honesty** | **`attendance_uat_ready=false`** · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **`contracts_printable_ready=false` RETAIN** · **`hrm_personnel_uat_ready=false`** · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE** · U65 · **DENY** claim round/`notify_late`/đơn = ATT-02 DONE · **DENY** claim CFG alone = FR-02 DONE · **DENY** claim ATT module UAT · **DENY** invent PAY/printable/Word DONE · **DENY** claim PLT/CORE DONE · honesty flip |
| **ba-data** | **ALREADY CONFIRMED HOLD** + residual ADD stamped closable — this seat **does not** invent migrate · Dev migrate **only after** this F.1 + BE unlock · prefer soft cols on `attendance_rules` and/or specificity ≡ paper `att_attendance_rule` |
| **ack_status** | **PASS_TO_PM CONFIRMED** |
| **unlock_lane** | **BE residual REQUIRED** (mode/bands/scope/off ABSENT · closable) → then FE+QA · FE RETAIN-peer bind **may parallel** |

---

## 1. Verdict — **CONFIRMED**

| Decision | Stamp |
|----------|--------|
| CFG rules SoT | **ONE RETAIN** Nest **`public.attendance_rules`** on **`GET/PATCH /api/hrm/attendance/rules`** — round · methods · `notify_late` — **≠** FR-02 DONE alone · **DENY wipe** |
| **F-ATT-RULE-01** | **RETAIN cite** physical prefer extend **`GET/PATCH /api/hrm/attendance/rules`** · optional **`PATCH …/rules/late-penalty`** **same `@Controller('attendance')` family** · paper `PATCH /api/hrm/att/rules/late-penalty` + `/core/…` = **alias only** |
| Peers | **RETAIN cite** work-sites · work-shifts · late_early_requests (**≠ mode SoT**) · punch geofence · sheet `late_penalty_hours` |
| **R-ATT-02-MODE** | **IN-SCOPE residual ADD** — XOR `minute`\|`block`\|`tier`/`band` · `bands[]` · reject mixed · BR-BP-SHF-02 |
| **R-ATT-02-SCOPE** | **IN-SCOPE residual ADD** — dept+shift > dept > company > shift default · DENY company-only final SoT forever |
| **R-ATT-02-OFF** | **IN-SCOPE residual ADD** — `latePenaltyEnabled` explicit · disable → penalty **0** · **`notifyLate` ≠ off** |
| **R-ATT-02-SRC** | **RETAIN deepen** — gps/wifi/qr + work-sites · device/máy **HOLD if ABSENT** |
| **R-ATT-02-EVAL** | **RETAIN col** + residual evaluate → funnel · **≠** ATT-10/PAY DONE |
| Display-ready DTO | `mode` · `modeLabelVi` · `bands[]` · `scope` · `sourceFlags` · `latePenaltyEnabled` · `latePenaltyHours` (+ peer CFG fields RETAIN) |
| Nest path | Physical `/api/hrm/attendance/*` · Nest `@Controller('core')` **ABSENT** — **DENY invent** |
| Closable gap on LIVE SoT? | **YES** — mode/bands/scope/off **ABSENT PROVEN** (DATA-01) → residual **ADD wire closable** on same rules family (+ optional specificity) |
| Unlock | **Dev-BE residual REQUIRED** (not FE-only) · then FE+QA · FE may bind RETAIN peers **in parallel** |
| PLT-01 / CORE-10/09/07 | **must_keep** stamps · printable **false** · soft≠CORE-06 · Nest DENY |
| PAY / printable / Word | **OUT invent DONE** |
| This seat | Docs only — **NO** `apps/**` · **NO** seed · **NO** honesty flip · **NO** claim CFG alone / ATT UAT / PLT/CORE DONE |

```text
  FE «Cài đặt chấm — phạt muộn/về sớm» (residual · CFG ≠ ATT-02 DONE)
        │  Network MUST contain /api/hrm/attendance/rules*
        │  DENY Nest /core/* late-penalty SoT
        │  DENY claim round/notify_late/đơn = FR-02 DONE
        │  DENY invent PAY/printable/Word DONE
        ▼
  F-ATT-RULE-01  GET/PATCH /api/hrm/attendance/rules
                 (+ optional PATCH …/rules/late-penalty same family)
        → public.attendance_rules (+ residual specificity ≡ att_attendance_rule)
        → display: mode · modeLabelVi · bands[] · scope · sourceFlags ·
                   latePenaltyEnabled · latePenaltyHours · notifyLate (peer ≠ off)
        │
  Peers RETAIN (paper /att + /core alias only)
        F-ATT-PUNCH-01     POST /attendance/records (+ GEO codes)
        F-ATT-CAT-WS-*     /attendance/work-sites*
        F-ATT-CAT-SHIFT-*  /attendance/work-shifts*
        late_early         /attendance/late-early-requests*  ≠ mode SoT
        Sheet funnel       late_penalty_hours on timesheet line  ≠ ATT-10/PAY
        │
  Residual wire (BE REQUIRED — closable)
        MODE  XOR minute|block|tier(band) · HRM-VAL-400 mixed/overlap
        SCOPE dept+shift > dept > company > shift default · U19 parity
        OFF   latePenaltyEnabled=false → penalty 0
        EVAL  write late_penalty_hours at aggregate/close (engine residual)
        │
        └─► must_keep PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB ·
              CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT ·
              soft≠CORE-06 · Nest /core DENY · C-SLICE · honesty false · PAY OUT
```

**Invariant ATT-02-PATH (O2/O8):** Penalty CFG Network **MUST** hit physical `/api/hrm/attendance/*` — Nest dual `/core` SoT = **FAIL**.

**Invariant ATT-02-XOR (O1 / BR-BP-SHF-02):** Save with >1 mode active on same OU/ca SoT = **FAIL** · `HRM-VAL-400`.

**Invariant ATT-02-SCOPE (O3):** Company-only as sole final SoT forever = **FAIL** residual.

**Invariant ATT-02-OFF (O6):** Treat `notifyLate` as penalty off = **FAIL**.

**Invariant ATT-02-≠-CFG-DONE (O7/O11):** Claim round / `notify_late` / late_early alone = FR-UC-BP-ATT-02 DONE = **FAIL**.

**Invariant ATT-02-≠-UAT (O11):** Claim ATT module UAT / flip `attendance_uat_ready` = **FAIL**.

**Invariant ATT-02-≠-PRINTABLE / PAY-OUT (O10):** Invent PAY/printable/Word DONE = **FAIL**.

**Invariant ATT-02-U19:** list = get = mutate residual rules/specificity — same scope resolver family — OOS → 409/404 · not empty-mask.

**Invariant ATT-02-DATA-HOLD:** LIVE spines **HOLD RETAIN** · migrate residual **only after** Dev unlock post this F.1 · **DENY** Nest `/core` table dual.

---

## 2. AS-IS Nest baseline → residual gap

| Surface | LIVE (read-only cite 2026-08-09) | Gap vs F.1 this seat |
|---------|----------------------------------|----------------------|
| `GET/PATCH /attendance/rules` | LIVE `AttendanceController` `@Get('rules')` / `@Patch('rules')` · `AttendanceConfigService` · 1 row/`company_id` · round · notify_late · gps/wifi/qr | **RETAIN** · **≠** FR-02 DONE · residual **mode/bands/scope/off ABSENT** |
| Named `…/rules/late-penalty` | **ABSENT** as Nest path | Optional thin route **same family** · paper path = alias |
| `attendance_rules` cols mode/bands/scope/off | **ABSENT PROVEN** (DATA-01) | Residual **ADD stamped closable** |
| Work-sites + punch | LIVE `/work-sites*` · GEO-001/GEO-REQ | **RETAIN cite** deepen SRC |
| Work-shifts | LIVE `/work-shifts*` · code/name/hours | **RETAIN** · penalty cols ABSENT · prefer residual on rules/specificity (HOLD invent dual SoT on shifts alone) |
| late_early_requests | LIVE `/late-early-requests*` | **RETAIN** · **≠** mode SoT |
| Sheet `late_penalty_hours` | LIVE bootstrap col | **RETAIN** · evaluate engine **ABSENT** |
| Nest `@Controller('core')` | **ABSENT** · CoreModule = DB export only | **DENY invent** |
| Source cite | `attendance.controller.ts` L865–879 rules · L1495+ work-sites · L1565+ work-shifts · L732+ late-early · L252 records · sheet schema `late_penalty_hours` | Docs-only this seat |

**FORBIDDEN invent this seat (docs):** Nest `@Controller('core')` · wipe LIVE spines · invent PAY/printable/Word DONE · claim CFG/round/đơn = FR-02 / ATT UAT · claim PLT/CORE DONE · seed · honesty flip · apps/** · reopen sealed J-*.

---

## 3. Path & alias lock (O2/O8)

| Plane | Path |
|-------|------|
| **PHYSICAL CFG (F-ATT-RULE-01 prefer)** | **`GET /api/hrm/attendance/rules`** · **`PATCH /api/hrm/attendance/rules`** |
| **PHYSICAL residual late-penalty (optional same family)** | **`PATCH /api/hrm/attendance/rules/late-penalty`** — **same** `@Controller('attendance')` · **not** second SoT |
| **PHYSICAL peers** | **`POST /api/hrm/attendance/records`** · **`/work-sites*`** · **`/work-shifts*`** · **`/late-early-requests*`** · sheet aggregate/close |
| **LOGICAL (paper)** | `PATCH /api/hrm/att/rules/late-penalty` · `/api/hrm/core/…` — **alias only** |
| Rule | Client/docs **may** keep paper names; runtime **physical only**. |
| QA Network assert | Path **contains** `/attendance/` — **FAIL O8** if FE hits Nest `/core/*` as late-penalty SoT |

| Paper / logical | Physical | DB (DATA-01) |
|-----------------|----------|--------------|
| F-ATT-RULE-01 `/att/rules/late-penalty` | **`GET/PATCH /attendance/rules*`** (+ optional `…/late-penalty`) | `attendance_rules` (+ residual specificity ≡ `att_attendance_rule`) |
| F-ATT-PUNCH-01 | `POST /attendance/records` | punch + geofence |
| F-ATT-CAT-WS-* | `/attendance/work-sites*` | `attendance_work_sites` |
| F-ATT-CAT-SHIFT-* | `/attendance/work-shifts*` | `work_shifts` |
| Đơn muộn/sớm | `/attendance/late-early-requests*` | `late_early_requests` ≠ mode |
| Funnel | sheet lines | `late_penalty_hours` ≠ ATT-10/PAY |
| Nest `/core` | — | **DENY invent** |

**Prefer rule (normative):** Dev **SHOULD** extend **`PATCH /attendance/rules`** body with residual late-penalty fields (single Network target for CFG screen). Optional dedicated **`…/rules/late-penalty`** is **acceptable** only on the **same** controller/SoT with identical XOR+scope+off semantics — **not** a Nest `/core` or dual table invent.

---

## 4. F-ATT-RULE-01 — F.1 RETAIN cite + residual (normative)

### 4.1 Header

| | |
|--|--|
| **Function ID** | **F-ATT-RULE-01** |
| **METHOD / path (physical prefer)** | **`GET /api/hrm/attendance/rules`** · **`PATCH /api/hrm/attendance/rules`** |
| **METHOD / path (physical optional)** | **`PATCH /api/hrm/attendance/rules/late-penalty`** (same family) |
| **Paper alias** | `PATCH /api/hrm/att/rules/late-penalty` · `/api/hrm/core/…` — **alias only** |
| **change_mode** | **RETAIN cite** CFG spine · **ADD residual wire** mode/bands/scope/off/display-ready |
| **Table** | **`public.attendance_rules`** (+ residual specificity rows mapped from paper **`att_attendance_rule`**) |

### 4.2 Mục đích

Cấp API vật lý để **C&B cấu hình đúng một chế độ phạt muộn/về sớm** (phút **XOR** block **XOR** bậc/band) kèm bảng mức và phạm vi OU/ca, bật/tắt phạt tường minh, và trả envelope display-ready — phục vụ SRS **FR-UC-BP-ATT-02 Diễn biến #1 / #3 / #5** và **BR-BP-SHF-02** — **không** thay Nest `/core` late-penalty SoT; **không** claim round/`notify_late`/đơn muộn = FR-02 DONE; **không** invent PAY/printable/Word DONE; **không** claim ATT module UAT từ CFG alone.

### 4.3 Nghiệp vụ xử lý

1. **AuthZ + U19 scope** — resolve company/slug như LIVE rules list/get/mutate; residual specificity keys dùng **cùng** resolver family; OOS → `HRM-SCOPE-409` / 404 (không empty-mask).
2. **RETAIN CFG** — persist/read round in/out · standard days · `notify_late` · `gps_enabled`/`wifi_enabled`/`qr_enabled` (Face OUT GĐ1) — **≠** FR-02 DONE alone.
3. **Residual MODE (XOR)** — accept **một** `mode` ∈ `minute`\|`block`\|`tier`/`band` per SoT key (OU/ca); lẫn mode / >1 mode active → **reject** `HRM-VAL-400`; bands overlap → `HRM-VAL-400`.
4. **Residual SCOPE** — persist `departmentId?` · `shiftId?` · company fallback; resolve **dept+shift > dept > company > shift default**; **DENY** hardcode company-only as final SoT forever.
5. **Residual OFF** — `latePenaltyEnabled=false` → evaluate penalty **= 0**; hours may still store if source valid; **`notifyLate` ≠ off**.
6. **Display-ready response** — return §5 DTO (mode · modeLabelVi · bands[] · scope · sourceFlags · latePenaltyEnabled · latePenaltyHours cite).
7. **DENY** Nest `@Controller('core')` dual · wipe PLT/CORE seals · invent PAY engine.

### 4.4 Tham chiếu bước SRS

| Bước | SRS | API action |
|------|-----|------------|
| Diễn biến **#1** | C&B chọn **một** chế độ + bảng mức gắn OU/ca | `PATCH …/rules` (+ residual) · XOR + bands |
| Diễn biến **#3** | Áp mức theo ca/lịch đang gán | SCOPE resolve + mode |
| Diễn biến **#5** | Tắt phạt → 0 | `latePenaltyEnabled=false` |
| **BR-BP-SHF-02** | One SoT mode per OU/ca | XOR reject mixed |
| Thành công (CFG) | Lưu 2xx · F5 còn mode/bands | Response display-ready · F5 |

### 4.5 Request → DB (residual + RETAIN)

| DTO (camelCase) | DB / derive | Rule |
|-----------------|-------------|------|
| `mode` | residual enum / col | XOR one · **AC-ATT-02-MODE** |
| `bands[]` | residual JSON / rows | overlap → `HRM-VAL-400` |
| `departmentId` / `shiftId` / `companyId` | residual specificity | SCOPE order · U19 |
| `latePenaltyEnabled` | residual off flag | disable → 0 · ≠ `notifyLate` |
| `notifyLate` | LIVE `notify_late` | **RETAIN peer** |
| `gpsEnabled` / `wifiEnabled` / `qrEnabled` | LIVE flags | **RETAIN** sourceFlags |
| round / standard_* | LIVE rules cols | **RETAIN** · ≠ FR-02 DONE |

### 4.6 Response (display-ready)

```json
{
  "companyId": "main",
  "mode": "minute",
  "modeLabelVi": "Theo phút",
  "bands": [{ "fromMinutes": 1, "toMinutes": 15, "penaltyHours": 0.5 }],
  "scope": { "companyId": "main", "departmentId": null, "shiftId": null },
  "sourceFlags": { "gpsEnabled": true, "wifiEnabled": false, "qrEnabled": false },
  "latePenaltyEnabled": true,
  "latePenaltyHours": null,
  "notifyLate": true
}
```

| Field | Rule |
|-------|------|
| `mode` | `minute`\|`block`\|`tier`/`band` · null when residual not yet wired (pre-BE) |
| `modeLabelVi` | *Theo phút* / *Theo block* / *Theo bậc/khoảng* — **DENY** raw enum as sole UI |
| `bands[]` | ordered levels · empty OK when mode=minute with formula body (Dev locks shape) |
| `scope` | dept/shift/company keys · resolve order documented |
| `sourceFlags` | LIVE method flags envelope |
| `latePenaltyEnabled` | residual · default true when ABSENT until wire |
| `latePenaltyHours` | sheet funnel cite on evaluate path · CFG response may be null |
| `notifyLate` | peer ≠ off |

### 4.7 Lỗi

| Code | When |
|------|------|
| `HRM-VAL-400` | Mixed modes · bands overlap · invalid enum |
| `HRM-SCOPE-409` | companyId / scope mismatch token |
| `HRM-ATT-RULES-404` | LIVE missing rules row (RETAIN cite) |
| `HRM-ATT-GEO-001` / `HRM-ATT-GEO-REQ` | Punch peers (SRC) — not CFG primary |
| Nest `/core` error family as SoT | **DENY invent** |

---

## 5. Peer endpoints — F.1 RETAIN cite (brief)

### 5.1 F-ATT-PUNCH-01 — `POST /api/hrm/attendance/records`

| | |
|--|--|
| **Mục đích** | Thu nhận chấm công từ nguồn hợp lệ (app/GPS/wifi/qr) — consumer SRC cho FR-UC-BP-ATT-02 Diễn biến **#2/#4**. |
| **Nghiệp vụ** | RETAIN geofence when GPS on (`HRM-ATT-GEO-001`/`GEO-REQ`); validate wifi/qr per rules; reject if sheet locked; **≠** invent device primary if ABSENT. |
| **Tham chiếu SRS** | FR-UC-BP-ATT-02 Diễn biến **#2/#4** · peer FR-ATT-03d GPS · **≠** claim geofence alone = ATT-02 DONE. |
| **Paper alias** | `/att/records` · `/core/…` alias only |

### 5.2 F-ATT-CAT-WS-* — `/api/hrm/attendance/work-sites*`

| | |
|--|--|
| **Mục đích** | Danh mục điểm GPS / vùng — SoT nguồn hợp lệ GPS cho SRC deepen. |
| **Nghiệp vụ** | CRUD soft-retire `active=false`; list default active; **no seed** U65. |
| **Tham chiếu SRS** | FR-UC-BP-ATT-02 nguồn hợp lệ · peer worksite catalog. |
| **≠DONE** | Catalog alone ≠ ATT-02 DONE |

### 5.3 F-ATT-CAT-SHIFT-* — `/api/hrm/attendance/work-shifts*`

| | |
|--|--|
| **Mục đích** | Định nghĩa ca — tiên quyết gắn SCOPE / ca đang gán (Diễn biến #3). |
| **Nghiệp vụ** | RETAIN code/name/hours; **HOLD invent** penalty cols dual SoT on shifts alone (prefer rules/specificity). |
| **Tham chiếu SRS** | FR-UC-BP-ATT-02 · BR-BP-SHF-02 ca. |
| **≠DONE** | Shift CRUD alone ≠ ATT-02 DONE |

### 5.4 Late-early requests — `/api/hrm/attendance/late-early-requests*`

| | |
|--|--|
| **Mục đích** | Workflow đơn muộn/sớm (peer UX). |
| **Nghiệp vụ** | RETAIN approve/reject · **explicit ≠ mode SoT** · **≠** FR-02 DONE alone (**AC-ATT-02-≠-LER**). |
| **Tham chiếu SRS** | Peer ATT request — **not** Diễn biến #1 mode SoT. |

### 5.5 Sheet funnel / evaluate cite — sheet aggregate/close + `late_penalty_hours`

| | |
|--|--|
| **Mục đích** | Đưa số phạt vào phễu bảng công kỳ (Diễn biến Thành công / #3). |
| **Nghiệp vụ** | RETAIN column · residual evaluate engine writes hours/amount at aggregate/close · **≠** ATT-10 sheet-sign UAT · **≠** invent PAY DONE. |
| **Tham chiếu SRS** | FR-UC-BP-ATT-02 Thành công · funnel cite only. |
| **Physical** | Prefer existing sheet aggregate/close on `/attendance/attendance-sheets/:sheetId/*` — **DENY** Nest `/core` evaluate SoT |

---

## 6. Residual wire plan (closable — BE REQUIRED)

| Residual ID | Wire plan | Closable? | Owner |
|-------------|-----------|-----------|-------|
| **R-ATT-02-MODE** | Extend PATCH rules (or `…/late-penalty`) body+response: `mode` XOR + `bands[]` + `modeLabelVi` · reject mixed | **YES** (ABSENT PROVEN · DATA ADD stamped) | **dev-be** |
| **R-ATT-02-SCOPE** | Persist dept/shift keys · resolve order · U19 list=get=mutate | **YES** | **dev-be** |
| **R-ATT-02-OFF** | `latePenaltyEnabled` · evaluate short-circuit 0 · notifyLate peer | **YES** | **dev-be** |
| **R-ATT-02-SRC** | Deepen punch assert vs sourceFlags + work-sites · device HOLD | Deepen on LIVE · **no** invent device SoT | **dev-be** (+ FE bind) |
| **R-ATT-02-EVAL** | Write `late_penalty_hours` on aggregate/close when mode enabled | Engine residual · col RETAIN · **≠** ATT-10/PAY | **dev-be** (may phase after MODE) |
| Display-ready | Envelope §4.6 on GET/PATCH rules | **YES** with MODE wire | **dev-be** → **dev-fe** bind |
| Schema migrate | Soft cols on `attendance_rules` and/or specificity table ≡ paper | **Allowed after** F.1 + BE unlock · **DENY** Nest `/core` table · **DENY** wipe spines | **dev-be** (post this seat) |

**Unlock lane (normative):**

| Lane | Verdict |
|------|---------|
| **FE-only** | **REJECT** for ATT-02 residual — mode/bands/scope/off **ABSENT** on LIVE; FE cannot invent SoT |
| **BE residual REQUIRED** | **ACCEPT** — closable ADD on same `/attendance/rules*` family |
| **FE parallel** | **ACCEPT** — bind RETAIN round/methods/sites/shifts/late_early UI **while** BE wires residual; mode AC journeys wait BE READY_FOR_QA |
| **Then FE+QA** | After BE residual READY · FE bind display-ready · QA U65 **J-HRM-ATT-02-01..06** |

---

## 7. Scope parity (U19)

| Surface | Resolver | Rule |
|---------|----------|------|
| `GET/PATCH /attendance/rules*` | company slug (LIVE 1-row) + residual specificity | **Same family** list↔get↔mutate |
| Work-sites / work-shifts / punch | Existing ATT resolvers | **Cite RETAIN** |
| late_early | Existing request scope | **Cite** · ≠ mode |
| Sheet funnel | Sheet header company scope | List→detail under `main` = scope_parity gate |

**Flag:** Residual ADD dept/shift keys **MUST** document list=get=mutate parity — else `scope_parity` defect blocks TM/QC GO.

---

## 8. Validation matrix (API)

| ID | Condition | Expected |
|----|-----------|----------|
| VAL-ATT-02-API-01 | PATCH CFG round/methods | 2xx · F5 · ≠ FR-02 DONE claim |
| VAL-ATT-02-API-02 | Save mixed modes | **400** `HRM-VAL-400` |
| VAL-ATT-02-API-03 | Bands overlap | **400** `HRM-VAL-400` |
| VAL-ATT-02-API-04 | Off enabled=false | evaluate penalty **0** · notifyLate may stay |
| VAL-ATT-02-API-05 | Invalid punch source | GEO / reject / 0 công · Nest `/core` **0** |
| VAL-ATT-02-API-06 | Scope mismatch | `HRM-SCOPE-409` / 404 |
| VAL-ATT-02-API-07 | late_early approve alone | **≠** mode SoT DONE |
| VAL-ATT-02-API-08 | Evaluate funnel | writes `late_penalty_hours` · ≠ ATT-10/PAY DONE |
| VAL-ATT-02-API-09 | Nest `/core` dual | **FAIL** O8 |
| VAL-ATT-02-API-10 | Claim CFG/round/đơn = ATT-02 DONE | **FAIL** honesty |
| VAL-ATT-02-API-11 | Display-ready missing after BE wire | **FAIL** DISP residual |
| VAL-ATT-02-API-12 | Claim ATT UAT / invent PAY/printable | **FAIL** honesty |

---

## 9. Explicit ≠DONE / must_keep / DENY

| Lock | Rule |
|------|------|
| CFG alone | **≠ ATT-02 DONE** · **≠** FR-UC-BP-ATT-02 DONE |
| round / notify_late / late_early | **≠** FR-02 DONE alone |
| ATT module UAT | **DENY** claim · `attendance_uat_ready=false` |
| PLT-01 `PLT01QC1-MSLPUQIU` | **must_keep** · peer≠PLT DONE · merge≠platform UAT |
| CORE-10 `CORE10QC1-MSLP0EJB` | **must_keep** · ≠ CORE-10 DONE |
| CORE-09 `CORE09QC1-MSLNBA89` | printable **false RETAIN** · ≠ CORE-09 DONE |
| CORE-07 `CORE07QC1-KZJTSHNT` | GATE/ACT · Nest DENY · ≠ CORE-07 DONE |
| soft≠CORE-06 DONE | **RETAIN** |
| Nest `/core` | **DENY** dual invent |
| PAY / printable / Word | **OUT invent DONE** |
| Honesty | **DENY** flip · **C-SLICE** |
| Seed / apps/** this seat | **DENY** |
| Reopen sealed J-PLT/CORE-* | **DENY** |

---

## Footer — honesty

> **honesty:** `attendance_uat_ready=false` · `recruitment_uat_ready=false` · `jd_dynamic_done=false` · `contracts_printable_ready=false` · `hrm_personnel_uat_ready=false` · PAY/EMP/REC/CTR/PLT module UAT **false** · **C-SLICE**  
> **printable false RETAIN** · **≠ ATT-02 DONE** · round/`notify_late`/đơn ≠ FR-02 DONE · ≠ ATT module UAT · ≠ PLT/platform UAT · ≠ CORE-10/09/07 DONE · PAY OUT invent DONE · must_keep PLT-01 `PLT01QC1-MSLPUQIU` · CORE-10 `CORE10QC1-MSLP0EJB` · CORE-09 `CORE09QC1-MSLNBA89` · CORE-07 `CORE07QC1-KZJTSHNT` · soft≠CORE-06 DONE · Nest `/core` DENY · no seed · no apps/**

---

## 10. Handoff contract

```yaml
work_item_id: PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01
from_role: sa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md
unlock_lane: BE residual REQUIRED (mode/bands/scope/off closable) → FE+QA; FE RETAIN peers may parallel
completion_report: |
  CONFIRMED F.1 — RETAIN cite F-ATT-RULE-01 physical GET/PATCH /api/hrm/attendance/rules*
  (+ optional …/late-penalty same family); peers sites/shifts/late_early/punch/funnel RETAIN;
  residual wire plan mode·bands·scope·latePenaltyEnabled·display-ready; paper /att+/core alias only;
  Nest /core DENY; ≠ CFG alone DONE · ≠ ATT module UAT · PAY/printable OUT; must_keep
  PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT ·
  soft≠CORE-06; no apps/** · no seed · unlock BE residual REQUIRED (not FE-only).
next_owner: pm → dev-be (primary) · dev-fe parallel RETAIN bind optional
next_dispatch_prompt: |
  work_item_id: PO-HRM-MVP-GD1-ATT-02-CLUSTER-BE-01
  role: dev-be
  program: PO-HRM-MVP-GD1-CONTINUOUS (U89 Wave-25 seat #27)
  entry_criteria: API-01 F.1 CONFIRMED @ docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md · DATA-01 HOLD + residual ADD stamped · BA O1–O12 · SA Option A · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · PAY OUT · U65 zero-seed
  read_first:
    - docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-API-01.md
    - docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-DATA-01.md
    - docs/program/specs/PO-HRM-MVP-GD1-ATT-02-CLUSTER-BA-01.md
    - docs/client-delivery/hrm-enterprise-blueprint/API_DESIGN_HRM_ENTERPRISE.md F-ATT-RULE-01
  exit_criteria:
    - Wire residual ADD on physical /api/hrm/attendance/rules* (same family · optional …/late-penalty): mode XOR minute|block|tier · bands[] · scope · latePenaltyEnabled · display-ready mode·modeLabelVi·bands·scope·sourceFlags·latePenaltyEnabled·latePenaltyHours
    - Reject mixed modes / bands overlap → HRM-VAL-400 · U19 list=get=mutate parity · notifyLate ≠ off
    - Prefer soft cols on attendance_rules and/or specificity ≡ att_attendance_rule — DENY Nest @Controller('core') · DENY wipe LIVE spines · DENY invent PAY/printable/Word DONE
    - RETAIN peers work-sites/shifts/late_early/punch/funnel col — ≠ claim CFG alone = ATT-02 DONE · ≠ ATT module UAT
    - tests + CODE-MEMORY · READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-be-01.md
    - next: FE bind + QA J-HRM-ATT-02-01..06 (FE RETAIN peer bind may already be parallel)
  cấm: Nest /core dual · wipe PLT/CORE seals · invent PAY/printable/Word DONE · claim ATT UAT · claim CFG=ATT-02 DONE · seed for U65 · honesty flip
```

### Parallel FE (optional same wave — independent RETAIN bind)

```text
work_item_id: PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-01
role: dev-fe
entry_criteria: API-01 CONFIRMED · BE residual in-flight OR READY · Nest /core DENY
mission: Bind FE CFG screen to physical /attendance/rules* · show display-ready when BE wires · RETAIN peers sites/shifts/late_early (≠ mode SoT) · DENY Nest /core · DENY claim CFG alone DONE · U65 no seed
exit: READY_FOR_QA · evidence docs/qa/evidence/po-hrm-mvp-gd1-att-02-cluster-fe-01.md
note: Mode XOR AC journeys blocked until BE residual READY — FE may ship RETAIN chrome first
```

---

*End API-01 · F.1 LOCKED · unlock BE residual REQUIRED · 2026-08-09*
