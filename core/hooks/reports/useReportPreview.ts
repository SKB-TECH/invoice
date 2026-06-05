"use client";

import { useCallback, useState } from "react";

import { downloadBlob } from "@/core/utils/downloadBlob";
import type { ReportBlobResult, ReportPreviewDisplay } from "@/core/types/reports";
import { buildReportPdfBlob } from "@/lib/reports/build-report-pdf";

export function useReportPreview() {
    const [preview, setPreview] = useState<ReportBlobResult | null>(null);

    const applyPreview = useCallback((result: ReportBlobResult) => {
        setPreview(result);
    }, []);

    const clearPreview = useCallback(() => {
        setPreview(null);
    }, []);

    const downloadPreview = useCallback(async () => {
        if (!preview) return;

        const pdfBlob = await buildReportPdfBlob(preview.display);
        downloadBlob(pdfBlob, preview.filename);
    }, [preview]);

    const previewDisplay: ReportPreviewDisplay | null =
        preview?.display ?? null;

    const isShowingPreview = preview !== null;

    return {
        previewDisplay,
        isShowingPreview,
        applyPreview,
        clearPreview,
        downloadPreview,
    };
}
