import Link from "next/link";

import { Role } from "@prisma/client";

import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link className="text-2xl font-bold tracking-tight text-slate-900" href="/">
            Condo<span className="text-[#455a64]">Connect</span>
          </Link>

          <ul className="flex flex-wrap items-center gap-5 text-sm font-medium text-slate-600">
            <li>
              <Link className="transition-colors hover:text-slate-900" href="/avisos">
                Avisos
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-slate-900" href="/areascomuns">
                Areas comuns
              </Link>
            </li>
            <li>
              <Link className="transition-colors hover:text-slate-900" href="/manutencoes">
                Manutencoes
              </Link>
            </li>
            {user?.role === Role.ADMIN ? (
              <li>
                <Link className="transition-colors hover:text-slate-900" href="/admin">
                  Administracao
                </Link>
              </li>
            ) : null}
          </ul>
        </div>

        {user ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">
                {user.unit ?? (user.role === Role.ADMIN ? "Administrador" : "Morador")}
              </p>
            </div>
            <form action={logoutAction}>
              <Button variant="outline" type="submit">
                Sair
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-[#455a64] hover:bg-[#36454c]">
              <Link href="/register">Criar conta</Link>
            </Button>
          </div>
        )}
      </nav>
    </header>
  );
}
