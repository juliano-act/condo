import Link from "next/link";

import { registerAction } from "@/app/actions/auth";
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

const registerErrors: Record<string, string> = {
  "dados-invalidos": "Preencha nome, email e senha com os formatos esperados.",
  "email-em-uso": "Ja existe uma conta com esse email.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams?: AppSearchParams;
}) {
  await requireGuest();

  const params = searchParams ? await searchParams : {};
  const error = readSearchParam(params, "error");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 p-4">
      <Card className="w-full max-w-lg border-slate-200 shadow-2xl">
        <CardHeader className="space-y-4 pt-8 text-center">
          <Badge className="mx-auto bg-[#455a64] text-white">Cadastro de morador</Badge>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              Criar acesso ao portal
            </CardTitle>
            <CardDescription className="text-balance text-slate-500">
              O cadastro cria uma conta de morador e libera reservas e solicitacoes.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 px-8">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {registerErrors[error] ?? "Nao foi possivel concluir o cadastro."}
            </div>
          ) : null}

          <form action={registerAction} className="space-y-4">
            <div className="grid gap-2 text-left">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Ex: Juliano Freitas"
                className="bg-white"
                required
              />
            </div>
            <div className="grid gap-2 text-left">
              <Label htmlFor="unit">Bloco / apartamento</Label>
              <Input
                id="unit"
                name="unit"
                type="text"
                placeholder="Ex: Bloco B - 402"
                className="bg-white"
              />
            </div>
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
                placeholder="Minimo de 8 caracteres"
                className="bg-white"
                required
              />
            </div>
            <Button className="w-full bg-[#455a64] text-white hover:bg-[#36454c]">
              Criar conta
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 border-t bg-slate-50/60 py-6 text-center">
          <p className="text-sm text-slate-600">
            Ja possui conta?{" "}
            <Link className="font-semibold text-slate-900 hover:underline" href="/login">
              Entrar agora
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
