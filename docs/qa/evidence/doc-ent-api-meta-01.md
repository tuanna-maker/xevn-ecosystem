# Evidence — DOC-ENT-API-META-01

| Field | Value |
|-------|--------|
| **work_item_id** | `DOC-ENT-API-META-01` |
| **role** | sa (governance hygiene) |
| **date** | 2026-08-03 |
| **closes** | `C-DOC-META-DRIFT-01` (P2) |
| **ack_status** | `PASS_TO_PM` |

---

## Mission

Patch `API_CONTRACT_NEW.md` meta/footnotes that still claimed SRS/TechSpec were EN stubs or open `D-SRS-DRIFT-01` / `D-TS-DRIFT-01`. Those drifts are **CLOSED** after `DOC-ENT-RESTORE-01` + QC GWC.

## Disk verify (before patch)

| File | On disk | Markers |
|------|---------|---------|
| `SRS_NEW.md` | **v1.1** VI | `FR-UC-H01`, `Ngôn ngữ: Tiếng Việt` |
| `TECH_SPEC_NEW.md` | **v1.1** VI | `ref_srs: SRS_NEW.md v1.1`, FR-UC-H01 row |
| QC | `doc-ent-qc-docs-01.md` | Verdict **GWC**; `D-SRS-DRIFT-01` / `D-TS-DRIFT-01` **CLOSED**; residual `C-DOC-META-DRIFT-01` → sa |

## Diff (meta only — no F.1 body)

| Location | Before | After |
|----------|--------|-------|
| Header `ref_techspec` | «disk TS hiện drift EN stub» | SoT restored; `D-TS-DRIFT-01` CLOSED + QC evidence |
| §0.4 title + note | «working SoT khi disk SRS drift» / open `D-SRS-DRIFT-01` | Bám SRS_NEW v1.1 on disk; SoT restored; drift CLOSED |
| §12 Nest drift row | TECH_SPEC «EN infra stub» | v1.1 VI restored; `D-TS-DRIFT-01` CLOSED |
| §13 version log | — | **1.1.1** DOC-ENT-API-META-01 |

## Explicit non-claims

- **NOT** Phase 1 DONE / e2e_pass / PROD-READY  
- **NOT** rewrite of endpoint F.1 paths/DTOs  
- Other GWC residuals (clutter, slang, Q-INS-01, JSONB, etc.) **unchanged**

## Verdict

**PASS** — `C-DOC-META-DRIFT-01` closed by footnote hygiene.

---

```text
completion_report: Closed C-DOC-META-DRIFT-01; API_CONTRACT meta points to restored SRS/TS v1.1
next_owner: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/doc-ent-api-meta-01.md
```
