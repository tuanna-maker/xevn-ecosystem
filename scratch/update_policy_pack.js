const fs = require('fs');

const path = 'd:\\xevn-ecosystem\\apps\\web\\hrm\\src\\components\\payroll\\policy-pack\\PolicyPackSetupScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add new imports
const importTable = `import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Settings, Pencil, FileText } from 'lucide-react';
`;
content = content.replace(`import { Label } from '@/components/ui/label';\nimport { cn } from '@/lib/utils';`, `import { Label } from '@/components/ui/label';\nimport { cn } from '@/lib/utils';\n${importTable}`);

// Add state
const stateLine = `const [search, setSearch] = useState('');`;
const newState = `${stateLine}\n  const [isSheetOpen, setIsSheetOpen] = useState(false);`;
content = content.replace(stateLine, newState);

// Update startCreate
content = content.replace(`  const startCreate = () => {`, `  const startCreate = () => {\n    setIsSheetOpen(true);`);
content = content.replace(`  const startEdit = (item: PolicyPack) => {`, `  const startEdit = (item: PolicyPack) => {\n    setIsSheetOpen(true);`);

// Update success handlers
content = content.replace(`      startCreate();\n    } catch (err) {`, `      startCreate();\n      setIsSheetOpen(false);\n    } catch (err) {`);
content = content.replace(`      await archive.mutateAsync(editingId);\n      startCreate();\n    } catch (err) {`, `      await archive.mutateAsync(editingId);\n      startCreate();\n      setIsSheetOpen(false);\n    } catch (err) {`);

// Replace the return JSX
const returnIndex = content.indexOf('  return (');
const endOfFile = content.length;

const newJSX = `  return (
    <div data-testid="pay-policy-pack-list" className="space-y-4">
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        data-testid="pay-policy-pack-scope-chung"
      >
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Chương trình chung
          </span>
          <span className="text-sm text-muted-foreground">{filtered.length} gói chính sách</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            className="h-10 w-64"
            placeholder="Tìm theo mã hoặc tên chính sách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Tìm kiếm trong danh sách gói"
          />
          <Button type="button" onClick={startCreate} data-testid="pay-policy-pack-add">
            + Thêm chính sách
          </Button>
        </div>
      </div>

      {bannerError && (
        <div
          role="alert"
          className="rounded-card border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800"
          data-testid="pay-policy-pack-scope-banner"
        >
          {bannerError}
        </div>
      )}

      {/* Danh sách gói chính sách dạng bảng */}
      <div className="rounded-card border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[150px]">Mã chính sách</TableHead>
              <TableHead>Tên chính sách</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Hiệu lực từ</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Đang tải danh sách...
                </TableCell>
              </TableRow>
            )}
            {list.isError && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-red-500">
                  Không tải được danh sách.
                </TableCell>
              </TableRow>
            )}
            {!list.isLoading && !list.isError && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Chưa có gói chính sách nào. Bấm "+ Thêm chính sách" để tạo mới.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((item) => (
              <TableRow key={item.id} className="cursor-pointer hover:bg-muted/30" onClick={() => startEdit(item)}>
                <TableCell className="font-medium text-primary">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    {item.code}
                  </div>
                </TableCell>
                <TableCell>{item.nameVi}</TableCell>
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                    item.status === 'active' ? "bg-green-100 text-green-700" :
                    item.status === 'draft' ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-700"
                  )}>
                    {statusLabelVi(item.status)}
                  </span>
                </TableCell>
                <TableCell>{formatHrmDateVi(item.effectiveFrom)}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="h-8 flex items-center gap-1 text-primary hover:text-primary/80 hover:bg-primary/10" onClick={(e) => { e.stopPropagation(); startEdit(item); }}>
                    <Pencil className="w-3.5 h-3.5" />
                    Chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Form chi tiết (hiển thị dạng Sheet khi bấm vào row hoặc thêm mới) */}
      <Sheet open={isSheetOpen} onOpenChange={(open) => {
        setIsSheetOpen(open);
        if (!open) setEditingId(null);
      }}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl">{isEditing ? 'Chi tiết / Cập nhật chính sách' : 'Tạo mới gói chính sách'}</SheetTitle>
            <SheetDescription>
              Cấu hình các hạn mức, tham số và quy định liên quan cho gói chính sách này.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin chung */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">1. Thông tin chung</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="code">Mã chính sách</Label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={(e) => update('code', e.target.value)}
                    placeholder="VD: POL_CHUNG_2A"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nameVi">Tên chính sách (VI)</Label>
                  <Input
                    id="nameVi"
                    value={form.nameVi}
                    onChange={(e) => update('nameVi', e.target.value)}
                    placeholder="VD: Thang bậc QĐ 2A"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="effectiveFrom">Hiệu lực từ</Label>
                  <ViDateField
                    id="effectiveFrom"
                    value={form.effectiveFrom}
                    onValueChange={(value) => update('effectiveFrom', value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="effectiveTo">Hiệu lực đến</Label>
                  <ViDateField
                    id="effectiveTo"
                    value={form.effectiveTo}
                    onValueChange={(value) => update('effectiveTo', value)}
                  />
                  <p className="text-xs text-muted-foreground">Để trống nếu áp dụng vô thời hạn.</p>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <select
                    id="status"
                    className="h-10 w-full rounded-input border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={form.status}
                    onChange={(e) => update('status', e.target.value as PolicyPackFormStatus)}
                  >
                    {(['draft', 'active', 'retired'] as const).map((s) => (
                      <option key={s} value={s}>
                        {POLICY_PACK_STATUS_LABEL_VI[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tham số cơ bản */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">2. Cấu hình Tham số cốt lõi</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="kpiThreshold">KPI ngưỡng (0–100)</Label>
                  <Input
                    id="kpiThreshold"
                    inputMode="numeric"
                    value={form.kpiThreshold}
                    onChange={(e) => update('kpiThreshold', e.target.value)}
                    className={cn(kpiInvalid && 'border-red-400')}
                    data-testid="pay-params-kpi-threshold"
                    placeholder="VD: 70"
                  />
                  {kpiInvalid && <p className="text-xs text-red-600">{MSG_KPI_RANGE}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bccStd">BCC_STD (VNĐ)</Label>
                  <ViMoneyInput
                    id="bccStd"
                    value={form.bccStd}
                    onValueChange={(value) => update('bccStd', value)}
                    data-testid="pay-params-bcc-std"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Hạn mức mở rộng */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">3. Hạn mức / Tham số mở rộng</h4>
                <Button type="button" variant="outline" size="sm" onClick={addCustomRate} className="h-8">
                  + Thêm tham số
                </Button>
              </div>
              
              <div className="bg-muted/20 p-4 rounded-xl border border-muted/50">
                {form.customRates.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Chưa có tham số mở rộng nào được định nghĩa.</p>
                    <p className="text-xs text-muted-foreground mt-1">Bấm "Thêm tham số" để bổ sung các định mức đặc thù riêng cho chính sách này.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                      <div className="flex-1 text-xs font-medium text-muted-foreground">MÃ THAM SỐ (KEY)</div>
                      <div className="flex-1 text-xs font-medium text-muted-foreground">GIÁ TRỊ (VALUE)</div>
                      <div className="w-8"></div>
                    </div>
                    {form.customRates.map((rate, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex-1">
                          <Input
                            placeholder="VD: KPI_MAX"
                            value={rate.key}
                            onChange={(e) => updateCustomRate(index, 'key', e.target.value)}
                            className="font-mono text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder="VD: 120"
                            value={rate.value}
                            onChange={(e) => updateCustomRate(index, 'value', Number(e.target.value))}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeCustomRate(index)}
                        >
                          <span className="sr-only">Xóa</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {fieldError && !kpiInvalid && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {fieldError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t">
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleArchive}
                  disabled={pending}
                  data-testid="pay-policy-pack-archive"
                  className="mr-auto"
                >
                  Ngưng áp dụng
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => setIsSheetOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={pending} data-testid="pay-policy-pack-save" className="px-6">
                {pending ? 'Đang xử lý...' : isEditing ? 'Lưu thay đổi' : 'Tạo mới gói'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
`;

content = content.substring(0, returnIndex) + newJSX;
fs.writeFileSync(path, content);
