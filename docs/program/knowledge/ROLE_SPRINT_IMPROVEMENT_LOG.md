# Role sprint improvement log (Phase 1)

PM ghi **sau mỗi retro** `S{n}_RETRO.md` — 1 hành vi cải thiện cụ thể / role / sprint.

| Sprint | Role | Improvement (hành vi sprint sau) | Evidence |
|--------|------|----------------------------------|----------|
| S0 | PM | Không coi L2 HTTP = pilot xong; tách shell vs iframe | S0_RETRO.md |
| S0 | QA | Bắt buộc FE embed audit + browser note | hrm-embed-fe-audit |
| S0 | Dev-FE | Gate Supabase trước merge embed | s1-fe-embed-debt |
| S0 | Dev-BE | company_id TEXT + DTO cho pilot main | tm-scrum-s0 |
| S1 | PM | WBS PMP + density/persona gate | PHASE1_PMP_PROJECT_PLAN |
| S1 | BA-P | Menu↔UC↔catalog matrix đầy đủ | HRM_MENU_DATA_LINKAGE_MATRIX |
| S1 | BA-D | Cardinality 95% contracts/insurance | HRM_SEED_CARDINALITY_RULES |
| S1 | SA | RBAC 3-rung + multi-membership ADR | ADR-HRM-RBAC-SCOPE-LADDER |
| S1 | Dev-BE | seed:hrm:fidelity + scope main alignment | hrm-fidelity-be |
| S1 | Dev-FE | Linked-data empty notice | hrm-fidelity-fe |
| S1 | DevOps | Fidelity runbook chain | HRM_FIDELITY_SEED_RUNBOOK |
| S1 | QA | Persona row counts not chỉ HTTP 200 | hrm-fidelity-qa-retest |
| S1 | PM | Không kết turn bằng "PM sẽ…"; cùng lượt: gate + dispatch + hotfix | PM_ORCHESTRATION_KB.md |
| S1 | PM | U16: tách execution (Dev+QA) vs governance (PM/SA/BA/TA) + Cursor self-improve loop | team-execution-vs-governance.mdc |
| U18 | PM | U19: journey map SoT; L2.5 cross-nav; incident→governance same day | J-HRM-01 employee 404, uat-production-readiness-orchestration.mdc |
| U18 | QA | Không PASS_TO_PM khi thiếu J-* L2.5 | PILOT_BUSINESS_FLOW_MATRIX J section |
| U18 | Dev-BE | Scope parity list vs get-by-id trước READY_FOR_QA | employees getEmployeeById fix |
| GOV | QC | Không GO từ hook/thiếu file; pack verify + J-* + ENV vs PRODUCT trước verdict | QC_ZERO_DEFECT_REFORM_PLAN.md |
| GOV | QA | Một file evidence: qa:strict-minigate:crud + verify:qc:evidence-pack exit 0 | scripts/qa-strict-minigate-crud.mjs |
| GOV | PM | Block Task qc nếu verify:qc:evidence-pack chưa PASS | qc-evidence-pack-gate.mdc |

*PM append rows at sprint review — không xóa lịch sử.*
