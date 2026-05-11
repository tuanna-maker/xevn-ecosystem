---
name: senior-design-review
description: Applies senior-level design review using SOLID, architecture boundaries, and maintainability risk checks. Use when implementing/refactoring core modules or reviewing technical approaches.
---

# Senior Design Review

## Use when
- Designing/refactoring core modules.
- Reviewing backend/frontend/mobile architecture choices.
- Evaluating technical debt and maintainability risk.

## Review workflow
1. Identify module responsibility and change drivers.
2. Evaluate SOLID adherence:
   - SRP: one reason to change?
   - OCP: extension path without core rewrites?
   - LSP: substitution-safe contracts?
   - ISP: focused interfaces?
   - DIP: abstraction boundaries respected?
3. Check boundary hygiene:
   - domain vs transport/infrastructure separation
   - dependency direction correctness
4. Check testability and observability impact.
5. Produce actionable remediation list.

## Output template
- Scope reviewed:
- Current design risks:
- SOLID assessment (S/O/L/I/D):
- Boundary issues:
- Recommended changes:
- Risk if deferred:
- Verification plan:
