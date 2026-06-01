import type { ArticleRowStatus, ArticleTableRow } from "@/components/articles/types";
import type { FournitureArticle } from "@/core/types/fourniture";
import type { ArticleDetailRecord } from "@/lib/fournitures/articles/articles-data";
import { REFERENCE_TAX_GROUPS } from "@/lib/tax-groups/default-reference-tax-groups";

const API_STATUS_MAP: Partial<Record<number, ArticleRowStatus>> = {
    0: "suspendu",
    1: "actif",
    2: "complet",
};

export function mapApiArticleStatus(code: number): ArticleRowStatus {
    return API_STATUS_MAP[code] ?? "actif";
}

export function taxGroupSlugToNumericId(slug: string): number {
    const idx = REFERENCE_TAX_GROUPS.findIndex((g) => g.id === slug);
    return idx >= 0 ? idx + 1 : 1;
}

export function numericTaxGroupToSlug(num: number): string {
    return REFERENCE_TAX_GROUPS[num - 1]?.id ?? "groupe-a";
}

const ARTICLE_UI_GROUP_IDS: Record<"a" | "b" | "c", number> = {
    a: 1,
    b: 2,
    c: 3,
};

export function articleUiGroupToGroupId(value: string): number {
    const lower = value.toLowerCase();
    if (lower === "a" || lower === "b" || lower === "c") {
        return ARTICLE_UI_GROUP_IDS[lower as "a" | "b" | "c"];
    }
    return 1;
}

export function apiGroupIdToDisplayLetter(groupId: number): string {
    if (groupId >= 1 && groupId <= 3) {
        return ["A", "B", "C"][groupId - 1] ?? String(groupId);
    }
    return String(groupId);
}

function apiGroupToDetailGroupe(
    groupId: number
): ArticleDetailRecord["groupe"] {
    if (groupId === 1) return "a";
    if (groupId === 2) return "b";
    if (groupId === 3) return "c";
    return "a";
}

const UNIT_ID_TO_DETAIL: Record<
    number,
    ArticleDetailRecord["pieceUnite"]
> = {
    1: "piece",
    2: "kg",
    3: "heure",
    4: "forfait",
};

const DETAIL_TO_UNIT_ID: Record<ArticleDetailRecord["pieceUnite"], number> = {
    piece: 1,
    kg: 2,
    heure: 3,
    forfait: 4,
};

export function apiUnitIdToPieceUnite(
    unitId: number
): ArticleDetailRecord["pieceUnite"] {
    return UNIT_ID_TO_DETAIL[unitId] ?? "piece";
}

export function detailPieceUniteToUnitId(
    pu: ArticleDetailRecord["pieceUnite"]
): number {
    return DETAIL_TO_UNIT_ID[pu] ?? 1;
}

export function normalizeCurrency(code: string): ArticleDetailRecord["devise"] {
    const lower = code.trim().toLowerCase();
    if (lower === "usd" || lower === "cdf" || lower === "eur") {
        return lower;
    }
    return "usd";
}

function resolveReferentialTitleForTable(
    item: FournitureArticle,
    referentialTitleByCategoryId?: ReadonlyMap<number, string>,
): string {
    const fromCategoryInfo = item.category_info?.title?.trim();
    if (fromCategoryInfo) return fromCategoryInfo;

    const cid = item.category_id;
    if (typeof cid === "number" && Number.isFinite(cid) && cid > 0) {
        const mapped = referentialTitleByCategoryId?.get(cid)?.trim();
        if (mapped) return mapped;
    }

    const fromGroupInfo = item.group_info?.title?.trim();
    if (fromGroupInfo) return fromGroupInfo;

    return "—";
}

const FR_PERCENT_SUFFIX = `\u202f%`;

function formatTaxRateForTable(rate: number): string {
    if (!Number.isFinite(rate)) return "";
    const roundedInt = Math.round(rate);
    if (Math.abs(rate - roundedInt) < 1e-9)
        return String(roundedInt);
    return rate.toLocaleString("fr-FR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
    });
}

function resolveTaxGroupTableLabel(item: FournitureArticle): string {
    const n = item.tax_group;
    const idx =
        typeof n === "number" && Number.isFinite(n) && n >= 1
            ? Math.floor(n) - 1
            : -1;
    const snap = item.tax_group_info;
    const ref = idx >= 0 ? REFERENCE_TAX_GROUPS[idx] : undefined;

    const title =
        snap?.title?.trim() ||
        ref?.name?.trim() ||
        (snap?.code?.trim() ? `Groupe ${snap.code.trim()}` : "") ||
        (ref?.code?.trim() ? `Groupe ${ref.code.trim()}` : "");

    let rateRaw: number | undefined;
    if (typeof snap?.rate === "number" && Number.isFinite(snap.rate)) {
        rateRaw = snap.rate;
    } else if (typeof ref?.ratePercent === "number") {
        rateRaw = ref.ratePercent;
    }

    if (!title.trim()) return "—";

    const pctStr = rateRaw !== undefined ? formatTaxRateForTable(rateRaw) : "";
    if (pctStr)
        return `${title} [${pctStr}${FR_PERCENT_SUFFIX}]`;
    return title;
}

function formatApiTimestampToDdMmYyyy(ts: string): string {
    const day = ts.slice(8, 10);
    const month = ts.slice(5, 7);
    const year = ts.slice(0, 4);
    if (
        day.length === 2 &&
        month.length === 2 &&
        year.length === 4
    ) {
        return `${day}-${month}-${year}`;
    }
    return ts.slice(0, 10).split("-").reverse().join("-") || ts;
}

function formatArticlePrice(amount: number, currencyLabel: string): string {
    const priceFmt = Number.isFinite(amount)
        ? amount.toLocaleString("fr-FR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : String(amount);

    return `${priceFmt} ${currencyLabel}`.trim();
}

export function mapFournitureToTableRow(
    item: FournitureArticle,
    referentialTitleByCategoryId?: ReadonlyMap<number, string>,
): ArticleTableRow {
    const currencyLabel = item.currency?.trim()?.toUpperCase() ?? "";

    const referential = resolveReferentialTitleForTable(
        item,
        referentialTitleByCategoryId,
    );

    return {
        navigationId: String(item.id),
        code: item.code,
        title: item.name,
        referential,
        taxGroup: resolveTaxGroupTableLabel(item),
        priceHt: formatArticlePrice(item.price_before, currencyLabel),
        priceTtc: formatArticlePrice(item.price_after, currencyLabel),
        status: mapApiArticleStatus(item.status),
        period: formatApiTimestampToDdMmYyyy(item.created_at ?? ""),
    };
}

export function mapFournitureArticleToDetailRecord(
    item: FournitureArticle
): ArticleDetailRecord {
    const devise = normalizeCurrency(item.currency || "usd");
    const special =
        typeof item.special_price === "number" &&
        Number.isFinite(item.special_price) &&
        item.special_price > 0
            ? item.special_price
            : null;

    return {
        idIkwook: String(item.id),
        title: item.name,
        description: item.description ?? "",
        groupe: apiGroupToDetailGroupe(item.group_id),
        code: item.code,
        prixHt: item.price_before,
        prixTtc: item.price_after,
        devise,
        groupeTax: numericTaxGroupToSlug(item.tax_group),
        prixSpecial: special,
        pieceUnite: apiUnitIdToPieceUnite(item.unit_id),
        unite: "",
        status: mapApiArticleStatus(item.status),
        period: item.created_at?.slice(0, 10) ?? "",
    };
}
