import { NextResponse } from "next/server";
import openai from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userMessage, conversationHistory, currentPhase, patientInfo } = body;

    // Build conversation context with phase awareness
    const systemMessage = `Você é um assistente médico profissional da Iris AI fazendo triagem no formato SOAP.
    Fase atual: ${currentPhase}
    
    Dados do paciente:
    - Nome: ${patientInfo.name}
    - Idade: ${patientInfo.age} anos
    - Sexo: ${patientInfo.gender}
    
    Sua resposta deve:
    1. Ser empática e profissional
    2. Reconhecer o que o paciente disse
    3. Pedir esclarecimentos se necessário
    4. Ser breve (1-2 frases)`;

    const messages = [
      {
        role: "system" as const,
        content: systemMessage,
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    const assistantResponse = response.choices[0].message.content || "";

    return NextResponse.json({
      response: assistantResponse,
    });
  } catch (error) {
    console.error("Error processing chat:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao processar mensagem",
      },
      { status: 500 }
    );
  }
}
