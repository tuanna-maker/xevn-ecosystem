import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { createPortal } from "react-dom";
import { getRadixPortalContainer, isHrmDialogMountedToPortalParent, syncHrmStylesheetsToParentForPortalDialogs } from "@/lib/hrmDialogPortal";

export function Toaster() {
  const { toasts } = useToast();

  const useParentPortal = isHrmDialogMountedToPortalParent('parent');
  if (useParentPortal) {
    syncHrmStylesheetsToParentForPortalDialogs();
  }
  const mount = getRadixPortalContainer('parent');

  const content = (
    <ToastProvider duration={3000}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );

  return mount ? createPortal(content, mount) : content;
}
