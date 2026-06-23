# HRM — Kế hoạch wave (PM điều hành)

> **SoT nghiệp vụ:** `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` · `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md` (119 UC)  
> **Journey:** `docs/program/PROGRAM_JOURNEY_MAP.md` (J-HRM-01..07, J-MOB-01..05)  
> **Môi trường:** Local `:5173` + hrm `:28001` (U32) · Mobile `uat.nv####@xe.vn` / `xevn-uat-2026`  
> **PASS mỗi wave:** SRS happy path + U34 consumer sync + L2.5 cross-nav — **không** chỉ empty+200

## Nguyên tắc (học từ XBOS wave)

1. **QA audit trước** — liệt kê FAIL theo menu/UC, không claim PASS sớm  
2. **Dev fix theo defect** → QA retest → QC gate wave  
3. **U34 consumer sync:** CRUD → list/tab cập nhật ngay; popup → parent refresh  
4. **Fidelity:** sau L2 PASS — `verify:hrm:menu-density` + cardinality G-FID  

| Wave | ID | Phạm vi | Journey / UC | Owner | Trạng thái |
|------|-----|---------|--------------|-------|------------|
| **H0** | `P1-HRM-H0-STACK` | L0 + menu density | — | qa | ✅ |
| **H1–H7** | `P1-HRM-H0-H1-7` | Web menus §2.1 | J-HRM-01..07 | qc | **✅ GWC local** |
| **H8** | `P1-HRM-H8-MOB-UX` | Mobile UI/UX | — | qa | **✅ PASS** |
| **H8b** | `P1-HRM-H8B-MOB-TABS` | Mobile tabs còn lại light theme | — | qa | **✅ PASS** |
| **H9** | `P1-HRM-H9-MOB-FUNC` | Mobile J-MOB | J-MOB-01..05 | qa | **✅ API PASS** |
| **H10** | `P1-HRM-H10-FIDELITY` | Seed density + G-FID | G-FID-07 | dev-be R-H10-01 | **✅ GWC** |
| **H12** | `P1-HRM-H12-P2-POLISH` | P2 + J-HRM-03/04 | J-HRM-03,04 | qa | **✅ PASS** |
| **H11** | `P1-HRM-H11-QC` | QC closeout slice | J-HRM 7/7 | qc | **✅ GWC local** |
| **H8c** | `P1-HRM-H8C-MOB-REST` | Mobile 5 màn dark còn lại | — | qa | **✅ PASS** |
| **H13** | `P1-HRM-H13-P3-POLISH` | P3 UX + AC-FID slugs | — | qc | **✅ GWC** |

## Chu kỳ mỗi wave

```
QA audit (FAIL list + SRS ref) → Dev fix → QA retest → QC spot → wave N+1
```

## Account

| Persona | Account |
|---------|---------|
| Group CEO / HRM embed | `ceo@xe.vn` / `Xevn@2026` |
| Mobile NV UAT | `uat.nv0001@xe.vn` / `xevn-uat-2026` |

## Mobile UX brief (H8)

- Đồng nhất **X-BOS** (primary, surface, radius, typography từ web-portal tokens)  
- Tham khảo UX: BambooHR, Workday mobile, Personio — list→detail, approve flows, empty/loading/error states  
- Không ship «debug text panel» làm UI production  

## Không claim DONE

- Phase 1 DONE / PROD cho HRM khi còn menu SRS **mock-only** hoặc density G-FID FAIL  
- Matrix P-CC-03..08 PASS cũ **≠** wave H1–H7 PASS mới (U34 CRUD)
