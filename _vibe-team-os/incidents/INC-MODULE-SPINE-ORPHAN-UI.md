# INC — Spine module có, form/nút orphan (XeVN Tuyển dụng 2026-08-06)

| Field | Value |
| --- | --- |
| **ID** | INC-MODULE-SPINE-ORPHAN-UI |
| **Project** | xevn-ecosystem (HRM Recruitment → mở rộng mọi menu) |
| **Date** | 2026-08-06 |
| **Severity** | P0 process + P0 product honesty |
| **Doctrine** | `36-MODULE-E2E-SPINE-LINKAGE.md` |
| **Evidence anchor** | `docs/program/specs/PO-HRM-REC-E2E-LINKAGE-SPEC-01.md` |

## What happened

Sponsor mở **Thêm ứng viên** → «Vị trí ứng tuyển» là **ô điền tay**; **So sánh ứng viên** trống (neo «tin tuyển»); **Kế hoạch** console đỏ. Hỏi: BA/senior BA đâu — các nút/màn có liên kết không?

Thực tế audit:

1. **Enterprise SRS đã có spine MVP** (JD → YCTD → UV gắn YCTD → dashboard; tin đăng OUT).
2. **Depth BA nông** trên form Thêm UV + So sánh: thiếu Diễn biến khóa SELECT/YCTD; team picker lock (`BR-HRM-MD-01`) **không** được enforce trên FE/DTO.
3. FE leftover neo **sai entity** (`job_postings` hard-empty) trong khi MVP SoT = **YCTD**.
4. Wave trước: **slice QC GWC** (JD dynamic / UI P0) bị hiểu nhầm gần «module sẵn» — **không** thay E2E linkage.

Sponsor yêu cầu mở rộng cùng class sang Nhân sự · Chấm công · Lương · Cài đặt · Quy trình.

## Root class (không phải «thiếu data»)

| Class | Meaning | REC example |
| --- | --- | --- |
| **C-ORPHAN-FIELD** | Free-text / mock khi SoT = SELECT catalog / FK | Vị trí UV gõ tay |
| **C-ORPHAN-SCREEN** | Modal/nút không có nguồn từ bước trước | So sánh rỗng cứng |
| **C-SPINE-BREAK** | Tab A không sinh khóa mang Tab B | Plan ≠ định biên → YCTD |
| **C-WRONG-SOT** | UI neo entity OUT MVP / leftover | Compare ↔ `job_postings` |
| **C-SPEC-SHALLOW** | Spine module có, FR form thiếu | UV gắn YCTD nói chung, không Diễn biến form |
| **C-SLICE-≠-MODULE** | GWC hẹp ≠ UAT module | JD QC ≠ recruitment UAT |

## Corrective action

| Action | Owner |
| --- | --- |
| Doctrine `36-MODULE-E2E-SPINE-LINKAGE.md` + rule OS | PM / OS |
| ba-docs merge Diễn biến UV/YCTD + compare | ba-docs |
| Program scorecard mọi menu HRM | ba-process seats |
| Dev HOLD UV/compare đến sau SRS+Tech/DB/API | pm |
| Cấm claim `*_uat_ready` từ slice GWC | qc / pm |

## Pattern class (1 câu)

> **Spine module trên SRS ≠ đã nghiên cứu xong từng nút/form.**  
> Mỗi mutate surface phải có khóa mang từ bước trước (SELECT/FK), đúng entity SoT — không free-text «cho chạy», không stub empty vĩnh viễn.

## Do / Don't (PM/PO)

| Do | Don't |
| --- | --- |
| Trước Dev: bảng **nút/tab → FR → khóa mang → màn kế** | Chỉ đọc mục lục FR / «module đã có SRS» |
| Khi sponsor bắt 1 orphan → **mở rộng** sibling menus cùng class | Vá 1 field rồi claim module OK |
| Phân `spec_gap` vs `impl_gap` vs `wrong SoT` vs `console` | Đổ hết «chưa seed / chưa data» |
| Slice GWC ghi rõ **không** promote module UAT | Gộp JD PASS + UI pack = tuyển dụng sẵn |
| Team BR picker lock → QA enforce trên form thật | Để DTO «Lane B free-text» sống song song SoT |

## Reuse-tag

`module-spine-orphan-ui` · `e2e-linkage-scorecard` · `slice-neq-module-uat`
