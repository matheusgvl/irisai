"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Loader2,
  Check,
  AlertCircle,
  ChevronDown,
  Download,
} from "lucide-react";
import clsx from "clsx";

interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: string;
  specialty?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SOAPData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

type SOAPPhase = "subjective" | "objective" | "assessment" | "plan";

export default function SOAPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get("patientId");

  // States
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);

  // SOAP states
  const [soapStarted, setSOAPStarted] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<SOAPPhase>("subjective");
  const [phaseQuestions, setPhaseQuestions] = useState({
    subjective: 0,
    objective: 0,
    assessment: 0,
    plan: 0,
  });
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [soapResult, setSOAPResult] = useState<SOAPData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load patients
  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await fetch("/api/patients");
        if (res.ok) {
          const data = await res.json();
          setPatients(data);

          // If patientId in URL, select it
          if (patientId) {
            const patient = data.find((p: PatientInfo) => p.id === patientId);
            if (patient) {
              setSelectedPatient(patient);
              initializeSOAP(patient);
            }
          }
        }
      } catch (err) {
        setError("Erro ao carregar pacientes");
      } finally {
        setIsLoadingPatients(false);
      }
    }

    loadPatients();
  }, [patientId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistory]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.cpf?.includes(patientSearch)
  );

  const selectPatient = (patient: PatientInfo) => {
    setSelectedPatient(patient);
    setIsDropdownOpen(false);
    setPatientSearch("");
  };

  const initializeSOAP = async (patient: PatientInfo) => {
    setSOAPStarted(true);
    setConversationHistory([]);
    setCurrentPhase("subjective");
    setPhaseQuestions({
      subjective: 0,
      objective: 0,
      assessment: 0,
      plan: 0,
    });
    setError("");
    setSOAPResult(null);

    // Get initial question
    await generateNextQuestion(patient, "subjective", []);
  };

  const generateNextQuestion = async (
    patient: PatientInfo,
    phase: SOAPPhase,
    history: Message[]
  ) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/soap/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPhase: phase,
          patientInfo: patient,
          conversationHistory: history,
        }),
      });

      if (!res.ok) throw new Error("Erro ao gerar pergunta");

      const data = await res.json();
      setConversationHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.question,
        },
      ]);

      setPhaseQuestions((prev) => ({
        ...prev,
        [phase]: prev[phase] + 1,
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao gerar próxima pergunta"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !selectedPatient) return;

    const userMessage = currentInput.trim();
    setCurrentInput("");
    setIsLoading(true);

    try {
      // Add user message to history
      const updatedHistory = [
        ...conversationHistory,
        { role: "user" as const, content: userMessage },
      ];
      setConversationHistory(updatedHistory);

      // Get AI response
      const res = await fetch("/api/soap/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage,
          conversationHistory: updatedHistory,
          currentPhase,
          patientInfo: selectedPatient,
        }),
      });

      if (!res.ok) throw new Error("Erro ao processar resposta");

      const data = await res.json();
      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);

      // Check if phase is complete (after 3-4 questions)
      const questionsInPhase = phaseQuestions[currentPhase];
      if (questionsInPhase >= 3) {
        // Move to next phase or finish
        const phases: SOAPPhase[] = [
          "subjective",
          "objective",
          "assessment",
          "plan",
        ];
        const nextPhaseIndex = phases.indexOf(currentPhase) + 1;

        if (nextPhaseIndex < phases.length) {
          const nextPhase = phases[nextPhaseIndex];
          setCurrentPhase(nextPhase);
          // Generate first question of next phase
          await generateNextQuestion(selectedPatient, nextPhase, updatedHistory);
        } else {
          // All phases complete - generate SOAP
          await generateSOAP(selectedPatient, updatedHistory);
        }
      } else {
        // Continue with same phase
        await generateNextQuestion(selectedPatient, currentPhase, updatedHistory);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao processar mensagem"
      );
      setConversationHistory((prev) => prev.slice(0, -1)); // Remove last user message on error
    } finally {
      setIsLoading(false);
    }
  };

  const generateSOAP = async (
    patient: PatientInfo,
    history: Message[]
  ) => {
    try {
      setIsGenerating(true);
      const res = await fetch("/api/soap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          patientData: patient,
          conversationHistory: history,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erro ao gerar SOAP");
      }

      const data = await res.json();
      setSOAPResult(data.soap);

      // Add final message
      setConversationHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "✅ Prontuário SOAP gerado com sucesso! Você pode revisar os dados abaixo.",
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao gerar prontuário SOAP"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSOAP = () => {
    if (!soapResult || !selectedPatient) return;

    const content = `
PRONTUÁRIO CLÍNICO - FORMATO SOAP
==================================

Paciente: ${selectedPatient.name}
Idade: ${selectedPatient.age} anos
Sexo: ${selectedPatient.gender}
Data: ${new Date().toLocaleDateString("pt-BR")}

---

SUBJETIVO (Subjective)
${soapResult.subjective}

OBJETIVO (Objective)
${soapResult.objective}

AVALIAÇÃO (Assessment)
${soapResult.assessment}

PLANO (Plan)
${soapResult.plan}
`;

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(content)
    );
    element.setAttribute(
      "download",
      `SOAP_${selectedPatient.name}_${new Date().toISOString().split("T")[0]}.txt`
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Phase progress indicator
  const phaseOrder: SOAPPhase[] = [
    "subjective",
    "objective",
    "assessment",
    "plan",
  ];
  const currentPhaseIndex = phaseOrder.indexOf(currentPhase);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Prontuário SOAP</h1>
              <p className="text-gray-400 text-sm">
                Geração automática via IA com perguntas estruturadas
              </p>
            </div>
          </div>

          {selectedPatient && (
            <div className="text-right">
              <p className="text-lg font-semibold">{selectedPatient.name}</p>
              <p className="text-gray-400 text-sm">
                {selectedPatient.age} anos • {selectedPatient.gender}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Patient Selection & Phase Progress */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          {!soapStarted ? (
            <>
              <h2 className="text-lg font-semibold mb-4">Selecione Paciente</h2>

              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={clsx(
                    "w-full px-3 py-2 rounded-lg flex items-center justify-between",
                    "bg-gray-700 hover:bg-gray-600 transition",
                    selectedPatient && "border border-teal-500"
                  )}
                >
                  <span className="truncate">
                    {selectedPatient?.name || "Escolher paciente"}
                  </span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-700 rounded-lg border border-gray-600 z-10">
                    <input
                      type="text"
                      placeholder="Buscar paciente..."
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 border-b border-gray-500 rounded-t-lg text-gray-100 placeholder-gray-400"
                    />
                    <div className="max-h-48 overflow-y-auto">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => selectPatient(patient)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-600 transition"
                          >
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-xs text-gray-400">
                              {patient.age} anos
                            </p>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center text-gray-400 text-sm">
                          Nenhum paciente encontrado
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">
                  Instruções SOAP
                </h3>
                <div className="space-y-3 text-xs text-gray-300">
                  <div>
                    <p className="font-semibold text-teal-400">S - Subjetivo</p>
                    <p>Queixa principal, sintomas, histórico</p>
                  </div>
                  <div>
                    <p className="font-semibold text-teal-400">O - Objetivo</p>
                    <p>Sinais vitais, observações clínicas</p>
                  </div>
                  <div>
                    <p className="font-semibold text-teal-400">A - Avaliação</p>
                    <p>Diagnóstico, hipóteses diagnósticas</p>
                  </div>
                  <div>
                    <p className="font-semibold text-teal-400">P - Plano</p>
                    <p>Tratamento, orientações, acompanhamento</p>
                  </div>
                </div>
              </div>

              {selectedPatient && (
                <button
                  onClick={() => initializeSOAP(selectedPatient)}
                  className="w-full mt-6 px-4 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition"
                >
                  Iniciar Prontuário SOAP
                </button>
              )}
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-gray-400 mb-4">
                Progresso do SOAP
              </h3>
              <div className="space-y-3">
                {phaseOrder.map((phase, index) => {
                  const isComplete = index < currentPhaseIndex;
                  const isActive = phase === currentPhase;

                  return (
                    <div
                      key={phase}
                      className={clsx(
                        "p-3 rounded-lg transition",
                        isComplete && "bg-teal-500/20 border border-teal-500/50",
                        isActive && "bg-blue-500/20 border border-blue-500/50",
                        !isComplete &&
                          !isActive &&
                          "bg-gray-700 border border-gray-600"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm capitalize">
                          {phase === "subjective" && "Subjetivo"}
                          {phase === "objective" && "Objetivo"}
                          {phase === "assessment" && "Avaliação"}
                          {phase === "plan" && "Plano"}
                        </p>
                        {isComplete && (
                          <Check className="w-4 h-4 text-teal-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {phaseQuestions[phase]} pergunta
                        {phaseQuestions[phase] !== 1 ? "s" : ""}
                      </p>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setSOAPStarted(false);
                  setSelectedPatient(null);
                }}
                className="w-full mt-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
              >
                Voltar
              </button>
            </>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {!soapStarted ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-lg mb-4">
                  Selecione um paciente para começar
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {conversationHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={clsx(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={clsx(
                        "max-w-xl px-4 py-3 rounded-lg",
                        msg.role === "user"
                          ? "bg-teal-600 text-white"
                          : "bg-gray-700 text-gray-100"
                      )}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-gray-100 px-4 py-3 rounded-lg flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Processando...</span>
                    </div>
                  </div>
                )}

                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-gray-100 px-4 py-3 rounded-lg flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Gerando SOAP...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex justify-start">
                    <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* SOAP Result Display */}
              {soapResult && (
                <div className="p-6 bg-gray-800 border-t border-gray-700 overflow-y-auto max-h-80">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Prontuário SOAP</h3>
                    <button
                      onClick={downloadSOAP}
                      className="flex items-center gap-2 px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded text-sm transition"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-teal-400 mb-1">
                        Subjetivo
                      </h4>
                      <p className="text-gray-300">{soapResult.subjective}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-teal-400 mb-1">
                        Objetivo
                      </h4>
                      <p className="text-gray-300">{soapResult.objective}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-teal-400 mb-1">
                        Avaliação
                      </h4>
                      <p className="text-gray-300">{soapResult.assessment}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-teal-400 mb-1">Plano</h4>
                      <p className="text-gray-300">{soapResult.plan}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="bg-gray-800 border-t border-gray-700 p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !isLoading && !isGenerating) {
                        handleSendMessage();
                      }
                    }}
                    placeholder={
                      soapResult
                        ? "Prontuário gerado com sucesso"
                        : "Digite sua resposta..."
                    }
                    disabled={isLoading || isGenerating || !!soapResult}
                    className="flex-1 px-4 py-2 bg-gray-700 text-gray-100 rounded-lg placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={
                      isLoading ||
                      isGenerating ||
                      !currentInput.trim() ||
                      !!soapResult
                    }
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
