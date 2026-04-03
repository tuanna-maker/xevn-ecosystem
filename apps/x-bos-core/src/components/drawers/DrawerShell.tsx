import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface DrawerShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** z-index lớp — Drawer con đè lên Drawer cha */
  layer?: 'main' | 'nested';
  widthClassName?: string;
}

export function DrawerShell({
  open,
  onClose,
  title,
  children,
  layer = 'main',
  widthClassName = 'max-w-md',
}: DrawerShellProps) {
  const zOverlay = layer === 'nested' ? 'z-[60]' : 'z-40';
  const zPanel = layer === 'nested' ? 'z-[70]' : 'z-50';

  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          <motion.div
            role="presentation"
            className={`fixed inset-0 ${zOverlay} bg-black/[0.12] backdrop-blur-[2px]`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.aside
            className={`fixed right-0 top-0 bottom-0 ${zPanel} flex w-full ${widthClassName} flex-col border-l border-black/[0.06] bg-white/[0.94] shadow-soft backdrop-blur-nav`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
          >
            <header className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4">
              <h2 className="text-lg font-semibold tracking-tight text-xevn-text">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-xevn-muted hover:bg-black/[0.04]"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
