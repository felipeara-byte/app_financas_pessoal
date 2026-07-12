import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LayoutDashboard,
  ListChecks,
  PieChart,
  FileDown,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard consolidado",
    description:
      "Veja receitas, despesas e saldo do mês em cards simples e diretos.",
  },
  {
    icon: PieChart,
    title: "Gráfico por categoria",
    description:
      "Entenda para onde vai seu dinheiro com um gráfico de pizza por categoria.",
  },
  {
    icon: ListChecks,
    title: "Controle de transações",
    description:
      "Cadastre, edite e exclua receitas e despesas com poucos cliques.",
  },
  {
    icon: FileDown,
    title: "Exportação em CSV",
    description:
      "Exporte suas transações filtradas para planilhas quando precisar.",
  },
  {
    icon: ShieldCheck,
    title: "Seus dados são só seus",
    description:
      "Autenticação segura e isolamento de dados por usuário via Supabase.",
  },
  {
    icon: Smartphone,
    title: "Funciona em qualquer lugar",
    description: "Layout responsivo para acompanhar as finanças do celular.",
  },
];

export default function LandingPage() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <span className="inline-flex items-center rounded-full border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          Organize sua vida financeira
        </span>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-balance sm:text-6xl">
          Suas finanças, claras e sob controle
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-balance">
          Chega de planilhas soltas e extratos espalhados. Registre receitas e
          despesas, acompanhe um dashboard visual e tome decisões melhores
          sobre o seu dinheiro.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/signup">Começar agora, é grátis</Link>}
          />
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/login">Já tenho conta</Link>}
          />
        </div>
      </section>

      <section className="border-t bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Tudo que você precisa para organizar seu dinheiro
            </h2>
            <p className="mt-3 text-muted-foreground">
              Simples o suficiente para o dia a dia, completo o bastante para
              o seu planejamento.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="size-5" />
                  </span>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Card className="mx-auto max-w-3xl border-primary/20 bg-primary/5 text-center">
          <CardHeader>
            <CardTitle className="text-2xl">
              Pronto para organizar suas finanças?
            </CardTitle>
            <CardDescription>
              Crie sua conta gratuita em menos de um minuto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/signup">Criar conta grátis</Link>}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
