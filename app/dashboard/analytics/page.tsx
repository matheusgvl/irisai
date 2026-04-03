"use client";

import { Activity, Clock, TrendingDown, TrendingUp, Users, BrainCircuit } from "lucide-react";
import clsx from "clsx";

const mockSavingsData = [
  { month: "Jan", manual: 45, ai: 12 },
  { month: "Fev", manual: 42, ai: 10 },
  { month: "Mar", manual: 48, ai: 15 },
  { month: "Abr", manual: 50, ai: 14 },
  { month: "Mai", manual: 40, ai: 9 },
  { month: "Jun", manual: 47, ai: 11 },
];

export default function AnalyticsPage() {
  const maxHours = Math.max(...mockSavingsData.map(d => d.manual));

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Métricas de Desempenho</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Análise do impacto da IA na sua rotina clínica.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 border border-(--border) px-4 py-2 rounded-lg text-sm font-medium">
          <span>Últimos 6 Meses</span>
          <TrendingUp className="w-4 h-4 text-teal-500 ml-2" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-teal-500/10 p-2.5 rounded-xl text-teal-500">
              <Clock className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-500/10 px-2 py-1 rounded-full">
              <TrendingDown className="w-3 h-3 mr-1" />
              -74%
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Tempo em Burocracia</p>
          <p className="text-3xl font-bold">1.2h <span className="text-lg text-gray-400 font-normal">/ dia</span></p>
        </div>

        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500">
              <Users className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-500/10 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15%
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Pacientes Atendidos</p>
          <p className="text-3xl font-bold">142 <span className="text-lg text-gray-400 font-normal">/ mês</span></p>
        </div>

        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-500">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span className="flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-500/10 px-2 py-1 rounded-full">
              Média alta
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Precisão SOAP</p>
          <p className="text-3xl font-bold">98.4%</p>
        </div>

        <div className="glass p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-500">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center">
              Em alta
            </span>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Aprovação de CDI</p>
          <p className="text-3xl font-bold">100%</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Bar Chart */}
        <div className="glass p-6 rounded-2xl lg:col-span-2">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            Horas Gastas: Digitação Manual vs Assistente IA
          </h3>
          
          <div className="h-64 flex items-end justify-between gap-4 relative pt-6">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((line) => (
              <div 
                key={line} 
                className="absolute w-full flex items-center gap-4 text-xs font-medium text-gray-400 pointer-events-none"
                style={{ bottom: `${(line / 4) * 100}%` }}
              >
                <div className="w-6 text-right">{Math.round((line / 4) * maxHours)}h</div>
                <div className="flex-1 h-px bg-(--border) border-dashed"></div>
              </div>
            ))}

            {/* Bars */}
            <div className="relative w-full h-full flex items-end justify-between px-10 z-10">
              {mockSavingsData.map((data, i) => (
                <div key={i} className="flex flex-col items-center group relative w-12 cursor-pointer">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black dark:bg-white text-white dark:text-black text-xs px-3 py-2 rounded shadow-xl whitespace-nowrap z-20 pointer-events-none">
                    <p className="font-bold mb-1">{data.month}</p>
                    <p>Manual: {data.manual}h</p>
                    <p>Com IA: {data.ai}h</p>
                  </div>
                  
                  <div className="flex items-end justify-center w-full gap-1 h-[200px]">
                    {/* Manual Bar */}
                    <div 
                      className="w-1/2 bg-gray-200 dark:bg-white/10 rounded-t-sm transition-all duration-700 ease-out group-hover:opacity-80"
                      style={{ height: `${(data.manual / maxHours) * 100}%` }}
                    />
                    {/* AI Bar */}
                    <div 
                      className="w-1/2 bg-teal-500 rounded-t-sm transition-all duration-700 ease-out group-hover:bg-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                      style={{ height: `${(data.ai / maxHours) * 100}%` }}
                    />
                  </div>
                  <span className="mt-4 text-xs font-bold text-gray-500">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-8 border-t border-(--border) pt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-white/10"></div>
              <span className="text-sm font-medium text-gray-500">Sem IA (Manual)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-teal-500"></div>
              <span className="text-sm font-medium text-gray-500">Com Iris Scribe</span>
            </div>
          </div>
        </div>

        {/* Secondary Info Chart */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-2">Retorno Sobre Investimento</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Baseado em economia de horas clínicas por mês.</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Custom Circular SVG mock chart */}
            <div className="relative w-48 h-48 mb-4">
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-100 dark:text-white/5" />
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-emerald-500 transition-all duration-1000 ease-in-out" strokeDasharray="251.2" strokeDashoffset="62.8" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-bold">75%</span>
                <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mt-1">Economia</span>
              </div>
            </div>
            
            <div className="text-center w-full bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                Você economizou cerca de <strong>128 horas</strong> (16 dias inteiros) de digitação nos últimos 6 meses.
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
