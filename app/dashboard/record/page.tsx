"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Upload, StopCircle, Loader2, MessageSquare, Send, Bot, User, Search, Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export default function RecordPage() {
  const [viewMode, setViewMode] = useState<"options" | "chat">("options");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // MediaRecorder State
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Chat Mock State
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string }[]>([
    { role: "bot", content: "Olá! Como posso descrever seus sintomas hoje?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchPatients() {
      const res = await fetch("/api/patients");
      if (res.ok) setPatients(await res.json());
    }
    fetchPatients();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, viewMode]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.cpf?.includes(patientSearch)
  );

  const handleRecordToggle = async () => {
    if (!selectedPatientId) {
      alert("Por favor, selecione um paciente primeiro.");
      return;
    }

    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach(track => track.stop());
          await handleTranscribeAndProcess(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        alert("Erro ao acessar o microfone. Verifique as permissões do seu navegador.");
      }
    }
  };

  const handleTranscribeAndProcess = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeRes.ok) throw new Error("Falha na transcrição");
      const { transcript } = await transcribeRes.json();
      await processAnalysis(transcript);
    } catch (error) {
      console.error(error);
      alert("Erro ao processar áudio.");
      setIsProcessing(false);
    }
  };

  const processAnalysis = async (transcript: string) => {
    if (!selectedPatientId) return;

    setIsProcessing(true);
    try {
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ transcript }),
        headers: { "Content-Type": "application/json" }
      });

      if (!analyzeRes.ok) throw new Error("Falha na análise");
      const analysis = await analyzeRes.json();

      const saveRes = await fetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify({
          patientId: selectedPatientId,
          duration: "5m",
          transcript,
          summary: analysis.summary,
          medicalData: analysis.medicalData
        }),
        headers: { "Content-Type": "application/json" }
      });

      if (!saveRes.ok) throw new Error("Falha ao salvar");
      const session = await saveRes.json();

      router.push(`/dashboard/session/${session.id}`);
    } catch (error) {
      console.error(error);
      alert("Erro ao processar consulta. Verifique sua chave de API e conexão.");
      setIsProcessing(false);
    }
  };

  const handleChatProcess = () => {
    if (!selectedPatientId) {
      alert("Por favor, selecione um paciente primeiro.");
      return;
    }
    const transcript = messages.map(m => `${m.role === 'bot' ? 'IA' : 'Paciente'}: ${m.content}`).join("\n");
    processAnalysis(transcript);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessing) return;

    const userMessage = { role: "user" as const, content: chatInput.trim() };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setChatInput("");
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: newMessages }),
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) throw new Error("Erro no chat");
      const data = await res.json();

      setMessages(prev => [...prev, { role: "bot", content: data.content }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: "bot", content: "Desculpe, tive um problema ao processar sua resposta. Pode repetir?" }]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto min-h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] py-8 md:py-0 flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">

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
          <div className="p-4 border-b border-white/5 bg-teal-500/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/20 text-teal-500 rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Triagem: {selectedPatient?.name}</h3>
                <p className="text-xs text-gray-500 tracking-tight">Chat de coleta de dados pré-consulta</p>
              </div>
            </div>
            <button
              onClick={handleChatProcess}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-bold shadow-md transition-colors"
            >
              Gerar SOAP
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-gray-50/50 dark:bg-black/20">
            {messages.map((m, i) => (
              <div key={i} className={clsx("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={clsx(
                  "px-4 py-2.5 rounded-2xl max-w-[80%] text-sm",
                  m.role === "user"
                    ? "bg-teal-600 text-white rounded-br-none shadow-lg shadow-teal-500/20"
                    : "glass border border-white/10 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-white dark:bg-[#18181b] flex items-center gap-3">
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
              className="flex-1 bg-gray-100 dark:bg-white/5 border border-transparent focus:border-teal-500 rounded-full px-5 py-3 text-sm outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!chatInput.trim()}
              className="p-3 bg-teal-600 disabled:bg-gray-300 dark:disabled:bg-white/10 text-white rounded-full transition-colors flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Nova Captura Clínica</h2>
            <p className="text-gray-500 max-w-lg mx-auto mb-10">
              Selecione o paciente e escolha a forma de registro dos dados clínicos.
            </p>

            {/* Custom Searchable Patient Picker */}
            <div className="relative max-w-md mx-auto z-50" ref={dropdownRef}>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={clsx(
                  "w-full glass flex items-center justify-between px-6 py-4 rounded-2xl cursor-pointer border-2 transition-all",
                  isDropdownOpen ? "border-teal-500 bg-white/10" : "border-transparent hover:border-teal-500/30"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Paciente</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {selectedPatient ? selectedPatient.name : "Selecionar Paciente..."}
                    </p>
                  </div>
                </div>
                <ChevronDown className={clsx("w-5 h-5 text-gray-400 transition-transform", isDropdownOpen && "rotate-180")} />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-3 glass rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-white/5 bg-white/5">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Pesquisar por nome ou CPF..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-black/20 rounded-xl text-sm outline-none border border-transparent focus:border-teal-500 transition-all"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2">
                    {filteredPatients.length === 0 ? (
                      <div className="py-8 text-center text-gray-500 text-sm">
                        Nenhum paciente encontrado.
                      </div>
                    ) : (
                      filteredPatients.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => {
                            setSelectedPatientId(p.id);
                            setIsDropdownOpen(false);
                            setPatientSearch("");
                          }}
                          className={clsx(
                            "flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors mb-1",
                            selectedPatientId === p.id 
                              ? "bg-teal-500 text-white" 
                              : "hover:bg-white/5 text-gray-800 dark:text-gray-200"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={clsx(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                              selectedPatientId === p.id ? "bg-white/20" : "bg-teal-500/10 text-teal-500"
                            )}>
                              {p.name[0]}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{p.name}</p>
                              <p className={clsx("text-[10px]", selectedPatientId === p.id ? "text-white/70" : "text-gray-500")}>
                                {p.age} anos • {p.gender}
                              </p>
                            </div>
                          </div>
                          {selectedPatientId === p.id && <Check className="w-4 h-4" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div
              onClick={handleRecordToggle}
              className={clsx(
                "glass p-10 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden cursor-pointer group",
                isRecording ? "border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]" : "hover:border-teal-500/50 hover:bg-white/5",
                !selectedPatientId && "opacity-50 pointer-events-none grayscale"
              )}
            >
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-red-500 font-bold text-[10px] uppercase tracking-widest animate-pulse">Gravando...</span>
                </div>
              )}

              <div className={clsx(
                "w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 mb-6 border-4",
                isRecording
                  ? "bg-red-500/10 border-red-500 text-red-500"
                  : "bg-teal-600 border-teal-400 text-white group-hover:scale-110"
              )}>
                {isRecording ? <StopCircle className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </div>

              <h3 className="font-bold mb-2 text-xl">
                {isRecording ? "Finalizar Consulta" : "Microfone"}
              </h3>
              <p className="text-gray-400 text-sm max-w-[200px]">
                {isRecording ? "Clique para processar o prontuário" : "Grave o atendimento médico em tempo real"}
              </p>
            </div>

            <div
              onClick={() => !isRecording && setViewMode("chat")}
              className={clsx(
                "glass p-10 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer group",
                (isRecording || !selectedPatientId) && "opacity-50 pointer-events-none grayscale"
              )}
            >
              <div className="w-24 h-24 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                <MessageSquare className="w-10 h-10" />
              </div>
              <h3 className="font-bold mb-2 text-xl">Chat do Paciente</h3>
              <p className="text-gray-400 text-sm max-w-[200px]">
                Simulador de pré-consulta interativa automatizada.
              </p>
            </div>
          </div>

          {!selectedPatientId && (
            <div className="mt-8 text-center animate-bounce">
              <p className="text-teal-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <ChevronDown className="w-4 h-4 rotate-180" /> Selecione um paciente para começar
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
