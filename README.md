# Iris AI | Assistente Médico Inteligente

A **Iris AI** é uma plataforma SaaS de ponta projetada para revolucionar a documentação clínica. Utilizando Inteligência Artificial avançada, ela automatiza a captura de consultas, transcrição e geração de notas SOAP, permitindo que médicos foquem no que realmente importa: o paciente.

## ✨ Funcionalidades

- 🎙️ **Scribe Médico em Tempo Real**: Captura e transcrição de consultas via áudio.
- 🧠 **Processamento por IA**: Extração automática de sintomas, diagnósticos e medicamentos.
- 📝 **Geração de Notas SOAP**: Documentação clínica estruturada seguindo padrões globais.
- 📁 **Gestão de Pacientes**: Diretório completo com histórico clínico e métricas de desempenho.
- 🔐 **Segurança & Privacidade**: Arquitetura preparada para conformidade com normas de proteção de dados médicos.

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 4.
- **Backend & API**: Next.js API Routes, Next-Auth (Autenticação).
- **Banco de Dados**: PostgreSQL (Supabase) via Prisma ORM.
- **IA**: OpenAI API (Whisper para áudio e GPT-4 para processamento clínico).

## 🛠️ Como Iniciar

### Pré-requisitos
- Node.js 20+
- Conta no Supabase (PostgreSQL)
- Chave de API da OpenAI

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/matheusgvl/irisai.git
cd irisai
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais:
```bash
cp .env.example .env
```

4. Sincronize o banco de dados:
```bash
npx prisma db push
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3030](http://localhost:3030) no seu navegador.

---

Desenvolvido com foco na excelência clínica e produtividade médica. 🩺✨
