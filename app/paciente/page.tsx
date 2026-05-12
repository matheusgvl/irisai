"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, Mail, Phone, FileText, Heart, Loader2, AlertCircle, CheckCircle2, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import clsx from "clsx";

interface PatientData {
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  cpf: string;
  symptoms: string;
}

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
  const [step, setStep] = useState<"form" | "chat">("form");
  const [formData, setFormData] = useState<PatientData>({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "Masculino",
    cpf: "",
    symptoms: "",
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pollingActive, setPollingActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (step === "chat" && formData.email) {
      setPollingActive(true);
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [step, formData.email]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const fetchMessages = async () => {
    if (!formData.email) return;

    try {
      const res = await fetch(`/api/chat?patientEmail=${encodeURIComponent(formData.email)}`);
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data || []);
      }
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/paciente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(errorMessage || "Erro ao enviar dados");
      }

      setSuccess(true);
      setTimeout(() => {
        setStep("chat");
        setSuccess(false);
        setMessages([
          {
            content: `Bem-vindo(a) ${formData.name}! Sua consulta foi iniciada. O médico responderá em breve.`,
            sender: "doctor",
            senderName: "Iris AI",
            senderEmail: "sistema@irisai.com",
            createdAt: new Date().toISOString(),
          },
        ]);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao salvar os dados do paciente");
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      content: messageInput.trim(),
      sender: "patient",
      senderName: formData.name,
      senderEmail: formData.email,
      patientEmail: formData.email,
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
          senderName: formData.name,
          senderEmail: formData.email,
          patientEmail: formData.email,
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
            patientEmail: formData.email,
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
    doc.text(`Nome: ${formData.name}`, 14, 32);
    doc.text(`Email: ${formData.email}`, 14, 39);
    doc.text(`Telefone: ${formData.phone}`, 14, 46);
    doc.text(`Idade: ${formData.age}`, 14, 53);
    doc.text(`Gênero: ${formData.gender}`, 14, 60);
    if (formData.cpf) doc.text(`CPF: ${formData.cpf}`, 14, 67);
    doc.text("Sintomas:", 14, 75);
    const symptomLines = doc.splitTextToSize(formData.symptoms || "-", 180);
    doc.text(symptomLines, 14, 82);

    let y = 95 + symptomLines.length * 6;
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

    doc.save(`consulta_${formData.name.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="min-h-screen bg-(--background) flex flex-col relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/20 blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] mix-blend-screen pointer-events-none" />

      <div className="border-b border-white/10 bg-white/[0.02] backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
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
            <p className="text-sm text-gray-400">
              {step === "form" ? "Preencha seus dados" : "Chat com o médico"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {step === "form" ? (
          <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Iniciar Consulta</h2>
              <p className="text-gray-400">Preencha seus dados para que possamos melhor atendê-lo.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="glass rounded-2xl p-8 border border-white/10 space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-400">Dados enviados com sucesso!</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Ex: João Silva"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="seu@email.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="(00) 00000-0000"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Idade</label>
                  <input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={handleFormChange}
                    placeholder="30"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Gênero</label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-teal-500 transition-all"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">CPF (Opcional)</label>
                  <input
                    id="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={handleFormChange}
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Descreva seus sintomas</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <textarea
                      id="symptoms"
                      value={formData.symptoms}
                      onChange={handleFormChange}
                      placeholder="Ex: Dor de cabeça, febre..."
                      rows={4}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-teal-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-teal-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    Iniciar Consulta
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-180px)]">
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Chat com o Médico</h2>
                <p className="text-sm text-gray-400">Paciente: {formData.name} ({formData.email})</p>
              </div>
              <button
                type="button"
                onClick={downloadPdf}
                className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-all"
              >
                <Download className="w-4 h-4" />
                Baixar PDF
              </button>
            </div>

            <div className="flex-1 glass rounded-2xl border border-white/10 p-6 overflow-y-auto mb-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-center">
                  <p>Nenhuma mensagem ainda. Envie uma para começar!</p>
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
                        M
                      </div>
                    )}
                    <div className={clsx(
                      "max-w-[75%] px-4 py-3 rounded-3xl text-sm",
                      msg.sender === "patient"
                        ? "bg-teal-600 text-white"
                        : "bg-white/10 border border-white/20 text-gray-100"
                    )}
                    >
                      <div className="text-[11px] text-gray-400 mb-1">
                        {msg.sender === "patient" ? msg.senderName : "Médico"} • {formatDate(msg.createdAt)}
                      </div>
                      <div>{msg.content}</div>
                    </div>
                    {msg.sender === "patient" && (
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-blue-400">
                        P
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm outline-none focus:border-teal-500 transition-all"
              />
              <button
                type="submit"
                disabled={isSending || !messageInput.trim()}
                className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
