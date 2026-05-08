"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, User, Stethoscope, Sparkles, AlertCircle, CheckCircle2, UserCircle, Loader2 } from "lucide-react";
import clsx from "clsx";

export default function CadastroPage() {
  const router = useRouter();
  const [role, setRole] = useState<"doctor" | "patient">("doctor");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    crm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role: role
        }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Erro ao realizar cadastro.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--background) flex flex-col items-center justify-center relative overflow-hidden py-12">
      {/* Background gradients */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[120px] mix-blend-screen pointer-events-none" />

      <div className="z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm mb-6 text-gray-300 animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Junte-se à Iris AI</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2 bg-linear-to-r from-white to-gray-500 bg-clip-text text-transparent">
            Crie sua conta
          </h1>
          <p className="text-gray-400 text-sm">
            Escolha seu perfil e preencha seus dados para começar.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl mb-8 relative">
          <button 
            onClick={() => setRole("doctor")}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all z-10",
              role === "doctor" ? "text-white" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <Stethoscope className="w-4 h-4" />
            Doutor
          </button>
          <button 
            onClick={() => setRole("patient")}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all z-10",
              role === "patient" ? "text-white" : "text-gray-500 hover:text-gray-300"
            )}
          >
            <UserCircle className="w-4 h-4" />
            Paciente
          </button>
          {/* Animated background for active tab */}
          <div 
            className={clsx(
              "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-emerald-600 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/20",
              role === "doctor" ? "left-1" : "left-[calc(50%+2px)]"
            )}
          />
        </div>

        <div className="glass p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Decorative glass reflection */}
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold">Tudo pronto!</h2>
              <p className="text-gray-400 text-sm">
                Sua conta foi criada com sucesso. <br/>Aguarde o redirecionamento...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3 animate-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1" htmlFor="name">
                  Nome Completo
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-3.5 border border-white/10 rounded-2xl bg-black/20 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all text-sm"
                    placeholder={role === "doctor" ? "Dr. João Silva" : "João Silva"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1" htmlFor="email">
                  E-mail Profissional
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-3.5 border border-white/10 rounded-2xl bg-black/20 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all text-sm"
                    placeholder="contato@clinica.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1" htmlFor="password">
                    Senha
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3.5 border border-white/10 rounded-2xl bg-black/20 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all text-sm"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1" htmlFor="confirmPassword">
                    Confirmar
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3.5 border border-white/10 rounded-2xl bg-black/20 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {role === "doctor" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1" htmlFor="crm">
                    CRM <span className="text-emerald-500/50 font-normal normal-case">(Obrigatório para Doutores)</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <input
                      id="crm"
                      type="text"
                      required={role === "doctor"}
                      value={formData.crm}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-3.5 border border-white/10 rounded-2xl bg-black/20 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all text-sm"
                      placeholder="123456-SP"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center items-center gap-2 px-4 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/40 disabled:opacity-70 disabled:cursor-not-allowed mt-6 active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Finalizar Cadastro
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Já possui uma conta?{" "}
                <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                  Acessar agora
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
