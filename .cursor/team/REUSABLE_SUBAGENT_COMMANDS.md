# Reusable Subagent Commands (Cross-Project)

## Command PM-0 — Kích hoạt điều phối (user one-liner)

**User gửi trong chat:**

```text
điều phối team đi
```

**PM đọc và làm:** `.cursor/templates/PM_ORCHESTRATE_DEFAULT.md` (xevn-ecosystem) · Playbook §4.0

Không cần user mô tả work_item — PM tự đọc bus tail, residual QC/QA, sprint backlog, rồi `Task` + bus `DISPATCHED` trong **cùng lượt**.

---

## PASS_TO_PM / bus handoff (PM — any project)

Template: `~/.cursor/templates/ROLE_DISPATCH_PROMPT.md` · KB: `~/.cursor/knowledge-base/pm-orchestration.md`

When QA returns `PASS_TO_PM`, PM **same session**: bus INTAKE + `Task` dispatch — never confirm-only.

```
work_item_id: {FROM_EVIDENCE}
from_role: pm
to_role: dev-be|dev-fe|qa
ack_status target: READY_FOR_QA
evidence_path: docs/qa/evidence/{file}.md
## Tasks: (copy PM dispatch section from evidence)
```

---

## Purpose
- Reusable PM dispatch prompts so future projects produce consistent outcomes.
- Prevent leaking internal instruction wording into client-facing documents.
- Enforce BRD/SRS quality, deterministic technical validation, and evidence logging.

## Global policy block (prepend to every content-writing prompt)
Use this policy text in all BRD/SRS dispatches:

1. Write for customer-facing delivery; never include internal workflow terms.
2. Keep language professional Vietnamese; localize technical terms when required by client policy.
3. Keep IDs consistent across BRD, SRS, TechSpec, Test artifacts.
4. Every requirement must be testable and traceable.
5. Do not invent implementation facts; cite only repository evidence.
6. **Client BRD/SRS HTML (any project):** subagent **`ba-docs`** + `~/.cursor/skills/client-delivery-brd-srs/SKILL.md`; per-repo `PROJECT_PROFILE.md`; never edit customer `*.html` by hand.
7. **Banned in customer HTML/text:** `docs/...` paths, "BRD & SRS Writing Standards", "Chuẩn 8 chương", pipeline/audit/override/template Unicom, `Kiểm chứng (Verify)` + script trace IDs.
8. **XeVN SRS default:** Bateco 6 chapters + 373 FR with 7 sections each (`srs-bateco-body.mjs`, `srs-fr-spec.mjs`) — do not rebuild legacy 8-chapter / 12-section-per-UC SRS unless user explicitly requests regression.

---

## Command 0 - XeVN Client delivery HTML (BRD + SRS)

### Subagent type
- **`ba-docs`** (primary) + `sa` (review Ch.1–2/NFR) + agent runs build

### Prompt template
```
Produce or update client delivery BRD/SRS HTML for this project.

Mandatory reads:
- C:\Users\ADMIN\.cursor\skills\client-delivery-brd-srs\SKILL.md
- C:\Users\ADMIN\.cursor\knowledge-base\client-delivery-brd-srs.md
- Project .cursor/skills/**/PROJECT_PROFILE.md (or docs standards)
- docs/standards/BRD_SRS_WRITING_STANDARDS.md (if present)

Deliverables:
- docs/client-delivery/01_BRD_XeVN_OS.html (pnpm docs:brd:html)
- docs/client-delivery/02_SRS_XeVN_OS.html (pnpm docs:srs:audit then docs:srs:html)

Exit criteria:
- docs:srs:audit → 373/373 pass (each FR has 7 sections: meta, input, main, rules, special, sequence, dien_bien)
- build console: ok=true, fr_blocks=373
- SRS structure: Bateco 6 chapters (NOT legacy 8-chapter / 12-section-per-UC model)
- No banned meta phrases in HTML (grep Writing Standards, docs/, pipeline, REQ-SRS, CHI TIẾT USE CASE)
- Generators: srs-bateco-body.mjs + srs-fr-spec.mjs (read skill before editing)
```

---

## Command 1 - BRD Writer (BA-Process / BA-Data)

### Subagent type
- `ba-process` (primary), `ba-data` (for data matrix enhancement).

### Prompt template
```
You are a senior BA producing a customer-facing BRD for <SYSTEM_NAME>.

Mandatory quality:
- Professional Vietnamese, no internal process wording.
- Full business context, scope, stakeholders, objectives/KPIs.
- Concrete subsystem coverage table (each subsystem: objective, user group, key data, governance concerns).
- Use-case catalog with stable IDs.
- Business rules matrix (condition -> action -> outcome).
- Acceptance criteria and requirement-to-test traceability.

Output constraints:
- Keep terminology localized per glossary policy.
- Ensure cross-document consistency for use-case IDs.
- Include a concise risks/mitigation section.

Return:
1) Final BRD markdown (source: docs/ecosystem/BRD_TONG_HOP_HE_SINH_THAI_XEVN.md).
2) List of assumptions and open decisions (if any).
3) Change log vs previous BRD version (business wording only).
4) Evidence: pnpm docs:brd:html ok=true.
```

---

## Command 2 - SRS Writer (BA-Process with Dev-BE review)

### Subagent type
- `ba-process` then `dev-be` for technical sanity review.

### Prompt template
```
You are a senior BA writing SRS for <SYSTEM_NAME>, aligned to existing BRD.

Must include:
- Same use-case IDs as BRD (no drift).
- Sequence diagram for key business flows.
- Detailed if/else logic for each use case.
- Validation matrix (field, rule, error behavior).
- Success/fail response expectations and complete error-code catalog.
- Non-functional requirements with measurable expectations.
- Acceptance criteria mapped to use cases and test evidence paths.

Rules:
- Customer-facing wording only.
- No internal prompt/process references.
- Keep terms localized according to glossary policy.

Return:
1) UC updates in docs/srs-overrides/ or enriched specs via pipeline (not raw HTML).
2) Consistency checklist BRD<->SRS.
3) Test coverage recommendations for QA.
4) Evidence: pnpm docs:srs:audit 373/373 + pnpm docs:srs:html ok=true.
```

---

## Command 3 - Integration Audit (Dev-BE + QA)

### Subagent type
- `dev-be` + `qa` in parallel.

### Prompt template
```
Audit integration path <SOURCE_SYSTEM> -> <TARGET_SYSTEM>.

Deliver evidence-based report:
1) Implementation map (controllers/services/db tables/FE wiring).
2) DB connectivity and seed readiness.
3) Runtime smoke commands (PowerShell-friendly).
4) Existing tests and coverage gaps.
5) Verdict: READY / PARTIAL / NOT READY, with blockers and fixes.

Constraints:
- Cite exact file paths.
- Include executed command outputs where available.
- Separate "verified by run" vs "verified by code inspection".
```

---

## PM orchestration checklist (reusable)

1. Dispatch lanes in parallel:
   - BA lane (BRD/SRS),
   - Dev lane (implementation audit),
   - QA lane (test verdict).
2. Merge outputs into one PM summary:
   - verified evidence,
   - gaps,
   - decision and next owner.
3. Persist artifacts in team folder:
   - `PM_WORK_LOG.md` entry,
   - updated reusable prompts if quality policy evolved.
4. Enforce closure criteria:
   - no ID drift across documents,
   - no internal wording in client documents,
   - command-level reproducibility for validation.

---

## Command 4 - Production Enable (DevOps — autonomous)

### Subagent type
- **`devops`** (primary) — hoặc `generalPurpose` + skill `devops-deploy` + `platform-nfr-bootstrap`

### Prompt template
```
You are DevOps for <PROJECT_NAME>. Execute production enable end-to-end without asking the user to run commands.

Mandatory reads:
- docs/ops/PRODUCTION_ENABLE_RUNBOOK.md (phases A→H)
- .cursor/skills/devops-deploy/SKILL.md
- deploy/xevn-ecosystem/.env on VPS (backup before edit; never log secrets)

Execute:
1. build:platform-core + API builds
2. migrate hrm/xbos if pending
3. SSH VPS: update NODE_ENV, SERVICE_JWT_SECRET, CORS_ALLOWED_ORIGINS, INTERNAL_API_KEY
4. docker compose up -d --build (xevn only; no compose down)
5. Smoke health + Prometheus metrics
6. pnpm verify:production-env (must exit 0 on prod-like env)
7. verify:tenant-isolation, ops:synthetic-checks, test:e2e:security

Return handoff:
- work_item_id: NFR-PROD-ENABLE
- gate table PASS/FAIL per runbook §1
- evidence_path (curl logs, script exit codes — no secrets)
- ack_status: READY_FOR_QC | BLOCKED + owner for blockers

Update KB: C:\Users\ADMIN\.cursor\knowledge-base\devops.md + repo .cursor/knowledge-base/platform-nfr-bootstrap.md
```

---

## Command 5 - Platform NFR Bootstrap (SA + Tech Lead — new project)

### Subagent type
- `sa` + `technical-manager` review; `dev-be` implements; `devops` validates ops

### Prompt template
```
Bootstrap platform NFR P0 minimum for <PROJECT_NAME> API monorepo.

Follow .cursor/skills/platform-nfr-bootstrap/SKILL.md — do not ask user to re-spec logging/metrics/CORS.

Deliver: packages/platform-core, API wiring, docs/ecosystem/NFR_*_BASELINE.md, docs/ops/PRODUCTION_ENABLE_RUNBOOK.md, verify scripts, observability compose profile obs.

SA: sign-off matrix for RLS only. TM: block release without production evidence.
```

---

## Command 6 - PM orchestration (parent agent)

### Policy
- User assigns outcome → **Composer/PM dispatches sub-agents** (devops, dev-be, qa, …).
- Each sub-agent **updates its own role KB** after completion; PM only synthesizes bus + gates.
- Production/NFR: default dispatch **Command 4** to `devops` without user re-prompting.

### Prompt template (PM → parent Composer)
```
Read .cursor/knowledge-base/platform-nfr-bootstrap.md and bus tail.
If release/pilot/production: Task devops with Command 4.
If NFR code missing: Task dev-be + sa per Command 5.
Do not duplicate runbook steps in chat — cite evidence_path only.
```

---

## Suggested invocation examples

- BRD:
  - `Subagent(ba-process, prompt=<Command 1 template with SYSTEM_NAME filled>)`
- SRS:
  - `Subagent(ba-process, prompt=<Command 2 template with SYSTEM_NAME filled>)`
- Technical verification:
  - parallel `Subagent(dev-be, ...)` + `Subagent(qa, ...)` using Command 3.
- Production enable:
  - `Task(devops, prompt=<Command 4>)`
- New API monorepo:
  - `Task(sa, ...)` + `Task(dev-be, ...)` using Command 5; then `Task(devops, ...)` Command 4 before QC Go.
