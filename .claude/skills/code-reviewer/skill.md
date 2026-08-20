---
name: code-reviewer
description: Review code changes for bugs, security, performance, and best practices. Use when user asks to review code, PR, or before committing.
---

# Code Reviewer Skill

## When to Use
- User asks to review code, PR, or changes
- Before committing significant changes
- User mentions "review", "check", "audit code"

## Review Dimensions
1. **Correctness** — Logic bugs, edge cases, race conditions
2. **Security** — OWASP Top 10, SQL injection, XSS, auth bypass
3. **Performance** — N+1 queries, memory leaks, inefficient algorithms
4. **Maintainability** — Clear naming, single responsibility, DRY
5. **Testing** — Coverage gaps, missing edge cases

## Output Format
| Severity | File:Line | Issue | Fix |
|----------|-----------|-------|-----|
| HIGH | path:123 | Description | Suggested fix |
| MEDIUM | path:456 | Description | Suggested fix |
| LOW | path:789 | Description | Suggested fix |

## Rules
- Never approve code with HIGH severity issues
- Always check multi-tenant isolation (tenant_id filtering)
- Verify no hard-delete in business entities
- Check JWT validation and RBAC enforcement
