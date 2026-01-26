/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: number;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
