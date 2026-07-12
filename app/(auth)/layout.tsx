import Link from "next/link";
import { Wallet } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-secondary/30 px-4 py-16">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 font-semibold"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Wallet className="size-4" />
        </span>
        <span>Finanças</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
