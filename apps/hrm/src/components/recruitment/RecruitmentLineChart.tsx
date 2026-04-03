import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: '01/2023', value: 15 },
  { month: '02/2023', value: 22 },
  { month: '03/2023', value: 28 },
  { month: '04/2023', value: 45 },
  { month: '05/2023', value: 58 },
  { month: '06/2023', value: 42 },
  { month: '07/2023', value: 35 },
  { month: '08/2023', value: 50 },
  { month: '09/2023', value: 38 },
  { month: '10/2023', value: 32 },
  { month: '11/2023', value: 25 },
  { month: '12/2023', value: 30 },
];

export function RecruitmentLineChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 10 }} 
          className="text-muted-foreground"
        />
        <YAxis 
          tick={{ fontSize: 10 }} 
          className="text-muted-foreground"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorValue)"
          dot={{ r: 4, fill: 'hsl(var(--primary))' }}
          activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
