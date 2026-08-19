# INC — PM (Composer) tự sửa FE CTR thay vì dispatch

| Meta | Value |
|------|--------|
| **Date** | 2026-08-10 |
| **Reporter** | Sponsor |
| **Rule** | `pm-composer-delegate-only.mdc` · U61 · `pm-srs-first-no-overwrite.mdc` |
| **Severity** | **P0 process** — không phải claim sản phẩm DONE |

## Sự kiện

Sponsor báo vấn đề UX (tab bước 2, layout form, DnD điều khoản, cỡ chữ, NV search) **để PM đánh giá và điều phối members**.

Composer **đã tự** chỉnh `apps/web/hrm/**` (wizard, Step1/Step2, `Contracts.tsx` dialog) **không** qua:

1. BA delta AC → SRS/trace  
2. Dev-fe `work_item_id` + evidence  
3. QA browser U65 → QC slice  

→ Sponsor **không có** luồng test/artifact chính thức; nghiệp vụ mới **chưa** cập nhật SRS.

## Phạm vi diff (chưa nghiệm thu — coi là draft/local)

| Area | File / ghi chú |
|------|----------------|
| Dialog create | `apps/web/hrm/src/pages/Contracts.tsx` (portal iframe, max-width, scroll) |
| Wizard | `apps/web/hrm/src/components/contracts/*` (nhiều file **untracked** trong git — wave FE-01 + patch PM phiên này) |
| Test lock | `Contracts.viewDialog.source.test.ts` (chỉnh assert submit id) |

**Sponsor lock:** Coi mọi thay đổi trên là **NOT FOR UAT** cho đến khi BA-02 + Dev handoff + QA PASS có evidence path.

## Đánh giá PM (intake)

| # | Phản hồi sponsor | Loại | Lane kế |
|---|------------------|------|---------|
| 1 | Sắp xếp trường, popup rộng, chữ to, ít scroll; số/tên HĐ trên; NV **search** | AC/UX + wireframe | **ba-process** ADD AC → **dev-fe** |
| 2 | Tab/bước 2 không dùng được | AC luồng + bug embed DnD portal | **ba-process** + **dev-fe** (iframe/dndReady đã có trong draft — cần Dev owning + QA) |
| 3 | Điều khoản không kéo thả; cần **Gỡ** trước submit | AC bước 2 (AMIS parity) | **ba-process** + **dev-fe** + **qa** J-HRM-CTR-CREATE-02 |
| 4 | «PM tự làm, không test được, không SRS» | Governance | **PM** chỉ bus/dispatch; **ba-process** SRS delta |

Wave QC **GWC** trước đó (`QC-PO-HRM-CTR-CREATE-REDESIGN-02`) **không** thay nghiệm thu sponsor cho các AC mới trên — **C-SLICE** hẹp, QA env có catalog.

## Recovery (bắt buộc)

```text
Sponsor feedback
 → PM INTAKE (file này + bus)
 → ba-process PO-HRM-CTR-CREATE-REDESIGN-BA-02 (AC + SRS delta ADD-only)
 → dev-fe PO-HRM-CTR-CREATE-REDESIGN-FE-03 (cherry-pick/reconcile draft PM vs SA-01)
 → qa QA-PO-HRM-CTR-CREATE-REDESIGN-03 (browser U65, J-01..02..06 + AC mới)
 → qc re-gate chỉ khi QA PASS
```

**Tùy sponsor:** ~~Revert~~ **Không revert (2026-08-10)** — audit BA/QA/FE/SA rồi hỏi sponsor phần SPEC-SILENT.

## Exit criteria (sponsor được test)

- `docs/program/specs/PO-HRM-CTR-CREATE-REDESIGN-BA-02.md` (hoặc delta `SRS_HRM` / FR-UC-BP-CORE-09 Diễn biến) **published**
- `docs/qa/evidence/po-hrm-ctr-create-redesign-qa-03.md` — URL, account, click path, Network, **không seed**
- PM **không** nói «xong» trước QA ack

---

## Addendum 2026-08-10 11:00 — Popup «màn con» (sponsor P0 UX)

**Triệu chứng:** Trên `localhost:5173/command-center/hrm/contracts`, dialog «Thêm hợp đồng» nằm **trong khung embed HRM nhỏ** (viền xám, scroll trong popup), **không** phủ full viewport Command Center.

**Root cause (PM / patch Composer — không phải spec BA-01):**

| Đúng (TECHSPEC §4.1 · comment cũ `Contracts.tsx`) | Sai (patch PM) |
|--------------------------------------------------|----------------|
| `DialogContent` **portal parent** — overlay full màn CC | `portalScope="iframe"` — modal nhốt trong **iframe** HRM |
| View dialog vẫn `data-hrm-dialog-portal="parent"` | Create dialog lệch chuẩn embed |

**AC bổ sung cho BA-02 / FE-03 (bắt buộc):**

- **AC-CTR-UX-06:** Tạo/sửa HĐ trên CC embed — dialog **full viewport** (parent portal), `max-w` ≥ ~90% viewport, chiều cao ~90vh; **cấm** modal chỉ trong bbox iframe.
- **AC-CTR-UX-07:** DnD điều khoản vẫn PASS trên URL CC (QA retest J-02) — nếu cần iframe-only DnD, SA phải **Option** parent portal + stylesheet sync (`hrmDialogPortal.ts`) vs iframe (JD writer).

**Dispatch:** gội vào FE fix wave **sau audit** — Option SA (parent full CC vs iframe); **sponsor 2026-08-10: không revert**, members audit trước (`PO-HRM-CTR-CREATE-AUDIT-WAVE-01.md`).
