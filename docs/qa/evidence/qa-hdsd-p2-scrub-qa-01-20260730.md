# QA — HDSD P2 Scrub Phrase Verification (`QA-HDSD-P2-SCRUB-QA-01`)

| Field | Value |
|-------|-------|
| **work_item_id** | QA-HDSD-P2-SCRUB-QA-01 |
| **program** | HDSD-P2-FULL-01 |
| **upstream** | HDSD-P2-SCRUB-PHRASE-01 (ba-docs) |
| **from_role** | qa |
| **to_role** | pm / qc |
| **date** | 2026-07-30 |
| **ack_status** | **PASS_TO_PM** |

## Summary

Independent QA re-verification of **C-R2-01** (banned phrase scrub) after ba-docs handoff. Grep confirms **0×** `placeholder Phase 2` in client HDSD Markdown and rebuilt HTML. CH10/CH11 inline PNG tokens wired with Vietnamese `![alt]` in source MD and **no duplicate standalone `[Hình …]` lines**. INDEX quy ước uses neutral template wording. Re-run `pnpm run hdsd:build` exit **0**, `ok=true`.

**C-R2-01:** 🟢 **VERIFIED** — ready for QC R3 prep.

## 1. Banned phrase grep (C-R2-01)

| Scope | Pattern | Matches |
|-------|---------|---------|
| `docs/client-delivery/hdsd/**/*.md` | `placeholder Phase 2` | **0** |
| `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` (full file) | `placeholder Phase 2` | **0** |
| HTML `mdRaw` embedded narrative | `placeholder Phase 2` | **0** |

**Note (out of scope C-R2-01):** Builder script retains internal dashed-placeholder template `Ảnh minh họa — Phase 2` for `[[FIG:…]]` tokens only — not customer MD source (per ba-docs evidence).

## 2. Spot-check captions — CH10 / CH11 / CH12 / INDEX

Automated + manual spot-check via `_tmp-qa-hdsd-p2-scrub-verify.mjs` → runtime JSON sibling.

| Section | Duplicate `[Hình …]` line (MD + mdRaw) | MD `![alt]` Vietnamese | HTML `[[IMG:…]]` wired | Verdict |
|---------|----------------------------------------|------------------------|-------------------------|---------|
| **CH10** | 0 | 6/6 🟢 | 6× `hrm/hrm-10-*.png` 🟢 | 🟢 |
| **CH11** | 0 | 5/5 🟢 | 5× `hrm/hrm-11-*.png` 🟢 | 🟢 |
| **CH12** | 0 | 8/8 🟢 | 0 IMG (PNG absent → FIG dashed) | 🟡 GWC **C-R2-02** |
| **INDEX** | 0 (template `[Hình XX.Y — mô tả ngắn…]` intentional) | N/A | N/A | 🟢 |

### CH10 sample alt (source MD)

- `Màn hình thông tin công ty: tab Quản lý công ty, headcount và cây phòng ban`
- `Danh sách quyết định nhân sự: tab loại quyết định, bộ lọc và nút Thêm mới`

### CH11 sample alt (source MD)

- `Màn hình Cài đặt HRM: các tab Tài khoản, Vai trò, Danh mục và Gói dịch vụ`
- `Tab Danh mục đồng bộ XBOS: chọn catalog, đồng bộ và thêm mục mở rộng`

### CH12 sample alt (source MD)

- `Màn đăng nhập HRM Mobile: trường Email, Mật khẩu và nút Đăng nhập`
- `Trung tâm thông báo: danh sách thông báo theo thời gian và trạng thái đã đọc`

### INDEX quy ước

Item 2 reads: `` `[Hình XX.Y — mô tả ngắn minh họa màn hình]` `` — neutral client wording, no banned phrase.

### Rendered figcaption observation (non-blocking C-R2-01)

HTML `DIAGRAMS` figcaption for wired PNGs uses filename slug (e.g. `hrm 10 1`) rather than MD `![alt]` Vietnamese text. Tracked under **C-R2-04** / builder caption binding — does not reintroduce banned phrase.

## 3. Build re-run

```bash
pnpm run hdsd:build
```

| Check | Result |
|-------|--------|
| Exit code | **0** |
| `ok` | **true** |
| `files` | 17 |
| `images` | 110 |
| `imgTokens` | 95 |
| HTML | `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` (~23 371 KB) |
| PDF | `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.pdf` (~7 111 KB) |
| Structural checks | cover · toc · partBreak · marked · mermaid · docCode · sources · inlineImages — all **true** |

## Condition matrix

| ID | Status | QA note |
|----|--------|---------|
| **C-R2-01** | 🟢 **VERIFIED** | 0× banned phrase MD+HTML; CH10/11 duplicate `[Hình placeholder]` removed |
| **C-R2-02** | 🟡 **GWC open** | CH12 mobile PNG not in assets → FIG dashed placeholders (qa-device + dev-fe in flight) |
| **C-R2-04** | 🟡 **GWC open** | Remaining `[Hình]` / FIG gaps; figcaption slug vs VI alt (FIG-REMAINING wave) |

## Residual / not promoted

- Rendered HTML figcaption VI alt binding (builder uses filename slug) — **C-R2-04**, not C-R2-01.
- CH12 mobile screenshots — **C-R2-02**, separate WI.

---

## Handoff

**completion_report:** C-R2-01 independently verified 🟢. Grep 0× `placeholder Phase 2` in client MD + rebuilt HTML; CH10/11/INDEX caption spot-check PASS (no duplicate `[Hình placeholder]` lines, Vietnamese MD alts OK); `hdsd:build` re-run ok=true. CH12 mobile IMG gap documented as existing GWC C-R2-02 — does not block C-R2-01 closure.

**next_owner:** qc

**next_dispatch_prompt:**
```
work_item_id: QC-HDSD-P2-GATE-01-R3
program: HDSD-P2-FULL-01
from_role: qa | to_role: qc
entry_criteria:
- docs/qa/evidence/qa-hdsd-p2-scrub-qa-01-20260730.md — C-R2-01 VERIFIED 🟢
- docs/qa/evidence/hdsd-p2-scrub-phrase-01-20260730.md — ba-docs scrub source
- hdsd:build ok=true (95 imgTokens, PDF present)
task:
1. Re-audit banned phrase scan on client MD/HTML (confirm C-R2-01 closed)
2. Include R3 gate verdict with C-R2-02 (mobile FIG) and C-R2-04 ([Hình] gap) as GWC conditions
3. Do not NO-GO solely on C-R2-02/C-R2-04 if web deliverable + C-R2-01 PASS (per R2 precedent)
exit_criteria: QC R3 evidence with GO/GWC + condition table; ack_status PASS_TO_PM
evidence_path: docs/qa/evidence/qc-hdsd-p2-gate-r3-20260730.md
no_prompt_echo: true
ack_status: PASS_TO_PM
```

**evidence_path:** `docs/qa/evidence/qa-hdsd-p2-scrub-qa-01-20260730.md` · `_tmp-qa-hdsd-p2-scrub-verify.json`

**ack_status:** **PASS_TO_PM**
