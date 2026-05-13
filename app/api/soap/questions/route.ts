import { NextResponse } from "next/server";
import openai from "@/lib/openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentPhase, patientInfo, conversationHistory } = body;

    // Define questions for each SOAP phase
    const phasePrompts: Record<string, string> = {
      subjective: `Você é um médico fazendo triagem. Baseado no que o paciente já respondeu, 
        faça a PRÓXIMA pergunta para coletar informações sobre:
        - Queixa principal e histórico
        - Sintomas (quando começou, intensidade, características)
        - Fatores de melhora/piora
        - Medicamentos em uso
        
        Faça UMA pergunta clara e objetiva. Seja empático e profissional.`,

      objective: `Você é um médico. Agora você vai coletar dados objetivos/observáveis. 
        Faça a PRÓXIMA pergunta sobre:
        - Sinais vitais (se puder ser auto-relatado)
        - Observações físicas relevantes
        - Exames ou testes mencionados
        
        Faça UMA pergunta clara. Se já tem informações suficientes, pergunte se há mais algo a adicionar.`,

      assessment: `Você é um médico. Agora você vai validar seu entendimento do caso.
        Faça a PRÓXIMA pergunta para:
        - Confirmar compreensão dos sintomas
        - Perguntar se há algo mais que o paciente ache relevante
        - Preparar para o plano de tratamento
        
        Faça UMA pergunta clara e resumida.`,

      plan: `Você é um médico finalizando a consulta.
        Faça a PRÓXIMA pergunta sobre:
        - Alergias (importante para prescrever)
        - Preferências de tratamento
        - Disponibilidade para acompanhamento
        
        Faça UMA pergunta clara. Esta deve ser próxima da última pergunta.`,
    };

    const phase = currentPhase || "subjective";
    const systemContent = phasePrompts[phase] || phasePrompts.subjective;

    // Build conversation context
    const messages = [
      {
        role: "system" as const,
        content: `Você é um assistente médico profissional da Iris AI. ${systemContent}
        
        Dados do paciente:
        - Nome: ${patientInfo.name}
        - Idade: ${patientInfo.age} anos
        - Sexo: ${patientInfo.gender}
        - Especialidade: ${patientInfo.specialty || "Clínica Geral"}
        
        IMPORTANTE: Responda com APENAS a próxima pergunta. Sem explicações adicionais.`,
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 200,
    });

    const nextQuestion = response.choices[0].message.content || "";

    return NextResponse.json({
      question: nextQuestion,
      phase: phase,
    });
  } catch (error) {
    console.error("Error generating question:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao gerar próxima pergunta",
      },
      { status: 500 }
    );
  }
}
