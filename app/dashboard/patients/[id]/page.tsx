"use client";

import { use, useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, Pill, Activity, CalendarDays, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PatientProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatient() {
      try {
        const res = await fetch(`/api/patients/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPatient(data);
        }
      } catch (error) {
        console.error("Failed to fetch patient:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPatient();
  }, [id]);

  if (loading) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
        <p className="text-gray-500">Carregando prontuário...</p>
      </div>
    );
  }

  if (!patient) {
    return <div className="p-8 text-center text-gray-500">Paciente não encontrado.</div>;
  }

  // Simulating an aggregated AI diagnostic based on real session data if available
  const latestSession = patient.sessions?.[0];
  const aiDiagnostic = latestSession?.summary || "Paciente em acompanhamento de rotina. Sem descompensações registradas no momento.";
  
  // Extracting data from medicalData of the sessions if possible, or use defaults
  const activeProblems = patient.sessions?.length > 0 ? ["Acompanhamento Ativo"] : ["Nenhum problema registrado"];
  const allergies = ["Nenhuma conhecida"];
  const chronicMeds = patient.sessions?.flatMap((s: any) => s.medicalData?.medications || []).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i) || [];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/patients"
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            Prontuário Médico
          </h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            Visão Consolidada: {patient.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Profile & Clinical Overview */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-3xl shadow-inner mb-4">
              {patient.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
            </div>
            <h3 className="text-xl font-bold">{patient.name}</h3>
            <p className="text-gray-500">{patient.age} anos • {patient.gender}</p>
            <div className="w-full h-px bg-(--border) my-6" />
            <div className="w-full flex justify-between text-sm">
              <span className="text-gray-500">Cadastrado em</span>
              <span className="font-semibold">{format(parseISO(patient.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
            <div className="w-full flex justify-between text-sm mt-2">
              <span className="text-gray-500">Total de Sessões</span>
              <span className="font-semibold">{patient.sessions?.length || 0}</span>
            </div>
            <Link 
              href="/dashboard/record"
              className="w-full mt-6 bg-teal-600 hover:bg-teal-500 text-white py-2 rounded-xl text-sm font-medium transition-colors text-center"
            >
              Iniciar Nova Sessão
            </Link>
          </div>

          <div className="glass p-6 rounded-2xl flex flex-col gap-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" /> Problemas Ativos
              </h4>
              <ul className="space-y-2 text-sm font-medium">
                {activeProblems.map((p, i) => (
                  <li key={i} className="bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 px-3 py-2 rounded-lg border border-amber-100 dark:border-amber-500/20">
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-500" /> Medicações Registradas
              </h4>
              {chronicMeds.length > 0 ? (
                <ul className="space-y-2 text-sm font-medium">
                  {chronicMeds.map((m: string) => (
                    <li key={m} className="bg-teal-50 dark:bg-teal-500/10 text-teal-800 dark:text-teal-400 px-3 py-2 rounded-lg border border-teal-100 dark:border-teal-500/20">
                      {m}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">Nenhuma medicação registrada via IA.</p>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Alergias
              </h4>
              <ul className="space-y-2 text-sm font-medium">
                {allergies.map((a, i) => (
                   <li key={i} className="text-gray-700 dark:text-gray-300">
                     • {a}
                   </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: AI Aggregate Diagnostic & Timeline */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="glass p-6 rounded-2xl border-2 border-transparent bg-linear-to-br from-teal-500/5 to-purple-500/5 relative overflow-hidden group hover:border-teal-500/30 transition-colors">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all pointer-events-none"></div>
            
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-teal-700 dark:text-teal-400">
              <Sparkles className="w-5 h-5" />
              Resumo Clínico via IA
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
              {aiDiagnostic}
            </p>
          </div>

          <div className="glass rounded-2xl flex-1 flex flex-col p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 border-b border-(--border) pb-4">
              <CalendarDays className="w-5 h-5 text-gray-400" />
              Linha do Tempo de Consultas
            </h3>

            {patient.sessions?.length > 0 ? (
              <div className="relative border-l border-(--border) ml-3 space-y-8 pb-4">
                {patient.sessions.map((session: any) => (
                  <div key={session.id} className="relative pl-6">
                    {/* Timeline dot */}
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 bg-teal-500 rounded-full ring-4 ring-white dark:ring-[#18181b]" />
                    
                    <div className="bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl p-4 transition-colors border border-(--border) cursor-pointer group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Consulta Clínica
                          <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Processado</span>
                        </h4>
                        <span className="text-xs font-medium text-gray-500">
                          {format(parseISO(session.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {session.summary || "Sessão registrada."}
                      </p>
                      <Link 
                        href={`/dashboard/session/${session.id}`}
                        className="text-teal-600 dark:text-teal-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all w-fit"
                      >
                        Ver Detalhes do Prontuário <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <div className="text-center py-12 text-gray-500">
                 <p className="italic">Nenhum histórico de consulta registrado para este paciente.</p>
               </div>
            )}
          </div>
          
        </div>

      </div>
    </div>
  );
}
