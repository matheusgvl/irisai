import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

/**
 * ENDPOINT: POST /api/register
 * INTEGRAÇÃO: Esta rota é chamada pelo formulário de "Sign Up" ou "Criar Conta".
 * O Frontend deve enviar: { name, email, password, crm, role }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, crm, role } = body;

    if (!email || !name || !password) {
      return new NextResponse("Campos obrigatórios ausentes", { status: 400 });
    }

    const exists = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (exists) {
      return new NextResponse("Usuário já existe", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Definir role baseado no input, com padrão "patient"
    const userRole = (role === "doctor" || role === "patient") ? role : "patient";

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        crm: userRole === "doctor" ? crm : null,
        role: userRole,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
