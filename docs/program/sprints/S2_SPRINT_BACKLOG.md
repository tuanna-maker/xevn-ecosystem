# Sprint S2 — Backlog & execution plan

**Sprint goal (G2):** 104 XBOS UC → `e2e_pass` (khối A Command Center + capability registry).  
**Program gate:** `pnpm run verify:capabilities` + QC **P1-S2-QC-01** GO khối A.  
**S1 carry-over (TM C1–C5):** xem `docs/qa/evidence/p1-s1-tm-01-review-20260524.md`.

**Active from:** 2026-05-24 · **Unlock:** `P1-S1-PM-02` done · **Retro S1:** `S1_RETRO.md`

---

## Burn-down (program)

| Metric | Start S2 | Target end S2 |
|--------|----------|----------------|
| XBOS UC `e2e_pass` | ~15 | **104** |
| UC `planned` (program) | 111 | **< 80** (realistic) |
| `verify:capabilities` | fail path | **exit 0** |

> **Thẳng thắn:** 104 e2e trong một sprint chỉ khả thi nếu wave automation + waived matrix rõ; PM track hàng tuần, không claim Phase 1 DONE.

---

## Sprint backlog (ordered)

> **Operating model:** `docs/program/TEAM_OPERATING_MODEL.md` — BA/SA **governance only** (SRS/TechSpec đã có).

| Wave | ID | Role | Mode | Deliverable | DoD / evidence |
|------|-----|------|------|-------------|----------------|
| W0 | **P1-S2-PM-01** | PM | — | Planning + bus | Done |
| W0 | **P1-S2-SA-01** | SA | **gov** | ADR C2 `main`↔`holding` | ADR file; **then SA idle** |
| W1 | **P1-S2-FE-01** | Dev-FE | **build** | ACTION_BUTTON → API | vitest + capability slice |
| W1 | **P1-S2-BE-WAVE-01** | Dev-BE | **build** | XBOS e2e wave | jest; ↓ `planned` |
| W1 | **P1-S2-BA-GOV-01** | BA | **gov** | *Chỉ nếu* QA mở `spec_gap`* | Delta AC / matrix rows |
| W2 | **P1-S2-QA-01** | QA | **verify** | capabilities + L2 CC | `p1-s2-qa-01-*.md` |
| W2 | **P1-S2-TM-01** | TM | **gov** | Security CC publish | `p1-s2-tm-01-*.md` |
| W3 | **P1-S2-QC-01** | QC | gate | Khối A GO/GWC | evidence MD |
| W3 | **P1-S2-PM-02** | PM | — | Retro + unlock S3 | `S2_RETRO.md` |

**Deferred (no trigger):** ~~P1-S2-BA-P-01 full CAT pack~~ — matrix đã có; BA vào khi `verify:capabilities` / defect chỉ rõ gap.

---

## Parallel lanes (max 3 Task — thực tế)

```
W1:  Dev-FE-01 ‖ Dev-BE-WAVE-01 ‖ QA (prep scripts)
W2:  QA-01 ‖ TM-01
W3:  QC-01 → PM-02
SA/BA: on-demand (defect hoặc TM condition) — không xếp full parallel W1
```

---

## Commands (evidence — agent chạy)

```bash
pnpm run qc:dev-stack
pnpm run qc:fe-be-health:pilot
pnpm run verify:capabilities
pnpm run test:uc:catalog
pnpm run phase1:gate
pnpm run sprint:pulse S2
```

---

## Out of scope S2

- HRM 119 UC full sign-off → **S3**
- 183 DM publish → **S4**
- Production deploy → **S5**

---

## PM next dispatch (live)

Cập nhật tại `PHASE1_SPRINT_RUNNER.json` → `next_dispatch`. Đọc `docs/program/SPRINT_STATUS_AT_A_GLANCE.md` mỗi phiên.
