"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  clearUserSession,
  createUserSession,
  hashPassword,
  requireGuest,
  verifyPassword,
} from "@/lib/auth";
import { buildRedirect, getSafeRedirectPath, getString } from "@/lib/forms";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  name: z.string().trim().min(3).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(72),
  unit: z.string().trim().max(50).optional(),
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function loginAction(formData: FormData) {
  await requireGuest();

  const redirectTo = getSafeRedirectPath(getString(formData, "redirectTo"), "/areascomuns");

  const parsed = loginSchema.safeParse({
    email: getString(formData, "email"),
    password: getString(formData, "password"),
  });

  if (!parsed.success) {
    redirect(buildRedirect("/login", { error: "dados-invalidos", redirectTo }));
  }

  const email = normalizeEmail(parsed.data.email);
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    redirect(buildRedirect("/login", { error: "credenciais-invalidas", redirectTo }));
  }

  const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash);

  if (!passwordMatches) {
    redirect(buildRedirect("/login", { error: "credenciais-invalidas", redirectTo }));
  }

  await createUserSession(user);

  redirect(user.role === "ADMIN" ? "/admin" : redirectTo);
}

export async function registerAction(formData: FormData) {
  await requireGuest();

  const parsed = registerSchema.safeParse({
    name: getString(formData, "name"),
    email: getString(formData, "email"),
    password: getString(formData, "password"),
    unit: getString(formData, "unit") || undefined,
  });

  if (!parsed.success) {
    redirect("/register?error=dados-invalidos");
  }

  const email = normalizeEmail(parsed.data.email);
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    redirect("/register?error=email-em-uso");
  }

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash: await hashPassword(parsed.data.password),
      unit: parsed.data.unit,
    },
  });

  await createUserSession(user);

  redirect("/areascomuns?success=cadastro-concluido");
}

export async function logoutAction() {
  await clearUserSession();
  redirect("/");
}

