export interface Column<T> {
  key: string;
  label: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  width?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  emptyMessage?: string;
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
  value: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
}

export interface InfoBannerProps {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'danger';
}

export interface BadgeProps {
  children: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  dot?: boolean;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
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
