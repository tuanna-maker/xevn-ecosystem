# QC Gate — HDSD Client-Final (`QC-HDSD-CLIENT-FINAL-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | `QC-HDSD-CLIENT-FINAL-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · **client-final** |
| **gate_type** | L3 QC — client HDSD HTML/PDF final after Ch.12 FIG rebuild |
| **auditor** | QC |
| **date** | 2026-08-01 |
| **policy** | U65 zero-seed · no_prompt_echo · cấm fake PNG · cấm chờ Claude (PEER reclaim 613m) |
| **prior** | `ba-hdsd-client-rebuild-01-20260801.md` · `qc-hdsd-p2-gate-01-r5-20260801.md` · `qc-hdsd-p2-gate-r3-20260730.md` |
| **ack_status** | **PASS_TO_PM** |

## Verdict

**GO WITH CONDITIONS** — HDSD **client-final deliverable slice APPROVED** (HTML + PDF with **8/8** mobile Ch.12 figures embedded). Closes **C-R2-02** / **C-P2-R3-FIG**. must_keep **C-R2-01 / C-R2-03 / C-R2-04** intact. no_prompt_echo clean.

**NOT:** Phase 2 **DONE** · **PROD-READY** · **UAT-PASS program** · promote **54🟡** → 🟢 · matrix header sync.

**Prior evidence:** No prior `qc-hdsd-client-final-01-20260801.md` on disk — this file is the first gate pack (no duplicate/corrupt overwrite).

**Claude reclaim:** `.cursor/team/inbox/peer-claude-watchdog-state.json` — STALE 613m · orch WIs RECLAIMED; gate executed on Cursor lane only (no wait).

---

## Entry criteria audit

| Criterion | Required | QC check | Result |
|-----------|----------|----------|--------|
| BA-HDSD-CLIENT-REBUILD-01-R3 PASS | evidence | `ba-hdsd-client-rebuild-01-20260801.md` · build exit 0 · 8/8 embed claim | ✅ |
| HTML + PDF artifacts | present | HTML **26 577 603** B · PDF **8 338 112** B | ✅ |
| C-R2-02 8× hrm-12 PNG | on disk + embedded | 8 PNG 130–429 KB · 8/8 DIAGRAMS `dataUrl` | ✅ |
| QA-DEVICE Ch.12 capture | upstream | `qa-device-hdsd-fig-ch12-01-20260801.md` PASS | ✅ |
| P2 refresh baseline | context | R5 GWC · 309🟢·54🟡·0⬜ delta | ✅ context only |

**Entry criteria: SATISFIED.**

---

## Independent QC spot-check (fail-closed)

Script: `node scripts/tmp-qc-hdsd-client-final-spot.mjs` → exit **0** · `pass=true`  
Runtime dump: `docs/qa/evidence/_tmp-qc-hdsd-client-final-spot.json`

| Check | Result | Notes |
|-------|--------|-------|
| `[[FIG:…]]` unresolved | **0** | 🟢 |
| `ảnh chưa có` in HTML | **0** | 🟢 (was 8 at R3) |
| no_prompt_echo (HTML) | **0 hits** | banned: work_item_id · PASS_TO_PM · DISPATCHED · C-R2-02 · BA-HDSD · QC-HDSD · ack_status · fake PNG · … |
| `placeholder Phase 2` (HTML + Ch.12 MD) | **0** | 🟢 **C-R2-01** must_keep |
| Ch.12 MD `![…](../assets/hrm/hrm-12-N.png)` | **8/8** | source intact |
| DIAGRAMS `hrm/hrm-12-{1..8}.png` dataUrl | **8/8** | len 173k–572k chars |
| PNG disk sizes | **8/8** ≥100 KB | match QA-DEVICE matrix (no placeholder) |
| `[[IMG:hrm/hrm-12-N.png]]` body tokens | **8/8** | renderer resolves via DIAGRAMS (103 IMG tokens total — expected) |
| Web sample DIAGRAMS (C-R2-04) | **4/4** | `hrm-0-1` · `hrm-5-1` · `eco-1` · `xbos-3-0` |
| Non-Ch.12 web HRM PNG on disk | **66** | inject `filesTouched=0` — web assets not rewritten |

### Ch.12 embed matrix (QC independent)

| Asset | Bytes (disk) | IMG token | DIAGRAMS dataUrl | Verdict |
|-------|-------------:|:---------:|:----------------:|---------|
| hrm-12-1.png | 360 892 | 1 | ✅ 481 214 | 🟢 |
| hrm-12-2.png | 214 736 | 1 | ✅ 286 338 | 🟢 |
| hrm-12-3.png | 254 310 | 1 | ✅ 339 102 | 🟢 |
| hrm-12-4.png | 132 347 | 1 | ✅ 176 486 | 🟢 |
| hrm-12-5.png | 247 969 | 1 | ✅ 330 650 | 🟢 |
| hrm-12-6.png | 129 845 | 1 | ✅ 173 150 | 🟢 |
| hrm-12-7.png | 429 194 | 1 | ✅ 572 282 | 🟢 |
| hrm-12-8.png | 214 869 | 1 | ✅ 286 514 | 🟢 |

---

## must_keep audit (C-R2-01 / 03 / 04)

| ID | Meaning | QC ruling |
|----|---------|-----------|
| **C-R2-01** | Phrase scrub — 0× `placeholder Phase 2` | 🟢 **PRESERVED** (HTML 0 · Ch.12 MD 0 · hdsd tree grep 0) |
| **C-R2-03** | Matrix W0–W4 body promote (prior R3/R5) | 🟢 **PRESERVED** — this WI did not mutate matrix; R5 SoT 309🟢·54🟡·0⬜ delta stands |
| **C-R2-04** | Web FIG wiring (non-mobile) | 🟢 **PRESERVED** — 66 web HRM PNG · 4/4 sample DIAGRAMS · inject `filesTouched=0` |
| **C-R2-02** | 8× mobile Ch.12 PNG | 🟢 **CLOSED** this gate (was OPEN at R3/R5) |

---

## L2.5 / journey (U19 — doc gate scope)

| Journey / UF | Role in this gate | Verdict |
|--------------|-------------------|---------|
| **J-MOB-03/04/05** | Captured on device during QA-DEVICE Ch.12 (screens §12.3–12.6) | 🟢 **preserved** (cite `qa-device-hdsd-fig-ch12-01-20260801.md`) |
| **J-REC-WF-01/03** · **UF-XBOS-10** · BF spines | Out of client-doc mutate scope | 🟢 carry from R5 — not re-run |
| Product browser L2.5 retest | Not required for static HTML/PDF gate | — deferred program |

**QC ruling:** L2.5 sufficient for **client-final doc slice** — Ch.12 screens sourced from U65 device capture with J-MOB evidence; no fake PNG.

**portal_url:** N/A product mutate — deliverable paths under `docs/client-delivery/hdsd/artifacts/` · capture api_base `http://14.225.217.232:3001` (upstream QA-DEVICE).

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT PASS (doc slice)** | HTML+PDF client-final · 8/8 Ch.12 embedded · 0 FIG unresolved · 0 `ảnh chưa có` · real device PNG sizes |
| **CONDITION CLOSED** | **C-R2-02** · **C-P2-R3-FIG** |
| **MUST_KEEP PRESERVED** | **C-R2-01** · **C-R2-03** · **C-R2-04** |
| **PROCESS note** | `hdsd-p2-inject-report.json` timestamp older than rebuild — inject this run `filesTouched=0`; spot-check is SoT for embed |
| **PROGRAM residual** | **54🟡** defer · **C-P2-MATRIX-SYNC** header stale · **C-PROGRAM** NOT Phase2 DONE/PROD |
| **ENV** | None blocking this doc gate |

---

## Residual

| ID | Item | Sev | Owner | Blocks client-final GWC? |
|----|------|-----|-------|--------------------------|
| **C-P2-YELLOW-PROMOTE** | Promote 54🟡 depth/defer to 🟢 where sponsor requires | P2 | PM → qa / qa-device | No |
| **C-P2-MATRIX-SYNC** | Matrix header 220🟢/133⬜ stale vs promote JSON 309🟢/54🟡/0⬜ | P3 process | qa | No |
| **C-P2-QA-PACK** | Prior bulk QA packs &lt;8/8 headers | P3 process | qa | No |
| **C-HOLD-DEPLOY** | Evidence not on prod `:8088` | Info | devops | No |
| **C-PROGRAM** | NOT Phase 2 DONE · NOT PROD-READY · NOT UAT-PASS program | P0 program | PM | No (wording only) |
| ~~**C-R2-02**~~ | 8× hrm-12 PNG | P1 | — | **✅ CLOSED** |

**No residual** product defect on HTML/PDF Ch.12 embed for this slice.

---

## Conditions (GWC — client-final doc)

| ID | Condition | Sev | Status | Owner |
|----|-----------|-----|--------|-------|
| ~~**C-R2-02** / **C-P2-R3-FIG**~~ | 8× mobile Ch.12 PNG embedded | P1 | **✅ CLOSED** | — |
| **C-P2-YELLOW-PROMOTE** | 54🟡 program depth | P2 | ⏳ OPEN | PM → qa |
| **C-P2-MATRIX-SYNC** | Header sync | P3 | ⏳ OPEN | qa |
| **C-PROGRAM** | Phase2/PROD/UAT-PASS claims forbidden until exit criteria | P0 | ⏳ OPEN | PM |

**Approved for sponsor handoff:**

- `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` (~25.3 MB)
- `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.pdf` (~8.0 MB)
- Ch.12 mobile figures `hrm-12-1..8` inline via DIAGRAMS

---

## Command table (QC audit)

| Command | Exit | Result |
|---------|------|--------|
| `node scripts/tmp-qc-hdsd-client-final-spot.mjs` | **0** | pass=true · 8/8 dataUrl · promptHits={} · FIG=0 · anh=0 |
| Artifact size probe HTML/PDF + 8 PNG | **0** | HTML 26577603 · PDF 8338112 · PNG_COUNT=8 |
| Grep prompt-echo / phrase on `docs/client-delivery/hdsd` | **0 hits** | no_prompt_echo + C-R2-01 |
| Read BA rebuild evidence | — | PASS_TO_PM · build ok=true images=118 |
| Read QA-DEVICE Ch.12 evidence | — | C-R2-02 CLOSED upstream |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-hdsd-client-final-01-20260801.md` | **0** | 8/8 (self after write) |

---

## Handoff

**completion_report:** Client-final L3 gate after BA rebuild R3 + device Ch.12 capture. Independent spot confirms **8/8** `hrm-12-*.png` DIAGRAMS dataUrl + IMG tokens, **0** unresolved FIG, **0** `ảnh chưa có`, **0** prompt-echo, **0** `placeholder Phase 2`. must_keep C-R2-01/03/04 preserved; **C-R2-02 CLOSED**. **GO WITH CONDITIONS** for client HDSD HTML/PDF deliverable. NOT Phase 2 DONE · NOT PROD. Program residuals (54🟡, matrix header) remain PM/QA — do not block this doc slice.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: PM-HDSD-CLIENT-FINAL-CLOSE-01
from_role: qc | to_role: pm
program: P-HDSD-ECOSYSTEM-03 · client-final
entry_criteria:
- QC-HDSD-CLIENT-FINAL-01 GWC — docs/qa/evidence/qc-hdsd-client-final-01-20260801.md
- C-R2-02 CLOSED · artifacts HTML+PDF ready for sponsor
exit_criteria:
- Mark client-final ☑ GWC on HDSD orchestration / TEAM_WORKING_NOW / bus
- Deliver or stage artifacts for sponsor review (HTML+PDF paths above)
- Residual auto-fix (parallel, not blocking client doc):
  · C-P2-MATRIX-SYNC → qa
  · C-P2-YELLOW-PROMOTE depth waves → qa / qa-device per R5 rollup
- cấm: claim Phase 2 DONE / PROD / UAT-PASS program · chờ Claude
ack_status: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qc-hdsd-client-final-01-20260801.md`

**ack_status:** **PASS_TO_PM**
