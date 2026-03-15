import Link from "next/link";

import { loginAction } from "@/app/actions/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireGuest } from "@/lib/auth";
import { AppSearchParams, readSearchParam } from "@/lib/page";

const loginErrors: Record<string, string> = {
  "dados-invalidos": "Preencha email valido e senha com pelo menos 8 caracteres.",
  "credenciais-invalidas": "Email ou senha incorretos.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: AppSearchParams;
}) {
  await requireGuest();

  const params = searchParams ? await searchParams : {};
  const error = readSearchParam(params, "error");
  const redirectTo = readSearchParam(params, "redirectTo");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-2xl">
        <CardHeader className="space-y-4 pt-8 text-center">
          <Badge className="mx-auto bg-slate-900 text-white">Acesso ao portal</Badge>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Entrar no CondoConnect
            </CardTitle>
            <CardDescription className="text-balance text-slate-500">
              Use sua conta de morador ou administrador para acessar o portal.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 px-8">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loginErrors[error] ?? "Nao foi possivel entrar. Tente novamente."}
            </div>
          ) : null}

          <form action={loginAction} className="space-y-4">
            <input name="redirectTo" type="hidden" value={redirectTo ?? "/areascomuns"} />

            <div className="grid gap-2 text-left">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                className="bg-white"
                required
              />
            </div>
            <div className="grid gap-2 text-left">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Digite sua senha"
                className="bg-white"
                required
              />
            </div>
            <Button className="w-full bg-[#455a64] text-white hover:bg-[#36454c]">
              Entrar
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t bg-slate-50/60 py-6 text-center">
          <p className="text-sm text-slate-600">
            Nao tem conta?{" "}
            <Link className="font-semibold text-slate-900 hover:underline" href="/register">
              Crie seu acesso
            </Link>
          </p>
          <p className="text-xs text-slate-500">
            Seed padrao: <code>admin@condoconnect.local</code> / <code>Admin12345!</code>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
