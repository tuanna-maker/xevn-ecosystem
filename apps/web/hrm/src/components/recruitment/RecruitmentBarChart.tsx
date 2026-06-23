import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { RecruitmentBarChartRow } from '@/lib/recruitmentDashboardAggregator';

const ROW_HEIGHT = 34;
const CHART_PAD = 72;

interface RecruitmentBarChartProps {
  data: RecruitmentBarChartRow[];
  loading?: boolean;
}

export function RecruitmentBarChart({ data, loading = false }: RecruitmentBarChartProps) {
  const { t } = useTranslation();
  const chartHeight = Math.min(480, Math.max(260, data.length * ROW_HEIGHT + CHART_PAD));

  if (loading) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        {t('common.loading')}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        {t('recruitment.noCandidateData')}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 28, left: 4, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-muted" />
        <XAxis
          type="number"
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
        />
        <YAxis
          type="category"
          dataKey="name"
          width={236}
          interval={0}
          tick={{ fontSize: 10 }}
          className="text-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          formatter={(value: number) => [`${value} ${t('recruitment.candidateUnit')}`, t('common.quantity')]}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
