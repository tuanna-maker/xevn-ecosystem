import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { ChatMessageRenderer } from '@/components/ai/ChatMessageRenderer';
import aiRobotImg from '@/assets/ai-robot.png';

type Message = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hrm-ai-chat`;

const SUGGESTED_QUESTIONS = [
  'Tổng quan nhân sự công ty hiện tại?',
  'Quy định chấm công và ca làm việc?',
  'Chính sách bảo hiểm BHXH, BHYT, BHTN?',
  'Cấu trúc lương và các thành phần?',
  'Thống kê nghỉ phép 30 ngày qua?',
  'Chính sách thưởng hiện tại?',
  'Hợp đồng sắp hết hạn?',
  'Vị trí đang tuyển dụng?',
  'Quy trình xin nghỉ phép?',
  'Quy trình tạm ứng lương?',
];

export function UniAIChat() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Chưa đăng nhập');

    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || 'Lỗi kết nối');
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

      let idx: number;
      while ((idx = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, idx);
        textBuffer = textBuffer.slice(idx + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '' || !line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
              return [...prev, { role: 'assistant', content: assistantContent }];
            });
          }
        } catch { textBuffer = line + '\n' + textBuffer; break; }
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);
    try {
      await streamChat(newMsgs);
    } catch (error) {
      toast({ title: 'Lỗi', description: error instanceof Error ? error.message : 'Lỗi kết nối', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <img src={aiRobotImg} alt="UniAI" className="w-10 h-10 rounded-lg object-cover" />
          <div>
            <h3 className="font-semibold flex items-center gap-1.5">
              {t('ai.qa.title', 'AI hỏi đáp báo cáo & nội quy')}
              <Sparkles className="w-4 h-4 text-primary" />
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('ai.qa.subtitle', 'Hỏi đáp về biến động nhân sự, cơ cấu, quỹ lương, nội quy, thủ tục công ty')}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setMessages([]); setInput(''); }}>
          <RotateCcw className="w-4 h-4 mr-1" />
          {t('ai.newChat', 'Cuộc hội thoại mới')}
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <img src={aiRobotImg} alt="UniAI" className="w-20 h-20 mb-4 opacity-80" />
            <h3 className="font-semibold text-lg mb-2">{t('ai.qa.welcomeTitle', 'Xin chào! Tôi là UniAI 👋')}</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              {t('ai.qa.welcomeDesc', 'Hãy hỏi tôi bất kỳ điều gì về nhân sự, chấm công, lương thưởng, bảo hiểm hoặc quy trình nội bộ của công ty.')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-left text-xs px-3 py-2.5 rounded-lg border hover:bg-muted hover:border-primary/30 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                {msg.role === 'assistant' && (
                  <img src={aiRobotImg} alt="AI" className="w-8 h-8 rounded-lg flex-shrink-0 mt-1" />
                )}
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                  msg.role === 'user' ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"
                )}>
                  {msg.role === 'assistant' ? (
                    <ChatMessageRenderer content={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <img src={aiRobotImg} alt="AI" className="w-8 h-8 rounded-lg flex-shrink-0 mt-1" />
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
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
      <div className="p-4 border-t">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder={t('ai.qa.placeholder', 'Hỏi về nhân sự, lương, nghỉ phép, bảo hiểm...')}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
