import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SkillDataPoint {
  subject: string;
  value: number;
  fullMark: number;
}

interface EmployeeSkillsRadarChartProps {
  data?: SkillDataPoint[];
}

const defaultSkillsData: SkillDataPoint[] = [
  { subject: 'Kỹ năng giao tiếp', value: 4, fullMark: 5 },
  { subject: 'Kỹ năng chuyên môn', value: 5, fullMark: 5 },
  { subject: 'Kỹ năng lãnh đạo', value: 3, fullMark: 5 },
  { subject: 'Tư duy phản biện', value: 4, fullMark: 5 },
  { subject: 'Làm việc nhóm', value: 5, fullMark: 5 },
  { subject: 'Hiểu biết về công ty, sản phẩm', value: 4, fullMark: 5 },
  { subject: 'Kỹ năng trình bày', value: 3, fullMark: 5 },
  { subject: 'Kỹ năng sử dụng công nghệ', value: 5, fullMark: 5 },
];

export function EmployeeSkillsRadarChart({ data = defaultSkillsData }: EmployeeSkillsRadarChartProps) {
  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            tickCount={6}
          />
          <Legend
            wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }}
          />
          <Radar
            name="Điểm chuẩn"
            dataKey="fullMark"
            stroke="hsl(217, 91%, 60%)"
            fill="hsl(217, 91%, 60%)"
            fillOpacity={0.1}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <Radar
            name="Nhân viên"
            dataKey="value"
            stroke="hsl(142, 71%, 45%)"
            fill="hsl(142, 71%, 45%)"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
