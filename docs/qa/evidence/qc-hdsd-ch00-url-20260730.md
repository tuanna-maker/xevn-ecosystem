# QC Gate — HDSD HRM Ch.0 URL dual-entry (`HDSD-QC-CH00-URL-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | HDSD-QC-CH00-URL-01 |
| **program** | HDSD-P2-FULL-01 |
| **from_role** | ba-docs |
| **to_role** | qc |
| **auditor** | QC |
| **date** | 2026-07-30 |
| **ack_status** | PASS_TO_PM |
| **source_doc** | `docs/client-delivery/hdsd/hrm/HDSD_HRM_CH00_VAO_UNG_DUNG.md` |
| **artifact** | `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` |

## Verdict

**GO (doc slice)** — Ch.0 HRM URL dual-entry (W2a / W2b) khớp source MD và đã embed trong HTML bundle sau `hdsd:build ok=true`. Prompt-echo **PASS**.

**NOT:** Phase 2 DONE · PNG inline 114/114 · HTML/PDF customer sign-off · Phase 1 product DONE · PROD-READY · browser L2.5 UAT.

---

## Classification

| Class | Items |
|-------|-------|
| **DOC** | Ch.0 entry URL correction — no runtime/product defect |
| **INFO** | L2.5 J-CC-HRM-01 / J-HRM-EMP browser retest remains QA HDSD wave |
| **ENV** | N/A — doc-only slice |

---

## Audit commands

| Command | Purpose | Result |
|---------|---------|--------|
| Read `HDSD_HRM_CH00_VAO_UNG_DUNG.md` §0.1–0.3 | W2a/W2b URL matrix source | **PASS** |
| `pnpm run hdsd:build` | Rebuild HTML bundle | **exit 0** · `ok=true` · 382.7 KB · files=17 |
| `node _tmp_qc_ch00_spot.mjs` | Independent HTML spot (source tag, URLs, echo) | **exit 0** · verdict PASS |
| `rg "Sponsor\|work_item\|DISPATCH\|AS-IS\|TO-BE\|Draft for Sponsor\|mồ côi" docs/client-delivery/hdsd/hrm/HDSD_HRM_CH00_VAO_UNG_DUNG.md` | Prompt-echo MD | **exit 0** (no matches) |

**Portal context (HDSD program):** W2b embed `http://127.0.0.1:5173/command-center/hrm/*` · W2a standalone `http://127.0.0.1:8080/hr/*` · `:5175` chỉ ghi chú tùy chọn dev (base `/`, không thay W2a).

---

## URL dual-entry matrix (QC spot)

| Entry | Wave | Required base | HTML artifact | MD source | Result |
|-------|------|---------------|---------------|-----------|--------|
| **W2a standalone** | HRM độc lập | `http://127.0.0.1:8080/hr/*` | Present (`8080/hr`, `/hr/employees`) | §0.1, §0.3 | **PASS** |
| **W2b embed CC** | HRM nhúng | `http://127.0.0.1:5173/command-center/hrm/*` | Present (`5173/command-center/hrm`) | §0.1, §0.2 | **PASS** |
| **5175 dev alt** | Optional only | `http://127.0.0.1:5175/*` (base `/`, không `/hr/`) | Present với nhãn *tùy chọn* / *dev* | §0.1 row *(tùy chọn)*, §0.3 | **PASS** |
| **5175 as primary W2a** | Forbidden | — | `5175/hr` absent | Explicit «không thay W2a» | **PASS** |

---

## HTML Ch.0 spot (artifact)

| Check | Result |
|-------|--------|
| Source comment `HDSD_HRM_CH00` in bundle | **PASS** |
| Doc code `XEVN/HDSD-HRM-000` | **PASS** |
| Title «Vào ứng dụng» | **PASS** |
| §0.1 bảng W2a/W2b + entry nghiệm thu | **PASS** (embedded in mdRaw) |
| §0.2 menu sidebar 17 routes embed + standalone | **PASS** (MD count 17; HTML inherits) |
| §0.4 trạng thái/lỗi HRM | **PASS** |

---

## Prompt-echo scan

| Pattern | MD | HTML (CH00 slice) |
|---------|-----|-------------------|
| Sponsor / work_item / DISPATCH / pipeline meta | **PASS** (0 hit) | **PASS** (0 hit) |
| AS-IS / TO-BE / Draft for Sponsor | **PASS** (0 hit) | **PASS** (0 hit) |
| mồ côi / orphan | **PASS** (0 hit) | **PASS** (0 hit) |

---

## L2.5 / journey (doc slice scope)

| Journey | Scope | Result |
|---------|-------|--------|
| J-CC-HRM-01 (CC → HRM embed nav) | Browser QA HDSD wave | **Deferred** — doc cites W2b URL only |
| J-HRM-EMP (standalone `/hr/employees`) | Browser QA HDSD wave | **Deferred** — doc cites W2a URL only |
| Cross-nav L2.5 | QA HDSD UAT | **Not blocking** doc slice GO |

Doc slice GO does **not** promote browser L2.5 — PM retains QA dispatch per `qc-hdsd-full-w0-w4-20260730.md` program residuals.

---

## Residual

**No residual** on Ch.0 URL slice.

| ID | Item | Severity | Owner |
|----|------|----------|-------|
| — | — | — | — |

Program-level residuals unchanged: PNG inline, PDF customer sign-off, W3 mobile, mutate BLOCKED rows per prior HDSD QC gates.

---

## Traceability

| Requirement | Implementation | Test |
|-------------|----------------|------|
| W2a `:8080/hr/*` nghiệm thu | `HDSD_HRM_CH00_VAO_UNG_DUNG.md` §0.1, §0.3 | QC HTML spot + MD read |
| W2b `:5173/command-center/hrm/*` | §0.1, §0.2 | QC HTML spot |
| `:5175` optional dev only | §0.1 row *(tùy chọn)* | QC no `5175/hr` primary |
| HTML bundle includes Ch.0 | `hdsd:build` → `HDSD_XEVN_ECOSYSTEM_v1.html` | `pnpm run hdsd:build` exit 0 |
| no_prompt_echo | Client delivery rule | QC rg + spot script |

---

## completion_report

- **Closed:** Ch.0 MD URL dual-entry W2a/W2b; `:5175` optional labeling; HTML artifact embed after fresh `hdsd:build ok=true`; prompt-echo PASS MD + HTML.
- **Open (program):** Phase 2 PNG/PDF/QA browser waves; L2.5 J-* retest not in this slice.

## next_owner

PM — continue HDSD-P2-FULL-01 wave (next CH doc QC or QA browser UAT per backlog).

## next_dispatch_prompt

```
work_item_id: HDSD-QA-CH00-URL-SPOT-01
from_role: pm | to_role: qa
entry_criteria: HDSD-QC-CH00-URL-01 GO doc slice; dev stack L0 PASS
exit_criteria: Browser spot W2a http://127.0.0.1:8080/hr/employees + W2b http://127.0.0.1:5173/command-center/hrm/employees load without 409/500 banner; J-CC-HRM-01 + J-HRM-EMP one click each PASS or honest BLOCKED; evidence docs/qa/evidence/qa-hdsd-ch00-url-20260730.md; U65 no seed
read_first: docs/client-delivery/hdsd/hrm/HDSD_HRM_CH00_VAO_UNG_DUNG.md · qc-hdsd-ch00-url-20260730.md · docs/program/PROGRAM_JOURNEY_MAP.md J-CC-HRM-01 J-HRM-EMP
ack_status: PASS_TO_PM
```
