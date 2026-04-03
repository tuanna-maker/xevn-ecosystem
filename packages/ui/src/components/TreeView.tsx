import React from 'react';
import { cn } from '../lib/utils';

export interface TreeViewProps {
  items: {
    id: string;
    label: string;
    icon?: React.ReactNode;
    children?: TreeViewProps['items'];
  }[];
  className?: string;
}

export const TreeView: React.FC<TreeViewProps> = ({ items, className }) => {
  const renderTreeItems = (items: TreeViewProps['items'], level = 0) => {
    return items.map((item) => (
      <div key={item.id} className="mb-1">
        <div
          className={cn(
            'flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-xevn-surface/50 transition-colors',
            level === 0 ? 'font-medium text-xevn-text' : 'text-xevn-textSecondary'
          )}
          style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
        >
          {item.icon && <div className="mr-2">{item.icon}</div>}
          <span>{item.label}</span>
        </div>
        {item.children && item.children.length > 0 && (
          <div className="ml-2 border-l-2 border-xevn-border pl-2">
            {renderTreeItems(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return <div className={className}>{renderTreeItems(items)}</div>;
};
