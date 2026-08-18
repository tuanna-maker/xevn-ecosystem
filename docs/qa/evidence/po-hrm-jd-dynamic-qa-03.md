# Evidence — PO-HRM-JD-DYNAMIC-QA-03

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-JD-DYNAMIC-QA-03` |
| **role** | `qa` |
| **date** | 2026-08-06 |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` · `tenantId=xevn` |
| **env** | portal `http://127.0.0.1:5173` · hrm-api `:28001` · xbos `:28002` |
| **u65** | browser-only · zero-seed · mutates via FE only |
| **hdsd_align** | Settings «Cấu hình JD» · Tuyển dụng «Thư viện JD» · `hdsd-jd-*` |
| **Harness** | `node scripts/qa/_tmp-po-hrm-jd-dynamic-qa-03.mjs` |
| **JSON** | `docs/qa/evidence/_tmp-po-hrm-jd-dynamic-qa-03.FINAL.json` |
| **Screens** | `docs/qa/evidence/screens/po-hrm-jd-dynamic-qa-03/` (01–16, 15 files) |
| **commit** | `dc930c5` |
| **prior** | `docs/qa/evidence/po-hrm-jd-dynamic-qa-02.md` **FAIL** |
| **entry** | FE-03 READY `docs/qa/evidence/po-hrm-jd-dynamic-fe-03.md` · BE-02 LIVE OK |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS** |

---

## Entry / L0

| Check | Result |
|-------|--------|
| `qc:dev-stack` | HRM+XBOS+portal **200** (Windows UV exit noise — services healthy) |
| `qc:fe-be-health` | **ALL PASS** |
| FE-03 | normalize `always_on_groups` + rules PUT strip — READY_FOR_QA |
| Hard refresh | `_qa` cache-bust query on every navigation |

### L0 API smoke (not UF)

| Endpoint | HTTP | Note |
|----------|------|------|
| `GET …/jd-field-defs` | **200** | total≈7 |
| `GET …/jd-group-defs` | **200** | total=14 |
| `GET …/jd-default-packs` | **200** | total=3 |
| `GET …/jd-pack-rules` | **200** | total=7 |
| `POST …/resolve` `{job_family:IT}` | **200** | `PACK_IT_OFFICE` |
| `POST …/resolve` `{job_family:DRIVER}` | **200** | `PACK_DRIVER_OPS` |

---

## HDSD testids

| Assert | Result |
|--------|--------|
| List `[data-testid="undefined"]` | **0** 🟢 |
| Dialog `[data-testid="undefined"]` | **0** 🟢 |
| `hdsd-jd-library-add-btn` | visible 🟢 |
| `hdsd-jd-form-dialog` | visible 🟢 |
| `hdsd-jd-form-position` | visible 🟢 |
| `hdsd-jd-form-submit` | visible 🟢 |

---

## Journeys

### J-HRM-JD-01 — Settings Rule Lưu → PUT 2xx + F5

| Step | Network / FE | Verdict |
|------|--------------|---------|
| Open Settings → **Cấu hình JD** | Panel visible · no alert | 🟢 |
| Thêm field → Lưu | `POST …/jd-field-defs` → **201** · row on list | 🟢 |
| Rules → Lưu | `PUT …/jd-pack-rules` → **200** (FE-03 strip closed QA-02 400) | 🟢 |
| F5 field | fieldRows 7→8 after F5 | 🟢 |
| F5 rules | rules JSON len=3137 persist (`match_type`/`priority`) | 🟢 |

Screens: `01`–`06`

**Verdict: 🟢 PASS** — QA-02 residual **FE-RULES-PUT-STRIP CLOSED**.

---

### J-HRM-JD-02 — Thêm JD → canvas groups → Lưu snapshot → F5

| Step | Network / FE | Verdict |
|------|--------------|---------|
| Thư viện → Thêm JD | dialog + HDSD testids | 🟢 |
| Chọn chức danh | Picked `CEO` / Tổng Giám đốc (catalog; no IT label) | 🟡 OBS pack |
| Pack resolve | `POST …/resolve` → **200** · pack `PACK_CORP_DEFAULT` | 🟢 |
| Canvas always_on | `jd-writer-group-*` **count=6** (was 0 in QA-02) | 🟢 |
| Lưu JD | `POST …/job-templates` → **201** | 🟢 |
| layout_snapshot.groups | GET by id `b284e4cd-…` → **groupsLen=6** | 🟢 |
| F5 row | title `QA JD Dynamic QAH1BVIR` visible | 🟢 |

Screens: `07`–`12`

**Verdict: 🟢 PASS** — QA-02 residual **FE-RESOLVE-GROUPS-MAP CLOSED**.

---

### J-HRM-JD-03 — Xem wave-created row → hierarchy §3.6

| Step | Evidence | Verdict |
|------|----------|---------|
| Wave row `QAH1BVIR` | visible after F5 | 🟢 |
| Xem | `jd-template-view-panel` + `jd-view-group-*` ≥1 | 🟢 |
| hardcodeSmell | 0 | 🟢 |

Screens: `14`

**Verdict: 🟢 PASS** (promoted from wave create — not legacy-only).

---

### G4 — đổi chức danh → `jd-writer-pack-confirm` · merge

| Step | Evidence | Verdict |
|------|----------|---------|
| Edit wave row · canvas | groups=6 before change | 🟢 |
| Đổi chức danh | `jd-writer-pack-confirm` shown | 🟢 |
| Áp pack mới | title kept=`QA JD Dynamic QAH1BVIR` | 🟢 |

Screens: `15`

**Verdict: 🟢 PASS**

---

### OBS — Driver pack

| Step | Evidence | Verdict |
|------|----------|---------|
| API `job_family=DRIVER` | **200** `PACK_DRIVER_OPS` | 🟢 L1 |
| Settings Preview `position_code=DRIVER` | UI shows `PACK_CORP_DEFAULT` (miss) | 🟡 soft |
| Seed | **false** | — |

Screens: `16`

**Verdict: 🟢 API / 🟡 UI preview** — soft residual only; not blocking wave.

---

## Per-journey rollup

| Journey | Verdict | Network 2xx | FE after 2xx | F5 |
|---------|---------|-------------|--------------|-----|
| L0 CFG+resolve | 🟢 | GET/POST 200 | n/a | n/a |
| HDSD testids | 🟢 | n/a | undefined=0 | n/a |
| J-HRM-JD-01 | 🟢 | field **201** · rules **200** | field row + rules editor | field+rules 🟢 |
| J-HRM-JD-02 | 🟢 | resolve 200 · create **201** | canvas groups=6 · row new | 🟢 |
| J-HRM-JD-03 | 🟢 | GET template 200 | viewGroups≥1 wave | n/a |
| G4 | 🟢 | resolve 200 | confirm + title kept | n/a |
| OBS Driver | 🟢/🟡 | resolve DRIVER 200 | API OK · UI preview soft | n/a |

---

## Forbidden checks (honesty)

| Item | Status |
|------|--------|
| Seed used | **false** |
| Dual-write `job_postings` | **false** |
| `remaster_program_done` claimed | **false** |
| `face_live` claimed | **false** |
| `jd_dynamic_done` claimed | **false** |
| PASS chỉ API | **false** (UF browser; mutates_count=6 via FE) |

---

## Residuals closed vs open

| ID | Status | Note |
|----|--------|------|
| **FE-RESOLVE-GROUPS-MAP** | **CLOSED** | canvas groups=6 · create 201 · GET snapshot groups=6 |
| **FE-RULES-PUT-STRIP** | **CLOSED** | PUT jd-pack-rules **200** + F5 persist |
| OBS-IT-POSITION-CONFIG | open soft P2 | Catalog pick → `PACK_CORP_DEFAULT`; API `job_family=IT` still OK — **no seed** |
| OBS-DRIVER-UI-PREVIEW | open soft P3 | Settings preview by `position_code=DRIVER` misses; API OK |

---

## completion_report

**Closed:** U65 browser retest after FE-03 — J01 rules PUT 200+F5, J02 create 201 with layout_snapshot.groups=6 + F5 row, J03 wave hierarchy, G4 confirm+merge keep, HDSD undefined=0; prior P0/P1 FE residuals CLOSED.

**Open / residual:** soft OBS IT catalog position + Driver UI preview (not blockers; no seed).

**ack_status:** `PASS_TO_PM`

**next_owner:** `qc`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-JD-DYNAMIC-QC-01
role: qc
entry_criteria:
  - QA PASS_TO_PM: docs/qa/evidence/po-hrm-jd-dynamic-qa-03.md
  - prior FAIL closed: docs/qa/evidence/po-hrm-jd-dynamic-qa-02.md (FE-03 fixed)
  - U65 · zero-seed · no dual-write job_postings · no remaster/face_live · no jd_dynamic_done claim
read_first:
  - docs/qa/evidence/po-hrm-jd-dynamic-qa-03.md
  - docs/qa/evidence/_tmp-po-hrm-jd-dynamic-qa-03.FINAL.json
  - docs/qa/evidence/po-hrm-jd-dynamic-fe-03.md
exit_criteria:
  - Gate GO or GO WITH CONDITIONS on J-HRM-JD-01..03 + G4 browser evidence
  - Confirm FE-RESOLVE-GROUPS-MAP + FE-RULES-PUT-STRIP CLOSED
  - Soft OBS (IT catalog / Driver UI preview) listed as conditions only — not NO-GO
  - honesty: no jd_dynamic_done / remaster / face_live
  - evidence: docs/qa/evidence/po-hrm-jd-dynamic-qc-01.md
ack_status: PASS_TO_PM | FAIL_TO_PM
```
