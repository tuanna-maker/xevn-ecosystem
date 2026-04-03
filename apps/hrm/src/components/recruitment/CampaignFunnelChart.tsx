import { useTranslation } from 'react-i18next';
import { FunnelChart, Funnel, LabelList, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface FunnelData {
  total: number;
  cvPass: number;
  test: number;
  cvFail: number;
  interview: number;
  hired: number;
  hcns: number;
}

interface CampaignFunnelChartProps {
  data: FunnelData;
}

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function CampaignFunnelChart({ data }: CampaignFunnelChartProps) {
  const { t } = useTranslation();

  const funnelData = [
    { name: t('funnelChart.cvPass'), value: data.cvPass, fill: '#6366f1' },
    { name: t('funnelChart.interview'), value: data.interview, fill: '#f59e0b' },
    { name: t('funnelChart.test'), value: data.test, fill: '#22c55e' },
    { name: t('funnelChart.hired'), value: data.hired, fill: '#8b5cf6' },
    { name: t('funnelChart.toHR'), value: data.hcns, fill: '#06b6d4' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{t('funnelChart.totalCVReceived')}</p>
        <p className="text-4xl font-bold text-primary">{data.total}</p>
        <p className="text-sm text-muted-foreground">{t('funnelChart.applications')}</p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <FunnelChart>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => [`${value} ${t('funnelChart.candidates')}`, name]}
          />
          <Funnel dataKey="value" data={funnelData} isAnimationActive>
            {funnelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
            <LabelList position="center" fill="#fff" fontSize={12} />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 justify-center">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#6366f1]" />
          <span className="text-xs">{t('funnelChart.cvPass')} ({data.cvPass})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
          <span className="text-xs">{t('funnelChart.test')} ({data.test})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
          <span className="text-xs">{t('funnelChart.cvFail')} ({data.cvFail})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
          <span className="text-xs">{t('funnelChart.interview')} ({data.interview})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
          <span className="text-xs">{t('funnelChart.hired')} ({data.hired})</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#06b6d4]" />
          <span className="text-xs">{t('funnelChart.toHR')} ({data.hcns})</span>
        </div>
      </div>
    </div>
  );
}
