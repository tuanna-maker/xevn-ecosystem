import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Check, User, Phone, Mail, Calendar, MapPin, Briefcase, Building2, 
  FileText, CreditCard, Video, Star, ArrowRightLeft, Megaphone, Tag, Edit,
  Clock, Users, UserCheck, CheckCircle, XCircle, Loader2, Globe, Paperclip
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CandidateAvatarUpload } from './CandidateAvatarUpload';
import { CandidateEvaluationRadarChart } from './CandidateEvaluationRadarChart';
import { CandidateResumeFiles } from './CandidateResumeFiles';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Candidate {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  source?: string | null;
  stage?: string | null;
  rating?: number | null;
  applied_date?: string | null;
  expected_start_date?: string | null;
  nationality?: string | null;
  hometown?: string | null;
  marital_status?: string | null;
  notes?: string | null;
  avatar_url?: string | null;
  height?: string | null;
  weight?: string | null;
  ethnicity?: string | null;
  religion?: string | null;
  military_service?: string | null;
  created_at: string;
}

interface Interview {
  id: string;
  candidate_name: string;
  position: string | null;
  interview_date: string;
  interview_time: string;
  interviewer_name: string | null;
  interview_type: string | null;
  status: string | null;
  location: string | null;
  notes: string | null;
  feedback: string | null;
  rating: number | null;
}

interface CandidateApplication {
  id: string;
  job_posting_id: string;
  campaign_id: string | null;
  stage: string | null;
  applied_date: string | null;
  rating: number | null;
  notes: string | null;
  job_posting?: {
    title: string;
    position: string;
    department: string | null;
  } | null;
  campaign?: {
    name: string;
  } | null;
}

interface CandidateDetailViewProps {
  candidate: Candidate;
  onBack: () => void;
  onEvaluate: () => void;
  onEdit?: () => void;
}

// Map candidate stage to timeline index
const stageToIndex: Record<string, number> = {
  applied: 0,
  screening: 1,
  interview: 2,
  offer: 3,
  hired: 4,
};

const getStageConfig = (r: (key: string) => string) => ({
  applied: { label: r('stages.applied'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: <Users className="w-4 h-4" /> },
  screening: { label: r('stages.screening'), color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <Clock className="w-4 h-4" /> },
  interview: { label: r('stages.interview'), color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: <UserCheck className="w-4 h-4" /> },
  offer: { label: r('stages.offer'), color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: <CheckCircle className="w-4 h-4" /> },
  hired: { label: r('stages.hired'), color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-4 h-4" /> },
  rejected: { label: r('stages.rejected'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: <XCircle className="w-4 h-4" /> },
});

const getInterviewStatusConfig = (r: (key: string) => string) => ({
  scheduled: { label: r('interviewStatus.scheduled'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  completed: { label: r('interviewStatus.completed'), color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: r('interviewStatus.cancelled'), color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  rescheduled: { label: r('interviewStatus.rescheduled'), color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
});

// Mock evaluation data for radar chart
const radarChartData = [
  { subject: 'Kỹ năng chuyên môn', required: 4, actual: 4, fullMark: 5 },
  { subject: 'Giao tiếp', required: 4, actual: 3.75, fullMark: 5 },
  { subject: 'Làm việc nhóm', required: 4, actual: 4.25, fullMark: 5 },
  { subject: 'Giải quyết vấn đề', required: 3.5, actual: 3.5, fullMark: 5 },
  { subject: 'Học hỏi', required: 4, actual: 4.5, fullMark: 5 },
  { subject: 'Thích nghi', required: 3.5, actual: 3.9, fullMark: 5 },
];

// Computed scores for display
const evaluationScores = radarChartData.map(item => ({
  skill: item.subject,
  value: Math.round((item.actual / item.fullMark) * 100)
}));

export function CandidateDetailView({ candidate, onBack, onEvaluate, onEdit }: CandidateDetailViewProps) {
  const { t } = useTranslation();
  const r = (key: string) => t(`rc.${key}`);
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('details');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(candidate.avatar_url || null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  
  const currentStageIndex = stageToIndex[candidate.stage || 'applied'] ?? 0;
  const stageConfig = getStageConfig(r);
  const interviewStatusConfig = getInterviewStatusConfig(r);

  const recruitmentStages = [
    { id: 'applied', label: r('stages.applied') },
    { id: 'screening', label: r('stages.screening') },
    { id: 'interview', label: r('stages.interview') },
    { id: 'offer', label: r('stages.offer') },
    { id: 'hired', label: r('stages.hired') },
  ];

  // Fetch interviews for this candidate
  useEffect(() => {
    const fetchInterviews = async () => {
      if (!currentCompanyId) return;
      setLoadingInterviews(true);
      try {
        const { data, error } = await supabase
          .from('interviews')
          .select('*')
          .eq('company_id', currentCompanyId)
          .eq('candidate_id', candidate.id)
          .order('interview_date', { ascending: false });

        if (error) throw error;
        setInterviews(data || []);
      } catch (error: any) {
        console.error('Error fetching interviews:', error);
      } finally {
        setLoadingInterviews(false);
      }
    };

    if (activeTab === 'interview') {
      fetchInterviews();
    }
  }, [activeTab, currentCompanyId, candidate.id]);

  // Fetch applications for this candidate
  useEffect(() => {
    const fetchApplications = async () => {
      if (!currentCompanyId) return;
      setLoadingApplications(true);
      try {
        const { data, error } = await supabase
          .from('candidate_applications')
          .select(`
            *,
            job_posting:job_postings(title, position, department),
            campaign:recruitment_campaigns(name)
          `)
          .eq('company_id', currentCompanyId)
          .eq('candidate_id', candidate.id)
          .order('applied_date', { ascending: false });

        if (error) throw error;
        setApplications((data as CandidateApplication[]) || []);
      } catch (error: any) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoadingApplications(false);
      }
    };

    if (activeTab === 'campaign') {
      fetchApplications();
    }
  }, [activeTab, currentCompanyId, candidate.id]);

  // Handle avatar update
  const handleAvatarChange = async (url: string | null) => {
    setAvatarUrl(url);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ avatar_url: url })
        .eq('id', candidate.id);

      if (error) throw error;
      
      toast({
        title: t('common.success'),
        description: r('avatarUpdateSuccess'),
      });
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      toast({
        title: t('common.error'),
        description: r('avatarUpdateError'),
        variant: 'destructive',
      });
    }
  };

  const renderStars = (rating: number | null | undefined) => {
    if (!rating) return <span className="text-muted-foreground text-sm">{r('notEvaluated')}</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const tabs = [
    { id: 'details', label: r('tabs.details'), icon: FileText, color: 'bg-blue-500' },
    { id: 'candidate', label: r('tabs.candidate'), icon: User, color: 'bg-green-500' },
    { id: 'resume', label: r('tabs.resume'), icon: Paperclip, color: 'bg-teal-500' },
    { id: 'interview', label: r('tabs.interview'), icon: Video, color: 'bg-orange-500' },
    { id: 'scoring', label: r('tabs.scoring'), icon: Star, color: 'bg-yellow-500' },
    { id: 'campaign', label: r('tabs.campaign'), icon: Megaphone, color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">{candidate.full_name}</h2>
            <p className="text-sm text-muted-foreground">{candidate.position || r('noPosition')}</p>
          </div>
        </div>
        {onEdit && (
          <Button variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            {r('editBtn')}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'shrink-0 gap-2',
                  activeTab === tab.id && 'bg-primary text-primary-foreground'
                )}
              >
                <div className={cn('w-5 h-5 rounded flex items-center justify-center text-white', tab.color)}>
                  <TabIcon className="w-3 h-3" />
                </div>
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Content - Details Tab */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recruitment Process Timeline */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{r('recruitmentProcess')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {recruitmentStages.map((stage, index) => (
                    <div key={stage.id} className="flex flex-col items-center flex-1">
                      <div className="flex items-center w-full">
                        {index > 0 && (
                          <div
                            className={cn(
                              'flex-1 h-0.5',
                              index <= currentStageIndex ? 'bg-green-500' : 'bg-muted'
                            )}
                          />
                        )}
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0',
                            index <= currentStageIndex
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'bg-background border-muted-foreground/30 text-muted-foreground'
                          )}
                        >
                          <Check className="w-4 h-4" />
                        </div>
                        {index < recruitmentStages.length - 1 && (
                          <div
                            className={cn(
                              'flex-1 h-0.5',
                              index < currentStageIndex ? 'bg-green-500' : 'bg-muted'
                            )}
                          />
                        )}
                      </div>
                      <span className="text-xs mt-2 text-center">{stage.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {r('personalInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <InfoItem icon={User} label={r('fullName')} value={candidate.full_name} />
                  <InfoItem icon={Globe} label={r('nationality')} value={candidate.nationality || r('defaultNationality')} />
                  <InfoItem icon={User} label={r('height')} value={candidate.height ? `${candidate.height} cm` : '-'} />
                  <InfoItem icon={User} label={r('weight')} value={candidate.weight ? `${candidate.weight} kg` : '-'} />
                  <InfoItem icon={User} label={r('ethnicity')} value={candidate.ethnicity || r('defaultEthnicity')} />
                  <InfoItem icon={Building2} label={r('religion')} value={candidate.religion || r('defaultReligion')} />
                  <InfoItem 
                    icon={Calendar} 
                    label={r('expectedStartDate')} 
                    value={candidate.expected_start_date 
                      ? format(new Date(candidate.expected_start_date), 'dd/MM/yyyy', { locale: vi }) 
                      : r('notDetermined')
                    } 
                  />
                  <InfoItem icon={Briefcase} label={r('militaryService')} value={candidate.military_service || r('defaultMilitary')} />
                  <InfoItem icon={User} label={r('maritalStatus')} value={candidate.marital_status || r('notDetermined')} />
                  <InfoItem icon={MapPin} label={r('hometown')} value={candidate.hometown || r('notDetermined')} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    <CandidateAvatarUpload
                      candidateId={candidate.id}
                      candidateName={candidate.full_name}
                      currentAvatarUrl={avatarUrl}
                      onAvatarChange={handleAvatarChange}
                      size="lg"
                      editable={true}
                    />
                  </div>
                  <h3 className="text-lg font-bold">{candidate.full_name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {candidate.position || r('noPosition')}
                  </p>
                  <Badge className={stageConfig[candidate.stage || 'applied']?.color}>
                    {stageConfig[candidate.stage || 'applied']?.label}
                  </Badge>
                  <div className="mt-3">
                    {renderStars(candidate.rating)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">{r('contactInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ContactItem icon={Phone} label={r('phone')} value={candidate.phone || r('noData')} />
                <ContactItem icon={Mail} label={r('email')} value={candidate.email} />
                <ContactItem icon={Briefcase} label={r('position')} value={candidate.position || r('notDetermined')} />
                <ContactItem 
                  icon={Calendar} 
                  label={r('appliedDate')} 
                  value={candidate.applied_date 
                    ? format(new Date(candidate.applied_date), 'dd/MM/yyyy', { locale: vi }) 
                    : r('notDetermined')
                  } 
                />
                <ContactItem icon={MapPin} label={r('source')} value={candidate.source || r('sourceOther')} />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button onClick={onEvaluate} className="w-full">
                {r('evaluateCandidate')}
              </Button>
              <Button variant="outline" className="w-full">
                {r('sendInvitation')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Profile Tab */}
      {activeTab === 'candidate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{r('basicInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem icon={User} label={r('fullName')} value={candidate.full_name} />
              <InfoItem icon={Mail} label={r('email')} value={candidate.email} />
              <InfoItem icon={Phone} label={r('phone')} value={candidate.phone || r('noData')} />
              <InfoItem icon={Briefcase} label={r('formPosition')} value={candidate.position || r('notDetermined')} />
              <InfoItem icon={MapPin} label={r('source')} value={candidate.source || r('sourceOther')} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{r('additionalInfo')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem icon={Globe} label={r('nationality')} value={candidate.nationality || r('defaultNationality')} />
              <InfoItem icon={MapPin} label={r('hometown')} value={candidate.hometown || r('notDetermined')} />
              <InfoItem icon={User} label={r('maritalStatus')} value={candidate.marital_status || r('notDetermined')} />
              <InfoItem icon={User} label={r('ethnicity')} value={candidate.ethnicity || r('defaultEthnicity')} />
              <InfoItem icon={Building2} label={r('religion')} value={candidate.religion || r('defaultReligion')} />
            </CardContent>
          </Card>

          {candidate.notes && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">{r('notes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{candidate.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Resume/CV Tab */}
      {activeTab === 'resume' && (
        <div className="max-w-3xl">
          <CandidateResumeFiles
            candidateId={candidate.id}
            companyId={candidate.company_id}
            candidateName={candidate.full_name}
          />
        </div>
      )}

      {/* Interview Tab */}
      {activeTab === 'interview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Video className="w-4 h-4" />
                {r('interviewHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingInterviews ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : interviews.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{r('noInterviews')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{r('date')}</TableHead>
                      <TableHead>{r('time')}</TableHead>
                      <TableHead>{r('type')}</TableHead>
                      <TableHead>{r('interviewer')}</TableHead>
                      <TableHead>{r('location')}</TableHead>
                      <TableHead>{r('status')}</TableHead>
                      <TableHead>{r('rating')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell>
                          {format(new Date(interview.interview_date), 'dd/MM/yyyy', { locale: vi })}
                        </TableCell>
                        <TableCell>{interview.interview_time}</TableCell>
                        <TableCell>{interview.interview_type || r('defaultInterviewType')}</TableCell>
                        <TableCell>{interview.interviewer_name || '-'}</TableCell>
                        <TableCell>{interview.location || '-'}</TableCell>
                        <TableCell>
                          <Badge className={interviewStatusConfig[interview.status || 'scheduled']?.color}>
                            {interviewStatusConfig[interview.status || 'scheduled']?.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{renderStars(interview.rating)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {interviews.length > 0 && interviews.some(i => i.feedback) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{r('interviewFeedback')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {interviews.filter(i => i.feedback).map((interview) => (
                  <div key={interview.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {format(new Date(interview.interview_date), 'dd/MM/yyyy', { locale: vi })} - {interview.interviewer_name}
                      </span>
                      {renderStars(interview.rating)}
                    </div>
                    <p className="text-sm text-muted-foreground">{interview.feedback}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Scoring Tab */}
      {activeTab === 'scoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{r('evaluationChart')}</CardTitle>
            </CardHeader>
            <CardContent>
              <CandidateEvaluationRadarChart data={radarChartData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{r('evaluationDetail')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {evaluationScores.map((item) => (
                  <div key={item.skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.skill}</span>
                      <span className="text-sm text-muted-foreground">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">{r('overallRating')}</span>
                  {renderStars(candidate.rating)}
                </div>
                <Button onClick={onEvaluate} className="w-full">
                  {r('openDetailedEval')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaign/Applications Tab */}
      {activeTab === 'campaign' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              {r('applications')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingApplications ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{r('noApplications')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{r('position')}</TableHead>
                    <TableHead>{r('campaignCol')}</TableHead>
                    <TableHead>{r('appliedDate')}</TableHead>
                    <TableHead>{r('status')}</TableHead>
                    <TableHead>{r('rating')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{app.job_posting?.title || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{app.job_posting?.department || ''}</p>
                        </div>
                      </TableCell>
                      <TableCell>{app.campaign?.name || '-'}</TableCell>
                      <TableCell>
                        {app.applied_date 
                          ? format(new Date(app.applied_date), 'dd/MM/yyyy', { locale: vi })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge className={stageConfig[app.stage || 'applied']?.color}>
                          {stageConfig[app.stage || 'applied']?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{renderStars(app.rating)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper components
function InfoItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function ContactItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm break-all">{value}</p>
      </div>
    </div>
  );
}
