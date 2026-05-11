import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSearch, Upload, FileText, Image, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function UniAIDocExtractor() {
  const { t } = useTranslation();

  const docTypes = [
    { icon: FileText, label: 'CV / Hồ sơ ứng viên', desc: 'Trích xuất thông tin cá nhân, kinh nghiệm, kỹ năng từ CV' },
    { icon: CreditCard, label: 'CCCD / CMND', desc: 'Trích xuất họ tên, ngày sinh, số CCCD, địa chỉ' },
    { icon: Image, label: 'Bằng cấp / Chứng chỉ', desc: 'Trích xuất tên trường, ngành học, loại bằng, năm tốt nghiệp' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-primary" />
            {t('ai.extract.title', 'AI trích xuất thông tin giấy tờ')}
            <Badge variant="secondary">Beta</Badge>
          </CardTitle>
          <CardDescription>
            {t('ai.extract.fullDesc', 'AI tự động trích xuất thông tin nhân viên từ giấy tờ (CV, CCCD, CMND, bằng cấp,...) để tự động điền vào hệ thống.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Upload area */}
          <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer mb-6">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">{t('ai.extract.dropzone', 'Kéo thả hoặc nhấn để tải lên giấy tờ')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('ai.extract.formats', 'Hỗ trợ: PDF, JPG, PNG (tối đa 10MB)')}
            </p>
          </div>

          {/* Supported doc types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {docTypes.map((doc, i) => {
              const Icon = doc.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{doc.label}</p>
                    <p className="text-xs text-muted-foreground">{doc.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p>🚧 {t('ai.comingSoon', 'Tính năng đang được phát triển và sẽ sớm ra mắt. Vui lòng quay lại sau!')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
