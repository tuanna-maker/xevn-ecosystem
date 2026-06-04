# Phase 1 execution board — 245 UC

> Bám [LO_TRINH_PHASE_1_2_XEVN.md](./LO_TRINH_PHASE_1_2_XEVN.md) · Ma trận: [PHASE1_UC_SRS_TECHSPEC_MATRIX.md](./PHASE1_UC_SRS_TECHSPEC_MATRIX.md)

## Waves

| Wave | Mục tiêu | Lệnh / evidence |
|------|----------|-----------------|
| **W0** | Tracking + seed baseline | `pnpm phase1:bootstrap` · `pnpm docs:phase1:matrix` |
| **W1** | XBOS nền + M00 (~45 UC) | `pnpm verify:capabilities` · `FE_MOCK_TO_API_AUDIT.md` |
| **W2** | 183 DM + CAT + DM-LOG | `pnpm seed:phase1:logistic-catalog` · `seed:hrm:group-employee-catalog` |
| **W3** | HRM 119 UC | `scripts/mobile-hrm-smoke.mjs` · `simulate-hrm-uat-business-flow.ps1` |
| **W4** | Gate P1 | `pnpm phase1:gate` · `docs/qa/PHASE1_GATE_REPORT.md` |

## Gate P1 (đích)

| Hạng mục | Target |
|----------|--------|
| XBOS UC | 104 × `e2e_pass` |
| HRM UC | 119 × QA sign-off |
| DM publish | 183/183 có version |
| DM-LOG checklist | 22/22 PASS (`XBOS-DM-LOG-19`) |
| Mobile | 15/15 `UC-HRM-MOB-*` |

## impl_status legend

| Status | Ý nghĩa |
|--------|---------|
| `planned` | Chưa triển khai |
| `be` | API sẵn sàng |
| `fe` | FE đã nối API |
| `data` | Seed/catalog |
| `e2e_pass` | Smoke/E2E PASS |
| `waived` | Waiver có hạn (ghi `evidence_path`) |

## Cập nhật nhanh

```bash
pnpm docs:phase1:matrix
pnpm phase1:gate
```

Override thủ công: `docs/ecosystem/phase1-impl-status.json`.
