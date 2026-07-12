"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignupState = { error: string | null; success: boolean };

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha.", success: false };
  }

  if (password.length < 6) {
    return {
      error: "A senha precisa ter no mínimo 6 caracteres.",
      success: false,
    };
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message, success: false };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return { error: null, success: true };
}
