# Sistema de Prontuário SOAP - Iris Scribe

## 📋 Visão Geral

O sistema de Prontuário SOAP foi desenvolvido para facilitar a geração automática de prontuários clínicos estruturados no formato SOAP (Subjective, Objective, Assessment, Plan) usando inteligência artificial.

## 🎯 O que é SOAP?

**SOAP** é um acrônimo para um formato estruturado de documentação clínica:

- **S (Subjetivo)**: Queixa principal, sintomas, histórico relatado pelo paciente
- **O (Objetivo)**: Dados observáveis, sinais vitais, achados clínicos
- **A (Avaliação)**: Diagnóstico presuntivo, diagnóstico diferencial
- **P (Plano)**: Plano terapêutico, prescrições, orientações

## 🚀 Como Usar

### 1. Acessar o Sistema SOAP

Você pode acessar o sistema de duas formas:

**Opção A: Pelo Menu Lateral**
- No sidebar do dashboard, clique em "Prontuário SOAP"
- Selecione um paciente na lista
- Clique em "Iniciar Prontuário SOAP"

**Opção B: Pela Página de Pacientes**
- Acesse "Pacientes" no menu
- Na tabela, clique no botão "SOAP" (coluna Ações)
- O sistema abrirá com o paciente já pré-selecionado

### 2. Interação com a IA

O sistema funciona em 4 fases sequenciais:

**Fase 1: SUBJETIVO**
- A IA fará perguntas sobre queixa principal
- Histórico da doença atual
- Sintomas (duração, intensidade, fatores de piora/melhora)
- ~3-4 perguntas

**Fase 2: OBJETIVO**
- Perguntas sobre sinais vitais (auto-relatados)
- Observações físicas relevantes
- ~3-4 perguntas

**Fase 3: AVALIAÇÃO**
- Validação e entendimento do caso
- Confirmação de sintomas
- ~3-4 perguntas

**Fase 4: PLANO**
- Alergias e preferências de tratamento
- Disponibilidade para acompanhamento
- ~3-4 perguntas

### 3. Progresso Visual

Na barra lateral você verá:
- Status de cada fase (pendente, em progresso, concluído)
- Número de perguntas em cada fase
- Indicador visual de progresso

### 4. Resultado Final

Após completar todas as 4 fases:
- O sistema gera automaticamente um prontuário SOAP estruturado
- Todos os dados são salvos no banco de dados
- Você pode revisar e fazer download do prontuário em formato TXT

## 💾 Salvamento de Dados

O prontuário SOAP é automaticamente salvo na tabela `ClinicalSession` do banco de dados:
- **Campo**: `medicalData` (formato JSON)
- **Estrutura**:
```json
{
  "subjective": "...",
  "objective": "...",
  "assessment": "...",
  "plan": "..."
}
```

## 📥 Download

Após gerar o SOAP, você pode clicar no botão "Download" para baixar um arquivo `.txt` contendo o prontuário completo formatado.

## 🔧 Endpoints da API

O sistema utiliza 3 endpoints principais:

### POST `/api/soap/questions`
Gera a próxima pergunta em uma fase SOAP
```json
{
  "currentPhase": "subjective|objective|assessment|plan",
  "patientInfo": { /* dados do paciente */ },
  "conversationHistory": [ /* histórico de mensagens */ ]
}
```

### POST `/api/soap/chat`
Processa a resposta do paciente e gera resposta da IA
```json
{
  "userMessage": "string",
  "conversationHistory": [],
  "currentPhase": "subjective|objective|assessment|plan",
  "patientInfo": {}
}
```

### POST `/api/soap/generate`
Gera o SOAP final baseado na conversa completa
```json
{
  "patientId": "string",
  "patientData": {},
  "conversationHistory": []
}
```

## 🎨 Interface

- **Tema**: Dark mode por padrão (segue tema do dashboard)
- **Chat**: Mensagens do usuário em verde (teal), respostas da IA em cinza
- **Cores**:
  - Teal: Ações primárias, mensagens do usuário
  - Azul: Fase atual em progresso
  - Cinza: Fases pendentes

## ⚙️ Configuração

O sistema utiliza:
- **Modelo IA**: GPT-4o-mini (da OpenAI)
- **Temperatura**: 0.7 (balanceamento entre criatividade e consistência)
- **Linguagem**: Português do Brasil

## 🐛 Solução de Problemas

**Problema**: Erro ao gerar SOAP
- Verifique se a `OPENAI_API_KEY` está configurada
- Certifique-se de ter saldo na conta OpenAI
- Verifique a conexão com o banco de dados

**Problema**: Paciente não aparece na lista
- Certifique-se de ter pacientes cadastrados
- Verifique se você tem permissão para acessar esses pacientes

**Problema**: Chat não responde
- Verifique a conexão com a internet
- Tente recarregar a página
- Verifique o console do navegador para erros

## 📝 Notas Importantes

- O SOAP é gerado via IA e deve ser revisado pelo médico
- Sempre valide os dados antes de salvar no prontuário do paciente
- O sistema mantém todo o histórico da conversa para análise
- Os dados são salvos automaticamente ao finalizar

## 🔐 Segurança

- Requer autenticação para acessar
- Apenas usuários com papel de médico/profissional podem gerar SOAPs
- Dados do paciente são protegidos e auditáveis
- Todas as operações são registradas no banco de dados

---

**Versão**: 1.0  
**Data**: Maio de 2026  
**Desenvolvido por**: Iris Scribe Team
