# BA-SPEC-CODE-GAP-HRM-01 — HRM spec ↔ code gap scan

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-SPEC-CODE-GAP-HRM-01` |
| **date** | 2026-07-22 (ICT) |
| **from_role** | ba-process |
| **to_role** | pm → **dev-be** / **dev-fe** (EMP-COL) + **ba-docs** (Diễn biến depth) + **sa** (bridge BR-INT-05) |
| **lane** | governance (RESEARCH — no `apps/**`, **cấm deploy**) |
| **ack_status** | **PASS_TO_PM** |
| **register** | `docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` §4–§5 **merged** |
| **align** | `BA-HRM-EMP-COMPANY-COL-01` · `docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md` |
| **HOLD_DEPLOY** | **true** (cột công ty / brand pilot) |

---

## 1. Scope scanned

| Artifact | Path | Notes |
|----------|------|-------|
| Team SRS | `docs/hrm/SRS.md` | UC-HRM-21 shallow on company label; BR-INT-05 |
| Khách FR | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` | 52 FR W1–W2d; FR-HRM-21 embed list |
| TechSpec | `docs/hrm/TECHSPEC.md` | §14 EM / G-EM-* / G-DB-05 orphans |
| DANH_MUC / BA-D-01 | `docs/hrm/DANH_MUC_XBOS_CHO_HRM.md` · governance BA-D-01 | Plane A LE vs Plane B slug |
| Code | `hrm-operating-unit-registry.ts`, `operating-units.service`, `Employees.tsx`, `hrmOperatingUnits.ts` (web) | Khối hardcode + resolve path |
| Prior AC | AC-EMP-COL-01..07 | Reused — không invent lại |

Structural audit: `pnpm docs:srs:audit` → **373/373** (7 mục only — không đếm OS Diễn biến ratios).

---

## 2. P0 focus — employees company column / Khối vs ĐVTV

### Spec says

| Source | Assertion |
|--------|-----------|
| FR-HRM-21 / UC-HRM-21 | List theo phạm vi; empty; list→detail; **không** định nghĩa SoT nhãn cột «Thông tin công ty» |
| DANH_MUC §2 | Tổ chức cấp 1 = **Công ty / pháp nhân thành viên** |
| BR-INT-05 | ĐVTV vận hành map 1:1 slug `employees.company_id` |
| BA-D-01 | Plane **A** = LE/ĐVTV names; Plane **B** = operating slugs (chart interim «Khối» ≠ cột «công ty») |
| Sponsor 2026-07-22 | Cột phải khớp danh sách công ty DB — không «Khối … X.E» |

### Code does

| Layer | Behavior |
|-------|----------|
| BE registry | Hardcode `Khối Vận tải/Logistics/Tài chính/Dịch vụ X.E` |
| BE operating-units | Seed/fallback `company_slug_map.display_name` từ registry |
| FE Employees | `getCompanyName` → `resolveOperatingUnitDisplayName` **trước** membership LE name |
| FE fallback | Static Khối map trong `hrmOperatingUnits.ts` |
| Mobile | Cùng class (G-ORPH-MOB-01) |

```text
spec (intent + DANH_MUC): cột «Thông tin công ty» = tên pháp nhân / ĐVTV
code:                       cột = Plane B operating-unit «Khối …»
```

**Verdict:** **orphan / wrong-SoT** → register **G-ORPH-01** + **G-ORPH-02**; unclear **G-SPEC-01/04/05**. Fix package = AC-EMP-COL-* (đã ship BA-HRM-EMP-COMPANY-COL-01) — **không** re-open Option C.

---

## 3. Diễn biến depth — quick audit (52 FR khách HRM)

| Metric | Result |
|--------|--------|
| Structural FR 7-section (ecosystem audit) | 373/373 PASS |
| HRM khách FR heading count | **52** |
| OS §3.4.5 ratio gate | **Không** — G-RULE-02 / G-SPEC-02 |
| Heuristic «auth/scope ≥3 **hoặc** domainDeep=0» | ~18+ FR flag |

### Samples (auth-heavy / domain-thin) — không claim 100% OS fail tự động

| FR | Pattern | Note |
|----|---------|------|
| **FR-HRM-SC-01** | auth≥3, domainDeep=0 | Tổng quan catalog — thiếu fail sâu (khóa lỗi, sync conflict…) |
| **FR-HRM-AT-02** | auth≥3, domainDeep=0 | List records — thiếu trùng kỳ / filter invalid domain |
| **FR-HRM-08** | auth≥4, domainDeep=0 | Danh mục — chủ yếu quyền/empty |
| **FR-HRM-21** | auth≥3, domainDeep=0 | **+** thiếu SoT cột công ty (G-SPEC-01) |
| **FR-HRM-20** | auth≥3, domainDeep=0 | Dashboard embed |
| **FR-HRM-SCOPE-01/02/03** | auth-heavy | Scope FRs — kỳ vọng auth cao; vẫn cần ≥1 fail domain đo được nếu OS apply |
| **FR-HRM-12** | auth≥3, domainDeep=0 | Inbox |
| **FR-HRM-PR-05** | domainDeep≈0 (prior pass) | Xem phiếu — thiếu fail kỳ chưa tính / phiếu rỗng nghiệp vụ |

**Register:** **G-SPEC-06** (+ G-SPEC-02). Owner remaster: **ba-docs** ADD-only domain fails — không wipe 52 FR.

---

## 4. Orphan code (SRS không / annex only)

| ID | Surface | Action |
|----|---------|--------|
| G-ORPH-01 | Employees company = Khối | Fix code → LE (EMP-COL wave) |
| G-ORPH-02 | FE OU TEST_FIXTURE / historical Khối; runtime cells từ API map (FE sample) | Cùng wave + vitest |
| G-ORPH-03 | Leave workflow bridge/terminal | Spec ADD hoặc TechSpec bước# |
| G-ORPH-04 | job-templates CRUD | G-DB-05 leftover |
| G-ORPH-05 | compensation-packages | Annex F5 |
| G-ORPH-06 | advance/OT/assets | G-DB-05 leftover |
| G-ORPH-MOB-* | Mobile Khối / OU picker | Cùng SoT nhãn với G-ORPH-01 |

---

## 5. Unclear SRS / TechSpec rows

| ID | Severity | Closed by |
|----|----------|-----------|
| G-SPEC-01 FR-21 company label | P0 | AC-EMP-COL + TechSpec 1 dòng resolve LE |
| G-SPEC-04 BR-INT-05 4≠5 | P0 | SA bridge + BR-EMP-COL-02 fail-closed |
| G-SPEC-05 Plane A/B UI copy | P0 | AC-EMP-COL-07 |
| G-SPEC-06 Diễn biến shallow samples | P1 | ba-docs + G-RULE-02 |
| G-SPEC-07 G-EM-01..04 DTO | P1 | existing TechSpec PARTIAL |
| G-SPEC-02/03 | P1/P0 | OS gate + TechSpec depth (program) |

XBOS Diễn biến samples đã merge riêng (`G-SPEC-XBOS-*`) — ngoài scope sửa HRM code.

---

## 6. Register merge proof

Updated `docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md`:

- §4: G-ORPH-01 enriched + G-ORPH-02..06; MOB rows preserved; BA-P note Plane A/B
- §5: G-SPEC-01 rewritten + G-SPEC-04..07; XBOS rows kept
- §6: BA-P **Merged? = YES**

BA_TRACE §19 (EMP-COL) already aligned — no duplicate journey invent.

---

## 7. Handoff contract

```yaml
work_item_id: BA-SPEC-CODE-GAP-HRM-01
from_role: ba-process
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/ba-spec-code-gap-hrm-01-20260722.md
HOLD_DEPLOY: true
completion_report: |
  Closed: HRM spec↔code gap scan; register §4–§5 merged.
  P0: company column Khối vs ĐVTV = G-ORPH-01/02 + G-SPEC-01/04/05 — align AC-EMP-COL-*.
  P1: Diễn biến shallow samples G-SPEC-06 (52 FR heuristic).
  Orphans: leave-WF bridge, job-templates, compensation, G-DB-05 leftovers.
  Residual: BR-INT-05 4≠5 bridge (SA); ba-docs Diễn biến remaster; HOLD_DEPLOY.
next_owner: pm
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: D-HRM-EMP-COMPANY-COL-BE-01 + D-HRM-EMP-COMPANY-COL-FE-01 (parallel U69)
parent: BA-HRM-EMP-COMPANY-COL-01 · BA-SPEC-CODE-GAP-HRM-01 (G-ORPH-01/02 · G-SPEC-01)
spec_ref: docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md · docs/qa/evidence/ba-spec-code-gap-hrm-01-20260722.md · docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md §4–§5
entry_criteria: BA PASS_TO_PM; HOLD_DEPLOY=true; cấm deploy pilot
exit_criteria:
  - Cột «Thông tin công ty» = tên LE/ĐVTV SoT; 0 «Khối … X.E» làm nhãn cuối
  - AC-EMP-COL-01..07; jest BE+FE; J-HRM-02 no regression
  - evidence be-hrm-emp-company-col-01-* + fe-hrm-emp-company-col-01-*
cấm: seed U65; Option C đổi header giữ Khối; deploy
after READY_FOR_QA: QA-HRM-EMP-COMPANY-COL-01 U65 browser

Parallel (governance, không chặn EMP-COL):
- ba-docs: G-SPEC-06 remaster ADD domain fails samples FR-HRM-21/SC-01/AT-02/08 (không wipe)
- sa: G-SPEC-04 BR-INT-05 bridge 4 LE ↔ 5 slug + fail-closed
```

---

## 8. Open risks

| Risk | Owner | Mitigation |
|------|-------|------------|
| Re-seed Khối đè LE display_name | BE | COALESCE / sync from XBOS only |
| Mobile vẫn Khối sau web fix | Mobile | G-ORPH-MOB-01 cùng SoT |
| Diễn biến remaster làm giảm success rows | ba-docs | ADD-only; QC count không giảm success |
| Claim audit 373 = OS depth PASS | PM/QC | G-SPEC-02 — không |

**Không** deploy. **Không** claim Phase 1 / PROD.
