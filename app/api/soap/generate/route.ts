import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import openai from "@/lib/openai";
import prisma from "@/lib/db";

interface SOAPData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const {
      patientId,
      patientData,
      conversationHistory,
    } = body;

    if (!patientId || !patientData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Format the conversation for analysis
    const conversationText = conversationHistory
      .map(
        (msg: any) =>
          `${msg.role === "user" ? "Paciente" : "Médico"}: ${msg.content}`
      )
      .join("\n\n");

    const systemPrompt = `Você é um médico especialista em análise clínica. 
    Sua tarefa é analisar a conversa com o paciente e gerar um PRONTUÁRIO estruturado no formato SOAP.
    
    IMPORTANTE: Responda APENAS em JSON válido, sem explicações adicionais.
    
    Estrutura esperada (em JSON):
    {
      "subjective": "Queixa principal, histórico da doença atual, sintomas, duração, intensidade, fatores de piora/melhora",
      "objective": "Observações clínicas, sinais vitais (se mencionados), achados físicos relevantes",
      "assessment": "Diagnóstico presuntivo, diferencial diagnóstico, interpretação dos achados",
      "plan": "Plano terapêutico, prescrições, orientações, acompanhamento necessário"
    }
    
    Dados do Paciente:
    - Nome: ${patientData.name}
    - Idade: ${patientData.age} anos
    - Sexo: ${patientData.gender}
    - Especialidade consulta: ${patientData.specialty || "Clínica Geral"}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Analise a seguinte conversa com o paciente e gere um SOAP:\n\n${conversationText}`,
        },
      ],
      temperature: 0.7,
    });

    const aiResponse = response.choices[0].message.content || "";

    // Parse SOAP from JSON response
    let soapData: SOAPData;
    try {
      soapData = JSON.parse(aiResponse);
    } catch (e) {
      // Try to extract JSON from the response if it contains extra text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        soapData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse SOAP response");
      }
    }

    // Save the clinical session with SOAP data
    const clinicalSession = await prisma.clinicalSession.create({
      data: {
        patientId,
        userId: session.user.id as string,
        medicalData: soapData,
        status: "Completed",
      },
      include: {
        patient: true,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: clinicalSession.id,
      soap: soapData,
      message: "Prontuário SOAP gerado com sucesso",
    });
  } catch (error) {
    console.error("Error generating SOAP:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao gerar prontuário SOAP",
      },
      { status: 500 }
    );
  }
}
