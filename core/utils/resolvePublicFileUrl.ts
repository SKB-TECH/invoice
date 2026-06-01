import { ENV } from "@/core/constants/env";

export function resolvePublicFileUrl(
    path: string | null | undefined,
): string | undefined {
    if (!path?.trim()) return undefined;
    const p = path.trim();

    if (p.startsWith("http://") || p.startsWith("https://")) {
        return `/api/file?path=${encodeURIComponent(p)}`;
    }

    const base = ENV.FILES_BASE_URL.replace(/\/$/, "");
    const segment = p.startsWith("/") ? p : `/${p}`;
    if (base) return `${base}${segment}`;
    const clean = p.replace(/^\//, "");
    return `/api/file?path=${encodeURIComponent(clean)}`;
}
