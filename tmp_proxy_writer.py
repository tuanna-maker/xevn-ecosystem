# Generator script for BA-UX-C1-PROXY-01 evidence file
# Run: python tmp_proxy_writer.py

out_path = r'C:\xevn-ecosystem\docs\qa\evidence\ba-ux-c1-proxy-01-20260728.md'

header = """# BA-UX-C1-PROXY-01 — Proxy Tree-Test Protocol (Lane C1 IA Refactor)

| Field | Value |
|-------|-------|
| **work_item_id** | `BA-UX-C1-PROXY-01` |
| **from_role** | ba-process (Claude-PM deputy) |
| **to_role** | pm / qa |
| **lane** | C (P0 IA refactor + null-guard) |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-07-28 |
| **sponsor_lock** | U65 · HOLD_DEPLOY · peer review only; **no sponsor sign-off claimed; no Dev dispatch** |

---

"""

s1 = """## 1. Proxy Protocol — How to Measure Click Depth

### 1.1 Tool

**Primary:** browser DevTools Recorder panel + manual step count.
  1. Open `http://127.0.0.1:5173/hrm` (or portal embed at `:8088`) in Chrome.
  2. DevTools → More tools → Recorder → "Start new recording".
  3. Walk through each task path; stop recording. Inspect the step timeline and count user actuations.
  4. For each task record: start_url → click 1 → click 2 → action. If action reachable in ≤2 clicks, PASS.

**Alternative (scriptable):** Puppeteer one-liner.
  - Project has Node tooling (`node_modules` present).
  - Install if absent: `pnpm add -D puppeteer-core` in `apps/web/hrm`.
  - Script skeleton in §3 below.

### 1.2 Click Definition (counting rule)

A **click** = one user actuation that navigates, opens a new actionable surface, or selects a menu/tab item:

| UI Pattern | Counts as | Rationale |
|-----------|-----------|-----------|
| `NavLink` sidebar leaf (direct, no children) | 1 click | Navigates to page |
| `PopoverTrigger` + `PopoverContent` child NavLink | 2 clicks | Must open parent then select child |
| `DropdownMenuTrigger` + `DropdownMenuItem` | 2 clicks | Open dropdown then select item |
| In-page tab button (`onClick => setActiveTab`) | 1 click | Explicit tab selection |
| Expandable accordion in same view | 0 clicks | In-place expansion, not navigation |
| Hover / scroll | 0 clicks | Not deliberate navigation |

**Stop counting** when the user reaches the actionable form or widget. Do NOT count the submit button press.

### 1.3 Start / End Points

| Item | Definition |
|------|-----------|
| **Start URL** | `http://127.0.0.1:5173/hrm` (or portal embed) — user logged in as `ceo@xe.vn` / `Xevn@2026`, sidebar rendered, no active navigation |
| **End condition** | User can execute the primary action: (a) Clock-In method selector visible, (b) Leave request form open, or (c) Payroll calculate/create form open |

### 1.4 Pass / Fail Criterion

| Task | Target click depth | Pass if |
|------|-------------------|---------|
| Clock-In (Chấm công) | ≤ 2 clicks | sidebar → Clock-In widget/form |
| Xin phép (Leave request) | ≤ 2 clicks | sidebar → leave request form |
| Tính lương (Payroll run) | ≤ 2 clicks | sidebar → payroll calculate/create form |

**PASS if ALL 3 tasks reach action in ≤ 2 clicks from sidebar.**
**FAIL if ANY task requires ≥ 3 clicks.**

### 1.5 Fallback

- If proxy is **inconclusive** (dynamic menu state, permission gating, ambiguous routing, tab state dependency): flag for **formal tree test post-sponsor-UAT**.
- Flagged items logged in §5 with "FLAG-FORMAL-TREE-TEST" status for Cursor-PM to queue before dispatching formal test.

---

"""

# Write and done for now (sections 2-5 added in subsequent runs)

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(header)
    f.write(s1)

print(f'Written: {out_path}')
print('Done. Use Edit or subsequent Bash runs to append sections 2-5 + Puppeteer script.')
