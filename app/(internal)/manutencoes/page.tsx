import { createMaintenanceRequestAction } from "@/app/actions/resident";
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
  maintenancePriorityLabels,
  maintenancePriorityTone,
  maintenanceStatusLabels,
  maintenanceStatusTone,
} from "@/lib/labels";
import { AppSearchParams, readSearchParam } from "@/lib/page";
import { prisma } from "@/lib/prisma";

const maintenanceErrors: Record<string, string> = {
  "solicitacao-invalida": "Preencha titulo, local, prioridade e descricao corretamente.",
};

const maintenanceSuccess: Record<string, string> = {
  "solicitacao-enviada": "Solicitacao registrada com sucesso.",
};

export default async function ManutencoesPage({
  searchParams,
}: {
  searchParams?: AppSearchParams;
}) {
  const user = await requireUser();
  const params = searchParams ? await searchParams : {};
  const error = readSearchParam(params, "error");
  const success = readSearchParam(params, "success");

  const requests = await prisma.maintenanceRequest.findMany({
    where: { userId: user.id },
    orderBy: [{ createdAt: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="h-fit rounded-3xl border-slate-200 shadow-lg">
        <CardHeader className="rounded-t-3xl bg-[#455a64] text-white">
          <Badge className="w-fit border-white/20 bg-white/10 text-white">
            Acesso autenticado
          </Badge>
          <CardTitle className="text-2xl">Solicitar manutencao</CardTitle>
          <CardDescription className="text-slate-200">
            Relate problemas em areas comuns ou no seu bloco. A equipe administrativa
            acompanha os status pelo painel.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 p-8">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {maintenanceErrors[error] ?? "Nao foi possivel registrar a solicitacao."}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {maintenanceSuccess[success] ?? "Solicitacao registrada."}
            </div>
          ) : null}

          <form action={createMaintenanceRequestAction} className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="title">Titulo</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ex: Vazamento no corredor"
                className="bg-white"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                name="location"
                placeholder={user.unit ? `Ex: ${user.unit}` : "Ex: Bloco B - corredor do 4o andar"}
                className="bg-white"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Prioridade</Label>
              <select
                id="priority"
                name="priority"
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                defaultValue="MEDIUM"
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descricao do problema</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Explique o que ocorreu, quando comecou e se existe risco imediato."
                className="min-h-[140px] resize-none bg-white"
                required
              />
            </div>

            <Button className="w-full bg-[#455a64] text-white hover:bg-[#36454c]">
              Enviar solicitacao
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200">
        <CardHeader>
          <CardTitle>Historico de solicitacoes</CardTitle>
          <CardDescription>
            Acompanhe o andamento das manutencoes abertas por {user.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-sm text-slate-500">
              Nenhuma solicitacao registrada ainda.
            </p>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{request.title}</h2>
                    <p className="text-sm text-slate-500">{request.location}</p>
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

                <p className="mt-4 text-sm leading-6 text-slate-700">{request.description}</p>
                <p className="mt-4 text-xs text-slate-500">
                  Aberta em {formatDateTime(request.createdAt)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
