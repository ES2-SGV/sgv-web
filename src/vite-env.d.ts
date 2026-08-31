/// <reference types="vite/client" />

/** Variáveis do `.env` (modelo em `.env.example`). */
interface ImportMetaEnv {
	/** API usada por `npm run dev`. */
	readonly VITE_DEV_API_BASEURL?: string;
	/** API usada pelo bundle de `npm run build` — o que vai para o Docker. */
	readonly VITE_PROD_API_BASEURL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
