# Evidence — W1-B-QA-TEST-LOG-STD-01

| Field | Value |
|-------|--------|
| **work_item_id** | `W1-B-QA-TEST-LOG-STD-01` |
| **role** | qa |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **lane** | governance + execution (QA standards) |
| **U65 / U76 / U78** | zero-seed · HDSD case matrix · world-standard test log |
| **ack_status** | **PASS_TO_PM** |

## Mission

Sponsor: *«Test phải có log test chuẩn thế giới — tự nghiên cứu mà làm.»*

## Research notes (cited)

| Standard / practice | What we took | Sources |
|---------------------|--------------|---------|
| **IEEE 829** Level Test Log (LTL) | Chronological record: who ran which cases, order, pass/fail; anomalous events → incident/anomaly | [Software test documentation (LTL)](https://en.wikipedia.org/wiki/Software_test_documentation); IEEE Std 829-1998 §9 Test log; IEEE 829-2008 Clause 13 Level Test Log |
| **ISO/IEC/IEEE 29119-3:2021** | Test execution log (unique id, date/time, description, impact); Actual results; Test result = expected vs actual pass/fail; Test incident report | [ISO 29119-3:2021](https://www.iso.org/standard/79429.html) §8.9–8.11 / Annex Q–R; sample TOC via standards.iteh.ai |
| **JUnit XML + Allure-style** | Machine counts (`tests`/`failures`/`skipped`); steps; attachments via path (CI convention `[[ATTACHMENT|…]]` / Allure steps) | [JUnit XML guide](https://gaffer.sh/blog/junit-xml-format-guide/); [testmoapp/junitxml](https://github.com/testmoapp/junitxml); Azure/Jenkins attachment convention |

**Lean mapping in XeVN:** human MD (IEEE LTL) + JSON `xevn-test-log/v1` (29119 execution log + result + Allure-like attachments) — not full formal document suite.

## Confirm OS / templates

| Artifact | Status |
|----------|--------|
| `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` | **Landed** this WI (was referenced by U78 / bus / rule / template but **missing** on disk — created with schema + reject rules) |
| `_vibe-team-os/templates/TEST_EXECUTION_LOG.md` | **Landed** (OS template mirror) |
| `docs/qa/TEST_EXECUTION_LOG_TEMPLATE.md` | **Confirmed present** (pre-existing) |
| `.cursor/rules/qa-world-standard-test-log.mdc` | Confirmed present |

## Files landed

| Path | Purpose |
|------|---------|
| `_vibe-team-os/31-WORLD-STANDARD-TEST-LOG.md` | OS SoT + `xevn-test-log/v1` |
| `_vibe-team-os/templates/TEST_EXECUTION_LOG.md` | OS template |
| `docs/qa/WORLD_STANDARD_TEST_LOG.md` | Project SoT pointer (fields, paths, reject, PM flags) |
| `docs/qa/evidence/w1b-04-auth-fe-qa-ret2-test-log.md` | Backfill human log from AUTH-FE RET2 |
| `docs/qa/evidence/w1b-04-auth-fe-qa-ret2-test-log.json` | Backfill machine log (`xevn-test-log/v1`) |
| `docs/qa/evidence/CAPABILITY_EVIDENCE_TEMPLATE.md` | ADD-only pointer: mọi wave cần OS 31 test-log md+json |

**Backfill source:** `docs/qa/evidence/w1b-04-auth-fe-qa-ret2.md` + `_tmp-w1b-04-auth-fe-qa-ret2-runtime.json` + existing screens under `docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret2/`.  
**Not claimed:** product UAT DONE · no seed · no re-run invent PASS.

## Attachment integrity (cited paths exist)

- `screens/w1b-04-auth-fe-qa-ret2/00-login-form.png`
- `screens/w1b-04-auth-fe-qa-ret2/A-wrong-password.png`
- `screens/w1b-04-auth-fe-qa-ret2/B-ceo-after-login.png`
- `screens/w1b-04-auth-fe-qa-ret2/01-ceo-after-login.png`
- `screens/w1b-04-auth-fe-qa-ret2/B-admin-after-login.png`
- `screens/w1b-04-auth-fe-qa-ret2/C-after-f5.png`

## completion_report

Closed **W1-B-QA-TEST-LOG-STD-01**: researched IEEE 829 LTL + ISO 29119-3 execution log/result + JUnit/Allure practice; landed missing OS 31 + OS template; project pointer `docs/qa/WORLD_STANDARD_TEST_LOG.md`; backfilled AUTH-FE RET2 `*-test-log.md` + `*-test-log.json` (schema `xevn-test-log/v1`) with chronological steps/times/expected vs actual/network/existing attachments; ADD-only capability template pointer. Residual: future QA WIs must attach test-log pair (`test_log_required`). Product UF verdicts unchanged (AUTH-FE RET2 remains FAIL).

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: W1-B-04-AUTH-FE-QA-RET3 (after W1-B-04-AUTH-FE-VITE-02 READY_FOR_QA) · parallel pattern for W1-B-02-EMP-QA-RET3 · W1-B-04-AUTH-MOB-QA-R3
role: qa / qa-device
priority: P0
test_log_required: true
test_log_md: docs/qa/evidence/<WI-slug>-test-log.md
test_log_json: docs/qa/evidence/<WI-slug>-test-log.json
mission: Retest browser/device Cases A/B/C per HDSD (U76). MUST attach both *-test-log.md and *-test-log.json (schema xevn-test-log/v1 per OS 31). Chronological steps with ISO times, expected vs actual, network, existing attachment paths. U65 zero-seed. Reject idle-viewport-only. Example shape: docs/qa/evidence/w1b-04-auth-fe-qa-ret2-test-log.md + .json · SoT docs/qa/WORLD_STANDARD_TEST_LOG.md
entry: parent READY_FOR_QA + L0 up
exit: narrative evidence + test-log md+json; ack_status PASS_TO_PM or FAIL with incidents; INVALID-HANDOFF if missing JSON
cấm: seed · invent UF 🟢 · skip machine log
```

## ack_status

**PASS_TO_PM**
