# World-standard Test Log — XeVN project SoT

**OS SoT (authoritative doctrine + schema):** [`_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md`](../../_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md)  
**Template:** [`TEST_EXECUTION_LOG_TEMPLATE.md`](./TEST_EXECUTION_LOG_TEMPLATE.md) · OS `templates/TEST_EXECUTION_LOG.md`  
**Rule:** `.cursor/rules/qa-world-standard-test-log.mdc` · **U78** in `docs/program/TEAM_USER_REQUIREMENTS.md`

This page is the **project pointer** (1–2 pages). Do not fork schema here — change OS 31 first.

---

## Why (standards → practice)

| Layer | Requirement | XeVN artifact |
|-------|-------------|-----------------|
| IEEE 829 Level Test Log | Chronological case run, tester, pass/fail | `*-test-log.md` steps |
| IEEE 829 Anomaly / Incident | Unexpected events with expected vs actual | `incidents[]` |
| ISO/IEC/IEEE 29119-3 | Test execution log + test result | same MD + JSON |
| JUnit XML / Allure | Machine counts + steps + attachments | `*-test-log.json` `summary` + `attachment` paths |

---

## Required fields (every QA / qa-device wave)

1. **Header:** `log_id`, `work_item_id`, `tester`, `started_at`, `ended_at`, environment URLs/ports, `spec_ref`, `hdsd_align`, U65 zero-seed flag.  
2. **Steps:** chronological `seq` + time + action (HDSD) + **expected** + **actual** + network (when any) + result + attachment path.  
3. **Case matrix (U76):** A fail-deep · B success HDSD · C logic/BR — status each.  
4. **Incidents:** severity + residual WI.  
5. **Summary + ack_status** aligned with narrative evidence.

---

## Paths (naming)

| Kind | Path |
|------|------|
| Human log | `docs/qa/evidence/<slug>-test-log.md` |
| Machine log | `docs/qa/evidence/<slug>-test-log.json` (`schema: xevn-test-log/v1`) |
| Screens | Prefer `docs/qa/evidence/screens/<slug>/…` (must exist if cited) |
| Narrative | `docs/qa/evidence/<slug>.md` — still required; does **not** replace test-log |

**Canonical backfill example:**

- `docs/qa/evidence/w1b-04-auth-fe-qa-ret2-test-log.md`
- `docs/qa/evidence/w1b-04-auth-fe-qa-ret2-test-log.json`
- Source run: `docs/qa/evidence/w1b-04-auth-fe-qa-ret2.md`

---

## Reject rules (QA handoff)

- No chronological steps → **INVALID-HANDOFF**
- MD without JSON (or JSON without MD) → **INVALID-HANDOFF**
- Idle viewport / screenshot without clicks + network → reject (anti-idle)
- Seed / fake DB / invent UF 🟢 from vitest → reject (U65)
- Attachment path listed but missing on disk → reject
- Claim product UAT DONE from test-log alone → forbidden

---

## PM / future WI

Every Task QA must include:

```text
test_log_required: true
test_log_md: docs/qa/evidence/<WI-slug>-test-log.md
test_log_json: docs/qa/evidence/<WI-slug>-test-log.json
```

Applies to **EMP-QA-RET3**, **AUTH-FE-QA-RET3**, **AUTH-MOB-QA-R3**, and all later waves. Capability evidence template also points here — see `docs/qa/evidence/CAPABILITY_EVIDENCE_TEMPLATE.md`.
