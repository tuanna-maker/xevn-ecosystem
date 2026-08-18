# Evidence — PO-HRM-MVP-GD1-REC-00-CLUSTER-FE-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-00-CLUSTER-FE-02` |
| **role** | dev-fe · execution |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` · **U89** Wave-5 seat #7 |
| **date** | 2026-08-09 |
| **uc_ids** | `UC-BP-REC-00` |
| **depends_on** | QA-01 **FAIL** `R-REC-00-FE-COMMENT-ASTERISK` · `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-qa-01.md` |
| **ack_status** | **READY_FOR_QA** |
| **change_mode** | FIX · preserve_default · CODE-MEMORY APPEND |
| **honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE** · DENY flip |
| **U65** | zero-seed — browser FE only |

---

## 1. spec_read_ack

```markdown
## spec_read_ack
- srs: UC-BP-REC-00 · Thư viện JD J-HRM-REC-JD-00-01..04
- qa residual: R-REC-00-FE-COMMENT-ASTERISK — CODE-MEMORY `PUB-*/CODE-DUP` closes block comment
- fe-01 retain: chips / Phát hành / Ngừng · physical `/recruitment/job-templates`
- sponsor_confirm: narrow FIX only · DENY honesty/seed/Nest /rec dual
```

| Artifact | Ack |
|----------|-----|
| **QA-01** | P0 whitescreen on `/hr/recruitment` — Vite SWC 500 from premature `*/` |
| **FE-01** | RETAIN status chips, publish, soft Ngừng, toast via `toErrorMessage` |
| **API-01** | No contract change — toast codes still PUB-* / CODE-DUP / YCTD-STATUS |

---

## 2. Closed scope

| Item | Status |
|------|--------|
| Escape CODE-MEMORY toast codes: `PUB-* / CODE-DUP / YCTD-STATUS` (space around `/`) | ✅ |
| FE-02 `@CODE-MEMORY-CHANGE` APPEND (no `*/` literal in prose) | ✅ |
| Source lock: reject `PUB-*/CODE-DUP` pattern | ✅ |
| Vite transform `JobTemplatesTab.tsx` **200** | ✅ |
| Vite transform `Recruitment.tsx` **200** (dynamic import unblocked) | ✅ |
| FE-01 vitest suite regression | ✅ **66 PASS** |
| Honesty / seed / Nest `/rec` dual | **DENY** — untouched |

**Out of scope (QA-02):** full U65 browser UF J-HRM-REC-JD-00-01..04 mutate/publish/CODE-DUP toast (FE only unblocked mount).

---

## 3. Diff (narrow)

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/recruitment/JobTemplatesTab.tsx` | FE-01 line: `PUB-*/CODE-DUP` → `PUB-* / CODE-DUP`; APPEND FE-02 CHANGE |
| `apps/web/hrm/src/components/recruitment/JobTemplatesTab.source.test.ts` | Lock against premature `PUB-*/CODE-DUP` |

**must_keep retained:** FE-01 chips / publish / Ngừng · physical `/recruitment/job-templates` · HDSD testids · DENY `/rec` · seed · honesty.

---

## 4. Verification

| Check | Result |
|-------|--------|
| First `*/` in file closes header before `import` | ✅ `first_star_slash_at` &lt; `import_at` |
| `PUB-*/CODE-DUP` absent | ✅ |
| `pnpm --dir apps/web/hrm exec vitest run` (6 files JD suite) | ✅ **66 PASS** |
| `GET http://127.0.0.1:5173/hr/src/components/recruitment/JobTemplatesTab.tsx` | ✅ **200** · transformed ESM · no parse error |
| `GET http://127.0.0.1:5173/hr/src/pages/Recruitment.tsx` | ✅ **200** |

---

## 5. Residual / honesty

| Item | Note |
|------|------|
| Browser U65 J-HRM-REC-JD-00-01..04 | **QA-02** — FE mount unblocked; UF business not claimed here |
| `recruitment_uat_ready` / `jd_dynamic_done` | remain **false** · C-SLICE |

---

## 6. Handoff

- **ack_status:** `READY_FOR_QA`
- **next_owner:** `qa`
- **next_work_item_id:** `PO-HRM-MVP-GD1-REC-00-CLUSTER-QA-02`
- **evidence_path:** `docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-fe-02.md`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-REC-00-CLUSTER-QA-02
lane: execution · qa
uc_ids: UC-BP-REC-00
depends_on: FE-02 READY_FOR_QA · R-REC-00-FE-COMMENT-ASTERISK fixed · BE-01 LIVE
entry_criteria: U65 zero-seed · browser-only · L0 stack up · portal :5173
MISSION: Retest J-HRM-REC-JD-00-01..04 on /hr/recruitment?tab=jd-library — assert Thư viện JD mounts (no whitescreen); chips Nháp/Hiệu lực/Ngừng; create Nháp; Phát hành POST …/publish; soft Ngừng; CODE-DUP 409 toast path; Network /recruitment/job-templates only; DENY Nest /rec · seed · honesty flip
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-00-cluster-qa-02.md · PASS_TO_PM or FAIL with residual
cấm: seed · API-only UF PASS · claim recruitment_uat_ready
```
