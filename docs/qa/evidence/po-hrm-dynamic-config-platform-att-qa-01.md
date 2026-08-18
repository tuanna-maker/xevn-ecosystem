# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **lane** | execution |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01` |
| **Date** | 2026-08-07 |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` · query `company_id=holding` · header `x-company-id=main` |
| **Stamp** | `ATTPLATQA-MSISVY4L` |
| **U65** | zero-seed · L1 API smoke only · **browser UF HOLD** until FE |
| **Honesty** | `attendance_uat_ready=false` · `payroll_e2e_ready=false` · no Phase1 DONE · no module UAT |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (L1 API) |

---

## 1. Environment traceability

| Check | Result |
|-------|--------|
| L0 `hrm-api` `:28001` `/api/hrm` | **200** `HRM-HEALTH-200` |
| Portal `:5173` login proxy | **201** `POST /api/xbos/auth/login` |
| Stale-dist probe (unauth leave-types) | **401** `HRM-AUTH-001` — route live (not 404) |
| Git HEAD | `dc930c5` |
| Runner | `scripts/qa/_tmp-po-hrm-dynamic-config-platform-att-qa-01.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-qa-01.FINAL.json` |

**spec_ref:** `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md` §5 AC-PLT-ATT-01..03 · `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md` §5 VAL-ATT-LVT-* · BE evidence `po-hrm-dynamic-config-platform-att-be-01.md`

---

## 2. L1 results (VAL / AC map)

| ID | Check | Expected | Actual | Verdict |
|----|-------|----------|--------|---------|
| ensureSchema | `GET /attendance/leave-types?company_id=holding` | 200 `[]` or rows | **200** · total≥0 (run: 4) · `HRM-ATT-LVT-200` | 🟢 |
| VAL-ATT-LVT-04 | `POST` open key `hr_custom_09_*` | 201 + list + get-by-id | **201** `HRM-ATT-LVT-201` id=`a1dbb5bc-…` key=`hr_custom_09_msisvy4l` · list+get **200** same id | 🟢 |
| VAL-ATT-LVT-04 literal | `POST` `hr_custom_09` | 201 or CONFLICT (not enum) | **201** upsert (open catalog) | 🟢 |
| VAL-ATT-LVT-02 | `POST` `leaveTypeKey=Annual` | 400 `HRM-PLT-CAT-CODE-INVALID` | **400** `HRM-PLT-CAT-CODE-INVALID` | 🟢 |
| VAL-ATT-LVT-10 / EFF | `GET …/leave-types/effective` ATT wins | `source=att_override` on REF+ATT key | REF `lvt_04` + ATT upsert → **`source=att_override`** | 🟢 |
| VAL-ATT-LVT-08 / AC-PLT-ATT-03 | `POST leave-requests` type ∉ effective | 400 `HRM-LEAVE-TYPE-UNKNOWN` | **400** `HRM-LEAVE-TYPE-UNKNOWN` (`not_in_catalog_msisw255`) | 🟢 |
| VAL-ATT-LVT-05 / AC-PLT-ATT-02 | Retire → picker hide | `status=retired` + archived; active list hides | **201** retire · active hide · `include_archived` shows retired + `archivedAt` | 🟢 |
| VAL-ATT-LVT-05 history | Historical `leave_requests.leave_type` intact | key remains after retire | Create leave **201** id=`28fa6307-…` type=`hr_custom_09_msisvy4l` → retire catalog → **list still has row with same key** | 🟢 |
| must_keep | `work_shifts` + `attendance-sheets` | still reachable | both **200** | 🟢 |

**AC-PLT-ATT-01 browser (Settings → Tạo loại phép → F5 → form picker):** **⬜ HOLD** — FE seat not delivered; L1 API proves create/list/get/open-key only.

---

## 3. Key network stamps (truncated)

```text
GET  /api/hrm/attendance/leave-types?company_id=holding          → 200 HRM-ATT-LVT-200
POST /api/hrm/attendance/leave-types  {leaveTypeKey:hr_custom_09_msisvy4l} → 201 HRM-ATT-LVT-201
GET  /api/hrm/attendance/leave-types/:id?company_id=holding      → 200 (scope_parity)
POST /api/hrm/attendance/leave-types  {leaveTypeKey:Annual}     → 400 HRM-PLT-CAT-CODE-INVALID
GET  /api/hrm/attendance/leave-types/effective?company_id=holding → 200 · ATT wins (att_override)
POST /api/hrm/attendance/leave-requests {leave_type:not_in_catalog_*} → 400 HRM-LEAVE-TYPE-UNKNOWN
POST /api/hrm/attendance/leave-requests {leave_type:hr_custom_09_msisvy4l} → 201 HRM-LEAVE-201
POST /api/hrm/attendance/leave-types/:id/retire?company_id=holding → 201 status=retired
GET  /api/hrm/attendance/leave-requests?company_id=holding       → row leave_type intact
GET  /api/hrm/attendance/work-shifts · attendance-sheets         → 200 must_keep
```

---

## 4. Residual / not promoted

| Item | Status |
|------|--------|
| AC-PLT-ATT-01 **browser** Settings picker + F5 + form chọn mã mới | **HOLD** → `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-*` then QA browser |
| `attendance_uat_ready` | **false** (honesty) |
| J-* L2.5 attendance journeys | **out of scope** this L1 seat |
| Module ATT UAT / Phase1 DONE | **DENIED** |
| Seed | **none** (U65) |

**OBS:** No `GET /attendance/leave-requests/:id` — history asserted via **list** after retire (create 201 + list hit).

---

## 5. Defect register

| ID | Severity | Summary | Owner |
|----|----------|---------|-------|
| — | — | No L1 blocker this stamp | — |

---

## 6. completion_report

**Closed:** L1 API smoke PASS for ATT leave-type open catalog (ensureSchema live, open `hr_custom_09(+unique)`, format reject `Annual`, effective ATT wins collision, consumer `HRM-LEAVE-TYPE-UNKNOWN`, soft retire + picker hide + historical leave key intact). must_keep work_shifts + attendance-sheets **200**. U65 zero-seed. Stamp `ATTPLATQA-MSISVY4L`.

**Residual:** Browser AC-PLT-ATT-01..02 FE path HOLD; `attendance_uat_ready=false` until FE + browser QA.

**Forbidden claims:** ATT UAT-ready · Phase1 DONE · browser UF PASS · seed as evidence.

---

## 7. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **pm** (dispatch FE seat or QC narrow L1-only GWC) |
| **evidence_path** | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-qa-01.md` |
| **machine_json** | `docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-att-qa-01.FINAL.json` |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-01
from_role: pm
to_role: dev-fe
lane: execution
parent: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-QA-01
priority: P2

## read_first
1. docs/qa/evidence/po-hrm-dynamic-config-platform-att-qa-01.md (L1 PASS · browser HOLD)
2. docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md §5 AC-PLT-ATT-01..02
3. docs/qa/evidence/po-hrm-dynamic-config-platform-att-be-01.md

## task
Wire ATT Settings leave-type catalog picker to F-ATT-CAT-LVT/EFF:
- Create loại phép (open key #9+) → 2xx → list F5 còn row
- Retire → picker ẩn; historical leave form/list still shows key
- Consumer form nộp phép binds effective catalog (no FE hardcode LVT_01..04)
- must_keep: work_shifts ops UI · sheet/sign spine · U65 zero-seed
- Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-fe-01.md

## exit
READY_FOR_QA · honesty attendance_uat_ready=false until browser QA PASS
```

**Alt (if PM wants gate stamp only):** dispatch `qc` narrow L1-only **GWC** citing this evidence + condition «browser AC-PLT-ATT HOLD».
