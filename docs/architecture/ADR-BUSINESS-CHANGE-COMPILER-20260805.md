# ADR: Business Change Compiler — Excel/docs → Manifest → Spec-first

| Field | Value |
|-------|--------|
| **ADR-ID** | ADR-BUSINESS-CHANGE-COMPILER-20260805 |
| **work_item_id** | `PO-BIZ-CHANGE-COMPILER-SA-01` |
| **Status** | Accepted (Phase A — xevn-ecosystem pilot) |
| **Date** | 2026-08-05 |
| **Decision owner** | SA |
| **Sponsor lock** | U77 — `docs/program/TEAM_USER_REQUIREMENTS.md` §U77 |
| **Program** | `docs/program/BUSINESS_CHANGE_COMPILER_PROGRAM.md` *(PM/BA author if missing — residual R1)* |
| **Schema** | `docs/program/schemas/change-manifest.schema.json` (v0.1) |
| **Evidence** | `docs/qa/evidence/po-biz-change-compiler-sa-01.md` |
| **OS promote target** | `_vibe-team-os/34-BUSINESS-CHANGE-COMPILER.md` + templates (Phase B) |
| **STALL** | **#3 CLOSED** — files re-written 2026-08-05 (governance lane; no `apps/**`) |

---

## 1. Decision context

Sponsor U77 (2026-08-05): thiết kế **Business Change Compiler** — nguồn thay đổi nghiệp vụ (Excel / docs / chat extract) → **Manifest JSON** máy-đọc → vào đúng **Spec-first pipeline** (SRS → confirm → TechSpec → DB_DESIGN → API_DESIGN → slice/neo → Dev → QA → QC).

| Mục tiêu | Không mục tiêu (cấm wave này) |
|----------|-------------------------------|
| Pilot artifact + schema trong **xevn-ecosystem** | Sửa `apps/**` / claim remaster / product GO |
| Chuẩn hóa handoff PM→BA/SA/Dev/QA | Thay Spec-first bằng “agent nhớ chat” |
| Phase B **PROMOTE** doctrine sang `projects/_vibe-team-os` (SoT đa dự án) | Bắt buộc deploy Tencent Agent Memory stack |
| Ghép ý tưởng Compound Engineering + Team Memory **loadout** | Copy nguyên gói Superpowers đè OS hiện có |

**Failure impact nếu không có compiler:** mỗi wave sponsor Excel/chốt → PM/BA viết dispatch tay lệch `allowed_paths` / thiếu `uc_ids` / Dev code trước slice → regression vùng 🟢; OS không học được pattern → mỗi công ty Agent lặp lỗi.

---

## 2. Problem to solve

### 2.1 Current state (facts)

1. Spec-first đã khóa toàn OS: `02-SPEC-FIRST-GATE.md` · global `team-spec-before-code-gate.mdc` · chuỗi SRS→TechSpec→DB→API (`13` §3.4.11.F).
2. Dispatch packet đã có field rời: `work_item_id`, `change_mode`, `allowed_paths`, `forbidden_paths`, `spec_read_ack`, slice (`22`), neo tags — nhưng **không có một artifact máy-validate** gắn Excel/sponsor chốt → path/UC/BR/AC.
3. XeVN đã có spreadsheet chốt (vd. `SPONSOR_CHOT_*.xlsx`) và Open Q docs — intake vẫn ad-hoc chat + bus prose.
4. Team Memory (`05-MEMORY-LAYERS.md`) + agentmemory MCP tồn tại nhưng **không** là gate thay `spec_read_ack`.
5. `_vibe-team-os` `MANIFEST.json` đã có chapter **33**; slot **34** còn trống cho doctrine compiler.
6. Pilot BA đã phác `CHANGE_MANIFEST_EXCEL_COLUMNS.md` + `change-manifest.example.json` dạng **batch `changes[]`** — cần khóa ranh giới với **Wave Manifest** (dispatch SoT) trong ADR này.

### 2.2 Constraints

| # | Constraint |
|---|------------|
| C1 | Spec-first **không** bị thay / rút gọn — Manifest chỉ **feed** pipeline |
| C2 | Phase A: docs/schema only trong xevn — **cấm** `apps/**` |
| C3 | Phase B: promote full OS path `projects/_vibe-team-os` (không stub 2-file NFC) |
| C4 | Không bắt buộc runtime Tencent / daemon memory |
| C5 | `change_mode` Wave Manifest = `ADD` \| `UPGRADE` \| `FIX` (align OS `22`; `REPLACE`/`REMOVE` chỉ khi sponsor ghi rõ + `sponsor_override`) |
| C6 | U65/U76 nghiệm thu không liên quan wave compiler (không seed / không remaster claim) |

---

## 3. Options

### Option A — Compiler script (CLI) primary

- **Description:** Node/TS script đọc Excel/CSV/Markdown table → validate → emit `change-manifest.json` + optional bus stub. Schema JSON Schema là SoT; spreadsheet chỉ là I/O.
- **Benefits:** Deterministic; CI/preflight có thể `ajv` fail-closed; tái sử dụng đa repo sau promote.
- **Costs:** Dev-tooling effort; cần map cột Excel ổn định; BA phải giữ template.
- **Risks:** Over-engineer trước khi cột Excel ổn; script drift khỏi OS field names.

### Option B — Spreadsheet-only (no compiler)

- **Description:** Excel/Google Sheet là SoT; PM/BA copy tay sang dispatch / slice; không JSON schema gate.
- **Benefits:** Zero tooling; sponsor đã quen Excel.
- **Costs:** Không validate; lệch path/UC dễ; không promote máy được sang OS; QA/QC khó reject tự động.
- **Risks:** Lặp incident “dispatch 1 dòng” / thiếu `spec_read_ack` — trái U77 “Manifest JSON”.

### Option C — Hybrid (recommended)

- **Description:** **Human plane** = Excel/docs template (sponsor/BA điền). **Machine plane** = Manifest JSON (schema v0.1+) là SoT cho PM dispatch + gates. Compiler script (Phase A2) **optional-then-required**: v0.1 cho phép BA/SA emit Manifest bằng tay khớp schema; v0.2+ script compile từ sheet chuẩn.
- **Benefits:** Khớp U77 (Excel → Manifest → Spec-first); pilot nhanh không chặn tooling; vẫn có schema gate ngay Phase A; đường promote OS rõ.
- **Costs:** Hai artifact phải đồng bộ (sheet ↔ JSON) cho đến khi script ổn.
- **Risks:** Dual-write tạm thời — mitigate bằng `source_artifacts` + `compiled_at` + rule “Manifest thắng khi lệch”.

---

## 4. Trade-off matrix

Score 1–5 (cao = tốt hơn cho tiêu chí). Weight tổng 100.

| Criteria | Weight | A Script | B Sheet-only | C Hybrid |
|----------|-------:|---------:|-------------:|---------:|
| Business value (U77 intent) | 20 | 4 | 2 | **5** |
| Time to Phase A deliver | 15 | 2 | **5** | **4** |
| Spec-first integrity | 20 | **5** | 2 | **5** |
| Reliability / fail-closed | 15 | **5** | 1 | **4** |
| Maintainability / OS promote | 15 | **5** | 1 | **5** |
| Complexity (thấp = tốt → inverted score) | 10 | 2 | **5** | **3** |
| Security (no secret in manifest) | 5 | **4** | 3 | **4** |
| **Weighted total** | 100 | **3.95** | **2.55** | **4.50** |

---

## 5. Decision

**Selected: Option C — Hybrid.**

### 5.1 Why

1. U77 yêu cầu rõ **Excel/docs → Manifest JSON → Spec-first** — B thiếu Manifest máy; A chậm Phase A.
2. Schema v0.1 trên disk ngay → BA/PM có thể viết Manifest tay / export JSON từ sheet; compiler script là **ADD** sau (không block pilot).
3. Align OS: Manifest fields ⊇ dispatch packet (`06`/`09`) + slice (`22`) + `spec_read_ack` (`02`/`14`).
4. Promote Phase B = chapter **34** + templates — không phụ thuộc binary Tencent.

### 5.2 Rejected

| Option | Rationale |
|--------|-----------|
| A alone | Đúng đích dài hạn nhưng trì hoãn schema/pilot; tooling trước SoT field = rủi ro map sai |
| B alone | Vi phạm U77 Manifest; không fail-closed; không SoT đa dự án |

### 5.3 Assumptions

| ID | Assumption | Owner |
|----|------------|-------|
| A1 | Program file `BUSINESS_CHANGE_COMPILER_PROGRAM.md` sẽ được PM/BA author theo ADR này nếu chưa có trên disk | PM |
| A2 | Cột Excel chuẩn (template) do BA khóa sau ADR — không invent business rows trong SA wave | ba-process |
| A3 | Compiler CLI path mặc định sau promote: `_vibe-team-os/scripts/compile-change-manifest.mjs` (hoặc repo copy) | devops/SA Phase B |
| A4 | agentmemory / Compound = **loadout + post-task update**, không thay `sponsor_confirm` | PM |

---

## 6. Two machine planes (lock)

| Plane | Artifact | Schema gate | Purpose |
|-------|----------|-------------|---------|
| **P0 Batch feedstock** | Excel rows → optional `changes[]` JSON (pilot example) | Soft / BA template — **not** PM dispatch SoT alone | Inventory chốt / gap / impact flags |
| **P1 Wave Manifest** | `change-manifest.schema.json` instance | **Hard** (ajv) | One `work_item_id` handoff: paths, AC, roles, sponsor_confirm, neo |

**Invariant:** Dev/QA Task **must** attach a **P1 Wave Manifest** path. P0 batch alone = INVALID-HANDOFF for code lanes.

**Compile rule (Hybrid):**

```text
Sponsor Excel / docs
  → (optional) P0 batch JSON (changes[])
  → BA/PM select 1..N rows into one wave
  → emit P1 Wave Manifest (schema v0.1)  ← SoT khi lệch sheet
  → Spec-first pipeline
```

Khi lệch: **P1 Manifest thắng**; BA re-compile từ sheet + ghi `compiled_at`.

---

## 7. Manifest JSON — Wave schema (v0.1)

SoT machine: `docs/program/schemas/change-manifest.schema.json`.

### 7.1 Required / core fields

| Field | Type | Notes |
|-------|------|-------|
| `$schema` | string | optional pointer to schema file |
| `manifest_version` | semver string | `"0.1.0"` |
| `work_item_id` | string | e.g. `PO-…` / `W-…` |
| `uc_ids` | string[] | `UC-…` / `FR-…` codes |
| `br_ids` | string[] | `BR-…` (may be empty only if `change_mode=FIX` + hotfix waiver) |
| `ac` | object[] | Acceptance criteria — see §7.2 |
| `slice_id` | string | Story/slice id → `docs/program/slices/<slice_id>.md` |
| `allowed_paths` | string[] | glob/path allow-list; DoD: diff ⊆ |
| `forbidden_paths` | string[] | e.g. `apps/**` for docs-only waves |
| `role_owners` | object | map role → owner work_item or person label |
| `sponsor_confirm` | object | `{ status, wave_id?, date, evidence_ref? }` |
| `change_mode` | enum | `ADD` \| `UPGRADE` \| `FIX` |
| `neo_tags` | string[] | subset of OS `22` taxonomy |

### 7.2 `ac[]` item

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | `AC-…` |
| `statement` | yes | tiếng Việt, đo được |
| `verify` | yes | `browser` \| `api` \| `jest` \| `doc_review` \| `gate_script` |
| `uf_or_j` | no | UF-* / J-* when UI |
| `pass_when` | yes | observable outcome |

### 7.3 Recommended extensions (optional in v0.1)

| Field | Purpose |
|-------|---------|
| `title` / `summary` | Human one-liner |
| `source_artifacts` | Excel/doc paths + sheet names |
| `read_first` | ordered paths for Task |
| `must_keep` | preserve list |
| `spec_targets` | `{ srs, tech_spec, db_design, api_design }` paths |
| `pipeline_stage` | `intake` \| `srs` \| `techspec` \| `db_api` \| `ready_for_dev` \| `qa` \| `qc` \| `closed` |
| `compound_hooks` | `{ pre_task_memory_loadout, post_task_memory_update, promote_os_on_lesson }` |
| `promote_os` | `{ required, chapter: "34-BUSINESS-CHANGE-COMPILER.md" }` |
| `sponsor_override` | REPLACE/REMOVE — `{ change_mode_extended, rationale, expiry? }` |
| `batch_change_ids` | string[] — optional link to P0 `CM-*` rows that fed this wave |
| `compiled_at` / `compiler` | provenance |

### 7.4 `neo_tags` allowed values (align `22`)

`CODE-MEMORY` · `UI-MEMORY` · `STYLE-MEMORY` · `ROUTE-MEMORY` · `CONTRACT-MEMORY` · `DB-MEMORY` · `TEST-MEMORY` · `ENV-REGISTRY` · `CONFIG-MEMORY` · `DEPLOY-MEMORY` · `SCRIPT-MEMORY` · `DOC-DELTA`

### 7.5 `role_owners` keys (suggested)

`pm` · `sa` · `ba_process` · `ba_data` · `ba_docs` · `dev_fe` · `dev_be` · `dev_mobile` · `qa` · `qc` · `devops` · `technical_manager`

---

## 8. Integration map — Spec-first + Compound + Team Memory

**Invariant:** Manifest **never** grants code permission without `sponsor_confirm.status ∈ {CONFIRMED, WAIVED_HOTFIX_P0}` **and** pipeline stage ≥ required for that role.

```text
┌─────────────────────────────────────────────────────────────────┐
│  Sponsor Excel / docs / Open Q / chat extract                     │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Business Change Compiler (human emit JSON v0.1 / script v0.2+) │
│  P0 batch (optional) → P1 Wave Manifest (ajv vs schema)         │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Team Memory LOADOUT (adapt — not replace Spec-first)             │
│  • recall: work_item / uc_ids / slice / FLOW-* / incidents        │
│  • read_first from Manifest                                       │
│  • agentmemory MCP optional                                       │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Spec-first pipeline (OS 02 / 13 / 14) — UNCHANGED order          │
│  SRS → sponsor confirm → TechSpec(ref_srs) → DB_DESIGN →          │
│  API_DESIGN → unit test plan → Dev (slice+neo) → QA → QC          │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  Compound Engineering loop (adapt)                                │
│  After PASS: update bus + evidence + slice + MEMORY layers (05) │
│  If operating-model lesson → promote OS 34 / rules / templates    │
│  Superpowers-like skills = checklists under OS skills/ — additive │
└─────────────────────────────────────────────────────────────────┘
```

| Idea source | Adapt as | Do **not** |
|-------------|----------|------------|
| Compound Engineering | Post-wave promote lessons → OS/templates; Manifest `promote_os` | Skip SRS because “compound memory has it” |
| Team Memory / agentmemory | Pre-task loadout from Manifest ids; post-task `05` update | Daemon required for GO |
| Superpowers | Optional skill checklists mapped to `ac[].verify` | Replace role cards / Spec-first gate |
| Tencent Agent Memory | Optional reference pattern only | Mandatory deploy / product dependency |

---

## 9. Failure modes and mitigation

| Option / stage | Failure mode | Detection | Mitigation |
|----------------|--------------|-----------|------------|
| Hybrid dual-write | Sheet ≠ Manifest | Review diff `source_artifacts` vs JSON | P1 Manifest wins; BA re-compile |
| P0 mistaken for P1 | Dev dispatched on batch-only JSON | Missing `work_item_id` / `ac` / schema fail | QC NO-GO; require Wave Manifest |
| Schema too loose | Empty `ac` / missing paths | ajv + QA reject | `minItems` on ac/uc_ids; CI later |
| Schema too strict | Blocks hotfix | `sponsor_confirm.status=WAIVED_HOTFIX_P0` + residual | Document waiver expiry |
| Memory-only dispatch | Dev skips spec | Missing `spec_targets` / stage | QC NO-GO; PM re-dispatch BA |
| Premature apps/** | Remaster claim from compiler wave | `forbidden_paths` contains `apps/**` | Phase A default forbidden |
| Wrong OS path promote | Copy to NFC stub | README-SOT-LOCATION + chapter in full OS | Checklist §10 |

---

## 10. Phase B — MUST promote checklist (`_vibe-team-os`)

Promote **only** to full OS (has `02-SPEC-FIRST-GATE.md` … `33-…`). **Cấm** ghi vào stub 2-file.

### 10.1 Files to ADD

| # | Path under `projects/_vibe-team-os/` | Content |
|---|--------------------------------------|---------|
| 1 | **`34-BUSINESS-CHANGE-COMPILER.md`** | Doctrine: Hybrid Option C, P0/P1 planes, pipeline diagram, field glossary, anti-patterns, link `02`/`06`/`09`/`13`/`14`/`22`/`05` |
| 2 | `templates/CHANGE_MANIFEST.example.json` | Minimal valid **P1 Wave** example |
| 3 | `templates/CHANGE_MANIFEST_EXCEL_COLUMNS.md` | Column map sheet → P0/P1 JSON |
| 4 | `templates/compile-change-manifest.md` *(or `.mjs` stub)* | How to compile / validate |
| 5 | `schemas/change-manifest.schema.json` | Copy from XeVN v0.1+ (keep version) |
| 6 | Optional: `rules/business-change-compiler.mdc` | Cursor rule pointer (thin) |

### 10.2 Files to UPDATE

| # | Path | Change |
|---|------|--------|
| 1 | `MANIFEST.json` | Add `"34-BUSINESS-CHANGE-COMPILER.md"` to `docs[]`; bump version + `updated` |
| 2 | `CHANGELOG.md` (if present) | Entry Phase B promote |
| 3 | `PM-START-HERE.md` | Situation row: “Sponsor Excel / change batch” → read `34` |
| 4 | `README.md` / `MEMORY.md` | Lock row U77-equivalent OS lock if cross-project |
| 5 | `06-PM-ORCHESTRATION.md` | Dispatch packet: attach Manifest path when batch change |
| 6 | `templates/PM_DETAILED_DISPATCH.md` | Field `change_manifest_path:` |
| 7 | `templates/SUBAGENT_READ_MAP.md` | Row for compiler / Manifest |

### 10.3 MUST promote gate (exit Phase B)

- [ ] Chapter **34** on disk at full OS root  
- [ ] Schema + example template present (**P1 Wave** valid)  
- [ ] `MANIFEST.json` lists 34  
- [ ] `PM-START-HERE` situation link  
- [ ] Explicit statement: **Spec-first unchanged**; Memory/Compound are loadout/compound only  
- [ ] Evidence `docs/qa/evidence/…-os-promote-….md` in pilot repo or OS `case-studies/`  
- [ ] No Tencent stack as required dependency  

### 10.4 Phase sequencing

| Phase | Where | Exit |
|-------|-------|------|
| **A1** (this ADR) | xevn `docs/architecture` + `docs/program/schemas` | Schema + ADR Accepted |
| **A2** | xevn: BA Excel column map + 1 **P1** sample Manifest from real sponsor sheet | Sample validates ajv |
| **A3** | xevn: optional `scripts/compile-change-manifest.mjs` | Dry-run on sample |
| **B** | Promote §10.1–10.3 → `_vibe-team-os` | MANIFEST bump; PM-START link |

---

## 11. Rollout / validation / acceptance

### 11.1 Rollout steps (A1 done by this work item)

1. Land ADR + schema v0.1 (no `apps/**`).  
2. PM authors/refreshes `BUSINESS_CHANGE_COMPILER_PROGRAM.md` pointing to ADR.  
3. BA: Excel column template + 1 **P1 Wave** Manifest sample (real XeVN chốt sheet); keep P0 batch example labeled feedstock.  
4. SA/TM spot-check: sample ⊂ schema; fields map to `spec_read_ack` + slice.  
5. Phase B promote when A2 sample green.

### 11.2 Rollback

Delete/ignore Manifest; fall back to existing ROLE_DISPATCH_PROMPT — Spec-first vẫn giữ. Không rollback OS chapters cũ.

### 11.3 Success criteria (A1)

| AC | Pass when |
|----|-----------|
| AC-BCC-01 | ADR on disk with Option C selected + matrix |
| AC-BCC-02 | `change-manifest.schema.json` draft v0.1 with required fields from U77 dispatch |
| AC-BCC-03 | Phase B MUST checklist lists chapter **34** + MANIFEST/PM-START |
| AC-BCC-04 | Integration map states Spec-first not replaced |
| AC-BCC-05 | Evidence path + `PASS_TO_PM` handoff |
| AC-BCC-06 | P0 vs P1 planes locked (batch ≠ dispatch SoT) |

---

## 12. Impacted systems & dependencies

| System | Impact |
|--------|--------|
| xevn `docs/program` | Schema + (later) sample manifests / program |
| PM bus / Task | `change_manifest_path` in dispatch |
| BA intake | Excel → P0 → P1 Manifest ownership |
| `_vibe-team-os` | Chapter 34 promote (Phase B) |
| Dev/QA | Consume Manifest `allowed_paths` / `ac` — no new runtime service |
| agentmemory | Optional loadout keys from `uc_ids` / `work_item_id` |

**Non-dependencies:** Tencent cloud memory, Superpowers full install, product deploy.

---

## 13. References

- U77 — `docs/program/TEAM_USER_REQUIREMENTS.md`  
- OS: `02` · `05` · `06` · `09` · `13` · `14` · `22` · `25` · `PM-START-HERE.md` · `README-SOT-LOCATION.md` · `MANIFEST.json`  
- Global: `team-spec-before-code-gate.mdc` · `team-artifact-neo-feature-slice.mdc`  
- Project: `docs/program/SUBAGENT_READ_MAP.md`  
- Pilot BA feedstock: `docs/program/schemas/CHANGE_MANIFEST_EXCEL_COLUMNS.md` · `change-manifest.example.json` (P0 — align to P1 in BA-01)
