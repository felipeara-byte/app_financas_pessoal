import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wallet className="size-4" />
            </span>
            <span>Finanças</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/login">Entrar</Link>}
            />
            <Button
              nativeButton={false}
              render={<Link href="/signup">Criar conta</Link>}
            />
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} Finanças. Todos os direitos reservados.</p>
          <p>Feito com Next.js, Supabase e shadcn/ui.</p>
        </div>
      </footer>
    </div>
  );
}
