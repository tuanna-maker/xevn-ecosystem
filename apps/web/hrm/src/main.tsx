import { createRoot } from "react-dom/client";
import '@/i18n';
import { installSafeRandomUuidPolyfill } from '@/lib/safeRandomUuid';
import { installHrmPangeaParentPortalQueryPatch } from '@/lib/hrmPangeaParentPortalQueryPatch';
import { initPortalEmbedSessionBridge } from '@/lib/portalEmbedSessionBridge';
import App from "./App.tsx";
import "./index.css";

installSafeRandomUuidPolyfill();
installHrmPangeaParentPortalQueryPatch();
initPortalEmbedSessionBridge();

createRoot(document.getElementById("root")!).render(<App />);
