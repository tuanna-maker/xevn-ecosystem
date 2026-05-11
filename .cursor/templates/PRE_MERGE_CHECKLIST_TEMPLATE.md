# Pre-Merge Quality Checklist

## 1) Change Context
- Work item:
- Scope summary:
- Owner:
- Reviewers:

## 2) Senior Engineering (SOLID)
- [ ] SRP respected (clear responsibility boundaries).
- [ ] OCP path exists (extension without fragile core rewrite).
- [ ] LSP safe contracts (no behavioral break for consumers).
- [ ] ISP applied (focused interfaces, no bloated contracts).
- [ ] DIP applied at boundaries (abstractions over concrete infrastructure).

## 3) Security and Information Safety
- [ ] No secrets/credentials committed.
- [ ] Input validation and authorization covered.
- [ ] Sensitive data masked in logs/errors.
- [ ] Dependency/security scan has no unresolved critical/high.

## 4) Performance and Reliability
- [ ] Performance impact assessed (and acceptable).
- [ ] Critical paths avoid obvious bottlenecks/unbounded operations.
- [ ] Timeout/retry/fallback behavior defined where relevant.
- [ ] Monitoring/observability impact considered.

## 5) Business Correctness
- [ ] Behavior maps to approved requirements/use cases.
- [ ] Happy/alternate/exception paths covered.
- [ ] Validation and error semantics deterministic.
- [ ] Acceptance criteria evidence attached.

## 6) UI/UX and Accessibility (if applicable)
- [ ] Loading/success/empty/error states handled.
- [ ] Interaction feedback is clear and recoverable.
- [ ] Accessibility baseline checked (keyboard, contrast, readable content).
- [ ] No critical UX regression on key journeys.

## 7) Test and Release Evidence
- [ ] Build passes.
- [ ] Automated tests pass (unit/integration/regression as applicable).
- [ ] Manual/UAT checks attached when needed.
- [ ] Rollback/mitigation notes available for risky changes.

## 8) Final Recommendation
- Recommendation: READY / READY-WITH-CONDITIONS / NOT-READY
- Residual risks:
- Conditions to clear:
- Evidence paths:

## 9) Definition of Done Pre-Check
- [ ] All committed in-scope items are DONE (no open status in committed scope).
- [ ] Required quality/security checks are PASS.
- [ ] Required role signoffs are attached.
- [ ] If any item above is not met, status is explicitly marked NOT DONE / PARTIAL.
