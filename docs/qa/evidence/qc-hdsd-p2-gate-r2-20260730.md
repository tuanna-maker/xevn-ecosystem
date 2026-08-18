# QC Gate R2 — HDSD Phase 2 Client Delivery Slice (`QC-HDSD-P2-GATE-01-R2`)

| Field | Value |
|-------|-------|
| **work_item_id** | QC-HDSD-P2-GATE-01-R2 |
| **program** | HDSD-P2-FULL-01 |
| **gate_type** | Phase 2 client doc slice — PNG inline · HTML/PDF · CH01/03/05 spot |
| **auditor** | QC |
| **date** | 2026-07-30 |
| **upstream** | QA-HDSD-P2-SCREEN-01 · HDSD-P2-HTML-REBUILD-01 |
| **prior_gate** | `qc-hdsd-p2-gate-20260730.md` (NO-GO PNG 0/114) |
| **ack_status** | PASS_TO_PM |

## Verdict

**GO WITH CONDITIONS (client delivery doc slice)** — Web HDSD HTML+PDF deliverable **approved for sponsor review handoff** with bounded conditions. Closes prior NO-GO blockers **C-P2-01** (web capturable PNG inline) and **C-P2-02** (PDF present).

**NOT:** Phase 2 program DONE · Full HDSD UAT-PASS · PROD-READY · 114/114 literal Hình count (mobile + caption scrub deferred).

---

## Evidence polled

| Artifact | Path | QC read |
|----------|------|---------|
| QA screen spot | `docs/qa/evidence/qa-hdsd-p2-screen-01-20260730.md` | ✅ 5/5 routes · 110 PNG · 0 missing |
| QA runtime JSON | `docs/qa/evidence/qa-hdsd-p2-screen-01-20260730-runtime.json` | ✅ CH01/03/05 bytes OK |
| HTML rebuild | `docs/qa/evidence/hdsd-p2-html-rebuild-01-20260730.md` | ✅ exit 0 · 95 IMG · 49–51 FIG |
| HTML artifact | `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` | ✅ 22.83 MB · DIAGRAMS=110 |
| PDF artifact | `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.pdf` | ✅ 8.25 MB |
| Prior NO-GO | `docs/qa/evidence/qc-hdsd-p2-gate-20260730.md` | ✅ baseline delta |

---

## Independent QC scan (fail-closed)

Script: QC independent Node scan (PNG/HTML/PDF/mdRaw counters — session 20260730)

| Metric | Prior NO-GO (R1) | R2 independent | Result |
|--------|------------------|----------------|--------|
| PNG on disk | 0 | **110** (all >1 KB) | 🟢 |
| Inline MD `![](../assets/…)` | 0 | **97** | 🟢 |
| `[Hình …]` markers | 114 | **107** | 🟢 (mobile/out-of-scope excluded) |
| HTML `[[IMG:…]]` tokens | ~2 logo | **95** | 🟢 |
| HTML `[[FIG:…]]` placeholders | 51+ | **51** | 🟡 documented skip |
| DIAGRAMS bundle keys | 0 | **110** | 🟢 |
| PDF exists | ❌ | **✅ 8.25 MB** | 🟢 |
| `ecosystem/eco-1.png` in bundle | ❌ | **✅** | 🟢 CH01 |
| `xbos/xbos-3-0.png` in bundle | ❌ | **✅** | 🟢 CH03 |
| `hrm/hrm-5-1.png` in bundle | ❌ | **✅** | 🟢 CH05 |
| Banned `work_item` / `TC-HDSD-` | — | **0** | 🟢 |
| Visible `ảnh chưa có` | — | **0** | 🟢 |
| `placeholder Phase 2` in HTML mdRaw | — | **20** | 🟡 P1 caption scrub |

---

## CH01 / CH03 / CH05 figure render audit

| Chapter | Sample keys | MD captions | PNG bytes (QA) | HTML DIAGRAMS | Verdict |
|---------|-------------|-------------|----------------|---------------|---------|
| **CH01** Ecosystem | `eco-1`, `eco-2` | VI proper (`Màn đăng nhập`, `Rail trái`) | 30 KB / 127 KB | base64 inline | 🟢 |
| **CH03** XBOS Org | `xbos-3-0` … `xbos-3-6` | VI proper (7 figures) | 137–149 KB each | base64 inline | 🟢 |
| **CH05** HRM NV | `hrm-5-1` … `hrm-5-4` | VI proper (4 figures) | ~140 KB each | base64 inline | 🟢 |

**Render model:** Tail JS maps `[[IMG:domain/file.png]]` → `<figure class="hdsd-figure"><img src="data:image/png;base64,…">`. Spot keys present in `DIAGRAMS` object — figures render on browser open + Mermaid batch (builder `ok=true`).

**PDF spot (structural):** A4 `@page` rules present; self-contained HTML → PDF 8.25 MB confirms embedded images (not 387 KB draft). Full page-by-page figure audit deferred to sponsor print review.

---

## C-P2-01 status (PNG inline)

| Criterion | Target (R1) | R2 actual | Status |
|-----------|-------------|-----------|--------|
| Web capturable figures | inject all | **97 capturable · 0 missing** (QA manifest) | 🟢 **CLOSED (web)** |
| PNG assets | ≥95 | **110** usable | 🟢 |
| HTML inline figures | >90 | **95** `[[IMG:…]]` + 110 DIAGRAMS | 🟢 |
| Mobile CH12 FIG | capture | **8 figures skipped** (Playwright web scope) | 🟡 documented |
| Transient `2.2` | capture | **skipped** (loading state) | 🟡 documented |
| CH11 text-only `[Hình …]` | inject | **5 lines** without PNG (FIG placeholder) | 🟡 condition |
| Literal 114/114 Hình | all | **95 inline + 51 FIG** | GWC path (mobile skip) |

**Promotion:** C-P2-01 🟢 for **web portal screenshot slice**; mobile FIG skip documented per exit criteria (49–51 slots).

---

## Browser spot (read-only · U65)

Portal: `http://127.0.0.1:5173` · Account: `ceo@xe.vn` / `Xevn@2026`

| Route ID | URL | L2 load | L2.5 cross-nav |
|----------|-----|---------|----------------|
| R-LOGIN | `/login` | 🟢 PASS | N/A (doc spot) |
| R-CC | `/command-center` | 🟢 PASS | N/A |
| R-HRM-EMP | `/command-center/hrm/employees` | 🟢 PASS | embed shell 🟢 (data 500 ENV) |
| R-SETTINGS-ORG | `?settings=company_member_units` | 🟢 PASS | N/A |
| R-HRM-PAYROLL | `/command-center/hrm/payroll` | 🟢 PASS | N/A |

**J-* (L2.5):** Full J-CC-HRM-01 / J-HRM-EMP cross-nav **deferred** to program QA wave (doc slice gate). Prior partial embed UAT (`hdsd-uat-ch05-09`) acknowledged — not re-opened this gate.

---

## Classification

| Class | Items |
|-------|-------|
| **CLOSED (this slice)** | C-P2-01 web PNG inline · C-P2-02 PDF · HTML rebuild 23 MB · CH01/03/05 figure spot 🟢 |
| **P1 doc polish (conditions)** | Visible `[Hình … — placeholder Phase 2]` text lines in CH10/11/12 where PNG exists or FIG dashed; ba-docs caption scrub before print-to-client |
| **P2 ENV (non-blocker)** | `hrm-api :28001` transient 500 mid-session on embed data fetch — static PNG assets unaffected; shell routes 🟢 |
| **P0 program (out of slice — still open)** | C-P2-03 W2a `:5175` · C-P2-04 mobile CH12 UAT · C-P2-05 W4 integration · C-P2-06 matrix promote · C-P2-07 8🟡 mutate |

**ENV vs PRODUCT:** HRM 500 during capture = **ENV** (stack listener drop) — **not** product NO-GO for doc deliverable per sponsor exit note.

---

## GO WITH CONDITIONS scope

**Approved for handoff:**

- `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` (self-contained, 110 PNG base64)
- `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.pdf` (A4)
- `docs/client-delivery/hdsd/assets/**` (110 PNG)
- Web chapters CH01–CH11 with 95 inline screenshots

**Conditions before sponsor «in ấn / gửi khách»:**

| ID | Condition | Owner |
|----|-----------|-------|
| C-HDSD-P2-CAP-01 | Remove customer-visible `placeholder Phase 2` / duplicate `[Hình …]` lines where `![caption]` + PNG exist (CH10/11) | ba-docs |
| C-HDSD-P2-FIG-01 | Document 51 dashed FIG slots in release note: 8 mobile CH12 + 5 CH11 + transient 2.2 + index placeholders | ba-docs |
| C-HDSD-P2-PROG-01 | Full program C-P2-03..07 remain open — **NOT Phase 2 DONE** | PM |

---

## Residual

| ID | Item | Sev | Owner |
|----|------|-----|-------|
| R-P2-FIG-MOB | 8 mobile + 43 other FIG placeholders in HTML | P2 | qa-device (future wave) |
| R-P2-CAPTION | 20× `placeholder Phase 2` in merged HTML mdRaw | P1 | ba-docs |
| R-P2-CH11-FIG | 5 CH11 figures text-only (no PNG yet) | P2 | dev-fe capture |
| R-P2-HRM-ENV | `:28001` flakiness during QA session | P2 ENV | devops |
| R-P2-PROG | W2a · mobile UAT · W4 · matrix 0/360 | P0 program | PM dispatch |

---

## Command table (QC audit)

| Command | Exit | Result |
|---------|------|--------|
| QC Node scan (PNG/HTML/PDF/mdRaw) | **0** | 110 PNG · 95 IMG · 51 FIG · PDF ✅ · CH01/03/05 keys ✅ |
| `pnpm run hdsd:build` (upstream) | **0** | `images=110 ok=true` · HTML 23.4 MB · PDF 8.4 MB |
| `pnpm run qc:dev-stack` (upstream QA) | **0** | hrm/xbos/portal HTTP 200 |
| `node ./scripts/qa/qa-hdsd-p2-screen-01.mjs` (upstream) | **0** | 5/5 routes 🟢 · runtime JSON PASS |
| `Test-Path` PDF artifact | **0** | `HDSD_XEVN_ECOSYSTEM_v1.pdf` exists |

---

## QC recommendation

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS** | HDSD-P2 **client delivery doc slice** (HTML+PDF+110 PNG web figures) |
| **Closed vs R1 NO-GO** | PNG 0→110 · PDF missing→present · HTML 387 KB→23 MB inline |
| **Re-gate full program** | After C-P2-03..07 + caption scrub C-HDSD-P2-CAP-01 |

**next_owner:** PM

---

## Handoff

**completion_report:** R2 gate audited upstream QA+rebuild evidence and ran independent Node scan. CH01/CH03/CH05 sample figures 🟢 with base64 inline. C-P2-01 web PNG 🟢 (97 capturable, 0 missing, 95 HTML inline). C-P2-02 PDF 🟢. **GO WITH CONDITIONS** for client doc slice; 51 FIG placeholders + caption scrub documented. Full Phase 2 program items C-P2-03..07 remain open. HRM `:28001` flakiness classified ENV non-blocker.

**next_dispatch_prompt:**
```
work_item_id: HDSD-P2-CAPTION-SCRUB-01
program: HDSD-P2-FULL-01
from_role: pm | to_role: ba-docs
entry_criteria: QC-HDSD-P2-GATE-01-R2 GWC C-HDSD-P2-CAP-01; HTML mdRaw still contains 20× "placeholder Phase 2"
exit_criteria: Remove duplicate [Hình … placeholder] lines where ![VI caption]+PNG exist in CH10/11; re-run pnpm run hdsd:build; rg client MD/HTML zero "placeholder Phase 2" in customer narrative; evidence docs/qa/evidence/hdsd-p2-caption-scrub-20260730.md
ack_status: READY_FOR_QC
Parallel (program): PM dispatch C-P2-03 W2a + C-P2-04 mobile per qc-hdsd-p2-gate-20260730.md residual
```

**evidence_path:** `docs/qa/evidence/qc-hdsd-p2-gate-r2-20260730.md`

**ack_status:** PASS_TO_PM
