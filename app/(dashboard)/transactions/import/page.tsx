import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/supabase/categories";
import { ImportClient } from "@/components/transactions/import/import-client";

export default async function ImportPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const categories = await getCategories(supabase, user.id);

  return <ImportClient categories={categories} />;
}
