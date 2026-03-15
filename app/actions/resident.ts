"use server";

import { ReservationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import {
  getString,
  parseDateTimeLocal,
} from "@/lib/forms";
import { prisma } from "@/lib/prisma";

const reservationSchema = z.object({
  areaId: z.string().trim().min(1),
  startAt: z.string().trim().min(1),
  endAt: z.string().trim().min(1),
  notes: z.string().trim().max(240).optional(),
});

const maintenanceSchema = z.object({
  title: z.string().trim().min(4).max(80),
  location: z.string().trim().min(3).max(80),
  description: z.string().trim().min(12).max(1000),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export async function createReservationAction(formData: FormData) {
  const user = await requireUser();

  const parsed = reservationSchema.safeParse({
    areaId: getString(formData, "areaId"),
    startAt: getString(formData, "startAt"),
    endAt: getString(formData, "endAt"),
    notes: getString(formData, "notes") || undefined,
  });

  if (!parsed.success) {
    redirect("/areascomuns?error=reserva-invalida");
  }

  const startAt = parseDateTimeLocal(parsed.data.startAt);
  const endAt = parseDateTimeLocal(parsed.data.endAt);

  if (!startAt || !endAt || endAt <= startAt || startAt <= new Date()) {
    redirect("/areascomuns?error=horario-invalido");
  }

  const area = await prisma.commonArea.findUnique({
    where: { id: parsed.data.areaId },
    select: { id: true, isActive: true },
  });

  if (!area?.isActive) {
    redirect("/areascomuns?error=area-indisponivel");
  }

  const overlappingReservation = await prisma.reservation.findFirst({
    where: {
      areaId: parsed.data.areaId,
      status: {
        in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
      },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
    select: { id: true },
  });

  if (overlappingReservation) {
    redirect("/areascomuns?error=conflito-horario");
  }

  await prisma.reservation.create({
    data: {
      areaId: parsed.data.areaId,
      userId: user.id,
      startAt,
      endAt,
      notes: parsed.data.notes,
    },
  });

  revalidatePath("/areascomuns");
  revalidatePath("/admin");
  redirect("/areascomuns?success=reserva-enviada");
}

export async function createMaintenanceRequestAction(formData: FormData) {
  const user = await requireUser();

  const parsed = maintenanceSchema.safeParse({
    title: getString(formData, "title"),
    location: getString(formData, "location"),
    description: getString(formData, "description"),
    priority: getString(formData, "priority"),
  });

  if (!parsed.success) {
    redirect("/manutencoes?error=solicitacao-invalida");
  }

  await prisma.maintenanceRequest.create({
    data: {
      title: parsed.data.title,
      location: parsed.data.location,
      description: parsed.data.description,
      priority: parsed.data.priority,
      userId: user.id,
    },
  });

  revalidatePath("/manutencoes");
  revalidatePath("/admin");
  redirect("/manutencoes?success=solicitacao-enviada");
}
