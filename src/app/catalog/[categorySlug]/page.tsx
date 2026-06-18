import { redirect } from "next/navigation";

export default async function CategoryRedirect({ params }: { params: Promise<{ categorySlug: string }> }) {
  const { categorySlug } = await params;
  redirect(`/catalog?category=${categorySlug}`);
}
