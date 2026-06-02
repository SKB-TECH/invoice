export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

export function filenameFromContentDisposition(
    header: string | undefined,
    fallback: string,
): string {
    if (!header) return fallback;

    const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header);
    if (utf8Match?.[1]) {
        try {
            return decodeURIComponent(utf8Match[1].trim());
        } catch {
            return fallback;
        }
    }

    const asciiMatch = /filename="?([^";]+)"?/i.exec(header);
    if (asciiMatch?.[1]) {
        return asciiMatch[1].trim();
    }

    return fallback;
}
