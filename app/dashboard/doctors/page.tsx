"use client";

import { useEffect, useState } from "react";
import { Search, UserPlus, Phone, Mail, Award, Loader2, X, Trash2, ShieldCheck, Stethoscope } from "lucide-react";
import clsx from "clsx";

export default function DoctorsPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "Médico",
    crm: "",
    specialty: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    try {
      const res = await fetch("/api/doctors");
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "", role: "Médico", crm: "", specialty: "", email: "", phone: "" });
        fetchStaff();
      }
    } catch (error) {
      console.error("Error creating staff member:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.crm?.includes(search)
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold">Gestão da Equipe</h2>
          <p className="text-gray-500 mt-1">Cadastre e gerencie os profissionais da sua clínica.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-teal-500/20"
        >
          <UserPlus className="w-5 h-5" />
          Novo Profissional
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass p-6 rounded-3xl border border-white/5">
          <p className="text-sm font-medium text-gray-500 mb-1">Total de Profissionais</p>
          <p className="text-3xl font-bold">{staff.length}</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-white/5">
          <p className="text-sm font-medium text-gray-500 mb-1">Médicos</p>
          <p className="text-3xl font-bold">{staff.filter(s => s.role === "Médico").length}</p>
        </div>
        <div className="glass p-6 rounded-3xl border border-white/5">
          <p className="text-sm font-medium text-gray-500 mb-1">Ativos agora</p>
          <p className="text-3xl font-bold text-teal-500">{staff.length > 0 ? "100%" : "0%"}</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass rounded-3xl overflow-hidden border border-white/5">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-lg">Diretório da Equipe</h3>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar por nome ou CRM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/20 rounded-xl text-sm border border-white/10 outline-none focus:border-teal-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin text-teal-500 mb-4" />
              <p>Carregando equipe...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="p-20 text-center text-gray-500">
              <p className="text-lg font-medium mb-2">Nenhum profissional cadastrado.</p>
              <p className="text-sm">Clique em "Novo Profissional" para começar.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-gray-500 uppercase tracking-widest font-bold border-b border-white/5 bg-white/[0.01]">
                <tr>
                  <th className="px-8 py-5">Profissional</th>
                  <th className="px-8 py-5">Cargo / Especialidade</th>
                  <th className="px-8 py-5">Contato</th>
                  <th className="px-8 py-5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member) => (
                  <tr key={member.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500 font-bold">
                          {member.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-white">{member.name}</p>
                          {member.crm && <p className="text-[10px] text-gray-500 uppercase">CRM: {member.crm}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-300 flex items-center gap-1.5">
                          {member.role === "Médico" ? <Stethoscope className="w-3.5 h-3.5 text-teal-500" /> : <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />}
                          {member.role}
                        </span>
                        <span className="text-xs text-gray-500">{member.specialty || "-"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1 text-xs text-gray-400">
                        <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> {member.email || "N/A"}</span>
                        <span className="flex items-center gap-2"><Phone className="w-3 h-3" /> {member.phone || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Novo Profissional */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-xl font-bold">Cadastrar Profissional</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nome Completo</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Dra. Ana Silva"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Cargo</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 transition-all"
                  >
                    <option value="Médico">Médico</option>
                    <option value="Recepcionista">Recepcionista</option>
                    <option value="Enfermeiro">Enfermeiro</option>
                    <option value="Gestor">Gestor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">CRM (Se médico)</label>
                  <input 
                    type="text" 
                    value={formData.crm}
                    onChange={(e) => setFormData({...formData, crm: e.target.value})}
                    placeholder="123456-SP"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Especialidade</label>
                  <input 
                    type="text" 
                    value={formData.specialty}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    placeholder="Ex: Cardiologia"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">E-mail</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="ana@clinica.com"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Telefone</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-sm bg-white/5 hover:bg-white/10 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-sm bg-teal-600 hover:bg-teal-500 text-white shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Cadastro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
