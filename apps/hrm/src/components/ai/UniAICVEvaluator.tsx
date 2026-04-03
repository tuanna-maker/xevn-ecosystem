import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Upload, BarChart3, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function UniAICVEvaluator() {
  const { t } = useTranslation();

  const features = [
    { icon: Upload, label: 'Tải lên CV ứng viên', desc: 'Upload CV để AI phân tích và đánh giá' },
    { icon: BarChart3, label: 'Chấm điểm tự động', desc: 'AI chấm điểm dựa trên yêu cầu vị trí tuyển dụng' },
    { icon: Target, label: 'Gợi ý CV phù hợp', desc: 'So sánh và xếp hạng các CV theo mức độ phù hợp' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            {t('ai.evaluateCV.title', 'AI đánh giá, gợi ý CV phù hợp')}
            <Badge variant="secondary">Beta</Badge>
          </CardTitle>
          <CardDescription>
            {t('ai.evaluateCV.fullDesc', 'AI tự động đánh giá CV ứng viên dựa trên tiêu chí vị trí tuyển dụng, chấm điểm và xếp hạng mức độ phù hợp.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Upload area */}
          <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer mb-6">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">{t('ai.evaluateCV.dropzone', 'Kéo thả CV ứng viên vào đây')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('ai.evaluateCV.formats', 'Hỗ trợ: PDF, DOCX (tối đa 10MB)')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
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
