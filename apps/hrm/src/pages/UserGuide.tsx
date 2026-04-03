import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Users,
  Clock,
  Wallet,
  UserPlus,
  Building2,
  BarChart3,
  Settings,
  Bot,
  FileSignature,
  Shield,
  ArrowLeft,
  ChevronRight,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useGuideContent } from '@/hooks/useGuideContent';
import { guideSections } from '@/data/guideSections';

export default function UserGuide() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { getContent } = useGuideContent();

  const filteredSections = useMemo(() => {
    if (!search.trim()) return guideSections;
    const q = search.toLowerCase();
    return guideSections.filter(
      (s) =>
        t(s.titleKey).toLowerCase().includes(q) ||
        t(s.descKey).toLowerCase().includes(q) ||
        s.steps.some(
          (step) =>
            t(step.titleKey).toLowerCase().includes(q) ||
            t(step.contentKey).toLowerCase().includes(q)
        )
    );
  }, [search, t]);

  const selectedSection = activeSection
    ? guideSections.find((s) => s.id === activeSection)
    : null;

  const getStepTitle = (sectionId: string, stepIndex: number, defaultKey: string) => {
    const custom = getContent(sectionId, stepIndex);
    return custom?.custom_title || t(defaultKey);
  };

  const renderStepContent = (sectionId: string, stepIndex: number, defaultKey: string) => {
    const custom = getContent(sectionId, stepIndex);
    if (custom?.custom_content) {
      return (
        <div
          className="prose prose-sm max-w-none text-muted-foreground [&_img]:rounded-lg [&_img]:max-w-full [&_img]:my-2 [&_a]:text-primary"
          dangerouslySetInnerHTML={{ __html: custom.custom_content }}
        />
      );
    }
    return <span className="whitespace-pre-line">{t(defaultKey)}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 md:px-6 h-14">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">{t('guide.title')}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <Badge variant="secondary" className="px-3 py-1 text-xs">
            {t('guide.badge')}
          </Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('guide.heading')}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('guide.subtitle')}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveSection(null);
            }}
            placeholder={t('guide.searchPlaceholder')}
            className="pl-10"
          />
        </div>

        {/* Quick Links */}
        {!activeSection && (
          <div className="flex flex-wrap gap-2 justify-center">
            {guideSections.map((s) => (
              <Badge
                key={s.id}
                variant="outline"
                className="cursor-pointer hover:bg-accent transition-colors px-3 py-1.5"
                onClick={() => setActiveSection(s.id)}
              >
                <s.icon className="h-3 w-3 mr-1.5" />
                {t(s.titleKey)}
              </Badge>
            ))}
          </div>
        )}

        {/* Detail View */}
        {selectedSection ? (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSection(null)}
              className="gap-1 text-muted-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('guide.backToAll')}
            </Button>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${selectedSection.color}`}>
                    <selectedSection.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{t(selectedSection.titleKey)}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {t(selectedSection.descKey)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {selectedSection.steps.map((step, idx) => (
                    <AccordionItem key={idx} value={`step-${idx}`}>
                      <AccordionTrigger className="text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          {getStepTitle(selectedSection.id, idx, step.titleKey)}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground pl-8">
                        {renderStepContent(selectedSection.id, idx, step.contentKey)}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSections.map((section) => (
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
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                        {t(section.titleKey)}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {t(section.descKey)}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>{t('guide.viewSteps', { count: section.steps.length })}</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredSections.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>{t('guide.noResults')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
