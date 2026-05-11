import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { X, Send, User, Loader2, RotateCcw, Sparkles, Calendar, DollarSign, Shield, Clock, HelpCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ChatMessageRenderer } from '@/components/ai/ChatMessageRenderer';
import aiRobotImg from '@/assets/ai-robot.png';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hrm-ai-chat`;

const CATEGORY_ICONS = [Clock, Calendar, DollarSign, Shield, FileText, HelpCircle];
const CATEGORY_KEYS = ['attendance', 'leave', 'salary', 'insurance', 'contract', 'other'];

export function HRMChatWidget() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const publicRoutes = ['/landing', '/login', '/register', '/forgot-password', '/reset-password', '/onboarding'];
  const isPublicRoute = publicRoutes.some(route => location.pathname.startsWith(route));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (isPublicRoute) return null;

  const categories = CATEGORY_KEYS.map((key, i) => ({
    icon: CATEGORY_ICONS[i],
    label: t(`hrmChat.categories.${key}.label`),
    questions: [
      t(`hrmChat.categories.${key}.q1`),
      t(`hrmChat.categories.${key}.q2`),
      ...(t(`hrmChat.categories.${key}.q3`, { defaultValue: '' }) ? [t(`hrmChat.categories.${key}.q3`)] : []),
    ].filter(Boolean),
  }));

  const defaultQuestions = [
    t('hrmChat.defaultQuestions.q1'),
    t('hrmChat.defaultQuestions.q2'),
    t('hrmChat.defaultQuestions.q3'),
  ];

  const streamChat = async (userMessages: Message[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error(t('hrmChat.errors.notLoggedIn'));

    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ messages: userMessages, language: i18n.language }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      if (resp.status === 429) throw new Error(errorData.error || t('hrmChat.errors.rateLimit'));
      if (resp.status === 402) throw new Error(errorData.error || t('hrmChat.errors.credits'));
      throw new Error(errorData.error || t('hrmChat.errors.connection'));
    }

    if (!resp.body) throw new Error('No response body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let assistantContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return prev.map((m, i) =>
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, { role: 'assistant', content: assistantContent }];
            });
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMessage: Message = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setActiveCategory(null);
    setIsLoading(true);

    try {
      await streamChat(newMessages);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: t('hrmChat.errors.errorTitle'),
        description: error instanceof Error ? error.message : t('hrmChat.errors.connection'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 transition-all duration-300",
          isOpen && "scale-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="relative w-14 h-14 md:w-16 md:h-16 hover:scale-110 transition-transform">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <img
            src={aiRobotImg}
            alt="UniAI"
            className="relative w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-primary shadow-lg bg-background"
          />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
        </div>
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed z-50 bg-background flex flex-col overflow-hidden transition-all duration-300",
          "inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:h-[600px] md:rounded-2xl md:border md:shadow-2xl md:origin-bottom-right",
          isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={aiRobotImg} alt="UniAI" className="w-10 h-10 rounded-lg bg-primary-foreground/20 object-cover" />
            <div>
              <h3 className="font-semibold text-primary-foreground flex items-center gap-1.5">
                {t('hrmChat.title')}
                <Sparkles className="w-3.5 h-3.5" />
              </h3>
              <p className="text-xs text-primary-foreground/70">
                {t('hrmChat.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setMessages([]); setInput(''); setActiveCategory(null); }}
              className="text-primary-foreground hover:bg-primary-foreground/20"
              title={t('hrmChat.newChat')}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center text-center">
              <img src={aiRobotImg} alt="UniAI" className="w-16 h-16 mb-3 opacity-90" />
              <p className="text-sm font-semibold mb-1">{t('hrmChat.greeting')} 👋</p>
              <p className="text-xs text-muted-foreground mb-4">
                {t('hrmChat.greetingDesc')}
              </p>

              {/* Category chips */}
              <div className="flex flex-wrap gap-1.5 justify-center mb-3">
                {categories.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => setActiveCategory(activeCategory === i ? null : i)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs border transition-all",
                        activeCategory === i
                          ? "bg-primary text-primary-foreground border-primary"
                          : "hover:bg-muted border-border"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Quick questions for selected category */}
              <div className="space-y-1.5 w-full">
                {(activeCategory !== null ? categories[activeCategory].questions : defaultQuestions).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg border hover:bg-muted transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-2",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === 'assistant' && (
                    <img src={aiRobotImg} alt="AI" className="w-7 h-7 rounded-md flex-shrink-0 mt-1" />
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                      message.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <ChatMessageRenderer content={message.content} compact />
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-7 h-7 flex-shrink-0">
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        <User className="w-3.5 h-3.5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-2 justify-start">
                  <img src={aiRobotImg} alt="AI" className="w-7 h-7 rounded-md flex-shrink-0 mt-1" />
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('hrmChat.inputPlaceholder')}
              disabled={isLoading}
              className="flex-1 text-sm"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
