/**
 * @CODE-MEMORY
 * Purpose:    Maps component_type string → ComponentCalculator instance.
 *             Singleton map initialized once at module load.
 * WorkItem:   HRM-POLICY-E2-01
 * Coded:      2026-08-22
 * SOLID:      OCP — register new calculators without modifying existing code.
 * must_keep:  All 29 types from XEVN_POLICY_CATALOG must have a registration.
 */
import {
  AttendanceBonusConditionalCalculator,
  ClhdPointDeductionCalculator,
  ContractFeeCalculator,
  CpnCommissionCalculator,
  DeliveryCommissionCalculator,
  FixedBaseSalaryCalculator,
  FixedTrialSalaryCalculator,
  FuelQuotaDeductionCalculator,
  GradeAllowanceCalculator,
  GradeBaseCalculator,
  InsuranceDeductionCalculator,
  KpiBonusPctCalculator,
  KpiMultiplierCalculator,
  KpiPoolShareCalculator,
  LoadingSupportCalculator,
  MealAllowanceConditionalCalculator,
  PenaltyDeductionCalculator,
  ProbationOverrideCalculator,
  RankingBonusCalculator,
  RemoteWorkAllowanceCalculator,
  RevenueCommissionTieredCalculator,
  RevenuePoolCommissionCalculator,
  RevenueQualityCalculator,
  SpecialAllowanceCalculator,
  TeamMilestoneBonusCalculator,
  TripRateTieredCalculator,
  VehicleMgmtAllowanceCalculator,
  VehicleRepairDeductionCalculator,
  ZeroSumPoolCalculator,
} from "./all-calculators";
import type { ComponentCalculator } from "./calculator.interface";

const registry = new Map<string, ComponentCalculator>();

function register(calc: ComponentCalculator) {
  registry.set(calc.type, calc);
}

// Register all 29 calculators
register(new GradeBaseCalculator());
register(new GradeAllowanceCalculator());
register(new KpiBonusPctCalculator());
register(new TripRateTieredCalculator());
register(new RevenueQualityCalculator());
register(new CpnCommissionCalculator());
register(new ContractFeeCalculator());
register(new VehicleRepairDeductionCalculator());
register(new FixedBaseSalaryCalculator());
register(new VehicleMgmtAllowanceCalculator());
register(new RevenueCommissionTieredCalculator());
register(new FuelQuotaDeductionCalculator());
register(new ClhdPointDeductionCalculator());
register(new KpiPoolShareCalculator());
register(new RevenuePoolCommissionCalculator());
register(new TeamMilestoneBonusCalculator());
register(new DeliveryCommissionCalculator());
register(new ZeroSumPoolCalculator());
register(new AttendanceBonusConditionalCalculator());
register(new MealAllowanceConditionalCalculator());
register(new RemoteWorkAllowanceCalculator());
register(new LoadingSupportCalculator());
register(new SpecialAllowanceCalculator());
register(new ProbationOverrideCalculator());
register(new FixedTrialSalaryCalculator());
register(new RankingBonusCalculator());
register(new KpiMultiplierCalculator());
register(new PenaltyDeductionCalculator());
register(new InsuranceDeductionCalculator());

/** Lookup calculator by component_type */
export function getCalculator(componentType: string): ComponentCalculator | undefined {
  return registry.get(componentType);
}

/** All registered types (for validation) */
export function listRegisteredTypes(): string[] {
  return Array.from(registry.keys());
}
