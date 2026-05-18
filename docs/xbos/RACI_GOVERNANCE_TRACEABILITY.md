# Traceability — RACI Governance Wave

| BR | UC | API | DB Table | UI | Test evidence |
|----|-----|-----|----------|-----|---------------|
| BR-RACI-01 | UC-RACI-01, UC-RACI-05 | GET /activities | `raci_activity_catalog` | Sub-view Ma trận | `pnpm seed:raci:catalog` log count |
| BR-RACI-02 | UC-RACI-02 | GET/PUT /matrix | `company_raci_matrix_cell` | `CompanyRaciPanel` matrix | Manual: edit cell persist |
| BR-RACI-03 | UC-RACI-03 | GET /capabilities | `raci_ecosystem_capability` | Sub-view Ánh xạ | Seed sample capabilities |
| BR-RACI-04 | UC-RACI-06 | GET /coverage | computed | Coverage card | % displayed |
| BR-RACI-05 | UC-RACI-04 | — | `company_raci_column_binding` | Sub-view Gán | Dropdown save |
| BR-RACI-06 | UC-RACI-02 | PUT cell | `raci_matrix_audit_log` | — | P1 |
| BR-RACI-07 | All | scope headers | all tables | GlobalFilter company | 403 out of scope |

## File map

| Layer | Path |
|-------|------|
| BRD | `docs/xbos/RACI_GOVERNANCE_BRD.md` |
| SRS | `docs/xbos/RACI_GOVERNANCE_SRS.md` |
| TECHSPEC | `docs/xbos/RACI_GOVERNANCE_TECHSPEC.md` |
| Source data | `docs/ma trận chức năng RACI.md` |
| Column catalog TS | `apps/web/web-portal/src/data/xevn-raci-catalog.ts` |
| Migration | `apps/api/xbos-api/migrations/20260516_raci_governance.sql` |
| Seed | `scripts/seed-raci-activity-catalog.mjs` |
| API module | `apps/api/xbos-api/src/raci-governance/` |
| FE API client | `apps/web/web-portal/src/integrations/raciGovernanceApi.ts` |
| FE UI | `apps/web/web-portal/src/pages/command-center/CompanyRaciPanel.tsx` |
| Wire | `CommandCenterPage.tsx` tab `raci` |
