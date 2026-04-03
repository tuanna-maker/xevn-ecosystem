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

const data = [
  { name: 'CÔNG TY CỔ PHẦN 1OFFICE', value: 280, color: '#f59e0b' },
  { name: 'Chi nhánh HCM - Echard Phong...', value: 240, color: '#22c55e' },
  { name: 'Chi nhánh HCM - Phòng kế toán', value: 200, color: '#8b5cf6' },
  { name: 'CÔNG TY CỔ PHẦN 1OFFICE - Chi nhanh...', value: 180, color: '#06b6d4' },
  { name: 'Chi nhánh Hà Nội - Kinh doanh Hà Nội', value: 160, color: '#f59e0b' },
  { name: 'Chi nhánh Hà Nội - Triển khai Hà Nội', value: 140, color: '#22c55e' },
  { name: 'CÔNG TY CỔ PHẦN 1OFFICE - Ban thu...', value: 120, color: '#8b5cf6' },
  { name: 'Chi nhánh Hà Nội - Phòng kế toán', value: 100, color: '#06b6d4' },
];

export function RecruitmentBarChart() {
  const { t } = useTranslation();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={data} 
        layout="vertical" 
        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-muted" />
        <XAxis 
          type="number" 
          tick={{ fontSize: 10 }} 
          className="text-muted-foreground"
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={150}
          tick={{ fontSize: 9 }}
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
