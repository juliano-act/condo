"use server";

import {
  MaintenanceStatus,
  NoticePriority,
  ReservationStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { getBoolean, getString } from "@/lib/forms";
import { prisma } from "@/lib/prisma";

const noticeSchema = z.object({
  title: z.string().trim().min(4).max(120),
  content: z.string().trim().min(12).max(2000),
  priority: z.nativeEnum(NoticePriority),
  isPublished: z.boolean(),
});

const commonAreaSchema = z.object({
  name: z.string().trim().min(3).max(80),
  location: z.string().trim().max(80).optional(),
  capacity: z.coerce.number().int().min(1).max(500),
  description: z.string().trim().min(12).max(1000),
  rules: z.string().trim().max(1000).optional(),
});

const reservationStatusSchema = z.object({
  reservationId: z.string().trim().min(1),
  status: z.enum(["CONFIRMED", "REJECTED", "CANCELLED"]),
});

const maintenanceStatusSchema = z.object({
  maintenanceId: z.string().trim().min(1),
  status: z.nativeEnum(MaintenanceStatus),
});

export async function createNoticeAction(formData: FormData) {
  const user = await requireAdmin();

  const parsed = noticeSchema.safeParse({
    title: getString(formData, "title"),
    content: getString(formData, "content"),
    priority: getString(formData, "priority"),
    isPublished: getBoolean(formData, "isPublished"),
  });

  if (!parsed.success) {
    redirect("/admin?error=aviso-invalido");
  }

  await prisma.notice.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      priority: parsed.data.priority,
      isPublished: parsed.data.isPublished,
      publishedAt: parsed.data.isPublished ? new Date() : null,
      authorId: user.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/avisos");
  revalidatePath("/admin");
  redirect("/admin?success=aviso-criado");
}

export async function createCommonAreaAction(formData: FormData) {
  await requireAdmin();

  const parsed = commonAreaSchema.safeParse({
    name: getString(formData, "name"),
    location: getString(formData, "location") || undefined,
    capacity: getString(formData, "capacity"),
    description: getString(formData, "description"),
    rules: getString(formData, "rules") || undefined,
  });

  if (!parsed.success) {
    redirect("/admin?error=area-invalida");
  }

  const exists = await prisma.commonArea.findUnique({
    where: { name: parsed.data.name },
    select: { id: true },
  });

  if (exists) {
    redirect("/admin?error=area-ja-cadastrada");
  }

  await prisma.commonArea.create({
    data: parsed.data,
  });

  revalidatePath("/areascomuns");
  revalidatePath("/admin");
  redirect("/admin?success=area-criada");
}

export async function updateReservationStatusAction(formData: FormData) {
  await requireAdmin();

  const parsed = reservationStatusSchema.safeParse({
    reservationId: getString(formData, "reservationId"),
    status: getString(formData, "status"),
  });

  if (!parsed.success) {
    redirect("/admin?error=status-reserva-invalido");
  }

  await prisma.reservation.update({
    where: { id: parsed.data.reservationId },
    data: { status: parsed.data.status as ReservationStatus },
  });

  revalidatePath("/areascomuns");
  revalidatePath("/admin");
  redirect("/admin?success=reserva-atualizada");
}

export async function updateMaintenanceStatusAction(formData: FormData) {
  await requireAdmin();

  const parsed = maintenanceStatusSchema.safeParse({
    maintenanceId: getString(formData, "maintenanceId"),
    status: getString(formData, "status"),
  });

  if (!parsed.success) {
    redirect("/admin?error=status-manutencao-invalido");
  }

  await prisma.maintenanceRequest.update({
    where: { id: parsed.data.maintenanceId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/manutencoes");
  revalidatePath("/admin");
  redirect("/admin?success=manutencao-atualizada");
}
