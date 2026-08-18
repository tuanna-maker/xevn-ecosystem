# Evidence — `PO-HRM-CONTRACT-LEGAL-PRINT-QC-01`

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-CONTRACT-LEGAL-PRINT-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | L3 gate — **contract print-spine** slice only (`C-SLICE-≠-MODULE`) |
| **priority** | P1 R-CTR-PRINT-CAN-ISSUE CLOSED · PDF stub OK this slice · module printable UAT denied |
| **portal_url** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **Verdict** | **GO WITH CONDITIONS** — print-spine slice only |
| **ack_status** | `PASS_TO_PM` |
| **parent** | `PO-HRM-CONTRACT-LEGAL-PRINT-QA-01-R3` `PASS_TO_PM` |
| **qa_ref** | [`po-hrm-contract-legal-print-qa-01-r3.md`](po-hrm-contract-legal-print-qa-01-r3.md) |
| **machine** | [`_tmp-po-hrm-contract-legal-print-qa-01-r3.FINAL.json`](_tmp-po-hrm-contract-legal-print-qa-01-r3.FINAL.json) · stamp **`CTR3-HQV9ZW`** |
| **fe_ref** | [`po-hrm-contract-legal-print-fe-03.md`](po-hrm-contract-legal-print-fe-03.md) (work_location + field_overrides) |
| **prior** | FE-02 / BE-01 / QA-01 R2 (company_id body CLOSED; can_issue FAIL superseded by R3) |
| **screens** | `docs/qa/evidence/screens/po-hrm-contract-legal-print-qa-01-r3/` (00–07 · **8/8** on disk) |
| **U65** | zero-seed · QC observe-only · no `apps/**` · no `pnpm seed:*` |
| **OS honesty** | `C-SLICE-≠-MODULE` — print-spine GWC ≠ contracts printable module UAT / production GO |

### Honesty locks (mandatory)

| Flag | Value | QC note |
|------|-------|---------|
| **contracts_printable_ready** | **false** | **DENIED** — cấm claim printable module GO / UAT |
| **Module printable UAT** | **DENIED** | Invent GO full contracts **FORBIDDEN** |
| **product_go / production GO** | **DENIED** | Out of scope |
| **Phase 1 DONE** | **NOT claimed** | Program gates open |
| **Seed** | **DENIED** (U65) | Machine `denied[]` includes `seed` · `api_only_pass` · `invent_printable_uat` |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT for **narrow print-spine**: registry `work_location` + spine `field_overrides` → preview **`can_issue=true`** → print-versions **201** → F5 versions>0 → PDF HTML stub **200** under U65.

| Gate item | Evidence | QC |
|-----------|----------|-----|
| Preview 2xx + **can_issue=true** | POST preview **201** `HRM-CTR-PREV-200` · `can_issue=true` · `missing_fields=[]` · body **no** `company_id` | 🟢 **ACCEPT** — closes **R-CTR-PRINT-CAN-ISSUE** |
| Lưu phiên bản in + F5 | POST print-versions **201** `HRM-CTR-VER-201` · versions **count=1** · PNG `07` v1 issued | 🟢 **ACCEPT** |
| PDF HTML stub (Q-CTR-02 this slice) | GET `…/pdf?company_id=main` → **200** `text/html` · toast «Đã tải PDF» | 🟢 **ACCEPT** stub path · binary engine remains CONDITION |
| must_keep UF-HRM-02 | POST contracts **201** `HRM-CON-201` · code `HD-QVQ6L` · F5 list | 🟢 **ACCEPT** |
| must_keep Settings CL/TPL | chrome clause + tpl · honesty stamp visible | 🟢 **ACCEPT** re-smoke |
| Preview body no `company_id` | `bodyHasCompanyId=false` · keys `pack_code,template_id,field_overrides` | 🟢 **ACCEPT** — **R-CTR-PREVIEW-COMPANY-ID-BODY** stays CLOSED |
| Process gate | dndStorm=0 · uncaught=0 · mojibake=false | 🟢 **ACCEPT** |
| `contracts_printable_ready` | false on Settings + spine PNG | 🟢 honesty retained |

**Cấm:** `contracts_printable_ready=true` · printable module UAT · invent GO full contracts · Phase 1 DONE · seed.

---

## Entry audit (handoff chain)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| BE-01 print API + schema | `po-hrm-contract-legal-print-be-01.md` | READY_FOR_QA | **ACCEPT** — Q-CTR-02/01 residuals documented |
| FE-02 body clean | `po-hrm-contract-legal-print-fe-02.md` | (prior) | **ACCEPT** — query-only `company_id` |
| FE-03 work_location | `po-hrm-contract-legal-print-fe-03.md` | READY_FOR_QA | **ACCEPT** — registry + spine overrides |
| QA-01 R2 | `po-hrm-contract-legal-print-qa-01-r2.md` | FAIL can_issue | Historical — superseded by R3 |
| QA-01 R3 | `po-hrm-contract-legal-print-qa-01-r3.md` | PASS_TO_PM | **ACCEPT** U65 browser + machine |

### Machine JSON spot (stamp `CTR3-HQV9ZW`)

| Signal | Value | QC |
|--------|-------|-----|
| `env.STAMP` / `WORK_LOC` | `CTR3-HQV9ZW` · `Hà Nội — trụ sở chính QA CTR3-HQV9ZW` | 🟢 |
| `l0` portal/hrm/xbos | 200 | 🟢 |
| `honesty.contracts_printable_ready` | **false** | 🟢 |
| `denied[]` | seed · api_only · invent_printable_uat · ready=true | 🟢 |
| `ac.AC-CTR-PRINT-SPINE.canIssue` | **true** | 🟢 |
| preview POST | **201** `HRM-CTR-PREV-200` · bodyClean | 🟢 |
| print-versions POST | **201** `HRM-CTR-VER-201` · id `312255a9-…` | 🟢 |
| `printVersionsList.count` / F5 | **1** | 🟢 |
| PDF GET | **200** `text/html; charset=utf-8` | 🟢 stub |
| `uf.UF-HRM-02` / SETTINGS / PROCESS | PASS · PASS · dndStorm=0 | 🟢 |
| `closed_residuals` | R-CTR-PREVIEW-COMPANY-ID-BODY · R-CTR-PRINT-CAN-ISSUE | 🟢 |
| `overall` | **PASS** | 🟢 slice |

### Screenshot visual spot

| File | QC observation |
|------|----------------|
| `06-preview.png` | Edit HĐ `HD-QVQ6L` · Nơi làm việc stamp · honesty **false** · spine field_overrides yellow box · Xem trước / Lưu phiên bản in · no mojibake |
| `07-versions-pdf.png` | **Phiên bản đã lưu: v1 - GENERAL · issued** · PDF button · toast **Đã tải PDF** · honesty still false |
| Screens dir | **8/8** PNG present on disk |

---

## Gate AC audit (print-spine)

| # | AC / Check | Spec / dispatch | QA R3 | QC |
|---|------------|-----------------|-------|-----|
| 1 | Preview + can_issue | AC-CTR-PRINT-SPINE / FE-03 | 🟢 201 + true | 🟢 **ACCEPT** |
| 2 | print-versions + F5 >0 | same | 🟢 201 · count=1 | 🟢 **ACCEPT** |
| 3 | PDF HTML stub | Q-CTR-02 this slice | 🟢 200 HTML | 🟢 **ACCEPT** stub · CONDITION binary |
| 4 | UF-HRM-02 + CL/TPL + body clean | must_keep | 🟢 | 🟢 **ACCEPT** |
| 5 | Process (DnD/mojibake/Uncaught) | process gate | 🟢 zeros | 🟢 **ACCEPT** |
| 6 | Honesty false | mandatory | 🟢 | 🟢 **RETAIN** |

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this seal | QC |
|---------|-------------------|-----|
| **J-HRM-03** | Host: HĐ list → edit dialog/modal · print spine exercised on edit path R3 | 🟢 **PASS** re-smoke (create `HD-QVQ6L` + pencil → spine → version/PDF) · prior H12 ✅ retained |
| **UF-HRM-02** | Registry create + F5 (must_keep) | 🟢 **PASS** R3 |
| Print-spine dedicated J-* | Not in journey map as separate id | **OBS** — seal on AC-CTR-PRINT-SPINE + host J-HRM-03; optional BA add later |
| Module contracts printable UAT | Out of scope | **DENIED** |

---

## Commands (gate / spot)

| Command | Result | Class |
|---------|--------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-contract-legal-print-qa-01-r3.md` | **FAIL** 3/8 (`command_table` · `journey_l25` · `residual_section` heading form) | **PROCESS OBS** — not product demote; QC consolidates this file |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-contract-legal-print-qc-01.md` | **PASS** exit **0** (8/8) | PRODUCT gate OK |
| QA R3 harness L0 (`qc:dev-stack` / `qc:fe-be-health` cited in QA MD) | ALL PASS at QA time | ENV OK at capture |
| QC spot re-run full stack | **Deferred** — machine L0 200 + screens sound; optional | ENV OBS if later down |

---

## Classification

| Item | Class | Disposition |
|------|-------|-------------|
| Print-spine can_issue → version → PDF HTML | PRODUCT | Seal **GWC** |
| `R-CTR-PRINT-CAN-ISSUE` | PRODUCT P1 was | **CLOSED** |
| `R-CTR-PREVIEW-COMPANY-ID-BODY` | PRODUCT P0 was | **CLOSED** (retain) |
| Q-CTR-02 HTML stub path | PRODUCT | **CLOSED this slice** · binary PDF engine = CONDITION |
| Q-CTR-01 group template publish | PRODUCT / backlog | **CONDITION** open — owner SA/PM |
| QA pack verify 3/8 format | **PROCESS OBS** | QC file consolidates 8/8 |
| Honesty / module UAT | GOVERNANCE | **DENIED** ready=true |

---

## Conditions (GWC — bounded)

1. **`Q-CTR-02` PDF binary engine (P2/NFR)** — GET returns HTML stub **200**, not production PDF binary. Owner: **sa** / **devops** (optional later wave). Does **not** block print-spine GWC.
2. **`Q-CTR-01` group-level template publish** — still open from BE-01. Owner: **sa** / **pm** (defer OK; not required for this spine seal).
3. **Honesty** — `contracts_printable_ready=false`; **NOT** Phase 1 DONE; **NOT** printable module UAT-ready; **NOT** invent GO full contracts.

---

## Residual

| ID | Sev | Owner | Status |
|----|-----|-------|--------|
| `R-CTR-PREVIEW-COMPANY-ID-BODY` | P0 was | — | **CLOSED** |
| `R-CTR-PRINT-CAN-ISSUE` | P1 was | — | **CLOSED** (R3 + this QC) |
| `Q-CTR-02` PDF HTML stub path | — | — | **CLOSED this slice** |
| `Q-CTR-02` PDF **binary** engine | P2/NFR | sa/devops | **OPEN** CONDITION |
| `Q-CTR-01` group template publish | P2 | sa/pm | **OPEN** CONDITION |
| Printable module UAT | — | — | **DENIED** (`contracts_printable_ready=false`) |

**No P0/P1 open → GWC allowed.**

---

## completion_report

QC L3 **GO WITH CONDITIONS** for **narrow contract print-spine** only. Audited QA-01 R3 MD + FINAL JSON stamp `CTR3-HQV9ZW` + PNG 06/07: preview **201** `can_issue=true`, print-versions **201**, F5 versions=1, PDF stub **200** HTML, UF-HRM-02 + Settings CL/TPL must_keep, body no `company_id`, process dnd/uncaught/mojibake clean. Closed **R-CTR-PRINT-CAN-ISSUE** + retain **R-CTR-PREVIEW-COMPANY-ID-BODY** CLOSED. Host **J-HRM-03** re-smoke PASS. **`contracts_printable_ready=false`** mandatory. Conditions: Q-CTR-02 binary PDF engine · Q-CTR-01 group publish. QA pack 3/8 = PROCESS OBS; this QC pack 8/8. No seed · no apps/** · no commit · **DENIED** printable module UAT / invent GO.

## next_owner

**pm** — bus INTAKE GWC; keep honesty false; optional later PDF binary engine / Q-CTR-01 — **do not** claim contracts printable UAT.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CONTRACT-LEGAL-PRINT-QC-01-INTAKE
from_role: qc
to_role: pm
lane: governance
parent: PO-HRM-CONTRACT-LEGAL-PRINT-QC-01 GO WITH CONDITIONS
evidence_path: docs/qa/evidence/po-hrm-contract-legal-print-qc-01.md
honesty: contracts_printable_ready=false — DENIED printable module GO / UAT

task:
1) Bus INTAKE: GWC print-spine only; stamp CTR3-HQV9ZW; R-CTR-PRINT-CAN-ISSUE CLOSED; R-CTR-PREVIEW-COMPANY-ID-BODY CLOSED retained
2) Honesty lock: contracts_printable_ready=false · cấm invent module printable UAT · NOT Phase 1 DONE
3) Conditions (defer OK): Q-CTR-02 PDF binary engine (sa/devops) · Q-CTR-01 group template publish (sa/pm)
4) Optional later: dispatch PDF binary engine wave only when sponsor prioritizes — not required to close this spine
5) Continue pm:idle:check — do not idle claiming contracts printable ready

ack_status: PASS_TO_PM
```
