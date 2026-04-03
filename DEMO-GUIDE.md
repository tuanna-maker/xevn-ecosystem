# XEVN UI/UX DEMO GUIDE

## Getting Started with the Component System

This guide shows how to use the standardized UI components in the XEVN ecosystem.

### 1. Importing Components

All components are exported from `@xevn/ui`:

```tsx
import { Button, Card, DataTable, PageHeader, StatCard, TreeView } from '@xevn/ui';
```

### 2. Using Design Tokens

The design system uses consistent tokens for colors, spacing, and typography:

```tsx
// Colors
<div className="bg-xevn-primary text-white">Primary button</div>
<div className="bg-xevn-accent text-white">Accent button</div>
<div className="bg-xevn-success text-white">Success state</div>

// Spacing
<div className="space-y-md">...</div>
<div className="p-lg">...</div>

// Typography
<h1 className="text-4xl font-bold">Heading</h1>
<p className="text-base text-xevn-text">Body text</p>
```

### 3. Page Layout Structure

Every page should follow this structure:

```tsx
import { PageLayout } from '@xevn/ui';

export default function MyPage() {
  return (
    <PageLayout>
      <PageHeader
        title="My Page"
        subtitle="Description of the page"
        icon={<DashboardIcon />}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        <StatCard title="Total Users" value="1,243" icon={<UserIcon />} />
        <StatCard title="Revenue" value="$1.2M" icon={<DollarIcon />} />
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchPlaceholder="Search users..."
      />
    </PageLayout>
  );
}
```

### 4. Component Examples

#### Button
```tsx
<Button variant="primary">Primary Button</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="danger">Danger Button</Button>
<Button isLoading>Processing...</Button>
```

#### Card
```tsx
<Card>
  <h3 className="text-lg font-semibold">Card Title</h3>
  <p className="text-xevn-textSecondary mt-1">Card content</p>
</Card>
```

#### StatCard
```tsx
<StatCard
  title="Active Users"
  value="1,243"
  icon={<UserIcon />}
  trend={12}
  trendLabel="up from last month"
/>
```

#### DataTable
```tsx
<DataTable
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' }
  ]}
  data={users}
  searchPlaceholder="Search users..."
  onRowClick={(row) => console.log(row)}
/>
```

#### TreeView
```tsx
<TreeView
  items={orgStructure}
  onNodeClick={(node) => console.log(node)}
  renderNode={(node) => (
    <div className="flex items-center gap-2">
      <span>{node.icon}</span>
      <span>{node.label}</span>
      <span className="text-xs text-xevn-textSecondary">({node.count})</span>
    </div>
  )}
/>
```

### 5. Responsive Design

All layouts are mobile-first:

```tsx
// Grid: 1 column on mobile, 2 on tablet, 4 on desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>

// DataTable: switches to card view on mobile
<DataTable
  responsive={{
    mobile: 'card',
    tablet: 'scroll',
    desktop: 'table'
  }}
/>
```

### 6. Loading & Empty States

```tsx
// Loading state
<LoadingOverlay isLoading={loading}>
  <DataTable />
</LoadingOverlay>

// Empty state
<EmptyState
  icon={<SearchIcon />}
  title="No users found"
  description="Try adjusting your search criteria"
  action={<Button>Search Again</Button>}
/>
```

### 7. Best Practices

- Always use design tokens instead of hardcoded values
- Use `@xevn/ui` components instead of creating new ones
- Follow the PageLayout pattern for all pages
- Use `mock-data.ts` for all demo data
- Test responsiveness on mobile, tablet, and desktop
- Use `aria-label` for all interactive elements
- Maintain consistent spacing (always multiples of 4px)

## Next Steps

1. Use this guide to refactor all pages in the web-portal
2. Create new pages using the standardized components
3. Add new features using the existing design system
4. Share this guide with the entire team

> **Pro Tip**: Always check the [UI/STYLE-GUIDE.md](UI-STYLE-GUIDE.md) for the complete design system documentation.