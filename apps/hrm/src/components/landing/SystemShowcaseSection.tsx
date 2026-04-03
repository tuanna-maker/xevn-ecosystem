import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Monitor, LayoutDashboard, Users, Brain, Briefcase } from 'lucide-react';
import { useState } from 'react';

import showcaseDashboard from '@/assets/showcase-dashboard.png';
import showcaseProfile from '@/assets/showcase-profile.png';
import showcaseWork from '@/assets/showcase-work.png';
import showcaseUniai from '@/assets/showcase-uniai.png';

const tabs = [
  { key: 'dashboard', icon: LayoutDashboard, image: showcaseDashboard },
  { key: 'profile', icon: Users, image: showcaseProfile },
  { key: 'work', icon: Briefcase, image: showcaseWork },
  { key: 'uniai', icon: Brain, image: showcaseUniai },
] as const;

export function SystemShowcaseSection() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="showcase" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Monitor className="w-3 h-3 mr-1" />
            {t('landing.showcase.badge')}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.showcase.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('landing.showcase.subtitle')}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab, index) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(index)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === index
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card border border-border hover:bg-accent text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {t(`landing.showcase.tabs.${tab.key}`)}
            </button>
          ))}
        </div>

        {/* Screenshot Display */}
        <div className="relative max-w-5xl mx-auto">
          <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-muted-foreground font-mono">unihrm.app</span>
              </div>
            </div>
            <img
              src={tabs[activeTab].image}
              alt={t(`landing.showcase.tabs.${tabs[activeTab].key}`)}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>

          {/* Caption */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            {t(`landing.showcase.captions.${tabs[activeTab].key}`)}
          </p>
        </div>
      </div>
    </section>
  );
}
