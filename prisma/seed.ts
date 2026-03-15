import { MaintenancePriority, NoticePriority, PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash("Admin12345!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@condoconnect.local" },
    update: {
      name: "Administrador CondoConnect",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
    create: {
      name: "Administrador CondoConnect",
      email: "admin@condoconnect.local",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      unit: "Administração",
    },
  });

  await prisma.user.upsert({
    where: { email: "morador@condoconnect.local" },
    update: {},
    create: {
      name: "Morador Demo",
      email: "morador@condoconnect.local",
      passwordHash: await bcrypt.hash("Morador123!", 12),
      role: Role.RESIDENT,
      unit: "Bloco A - 101",
    },
  });

  await Promise.all([
    prisma.commonArea.upsert({
      where: { name: "Salao de Festas" },
      update: {},
      create: {
        name: "Salao de Festas",
        location: "Bloco A",
        capacity: 50,
        description: "Espaco com cozinha de apoio, mesas, cadeiras e sistema basico de som.",
        rules: "Reservas com minimo de 48 horas. Horario limite ate 23h.",
      },
    }),
    prisma.commonArea.upsert({
      where: { name: "Academia" },
      update: {},
      create: {
        name: "Academia",
        location: "Torre Central",
        capacity: 12,
        description: "Area fitness com esteiras, bicicletas e equipamentos de musculacao.",
        rules: "Uso individual ou em pequenos grupos. Respeitar limite de capacidade.",
      },
    }),
    prisma.commonArea.upsert({
      where: { name: "Espaco Gourmet" },
      update: {},
      create: {
        name: "Espaco Gourmet",
        location: "Bloco B",
        capacity: 15,
        description: "Ambiente para confraternizacoes pequenas com forno e bancada de apoio.",
        rules: "Obrigatorio informar numero de convidados e manter limpeza ao final.",
      },
    }),
  ]);

  const notices = [
    {
      title: "Bem-vindos ao CondoConnect",
      content:
        "O portal do condominio ja esta pronto para publicar avisos, receber solicitacoes e organizar reservas.",
      priority: NoticePriority.INFO,
    },
    {
      title: "Manutencao preventiva no elevador do Bloco B",
      content:
        "Na proxima quarta-feira o elevador ficara indisponivel das 9h as 14h para revisao tecnica.",
      priority: NoticePriority.WARNING,
    },
    {
      title: "Assembleia extraordinaria no salao de festas",
      content:
        "A administracao convoca todos os moradores para deliberar sobre o orcamento de melhorias da area comum.",
      priority: NoticePriority.URGENT,
    },
  ];

  for (const notice of notices) {
    await prisma.notice.upsert({
      where: { id: `${notice.title}` },
      update: {},
      create: {
        id: notice.title,
        title: notice.title,
        content: notice.content,
        priority: notice.priority,
        isPublished: true,
        publishedAt: new Date(),
        authorId: admin.id,
      },
    });
  }

  const existingMaintenance = await prisma.maintenanceRequest.findFirst({
    where: {
      title: "Luminaria apagada na garagem",
    },
    select: { id: true },
  });

  if (!existingMaintenance) {
    await prisma.maintenanceRequest.create({
      data: {
        title: "Luminaria apagada na garagem",
        description: "A luminaria proxima a vaga 14 esta apagada desde ontem.",
        location: "Garagem - setor 1",
        priority: MaintenancePriority.MEDIUM,
        userId: admin.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
