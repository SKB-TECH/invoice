import type {
    CreateFourniturePayload,
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
