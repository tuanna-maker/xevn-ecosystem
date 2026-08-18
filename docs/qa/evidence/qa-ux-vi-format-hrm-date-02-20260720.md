# QA-UX-VI-FORMAT-DATE-02 — HRM date dd/MM entry → ISO network (2026-07-20)

| Field | Value |
|-------|-------|
| **work_item_id** | `QA-UX-VI-FORMAT-DATE-02` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **persona** | `ceo@xe.vn` · `companyId=main` · U65 zero-seed |
| **base** | `http://127.0.0.1:5173` (HRM embed portal=1) |
| **spec_ref** | `docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md` §BR-UX-DATE-02 · FE `D-UX-VI-FORMAT-HRM-DATE-02` |
| **entry** | `docs/qa/evidence/d-ux-vi-format-hrm-date-02-fe-20260720.md` READY |

## Verdict

**PASS** — EmployeeContracts edit + LeaveTab create show `dd/MM/yyyy`, mutate body ISO `yyyy-MM-dd`, FE after 2xx + F5 persist. Insurance dialog quick scan: ViDateField placeholders, no native `type=date`.

**Cấm respected:** no seed · no Phase1/PROD claim.

## L0

Stack already up (portal `:5173`, prior session HRM/XBOS). Employees list 1108 rows under Group CEO — env usable for U65 browser.

## Spot-check 1 — EmployeeContracts (UF-HRM-03 / J-HRM-01 path)

| Step | Evidence |
|------|----------|
| Click path | Contracts list → employee `HLD-0006` (`8ac84520-…`) → tab **Hợp đồng** → **Chỉnh sửa** `HD-42D6DC19` |
| Display entry | `Ngày hiệu lực` / `Ngày hết hạn` text inputs `placeholder=dd/MM/yyyy`; loaded `01/06/2026` · `31/05/2027` |
| Mutate | Set `03/06/2026` · `30/05/2027` → **Cập nhật** |
| Network | `PATCH /api/hrm/contracts-insurance/contracts/42d6dc19-…` **200** body `start_date:"2026-06-03"`, `end_date:"2027-05-30"` (ISO; no `dd/MM` in body) |
| FE after 2xx | Dialog closed; list shows `03/06/2026` · `30/05/2027` |
| F5 | Reload profile → Hợp đồng → same `03/06/2026` · `30/05/2027` present |

Note: dispatch said PUT; live API uses **PATCH** — ISO AC still met.

## Spot-check 2 — LeaveTab create (J-HRM-06)

| Step | Evidence |
|------|----------|
| Click path | Attendance → **Nghỉ phép** → **Tạo yêu cầu nghỉ** |
| Display entry | `Từ ngày` / `Đến ngày` `placeholder=dd/MM/yyyy` (0× `type=date`) |
| Mutate | Employee `HLD-0006`; dates `25/08/2026`–`26/08/2026`; reason `QA-UX-VI-FORMAT-DATE-02 leave date ISO check` → **Gửi yêu cầu** |
| Network | `POST /api/hrm/attendance/leave-requests` **201** body `start_date:"2026-08-25"`, `end_date:"2026-08-26"` |
| FE after 2xx | Toast **Thành công**; counters 86→87 · chờ duyệt 28→29 |
| F5 | Reload → Danh sách yêu cầu: `25/08/2026` · `26/08/2026` + reason text; **no** ISO `2026-08-25` leak in UI |

## Spot-check 3 — Insurance dialog (quick scan)

| Step | Evidence |
|------|----------|
| Click path | Employee `HLD-0006` → Thêm → **Bảo hiểm & Phúc lợi** → **Thêm bảo hiểm** |
| Display | Dialog **Thêm bảo hiểm mới**; labels **Ngày bắt đầu** / **Ngày kết thúc**; 2× text `placeholder=dd/MM/yyyy`; **`nativeDateCount=0`** |
| Mutate | Not required for this wave (spot-check entry chrome only) |

## Residual

| ID | Severity | Note |
|----|----------|------|
| Wave-3 native date leftovers | P3 | FE residual: Performance / InternalServices / PlatformAdmin (out of this spot-check) |
| Mobile ESS | P3 | Separate `D-UX-VI-FORMAT-MOB-*` |

## not promoted

- Phase1 DONE / PROD-READY
- Full HRM date surface sweep beyond 3 spots

## next_owner

`pm` → optional residual QC close of date-02 or next UX VI money wave; no Dev re-dispatch required for this AC.

## next_dispatch_prompt

```text
work_item_id: QC-UX-VI-FORMAT-HRM-DATE-02 (optional residual close)
from_role: pm
to_role: qc
lane: governance
entry: QA-UX-VI-FORMAT-DATE-02 PASS_TO_PM
evidence: docs/qa/evidence/qa-ux-vi-format-hrm-date-02-20260720.md
AC: EmployeeContracts + LeaveTab dd/MM entry + ISO mutate + F5; insurance dialog ViDateField chrome
cấm: seed · Phase1/PROD · reopen money MUST ACs
```
