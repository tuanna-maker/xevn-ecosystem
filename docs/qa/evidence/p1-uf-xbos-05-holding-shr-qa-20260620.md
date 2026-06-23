# P1-UF-XBOS-05-HOLDING-SHR-QA — UF-XBOS-05 holding shareholder browser retest

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-UF-XBOS-05-HOLDING-SHR-QA` |
| **from_role** | pm → qa |
| **portal** | http://14.225.217.232:8088 |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **executed_at** | 2026-06-20T20:30+07 |
| **rule** | U65 zero-seed · browser-only · Network 2xx + F5 |
| **spec_ref** | UF-XBOS-05 · UC-CC-P0-01 · `BTN-CC-P0-SHAREHOLDER-SAVE` · J-CC-02 |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

**PASS** — QC slice **C1** conflict resolved: `screen-action-catalog-map` row 🔴 was **stale** vs `USER_FLOW_OPERABILITY_MATRIX` 🟢. Fresh browser session on `:8088` confirms **UF-XBOS-05** end-to-end at holding root **TẬP ĐOÀN**: green ✓ **Lưu cổ đông** → **POST 201** `XBOS-SHR-201` → toast «Đã lưu cổ đông lên hệ thống.» → **F5** → row **`QA-UF05-SHR-20260620`** visible in **Danh sách Cổ đông** (Probe Legal holding entity `bad45b73…`).

---

## Conflict triage (C1)

| Artifact | Prior verdict | This retest |
|----------|---------------|-------------|
| `screen-action-catalog-map-20260620.md` | 🔴 No POST at holding root | **🟢 PROMOTED** — POST 201 browser |
| `USER_FLOW_OPERABILITY_MATRIX.md` §3 UF-XBOS-05 | 🟢 (final2 carry) | **Confirmed** |
| `p1-screen-action-qc-slice-01-20260620.md` C1 carry | 🔴 dev-fe | **CLOSED** — FE scope resolver works when holding profile persisted |

**Root cause of map 🔴:** Map session ran before holding legal profile UUID bind or used wrong list-row edit (empty «Tập đoàn XeVN» shell vs persisted `bad45b73…` entity with shareholders).

---

## UF-XBOS-05 — browser block

### Click path

`API login` → `/command-center?settings=company_member_units` → list row **TẬP ĐOÀN** (Probe Legal Updated) → **Chỉnh sửa** → **Danh sách Cổ đông** → **+ Thêm cổ đông** → fill → **Lưu cổ đông** (green ✓).

**Final URL:** `http://14.225.217.232:8088/command-center?settings=company_member_units`

### Mutate (before F5)

| Step | Observation | Verdict |
|------|-------------|---------|
| CC shell mount | `#root` ~28k chars; no `vite-error-overlay` | **PASS** |
| Holding edit form | Heading «Đơn vị thành viên - TẬP ĐOÀN»; `Tên tiếng Việt` = Probe Legal Updated | **PASS** |
| Add row | Name `QA-UF05-SHR-20260620` · ID `079992062020` · ratio `1.5%` | **PASS** |
| Network | **POST** `/api/xbos/org-foundation/legal-entities/bad45b73-55b3-4898-baae-d55c5ac2cc2a/shareholders` → **201** `XBOS-SHR-201` | **PASS** |
| FE post-mutation | Toast «Đã lưu cổ đông lên hệ thống.»; row in table same session | **PASS** |

### F5 persist

| Step | Observation | Verdict |
|------|-------------|---------|
| Hard reload `/command-center?settings=company_member_units` | Token restored via sessionStorage | **PASS** |
| Re-open TẬP ĐOÀN → **Chỉnh sửa** (Probe Legal entity) | Shareholder table loads | **PASS** |
| Row `QA-UF05-SHR-20260620` | Visible with `079992062020` · `1.5%` alongside Anh Nam / Anh Dũng | **PASS** |
| API GET (independent) | `GET …/shareholders` → **200** `XBOS-SHR-200`; `data.items` contains `QA-UF05-SHR-20260620` | **PASS** |

**Note:** First **Chỉnh sửa** after F5 on empty «Tập đoàn XeVN» shell shows banner «Chưa có hồ sơ tập đoàn…» — different UI entity id. Correct holding path is row linked to persisted org-foundation UUID (`bad45b73…` / Probe Legal Updated). Not a POST failure.

---

## Gate table

| Gate | Result |
|------|--------|
| L0 `:8088` HTTP | **PASS** (200) |
| L2 CC settings load | **PASS** |
| L2.5 J-CC-02 holding shareholder click + POST | **PASS** |
| UF-XBOS-05 U63 mutate + Network + FE + F5 | **PASS** |
| Console 409/500 on path | **None observed** |

---

## Network excerpt (no secrets)

```json
POST /api/xbos/org-foundation/legal-entities/bad45b73-55b3-4898-baae-d55c5ac2cc2a/shareholders
→ 201 XBOS-SHR-201
data.holder_name: "QA-UF05-SHR-20260620"
data.identity_code: "079992062020"
data.ratio_percent: "1.50"
data.company_id: "holding"
```

---

## Map update

`docs/qa/evidence/screen-action-catalog-map-20260620.md` — row **CC Shareholders holding** / **Holding shareholder POST** → **🟢 PROMOTED** (this file).

---

## Residual

| Item | Owner | Notes |
|------|-------|-------|
| Empty holding shell UX | dev-fe | Optional — banner when UI id not yet bound to org-foundation UUID; does not block UF-05 when profile exists |
| QC slice C1 formal close | qc | Re-gate `p1-screen-action-qc-slice-01` P0 count 18/20 → 19/20 |

---

## ack_status

**PASS_TO_PM**

### completion_report

- **Closed:** UF-XBOS-05 browser POST 201 + F5 FE persist on `:8088`; C1 map 🔴 vs matrix 🟢 conflict resolved; screen-action-catalog-map row promoted 🟢.
- **Not closed:** QC slice-01 formal P0 recount (dispatch qc).

### next_owner

`qc` (then `pm` for C1 close on bus)

### next_dispatch_prompt

```
Role: qc
work_item_id: P1-SCREEN-ACTION-QC-SLICE-C1-CLOSE
from_role: qa
to_role: qc
priority: P0
entry_criteria: QA P1-UF-XBOS-05-HOLDING-SHR-QA PASS_TO_PM — UF-XBOS-05 browser POST 201 XBOS-SHR-201 + F5 row QA-UF05-SHR-20260620 on :8088; screen-action-map holding shareholder row promoted 🟢; evidence docs/qa/evidence/p1-uf-xbos-05-holding-shr-qa-20260620.md
exit_criteria: Update p1-screen-action-qc-slice-01-20260620.md C1 CLOSED; P0 block 19/20 honest count; ack_status PASS_TO_PM with qc evidence append
evidence_path: docs/qa/evidence/p1-screen-action-qc-slice-01-20260620.md
ack_status: PASS_TO_PM
pm_dispatch_hint: PM close C1 carry on bus; no dev-fe re-dispatch unless empty-shell UX prioritized
```

### pm_dispatch_hint

C1 **CLOSED** — no `dev-fe` for UF-XBOS-05 unless sponsor wants empty-shell UX fix.
