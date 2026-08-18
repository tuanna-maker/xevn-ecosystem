# PO-HRM-UI-BRAND-W3-ATT-G2 — Rules tablet/proxy/auto + CFG + users/roles/system honesty

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-ATT-G2` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **RE-DISPATCH** | stall#1 evidence MISS (prior `cfc39090`) — **CLOSED** this seat (confirm remaster → verify → WRITE evidence) |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` W3-ATT-G2 · S76–S85 |
| **Prior** | ATT-G1-QA PASS `docs/qa/evidence/po-hrm-ui-brand-w3-att-g1-qa.md` |
| **change_mode** | `UPGRADE` / stall `FIX` · preserve_default · honesty stubs kept |
| **ack_status** | **READY_FOR_QA** |
| **attendance_closed** | **false** |
| **face_live** | **false** |
| **prop_03e** | **SKIP** (unmounted honesty — not invent) |
| **remaster_program_done** | **false** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8 pale ban · §9 dual-surface · §10 ops-dense (Alert title ≥20 bold; primary `#1E40AF`; text `#111827`) |
| **Inventory** | S76 tablet STUB · S77 proxy/ủy quyền GĐ2 STUB · S78 auto STUB ACCEPTED_AS_IS · S79–S82 CFG redirect (OT/leave/late/forms) · S83–S85 users/roles/system STUB |
| **Program** | `HRM_UI_BRAND_REMASTER_PROGRAM.md` W3 FE-ATT slice G2 |
| **Skill** | `xevn-precision-motion-theme` — body `#111827` · secondary `#4B5563` · muted placeholder/icon only |
| **must_keep** | tablet/proxy/auto featureInDev no-op (no invent LIVE CFG) · CFG redirect link-only · users/roles/system stub no-op · Face HOLD · PROP-03e SKIP · ATT-A..G1 wires · no Nest/seed · no Attendance CLOSED |

---

## Paths touched

| Path | Role |
|------|------|
| `apps/web/hrm/src/pages/Attendance.tsx` | S76–S85 honesty chrome + CODE-MEMORY ATT-G2 stall#1 |
| `apps/web/hrm/src/i18n/locales/vi.json` | stub/CFG/GĐ2 honesty keys (`stubBadge`, `cfgRedirectBadge`, `acceptedAsIsBadge`, `rulesChannelStubHold`, `settingsSidebarStubHold`) |
| `apps/web/hrm/src/i18n/locales/en.json` | same keys EN |

**Not touched:** Nest · seed · Face LIVE invent · PROP-03e remount · Attendance CLOSED claim · ATT-A..G1 mutate wires · remaster DONE claim.

---

## Surfaces remastered (10 inventory)

| surface_id | Path(s) | Change summary |
|------------|---------|----------------|
| S76 | Rules → Máy tính bảng | STUB banner title ≥20 + badge; empty Card sharp; `att-rules-tablet-stub-precision` |
| S77 | Rules → Ủy quyền chấm | GĐ2 badge + STUB hold copy; no invent proxy LIVE; `att-rules-proxy-stub-precision` |
| S78 | Rules → Tự động | STUB + ACCEPTED_AS_IS badges; honesty empty; `att-rules-auto-stub-precision` |
| S79 | Settings → Quy tắc tăng ca | CFG redirect Alert ≥20 + link `/settings`; `att-cfg-redirect-overtime-precision` |
| S80 | Settings → Quy tắc nghỉ | CFG redirect; `att-cfg-redirect-leave-rules-precision` |
| S81 | Settings → Đi muộn/Về sớm | CFG redirect; `att-cfg-redirect-late-early-precision` |
| S82 | Settings → Quy tắc đơn từ | CFG redirect; `att-cfg-redirect-request-rules-precision` |
| S83 | Settings → Người dùng | STUB hold banner ≥20 + empty Card; `att-settings-users-stub-precision` |
| S84 | Settings → Vai trò | Same STUB honesty; `att-settings-roles-stub-precision` |
| S85 | Settings → Hệ thống | Same STUB honesty; `att-settings-system-stub-precision` |

**Shared chrome:** rules shell `att-settings-rules-precision` (title ≥20; suggest CTA disabled honesty; sub-tab underline primary); settings sidebar active `bg-xevn-primary` (ATT-F kept).

**OUT / SKIP this seat:**
- Face LIVE / mobile MVP
- PROP-03e EmployeeQRCard invent
- Nest CFG persist invent on Attendance
- ATT-A..G1 PASS surfaces mutate reopen
- Attendance CLOSED / remaster DONE

---

## Honesty / HOLD preservation

| Control | Status |
|---------|--------|
| S76 tablet = STUB featureInDev (no persist form) | kept |
| S77 proxy = GĐ2 STUB (no ủy quyền LIVE) | kept |
| S78 auto = STUB + ACCEPTED_AS_IS (no invent auto CFG) | kept |
| S79–S82 CFG = redirect to `/settings` only (no Nest invent) | kept |
| S83–S85 users/roles/system = STUB no-op | kept |
| Suggest method CTA disabled | kept |
| Face HOLD / PROP-03e SKIP | untouched |

---

## Wire non-regression (spot)

| Wire | Status |
|------|--------|
| Rules Chung/Standard/App PATCH | untouched |
| ATT-03d GPS work-sites CRUD | untouched |
| LeaveTab / OT / trip / update LIVE | untouched |
| Face featureHold | untouched |
| Employee import / emp refresh | untouched |

---

## Verify

```text
pnpm run verify:xevn:theme-contrast -- --strict
→ exit 0
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] STRICT PASS — 0 pale hits
```

---

## residual

| id | severity | note |
|----|----------|------|
| none P0/P1 | — | PRODUCT_STUB honesty intentional until catalog SoT / GĐ2 API |

---

## handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-W3-ATT-G2
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w3-att-g2.md
entry_criteria: theme-contrast --strict exit 0 · evidence written · ATT-G1-QA CLOSED
exit_criteria: U65 browser S76–S85 honesty PASS · no Face LIVE · no seed · no Attendance CLOSED
cấm: seed · Nest invent · Face LIVE · PROP-03e invent · remaster DONE · reopen ATT-A..G1 without regression
```

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-BRAND-W3-ATT-G2-QA
from_role: pm
to_role: qa
priority: P0
entry_criteria: READY_FOR_QA · docs/qa/evidence/po-hrm-ui-brand-w3-att-g2.md · theme-contrast --strict exit 0
scope: U65 browser ceo@xe.vn — Settings/Rules S76–S85
AC:
  - S76 tablet STUB honesty (no LIVE form)
  - S77 proxy GĐ2 STUB honesty
  - S78 auto STUB + ACCEPTED_AS_IS
  - S79–S82 CFG redirect banner + link /settings (no invent)
  - S83–S85 users/roles/system STUB honesty
  - titles ≥20 · primary #1E40AF · text #111827 · no pale
  - Face never LIVE · PROP-03e not invent · mutates=0 on stubs
  - Attendance not CLOSED · remaster not DONE
cấm: seed · API-only UF · Nest invent
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w3-att-g2-qa.md
```
