"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Clock, Stethoscope, ChevronRight, CheckCircle2, Loader2, Search, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [sessionsRes, analyticsRes] = await Promise.all([
          fetch("/api/sessions"),
          fetch("/api/analytics")
        ]);

        if (sessionsRes.ok) setSessions(await sessionsRes.json());
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      } catch (error) {
        console.error("Dashboard data fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredSessions = sessions.filter(s =>
    s.patient.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header section with Welcome message */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Olá, Doutor
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Aqui está o resumo da sua produtividade clínica hoje.</p>
        </div>

        <Link
          href="/dashboard/record"
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_30px_rgba(20,184,166,0.6)] hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" />
          Nova Captura Clínica
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass p-6 rounded-3xl border-l-4 border-teal-500 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-teal-500/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-teal-500/10 p-2.5 rounded-xl text-teal-500">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Sessões/Semana</span>
          </div>
          <p className="text-3xl font-bold">{loading ? "..." : analytics?.kpis?.sessionsThisWeek || 0}</p>
        </div>

        <div className="glass p-6 rounded-3xl border-l-4 border-blue-500 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-500">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Pacientes Ativos</span>
          </div>
          <p className="text-3xl font-bold">{loading ? "..." : analytics?.kpis?.totalPatients || 0}</p>
        </div>

        <div className="glass p-6 rounded-3xl border-l-4 border-emerald-500 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Horas Salvas</span>
          </div>
          <p className="text-3xl font-bold">{loading ? "..." : (analytics?.kpis?.totalTimeSaved || 0).toFixed(1) + "h"}</p>
        </div>

        <div className="glass p-6 rounded-3xl border-l-4 border-purple-500 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Acurácia IA</span>
          </div>
          <p className="text-3xl font-bold">98%</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 glass p-8 rounded-3xl min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-bold text-lg">Histórico de Volume Clínico</h3>
              <p className="text-xs text-gray-500">Sessões processadas nos últimos 6 meses</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                <span className="text-[10px] uppercase font-bold text-gray-500">Sessões</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full h-full">
            {loading ? (
               <div className="w-full h-full flex items-center justify-center">
                 <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
               </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.monthlyData || []}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#888', fontSize: 12}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#888', fontSize: 12}}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff1a', borderRadius: '12px' }}
                    itemStyle={{ color: '#14b8a6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#14b8a6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSessions)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl flex flex-col">
          <h3 className="font-bold text-lg mb-6 flex items-center justify-between">
            Atalhos Rápidos
          </h3>
          <div className="flex flex-col gap-3">
            <Link 
              href="/dashboard/patients"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-teal-500/30 hover:bg-teal-500/5 transition-all group"
            >
              <span className="font-medium">Diretório de Pacientes</span>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link 
              href="/dashboard/record"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
            >
              <span className="font-medium">Iniciar Consulta IA</span>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
          
          <div className="mt-auto pt-8">
            <div className="bg-teal-500/10 p-5 rounded-2xl border border-teal-500/20">
              <p className="text-xs font-bold text-teal-500 uppercase tracking-wider mb-2">Dica Iris AI</p>
              <p className="text-sm text-gray-300">
                Você sabia que o uso de notas SOAP geradas por IA reduz o tempo de digitação em até 85%?
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center bg-white/[0.02] gap-4">
          <h3 className="font-bold text-xl">Sessões Recentes</h3>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Pesquisar por paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 text-sm rounded-xl bg-black/20 border border-white/10 focus:border-teal-500 outline-none w-full transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin text-teal-500 mb-4" />
              <p className="font-medium">Sincronizando com o banco de dados...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
              <div className="bg-gray-100 dark:bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium mb-1">Nenhum registro encontrado</p>
              <p className="text-sm">Comece uma nova captura para preencher seu histórico.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-gray-500 uppercase bg-white/[0.01] border-b border-white/5 tracking-widest font-bold">
                <tr>
                  <th className="px-8 py-5">Paciente</th>
                  <th className="px-8 py-5">Data & Hora</th>
                  <th className="px-8 py-5">Duração</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500 font-bold border border-teal-500/20">
                          {session.patient.name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white group-hover:text-teal-500 transition-colors">{session.patient.name}</div>
                          <div className="text-gray-500 text-[10px] mt-0.5 uppercase tracking-wide font-medium">{session.patient.gender} • {session.patient.age} anos</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-medium text-gray-400">
                      {format(parseISO(session.date), "dd/MM/yyyy • HH:mm", { locale: ptBR })}
                    </td>
                    <td className="px-8 py-5 text-gray-400 font-medium">
                      {session.duration}
                    </td>
                    <td className="px-8 py-5">
                      <div className={clsx(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        session.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      )}>
                        {session.status === "Completed" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                        {session.status === "Completed" ? "Finalizado" : "Processando"}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link
                        href={`/dashboard/session/${session.id}`}
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-teal-500 text-gray-400 hover:text-white transition-all shadow-inner"
                      >
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
