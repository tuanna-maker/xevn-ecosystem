import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-xevn-background">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col pl-64">
        <Header />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
