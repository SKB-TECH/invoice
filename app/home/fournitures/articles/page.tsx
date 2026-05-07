"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, House } from "lucide-react";
import { ArticlesTable } from "@/components/fournitures/articles/articles-table";
import { Button } from "@/components/ui/button";
import { demoArticles } from "@/core/data/articles-demo";

export default function HomeFournituresArticlesPage() {
  const router = useRouter();

  return (
    <div className="w-full min-w-full space-y-6">
      <span className="flex items-center gap-1 text-sm text-slate-500">
        <Link href="/home">
          <House className="size-4" />
        </Link>
        <ChevronRight className="size-4" />
        Articles
      </span>

      <div className="flex w-full min-w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-bold text-slate-800">Articles</h1>
        <Button
          type="button"
          onClick={() => {
            router.push("/home/fournitures/articles/nouveau");
          }}
          className="h-9 shrink-0 rounded-none! bg-[#0879bd] px-4 text-sm font-medium text-white hover:bg-[#0879bd]/90"
        >
          Nouvel article
        </Button>
      </div>

      <div className="w-full min-w-full">
        <ArticlesTable rows={demoArticles} className="w-full" />
      </div>
    </div>
  );
}
