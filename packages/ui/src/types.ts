export interface Column<T> {
  key: string;
  header?: string;
  label?: string;
  render?: {
    bivarianceHack(value: any, item: T): React.ReactNode;
  }['bivarianceHack'];
  width?: string;
  sortable?: boolean;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  actions?: React.ReactNode;
  onRowClick?: (item: T) => void;
  onSort?: (sortConfig: SortConfig<T>) => void;
  sortConfig?: SortConfig<T>;
  responsive?: {
    mobile?: 'card' | 'scroll';
    tablet?: 'scroll' | 'table';
    desktop?: 'table';
  };
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  color?: string;
  trend?:
    | number
    | {
        value: number;
        isPositive: boolean;
      };
  trendLabel?: string;
  className?: string;
}

export interface InfoBannerProps {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'danger';
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  showCompanyFilter?: boolean;
}

export interface TreeViewProps {
  items: TreeViewItem[];
  onNodeClick?: (node: TreeViewItem) => void;
  renderNode?: (node: TreeViewItem) => React.ReactNode;
}

export interface TreeViewItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  children?: TreeViewItem[];
}

export interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rect';
  width?: string;
  height?: string;
}

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface SectionProps {
  children: React.ReactNode;
  gap?: number;
}

export interface BreadcrumbsProps {
  items: { label: string; path?: string }[];
}

export interface PageLayoutProps {
  children: React.ReactNode;
}

export interface InfoCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
}
