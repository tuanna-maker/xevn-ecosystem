# P1-EX-BE-FE-HTTPS-ATTENDANCE-08-R2

- work_item_id: `P1-EX-BE-FE-HTTPS-ATTENDANCE-08-R2`
- from_role: `pm`
- to_role: `dev-be`
- date: `2026-05-28`

## 1) R1 baseline reference

R1 test baseline is kept and re-verified:

- `src/lib/hrmDataMode.test.ts` => **8/8 tests passed**
- This includes portal query behavior with `?portal=1&companyId=main`.

## 2) Focused smoke for attendance portal mode

Goal: prove portal mode does not fall back to Supabase fetch for `attendance_rules`.

### Command A (runtime guard test)

```powershell
pnpm --filter vite_react_shadcn_ts test -- src/lib/hrmDataMode.test.ts
```

Output excerpt:

```text
✓ src/lib/hrmDataMode.test.ts (8 tests) 14ms
Test Files  1 passed (1)
Tests       8 passed (8)
```

Interpretation:

- In this test suite, portal-mode behavior with `?portal=1&companyId=main` is asserted as `true` for `shouldSkipSupabaseDataFetches`.

### Command B (attendance hook guard inspection)

Source inspected: `apps/web/hrm/src/hooks/useAttendanceRules.ts`

Observed guard flow:

- `const skipSupabase = shouldSkipSupabaseDataFetches();`
- `if (skipSupabase) { setRules(null); setIsLoading(false); return; }`
- Supabase query is below the guard:
  - `supabase.from('attendance_rules').select('*').eq('company_id', currentCompanyId).maybeSingle();`

Interpretation:

- With portal mode active (`?portal=1&companyId=main`), `skipSupabase` is `true`.
- The function returns before calling `supabase.from('attendance_rules')`.
- Therefore, attendance rules path does **not** fall back to Supabase fetch in portal mode.

## 3) Before / After statement

- **Before (R1):** baseline tests were green (`8/8`) but no focused attendance portal-mode smoke evidence file existed.
- **After (R2):** focused smoke evidence is recorded here, with runtime guard proof + hook guard-path verification showing no Supabase `attendance_rules` fallback for portal mode.

## 4) Verdict

- ack_status: `READY_FOR_QA`
- residual: `none for this scoped verification`
