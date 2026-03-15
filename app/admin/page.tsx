import {
  MaintenanceStatus,
  NoticePriority,
  ReservationStatus,
} from "@prisma/client";

import {
  createCommonAreaAction,
  createNoticeAction,
  updateMaintenanceStatusAction,
  updateReservationStatusAction,
} from "@/app/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import {
  maintenancePriorityLabels,
  maintenancePriorityTone,
  maintenanceStatusLabels,
  maintenanceStatusTone,
  noticePriorityLabels,
  noticePriorityTone,
  reservationStatusLabels,
  reservationStatusTone,
} from "@/lib/labels";
import { AppSearchParams, readSearchParam } from "@/lib/page";
import { prisma } from "@/lib/prisma";

const adminErrors: Record<string, string> = {
  "aviso-invalido": "Nao foi possivel publicar o aviso.",
  "area-invalida": "Revise os dados da area comum.",
  "area-ja-cadastrada": "Ja existe uma area com esse nome.",
  "status-reserva-invalido": "Status da reserva invalido.",
  "status-manutencao-invalido": "Status da manutencao invalido.",
};

const adminSuccess: Record<string, string> = {
  "aviso-criado": "Aviso publicado com sucesso.",
  "area-criada": "Area comum cadastrada com sucesso.",
  "reserva-atualizada": "Status da reserva atualizado.",
  "manutencao-atualizada": "Status da manutencao atualizado.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: AppSearchParams;
}) {
  const user = await requireAdmin();
  const params = searchParams ? await searchParams : {};
  const error = readSearchParam(params, "error");
  const success = readSearchParam(params, "success");

  const [notices, areas, reservations, maintenanceRequests] = await prisma.$transaction([
    prisma.notice.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 5,
    }),
    prisma.commonArea.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.reservation.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: {
        area: { select: { name: true } },
        user: { select: { name: true, unit: true } },
      },
      take: 12,
    }),
    prisma.maintenanceRequest.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: {
        user: { select: { name: true, unit: true } },
      },
      take: 12,
    }),
  ]);

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <Badge className="w-fit bg-slate-900 text-white">Painel administrativo</Badge>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Administracao do condominio</h1>
          <p className="text-slate-600">
            Operacao autenticada por {user.name}. Publique avisos, cadastre areas e
            acompanhe filas de reserva e manutencao.
          </p>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {adminErrors[error] ?? "Nao foi possivel concluir a operacao."}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {adminSuccess[success] ?? "Operacao concluida com sucesso."}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-slate-200">
          <CardHeader>
            <CardTitle>Publicar aviso</CardTitle>
            <CardDescription>
              Os avisos publicados aparecem na home e em /avisos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createNoticeAction} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="notice-title">Titulo</Label>
                <Input id="notice-title" name="title" placeholder="Ex: Interdicao da piscina" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notice-priority">Prioridade</Label>
                <select
                  id="notice-priority"
                  name="priority"
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                  defaultValue={NoticePriority.INFO}
                >
                  <option value={NoticePriority.INFO}>Informativo</option>
                  <option value={NoticePriority.WARNING}>Atencao</option>
                  <option value={NoticePriority.URGENT}>Urgente</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notice-content">Conteudo</Label>
                <Textarea
                  id="notice-content"
                  name="content"
                  className="min-h-[140px] resize-none"
                  placeholder="Descreva o comunicado para os moradores."
                  required
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input defaultChecked name="isPublished" type="checkbox" />
                Publicar imediatamente
              </label>
              <Button className="bg-[#455a64] text-white hover:bg-[#36454c]">
                Salvar aviso
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200">
          <CardHeader>
            <CardTitle>Cadastrar area comum</CardTitle>
            <CardDescription>
              Areas ativas ficam disponiveis para reserva no portal do morador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCommonAreaAction} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="area-name">Nome</Label>
                <Input id="area-name" name="name" placeholder="Ex: Quadra Poliesportiva" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="area-location">Localizacao</Label>
                <Input id="area-location" name="location" placeholder="Ex: Bloco C" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="area-capacity">Capacidade</Label>
                <Input id="area-capacity" name="capacity" type="number" min="1" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="area-description">Descricao</Label>
                <Textarea
                  id="area-description"
                  name="description"
                  className="min-h-[100px] resize-none"
                  placeholder="Equipamentos disponiveis, horarios e orientacoes."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="area-rules">Regras</Label>
                <Textarea
                  id="area-rules"
                  name="rules"
                  className="min-h-[100px] resize-none"
                  placeholder="Ex: antecedencia minima, horario limite, limpeza."
                />
              </div>
              <Button className="bg-[#455a64] text-white hover:bg-[#36454c]">
                Cadastrar area
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="rounded-3xl border-slate-200">
          <CardHeader>
            <CardTitle>Resumo rapido</CardTitle>
            <CardDescription>Ultimos cadastros e publicacoes do sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Avisos recentes
              </h2>
              {notices.map((notice) => (
                <div key={notice.id} className="rounded-2xl border border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{notice.title}</p>
                    <Badge className={noticePriorityTone[notice.priority]}>
                      {noticePriorityLabels[notice.priority]}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDateTime(notice.createdAt)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Areas cadastradas
              </h2>
              {areas.map((area) => (
                <div key={area.id} className="rounded-2xl border border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{area.name}</p>
                    <Badge variant="info">{area.capacity} pessoas</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{area.location ?? "Sem localizacao"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="rounded-3xl border-slate-200">
            <CardHeader>
              <CardTitle>Fila de reservas</CardTitle>
              <CardDescription>
                Confirme, recuse ou cancele as solicitacoes de areas comuns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reservations.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhuma reserva registrada.</p>
              ) : (
                reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-slate-900">
                          {reservation.area.name}
                        </h2>
                        <p className="text-sm text-slate-500">
                          {reservation.user.name}
                          {reservation.user.unit ? ` · ${reservation.user.unit}` : ""}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                          {formatDateTime(reservation.startAt)} ate{" "}
                          {formatDateTime(reservation.endAt)}
                        </p>
                      </div>
                      <Badge className={reservationStatusTone[reservation.status]}>
                        {reservationStatusLabels[reservation.status]}
                      </Badge>
                    </div>
                    {reservation.notes ? (
                      <p className="mt-3 text-sm text-slate-600">{reservation.notes}</p>
                    ) : null}
                    <form action={updateReservationStatusAction} className="mt-4 flex flex-wrap gap-2">
                      <input name="reservationId" type="hidden" value={reservation.id} />
                      <Button
                        name="status"
                        type="submit"
                        value={ReservationStatus.CONFIRMED}
                        variant="outline"
                      >
                        Confirmar
                      </Button>
                      <Button
                        name="status"
                        type="submit"
                        value={ReservationStatus.REJECTED}
                        variant="outline"
                      >
                        Recusar
                      </Button>
                      <Button
                        name="status"
                        type="submit"
                        value={ReservationStatus.CANCELLED}
                        variant="outline"
                      >
                        Cancelar
                      </Button>
                    </form>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200">
            <CardHeader>
              <CardTitle>Fila de manutencoes</CardTitle>
              <CardDescription>
                Atualize o andamento das solicitacoes recebidas dos moradores.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {maintenanceRequests.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Nenhuma solicitacao de manutencao registrada.
                </p>
              ) : (
                maintenanceRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-slate-900">{request.title}</h2>
                        <p className="text-sm text-slate-500">
                          {request.user.name}
                          {request.user.unit ? ` · ${request.user.unit}` : ""}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">{request.location}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={maintenancePriorityTone[request.priority]}>
                          {maintenancePriorityLabels[request.priority]}
                        </Badge>
                        <Badge className={maintenanceStatusTone[request.status]}>
                          {maintenanceStatusLabels[request.status]}
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{request.description}</p>
                    <p className="mt-3 text-xs text-slate-500">
                      Aberta em {formatDateTime(request.createdAt)}
                    </p>
                    <form action={updateMaintenanceStatusAction} className="mt-4 flex flex-wrap gap-2">
                      <input name="maintenanceId" type="hidden" value={request.id} />
                      <Button
                        name="status"
                        type="submit"
                        value={MaintenanceStatus.OPEN}
                        variant="outline"
                      >
                        Aberta
                      </Button>
                      <Button
                        name="status"
                        type="submit"
                        value={MaintenanceStatus.IN_PROGRESS}
                        variant="outline"
                      >
                        Em andamento
                      </Button>
                      <Button
                        name="status"
                        type="submit"
                        value={MaintenanceStatus.DONE}
                        variant="outline"
                      >
                        Concluida
                      </Button>
                      <Button
                        name="status"
                        type="submit"
                        value={MaintenanceStatus.CANCELLED}
                        variant="outline"
                      >
                        Cancelada
                      </Button>
                    </form>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
