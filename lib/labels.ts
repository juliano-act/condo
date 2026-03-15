import {
  MaintenancePriority,
  MaintenanceStatus,
  NoticePriority,
  ReservationStatus,
  Role,
} from "@prisma/client";

export const roleLabels: Record<Role, string> = {
  ADMIN: "Administrador",
  RESIDENT: "Morador",
};

export const noticePriorityLabels: Record<NoticePriority, string> = {
  INFO: "Informativo",
  WARNING: "Atencao",
  URGENT: "Urgente",
};

export const reservationStatusLabels: Record<ReservationStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmada",
  REJECTED: "Recusada",
  CANCELLED: "Cancelada",
};

export const maintenancePriorityLabels: Record<MaintenancePriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Media",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const maintenanceStatusLabels: Record<MaintenanceStatus, string> = {
  OPEN: "Aberta",
  IN_PROGRESS: "Em andamento",
  DONE: "Concluida",
  CANCELLED: "Cancelada",
};

export const noticePriorityTone: Record<NoticePriority, string> = {
  INFO: "bg-blue-50 text-blue-700 border-blue-200",
  WARNING: "bg-amber-50 text-amber-700 border-amber-200",
  URGENT: "bg-red-50 text-red-700 border-red-200",
};

export const reservationStatusTone: Record<ReservationStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
};

export const maintenancePriorityTone: Record<MaintenancePriority, string> = {
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
  HIGH: "bg-amber-50 text-amber-700 border-amber-200",
  URGENT: "bg-red-50 text-red-700 border-red-200",
};

export const maintenanceStatusTone: Record<MaintenanceStatus, string> = {
  OPEN: "bg-amber-50 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  DONE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-700 border-slate-200",
};

