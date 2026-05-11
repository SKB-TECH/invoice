"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";

import { Button } from "@/components/ui/button";

type VisualiserArticleActionsProps = {
  listPath?: string;
  modifierPath: string;
};

export function VisualiserArticleActions({
  listPath = "/home/articles",
  modifierPath,
}: VisualiserArticleActionsProps) {
  const router = useRouter();
  const t = useTranslations("articles.view.actions");

  return (
    <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 md:flex-row md:flex-wrap md:justify-end">
      <Button
        type="button"
        variant="secondary"
        onClick={() => router.push(listPath)}
        className="h-12 w-52 cursor-pointer rounded-none bg-[#949B9F] px-5 text-white hover:bg-[#949B9F]/80"
      >
        {t("backToList")}
      </Button>
      <Button
        type="button"
        onClick={() => router.push(modifierPath)}
        className="h-12 w-52 cursor-pointer rounded-none bg-[#0879bd] px-5 text-white shadow-none hover:bg-[#066aa8]"
      >
        {t("edit")}
      </Button>
    </div>
  );
}
