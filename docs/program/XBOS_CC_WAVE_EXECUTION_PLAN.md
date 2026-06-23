# XBOS Command Center — Kế hoạch wave (PM điều hành)

> **SoT nghiệp vụ:** `XBOS_CC_BUSINESS_MENTAL_MODEL.md`  
> **Môi trường:** Local `:5173` + xbos `:28002` + hrm `:28001` (U32) · Account `ceo@xe.vn`  
> **PASS mỗi wave:** Journey save → reload/F5 → consumer — không HTTP 200 đơn lẻ

| Wave | ID | Phạm vi | Journey | Owner chính | Trạng thái |
|------|-----|---------|---------|-------------|------------|
| **W0** | `P1-XBOS-W0-STACK` | L0 dev stack, tsconfig xbos-api | `qc:dev-stack`, `qc:fe-be-health` | devops → qa | **active** |
| **W1** | `P1-XBOS-W1-LEGAL` | Đơn vị thành viên | J-XBOS-03,04 | qa→dev-fe→qa | **closing** (SHR fix PASS) |
| **W2** | `P1-XBOS-W2-INFRA` | Hạ tầng | J-XBOS-05 | qa retest PASS → qc | **closing** |
| **W3** | `P1-XBOS-W3-DEPT-TPL` | Khung PB | J-XBOS-06 | qa→qc | **✅ GWC local** |
| **W4** | `P1-XBOS-W4-DEPT-TREE` | Phòng/Ban pháp nhân | J-XBOS-07 | qc | **✅ GWC local** |
| **W5** | `P1-XBOS-W5-HRM-CAT` | Danh mục NS | J-XBOS-08 | qc | **✅ GWC local** |
| **W6** | `P1-XBOS-W6-RBAC` | Phân quyền | J-XBOS-09 | qc | **✅ GWC local** |
| **W7** | `P1-XBOS-W7-WF` | Quy trình + inbox CC | J-XBOS-10, J-XBOS-01 | qc | **✅ GWC local** |
| **W8** | `P1-XBOS-W8-CATALOGS` | Văn bản / Đo / Giá | J-XBOS-11 | qc | **✅ GWC local** (D-W8-CAT-* CLOSED) |
| **W9** | `P1-XBOS-W9-CLOSE` | Asset requests + matrix | J-XBOS-12 | qc | **✅ GWC local** |

## Chu kỳ mỗi wave (U31 + U33)

```
QA audit journey (FAIL list) → Dev fix defects → QA retest → QC spot (wave) → wave N+1
```

## Wave đang chạy

**W0 + W1** — 2026-06-06: PM dispatch QA audit W1; devops verify stack nếu QA blocked.

## Defect register (mở)

| ID | Wave | Mô tả |
|----|------|-------|
| D-U31-DEPT-REF-SYNC-01 | W3 | **closed** local — ref tab preview |
| *(W1 audit sẽ bổ sung)* | | |

## Không làm trong wave này

- Deploy VPS `:8088` (U32)
- Claim Phase 1 DONE / PROD-READY
