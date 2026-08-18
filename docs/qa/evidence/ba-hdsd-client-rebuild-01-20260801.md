# BA-HDSD-CLIENT-REBUILD-01-R3 — HDSD client rebuild (Ch.12 FIG)

| Field | Value |
|-------|-------|
| **work_item_id** | `BA-HDSD-CLIENT-REBUILD-01-R3` |
| **program** | `P-HDSD-ECOSYSTEM-03` · client-final · **C-R2-02** |
| **from_role** | `ba-docs` |
| **to_role** | `pm` → **`qc`** (`QC-HDSD-CLIENT-FINAL-01`) |
| **date** | 2026-08-01 |
| **ack_status** | **PASS_TO_PM** |
| **no_prompt_echo** | **true** |
| **must_keep** | R2 web **C-R2-01 / C-R2-03 / C-R2-04** (không đụng PNG web; rebuild chỉ merge MD + assets hiện có) |

---

## Executive verdict

**PASS_TO_PM** — HDSD client HTML/PDF rebuilt after C-R2-02 mobile Ch.12 assets. **8/8** `hrm-12-*.png` embedded as `[[IMG:hrm/hrm-12-N.png]]` + base64 in `DIAGRAMS`. **0** unresolved `[[FIG:…]]`, **0** `ảnh chưa có` for Ch.12. Prompt-echo scan clean.

| Exit criterion | Verdict | Notes |
|----------------|---------|-------|
| `pnpm run hdsd:inject-images` | 🟢 PASS | exit 0 · `filesTouched=0` · MD đã có `![…](../assets/hrm/hrm-12-N.png)` |
| `pnpm run hdsd:build` | 🟢 PASS | exit 0 · `ok=true` · files=17 · images=118 · imgTokens=103 |
| `[[FIG:…hrm-12-N…]]` resolved | 🟢 PASS | 0 unresolved FIG · 8/8 IMG tokens + dataUrl in DIAGRAMS |
| no_prompt_echo | 🟢 PASS | 0 hits: work_item / PASS_TO_PM / DISPATCHED / C-R2-02 / BA-HDSD… |
| Fake PNG | 🟢 N/A | Assets từ QA-DEVICE (130–429 KB) — không placeholder |

---

## Entry intake

| Source | Status |
|--------|--------|
| `docs/qa/evidence/qa-device-hdsd-fig-ch12-01-20260801.md` | C-R2-02 CLOSED · 8/8 PNG |
| `docs/client-delivery/hdsd/assets/hrm/hrm-12-{1..8}.png` | Present · sizes match QA evidence |
| Matrix note | 309🟢 · 54🟡 · 0⬜ (PM entry — not re-audited this WI) |
| Claude CLI parallel | Inbox noted sole-owner when Cursor blocked; **no prior** `ba-hdsd-client-rebuild-01-20260801.md` — this R3 executed build |

---

## Commands (junction `C:\xevn-ecosystem`)

```text
pnpm run hdsd:inject-images
# { filesTouched: 0, placeholdersInjected: 0, missingAssets: 0 }

pnpm run hdsd:build
# Wrote …/HDSD_XEVN_ECOSYSTEM_v1.html (25954.7 KB) files=17 images=118 imgTokens=103 ok=true
# Wrote …/HDSD_XEVN_ECOSYSTEM_v1.pdf (8143 KB)
# build_exit=0
```

Style ref: TSCAir primary missing → fallback `docs/client-delivery/01_BRD_XeVN_OS.html` (expected).

---

## Artifact outputs

| Artifact | Path | Size |
|----------|------|------|
| HTML | `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html` | ~25 955 KB |
| PDF | `docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.pdf` | ~8 143 KB |
| Inject report | `docs/qa/evidence/hdsd-p2-inject-report.json` | (this run) |

### Ch.12 asset matrix (embedded)

| Asset | Bytes | Bundle key | dataUrl |
|-------|------:|------------|---------|
| hrm-12-1.png | 360 892 | `hrm/hrm-12-1.png` | 🟢 |
| hrm-12-2.png | 214 736 | `hrm/hrm-12-2.png` | 🟢 |
| hrm-12-3.png | 254 310 | `hrm/hrm-12-3.png` | 🟢 |
| hrm-12-4.png | 132 347 | `hrm/hrm-12-4.png` | 🟢 |
| hrm-12-5.png | 247 969 | `hrm/hrm-12-5.png` | 🟢 |
| hrm-12-6.png | 129 845 | `hrm/hrm-12-6.png` | 🟢 |
| hrm-12-7.png | 429 194 | `hrm/hrm-12-7.png` | 🟢 |
| hrm-12-8.png | 214 869 | `hrm/hrm-12-8.png` | 🟢 |

Source MD (unchanged this run): `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH12_MOBILE_HRM.md` — 8× markdown image lines already present.

---

## Verify script (internal)

```text
node scripts/tmp-verify-hdsd-ch12-rebuild.mjs
# pass=true · unresolvedFig=0 · anhChuaCo=0 · hrm12 tokens=8 · promptHits=[]
```

---

## must_keep / non-touch

- **C-R2-01 / C-R2-03 / C-R2-04** web figures: không thay PNG web; inject `filesTouched=0`.
- Không sửa HTML tay — chỉ generator rebuild.
- Không fake/placeholder PNG.

---

## completion_report

**Closed:** Client HDSD rebuild after mobile Ch.12 FIG intake — HTML+PDF exit 0; Ch.12 figures resolved inline; prompt-echo clean.

**Open:** QC client-final spot gate `QC-HDSD-CLIENT-FINAL-01` (HTML/PDF + Ch.12 visual spot + matrix residual 🟡 out of this WI).

---

## next_owner

`pm` → **`qc`**

---

## next_dispatch_prompt

```text
work_item_id: QC-HDSD-CLIENT-FINAL-01
from_role: pm
to_role: qc
program: P-HDSD-ECOSYSTEM-03 · client-final
entry_criteria:
- BA-HDSD-CLIENT-REBUILD-01-R3 PASS — docs/qa/evidence/ba-hdsd-client-rebuild-01-20260801.md
- artifacts: docs/client-delivery/hdsd/artifacts/HDSD_XEVN_ECOSYSTEM_v1.html + .pdf
- C-R2-02 closed (8× hrm-12 PNG embedded)
exit_criteria:
- Spot-check Ch.12 figures render (no placeholder / ảnh chưa có)
- no_prompt_echo audit on HTML
- must_keep C-R2-01/03/04 web figures intact
- GO / GWC + residual list
- evidence: docs/qa/evidence/qc-hdsd-client-final-01-20260801.md
cấm: fake PNG · rewrite MD outside QC findings
```

**evidence_path:** `docs/qa/evidence/ba-hdsd-client-rebuild-01-20260801.md`

**ack_status:** **PASS_TO_PM**
