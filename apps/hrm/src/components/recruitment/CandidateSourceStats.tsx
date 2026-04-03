import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Linkedin,
  Globe,
  Users,
  Mail,
  Briefcase,
  Share2,
  FileText,
  HelpCircle,
  TrendingUp,
  UserCheck,
} from 'lucide-react';

interface CandidateSourceStatsProps {
  selectedSource: string | null;
  onSourceFilter?: (source: string | null) => void;
}

// Define source configurations with icons and colors
const getSourceConfig = (t: (key: string) => string): Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> => ({
  'LinkedIn': { label: 'LinkedIn', icon: Linkedin, color: '#0A66C2', bgColor: 'bg-[#0A66C2]/10' },
  'Website': { label: 'Website', icon: Globe, color: '#10B981', bgColor: 'bg-emerald-100' },
  'Giới thiệu': { label: t('recruitment.sourceReferral'), icon: Users, color: '#8B5CF6', bgColor: 'bg-purple-100' },
  'Referral': { label: t('recruitment.sourceReferral'), icon: Users, color: '#8B5CF6', bgColor: 'bg-purple-100' },
  'Email': { label: 'Email', icon: Mail, color: '#F59E0B', bgColor: 'bg-amber-100' },
  'TopCV': { label: 'TopCV', icon: Briefcase, color: '#EF4444', bgColor: 'bg-red-100' },
  'VietnamWorks': { label: 'VietnamWorks', icon: Briefcase, color: '#3B82F6', bgColor: 'bg-blue-100' },
  'Facebook': { label: 'Facebook', icon: Share2, color: '#1877F2', bgColor: 'bg-[#1877F2]/10' },
  'Hội chợ việc làm': { label: t('recruitment.sourceJobFair'), icon: FileText, color: '#06B6D4', bgColor: 'bg-cyan-100' },
  'Job Fair': { label: t('recruitment.sourceJobFair'), icon: FileText, color: '#06B6D4', bgColor: 'bg-cyan-100' },
  'other': { label: t('common.other'), icon: HelpCircle, color: '#6B7280', bgColor: 'bg-gray-100' },
});

export function CandidateSourceStats({ selectedSource, onSourceFilter }: CandidateSourceStatsProps) {
  const { currentCompanyId } = useAuth();
  const { t } = useTranslation();
  const sourceConfig = getSourceConfig(t);

  // Fetch candidates with source data
  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['candidates_source_stats', currentCompanyId],
    queryFn: async () => {
      if (!currentCompanyId) return [];
      
      const { data, error } = await supabase
        .from('candidates')
        .select('id, source, stage, rating, applied_date')
        .eq('company_id', currentCompanyId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!currentCompanyId,
  });

  const stats = useMemo(() => {
    const sourceMap = new Map<string, { count: number; hired: number; interview: number; totalRating: number; ratedCount: number }>();
    
    candidates.forEach(candidate => {
      const source = candidate.source || t('common.other');
      const normalizedSource = Object.keys(sourceConfig).find(
        key => source.toLowerCase().includes(key.toLowerCase())
      ) || 'other';
      
      if (!sourceMap.has(normalizedSource)) {
        sourceMap.set(normalizedSource, { count: 0, hired: 0, interview: 0, totalRating: 0, ratedCount: 0 });
      }
      
      const stat = sourceMap.get(normalizedSource)!;
      stat.count++;
      if (candidate.stage === 'hired') stat.hired++;
      if (candidate.stage === 'interview' || candidate.stage === 'offer' || candidate.stage === 'hired') {
        stat.interview++;
      }
      if (candidate.rating) {
        stat.totalRating += candidate.rating;
        stat.ratedCount++;
      }
    });

    const total = candidates.length;
    const sourceStats = Array.from(sourceMap.entries()).map(([source, data]) => ({
      source,
      ...sourceConfig[source] || sourceConfig['other'],
      count: data.count,
      percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
      hired: data.hired,
      interview: data.interview,
      conversionRate: data.count > 0 ? Math.round((data.hired / data.count) * 100) : 0,
      avgRating: data.ratedCount > 0 ? Math.round((data.totalRating / data.ratedCount) * 10) / 10 : 0,
    })).sort((a, b) => b.count - a.count);

    const topSource = sourceStats[0] || null;
    const bestConversion = [...sourceStats].filter(s => s.count >= 3).sort((a, b) => b.conversionRate - a.conversionRate)[0] || null;

    return { total, sourceStats, topSource, bestConversion };
  }, [candidates, sourceConfig, t]);

  const pieChartData = stats.sourceStats.map(s => ({
    name: s.label,
    value: s.count,
    color: s.color,
  }));

  const barChartData = stats.sourceStats.slice(0, 6).map(s => ({
    name: s.label.length > 10 ? s.label.substring(0, 10) + '...' : s.label,
    [t('recruitment.candidateUnit')]: s.count,
    [t('recruitment.interview')]: s.interview,
    [t('recruitment.hired')]: s.hired,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('recruitment.totalCandidates')}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Share2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('recruitment.sourcesCount')}</p>
                <p className="text-2xl font-bold">{stats.sourceStats.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('recruitment.bestSource')}</p>
                <p className="text-lg font-bold truncate">{stats.topSource?.label || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <UserCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('recruitment.highestConversion')}</p>
                <p className="text-lg font-bold">
                  {stats.bestConversion?.label || '-'} ({stats.bestConversion?.conversionRate || 0}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('recruitment.candidateDistBySource')}</CardTitle>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value} ${t('recruitment.candidateUnit')}`, t('common.quantity')]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                {t('common.noData')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('recruitment.sourceEfficiency')}</CardTitle>
          </CardHeader>
          <CardContent>
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={t('recruitment.candidateUnit')} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={t('recruitment.interview')} fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={t('recruitment.hired')} fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                {t('common.noData')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Source Details List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('recruitment.sourceDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.sourceStats.map((source) => {
              const SourceIcon = source.icon;
              const isSelected = selectedSource === source.source;
              
              return (
                <div
                  key={source.source}
                  className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onSourceFilter?.(isSelected ? null : source.source)}
                >
                  <div className={`p-2 rounded-lg ${source.bgColor}`}>
                    <SourceIcon className="w-5 h-5" style={{ color: source.color }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{source.label}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{source.count} {t('recruitment.candidateUnit')}</Badge>
                        <Badge 
                          className={source.conversionRate >= 20 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : source.conversionRate >= 10 
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }
                        >
                          {source.conversionRate}% {t('recruitment.hiredRate')}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={source.percentage} className="h-2" />
                    <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                      <span>{source.percentage}% {t('recruitment.ofTotal')}</span>
                      <span>
                        {source.interview} {t('recruitment.interviewedLower')} • {source.hired} {t('recruitment.hiredLower')}
                        {source.avgRating > 0 && ` • ⭐ ${source.avgRating}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {stats.sourceStats.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {t('recruitment.noCandidateData')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
