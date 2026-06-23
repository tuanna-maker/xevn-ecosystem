# P1-HANDOFF-QC-01 — QC gate: Phase 1 UAT customer deliverable handoff

work_item_id: P1-HANDOFF-QC-01  
date: 2026-06-05  
from_role: qc  
to_role: pm  
ack_status: PASS_TO_PM  
evidence_path: `docs/qa/evidence/p1-handoff-qc-20260605.md`  
portal_url: `https://14-225-217-232.nip.io` (pilot HTTPS — sponsor UAT entry; PORTAL_DEV_URL not used for doc gate)  
entry_handoff: `docs/client/PHASE1_UAT_DELIVERABLE_HANDOFF_20260605.md` (ba-docs P1-HANDOFF-BA-01)

## Verdict

**GO WITH CONDITIONS** — **UAT customer document handoff to sponsor APPROVED** (BRD v1.1 + SRS v2.2 + HDSD v1.3 pilot bundle).

**Explicitly NOT:**
- **NOT** Phase 1 program DONE
- **NOT** Production / `portal.xe.vn` GO
- **NOT** a claim that all **373** FR are go-live (only **245** UC Phase 1 matrix)

## Scope of this gate

Document integrity and honest UAT framing for sponsor distribution — **not** a runtime L0–L2.5 product re-gate (covered by prior waves `P1-S5-QC-01`, `P1-W8-QC-G8-01`, etc.).

## Command table

| Command | Exit | Verdict | Notes |
|---------|------|---------|-------|
| `pnpm docs:srs:audit` | **0** | PASS | **373/373** FR uniform 7 sections (100%) |
| `node tmp-qc-handoff-spotcheck.mjs` | **0** | PASS | 13/13 checks — BRD §14 + SRS §1.5 + L-01..L-04 embedded; no `REQ-SRS` / `### Kiểm chứng` |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-handoff-qc-20260605.md` | **0** | PASS | Pack **8/8** (QC independent re-verify 2026-06-05) |

## Spot-check matrix (customer deliverables)

| Artifact | Check | Result |
|----------|-------|--------|
| `01_BRD_XeVN_OS.html` | Header «Giai đoạn 1 UAT» v1.1 | PASS |
| BRD embedded §14 | L-01..L-04 + `portal.xe.vn` **Chưa** | PASS |
| BRD narrative | No false «production sẵn sàng» / PROD-READY | PASS |
| `02_SRS_XeVN_OS.html` | Header «Giai đoạn 1 UAT» v2.2 | PASS |
| SRS §1.5 | L-01..L-04; 373 FR vs 245 UC stated | PASS |
| SRS banned meta | No `REQ-SRS`; no `### Kiểm chứng` heading | PASS |
| SRS FR count | **373** blocks in embedded `mdRaw` | PASS |
| `03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` v1.3 | §2.2 nip.io URL + accounts | PASS |
| HDSD §9 | G-01..G-04 maps L-01..L-04; no Phase 1 DONE claim | PASS |
| `SERVICE_READINESS_UAT_PRODUCTION.md` | Aligns: UAT slice; `portal.xe.vn` **BLOCKED** | PASS (no contradiction) |

### Limitation mapping (L-01..L-04)

| Code | BRD §14.3 | SRS §1.5 | HDSD §9 | QC |
|------|-----------|----------|---------|-----|
| L-01 | `portal.xe.vn` chưa mở | Production **Chưa mở** | G-01 | PASS |
| L-02 | Git parity pilot ↔ main | L-02 row | G-02 | PASS |
| L-03 | T5 hoãn | L-03 row | G-03 | PASS |
| L-04 | 373 FR vs 245 UC | L-04 row | G-04 | PASS |

## Classification (ENV vs PRODUCT)

- **PRODUCT (document):** none — deliverables meet honest UAT scope and limitation policy.
- **ENV / program (out of doc slice):** Production DNS/TLS, git parity on pilot, open program gates G4/G5/PROD — **must not** be implied closed by this handoff.

## L2.5 J-* journeys

N/A — document handoff gate. Runtime J-* coverage remains per `docs/program/PROGRAM_JOURNEY_MAP.md` and prior QA/QC evidence (nip.io G8 GWC slice).

## CRUD matrix

N/A — document handoff. SRS audit confirms **373/373** FR structural completeness (7 sections/FR).

## Conditions (sponsor communication)

| # | Condition | Owner | Blocking UAT doc send? |
|---|-----------|-------|------------------------|
| C-HANDOFFQC-01 | Cover email / PM brief must state **UAT pilot only** + L-01..L-04 (or attach HDSD §9) | PM | No — docs already contain limits |
| C-HANDOFFQC-02 | Do **not** label bundle «Phase 1 hoàn tất» or «Production ready» | PM / sponsor | No |
| C-HANDOFFQC-03 | HDSD is Markdown (IT appendix has repo paths) — optional PDF export for Ban TGĐ print bundle | PM / ba-docs | No (optional polish) |
| C-HANDOFFQC-04 | Runtime defects on pilot after send → separate dev/qa wave; docs handoff does not waive | PM | No |

## Residual (program — not blocking doc GO)

- **Production** `portal.xe.vn`: BLOCKED (`SERVICE_READINESS` SVC-07)
- **Phase 1 DONE**: open — G1/G2/G4/G5/G8/PROD gates not fully MET per S5/W8 QC chain
- **Excellence T5**: deferred per L-03 (documented)
- **Git parity** L-02: documented; merge/deploy wave separate

## QC recommendation to PM

Approve sending **`docs/client-delivery/`** bundle (01_BRD, 02_SRS HTML + 03 HDSD) to sponsor for **Phase 1 UAT review** on `https://14-225-217-232.nip.io`, with explicit cover note distinguishing **UAT handoff GO** from **Phase 1 PROD DONE**.

## completion_report

Audited ba-docs `P1-HANDOFF-BA-01` chain; spot-checked BRD/SRS HTML embedded content and HDSD v1.3; reproduced `docs:srs:audit` **373/373**; confirmed L-01..L-04 honest limits in all three customer-facing artifacts; no false PROD / Phase 1 DONE claims in BRD/SRS headers and limitation sections. **UAT document handoff: GO WITH CONDITIONS.** Program production closure remains open.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-HANDOFF-PM-01 — PM sponsor send: attach docs/client-delivery/01_BRD_XeVN_OS.html, 02_SRS_XeVN_OS.html, 03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md; cover note MUST cite L-01..L-04 (production blocked, git parity, T5 deferred, 373≠245 go-live); QC verdict GO WITH CONDITIONS docs/qa/evidence/p1-handoff-qc-20260605.md — UAT handoff YES, Phase 1 PROD DONE NO. Update PROJECT_STATUS_REPORT § deliverables + bus PM -> USER.
```
