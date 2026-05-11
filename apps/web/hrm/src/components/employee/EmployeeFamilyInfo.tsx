import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Phone, Plus, Pencil, Trash2, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EmployeeFamilyInfoProps {
  employeeId: string;
}

interface FamilyMember {
  id: string;
  employee_id: string;
  company_id: string;
  relationship: string;
  full_name: string;
  birth_year: string | null;
  occupation: string | null;
  phone: string | null;
  address: string | null;
  is_dependant: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface EmergencyContact {
  id: string;
  employee_id: string;
  company_id: string;
  name: string;
  relationship: string;
  phone: string;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface FamilyFormData {
  relationship: string;
  full_name: string;
  birth_year: string;
  occupation: string;
  phone: string;
  address: string;
  is_dependant: boolean;
}

interface EmergencyFormData {
  name: string;
  relationship: string;
  phone: string;
  is_primary: boolean;
}

const RELATIONSHIP_KEYS = [
  'father', 'mother', 'wife', 'husband', 'son', 'daughter', 
  'brother', 'sisterOlder', 'brotherYounger', 'sisterYounger', 'grandfather', 'grandmother', 'other'
] as const;

const initialFamilyForm: FamilyFormData = {
  relationship: '',
  full_name: '',
  birth_year: '',
  occupation: '',
  phone: '',
  address: '',
  is_dependant: false,
};

const initialEmergencyForm: EmergencyFormData = {
  name: '',
  relationship: '',
  phone: '',
  is_primary: false,
};

export function EmployeeFamilyInfo({ employeeId }: EmployeeFamilyInfoProps) {
  const { t } = useTranslation();
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();
  
  const relationshipOptions = RELATIONSHIP_KEYS.map(key => ({
    value: t(`family.relationships.${key}`),
    label: t(`family.relationships.${key}`),
  }));

  // Family member state
  const [isFamilyDialogOpen, setIsFamilyDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [familyFormData, setFamilyFormData] = useState<FamilyFormData>(initialFamilyForm);
  const [isFamilySubmitting, setIsFamilySubmitting] = useState(false);

  // Emergency contact state
  const [isEmergencyDialogOpen, setIsEmergencyDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [emergencyFormData, setEmergencyFormData] = useState<EmergencyFormData>(initialEmergencyForm);
  const [isEmergencySubmitting, setIsEmergencySubmitting] = useState(false);

  // Fetch family members
  const { data: familyMembers, isLoading: isLoadingFamily } = useQuery({
    queryKey: ['employee-family-members', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_family_members')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as FamilyMember[];
    },
    enabled: !!employeeId && !!currentCompanyId,
  });

  // Fetch emergency contacts
  const { data: emergencyContacts, isLoading: isLoadingEmergency } = useQuery({
    queryKey: ['employee-emergency-contacts', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_emergency_contacts')
        .select('*')
        .eq('employee_id', employeeId)
        .order('is_primary', { ascending: false });
      
      if (error) throw error;
      return data as EmergencyContact[];
    },
    enabled: !!employeeId && !!currentCompanyId,
  });

  // Family member handlers
  const handleOpenFamilyDialog = (member?: FamilyMember) => {
    if (member) {
      setEditingMember(member);
      setFamilyFormData({
        relationship: member.relationship,
        full_name: member.full_name,
        birth_year: member.birth_year || '',
        occupation: member.occupation || '',
        phone: member.phone || '',
        address: member.address || '',
        is_dependant: member.is_dependant,
      });
    } else {
      setEditingMember(null);
      setFamilyFormData(initialFamilyForm);
    }
    setIsFamilyDialogOpen(true);
  };

  const handleCloseFamilyDialog = () => {
    setIsFamilyDialogOpen(false);
    setEditingMember(null);
    setFamilyFormData(initialFamilyForm);
  };

  const handleSaveFamilyMember = async () => {
    if (!familyFormData.relationship || !familyFormData.full_name) {
      toast.error(t('commonEmployee.validation.required'));
      return;
    }

    if (!currentCompanyId) {
      toast.error(t('commonEmployee.validation.noCompany'));
      return;
    }

    setIsFamilySubmitting(true);

    try {
      const memberData = {
        employee_id: employeeId,
        company_id: currentCompanyId,
        relationship: familyFormData.relationship,
        full_name: familyFormData.full_name.trim(),
        birth_year: familyFormData.birth_year || null,
        occupation: familyFormData.occupation.trim() || null,
        phone: familyFormData.phone.trim() || null,
        address: familyFormData.address.trim() || null,
        is_dependant: familyFormData.is_dependant,
      };

      if (editingMember) {
        const { error } = await supabase
          .from('employee_family_members')
          .update(memberData)
          .eq('id', editingMember.id);

        if (error) throw error;
        toast.success(t('family.toast.updated'));
      } else {
        const { error } = await supabase
          .from('employee_family_members')
          .insert(memberData);

        if (error) throw error;
        toast.success(t('family.toast.added'));
      }

      queryClient.invalidateQueries({ queryKey: ['employee-family-members', employeeId] });
      handleCloseFamilyDialog();
    } catch (error: any) {
      console.error('Error saving family member:', error);
      toast.error(error.message || t('commonEmployee.error'));
    } finally {
      setIsFamilySubmitting(false);
    }
  };

  const handleDeleteFamilyMember = async (member: FamilyMember) => {
    if (!confirm(t('family.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('employee_family_members')
        .delete()
        .eq('id', member.id);

      if (error) throw error;
      toast.success(t('family.toast.deleted'));
      queryClient.invalidateQueries({ queryKey: ['employee-family-members', employeeId] });
    } catch (error: any) {
      toast.error(error.message || t('commonEmployee.error'));
    }
  };

  // Emergency contact handlers
  const handleOpenEmergencyDialog = (contact?: EmergencyContact) => {
    if (contact) {
      setEditingContact(contact);
      setEmergencyFormData({
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
        is_primary: contact.is_primary,
      });
    } else {
      setEditingContact(null);
      setEmergencyFormData(initialEmergencyForm);
    }
    setIsEmergencyDialogOpen(true);
  };

  const handleCloseEmergencyDialog = () => {
    setIsEmergencyDialogOpen(false);
    setEditingContact(null);
    setEmergencyFormData(initialEmergencyForm);
  };

  const handleSaveEmergencyContact = async () => {
    if (!emergencyFormData.name || !emergencyFormData.phone || !emergencyFormData.relationship) {
      toast.error(t('commonEmployee.validation.required'));
      return;
    }

    if (!currentCompanyId) {
      toast.error(t('commonEmployee.validation.noCompany'));
      return;
    }

    setIsEmergencySubmitting(true);

    try {
      if (emergencyFormData.is_primary) {
        await supabase
          .from('employee_emergency_contacts')
          .update({ is_primary: false })
          .eq('employee_id', employeeId);
      }

      const contactData = {
        employee_id: employeeId,
        company_id: currentCompanyId,
        name: emergencyFormData.name.trim(),
        relationship: emergencyFormData.relationship,
        phone: emergencyFormData.phone.trim(),
        is_primary: emergencyFormData.is_primary,
      };

      if (editingContact) {
        const { error } = await supabase
          .from('employee_emergency_contacts')
          .update(contactData)
          .eq('id', editingContact.id);

        if (error) throw error;
        toast.success(t('emergency.toast.updated'));
      } else {
        const { error } = await supabase
          .from('employee_emergency_contacts')
          .insert(contactData);

        if (error) throw error;
        toast.success(t('emergency.toast.added'));
      }

      queryClient.invalidateQueries({ queryKey: ['employee-emergency-contacts', employeeId] });
      handleCloseEmergencyDialog();
    } catch (error: any) {
      console.error('Error saving emergency contact:', error);
      toast.error(error.message || t('commonEmployee.error'));
    } finally {
      setIsEmergencySubmitting(false);
    }
  };

  const handleDeleteEmergencyContact = async (contact: EmergencyContact) => {
    if (!confirm(t('emergency.confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('employee_emergency_contacts')
        .delete()
        .eq('id', contact.id);

      if (error) throw error;
      toast.success(t('emergency.toast.deleted'));
      queryClient.invalidateQueries({ queryKey: ['employee-emergency-contacts', employeeId] });
    } catch (error: any) {
      toast.error(error.message || t('commonEmployee.error'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Family Members Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('family.title')}
          </CardTitle>
          <Button size="sm" onClick={() => handleOpenFamilyDialog()}>
            <Plus className="w-4 h-4 mr-1" />
            {t('family.add')}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingFamily ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !familyMembers?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('family.empty')}</p>
              <p className="text-sm">{t('family.emptyHint')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('family.relationship')}</TableHead>
                    <TableHead>{t('family.fullName')}</TableHead>
                    <TableHead>{t('family.birthYear')}</TableHead>
                    <TableHead>{t('family.occupation')}</TableHead>
                    <TableHead>{t('family.phone')}</TableHead>
                    <TableHead>{t('family.address')}</TableHead>
                    <TableHead>{t('family.isDependant')}</TableHead>
                    <TableHead className="w-[100px]">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {familyMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.relationship}</TableCell>
                      <TableCell>{member.full_name}</TableCell>
                      <TableCell>{member.birth_year || '-'}</TableCell>
                      <TableCell>{member.occupation || '-'}</TableCell>
                      <TableCell>{member.phone || '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{member.address || '-'}</TableCell>
                      <TableCell>
                        {member.is_dependant ? (
                          <Badge variant="default" className="text-xs">{t('family.yes')}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">{t('family.no')}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleOpenFamilyDialog(member)}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteFamilyMember(member)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {t('emergency.title')}
          </CardTitle>
          <Button size="sm" onClick={() => handleOpenEmergencyDialog()}>
            <Plus className="w-4 h-4 mr-1" />
            {t('emergency.add')}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingEmergency ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !emergencyContacts?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('emergency.empty')}</p>
              <p className="text-sm">{t('emergency.emptyHint')}</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border rounded-lg p-4 hover:border-primary/50 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{contact.name}</h4>
                      {contact.is_primary && (
                        <Badge variant="default" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          {t('emergency.primary')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{contact.relationship}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{contact.phone}</span>
                  </div>
                  <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleOpenEmergencyDialog(contact)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      {t('common.edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => handleDeleteEmergencyContact(contact)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Family Member Dialog */}
      <Dialog open={isFamilyDialogOpen} onOpenChange={(open) => !open && handleCloseFamilyDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? t('family.edit') : t('family.addNew')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('family.relationship')} *</Label>
                <Select
                  value={familyFormData.relationship}
                  onValueChange={(value) => setFamilyFormData(prev => ({ ...prev, relationship: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('family.relationship')} />
                  </SelectTrigger>
                  <SelectContent>
                    {relationshipOptions.map(rel => (
                      <SelectItem key={rel.value} value={rel.value}>{rel.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('family.fullName')} *</Label>
                <Input
                  value={familyFormData.full_name}
                  onChange={(e) => setFamilyFormData(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('family.birthYear')}</Label>
                <Input
                  value={familyFormData.birth_year}
                  onChange={(e) => setFamilyFormData(prev => ({ ...prev, birth_year: e.target.value }))}
                  placeholder="1990"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('family.occupation')}</Label>
                <Input
                  value={familyFormData.occupation}
                  onChange={(e) => setFamilyFormData(prev => ({ ...prev, occupation: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t('family.phone')}</Label>
              <Input
                value={familyFormData.phone}
                onChange={(e) => setFamilyFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('family.address')}</Label>
              <Input
                value={familyFormData.address}
                onChange={(e) => setFamilyFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDependant"
                checked={familyFormData.is_dependant}
                onCheckedChange={(checked) => setFamilyFormData(prev => ({ ...prev, is_dependant: !!checked }))}
              />
              <Label htmlFor="isDependant" className="font-normal">
                {t('family.isDependant')}
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseFamilyDialog} disabled={isFamilySubmitting}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveFamilyMember} disabled={isFamilySubmitting}>
              {isFamilySubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingMember ? t('common.edit') : t('common.add')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Emergency Contact Dialog */}
      <Dialog open={isEmergencyDialogOpen} onOpenChange={(open) => !open && handleCloseEmergencyDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? t('emergency.edit') : t('emergency.addNew')}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t('emergency.name')} *</Label>
              <Input
                value={emergencyFormData.name}
                onChange={(e) => setEmergencyFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>{t('emergency.relationship')} *</Label>
              <Select
                value={emergencyFormData.relationship}
                onValueChange={(value) => setEmergencyFormData(prev => ({ ...prev, relationship: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('emergency.relationship')} />
                </SelectTrigger>
                <SelectContent>
                  {relationshipOptions.map(rel => (
                    <SelectItem key={rel.value} value={rel.value}>{rel.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>{t('emergency.phone')} *</Label>
              <Input
                value={emergencyFormData.phone}
                onChange={(e) => setEmergencyFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPrimary"
                checked={emergencyFormData.is_primary}
                onCheckedChange={(checked) => setEmergencyFormData(prev => ({ ...prev, is_primary: !!checked }))}
              />
              <Label htmlFor="isPrimary" className="font-normal">
                {t('emergency.isPrimary')}
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCloseEmergencyDialog} disabled={isEmergencySubmitting}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveEmergencyContact} disabled={isEmergencySubmitting}>
              {isEmergencySubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingContact ? t('common.edit') : t('common.add')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
