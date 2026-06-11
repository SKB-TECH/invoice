import { ArticleVisualiserClient } from "@/components/articles/article-visualiser-client";

type PageProps = {
  params: Promise<{ articleId: string }>;
};

export default async function VisualiserArticlePage({ params }: PageProps) {
  const { articleId } = await params;
  return <ArticleVisualiserClient articleId={articleId} />;
}
