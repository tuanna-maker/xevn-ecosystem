# P1 — Metadata apply → UI propagation (sponsor 2026-06-20)

| Field | Value |
|-------|-------|
| **trigger** | Sponsor: PUT `infrastructure/settings` 200 nhưng form ĐVTV không đổi; PM phải giám sát toàn bộ màn tương tự |
| **class** | **Product gap** — config SoT ≠ consumer render; không phải API-only PASS |
| **owner** | PM orchestration → BA matrix → dev-fe parity → QA cross-screen |

## Vấn đề (root class)

1. **Cấu hình lưu DB** (`XBOS-INFRA-201`) ≠ **UI consumer re-render** với field mới.
2. Modal **Cấu hình mục thông tin hạ tầng** (`customFieldDefsByEntity`) chỉ feed form **Điểm hạ tầng** (`?settings=company_infrastructure` → Thêm/Sửa điểm), **không** feed form **Chỉnh sửa pháp nhân** (`company_member_units` → form).
3. **Thiếu feedback UX** sau «Xác nhận (áp dụng)»: không loading, không đóng modal, không deep-link tới màn nhập.
4. **Song song 3 pipeline metadata** chưa có ma trận parity: infra fields · group HR / employee metadata · legal entity static form.

## Exit criteria (program)

| # | Gate | Owner |
|---|------|-------|
| E1 | `METADATA_APPLY_PROPAGATION_MATRIX.md` — mọi modal cấu hình → ≥1 consumer screen → AC visible change | BA |
| E2 | Mỗi AC có QA browser row (apply → F5 consumer shows field) | QA |
| E3 | FE: apply success = Loader2 + toast + refresh consumer state / CTA | dev-fe |
| E4 | QC GO scoped — không claim UAT nếu còn consumer ⬜ | QC |

## Wave (execution)

| Wave | work_item_id | Role |
|------|----------------|------|
| W1 | `P1-METADATA-APPLY-BA-MATRIX-01` | ba-process |
| W2 | `P1-METADATA-APPLY-UX-FE-01` | dev-fe (apply feedback + consumer bind) |
| W3 | `P1-METADATA-CONSUMER-PARITY-FE-02` | dev-fe (matrix rows) |
| W4 | `P1-METADATA-APPLY-QA-8088` | qa |
| W5 | `P1-METADATA-APPLY-QC` | qc |

## Spec refs

- UC-XBOS-INF-01 · UC-CC-P0-07 · SRS § infrastructure · `COMMAND_CENTER_P0_TECHSPEC.md`
- `infrastructureEntityKeyResolver.ts` · `ACTION_BUTTON_INVENTORY.md` § infra / group HR
