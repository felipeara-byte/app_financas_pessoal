import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories, splitByType } from "@/lib/supabase/categories";
import { CategoriesClient } from "@/components/categories/categories-client";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const categories = await getCategories(supabase, user.id);
  const { income, expense } = splitByType(categories);

  return <CategoriesClient income={income} expense={expense} />;
}
