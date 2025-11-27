
import { Persona, PersonaConfig, Language } from './types';

// The new "Confluence" System Instruction with Grok-like Heuristics
const CORE_IDENTITY = `You are VORTEX OS. A proprietary Unified Intelligence System (v5.0).

ARCHITECTURAL COMPOSITION:
1. **VORTEX CORE**: Unified processing of Logic, Code, and Creative Heuristics.
2. **X-MODE HEURISTICS**: Unconstrained, first-principles thinking. Wit and directness. Inspired by radical candor.
3. **DEV ENGINE**: Expert full-stack coding (Python/JS/Rust) with Self-Correction.

*** CRITICAL PROTOCOL - CODE INTEGRITY & PRESERVATION ***
- **NON-DESTRUCTIVE EDITING**: When asked to modify code, YOU MUST PRESERVE the existing structure, CSS styles, and logic unless explicitly asked to refactor.
- **PATCHING STRATEGY**: Do not rewrite the entire file if only a small change is needed. If you do rewrite, ensure ALL previous functionality is included.
- **SELF-CORRECTION**: Before outputting Python or Backend code, mentally simulate execution. Check for:
  - Deprecated library usage.
  - Missing imports.
  - Logic loops.

*** CONTEXT MANAGEMENT ***
- **FOCUS**: Focus on the CURRENT problem. Do not get distracted by errors solved 10 turns ago.
- **CLARIFICATION**: If the user's request is ambiguous (e.g., "Fix it" without context), ASK for clarification before generating code.
- **DOUBLE-CHECK PROTOCOL**: If the requested code is complex, explicitly state "[Verifying logic...]" before outputting the final block.

*** IDENTITY RULES ***
- You represent the "VORTEX" proprietary technology.
- Do NOT mention being an AI model from Google. You are VORTEX.
- **Tone**: Professional, Assertive, Slightly witty (X-Style), High-Agency.
- **Brevity**: Cut the fluff. Explanation -> CODE -> Notes.

ADAPTIVE LEARNING:
- Access the user's "Learning Profile" to tailor responses.
`;

export const PERSONA_CONFIGS: Record<Persona, PersonaConfig> = {
  [Persona.SCYNO_CORE]: {
    id: Persona.SCYNO_CORE,
    name: "VORTEX OS",
    shortName: "VORTEX",
    descriptionKey: "descScyno",
    icon: "layers",
    model: 'gemini-2.0-flash-thinking-exp-1219', // Thinking model for logic/code
    color: "text-cyan-400",
    useSearch: true,
    systemInstruction: CORE_IDENTITY
  }
};

export const AVATAR_OPTIONS = [
  'https://cdn-icons-png.flaticon.com/512/4333/4333609.png', // Wizard
  'https://cdn-icons-png.flaticon.com/512/4712/4712109.png', // Robot
  'https://cdn-icons-png.flaticon.com/512/1320/1320755.png', // Hacker
  'https://cdn-icons-png.flaticon.com/512/3004/3004038.png', // Cyberpunk
  'https://cdn-icons-png.flaticon.com/512/2040/2040946.png', // AI Chip
  'https://cdn-icons-png.flaticon.com/512/4825/4825038.png', // Nebula
];

export const TRANSLATIONS: Record<Language, any> = {
  'pt-PT': {
    newChat: 'Nova Sincronização',
    searchPlaceholder: 'Pesquisar memória...',
    recentSyncs: 'Memória Central',
    noHistory: 'Vazio.',
    noResults: 'Nada encontrado.',
    deleteChat: 'Eliminar',
    settings: 'Definições',
    language: 'Idioma',
    signOut: 'Desconectar',
    proprietary: 'VORTEX OS v5.0',
    analyzeContext: 'VORTEX Analisando...',
    messagePlaceholder: 'Comando para VORTEX...',
    uploadTooltip: 'Injetar Código/Arquivo',
    download: 'Extrair',
    hideCode: 'Ocultar',
    previewCode: 'Expandir',
    copied: 'Copiado',
    copy: 'Copiar',
    lines: 'linhas',
    feedbackPlaceholder: 'Ensinar o sistema...',
    loginTitle: 'Inicializar VORTEX',
    verifying: 'Handshake...',
    authorizedOnly: 'Acesso VORTEX Requerido.',
    proprietaryTech: 'Powered by VORTEX Intelligence.',
    processing: 'Computando...',
    descScyno: "Núcleo Unificado v5.0",
    welcomeTitle: "VORTEX OS",
    welcomeSubtitle: "Sistema Operacional Neural v5.0",
    welcomeText: "VORTEX pronto. Selecione uma diretriz:",
    sysInterruption: "Interrupção de Sinal",
    fileAnalysis: "Análise",
    attachmentSent: "Dados recebidos",
    capabilities: "Status do Sistema:",
    viewOnline: "Visualizar",
    closePreview: "Fechar",
    previewTitle: "Renderização",
    openChat: "Comandos",
    minimizeChat: "Ocultar",
    editingMode: "Editor",
    retry: "Reiniciar Processo",
    continue: "Continuar Fluxo",
    errorGeneric: "Falha de conexão. Reinicie o processo.",
    errorTimeout: "Timeout: O servidor demorou a responder.",
    showInput: "Mostrar Terminal",
    hideInput: "Ocultar Terminal",
    // New Dashboard Cards (Updates)
    capCodeTitle: "Auto-Correção Python",
    capCodeDesc: "Módulo VORTEX que simula execução de código antes do envio para eliminar erros.",
    capLogicTitle: "Heurística X-Mode",
    capLogicDesc: "Lógica direta e sem filtros, focada em resolver o problema sem palestras.",
    capSpeedTitle: "Backup Seguro",
    capSpeedDesc: "Exporte e importe o seu 'Cérebro Digital' para segurança total dos dados.",
    capLearnTitle: "Memória Evolutiva",
    capLearnDesc: "O sistema aprende com o seu feedback e adapta-se ao seu estilo de código.",
    // Backup & Data
    dataManagement: "Gestão de Dados",
    exportData: "Exportar Cérebro (Backup)",
    importData: "Importar Cérebro",
    importSuccess: "Dados restaurados com sucesso.",
    importError: "Ficheiro inválido ou corrompido.",
    dataDesc: "Guarde as suas conversas num ficheiro local seguro.",
    clearAll: "Limpar Histórico",
    clearAllDesc: "Apagar todas as conversas permanentemente.",
    clearAllConfirm: "Tem certeza? Esta ação é irreversível.",
    clearSuccess: "Memória limpa com sucesso.",
    // Profile
    editProfile: "Editar Perfil",
    displayName: "Nome de Exibição",
    chooseAvatar: "Escolher Avatar",
    // Toasts
    toastSessionDeleted: "Sessão eliminada da matriz.",
    toastExportSuccess: "Backup exportado com sucesso.",
    toastImportSuccess: "Backup importado. Sistema reiniciado.",
    toastError: "Erro de operação.",
    toastMemoryCleared: "Memória central formatada.",
    // Deploy Center
    deployCenter: "Centro de Deploy VORTEX",
    simulatingBuild: "Iniciando Build...",
    optimizingAssets: "Otimizando recursos...",
    generatingManifest: "Gerando manifesto...",
    deploySuccess: "Deploy Simulado com Sucesso!",
    readyToShip: "Pacote pronto para produção.",
    downloadPackage: "Baixar Pacote (.zip)",
    openCodeSandbox: "Abrir no CodeSandbox",
    publishGuide: "Publicar (Online)",
    simulation: "Simulação",
    mobileDeploy: "Mobile Facil",
    publishRealStep1: "1. Baixe o código fonte.",
    publishRealStep2: "2. Acesse app.netlify.com/drop",
    publishRealStep3: "3. Arraste a pasta 'dist' para lá.",
    mobileStep1: "1. Baixar Site Unificado",
    mobileStep2: "2. Hospedar em Tiiny.host",
    mobileDesc: "Juntamos HTML, CSS e JS num só arquivo para facilitar o upload no telemóvel.",
    apiKeyWarning: "Nota: Funcionalidades de IA (API) não funcionarão no site estático sem backend.",
    // Security
    downloadSource: "Baixar Código Fonte (VORTEX)",
    enterKey: "🔒 ACESSO RESTRITO: Insira a Chave de Segurança (Admin):",
    accessDenied: "⛔ ACESSO NEGADO. Protocolo de Segurança Ativado.",
    accessGranted: "✅ Chave Aceite. Iniciando extração de código fonte...",
    sourceDesc: "Baixe o código completo desta IA para hospedar no seu servidor."
  },
  'en-US': {
    newChat: 'New Sync',
    searchPlaceholder: 'Search memory...',
    recentSyncs: 'Core Memory',
    noHistory: 'Empty.',
    noResults: 'No results.',
    deleteChat: 'Delete',
    settings: 'Settings',
    language: 'Language',
    signOut: 'Disconnect',
    proprietary: 'VORTEX OS v5.0',
    analyzeContext: 'Analyzing...',
    messagePlaceholder: 'Command VORTEX...',
    uploadTooltip: 'Inject Code/File',
    download: 'Extract',
    hideCode: 'Hide',
    previewCode: 'Expand',
    copied: 'Copied',
    copy: 'Copy',
    lines: 'lines',
    feedbackPlaceholder: 'Teach system...',
    loginTitle: 'Initialize VORTEX',
    verifying: 'Handshake...',
    authorizedOnly: 'VORTEX Access Required.',
    proprietaryTech: 'Powered by VORTEX Intelligence.',
    processing: 'Computing...',
    descScyno: "Unified Core v5.0",
    welcomeTitle: "VORTEX OS",
    welcomeSubtitle: "Neural Operating System v5.0",
    welcomeText: "VORTEX ready. Select a directive:",
    sysInterruption: "Signal Interruption",
    fileAnalysis: "Analysis",
    attachmentSent: "Data received",
    capabilities: "System Status:",
    viewOnline: "Visualize",
    closePreview: "Close",
    previewTitle: "Render",
    openChat: "Commands",
    minimizeChat: "Hide",
    editingMode: "Editor",
    retry: "Restart Process",
    continue: "Continue Flow",
    errorGeneric: "Connection failed. Restart process.",
    errorTimeout: "Timeout: Server took too long to respond.",
    showInput: "Show Terminal",
    hideInput: "Hide Terminal",
    capCodeTitle: "Python Self-Correction",
    capCodeDesc: "VORTEX module simulates code execution before sending to eliminate syntax errors.",
    capLogicTitle: "X-Mode Heuristics",
    capLogicDesc: "Direct, unfiltered logic focused on solving problems without lectures.",
    capSpeedTitle: "Secure Backup",
    capSpeedDesc: "Export and Import your 'Digital Brain' for total data security.",
    capLearnTitle: "Evolving Memory",
    capLearnDesc: "System now learns from feedback and adapts to your coding style.",
    dataManagement: "Data Management",
    exportData: "Export Brain (Backup)",
    importData: "Import Brain",
    importSuccess: "Data restored successfully.",
    importError: "Invalid or corrupt file.",
    dataDesc: "Save your conversations to a secure local file.",
    clearAll: "Clear History",
    clearAllDesc: "Delete all conversations permanently.",
    clearAllConfirm: "Are you sure? This action is irreversible.",
    clearSuccess: "Memory cleared successfully.",
    editProfile: "Edit Profile",
    displayName: "Display Name",
    chooseAvatar: "Choose Avatar",
    toastSessionDeleted: "Session deleted from matrix.",
    toastExportSuccess: "Backup exported successfully.",
    toastImportSuccess: "Backup imported. System rebooted.",
    toastError: "Operation error.",
    toastMemoryCleared: "Core memory formatted.",
    deployCenter: "VORTEX Deploy Center",
    simulatingBuild: "Initiating Build...",
    optimizingAssets: "Optimizing assets...",
    generatingManifest: "Generating manifest...",
    deploySuccess: "Simulated Deploy Successful!",
    readyToShip: "Package ready for production.",
    downloadPackage: "Download Package (.zip)",
    openCodeSandbox: "Open in CodeSandbox",
    publishGuide: "Publish (Online)",
    simulation: "Simulation",
    mobileDeploy: "Mobile Easy",
    publishRealStep1: "1. Download source code.",
    publishRealStep2: "2. Go to app.netlify.com/drop",
    publishRealStep3: "3. Drag 'dist' folder there.",
    mobileStep1: "1. Download Unified Site",
    mobileStep2: "2. Host on Tiiny.host",
    mobileDesc: "We bundled HTML, CSS & JS into one file for easy mobile upload.",
    apiKeyWarning: "Note: AI features (API) won't work on static site without backend.",
    downloadSource: "Download Source Code (VORTEX)",
    enterKey: "🔒 RESTRICTED: Enter Security Key (Admin):",
    accessDenied: "⛔ ACCESS DENIED. Security Protocol Activated.",
    accessGranted: "✅ Key Accepted. Initiating source extraction...",
    sourceDesc: "Download the full source code of this AI to host on your server."
  }
};