import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          O formulário de login será conectado ao Supabase Auth em breve.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button disabled className="w-full">
          Entrar (em breve)
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Ainda não tem conta?{" "}
          <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            Criar conta
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
