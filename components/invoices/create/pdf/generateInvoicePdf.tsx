import { pdf } from "@react-pdf/renderer";

import { InvoiceTemplateAPdf } from "./InvoiceTemplateAPdf";
import { InvoiceTemplateBPdf } from "./InvoiceTemplateBPdf";

import type { InvoiceForm, InvoiceItem } from "../types";
import { getTaxGroups } from "../utils";

type GenerateInvoicePdfParams = {
    form: InvoiceForm;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    taxGroups: ReturnType<typeof getTaxGroups>;
};

export async function generateInvoicePdf({
                                             form,
                                             items,
                                             subtotal,
                                             tax,
                                             total,
                                             taxGroups,
                                         }: GenerateInvoicePdfParams): Promise<File> {
    const document =
        form.templateId === 2 ? (
            <InvoiceTemplateBPdf
                form={form}
                items={items}
                subtotal={subtotal}
                tax={tax}
                total={total}
                taxGroups={taxGroups}
            />
        ) : (
            <InvoiceTemplateAPdf
                form={form}
                items={items}
                subtotal={subtotal}
                tax={tax}
                total={total}
                taxGroups={taxGroups}
            />
        );

    const blob = await pdf(document).toBlob();

    const templateName =
        form.templateId === 2 ? "template-b" : "template-a";

    return new File(
        [blob],
        `facture-${templateName}-${Date.now()}.pdf`,
        {
            type: "application/pdf",
        }
    );
}
