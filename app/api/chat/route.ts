import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import openai from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new NextResponse("Invalid messages history", { status: 400 });
    }

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
          role: m.role === "bot" ? "assistant" : "user",
          content: m.content
        }))
      ],
    });

    return NextResponse.json({
      content: response.choices[0].message.content
    });
  } catch (error) {
    console.error("CHAT_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
