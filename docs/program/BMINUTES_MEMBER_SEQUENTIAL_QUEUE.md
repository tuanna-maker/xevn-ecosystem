# B-Minutes / XBOS remaster — Member sequential queue

**programs:** `P1-BMINUTES-CUST-RETEST-01` · XBOS Bateco W1→W2  
**policy:** PM **tự dispatch** theo queue; **1–2 Task live** (chỉ khi độc lập); mỗi Task checklist ≤5 bước + evidence trước Task kế.  
**updated:** 2026-07-22T16:55+07:00  
**Standing:** NOT Phase1/PROD · SRS ecosystem NOT 100%

---

## DONE

| # | work_item_id | Owner | Status |
|---|--------------|-------|--------|
| 1–5 | J-REC-WF-04 step-sync chain | be/do/qa/qc/pm | ✅ |
| — | J-REC-WF-01..06 | qa/qc | ✅ |
| 6 | BA-XBOS-SRS-BATECO-W1-SPINE-01 | ba-docs | ✅ |
| 7 | SA-XBOS-TECHSPEC-REF-SRS-01 | sa | ✅ |
| 8 | TM-XBOS-CODE-SPEC-CONVENTION-01 | tm | ✅ GWC |
| 9–10 | BE/QA G-OA-02 select-membership | be/qa | ✅ |
| 11–12 | BE/QA G-OA-04 shareholders | be/qa | ✅ |
| 13–14 | BE/QA G-OA-03 legal-docs | be/qa | ✅ |
| **15** | `BA-XBOS-SRS-BATECO-W2-CATALOG-01` | ba-docs | ✅ | ADD 4 FR (RACI/RBAC/CAT-CC/KPI · UF-07/13/14/10); keep 12 W1; evidence `ba-xbos-srs-bateco-w2-catalog-01-20260722.md` |
| **16** | QC-XBOS-OA-G-OA-02-04-GATE-01 | qc | ✅ GWC | OpenAPI G-OA-02..04 CLOSED · NOT Phase1/PROD |
| **17** | `SA-XBOS-TECHSPEC-W2-REF-01` | sa | ✅ | ref_srs 4 FR W2 (§14.0b · §14.14–14.17); gaps G-OA-W2-RACI/CC-CAT; evidence `sa-xbos-techspec-w2-ref-01-20260722.md` |
| — | BM-02 role chip + pool GET-by-id | fe/qa | ✅ |

---

## NOW / NEXT (plan order)

| # | work_item_id | Owner | Status | Exit |
|---|--------------|-------|--------|------|
| **18** | `BA-HRM-SRS-BATECO-W2D-LEFTOVER-01` | ba-docs | ⏳ | HRM Trung bình leftover (optional) |
| 19 | Soft: hired CTA when wi=null | fe | defer | P3 |

HOOK stale recoveries = **DISPATCHED-NOOP** (waves closed).

## Micro-checklist template
```markdown
- [ ] Step 1…
- [ ] Step 2…
- [ ] Evidence path
- [ ] Verdict + residual ≤3
- [ ] next_dispatch_prompt
```

