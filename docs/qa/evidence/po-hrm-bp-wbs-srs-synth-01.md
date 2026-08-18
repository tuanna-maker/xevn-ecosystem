# Evidence — PO-HRM-BP-WBS-SRS-SYNTH-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-WBS-SRS-SYNTH-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-08-04 |
| **lane** | governance |
| **no_prompt_echo** | true |

---

## Deliverables (khách)

| # | Path | Phiên bản / ghi chú |
|---|------|---------------------|
| 1 | `docs/client-delivery/hrm-enterprise-blueprint/WBS_HRM_ENTERPRISE.md` | **v0.2** — 4 module REC/CORE/ATT/PAY → Task → UC-BP-* → BR → partner_req_id → Decision Q-*; Phụ lục ánh xạ mã cũ UC-HRM-BP-* |
| 2 | `docs/client-delivery/hrm-enterprise-blueprint/UC_INVENTORY.md` | **v0.2** — **34** UC khóa; 10 FR ưu tiên; cột partner_req + PPT; map 30 REQ |
| 3 | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` | **v0.2 mới** — skeleton 6 chương + **10 FR đủ 7 mục** (P0 edges + định biên/dashboard + C&B + timesheet SoT + formula + split-month) |

## Nguồn đã gộp (PASS inputs)

- `UC_BR_MATRIX_DEPTH.md` — UC-BP-* / BR-BP-* · P0: LV-05, SPL-01, TS-03  
- ADR Option A + `API_BOUNDARY_MAP` + `TECHSPEC_OUTLINE` (HOLD depth)  
- `DATA_OWNERSHIP_MATRIX.md` (12 entity — tham chiếu Ch.1/5 SRS)  
- `PARTNER_REQ_CATALOG_20260804.md` (30 REQ → cột partner_req_id)  
- WBS/UC_INVENTORY v0.1 — **không wipe**: align ID + Phụ lục C mapping  

## Preserve / cấm đã giữ

- Không đè `docs/hrm/SRS.md`  
- Không `apps/**`  
- Không claim implement / UAT DONE  
- Không mở DB_DESIGN wave  
- TechSpec / DB / API depth = **HOLD** (SRS §1.2, §6)  
- Customer text: Việt đơn giản; không prompt-echo pipeline  

## FR ưu tiên đã viết đủ 7 mục

1. UC-BP-REC-01 · 2. UC-BP-REC-08 · 3. UC-BP-CORE-01 · 4. UC-BP-CORE-02  
5. UC-BP-ATT-08 (BR-BP-LV-05) · 6. UC-BP-ATT-10 · 7. UC-BP-ATT-11  
8. UC-BP-PAY-01 (BR-BP-TS-03) · 9. UC-BP-PAY-02 (Q-PAY-FORMULA) · 10. UC-BP-PAY-04 (BR-BP-SPL-01)  

## Residual / chưa làm (đúng scope)

- 24 UC **Lịch** — chưa FR đầy đủ (đợt sau confirm inventory)  
- HTML build Bateco cho gói blueprint — chưa (markdown khách trước; generator HTML = wave riêng nếu PM yêu cầu)  
- TechSpec/DB/API full — HOLD  

## completion_report

- **Đóng:** Synth WBS + UC inventory + SRS skeleton/FR P0 vào gói khách; ID aligned `UC-BP-*`; partner_req + Decision gắn Task; HOLD kỹ thuật ghi rõ.  
- **Mở:** QC spot-check docs **hoặc** gói review khách (không Dev).

## next_owner

`qc` (docs spot-check) **hoặc** `pm` → sponsor review packet

## next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-DOCS-QC-01
from_role: pm
to_role: qc
lane: governance
entry_criteria: 3 file khách v0.2 tại docs/client-delivery/hrm-enterprise-blueprint/ (WBS, UC_INVENTORY, SRS)
exit_criteria: spot-check (1) không prompt-echo/meta pipeline trong body khách; (2) 10 FR ưu tiên đủ 7 mục; (3) HOLD TechSpec/DB/API ghi rõ; (4) UC-BP-* khớp matrix; (5) partner_req_id có trên WBS Task
evidence_path: docs/qa/evidence/po-hrm-bp-docs-qc-01.md
cấm: Dev apps/** · mở DB_DESIGN · claim UAT DONE
ack_status target: PASS_TO_PM (GO docs / GO WITH CONDITIONS)
```

**Alternate (không QC trước):** PM gửi sponsor review packet = 3 file trên + Decision backlog WBS Phụ lục B / SRS §6.1.
