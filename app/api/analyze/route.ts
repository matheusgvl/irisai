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

    const { transcript } = await request.json();

    if (!transcript) {
      return new NextResponse("Transcript is required", { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é um assistente médico especializado em transcrição e análise de consultas. 
          Sua tarefa é analisar a transcrição de uma consulta entre médico e paciente e retornar um JSON estruturado.
          
          O JSON deve seguir exatamente este formato:
          {
            "summary": "Resumo conciso da consulta",
            "medicalData": {
              "symptoms": ["lista", "de", "sintomas"],
              "diagnosis": ["hipóteses", "diagnósticas"],
              "medications": ["medicamentos", "mencionados"],
              "soap": {
                "subjective": "Relato do paciente",
                "objective": "Achados do exame físico ou dados objetivos mencionados",
                "assessment": "Avaliação médica clínica",
                "plan": "Plano de tratamento e próximos passos"
              }
            }
          }
          
          Responda APENAS o JSON, sem markdown ou explicações extra.`
        },
        {
          role: "user",
          content: `Analise a seguinte transcrição: \n\n ${transcript}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(response.choices[0].message.content || "{}");

    return NextResponse.json(aiResult);
  } catch (error) {
    console.error("ANALYZE_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
