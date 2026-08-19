# PO-HRM-CTR-CREATE-AUDIT-SYNTHESIS — CTR create (audit wave)

| Meta | Value |
|------|--------|
| **work_item_id** | `PO-HRM-CTR-CREATE-AUDIT-PM-SYNTH-01` |
| **date** | 2026-08-10 |
| **parent** | `docs/program/dispatch/PO-HRM-CTR-CREATE-AUDIT-WAVE-01.md` |
| **honesty** | `contracts_printable_ready=false` · **C-SLICE-≠-MODULE** |
| **BLOCK** | ~~BA-02~~ CONFIRM **done** · `FE-03` · `SA-02` · `QA-03` after FE READY_FOR_QA |

## Seat status

| Work item | Role | Evidence | Bus |
|-----------|------|----------|-----|
| `PO-HRM-CTR-CREATE-AUDIT-BA-01` | ba-process | `docs/qa/evidence/po-hrm-ctr-create-audit-ba-01.md` | PASS (PM intake 2026-08-10) |
| `PO-HRM-CTR-CREATE-AUDIT-FE-01` | dev-fe | `docs/qa/evidence/po-hrm-ctr-create-audit-fe-01.md` | PASS (PM intake 2026-08-10) |
| `PO-HRM-CTR-CREATE-AUDIT-SA-01` | sa | `docs/program/specs/PO-HRM-CTR-CREATE-AUDIT-SA-01.md` | PASS (PM intake 2026-08-10) |
| `PO-HRM-CTR-CREATE-AUDIT-QA-01` | qa | `docs/qa/evidence/po-hrm-ctr-create-audit-qa-01.md` | PASS (audit facts — **FAIL/BLOCKED** rows, không UAT GO) |

---

## Executive summary (sponsor-facing)

1. **Popup «màn con» trên Command Center** — Code create dialog dùng `portalScope="iframe"` trong khi view dialog và TECHSPEC §4.1 / comment trail hướng **parent portal** full viewport. [FE audit](docs/qa/evidence/po-hrm-ctr-create-audit-fe-01.md) + [SA Option A/B](docs/program/specs/PO-HRM-CTR-CREATE-AUDIT-SA-01.md) — **chưa chọn**; cần **Q1–Q2** sponsor.
2. **QA CC URL (AUDIT-QA-01)** — [CTR audit QA CC browser](d4c889c9-8345-4cec-a25a-3bdce8aef75b) · stamp `CTRAUDITQA1-MSMQ0L96` · `:5173/command-center/hrm/contracts` · L0 PASS · dialog mở được. **DIALOG-FULL-CC FAIL** (954×687 ≈ 66%×76% viewport — khớp iframe «màn con» + [SA Option B](docs/program/specs/PO-HRM-CTR-CREATE-AUDIT-SA-01.md)). **SO-TEN-HD PASS** · **NV-PICKER FAIL** (UUID trigger, không search) · **MAU-TIEP FAIL** (combobox timeout) · **STEP2-DND BLOCKED** · **CONSOLE-PANGEA PASS** (0 storm). Cần **Q1–Q2** + **Q6** trước **FE-03** / **QA-03**.
3. **Nghiệp vụ AMIS vs BA-01** — Nhiều field intake (Tên HĐ, ngày ký, phụ cấp «+ Thêm», trích yếu, Gỡ điều khoản…) **SPEC-SILENT** hoặc mâu thuẫn wireframe — map **G-03..G-10, G-17** → **Q3–Q11** trong NEED-SPONSOR.
4. **Code wiring (static FE)** — [CTR audit FE spec vs code](a357a569-c54a-436d-962c-4e8c6889f4ee): stepper + «Tiếp» + gate `templateCode` / `goStep2` **aligned** BA O1–O2; NV = **CatalogSearchPicker** trong code — **runtime QA FAIL** UUID picker; Step 2 DnD **BLOCKED** (chưa qua mẫu/Tiếp).
5. **SA portal (no pick)** — [CTR audit SA portal options](76a170e7-e6a7-4eb8-be40-3d4681e5bbba): **Option A** parent §4.1 vs **Option B** iframe AS-IS · residual **R-CTR-PORTAL-01** → **Q1–Q2**.
6. **BA gaps** — [CTR audit BA gap](47a57873-3a21-4192-a900-1ab97582e403): **G-01..G-18** + **Q1–Q12** · BA-02 outline DRAFT only.
7. **Không revert** — Giữ draft; fix wave sau sponsor chốt + BA-02 CONFIRM.

---

## Cross-role facts (merged)

| Topic | BA (G-*) | FE (static) | QA (CC URL) | SA |
|-------|----------|-------------|-------------|-----|
| Portal geometry | G-02 SPEC-SILENT | GAP iframe vs parent `Contracts.tsx:1599` | **FAIL** 954×687 vs full CC | Option A parent+D nD vs Option B iframe (R-CTR-PORTAL-01) |
| Step 2 / tab | G-01 sponsor CC vs QA URL | ALIGNED wiring; step 2 needs `persistRegistry` | **BLOCKED** (chưa vào bước 2) | A → J-02 CC bắt buộc |
| NV picker | G-05 → Q6 | CatalogSearchPicker — ALIGNED code | **FAIL** UUID, no search | — |
| DnD / Gỡ | G-07 | ALIGNED structure; Gỡ → Q7–Q8 | **BLOCKED** | DnD vs portal same-document |
| Catalog / TV mẫu | G-06, G-15 | gate on template | **FAIL** combobox timeout | Q12 probation |
| Typography / scroll | G-17 → Q11 | CSS present; clipped if iframe | (chưa đo riêng) | — |
| Console pangea | — | — | **PASS** 0 storm | — |

Chi tiết gap: **G-01..G-18** trong `po-hrm-ctr-create-audit-ba-01.md`.

---

## Sponsor action (only source of product decisions)

Trả lời **Q1–Q12** trong:

`docs/program/specs/NEED-SPONSOR-QUESTIONS-CTR-CREATE-AUDIT.md`

Format: `Q1-A`, `Q2-Có`, … trong chat.

**Sau chốt:** PM dispatch `PO-HRM-CTR-CREATE-REDESIGN-BA-02` (CONFIRM, không outline) → `FE-03` + `QA-03` (U65, URL CC).

---

## Residual (PM)

| ID | Owner | Trigger |
|----|-------|---------|
| R-CTR-PORTAL-01 | sponsor | Q1–Q2: SA Option A / B / hybrid §3.4 |
| Synthesis refresh | pm | **Done** 2026-08-10 (QA `CTRAUDITQA1-MSMQ0L96` + SA/BA links) |
| SRS delta publish | ba-process | Sau BA-02 CONFIRM |

---

## Evidence index

- QA: `docs/qa/evidence/po-hrm-ctr-create-audit-qa-01.md`
- BA: `docs/qa/evidence/po-hrm-ctr-create-audit-ba-01.md`
- FE: `docs/qa/evidence/po-hrm-ctr-create-audit-fe-01.md`
- SA: `docs/program/specs/PO-HRM-CTR-CREATE-AUDIT-SA-01.md`
- Questions: `docs/program/specs/NEED-SPONSOR-QUESTIONS-CTR-CREATE-AUDIT.md`
- Incident: `docs/program/incidents/INC-PM-COMPOSER-DIRECT-CODE-CTR-UX-20260810.md`
