import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync('scripts/qa/_tmp-po-hrm-mvp-gd1-att-11-cluster-qa-01.mjs', 'utf8');
const s = src
  .replaceAll('PO-HRM-MVP-GD1-ATT-11-CLUSTER-QA-01', 'PO-HRM-MVP-GD1-ATT-11-CLUSTER-QA-02')
  .replaceAll('po-hrm-mvp-gd1-att-11-cluster-qa-01', 'po-hrm-mvp-gd1-att-11-cluster-qa-02')
  .replaceAll('ATT11QA1', 'ATT11QA2')
  .replace(
    "fe01: 'docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-fe-01.md',",
    "fe02: 'docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-fe-02.md',\n  qa01_prior: 'docs/qa/evidence/po-hrm-mvp-gd1-att-11-cluster-qa-01.md',",
  );
writeFileSync('scripts/qa/_tmp-po-hrm-mvp-gd1-att-11-cluster-qa-02.mjs', s);
console.log('patched', s.includes('QA-02'), s.includes('ATT11QA2'), s.includes('fe-02.md'));
