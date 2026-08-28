export interface ComponentCalculator {
  readonly componentType: string;
  calculate(ctx: CalcContext): Promise<ComponentResult>;
}

export type CalcContext = {
  component: any; // PayIncomeComponent params JSONB (e.g. rate, target)
  inputBag: Record<string, any>; // Data from pay_input_rows (E3)
  attendance: any; // AttendanceSummary
  gradeStep: { grade_code: string; step_number: number; salary_vnd: bigint } | null;
  employeeId: string;
  periodMonth: Date;
  catalogMap?: Record<string, string>; // Map of Natural Name -> DB Code
  accumulated?: ComponentResult[];
};

export type ComponentResult = {
  component_type: string;
  amount_vnd: bigint;
  breakdown: Record<string, any>;
  warnings: string[];
};
