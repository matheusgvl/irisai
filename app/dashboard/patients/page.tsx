"use client";

import { mockPatients } from "@/lib/data";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, UserPlus, FileText, ChevronRight, UserCircle } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

/**
 * INTEGRAÇÃO FRONTEND:
 * Atualmente esta página usa 'mockPatients' do arquivo @/lib/data.
 * Para tornar real:
 * 1. Adicionar 'useEffect' para buscar dados de '/api/patients'.
 * 2. Substituir o mapeamento do mock pelo estado da API.
 */

export default function PatientsPage() {
  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Diretório de Pacientes</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie os registros clínicos e acompanhe o histórico.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-[0_4px_14px_0_rgba(20,184,166,0.39)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.23)] hover:-translate-y-[1px]">
          <UserPlus className="w-5 h-5" />
          Novo Paciente
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-(--border) flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.02]">
          <h3 className="font-semibold px-2 flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-teal-500" />
            Todos os Pacientes
          </h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou CPF..."
              className="pl-9 pr-4 py-1.5 text-sm rounded-lg bg-white dark:bg-black/20 border border-(--border) focus:border-teal-500 outline-none w-72"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-white/[0.02] border-b border-(--border)">
              <tr>
                <th className="px-6 py-4 font-medium">Nome do Paciente</th>
                <th className="px-6 py-4 font-medium">Idade / Gênero</th>
                <th className="px-6 py-4 font-medium">Última Consulta</th>
                <th className="px-6 py-4 font-medium text-center">Sessões Registradas</th>
                <th className="px-6 py-4 text-right font-medium">Histórico</th>
              </tr>
            </thead>
            <tbody>
              {mockPatients.map((patient) => (
                <tr 
                  key={patient.id} 
                  className={clsx(
                    "border-b border-(--border) hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                  )}
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                        {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      {patient.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {patient.age} anos • {patient.gender}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {format(parseISO(patient.lastVisit), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded bg-gray-100 dark:bg-white/10 text-xs font-semibold">
                      {patient.totalSessions}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/dashboard/patients/${patient.id}`} className="inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400 hover:text-teal-500 transition-colors">
                      <FileText className="w-4 h-4 mr-1 hidden sm:block" />
                      <span className="hidden sm:inline-block mr-1 text-xs font-medium">Prontuário</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
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
