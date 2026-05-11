import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { BarChart3, Table2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(217, 91%, 60%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(280, 65%, 60%)',
  'hsl(0, 84%, 60%)',
  'hsl(190, 90%, 50%)',
  'hsl(330, 80%, 55%)',
];

interface ChartData {
  name: string;
  value: number;
}

/** Detect if a markdown table has a numeric column and extract chart data */
function extractChartDataFromTable(rows: string[][]): ChartData[] | null {
  if (rows.length < 2) return null;

  const headers = rows[0];
  const dataRows = rows.slice(1);

  // Find a numeric column (not the first one which is usually the label)
  let numColIndex = -1;
  let labelColIndex = 0;

  for (let c = 1; c < headers.length; c++) {
    const allNumeric = dataRows.every(row => {
      const val = row[c]?.replace(/[,.\s%đ₫VND]/gi, '').trim();
      return val && !isNaN(Number(val));
    });
    if (allNumeric) {
      numColIndex = c;
      break;
    }
  }

  if (numColIndex === -1) return null;

  return dataRows.map(row => ({
    name: (row[labelColIndex] || '').trim().replace(/\*\*/g, ''),
    value: parseFloat(row[numColIndex]?.replace(/[,\s%đ₫VND]/gi, '') || '0'),
  })).filter(d => d.name && !isNaN(d.value));
}

/** Parse markdown table string into rows */
function parseMarkdownTable(tableStr: string): string[][] {
  const lines = tableStr.trim().split('\n').filter(l => l.trim());
  if (lines.length < 3) return [];

  const parseRow = (line: string) =>
    line.split('|').map(cell => cell.trim()).filter((_, i, arr) => i > 0 && i < arr.length);

  const header = parseRow(lines[0]);
  // Skip separator line (lines[1])
  const body = lines.slice(2).map(parseRow);

  return [header, ...body];
}

function SmartTable({ rows }: { rows: string[][] }) {
  if (rows.length < 2) return null;
  const [headers, ...dataRows] = rows;

  return (
    <div className="overflow-x-auto rounded-lg border my-2">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {headers.map((h, i) => (
              <TableHead key={i} className="font-semibold text-xs whitespace-nowrap">
                {h.replace(/\*\*/g, '')}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataRows.map((row, ri) => (
            <TableRow key={ri} className="hover:bg-muted/30">
              {row.map((cell, ci) => (
                <TableCell key={ci} className="text-xs py-1.5 whitespace-nowrap">
                  {cell.replace(/\*\*/g, '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SmartChart({ data, title }: { data: ChartData[]; title?: string }) {
  if (data.length <= 1) return null;

  const usePie = data.length <= 6;

  return (
    <Card className="p-3 my-2 border">
      {title && (
        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
          <BarChart3 className="w-3.5 h-3.5" />
          Biểu đồ trực quan
        </p>
      )}
      <ResponsiveContainer width="100%" height={usePie ? 220 : Math.max(180, data.length * 32)}>
        {usePie ? (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
          </PieChart>
        ) : (
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" tick={{ fontSize: 10 }} className="text-muted-foreground" />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 9 }}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </Card>
  );
}

interface ChatMessageRendererProps {
  content: string;
  compact?: boolean;
}

export function ChatMessageRenderer({ content, compact = false }: ChatMessageRendererProps) {
  // Split content into segments: text and tables
  const segments = useMemo(() => {
    const tableRegex = /(\|[^\n]+\|\n\|[\s\-:|]+\|\n(?:\|[^\n]+\|\n?)+)/g;
    const parts: { type: 'text' | 'table'; content: string }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tableRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'table', content: match[1] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.slice(lastIndex) });
    }

    return parts;
  }, [content]);

  return (
    <div className={cn(
      "prose dark:prose-invert max-w-none",
      compact
        ? "prose-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h1]:text-sm [&_h2]:text-sm [&_h3]:text-xs"
        : "prose-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5"
    )}>
      {segments.map((seg, i) => {
        if (seg.type === 'table') {
          const rows = parseMarkdownTable(seg.content);
          const chartData = extractChartDataFromTable(rows);

          return (
            <div key={i}>
              <SmartTable rows={rows} />
              {chartData && chartData.length >= 2 && (
                <SmartChart data={chartData} title="auto" />
              )}
            </div>
          );
        }

        return (
          <ReactMarkdown key={i}>{seg.content}</ReactMarkdown>
        );
      })}
    </div>
  );
}
