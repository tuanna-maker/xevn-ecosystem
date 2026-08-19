# Compound + Team Memory — integration checklist (Business Change Compiler)

| Mục | Nội dung |
|-----|----------|
| **Mã** | `PO-BIZ-CHANGE-COMPILER-BA-01` |
| **ADR** | `docs/architecture/ADR-BUSINESS-CHANGE-COMPILER-20260805.md` §7 |
| **Schema hooks** | `compound_hooks` · `promote_os` trong `change-manifest.schema.json` v0.1.1 |
| **Invariant** | Memory / Compound **không** thay Spec-first · **không** thay `sponsor_confirm` |
| **Samples** | `change-manifest.example.json` → ATT / EMP / REC |
| **Audience** | PM / BA / SA / Dev lead — nội bộ |

---

## 1. Mục tiêu

Ghép **Compound Engineering** + **Team Memory** (agentmemory optional) vào vòng Business Change Compiler **như loadout và post-wave compound** — không thành SoT nghiệp vụ, không bắt buộc daemon / cloud memory.

```text
Excel/docs → Manifest JSON → [Memory LOADOUT] → Spec-first (giữ nguyên thứ tự)
  → Dev/QA/QC → [Compound UPDATE] → (optional) promote OS chapter 34
```

---

## 2. Pre-task loadout (khi `compound_hooks.pre_task_memory_loadout = true`)

Làm **trước** khi sửa spec/code. Tick đủ mới mở Task Dev.

| # | Check | Pass when |
|---|-------|-----------|
| L1 | Đọc Manifest path trong dispatch | `change_manifest_path` có trên bus/Task (Plane D — không dùng bundle `samples[]` làm path Dev) |
| L2 | `read_first[]` theo thứ tự Manifest | SRS → TechSpec → DB → API (hoặc HOLD có lý do) |
| L3 | `uc_ids` / `br_ids` / `slice_id` | Khớp catalog / gap matrix — không invent |
| L4 | Recall memory (optional) | agentmemory / `.agentmemory` theo `work_item_id` + `uc_ids` nếu có; **thiếu memory ≠ block** |
| L5 | `must_keep` + `forbidden_paths` | Ghi rõ trong Task; Phase A docs có `apps/**` |
| L6 | `sponsor_confirm.status` | `CONFIRMED` hoặc `WAIVED_HOTFIX_P0` trước Dev code; `CONFIRMED` ⇒ có `date` |
| L7 | `pipeline_stage` | Role không vượt stage (vd. Dev không code khi stage=`srs`) |
| L8 | `spec_read_ack` template sẵn | Dev/BA sẽ điền — Memory không thay ack |
| L9 | `traceability` (v0.1.1) | Khi stage ≥ `ready_for_dev`: srs/tech/db/api refs đủ theo impact |

**Cấm loadout:** dùng chat/memory làm AC; bỏ qua `spec_targets`; claim GO vì “đã recall”.

---

## 3. Spec-first gate (không đổi)

| # | Check | Pass when |
|---|-------|-----------|
| S1 | Thứ tự | SRS → sponsor confirm → TechSpec(`ref_srs`) → DB_DESIGN → API_DESIGN → test plan → Dev |
| S2 | Manifest chỉ **feed** | Có `uc_ids`, `ac`, `allowed_paths` — không cấp quyền code khi thiếu confirm |
| S3 | Slice + neo | `slice_id` + `neo_tags` map OS `22`; diff ⊆ `allowed_paths` |
| S4 | Hotfix | Chỉ `WAIVED_HOTFIX_P0` + owner + expiry trong `sponsor_override` / confirm notes |

---

## 4. Post-task compound (khi `compound_hooks.post_task_memory_update = true`)

Sau `PASS_TO_PM` / QC verdict wave — **cùng phiên** nếu có lesson.

| # | Check | Pass when |
|---|-------|-----------|
| C1 | Bus + evidence | Handoff đủ `completion_report` · `next_dispatch_prompt` · `evidence_path` |
| C2 | Slice / DOC-DELTA | Cập nhật slice hoặc matrix nếu path đụng |
| C3 | Team Memory layer | Ghi lesson ngắn (Context/Action/Outcome/Evidence) — **không** secret |
| C4 | agentmemory (optional) | `memory_save` concept tags = `work_item_id` / UC — fail soft |
| C5 | Operating-model lesson? | Nếu lặp ≥2 wave → xét `promote_os` (checklist §5) |
| C6 | Superpowers-like skills | Chỉ ADD checklist dưới OS `skills/` — **không** đè Spec-first / role cards |

---

## 5. Promote OS (`promote_os.required` / `promote_os_on_lesson`)

| # | Check | Pass when |
|---|-------|-----------|
| P1 | Target đúng | Full `_vibe-team-os` có `02-SPEC-FIRST-GATE.md` … chapter 33 — **cấm** stub 2-file |
| P2 | Packet | Làm theo `docs/program/BIZ_COMPILER_OS_PROMOTE_PACKET.md` |
| P3 | Chapter | ADD `34-BUSINESS-CHANGE-COMPILER.md` (outline § packet) |
| P4 | Templates + schema | Copy Excel map + example + schema từ pilot |
| P5 | MANIFEST / PM-START | Bump list docs + situation row “Sponsor Excel / change batch” |
| P6 | Invariant text | Chapter 34 ghi rõ: Spec-first unchanged; Memory/Compound = loadout/compound only |
| P7 | No Tencent mandatory | Không liệt kê cloud memory stack là dependency GO |

---

## 6. Anti-patterns (reject)

| Anti-pattern | Xử lý |
|--------------|--------|
| “Compound memory đã có → khỏi SRS” | NO-GO · re-dispatch BA |
| Daemon / Tencent bắt buộc để GO | Xóa khỏi exit criteria |
| Manifest không có `ac` / `uc_ids` | FAIL compile |
| Dual-write Excel ≠ JSON im lặng | Manifest wins · BA re-emit |
| Wave compiler sửa `apps/**` | Vi phạm U77 Phase A |
| Prompt-echo vào HTML khách | `no_prompt_echo` — reject ba-docs |
| Bundle `samples[]` đưa thẳng làm `change_manifest_path` Dev | Tách 1 Plane D object / wave (`CM-VAL-008`) |

---

## 7. Checklist nhanh copy vào evidence

```markdown
### Compound/Memory checklist
- [ ] L1–L9 pre-task loadout
- [ ] S1–S4 Spec-first
- [ ] C1–C6 post-task (nếu hooks bật)
- [ ] P1–P7 chỉ khi promote_os
- [ ] Không Tencent mandatory · không thay sponsor_confirm
```

---

## 8. Liên kết

- U77 — `docs/program/TEAM_USER_REQUIREMENTS.md`  
- Example Manifest — `docs/program/schemas/change-manifest.example.json`  
- OS promote — `docs/program/BIZ_COMPILER_OS_PROMOTE_PACKET.md`  
- Evidence BA — `docs/qa/evidence/po-biz-change-compiler-ba-01.md`
