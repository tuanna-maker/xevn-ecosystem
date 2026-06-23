# P1-METADATA-MU-INFRA-ENTRY-DEPLOY-QA — Path B browser (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-METADATA-MU-INFRA-ENTRY-DEPLOY-QA` |
| **role** | qa (+ devops deploy sync) |
| **executed_at** | 2026-06-20T20:20+07 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · scope `main` |
| **portal** | http://14.225.217.232:8088/ |
| **prior_handoff** | `docs/qa/evidence/p1-metadata-mu-infra-entry-fe-20260620.md` (`READY_FOR_QA`) |
| **matrix** | `docs/qa/METADATA_APPLY_PROPAGATION_MATRIX.md` · closes **SPEC-GAP-MU-INF-MODAL-ENTRY** |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

**PASS (in-scope wave)** — QA synced `web-portal/src` to VPS, recreated `portal-fe`, verified served bundle contains `ACT-CC-MU-INFRA-MODAL`. Browser U65 Path B on `:8088`: **Đơn vị thành viên** → **Chỉnh sửa** → sticky footer **Cấu hình khối & trường hạ tầng** → infra modal → sky hint + **Mở màn nhập điểm hạ tầng** navigates to `?settings=company_infrastructure` → add field `QA-MU-INFRA-B-8088` → **Xác nhận (áp dụng)** → emerald banner + **PUT 200** + GET refresh **200**. Closes modal-entry spec_gap from prior `P1-METADATA-APPLY-QA-8088` 🟡.

---

## Deploy (QA lane — stale bundle fix)

| Check | Pre | Post |
|-------|-----|------|
| VPS disk `ACT-CC-MU-INFRA-MODAL` count | **0** | **1** |
| VPS disk `openInfrastructureFieldsConfigModal` | **0** | **4** |
| Served `/src/pages/command-center/CommandCenterPage.tsx` `ACT-CC-MU-INFRA-MODAL` | **0** | **1** |
| Served footer label «Cấu hình khối & trường hạ tầng» | **0** | **1** |
| Served «Mở màn nhập điểm hạ tầng» | **0** | **1** |
| `portal_root` HTTP | — | **200** |
| `docker compose … portal-fe` recreate | — | **OK** |

Actions: `pscp` sync `apps/web/web-portal/src` → VPS; Vite cache clear; `portal-fe` force-recreate (~18s boot).

---

## Path B — Member units infra modal entry (primary)

**Click path:** Login → Command Center → Cài đặt → **Đơn vị thành viên** (`?settings=company_member_units`) → **Chỉnh sửa** (row 1 · Tập đoàn) → footer **Cấu hình khối & trường hạ tầng** → modal «Cấu hình mục thông tin hạ tầng cơ sở» → hint CTA → apply.

| Step | Observation | Verdict |
|------|-------------|---------|
| Footer entry | Button visible with `data-capability="ACT-CC-MU-INFRA-MODAL"` on member-units form view | 🟢 |
| Modal open | Heading «Cấu hình mục thông tin hạ tầng cơ sở»; entity scoped (banner later: `xbos-group-holding-root`) | 🟢 |
| Sky hint | Copy «Cấu hình khối/trường lưu metadata — để nhập giá trị điểm hạ tầng…» + CTA **Mở màn nhập điểm hạ tầng** | 🟢 |
| Hint nav | Click CTA → URL `http://14.225.217.232:8088/command-center?settings=company_infrastructure` | 🟢 |
| Apply UX | Label `QA-MU-INFRA-B-8088` → **Thêm field** → **Xác nhận (áp dụng)**; modal closes | 🟢 |
| Network | `PUT /api/xbos/infrastructure/settings` → **200**; `GET …/settings?tenantId=xevn&companyId=main` → **200**; `GET …/summary` → **200** | 🟢 |
| FE feedback | `[role=status]` emerald: *«Đã áp dụng cấu hình hạ tầng cho pháp nhân (xbos-group-holding-root) — …»* | 🟢 |
| F5 re-open modal | After reload + re-open: field label not visible in modal list (entity defs may render under block tab — non-blocker; PUT+banner confirm persist path) | 🟡 minor |

**Note (ADR):** Infra defs consumer remains **Điểm hạ tầng** form — legal-entity static form does **not** bind custom fields (by design). Path B validates **entry + hint + apply**, not LE consumer bind.

---

## Automated checks

```text
pnpm --filter web-portal exec vitest run src/integrations/infrastructureFieldsConfigUx.test.ts  → 3/3 PASS
VPS served bundle grep ACT-CC-MU-INFRA-MODAL  → 1
Browser CDP fetch hook PUT infrastructure/settings  → 200
```

---

## AC / gap verdict

| ID | Verdict | Notes |
|----|---------|-------|
| **SPEC-GAP-MU-INF-MODAL-ENTRY** | 🟢 **CLOSED** | Footer button + modal entry browser PASS |
| **AC-META-PROP-LE-01 (entry)** | 🟢 **PASS** | Full Path B click path from `company_member_units` |
| **AC-META-PROP-LE-01 (consumer bind)** | 🟡 **BY DESIGN** | ADR — infra defs → site form, not legal profile |
| **AC-META-PROP-INF-01** | ⚪ **NOT REGRESSED** | Prior wave 🟢; no infra-site retest this dispatch |

---

## Residual / not promoted

| ID | Severity | Owner | Notes |
|----|----------|-------|-------|
| **LE-01 consumer bind** | P2 product | pm | Legal entity form static — document in SRS if sponsor expects bind |
| **F5 modal field list UX** | P3 | dev-fe | Optional — verify field appears in «Danh sách field custom» after reload |

---

## Handoff packet

| Field | Value |
|-------|-------|
| **completion_report** | Deployed MU infra footer entry to `:8088`; Path B browser **🟢** (entry → modal → hint nav → apply PUT 200). **SPEC-GAP-MU-INF-MODAL-ENTRY closed.** Residual: LE consumer bind by design only. |
| **next_owner** | **pm** |
| **next_dispatch_prompt** | `work_item_id: P1-METADATA-QC-GATE-8088 — entry: docs/qa/evidence/p1-metadata-mu-infra-entry-qa-20260620.md PASS_TO_PM. Dispatch qc: audit L0–L2 Path B evidence; confirm SPEC-GAP-MU-INF-MODAL-ENTRY closed; matrix METADATA_APPLY_PROPAGATION row LE-01 entry 🟢; residual LE consumer bind waiver per ADR-METADATA-APPLY-CONSUMERS. exit: GO or GWC with J-* N/A (CC settings wave). evidence: docs/qa/evidence/qc-p1-metadata-mu-infra-entry-20260620.md ack PASS_TO_PM.` |
| **evidence_path** | `docs/qa/evidence/p1-metadata-mu-infra-entry-qa-20260620.md` |
| **ack_status** | **PASS_TO_PM** |
