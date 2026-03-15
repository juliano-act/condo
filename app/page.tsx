import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { noticePriorityLabels, noticePriorityTone } from "@/lib/labels";
import { prisma } from "@/lib/prisma";

export default async function InicialPage() {
  const [areasCount, publishedNoticesCount, openMaintenanceCount, latestNotices] =
    await prisma.$transaction([
      prisma.commonArea.count({ where: { isActive: true } }),
      prisma.notice.count({ where: { isPublished: true } }),
      prisma.maintenanceRequest.count({
        where: {
          status: {
            in: ["OPEN", "IN_PROGRESS"],
          },
        },
      }),
      prisma.notice.findMany({
        where: { isPublished: true },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 3,
      }),
    ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="grid gap-8 rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-8 py-12 text-white shadow-2xl lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <Badge className="w-fit border-white/20 bg-white/10 text-white">
            Plataforma condominial pronta para producao
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Gestao de avisos, reservas e manutencoes no mesmo portal.
            </h1>
            <p className="max-w-2xl text-lg text-slate-200">
              O CondoConnect agora suporta autenticacao, banco relacional e operacao
              real das rotinas do condominio.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-white text-slate-900 hover:bg-slate-100">
              <Link href="/areascomuns">Entrar como morador</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/avisos">Ver mural publico</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <Card className="border-white/10 bg-white/10 text-white shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Areas ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{areasCount}</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/10 text-white shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Avisos publicados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{publishedNoticesCount}</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-white/10 text-white shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-200">
                Manutencoes abertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{openMaintenanceCount}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-3xl border-slate-200">
          <CardHeader>
            <CardTitle>Avisos publicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              Mural aberto para comunicados gerais, assembleias e manutencoes
              programadas.
            </p>
            <Link className="font-semibold text-slate-900 underline" href="/avisos">
              Acessar avisos
            </Link>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-slate-200">
          <CardHeader>
            <CardTitle>Reservas organizadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              Areas comuns cadastradas no banco, com conflito de horario validado
              e aprovacao administrativa.
            </p>
            <Link className="font-semibold text-slate-900 underline" href="/areascomuns">
              Reservar agora
            </Link>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-slate-200">
          <CardHeader>
            <CardTitle>Fluxo de manutencao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              Moradores abrem solicitacoes e o administrador acompanha status ate a
              conclusao.
            </p>
            <Link className="font-semibold text-slate-900 underline" href="/manutencoes">
              Abrir solicitacao
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Ultimos avisos</h2>
            <p className="text-sm text-slate-600">
              O administrador publica avisos no painel e eles aparecem aqui e no mural.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/login">Painel administrativo</Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {latestNotices.map((notice) => (
            <Card key={notice.id} className="rounded-3xl border-slate-200">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-2">
                    <Badge className={noticePriorityTone[notice.priority]}>
                      {noticePriorityLabels[notice.priority]}
                    </Badge>
                    <h3 className="text-xl font-semibold text-slate-900">{notice.title}</h3>
                  </div>
                  <span className="text-sm text-slate-500">
                    {formatDate(notice.publishedAt ?? notice.createdAt)}
                  </span>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-slate-600">
                  {notice.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
