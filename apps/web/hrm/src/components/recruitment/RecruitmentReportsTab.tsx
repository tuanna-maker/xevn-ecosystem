import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval, eachMonthOfInterval, eachWeekOfInterval, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ComposedChart,
} from 'recharts';
import {
  FileText,
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Briefcase,
  Target,
  Award,
  BarChart3,
  Loader2,
  CalendarIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const stageColors: Record<string, string> = {
  applied: '#6366f1',
  screening: '#f59e0b',
  interview: '#8b5cf6',
  offer: '#06b6d4',
  hired: '#22c55e',
  rejected: '#ef4444',
};

const getDateLocale = (lang: string) => {
  switch (lang) {
    case 'vi': return vi;
    case 'zh': return zhCN;
    default: return enUS;
  }
};

export function RecruitmentReportsTab() {
  const { t, i18n } = useTranslation();
  const { currentCompanyId } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months' | '6months' | 'year' | 'custom'>('6months');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(subMonths(new Date(), 6));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());

  const dateLocale = getDateLocale(i18n.language);
  const r = (key: string, opts?: Record<string, any>): string => String(t(`recruitmentReport.${key}`, opts));

  const stageLabels: Record<string, string> = {
    applied: r('stages.applied'),
    screening: r('stages.screening'),
    interview: r('stages.interview'),
    offer: r('stages.offer'),
    hired: r('stages.hired'),
    rejected: r('stages.rejected'),
  };

  // Calculate date range based on selection
  const dateRange = useMemo(() => {
    const now = new Date();
    let from: Date;
    let to: Date = now;

    switch (timeRange) {
      case 'week': from = subWeeks(now, 1); break;
      case 'month': from = subMonths(now, 1); break;
      case '3months': from = subMonths(now, 3); break;
      case '6months': from = subMonths(now, 6); break;
      case 'year': from = subMonths(now, 12); break;
      case 'custom':
        from = dateFrom || subMonths(now, 6);
        to = dateTo || now;
        break;
      default: from = subMonths(now, 6);
    }

    return { from, to };
  }, [timeRange, dateFrom, dateTo]);

  // Fetch candidates
  const { data: candidates = [], isLoading: loadingCandidates } = useQuery({
    queryKey: ['recruitment-report-candidates', currentCompanyId, dateRange],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('company_id', currentCompanyId)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString())
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCompanyId,
  });

  // Fetch interviews
  const { data: interviews = [], isLoading: loadingInterviews } = useQuery({
    queryKey: ['recruitment-report-interviews', currentCompanyId, dateRange],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('company_id', currentCompanyId)
        .gte('interview_date', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('interview_date', format(dateRange.to, 'yyyy-MM-dd'))
        .order('interview_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCompanyId,
  });

  // Fetch job postings
  const { data: jobPostings = [], isLoading: loadingJobs } = useQuery({
    queryKey: ['recruitment-report-jobs', currentCompanyId, dateRange],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('company_id', currentCompanyId)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCompanyId,
  });

  // Fetch campaigns
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ['recruitment-report-campaigns', currentCompanyId, dateRange],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      const { data, error } = await supabase
        .from('recruitment_campaigns')
        .select('*')
        .eq('company_id', currentCompanyId)
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCompanyId,
  });

  const isLoading = loadingCandidates || loadingInterviews || loadingJobs || loadingCampaigns;

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCandidates = candidates.length;
    const hiredCount = candidates.filter(c => c.stage === 'hired').length;
    const interviewCount = candidates.filter(c => c.stage === 'interview').length;
    const conversionRate = totalCandidates > 0 ? ((hiredCount / totalCandidates) * 100).toFixed(1) : '0';
    
    const hiredCandidates = candidates.filter(c => c.stage === 'hired' && c.applied_date);
    let avgTimeToHire = 0;
    if (hiredCandidates.length > 0) {
      const totalDays = hiredCandidates.reduce((sum, c) => {
        const appliedDate = c.applied_date ? parseISO(c.applied_date) : new Date(c.created_at);
        const hiredDate = new Date(c.updated_at);
        const days = Math.floor((hiredDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      avgTimeToHire = Math.round(totalDays / hiredCandidates.length);
    }

    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(i => i.status === 'completed').length;
    const activeJobPostings = jobPostings.filter(j => j.status === 'open').length;

    return {
      totalCandidates,
      hiredCount,
      interviewCount,
      conversionRate,
      avgTimeToHire: avgTimeToHire || 21,
      totalInterviews,
      completedInterviews,
      activeJobPostings,
      totalJobPostings: jobPostings.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    };
  }, [candidates, interviews, jobPostings, campaigns]);

  // Dynamic keys for chart data
  const appliedKey = r('applied');
  const interviewedKey = r('interviewed');
  const hiredKey = r('hired');
  const candidateKey = r('candidateLabel');
  const newCandidatesKey = r('newCandidates');
  const totalApplicantsKey = r('totalApplicants');

  // Timeline data
  const timelineData = useMemo(() => {
    const months = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthCandidates = candidates.filter(c => {
        const createdAt = new Date(c.created_at);
        return isWithinInterval(createdAt, { start: monthStart, end: monthEnd });
      });

      const hired = monthCandidates.filter(c => c.stage === 'hired').length;
      const applied = monthCandidates.length;
      const interviewed = monthCandidates.filter(c => ['interview', 'offer', 'hired'].includes(c.stage || '')).length;

      return {
        month: format(month, 'MM/yyyy', { locale: dateLocale }),
        monthLabel: format(month, 'MMM yyyy', { locale: dateLocale }),
        [appliedKey]: applied,
        [interviewedKey]: interviewed,
        [hiredKey]: hired,
        total: applied,
      };
    });
  }, [candidates, dateRange, appliedKey, interviewedKey, hiredKey, dateLocale]);

  // Stage distribution data
  const stageDistribution = useMemo(() => {
    const stageCounts: Record<string, number> = {};
    candidates.forEach(c => {
      const stage = c.stage || 'applied';
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });

    return Object.entries(stageCounts)
      .filter(([_, value]) => value > 0)
      .map(([stage, value]) => ({
        name: stageLabels[stage] || stage,
        value,
        color: stageColors[stage] || '#6366f1',
      }));
  }, [candidates, stageLabels]);

  // Source distribution data
  const sourceDistribution = useMemo(() => {
    const sourceCounts: Record<string, { total: number; hired: number }> = {};
    candidates.forEach(c => {
      const source = c.source || r('other');
      if (!sourceCounts[source]) {
        sourceCounts[source] = { total: 0, hired: 0 };
      }
      sourceCounts[source].total++;
      if (c.stage === 'hired') {
        sourceCounts[source].hired++;
      }
    });

    return Object.entries(sourceCounts)
      .map(([source, data], index) => ({
        name: source,
        [candidateKey]: data.total,
        [hiredKey]: data.hired,
        color: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => (b[candidateKey] as number) - (a[candidateKey] as number))
      .slice(0, 8);
  }, [candidates, candidateKey, hiredKey]);

  // Department hiring data
  const departmentData = useMemo(() => {
    const deptCounts: Record<string, { total: number; hired: number; interviews: number }> = {};
    
    candidates.forEach(c => {
      const dept = c.position || r('uncategorized');
      if (!deptCounts[dept]) {
        deptCounts[dept] = { total: 0, hired: 0, interviews: 0 };
      }
      deptCounts[dept].total++;
      if (c.stage === 'hired') deptCounts[dept].hired++;
      if (['interview', 'offer', 'hired'].includes(c.stage || '')) deptCounts[dept].interviews++;
    });

    return Object.entries(deptCounts)
      .map(([dept, data]) => ({
        department: dept.length > 20 ? dept.substring(0, 20) + '...' : dept,
        fullName: dept,
        [totalApplicantsKey]: data.total,
        [interviewedKey]: data.interviews,
        [hiredKey]: data.hired,
      }))
      .sort((a, b) => (b[totalApplicantsKey] as number) - (a[totalApplicantsKey] as number))
      .slice(0, 6);
  }, [candidates, totalApplicantsKey, interviewedKey, hiredKey]);

  // Weekly trend data
  const weeklyTrendData = useMemo(() => {
    const weeks = eachWeekOfInterval({ start: dateRange.from, end: dateRange.to }, { weekStartsOn: 1 });
    
    return weeks.slice(-12).map(week => {
      const weekStart = startOfWeek(week, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(week, { weekStartsOn: 1 });
      
      const weekCandidates = candidates.filter(c => {
        const createdAt = new Date(c.created_at);
        return isWithinInterval(createdAt, { start: weekStart, end: weekEnd });
      });

      const weekInterviews = interviews.filter(i => {
        const interviewDate = parseISO(i.interview_date);
        return isWithinInterval(interviewDate, { start: weekStart, end: weekEnd });
      });

      return {
        week: format(weekStart, 'dd/MM'),
        [newCandidatesKey]: weekCandidates.length,
        [interviewedKey]: weekInterviews.length,
      };
    });
  }, [candidates, interviews, dateRange, newCandidatesKey, interviewedKey]);

  // Export report
  const handleExportReport = () => {
    const reportData = {
      period: `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`,
      summary: stats,
      timelineData,
      stageDistribution,
      sourceDistribution,
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruitment-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">{r('loadingReport')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{r('title')}</h2>
          <p className="text-sm text-muted-foreground">
            {r('statsFrom', { from: format(dateRange.from, 'dd/MM/yyyy'), to: format(dateRange.to, 'dd/MM/yyyy') })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={r('timeRange')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{r('last7Days')}</SelectItem>
              <SelectItem value="month">{r('last30Days')}</SelectItem>
              <SelectItem value="3months">{r('last3Months')}</SelectItem>
              <SelectItem value="6months">{r('last6Months')}</SelectItem>
              <SelectItem value="year">{r('last12Months')}</SelectItem>
              <SelectItem value="custom">{r('custom')}</SelectItem>
            </SelectContent>
          </Select>

          {timeRange === 'custom' && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("w-[120px] justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy") : r('fromDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                </PopoverContent>
              </Popover>
              <span className="text-muted-foreground">-</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("w-[120px] justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy") : r('toDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            {r('exportReport')}
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{r('totalCandidates')}</p>
                <p className="text-2xl font-bold">{stats.totalCandidates}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{r('hired')}</p>
                <p className="text-2xl font-bold text-green-600">{stats.hiredCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{r('conversionRate')}</p>
                <p className="text-2xl font-bold text-amber-600">{stats.conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{r('avgTimeToHire')}</p>
                <p className="text-2xl font-bold">{r('daysValue', { count: stats.avgTimeToHire })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{r('jobPostings')}</p>
                <p className="text-2xl font-bold">{stats.totalJobPostings}</p>
                <p className="text-xs text-muted-foreground">{r('activeCount', { count: stats.activeJobPostings })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5 text-primary" />
              {r('timelineTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area type="monotone" dataKey={appliedKey} stroke="#6366f1" strokeWidth={2} fill="url(#colorApplied)" />
                <Bar dataKey={interviewedKey} fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey={hiredKey} stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stage Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5 text-primary" />
              {r('stageByPhase')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stageDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {stageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [`${value} ${r('candidates')}`, name]}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                {r('noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Source Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="w-5 h-5 text-primary" />
              {r('sourcePerformance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sourceDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={sourceDistribution} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey={candidateKey} fill="#6366f1" radius={[0, 4, 4, 0]} />
                  <Bar dataKey={hiredKey} fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                {r('noData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Hiring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="w-5 h-5 text-primary" />
              {r('hiringByPosition')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={departmentData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="department" tick={{ fontSize: 9 }} className="text-muted-foreground" angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey={totalApplicantsKey} fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={interviewedKey} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={hiredKey} fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                {r('noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-5 h-5 text-primary" />
              {r('weeklyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey={newCandidatesKey} stroke="#6366f1" strokeWidth={2} fill="url(#colorCandidates)" />
                  <Area type="monotone" dataKey={interviewedKey} stroke="#8b5cf6" strokeWidth={2} fill="url(#colorInterviews)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                {r('noData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{r('quickInsights')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{r('completedInterviews')}</p>
              <p className="text-xl font-bold">{stats.completedInterviews}</p>
              <p className="text-xs text-muted-foreground">/{stats.totalInterviews} {r('totalLabel')}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{r('activeCampaigns')}</p>
              <p className="text-xl font-bold text-primary">{stats.activeCampaigns}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{r('currentlyInterviewing')}</p>
              <p className="text-xl font-bold text-purple-600">{stats.interviewCount}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{r('interviewRate')}</p>
              <p className="text-xl font-bold">
                {stats.totalCandidates > 0 
                  ? ((stats.interviewCount / stats.totalCandidates) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
