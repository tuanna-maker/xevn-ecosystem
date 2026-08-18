# SA-SPEC-OS-ALIGN-01 — OS ↔ XeVN standards alignment

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-SPEC-OS-ALIGN-01` |
| **Date** | 2026-07-22 |
| **Role** | sa |
| **Deploy** | **CẤM** — không deploy |
| **ack_status** | **PASS_TO_PM** |

---

## spec_read_ack

| SoT | Path | Scope read |
|-----|------|------------|
| OS quality | `projects/_vibe-team-os/13-BRD-SRS-TECHSPEC-QUALITY.md` | Full relevant §§ — §3.4.1–3.4.11 + prompt-echo + ngôn ngữ |
| OS trace | `projects/_vibe-team-os/14-TRACEABILITY-SRS-TECHSPEC-CODE.md` | **Exists** — full file (§1–§6) |
| XeVN standards | `docs/standards/BRD_SRS_WRITING_STANDARDS.md` | Full + patch |
| XeVN rule | `.cursor/rules/client-delivery-docs.mdc` | Full |
| Register | `docs/program/SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` | Merge §1 / §5 / §6 / §7 |
| Shell runtime | `scripts/lib/doc-tscair-shell.mjs` | Footer = XeVN Group (confirm brand SoT) |
| FR template | `docs/srs-overrides/_TEMPLATE_FR.md` | No «Kết quả trả về» |
| Global skill | `~/.cursor/skills/client-delivery-brd-srs/SKILL.md` | Already cites OS §13 |

---

## Method

1. Confirm OS files on disk under `projects/_vibe-team-os/` (13 + 14).
2. Diff each OS MUST against XeVN rule / standards / template / audit / TechSpec practice.
3. Deepen register §1 matrix (rows A–T) + gap IDs G-RULE-01..12.
4. Doc-only patch: clear UNICOM drift + OS links + §3.1 MUST table in `BRD_SRS_WRITING_STANDARDS.md`.
5. Propose remaining patches (P2–P7) — no `apps/**`, no deploy.

---

## Findings summary

### CLOSED this wave

| ID | Finding | Action |
|----|---------|--------|
| **G-RULE-01** | Standards still said UNICOM footer / logo / doc-code | Patched → **XeVN Group**, `XEVN/BRD-*`, logo XeVN; align with `doc-tscair-shell.mjs` |
| **G-RULE-04** | No explicit link standards → OS 13/14 | Agent table + §10 links added |

### OPEN — OS MUST missing or PARTIAL in XeVN

| ID | OS § | Missing / partial | Priority |
|----|------|-------------------|----------|
| **G-RULE-02** | 3.4.2 / 3.4.5 | No audit script for Diễn biến ratios | P1 |
| **G-RULE-03** | 3.4.11 A–C | TechSpec step→API→table not mandatory in XeVN template | P0 |
| **G-RULE-05** | 3.4.6 | `_TEMPLATE_FR.md` lacks **Kết quả trả về** | P0 |
| **G-RULE-06** | 3.4.3 | No domain fail checklist in XeVN standards | P2 |
| **G-RULE-07** | 3.4.7 | No ADD-only remaster QC diff gate | P2 |
| **G-RULE-08** | 3.4.8B | Inventory freeze not standardized for all modules | P2 |
| **G-RULE-09** | 3.4.9 | UI SRS vs TechSpec separation not in XeVN standards | P1 |
| **G-RULE-10** | 3.4.10 | Dual-doc not forced at ecosystem standards layer | P1 |
| **G-RULE-11** | 3.4.11 F | No `docs/tech-spec/DB_DESIGN_*` / `API_DESIGN_*` | P0 |
| **G-RULE-12** | 3.4.11 E | Squad doctrine not cited in XeVN TechSpec playbook | P2 |

### Already ALIGNED (no gap)

- 6 chapters Bateco + 373 FR × 7 sections + audit gate titles  
- 100% Vietnamese client prose (principle)  
- Prompt-echo / meta ban (principle)  
- CODE-MEMORY + `spec_read_ack` **policy** (coverage separate — §3)  
- BRD no sprint roadmap  

---

## Patches applied (doc-only)

**File:** `docs/standards/BRD_SRS_WRITING_STANDARDS.md`

- Date → 2026-07-22 · work_item stamp  
- Agent table: OS 13 + 14 + gap register + XeVN Group shell  
- Cover: XeVN Group footer; `XEVN/BRD-*` (ban UNICOM)  
- New **§3.1 OS MUST** table (3.4.2 / 3.4.6 / 3.4.7 / 3.4.8 / 3.4.10 / 3.4.11 / 14)  
- Checklist §9: brand + Kết quả trả về + Diễn biến spot-check + Ctrl+F UNICOM  
- §10: OS paths; fix stale «rubric 12 mục» → 7 mục × 373  

**Register merge:** `SPEC_CODE_TRACEABILITY_GAP_REGISTER.md` §1 deepened (A–T) · §5 **G-SPEC-OS-01..03** · §6 SA merged YES · §7 refreshed.

---

## Proposed patches (not applied — next owners)

| # | Patch | Owner |
|---|-------|-------|
| P2 | ADD «Kết quả trả về» block to `_TEMPLATE_FR.md` | ba-docs |
| P3 | Cite OS 13/14 in `client-delivery-docs.mdc` | ba-docs |
| P4 | Audit ratios + missing Kết quả trả về | ba-docs + SA |
| P5 | `TECHSPEC_DEPTH_CHECKLIST.md` | SA |
| P6 | Bootstrap `docs/tech-spec/DB_DESIGN_*` + `API_DESIGN_*` (HRM/XBOS spine) | SA |
| P7 | PROJECT_PROFILE `os_quality` / `os_trace` keys | ba-docs |

---

## Options (architecture — governance only)

| Option | Scope | Risk | Recommend |
|--------|-------|------|-----------|
| **A** | Doc/template/checklist only (this wave + P2–P5) | Low | **SELECT** — close rule gaps before mass remaster |
| **B** | Immediate full 373 FR remaster for ratios + Kết quả trả về | High cost / wipe risk OS §3.4.7 | Reject until inventory freeze + ADD-only QC |
| **C** | Ignore OS §3.4.11 F physical files; rely only on team TECHSPEC.md | Drift / agent guess | Reject for spine modules |

---

## completion_report

**Closed:** SA research OS 13+14 vs XeVN; deepened register §1 (A–T); closed G-RULE-01/04 via standards patch; proposed P2–P7; evidence this file; **no deploy**, no `apps/**`.

**Residual:** G-RULE-02/03/05–12 OPEN; G-SPEC-OS-01..03 logged; other member §4/§5 rows remain.

---

## next_owner

**pm**

## next_dispatch_prompt

```text
work_item_id: BA-DOCS-OS-TEMPLATE-KET-QUA-01
role: ba-docs
entry_criteria: SA-SPEC-OS-ALIGN-01 PASS_TO_PM; read docs/qa/evidence/sa-spec-os-align-01-20260722.md + register §1.3 G-RULE-05
exit_criteria:
  - ADD «Kết quả trả về khi thành công» (5 cột OS §3.4.6) vào docs/srs-overrides/_TEMPLATE_FR.md
  - Optional one-liner OS 13/14 vào .cursor/rules/client-delivery-docs.mdc + PROJECT_PROFILE os_* paths (P3/P7)
  - evidence docs/qa/evidence/ba-docs-os-template-ket-qua-01-YYYYMMDD.md
  - ack_status PASS_TO_PM; cấm deploy; cấm apps/**
parallel_optional (same session if quota):
  work_item_id: SA-TECHSPEC-DEPTH-CHECKLIST-01
  role: sa
  — ADD docs/standards/TECHSPEC_DEPTH_CHECKLIST.md (OS §3.4.11 A–C+F) + path convention docs/tech-spec/DB_DESIGN_* · API_DESIGN_* (G-RULE-03/11); no apps/**; no deploy
```

## evidence_path

`docs/qa/evidence/sa-spec-os-align-01-20260722.md`

## ack_status

**PASS_TO_PM**
