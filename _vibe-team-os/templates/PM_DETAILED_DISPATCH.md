# Template — PM Detailed Subagent Dispatch (training-style)

> Copy vào Task prompt. Subagent **không** có chat sponsor — viết như đang **train** người mới: bối cảnh, tầm nhìn, ranh giới, định nghĩa xong.
> Doctrine: `_vibe-team-os/33-TESTCASE-VS-REPORT-VS-UNIT.md` §7 · `06-PM-ORCHESTRATION.md`

---

```text
work_item_id: <WI>
from_role: pm
to_role: <qa|dev-be|dev-fe|ba-process|sa|…>
lane: execution | governance
ack_status_target: READY_FOR_QA | READY_FOR_SYNTH | PASS_TO_PM
change_mode: ADD | UPGRADE | FIX

════════════════════════════════════════
1) MISSION (1 đoạn — việc cụ thể)
════════════════════════════════════════
Làm gì + deliverable path cụ thể.

════════════════════════════════════════
2) WHY / SPONSOR INTENT (tầm nhìn)
════════════════════════════════════════
Sponsor đang cố kiểm được điều gì ở sản phẩm?
Ví dụ: “không chỉ load menu — phải có TC đủ field/popup và sau này chạy FE→Lưu→F5”.

════════════════════════════════════════
3) VISION OF DONE vs NON-GOAL
════════════════════════════════════════
DONE khi: (đo được)
NON-GOAL / cấm claim: (vd. không claim UAT DONE; không seed; không sửa apps/**)

Artifact layer (chọn 1–2):
[ ] Test Case design (catalog/pack)
[ ] Unit Test Plan / unit code
[ ] Browser/device execution + Test Log (OS 31)
[ ] Test Report rollup update
[ ] Spec/matrix governance

════════════════════════════════════════
4) CONTEXT DUMP (bối cảnh — đừng giả agent nhớ)
════════════════════════════════════════
- Program / SoT paths:
- Prior wave vừa xong (WI + evidence):
- Constraints: U65 zero-seed · U76 HDSD · U78 test-log · …
- Personas / URL / companyId nếu QA chạy:

════════════════════════════════════════
5) read_first (ORDERED — bắt buộc đọc trước khi viết)
════════════════════════════════════════
1. …
2. …
3. …
(Spec → matrix → template → XREF packs — không đoán)

════════════════════════════════════════
6) SHAPE OF DELIVERABLE
════════════════════════════════════════
- File path(s):
- Bảng/cột bắt buộc: (list)
- Độ sâu tối thiểu: (vd. ≥1 HP+FD mỗi fn mutate; screen inventory đủ popup)
- Examples / neo pack tốt để học format: (path)

════════════════════════════════════════
7) entry_criteria / exit_criteria
════════════════════════════════════════
entry:
- …
exit:
1. …
2. evidence_path = …
3. bus ack_status = …
4. handoff fields đầy đủ

════════════════════════════════════════
8) PATH GUARDS
════════════════════════════════════════
allowed_paths: […]
forbidden_paths: [apps/**, seed scripts, …]
must_keep: […]
preserve_default: true
code_memory_required: true|false
test_log_required: true|false   # nếu execution UI
hdsd_align: true|false
case_matrix: fail-deep → success → logic
u65_zero_seed: true

════════════════════════════════════════
9) SOLID / QUALITY NOTES (nếu Dev)
════════════════════════════════════════
solid_convention_ack: …
spec_read_ack template: srs · tech_spec · db_design · api_design

════════════════════════════════════════
10) HANDOFF (bắt buộc khi xong)
════════════════════════════════════════
Trả về:
- completion_report (closed + residual)
- next_owner
- next_dispatch_prompt (copy-ready cho PM)
- ack_status
- evidence_path
- pm_dispatch_hint (P0 residual nếu có)
```

---

## Anti-patterns (cấm gửi Task kiểu này)

```text
# BAD
Viết testcase cho HRM giúp cái.
# BAD
Fix bug đi.
# BAD
Retest giúp.
```

## Độ dài gợi ý

| Việc | Độ dài prompt |
|------|----------------|
| Menu TC pack / matrix | Trung–dài (đủ §1–10) |
| Hotfix 1 file đã có WI+spec | Trung (vẫn cần why + cấm) |
| Synth dedupe | Trung + neo-map packs |

**Nguyên tắc:** rõ và đủ > ngắn mơ hồ.
