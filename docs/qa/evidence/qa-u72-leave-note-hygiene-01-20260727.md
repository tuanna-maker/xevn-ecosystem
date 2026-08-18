# QA-U72-LEAVE-NOTE-HYGIENE-01 — Leave note `seed:…` display hygiene

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-U72-LEAVE-NOTE-HYGIENE-01` |
| **from_role** | `qa` |
| **to_role** | `qc` |
| **execution_date** | `2026-07-27` |
| **ack_status** | **READY_FOR_QC** |
| **lane** | execution · U65 browser + unit · local `:5173` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` |
| **portal** | `http://127.0.0.1:5173` · `PORTAL_DEV_URL` local |
| **U65** | zero-seed · **no** `pnpm seed:*` · runtime `seed: false` |
| **HOLD_DEPLOY** | **YES** · **NOT** Phase1 / PROD / `:8088` |
| **FE entry** | `docs/qa/evidence/d-fe-u72-leave-note-hygiene-01-20260727.md` (**READY_FOR_QA**) |
| **qc_source** | `docs/qa/evidence/qc-u72-soft-p2-01-r2-20260727.md` § C-U72-LEAVE-NOTE-HYGIENE |
| **harness** | `scripts/qa/qa-u72-leave-note-hygiene-01.mjs` · exit **0** |
| **runtime** | `docs/qa/evidence/_tmp-qa-u72-leave-note-hygiene-01-runtime.json` · `overall: PASS` |
| **must_keep** | **C-U72-LEAVE-P3** · **C-XBOS-U72-P2** · F-09 / F-10 / U02 — **no reopen** |

---

## L0 stack

| Probe | Result |
|-------|--------|
| `qc:dev-stack` | HRM `:28001` + XBOS `:28002` + portal `:5173` → **HTTP 200** (Node win async close noise ignored) |
| HRM Vite | `:8080` listen (embed) |
| Seed | **none** |

---

## Command table

| Command | Exit | Verdict |
|---------|------|---------|
| `pnpm exec vitest run src/lib/labelMaps.test.ts` (cwd `apps/web/hrm`) | **0** | **PASS** — 21/21 · `sanitizeLeaveNoteDisplay` seed→`—` · business keep · empty keep · leave-type unknown→`—` suite |
| `node scripts/qa/qa-u72-leave-note-hygiene-01.mjs` | **0** | **PASS** — runtime `overall: PASS` · `seed: false` · calendar/list/pending/detail no visible `seed:` |

---

## AC / exit criteria matrix

| # | Check | Click path | Expect | Verdict |
|---|-------|------------|--------|---------|
| 1 | **AC-LEAVE-NOTE-CALENDAR** | `/hr/attendance` → Nghỉ phép → Lịch nghỉ | No visible `seed:` in lý do/ghi chú; seed residue → `—` or omitted | **PASS** |
| 2 | **AC-LEAVE-NOTE-LIST** | → Danh sách yêu cầu | Cột Lý do: no raw `seed:` | **PASS** |
| 3 | **AC-LEAVE-NOTE-PENDING** | → Chờ duyệt | No visible `seed:` | **PASS** |
| 4 | **AC-LEAVE-NOTE-DETAIL** | list/panel detail | No visible `seed:` | **PASS** |
| 5 | **AC-LEAVE-NOTE-SEED-MASKED** | API vs UI | API may retain `seed:…` ENV residue; UI masks | **PASS** |
| 6 | **AC-LEAVE-P3-KEPT** | leave type surface | VI labels / unknown→`—`; no raw `LVT_*` / annual | **PASS** |

---

## L2.5 journey matrix

| J-ID | Surface | Click path | Result |
|------|---------|------------|--------|
| **J-HRM-06** | Attendance leave | `/hr/attendance` → Nghỉ phép → calendar / list / pending / detail | **PASS** · no visible `seed:` · type VI (`Ốm` / `Phép năm`) |

---

## Evidence detail

### Unit (FE)

```text
cwd: apps/web/hrm
pnpm exec vitest run src/lib/labelMaps.test.ts
→ Test Files  1 passed · Tests  21 passed · EXIT=0
```

Covers: `seed:p1-hrm-h16-leave-density` → `—` · `SEED:…` case · `Nghỉ khám bệnh` keep · empty/null → `''` · `resolveLeaveTypeDisplayLabel` unknown→`—` (C-U72-LEAVE-P3 kept).

### Browser (U65)

| Item | Observation |
|------|-------------|
| API | `GET /api/hrm/attendance/leave-requests?company_id=main` · **75** reasons start with `seed:p1-hrm-h16-leave-density` (ENV residue — not mutated) |
| Corroboration | Employee **Vũ Văn An** · API `reason=seed:p1-hrm-h16-leave-density` · UI calendar panel **Ốm** + **—** (no raw seed) |
| List Lý do | Visible samples business/`QA-DIAG-*` or empty omit — **zero** `seed:` cells |
| Type | `Phép năm` / `Ốm` — **no** raw `LVT_02` / `annual` |
| Screenshots | `docs/qa/evidence/screenshots/qa-u72-leave-note-hygiene-01/` · `01-leave-calendar.png` · `02-leave-list.png` · `03-leave-detail.png` · `04-leave-pending.png` |
| Console | `consoleErrors: []` |

### must_keep (not reopened)

| ID | Status |
|----|--------|
| **C-U72-LEAVE-P3** | **PASS kept** — leave type VI / unknown→`—` |
| **C-XBOS-U72-P2** | **not touched** — out of scope this WI |
| **F-09 / F-10 / U02** | **not touched** — no reopen |

---

## Residual

| Item | Class | Note |
|------|-------|------|
| Soft CLOSED maps (P2/P3/F-09/F-10/U02) | LOCK | **Do not reopen** |
| API DB still stores `seed:…` reasons | ENV | Display hygiene only — OK under U65 (no wipe/seed) |
| HOLD_DEPLOY / NOT Phase1/PROD/:8088 | LOCK | Stands |
| Phase1 / PROD / `:8088` | OUT | **NONE** |

---

## completion_report

**Closed:** C-U72-LEAVE-NOTE-HYGIENE product AC — leave list/calendar/pending/detail show no raw `seed:`; API seed residue masked to `—` (calendar corroboration Vũ Văn An). Unit 21 PASS. Leave type VI kept (C-U72-LEAVE-P3). Soft CLOSED maps not reopened. HOLD_DEPLOY stands.

**Residual:** QC gate only — promote local soft residual close; no Dev reopen unless FAIL.

### next_owner

`qc`

### next_dispatch_prompt

```text
work_item_id: QC-U72-LEAVE-NOTE-HYGIENE-01
from_role: pm
to_role: qc
lane: governance · re-gate C-U72-LEAVE-NOTE-HYGIENE after QA PASS
entry_criteria:
  - QA READY_FOR_QC: docs/qa/evidence/qa-u72-leave-note-hygiene-01-20260727.md
  - runtime overall PASS · vitest 21 · harness exit 0
  - must_keep: C-U72-LEAVE-P3 · C-XBOS-U72-P2 · F-09/F-10/U02 — no reopen
  - Prior soft R2 GWC: docs/qa/evidence/qc-u72-soft-p2-01-r2-20260727.md
exit_criteria:
  1) verify:qc:evidence-pack 8/8 on QA MD
  2) Close C-U72-LEAVE-NOTE-HYGIENE (display hygiene) — product PASS corroborated
  3) Evidence docs/qa/evidence/qc-u72-leave-note-hygiene-01-20260727.md · GO or GWC
  4) HOLD_DEPLOY · NOT Phase1/PROD/:8088
cấm: seed · wipe soft CLOSED · Phase1/PROD/:8088 · reopen F-09/F-10/U02
```

### evidence_path

`docs/qa/evidence/qa-u72-leave-note-hygiene-01-20260727.md`

### ack_status

**READY_FOR_QC**

### pm_dispatch_hint

`QC-U72-LEAVE-NOTE-HYGIENE-01` — pack + close leave-note hygiene residual · keep soft CLOSED
