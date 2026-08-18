# PO-HRM-UI-BRAND-W3-PORT-A — Portal login/shell/CC embed chrome remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-PORT-A` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **Priority** | P0 · RE-DISPATCH stall n=1 |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 **Accepted** |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` PORT-01…PORT-08 |
| **Program** | `docs/program/HRM_UI_BRAND_REMASTER_PROGRAM.md` W3 |
| **Foundation entry** | QA PASS `docs/qa/evidence/po-hrm-ui-brand-fe-foundation-01-qa.md` |
| **ack_status** | **READY_FOR_QA** |

---

## 1. spec_read_ack

| Field | Citation |
|-------|----------|
| **srs** | N/A theme remaster — no SRS FR rewrite (program lock) |
| **tech_spec / ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` **§8** pale-text locks · **§9** dual-surface portal vs HRM embed · **§10** modal ops-dense / `.xevn-dialog-surface` |
| **db_design** | N/A (chrome/tokens only) |
| **api_design** | N/A (no Nest / contract change) |
| **uc_ids / inventory** | PORT-01…PORT-08 (`W3-PORT-A`) |
| **change_mode** | `UPGRADE` (preserve honesty banners / soft-nav / membership chip) |
| **sponsor_confirm** | Chat remaster authorize · FILL UI-1=Có · UI-2=tất cả · ADR Accepted 2026-08-05 |
| **must_keep** | U65 zero-seed · stub/`featureInDev` honesty · embedScopeKey soft-nav · TopHeader BE `*_label` · no Attendance CLOSED claim · no Face web invent |
| **forbidden_paths** | Nest · seed · SRS rewrite · W3-ATT/EMP screen files |

**spec says / code does**

| ADR rule | Code |
|----------|------|
| §8 sharp text (`#111827` / `#4B5563`) | Login/shell/CC chrome → `text-xevn-text` / `text-xevn-textSecondary`; settings NAV labels no longer `text-slate-500/600` |
| §9 dual-surface | Portal owns TopHeader + iframe chrome; HRM AppLayout light ops canvas; dark brandShell only on login |
| §10 modal chrome | Portal + HRM login use `.xevn-dialog-surface` (thin primary bar from W2 FOUND) |
| Primary `#1E40AF` | CTA / sidebar-primary / employees chip `bg-primary` (was indigo) |

---

## 2. Batch PORT-01…08

| ID | Surface | Path | Remaster |
|----|---------|------|----------|
| PORT-01 | portal login | `apps/web/web-portal/src/pages/auth/LoginPage.tsx` | Dark `xevn-brand-shell` + `xevn-dialog-surface` · mark+wordmark · sharp labels · primary CTA |
| PORT-02 | Unified Shell | `apps/web/web-portal/src/pages/unified/UnifiedShellPage.tsx` | Sticky glass header · xevn tokens · no stats strip |
| PORT-03 | Command Center | `CommandCenterPage.tsx` + `settings-form-pattern.tsx` + `ExecutiveDashboardLayout.tsx` | Persona/settings hover → `xevn-background`; icons → `textMuted`; NAV/label constants → `textSecondary` |
| PORT-04 | CC Inbox | `CommandCenterInboxPage.tsx` | Shell glass + xevn tokens; honesty ApiLoadBanner kept |
| PORT-05 | HRM iframe shell | `HrmWorkspaceRoute.tsx` | Embed canvas `bg-xevn-background` / `text-xevn-textSecondary` (was slate) |
| PORT-06 | TopHeader | `TopHeader.tsx` | Sticky glass · safe-inline · membership hover xevn; BE `*_label` kept |
| PORT-07 | HRM login | `apps/web/hrm/src/pages/Login.tsx` | Parity portal — brandShell + dialog surface; removed marketing hero/chip strip; HrmApiSyncBanner honesty |
| PORT-08 | HRM shell | `AppSidebar.tsx` + `AppLayout.tsx` + `.sidebar-link` in `hrm/index.css` | Dark nav · indigo→primary · sharp section labels · light ops canvas embed/standalone |

**Not touched:** W3-ATT / W3-EMP screens · Nest · seed · Face web · Attendance CLOSED claim.

---

## 3. Verify (reproducible)

```bash
pnpm run verify:xevn:theme-contrast
# → token lockstep PASS; pale hits=0; PASS (debt 0 <= baseline 0); exit 0

pnpm run verify:xevn:theme-contrast -- --strict
# → STRICT PASS — 0 pale hits; exit 0
```

| Mode | Exit | Notes |
|------|------|-------|
| default | **0** | scanned 598 files; pale hits=0 |
| `--strict` | **0** | STRICT PASS |

**Seed:** none (U65).

---

## 4. Residual

| Item | Severity | Owner |
|------|----------|-------|
| CC deep settings **tables** still may use `text-slate-500` on column headers inside `CommandCenterPage` (business panels, not shell chrome) | P2 | W3-PORT-B / later CC content seat |
| Open Questions §3 B1–B5 blank — A1–A5 interim palette | Governance | Sponsor / SA |
| Browser L2.5 visual smoke PORT-01/06/05 | P1 QA | this handoff |
| Parallel W3-ATT-A / W3-EMP-A | Program | other seats |

---

## 5. Handoff

### completion_report

W3-PORT-A closed: remastered portal login/shell/CC embed chrome PORT-01…08 to Precision Motion (ADR-20260805 §8–§10). Finished stalled seat gaps (settings NAV `slate-500/600` → `xevn-textSecondary`; AppSidebar CODE-MEMORY + indigo→primary; section label sharpness). `verify:xevn:theme-contrast` + `--strict` exit **0**. Honesty / soft-nav / membership labels preserved. No Nest/seed/ATT/EMP screens.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-PORT-A-QA
from_role: pm
to_role: qa
priority: P0

Entry: FE READY_FOR_QA — docs/qa/evidence/po-hrm-ui-brand-w3-port-a.md
ADR: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
Inventory: PORT-01…PORT-08

Browser U65 (zero-seed) — persona ceo@xe.vn / Xevn@2026 · portal :8088 or :5175:
1) PORT-01 /login — dark brandShell + surface card + primary CTA; sharp labels (no slate-400 body)
2) PORT-06 TopHeader on /command-center — mark+wordmark + membership chip; sticky glass
3) PORT-05 /command-center/hrm/* — iframe chrome light ops; no second portal nav invent; soft-nav tab switch still works
4) PORT-07 HRM standalone /login (if stack) — parity brandShell (optional if only embed)
5) Re-run: pnpm run verify:xevn:theme-contrast && pnpm run verify:xevn:theme-contrast -- --strict → exit 0

Exit: evidence docs/qa/evidence/po-hrm-ui-brand-w3-port-a-qa.md · click path + URL · PASS_TO_PM
Cấm: seed · claim Attendance CLOSED · invent remaster program GO · Nest
```

### ack_status

**READY_FOR_QA**

### evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w3-port-a.md`
