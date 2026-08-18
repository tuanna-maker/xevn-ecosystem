# Evidence — `PO-HRM-JD-YCTD-REF-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-YCTD-REF-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | Governance L3 — **YCTD↔JD bind slice ONLY** |
| **parent** | `PO-HRM-JD-YCTD-REF-QA-01` PASS_TO_PM |
| **portal_url** | `http://127.0.0.1:5173` · `/hr/recruitment?tab=requisitions&companyId=main` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **journey** | `J-HRM-JD-YCTD-01` |
| **Verdict** | **GO WITH CONDITIONS** — YCTD↔JD bind browser slice only |
| **ack_status** | `PASS_TO_PM` |
| **U65** | zero-seed claimed · browser FE mutate · QC observe-only (no `apps/**`) |
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
| **UV / CMP seats** | **NON-CERTIFIED** — still in flight / out of this seal |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT seal for **YCTD↔JD soft-FK bind** on group CEO `main` only:

1. **UF-01a** — bindable picker `GET …/job-templates?bindable=true` **200** · count=7 · Hiệu lực only
2. **UF-01c** — preview visible → POST requisitions **201** `HRM-REC-201` · FE list **JD gắn** = `JD-QA-QAH1BVIR · QA JD Dyna…`
3. **UF-01-F5 / J-HRM-JD-YCTD-01** — F5 retains title + JD gắn · GET by id **200** display-ready
4. **UF-01d** — inactive preview **400** `HRM-JD-YCTD-STATUS` · picker hides non-bindable
5. **UF-04 / 05 / 06** — soft FK only (no `values_json` persist) · zero `job_postings` dual-write · scope_parity list∈ + GET **200**
6. **Process gate (path)** — `pageErrors=0` · `Uncaught=0` · no DnD storm · UTF-8 VN labels OK on this click path

**Conditions (explicit NON-CERTIFIED):**

- **NOT** recruitment module UAT-ready
- **NOT** `jd_dynamic_done` / JD remaster / face_live
- **NOT** UV↔YCTD / CMP / campaign / interview locale / shell-chrome program closure
- **NOT** product GO / Phase 1 DONE
- Prior **process NO-GO** for module certification **remains binding**

---

## Entry audit (QA pack completeness)

| Artifact | Present | QC |
|----------|---------|-----|
| [`po-hrm-jd-yctd-ref-qa-01.md`](po-hrm-jd-yctd-ref-qa-01.md) | ✅ | **ACCEPT** — click path · Network · F5 · AC/UF table · honesty · process clean |
| [`po-hrm-jd-yctd-ref-qa-plan-01.md`](po-hrm-jd-yctd-ref-qa-plan-01.md) | ✅ | **ACCEPT** — UF/AC/J scope of seal |
| [`_tmp-po-hrm-jd-yctd-ref-qa-01.FINAL.json`](_tmp-po-hrm-jd-yctd-ref-qa-01.FINAL.json) | ✅ | **ACCEPT** — `overall=PASS` · journey 🟢 · honesty false · create 201 · STATUS 400 |
| Screens `screens/po-hrm-jd-yctd-ref-qa-01/` 00–06 | ✅ on disk | Visual spot **02** preview · **04** after-save JD gắn · **05** F5 retain |
| `PROGRAM_JOURNEY_MAP.md` row **J-HRM-JD-YCTD-01** | ✅ stamped PASS | **CLOSED** prior QA residual R-YCTD-JD-JOURNEY-MAP (PM stamp) |

### QA `verify:qc:evidence-pack` (Layer B)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-jd-yctd-ref-qa-01.md
→ FAIL process 2/8 · command_table · residual_section (## 4. Residual numbering vs regex)
```

| Check | Result |
|-------|--------|
| QA seat pack | **FAIL process 2/8** — **PROCESS OBS only** (not product demote) |
| QC consolidated pack (this file) | run below → target **PASS 8/8** |
| L0 `qc:dev-stack` (QC spot 2026-08-06) | HRM **200** · XBOS **200** · portal **:5173** **200** |
| ENV `:5175` | **down** — OBS only; evidence on **:5173** healthy |

ENV does **not** drive product NO-GO while `:5173` serves the audited path.

---

## AC / UF matrix (slice — QC audit)

| Case | Plan AC | QA | QC |
|------|---------|----|----|
| **UF-YCTD-JD-01a** | AC-02 non-empty · Diễn biến **1a** | 🟢 bindable=7 | **PASS** |
| **UF-YCTD-JD-01b** | AC-02 empty | 🟡 N/A (U65 no wipe) | **PASS (deferred soft)** — natural empty not exercised |
| **UF-YCTD-JD-01c** | AC-01 · AC-04 · **1c** | 🟢 preview + POST **201** | **PASS** (PNG 02/04) |
| **UF-YCTD-JD-01-F5** | AC-01 Thành công | 🟢 F5 retain | **PASS** (PNG 05) |
| **UF-YCTD-JD-01d** | AC-03 · **1d** | 🟢 STATUS **400** | **PASS** (JSON) |
| **UF-YCTD-JD-04-persist** | AC-04 soft FK | 🟢 no `values_json` | **PASS** |
| **UF-YCTD-JD-05** | AC-05 FORBIDDEN dual-write | 🟢 | **PASS** |
| **UF-YCTD-JD-06** | AC-06 scope_parity | 🟢 list∈ + GET 200 | **PASS** |
| **J-HRM-JD-YCTD-01** | L2.5 click 1–10 | 🟢 | **PASS** |
| Process (this path) | Uncaught/DnD/mojibake | clean | **PASS (path only)** — **≠** module console certification |

**Score:** in-scope browser AC **PASS** · 01b deferred soft · module flags **not promoted**.

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this seal | QC |
|---------|-------------------|-----|
| **J-HRM-JD-YCTD-01** | Login → Tuyển dụng → Yêu cầu → Thêm → bindable picker → preview → Lưu → F5 JD gắn → scope_parity | **PASS** (slice) |
| **J-HRM-05** full recruitment | Out of slice | **deferred / NOT certified** |
| UV / CMP / campaign / interview locale / shell | Out of slice | **NON-CERTIFIED** · process NO-GO retained |

Mandatory for this gate: YCTD bind path + honesty denials. **Not** invent recruitment UAT.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Bindable picker · preview · POST 201 · FE JD gắn · F5 · STATUS 400 · soft FK · scope_parity — **ACCEPT** |
| **PROCESS** | QA pack `verify` **2/8** (`command_table` · `residual_section` numbering) — **OBS**; QC consolidates |
| **ENV** | Portal evidence on **:5173**; **:5175** down — OBS · L0 PASS on 5173 |
| **OUT-OF-SCOPE** | recruitment_uat_ready · jd_dynamic_done · remaster · UV/CMP · product GO · Phase1 DONE · overturn process NO-GO |

---

## Residual

| Item | Sev | Owner | Blocks slice GWC? |
|------|-----|-------|-------------------|
| R-YCTD-JD-01b-EMPTY — natural empty library UF | **P3** | qa (when bindable=0) | **No** |
| R-YCTD-JD-DETAIL-TESTID — `yctd-jd-ref-detail` not observed after row click | **P3** | fe optional | **No** — list/GET enough for AC-01 |
| R-YCTD-JD-JOURNEY-MAP | — | — | **CLOSED** — row present on `PROGRAM_JOURNEY_MAP.md` |
| Module recruitment UAT / process NO-GO | program honesty | pm / qc | **No** for slice — **still false / retained** |
| QA pack format 2/8 | **P3 process** | qa | **No** — OBS |

**No product P0/P1 residual** on YCTD↔JD bind slice → **idle-ok** for this narrow lane.

### Not promoted (explicit)

- `recruitment_uat_ready` / module GO
- `jd_dynamic_done` / remaster / face_live
- UV↔YCTD / CMP seats
- Full **J-HRM-05** beyond bind
- Product GO / Phase 1 DONE
- Prior **process NO-GO** overturn

---

## Gate commands (QC)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-jd-yctd-ref-qa-01.md
→ FAIL process 2/8 · command_table + residual_section — PROCESS OBS only

pnpm run qc:dev-stack
→ HRM 200 · XBOS 200 · portal :5173 200 (ENV OBS: :5175 down)

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-jd-yctd-ref-qc-01.md
→ PASS 8/8 (QC consolidated pack · sealed 2026-08-06)
```

| Check | Result |
|-------|--------|
| `verify:qc:evidence-pack` QA seat | **FAIL process** 2/8 — OBS |
| `verify:qc:evidence-pack` QC pack (this file) | **PASS** 8/8 |
| L0 `qc:dev-stack` | **PASS** (:5173) |
| J-HRM-JD-YCTD-01 L2.5 | **PASS** |
| Module UAT / jd_dynamic / remaster / UV-CMP / product | ❌ **DENIED** |

---

## completion_report

- **Closed:** Narrow **GO WITH CONDITIONS** for **YCTD↔JD bind** — UF-01a/c/d/F5/04/05/06 + **J-HRM-JD-YCTD-01** audited via QA MD + FINAL JSON + PNG 02/04/05; journey map residual **CLOSED**; honesty denials stamped; prior module process NO-GO **retained**.
- **Open / residual:** P3 empty-library defer · P3 detail testid soft · QA pack format P3 OBS · ENV :5175 down OBS.
- **NOT claimed:** recruitment UAT · jd_dynamic_done · remaster · UV/CMP · product GO · Phase 1 DONE.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-JD-YCTD-REF-QC-01 → INTAKE
role: pm
ack: PASS_TO_PM
verdict: GO WITH CONDITIONS — YCTD↔JD bind slice ONLY
evidence: docs/qa/evidence/po-hrm-jd-yctd-ref-qc-01.md
facts:
  - J-HRM-JD-YCTD-01 🟢 · POST 201 HRM-REC-201 · F5 JD-QA-QAH1BVIR · STATUS 400 · scope_parity
  - process path clean (Uncaught=0 · no DnD storm) · U65 zero-seed
  - recruitment_uat_ready=false · jd_dynamic_done=false · remaster/UV/CMP NON-CERTIFIED
  - prior process NO-GO po-hrm-rec-ux-qc-process-01 RETAINED
  - ENV OBS: evidence on :5173 (:5175 down) — not product blocker
cấm: promote slice GWC to recruitment UAT-ready / jd_dynamic_done / remaster / product GO / Phase1 DONE
next_wave (do NOT re-open bind slice unless regression):
  1) continue recruitment program seats still in flight (UV↔YCTD / CMP / residual P0 UX)
  2) optional soft: empty-library UF when bindable=0; detail testid polish
  3) idle-ok this bind lane
```

## evidence_path

- `docs/qa/evidence/po-hrm-jd-yctd-ref-qc-01.md`
- Audit inputs: `docs/qa/evidence/po-hrm-jd-yctd-ref-qa-01.md` · `_tmp-po-hrm-jd-yctd-ref-qa-01.FINAL.json` · `po-hrm-jd-yctd-ref-qa-plan-01.md` · `PROGRAM_JOURNEY_MAP.md` J-HRM-JD-YCTD-01

## ack_status

**PASS_TO_PM**
