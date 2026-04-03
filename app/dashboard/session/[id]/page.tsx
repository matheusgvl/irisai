"use client";

import { mockSessions } from "@/lib/data";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, CheckCircle2, Clock, Copy, Download, FileText, Activity, Pill, Play, UserCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import clsx from "clsx";

export default function SessionDetail({ params }: { params: Promise<{ id: string }> }) {
  // Fix Next.js 15 async params warning by wrapping in React.use()
  const { id } = use(params);
  const session = mockSessions.find((s) => s.id === id);

  if (!session) {
    return <div className="p-8 text-center text-gray-500">Sessão não encontrada.</div>;
  }

  const { patient, medicalData } = session;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/dashboard"
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Consulta: {patient.name}</h2>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Processado via IA
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {format(parseISO(session.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })} • {session.duration}
          </p>
        </div>
        
        <div className="ml-auto flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) glass hover:bg-white/5 transition-colors text-sm font-medium">
            <Copy className="w-4 h-4 text-gray-400" />
            Copiar Notas
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition-colors text-sm font-medium shadow-[0_0_20px_rgba(20,184,166,0.3)]">
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Transcript & Patient Details */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass p-6 rounded-2xl border-t-4 border-t-teal-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-black/50 rounded-full flex items-center justify-center text-gray-400">
                <UserCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{patient.name}</h3>
                <p className="text-sm text-gray-500">{patient.age} anos • {patient.gender}</p>
              </div>
            </div>
            <div className="h-px bg-(--border) my-4" />
            <h4 className="font-medium text-sm text-gray-500 mb-2 uppercase tracking-wide">Resumo da IA</h4>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
              {session.summary}
            </p>
          </div>

          <div className="glass p-6 rounded-2xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-500" />
                Transcrição Original
              </h3>
              <button className="p-1.5 rounded bg-teal-500/10 text-teal-500 hover:bg-teal-500/20 transition-colors">
                <Play className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 bg-white dark:bg-black/20 rounded-xl p-4 border border-(--border) overflow-y-auto max-h-[500px]">
              {session.transcript.split('\n').map((line, i) => (
                <div key={i} className="mb-4 text-sm leading-relaxed">
                  <span className={clsx(
                    "font-semibold mr-2",
                    line.startsWith("Médico:") ? "text-teal-600 dark:text-teal-400" : "text-emerald-600 dark:text-emerald-400"
                  )}>
                    {line.split(':')[0]}:
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {line.split(':').slice(1).join(':')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: SOAP Notes & Entities */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {medicalData ? (
            <>
              {/* Key Entities Extracted */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass p-5 rounded-2xl border-l-2 border-l-red-500/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" /> Sintomas / Achados
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {medicalData.symptoms.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="glass p-5 rounded-2xl border-l-2 border-l-amber-500/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Diagnóstico
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {medicalData.diagnosis.map((d, i) => (
                      <span key={i} className="px-2.5 py-1 rounded border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="glass p-5 rounded-2xl border-l-2 border-l-emerald-500/50 md:col-span-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                    <Pill className="w-3.5 h-3.5" /> Conduta / Medicação Extratada
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {medicalData.medications.map((m, i) => (
                      <span key={i} className="px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SOAP Note Editor */}
              <div className="glass p-6 rounded-2xl flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    Notas Clínicas (SOAP)
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs text-green-500 font-medium">Synched</span>
                  </div>
                </div>

                <div className="space-y-6">
                  {Object.entries(medicalData.soap).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {key === 'subjective' ? 'S - Subjetivo' : 
                         key === 'objective' ? 'O - Objetivo' :
                         key === 'assessment' ? 'A - Avaliação' : 'P - Plano'}
                      </label>
                      <textarea 
                        defaultValue={value}
                        className="w-full bg-white dark:bg-black/20 border border-(--border) rounded-xl p-3 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-teal-500/50 outline-none resize-y min-h-[100px] transition-all"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button className="bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-900 dark:text-white border border-(--border) px-6 py-2 rounded-lg font-medium transition-colors text-sm">
                    Salvar Alterações Manuais
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="glass p-12 rounded-2xl flex-1 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-10 h-10 animate-spin text-teal-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Processando IA...</h3>
              <p className="text-gray-400 max-w-sm">Estamos transcrevendo o áudio e gerando as anotações estruturadas. Isso leva alguns segundos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
