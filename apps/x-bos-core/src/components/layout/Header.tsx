import { Search } from 'lucide-react';
import { useXbosStore } from '@/store/useXbosStore';

export function Header() {
  const { globalSearch, setGlobalSearch } = useXbosStore();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-black/[0.06] bg-white/65 px-8 backdrop-blur-nav">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-xevn-muted" />
        <input
          type="search"
          placeholder="Tìm kiếm hội tụ — mã, tên, danh mục…"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="w-full rounded-2xl border border-black/[0.06] bg-white/80 py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition focus:ring-2 focus:ring-xevn-primary/20"
        />
      </div>
      <div className="hidden sm:block text-xs text-xevn-muted">XeVN Holding</div>
    </header>
  );
}
