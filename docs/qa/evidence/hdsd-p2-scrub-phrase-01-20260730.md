# HDSD P2 — Banned Phrase Scrub (`HDSD-P2-SCRUB-PHRASE-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | HDSD-P2-SCRUB-PHRASE-01 |
| **program** | HDSD-P2-FULL-01 |
| **from_role** | ba-docs |
| **to_role** | qa / qc |
| **date** | 2026-07-30 |
| **condition_closed** | **C-R2-01** |
| **ack_status** | READY_FOR_QA |

## Summary

Scrubbed all customer-visible `placeholder Phase 2` strings from HDSD source Markdown (CH10, CH11, CH12, INDEX). CH10/11 duplicate `[Hình …]` lines removed where inline PNG `![…](assets/…)` already exists; captions rewritten in Vietnamese. CH12 mobile figures replaced with neutral descriptive `[Hình …]` markers (FIG placeholders until qa-device captures). Rebuilt HTML+PDF; grep confirms zero banned phrase in client MD/HTML output paths.

## Files changed

| File | Edits |
|------|-------|
| `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH10_HRM_CO_QD_CV.md` | 6 sections: removed duplicate `[Hình 10.x — placeholder Phase 2]`; fixed `![…]` captions for hrm-10-1..10-6 |
| `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH11_HRM_SETTINGS_REPORTS.md` | 5 sections: same pattern for hrm-11-1..11-5 |
| `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH12_MOBILE_HRM.md` | 8 `[Hình 12.x]` → descriptive Vietnamese captions (no pipeline meta) |
| `docs/client-delivery/hdsd/HDSD_ECOSYSTEM_INDEX.md` | Quy ước trình bày item 2 → neutral template wording |

## Build

```bash
pnpm run hdsd:build
```

| Check | Result |
|-------|--------|
| Exit code | **0** |
| `ok` | **true** |
| `imgTokens` | **95** |
| HTML | `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` (23 376 KB) |
| PDF | `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.pdf` (8 236 KB) |
| Structural checks | cover · toc · partBreak · marked · mermaid · docCode · sources · inlineImages |

## Grep verification (C-R2-01)

### Source MD — `docs/client-delivery/hdsd/**/*.md`

```text
Pattern: placeholder Phase 2
Matches: 0
```

### Rebuilt HTML — customer narrative (mdRaw + rendered)

```powershell
Select-String -Path docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html `
  -Pattern "placeholder Phase 2" -SimpleMatch | Measure-Object
# Count: 0
```

**Note:** Builder script `scripts/hdsd/build-hdsd-html.mjs` retains internal FIG caption template `Ảnh minh họa — Phase 2` for dashed placeholders — QC R2 classified as builder-only, not MD source.

**Out of scope (unchanged):** `scripts/hdsd/hdsd-capture-manifest.json` caption field; CH12 line «Chức năng Phase 2 — không lỗi» (product note, not banned phrase).

## Condition status

| ID | Before | After |
|----|--------|-------|
| **C-R2-01** | FAIL — 21 refs in CH10/11/12/INDEX | **CLOSED** — 0 in client MD/HTML |

## Residual (not this WI)

| ID | Item | Owner |
|----|------|-------|
| C-R2-02 | Mobile CH12 PNG capture → inject assets | qa-device + dev-fe |
| C-R2-03 | Matrix W0–W4 promote to Verdict column | qa + ba-process |
| C-R2-04 | Remaining `[Hình]` without PNG | dev-fe + ba-docs |

---

## Handoff

**completion_report:** C-R2-01 closed. Four MD sources scrubbed; `pnpm run hdsd:build` exit 0 with PDF present; grep 0× `placeholder Phase 2` in `docs/client-delivery/hdsd/**/*.md` and rebuilt HTML.

**next_owner:** qa (spot-check captions) → qc (`QC-HDSD-P2-GATE-01-R3` prep)

**next_dispatch_prompt:**
```
work_item_id: QC-HDSD-P2-GATE-01-R3-PREP-01
program: HDSD-P2-FULL-01
from_role: ba-docs | to_role: qc
entry_criteria: docs/qa/evidence/hdsd-p2-scrub-phrase-01-20260730.md C-R2-01 CLOSED; hdsd:build ok=true
exit_criteria: Re-audit banned phrase scan on client MD/HTML; confirm C-R2-01 closed; include in R3 gate alongside C-R2-02..04 status
evidence_path: docs/qa/evidence/hdsd-p2-scrub-phrase-01-20260730.md
ack_status: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/hdsd-p2-scrub-phrase-01-20260730.md`

**ack_status:** READY_FOR_QA
