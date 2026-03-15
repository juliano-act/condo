import Link from "next/link";

import { Role } from "@prisma/client";
import { AlertTriangle, Bell, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { noticePriorityLabels, noticePriorityTone } from "@/lib/labels";
import { prisma } from "@/lib/prisma";

export default async function AvisosPage() {
  const [user, notices] = await Promise.all([
    getCurrentUser(),
    prisma.notice.findMany({
      where: { isPublished: true },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Bell className="text-[#455a64]" />
            <Badge className="bg-slate-900 text-white">Publico</Badge>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mural de avisos</h1>
            <p className="text-slate-600">
              Comunicados oficiais do condominio visiveis para qualquer visitante.
            </p>
          </div>
        </div>

        {user?.role === Role.ADMIN ? (
          <Button asChild variant="outline">
            <Link href="/admin">Gerenciar avisos</Link>
          </Button>
        ) : null}
      </header>

      <div className="space-y-5">
        {notices.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-slate-300">
            <CardContent className="p-8 text-center text-slate-600">
              Nenhum aviso publicado ate o momento.
            </CardContent>
          </Card>
        ) : null}

        {notices.map((notice) => (
          <Card key={notice.id} className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {notice.priority === "URGENT" ? (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Info className="h-5 w-5 text-[#455a64]" />
                    )}
                    <Badge className={noticePriorityTone[notice.priority]}>
                      {noticePriorityLabels[notice.priority]}
                    </Badge>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">{notice.title}</h2>
                    <p className="text-sm text-slate-500">
                      Publicado em {formatDate(notice.publishedAt ?? notice.createdAt)}
                      {notice.author ? ` por ${notice.author.name}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              <p className="max-w-4xl text-sm leading-7 text-slate-700">{notice.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
