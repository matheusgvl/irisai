"use client";

import { mockSessions } from "@/lib/data";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Clock, Stethoscope, ChevronRight, CheckCircle2, Loader2, Search } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sessões Recentes</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie e visualize as anotações geradas por IA.</p>
        </div>
        
        <Link 
          href="/dashboard/record"
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-[0_4px_14px_0_rgba(20,184,166,0.39)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.23)] hover:-translate-y-[1px]"
        >
          <Plus className="w-5 h-5" />
          Nova Sessão
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass p-6 rounded-2xl flex items-center gap-4 border-l-4 border-teal-500">
          <div className="bg-teal-500/10 p-3 rounded-xl text-teal-500">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold">24</p>
            <p className="text-sm text-gray-500">Sessões esta semana</p>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-green-500/10 p-3 rounded-xl text-green-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold">22</p>
            <p className="text-sm text-gray-500">Notas concluídas</p>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl flex items-center gap-4">
          <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-3xl font-bold">4.2h</p>
            <p className="text-sm text-gray-500">Tempo economizado</p>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-(--border) flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
          <h3 className="font-semibold px-2">Histórico de Pacientes</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar paciente..."
              className="pl-9 pr-4 py-1.5 text-sm rounded-lg bg-white dark:bg-black/20 border border-(--border) focus:border-teal-500 outline-none w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/[0.02] border-b border-(--border)">
              <tr>
                <th className="px-6 py-4 font-medium">Paciente</th>
                <th className="px-6 py-4 font-medium">Data da Sessão</th>
                <th className="px-6 py-4 font-medium">Duração</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {mockSessions.map((session, i) => (
                <tr 
                  key={session.id} 
                  className={clsx(
                    "border-b border-(--border) hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">{session.patient.name}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{session.patient.age} anos • {session.patient.gender}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {format(parseISO(session.date), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {session.duration}
                  </td>
                  <td className="px-6 py-4">
                    <div className={clsx(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                      session.status === "Completed" 
                        ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20"
                        : "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                    )}>
                      {session.status === "Completed" ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      )}
                      {session.status === "Completed" ? "Concluído" : "Processando IA"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/dashboard/session/${session.id}`}
                      className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-teal-500 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
