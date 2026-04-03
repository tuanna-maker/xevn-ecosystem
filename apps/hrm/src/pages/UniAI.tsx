import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquareText, FileSearch, FileText, ClipboardList, 
  UserCheck, Sparkles, ArrowRight, Bot, Lock
} from 'lucide-react';
import { PermissionGate } from '@/components/auth/PermissionGate';
import { usePermissions } from '@/hooks/usePermissions';
import { UniAIChat } from '@/components/ai/UniAIChat';
import { UniAIDocExtractor } from '@/components/ai/UniAIDocExtractor';
import { UniAIDocGenerator } from '@/components/ai/UniAIDocGenerator';
import { UniAIRequestCreator } from '@/components/ai/UniAIRequestCreator';
import { UniAICVEvaluator } from '@/components/ai/UniAICVEvaluator';
import aiRobotImg from '@/assets/ai-robot.png';

interface AIFeature {
  id: string;
  icon: React.ElementType;
  titleKey: string;
  descKey: string;
  permission: string;
  color: string;
  badge?: string;
}

const AI_FEATURES: AIFeature[] = [
  {
    id: 'qa',
    icon: MessageSquareText,
    titleKey: 'ai.qa.title',
    descKey: 'ai.qa.desc',
    permission: 'qa',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'extract',
    icon: FileSearch,
    titleKey: 'ai.extract.title',
    descKey: 'ai.extract.desc',
    permission: 'extract',
    color: 'from-violet-500 to-purple-500',
    badge: 'Beta',
  },
  {
    id: 'generate_doc',
    icon: FileText,
    titleKey: 'ai.generateDoc.title',
    descKey: 'ai.generateDoc.desc',
    permission: 'generate_doc',
    color: 'from-emerald-500 to-teal-500',
    badge: 'Beta',
  },
  {
    id: 'create_request',
    icon: ClipboardList,
    titleKey: 'ai.createRequest.title',
    descKey: 'ai.createRequest.desc',
    permission: 'create_request',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'evaluate_cv',
    icon: UserCheck,
    titleKey: 'ai.evaluateCV.title',
    descKey: 'ai.evaluateCV.desc',
    permission: 'evaluate_cv',
    color: 'from-rose-500 to-pink-500',
    badge: 'Beta',
  },
];

export default function UniAI() {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const accessibleFeatures = AI_FEATURES.filter(f => hasPermission('ai', f.permission));

  if (activeFeature) {
    const feature = AI_FEATURES.find(f => f.id === activeFeature);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActiveFeature(null)}>
            ← {t('common.back')}
          </Button>
          <div className="flex items-center gap-2">
            {feature && <feature.icon className="w-5 h-5 text-primary" />}
            <h2 className="text-lg font-semibold">{feature ? t(feature.titleKey) : ''}</h2>
          </div>
        </div>
        
        {activeFeature === 'qa' && <UniAIChat />}
        {activeFeature === 'extract' && <UniAIDocExtractor />}
        {activeFeature === 'generate_doc' && <UniAIDocGenerator />}
        {activeFeature === 'create_request' && <UniAIRequestCreator />}
        {activeFeature === 'evaluate_cv' && <UniAICVEvaluator />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={t('ai.pageTitle', 'UniAI - Trợ lý AI thông minh')}
        subtitle={t('ai.pageDesc', 'Tận dụng AI để tự động hóa và tối ưu hóa các nghiệp vụ nhân sự')}
      />

      {/* Hero Section */}
      <Card className="overflow-hidden border-primary/20">
        <div className="relative p-6 md:p-8 flex items-center gap-6 bg-gradient-to-r from-primary/5 via-primary/10 to-transparent">
          <img src={aiRobotImg} alt="UniAI" className="w-20 h-20 md:w-24 md:h-24 object-contain flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl md:text-2xl font-bold">UniAI Smart Assistant</h2>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
              {t('ai.heroDesc', 'UniAI tích hợp trí tuệ nhân tạo vào quy trình HR, giúp bạn tiết kiệm thời gian và nâng cao hiệu suất làm việc. Chọn một tính năng bên dưới để bắt đầu.')}
            </p>
          </div>
        </div>
      </Card>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AI_FEATURES.map((feature) => {
          const Icon = feature.icon;
          const hasAccess = hasPermission('ai', feature.permission);
          
          return (
            <Card 
              key={feature.id}
              className={`group relative overflow-hidden transition-all duration-200 ${
                hasAccess 
                  ? 'cursor-pointer hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5' 
                  : 'opacity-60'
              }`}
              onClick={() => hasAccess && setActiveFeature(feature.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-sm`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {feature.badge && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {feature.badge}
                      </Badge>
                    )}
                    {!hasAccess && (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-base mt-3">{t(feature.titleKey)}</CardTitle>
                <CardDescription className="text-xs">{t(feature.descKey)}</CardDescription>
              </CardHeader>
              {hasAccess && (
                <CardContent className="pt-0">
                  <div className="flex items-center text-xs text-primary font-medium group-hover:gap-2 transition-all">
                    {t('ai.startUsing', 'Bắt đầu sử dụng')}
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
