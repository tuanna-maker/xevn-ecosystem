# Evidence — PO-HRM-CTR-WORKSPACE-G4-WS-G4-07-CONFIRM-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-CTR-WORKSPACE-G4-WS-G4-07-CONFIRM-QA-01` |
| **role** | `qa` |
| **runner_stamp** | **`CTRG4G07-MSO6B4UU`** |
| **upstream** | `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-subject-rec-nv-first-retest-01.md` (WS-G4-07 PASS_WITH_HOLD) |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** — WS-G4-07 mandatory Gỡ confirm **CLOSED** |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/contracts` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · U65 zero-seed |
| **hdsd_align** | `docs/hrm/ui-screens/UI-HRM-CTR-WORKSPACE.md` §4.2 · AC-WS-06 · AC-CTR-DND-02 |
| **runner** | `scripts/qa/_tmp-po-hrm-ctr-g4-ws-g4-07-confirm-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-ctr-g4-ws-g4-07-confirm-01.json` |
| **commit** | `dc930c5` |
| **honesty** | `contracts_printable_ready=false` |

---

## Gates

| Gate | Command | Result |
|------|---------|--------|
| **L0 stack** | `pnpm run qc:dev-stack` | **PASS** — hrm `:28001` **200** · xbos **200** · portal **200** (Windows UV exit quirk) |
| **L0 FE↔BE** | `pnpm run qc:fe-be-health` | **exit 0** |

---

## WS-G4-07 — mandatory Gỡ confirm (full path)

| Step | Verdict | Detail |
|------|---------|--------|
| U65 prep (catalog) | **PASS** | Settings `contract-clauses` → Sửa **THHDLD** → tick **Bắt buộc** → PATCH **200** (not seed) |
| Step2 canvas | **PASS** | Template pre-load 1 mandatory clause on canvas (`countBefore=1`) |
| Gỡ → dismiss (Hủy) | **PASS** | Native `confirm` VI message · canvas **still 1** row |
| Gỡ → accept (Đồng ý) | **PASS** | Same message · canvas **0** rows |
| Silent mandatory gỡ | **PASS** | `silentRemoveOnMandatory=false` |

**Confirm message (VI):** «Điều khoản này là bắt buộc theo mẫu. Bạn có chắc muốn gỡ khỏi hợp đồng?»

**UI note:** FE uses `window.confirm` (OK/Cancel) — maps to AC-CTR-DND-02 Hủy/Đồng ý behavior (dismiss=giữ · accept=gỡ).

| Row | AC | Verdict |
|-----|-----|---------|
| **WS-G4-07** | AC-CTR-DND-02 | **PASS** |
| — | AC-WS-06 | **PASS** |

---

## Journeys (L2.5)

| Journey | Verdict | Detail |
|---------|---------|--------|
| **J-HRM-CTR-CREATE-02** | **PASS** | Step2 mandatory Gỡ confirm exercised on CC URL |

---

## UF block (browser)

### Click path

`ceo@xe.vn` login → **Cài đặt** tab `contract-clauses` (prep mandatory via FE) → **Hợp đồng** CC → **Tạo HĐ** → NV101 → Step2 → **Gỡ** mandatory → dismiss → **Gỡ** → accept.

### Network (prep mutate only)

| Call | Status | Note |
|------|--------|------|
| PATCH `…/contract-clauses/{id}` | **200** | Settings mandatory flip · clause `f7387d0a-…` · U65 FE |

CREATE path on this run did not require Lưu (confirm-only scope).

---

## Console / DnD

| Check | Value |
|-------|--------|
| DnD storms | **0** |
| console errors (blocking) | **none** |

---

## Screenshots

| Path | Row |
|------|-----|
| `docs/qa/evidence/screens/po-hrm-ctr-g4-ws-g4-07-confirm-01/00-settings-mandatory-prep.png` | Settings mandatory prep |
| `docs/qa/evidence/screens/po-hrm-ctr-g4-ws-g4-07-confirm-01/01-step2-canvas.png` | Step2 canvas before Gỡ |
| `docs/qa/evidence/screens/po-hrm-ctr-g4-ws-g4-07-confirm-01/02-after-cancel-dismiss.png` | After dismiss — clause kept |
| `docs/qa/evidence/screens/po-hrm-ctr-g4-ws-g4-07-confirm-01/03-after-accept-remove.png` | After accept — clause removed |

---

## Promoted / not promoted

**Promoted:**

- **WS-G4-07** **PASS** (closes PASS_WITH_HOLD from NV-first retest)
- **AC-CTR-DND-02** · **AC-WS-06**
- **J-HRM-CTR-CREATE-02** confirm slice

**Not promoted:**

- `contracts_printable_ready=false` — **cấm** UF-HRM-10 full
- CTR module UAT · printable PDF spine
- Catalog state: clause THHDLD now `mandatory=true` (U65 prep — not reverted)

---

## Defects

None opened this run.

---

## completion_report

**Closed:** WS-G4-07 full browser path on CC contracts — mandatory clause Gỡ shows VI confirm; dismiss keeps canvas row; accept removes row; no silent mandatory remove; L0 PASS; AC-CTR-DND-02 + AC-WS-06 PASS; prior PASS_WITH_HOLD **CLOSED**.

**Residual:** `contracts_printable_ready=false`; native `window.confirm` vs Radix dialog (cosmetic); catalog mandatory flag flipped for test prep via Settings FE.

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-CTR-WORKSPACE-G4-WS-G4-07-CONFIRM-QC-01
role: qc
read_first:
  - docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-ws-g4-07-confirm-01.md
  - docs/program/dispatch/PM-HRM-CTR-WORKSPACE-G4-NV-FIRST-SEAL-01.md
entry_criteria: QA PASS_TO_PM WS-G4-07 confirm; L0 PASS; U65 prep documented
exit_criteria: GWC narrow — promote WS-G4-07 PASS; honesty contracts_printable_ready=false; cấm UF-HRM-10; stamp CTRG4G07-MSO6B4UU
evidence_path: docs/qa/evidence/qc-po-hrm-ctr-workspace-g4-ws-g4-07-confirm-01.md
ack_status: GO_WITH_CONDITIONS | NO-GO
```

**evidence_path:** `docs/qa/evidence/qa-po-hrm-ctr-workspace-g4-ws-g4-07-confirm-01.md`  
**ack_status:** **PASS_TO_PM**
