"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, UserPlus, FileText, ChevronRight, UserCircle, Loader2, X } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // mudancas de estados da aplicacao 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Masculino",
    cpf: "",
    email: "",
    phone: "",
  });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patients");
      if (res.ok) {
        setPatients(await res.json());
      }
    } catch (error) {
      console.error("Erro, não tem nenhum paciente cadastrado", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "", age: "", gender: "Masculino", cpf: "", email: "", phone: "" });
        fetchPatients();
      } else {
        const error = await res.text();
        alert("Erro ao cadastrar paciente: " + error);
      }
    } catch (error) {
      console.error("Error creating patient:", error);
      alert("Ocorreu um erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.cpf && p.cpf.includes(search))
  );

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Diretório de Pacientes</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie os registros clínicos e acompanhe o histórico.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-[0_4px_14px_0_rgba(20,184,166,0.39)] hover:shadow-[0_6px_20px_rgba(20,184,166,0.23)] hover:-translate-y-[1px]"
        >
          <UserPlus className="w-5 h-5" />
          Novo Paciente
        </button>
      </div>

      {/* NEW PATIENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => !isSubmitting && setIsModalOpen(false)} />
          <div className="relative w-full max-w-xl glass rounded-3xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-(--border) flex justify-between items-center bg-teal-500/5">
              <h3 className="text-xl font-bold">Cadastrar Novo Paciente</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Nome Completo</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Maria Oliveira"
                    className="w-full bg-white dark:bg-black/20 border border-(--border) rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Idade</label>
                  <input
                    required
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Ex: 45"
                    className="w-full bg-white dark:bg-black/20 border border-(--border) rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Gênero</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-white dark:bg-black/20 border border-(--border) rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">CPF (Opcional)</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full bg-white dark:bg-black/20 border border-(--border) rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Telefone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full bg-white dark:bg-black/20 border border-(--border) rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="paciente@email.com"
                    className="w-full bg-white dark:bg-black/20 border border-(--border) rounded-xl p-3 text-sm focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-(--border)">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-[0_4px_14px_0_rgba(20,184,166,0.39)] disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Paciente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-sm rounded-lg bg-white dark:bg-black/20 border border-(--border) focus:border-teal-500 outline-none w-72"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              Carregando pacientes...
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Nenhum paciente cadastrado. Comece adicionando um novo paciente.
            </div>
          ) : (
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
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className={clsx(
                      "border-b border-(--border) hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                          {patient.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                        </div>
                        {patient.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {patient.age} anos • {patient.gender}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {patient.sessions?.[0]
                        ? format(parseISO(patient.sessions[0].date), "dd 'de' MMMM, yyyy", { locale: ptBR })
                        : "Sem consultas"}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded bg-gray-100 dark:bg-white/10 text-xs font-semibold">
                        {patient._count?.sessions || 0}
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
          )}
        </div>
      </div>
    </div>
  );
}
