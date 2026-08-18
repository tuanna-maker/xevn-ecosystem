# Evidence — `PO-HRM-UI-LOGIN-DIALOG-QC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-LOGIN-DIALOG-QC-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | L3 governance — narrow chrome seal (login logo white pad + create-job dialog center) |
| **priority** | P0 chrome seal |
| **portal_url** | `http://127.0.0.1:5173` |
| **Verdict** | **GO WITH CONDITIONS** |
| **ack_status** | `PASS_TO_PM` |
| **U65** | zero-seed · QC observe-only · no `apps/**` · mutates=**0** |
| **OS lock cited** | `_vibe-team-os/35-NO-UNSOLICITED-CREATIVE.md` (no invent; white bg sponsor-confirmed) — **disk file not present** → PROCESS OBS only |
| **NOT claimed** | remaster program DONE · Face LIVE · product GO · Phase 1 DONE |
| **face_live** | **false** |
| **remaster_program_done** | **false** |
| **product_go** | **false** |

---

## Verdict summary

**GO WITH CONDITIONS** — narrow chrome wave ACCEPT:

1. **LOGO-02** — portal login mark white pad ~112px (`bg-white`, computed `rgb(255,255,255)`, attr 112 / class `h-28`) · card wordmark white · login POST **201** → `/command-center`
2. **DIALOG-CENTER-01-R2** — CC embed recruitment **Tạo tin tuyển dụng mới** dialog `position:fixed` · `overflowY:auto` · `vCenterDelta=0` · scroll inside · Escape closes · **DEF-DIALOG-CENTER-CSS-OVERRIDE CLOSED**

**Conditions** = honesty locks only (deny remaster / face / product / Phase 1). **No product P0 residual** on this chrome slice → **idle-ok**.

---

## Entry audit (QA packs)

| Seat | Evidence | ack (seat) | QC |
|------|----------|------------|-----|
| LOGO-02 | `docs/qa/evidence/po-hrm-ui-portal-login-logo-02.md` | FAIL_TO_PM on **combined** wave (dialog R1 FAIL); ACs 1–3 logo **PASS** | **ACCEPT** logo scope; dialog superseded by R2 |
| DIALOG-CENTER-01-R2 | `docs/qa/evidence/po-hrm-ui-dialog-center-01-r2.md` § QA retest R2 | **PASS_TO_PM** · matrix 5/5 | **ACCEPT** · DEF CLOSED |

Honesty: LOGO-02 MD correctly did **not** promote dialog while R1 FAIL. R2 QA supersedes dialog FAIL; combined wave seal uses **both** packs.

### Machine logs

| Artifact | Present | Verdict |
|----------|---------|---------|
| `_tmp-po-hrm-ui-login-logo-dialog-center-qa.json` | ✅ | LOGO AC1/pad/login **PASS**; AC2 dialog **FAIL** (R1 — historical) |
| `_tmp-po-hrm-ui-dialog-center-01-r2-qa.json` | ✅ | `verdict: PASS` · `vCenterDelta: 0` · `position: fixed` · `overflowY: auto` |

### Screenshots (disk)

| File | QC spot |
|------|---------|
| `docs/qa/evidence/screens/po-hrm-ui-login-logo-dialog-center-01/01-login-mark-white-pad-112.png` | ✅ present |
| `docs/qa/evidence/screens/po-hrm-ui-login-logo-dialog-center-01/01b-login-mark-crop.png` | ✅ white pad · XeVN mark (QC visual) |
| `docs/qa/evidence/screens/po-hrm-ui-dialog-center-01-r2/01-job-create-dialog.png` | ✅ present |
| `docs/qa/evidence/screens/po-hrm-ui-dialog-center-01-r2/02-qa-job-create-dialog.png` | ✅ centered under dim overlay (QC visual) |
| `docs/qa/evidence/screens/po-hrm-ui-dialog-center-01-r2/03-qa-dialog-scrolled-actions.png` | ✅ present |

---

## AC matrix (chrome seal)

| # | AC | Result | Evidence |
|---|-----|--------|----------|
| 1 | Login mark ≈112 + **white** pad (not black) | **PASS** | LOGO-02 AC1 · JSON `AC1_login_mark_pad_white` · crop PNG |
| 2 | Card wordmark pad white | **PASS** | LOGO-02 AC2 · `!bg-white` |
| 3 | Login works | **PASS** | POST `/api/xbos/auth/login` **201** |
| 4 | Create-job dialog vertically centered in CC embed | **PASS** | R2 QA · `vCenterDelta=0` · bbox `y=45` on vh=900 |
| 5 | Dialog `position:fixed` + scroll inside + Escape | **PASS** | R2 JSON checks |
| — | remaster_program_done / face_live / product GO / Phase 1 DONE | **Denied** | locks false |

---

## L2.5 J-* audit (U19 — chrome slice only)

| Journey | Scope vs this seal | QC |
|---------|-------------------|-----|
| **J-CC-01** Login tập đoàn | Logo white pad + login 201 → CC | **PASS** (chrome slice) · not full journey re-promote |
| **J-HRM-05** Tuyển dụng | Open create-job dialog geometry + Escape (mutates=0) | **PASS** (dialog chrome) · **not** job CRUD mutate promote |
| Other J-* HRM/CC/mobile | Out of scope this seal | **deferred** — not claimed |

Mandatory for this gate: chrome ACs above + honesty denials. **Not** invent product GO / remaster DONE / Face LIVE / Phase 1 DONE.

---

## Classification

| Class | Items |
|-------|-------|
| **PRODUCT** | Login white pad ~112 ACCEPT; create-job dialog fixed+centered ACCEPT; DEF-DIALOG-CENTER-CSS-OVERRIDE **CLOSED** |
| **PROCESS** | OS path `_vibe-team-os/35-NO-UNSOLICITED-CREATIVE.md` cited by entry but **missing on disk** — OBS only (creative invent not observed in QA packs; white pad sponsor-confirmed in shared-lessons + LOGO-02) |
| **ENV** | None blocking — portal/hrm/xbos L0 **200** cited in LOGO-02 |
| **OUT-OF-SCOPE** | Remaster program · Face LIVE · product GO · Phase 1 DONE · job create mutate · attendance · payslip |

ENV does not drive NO-GO. Process OS-file gap ≠ product demote.

---

## Residual

| Id | Status | Sev | Owner | Blocks chrome GWC? |
|----|--------|-----|-------|--------------------|
| LOGO-02 white pad ~112 | **CLOSED** | — | — | No |
| DEF-DIALOG-CENTER-CSS-OVERRIDE | **CLOSED** (R2) | — | — | No |
| Combined LOGO+DIALOG R1 FAIL | **CLOSED** by R2 retest | — | — | No |
| OS ch.35 file on disk | OPEN OBS | P3 | devops/pm optional bootstrap | No |
| remaster / face / product / Phase1 | — | — | — | **not claimed** |

**No residual product P0/P1** for this chrome wave → **idle-ok**.

---

## Conditions (explicit)

1. **NOT remaster_program_done** — remains false.
2. **NOT face_live** — remains false.
3. **NOT product GO**.
4. **NOT Phase 1 DONE**.
5. U65 zero-seed · mutates=0 · no invent creative beyond sponsor white pad.
6. Scope bounded to login logo pad+size + CC embed create-job dialog center only.

---

## Case / journey matrix (read-only chrome)

| Case / Journey | AC | Result | Evidence |
|----------------|-----|--------|----------|
| **L0** | portal/hrm/xbos | **PASS** | LOGO-02 L0 200 |
| **LOGIN** J-CC-01 chrome | white pad ~112 · 201 → CC | **PASS** | LOGO-02 + PNGs |
| **READ** J-HRM-05 dialog chrome | fixed + centered + scroll + Escape | **PASS** | R2 QA + PNGs |
| CREATE job mutate | Out of scope | **not claimed** | mutates=0 |
| remaster / face / product / Phase1 | Forbidden | **not claimed** | flags false |

---

## Forbidden compliance (QC)

- No seed (U65)
- No rewrite `apps/**`
- Did **not** invent remaster DONE / Face LIVE / product GO / Phase 1 DONE
- Did **not** invent creative (gradient/black pad) — white pad only per sponsor
- Did open both QA MDs + both JSON harnesses + screenshot spot-check
- Did **not** GO clean (zero honesty residual) — GWC for deny locks

---

## Evidence-pack gate

### QA packs (entry)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-portal-login-logo-02.md
→ FAIL process 1/8 · journey_l25 missing — PROCESS OBS only (product browser independently verified)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-dialog-center-01-r2.md
→ FAIL process 1/8 · journey_l25 missing — PROCESS OBS only
```

Seat pack format gap ≠ product NO-GO; this QC consolidated pack carries J-* matrix.

### QC pack (this file)

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-login-dialog-qc-01.md
→ PASS exit 0 (8/8)
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-ui-login-dialog-qc-01.md --check-assets
→ PASS exit 0 · 5 PNG refs OK
```

---

## Command table (QC independent)

| Command | Result |
|---------|--------|
| Disk read LOGO-02 MD + JSON | **PASS** · white pad ACs PASS · dialog R1 FAIL historical |
| Disk read DIALOG-CENTER-01-R2 MD + QA JSON | **PASS** · verdict PASS · vCenterDelta 0 |
| PNG disk presence (5 cited) | **PASS** |
| Visual spot crop logo white pad | **PASS** |
| Visual spot R2 create-job dialog centered | **PASS** |
| `node scripts/qa/_tmp-po-hrm-ui-dialog-center-01-r2-qa.mjs` (cited by QA) | **PASS** exit 0 |
| QC observe-only `apps/**` | **PASS** · no code touch |

---

## completion_report

- **Closed:** Narrow chrome seal — LOGO-02 white pad ~112 + DIALOG-CENTER-01-R2 fixed/centered create-job in CC embed; DEF-DIALOG-CENTER-CSS-OVERRIDE CLOSED; GWC stamped with honesty denials.
- **Open / residual:** OS ch.35 file missing on disk (P3 process OBS only). No product P0.
- **Denied:** remaster_program_done · face_live · product GO · Phase 1 DONE.
- **Locks honored:** U65 · no invent · mutates=0 · observe-only.

**next_owner:** `pm`  
**ack_status:** `PASS_TO_PM`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-LOGIN-DIALOG-QC-01 (intake)
role: pm
QC stamp: GO WITH CONDITIONS — docs/qa/evidence/po-hrm-ui-login-dialog-qc-01.md
Closed: LOGO-02 white pad ~112 · DIALOG-CENTER-01-R2 centered create-job · DEF CSS override CLOSED
Denied: remaster_program_done · face_live · product GO · Phase 1 DONE
Residual product P0: none → idle-ok for this chrome lane
Optional P3: bootstrap _vibe-team-os/35-NO-UNSOLICITED-CREATIVE.md if OS inventory requires (does not reopen chrome)
Do not invent remaster/product GO from this seal.
```
