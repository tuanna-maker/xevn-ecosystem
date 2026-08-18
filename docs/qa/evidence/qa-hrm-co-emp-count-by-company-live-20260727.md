# QA-HRM-CO-EMP-COUNT-02 — Live `by_company` Network retest

| Field | Value |
|-------|--------|
| **Date** | 2026-07-27 |
| **Role** | qa |
| **work_item_id** | `QA-HRM-CO-EMP-COUNT-02` |
| **Prior** | `QA-HRM-CO-EMP-COUNT-01` PASS (FE interim N× slug) · devops `D-HRM-CO-EMP-COUNT-DO-RESTART-01` PASS |
| **Env** | Portal `:5173` · hrm-api `:28001` · `ceo@xe.vn` |
| **URL** | `http://127.0.0.1:5173/command-center/hrm/company` |
| **Runner** | `scripts/qa/qa-hrm-co-emp-count-01.mjs` |
| **Runtime** | `docs/qa/evidence/qa-hrm-co-emp-count-by-company-live-runtime-20260727.json` |
| **Constraints** | **U65 zero-seed** · HOLD_DEPLOY · NOT `:8088` |
| **Overall** | **PASS** → `ack_status: PASS_TO_PM` |

---

## AC (wave-02 focus)

| AC | Criterion | Verdict | Proof |
|----|-----------|---------|-------|
| **1** | Card + table non-zero / ~1109 Dashboard parity | **PASS** | Card **1109** · rows 229/220×4 · Dashboard UI **1109** · Δ 0% |
| **2** | Network `GET …/summary?company_id=main` with `by_company` length **5** OR FE slug path | **PASS** — **mode = `by_company`** (not interim slug) | Browser Network: **1** summary call `company_id=main` · `by_company_len=5` · `interimNSlug=false` |
| **3** | No LE UUID in `company_id` query | **PASS** | `badUuid=0` · `illegalUuidCompanyId=[]` · cids=`main` only |

---

## Network proof (authoritative)

### Direct API (L1 assist)

```http
GET http://127.0.0.1:28001/api/hrm/employees/summary?company_id=main
→ 200  total=1109  company_id=main  by_company.length=5
  holding=229  trsport=220  logistics=220  finance=220  services=220
```

### Browser Network (portal → Company page)

| Call | `company_id` | HTTP | `by_company` |
|------|--------------|------|--------------|
| summary (primary) | **`main`** | **200** | **length 5** |

- **Mode:** Option A live `by_company` — **promoted off** FE interim N× slug (`calls=1`, not 6)
- **UUID as count dimension:** **0**

---

## UF (short)

- Persona: `ceo@xe.vn` → CC HRM Company → observe card/table → Dashboard parity → F5
- Seed: **not used**
- FE after 2xx: Card **1109**; table non-zero; F5 stable
- J-HRM-CO-01: detail **229** NV · back list still non-zero
- Verdict: 🟢

---

## Residual

| Item | Status |
|------|--------|
| Live `by_company` missing (COUNT-01 residual) | **CLOSED** |
| Detail tax parse odd (`tax=-229` in dialog scrape) | P3 cosmetic — out of AC this wave |
| P0/P1 this wave | **None** |

## Command / L2.5

| Check | Result |
|-------|--------|
| L0 `qc:dev-stack` | HRM/XBOS/portal **200** |
| L2.5 J-HRM-CO-01 | **PASS** |
| Seed | **none** |

---

```yaml
work_item_id: QA-HRM-CO-EMP-COUNT-02
ack_status: PASS_TO_PM
next_owner: pm
evidence_path: docs/qa/evidence/qa-hrm-co-emp-count-by-company-live-20260727.md
```
