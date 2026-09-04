import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

p = 'apps/web/hrm/src/components/settings/JdDynamicSettingsPanel.tsx'
s = open(p, encoding='utf-8').read()

def rep(old, new, n=1):
    global s
    c = s.count(old)
    assert c == n, f'expected {n} got {c} for: {old[:80]!r}'
    s = s.replace(old, new)

# 1. fieldForm state: add runtime fields
rep("""const [fieldForm, setFieldForm] = useState({
    field_key: '',
    label: '',
    field_type: 'short_text',
    is_required: false,
    validation_source: 'static',
    validation_options: '',
    validation_catalog_key: '',
  });""",
"""const [fieldForm, setFieldForm] = useState({
    field_key: '',
    label: '',
    field_type: 'short_text',
    is_required: false,
    validation_source: 'static',
    validation_options: '',
    validation_catalog_key: '',
    validation_source_ref: '',
    validation_note: '',
  });""")

# 2. reset on close (create)
rep("""      setFieldForm({
        field_key: '',
        label: '',
        field_type: 'short_text',
        is_required: false,
        validation_source: 'static',
        validation_options: '',
        validation_catalog_key: '',
      });
    }
  };

  const handleGroupDialogOpenChange""",
"""      setFieldForm({
        field_key: '',
        label: '',
        field_type: 'short_text',
        is_required: false,
        validation_source: 'static',
        validation_options: '',
        validation_catalog_key: '',
        validation_source_ref: '',
        validation_note: '',
      });
    }
  };

  const handleGroupDialogOpenChange""")

# 3. onCreateField validation
rep("""    // Validate validation_json for select type
    let validation_json: Record<string, unknown> | undefined;
    if (fieldForm.field_type === 'select') {
      if (fieldForm.validation_source === 'static') {
        const options = fieldForm.validation_options
          .split(/[\\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (options.length === 0) {
          toast({ title: 'Cần ít nhất 1 tùy chọn cho trường Danh sách chọn', variant: 'destructive' });
          return;
        }
        if (options.length > 50) {
          toast({ title: 'Tối đa 50 tùy chọn cho trường Danh sách chọn', variant: 'destructive' });
          return;
        }
        validation_json = { source: 'static', options };
      } else if (fieldForm.validation_source === 'catalog') {
        if (!fieldForm.validation_catalog_key) {
          toast({ title: 'Chọn danh mục nguồn cho trường Danh sách chọn', variant: 'destructive' });
          return;
        }
        validation_json = { source: 'catalog', catalog_key: fieldForm.validation_catalog_key };
      }
    }""",
"""    // Validate validation_json for select type (VAL-JD-21/22/23 — pure helper, no BE call).
    const selectValidation = buildSelectValidationJson({
      source: fieldForm.validation_source as JdSelectSource,
      options: fieldForm.validation_options,
      catalogKey: fieldForm.validation_catalog_key,
      sourceRef: fieldForm.validation_source_ref,
      note: fieldForm.validation_note,
    });
    if (fieldForm.field_type === 'select' && selectValidation === undefined) {
      toast({
        title: 'validation_json khong hop le',
        description: selectValidationReason(fieldForm),
        variant: 'destructive',
      });
      return;
    }
    let validation_json: Record<string, unknown> | undefined = selectValidation ?? undefined;""")

# 4. onCreateField reset
rep("""      setFieldForm({
        field_key: '',
        label: '',
        field_type: 'short_text',
        is_required: false,
        validation_source: 'static',
        validation_options: '',
        validation_catalog_key: '',
      });
      setFieldDialogOpen(false);
      await loadAll();
    } catch (err: unknown) {
      toast({
        title: 'Khong tao duoc truong',
        description: toErrorMessage(err, 'Kiểm tra trùng mã hoặc kiểu trường.'),
        variant: 'destructive',
      });
    }
  };""",
"""      setFieldForm({
        field_key: '',
        label: '',
        field_type: 'short_text',
        is_required: false,
        validation_source: 'static',
        validation_options: '',
        validation_catalog_key: '',
        validation_source_ref: '',
        validation_note: '',
      });
      setFieldDialogOpen(false);
      await loadAll();
    } catch (err: unknown) {
      toast({
        title: 'Khong tao duoc truong',
        description: toErrorMessage(err, 'Kiểm tra trùng mã hoặc kiểu trường.'),
        variant: 'destructive',
      });
    }
  };""")

# 5. handleEditField pre-fill
rep("""    if (row.field_type === 'select' && row.validation_json) {
      const vj = row.validation_json as { source?: string; options?: string[]; catalog_key?: string };
      if (vj.source === 'catalog') {
        validation_source = 'catalog';
        validation_catalog_key = vj.catalog_key || '';
      } else {
        validation_source = 'static';
        validation_options = (vj.options || []).join(', ');
      }
    }""",
"""    if (row.field_type === 'select' && row.validation_json) {
      const vj = normalizeSelectValidation(row.validation_json);
      if (vj?.source === 'catalog') {
        validation_source = 'catalog';
        validation_catalog_key = vj.catalog_key || '';
      } else if (vj?.source === 'runtime') {
        validation_source = 'runtime';
        validation_source_ref = vj.source_ref || '';
        validation_note = vj.note || '';
      } else {
        validation_source = 'static';
        validation_options = (vj.options || []).join(', ');
      }
    }""")

# 6. handleEditField setFieldForm
rep("""    setFieldForm({
      field_key: row.field_key,
      label: row.label,
      field_type: row.field_type,
      is_required: row.is_required,
      validation_source,
      validation_options,
      validation_catalog_key,
    });
    setFieldDialogOpen(true);""",
"""    setFieldForm({
      field_key: row.field_key,
      label: row.label,
      field_type: row.field_type,
      is_required: row.is_required,
      validation_source,
      validation_options,
      validation_catalog_key,
      validation_source_ref,
      validation_note,
    });
    setFieldDialogOpen(true);""")

# 7. onUpdateField validation
rep("""    // Validate validation_json for select type
    let validation_json: Record<string, unknown> | undefined;
    if (fieldForm.field_type === 'select') {
      if (fieldForm.validation_source === 'static') {
        const options = fieldForm.validation_options
          .split(/[\\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (options.length === 0) {
          toast({ title: 'Cần ít nhất 1 tùy chọn cho trường Danh sách chọn', variant: 'destructive' });
          return;
        }
        if (options.length > 50) {
          toast({ title: 'Tối đa 50 tùy chọn cho trường Danh sách chọn', variant: 'destructive' });
          return;
        }
        validation_json = { source: 'static', options };
      } else if (fieldForm.validation_source === 'catalog') {
        if (!fieldForm.validation_catalog_key) {
          toast({ title: 'Chọn danh mục nguồn cho trường Danh sách chọn', variant: 'destructive' });
          return;
        }
        validation_json = { source: 'catalog', catalog_key: fieldForm.validation_catalog_key };
      }
    }""",
"""    // Validate validation_json for select type (VAL-JD-21/22/23 — pure helper, no BE call).
    const selectValidation = buildSelectValidationJson({
      source: fieldForm.validation_source as JdSelectSource,
      options: fieldForm.validation_options,
      catalogKey: fieldForm.validation_catalog_key,
      sourceRef: fieldForm.validation_source_ref,
      note: fieldForm.validation_note,
    });
    if (fieldForm.field_type === 'select' && selectValidation === undefined) {
      toast({
        title: 'validation_json khong hop le',
        description: selectValidationReason(fieldForm),
        variant: 'destructive',
      });
      return;
    }
    let validation_json: Record<string, unknown> | undefined = selectValidation ?? undefined;""")

# 8. onUpdateField reset
rep("""      setFieldForm({
        field_key: '',
        label: '',
        field_type: 'short_text',
        is_required: false,
        validation_source: 'static',
        validation_options: '',
        validation_catalog_key: '',
      });
      setEditingFieldId(null);
      setFieldDialogOpen(false);
      await loadAll();
    } catch (err: unknown) {
      toast({
        title: 'Khong cap nhat duoc truong',
        description: toErrorMessage(err, 'Kiểm tra trùng mã hoặc kiểu trường.'),
        variant: 'destructive',
      });
    }
  };""",
"""      setFieldForm({
        field_key: '',
        label: '',
        field_type: 'short_text',
        is_required: false,
        validation_source: 'static',
        validation_options: '',
        validation_catalog_key: '',
        validation_source_ref: '',
        validation_note: '',
      });
      setEditingFieldId(null);
      setFieldDialogOpen(false);
      await loadAll();
    } catch (err: unknown) {
      toast({
        title: 'Khong cap nhat duoc truong',
        description: toErrorMessage(err, 'Kiểm tra trùng mã hoặc kiểu trường.'),
        variant: 'destructive',
      });
    }
  };""")

# 9. import + helper
rep("""import { toErrorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/button';""",
"""import { toErrorMessage } from '@/lib/apiError';
import {
  buildSelectValidationJson,
  normalizeSelectValidation,
  selectValidationReason,
  type JdSelectSource,
} from '@/lib/jdFieldValidation';
import { JdFieldValidationSection } from '@/components/settings/JdFieldValidationSection';
import { Button } from '@/components/ui/button';""")

open(p, 'w', encoding='utf-8').write(s)
print('OK panel edits applied')