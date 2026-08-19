# PO — UC × Menu coverage (chống code trước khi UC đủ depth)

| Meta | Value |
|------|--------|
| **Program ID** | `PO-HRM-UC-MENU-COVERAGE-01` |
| **Opened** | 2026-08-06 |
| **Sponsor** | Thao tác chức năng nào lỗi chức năng đó → rà từng menu theo UC; chưa check = UC chưa đủ → BRD/SRS trước code/test/fix |
| **Related** | `36-MODULE-E2E-SPINE-LINKAGE.md` · `PO_HRM_ALL_MENU_E2E_LINKAGE_PROGRAM.md` |
| **Status** | **ACTIVE** |

## Rule (PM lock)

```text
Menu leaf / nút mutate → phải có FR 7-mục + Diễn biến + khóa mang
  → ba-docs merge nếu shallow
  → TechSpec + DB_DESIGN + API_DESIGN
  → rồi mới Dev → QA browser
Cấm: Dev/fix theo screenshot khi inventory UC chưa stamp CHECKED cho leaf đó.
```

## Coverage stamp

| Stamp | Meaning |
|-------|---------|
| `UNCHECKED` | Chưa scorecard nút↔FR |
| `SHALLOW` | FR có tên / inventory nhưng thiếu Diễn biến form |
| `SPEC_READY` | Diễn biến + AC đủ; chờ Tech/DB/API |
| `IMPL_GAP` | Spec đủ; UI/API lệch |
| `CHECKED_QA` | Browser U65 PASS theo AC |
| `OUT_MVP` | GĐ2 / stamped OUT |

## Wave A seats

| Seat | Owner | Output |
|------|-------|--------|
| REC interview one-active + list badge | ba-docs | **SRS ADD** FR-UC-BP-REC-06a (v0.15) · evidence `docs/qa/evidence/po-hrm-rec-iv-one-active-docs-01.md` · leaf **SPEC_READY** sau sponsor CONFIRM + Tech/DB/API · next **sa** `PO-HRM-REC-IV-ONE-ACTIVE-SA-01` |
| Full menu × UC inventory matrix | ba-process | coverage matrix all HRM leaves |
| InterviewsTab Select.Item `""` crash | dev-fe FIX narrow | console clean — **không** invent BR one-active |
| Continue E2E EMP/PAY/ATT/REC UV cascade | in flight | không dừng |

## Honesty

`*_uat_ready=false` until CHECKED_QA on P0 leaves of that module.
