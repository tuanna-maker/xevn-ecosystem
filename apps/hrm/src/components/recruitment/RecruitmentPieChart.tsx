import { useTranslation } from 'react-i18next';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CandidateData {
  stage: string;
}

interface RecruitmentPieChartProps {
  candidates: CandidateData[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#f59e0b', '#22c55e', '#06b6d4'];

export function RecruitmentPieChart({ candidates }: RecruitmentPieChartProps) {
  const { t } = useTranslation();

  const stageLabels: Record<string, string> = {
    applied: t('recruitment.applied'),
    screening: t('recruitment.screening'),
    interview: t('recruitment.interview'),
    offer: t('recruitment.offer'),
    hired: t('recruitment.hired'),
  };

  const stageData = [
    { name: stageLabels.applied, value: candidates.filter(c => c.stage === 'applied').length, stage: 'applied' },
    { name: stageLabels.screening, value: candidates.filter(c => c.stage === 'screening').length, stage: 'screening' },
    { name: stageLabels.interview, value: candidates.filter(c => c.stage === 'interview').length, stage: 'interview' },
    { name: stageLabels.offer, value: candidates.filter(c => c.stage === 'offer').length, stage: 'offer' },
    { name: stageLabels.hired, value: candidates.filter(c => c.stage === 'hired').length, stage: 'hired' },
  ].filter(item => item.value > 0);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={stageData}
          cx="50%"
          cy="50%"
          innerRadius={44}
          outerRadius={74}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {stageData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          formatter={(value: number, name: string) => [`${value} ${t('recruitment.candidateUnit')}`, name]}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
