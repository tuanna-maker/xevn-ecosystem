import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, FileSignature, Award, ScrollText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function UniAIDocGenerator() {
  const { t } = useTranslation();

  const templates = [
    { icon: FileSignature, label: 'Hợp đồng lao động', desc: 'Tự tạo hợp đồng lao động chuẩn theo quy định' },
    { icon: ScrollText, label: 'Phụ lục hợp đồng', desc: 'Phụ lục điều chỉnh lương, vị trí, điều khoản' },
    { icon: Award, label: 'Quyết định bổ nhiệm', desc: 'Quyết định bổ nhiệm, miễn nhiệm, điều chuyển' },
    { icon: FileText, label: 'Biên bản kỷ luật', desc: 'Biên bản xử lý vi phạm kỷ luật lao động' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {t('ai.generateDoc.title', 'AI tự động tạo mẫu trọn văn bản')}
            <Badge variant="secondary">Beta</Badge>
          </CardTitle>
          <CardDescription>
            {t('ai.generateDoc.fullDesc', 'Tự tạo hợp đồng lao động, phụ lục hợp đồng, quyết định bổ nhiệm dựa trên thông tin nhân viên trong hệ thống.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {templates.map((tpl, i) => {
              const Icon = tpl.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border hover:border-primary/30 hover:bg-muted/50 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tpl.label}</p>
                    <p className="text-xs text-muted-foreground">{tpl.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p>🚧 {t('ai.comingSoon', 'Tính năng đang được phát triển và sẽ sớm ra mắt. Vui lòng quay lại sau!')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
