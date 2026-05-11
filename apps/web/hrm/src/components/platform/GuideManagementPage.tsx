import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pencil, BookOpen, ChevronRight, Check, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { guideSections } from '@/data/guideSections';
import { useGuideContent } from '@/hooks/useGuideContent';
import { GuideStepEditor } from '@/components/guide/GuideStepEditor';

export function GuideManagementPage() {
  const { t } = useTranslation();
  const { getContent, upsertContent, deleteContent, isSaving, contents } = useGuideContent();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<{
    sectionId: string;
    stepIndex: number | null;
  } | null>(null);

  const selectedSection = activeSection
    ? guideSections.find((s) => s.id === activeSection)
    : null;

  const editingSection = editingStep
    ? guideSections.find((s) => s.id === editingStep.sectionId)
    : null;
  const editingStepData = editingStep && editingSection && editingStep.stepIndex !== null
    ? editingSection.steps[editingStep.stepIndex]
    : null;

  const customizedCount = contents.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {t('platformAdmin.guide', 'Quản lý Hướng dẫn sử dụng')}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t('platformAdmin.guideDesc', 'Chỉnh sửa nội dung hướng dẫn sử dụng cho tất cả người dùng HRM')}
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {customizedCount} {t('platformAdmin.guideCustomized', 'đã tùy chỉnh')}
        </Badge>
      </div>

      {/* Section detail */}
      {selectedSection ? (
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveSection(null)}
            className="gap-1 text-muted-foreground"
          >
            ← {t('guide.backToAll', 'Quay lại')}
          </Button>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${selectedSection.color}`}>
                  <selectedSection.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{t(selectedSection.titleKey)}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">{t(selectedSection.descKey)}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {selectedSection.steps.map((step, idx) => {
                  const custom = getContent(selectedSection.id, idx);
                  return (
                    <AccordionItem key={idx} value={`step-${idx}`}>
                      <AccordionTrigger className="text-sm font-medium group">
                        <span className="flex items-center gap-2 flex-1">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span className="flex-1 text-left">
                            {custom?.custom_title || t(step.titleKey)}
                          </span>
                          {custom && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0 gap-1">
                              <Check className="h-3 w-3" />
                              {t('guide.editor.customized', 'Đã tùy chỉnh')}
                            </Badge>
                          )}
                          {custom?.image_urls && custom.image_urls.length > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 gap-1">
                              <ImageIcon className="h-3 w-3" />
                              {custom.image_urls.length}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingStep({ sectionId: selectedSection.id, stepIndex: idx });
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 text-primary" />
                          </Button>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pl-8">
                        {custom?.custom_content ? (
                          <div
                            className="prose prose-sm max-w-none [&_img]:rounded-lg [&_img]:max-w-full [&_img]:my-2 [&_a]:text-primary"
                            dangerouslySetInnerHTML={{ __html: custom.custom_content }}
                          />
                        ) : (
                          <span className="whitespace-pre-line">{t(step.contentKey)}</span>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Grid of sections */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guideSections.map((section) => {
            const customSteps = section.steps.filter((_, idx) => getContent(section.id, idx));
            return (
              <Card
                key={section.id}
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30 group"
                onClick={() => setActiveSection(section.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${section.color} transition-transform group-hover:scale-110`}>
                      <section.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                        {t(section.titleKey)}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {t(section.descKey)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {section.steps.length} bước
                        </span>
                        {customSteps.length > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            {customSteps.length}/{section.steps.length} đã sửa
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil className="h-3 w-3" />
                        <span>Chỉnh sửa</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Editor Dialog */}
      {editingStep && editingSection && (
        <GuideStepEditor
          open={!!editingStep}
          onClose={() => setEditingStep(null)}
          sectionId={editingStep.sectionId}
          stepIndex={editingStep.stepIndex}
          defaultTitle={
            editingStepData
              ? t(editingStepData.titleKey)
              : t(editingSection.titleKey)
          }
          defaultContent={
            editingStepData
              ? t(editingStepData.contentKey)
              : t(editingSection.descKey)
          }
          existingData={getContent(editingStep.sectionId, editingStep.stepIndex) || undefined}
          onSave={upsertContent}
          onDelete={
            getContent(editingStep.sectionId, editingStep.stepIndex)
              ? () => deleteContent({ section_id: editingStep.sectionId, step_index: editingStep.stepIndex })
              : undefined
          }
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
