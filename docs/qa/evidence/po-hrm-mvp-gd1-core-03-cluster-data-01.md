# Evidence — PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01` |
| **lane** | governance · ba-data |
| **program** | `PO-HRM-MVP-GD1-CONTINUOUS` (U89 Wave-18) |
| **uc_ids** | `UC-BP-CORE-03` |
| **Date** | 2026-08-09 |
| **depends_on** | BA-01 O1–O12 CONFIRMED · SA-01 Option A · R-PLT-EMP-01 · gap PROVEN · `EMPPLATQA-MSIZXHIM` · `EMPTOKQA-MSJ290VB` · peer `CORE02BQC1-MSLEFQC1` / `CORE09DQC1-MSLDR8I3` |
| **spec_path** | `docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md` |
| **ack_status** | **PASS_TO_PM** · DATA **CONFIRMED** |
| **change_mode** | **ADD** checklist instance physical · **HOLD** LIVE DOC/ET/TOK · **NO** `apps/**` · **no migrate run** · **no seed** |

---

## 1. Mission check

| Criterion | Result |
|-----------|--------|
| ADD Nest map `hrm_document_checklist_item` §3.5 (employee_id · company_id · document_type_key TEXT open · required · status missing\|submitted\|approved · file_ref · soft-delete) | **PASS** — DATA-01 §4 |
| DENY hard FK GĐ1 · closed key CHECK · Nest `/core` table dual | **PASS** §1/§10 |
| HOLD — no invent LIVE emp_document_type / emp_employment_type / emp.doc\|et TOK | **PASS** §6 |
| Cite display-ready instance list + required default from catalog flags | **PASS** §4.3 · §5 |
| RETAIN CORE-02b EMP-CF · 09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · Nest `/core` DENY | **PASS** §10 must_keep |
| DENY wipe EMP-CF · Nest emp_custom_field · Nest emp_position · closed DOC enum · claim EMP DOC L1=CORE-03/personnel DONE · claim CORE-02b=EMPCF/personnel DONE · claim CORE-09d printable/closed-8 · honesty · reopen J-02B/09D..01 · seed · apps/** | **PASS** §10 |
| Unlock sa API-01 F-CORE-CHK-01 prefer `/employees/:id/document-checklist*` + wire assert | **PASS** §12/§14 |

---

## 2. Spec read ack

| Artifact | Cite |
|----------|------|
| BA-01 | O1 path · O2 flags · O3 open · O4 TOK · O5 position · O6 R-PLT-EMP-01 REQUIRED · O7 soft-retire · O8 CORE-02b · O9 ACT OUT · O10 honesty · O11 display · O12 J-* |
| SA-01 | Option A LOCKED · gap-only RETAIN DOC/ET/TOK · residual instance |
| Paper DB | §3.5 `hrm_document_checklist_item` · §3.0a/b catalogs · EXPAND open key · DENY hard FK |
| AS-IS Nest (read-only) | `emp-document-type.service.ts` ensureSchema LIVE · `assertDocumentTypeInEffectiveCatalog` unwired · `apps/` **0** `document-checklist` / `hrm_document_checklist` |
| EMP seals | `EMPPLATQA-MSIZXHIM` · `EMPTOKQA-MSJ290VB` |
| Peer DATA | CORE-02b HOLD · CORE-09d..01 must_keep |

---

## 3. Physical decisions (summary)

1. **Instance:** **ADD** `public.hrm_document_checklist_item` ONE SoT · soft `employee_id` · open TEXT key · status CHK · soft `archived_at` · `required` default ← `required_by_default`.
2. **Catalog/TOK:** **HOLD RETAIN** LIVE DOC/ET/TOK — no schema invent.
3. **Path:** physical `/employees/:id/document-checklist*` · `/core` alias only · **DENY** Nest `/core` dual.
4. **Display-ready:** instance cols + DOC enrich (`nameVi` · flags) · FE không invent DOC SoT.

---

## 4. Honesty

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| `jd_dynamic_done` | **false** |
| `contracts_printable_ready` | **false** |
| `hrm_personnel_uat_ready` | **false** |
| CORE / personnel / CTR UAT | **false** |
| C-SLICE | GWC later ≠ module UAT |
| EMP DOC L1 = CORE-03 DONE | **DENIED** |
| CORE-02b = EMPCF/personnel DONE | **DENIED** |
| CORE-09d printable/closed-8 DONE | **DENIED** |

---

## 5. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | **sa** |
| **next_work_item** | `PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01` |
| **Dev** | **HOLD** until API CONFIRMED |

### next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01
lane: governance · sa
program: PO-HRM-MVP-GD1-CONTINUOUS (U89)
uc_ids: UC-BP-CORE-03
depends_on: DATA-01 CONFIRMED · docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-DATA-01.md · BA-01 O1–O12 · SA-01 Option A · R-PLT-EMP-01 · EMPPLATQA-MSIZXHIM · EMPTOKQA-MSJ290VB · peer CORE02BQC1-MSLEFQC1 · CORE09DQC1-MSLDR8I3 must_keep
spec_ref: F-CORE-CHK-01 ADD · F-EMP-CAT-DOC/ET/EFF RETAIN · F-EMP-TOK-01/02 RETAIN · assertDocumentTypeInEffectiveCatalog wire · physical /api/hrm/employees/:id/document-checklist* · paper /core alias only · DTO↔DB DATA-01 §4–§5 · Nest /core DENY · Nest emp_position DENY · Nest emp_custom_field DENY

MISSION — API F.1 lock (docs-only · residual CHK):
1) ADD F-CORE-CHK-01 — Mục đích + Nghiệp vụ xử lý + Tham chiếu bước SRS Diễn biến #1–#2 — prefer GET/POST/PATCH /api/hrm/employees/:id/document-checklist* on public.hrm_document_checklist_item; statuses missing|submitted|approved; soft archived_at; required default from catalog required_by_default; display-ready enrich nameVi + flags; U19 list=get=patch
2) Wire assertDocumentTypeInEffectiveCatalog when EFF>0 → HRM-EMP-DOC-TYPE-UNKNOWN; history retired keys OK; EFF=0 soft-allow documented; DENY closed DOC enum · DENY Nest /core dual SoT
3) RETAIN cite F-EMP-CAT-DOC-01/02 · F-EMP-CAT-ET-01/02 · F-EMP-CAT-EFF-01 · F-EMP-TOK-01/02 — HOLD no invent rewrite; paper /core alias only
4) RETAIN must_keep CORE-02b EMP-CF · CORE-09d TPL+clause · 09c VER/PDF ≠ printable · 09b PREV ephemeral · 09a CL · 08 · 02 · 01 · Nest /core DENY · F-CORE-ACT-01 peer cite OUT invent DONE
5) DENY wipe EMP-CF · Nest emp_custom_field · Nest emp_position · claim EMP DOC L1 = CORE-03/personnel DONE · claim CORE-02b = EMPCF/personnel DONE · claim CORE-09d printable/closed-8 · honesty flip · reopen J-HRM-CORE-02B/09D/09C/09B/09A/08/02/01 · seed · apps/**
6) Unlock next: Dev-BE + Dev-FE HOLD until API CONFIRMED — not before

exit: docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md · PASS_TO_PM · next Dev HOLD
```

---

## 6. Completion contract

| Field | Value |
|-------|--------|
| **completion_report** | DATA-01 CONFIRMED: ADD `hrm_document_checklist_item` §3.5 Nest physical (soft links · open TEXT key · status enum · required←catalog flag · soft-delete); HOLD RETAIN LIVE DOC/ET/TOK; DENY hard FK · closed CHECK · Nest `/core` dual · wipe EMP-CF · Nest emp_custom_field/position · false DONE claims · reopen sealed J-* · seed · apps/**; unlock sa API-01 F-CORE-CHK-01 — not Dev. |
| **next_owner** | **sa** |
| **ack_status** | **PASS_TO_PM** |
