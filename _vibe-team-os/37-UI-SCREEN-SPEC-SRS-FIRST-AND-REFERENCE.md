# 37 — UI_SCREEN_SPEC SRS-first và tài liệu tham khảo

| Meta | Value |
|------|--------|
| **Audience** | PM · BA · SA · Dev-FE · QA |
| **Sponsor lock** | 2026-08-10 |
| **Repo index** | `docs/reference/README.md` |

## Thứ tự SoT

```text
SRS (confirm) → TechSpec (ref_srs) → DB_DESIGN + API_DESIGN
 → UI_SCREEN_SPEC / UI_UX_SPEC (per surface)
 → test plan (browser U65) → Dev → QA
```

## Tham khảo vs bắt buộc

| Bắt buộc | Chỉ tham khảo |
|----------|----------------|
| SRS · TechSpec · DB_DESIGN · API_DESIGN | Enterprise `UI_UX_SPEC_v2_*` (Desktop) |
| `docs/hrm/ui-screens/UI-*.md` · `PAT-*.md` | `PHU_LUC_NAMED_FIELD_SCHEMA_MOD_CON.md` (full) |
| `docs/UI_UX_SPEC_XEVN_HRM_MOBILE.md` §1.1 | Cấu trúc document control / mapping UC→SCR ngoài repo |

**Cấm:** Thêm field, luồng, hoặc endpoint vì thấy trong bản tham khảo khi chưa có delta SRS/API.

## Named Field (MOD-CON)

- Tóm tắt repo: `docs/reference/PHU_LUC_NAMED_FIELD_SCHEMA_MOD_CON.SUMMARY.md`
- Bind: `field_key` / merge token theo API_DESIGN — không generic `field_schema` builder trên FE.

## Web embed

- `docs/hrm/ui-screens/PAT-DIALOG-FULL-VIEWPORT-CC-01.md` — dialog nghiệp vụ nặng: parent portal, ~90vw×90vh.

## Web guide (chi tiết)

`docs/program/specs/PO-HRM-FE-UI-SCREEN-SPEC-GUIDE-01.md`
