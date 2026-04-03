import Link from "next/link";
import { ArrowRight, Mic, Sparkles, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-(--background) flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-500/20 blur-[120px] mix-blend-screen mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/20 blur-[120px] mix-blend-screen mix-blend-screen pointer-events-none" />

      <div className="z-10 text-center max-w-3xl px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm mb-6 text-gray-300">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Inteligência Artificial para Medicina</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <span className="text-gradient">Automação Clínica</span>
          <br /> em tempo real.
        </h1>
        
        <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
          Simplifique o atendimento. Grave a consulta, transcreva o áudio e deixe a IA extrair sintomas, diagnósticos e gerar anotações SOAP instantaneamente.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/dashboard"
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-full font-medium transition-all shadow-[0_0_40px_rgba(20,184,166,0.4)] hover:shadow-[0_0_60px_rgba(20,184,166,0.6)] w-full sm:w-auto"
          >
            Acessar Plataforma
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-8 py-4 rounded-full border border-white/10 glass text-white font-medium hover:bg-white/5 transition-colors w-full sm:w-auto">
            Ver Demonstração
          </button>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl px-6 z-10">
        <div className="glass p-6 rounded-2xl">
          <div className="w-12 h-12 bg-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center mb-4">
            <Mic className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Ditado Inteligente</h3>
          <p className="text-gray-400 text-sm">Grave a consulta diretamente pelo microfone ou faça upload de um áudio.</p>
        </div>
        <div className="glass p-6 rounded-2xl">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Extração por IA</h3>
          <p className="text-gray-400 text-sm">Identificação automática de sintomas, diagnósticos e medicamentos listados.</p>
        </div>
        <div className="glass p-6 rounded-2xl">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-2">Anotações SOAP</h3>
          <p className="text-gray-400 text-sm">Geração automática de notas clínicas no formato padronizado SOAP.</p>
        </div>
      </div>
    </div>
  );
}
