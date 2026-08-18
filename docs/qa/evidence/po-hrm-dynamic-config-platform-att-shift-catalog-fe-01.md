# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-FE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **lane** | execution |
| **priority** | P1 |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QC-01` **GWC** · CONDITION **R-PLT-ATT-SHIFT-CNS-02** |
| **ref_qc** | [`po-hrm-dynamic-config-platform-att-shift-catalog-qc-01.md`](po-hrm-dynamic-config-platform-att-shift-catalog-qc-01.md) |
| **ref_be** | [`po-hrm-dynamic-config-platform-att-shift-catalog-be-01.md`](po-hrm-dynamic-config-platform-att-shift-catalog-be-01.md) |
| **stamp_qa (prior)** | `ATTSHIFTQA-MSK5FXP3` |
| **change_mode** | **FIX** (FE rebind picker only · no BE reopen · no seed) |
| **Date** | 2026-08-08 |
| **ack_status** | **READY_FOR_QA** |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · `C-SLICE-≠-MODULE` · U65 zero-seed · R-PLT-ATT-CODE-FE-01 **HOLD** (no invent FE ATT-CODE) · ATTCODEQA-MSK4T1A5 / leave `ATTLEAVEQA-MSJ7CPJH` / worksite `ATTWSQA-MSJC3IN9` / EMP / SI / CTR / aggregate **SEAL RETAIN** |

---

## 1. spec_read_ack

| Layer | Path / section |
|-------|----------------|
| **QC** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-qc-01.md` — GWC · CONDITION R-PLT-ATT-SHIFT-CNS-02 (P2 · owner dev-fe) |
| **BA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BA-01.md` — **VAL-ATT-SHIFT-CNS-02** · AC-PLT-ATT-SHIFT-01 · BR-PLT-04 |
| **SA** | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-SA-01.md` — Option **B** · ADR **D1** |
| **BE** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-be-01.md` — `GET /work-shifts/effective` display-ready; invent **`HRM-ATT-SHIFT-KEY`** when active>0; empty active → skip |
| **API_DESIGN** | `GET /api/hrm/attendance/work-shifts/effective?company_id=` → `{ total, data[] }` · fields `code`/`name`/`start_time`/`end_time`/`coefficient`/`status` |
| **SRS** | UC-HRM-ATT-SHIFT-CHANGE (đơn đổi ca) — picker ca hiện tại / ca đề nghị |

**spec says / code does:**
- *spec says:* consumer picker binds Nest active `work_shifts`; hardcode 5-id chỉ khi catalog rỗng; submit dùng Nest key để BE `HRM-ATT-SHIFT-KEY` assert còn hiệu lực (admin ≠ consumer).
- *code did (trước):* `ShiftChangeRequestTab` hardcode 5-id `morning|afternoon|night|office|flexible`; submit gửi **name** (i18n) → KEY assert không đối chiếu đúng code.
- *code does (sau FIX):* picker bind `GET /work-shifts/effective` khi `active>0`; fallback 5-id **chỉ** khi `active=0`; submit gửi Nest **code**; nhãn bảng/detail resolve code→name (display-ready, không invent).

---

## 2. completion_report

**Closed (CONDITION R-PLT-ATT-SHIFT-CNS-02):**

| Gap | Impl |
|-----|------|
| VAL-ATT-SHIFT-CNS-02 picker rebind | `ShiftChangeRequestTab` current/requested shift Select → `useWorkShiftsEffective` (Nest `GET /work-shifts/effective`) khi `activeCount>0` |
| Bootstrap empty UX | Fallback 5-id `morning\|afternoon\|night\|office\|flexible` **chỉ** khi `activeCount=0` — U65 **no seed**, không invent SoT |
| Submit dùng Nest key | `current_shift`/`requested_shift` = Nest **code** (không phải name) → BE `HRM-ATT-SHIFT-KEY` assert giữ hiệu lực; `current/requested_shift_time` = `start-end` |
| Display-ready | Picker label = `name (HH:MM - HH:MM)` từ Nest; bảng + detail resolve `code → name` (legacy value giữ nguyên nếu không khớp) |
| CODE-MEMORY | APPEND `ShiftChangeRequestTab.tsx`; ADD header `workShiftCatalog.ts` + `useWorkShiftsEffective.ts`; CHANGE note `hrmApi.ts` |

**Paths touched:**

| File | Change |
|------|--------|
| `apps/web/hrm/src/integrations/hrmApi.ts` | ADD `listEffectiveWorkShifts` + `HrmWorkShiftEffectiveRecord` (unwrap `{total,data}`) |
| `apps/web/hrm/src/lib/workShiftCatalog.ts` | NEW — picker mapper + `WORK_SHIFT_BOOTSTRAP_FALLBACK` + `resolveWorkShiftLabel` (pure) |
| `apps/web/hrm/src/hooks/useWorkShiftsEffective.ts` | NEW — RQ cache scoped `currentCompanyId` (khớp create scope) + `activeCount` |
| `apps/web/hrm/src/components/attendance/ShiftChangeRequestTab.tsx` | FIX — rebind picker + submit Nest code + label resolve |
| `apps/web/hrm/src/lib/workShiftCatalog.test.ts` | NEW — 7 unit tests (mapper/fallback/resolve/honesty) |

**must_keep honored:** `HRM-ATT-SHIFT-KEY` BE assert (submit code) · fallback chỉ khi empty · soft-retire list filter (BE) untouched · **ATT-CODE FE HOLD untouched** (no invent) · no seed · no Settings dual-write.

**Residual:**

| Item | Owner |
|------|-------|
| Browser U65 AC-PLT-ATT-SHIFT-01 / VAL-CNS-02: admin CREATE Nest N shifts → picker shows Nest labels; submit valid → 201; invent code (skip picker) → 400 `HRM-ATT-SHIFT-KEY`; empty active → fallback 5-id + F5 | **qa** |
| Slice GWC close · honesty false retained | **qc** after QA |

---

## 3. Verification

### 3.1 Type check (touched files clean)

```bash
cd apps/web/hrm
npx tsc -p tsconfig.app.json --noEmit
# Touched files (ShiftChangeRequestTab.tsx, useWorkShiftsEffective.ts,
#   workShiftCatalog.ts, integrations/hrmApi.ts) → 0 errors.
# NOTE: repo has pre-existing baseline TS errors in UNRELATED files
#   (UniAIChat, LeaveTab, ContractImportDialog, EmployeeResume, *.test.ts randomUUID/Crypto) — not introduced here.
```

`ReadLints` on 4 touched files → **No linter errors found.**

### 3.2 Unit test (regression — pure mapper/resolve)

```bash
npx vitest run src/lib/workShiftCatalog.test.ts
# Test Files  1 passed (1) · Tests  7 passed (7)
```

| Test | Result |
|------|--------|
| honesty flag `false` (no UAT flip) | PASS |
| bootstrap fallback = 5-id morning\|afternoon\|night\|office\|flexible | PASS |
| `formatWorkShiftTime` ghép/khuyết an toàn | PASS |
| `workShiftToPickerOption` value=code · display-ready | PASS |
| name fallback = code khi thiếu (no invent) | PASS |
| `workShiftsToPickerOptions` loại row thiếu code | PASS |
| `resolveWorkShiftLabel` code→name · case-insensitive · legacy giữ nguyên · rỗng → — | PASS |

### 3.3 Behavior matrix (logic-level — QA to confirm in browser)

| Condition | Picker source | Submit `current_shift` | BE KEY assert |
|-----------|---------------|------------------------|---------------|
| Nest `active>0` | `GET /work-shifts/effective` labels | Nest **code** | active → assert đối chiếu code (pass) |
| Nest `active=0` | Fallback 5-id (i18n `shiftChange.shifts.*`) | fallback code | empty → assert **skip** (U65) |

---

## 4. Honesty / seals

| Flag / seal | Value |
|-------------|-------|
| `attendance_uat_ready` | **false** — không flip |
| `payroll_e2e_ready` | **false** — không flip |
| `C-SLICE-≠-MODULE` | picker rebind ≠ module ATT UAT |
| R-PLT-ATT-CODE-FE-01 (ATT-CODE FE HOLD) | **RETAIN** — no invent FE ATT-CODE |
| ATTCODEQA-MSK4T1A5 / leave / worksite / EMP / SI / CTR / aggregate | **SEAL RETAIN** — không đụng |
| Seed / ensureDefault | **DENIED** |
| Settings dual-write | **DENIED** |

---

## 5. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | Rebound `ShiftChangeRequestTab` shift picker (hiện tại/đề nghị) → Nest `GET /work-shifts/effective` khi `active>0`; hardcode 5-id **chỉ** khi `active=0` (empty bootstrap, no seed); submit gửi Nest **code** để `HRM-ATT-SHIFT-KEY` BE còn hiệu lực; label bảng/detail resolve code→name display-ready. New `hrmApi.listEffectiveWorkShifts`, `lib/workShiftCatalog.ts`, `hooks/useWorkShiftsEffective.ts` + 7 unit tests PASS. Touched files tsc/lint clean (baseline errors elsewhere pre-existing). Honesty false; seals retained; ATT-CODE FE HOLD untouched; no seed / no Settings dual-write. |
| **next_owner** | **qa** |
| **next_dispatch_prompt** | See §6 |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-fe-01.md` |
| **ack_status** | **READY_FOR_QA** |

---

## 6. next_dispatch_prompt (copy-ready — QA-FE CNS-02 browser U65)

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-QA-FE-01
from_role: pm
to_role: qa
lane: execution
priority: P1
program: PO-HRM-CONTINUOUS-W8-20260807
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-FE-01 READY_FOR_QA
ref_fe: docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-fe-01.md

## entry_criteria
- L0 stack up: HRM :28001 · portal :5173 · api_base :28001/api/hrm
- Read FE evidence + BE evidence (HRM-ATT-SHIFT-KEY LIVE) + QC GWC CONDITION R-PLT-ATT-SHIFT-CNS-02
- U65 zero-seed — admin CREATE work-shifts from FE Settings (no seed script)
- Honesty: attendance_uat_ready=false · payroll_e2e_ready=false · C-SLICE-≠-MODULE
- RETAIN: ATTCODEQA-MSK4T1A5 · leave/worksite · EMP · SI/CTR · aggregate · R-PLT-ATT-CODE-FE-01 HOLD (cấm invent FE ATT-CODE)

## task (browser U65 — FE outside, click path)
1) Login CEO group (ceo@xe.vn / Xevn@2026) → HRM → Chấm công → Đơn từ → Đổi ca
2) active>0: Settings → Ca làm việc admin CREATE ≥1 shift (Nest, no seed) → mở "Thêm đơn đổi ca" → picker "Ca hiện tại"/"Ca đề nghị" hiển thị NHÃN NEST (name + giờ), KHÔNG còn cứng 5-id
3) Submit đơn với ca hợp lệ Nest → POST 201 HRM-SC-201 → dòng mới trên bảng · F5 còn · cột ca hiển thị name (resolve)
4) Negative KEY: thử submit khi picker rỗng/không chọn Nest code (nếu tạo được path invent) → expect 400 HRM-ATT-SHIFT-KEY · no persist
5) active=0: công ty chưa có Nest work-shift → picker fallback 5-id (morning|afternoon|night|office|flexible) hiển thị · submit đi qua (empty skip) — KHÔNG seed
6) F5 / navigate lại → dữ liệu còn; DevTools Network POST/GET 2xx cùng bước UI; console không Uncaught

## cấm
seed · flip ready · reopen ATT-CODE L1 · invent FE ATT-CODE HOLD · claim UF 🟢 / module ATT UAT / Phase1 · PASS chỉ probe-only

## evidence_path
docs/qa/evidence/po-hrm-dynamic-config-platform-att-shift-catalog-qa-fe-01.md

## exit
PASS_TO_PM or FAIL_TO_PM · UF block evidence (trước/action/Network/FE sau 2xx/F5/verdict) · honesty false · next_dispatch_prompt
```

---

## 7. Self-check

- [x] Picker rebind Nest `GET /work-shifts/effective` khi active>0 · hardcode 5-id chỉ khi active=0
- [x] Submit gửi Nest **code** — `HRM-ATT-SHIFT-KEY` BE giữ hiệu lực (must_keep)
- [x] Display-ready label (name + time) · resolve code→name · no FE join invent
- [x] ATT-CODE FE HOLD untouched · no seed · no Settings dual-write
- [x] tsc/lint touched-files clean · vitest 7 PASS
- [x] Honesty false · seals RETAIN · C-SLICE
- [x] completion_report · next_owner **qa** · next_dispatch_prompt · ack_status **READY_FOR_QA**
