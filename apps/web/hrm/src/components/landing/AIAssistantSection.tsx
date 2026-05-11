import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Bot, FileText, Filter, CalendarCheck, Award, BarChart3, MessageCircleQuestion } from 'lucide-react';
import aiRobotImg from '@/assets/ai-robot.png';

const featureIcons = [FileText, Filter, CalendarCheck, Award, BarChart3, MessageCircleQuestion];

export function AIAssistantSection() {
  const { t } = useTranslation();

  const features = Array.from({ length: 6 }, (_, i) => ({
    icon: featureIcons[i],
    title: t(`landing.aiAssistant.features.f${i + 1}.title`),
    description: t(`landing.aiAssistant.features.f${i + 1}.description`),
  }));

  const benefits = Array.from({ length: 4 }, (_, i) =>
    t(`landing.aiAssistant.benefits.b${i + 1}`)
  );

  return (
    <section id="ai-assistant" className="py-20 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">
            <Bot className="w-3 h-3 mr-1" />
            {t('landing.aiAssistant.badge')}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.aiAssistant.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('landing.aiAssistant.subtitle')}
          </p>
        </div>

        {/* Features Grid with Robot Center */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center mb-16">
          {/* Left features */}
          <div className="space-y-8">
            {features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-start gap-4 text-right lg:text-right">
                <div className="flex-1">
                  <div className="flex items-center gap-2 justify-start lg:justify-end mb-1">
                    <span className="text-xs font-bold text-primary bg-primary/10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed text-left lg:text-right">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Center Robot */}
          <div className="flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
              <img
                src={aiRobotImg}
                alt="UniAI HR Assistant"
                className="relative w-full h-full object-contain drop-shadow-lg"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right features */}
          <div className="space-y-8">
            {features.slice(3, 6).map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-primary bg-primary/10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
                      {String(index + 4).padStart(2, '0')}
                    </span>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="rounded-xl border bg-card p-5 text-center hover:shadow-md transition-shadow"
            >
              <p className="text-sm font-medium">{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
