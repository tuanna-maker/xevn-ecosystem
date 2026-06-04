# HRM — Chương trình rà soát chất lượng & nghiệp vụ

**Owner:** PM  
**Ngày mở:** 2026-05-24  
**Phạm vi:** `hrm-api` · `apps/web/hrm` · embed portal · mobile pilot  
**SoT nghiệp vụ:** `docs/hrm/SRS.md` · `BANG_TONG_HOP_USECASE_HRM.md` (119 UC) · `HRM_MENU_DATA_LINKAGE_MATRIX.md`

---

## 1. Kết luận executive (một dòng)

**HRM chưa đạt tiêu chuẩn UAT-PASS / production** — kỹ thuật lõi embed+API **ổn** (test PASS, density 7/7), nhưng **nghiệp vụ end-to-end và FE dual-mode** còn lỗ hổng P0/P1.

| Lớp | RAG | Bằng chứng |
|-----|-----|------------|
| BE unit tests | 🟢 | 127/127 jest PASS |
| FE unit tests | 🟢 | 78/78 vitest PASS |
| Dữ liệu UAT density | 🟢 | `verify:hrm:menu-density` 7/7 |
| L2 embed API smoke | 🟢 | `test:hrm-embed:audit` 8/8 |
| L2.5 journey cross-nav | 🟡 | J-HRM-01 fix; J-02..07 chưa đóng QA |
| Scope parity BE | 🟡 | employees ✅; recruitment mutate, contract delete, performance… |
| FE crash-safe dates | 🟡 | EmployeeSalary ✅; Contracts/Decisions/recruitment còn risk |
| Dual-mode Supabase guard | 🟡 | 32 module pilot guard ✅; ~90 file còn import Supabase (full app) |
| 119 UC HRM sign-off | 🔴 | Phần lớn API list; detail/write/mobile/recruitment full chưa e2e |
| Catalog XBOS→HRM | 🟡 | 6/72 publish ban đầu; DO-B1 mở rộng — cần verify pull path |

---

## 2. Tiêu chuẩn áp dụng

| Chuẩn | Rule / doc |
|-------|------------|
| Scope group CEO `main`→holding | `ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` |
| L0–L2.5 QA gate | `business-flow-zero-defect-gate.mdc`, `PROGRAM_JOURNEY_MAP.md` |
| Embed Supabase guard | `hrmEmbedPilotGuardAudit.test.ts`, ADR embed data mode |
| Business correctness | `business-correctness-quality.mdc` |
| Menu↔data fidelity | `HRM_MENU_DATA_LINKAGE_MATRIX.md`, cardinality rules |

---

## 3. Phát hiện ưu tiên

### P0 — User thấy lỗi / blocker UAT

| ID | Vấn đề | Owner | Wave |
|----|--------|-------|------|
| HRM-P0-01 | GET employee scope (main) — **đã fix** | Dev-BE | ✅ retest QA |
| HRM-P0-02 | `Invalid time value` EmployeeSalary — **đã fix** | Dev-FE | ✅ |
| HRM-P0-03 | Router reload / deep link embed — **đã fix** | Dev-FE | ✅ retest |
| HRM-P0-04 | L2.5 J-HRM-01..07 chưa PASS evidence | QA | **W1** |
| HRM-P0-05 | `format(new Date(api))` crash trên Contracts/Decisions/recruitment | Dev-FE | **W1** |

### P1 — Chất lượng code / scope

| ID | Vấn đề | Owner | Wave |
|----|--------|-------|------|
| HRM-P1-01 | Scope parity: recruitment create/schedule exact `company_id` | Dev-BE | **W1** |
| HRM-P1-02 | Contract delete/update không verify scope rollup | Dev-BE | **W1** |
| HRM-P1-03 | `operations/tasks` DTO UUID vs slug `main` | Dev-BE | W2 |
| HRM-P1-04 | Performance module scope không rollup | Dev-BE | W2 |
| HRM-P1-05 | Employee profile tabs (Skills, Resume…) vẫn Supabase-only | Dev-FE | W2 |
| HRM-P1-06 | Recruitment full UI (campaigns, headcount…) Supabase — ngoài embed pilot | Dev-FE | W3 |

### P2 — Nghiệp vụ / completeness 119 UC

| ID | Vấn đề | Owner | Wave |
|----|--------|-------|------|
| HRM-P2-01 | Import/export, metadata queue write paths | Dev+BA | W3 |
| HRM-P2-02 | Mobile 15 UC — smoke only một phần | Dev-Mobile+QA | W2 |
| HRM-P2-03 | Catalog publish còn thiếu / API pull 502 khi XBOS down | DevOps+BE | W2 |
| HRM-P2-04 | Member CEO persona (du-lich) data trống | Dev-BE+seed | W3 |

---

## 4. Wave điều phối (đang chạy)

```
W0 (2026-05-24) — Audit parallel
  ├─ Dev-BE  → hrm-be-quality-audit
  ├─ Dev-FE  → hrm-fe-quality-audit
  ├─ BA-P    → hrm-business-completeness-audit
  └─ QA      → hrm-qa-full-audit (L0–L2.5)

W1 (P0/P1 hot) — DISPATCHED
  ├─ Dev-BE  → scope parity wave (recruitment, contracts)
  ├─ Dev-FE  → formatDisplayDate rollout
  └─ QA      → J-HRM retest + regression

W2 — Sau W1 PASS
  ├─ Dev-BE  → operations slug, performance scope
  ├─ Dev-FE  → employee tab API migration
  └─ QA      → full L2.5 + mobile smoke

W3 — UAT-PASS target
  ├─ BA      → UC closure matrix update
  ├─ QC      → GO/GWC slice sign-off
  └─ PM      → SERVICE_READINESS update
```

---

## 5. Definition of Done — HRM UAT-READY (slice Group CEO)

- [ ] L0–L2.5 PASS (`ceo@xe.vn`, 8 tab + J-HRM-01..07)
- [ ] 127+ BE tests PASS; scope parity checklist signed TM
- [ ] FE vitest PASS; zero P0 date crash paths on pilot routes
- [ ] `verify:hrm:menu-density` 7/7
- [ ] Evidence bundle: `docs/qa/evidence/hrm-*-20260524.md`
- [ ] QC **GWC** minimum — not Production GO

---

## 6. Evidence index

| File | Role |
|------|------|
| `docs/qa/evidence/hrm-full-quality-audit-20260524.md` | PM synthesis |
| `docs/qa/evidence/hrm-be-quality-audit-20260524.md` | Dev-BE |
| `docs/qa/evidence/hrm-fe-quality-audit-20260524.md` | Dev-FE |
| `docs/qa/evidence/hrm-qa-full-audit-20260524.md` | QA |
| `docs/program/governance/hrm-business-completeness-audit-20260524.md` | BA |
| `docs/qa/evidence/hrm-embed-fe-audit-20260524.md` | L2 smoke |

---

## 7. Trách nhiệm team

| Role | Việc ngay |
|------|-----------|
| **PM** | Giữ wave W1; cập nhật `PROJECT_STATUS_REPORT` sau QA verdict |
| **SA** | Review scope parity ADR delta nếu BE đổi mutate paths |
| **BA-P** | Map J-* → UC acceptance; đóng spec_gap |
| **BA-D** | Cardinality / API field semantics (period_label vs pay_date) |
| **Dev-BE** | W1 scope parity + tests |
| **Dev-FE** | W1 date safety + router verify |
| **Dev-Mobile** | W2 leave/payslip/approval journeys |
| **QA** | L2.5 matrix execution |
| **QC** | NO-GO until W1 evidence |
| **TM** | Audit SOLID + scope_parity trước GWC |
