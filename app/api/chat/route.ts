import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import openai from "@/lib/openai";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, patientEmail, sender, senderName, isDoctorRequest } = body;

    // Se for mensagem de paciente (sem autenticação)
    if (!isDoctorRequest && patientEmail && sender === "patient") {
      // Salvar mensagem do paciente
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        await prisma.message.create({
          data: {
            content: lastMessage.content,
            sender: "patient",
            senderName: senderName || "Paciente",
            senderEmail: patientEmail,
            patientEmail,
          },
        });
      }

      // Se for array de mensagens, usar para contexto com IA
      if (Array.isArray(messages) && messages.length > 0) {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Você é um assistente de triagem médica da Iris AI. 
              Seu objetivo é conversar com o paciente para coletar informações clínicas detalhadas antes 
              da consulta com o médico.
              
              Diretrizes:
              1. Seja empático e profissional.
              2. Faça perguntas curtas e diretas, uma de cada vez.
              3. Foque em: sintomas principais, duração, intensidade e fatores de melhora/piora.
              4. Se o paciente mencionar dor, pergunte sobre a localização e tipo da dor.
              5. Mantenha a conversa focada na coleta de dados clínicos.
              
              Idioma: Português do Brasil.`
            },
            ...messages.map((m: any) => ({
              role: (m.role === "bot" ? "assistant" : "user") as "assistant" | "user",
              content: m.content
            }))
          ],
        });

        const aiResponse = response.choices[0].message.content ?? "";

        if (!aiResponse) {
          return new NextResponse("Erro ao gerar resposta da IA", { status: 500 });
        }

        // Salvar resposta da IA
        await prisma.message.create({
          data: {
            content: aiResponse,
            sender: "doctor",
            senderName: "Iris AI",
            senderEmail: "sistema@irisai.com",
            patientEmail,
          },
        });

        return NextResponse.json({ content: aiResponse });
      }
    }

    // Para médicos (requer autenticação)
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Se for mensagem simples do médico
    if (sender === "doctor" && senderName) {
      await prisma.message.create({
        data: {
          content: body.content,
          sender: "doctor",
          senderName,
          senderEmail: session.user.email || "medico@irisai.com",
          patientEmail: patientEmail || "",
          doctorId: session.user.id,
        },
      });

      return NextResponse.json({ success: true });
    }

    return new NextResponse("Invalid request", { status: 400 });
  } catch (error) {
    console.error("CHAT_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * GET /api/chat
 * Retorna mensagens de uma conversa
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const patientEmail = searchParams.get("patientEmail");

    if (!patientEmail) {
      return new NextResponse("Patient email required", { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        patientEmail,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("CHAT_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
