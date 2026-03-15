import { ReservationStatus } from "@prisma/client";

import { createReservationAction } from "@/app/actions/resident";
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
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import {
  reservationStatusLabels,
  reservationStatusTone,
} from "@/lib/labels";
import { AppSearchParams, readSearchParam } from "@/lib/page";
import { prisma } from "@/lib/prisma";

const areaErrors: Record<string, string> = {
  "reserva-invalida": "Preencha a reserva com horario inicial e final validos.",
  "horario-invalido": "Escolha um horario futuro e com termino posterior ao inicio.",
  "area-indisponivel": "A area selecionada nao esta ativa no momento.",
  "conflito-horario": "Ja existe outra reserva pendente ou confirmada nesse horario.",
};

const areaSuccess: Record<string, string> = {
  "cadastro-concluido": "Conta criada com sucesso. Agora voce ja pode reservar.",
  "reserva-enviada": "Reserva enviada para validacao da administracao.",
};

export default async function AreasComunsPage({
  searchParams,
}: {
  searchParams?: AppSearchParams;
}) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : {};
  const error = readSearchParam(params, "error");
  const success = readSearchParam(params, "success");

  const [areas, myReservations] = await prisma.$transaction([
    prisma.commonArea.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        reservations: {
          where: {
            startAt: {
              gte: new Date(),
            },
            status: {
              in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
            },
          },
          orderBy: { startAt: "asc" },
          take: 3,
          include: {
            user: {
              select: {
                name: true,
                unit: true,
              },
            },
          },
        },
      },
    }),
    prisma.reservation.findMany({
      where: { userId: user.id },
      orderBy: [{ startAt: "desc" }, { createdAt: "desc" }],
      include: {
        area: {
          select: { name: true },
        },
      },
      take: 10,
    }),
  ]);

  return (
    <section className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-3">
        <Badge className="w-fit bg-[#455a64] text-white">Acesso autenticado</Badge>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Areas comuns</h1>
          <p className="text-slate-600">
            Reserve espacos do condominio com validacao de conflito e aprovacao
            administrativa.
          </p>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {areaErrors[error] ?? "Nao foi possivel concluir a reserva."}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {areaSuccess[success] ?? "Operacao concluida com sucesso."}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-6">
          {areas.map((area) => (
            <Card key={area.id} className="rounded-3xl border-slate-200">
              <CardHeader className="gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl text-slate-900">{area.name}</CardTitle>
                    <CardDescription className="text-sm text-slate-500">
                      {area.location ? `${area.location} · ` : ""}
                      Capacidade para {area.capacity} pessoas
                    </CardDescription>
                  </div>
                  <Badge variant="info">Reserva sujeita a aprovacao</Badge>
                </div>
                <p className="text-sm leading-6 text-slate-700">{area.description}</p>
                {area.rules ? (
                  <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                    <strong>Regras:</strong> {area.rules}
                  </p>
                ) : null}
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900">Proximas reservas</h3>
                  {area.reservations.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Nenhuma reserva pendente ou confirmada para os proximos dias.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {area.reservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">
                              {reservation.user.name}
                              {reservation.user.unit ? ` · ${reservation.user.unit}` : ""}
                            </p>
                            <Badge className={reservationStatusTone[reservation.status]}>
                              {reservationStatusLabels[reservation.status]}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">
                            {formatDateTime(reservation.startAt)} ate{" "}
                            {formatDateTime(reservation.endAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <form action={createReservationAction} className="space-y-4 rounded-3xl bg-slate-50 p-5">
                  <input name="areaId" type="hidden" value={area.id} />
                  <div>
                    <h3 className="font-semibold text-slate-900">Solicitar reserva</h3>
                    <p className="text-sm text-slate-500">
                      Sua solicitacao sera registrada com o seu usuario.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`startAt-${area.id}`}>Inicio</Label>
                    <Input id={`startAt-${area.id}`} name="startAt" type="datetime-local" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`endAt-${area.id}`}>Fim</Label>
                    <Input id={`endAt-${area.id}`} name="endAt" type="datetime-local" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`notes-${area.id}`}>Observacoes</Label>
                    <Textarea
                      id={`notes-${area.id}`}
                      name="notes"
                      placeholder="Ex: aniversario com 20 convidados."
                    />
                  </div>
                  <Button className="w-full bg-[#455a64] text-white hover:bg-[#36454c]">
                    Solicitar reserva
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit rounded-3xl border-slate-200">
          <CardHeader>
            <CardTitle>Minhas reservas</CardTitle>
            <CardDescription>
              Ultimas solicitacoes feitas por {user.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myReservations.length === 0 ? (
              <p className="text-sm text-slate-500">
                Voce ainda nao enviou nenhuma reserva.
              </p>
            ) : (
              myReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{reservation.area.name}</p>
                    <Badge className={reservationStatusTone[reservation.status]}>
                      {reservationStatusLabels[reservation.status]}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {formatDateTime(reservation.startAt)} ate{" "}
                    {formatDateTime(reservation.endAt)}
                  </p>
                  {reservation.notes ? (
                    <p className="mt-2 text-sm text-slate-500">{reservation.notes}</p>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
