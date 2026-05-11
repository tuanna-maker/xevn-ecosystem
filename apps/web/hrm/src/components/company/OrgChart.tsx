import { useMemo } from 'react';
import { Building2, Briefcase, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Department {
  id: string;
  company_id: string;
  parent_id: string | null;
  name: string;
  code: string | null;
  description: string | null;
  manager_name: string | null;
  manager_email: string | null;
  employee_count: number;
  level: number;
  sort_order: number;
  status: string;
  created_at: string;
  updated_at: string;
  children?: Department[];
}

interface OrgChartProps {
  departments: Department[];
  onNodeClick?: (dept: Department) => void;
}

function buildTree(items: Department[], parentId: string | null = null): Department[] {
  return items
    .filter(item => item.parent_id === parentId)
    .map(item => ({
      ...item,
      children: buildTree(items, item.id),
    }));
}

interface OrgNodeProps {
  department: Department;
  isRoot?: boolean;
  onNodeClick?: (dept: Department) => void;
}

function OrgNode({ department, isRoot = false, onNodeClick }: OrgNodeProps) {
  const hasChildren = department.children && department.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        onClick={() => onNodeClick?.(department)}
        className={cn(
          "relative px-4 py-3 rounded-xl border-2 bg-card shadow-lg cursor-pointer transition-all duration-200",
          "hover:shadow-xl hover:scale-105 hover:border-primary",
          isRoot ? "border-primary bg-primary/5 min-w-[200px]" : "border-border min-w-[160px]",
          department.status !== 'active' && "opacity-60"
        )}
      >
        {/* Icon */}
        <div className={cn(
          "absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center shadow-md",
          isRoot ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
        )}>
          {isRoot ? (
            <Building2 className="w-4 h-4" />
          ) : (
            <Briefcase className="w-4 h-4" />
          )}
        </div>

        <div className="pt-3 text-center">
          <h4 className={cn(
            "font-semibold truncate",
            isRoot ? "text-base" : "text-sm"
          )}>
            {department.name}
          </h4>
          
          {department.code && (
            <span className="text-xs text-muted-foreground">
              ({department.code})
            </span>
          )}

          {department.manager_name && (
            <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{department.manager_name}</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-1 mt-1 text-xs">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-primary font-medium">{department.employee_count}</span>
          </div>
        </div>
      </div>

      {/* Connector and Children */}
      {hasChildren && (
        <>
          {/* Vertical line down */}
          <div className="w-0.5 h-6 bg-border" />
          
          {/* Horizontal line for multiple children */}
          {department.children!.length > 1 && (
            <div 
              className="h-0.5 bg-border"
              style={{
                width: `calc(${(department.children!.length - 1) * 100}% + ${(department.children!.length - 1) * 24}px)`
              }}
            />
          )}

          {/* Children Container */}
          <div className="flex gap-6 pt-0">
            {department.children!.map((child, index) => (
              <div key={child.id} className="flex flex-col items-center">
                {/* Vertical connector to child */}
                <div className="w-0.5 h-6 bg-border" />
                <OrgNode department={child} onNodeClick={onNodeClick} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function OrgChart({ departments, onNodeClick }: OrgChartProps) {
  const tree = useMemo(() => buildTree(departments), [departments]);

  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Building2 className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg">Chưa có phòng ban nào</p>
        <p className="text-sm">Tạo phòng ban để xem sơ đồ tổ chức</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="min-w-max flex justify-center pt-8 px-8">
        <div className="flex gap-12">
          {tree.map(rootDept => (
            <OrgNode 
              key={rootDept.id} 
              department={rootDept} 
              isRoot 
              onNodeClick={onNodeClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
