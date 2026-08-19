# Chương trình — Remaster UI / Brand (Precision Motion)

| Field | Value |
|-------|--------|
| **Program ID** | `PO-HRM-UI-BRAND-REMASTER-01` |
| **Date open** | 2026-08-05 |
| **Sponsor authorize** | Chat «cho team làm luôn wave thiết kế lại» + FILL **UI-1=Có** · **UI-2=tất cả màn** (squad song song) |
| **Skill** | `xevn-precision-motion-theme` |
| **Scope** | Portal shell + HRM embed (ATT/EMP/REC/PAY) + Mobile tokens (Face MVP mobile) |
| **Cấm** | Fake seed · claim Attendance CLOSED · purple/cream AI theme |
| **Parallel** | Sponsor 2026-08-05: remaster UI **song song** wave nghiệp vụ từ CHOT/REMAINING (GPS · quỹ phép · Face mobile · config CRUD) — không chờ TechSpec depth xong mới sơn UI |

## Waves

```text
W0 SA ADR tokens + assumptions (OPEN brand Q từ SPONSOR_UI_BRAND_OPEN_QUESTIONS)
W1 BA inventory mọi màn/popup (ATT deep 90 + EMP 28 + REC/PAY + portal)
W2 Dev-FE theme foundation (CSS vars · pale-text gate · shadcn)
W3 Squad remaster FE-HRM / FE-portal (theo inventory batches)
W4 Dev-Mobile tokens + Face MVP chrome
W5 QA contrast/density → QC GWC
```

## Assumptions đến khi sponsor điền §3 Open Questions

| # | Assumption (SA được dùng tạm) | Sponsor override |
|---|-------------------------------|------------------|
| A1 | Brand = XeVN / X-BOS ops dual-surface; primary `#1E40AF` | §3 B1 |
| A2 | Text sharp locks theo skill (`#111827` body) | §3 Q2 |
| A3 | Ops-dense — không hero marketing trên modal nghiệp vụ | §3 U1 |
| A4 | Modal: token + typography + header brand nhẹ — không full-bleed ảnh | §3 U2 |
| A5 | Stub/`featureInDev` vẫn remaster chrome + giữ honesty banner | §3 S3 |

## Exit program

- [x] ADR tokens merged / cited — `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` · evidence `docs/qa/evidence/po-hrm-ui-brand-adr-01.md` (W0 · Option A · 2026-08-05)
- [ ] Inventory coverage = surface SoT (REC/PAY + remaining Open Q B1–B5 still open)
- [x] Theme foundation + pale grep gate PASS — `PO-HRM-UI-BRAND-FE-FOUND-01` · `pnpm run verify:xevn:theme-contrast` (+ `--strict`) exit 0 · evidence `docs/qa/evidence/po-hrm-ui-brand-fe-found-01.md` (2026-08-05)
- [~] P0 squads remastered with screenshot evidence — **W3 PORT+EMP+ATT A–G2 chrome GWC** + **W4 PORT-LOGIN + ATT-DIALOG-EXT + PAY-A + REC-A chrome GWC** (`po-hrm-ui-brand-w4-qc-01.md`, 2026-08-05); W4-PAY-B / W4-MOB Face MVP / EMP neo **open** · **remaster_program_done=false**
- [x] QA contrast + QC GWC — **W3 chrome slice** `PO-HRM-UI-BRAND-W3-QC-01` **GO WITH CONDITIONS** · `docs/qa/evidence/po-hrm-ui-brand-w3-qc-01.md`

### W3 chrome stamp (2026-08-05) — `PO-HRM-UI-BRAND-W3-PM-CLOSE-01`

| Flag | Value |
|------|--------|
| **W3 brand chrome** | **GWC CLOSED** (Foundation + PORT-A/B + EMP-A/B/C + ATT-A..G2) |
| **remaster_program_done** | **false** |
| **attendance_closed** | **false** |
| **employees_closed** | **false** |
| **face_live** | **false** (web HOLD · product = W4-MOB) |
| **product_go** | **false** |
| **QC evidence** | `docs/qa/evidence/po-hrm-ui-brand-w3-qc-01.md` |

**GWC P2 closed:** `OBS-PORTAL-5173` — portal Vite restored (`docs/qa/evidence/po-hrm-ui-brand-obs-portal-5173.md` · 2026-08-05).

**W4-PAY-B GWC CLOSED** (P05–P17 chrome · QC GWC · remaster_done=false)
**Next (not DONE):** W4-PAY-B P1 tabs · W4-MOB Face chrome · EMP profile neo · remaining ATT/REC deep surfaces · P2 OBS (payslip print open · GPS/page shells). **Cấm** claim remaster DONE.
