# Sponsor lock — catalog mẫu HĐ **động** (2026-08-07)

| Meta | Value |
|------|--------|
| **Lock** | 8 mẫu X.E trong Excel = **ví dụ / starter** — **không** là enum đóng |
| **Must** | HR/Settings **CRUD thêm mẫu thứ 9+** (code + pack + clause DnD + duration defaults) không cần release code |
| **Forbidden** | DB `CHECK code IN (8 XEVN_*)` · API reject «9th» · FE hardcode list 8 · seed-only catalog |
| **Parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-01` |
| **Correction WI** | `PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-CORR-01` |

## Model

1. `hrm_contract_templates` = **open catalog** (unique `code` per company/scope).
2. Bootstrap/ensure may **upsert** 8 `XEVN_*` starter rows từ Excel matrix — optional, not ceiling.
3. Validation: slug/code format · `pack_code` ∈ configured packs · term/duration rules — **not** closed code enum.
4. Print/merge binds `template_code` FK → active template row (any code HR created).
5. Holding publish/pull still versioned catalog (DATA-02) — members get new templates via library, not hardcoded list.

## Honesty
`contracts_printable_ready=false` until QA/QC after dynamic CRUD + starter 8 work.

## Extension (sponsor 2026-08-07 — platform)
Không chỉ mã mẫu: **điều khoản + cấu trúc + nội dung** cũng là dữ liệu cấu hình (DnD/edit/version).  
Áp dụng cùng nguyên tắc MISA/Base cho NS · TD · lương · bảng công · bảng lương · danh mục · Settings.  
Program: `docs/program/PO_HRM_DYNAMIC_CONFIG_PLATFORM_01.md`

