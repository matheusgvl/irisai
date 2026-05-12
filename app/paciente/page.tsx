"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, Heart, Loader2, Download, Mic, StopCircle, MessageSquare } from "lucide-react";
import { jsPDF } from "jspdf";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Message {
  id?: string;
  content: string;
  sender: "patient" | "doctor";
  senderName: string;
  senderEmail: string;
  patientEmail?: string;
  createdAt?: string | Date;
}

export default function PacientePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"options" | "chat">("options");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [pollingActive, setPollingActive] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // MediaRecorder State
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Redireciona se não estiver logado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, viewMode]);

  const fetchMessages = async () => {
    if (!session?.user?.email) return;

    try {
      const res = await fetch(`/api/chat?patientEmail=${encodeURIComponent(session.user.email)}`);
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data || []);
      }
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
    }
  };

  useEffect(() => {
    if (viewMode === "chat" && session?.user?.email) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [viewMode, session?.user?.email]);

  const handleRecordToggle = async () => {
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
          await handleTranscribeAndSend(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        alert("Erro ao acessar o microfone. Verifique as permissões do seu navegador.");
      }
    }
  };

  const handleTranscribeAndSend = async (audioBlob: Blob) => {
    setIsProcessingAudio(true);
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeRes.ok) throw new Error("Falha na transcrição");
      const { transcript } = await transcribeRes.json();
      
      // Enviar a transcrição como mensagem inicial no chat
      await sendMessageFromTranscription(transcript);
      setViewMode("chat");
    } catch (error) {
      console.error(error);
      alert("Erro ao processar áudio.");
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const sendMessageFromTranscription = async (transcript: string) => {
    if (!transcript.trim() || !session?.user) return;

    const newMessage: Message = {
      content: transcript.trim(),
      sender: "patient",
      senderName: session.user.name || "Paciente",
      senderEmail: session.user.email || "",
      patientEmail: session.user.email || "",
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, newMessage];
    setMessages(nextMessages);
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          sender: "patient",
          senderName: session.user.name || "Paciente",
          senderEmail: session.user.email || "",
          patientEmail: session.user.email || "",
        }),
      });

      if (!res.ok) throw new Error("Erro ao enviar mensagem transcrita");

      const data = await res.json();
      if (data?.content) {
        setMessages((prev) => [
          ...prev,
          {
            content: data.content,
            sender: "doctor",
            senderName: "Iris AI",
            senderEmail: "sistema@irisai.com",
            patientEmail: session.user.email || "",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      console.error("Erro ao enviar mensagem transcrita:", err);
      setError(err.message || "Erro ao enviar mensagem via áudio");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !session?.user) return;

    const newMessage: Message = {
      content: messageInput.trim(),
      sender: "patient",
      senderName: session.user.name || "Paciente",
      senderEmail: session.user.email || "",
      patientEmail: session.user.email || "",
      createdAt: new Date().toISOString(),
    };

    const nextMessages = [...messages, newMessage];
    setMessages(nextMessages);
    setMessageInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          sender: "patient",
          senderName: session.user.name || "Paciente",
          senderEmail: session.user.email || "",
          patientEmail: session.user.email || "",
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Erro ao enviar mensagem");
      }

      const data = await res.json();
      if (data?.content) {
        setMessages((prev) => [
          ...prev,
          {
            content: data.content,
            sender: "doctor",
            senderName: "Iris AI",
            senderEmail: "sistema@irisai.com",
            patientEmail: session.user.email || "",
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (err: any) {
      console.error("Erro ao enviar mensagem:", err);
      setError(err.message || "Erro ao enviar mensagem");
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return "";
    const value = typeof date === "string" ? new Date(date) : date;
    return value.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Resumo da Consulta", 14, 20);
    doc.setFontSize(11);
    doc.text(`Nome: ${session?.user?.name || "Paciente"}`, 14, 32);
    doc.text(`Email: ${session?.user?.email || ""}`, 14, 39);

    let y = 50;
    doc.setFontSize(13);
    doc.text("Histórico de Conversa:", 14, y);
    y += 8;
    doc.setFontSize(10);

    messages.forEach((msg) => {
      const timestamp = msg.createdAt ? formatDate(msg.createdAt) : "";
      const label = msg.sender === "patient" ? `${msg.senderName} (Paciente)` : "Médico";
      const lines = doc.splitTextToSize(`${label} [${timestamp}]: ${msg.content}`, 180);
      if (y + lines.length * 6 > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(lines, 14, y);
      y += lines.length * 6 + 4;
    });

    doc.save(`consulta_${(session?.user?.name || "Paciente").replace(/\s+/g, "_")}.pdf`);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-(--background) flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--background) flex flex-col relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/20 blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] mix-blend-screen pointer-events-none" />

      <div className="border-b border-white/10 bg-white/[0.02] backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h1 className="font-bold text-white">Iris Saúde</h1>
              <p className="text-xs text-gray-400">Consulta Online</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm text-white">{session?.user?.name}</p>
            <p className="text-xs text-gray-400">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col justify-center">
        
        {isProcessingAudio ? (
          <div className="text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 border-t-teal-500 animate-spin"></div>
              <div className="absolute inset-4 rounded-full bg-teal-500/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">Processando Áudio...</h2>
            <p className="text-gray-400 text-lg">A Inteligência Artificial está transcrevendo seus sintomas.</p>
          </div>
        ) : viewMode === "options" ? (
          <div className="w-full animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 tracking-tight">Nova Consulta</h2>
              <p className="text-gray-500 max-w-lg mx-auto">
                Olá, {session?.user?.name?.split(' ')[0]}! Escolha como você prefere informar os sintomas que está sentindo hoje.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div
                onClick={handleRecordToggle}
                className={clsx(
                  "glass p-10 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden cursor-pointer group",
                  isRecording ? "border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]" : "hover:border-teal-500/50 hover:bg-white/5"
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
                  {isRecording ? "Finalizar Gravação" : "Falar Sintomas"}
                </h3>
                <p className="text-gray-400 text-sm max-w-[200px]">
                  {isRecording ? "Clique para processar o seu áudio" : "Grave um áudio relatando o que está sentindo"}
                </p>
              </div>

              <div
                onClick={() => !isRecording && setViewMode("chat")}
                className={clsx(
                  "glass p-10 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer group",
                  isRecording && "opacity-50 pointer-events-none grayscale"
                )}
              >
                <div className="w-24 h-24 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <h3 className="font-bold mb-2 text-xl">Chat Interativo</h3>
                <p className="text-gray-400 text-sm max-w-[200px]">
                  Descreva seus sintomas por mensagem de texto.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto h-[70vh] flex flex-col animate-in fade-in zoom-in-95 duration-500">
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setViewMode("options")}
                  className="text-gray-400 hover:text-white transition-colors text-sm font-semibold"
                >
                  &larr; Voltar
                </button>
                <div>
                  <h2 className="text-2xl font-bold mb-1">Chat de Triagem</h2>
                  <p className="text-sm text-gray-400">IA Médica Assistente</p>
                </div>
              </div>
              <button
                type="button"
                onClick={downloadPdf}
                className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-all"
              >
                <Download className="w-4 h-4" />
                Baixar Resumo
              </button>
            </div>

            <div className="flex-1 glass rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/5 bg-teal-500/5 flex items-center gap-3">
                <div className="p-2 bg-teal-500/20 text-teal-500 rounded-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Iris AI Assistente</h3>
                  <p className="text-xs text-gray-500 tracking-tight">Estamos prontos para te ajudar</p>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-gray-50/50 dark:bg-black/20">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500 mb-2">
                      <Bot className="w-8 h-8" />
                    </div>
                    <p className="text-xl font-medium text-gray-800 dark:text-gray-200">
                      Olá, {session?.user?.name?.split(' ')[0]}!
                    </p>
                    <p className="text-gray-500 max-w-sm">
                      Eu sou a assistente virtual Iris. Como você está se sentindo hoje? Por favor, descreva seus sintomas detalhadamente.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={clsx(
                        "flex gap-3 animate-in fade-in slide-in-from-bottom-2",
                        msg.sender === "patient" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.sender === "doctor" && (
                        <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-teal-400">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}
                      <div className={clsx(
                        "max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm",
                        msg.sender === "patient"
                          ? "bg-teal-600 text-white rounded-br-none shadow-lg shadow-teal-500/20"
                          : "glass border border-white/10 text-gray-800 dark:text-gray-200 rounded-bl-none"
                      )}>
                        <div className="text-[11px] opacity-70 mb-1">
                          {msg.sender === "patient" ? "Você" : "Assistente"} • {formatDate(msg.createdAt)}
                        </div>
                        <div className="leading-relaxed">{msg.content}</div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-white dark:bg-[#18181b] flex items-center gap-3">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Descreva o que está sentindo..."
                  className="flex-1 bg-gray-100 dark:bg-white/5 border border-transparent focus:border-teal-500 rounded-full px-5 py-3 text-sm outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSending || !messageInput.trim()}
                  className="p-3 bg-teal-600 disabled:bg-gray-300 dark:disabled:bg-white/10 text-white rounded-full transition-colors flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20"
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>

            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 text-center">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
