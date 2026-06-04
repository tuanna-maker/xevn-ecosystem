import { execSync } from 'node:child_process';
import fs from 'node:fs';

const head = execSync('git show HEAD:apps/web/hrm/src/hooks/useSalaryComponents.ts', { encoding: 'utf8' });
const cut = head.indexOf('export const useSalaryComponents');
const stub = `export const useSalaryComponents = () => {
  const { currentCompanyId } = useAuth();
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [categories, setCategories] = useState<SalaryComponentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComponents = async () => {
    if (!currentCompanyId) {
      setComponents([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    notifyHrmApiGap({ feature: 'salary-components-list', workItemId: 'P1-SUPA-BE-02', silent: true });
    setComponents([]);
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    if (!currentCompanyId) {
      setCategories([]);
      return;
    }
    notifyHrmApiGap({ feature: 'salary-component-categories', workItemId: 'P1-SUPA-BE-02', silent: true });
    setCategories([]);
  };

  const createComponent = async (_formData: SalaryComponentFormData): Promise<SalaryComponent | null> => {
    notifyHrmApiGap({ feature: 'salary-components-create', workItemId: 'P1-SUPA-BE-02' });
    return null;
  };

  const updateComponent = async (
    _id: string,
    _formData: Partial<SalaryComponentFormData>,
  ): Promise<boolean> => {
    notifyHrmApiGap({ feature: 'salary-components-update', workItemId: 'P1-SUPA-BE-02' });
    return false;
  };

  const deleteComponent = async (_id: string): Promise<boolean> => {
    notifyHrmApiGap({ feature: 'salary-components-delete', workItemId: 'P1-SUPA-BE-02' });
    return false;
  };

  const toggleComponentStatus = async (_id: string, _isActive: boolean): Promise<boolean> => {
    notifyHrmApiGap({ feature: 'salary-components-toggle', workItemId: 'P1-SUPA-BE-02' });
    return false;
  };

  const createCategory = async (_formData: CategoryFormData): Promise<SalaryComponentCategory | null> => {
    notifyHrmApiGap({ feature: 'salary-component-category-create', workItemId: 'P1-SUPA-BE-02' });
    return null;
  };

  const deleteCategory = async (_id: string): Promise<boolean> => {
    notifyHrmApiGap({ feature: 'salary-component-category-delete', workItemId: 'P1-SUPA-BE-02' });
    return false;
  };

  const initializeDefaultComponents = async (): Promise<boolean> => {
    notifyHrmApiGap({ feature: 'salary-components-init-defaults', workItemId: 'P1-SUPA-BE-02' });
    return false;
  };

  useEffect(() => {
    void fetchComponents();
    void fetchCategories();
  }, [currentCompanyId]);

  return {
    components,
    categories,
    isLoading,
    error,
    systemSalaryComponents,
    componentTypes,
    fetchComponents,
    fetchCategories,
    createComponent,
    updateComponent,
    deleteComponent,
    toggleComponentStatus,
    createCategory,
    deleteCategory,
    initializeDefaultComponents,
  };
};
`;

let prefix = head.slice(0, cut).replace(/import \{ supabase \}[^\n]+\n/, '');
if (!prefix.includes('notifyHrmApiGap')) {
  prefix = prefix.replace(
    "import { toast } from 'sonner';",
    "import { toast } from 'sonner';\nimport { notifyHrmApiGap } from '@/lib/hrmApiGap';",
  );
}

fs.writeFileSync('apps/web/hrm/src/hooks/useSalaryComponents.ts', prefix + stub);
console.log('wrote useSalaryComponents.ts', prefix.length + stub.length);
