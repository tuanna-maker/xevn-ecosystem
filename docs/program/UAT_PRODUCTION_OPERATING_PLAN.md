# Kế hoạch điều hành & vận hành — UAT → Production

**Owner:** PM  
**Audience:** Toàn team (Dev, QA, QC, SA, BA, TM, DevOps)  
**Cập nhật:** 2026-05-24 (U19 — sau incident J-HRM-01)

---

## 1. Mục tiêu

| Mốc | Định nghĩa | Chỉ số đạt |
|-----|------------|------------|
| **UAT-READY** | User nghiệp vụ test được trên môi trường chỉ định | L0–L2.5 PASS persona Group CEO slice |
| **UAT-PASS** | Sign-off nghiệp vụ | Script UAT + 0 defect P0/P1 mở |
| **PROD-READY** | An toàn release | QC GO + security/deploy/observability |
| **PROD-LIVE** | Vận hành | Smoke prod + monitoring |

**Không** gọi «Phase 1 DONE» khi chưa đạt closure target UC (`PHASE1_UC_SRS_TECHSPEC_MATRIX`) **và** QC program GO.

---

## 2. Mô hình hai lane (U16) + chủ động (U18/U19)

```
Governance (PM/SA/BA/TA) ──đọc SRS + journey map + ADR──► delta / rule / prompt
         │
         ▼
Execution (Dev + QA) ──implement + L0–L2.5 evidence──► PASS_TO_PM
         │
         ▼
Governance QC/TM ──GO / GWC / NO-GO──► cập nhật Cursor artifacts
```

**U19:** Mỗi defect user-visible → **cùng ngày** cập nhật journey map + matrix + ít nhất 1 rule/prompt.

---

## 3. Lớp kiểm tra chất lượng (chuẩn hóa)

| Lớp | Lệnh / artifact | Owner | Tần suất |
|-----|-----------------|-------|----------|
| L0 | `pnpm run qc:dev-stack` | DevOps/QA | Mỗi wave, trước UAT |
| L1 | `pnpm run test:system:uat` | QA | Sau BE/integration change |
| L2 | `PILOT_BUSINESS_FLOW_MATRIX` P-CC-* | QA | Mỗi sprint wave |
| **L2.5** | **`PROGRAM_JOURNEY_MAP` J-*** | **QA** | **Mỗi wave HRM/embed/mobile** |
| L3 | QC evidence `docs/qa/evidence/qc-*.md` | QC | Trước UAT-PASS / PROD |

---

## 4. Lịch điều hành (cadence)

### Hàng ngày (PM)
- Đọc đuôi bus + `TEAM_LIVE_STATUS.md`
- Cập nhật `PROJECT_STATUS_REPORT.md` nếu có thay đổi gate
- Dispatch execution theo backlog; **không idle** sau QA PASS

### Sau mỗi wave Dev/QA
1. QA evidence (L0–L2.5)
2. Dispatch QC/TM nếu chưa verdict
3. Governance: 1 cải tiến Cursor (rule/prompt/KB)

### Cuối sprint
- Retro `S{n}_RETRO.md`
- `ROLE_SPRINT_IMPROVEMENT_LOG.md`
- Review `SERVICE_READINESS_UAT_PRODUCTION.md`

### Trước UAT mở rộng user
- Checklist §6 UAT prerequisites
- `USER_SERVICE_STATUS.md` đồng bộ

### Trước Production
- Checklist §7 Production
- TM security + DevOps deploy smoke

---

## 5. RACI — sẵn sàng dịch vụ

| Hoạt động | PM | SA | BA | Dev | QA | QC | TM | DevOps |
|-----------|----|----|----|----|----|----|----|--------|
| Journey map | A/R | C | C | I | C | I | I | — |
| Scope parity ADR | A | R | I | R | C | I | C | — |
| L2.5 test | A | — | C | I | **R** | C | — | — |
| UAT script | A | — | **R** | C | R | C | — | — |
| QC Go/No-Go | A | C | I | I | C | **R** | C | C |
| Prod deploy | A | C | — | C | C | R | C | **R** |

A= accountable, R= responsible, C= consulted, I= informed

---

## 6. Điều kiện tiên quyết UAT

1. `deploy/xevn-ecosystem/.env` — DB credentials đúng
2. `pnpm run qc:dev-stack` → HRM + XBOS + portal 200
3. Seed: `seed:hrm:1000-uat` + `seed:hrm:fidelity` (DB trống)
4. `pnpm run verify:hrm:menu-density` → 7/7
5. Account: `docs/hrm/HUONG_DAN_DANG_NHAP_PILOT.md`
6. **L2.5:** J-HRM-01..07 retest PASS (Group CEO)

---

## 7. Production — checklist

- [ ] `pnpm verify:production-env` (strict)
- [ ] QC Phase program **GO** (không chỉ slice GWC)
- [ ] TLS + secrets rotation runbook
- [ ] Backup/restore drill evidence
- [ ] Monitoring/Grafana alerts prod
- [ ] Pen test / TM sign-off
- [ ] VPS deploy smoke mới (`vps-deploy-smoke`)

---

## 8. Backlog điều hành còn mở (2026-05-24)

| ID | Việc | Owner | Trigger reopen |
|----|------|-------|----------------|
| GOV-01 | Hoàn thiện J-HRM-02..07 L2.5 QA | QA | Mỗi wave HRM |
| GOV-02 | Scope parity audit toàn HRM API | Dev-BE + TM | SA trigger |
| GOV-03 | Phase 1 UC closure (planned/be) | PM + Dev | Sprint wave |
| GOV-04 | `operations/tasks` slug DTO | Dev-BE | UC-HRM-20 |
| GOV-05 | Publish HRM catalogs còn lại | DevOps + BE | G5 |

---

## 9. Liên kết

- Trạng thái dịch vụ: `SERVICE_READINESS_UAT_PRODUCTION.md`
- Báo cáo user: `PROJECT_STATUS_REPORT.md`
- User-facing: `USER_SERVICE_STATUS.md`
- Governance loop: `GOVERNANCE_IMPROVEMENT_LOOP.md`
- Rule: `.cursor/rules/uat-production-readiness-orchestration.mdc`
