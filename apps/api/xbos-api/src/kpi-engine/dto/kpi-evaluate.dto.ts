export type KpiEvaluateInput = {
  target: number;
  actual: number;
  weight?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  metricCode?: string;
  emitPortalAlert?: boolean;
};

export type KpiEvaluateBatchBody = {
  items?: KpiEvaluateInput[];
  tenantId?: string;
  companyId?: string;
  emitPortalAlerts?: boolean;
};

export type PublishPortalAlertBody = {
  tenantId?: string;
  companyId?: string;
  moduleCode: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  detail?: string;
  sourceSystem?: string;
  sourceId?: string;
};
