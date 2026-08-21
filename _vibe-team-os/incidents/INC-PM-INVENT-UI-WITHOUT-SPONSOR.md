# INC-PM-INVENT-UI-WITHOUT-SPONSOR

**Date:** 2026-08-06 · **Project:** xevn-ecosystem  
**Class:** Process / UI invent without sponsor

## Symptom

Sponsor asked only for a **larger** login logo. Delivery added an unsolicited **black** background behind the mark.

## Root cause

Missing explicit OS rule: “no creative invent.” FE/PM treated “polish” as in-scope for a size fix.

## Fix

1. Sponsor correction: nền trắng.
2. LOGO-02: white surface + ~112px — QA PASS + QC GWC (narrow chrome).
3. Doctrine: this chapter **35** + rule `pm-no-unsolicited-creative.mdc`.

## Reuse-tag

`no-unsolicited-creative` · `sponsor-literal-only` · `logo-bg`
