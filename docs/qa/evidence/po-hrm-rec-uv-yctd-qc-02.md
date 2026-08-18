# Evidence — `PO-HRM-REC-UV-YCTD-QC-02`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-REC-UV-YCTD-QC-02` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | Governance L3 — **compare YCTD slice ONLY** |
| **parent** | `PO-HRM-REC-UV-YCTD-QA-02` PASS_WITH_CONDITIONS + `PO-HRM-REC-UV-YCTD-BE-WATCH-FIX-01` READY |
| **portal_url** | `http://127.0.0.1:5173` · `/hr/recruitment?tab=evaluations&companyId=main` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **journey** | `J-HRM-REC-CMP-01` |
| **Verdict** | **GO WITH CONDITIONS** — compare YCTD SoT browser slice only |
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
| **UV create list (QA-01 R2)** | **OUT OF SCOPE** this seal — NON-CERTIFIED |
| **UF-04 FE max-N browser** | **soft OBS** — BE MAX-N proven; FE >N not natural under U65 |

---

## Verdict summary

**GO WITH CONDITIONS** — ACCEPT seal for **So sánh UV theo YCTD** on group CEO `main` only:

1. **UF-REC-CMP-01** — YCTD picker label · no tin-đăng picker in dialog · `requisitions?receivable=true` after dialog open
2. **UF-REC-CMP-05** — select UV → matrix · «Chưa đánh giá» · `GET …/compare` **200** `HRM-REC-CMP-200`
3. **UF-REC-CMP-06** — single-YCTD UX + BE **400** `HRM-REC-CMP-YCTD-MIX`
4. **UF-02/03** — waived empty under natural data (U65) — soft ACCEPT
5. **J-HRM-REC-CMP-01** L2.5 — click path PASS · journey map row **stamped**
6. **R-HRM-API-WATCH-TS** — **CLOSED** (nest watch compiles; applications/compare under watch)

**Conditions (explicit NON-CERTIFIED):**

- **NOT** recruitment module UAT-ready
- **NOT** UV create / list FE-02→QA-01 R2
- **NOT** UF-04 FE disable/toast at N=4 fully browser-proven (soft OBS; BE MAX-N **400** OK; UI counter shows `n/4`)
- **NOT** product GO / Phase 1 DONE / jd_dynamic_done / remaster
- Prior **process NO-GO** for module certification **remains binding**

---

## Entry audit (QA pack + watch fix)

| Artifact | Present | QC |
|----------|---------|-----|
| [`po-hrm-rec-uv-yctd-qa-02.md`](po-hrm-rec-uv-yctd-qa-02.md) | ✅ | **ACCEPT** — UF matrix · Network SoT · J-* · honesty · residuals |
| [`_tmp-po-hrm-rec-uv-yctd-qa-02.FINAL.json`](_tmp-po-hrm-rec-uv-yctd-qa-02.FINAL.json) | ✅ | **ACCEPT** — `overall=PASS_WITH_CONDITIONS` · UF-01/05/06 PASS · UF-04 PARTIAL · honesty false · pageErrors=[] |
| Screens `screens/po-hrm-rec-uv-yctd-qa-02/` | ✅ 01/02/03/05 | Visual spot **01** YCTD picker · **03** UV + «Chưa đánh giá» + `1/4` |
| [`po-hrm-rec-uv-yctd-be-watch-fix-01.md`](po-hrm-rec-uv-yctd-be-watch-fix-01.md) | ✅ | **ACCEPT** product close for watch-TS · pack format 1/8 OBS (missing portal_url) |
| `PROGRAM_JOURNEY_MAP.md` **J-HRM-REC-CMP-01** | ✅ stamped PASS | **CLOSED** prior R-JOURNEY-MAP-CMP |

### Layer B — `verify:qc:evidence-pack`

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-uv-yctd-qa-02.md
→ PASS 8/8

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-uv-yctd-be-watch-fix-01.md
→ FAIL process 1/8 · portal_url — PROCESS OBS only (not product demote)

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-uv-yctd-qc-02.md
→ (this file · target PASS 8/8)
```

| Check | Result |
|-------|--------|
| QA-02 pack | **PASS 8/8** |
| Watch-fix pack | **FAIL process 1/8** — **OBS** |
| L0 `qc:dev-stack` (QC spot 2026-08-06) | HRM **200** · XBOS **200** · portal **:5173** **200** (UV_HANDLE_CLOSING exit noise OBS) |

---

## AC / UF matrix (compare slice — QC audit)

| Case | Plan AC | QA | QC |
|------|---------|----|----|
| **UF-REC-CMP-01** | AC-REC-CMP-01 YCTD SoT | 🟢 | **PASS** (PNG 01 · receivable Network) |
| **UF-REC-CMP-02** | empty YCTD | 🟢 waived natural | **PASS (deferred soft)** |
| **UF-REC-CMP-03** | empty UV | 🟢 waived natural | **PASS (deferred soft)** |
| **UF-REC-CMP-04** | AC-REC-CMP-04 max-N | 🟡 PARTIAL | **soft OBS** — BE **400** MAX-N; FE >N not natural; UI `n/4` visible |
| **UF-REC-CMP-05** | AC-REC-CMP-05 matrix / chưa ĐG | 🟢 | **PASS** (PNG 03 · compare 200) |
| **UF-REC-CMP-06** | BR-CMP-01 MIX | 🟢 | **PASS** (picker + BE MIX 400) |
| **J-HRM-REC-CMP-01** | L2.5 | 🟢 | **PASS** |
| Network SoT | no job_postings after dialog | 🟢 | **PASS** · tab preload OBS retained |
| Process (this path) | Uncaught/pageErrors | clean | **PASS (path only)** ≠ module console cert |

**Score:** in-scope compare browser AC **ACCEPT** · UF-04 soft OBS · module flags **not promoted**.

---

## L2.5 J-* audit (U19)

| Journey | Scope vs this seal | QC |
|---------|-------------------|-----|
| **J-HRM-REC-CMP-01** | Login → Tuyển dụng → Đánh giá → So sánh → YCTD picker → UV matrix · «Chưa đánh giá» | **PASS** (slice) |
| **J-HRM-05** full recruitment | Out of slice | **deferred / NOT certified** |
| **J-HRM-REC-UV-01** / UV create list | Out of slice (QA-01 R2) | **NON-CERTIFIED** |
| JD bind / plan-console / IV one-active / DnD | Prior narrow GWC only | **NOT re-certified here** |

Mandatory for this gate: compare YCTD SoT + watch-TS close + honesty denials. **Not** invent recruitment UAT.

---

## CONDITION close — R-HRM-API-WATCH-TS

| Evidence | QC |
|----------|-----|
| Root cause: `mapRequisitionDisplay` type narrowing dropped `company_id` / `workflow_instance_id` | **ACCEPT** |
| `tsc --noEmit` exit 0 · nest `--watch` Found 0 errors on `:28001` | **ACCEPT** |
| Live under watch: applications **200** CMP-200 · compare **200** · MAX-N **400** · MIX **400** | **ACCEPT** |
| Jest `po-hrm-rec-uv-yctd-be-01` 17/17 + related 15/15 | **ACCEPT** |
| Business delta | None — FIX compile only · must_keep UV/CMP gates |

**Verdict:** CONDITION **R-HRM-API-WATCH-TS** → **CLOSED**.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Compare YCTD SoT · UF-01/05/06 · J-HRM-REC-CMP-01 · watch compile restore — **ACCEPT** |
| **PRODUCT (soft OBS)** | UF-04 FE max-N browser unproven under U65 natural UV=1 — **does not block** slice GWC (BE MAX-N + UI `n/4`) |
| **PROCESS** | Watch-fix pack missing `portal_url` (1/8) — **OBS**; FINAL JSON still notes journey_map MISSING at run time — map now stamped → residual **CLOSED** |
| **ENV** | L0 PASS on `:5173`; UV_HANDLE_CLOSING exit noise — OBS · not product |
| **OUT-OF-SCOPE** | recruitment_uat_ready · UV QA-01 R2 · jd_dynamic_done · remaster · product GO · Phase1 DONE · overturn process NO-GO |

---

## Residual

| Item | Sev | Owner | Blocks slice GWC? |
|------|-----|-------|-------------------|
| **R-HRM-API-WATCH-TS** | — | — | **CLOSED** this seat |
| **R-JOURNEY-MAP-CMP** | — | — | **CLOSED** — row on `PROGRAM_JOURNEY_MAP.md` |
| **R-CMP-FE-MAX-N-BROWSER** / UF-04 | **P3 soft OBS** | qa after ≥5 UV via FE (U65) | **No** |
| **OBS-JOB-POSTINGS-TAB-PRELOAD** | OBS | — | **No** — not compare SoT |
| UV create list FE-02→QA-01 R2 | program | pm / qa | **Out of scope** |
| Module recruitment UAT / process NO-GO | honesty | pm / qc | **No** for slice — **still false / retained** |

**No product P0 residual** on compare YCTD slice → **idle-ok** for this narrow lane (continue UV list elsewhere).

### Not promoted (explicit)

- `recruitment_uat_ready` / module GO
- UV create / list QA-01 R2
- UF-04 FE max-N as full browser PASS
- `jd_dynamic_done` / remaster / face_live
- Full **J-HRM-05** beyond compare
- Product GO / Phase 1 DONE
- Prior **process NO-GO** overturn

---

## Gate commands (QC)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-uv-yctd-qa-02.md
→ PASS 8/8

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-uv-yctd-be-watch-fix-01.md
→ FAIL process 1/8 · portal_url — PROCESS OBS

pnpm run qc:dev-stack
→ HRM 200 · XBOS 200 · portal :5173 200

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-uv-yctd-qc-02.md
→ PASS 8/8 (QC consolidated pack · sealed 2026-08-06)
```

| Check | Result |
|-------|--------|
| `verify:qc:evidence-pack` QA-02 | **PASS** 8/8 |
| `verify:qc:evidence-pack` watch-fix | **FAIL process** 1/8 — OBS |
| `verify:qc:evidence-pack` QC pack (this file) | **PASS** 8/8 |
| L0 `qc:dev-stack` | **PASS** (:5173) |
| J-HRM-REC-CMP-01 L2.5 | **PASS** |
| Module UAT / UV list R2 / product | ❌ **DENIED** |

---

## completion_report

- **Closed:** Narrow **GO WITH CONDITIONS** for **compare YCTD SoT** — UF-01/05/06 + J-HRM-REC-CMP-01 audited via QA MD + FINAL JSON + PNG 01/03; **R-HRM-API-WATCH-TS CLOSED**; journey-map residual **CLOSED**; UF-04 retained as soft OBS; honesty denials stamped; prior module process NO-GO **retained**; UV QA-01 R2 **out of scope**.
- **Open / residual:** soft OBS FE max-N browser · job_postings tab preload OBS · UV list pipeline separate.
- **NOT claimed:** recruitment UAT · UV create list · product GO · Phase 1 DONE.

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: PO-HRM-REC-UV-YCTD-QC-02 → INTAKE
role: pm
ack: PASS_TO_PM
verdict: GO WITH CONDITIONS — compare YCTD slice ONLY
evidence: docs/qa/evidence/po-hrm-rec-uv-yctd-qc-02.md
facts:
  - J-HRM-REC-CMP-01 🟢 · UF-01/05/06 PASS · UF-04 soft OBS (BE MAX-N 400 · FE >N not natural)
  - R-HRM-API-WATCH-TS CLOSED · nest watch serves applications/compare CMP codes
  - journey map J-HRM-REC-CMP-01 stamped · recruitment_uat_ready=false
  - prior process NO-GO po-hrm-rec-ux-qc-process-01 RETAINED
  - UV FE-02→QA-01 R2 OUT OF SCOPE this seal
cấm: promote slice GWC to recruitment UAT-ready / module GO / Phase1 DONE / invent UV-list PASS
next_wave (do NOT re-open compare slice unless regression):
  1) continue UV create/list FE-02 → QA-01 R2 (separate work_item)
  2) optional soft: FE max-N browser when ≥5 UV via FE (U65)
  3) idle-ok this compare lane
```

## evidence_path

- `docs/qa/evidence/po-hrm-rec-uv-yctd-qc-02.md`
- Audit inputs: `docs/qa/evidence/po-hrm-rec-uv-yctd-qa-02.md` · `_tmp-po-hrm-rec-uv-yctd-qa-02.FINAL.json` · `po-hrm-rec-uv-yctd-be-watch-fix-01.md` · `PROGRAM_JOURNEY_MAP.md` J-HRM-REC-CMP-01

## ack_status

**PASS_TO_PM**
