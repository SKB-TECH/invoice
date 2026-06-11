import { ModifierArticleClient } from "@/components/articles/modifier-article-client";

type PageProps = {
  params: Promise<{ articleId: string }>;
};

export default async function ModifierArticlePage({ params }: PageProps) {
  const { articleId } = await params;
  return <ModifierArticleClient articleId={articleId} />;
}
