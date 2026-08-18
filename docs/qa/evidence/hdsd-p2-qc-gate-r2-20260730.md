# QC Gate R2 — HDSD Phase 2 HTML+PDF Rebuild (`QC-HDSD-P2-GATE-01-R2`)

| Field | Value |
|-------|-------|
| **work_item_id** | QC-HDSD-P2-GATE-01-R2 |
| **program** | HDSD-P2-FULL-01 (`P-HDSD-P2-FULL-01`) |
| **gate_type** | Phase 2 re-gate — PNG inline · HTML/PDF rebuild (post `HDSD-P2-HTML-REBUILD-01`) |
| **auditor** | QC |
| **date** | 2026-07-30 |
| **upstream** | `docs/qa/evidence/hdsd-p2-html-rebuild-01-20260730.md` (READY_FOR_QC) |
| **prior** | `docs/qa/evidence/qc-hdsd-p2-gate-20260730.md` (NO-GO 0/114 PNG · no PDF) |
| **ack_status** | PASS_TO_PM |

## Verdict

**GO WITH CONDITIONS** — HTML+PDF rebuild slice **closed**: **95/95** inline `[[IMG:…]]` tokens wired to **110** base64 PNG entries; PDF A4 deliverable present; sample chapters Ecosystem CH01 · XBOS CH03 · HRM CH05 verified in bundle; five portal routes HTTP 200 without Access Denied. **C-P2-01** promoted 🟢 for captured web scope; **C-P2-02** closed.

**NOT:** Phase 2 DONE · HDSD client-final · UAT-PASS program · PROD-READY · full 114/114 `[Hình]` closure.

---

## Evidence polled

| Artifact | Status | QC notes |
|----------|--------|----------|
| `hdsd-p2-html-rebuild-01-20260730.md` | ✅ | ba-docs READY_FOR_QC; build exit 0 |
| `HDSD_XEVN_ECOSYSTEM_v1.html` | ✅ | 23 376 KB · `ok=true` · `imgTokens=95` |
| `HDSD_XEVN_ECOSYSTEM_v1.pdf` | ✅ | 8 449 KB · Playwright A4 |
| `docs/client-delivery/hdsd/assets/**` | ✅ | **110** PNG on disk (recursive walk) |
| `qc-hdsd-p2-gate-20260730.md` | ✅ | Prior NO-GO baseline |
| `qc-hdsd-full-w0-w4-20260730.md` | ✅ | W0–W4 GWC parallel (does not supersede doc scrub) |

---

## Checklist audit

### 1. Inline PNG / C-P2-01 (prior P0: 0/114)

| Metric | Prior R1 | R2 QC |
|--------|----------|-------|
| PNG on disk (`assets/**`) | 0 | **110** |
| `[[IMG:…]]` in merged HTML | ~2 `<img>` | **95** |
| `[[FIG:…]]` placeholders | — | **51** |
| MD `![…](assets/*.png)` refs | 0 | **97** |
| `[Hình …]` markers in MD | 114 | **107** |
| DIAGRAMS keys vs IMG tokens | — | **110 keys · 0 missing** |

| Sample (spot) | IMG tokens | Result |
|---------------|------------|--------|
| Ecosystem CH01 | `ecosystem/eco-1.png`, `eco-2.png` | ✅ |
| XBOS CH03 (Tổ chức) | `xbos/xbos-3-0` … `xbos-3-6` (7) | ✅ |
| HRM CH05 (Nhân sự) | `hrm/hrm-5-1` … `hrm-5-4` (4) | ✅ |

**Runtime render:** Tail JS maps `[[IMG:domain/file.png]]` → `<figure class="hdsd-figure"><img src="data:image/png;base64,…">` via `DIAGRAMS` — all 95 IMG keys resolve.

| Result | **🟢 C-P2-01 CLOSED (captured web scope)** — 95/95 inject aligned with QA wave; **51 FIG** remain (mobile CH12 + figures chưa chụp). Full 114 `[Hình]` **not** claimed. |

### 2. HTML + PDF A4 (prior P0: PDF missing)

| Check | Result |
|-------|--------|
| `pnpm run hdsd:build` | exit **0** · `inlineImages:true` |
| Structural checks | cover · toc · partBreak · marked · mermaid · docCode · sources · inlineImages |
| Mã tài liệu | `XEVN/HDSD-ECO-001` |
| PDF engine | Playwright · 8 449 KB |
| Style ref | TSCAir primary missing → fallback `01_BRD_XeVN_OS.html` (INFO) |

| Result | **✅ C-P2-02 CLOSED** |

### 3. Browser route spot (5 routes · L0 up)

| Route | URL | HTTP | Access Denied |
|-------|-----|------|---------------|
| Login | `:5173/login` | 200 | No |
| Command Center | `:5173/command-center` | 200 | No |
| HRM employees embed | `:5173/command-center/hrm/employees` | 200 | No |
| Org settings | `:5173/settings/organization` | 200 | No |
| Payroll embed | `:5173/command-center/hrm/payroll` | 200 | No |

**L0:** `qc:dev-stack` — hrm-api `:28001` · xbos-api `:28002` · web-portal `:5173` all **200** (Node exit noise after assert; health OK).

| Result | **PASS** — load-only spot; authenticated UX not re-run in this doc gate. |

### 4. Banned phrase / client-doc quality (`team-no-prompt-echo`)

| Scan | Finding |
|------|---------|
| `work_item` · `Draft for Sponsor` · `Cấm hiểu sai` · `subagent` · `Composer` | **Not in mdRaw narrative** |
| **`placeholder Phase 2`** | **FAIL** — present in mdRaw (CH10 · CH11 · CH12 · INDEX) |
| JS builder template `Ảnh minh họa — Phase 2` | Builder-only for `[[FIG:…]]` — acceptable in script, not in MD source |

| Result | **P1 GWC** — scrub `placeholder Phase 2` from customer-facing MD before final handoff. |

### 5. Prior gate conditions C-P2-03..07 (cross-ref)

| ID | R1 | R2 status |
|----|-----|-----------|
| C-P2-03 W2a standalone | P0 | **Closed elsewhere** — `QC-HDSD-FULL-W0-W4-01` GWC · `:8080/hr/` |
| C-P2-04 Mobile CH12 | P0 | **OPEN** — 8 `[Hình … — placeholder Phase 2]` in CH12 |
| C-P2-05 W4 integration | P0 | **Closed elsewhere** — W4 evidence in W0–W4 GWC |
| C-P2-06 Matrix promote | P1 | **OPEN** — body rows still ⬜ (overlay summary only) |
| C-P2-07 Mutate 8🟡 | P2 | **OPEN** — U65 policy; not blocking doc rebuild |

### 6. Evidence pack verify

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/hdsd-p2-html-rebuild-01-20260730.md
```

| Result | **3/8 FAIL** — missing `portal_url`, `journey_l25`, `crud_or_matrix` |

**Classification:** Doc-build handoff — not QA CRUD minigate. **Not elevated to NO-GO(process)** for this bounded R2 scope; conditions documented below. Full Phase 2 final gate still requires product QA pack when mobile/matrix close.

---

## Classification

| Class | Items |
|-------|-------|
| **CLOSED (this R2)** | C-P2-01 web PNG inline 95/95 · C-P2-02 PDF · HTML structural gate · 5-route load spot |
| **GWC P1 doc** | C-R2-01 scrub `placeholder Phase 2` (21 refs across 4 MD files) · C-R2-02 51 FIG placeholders (49 mobile-weight) |
| **GWC P1 program** | C-R2-03 matrix body promote W0–W4 🟢 → Verdict column |
| **DEFER P0 program** | C-P2-04 mobile CH12 captures · remaining `[Hình]` without PNG (~10–14 vs 107 markers) |
| **INFO** | TSCAir style path local missing · builder FIG JS caption "Phase 2" · W0–W4 GWC separate artifact |

**ENV:** Stack healthy — not product NO-GO.

---

## GWC conditions (required before Phase 2 final GO)

| ID | Condition | Owner | Evidence |
|----|-----------|-------|----------|
| C-R2-01 | Replace `placeholder Phase 2` in CH10/11/12/INDEX with neutral client wording or `[[FIG:…]]` only | ba-docs | MD diff + rebuild |
| C-R2-02 | Mobile CH12 — capture 8 figures · inject PNG | qa-device + dev-fe | `hdsd-uat-mobile-*` + assets |
| C-R2-03 | Promote W0–W4 🟢 TC to `HDSD_SRS_TESTCASE_MATRIX.md` Verdict column | qa + ba-process | matrix diff |
| C-R2-04 | Close remaining `[Hình]` without `assets/*.png` (target ≥107 wired or explicit FIG list) | dev-fe + ba-docs | asset dir + MD |

---

## Residual

| ID | Item | Sev |
|----|------|-----|
| R-R2-FIG | 51 `[[FIG:…]]` placeholders in HTML (mobile + uncaptured) | P1 |
| R-R2-BANNED | `placeholder Phase 2` in client MD | P1 |
| R-R2-MATRIX | 360 TC body ⬜ | P1 |
| R-R2-MOB | CH12 zero PNG | P0 program |
| R-R2-HINH-GAP | 107 `[Hình]` vs 97 inline MD refs | P1 |

---

## Command table (QC audit)

| Command | Exit | Result |
|---------|------|--------|
| `node _tmp_qc_hdsd_r2_scan.mjs` | 0 | IMG 95 · FIG 51 · DIAGRAMS 110 · 0 missing keys |
| `pnpm run hdsd:build` | 0 | imgTokens=95 ok=true · PDF 8449 KB |
| `pnpm run verify:qc:evidence-pack` (ba-docs MD) | 1 | 3/8 — doc slice; deferred |
| `pnpm run qc:dev-stack` | crash after 200×3 | L0 healthy |
| PowerShell route spot ×5 | 0 | all HTTP 200 |

---

## QC recommendation

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS** | HTML+PDF rebuild + 95 inline PNG + C-P2-01/02 closed |
| **Partial credit** | Prior NO-GO 0/114 → 95 inject; PDF restored; chapter samples verified |
| **Re-gate trigger** | C-R2-01..04 + mobile W3 → `QC-HDSD-P2-GATE-01-R3` full Phase 2 |

**next_owner:** PM

---

## Handoff

**completion_report:** R2 audited ba-docs HTML rebuild. **GWC:** 95/95 inline PNG wired (110 bundle), PDF present, Ecosystem CH01 + XBOS CH03 + HRM CH05 samples in DIAGRAMS, 5 routes 200. C-P2-01/02 closed for web deliverable. Residual: 51 FIG placeholders, banned phrase `placeholder Phase 2` in MD, matrix promote, mobile CH12.

**next_owner:** PM

**next_dispatch_prompt:**
```
work_item_id: HDSD-P2-FINAL-SCRUB-01
program: HDSD-P2-FULL-01
from_role: qc | to_role: parallel

Parallel dispatch:
1) HDSD-P2-SCRUB-PHRASE-01 (ba-docs) — C-R2-01: remove "placeholder Phase 2" from CH10/11/12/INDEX; rebuild HTML/PDF
2) QA-HDSD-MOB-CH12-01 (qa-device) — C-R2-02: J-MOB-* captures → assets/hrm + inject
3) QA-HDSD-MATRIX-PROMOTE-01 (qa) — C-R2-03: map W0–W4 🟢 to matrix Verdict
4) HDSD-P2-FIG-REMAINING-01 (dev-fe) — C-R2-04: wire remaining [Hình] or document FIG list

After C-R2-01..04: QC-HDSD-P2-GATE-01-R3 (full Phase 2 final GO target)

entry_criteria: docs/qa/evidence/hdsd-p2-qc-gate-r2-20260730.md GWC
exit_criteria: banned phrase 0 · mobile FIG≤8 · matrix PASS>0 · [Hình] gap closed or documented
evidence_path: docs/qa/evidence/hdsd-p2-qc-gate-r2-20260730.md
ack_status target: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/hdsd-p2-qc-gate-r2-20260730.md`

**ack_status:** PASS_TO_PM
