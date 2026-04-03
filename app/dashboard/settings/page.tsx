"use client";

import { mockUser } from "@/lib/data";
import { User, Shield, CreditCard, Puzzle, Bell, Laptop, Stethoscope, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Configurações da Conta</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie seu perfil, preferências da Inteligência Artificial e integrações clínicas.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav Settings */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-2">
            {[
              { id: 'profile', name: 'Perfil e CRM', icon: User, active: true },
              { id: 'ai', name: 'Preferências de IA', icon: Stethoscope, active: false },
              { id: 'integrations', name: 'Integrações (PEP)', icon: Puzzle, active: false },
              { id: 'billing', name: 'Assinatura', icon: CreditCard, active: false },
              { id: 'notifications', name: 'Notificações', icon: Bell, active: false },
              { id: 'appearance', name: 'Aparência', icon: Laptop, active: false },
              { id: 'security', name: 'Segurança', icon: Shield, active: false },
            ].map((tab) => (
              <button 
                key={tab.id}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium w-full text-left ${
                  tab.active 
                    ? "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content Area */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Profile Details Block */}
          <section className="glass p-8 rounded-2xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-(--border) pb-4">
              <User className="w-5 h-5 text-teal-500" />
              Perfil Profissional
            </h3>
            
            <div className="flex items-center gap-6 mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={mockUser.avatarUrl} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full border-4 border-white dark:border-[#27272a] shadow-md"
              />
              <div>
                <button className="px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                  Alterar Foto
                </button>
                <p className="text-xs text-gray-400 mt-2">JPG, GIF ou PNG. Max 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  defaultValue={mockUser.name}
                  className="w-full bg-white dark:bg-black/20 border border-(--border) rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Especialidade Clínica</label>
                <input 
                  type="text" 
                  defaultValue={mockUser.role}
                  className="w-full bg-white dark:bg-black/20 border border-(--border) rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Registro Médico (CRM)</label>
                <input 
                  type="text" 
                  defaultValue="CRM-SP 123456"
                  className="w-full bg-white dark:bg-black/20 border border-(--border) rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* AI Preferences Block */}
          <section className="glass p-8 rounded-2xl">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-(--border) pb-4">
              <Stethoscope className="w-5 h-5 text-teal-500" />
              Comportamento da Inteligência Artificial
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">Modelo de Anotação Clínica Padrão</label>
                <p className="text-xs text-gray-500 mb-3">Escolha como a IA vai estruturar suas anotações após as consultas.</p>
                <select className="w-full md:w-1/2 bg-white dark:bg-black/20 border border-(--border) rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500/50 outline-none transition-all appearance-none cursor-pointer">
                  <option>SOAP (Subjetivo, Objetivo, Avaliação, Plano)</option>
                  <option>APS (Atenção Primária à Saúde)</option>
                  <option>Texto Corrido e Sintetizado</option>
                  <option>Relatório Cirúrgico</option>
                </select>
              </div>

              <div className="h-px bg-(--border) my-2" />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">Extração Automática de CIDs</h4>
                  <p className="text-xs text-gray-500 max-w-sm mt-1">A IA buscará sugerir automaticamente os códigos CID-10 baseados no relato verbal e sintomas documentados.</p>
                </div>
                {/* Custom Toggle Mock */}
                <div className="w-12 h-6 rounded-full bg-teal-500 relative cursor-pointer border-2 border-transparent">
                  <div className="w-5 h-5 rounded-full bg-white absolute right-0 shadow-sm"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">Tom da Sintetização</h4>
                  <p className="text-xs text-gray-500 max-w-sm mt-1">Defina a forma que as notas serão reportadas (Formalidade).</p>
                </div>
                <div className="flex items-center bg-gray-100 dark:bg-black/20 p-1 rounded-lg">
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-md text-gray-500">Conciso</button>
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-white dark:bg-[#27272a] shadow text-teal-600 dark:text-teal-400">Técnico/Médico</button>
                  <button className="px-3 py-1.5 text-xs font-semibold rounded-md text-gray-500">Detalhado</button>
                </div>
              </div>
            </div>
          </section>

          {/* Action Footer */}
          <div className="flex justify-end pt-4">
            <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(20,184,166,0.39)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.23)]">
              <Save className="w-4 h-4" />
              Salvar Preferências
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
