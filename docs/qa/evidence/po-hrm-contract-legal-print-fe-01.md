# Evidence — PO-HRM-CONTRACT-LEGAL-PRINT-FE-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-FE-01` |
| **lane** | execution · dev-fe |
| **date** | 2026-08-06 |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | ADD |
| **sponsor_confirm** | 2026-08-06 OK làm BE/FE |
| **u65** | zero-seed · honesty `contracts_printable_ready=false` |
| **must_keep** | UF-HRM-02 registry CRUD list/create/edit/F5 |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **srs** | `docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md` §C–D · FR-UC-BP-CORE-09a/b/c · AC-CTR-PRINT-01..08 · AC-CTR-CL-01 |
| **unicom** | `PO-HRM-CONTRACT-LEGAL-PRINT-UNICOM-OUTLINE-01.md` — LEGAL_BASIS · DnD template · create = pick clauses |
| **tech_spec** | `PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md` · layout_json · pack · preview/print spine |
| **data / api** | `PO-HRM-CONTRACT-LEGAL-PRINT-DATA-01.md` §5.2–5.12 `/api/hrm/contracts-insurance/contract-clauses\|templates\|…/preview\|print-versions\|pdf` |
| **sponsor_confirm** | 2026-08-06 |

---

## solid_convention_ack

- FE binds **display-ready** clause/template/preview fields from BE (`title_vi`, `body_vi`, `layout_json.clause_ids`, preview sections).
- **No** FE invent of legal body defaults / copyrighted DOC dump.
- Salary / C&B **off** contract registry body (BR-CD-F5-01) — print merge only via preview ACL.
- DnD: reuse `@hello-pangea/dnd` + `sameNodeDragBind` (same-node handle) — avoid missing drag handle / storm.

---

## Closed scope

| Surface | Deliverable |
|---------|-------------|
| API client | Types + `list/create/update/activate/retire` clauses · templates · pack-resolve · preview · print-versions · pdf blob — `hrmApi.ts` |
| Helpers | `contractClauseOrder.ts` (+ vitest) · `contractLegalPrintConstants.ts` (labels only) |
| Settings | Tab **Điều khoản HĐ** — clause CRUD (code/title/body/group/packs/mandatory/version) + template DnD composer persist `layout_json.clause_ids` |
| Contracts | `ContractPrintSpinePanel` on create/edit dialog — pack/template + clause picker DnD + preview/save version/PDF; honesty banner; 0 template CTA Settings |
| Registry | UF-HRM-02 path untouched (list CRUD still primary); optional `pack_code`/`template_id` on create/update |
| Honesty | `CONTRACTS_PRINTABLE_READY=false` surfaced on Settings + print spine |

---

## Tests

```text
pnpm exec vitest run src/lib/contractClauseOrder.test.ts src/lib/jdDndSameNodeProps.test.ts
→ 2 files · 7 tests PASS
```

---

## Residual

| ID | Note | Owner |
|----|------|-------|
| R1 | BE `PO-HRM-CONTRACT-LEGAL-PRINT-BE-01` may still be landing — Settings/list show honest empty/error until endpoints 2xx | BE → QA |
| R2 | Preview/PDF mutate gated on contract id + BE; create flow asks save registry first | QA U65 |
| R3 | `contracts_printable_ready` remains **false** — do not promote printable UAT | QC |

---

## HDSD / browser inventory (QA)

| Step | Path | testid / cue |
|------|------|----------------|
| Settings clause | `/hr/settings` → tab Điều khoản HĐ | `settings-tab-contract-legal` · `ctr-clause-*` · `ctr-clause-save` |
| Template DnD | tab Mẫu theo loại | `ctr-tpl-palette` · `ctr-tpl-canvas` · `ctr-tpl-save` |
| Create HĐ | `/hr/contracts` → Thêm | existing HDSD form + `ctr-print-spine` |
| Preview | after save + reopen edit | `ctr-print-preview-btn` · `ctr-print-preview-body` |
| F5 | after save version | `ctr-print-versions` |
| Honesty | always | `ctr-print-honesty` · Settings honesty line |

---

## Completion contract

| Field | Value |
|-------|--------|
| completion_report | Closed FE Settings clause+template DnD + Contracts print spine + API client + vitest. Residual: BE live for mutate 2xx; printable honesty false. |
| next_owner | **qa** |
| ack_status | **READY_FOR_QA** |
| evidence_path | `docs/qa/evidence/po-hrm-contract-legal-print-fe-01.md` |

### next_dispatch_prompt (QA U65)

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-QA-01
from_role: pm
to_role: qa
lane: execution
entry_criteria: FE-01 READY_FOR_QA · BE-01 READY or partial (honest empty OK) · U65 zero-seed · contracts_printable_ready=false
read_first:
  - docs/qa/evidence/po-hrm-contract-legal-print-fe-01.md
  - docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md §D AC-CTR-PRINT-* · AC-CTR-CL-01
task: Browser U65 — Settings clause create→active → template DnD persist order → create HĐ (UF-HRM-02 regression) → reopen → preview → save print version if BE 2xx → F5. Fail if DnD storm / missing handle / mojibake / seed / claim printable UAT. Must_keep UF-HRM-02 CRUD.
forbidden: seed · API-only PASS · claim contracts_printable_ready=true
exit: PASS_TO_PM · evidence docs/qa/evidence/po-hrm-contract-legal-print-qa-01.md
```
