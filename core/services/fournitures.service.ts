import type {
    CreateFourniturePayload,
    UpdateFourniturePayload,
    FournitureArticle,
    FournituresListResponse,
} from "@/core/types/fourniture";
import { api } from "@/core/services/api";

const FOURNITURES_PATH = "/invoices/fournitures";

export async function fetchFournituresList(params?: {
    page?: number;
    perPage?: number;
}): Promise<FournituresListResponse> {
    const { data } = await api.get<FournituresListResponse>(
        FOURNITURES_PATH,
        { params }
    );
    return data;
}

export async function fetchFournitureByPathKey(
    key: string,
): Promise<FournitureArticle> {
    const { data } = await api.get<FournitureArticle>(
        `${FOURNITURES_PATH}/${encodeURIComponent(key)}`,
    );
    return data;
}

export async function fetchFournitureByKey(
    key: string,
): Promise<FournitureArticle> {
    const trimmed = key.trim();
    if (!trimmed) {
        throw new Error("Article key is required.");
    }

    try {
        return await fetchFournitureByPathKey(trimmed);
    } catch (error) {
        const numericId = Number(trimmed);
        if (Number.isFinite(numericId) && numericId > 0) {
            throw error;
        }

        const list = await fetchFournituresList({ perPage: 500 });
        const match = list.items.find((item) => item.code === trimmed);
        if (!match?.id) {
            throw error;
        }

        return fetchFournitureByPathKey(String(match.id));
    }
}

export async function fetchFournitureById(
    id: number | string,
): Promise<FournitureArticle> {
    return fetchFournitureByPathKey(String(id));
}

export async function createFourniture(
    payload: CreateFourniturePayload
): Promise<FournitureArticle> {
    const { data } = await api.post<FournitureArticle>(
        FOURNITURES_PATH,
        payload
    );
    return data;
}

export async function updateFourniture(
    id: number | string,
    payload: UpdateFourniturePayload
): Promise<FournitureArticle> {
    const { data } = await api.put<FournitureArticle>(
        `${FOURNITURES_PATH}/${encodeURIComponent(String(id))}`,
        payload
    );
    return data;
}

export async function deleteFourniture(id: number | string): Promise<void> {
    await api.delete(
        `${FOURNITURES_PATH}/${encodeURIComponent(String(id))}`,
    );
}
