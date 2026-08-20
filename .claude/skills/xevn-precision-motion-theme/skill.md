---
name: xevn-precision-motion-theme
description: >-
  Xây dựng và áp dụng brand/theme toàn hệ (XeVN Precision Motion hoặc dual-surface
  tương đương): token sắc nét, cấm chữ nhạt kiểu AI, remaster mọi màn web+mobile,
  ops-first density. Dùng khi sponsor OK brand, yêu cầu theme, phàn nàn chữ khó đọc,
  hoặc remaster UI toàn sản phẩm.
---

# Skill — Brand / Theme Remaster (Precision Motion)

## Khi nào dùng

- Sponsor: «OK brand», «làm theme», «sửa hết màn», «chữ nhạt / nhỏ», «nhiều thông tin thừa».
- PM mở program remaster — **không** hotfix 1 màn marketing.

## Đọc trước

1. `_vibe-team-os/17-BRAND-UIUX-THEME-REMASTER.md`
2. `_vibe-team-os/incidents/INC-AI-PALE-TEXT-CLUTTER-UX.md`
3. `_vibe-team-os/case-studies/xevn-ecosystem/knowledge/BRAND-UIUX-CASE.md`
4. Project: brand proposal + ADR sharp-ops (nếu đã có)

## Locks (bắt buộc)

| Lock | Giá trị |
|------|---------|
| Text | `#111827` (hoặc tương đương ≥ Gray-900) |
| Text secondary | `#4B5563` |
| Text muted | `#6B7280` — **chỉ** placeholder / icon phụ |
| **Cấm** | `text-slate-400`, `#9CA3AF`, `text-muted-foreground` làm body/label bảng |
| Type web | body ≥15px (ưu tiên 16); table ≥14; title ≥20 bold |
| Type mobile | body ≥17 |
| Scope | **Tất cả** màn in inventory — theme foundation trước remaster |

## Pipeline (PM dispatch)

```
SA ADR tokens → BA screen inventory → ba-docs HTML P0 (nếu gap)
 → Dev-FE theme foundation → Dev-Mobile tokens
 → Squad remaster FE-W1 / FE-HRM / MOB-W2
 → QA contrast + density → QC GWC
```

Mỗi Task: 1 outcome, 1 evidence_path, cite ADR. Squad: `16-SQUAD-PARALLEL-ORCHESTRATION.md`.

## Dev checklist

- [ ] CSS vars `:root` + Tailwind / RN tokens mirror ADR
- [ ] HRM shadcn `muted-foreground` ≠ body text
- [ ] Grep/lint gate pale classes
- [ ] Login/splash: dark brand shell (Option A) nếu SoT project yêu cầu
- [ ] Không đổi API/SRS; chỉ token/chrome/layout density

## Anti-patterns

- Một Task «refactor toàn UI»
- Chỉ đổi primary color, giữ chữ nhạt
- Thêm stats strip / chip cluster «cho đẹp»
- Purple/cream AI default themes
- Claim DONE khi chỉ login đẹp, business screens còn pale

## Handoff

`completion_report` + `next_dispatch_prompt` + evidence screenshot/contrast note.  
Reuse-tag: `brand-theme-remaster` · `sharp-ops-contrast`
