/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Portal rem density (0.75–1). Default 0.9 in applyUiDensity(). */
  readonly VITE_UI_DENSITY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
