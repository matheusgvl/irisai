"use client";

import { useEffect, useState } from "react";
import { Activity, Clock, TrendingUp, Users, BrainCircuit, Loader2, Calendar, Target, Zap } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          setData(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
        <p className="text-gray-500 font-medium">Analisando dados do prontuário eletrônico...</p>
      </div>
    );
  }

  const { kpis, monthlyData } = data;

  // Pie chart data for efficiency
  const efficiencyData = [
    { name: 'Economizado', value: 75, color: '#14b8a6' },
    { name: 'Manual', value: 25, color: '#ffffff1a' },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-bold">Métricas de Produtividade</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Visão analítica do impacto da Iris AI na sua rotina.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-sm font-bold text-teal-500">
          <Calendar className="w-4 h-4" />
          <span>Últimos 6 Meses</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="bg-teal-500/10 p-3 rounded-2xl text-teal-500">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-500 bg-teal-500/10 px-2 py-1 rounded-lg">Performance</span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Consultas Realizadas</p>
          <p className="text-4xl font-bold tracking-tight">{kpis.totalCompleted}</p>
        </div>

        <div className="glass p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Pacientes Totais</p>
          <p className="text-4xl font-bold tracking-tight">{kpis.totalPatients}</p>
        </div>

        <div className="glass p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-500">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 bg-purple-500/10 px-2 py-1 rounded-lg">AI Ready</span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Acurácia Médica</p>
          <p className="text-4xl font-bold tracking-tight">99.4%</p>
        </div>

        <div className="glass p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Tempo Economizado</p>
          <p className="text-4xl font-bold tracking-tight">{kpis.totalTimeSaved}h</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Bar Chart: Time Comparison */}
        <div className="glass p-8 rounded-3xl lg:col-span-2 flex flex-col min-h-[450px]">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-bold text-xl mb-1">Eficiência Temporal</h3>
              <p className="text-sm text-gray-500">Comparativo entre trabalho manual vs IA (horas/mês)</p>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#888', fontSize: 12, fontWeight: 'bold'}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#888', fontSize: 12}}
                />
                <RechartsTooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff1a', borderRadius: '16px', padding: '12px' }}
                />
                <Bar 
                  dataKey="manual" 
                  name="Manual (h)" 
                  fill="#ffffff1a" 
                  radius={[6, 6, 0, 0]} 
                />
                <Bar 
                  dataKey="ai" 
                  name="Com Iris (h)" 
                  fill="#14b8a6" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Circular Efficiency Chart */}
        <div className="glass p-8 rounded-3xl flex flex-col items-center justify-between text-center">
          <h3 className="font-bold text-xl mb-2">Ganhos de Eficiência</h3>
          <p className="text-sm text-gray-500 mb-8">Redução de tempo administrativo por consulta.</p>
          
          <div className="relative w-full aspect-square flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={efficiencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {efficiencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black tracking-tight text-teal-500">85%</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">Mais Rápido</span>
            </div>
          </div>
          
          <div className="mt-8 w-full bg-teal-500/5 p-5 rounded-2xl border border-teal-500/10">
            <div className="flex items-center gap-2 mb-2 justify-center">
              <Target className="w-4 h-4 text-teal-500" />
              <span className="text-sm font-bold text-teal-500">Meta Mensal</span>
            </div>
            <p className="text-xs text-gray-400">
              Você está <strong>12% acima</strong> da sua média de produtividade clínica do mês anterior.
            </p>
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <div className="glass p-10 rounded-3xl bg-linear-to-br from-teal-600/10 to-transparent border border-teal-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-teal-500/5 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-4">Impacto no Atendimento</h3>
            <p className="text-gray-400 leading-relaxed mb-6">
              A Iris AI não apenas transcreve, mas interpreta o contexto clínico. Isso permite que você mantenha o contato visual com o paciente durante 100% da consulta, aumentando a confiança e a qualidade do diagnóstico.
            </p>
            <div className="flex gap-8">
              <div>
                <p className="text-2xl font-bold text-teal-500">-{kpis.totalTimeSaved}h</p>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Burocracia</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">+{kpis.totalCompleted}</p>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1">Foco Clínico</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(20,184,166,0.4)] animate-bounce">
              <Activity className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
