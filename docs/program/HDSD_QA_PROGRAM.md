# Program — HDSD hệ sinh thái (XBOS + HRM tách bộ)

**Program ID:** `P-HDSD-QA-SRS-01` v1.1  
**Sponsor lock:** HDSD **chia 2 sản phẩm** XBOS vs HRM + Cổng chung + Mobile; test **cả hệ sinh thái**, không chỉ HRM embed.

## Cấu trúc tài liệu

```
docs/client-delivery/hdsd/
  HDSD_ECOSYSTEM_INDEX.md          ← mục lục tổng
  ecosystem/                       ← Cổng: login, chuyển XBOS↔HRM
  xbos/                            ← Bộ A: Command Center, dashboard, catalog
  hrm/                             ← Bộ B: app HRM standalone + embed + mobile
```

## QA waves (bắt buộc)

| Wave | Bộ | Persona | Exit |
|------|-----|---------|------|
| W0 | Ecosystem | ceo@xe.vn | TC-ECO-* PASS |
| W1 | **XBOS** | ceo@xe.vn | UF-XBOS-01..15 · `xbos/*` |
| W2a | **HRM standalone** | ceo@xe.vn | `:5175` · UF-HRM-* |
| W2b | **HRM embed** | ceo@xe.vn | `/command-center/hrm/*` |
| W3 | Mobile | uat.nv#### | J-MOB-* |
| W4 | Liên thông | ceo@xe.vn | Catalog sync · headcount |

**Cấm:** Playwright-only làm bằng chứng chính (U65 browser).

## Deliverables

| Artifact | Path |
|----------|------|
| Mục lục tổng | `HDSD_ECOSYSTEM_INDEX.md` |
| XBOS index + chương | `xbos/HDSD_XBOS_INDEX.md` + CH01–04 |
| HRM index + chương | `hrm/HDSD_HRM_INDEX.md` + CH00–12 |
| Testcase matrix | `docs/qa/HDSD_SRS_TESTCASE_MATRIX.md` |
| UAT scenario | `docs/qa/HDSD_DRIVEN_UAT_SCENARIO.md` |

## Residual mở

- `HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md` — inventory only → ba-docs fill
- `HDSD_XBOS_CH01` — gộp full text từ legacy CC
