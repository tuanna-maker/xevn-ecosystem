# Program â€” HRM ERP-class Data & Settings Fidelity

**Program ID:** `P-HRM-ERP-DATA-FIDELITY-01`  
**Supersedes narrow framing:** `P-HRM-MD-PICKER-01` (vá»‹ trĂ­ = **vĂ­ dá»¥ triá»‡u chá»©ng**, khĂ´ng pháº£i pháº¡m vi)  
**Sponsor chá»‘t (2026-07-28):** KhĂ´ng Ä‘á»“ng Ă½ plan chá»‰ quanh Position. YĂªu cáº§u mindset **Product Owner / ERP chuáº©n tháº¿ giá»›i**:

1. So sĂ¡nh ná»n táº£ng ERP HRM chuáº©n (SAP SuccessFactors / Oracle HCM / Workday-class patterns) vs XeVN HRM  
2. HRM cĂ³ thá»ƒ Â«Ä‘á»§ menuÂ» nhÆ°ng **chi tiáº¿t dá»¯ liá»‡u** Ä‘Ă£ chuáº©n chÆ°a? Äá»§ phĂ¡t huy sá»©c máº¡nh nghiá»‡p vá»¥ chÆ°a?  
3. Dá»¯ liá»‡u nĂ o **cáº§n Settings** â€” Ä‘Ă£ cĂ³ menu/API cáº¥u hĂ¬nh chÆ°a?  
4. Náº¿u Settings Ä‘Ă£ cĂ³ â€” má»i form CRUD consumer Ä‘Ă£ **gá»i danh sĂ¡ch cáº¥u hĂ¬nh** (Select/combo) chÆ°a, hay cĂ²n free-text / hardcode?  
5. RĂ  **toĂ n bá»™** domain: form CRUD Ä‘Ăºng chÆ°a, thĂªm má»›i Ä‘á»§ chÆ°a, **rĂ ng buá»™c** (FK, catalog assert, required, unique, scope) Ä‘á»§ chÆ°a  
6. Sau HRM â†’ XBOS control phĂ¢n há»‡ â†’ gap â†’ SRSâ†’TechSpecâ†’DBâ†’APIâ†’Devâ†’QAâ†’QC  

**Leads:** CURSOR-PM + CLAUDE-PM (max sub-agents) Â· U74 knowledge merge  
**Status:** `ACTIVE EXECUTE` — sponsor chốt + Claude DISPATCH lock · Cursor G1 E1-A‖E1-B · SoT `FIDELITY_PROGRAM_DISPATCH.md`

---

## 1. Triá»‡u chá»©ng khá»Ÿi Ä‘áº§u (vĂ­ dá»¥ â€” khĂ´ng khĂ³a scope)

Form Â«ThĂªm quĂ¡ trĂ¬nh cĂ´ng tĂ¡cÂ» â†’ **Vá»‹ trĂ­** free-text trong khi PhĂ²ng ban = Select. Chá»‰ lĂ  **signal** orphan Settingsâ†’consumer.

---

## 2. Khung chuáº©n ERP (Cursor baseline â€” Claude pháº£n biá»‡n/bá»• sung)

| Domain ERP-class | Data class | Expectation |
|------------------|------------|-------------|
| Org / Legal entity | Master (XBOS) | SoT group â†’ member; HRM khĂ´ng invent LE |
| Department / Position / Grade / Cost center | Master + Settings | Catalog CRUD; consumer = picker by **code** |
| Employee + contract + assignment | Transaction + FK | Required links; no orphan employee |
| Leave types / calendars / holidays | Settings | Entitlement rules bound to type code |
| Attendance / shift / OT | Config + TX | Shift codes from settings; not free labels |
| Payroll components / tax / bank | Settings + TX | Component codes; formula refs catalog |
| Recruitment JD / channels / stages | Settings + TX | Position/JD from catalog |
| Decisions / disciplinary types | Settings | Type picker |
| Documents / workflows / RACI | XBOS+HRM | Policy codes read-only or gated |
| RBAC / scope / multi-company | Platform | JWT scope + memberships |

**CĂ¢u há»i PO má»—i domain:** (A) Settings cĂ³? (B) Consumer bind? (C) CRUD Ä‘á»§? (D) Constraint Ä‘á»§? (E) XBOS control Ä‘Æ°á»£c khĂ´ng?

---

## 3. Wave G0 â€” Max parallel (docs + grep + API read)

### Cursor lane

| WI | Role | Focus |
|----|------|-------|
| `BA-HRM-ERP-DOMAIN-CRUD-01` | ba-process | ToĂ n menu HRM: form CRUD / create / constraint vs SRS UC |
| `BA-HRM-ERP-SETTINGS-CONSUMER-01` | ba-data | Ma tráº­n Settings key â†” tá»“n táº¡i â†” má»i consumer bind/MISS/FREE_TEXT |
| `SA-HRM-ERP-WORLD-BENCHMARK-01` | sa | Benchmark ERP-class vs TECHSPEC/DB/API; gap capability |
| `QA-HRM-ERP-FIDELITY-SPOT-01` | qa | Spot sample â‰¥5 domains Settingsâ†’form (U65, no seed) |
| *(reuse)* inventory/trace/SA/QA prior | â€” | Evidence 20260728 giá»¯ lĂ m **input**, khĂ´ng Ä‘Ă³ng program |

### Claude lane (tá»± giao â€” khĂ´ng trĂ¹ng file Cursor Ä‘ang viáº¿t)

| WI | Focus |
|----|-------|
| `CLAUDE-BA-HRM-ERP-ORPHAN-FULL-01` | Orphan list Ă— má»i domain (khĂ´ng chá»‰ picker) |
| `CLAUDE-BA-HRM-ERP-CONSTRAINT-01` | RĂ ng buá»™c DB/API/validation Ä‘á»§ chÆ°a |
| `CLAUDE-SA-HRM-ERP-BENCHMARK-01` | Pháº£n biá»‡n benchmark 30yr PO |
| `CLAUDE-QA-HRM-ERP-MATRIX-01` | Matrix UF Settingsâ†”CRUD |
| `CLAUDE-PM-ERP-PO-SYNTH-01` | GĂ³c Product Owner tá»•ng |

**Merge SoT:** `docs/program/HRM_ERP_FIDELITY_KNOWLEDGE_MERGE.md`

---

## 4. Sau G0

`SYNTH-HRM-ERP-FIDELITY-01` â†’ sponsor chá»‘t backlog waves (G1 spec / E1 Dev theo **domain cohort**, khĂ´ng one-shot).

---

## 5. Locks

U65 Â· U71 Â· U72 Â· U74 Â· HOLD_DEPLOY Â· cáº¥m Phase1/PROD claim Â· cáº¥m plan chá»‰ Â«fix Vá»‹ trĂ­Â»

