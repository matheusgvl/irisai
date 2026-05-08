# Guia Operacional de Configuração: Iris AI

Este guia detalha os passos necessários para conectar o backend do Iris AI aos serviços externos e colocar a aplicação para rodar em seu ambiente local ou de produção.

## 1. Banco de Dados (Supabase)
O projeto utiliza Prisma com PostgreSQL. Recomendamos o **Supabase** pela facilidade de integração.

1.  Crie um projeto no [Supabase](https://supabase.com/).
2.  Vá em **Project Settings > Database**.
3.  Copie a **Connection String (Transaction)** e cole em `DATABASE_URL` no seu arquivo `.env`.
4.  Copie a **Connection String (Session)** e cole em `DIRECT_URL`.
5.  No terminal do projeto, execute:
    ```bash
    npx prisma db push
    ```

## 2. Inteligência Artificial (OpenAI)
Para gerar resumos e notas SOAP automaticamente.

1.  Crie uma conta na [OpenAI Platform](https://platform.openai.com/).
2.  Gere uma nova **API Key**.
3.  Cole em `OPENAI_API_KEY` no seu arquivo `.env`.
    *O projeto já está configurado para usar o modelo `gpt-4o`.*

## 3. Autenticação (NextAuth + Google)
Para permitir o login social e proteção de rotas.

1.  Vá ao [Google Cloud Console](https://console.cloud.google.com/).
2.  Crie um novo projeto e configure a **OAuth Consent Screen**.
3.  Em **Credentials**, crie uma **OAuth 2.0 Client ID** (Web Application).
4.  Adicione as URIs de redirecionamento:
    - `http://localhost:3000/api/auth/callback/google`
5.  Copie o `Client ID` e o `Client Secret` para o seu `.env`.

## 4. Variáveis de Ambiente (.env)
Seu arquivo `.env` final deve se parecer com isto:

```env
# Database
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="uma-chave-aleatoria-muito-longa"

# Google Auth
GOOGLE_CLIENT_ID="seu-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="seu-secret"

# AI
OPENAI_API_KEY="sk-..."
```

---

## 5. Executando a Aplicação
Após configurar o `.env` e rodar o `prisma db push`:

```bash
npm install
npm run dev
```

> [!TIP]
> **Dica de Teste**: Você pode criar um primeiro paciente no diretório e depois ir em "Nova Sessão" > "Chat do Paciente". Ao clicar em "Gerar Relatório", a IA salvará automaticamente a consulta no banco de dados.
