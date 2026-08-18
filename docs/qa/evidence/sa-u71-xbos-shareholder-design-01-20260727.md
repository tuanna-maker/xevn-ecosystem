# SA-U71-XBOS-SHAREHOLDER-DESIGN-01 — Physical DB_DESIGN + API_DESIGN (F.1)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-XBOS-SHAREHOLDER-DESIGN-01` |
| **lane** | governance · U71 P0 |
| **date** | 2026-07-27 |
| **change_mode** | ADD |
| **forbidden** | `apps/**` (not touched) |
| **ack_status** | **PASS_TO_PM** |

---

## 1. Spec read ack

| Layer | Path · section |
|-------|----------------|
| Gap scan | `docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md` — shareholders P0 row |
| TechSpec | `docs/xbos/TECHSPEC.md` **§14.6 FR-CC-P0-01** |
| CC P0 TechSpec | `docs/xbos/COMMAND_CENTER_P0_TECHSPEC.md` §2 table · §4 API · §6 codes |
| SRS khách | `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` **§3.6** Diễn biến #1–7 |
| SRS team | `docs/xbos/COMMAND_CENTER_P0_SRS.md` UC-CC-P0-01 |
| UF | `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` **UF-XBOS-04** · **UF-XBOS-05** 🟢 |
| Style | `docs/hrm/API_DESIGN_HRM_COMPANY_LIST.md` F.1 triad |
| Gate | `.cursor/rules/spec-db-api-design-gate.mdc` · OS `13` §3.4.11.F/F.1 |
| Parent org | `docs/xbos/DB_DESIGN_XBOS_ORG_LEGAL.md` §1 deferred shareholders → this WI |
| Runtime truth | `LegalEntityProfileService` + migration `20260518_legal_entity_profile.sql` + OpenAPI G-OA-04 |

---

## 2. Deliverables

| Artifact | Path | Status |
|----------|------|--------|
| DB_DESIGN | `docs/xbos/DB_DESIGN_XBOS_SHAREHOLDERS.md` | **ADD** — columns, FK, soft-delete, partition, locale, residual «Loại cổ đông» |
| API_DESIGN | `docs/xbos/API_DESIGN_XBOS_SHAREHOLDERS.md` | **ADD** — GET list · POST create · PUT update each with Mục đích · Nghiệp vụ · Bước SRS · DTO↔DB · errors |

### F.1 checklist (API)

| Endpoint | Mục đích | Nghiệp vụ | Bước SRS | DTO↔DB | Errors |
|----------|----------|-----------|----------|--------|--------|
| GET `…/shareholders` | ✅ | ✅ | FR-CC-P0-01 #2 · #6 | ✅ | ✅ |
| POST `…/shareholders` | ✅ | ✅ | #1,#3,#4,#5,#7 · UF-04/05 | ✅ | XBOS-SHR-400/201 |
| PUT `…/shareholders/{id}` | ✅ | ✅ | #5 sửa · UC Alternate | ✅ | XBOS-SHR-404/201 |

---

## 3. Architecture notes (facts)

- Table SoT: `public.xbos_legal_entity_shareholder` — already migrated; design is **physical contract lock**, not new invent schema.
- Partition denorm from parent LE resolve — same for holding vs member (UF-05 vs UF-04).
- Success codes: list `XBOS-SHR-200`; create/update envelope `XBOS-SHR-201`; soft-delete `XBOS-SHR-204`.
- **must_keep:** UF-XBOS-04/05 🟢; U65 zero-seed; no `holder_type` invent.

---

## 4. Residual

| Item | Owner | Priority |
|------|-------|----------|
| Khách SRS «Loại cổ đông» không có cột/DTO | ba-process (delta) or defer | P2 |
| PUT path may not re-validate `ratioPercent` 0–100 | dev-be verify + jest | P2 when execution opens |
| Optional sum(ratio)=100 BR | BA | P3 — not in Diễn biến |

---

## 5. Handoff

### completion_report

**Closed:** U71 physical F.1 pair for XBOS shareholders — `DB_DESIGN_XBOS_SHAREHOLDERS.md` + `API_DESIGN_XBOS_SHAREHOLDERS.md` with list/create/update Mục đích · Nghiệp vụ · bước SRS (FR-CC-P0-01 Diễn biến) · DTO↔DB · errors; aligned to runtime + OpenAPI; no `apps/**`.

**Residual:** «Loại cổ đông» catalog gap; optional PUT ratio re-validate; no Dev dispatch required until product change wave (UF already 🟢).

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: SA-U71-PATH-CONVENTION-01 (or next open U71 P0 from scan)
role: sa
entry: Shareholders F.1 pair DONE — docs/xbos/DB_DESIGN_XBOS_SHAREHOLDERS.md + API_DESIGN_XBOS_SHAREHOLDERS.md
note: Do NOT dispatch Dev feature on shareholders unless product delta; UF-XBOS-04/05 already 🟢.
optional residual: ba-process — FR-CC-P0-01 «Loại cổ đông» map or mark N/A in SRS.
Queue remaining U71 writes from sa-u71-spec-gap-scan backlog (P1 modules).
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-xbos-shareholder-design-01-20260727.md`

### pm_dispatch_hint

Mark U71 shareholders physical pair **COMPLETE**; next U71 write waves per scan backlog — **not** Dev mutate on UF-XBOS-04/05 unless residual opened.
