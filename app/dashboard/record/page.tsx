"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Upload, StopCircle, Loader2, MessageSquare, Send, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export default function RecordPage() {
  const [viewMode, setViewMode] = useState<"options" | "chat">("options");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Chat Mock State
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string }[]>([
    { role: "bot", content: "Olá! Sou assistente da Dra. Ana Costa. Como posso descrever seus sintomas hoje?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, viewMode]);

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      setTimeout(() => {
        router.push("/dashboard/session/sess_001");
      }, 3000);
    } else {
      setIsRecording(true);
    }
  };

  const handleChatProcess = () => {
    setViewMode("options");
    setIsProcessing(true);
    setTimeout(() => {
      router.push("/dashboard/session/sess_001");
    }, 3000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    const newUserMsg = chatInput.trim();
    setMessages(prev => [...prev, { role: "user", content: newUserMsg }]);
    setChatInput("");

    // Simulate Bot typing and replying randomly
    setTimeout(() => {
      const replies = [
        "Entendi. Há quanto tempo você percebeu isso começando?",
        "Certo. Você sente alguma outra coisa além disso? Dor, febre, enjoo?",
        "Ok, registrei aqui no prontuário. Mais algum detalhe relevante para a Dra. analisar?"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setMessages(prev => [...prev, { role: "bot", content: randomReply }]);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">

      {isProcessing ? (
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin"></div>
            <div className="absolute inset-4 rounded-full bg-teal-500/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">Processando Anamnese...</h2>
          <p className="text-gray-400 text-lg">A Inteligência Artificial está analisando os dados clínicos informados.</p>
        </div>
      ) : viewMode === "chat" ? (
        <div className="w-full max-w-2xl h-[600px] glass rounded-3xl flex flex-col overflow-hidden shadow-2xl border-teal-500/20">
          <div className="p-4 border-b border-(--border) bg-teal-500/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 text-teal-500 rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Simulador de Triage (Chat)</h3>
                <p className="text-xs text-gray-500">Conversa automatizada de coleta de dados</p>
              </div>
            </div>
            <button
              onClick={handleChatProcess}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-bold shadow-md transition-colors"
            >
              Gerar Relatório (SOAP)
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-gray-50/50 dark:bg-black/20">
            {messages.map((m, i) => (
              <div key={i} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={clsx(
                  "px-4 py-2.5 rounded-2xl max-w-[80%] text-sm",
                  m.role === "user"
                    ? "bg-teal-600 text-white rounded-br-none"
                    : "glass border border-(--border) text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-(--border) bg-white dark:bg-[#18181b] flex items-center gap-3">
            <button
              type="button"
              onClick={() => setViewMode("options")}
              className="text-gray-400 hover:text-red-500 font-bold px-2 text-xs transition-colors"
            >
              Cancelar
            </button>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Descreva o que está sentindo..."
              className="flex-1 bg-gray-100 dark:bg-white/5 border border-transparent focus:border-teal-500 rounded-full px-4 py-2.5 text-sm outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-2.5 bg-teal-600 disabled:bg-gray-300 dark:disabled:bg-white/10 text-white rounded-full transition-colors flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nova Captura Clínica</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Escolha a forma como deseja registrar os dados deste atendimento médico. A IA processará qualquar formato.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Record Option */}
            <div className={clsx(
              "glass p-8 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden",
              isRecording ? "border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)] md:col-span-3 lg:col-span-1" : "hover:border-teal-500/50 hover:bg-white/5"
            )}>
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-red-500 font-medium text-xs animate-pulse">Gravando... 04:12</span>
                </div>
              )}

              <button
                onClick={handleRecordToggle}
                className={clsx(
                  "w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 mb-6 border-4",
                  isRecording
                    ? "bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.6)]"
                    : "bg-teal-600 border-teal-400 text-white hover:bg-teal-500 hover:scale-105"
                )}
              >
                {isRecording ? <StopCircle className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>

              <h3 className="font-bold mb-1 text-lg">
                {isRecording ? "Finalizar Consulta" : "Microfone"}
              </h3>
              <p className="text-gray-400 text-xs">
                {isRecording ? "Clique para processar" : "Grave o ambiente do consultório"}
              </p>
            </div>

            {/* Chat Triage Option */}
            <div
              onClick={() => !isRecording && setViewMode("chat")}
              className={clsx(
                "glass p-8 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer",
                isRecording && "opacity-30 pointer-events-none grayscale hidden md:flex"
              )}
            >
              <div className="w-20 h-20 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 shadow-inner transition-transform group-hover:scale-110">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-1 text-lg">Chat do Paciente</h3>
              <p className="text-gray-400 text-xs">
                Simulador de pré-consulta interativa com paciente.
              </p>
            </div>

            {/* Upload Option */}
            <div className={clsx(
              "glass p-8 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer",
              isRecording && "opacity-30 pointer-events-none grayscale hidden md:flex"
            )}>
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6 shadow-inner">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="font-bold mb-1 text-lg">Upload de Áudio</h3>
              <p className="text-gray-400 text-xs">
                Envie .mp3 ou .wav de uma gravação externa para análise.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
