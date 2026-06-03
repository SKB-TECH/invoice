function getCookieOptions(seconds: number) {
    const date = new Date();
    date.setTime(date.getTime() + seconds * 1000);

    const secure =
        typeof window !== "undefined" && window.location.protocol === "https:"
            ? "Secure; "
            : "";

    return `expires=${date.toUTCString()}; path=/; ${secure}SameSite=Lax`;
}

export function setCookie(name: string, value: string, seconds = 60 * 60): void {
    if (typeof document === "undefined") return;

    const cookieValue = `${name}=${encodeURIComponent(value)}; ${getCookieOptions(seconds)}`;
    document.cookie = cookieValue;

    if (process.env.NODE_ENV === "development") {
        const present = document.cookie.includes(`${name}=`);
        console.log(
            `setCookie(${name}) result:`,
            present,
            "cookieString:",
            document.cookie
        );
    }
}

export function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
        const trimmed = cookie.trim();
        const separatorIndex = trimmed.indexOf("=");

        if (separatorIndex === -1) continue;

        const key = trimmed.slice(0, separatorIndex);
        const value = trimmed.slice(separatorIndex + 1);

        if (key === name) {
            return decodeURIComponent(value);
        }
    }

    return null;
}

export function deleteCookie(name: string): void {
    if (typeof document === "undefined") return;

    const secure =
        typeof window !== "undefined" && window.location.protocol === "https:"
            ? "Secure; "
            : "";

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${secure}SameSite=Lax`;
}
