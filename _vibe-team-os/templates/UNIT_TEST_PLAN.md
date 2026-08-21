# Unit Test Plan — `<MODULE / WI>`

| Meta | Value |
|------|--------|
| **work_item_id** | |
| **spec_ref** | SRS § · TechSpec § · API_DESIGN |
| **owner** | qa draft · dev-be implement |
| **date** | |
| **u65_note** | Unit ≠ UF PASS |

> Doctrine: `_vibe-team-os/33-TESTCASE-VS-REPORT-VS-UNIT.md` §2

## Rows

| Endpoint / symbol | BR / Diễn biến # | Unit cases (input → expect) | Spec file | Gap |
|-------------------|------------------|----------------------------|-----------|-----|
| `METHOD /path` | BR-… · bước … | (1) … (2) … | `*.spec.ts` | COVERED / MISSING / N/A |

## P0 gate

- [ ] Mọi mutate P0 có ≥1 fail-deep unit  
- [ ] Scope/auth mismatch deterministic  
- [ ] Không claim READY_FOR_QA UI chỉ vì unit xanh  
