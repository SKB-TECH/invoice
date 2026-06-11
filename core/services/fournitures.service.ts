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

export async function fetchFournitureById(
    id: number | string
): Promise<FournitureArticle> {
    const { data } = await api.get<FournitureArticle>(
        `${FOURNITURES_PATH}/${encodeURIComponent(String(id))}`
    );
    return data;
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
