export type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
};

export type Session = {
  id: string;
  patient: Patient;
  date: string;
  duration: string;
  status: "Completed" | "Processing" | "Failed";
  transcript: string;
  summary: string;
  medicalData?: MedicalData;
};

export type MedicalData = {
  symptoms: string[];
  diagnosis: string[];
  medications: string[];
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
};

export const mockSessions: Session[] = [
  {
    id: "sess_001",
    patient: {
      id: "pat_001",
      name: "João Silva",
      age: 45,
      gender: "Masculino",
    },
    date: "2023-10-24T10:30:00Z",
    duration: "12m 45s",
    status: "Completed",
    transcript:
      "Médico: Olá, João. Como você está se sentindo hoje?\nPaciente: Doutor, tenho tido muita dor de cabeça ultimamente, principalmente no final da tarde. E também um pouco de enjoo.\nMédico: Entendi. Faz quanto tempo que essas dores começaram?\nPaciente: Acho que faz umas duas semanas. Tem piorado.\nMédico: E você aferiu a sua pressão nesse período?\nPaciente: Sim, medi ontem na farmácia e estava 15 por 9.\nMédico: Certo. Vamos fazer alguns exames, mas inicialmente vou prescrever um anti-hipertensivo leve e você retorna em 15 dias. Evite sal em excesso e tente caminhar 30 minutos por dia.",
    summary:
      "Paciente relata cefaleia frequente há duas semanas associada a náuseas leves. Pressão arterial aferida em 150/90 mmHg pelo próprio paciente. Conduta inicial de prescrição de anti-hipertensivo e recomendação de mudança no estilo de vida.",
    medicalData: {
      symptoms: ["Cefaleia (dor de cabeça)", "Náusea (enjoo)"],
      diagnosis: ["Hipertensão Arterial Sistêmica (HAS) - a esclarecer"],
      medications: ["Losartana 50mg (ou similar anti-hipertensivo)"],
      soap: {
        subjective:
          "Paciente do sexo masculino, 45 anos, apresenta-se no consultório relatando cefaleia predominantemente vespertina há aproximadamente duas semanas, acompanhada de episódios esporádicos de náusea. O mesmo relata ter aferido a pressão arterial na farmácia no dia anterior, com resultado de 150/90 mmHg.",
        objective:
          "Ainda sem exame físico descrito nesta transcrição. Dados relatados baseados na anamnese e aferição externa de PA (150/90 mmHg).",
        assessment:
          "Quadro altamente sugestivo de Hipertensão Arterial primária não controlada sintomática (cefaléia e naúseas). Necessário descartar outras causas sistêmicas e realizar exames laboratoriais complementares.",
        plan:
          "1. Solicitação de exames de rotina: Hemograma, Uréia, Creatinina, Sódio, Potássio, Perfil Lipídico, Glicemia de jejum, ECG.\n2. Início empírico de tratamento com anti-hipertensivo (ex: Losartana 50mg 1x/dia).\n3. Orientações MEP (Mudança de Estilo de Vida): Dieta hipossódica e início de atividade física leve (caminhada de 30min/dia).\n4. Retorno agendado em 15 dias com os resultados em mãos e MAPA (Monitorização Ambulatorial da Pressão Arterial) ou log de medidas domiciliares.",
      },
    },
  },
  {
    id: "sess_002",
    patient: {
      id: "pat_002",
      name: "Maria Fernanda",
      age: 28,
      gender: "Feminino",
    },
    date: "2023-10-24T11:15:00Z",
    duration: "08m 20s",
    status: "Completed",
    transcript:
      "Médico: Bom dia, Maria. O que te traz aqui?\nPaciente: Bom dia, Doutor. Eu tô com uma dor muito forte na garganta há 3 dias. Dói muito pra engolir, e eu tive um pouco de febre ontem à noite, não medi direito mas o corpo tava quente e doía bastante.\nMédico: Você abriu a boca para olhar? Sentiu alguma placa branca?\nPaciente: Sim, parece que tem uns pontinhos brancos lá atrás. Além disso, os gânglios aqui do pescoço tão inchados.\nMédico: Vamos dar uma olhada. (pausa) Sim, a amígdala esquerda está bem hiperemiada com exsudato purulento. Vai precisar de um antibiótico.\nPaciente: Nossa, eu já imaginava.\nMédico: Vou passar Amoxicilina com Clavulanato por 7 dias. Além do Ibuprofeno para a dor e pra febre se voltar a ter.",
    summary:
      "Paciente apresenta quadro clássico de amigdalite bacteriana (dor de garganta, febre, adenomegalia cervical, placas de pus nas amígdalas). Prescrito Amoxicilina + Clavulanato por 7 dias e sintomáticos.",
    medicalData: {
      symptoms: ["Odinofagia (dor ao engolir)", "Febre", "Mialgia", "Adenomegalia cervical"],
      diagnosis: ["Amigdalite Bacteriana Aguda"],
      medications: ["Amoxicilina + Clavulanato 875/125mg", "Ibuprofeno 600mg"],
      soap: {
        subjective:
          "Paciente do sexo feminino, 28 anos, relata odinofagia intensa com evolução de 3 dias, acompanhada de relato de febre não aferida na noite anterior e mialgia (corpo dolorido). A paciente também notou presença de aumento de linfonodos cervicais e exsudato orofaríngeo.",
        objective:
          "Exame físico da Orofaringe: hiperemia e hipertrofia amigdaliana, principalmente à esquerda, com presença de placas purulentas (exsudato). Linfonodos cervicais palpáveis, dolorosos.",
        assessment:
          "Amigdalite aguda sugestiva de etiologia bacteriana (presença de exsudato purulento, linfadenopatia e febre clínica).",
        plan:
          "1. Prescrição de Antimicrobiano: Amoxicilina associada ao Clavulanato de Potássio 875/125mg, VO, 1 comprimido a cada 12 horas por 7 dias.\n2. Sintomáticos: Ibuprofeno 600mg, VO, a cada 8 horas, se dor ou febre.\n3. Orientações sobre hidratação vigorosa e repouso relativo.\n4. Retorno se não houver melhora clínica em 48-72h.",
      },
    },
  },
  {
    id: "sess_003",
    patient: {
      id: "pat_003",
      name: "Carlos Eduardo",
      age: 62,
      gender: "Masculino",
    },
    date: "2023-10-24T14:00:00Z",
    duration: "18m 10s",
    status: "Processing",
    transcript:
      "Médico: Sr. Carlos, boa tarde. Como foram as coisas desde a nossa última consulta?\nPaciente: Boa tarde, doutor. Olha, a dor no peito melhorou bastante depois daquele remédio novo. Mas eu tenho me sentido muito cansado pra subir a escada lá de casa. Um pouco de falta de ar.\nMédico: Entendo. E os exames que eu pedi, o senhor conseguiu fazer o ecocardiograma?",
    summary: "Processando análise via IA...",
  },
];

export const mockUser = {
  name: "Dra. Ana Costa",
  email: "ana.costa@clinica.com",
  role: "Médico Cardiologista",
  avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
};

export const mockPatients = [
  ...Array.from(new Map(mockSessions.map(session => [session.patient.id, session.patient])).values()),
  {
    id: "pat_004",
    name: "Lúcia Albuquerque",
    age: 71,
    gender: "Feminino",
  },
  {
    id: "pat_005",
    name: "Ricardo Mendes",
    age: 34,
    gender: "Masculino",
  }
].map(p => ({
  ...p,
  lastVisit: p.id === "pat_001" ? "2023-10-24" : 
             p.id === "pat_002" ? "2023-10-24" : 
             p.id === "pat_003" ? "2023-10-24" :
             p.id === "pat_004" ? "2023-09-12" : "2023-08-05",
  totalSessions: p.id === "pat_001" ? 3 : p.id === "pat_003" ? 5 : 1
}));

