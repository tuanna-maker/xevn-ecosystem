import { createRoot } from "react-dom/client";
import '@/i18n';
import { installSafeRandomUuidPolyfill } from '@/lib/safeRandomUuid';
import { initPortalEmbedSessionBridge } from '@/lib/portalEmbedSessionBridge';
import App from "./App.tsx";
import "./index.css";

installSafeRandomUuidPolyfill();
initPortalEmbedSessionBridge();

createRoot(document.getElementById("root")!).render(<App />);
