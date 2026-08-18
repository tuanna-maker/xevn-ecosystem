# Evidence — PO-HRM-MVP-GD1-REC-07-CLUSTER-QA-02

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-REC-07-CLUSTER-QA-02` |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-9 · UC-BP-REC-07) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-09 |
| **stamp** | `REC07QA2-MSL5SJDU` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** (PASS_WITH_OBS P2) |
| **uc_ids** | `UC-BP-REC-07` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **Honesty** | `recruitment_uat_ready=false` · `jd_dynamic_done=false` · **C-SLICE-≠-MODULE** · U65 zero-seed |
| **depends_on** | BE-02 READY_FOR_QA · `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-be-02.md` |
| **env** | portal `:5173` · hrm-api `:28001` **rebuild+restart** (stale dist at entry — offer-ready **before** soft-link) · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-rec-07-cluster-qa-02.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-07-cluster-qa-02.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-rec-07-cluster-qa-02/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **no REC UAT DONE** |
| **L0** | hrm/xbos/portal **200** |
| **L1 seal** | POST fake accept-offer → **404** `HRM-REC-404` · Nest `/rec/…/accept-offer` **404** `Cannot POST` DENY · stamp `REC07L1-*` |
| **L2.5 J-*** | **J-01 PASS** (soft-link F5 GET+LIST) · **J-02 PASS** (HIRE-200 same emp) · **J-03 PASS** · **J-04 PASS** |
| **Nest `/rec` browser** | **0 hits** |
| **P0 closed** | `R-REC-07-SOFT-LINK-PROJECTION` · `R-REC-07-IDEMPOTENT-OFFER-GATE` · `R-REC-07-ASSERT-BYPASS` (BE-02) |
| **DENY** | seed unused · honesty false retained · Nest `/rec` dual · mail≠hire · picker/Kanban ≠ FR-07 DONE · no reopen sealed J-06 · **C-SLICE** · no module UAT DONE |

**Ops note (intake):** LIVE dist at entry still had **offer-ready before soft-link** (pre-BE-02) → QA **rebuild** `pnpm --filter hrm-api run build` + restart `dist/main` → seal `linkedEmpId` **before** `assertOfferReadyOrThrow` + `assertPersistedHireSoftLinkOrThrow` LIVE before browser.

---

## L0 / L1

| Check | Evidence |
|-------|----------|
| Portal / HRM / XBOS | **200** |
| `POST …/applications/{fake}/accept-offer` | **404** `HRM-REC-404` Application not found — **route LIVE** |
| Nest `POST /api/hrm/rec/applications/{id}/accept-offer` | **404** `HRM-DATA-404` Cannot POST — DENY dual |
| PAY body `{ salary }` / `{ base_salary }` | **400** `HRM-VAL-001` (whitelist) — service **PAY-403** unit-sealed → **P2 OBS** |
| EFF catalog | includes `offer` + `hiredOutcomeKey=hired_qa_msiwiylu` |
| EX-01 not offer-ready | **400** `HRM-REC-HIRE-OFFER-INVALID` on stage=`new` |

---

## Browser U65 — journeys

Persona: portal auth inject · URL `http://127.0.0.1:5173/command-center/hrm/recruitment?tab=candidates&companyId=main` · **zero-seed**.

**hdsd_align:** Tuyển dụng → Ứng viên → Đổi trạng thái → offer → **Chấp nhận offer** → F5 soft link → re-accept after hired-outcome → HTP / deny CTA.

| J-* | Click path | Network / FE | Verdict |
|-----|------------|--------------|---------|
| **J-HRM-REC-07-01** | UV `UATREC-ICHFBD` → Đổi trạng thái → **offer** 201 → refresh → **Chấp nhận offer** → xác nhận → transitions hired → F5 | POST `…/applications/{id}/accept-offer` **201** `HRM-REC-HIRE-201` mode=`created` emp=`2b4cbc90-…` · prefill no re-key · POST transitions **201** · path `/recruitment/` · **F5 GET+LIST `employee_id=2b4cbc90-…` match** | **PASS** |
| **J-HRM-REC-07-02** | Re-accept sau hired-outcome | L1 POST accept-offer → **200** `HRM-REC-HIRE-200` mode=`idempotent` **same** `employee_id` · browser CTA absent after hired (P2 FE OBS) | **PASS** |
| **J-HRM-REC-07-03** | HTP after create | GET `…/employees/{emp}/hire-readiness` **200** blockers=`["HRM-HTP-NO-ACTIVE-CONTRACT"]` · no seed HĐ | **PASS** |
| **J-HRM-REC-07-04** | Nest deny · not-ready · PAY · DENY claims | Nest hits **0** · CTA absent on `UVYCTD-R2-HM59YG` stage=`new` · OFFER-INVALID L1 · PAY HTTP VAL-001 OBS · mail≠hire | **PASS** |

Mutated samples:
- Accept create: application/candidate `11a5906f-6736-4a89-afe4-bf623d1be1ac` (UV UAT REC UATREC-ICHFBD)
- Employee created: `2b4cbc90-fb74-4a2d-9fef-d188d4e48d61` · status `pending_docs`

Screens: `01-candidates` · `02-detail-offer-ready` · `03-accept-result` · `04-f5-after-accept` · `07-deny-not-ready`.

---

## Defects closed (from QA-01)

| ID | Sev | Status |
|----|-----|--------|
| **R-REC-07-SOFT-LINK-PROJECTION** | P0 | **CLOSED** — GET+LIST display-ready `employee_id` after accept+F5 |
| **R-REC-07-IDEMPOTENT-OFFER-GATE** | P0 | **CLOSED** — re-accept after hired-outcome → `HRM-REC-HIRE-200` same emp |
| **R-REC-07-ASSERT-BYPASS** | P1 | **CLOSED** (BE-02 jest + LIVE idempotent path) |

## Residuals (non-blocking)

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-REC-07-PAY-HTTP-VAL-001** | P2 | peer-BE | HTTP PAY keys → `HRM-VAL-001` before service `HRM-REC-PAY-403` |
| **R-REC-07-FE-CTA-AFTER-HIRED** | P2 | peer-FE | After hired-outcome F5, API soft-link PASS but browser CTA absent — `projectSpineCandidateToListRow` omits `employee_id` → `shouldShowAcceptOfferCta` false when stage≠offer; J-02 AC sealed via L1 HIRE-200 |

**What worked (must not regress):** accept-offer create+prefill 201 · soft-link F5 GET/LIST · idempotent HIRE-200 after hired · HTP-05 NO-ACTIVE-CONTRACT · Nest `/rec` DENY · OFFER-INVALID on not-ready · zero-seed · honesty false · C-SLICE.

---

## DENY / honesty

| Item | Status |
|------|--------|
| Nest `/rec/*` SoT dual | **DENY** — L1 Cannot * · browser hits **0** |
| Mail template offer = hire | **DENY** — dialog hint mail≠hire |
| Picker / Kanban as FR-07 DONE | **DENY** |
| `pnpm seed:*` / API fake hire for UF | **not used** |
| Flip `recruitment_uat_ready` / `jd_dynamic_done` | **false** retained |
| Reopen sealed J-HRM-REC-06-* | **DENY** |
| Module REC UAT / Phase1 DONE | **DENY** — **C-SLICE** |

---

## Completion contract

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **qc** |
| **evidence_path** | `docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-qa-02.md` |
| **completion_report** | U65 QA PASS — L0 OK; rebuild+restart seal BE-02 LIVE; J-01 create+prefill+transitions 201 + **soft-link F5 GET/LIST employee_id PASS**; J-02 re-accept after hired → **200 HRM-REC-HIRE-200** same emp; J-03 HTP PASS; J-04 Nest/rec 0 PASS. P0 soft-link+idempotent **CLOSED**. P2 PAY VAL-001 + FE CTA-after-hired OBS. Honesty false · C-SLICE · Nest /rec 0 · no seed · no REC UAT DONE. |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-MVP-GD1-REC-07-CLUSTER-QC-01
lane: governance · qc
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-REC-07
depends_on: QA-02 PASS · stamp REC07QA2-MSL5SJDU · evidence docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-qa-02.md
entry_criteria: L0; honesty false; C-SLICE; U65; pack BA/SA/DATA/API/BE/FE/QA
MISSION: QC GWC C-SLICE UC-BP-REC-07 — audit J-HRM-REC-07-01..04 PASS (soft-link F5 · HIRE-200 · HTP · Nest/rec DENY); close P0 soft-link+idempotent; P2 OBS PAY VAL-001 + FE CTA-after-hired idle-ok; DENY honesty flip · REC UAT DONE · seed · reopen J-06.
exit: docs/qa/evidence/po-hrm-mvp-gd1-rec-07-cluster-qc-01.md · PASS_TO_PM GWC
cấm: Nest /rec dual · honesty flip · claim REC UAT DONE · seed
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
