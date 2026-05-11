import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
  Building2,
  Clock,
  FileText,
  Zap,
  HeartHandshake,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { PricingSection } from '@/components/landing/PricingSection';
import { AIAssistantSection } from '@/components/landing/AIAssistantSection';
import { SystemShowcaseSection } from '@/components/landing/SystemShowcaseSection';
import { LandingChatWidget } from '@/components/landing/LandingChatWidget';

export default function Landing() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Users,
      title: t('landing.features.employees.title'),
      description: t('landing.features.employees.description'),
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Calendar,
      title: t('landing.features.attendance.title'),
      description: t('landing.features.attendance.description'),
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      icon: DollarSign,
      title: t('landing.features.payroll.title'),
      description: t('landing.features.payroll.description'),
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
    {
      icon: FileText,
      title: t('landing.features.contracts.title'),
      description: t('landing.features.contracts.description'),
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      icon: BarChart3,
      title: t('landing.features.reports.title'),
      description: t('landing.features.reports.description'),
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
    },
    {
      icon: Shield,
      title: t('landing.features.security.title'),
      description: t('landing.features.security.description'),
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
  ];

  const benefits = [
    t('landing.benefits.item1'),
    t('landing.benefits.item2'),
    t('landing.benefits.item3'),
    t('landing.benefits.item4'),
    t('landing.benefits.item5'),
    t('landing.benefits.item6'),
  ];

  const stats = [
    { value: '10,000+', label: t('landing.stats.employees') },
    { value: '500+', label: t('landing.stats.companies') },
    { value: '99.9%', label: t('landing.stats.uptime') },
    { value: '24/7', label: t('landing.stats.support') },
  ];

  const testimonials = [
    {
      name: 'Nguyễn Văn Minh',
      role: 'HR Director',
      company: 'Tech Corp',
      content: t('landing.testimonials.item1'),
      avatar: 'NM',
    },
    {
      name: 'Trần Thị Hương',
      role: 'CEO',
      company: 'StartUp Hub',
      content: t('landing.testimonials.item2'),
      avatar: 'TH',
    },
    {
      name: 'Lê Hoàng Nam',
      role: 'Operations Manager',
      company: 'Global Trade',
      content: t('landing.testimonials.item3'),
      avatar: 'LN',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">UniHRM</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('landing.nav.features')}
            </a>
            <a href="#ai-assistant" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              UniAI
            </a>
            <a href="#benefits" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('landing.nav.benefits')}
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('landing.nav.pricing')}
            </a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('landing.nav.testimonials')}
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">
                {t('landing.nav.login')}
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gap-1">
                {t('landing.nav.getStarted')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">
            <Zap className="w-3 h-3 mr-1" />
            {t('landing.hero.badge')}
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
            {t('landing.hero.title')}
            <span className="text-primary"> {t('landing.hero.titleHighlight')}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('landing.hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/register">
              <Button size="lg" className="gap-2 px-8">
                {t('landing.hero.cta')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="gap-2 px-8">
                {t('landing.hero.demo')}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Showcase */}
      <SystemShowcaseSection />

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              {t('landing.features.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('landing.features.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <AIAssistantSection />

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                {t('landing.benefits.badge')}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('landing.benefits.title')}
              </h2>
              <p className="text-muted-foreground mb-8">
                {t('landing.benefits.subtitle')}
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              <Link to="/register" className="inline-block mt-8">
                <Button className="gap-2">
                  {t('landing.benefits.cta')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8">
                <div className="w-full h-full rounded-xl bg-card border shadow-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <HeartHandshake className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t('landing.benefits.cardTitle')}</h3>
                    <p className="text-sm text-muted-foreground">{t('landing.benefits.cardSubtitle')}</p>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              {t('landing.testimonials.badge')}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('landing.testimonials.title')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('landing.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role} • {testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('landing.cta.title')}
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              {t('landing.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="gap-2 px-8">
                  {t('landing.cta.button')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">UniHRM</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.privacy')}</a>
              <a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.terms')}</a>
              <a href="#" className="hover:text-foreground transition-colors">{t('landing.footer.contact')}</a>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2026 UBOS EcoSystem. {t('landing.footer.rights')}
            </p>
          </div>
        </div>
      </footer>

      {/* Landing AI Chatbot */}
      <LandingChatWidget />
    </div>
  );
}
