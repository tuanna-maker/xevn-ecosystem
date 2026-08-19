# PO — Nền tảng cấu hình động HR (lớp MISA / Base)

| Meta | Value |
|------|--------|
| **Program** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-01` |
| **Opened** | 2026-08-07 |
| **Sponsor** | Điều khoản + cấu trúc mẫu HĐ phải động; nghiên cứu sâu MISA/Base — nguyên tắc cấu hình động áp dụng NS · TD · lương · bảng công · bảng lương · HĐ · danh mục · cài đặt |
| **Honesty** | Không claim module UAT / Phase1 từ research; `contracts_printable_ready=false` đến QC sau impl |
| **Supersedes (narrow)** | Enum đóng 8 mã HĐ · hardcode body Điều · FE hardcode clause text |

## Research anchors (public help — không copy sản phẩm)

### MISA AMIS (Thông tin nhân sự)
| Principle | Hành vi tham chiếu |
|-----------|-------------------|
| **Document templates** | Settings → Mẫu văn bản / email; loại mẫu theo phân hệ (HĐ, bổ nhiệm, …) |
| **Merge fields** | `#tên trường#` · tải danh sách trường trộn · mở rộng khi thêm custom field |
| **Custom fields** | Trường mở rộng theo phân hệ; copy từ hồ sơ NV; công thức (vd. tổng PC) |
| **Template ≠ fixed law text** | HR upload/soạn mẫu; hệ thống trộn dữ liệu master |
| Refs | helpamis.misa.vn — mẫu văn bản, trường mở rộng HĐ, trường trộn |

### Base HRM
| Principle | Hành vi tham chiếu |
|-----------|-------------------|
| **Contract type catalog** | Settings → Phân loại HĐ — CRUD loại (thử việc, 12T, …) |
| **DOCX + variables** | `${contract_*}` · `${employee_*}` · custom `${contract_key}` / `${employee_key}` |
| **Per-type custom fields** | Mỗi loại HĐ có trường tùy chỉnh riêng |
| Refs | help.base.vn — contract template, contract classification |

## XeVN target principles (SA ADR Option B — 2026-08-07)

SoT: [`docs/architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md`](../architecture/ADR-HRM-DYNAMIC-CONFIG-PLATFORM.md) · evidence `docs/qa/evidence/po-hrm-dynamic-config-platform-sa-01.md`

1. **Catalog-driven everything config-facing** — templates, clause library, packs, form schemas, payroll components, attendance code maps, recruitment stages: rows in Settings, not compile-time enums (starter rows OK).
2. **Merge token registry** — SoT fields (employee, contract, C&B, OU, license…) + custom fields → printable/DOCX/PDF merge; adding a Settings field auto-registers token.
3. **Clause & structure as data** — ordered clause graph / layout_json per template; HR DnD + edit body_vi + legal_basis; version freeze on issue (đã có print-spine — mở rộng).
4. **Domain modules share same pattern** — Personnel forms · Recruitment pipelines · Attendance codes · Payroll items · Catalogs · Contracts — one **metadata platform** (schema + catalog + merge), specialized UIs.
5. **Preserve** — soft-delete · tenant/OU scope · UF-HRM-02 registry · XBOS catalog publish where group SoT · U65 FE CRUD.

## Waves
| ID | Owner | Status |
|----|-------|--------|
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-SA-01` | sa | **DONE** — ADR Option **B** · CONFIRM 2026-08-07 |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BA-01` | ba-process | **DONE** — capability matrix |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECH-01` | sa | **PASS_TO_PM** — TechSpec [`specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md`](./specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-TECHSPEC-01.md) · evidence `docs/qa/evidence/po-hrm-dynamic-config-platform-tech-01.md` |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DOCS-01` | ba-docs | **DONE** · SRS v0.20 FR-PLT-01 + FR-09d EXPAND |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-DATA-01` | ba-data | **DONE** · MergeToken physical |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-API-01` | sa | **DONE** · F-PLT-TOK F.1 |
| `PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01` | dev-be | **DISPATCHED** — ensureSchema MergeToken |
| Contract lane | CORR PASS · BE dynamic | **in flight** — first vertical |

## Exit (program research)
Option **B CONFIRMED** + BA matrix + **TechSpec platform** → ba-data physical → API F.1 → CTR vertical impl → roll interfaces ATT/PAY/REC/EMP.

## Related (sponsor 2026-08-07)
Full AMIS HRM parity research (không chỉ HĐ): [`PO_HRM_AMIS_PARITY_RESEARCH_01.md`](./PO_HRM_AMIS_PARITY_RESEARCH_01.md) · payroll formula gap [`PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01.md`](./PO_HRM_PAYROLL_FORMULA_AND_RUN_GAP_01.md).
