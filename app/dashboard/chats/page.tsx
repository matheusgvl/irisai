"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, MessageCircle, Loader2, Send, X, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface Message {
  id: string;
  content: string;
  sender: "patient" | "doctor";
  senderName: string;
  senderEmail: string;
  patientEmail: string;
  createdAt: string;
}

interface Conversation {
  patientEmail: string;
  senderName: string;
  lastMessage: string;
  lastMessageTime: string;
  messageCount: number;
}

export default function ChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const allMessages: Message[] = await res.json();
        
        // Agrupar por patientEmail
        const grouped: { [key: string]: Message[] } = {};
        allMessages.forEach(msg => {
          if (!grouped[msg.patientEmail]) {
            grouped[msg.patientEmail] = [];
          }
          grouped[msg.patientEmail].push(msg);
        });

        // Transformar em conversations
        const convs = Object.entries(grouped).map(([email, msgs]) => ({
          patientEmail: email,
          senderName: msgs[0].senderName,
          lastMessage: msgs[msgs.length - 1].content.substring(0, 50) + "...",
          lastMessageTime: msgs[msgs.length - 1].createdAt,
          messageCount: msgs.length,
        }));

        setConversations(convs.sort((a, b) => 
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        ));
      }
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = async (patientEmail: string) => {
    setSelectedConversation(patientEmail);
    try {
      const res = await fetch(`/api/chat?patientEmail=${patientEmail}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    setIsSending(true);
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageInput,
          sender: "doctor",
          senderName: "Médico",
          senderEmail: "medico@irisai.com",
          patientEmail: selectedConversation,
          isDoctorRequest: true,
        }),
      });

      setMessageInput("");
      openConversation(selectedConversation);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.senderName.toLowerCase().includes(search.toLowerCase()) ||
    c.patientEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Mensagens com Pacientes</h2>
        <p className="text-gray-500">Gerencie as conversas com seus pacientes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Lista de Conversas */}
        <div className="glass rounded-3xl border border-white/5 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/20 rounded-lg text-sm border border-white/10 outline-none focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 flex items-center justify-center text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Carregando...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                Nenhuma conversa ainda
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.patientEmail}
                  onClick={() => openConversation(conv.patientEmail)}
                  className={clsx(
                    "w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-all",
                    selectedConversation === conv.patientEmail && "bg-teal-500/10 border-l-2 border-l-teal-500"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-white">{conv.senderName}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{conv.lastMessage}</p>
                    </div>
                    <div className="text-xs text-gray-500 shrink-0">
                      {format(parseISO(conv.lastMessageTime), "HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat */}
        {selectedConversation ? (
          <div className="lg:col-span-2 glass rounded-3xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold">Chat com paciente</h3>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Nenhuma mensagem
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={clsx(
                      "flex gap-3",
                      msg.sender === "doctor" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.sender === "patient" && (
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-blue-400">
                        P
                      </div>
                    )}
                    <div
                      className={clsx(
                        "max-w-xs px-4 py-2 rounded-xl text-sm",
                        msg.sender === "doctor"
                          ? "bg-teal-600 text-white"
                          : "bg-white/10 border border-white/20 text-gray-100"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 flex gap-3">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Digite sua resposta..."
                className="flex-1 px-4 py-2.5 bg-black/20 rounded-lg text-sm border border-white/10 outline-none focus:border-teal-500 transition-all"
              />
              <button
                type="submit"
                disabled={isSending || !messageInput.trim()}
                className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-lg font-bold transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-2 glass rounded-3xl border border-white/5 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
