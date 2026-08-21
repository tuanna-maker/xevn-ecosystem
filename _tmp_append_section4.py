import pathlib, sys
target = pathlib.Path(r'C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem\docs\program\REMAINING_WORK_2026-07-29.md')
print('exists:', target.exists(), 'size:', target.stat().st_size if target.exists() else 'n/a')
extra = """

---

## 4. Critical constraints for any sprint execution

1. **HOLD_DEPLOY** — no deploy unless user explicitly requests it. C-HRMQC-01 stays deferred.
2. **U65 zero-seed** — must remain `seed: false`; no seed injection in any QA or UAT run.
3. **Portal bypass must remain** — do not remove localhost JWT / portal bypass; R-C2-01 deny-persona coverage is deferred to PROD, not a product NO-GO.
4. **OneDrive `.vite` EPERM** — fix before any further dev-server runs; otherwise suppressed followups will continue (28 current).
5. **PM loop: one Task per work item per turn** — stop-gate suppressed followups (28 current) by never dispatching >1 Task per turn.
6. **G8 mobile ILA >=16/20** — current slice averages ~14.5/20; this is the last hard sponsor blocker before UAT sign-off.

*This document is read-only audit output. No code was modified. No bus state was changed.*
"""
with open(target, 'a', encoding='utf-8') as f:
    f.write(extra)
print('wrote', len(extra), 'bytes')
print('new size:', target.stat().st_size)
lines = target.read_text(encoding='utf-8').split('\n')
print('total lines:', len(lines))
for i, l in enumerate(lines[-8:], start=len(lines)-7):
    print(f'{i}: {repr(l[:120])}')
