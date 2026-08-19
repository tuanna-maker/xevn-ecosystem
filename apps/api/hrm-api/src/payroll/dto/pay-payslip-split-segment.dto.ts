/** Display-ready split segment (API-01 §5.1 ↔ DATA §6.1). */
export type PayPayslipSplitSegmentDto = {
  segmentSeq: number;
  effectiveFrom: string;
  effectiveTo: string;
  baseSalarySnapshotVnd: number | null;
  hoursPayable: number | null;
  segmentGrossVnd: number;
};
