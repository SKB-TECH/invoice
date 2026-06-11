import { api } from "@/core/services/api";
import { unwrapApiData } from "@/core/utils/apiResponse";
import type {
    ApiNotification,
    NotificationInboxItem,
    NotificationsInboxMeta,
} from "@/core/types/notification";
import { mapApiNotification } from "@/core/types/notification";

type InboxResponse = {
    items: NotificationInboxItem[];
    meta: NotificationsInboxMeta;
};

const DEFAULT_META: NotificationsInboxMeta = {
    page: 1,
    perPage: 20,
    total: 0,
    unread: 0,
};

function asInboxResponse(body: unknown): InboxResponse {
    const inner = unwrapApiData<unknown>(body);

    // legacy: array only
    if (Array.isArray(inner)) {
        const items = (inner as ApiNotification[]).map((n, idx) =>
            mapApiNotification(n, idx)
        );
        return { items, meta: { ...DEFAULT_META, total: items.length } };
    }

    if (inner && typeof inner === "object") {
        const record = inner as Record<string, unknown>;
        const apiItems = Array.isArray(record.items)
            ? (record.items as ApiNotification[])
            : Array.isArray(record.notifications)
              ? (record.notifications as ApiNotification[])
              : Array.isArray(record.inbox)
                ? (record.inbox as ApiNotification[])
                : [];

        const items = apiItems.map((n, idx) => mapApiNotification(n, idx));

        const metaRaw =
            record.meta && typeof record.meta === "object"
                ? (record.meta as Record<string, unknown>)
                : null;

        const num = (v: unknown, fallback: number) =>
            typeof v === "number" && Number.isFinite(v) ? v : fallback;

        const meta: NotificationsInboxMeta = {
            page: num(metaRaw?.page, DEFAULT_META.page),
            perPage: num(metaRaw?.perPage, DEFAULT_META.perPage),
            total: num(metaRaw?.total, items.length),
            unread: num(metaRaw?.unread, items.filter((n) => n.unread).length),
        };

        return { items, meta };
    }

    return { items: [], meta: DEFAULT_META };
}

function asApiNotification(body: unknown): ApiNotification | null {
    const inner = unwrapApiData<unknown>(body);

    if (inner && typeof inner === "object" && !Array.isArray(inner)) {
        // Supporte aussi une enveloppe { status, message, data }
        const record = inner as Record<string, unknown>;
        if (
            "data" in record &&
            record.data &&
            typeof record.data === "object" &&
            !Array.isArray(record.data)
        ) {
            return record.data as ApiNotification;
        }

        return inner as ApiNotification;
    }

    return null;
}

export const notificationService = {
    async getInbox(params?: {
        page?: number;
        perPage?: number;
    }): Promise<InboxResponse> {
        const { data } = await api.get<unknown>("/auth/me/notifications/inbox", {
            params: {
                page: params?.page,
                perPage: params?.perPage,
            },
        });

        return asInboxResponse(data);
    },

    async getNotification(id: string): Promise<NotificationInboxItem | null> {
        const { data } = await api.get<unknown>(
            `/auth/me/notifications/inbox/${encodeURIComponent(id)}`
        );
        const n = asApiNotification(data);
        if (!n) return null;
        return mapApiNotification(n, 0);
    },

    async markAsRead(id: string): Promise<unknown> {
        const { data } = await api.put<unknown>(
            `/auth/me/notifications/inbox/${encodeURIComponent(id)}/read`
        );
        return data;
    },

    async markAllAsRead(): Promise<unknown> {
        const { data } = await api.put<unknown>(
            "/auth/me/notifications/inbox/read-all"
        );
        return data;
    },
};

