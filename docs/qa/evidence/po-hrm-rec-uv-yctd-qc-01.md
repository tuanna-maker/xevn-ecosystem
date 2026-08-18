# Evidence — `PO-HRM-REC-UV-YCTD-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-UV-YCTD-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | Governance L3 — **UV↔YCTD create + list slice ONLY** |
| **parent** | `PO-HRM-REC-UV-YCTD-QA-01` **R2** `PASS_TO_PM` · FE-02 `READY_FOR_QA` |
| **portal_url** | `http://127.0.0.1:5173` · `/hr/recruitment?tab=candidates&companyId=main` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **journey** | `J-HRM-REC-UV-01` |
| **Verdict** | **GO WITH CONDITIONS** — narrow UV↔YCTD create+list browser slice only |
| **ack_status** | `PASS_TO_PM` |
| **U65** | zero-seed claimed · browser FE path · QC observe-only (no `apps/**`) |
| **OS honesty** | `C-SLICE-≠-MODULE` — slice GWC ≠ recruitment module UAT |

### Honesty locks (mandatory — all false / denied)

| Flag | Value |
|------|-------|
| **recruitment_uat_ready** | **false** |
| **jd_dynamic_done** | **false** |
| **remaster_program_done** | **false** |
| **product_go** | **false** |
| **Phase 1 DONE** | **NOT claimed** |
| **Module UAT recruitment** | **NOT certified** — prior process NO-GO [`po-hrm-rec-ux-qc-process-01.md`](po-hrm-rec-ux-qc-process-01.md) **retained** |
| **Compare YCTD (QC-02)** | **RETAINED** peer GWC — **do not reopen** this seat |
| **Seed in evidence** | **DENIED** (U65) |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT seal for **Thêm UV gắn YCTD → list cells + F5** on group CEO `main` only:

1. **AC-REC-UV-01** — Lưu disabled without YCTD · API REQUIRED **400** corroborate
2. **AC-REC-UV-02** — after POST **201** + **F5**, FE list shows YCTD + position (**browser FE**, not API-only)
3. **AC-REC-UV-03** — position derived readonly from YCTD · no free-text SoT
4. **AC-REC-UV-04** — `?requisition_id=` context prefill
5. **UF-REC-UV-05 / UF-05-F5** — `R-UV-YCTD-LANE-A-LIST-GAP` **CLOSED** (FE-02 union)
6. **J-HRM-REC-UV-01** L2.5 — steps 8–10 list/F5 **PASS** · journey map stamped
7. Process gate on this path — pageErrors/Uncaught/DnD/mojibake **0**

**Conditions (explicit NON-CERTIFIED):**

- **NOT** recruitment module UAT-ready / product GO / Phase 1 DONE
- **NOT** spine-only stage/edit/delete/pipeline mutate (intentional residual)
- **NOT** empty-receivable UF-02 browser path (soft N/A under natural data)
- **NOT** overturn compare QC-02 seal or process NO-GO module
- Prior **process NO-GO** for module certification **remains binding**

---

## Entry audit (QA R2 + FE-02)

| Artifact | Present | QC |
|----------|---------|-----|
| [`po-hrm-rec-uv-yctd-qa-01-r2.md`](po-hrm-rec-uv-yctd-qa-01-r2.md) | ✅ | **ACCEPT** — UF matrix · AC-01..04 · J-* · honesty · residuals |
| [`_tmp-po-hrm-rec-uv-yctd-qa-01-r2.FINAL.json`](_tmp-po-hrm-rec-uv-yctd-qa-01-r2.FINAL.json) | ✅ | **ACCEPT** — `overall=PASS_TO_PM` · UF-05/F5 PASS · `listCellsOk=true` · AC all PASS · journey PASS · processClean |
| Screens `screens/po-hrm-rec-uv-yctd-qa-01-r2/` | ✅ 00–06 | Visual spot **02** form derived pos · **03** after-save YCTD+pos · **04** F5 retain |
| [`po-hrm-rec-uv-yctd-fe-02.md`](po-hrm-rec-uv-yctd-fe-02.md) | ✅ | **ACCEPT** — union spine-only · no dual-write · vitest cited |
| [`po-hrm-rec-uv-yctd-qa-01.md`](po-hrm-rec-uv-yctd-qa-01.md) R1 | ✅ | **ACCEPT closed** — R1 FAIL root cause documented · §R2 pointer |
| [`po-hrm-rec-uv-yctd-qc-02.md`](po-hrm-rec-uv-yctd-qc-02.md) | ✅ peer | **RETAIN** — compare slice GWC · out of reopen |
| `PROGRAM_JOURNEY_MAP.md` **J-HRM-REC-UV-01** | ✅ stamped PASS R2 | **ACCEPT** |

### Layer B — `verify:qc:evidence-pack`

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-uv-yctd-qa-01-r2.md
→ FAIL process 1/8 · command_table — PROCESS OBS only (not product demote)

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-uv-yctd-qc-01.md
→ (this file · target PASS 8/8)
```

| Check | Result |
|-------|--------|
| QA-01 R2 pack | **FAIL process 1/8** — missing `command_table` — **OBS** (browser MD + FINAL JSON + PNG sound) |
| QC pack (this file) | **PASS 8/8** (after seal) |
| L0 QA-time (R2 evidence) | HRM/XBOS/portal **200** · fe-be-health ALL PASS · BE watch |
| L0 QC spot 2026-08-06 | HRM **down** (fetch failed) · XBOS **200** · portal **:5173** **200** — **ENV OBS** · not product demote (historical R2 L0 PASS) |

---

## AC / UF matrix (UV create+list — QC audit)

| Case | Plan AC | QA R2 | QC |
|------|---------|-------|----|
| **UF-REC-UV-01** | form + YCTD SELECT | 🟢 | **PASS** |
| **UF-REC-UV-02** | empty receivable | 🟡 N/A | **PASS (deferred soft)** |
| **UF-REC-UV-03** | AC-03 derived position | 🟢 | **PASS** (PNG 02) |
| **UF-REC-UV-04** | AC-01 REQUIRED disable | 🟢 | **PASS** |
| **UF-REC-UV-05** | POST → list YCTD+pos | 🟢 | **PASS** (PNG 03 · JSON `listCellsOk=true`) |
| **UF-REC-UV-05-F5** | AC-02 F5 FE retain | 🟢 | **PASS** (PNG 04 · FE cells, API corroborate only) |
| **UF-REC-UV-06** | no free-text SoT | 🟢 | **PASS** |
| **UF-REC-UV-07** | AC-04 context prefill | 🟢 | **PASS** |
| **UF-REC-UV-08** | no job_postings write | 🟢 | **PASS** |
| **J-HRM-REC-UV-01** | L2.5 steps 8–10 | 🟢 | **PASS** |
| Negatives REQUIRED/STATUS/MISMATCH | API 400 codes | 🟢 | **PASS** (corroborate) |
| Process (this path) | Uncaught/DnD/mojibake | clean | **PASS (path only)** ≠ module console cert |

**Score:** in-scope UV create+list browser AC **ACCEPT** · soft residuals noted · module flags **not promoted**.

### Visual spot-check (QC)

| PNG | Observation | QC |
|-----|-------------|-----|
| `02-yctd-selected-position.png` | YCTD SELECT filled · Vị trí readonly `Tổng Giám đốc` · stamp name R2 | **PASS** AC-03 |
| `03-after-save.png` | Row `UVYCTD-R2-HM59YG` · YCTD `YCTD JD-ref QA YCTDJD-HKZN8G` · Vị trí `Tổng Giám đốc` · toast success | **PASS** UF-05 |
| `04-f5-list.png` | Same row + YCTD + position after reload | **PASS** AC-02 / steps 8–10 |

**Closed defect:** `R-UV-YCTD-LANE-A-LIST-GAP` — R1 empty list cells → R2 filled via FE-02 `unionSpineOnlyCandidatesIntoList`.

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this seal | QC |
|---------|-------------------|-----|
| **J-HRM-REC-UV-01** | Login → Tuyển dụng → Ứng viên → Thêm → SELECT YCTD → derived pos → Lưu → list YCTD+pos → F5 | **PASS** (slice) |
| **J-HRM-REC-CMP-01** | Peer compare QC-02 | **RETAINED** — not reopened |
| **J-HRM-05** full recruitment | Out of slice | **deferred / NOT certified** |
| JD bind / plan-console / IV / DnD | Prior narrow GWC only | **NOT re-certified here** |

Mandatory for this gate: UV↔YCTD create+list FE + F5 + honesty denials. **Not** invent recruitment UAT.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | AC-REC-UV-01..04 · UF-05/F5 · J-HRM-REC-UV-01 · Lane A list gap CLOSED — **ACCEPT** |
| **PRODUCT (soft OBS)** | Spine-only mutate disabled (intentional) · UF-02 empty N/A — **does not block** slice GWC |
| **PROCESS** | QA R2 pack missing `command_table` (1/8) — **OBS**; QC consolidates 8/8 |
| **ENV** | QC spot HRM `:28001` down · UV_HANDLE_CLOSING noise — **OBS** · QA R2 L0 PASS stands |
| **OUT-OF-SCOPE** | recruitment_uat_ready · module UAT · product GO · Phase1 DONE · reopen compare QC-02 · overturn process NO-GO |

---

## Residual

| Item | Sev | Owner | Blocks slice GWC? |
|------|-----|-------|-------------------|
| **R-UV-YCTD-LANE-A-LIST-GAP** | — | — | **CLOSED** this seat |
| **R-UV-YCTD-SPINE-POOL-MUTATE** | P3 soft / intentional | product backlog | **No** — spine-only stage/edit/delete/pipeline disabled (no dual-write) |
| **R-UV-YCTD-UF02-EMPTY** | soft N/A | qa when natural 0 receivable | **No** |
| QA R2 pack `command_table` | PROCESS OBS | qa hygiene | **No** |
| Compare QC-02 / process NO-GO | honesty | pm / qc | **No** for slice — **retained binding** |

**No product P0 residual** on UV create+list slice → **idle-ok** this narrow lane (compare already sealed).

### Not promoted (explicit)

- `recruitment_uat_ready` / module GO
- Full **J-HRM-05** beyond UV create+list
- Spine-only mutate / dual-write pool
- `jd_dynamic_done` / remaster / face_live
- Product GO / Phase 1 DONE
- Prior **process NO-GO** overturn
- Compare slice re-gate

---

## Gate commands (QC)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-uv-yctd-qa-01-r2.md
→ FAIL process 1/8 · command_table — PROCESS OBS

pnpm run qc:dev-stack
→ HRM down (ENV OBS) · XBOS 200 · portal :5173 200 · UV_HANDLE_CLOSING exit noise OBS

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-uv-yctd-qc-01.md
→ PASS 8/8 (QC consolidated pack · sealed 2026-08-06)
```

| Check | Result |
|-------|--------|
| `verify:qc:evidence-pack` QA-01 R2 | **FAIL process** 1/8 — OBS |
| `verify:qc:evidence-pack` QC pack (this file) | **PASS** 8/8 |
| L0 QA-time (R2) | **PASS** |
| L0 QC spot | **ENV OBS** (HRM down) |
| J-HRM-REC-UV-01 L2.5 | **PASS** |
| Module UAT / product / recruitment_uat_ready | ❌ **DENIED** |

---

## completion_report

- **Closed:** Narrow **GO WITH CONDITIONS** for **UV↔YCTD create + list + F5** — AC-REC-UV-01..04 audited via QA R2 MD + FINAL JSON + PNG 02/03/04; **R-UV-YCTD-LANE-A-LIST-GAP CLOSED**; J-HRM-REC-UV-01 steps 8–10 **PASS**; honesty denials stamped; compare QC-02 **retained** (not reopened); prior module process NO-GO **retained**.
- **Open / residual:** spine-only mutate intentional soft · UF-02 empty soft · QA pack command_table PROCESS OBS · ENV HRM down at QC spot.
- **NOT claimed:** recruitment UAT · module GO · product GO · Phase 1 DONE.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-UV-YCTD-QC-01 → INTAKE
role: pm
ack: PASS_TO_PM
verdict: GO WITH CONDITIONS — UV↔YCTD create+list slice ONLY
evidence: docs/qa/evidence/po-hrm-rec-uv-yctd-qc-01.md
facts:
  - J-HRM-REC-UV-01 🟢 · AC-REC-UV-01..04 PASS on browser FE (not API-only)
  - R-UV-YCTD-LANE-A-LIST-GAP CLOSED · UF-05 list cells + F5 FE retain
  - soft: spine-only mutate disabled (intentional) · UF-02 empty N/A
  - recruitment_uat_ready=false · process NO-GO po-hrm-rec-ux-qc-process-01 RETAINED
  - compare QC-02 GWC RETAINED — do not reopen
cấm: promote slice GWC to recruitment UAT-ready / module GO / Phase1 DONE / reopen compare
next_wave:
  1) idle-ok this UV create+list lane unless regression
  2) optional soft: UF-02 empty when natural 0 receivable (U65)
  3) program backlog: spine-only mutate when dual-write policy unlocks
  4) keep recruitment_uat_ready=false until module process NO-GO lifted with full J-HRM-05
```

## evidence_path

- `docs/qa/evidence/po-hrm-rec-uv-yctd-qc-01.md`
- Audit inputs: `docs/qa/evidence/po-hrm-rec-uv-yctd-qa-01-r2.md` · `_tmp-po-hrm-rec-uv-yctd-qa-01-r2.FINAL.json` · `po-hrm-rec-uv-yctd-fe-02.md` · `po-hrm-rec-uv-yctd-qa-01.md` · peer `po-hrm-rec-uv-yctd-qc-02.md` · `PROGRAM_JOURNEY_MAP.md` J-HRM-REC-UV-01

## ack_status

**PASS_TO_PM**
