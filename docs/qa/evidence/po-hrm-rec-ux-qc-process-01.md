# Evidence — `PO-HRM-REC-UX-QC-PROCESS-01`

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-HRM-REC-UX-QC-PROCESS-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **date** | 2026-08-06 |
| **lane** | Governance — **process honesty** (no product re-test / no product GO) |
| **priority** | P0 (sponsor trust / process) |
| **portal_url** | `http://127.0.0.1:5173` · HRM embed `/hr` · recruitment surfaces (sponsor session) |
| **Verdict** | **NO-GO (process)** — recruitment **not** UAT-ready; prior JD QC-01 **does not** certify module |
| **ack_status** | `PASS_TO_PM` |
| **sponsor_challenge** | «rất nhiều vấn đề, QA QC kiểu gì thế? có làm đúng quy trình không?» |
| **console_log** | [`sponsor-console-20260806-recruitment.log`](sponsor-console-20260806-recruitment.log) · **2659** lines |
| **prior_qc** | [`po-hrm-jd-dynamic-qc-01.md`](po-hrm-jd-dynamic-qc-01.md) · **GWC** on narrow `J-HRM-JD-01..03` + G4 only |
| **U65** | observe-only · no `apps/**` · no seed · **no re-dispatch Dev** (FE-01 + BA already in flight) |
| **jd_dynamic_done** | **false** |
| **remaster_program_done** | **false** |
| **product_go** | **false** |
| **recruitment_uat_ready** | **false** |

---

## Verdict summary

**NO-GO (process honesty).** Prior `PO-HRM-JD-DYNAMIC-QC-01` **GO WITH CONDITIONS** was a **bounded L2.5 slice** (Settings rules + create JD + snapshot + wave Xem + G4). It **does NOT** certify:

- Recruitment module **usable** end-to-end («chạy được»)
- Console-clean JD design surface
- Interview Schedule UX / locale (UTF-8 Vietnamese)
- Shell chrome (duplicate CC header) outside the JD wave

Sponsor console evidence on JD design shows **@hello-pangea/dnd** drag-handle invariant storm (**192** «Unable to find any drag handles» + **192** «Unable to find drag handle» = **384** class hits) plus **14** JS `ReferenceError` throws (`getDialogPortalContainer` ×11 · `LayoutDashboard` ×3). Interview Schedule dialog reported **mojibake** (UTF-8 broken Vietnamese) = **P0 FAIL** class. Duplicate CC header and «JD chả làm được gì» remain sponsor-visible P0 class defects.

This seat issues **process FAIL** against over-reading GWC as module acceptance. **No** product GO · **no** remaster · **no** `jd_dynamic_done`.

---

## Explicit disclaimer — prior QC-01

| Claim | Allowed by QC-01 text? | Sponsor expectation «chạy được» | QC process stamp |
|-------|------------------------|----------------------------------|------------------|
| J-HRM-JD-01..03 + G4 mutate/F5 slice GWC | Yes (narrow) | Implied full JD/recruitment OK | **MISREAD RISK** — wording honesty existed but **scope silence** vs UX |
| Console-clean JD writer / DnD interactive | **No** — QC-01 marked optional DnD as OBS, not exercised | Yes | **L2.5 incomplete** |
| Interview schedule locale vi-VN | **No** — out of pack | Yes (UF missing) | **Missing UF** |
| Shell single header (no duplicate CC) | **No** — outside JD wave | Yes | **Missing UF / shell P0** |
| Recruitment UAT-ready / product GO | **Denied** in QC-01 honesty flags | Often conflated with GWC | **Scope creep silence** if PM/comms promote GWC as «xong tuyển dụng» |

**Hard rule for PM/comms:** Cite QC-01 only as *«JD-dynamic CFG/create/snapshot L2.5 GWC»* — **never** as recruitment usable / console-clean / interview UX certified.

---

## Process gap classes

| # | Class | Finding | Severity |
|---|-------|---------|----------|
| 1 | **L2.5 incomplete** | Create JD + snapshot PASS without **DnD interaction** PASS; DnD left as «optional OBS» while writer surface storms **384** drag-handle invariants in sponsor console | **P0 process** |
| 2 | **Scope creep silence** | GWC wording correctly denied `jd_dynamic_done` / product GO, but journey map stamp + idle-ok tone did not prevent sponsor reading «QA/QC đã OK» as module runnable | **P0 process / comms** |
| 3 | **Missing UF — interview schedule locale** | No UF/J-* in JD or REC wave for Interview Schedule dialog UTF-8 / vi-VN labels; mojibake = product P0 unseen by prior gate | **P0 product (unscoped)** |
| 4 | **Missing UF — shell duplicate header** | Duplicate CC / Command Center strip outside JD-dynamic allowed_paths; not in QC-01 in-scope J-* | **P0 product (unscoped)** |
| 5 | **Console invariant ignored** | QA runtime `pageErrors=[]` can PASS while `@hello-pangea/dnd` invariant spam floods console — gate did not FAIL on storm | **P0 process** |

---

## Console / sponsor evidence audit (observe)

| Signal | Count / note | Class | Gate impact |
|--------|--------------|-------|-------------|
| Log lines | **2659** | PRODUCT surface noise | Supports NO-GO process |
| `Unable to find any drag handles` | **192** | PRODUCT · DnD | QA must FAIL storm |
| `Unable to find drag handle` (invariant) | **192** | PRODUCT · DnD | (= **384** DND class) |
| `getDialogPortalContainer is not defined` | **11** | PRODUCT · JS_THROW | P0 |
| `LayoutDashboard is not defined` | **3** | PRODUCT · JS_THROW | P0 |
| JS throw class total | **~14** | PRODUCT | P0 |
| Interview Schedule mojibake | Sponsor screenshot (UTF-8 broken VI) | PRODUCT · locale | **P0 FAIL** |
| Duplicate CC header | Prior sponsor | PRODUCT · shell | **P0** |
| JD «chả làm được gì» | Prior sponsor | PRODUCT / UX | Aligns with DnD broken |

**ENV:** not the driver — portal `:5173` was up; defects are **PRODUCT** on tested/adjacent recruitment surfaces.

---

## L2.5 / journey honesty matrix

| Journey / UF | Prior QC-01 | Process honesty (this seat) |
|--------------|-------------|-------------------------------|
| **J-HRM-JD-01** Settings field + rules | **PASS** (mutate+F5) | Keep as **slice-only**; does not clear console/DnD |
| **J-HRM-JD-02** create + snapshot | **PASS** (create path; DnD optional OBS) | **FAIL process completeness** — DnD interaction required for «usable writer» |
| **J-HRM-JD-03** wave Xem | **PASS scoped** | OK scoped; YCTD attach still deferred |
| **G4** pack confirm | **PASS** | Slice-only |
| Interview Schedule locale UF | **not in pack** | **FAIL missing UF** · mojibake P0 |
| Shell single-header UF | **not in pack** | **FAIL missing UF** · duplicate header P0 |
| Recruitment UAT-ready | Denied | **FAIL** · **NO-GO** |

Journey matrix (process): incomplete L2.5 on DnD = **FAIL** for sponsor «chạy được» bar.

---

## Classification

| Class | Items |
|-------|-------|
| **PROCESS** | Prior GWC over-read as module OK · L2.5 without DnD · missing UF interview/shell · console storm not FAIL · this pack **NO-GO process** |
| **PRODUCT** | DnD 384 invariants · JS_THROW ×14 · mojibake interview · duplicate header · JD writer unusable perception — owners **already in flight** (FE-01), not re-dispatched here |
| **ENV** | None blocking honesty verdict (stack was reachable for sponsor log) |
| **OUT-OF-SCOPE this seat** | Full browser re-test product · Dev code · BA YCTD merge · claiming remaster/`jd_dynamic_done` |

---

## Gate rule update recommendation (short)

PM/QA/QC should ADD (rule or QA browser gate checklist):

1. **Console invariant storm = FAIL** — on the **tested surface**, if `@hello-pangea/dnd` / React invariant / same message class repeats at high volume (e.g. ≥10 identical invariant lines), QA **must FAIL** even if Network 2xx and `pageErrors` harness misses them.
2. **UTF-8 mojibake on user-visible VI copy = P0 FAIL** — interview/schedule/dialog labels; not OBS.
3. **Duplicate shell / CC brand header = P0 FAIL** — chrome integrity; not defer as «outside wave» when sponsor path includes that shell.
4. **GWC must list explicit NON-CERTIFIED surfaces** in the verdict title line (e.g. «GWC J-HRM-JD-01..03 only — NOT recruitment UAT / NOT DnD / NOT interview»).
5. **L2.5 for DnD writers** — create+save alone insufficient; require at least one drag (or documented DnD blocked + FAIL) before PASS «writer usable».

Suggested rule touch (PM governance, not this QC seat): `.cursor/rules/qa-fe-outside-browser-gate.mdc` + `qc-evidence-pack-gate.mdc` § console/locale/shell P0; optional KB entry after FE-01 retest.

---

## Residual (owners — do **not** re-dispatch Dev)

| Id | Status | Sev | Owner | Note |
|----|--------|-----|-------|------|
| **PO-HRM-UI-HEADER-JD-DND-FE-01** | IN_FLIGHT / READY_FOR_QA (expanded) | P0 | **dev-fe → qa** | header + DnD + mojibake (+ portal refs) — **already owned** |
| **PO-HRM-JD-YCTD-REF-SPEC-01** | PASS_TO_PM (spec) / sponsor confirm | P1 process | **ba-process → ba-docs** after confirm | Spec-first; **no code** |
| Prior QC-01 soft OBS (IT catalog / Driver preview) | OPEN soft | P2/P3 | catalog / fe optional | Unchanged; not this NO-GO driver |
| Recruitment UAT-ready claim | **BLOCKED** | P0 | **pm** | Until QA retest ALL three + console zero DnD |
| `jd_dynamic_done` / remaster / product GO | **Denied** | — | — | Honesty lock |

**No new Dev Task from QC.** Next execution = **QA** after FE-01 READY evidence.

---

## Conditions / honesty locks

1. **NO-GO** for recruitment **UAT-ready**.
2. **NO** `jd_dynamic_done` · **NO** remaster_program_done · **NO** face_live · **NO** product GO · **NOT** Phase 1 DONE.
3. Prior QC-01 remains historically valid **only** as narrow J-HRM-JD-01..03+G4 GWC — **revoked as certification** of recruitment UX / console / interview.
4. U65: no seed in any follow-up acceptance path.

---

## Evidence-pack gate

```text
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-ux-qc-process-01.md
```

(Run recorded in Command table below.)

---

## Command / spot table (QC)

| Check | Result |
|-------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/po-hrm-rec-ux-qc-process-01.md` | **PASS** · exit **0** · pack **8/8** |
| Console log line count | **2659** · file present |
| DnD class count (unable_find + invariant) | **192+192=384** · **FAIL** usable writer bar |
| JS_THROW class | **14** · **FAIL** |
| Prior QC-01 scope re-read | GWC J-HRM-JD-01..03 only · honesty denied product GO · **ACCEPT as slice** · **REJECT as module cert** |
| Product re-test this seat | **N/A** (process-only) · exit **0** process audit |
| Create/read path vs DnD | Create/read snapshot may 2xx · DnD **FAIL** interaction — matrix incomplete |

---

## completion_report

**Closed:** Process honesty gate — documented that prior JD QC-01 **does not** certify recruitment usable / console-clean / interview UX; classified L2.5 incomplete, scope-creep silence, missing UF (interview locale + duplicate header); recommended console-storm / mojibake / duplicate-header P0 FAIL rules; residual owners left on FE-01 + BA (no Dev re-dispatch); **NO-GO** recruitment UAT-ready; honesty flags all false for done/GO claims.

**Open:** FE-01 QA retest (header + DnD + mojibake) · BA YCTD-REF sponsor confirm · gate rule text update by PM governance.

**ack_status:** `PASS_TO_PM`

**next_owner:** `pm` → after FE-01 READY → **`qa`**

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-HEADER-JD-DND-QA-01
role: qa
lane: execution — browser U65 zero-seed
entry_criteria:
  - FE READY: docs/qa/evidence/po-hrm-ui-header-jd-dnd-fe-01.md (header + DnD + interview mojibake)
  - Process NO-GO context: docs/qa/evidence/po-hrm-rec-ux-qc-process-01.md
  - portal http://127.0.0.1:5173 · ceo@xe.vn · company_id=main
  - cấm seed · cấm PASS chỉ Network 2xx
exit_criteria:
  - Browser retest ALL THREE:
    (1) Shell — single CC/TopHeader brand chrome; no duplicate XeVN OS/Command Center strip
    (2) JD writer — DnD drag at least one canvas section/field; writer usable after drop
    (3) Interview Schedule dialog — Vietnamese labels correct UTF-8; zero mojibake
  - Console on JD design surface: ZERO @hello-pangea/dnd drag-handle invariant storm (0 Unable to find drag handle / 0 Unable to find any drag handles in session after fix)
  - No Uncaught ReferenceError (getDialogPortalContainer / LayoutDashboard) on tested path
  - Evidence MD + screens + optional console excerpt; verify:qc:evidence-pack 8/8
  - Do NOT claim jd_dynamic_done · remaster · recruitment UAT-ready · product GO
ack_status: PASS_TO_PM | FAIL_TO_PM
evidence_path: docs/qa/evidence/po-hrm-ui-header-jd-dnd-qa-01.md
```
