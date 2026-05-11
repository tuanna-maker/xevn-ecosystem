import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi, enUS, zhCN } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import {
  Plus, Search, UserPlus, Trash2, Eye, Star, Phone, Mail, Loader2,
  Users, UserCheck, Clock, CheckCircle, XCircle, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CampaignFunnelChart } from './CampaignFunnelChart';

interface CandidateApplication {
  id: string;
  candidate_id: string;
  job_posting_id: string;
  company_id: string;
  campaign_id: string | null;
  stage: string;
  rating: number | null;
  applied_date: string | null;
  interview_date: string | null;
  interviewer: string | null;
  salary_expectation: number | null;
  notes: string | null;
  created_at: string;
  candidate?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    position: string | null;
    avatar_url: string | null;
    source: string | null;
  };
  job_posting?: {
    id: string;
    title: string;
    position: string;
  };
}

interface AvailableCandidate {
  id: string;
  candidate_id: string;
  job_posting_id: string;
  stage: string;
  rating: number | null;
  applied_date: string | null;
  candidate: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    position: string | null;
    avatar_url: string | null;
  };
  job_posting: {
    id: string;
    title: string;
    position: string;
  };
}

interface CampaignCandidatesTabProps {
  campaignId: string;
  companyId: string;
}

const getStageConfig = (t: (key: string) => string) => ({
  applied: { label: t('rc.stages.applied'), color: 'bg-blue-100 text-blue-700', icon: <Users className="w-4 h-4" /> },
  screening: { label: t('rc.stages.screening'), color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" /> },
  interview: { label: t('rc.stages.interview'), color: 'bg-purple-100 text-purple-700', icon: <UserCheck className="w-4 h-4" /> },
  offer: { label: t('rc.stages.offer'), color: 'bg-orange-100 text-orange-700', icon: <CheckCircle className="w-4 h-4" /> },
  hired: { label: t('rc.stages.hired'), color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
  rejected: { label: t('rc.stages.rejected'), color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> },
});

export function CampaignCandidatesTab({ campaignId, companyId }: CampaignCandidatesTabProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const r = (key: string) => t(`rc.${key}`);
  const stageConfig = getStageConfig(t);
  const calLocale = i18n.language === 'vi' ? vi : i18n.language === 'zh' ? zhCN : enUS;

  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [availableCandidates, setAvailableCandidates] = useState<AvailableCandidate[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [linkingInProgress, setLinkingInProgress] = useState(false);
  const [availableSearchQuery, setAvailableSearchQuery] = useState('');
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false);
  const [unlinkingApplication, setUnlinkingApplication] = useState<CandidateApplication | null>(null);

  const fetchLinkedApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('candidate_applications')
        .select(`*, candidate:candidates(id, full_name, email, phone, position, avatar_url, source), job_posting:job_postings(id, title, position)`)
        .eq('campaign_id', campaignId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setApplications((data as CandidateApplication[]) || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({ title: t('common.error'), description: r('fetchError'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCandidates = async () => {
    setLoadingAvailable(true);
    try {
      const { data, error } = await supabase
        .from('candidate_applications')
        .select(`id, candidate_id, job_posting_id, stage, rating, applied_date, candidate:candidates(id, full_name, email, phone, position, avatar_url), job_posting:job_postings(id, title, position)`)
        .eq('company_id', companyId)
        .is('campaign_id', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAvailableCandidates((data as unknown as AvailableCandidate[]) || []);
    } catch (error: any) {
      console.error('Error fetching available candidates:', error);
      toast({ title: t('common.error'), description: r('fetchAvailableError'), variant: 'destructive' });
    } finally {
      setLoadingAvailable(false);
    }
  };

  useEffect(() => { fetchLinkedApplications(); }, [campaignId, companyId]);
  useEffect(() => {
    if (isLinkDialogOpen) { fetchAvailableCandidates(); setSelectedCandidateIds([]); setAvailableSearchQuery(''); }
  }, [isLinkDialogOpen]);

  const handleLinkCandidates = async () => {
    if (selectedCandidateIds.length === 0) return;
    setLinkingInProgress(true);
    try {
      const { error } = await supabase.from('candidate_applications').update({ campaign_id: campaignId }).in('id', selectedCandidateIds);
      if (error) throw error;
      toast({ title: t('common.success'), description: r('linkedSuccess').replace('{{count}}', String(selectedCandidateIds.length)) });
      setIsLinkDialogOpen(false);
      fetchLinkedApplications();
    } catch (error: any) {
      toast({ title: t('common.error'), description: r('linkedError'), variant: 'destructive' });
    } finally {
      setLinkingInProgress(false);
    }
  };

  const handleUnlinkCandidate = async () => {
    if (!unlinkingApplication) return;
    try {
      const { error } = await supabase.from('candidate_applications').update({ campaign_id: null }).eq('id', unlinkingApplication.id);
      if (error) throw error;
      toast({ title: t('common.success'), description: r('unlinkedSuccess') });
      setIsUnlinkDialogOpen(false); setUnlinkingApplication(null); fetchLinkedApplications();
    } catch (error: any) {
      toast({ title: t('common.error'), description: r('unlinkedError'), variant: 'destructive' });
    }
  };

  const handleUpdateStage = async (applicationId: string, newStage: string) => {
    try {
      const { error } = await supabase.from('candidate_applications').update({ stage: newStage }).eq('id', applicationId);
      if (error) throw error;
      toast({ title: t('common.success'), description: r('stageUpdateSuccess') });
      fetchLinkedApplications();
    } catch (error: any) {
      toast({ title: t('common.error'), description: r('stageUpdateError'), variant: 'destructive' });
    }
  };

  const toggleCandidateSelection = (id: string) => {
    setSelectedCandidateIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };
  const selectAllAvailable = () => { setSelectedCandidateIds(filteredAvailableCandidates.map((c) => c.id)); };
  const deselectAll = () => { setSelectedCandidateIds([]); };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground text-sm">-</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`w-3 h-3 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.candidate?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.candidate?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_posting?.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'all' || app.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const filteredAvailableCandidates = availableCandidates.filter((c) =>
    c.candidate?.full_name.toLowerCase().includes(availableSearchQuery.toLowerCase()) ||
    c.candidate?.email.toLowerCase().includes(availableSearchQuery.toLowerCase()) ||
    c.job_posting?.title.toLowerCase().includes(availableSearchQuery.toLowerCase())
  );

  const funnelData = {
    total: applications.length,
    cvPass: applications.filter((a) => a.stage !== 'rejected' && a.stage !== 'applied').length,
    test: applications.filter((a) => a.stage === 'screening').length,
    cvFail: applications.filter((a) => a.stage === 'rejected').length,
    interview: applications.filter((a) => a.stage === 'interview' || a.stage === 'offer' || a.stage === 'hired').length,
    hired: applications.filter((a) => a.stage === 'hired').length,
    hcns: applications.filter((a) => a.stage === 'hired').length,
  };

  const stageStats = {
    applied: applications.filter((a) => a.stage === 'applied').length,
    screening: applications.filter((a) => a.stage === 'screening').length,
    interview: applications.filter((a) => a.stage === 'interview').length,
    offer: applications.filter((a) => a.stage === 'offer').length,
    hired: applications.filter((a) => a.stage === 'hired').length,
    rejected: applications.filter((a) => a.stage === 'rejected').length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-3">
        {Object.entries(stageConfig).map(([key, config]) => (
          <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStageFilter(key === stageFilter ? 'all' : key)}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${config.color}`}>{config.icon}</div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{stageStats[key as keyof typeof stageStats]}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {applications.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">{r('funnel')}</CardTitle></CardHeader>
          <CardContent><CampaignFunnelChart data={funnelData} /></CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={r('searchCandidates')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder={r('statusFilter')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{r('all')}</SelectItem>
              {Object.entries(stageConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsLinkDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />{r('linkCandidates')}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filteredApplications.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{applications.length === 0 ? r('noCandidatesLinked') : r('noMatchFilter')}</p>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{r('candidate')}</TableHead>
                <TableHead>{r('appliedPosition')}</TableHead>
                <TableHead>{r('appliedDate')}</TableHead>
                <TableHead>{r('status')}</TableHead>
                <TableHead>{r('rating')}</TableHead>
                <TableHead className="text-right">{r('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={app.candidate?.avatar_url || undefined} />
                        <AvatarFallback>{app.candidate?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{app.candidate?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{app.candidate?.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{app.job_posting?.title}</p>
                    <p className="text-sm text-muted-foreground">{app.job_posting?.position}</p>
                  </TableCell>
                  <TableCell>{app.applied_date ? format(new Date(app.applied_date), 'dd/MM/yyyy', { locale: calLocale }) : '-'}</TableCell>
                  <TableCell>
                    <Select value={app.stage} onValueChange={(value) => handleUpdateStage(app.id, value)}>
                      <SelectTrigger className="w-32">
                        <Badge className={stageConfig[app.stage as keyof typeof stageConfig]?.color || 'bg-gray-100'}>
                          {stageConfig[app.stage as keyof typeof stageConfig]?.label || app.stage}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(stageConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}><Badge className={config.color}>{config.label}</Badge></SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{renderStars(app.rating)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
                      onClick={() => { setUnlinkingApplication(app); setIsUnlinkDialogOpen(true); }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}

      {/* Link Candidates Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader><DialogTitle>{r('linkToCampaign')}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder={r('searchCandidates')} value={availableSearchQuery} onChange={(e) => setAvailableSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAllAvailable}>{r('selectAll')}</Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>{r('deselectAll')}</Button>
              </div>
            </div>
            {selectedCandidateIds.length > 0 && (
              <div className="p-2 bg-primary/5 rounded-lg">
                <p className="text-sm">{r('selectedCount').replace('{{count}}', String(selectedCandidateIds.length))}</p>
              </div>
            )}
            <ScrollArea className="h-[400px]">
              {loadingAvailable ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : filteredAvailableCandidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {availableCandidates.length === 0 ? r('noAvailableCandidates') : r('noMatchSearch')}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAvailableCandidates.map((candidate) => (
                    <div key={candidate.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedCandidateIds.includes(candidate.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                      onClick={() => toggleCandidateSelection(candidate.id)}>
                      <Checkbox checked={selectedCandidateIds.includes(candidate.id)} onCheckedChange={() => toggleCandidateSelection(candidate.id)} />
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={candidate.candidate?.avatar_url || undefined} />
                        <AvatarFallback>{candidate.candidate?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{candidate.candidate?.full_name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.candidate?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{candidate.job_posting?.title}</p>
                        <Badge className={stageConfig[candidate.stage as keyof typeof stageConfig]?.color || 'bg-gray-100'} variant="secondary">
                          {stageConfig[candidate.stage as keyof typeof stageConfig]?.label || candidate.stage}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>{r('cancel')}</Button>
            <Button onClick={handleLinkCandidates} disabled={selectedCandidateIds.length === 0 || linkingInProgress}>
              {linkingInProgress && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {r('link')} ({selectedCandidateIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlink Confirmation Dialog */}
      <AlertDialog open={isUnlinkDialogOpen} onOpenChange={setIsUnlinkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{r('confirmUnlink')}</AlertDialogTitle>
            <AlertDialogDescription>
              {r('unlinkDescription').replace('{{name}}', unlinkingApplication?.candidate?.full_name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{r('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlinkCandidate}>{r('unlink')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
