# Evidence — PO-HRM-MVP-GD1-REC-07-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-QA-01` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-9 · UC-BP-REC-07) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `REC07QA-MSL5905D` |
| **ack_status** | **FAIL_TO_PM** |
| **overall** | **FAIL** |
| **uc_ids** | `UC-BP-REC-07` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | BE-01 READY_FOR_QA · FE-01 READY_FOR_QA |
| **env** | portal `:5173` · hrm-api `:28001` **rebuild+restart** (stale dist at entry — `Cannot POST` accept-offer) · commit `git rev-parse` in JSON |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-07-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-07-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-07-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **FAIL** · `FAIL_TO_PM` |
| **L0** | hrm/xbos/portal **200** |
| **L1 seal** | POST fake accept-offer → **404** `HRM-REC-404` Application not found (**LIVE** after rebuild) · Nest `/rec/…/accept-offer` **404** `Cannot POST` DENY · stamp `REC07L1-*` |
| **L2.5 J-*** | **J-01 FAIL** (soft-link F5) · **J-02 FAIL** (idempotent) · **J-03 PASS** · **J-04 PASS** |
| **Nest `/rec` browser** | **0 hits** |
| **DENY** | seed unused · honesty false retained · mail≠hire hint observed · picker/Kanban ≠ FR-07 DONE · no reopen sealed J-06 · **C-SLICE** · no module UAT DONE |

**Ops note (intake):** LIVE dist at entry lacked `accept-offer` (`Cannot POST` / `HRM-DATA-404`) → QA **rebuild** `pnpm --filter hrm-api run build` exit 0 + restart `dist/main` → L1 LIVE before browser (same stale-dist class as prior REC seats).

---

## L0 / L1

| Check | Evidence |
|-------|----------|
| Portal / HRM / XBOS | **200** |
| `POST …/applications/{fake}/accept-offer` | **404** `HRM-REC-404` Application not found — **route LIVE** |
| Nest `POST /api/hrm/rec/applications/{id}/accept-offer` | **404** `HRM-DATA-404` Cannot POST — DENY dual |
| `POST` body `{ salary }` / `{ base_salary }` | **400** `HRM-VAL-001` (ValidationPipe whitelist) — service **PAY-403** sealed in unit only → **P2 OBS** |
| EFF catalog | includes `offer` + `hiredOutcomeKey=hired_qa_msiwiylu` |
| EX-01 not offer-ready | **400** `HRM-REC-HIRE-OFFER-INVALID` on stage=`new` |

---

## Browser U65 — journeys

Persona: portal auth inject · URL `http://127.0.0.1:5173/command-center/hrm/recruitment?tab=candidates&companyId=main` · **zero-seed**.

**hdsd_align:** Tuyển dụng → Ứng viên → (Đổi trạng thái → offer) → **Chấp nhận offer** → HTP / deny CTA.

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-REC-07-01** | UV `UATREC-ICEHPX` → Đổi trạng thái → **offer** 201 → **Chấp nhận offer** → xác nhận → F5 | POST `…/applications/{id}/accept-offer` **201** `HRM-REC-HIRE-201` mode=`created` emp=`8104761f-…` · prefill no re-key · POST transitions **201** hired-outcome · path `/recruitment/` · **F5 soft link FAIL** — CTA missing; GET candidate `employee_id` empty | **FAIL** |
| **J-HRM-REC-07-02** | Re-accept cùng UV sau hired-outcome | Cannot open CTA; L1 re-accept → **400** `HRM-REC-HIRE-OFFER-INVALID` (`stage 'hired_qa_msiwiylu' is not offer-ready`) — **not** idempotent 200 | **FAIL** |
| **J-HRM-REC-07-03** | HTP after create | GET `…/employees/{emp}/hire-readiness` **200** blockers=`["HRM-HTP-NO-ACTIVE-CONTRACT"]` · no seed HĐ | **PASS** |
| **J-HRM-REC-07-04** | Nest deny · not-ready · PAY · DENY claims | Nest hits **0** · CTA absent on `CNS Allow` stage=`new` · OFFER-INVALID L1 · PAY HTTP VAL-001 OBS · mail≠hire / picker≠DONE | **PASS** |

Mutated samples:
- Accept create: application/candidate `448d12df-fd76-4fb2-8953-e26667bae446` (UV UAT REC UATREC-ICEHPX)
- Employee created: `8104761f-da90-4979-9a94-74b20e49ee3c` · code `HIRE-HOLDIN-MSL59DZAE9F00F` · status `pending_docs`

Screens: `01-candidates` · `02-detail-offer-ready` · `03-accept-result` · `04-f5-after-accept` · `07-deny-not-ready`.

---

## Defects (blocking)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-REC-07-SOFT-LINK-PROJECTION** | **P0** | **dev-be** | Lane A `listCandidates` / `getCandidateById` SELECT **omits** `c.employee_id` (and FE never receives soft stamp after F5). After accept 201, GET candidate has empty `employee_id` → `shouldShowAcceptOfferCta` false once stage ≠ offer → **J-01 F5 soft link + J-02 CTA blocked**. Spec O7 / DATA-01 soft stamp must be **display-ready** on list↔get. |
| **R-REC-07-IDEMPOTENT-OFFER-GATE** | **P0** | **dev-be** | `acceptOfferApplication` calls `assertOfferReadyOrThrow` **before** soft/reverse linkedEmpId branch. After FE APP-02 transitions to hired-outcome, re-accept returns **400** `HRM-REC-HIRE-OFFER-INVALID` instead of **200** `HRM-REC-HIRE-200` idempotent. Fix: check existing soft/reverse link **first** (or treat linked as offer-ready bypass); retain OFFER-INVALID only when **unlinked**. |
| **R-REC-07-ASSERT-BYPASS** | **P1** | **dev-be** | Post-create `assertHireEmployeeLinkOrThrow(..., { existingEmployeeId })` can PASS without re-reading `recruitment_candidates.employee_id` / reverse `employees.candidate_id` from DB — weak seal for soft stamp. Prefer assert that reads DB soft+reverse after stamp. |

## Residuals (non-blocking)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-REC-07-PAY-HTTP-VAL-001** | P2 | peer-BE | HTTP `base_salary`/`salary` → `HRM-VAL-001` via class-validator whitelist before service `HRM-REC-PAY-403`. Unit BE seals PAY-403. Optional: allow known PAY keys through DTO strip layer → 403 mint. |

**What worked (must not regress):** accept-offer route LIVE · create+prefill 201 HIRE-201 · transitions hired-outcome 201 · HTP-05 NO-ACTIVE-CONTRACT · Nest `/rec` DENY · OFFER-INVALID on not-ready · zero-seed · honesty false · C-SLICE.

---

## DENY / honesty

| Item | Status |
|------|--------|
| Nest `/rec/*` SoT dual | **DENY** — L1 Cannot * · browser hits **0** |
| Mail template offer = hire | **DENY** — dialog hint mail≠hire |
| Picker / Kanban as FR-07 DONE | **DENY** |
| `pnpm seed:*` / API fake hire for UF | **not used** (L1 probes auxiliary only; CFG `offer` stage already in EFF / upsert prerequisite) |
| Flip `recruitment_uat_ready` / `jd_dynamic_done` | **false** retained |
| Reopen sealed J-HRM-REC-06-* | **DENY** |
| Module REC UAT / Phase1 DONE | **DENY** — **C-SLICE** |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **FAIL_TO_PM** |
| **next_owner** | **dev-be** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-qa-01.md` |
| **completion_report** | U65 QA FAIL — L0 OK; L1 accept-offer LIVE after rebuild; J-01 create+prefill+transitions 201 OK but **soft-link F5 FAIL** (employee_id not on GET); J-02 re-accept **OFFER-INVALID** after hired-outcome; J-03 HTP PASS; J-04 Nest/deny PASS. P0 soft-link projection + idempotent gate order → BE-02. Honesty false · C-SLICE · Nest /rec 0 · no seed. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-02
lane: execution · dev-be
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-07
depends_on: QA-01 FAIL · stamp REC07QA-MSL5905D · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-qa-01.md
entry_criteria: L0; honesty false; C-SLICE; U65; preserve create+prefill 201 path
MISSION: FIX P0 R-REC-07-SOFT-LINK-PROJECTION — list/get candidates include display-ready employee_id (soft stamp) list↔get parity; FIX P0 R-REC-07-IDEMPOTENT-OFFER-GATE — accept-offer check soft/reverse link BEFORE assertOfferReady (re-accept after hired-outcome → 200 HIRE-200 same employee_id); harden assert reads DB soft+reverse after stamp; jest regression; DENY Nest /rec · seed · honesty flip · reopen J-06.
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-be-02.md · READY_FOR_QA
cấm: Nest /rec dual · second hire SoT · seed · honesty flip · claim REC UAT DONE
```

---

## Honesty footer

```text
recruitment_uat_ready=false
jd_dynamic_done=false
C-SLICE ≠ module REC UAT
U65 zero-seed
Nest /rec dual DENY · mail offer ≠ hire · picker/Kanban ≠ FR-07 DONE
APP-02 sole hired-outcome writer RETAIN · HTP-05 consume only
```
