import { NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * POST /api/paciente
 * Salva dados do paciente quando ele preenche o formulário
 * Não requer autenticação pois é acesso público
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, age, gender, cpf, symptoms } = body;

    if (!name || !email) {
      return new NextResponse("Nome e email são obrigatórios", { status: 400 });
    }

    // Verificar se paciente já existe com esse email
    const existingPatient = await prisma.patient.findFirst({
      where: { email },
    });

    if (existingPatient) {
      // Se já existe, apenas retorna os dados
      return NextResponse.json(existingPatient);
    }

    // Criar novo paciente sem userId (pode ser atribuído depois)
    const patient = await prisma.patient.create({
      data: {
        name,
        email,
        phone,
        age: parseInt(age) || 0,
        gender,
        cpf: cpf || null,
        userId: null, // Sem usuário inicialmente
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error("PATIENT_POST_ERROR", error);
    return new NextResponse("Erro ao salvar dados do paciente", { status: 500 });
  }
}

/**
 * GET /api/paciente
 * Retorna dados do paciente por email
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return new NextResponse("Email é obrigatório", { status: 400 });
    }

    const patient = await prisma.patient.findFirst({
      where: { email },
    });

    if (!patient) {
      return new NextResponse("Paciente não encontrado", { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error("PATIENT_GET_ERROR", error);
    return new NextResponse("Erro ao buscar dados do paciente", { status: 500 });
  }
}
