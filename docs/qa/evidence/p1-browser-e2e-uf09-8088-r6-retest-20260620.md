# P1-BROWSER-E2E-UF09-8088-R6-RETEST — UF-XBOS-09 catalog governance APPROVE

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-BROWSER-E2E-UF09-8088-R6-RETEST` |
| **role** | qa |
| **executed_at** | 2026-06-20T14:57+07 |
| **portal** | http://14.225.217.232:8088/ |
| **account** | `ceo@xe.vn` / `Xevn@2026` |
| **precondition** | `P1-DEPLOY-CAT-INBOX-ASSIGNEE-8088` hotfix — inbox `ceo@xe.vn` **93** (deploy evidence) |
| **rule** | U65 zero-seed browser-only |
| **ack_status** | **FAIL_TO_PM** |

---

## UF-XBOS-09 — Inbox → Chi tiết → Phê duyệt → F5

### Bước 1 — Catalog governance inbox

- **Click path:** `http://14.225.217.232:8088/command-center?settings=hrm_catalog_governance` → **Làm mới**
- **UI:** **Hộp thư (100)** — 100 pending task rows for logged-in session (≥93 post-hotfix; +7 spawned during parallel UF-15 lane)
- **Assignee hotfix verified:** inbox non-zero for `ceo@xe.vn` (R6 FAIL root cause **closed**)
- **Verdict Bước 1:** **🟢 PASS**

### Bước 2 — Task detail (Chức danh)

- **Click path:** Hộp thư → task **Mã lô: 2068d8f2…** (scanned 17 rows; first `Chức danh` catalog)
- **Chi tiết yêu cầu:**

| Danh mục | Mã | Nhãn |
|----------|-----|------|
| **Chức danh** | `devops_r6_1781941004065` | **DevOps R6 1781941004065** |

- **Labels:** Vietnamese **Chức danh** (not `positions`/`hrm_positions`); Nhãn human-readable
- **Verdict Bước 2:** **🟢 PASS**

### Bước 3 — Phê duyệt → toast → count → F5

- **Action:** **Phê duyệt danh mục** on batch `2068d8f2` / task `faf97f8d-a0c0-4b4e-bea0-24f382a5405a`
- **Network:**

```
POST /api/xbos/catalog-governance/tasks/faf97f8d-a0c0-4b4e-bea0-24f382a5405a/approve → 409
{
  "code": "SCOPE_CONTEXT_MISMATCH",
  "message": "companyId mismatches token scope",
  "details": { "field": "companyId", "token": "main", "request": "holding" }
}
```

- **FE post-mutation:** banner **approve failed** (×2); **no** success toast
- **Inbox count:** **100 → 100** (unchanged)
- **F5:** not promoted — approve did not persist
- **Verdict Bước 3:** **🔴 FAIL** — scope parity `main` token vs `holding` instance

### Bước 4 — CC home G1 widget labels

- **Click path:** `/command-center` (BOD home)
- **Probe:** `Việc cần xử lý`, `Chỉ số KPI tập đoàn` present; **no** `Task_Counter` / `KPI_Sparkline` / `wf_*`
- **Residual (out of G1 scope):** Action Cards subtitles still expose `catalog_governance`, `workflow_definition_review`, `fleet_ops`
- **Verdict Bước 4:** **🟢 PASS** (G1 widget keys per exit #4)

---

## Gate table

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Inbox ≥1 `ceo@xe.vn` | **🟢 PASS** (100) |
| 2 | Chi tiết Danh mục=Chức danh + Nhãn readable | **🟢 PASS** |
| 3 | Phê duyệt toast OK + count↓ + F5 | **🔴 FAIL** (409 scope) |
| 4 | CC home no Task_Counter/wf_* | **🟢 PASS** |
| U65 | No seed | **PASS** |

**UF-XBOS-09 overall:** **🔴 FAIL**

---

## Handoff packet

- **completion_report:** Assignee drift hotfix **verified** — Hộp thư **(100)** for `ceo@xe.vn`. Chi tiết **Chức danh** + readable Nhãn **PASS**. **Phê duyệt BLOCKED:** POST approve **409** `SCOPE_CONTEXT_MISMATCH` (`token=main`, `request=holding`); FE **approve failed**; inbox unchanged. G1 widget labels **PASS**.
- **next_owner:** `pm` → `dev-be`
- **next_dispatch_prompt:** Task dev-be — work_item_id `P1-CAT-APPROVE-SCOPE-8088`: entry_criteria UF-09 R6 retest FAIL — browser `ceo@xe.vn` POST `/api/xbos/catalog-governance/tasks/{id}/approve` **409** `companyId mismatches token scope` (`token=main`,`request=holding`); evidence `docs/qa/evidence/p1-browser-e2e-uf09-8088-r6-retest-20260620.md`. exit_criteria: align catalog-governance approve scope resolver with Group CEO `main` rollup (ADR-GROUP-CEO-MAIN-HOLDING-SCOPE); deploy VPS :8088; qa retest UF-09 approve **201** XBOS-CAT-201 → inbox 100→99 → F5 persist; jest scope regression PASS.
- **evidence_path:** `docs/qa/evidence/p1-browser-e2e-uf09-8088-r6-retest-20260620.md`
- **ack_status:** **FAIL_TO_PM**
- **pm_dispatch_hint:** `P1-CAT-APPROVE-SCOPE-8088` (P0 scope 409) before UF-15 R6 retest; optional `dev-fe` hide **Seed quy trình (dev)** on governance screen
