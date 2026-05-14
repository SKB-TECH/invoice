/**
 * Seul fichier autorisé à lire process.env.
 * Tout accès direct à process.env dans le code applicatif est interdit.
 * Règle ESLint « no-process-env » enforce cette contrainte.
 *
 * IMPORTANT :
 * - Les variables NEXT_PUBLIC_* sont accessibles côté navigateur.
 * - Les variables sans NEXT_PUBLIC_* restent côté serveur.
 */

export const ENV = {
    /**
     * URL utilisée par Axios côté client.
     * En prod/dev avec proxy, cela reste /api/proxy.
     */
    API_URL: process.env.NEXT_PUBLIC_API_URL ?? "/api/proxy",

    /**
     * Base URL publique pour afficher les fichiers/images côté front.
     * Celle-ci peut rester en NEXT_PUBLIC_*.
     */
    FILES_BASE_URL: process.env.NEXT_PUBLIC_FILES_BASE_URL ?? "",

    /**
     * URL upstream réelle du backend.
     * Utilisée uniquement par le proxy Next.js côté serveur.
     *
     * On garde un fallback temporaire vers NEXT_PUBLIC_API_BASE_URL
     * pour ne pas casser immédiatement ton environnement actuel,
     * mais il faut migrer vers API_BASE_URL.
     */
    API_BASE_URL:
        process.env.API_BASE_URL ??
        process.env.NEXT_PUBLIC_API_BASE_URL ??
        "",

    /**
     * Clé API secrète.
     * Utilisée uniquement dans le proxy côté serveur.
     *
     * Fallback temporaire pour compatibilité avec ton ancien .env.
     */
    API_KEY:
        process.env.API_KEY ??
        process.env.NEXT_PUBLIC_API_KEY ??
        "",

    /**
     * Canal applicatif.
     * Utilisé uniquement dans le proxy côté serveur.
     *
     * Fallback temporaire pour compatibilité avec ton ancien .env.
     */
    API_CHANNEL:
        process.env.API_CHANNEL ??
        process.env.NEXT_PUBLIC_API_CHANNEL ??
        "",

    /**
     * Indique si le front passe par le proxy Next.js.
     */
    USE_PROXY: process.env.NEXT_PUBLIC_USE_PROXY === "true",

    /**
     * Environnement courant.
     */
    NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;

export type EnvConfig = typeof ENV;
