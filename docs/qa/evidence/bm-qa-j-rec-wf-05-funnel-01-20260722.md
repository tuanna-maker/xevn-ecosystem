# BM-QA-J-REC-WF-05-FUNNEL-01 — Recruitment dashboard funnel (J-REC-WF-05 / BM-05)

| Field | Value |
|-------|--------|
| **work_item_id** | `BM-QA-J-REC-WF-05-FUNNEL-01` |
| **program** | `P1-BMINUTES-CUST-RETEST-01` |
| **journey** | **J-REC-WF-05** · **P-CC-06** |
| **env** | U65 · `http://14.225.217.232:8088` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` (session already authenticated) |
| **date** | 2026-07-22 |
| **U65** | No seed · browser FE only |
| **verdict** | **PASS** |

## spec_ref

- `docs/program/PROGRAM_JOURNEY_MAP.md` — **J-REC-WF-05** (Dashboard funnel sau WF sync; 6 cột live aggregate; filter ĐVTV)
- `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` — **P-CC-06** `/command-center/hrm/recruitment`
- Normative F6: `apps/web/hrm/src/lib/recruitmentFunnel.ts` — `new → screening → interview → offer → hired → rejected`
- VI labels: Chờ CV / Mới · Sàng lọc · Phỏng vấn · Đề nghị · Đã tuyển · Từ chối

## Click path

1. Open HRM recruitment (session live):  
   `http://14.225.217.232:8088/hr/recruitment?tenantId=xevn&companyId=main`  
   (also probed `…/command-center/hrm/recruitment` → lands same HRM recruitment surface)
2. Tab **Dashboard** selected — heading **Dashboard Tuyển dụng**
3. Assert **Pipeline ứng viên (6 giai đoạn)**
4. Open **Đơn vị thành viên** / `aria-label=Lọc đơn vị vận hành` → select **Khối Vận tải X.E** → wait settle
5. Restore **Tất cả đơn vị (rollup)**
6. Spot-check **Ứng viên** stage tabs vs funnel (list ↔ aggregate)

## Results

### 1) Six F6 columns (live aggregate) — PASS

| Stage (code) | VI label | Count (rollup) |
|--------------|----------|----------------|
| `new` | Chờ CV / Mới | **4** |
| `screening` | Sàng lọc | **0** |
| `interview` | Phỏng vấn | **0** |
| `offer` | Đề nghị | **0** |
| `hired` | Đã tuyển | **1** |
| `rejected` | Từ chối | **0** |
| — | **Tổng** | **5** |

- Sum matches: 4+0+0+0+1+0 = 5.
- Side cards: **CV Ứng tuyển = 5**, **Đã tuyển = 1**; **Chỉ tiêu = Không có dữ liệu** (honest empty, not ERROR).
- Funnel chips clickable → navigates to **Ứng viên** with matching stage tabs (`Tất cả 5`, `Ứng tuyển 4`, `Đã tuyển 1`, …).

### 2) Filter ĐVTV — PASS

UI present: combobox **Lọc đơn vị vận hành** / label **Đơn vị thành viên**.

Options observed: Tất cả đơn vị (rollup) · Tập đoàn XeVN · Khối Vận tải X.E · Khối Logistics X.E · Khối Tài chính X.E · Khối Dịch vụ X.E.

| Filter | Network (Resource Timing) | Funnel after settle |
|--------|---------------------------|---------------------|
| Tất cả đơn vị (rollup) | `…/candidates-pool?company_id=main` | Tổng **5** (4/0/0/0/1/0) |
| Khối Vận tải X.E | `…/candidates-pool?company_id=trsport` | Tổng **0** (all columns **0**) — honest empty |
| Khối Dịch vụ X.E (earlier pick) | (invalidate) | Observed Tổng **0** once — no ERROR |

No **HRM API Sync ERROR** / **HRM API request failed** / **54321** banner at any step.

### 3) Post YCTD / hired activity — PASS (honest non-empty)

- Recent activity list shows **QA Pool …** rows (ứng tuyển).
- **Đã tuyển = 1** consistent with prior hire-bind / BM recruitment waves (live aggregate, not mock KPI).
- Empty stages show **0** (not ERROR).

### 4) P-CC-06

- Direct `/hr/recruitment?…` is the operable surface for funnel L2.5 under U65.
- `/command-center/hrm/recruitment` resolves into the same HRM recruitment app context.

## Console / Network (excerpt, no secrets)

- Live fetches: `GET /api/hrm/recruitment/candidates-pool?company_id=main|trsport`, `candidate-applications`, `job-postings`, `recruitment-plans`.
- `hasError` body probe: **false** throughout.
- Note: bare `fetch()` from CDP without app `Authorization` returns `401 HRM-AUTH-001` — not used as verdict; app-authenticated Resource Timing + FE counts used instead.

## Screenshots (local browser capture)

- `bm-qa-j-rec-wf-05-funnel-baseline.png` — rollup 6-column funnel (Tổng 5)
- `bm-qa-j-rec-wf-05-funnel-final.png` — Khối Vận tải honest empty (Tổng 0)

## Residual

| ID | Severity | Note |
|----|----------|------|
| R1 | P3 soft | Side KPI **Chỉ tiêu** remains «Không có dữ liệu» under rollup — acceptable empty, not funnel fail. |
| R2 | P3 soft | After ĐVTV change, chips briefly show `—` then settle; not ERROR. |

**not promoted:** none for J-REC-WF-05 core AC.

## Exit checklist

- [x] 6 F6 columns present with VI labels
- [x] Live aggregate (not hardcoded 1OFFICE)
- [x] ĐVTV filter exists + changes counts / honest empty
- [x] No ERROR banner after recent recruitment activity
- [x] U65 no seed
- [x] Evidence path written

## Handoff

```yaml
work_item_id: BM-QA-J-REC-WF-05-FUNNEL-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/bm-qa-j-rec-wf-05-funnel-01-20260722.md
completion_report: |
  J-REC-WF-05 / P-CC-06 funnel PASS on :8088 as ceo.
  Pipeline 6 columns live: new4 / screening0 / interview0 / offer0 / hired1 / rejected0 (Tổng 5).
  ĐVTV filter OK — Khối Vận tải → company_id=trsport → honest Tổng 0; rollup restored.
  No ERROR banner. U65 no seed.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: BM-QA-J-REC-WF-05-FUNNEL-01
  from_role: qa
  ack_status: PASS_TO_PM
  evidence: docs/qa/evidence/bm-qa-j-rec-wf-05-funnel-01-20260722.md
  task: PM INTAKE — promote J-REC-WF-05 DRAFT→PASS on PROGRAM_JOURNEY_MAP;
    continue P1-BMINUTES-CUST-RETEST-01 next open BM journey (or QC gate if wave complete).
  cấm: seed · Phase1 DONE · PROD claim
pm_dispatch_hint: Promote J-REC-WF-05; next BM residual journey or QC — no funnel blocker
```
