import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Calendar, Clock, Plane, ArrowRightLeft } from 'lucide-react';

export function UniAIRequestCreator() {
  const { t } = useTranslation();

  const requestTypes = [
    { icon: Calendar, label: 'Đơn nghỉ phép', desc: 'Tạo đơn xin nghỉ phép năm, nghỉ ốm, nghỉ thai sản' },
    { icon: Clock, label: 'Đơn làm thêm giờ', desc: 'Tạo đơn đăng ký làm thêm giờ / overtime' },
    { icon: Plane, label: 'Đề nghị công tác', desc: 'Tạo đề nghị đi công tác, chuyển địa điểm làm việc' },
    { icon: ArrowRightLeft, label: 'Đơn đổi ca', desc: 'Tạo đơn xin đổi ca làm việc' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            {t('ai.createRequest.title', 'AI tạo đơn từ tiện lợi')}
          </CardTitle>
          <CardDescription>
            {t('ai.createRequest.fullDesc', 'Chỉ cần mô tả yêu cầu bằng ngôn ngữ tự nhiên, AI sẽ tự động tạo đơn nghỉ phép, làm thêm giờ, đề nghị công tác cho bạn.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {requestTypes.map((req, i) => {
              const Icon = req.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border hover:border-primary/30 hover:bg-muted/50 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{req.label}</p>
                    <p className="text-xs text-muted-foreground">{req.desc}</p>
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
