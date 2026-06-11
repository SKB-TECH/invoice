import Link from "next/link";
import { ChevronRight, House } from "lucide-react";

import { ContratForm } from "@/components/contrats/contrat-form";
import { useTranslations } from "next-intl";

export default function NouveauContratPage() {
  const t = useTranslations("contrats.createContrat");
  return (
    <main className="mx-auto w-full min-w-full text-foreground">
      <span className="mb-6 flex items-center gap-1 text-sm text-slate-500">
        <Link href="/home">
          <House className="size-4" />
        </Link>
        <ChevronRight className="size-4" />
        <Link href="/home/contrats" className="hover:text-slate-700">
          {t("breadcrumb.Step1")}
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-slate-800">{t("breadcrumb.Step2")}</span>
      </span>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
        {t("title")}
      </h1>

      <ContratForm variant="create" cancelHref="/home/contrats" />
    </main>
  );
}
