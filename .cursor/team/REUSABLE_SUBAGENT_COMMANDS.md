# Reusable Subagent Commands (Cross-Project)

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
1) Final BRD markdown.
2) List of assumptions and open decisions (if any).
3) Change log vs previous BRD version.
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
1) Final SRS markdown.
2) Consistency checklist BRD<->SRS.
3) Test coverage recommendations for QA.
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

## Suggested invocation examples

- BRD:
  - `Subagent(ba-process, prompt=<Command 1 template with SYSTEM_NAME filled>)`
- SRS:
  - `Subagent(ba-process, prompt=<Command 2 template with SYSTEM_NAME filled>)`
- Technical verification:
  - parallel `Subagent(dev-be, ...)` + `Subagent(qa, ...)` using Command 3.
