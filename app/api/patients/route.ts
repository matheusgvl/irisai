import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

/**
 * INTEGRAÇÃO: Esta API gerencia os registros de pacientes.
 * PROTEÇÃO: Todas as rotas aqui exigem que o médico esteja logado (via session).
 */

export async function GET() {
  /**
   * INTEGRAÇÃO FRONTEND -> BACKEND:
   * Chamar via fetch('/api/patients') para popular o diretório de pacientes.
   */
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const patients = await prisma.patient.findMany({
      where: {
        userId: (session.user as any).id,
      },
      include: {
        sessions: {
          orderBy: {
            date: "desc",
          },
          take: 1,
        },
      },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error("PATIENTS_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * INTEGRAÇÃO FRONTEND -> BACKEND:
 * Usar no formulário de "Novo Paciente": fetch('/api/patients', { method: 'POST', body: JSON.stringify(dados) }).
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, age, gender, cpf, email, phone } = body;

    if (!name || !age || !gender) {
      return new NextResponse("Campos obrigatórios ausentes", { status: 400 });
    }

    const patient = await prisma.patient.create({
      data: {
        name,
        age: parseInt(age),
        gender,
        cpf,
        email,
        phone,
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error("PATIENTS_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
