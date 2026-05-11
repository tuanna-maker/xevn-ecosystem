import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Plus,
  Megaphone,
  ChevronRight,
  ArrowLeft,
  Link2,
  FileText,
  BarChart3,
  MessageSquare,
  RefreshCw,
  Edit,
  Trash2,
  Loader2,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CampaignFormDialog } from './CampaignFormDialog';
import { CampaignCandidatesTab } from './CampaignCandidatesTab';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Campaign {
  id: string;
  company_id: string;
  name: string;
  description?: string | null;
  status: string;
  start_date: string;
  end_date?: string | null;
  owner_name?: string | null;
  follower_name?: string | null;
  position?: string | null;
  title?: string | null;
  department?: string | null;
  work_type?: string | null;
  location?: string | null;
  evaluation_criteria?: string | null;
  salary_level?: string | null;
  quantity?: number | null;
  requirements?: string | null;
  degree?: string | null;
  major?: string | null;
  created_at: string;
  updated_at: string;
}


const getStatusConfig = (t: any): Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> => ({
  active: { label: t('recruitment.cam.statuses.active'), variant: 'default' },
  completed: { label: t('recruitment.cam.statuses.completed'), variant: 'secondary' },
  paused: { label: t('recruitment.cam.statuses.paused'), variant: 'outline' },
  cancelled: { label: t('recruitment.cam.statuses.cancelled'), variant: 'destructive' },
});

const getWorkTypeLabels = (t: any): Record<string, string> => ({
  onsite: t('recruitment.cam.workTypes.onsite'),
  remote: t('recruitment.cam.workTypes.remote'),
  hybrid: t('recruitment.cam.workTypes.hybrid'),
});

export function CampaignsTab() {
  const { t } = useTranslation();
  const statusConfig = getStatusConfig(t);
  const workTypeLabels = getWorkTypeLabels(t);
  const { toast } = useToast();
  const { currentCompanyId } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCampaigns = async () => {
    if (!currentCompanyId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recruitment_campaigns')
        .select('*')
        .eq('company_id', currentCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: t('common.error'),
        description: t('recruitment.cam.errorLoad'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [currentCompanyId]);

  const handleDelete = async () => {
    if (!deletingCampaign) return;
    try {
      const { error } = await supabase
        .from('recruitment_campaigns')
        .delete()
        .eq('id', deletingCampaign.id);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('recruitment.cam.deleteSuccess'),
      });
      
      fetchCampaigns();
      if (selectedCampaign?.id === deletingCampaign.id) {
        setSelectedCampaign(null);
      }
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast({
        title: t('common.error'),
        description: t('recruitment.cam.deleteError'),
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingCampaign(null);
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsFormDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingCampaign(null);
    setIsFormDialogOpen(true);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'active').length,
    completed: campaigns.filter((c) => c.status === 'completed').length,
    totalPositions: campaigns.reduce((sum, c) => sum + (c.quantity || 0), 0),
  };

  if (selectedCampaign) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(null)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('recruitment.cam.back')}
            </Button>
            <h2 className="text-xl font-bold">{selectedCampaign.name}</h2>
            <Badge variant={statusConfig[selectedCampaign.status]?.variant || 'secondary'}>
              {statusConfig[selectedCampaign.status]?.label || selectedCampaign.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleEdit(selectedCampaign)}>
              <Edit className="w-4 h-4 mr-2" />
              {t('recruitment.cam.edit')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => {
                setDeletingCampaign(selectedCampaign);
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('recruitment.cam.delete')}
            </Button>
          </div>
        </div>

        {/* Sub Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="info">{t('recruitment.cam.tabInfo')}</TabsTrigger>
              <TabsTrigger value="candidates">{t('recruitment.cam.tabCandidates')}</TabsTrigger>
              <TabsTrigger value="interviews">{t('recruitment.cam.tabInterviews')}</TabsTrigger>
              <TabsTrigger value="reports">{t('recruitment.cam.tabReports')}</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                {t('recruitment.cam.createNew')}
              </Button>
              <Button variant="outline" size="sm">
                <Link2 className="w-4 h-4 mr-2" />
                {t('recruitment.cam.link')}
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                {t('recruitment.cam.exportReport')}
              </Button>
            </div>
          </div>

          <TabsContent value="info" className="mt-4">
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Campaign Info */}
              <div className="col-span-2 space-y-6">
                {/* Campaign Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t('recruitment.cam.campaignInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.campaignName')}</p>
                        <p className="font-medium">{selectedCampaign.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.status')}</p>
                        <Badge variant={statusConfig[selectedCampaign.status]?.variant || 'secondary'}>
                          {statusConfig[selectedCampaign.status]?.label || selectedCampaign.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.owner')}</p>
                        {selectedCampaign.owner_name ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {selectedCampaign.owner_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{selectedCampaign.owner_name}</span>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">{t('recruitment.cam.notAssigned')}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.follower')}</p>
                        {selectedCampaign.follower_name ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-orange-100 text-orange-600">
                                {selectedCampaign.follower_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{selectedCampaign.follower_name}</span>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">{t('recruitment.cam.notAssigned')}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.startDate')}</p>
                        <p className="font-medium">
                          {format(new Date(selectedCampaign.start_date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.endDate')}</p>
                        <p className="font-medium">
                          {selectedCampaign.end_date
                            ? format(new Date(selectedCampaign.end_date), 'dd/MM/yyyy')
                            : t('recruitment.cam.noLimit')}
                        </p>
                      </div>
                    </div>

                    {selectedCampaign.description && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.campaignDesc')}</p>
                        <p className="text-sm mt-1">{selectedCampaign.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recruitment Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t('recruitment.cam.positionInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.position')}</p>
                        <p className="font-medium">{selectedCampaign.position || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.jobTitle')}</p>
                        <p className="font-medium">{selectedCampaign.title || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.department')}</p>
                        <p className="font-medium">{selectedCampaign.department || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.workType')}</p>
                        <p className="font-medium">
                          {selectedCampaign.work_type
                            ? workTypeLabels[selectedCampaign.work_type] || selectedCampaign.work_type
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.location')}</p>
                        <p className="font-medium">{selectedCampaign.location || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.salary')}</p>
                        <p className="font-medium">{selectedCampaign.salary_level || t('recruitment.cam.negotiable')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.quantity')}</p>
                        <p className="font-medium">{selectedCampaign.quantity || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.evalCriteria')}</p>
                        <p className="font-medium">{selectedCampaign.evaluation_criteria || '-'}</p>
                      </div>
                    </div>

                    {selectedCampaign.requirements && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.requirements')}</p>
                        <p className="text-sm mt-1">{selectedCampaign.requirements}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.degree')}</p>
                        <p className="font-medium">{selectedCampaign.degree || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.major')}</p>
                        <p className="font-medium">{selectedCampaign.major || '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('recruitment.cam.campaignStats')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.needToHire')}</p>
                        <p className="text-4xl font-bold text-primary">{selectedCampaign.quantity || 0}</p>
                        <p className="text-sm text-muted-foreground">{t('recruitment.cam.positionUnit')}</p>
                      </div>
                      <div className="text-center text-sm text-muted-foreground">
                        {t('recruitment.cam.linkNote')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="candidates" className="mt-4">
            <CampaignCandidatesTab 
              campaignId={selectedCampaign.id} 
              companyId={currentCompanyId || ''} 
            />
          </TabsContent>

          <TabsContent value="interviews" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center">
                  {t('recruitment.cam.interviewsPlaceholder')}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-center">
                  {t('recruitment.cam.reportsPlaceholder')}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('recruitment.cam.title')}</h2>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {t('recruitment.cam.createCampaign')}
          </Button>
          <Button onClick={fetchCampaigns} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('recruitment.cam.refresh')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">{t('recruitment.cam.totalCampaigns')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">{t('recruitment.cam.running')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">{t('recruitment.cam.completed')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPositions}</p>
                <p className="text-xs text-muted-foreground">{t('recruitment.cam.totalPositions')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('recruitment.cam.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('recruitment.cam.statusPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('recruitment.cam.all')}</SelectItem>
            <SelectItem value="active">{t('recruitment.cam.statuses.active')}</SelectItem>
            <SelectItem value="completed">{t('recruitment.cam.statuses.completed')}</SelectItem>
            <SelectItem value="paused">{t('recruitment.cam.statuses.paused')}</SelectItem>
            <SelectItem value="cancelled">{t('recruitment.cam.statuses.cancelled')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Megaphone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {campaigns.length === 0
                ? t('recruitment.cam.noCampaigns')
                : t('recruitment.cam.noFilterResult')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCampaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCampaign(campaign)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Megaphone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(campaign.start_date), 'dd/MM/yyyy')}
                        {campaign.end_date && ` - ${format(new Date(campaign.end_date), 'dd/MM/yyyy')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{campaign.quantity || 0}</p>
                      <p className="text-xs text-muted-foreground">{t('recruitment.cam.positions')}</p>
                    </div>
                    <Badge variant={statusConfig[campaign.status]?.variant || 'secondary'}>
                      {statusConfig[campaign.status]?.label || campaign.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(campaign);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingCampaign(campaign);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <CampaignFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        campaign={editingCampaign}
        companyId={currentCompanyId}
        onSuccess={fetchCampaigns}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('recruitment.cam.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('recruitment.cam.confirmDeleteMsg', { name: deletingCampaign?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('recruitment.cam.cancelBtn')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('recruitment.cam.deleteBtn')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
