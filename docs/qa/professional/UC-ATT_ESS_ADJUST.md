# Use Case — Điều chỉnh chấm công / đi muộn (ESS)

| Meta | Value |
|------|--------|
| **Doc ID** | `PO-PRO-TC-UC-ATT-01` |
| **UC / FR** | **UC-HRM-MOB-06..08** · UF-HRM-05 · liên quan AT-01..03 BA · U84 **P-ATT-ADJ** |
| **Mục tiêu UC** | NV gửi yêu cầu chỉnh giờ/đi muộn có lý do; QL duyệt/từ chối; bản ghi phản ánh đúng kỳ; không epoch 1970 |
| **Actors** | NV ESS · QL ca / manager · (tuỳ) Inbox XBOS — **GOVERNANCE_LOCK** nếu code WF chưa có |
| **Surfaces** | Mobile Điều chỉnh / Cần duyệt · Web Chấm công · (XBOS inbox nếu bridge) |
| **Design status** | **DESIGNED** |
| **execution** | not started |

---

## 1. Cây nghiệp vụ

| Cap-ID | Nghiệp vụ | Mục đích |
|--------|-----------|----------|
| **CAP-ATT-01** | Tạo yêu cầu điều chỉnh | NV đăng ký sửa giờ / đi muộn |
| **CAP-ATT-02** | Validate dữ liệu gửi | Ngày · lý do · định dạng giờ |
| **CAP-ATT-03** | Phê duyệt / từ chối | QL xử lý pending |
| **CAP-ATT-04** | Đồng bộ bản ghi chấm công | Sau duyệt thấy đúng kỳ |
| **CAP-ATT-05** | Phạm vi công ty / header | list↔approve cùng scope (`x-company-id`) |
| **CAP-ATT-06** | Kênh XBOS WF (tuỳ AS-IS) | Inbox task — LOCK nếu chưa có constant |

**Đếm nghiệp vụ:** **6**

---

## 2. Chức năng

| Cap | FN-ID | Chức năng | Mutate? |
|-----|-------|-----------|---------|
| 01 | **FN-ATT-NAV** | Vào màn tạo điều chỉnh (HDSD) | N |
| 01 | **FN-ATT-CREATE** | Gửi update-request | Y |
| 01 | **FN-ATT-LIST-OWN** | NV xem đơn mình | N |
| 02 | **FN-ATT-VAL-DATE** | Thiếu/sai ngày | Y reject |
| 02 | **FN-ATT-VAL-REASON** | Thiếu lý do | Y reject |
| 02 | **FN-ATT-VAL-TIME** | Giờ sai format / BE TIMESTAMPTZ | Y reject |
| 03 | **FN-ATT-LIST-MGR** | QL xem pending | N |
| 03 | **FN-ATT-APPROVE** | Duyệt (**203** `HRM-ATT-REQ-203`) | Y |
| 03 | **FN-ATT-REJECT** | Từ chối | Y |
| 04 | **FN-ATT-RECORDS** | Xem lịch sử / sheet sau duyệt | N |
| 05 | **FN-ATT-SCOPE** | Approve/list đúng CT | Y/AU |
| 06 | **FN-ATT-XBOS-INBOX** | Duyệt qua Inbox XF | Y | GOVERNANCE_LOCK |

**Đếm chức năng:** **12**

---

## 3. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | **Σ** |
|-------|---:|---:|---:|---:|---:|----:|
| FN-ATT-NAV | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-ATT-CREATE | 2 | 0 | 1 | 0 | 0 | 3 |
| FN-ATT-LIST-OWN | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-ATT-VAL-DATE | 0 | 1 | 0 | 0 | 0 | 1 |
| FN-ATT-VAL-REASON | 0 | 1 | 0 | 0 | 0 | 1 |
| FN-ATT-VAL-TIME | 0 | 1 | 1 | 0 | 0 | 2 |
| FN-ATT-LIST-MGR | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-ATT-APPROVE | 2 | 1 | 0 | 1 | 1 | 5 |
| FN-ATT-REJECT | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-ATT-RECORDS | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-ATT-SCOPE | 0 | 0 | 0 | 2 | 0 | 2 |
| FN-ATT-XBOS-INBOX | 0 | 0 | 0 | 0 | 0 | 0* |
| **Tổng** | | | | | | **25** (+ 2 LOCK inventory XBOS) |

\* XBOS: **2 TC GOVERNANCE_LOCK** (không claim HP) — `TC-ATT-XBOS-LOCK-001/002`.

---

## 4. Test Case Specification (P0)

| TC-ID | Cap | FN | Type | Pri | Steps (tóm) | Expected | Map |
|-------|-----|-----|------|-----|-------------|----------|-----|
| **TC-ATT-NAV-HP-001** | 01 | NAV | HP | P0 | Mobile → Điều chỉnh theo HDSD | Land đúng CreateUpdateRequest | AT-01 nav |
| **TC-ATT-NAV-UX-001** | 01 | NAV | UX | P2 | Mở khi offline/API down | Error rõ · không trắng | — |
| **TC-ATT-CREATE-HP-MOB-001** | 01 | CREATE | HP | P0 | Điền ngày+giờ+lý do → Gửi | **201** `HRM-ATT-REQ-201` · pending · F5 | AT-01 |
| **TC-ATT-CREATE-HP-WEB-001** | 01 | CREATE | HP | P0 | Web Chấm công → YC chỉnh → Gửi | **201** · list pending đúng CT · F5 | U84 ATT-ADJ |
| **TC-ATT-CREATE-BD-ISO-001** | 01 | CREATE | BD | P0 | FE gửi ISO/TIMESTAMPTZ hợp lệ (không HH:mm trần) | **201** không 500 | time-wire |
| **TC-ATT-LIST-OWN-HP-001** | 01 | LIST | HP | P1 | NV mở list đơn | Thấy đơn vừa tạo | — |
| **TC-ATT-LIST-OWN-UX-001** | 01 | LIST | UX | P2 | Empty | empty hợp lệ | — |
| **TC-ATT-VAL-DATE-FD-001** | 02 | VAL | FD | P0 | Thiếu ngày → Gửi | 4xx · không row | AT-02 |
| **TC-ATT-VAL-REASON-FD-001** | 02 | VAL | FD | P0 | Thiếu lý do | 4xx | AT-02 |
| **TC-ATT-VAL-TIME-FD-001** | 02 | VAL | FD | P0 | Giờ invalid | 4xx/500 đã hết sau fix — expect 4xx VI | — |
| **TC-ATT-VAL-TIME-BD-001** | 02 | VAL | BD | P1 | Biên 00:00 / 23:59 | accept hoặc reject documented | — |
| **TC-ATT-LIST-MGR-HP-001** | 03 | LIST | HP | P0 | QL mở pending | Thấy đơn NV | — |
| **TC-ATT-LIST-MGR-AU-001** | 03 | LIST | AU | P0 | QL CT khác | Không thấy | — |
| **TC-ATT-LIST-MGR-UX-001** | 03 | LIST | UX | P2 | Empty | empty | — |
| **TC-ATT-APPR-HP-MOB-001** | 03 | APPR | HP | P0 | QL Duyệt mobile | **203** · NV approved · badge ↓ · F5 | AT-01 AP |
| **TC-ATT-APPR-HP-WEB-001** | 03 | APPR | HP | P0 | QL web Eye→Duyệt + `x-company-id` | **203** · F5 approved | U84 R2 |
| **TC-ATT-APPR-FD-DBL-001** | 03 | APPR | FD | P1 | Duyệt 2 lần | 4xx/no-op | — |
| **TC-ATT-APPR-AU-409-001** | 03 | APPR | AU | P0 | Duyệt thiếu/sai company header | **409** deterministic (trước fix = bug) | scope |
| **TC-ATT-APPR-UX-001** | 03 | APPR | UX | P1 | Sau duyệt | Row biến khỏi pending | — |
| **TC-ATT-REJ-HP-001** | 03 | REJ | HP | P1 | Từ chối + lý do | rejected · F5 | — |
| **TC-ATT-REJ-FD-001** | 03 | REJ | FD | P2 | Lý do ngắn | 4xx nếu rule có | — |
| **TC-ATT-REC-HP-001** | 04 | REC | HP | P0 | Sau approve → Lịch sử / sheet | Bản ghi đúng kỳ · **≠** 01/01/1970 | AT-03 |
| **TC-ATT-REC-UX-001** | 04 | REC | UX | P2 | Chưa có bản ghi | empty hợp lệ | — |
| **TC-ATT-SCOPE-AU-LIST-001** | 05 | SCOPE | AU | P0 | CEO list slug vs UUID | Thấy pending cùng CT sau create | list parity |
| **TC-ATT-SCOPE-AU-APPR-001** | 05 | SCOPE | AU | P0 | Approve đúng OU | 203 không 409 | header |
| **TC-ATT-XBOS-LOCK-001** | 06 | XBOS | LOCK | P2 | Tìm WF ATT trên Inbox | Document **GOVERNANCE_LOCK** — không EVIDENCED giả | C3 |
| **TC-ATT-XBOS-LOCK-002** | 06 | XBOS | LOCK | P2 | Khi bridge ship | Placeholder HP inbox | future |

---

## 5. Coverage check

| Check | Required | In design | GAP |
|-------|----------|-----------|-----|
| 6 nghiệp vụ | 6 | 6 | 0 |
| Create mobile+web HP | 2 | 2 | 0 |
| Validate date/reason/time | 3 | 3 | 0 |
| Approve + scope | P0 | có | 0 |
| Records no epoch | 1 | 1 | 0 |
| XBOS inbox | AS-IS | LOCK inventory | honest |

**Design complete (A):** YES.  
**execution:** not started.

---

## 6. Map BA AT-* 

| AT | Professional |
|----|----------------|
| AT-01 | NAV + CREATE + APPR HP |
| AT-02 | VAL-DATE / VAL-REASON |
| AT-03 | REC-HP-001 |

---

*PO-PRO-TC-UC-ATT-01 · DESIGNED · 25+2 LOCK · execution not started*
