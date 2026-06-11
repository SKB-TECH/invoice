export type ApiNotification = Record<string, unknown> & {
    id?: string | number;
    title?: string;
    message?: string;
    date?: string;
    read_at?: string | null;
    is_read?: boolean;
    type?: string;
};

export type NotificationsInboxMeta = {
    page: number;
    perPage: number;
    total: number;
    unread: number;
};

export type NotificationInboxItem = {
    id: string;
    title: string;
    message?: string;
    type?: string;
    date?: string;
    unread: boolean;
    raw: ApiNotification;
};

function pickString(...values: unknown[]): string | undefined {
    for (const v of values) {
        if (typeof v === "string" && v.trim()) return v;
    }
    return undefined;
}

function pickId(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return undefined;
}

function isUnread(n: ApiNotification): boolean {
    const bool = (v: unknown): boolean | undefined =>
        typeof v === "boolean" ? v : undefined;

    const readAt = pickString(n.read_at);
    if (readAt) return false;

    const readFlag = bool(n.is_read);
    if (readFlag !== undefined) return !readFlag;

    return true;
}

export function mapApiNotification(n: ApiNotification, index = 0): NotificationInboxItem {
    const id =
        pickId(n.id) ||
        pickId((n as Record<string, unknown>)["Id_0"]) ||
        `notification-${index + 1}`;

    const title = pickString(n.title) ?? "Notification";
    const message = pickString(n.message);
    const type = pickString(n.type);
    const date = pickString(n.date);

    return {
        id,
        title,
        message,
        type,
        date,
        unread: isUnread(n),
        raw: n,
    };
}

