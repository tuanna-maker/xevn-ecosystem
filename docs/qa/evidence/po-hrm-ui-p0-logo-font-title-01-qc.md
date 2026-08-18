# Evidence — `PO-HRM-UI-P0-LOGO-FONT-TITLE-01-QC`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-P0-LOGO-FONT-TITLE-01-QC` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | L3 governance — narrow P0 UI chrome (dialog/AlertDialog white wordmark · html 16px · title-first REC forms) |
| **priority** | P0 chrome seal |
| **portal_url** | `http://127.0.0.1:5173` · HRM embed `/hr/recruitment` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · mutates=**0** |
| **NOT claimed** | remaster program DONE · Face LIVE · product GO · Phase 1 DONE · JD dynamic DONE |
| **face_live** | **false** |
| **remaster_program_done** | **false** |
| **product_go** | **false** |
| **jd_dynamic_done** | **false** |
| **commit (QA cite)** | `dc930c5` |

---

## Verdict summary

**GO WITH CONDITIONS** — narrow P0 UI chrome ACCEPT:

1. **Dialog wordmark** — create-job `[data-testid=xevn-dialog-wordmark]` pad **`rgb(255, 255, 255)`** · `!bg-white` · not black
2. **AlertDialog wordmark** — SoftDel cancel path `[data-testid=xevn-alert-dialog-wordmark]` pad **white** (jobs-delete N/A empty list under U65 — same AlertDialogHeader primitive)
3. **Root font** — `html` / `body` computed **16px** · body weight **500** sharper OBS
4. **Title-first** — create-job · JD template (Tiêu đề before Mã JD) · YCTD (Tiêu đề before JD picker)
5. **Zero mutates** — U65 · cancel/Hủy only

**Conditions** = honesty locks only (deny remaster / face / product / Phase 1 / JD dynamic DONE). **No product P0 residual** on this chrome slice → **idle-ok** for P0 lane. Sponsor JD confirm = separate wave.

---

## Entry audit (QA + FE packs)

| Seat | Evidence | ack | QC |
|------|----------|-----|-----|
| Dev-FE READY | `docs/qa/evidence/po-hrm-ui-p0-logo-font-title-01.md` | READY_FOR_QA | **ACCEPT** scope note · SURFACE CSS + title reorder cited |
| QA browser U65 | `docs/qa/evidence/po-hrm-ui-p0-logo-font-title-01-qa.md` | PASS_TO_PM · verdict **PASS** · 6/6 AC | **ACCEPT** |

### Machine log

| Artifact | Present | Verdict |
|----------|---------|---------|
| `docs/qa/evidence/_tmp-po-hrm-ui-p0-logo-font-title-01-qa.FINAL.json` | ✅ | `verdict: PASS` · `failReasons: []` · all AC `pass: true` · `mutates.count: 0` · honesty remaster/seed/jd_drag false |

### Screenshots (disk)

| File | QC spot |
|------|---------|
| `docs/qa/evidence/screens/po-hrm-ui-p0-logo-font-title-01-qa/00-jobs-shell.png` | ✅ present |
| `docs/qa/evidence/screens/po-hrm-ui-p0-logo-font-title-01-qa/01-create-job-dialog.png` | ✅ **Tiêu đề** first + focused · dialog chrome wordmark present |
| `docs/qa/evidence/screens/po-hrm-ui-p0-logo-font-title-01-qa/02-alert-delete-confirm.png` | ✅ SoftDel AlertDialog · **Hủy** path · wordmark present (cancel only) |
| `docs/qa/evidence/screens/po-hrm-ui-p0-logo-font-title-01-qa/03-jd-template-create.png` | ✅ **Tiêu đề** before Mã JD · focused |
| `docs/qa/evidence/screens/po-hrm-ui-p0-logo-font-title-01-qa/04-yctd-create.png` | ✅ present (title-first machine-locked) |

---

## AC matrix (chrome seal)

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | Create-job wordmark pad white `rgb(255,255,255)` | **PASS** | FINAL JSON `create_job_wordmark_white` · PNG 01 |
| 2 | AlertDialog wordmark white pad | **PASS** | FINAL JSON `alert_dialog_wordmark_white` · path `employees-softdel-cancel` · PNG 02 |
| 3 | `html` font-size **16px** | **PASS** | FINAL JSON `root_font_16px` · `effectivePx: 16` |
| 4a | Create-job title-first | **PASS** | `create_job_title_first` · first label Tiêu đề · `rec-job-form-title` |
| 4b | JD template title-first before Mã JD | **PASS** | `jd_template_title_first` · PNG 03 |
| 4c | YCTD title-first before JD picker | **PASS** | `yctd_title_first` · `titleBeforeJd: true` |
| 5 | Zero mutates U65 | **PASS** | `zero_mutates.count: 0` |
| — | remaster / face / product / Phase1 / JD dynamic DONE | **Denied** | locks false |

**Score:** 6/6 in-scope AC **PASS**.

---

## L2.5 J-* audit (U19 — chrome slice only)

| Journey | Scope vs this seal | QC |
|---------|-------------------|-----|
| **J-HRM-05** Tuyển dụng | Open create-job / JD / YCTD dialogs chrome + title-first (mutates=0 · Hủy) | **PASS** (chrome slice) · **not** job/JD/YCTD CRUD mutate promote |
| **J-HRM-02** Nhân sự SoftDel AlertDialog | Wordmark white pad · cancel only | **PASS** (AlertDialog chrome) · **not** employee delete promote |
| Other J-* HRM/CC/mobile | Out of scope this seal | **deferred** — not claimed |

Mandatory for this gate: chrome ACs above + honesty denials. **Not** invent product GO / remaster DONE / Face LIVE / Phase 1 DONE / JD dynamic DONE.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Dialog + AlertDialog white SURFACE pad ACCEPT; html 16px ACCEPT; title-first job/JD/YCTD ACCEPT; mutates=0 |
| **PROCESS** | QA seat pack `verify:qc:evidence-pack` **FAIL 1/8** `journey_l25` missing — OBS only; this QC consolidated pack carries J-* matrix (same pattern as login-dialog / brand W3–W4 chrome seals) |
| **ENV** | Portal `:8088` ECONNREFUSED cited by QA — non-blocking (`:5173` BASE **200**) |
| **OUT-OF-SCOPE** | Remaster program · Face LIVE · product GO · Phase 1 DONE · JD TopCV drag builder · Portal ConfirmDialog live open (FE parity cited; QA exercised HRM Dialog+AlertDialog) · job-delete AlertDialog (empty jobs list) |

ENV does not drive NO-GO. Process journey_l25 seat-pack gap ≠ product demote when QC consolidates J-*.

---

## Residual

| Id | Status | Sev | Owner | Blocks chrome GWC? |
|----|--------|-----|-------|--------------------|
| Dialog / AlertDialog white pad | **CLOSED** | — | — | No |
| html 16px + body 500 | **CLOSED** | — | — | No |
| Title-first job/JD/YCTD | **CLOSED** | — | — | No |
| Jobs-list delete AlertDialog not opened | OBS (empty list U65) — SoftDel primitive verified | P3 | — | No |
| Portal ConfirmDialog browser open | OBS deferred (FE source parity) | P3 | optional QA if CC confirm wave | No |
| QA pack journey_l25 field | PROCESS OBS | P3 | qa format next chrome seat | No |
| remaster / face / product / Phase1 / JD dynamic | — | — | — | **not claimed** |

**No residual product P0/P1** for this chrome wave → **idle-ok**.

---

## Conditions (explicit)

1. **NOT remaster_program_done** — remains false.
2. **NOT face_live** — remains false.
3. **NOT product GO**.
4. **NOT Phase 1 DONE**.
5. **NOT JD dynamic DONE** — sponsor confirm / BA–SA wave separate.
6. U65 zero-seed · mutates=0 · observe-only · no invent creative beyond sponsor white pad.
7. Scope bounded to dialog/AlertDialog wordmark pad + root 16px + title-first REC create forms only.

---

## Case / journey matrix (read-only chrome)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** | portal `:5173` / hrm / xbos | **PASS** | QA L0 200 |
| **READ** J-HRM-05 dialog chrome | white wordmark · title-first · Hủy | **PASS** | QA FINAL + PNGs 01/03/04 |
| **READ** J-HRM-02 AlertDialog chrome | white wordmark · SoftDel cancel | **PASS** | QA FINAL + PNG 02 |
| CREATE job / JD / YCTD mutate | Out of scope | **not claimed** | mutates=0 |
| JD dynamic TopCV drag | Out of scope | **not claimed** | honesty false |
| remaster / face / product / Phase1 | Forbidden | **not claimed** | flags false |

---

## Forbidden compliance (QC)

- No seed (U65)
- No rewrite `apps/**`
- Did **not** invent remaster DONE / Face LIVE / product GO / Phase 1 DONE / JD dynamic DONE
- Did open FE MD + QA MD + FINAL JSON + screenshot spot-check (01–03)
- Did **not** GO clean without honesty residual — **GWC** for deny locks

---

## Evidence-pack gate

### QA pack (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-p0-logo-font-title-01-qa.md
→ FAIL process 1/8 · journey_l25 missing — PROCESS OBS only (product browser independently verified via FINAL JSON + PNGs)
```

Seat pack format gap ≠ product NO-GO; this QC consolidated pack carries J-* matrix.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-p0-logo-font-title-01-qc.md
→ PASS exit 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-p0-logo-font-title-01-qc.md --check-assets
→ PASS exit 0 · 5 PNG refs OK
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| Disk read FE MD | **PASS** · SURFACE CSS + title reorder scope |
| Disk read QA MD + FINAL JSON | **PASS** · verdict PASS · 6/6 AC · mutates=0 |
| PNG disk presence (5 cited) | **PASS** |
| Visual spot create-job title-first | **PASS** |
| Visual spot SoftDel AlertDialog cancel | **PASS** |
| Visual spot JD template title before Mã JD | **PASS** |
| `verify:qc:evidence-pack` QA seat | **FAIL process** journey_l25 — OBS |
| `verify:qc:evidence-pack` QC pack + `--check-assets` | **PASS** 8/8 · 5 PNG OK |
| QC observe-only `apps/**` | **PASS** · no code touch |

---

## completion_report

- **Closed:** Narrow P0 UI chrome seal — dialog/AlertDialog wordmark white SURFACE pad; html **16px**; title-first create-job + JD template + YCTD; mutates=0; GWC with honesty denials.
- **Open / residual:** QA pack `journey_l25` PROCESS OBS; jobs-delete AlertDialog not opened (empty list — SoftDel primitive OK); Portal ConfirmDialog live open optional P3.
- **Denied:** remaster_program_done · face_live · product GO · Phase 1 DONE · JD dynamic DONE.
- **Locks honored:** U65 · no invent · mutates=0 · observe-only.

**next_owner:** `pm`  
**ack_status:** `PASS_TO_PM`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-P0-LOGO-FONT-TITLE-01-QC (intake)
role: pm
QC stamp: GO WITH CONDITIONS — docs/qa/evidence/po-hrm-ui-p0-logo-font-title-01-qc.md
Closed: dialog/AlertDialog wordmark white rgb(255,255,255) · html 16px · title-first job/JD/YCTD · mutates=0
Denied: remaster_program_done · face_live · product GO · Phase 1 DONE · JD dynamic DONE
Residual product P0: none → idle-ok for this P0 chrome lane
Sponsor JD confirm / JD dynamic TopCV = separate BA/SA wave — do not invent DONE from this seal
Optional P3: QA add journey_l25 line on next chrome seat pack (process format only)
```
