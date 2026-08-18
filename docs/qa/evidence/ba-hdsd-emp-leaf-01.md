# Evidence — BA-HDSD-EMP-LEAF-01

| Meta | Value |
|------|--------|
| **work_item_id** | `BA-HDSD-EMP-LEAF-01` |
| **role** | `ba-docs` |
| **lane** | governance |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **no_prompt_echo** | true |

## Problem closed

| ID | Before | After |
|----|--------|-------|
| **SPEC_GAP-HDSD-EMP-01** | HRM Employees TC pack traced HDSD only via pilot `03_HUONG_DAN…` §4 + SoftDel QA evidence | Dedicated client HDSD leaf **Chương 6 — Danh sách nhân sự** |

## Deliverables (ADD-only)

| Artifact | Action |
|----------|--------|
| `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06_HRM_NHAN_SU.md` | **NEW** — leaf HDSD (list §2 · form §3 · soft-delete §4 · import/export §5 · profile §6 · scope §7 · checklist §8) |
| `docs/client-delivery/03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` | Pointer §1.2 (HR readers) · §5.5 step 4 → CH06 |
| `docs/client-delivery/README.md` | Index rows CH06 + CH07 |
| `docs/qa/testcases/hrm-web/HRM-EMPLOYEES.md` | Meta **HDSD** · §5 trace **HDSD §** → CH06 sections · §6 SPEC_GAP row removed |
| `docs/qa/reports/PO_SPEC_TEST_REPORT.md` | SPEC_GAP-HDSD-EMP-01 → Closed |
| `docs/qa/evidence/po-eco-tc-synth-wave-a-01.md` | Residual HDSD gap → Closed |
| `docs/qa/evidence/po-eco-tc-hrm-employees-01.md` | Residual table updated |

## HDSD SoT (U76)

| Layer | Path |
|-------|------|
| **Pilot shell** | `docs/client-delivery/03_HUONG_DAN_SU_DUNG_VA_CHAY_THU_XEVN.md` |
| **HRM leaf (Employees)** | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH06_HRM_NHAN_SU.md` |
| **Pattern reference** | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md` |
| **OS doctrine** | `_vibe-team-os/18-HDSD-TRAINING-HTML-PDF.md` (Markdown leaf — no HTML build this wave) |

## TC-EMP group → HDSD section map

| TC pack § | TC-ID prefix | HDSD CH06 |
|-----------|--------------|-----------|
| §4.1 | `TC-EMP-L-*` | §2 Màn danh sách |
| §4.2 | `TC-EMP-F-*` | §3 Tạo/sửa (UF-HRM-03) |
| §4.3 | `TC-EMP-D-*` | §4 Xóa mềm/khôi phục |
| §4.4 | `TC-EMP-X-*` | §5 Nhập/xuất (J-HRM-IM-01) |
| §4.5 | `TC-EMP-P-*` | §6 Hồ sơ — shell/tabs |
| §4.6 | `TC-EMP-C-*` | §6.1 Tab HĐ/việc làm |
| §4.7 | `TC-EMP-M-*` | §6.2 Tab HR/Career/Personal |

**UF mapping:** UF-HRM-01 (list→detail embed) · UF-HRM-03 (create/edit FE) — covered in §2.4–§3 and §8 checklist.

## QC spot-check (suggested for QA)

| TC-ID | Expected HDSD cite |
|-------|-------------------|
| TC-EMP-L-HP-001 | CH06 §2.1 |
| TC-EMP-F-HP-001 | CH06 §3.1 |
| TC-EMP-D-HP-001 | CH06 §4.1 |

## Quality notes

- Customer prose: 100% Vietnamese; no work_item / pipeline stamps in CH06 body.
- Chapters outside Employees **not rewritten** (pilot doc §1–4,7–9 untouched except two ADD pointers).
- SoftDel mutate detail remains in QA evidence; CH06 §4 describes user steps only.

## Handoff

```
completion_report: SPEC_GAP-HDSD-EMP-01 closed; CH06 leaf + pack trace + synth/report residuals updated.
next_owner: qa
next_dispatch_prompt: qa spot-check HDSD path on 3 TC-EMP rows (L-HP-001, F-HP-001, D-HP-001) — Steps column cites CH06 §; OR mark SPEC_GAP closed on synth report if already aligned.
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/ba-hdsd-emp-leaf-01.md
pm_dispatch_hint: PO-ECO-TC-QA-HDSD-SPOT-01 — browser optional; doc trace spot-check sufficient for governance closure
```
