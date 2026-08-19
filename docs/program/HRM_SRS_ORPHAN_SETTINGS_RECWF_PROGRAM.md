# HRM — Orphan → SRS + Settings master data + REC-WF (governance only)

| Field | Value |
|-------|--------|
| **Date** | 2026-07-23 |
| **Sponsor** | Viết nghiệp vụ từ code vào SRS; Settings CRUD + filter search; SA/BA rà HRM; quy trình TD theo công ty + góp ý khách |
| **CẤM tuyệt đối** | Sửa `apps/**` / `packages/**` · seed · deploy pilot |
| **SoT orphan** | `docs/program/ORPHAN_BUSINESS_VS_SRS_SIMPLE.md` |
| **SoT khách** | `docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md` (F4/F6) · `ADR-WORKFLOW-RESOLVER-DYNAMIC-20260620.md` · program `P1-CUSTOMER-DEMO-HRM-FEEDBACK-PROGRAM.md` |

## Mục tiêu wave

1. **SRS/TechSpec delta** — mọi mục orphan A–C → FR/UC/BR/AC (ADD-only), không đụng code.
2. **Master data Settings** — chức danh NV, vị trí tuyển dụng, loại nghỉ, loại quyết định, thành phần lương… = CRUD trong **Cài đặt HRM** + picker **filter/search**, cấm điền tay free-text làm SoT.
3. **REC-WF** — trả lời + gap: tạo quy trình tuyển dụng HRM đã theo **từng công ty** chưa? linh hoạt theo góp ý khách (Bay.vn/Luxury mức resolver) đã có chưa?

## Trạng thái nhanh

| Chủ đề | As-is | Gap sponsor | SA 2026-07-23 |
|--------|-------|-------------|---------------|
| Workflow động (F4) | ADR accepted; consumer pilot = **nghỉ phép**, không phải TD | Resolver linh hoạt **chưa** là SoT cho tuyển dụng | **Locked:** pilot leave; REC R2 fail-closed = **planned** (`ADR-HRM-SETTINGS-SOT-REC-WF-COMPANY-20260723`) |
| Tuyển dụng F6 | Delta có JD library + dashboard AC; wave CD-FB-09 / F6 từng GWC | Thư viện JD / funnel — cần BA confirm còn trong SRS khách chưa | F6 ≠ REC-WF per-company; BA confirm SRS |
| REC-WF (XHRM) | Spawn + `applyingEntityId`; def lookup **tenant+code** (không 1 row/`company_id`); QC GWC | **1 WF def / company** vs group-wide | **Partial as-is** · Option B To-be **planned** — evidence `sa-hrm-settings-rec-wf-01-20260723.md` |
| Chức danh / vị trí | XBOS SoT + HRM pull/extension | **Chưa** FR Settings CRUD + filter search trong SRS đủ | SoT S1/S3 locked; BA FR wave — **cấm** HRM fork master |

## Deliverables

| Role | work_item | Output |
|------|-----------|--------|
| BA-P | `BA-HRM-ORPHAN-TO-SRS-01` | **PASS 2026-07-23** — delta `docs/program/deltas/BA_HRM_ORPHAN_TO_SRS_01_20260723.md` · `SRS.md` §16 · evidence `docs/qa/evidence/ba-hrm-orphan-to-srs-01-20260723.md` · khách promote = ba-docs wave 2 |
| BA-D | `BA-HRM-SETTINGS-MASTER-DATA-01` | Ma trận field → catalog_key → Settings CRUD → filter AC |
| SA | `SA-HRM-SETTINGS-REC-WF-01` | ADR/TechSpec: Settings SoT vs XBOS pull; REC-WF per company; map F4/F6/Bay.vn |
| ba-docs | (sau BA-P PASS) | Promote FR vào `SRS_HRM_KHACH` / HTML nếu cần — wave 2 |

**Không** dispatch Dev trong wave này.

---

## Status 2026-07-23T14:13:48+07:00 — GOVERNANCE WAVE CLOSED

| Item | Status |
|------|--------|
| BA orphan → SRS §16 | CLOSED |
| BA-D settings matrix + FR align | CLOSED |
| SA Settings SoT + REC-WF answers | CLOSED |
| ba-docs SRS khách W2e delta | CLOSED |
| Dev remaster (Settings CRUD / REC Option B) | **NOT DISPATCHED** — chờ sponsor |
| HOLD_DEPLOY | vẫn hiệu lực |

## Execution unlock 2026-07-23T14:19:13+07:00 — sponsor «ok làm đi»
| work_item | Role | Status |
|-----------|------|--------|
| D-HRM-SETTINGS-MD-CRUD-BE-01 | dev-be | DISPATCHED |
| D-HRM-SETTINGS-MD-CRUD-FE-01 | dev-fe | DISPATCHED |
| D-HRM-REC-WF-OPTION-B-BE-01 | dev-be | DISPATCHED |
| QA-HRM-EMP-COMPANY-COL-01 | qa | RE-DISPATCHED |
| Deploy :8088 | devops | after QA PASS |
