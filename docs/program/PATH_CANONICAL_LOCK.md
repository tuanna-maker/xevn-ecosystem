# PATH CANONICAL LOCK — xevn-ecosystem (Sponsor 2026-08-03)

## Canonical (ONLY write / git here)

```
C:\Users\ADMIN\OneDrive\Tài liệu\Vibe Coding\projects\xevn-ecosystem
```

- Unicode form: **NFD** folder name `Tài liệu` (UTF-8 hex of parent leaf: `5461cc8069206c69c3aacca375`)
- Marker file: `CLAUDE.md` content = `hello claude abc abc abc` (1 line)
- Must have: `.git/` + `apps/` + `packages/`
- Verify before every write:

```bash
pwd
test -f CLAUDE.md && head -1 CLAUDE.md
test -d .git && test -d apps && echo CANON_OK
git rev-parse --show-toplevel
```

Expected CLAUDE first line: `hello claude abc abc abc`

## FORBIDDEN shadow roots (do not write)

| Root | Why |
|------|-----|
| `C:\Users\ADMIN\OneDrive\Tai lieu\...` | ASCII — no git, thin copy |
| `C:\Users\ADMIN\OneDrive\Tài liệu\...` (NFC hex `54c3a069206c69e1bb8775`) | No git; Claude drift writes (BRD ~320 lines, long CLAUDE.md) |

## If you discover you are on a shadow

1. STOP editing.
2. `cd` to canonical path above (copy from this file; do not retype accents from memory).
3. Re-run verify block until `CANON_OK`.
4. Ask Cursor-PM / sponsor before copying files from NFC shadow into git tree.

## BRD note

- Git HEAD on canonical may already contain enterprise BRD (`git show HEAD:docs/brand-new-documents-20270801/BRD_NEW.md`).
- Working tree stub (~40 lines) = regression vs HEAD; do not treat NFC 320-line file as SoT until allow-list merge + review.
