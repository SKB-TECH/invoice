export const REPORT_A_TABLE_GRID_CLASS =
    "grid min-w-[1120px] grid-cols-[88px_minmax(160px,1fr)_120px_52px_150px_180px_160px]";

export const REPORT_A_PDF_CONTENT_WIDTH_PT = 535;

export const REPORT_A_TABLE_PT = {
    code: 36,
    designation: 145,
    unitPrice: 52,
    tax: 20,
    qtySold: 86,
    qtyReturned: 108,
    fiscalStock: 88,
} as const;

export const REPORT_A_TABLE_TOTAL_LABEL_WIDTH_PT =
    REPORT_A_TABLE_PT.code +
    REPORT_A_TABLE_PT.designation +
    REPORT_A_TABLE_PT.unitPrice +
    REPORT_A_TABLE_PT.tax;
