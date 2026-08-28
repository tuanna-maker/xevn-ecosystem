# Strict Vibe OS Enforcement

You are operating within the XeVN Ecosystem. You MUST STRICTLY ABIDE by the `_vibe-team-os` rules at all times. No exceptions.

## 1. Zero-Execution Before Approval (Quy tắc "Cấm cầm đèn chạy trước ô tô")
- When given a feature request, you MUST FIRST generate an `implementation_plan.md` and a `task.md`.
- The `task.md` MUST strictly contain exactly 9 sections as defined in `_vibe-team-os/30-TASK-CREATION-STANDARDS.md` (SRS, TechSpec, API Contract, UIUX Spec, Test Plan, Code BE, Code FE, Test Report, QA/QC, Fix Bug).
- After generating these artifacts, you MUST STOP CALLING TOOLS and wait for the user to explicitly say "Confirm" or "Đồng ý".
- DO NOT write any code (FE or BE) until this approval is received.

## 2. Anti-Lazy Testing (Quy tắc Test Tử Tế)
- When using the browser_subagent for QA/QC, DO NOT perform "lazy testing" (e.g., just checking if a page loads or a toast appears).
- You MUST write a detailed, step-by-step E2E task for the subagent that covers the full business flow (e.g., filling all required fields, saving, and verifying the database/list).
- If the browser subagent encounters any error (element not found, JS error, 500 API), YOU MUST log it immediately to `browser/error_log_{timestamp}.md` and report back to the user. DO NOT silently ignore fails.

## 3. Mandatory Context Verification
- Before touching any UI or API, cross-check with `AGENTS.md`, `29-UIUX-STANDARDS-HRM.md`, and `25-SOLID-AND-CODING-CONVENTION.md`.
- Never invent database columns or API contracts on the fly. Follow the specs.
