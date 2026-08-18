# Evidence — DOC-ENT-SRS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `DOC-ENT-SRS-01` |
| **role** | ba-process (governance) |
| **date** | 2026-08-03 |
| **deliverable** | `docs/brand-new-documents-20270801/SRS_NEW.md` v1.1 |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | sa |

---

## spec_read_ack

| Artifact | Sections / use | Version note |
|----------|----------------|--------------|
| Client SRS root (`02_SRS_XeVN_OS`) | HTML catalog / 6-ch Bateco model — structure adopted; **not** pasted 373 FR into NEW pack | lean upgrade |
| `docs/hrm/SRS.md` | §13 embed UC-HRM-20..27; §14 native; CO/DEC AC; ATT sheet | gaps closed into NEW |
| `docs/hrm/SRS_MOBILE.md` | MOB-01..15 inventory + §9 thin AC | MG → AC-HRM-MOB-* |
| `SRS_NEW.md` (prior) | UC-B/H/M English tech notes | upgraded → VI lean 6-ch |
| `hrm-business-completeness-audit-20260524.md` | Tiers A–E; EG-01..07; TR-01..10; embed; mobile; stub 27 | AC-HRM-EMBED-* / stub honesty |
| `PHASE1_UC_DELTA_AC_BR_20260524.md` | AC-U18-* / BR-SCOPE/MOCK/WF/DM/HMD… | in-scope IDs folded into §3.2–3.5 / §6 |
| `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` | 245 UC coverage map | **cited only here** — not dumped into client SRS |
| `ENTERPRISE_HRM_BUSINESS_ANALYSIS_REPORT.md` | XBOS/HRM/Mobile gap themes | informed P0 FR set |
| `HRM_BUSINESS_FLOWS_ANALYSIS_REPORT.md` | B1–B4 / H1–H5 / M1–M4 spines | §2.3 E2E table |
| `BRD_SRS_WRITING_STANDARDS.md` + OS `13` + `SRS_FR_UNIFORM_TEMPLATE.md` | 6-ch; Purpose/UC/sequence/Diễn biến/BL/Data; balance fails; Kết quả trả về | applied on deep FRs |
| `no_prompt_echo` | Client SRS: no Writing Standards / pipeline / audit / `docs/` paths | **true** |

---

## Gap IDs closed (in SRS_NEW scope)

| Gap ID | Closure in SRS_NEW |
|--------|-------------------|
| **EG-01** / TR-03 insurance list | FR-UC-HRM-25 + **AC-HRM-EMBED-03** (list or owned waiver) |
| **EG-02** scope list↔detail | FR-UC-HRM-21 Diễn biến #4–5 + AC-U18-21-02 + **AC-HRM-EMBED-01** |
| **EG-03 / EG-04 / BR-MOCK-02** | AC-U18-FE-01 · AC-HRM-EMBED-04 · BR-MOCK-* §6 |
| **EG-05** dashboard counters | AC-U18-20-01/02 |
| **EG-06 / EG-07** stub 27 + fidelity honesty | FR-UC-HRM-27 · AC-HRM-EMBED-05 · BR-DEC-* · AC-DEC-* (not DONE claim) |
| **TR-07** cross-nav absent from §13 | AC-HRM-EMBED-01 + FR-UC-HRM-21 |
| **MG-01..06** mobile AC | §3.4 AC-HRM-MOB-J03..J06 + INS/NTF; FR-UC-M03/M06 |
| **U18 delta P0** | AC-U18-20/21/FE/WF/DM/HMD cluster referenced in FR or §3.5 |
| **U63 post-mutation FE** | FR-UC-H01 bước 8 · BR-POST-UI-01 · H04/M03/DEC create |

---

## Deferred (explicit — not in deep FR body)

| Item | Reason |
|------|--------|
| Full 119 / 245 / 373 FR writeups | Lean strategy — inventory + 11 deep FR; detail remains in phân hệ SRS / Phase 1 catalog |
| UC-H06 report depth | P2 khung only |
| Dynamic recruitment 13-step full FR | P2 per original OUT |
| AC-FID-01..16 full copy into client SRS | Pointed via BR-FID-01; density matrix stays governance SoT |
| Logistics full UC | Out of NEW pack scope |
| BRD / TechSpec / DB / API rewrites | Other work items |

---

## UC count strategy

| Layer | Count / content |
|-------|-----------------|
| Preserved root codes | UC-B01..05, UC-H01..06, UC-M01..06 |
| Embed ADD | UC-HRM-20..27 |
| Deep FR in file | **11** (B03, B04, H01, H03, H04, HRM-21, HRM-25, HRM-27, M01, M03, M06) |
| AC packs | AC-HRM-EMBED-01..05 + AC-U18-* cited + AC-HRM-MOB-* + AC-DEC-* |
| Chapters | **6** (Intro → Overview → Functional → NFR → External UI → BR) |

**Verdict:** SRS_NEW is lean Vietnamese client SRS; P0 embed/mobile/delta AC gaps from audit are **requirements-closed** in this pack. **Does not** claim e2e_pass / Phase 1 DONE.

---

## completion_report

**Closed:** Upgraded `SRS_NEW.md` from English platform notes to enterprise lean VI SRS; preserved core UC-B/H/M; added embed 20–27 + measurable embed/mobile AC; balanced Diễn biến on deep FRs; post-mutation UI AC; stub honesty for UC-HRM-27.

**Residual:** SA must `ref_srs` TECH_SPEC_NEW to FR/UC IDs above; Q-INS-01 waiver ownership still product decision; full FR expansion deferred by design.

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: DOC-ENT-TS-01
role: sa
Mission: Upgrade docs/brand-new-documents-20270801/TECH_SPEC_NEW.md with ref_srs pointing to SRS_NEW.md v1.1 FR/UC IDs (FR-UC-B03, B04, H01, H03, H04, HRM-21, HRM-25, HRM-27, M01, M03, M06 + AC-HRM-EMBED-* / AC-HRM-MOB-*). Lean architecture + module map; no apps/**; no rewrite BRD/SRS/DB/API packs owned by other WIs.
read_first: SRS_NEW.md §2.3 spine + §3.2 deep FRs + §3.3–3.4 AC; evidence docs/qa/evidence/doc-ent-srs-01.md
exit: TECH_SPEC_NEW has ref_srs matrix for P0 FRs; evidence doc-ent-ts-01.md; PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/doc-ent-srs-01.md`  
**ack_status:** `PASS_TO_PM`
