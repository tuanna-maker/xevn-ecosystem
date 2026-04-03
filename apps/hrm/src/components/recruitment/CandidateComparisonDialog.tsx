import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import {
  BarChart3, Users, Star, TrendingUp, TrendingDown, Minus,
  CheckCircle, XCircle, AlertCircle, Loader2, ChevronRight,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface JobPosting { id: string; title: string; position: string; department?: string | null; }

interface CandidateWithEvaluation {
  id: string; full_name: string; email: string; avatar_url?: string | null;
  position?: string | null; phone?: string | null; applied_date?: string | null;
  evaluation?: {
    id: string; total_score: number | null; weighted_score: number | null;
    recommendation: string | null; result: string | null; overall_feedback: string | null;
    evaluator_name: string | null; created_at: string;
    scores: { criterion_name: string; category: string; actual_score: number | null; required_score: number; weight: number; }[];
  } | null;
}

interface CandidateComparisonDialogProps { open: boolean; onOpenChange: (open: boolean) => void; }

const getResultConfig = (t: (k: string) => string) => ({
  pass: { label: t('rc.results.pass'), color: 'text-green-600 bg-green-100 dark:bg-green-900/30', icon: <CheckCircle className="w-4 h-4" /> },
  fail: { label: t('rc.results.fail'), color: 'text-red-600 bg-red-100 dark:bg-red-900/30', icon: <XCircle className="w-4 h-4" /> },
  pending: { label: t('rc.results.pending'), color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30', icon: <AlertCircle className="w-4 h-4" /> },
});

const getRecommendationConfig = (t: (k: string) => string) => ({
  'strong_hire': { label: t('rc.recommendations.strongHire'), color: 'text-green-700 bg-green-100 dark:bg-green-900/30' },
  'hire': { label: t('rc.recommendations.hire'), color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
  'maybe': { label: t('rc.recommendations.maybe'), color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
  'no_hire': { label: t('rc.recommendations.noHire'), color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
});

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(39, 100%, 50%)', 'hsl(142, 71%, 45%)', 'hsl(280, 85%, 65%)'];

export function CandidateComparisonDialog({ open, onOpenChange }: CandidateComparisonDialogProps) {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const r = (key: string) => t(`rc.${key}`);
  const resultConfig = getResultConfig(t);
  const recommendationConfig = getRecommendationConfig(t);

  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [candidates, setCandidates] = useState<CandidateWithEvaluation[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  useEffect(() => {
    if (!open || !currentCompanyId) return;
    const fetchJobPostings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('job_postings').select('id, title, position, department')
          .eq('company_id', currentCompanyId).eq('status', 'published').order('created_at', { ascending: false });
        if (error) throw error;
        setJobPostings(data || []);
      } catch (error) {
        toast({ title: t('common.error'), description: r('fetchJobError'), variant: 'destructive' });
      } finally { setLoading(false); }
    };
    fetchJobPostings();
  }, [open, currentCompanyId]);

  useEffect(() => {
    if (!selectedJobId || !currentCompanyId) { setCandidates([]); setSelectedCandidateIds([]); return; }
    const fetchCandidatesWithEvaluations = async () => {
      setLoadingCandidates(true);
      try {
        const { data: applications, error: appError } = await supabase.from('candidate_applications')
          .select(`candidate_id, candidates (id, full_name, email, avatar_url, position, phone, applied_date)`)
          .eq('job_posting_id', selectedJobId).eq('company_id', currentCompanyId);
        if (appError) throw appError;
        const candidateIds = applications?.map(a => a.candidate_id) || [];
        if (candidateIds.length === 0) { setCandidates([]); setSelectedCandidateIds([]); setLoadingCandidates(false); return; }

        const { data: evaluations, error: evalError } = await supabase.from('candidate_evaluations')
          .select(`id, candidate_id, total_score, weighted_score, recommendation, result, overall_feedback, evaluator_name, created_at`)
          .in('candidate_id', candidateIds).eq('company_id', currentCompanyId).order('created_at', { ascending: false });
        if (evalError) throw evalError;

        const latestEvaluations = new Map<string, any>();
        evaluations?.forEach(ev => { if (!latestEvaluations.has(ev.candidate_id)) latestEvaluations.set(ev.candidate_id, ev); });

        const evaluationIds = Array.from(latestEvaluations.values()).map(e => e.id);
        let scoresMap = new Map<string, any[]>();
        if (evaluationIds.length > 0) {
          const { data: scores } = await supabase.from('candidate_evaluation_scores')
            .select('evaluation_id, criterion_name, category, actual_score, required_score, weight').in('evaluation_id', evaluationIds);
          scores?.forEach(score => {
            if (!scoresMap.has(score.evaluation_id)) scoresMap.set(score.evaluation_id, []);
            scoresMap.get(score.evaluation_id)!.push(score);
          });
        }

        const candidatesWithEval: CandidateWithEvaluation[] = applications?.filter(a => a.candidates).map(a => {
          const candidate = a.candidates as any;
          const evaluation = latestEvaluations.get(candidate.id);
          return { id: candidate.id, full_name: candidate.full_name, email: candidate.email, avatar_url: candidate.avatar_url, position: candidate.position, phone: candidate.phone, applied_date: candidate.applied_date,
            evaluation: evaluation ? { ...evaluation, scores: scoresMap.get(evaluation.id) || [] } : null };
        }) || [];

        setCandidates(candidatesWithEval);
        const withEval = candidatesWithEval.filter(c => c.evaluation);
        setSelectedCandidateIds(withEval.slice(0, 2).map(c => c.id));
      } catch (error) {
        toast({ title: t('common.error'), description: r('fetchError'), variant: 'destructive' });
      } finally { setLoadingCandidates(false); }
    };
    fetchCandidatesWithEvaluations();
  }, [selectedJobId, currentCompanyId]);

  const selectedCandidates = useMemo(() => candidates.filter(c => selectedCandidateIds.includes(c.id)), [candidates, selectedCandidateIds]);

  const toggleCandidate = (candidateId: string) => {
    setSelectedCandidateIds(prev => {
      if (prev.includes(candidateId)) return prev.filter(id => id !== candidateId);
      if (prev.length >= 4) { toast({ title: r('limitReached'), description: r('maxCompare') }); return prev; }
      return [...prev, candidateId];
    });
  };

  const radarData = useMemo(() => {
    if (selectedCandidates.length === 0) return [];
    const allCriteria = new Set<string>();
    selectedCandidates.forEach(c => { c.evaluation?.scores.forEach(s => allCriteria.add(s.criterion_name)); });
    return Array.from(allCriteria).map(criterion => {
      const dataPoint: any = { criterion };
      selectedCandidates.forEach((candidate, index) => {
        const score = candidate.evaluation?.scores.find(s => s.criterion_name === criterion);
        dataPoint[`candidate${index}`] = score?.actual_score || 0;
        dataPoint[`candidateName${index}`] = candidate.full_name;
      });
      return dataPoint;
    });
  }, [selectedCandidates]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />{r('compareTitle')}
          </DialogTitle>
        </DialogHeader>
        <div className="flex h-[calc(90vh-100px)]">
          {/* Left sidebar */}
          <div className="w-80 border-r flex flex-col">
            <div className="p-4 border-b">
              <label className="text-sm font-medium mb-2 block">{r('selectJobPosting')}</label>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger><SelectValue placeholder={r('selectPosition')} /></SelectTrigger>
                <SelectContent>
                  {jobPostings.map(job => (
                    <SelectItem key={job.id} value={job.id}>
                      <div className="flex flex-col"><span>{job.title}</span>
                        {job.department && <span className="text-xs text-muted-foreground">{job.department}</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {loadingCandidates ? (
                  <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : candidates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{selectedJobId ? r('noCandidatesForJob') : r('selectJobToView')}</p>
                  </div>
                ) : (
                  candidates.map(candidate => (
                    <div key={candidate.id} onClick={() => toggleCandidate(candidate.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedCandidateIds.includes(candidate.id) ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'}`}>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10"><AvatarImage src={candidate.avatar_url || ''} />
                          <AvatarFallback>{candidate.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{candidate.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{candidate.email}</p>
                        </div>
                        {candidate.evaluation ? (
                          <Badge variant="outline" className="shrink-0">{candidate.evaluation.weighted_score?.toFixed(1) || '-'}</Badge>
                        ) : (
                          <Badge variant="secondary" className="shrink-0 text-xs">{r('notEvaluated')}</Badge>
                        )}
                      </div>
                      {candidate.evaluation && candidate.evaluation.result && resultConfig[candidate.evaluation.result as keyof typeof resultConfig] && (
                        <div className="mt-2 flex items-center gap-2">
                          <Badge className={`text-xs ${resultConfig[candidate.evaluation.result as keyof typeof resultConfig].color}`}>
                            {resultConfig[candidate.evaluation.result as keyof typeof resultConfig].icon}
                            <span className="ml-1">{resultConfig[candidate.evaluation.result as keyof typeof resultConfig].label}</span>
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-muted/30">
              <p className="text-xs text-muted-foreground">{r('selectedCompare').replace('{{count}}', String(selectedCandidateIds.length))}</p>
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1 overflow-auto">
            {selectedCandidates.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">{r('selectToCompare')}</p>
                  <p className="text-sm">{r('clickToAdd')}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedCandidates.map((candidate, index) => (
                    <Card key={candidate.id} className="relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: COLORS[index] }} />
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar><AvatarImage src={candidate.avatar_url || ''} />
                            <AvatarFallback style={{ backgroundColor: COLORS[index], color: 'white' }}>
                              {candidate.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{candidate.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{candidate.position || '-'}</p>
                          </div>
                        </div>
                        {candidate.evaluation ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">{r('totalScore')}</span>
                              <span className="text-2xl font-bold" style={{ color: COLORS[index] }}>{candidate.evaluation.weighted_score?.toFixed(1) || '-'}</span>
                            </div>
                            {candidate.evaluation.recommendation && recommendationConfig[candidate.evaluation.recommendation as keyof typeof recommendationConfig] && (
                              <Badge className={`w-full justify-center ${recommendationConfig[candidate.evaluation.recommendation as keyof typeof recommendationConfig].color}`}>
                                {recommendationConfig[candidate.evaluation.recommendation as keyof typeof recommendationConfig].label}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-4">{r('noEvaluation')}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {radarData.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">{r('criteriaChart')}</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} />
                            <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickCount={6} />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                              formatter={(value) => { const index = parseInt(value.replace('candidate', '')); return <span className="text-foreground">{selectedCandidates[index]?.full_name || value}</span>; }} />
                            {selectedCandidates.map((_, index) => (
                              <Radar key={index} name={`candidate${index}`} dataKey={`candidate${index}`} stroke={COLORS[index]} fill={COLORS[index]} fillOpacity={0.2} strokeWidth={2} />
                            ))}
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedCandidates.filter(c => c.evaluation).length >= 2 && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">{r('criteriaDetail')}</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-3 font-medium">{r('criteria')}</th>
                              {selectedCandidates.map((candidate, index) => (
                                <th key={candidate.id} className="text-center py-2 px-3 font-medium">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                    <span className="truncate max-w-[100px]">{candidate.full_name}</span>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {radarData.map((row, rowIndex) => (
                              <tr key={rowIndex} className="border-b last:border-0">
                                <td className="py-2 px-3">{row.criterion}</td>
                                {selectedCandidates.map((candidate, index) => {
                                  const score = row[`candidate${index}`];
                                  const maxScore = Math.max(...selectedCandidates.map((_, i) => row[`candidate${i}`] || 0));
                                  const isMax = score === maxScore && score > 0;
                                  return (
                                    <td key={candidate.id} className="text-center py-2 px-3">
                                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${isMax ? 'bg-green-100 text-green-700 font-bold dark:bg-green-900/30' : ''}`}>{score || '-'}</span>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                            <tr className="border-t-2 font-medium">
                              <td className="py-2 px-3">{r('totalScore')}</td>
                              {selectedCandidates.map((candidate, index) => {
                                const score = candidate.evaluation?.weighted_score;
                                const maxScore = Math.max(...selectedCandidates.map(c => c.evaluation?.weighted_score || 0));
                                const isMax = score === maxScore && score && score > 0;
                                return (
                                  <td key={candidate.id} className="text-center py-2 px-3">
                                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full ${isMax ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{score?.toFixed(1) || '-'}</span>
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedCandidates.some(c => c.evaluation?.overall_feedback) && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">{r('overallFeedback')}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      {selectedCandidates.map((candidate, index) => (
                        candidate.evaluation?.overall_feedback && (
                          <div key={candidate.id} className="flex gap-3">
                            <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: COLORS[index] }} />
                            <div>
                              <p className="font-medium text-sm mb-1">{candidate.full_name}</p>
                              <p className="text-sm text-muted-foreground">{candidate.evaluation.overall_feedback}</p>
                            </div>
                          </div>
                        )
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
