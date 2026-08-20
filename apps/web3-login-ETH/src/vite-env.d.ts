/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_THIRDWEB_CLIENT_ID: string;
  readonly VITE_RPC_URL?: string;
  readonly VITE_TOKEN_ADDRESS?: string;
  readonly VITE_TOKEN_SYMBOL?: string;
  readonly VITE_TOKEN_DECIMALS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
