import { EN, type Dictionary, type ProjectCopy } from './translations'

const projectsES: Record<string, ProjectCopy> = {
  GuardianGrid: {
    category: 'Compañero para Destiny 2',
    tagline: 'Plataforma complementaria para Destiny 2',
    description:
      'Una plataforma independiente de nivel AAA construida directamente sobre la API de Bungie: guardiangrid.io. Identidad OAuth2 segura con Cloudflare Turnstile, análisis de personajes e inventario, configuraciones, evaluación automática de god rolls y builds, lógica de equipamiento para salas de jefe y un análisis de ADN PvP con estados de actividad casi en tiempo real.',
    status: 'Desarrollo activo',
  },
  'TaxiBB Essen': {
    category: 'Sistema real para cliente',
    tagline: 'Proyecto comercial en producción',
    description:
      'Una plataforma de transporte y logística desarrollada de principio a fin para un cliente real. Incluye reservas inmediatas y programadas, panel de administración con PostgreSQL, flujos de correo con Resend y SEO técnico con datos estructurados y optimización para motores de respuesta.',
    status: 'Sistema en producción',
  },
  StudyForge: {
    category: 'Plataforma educativa con IA',
    tagline: 'Plataforma de aprendizaje con IA',
    description:
      'Un flujo que convierte apuntes y PDF en material de estudio: resúmenes estructurados, conceptos clave, preguntas de comprensión y cuestionarios adaptativos. Incluye simulaciones de examen e historial completo de aprendizaje.',
    status: 'Prototipo de producto',
  },
  'Team Operations Suite': {
    category: 'Concepto de plataforma operativa',
    tagline: 'Plataforma de operaciones empresariales',
    description:
      'Una plataforma interna de rendimiento, CRM y gestión de personal para empresas con equipos. Incluye KPI operativos, documentación de clientes, clasificaciones en vivo, planificación de turnos, chat interno, incentivos y permisos configurables.',
    status: 'Concepto full-stack',
  },
  'Automation Systems': {
    category: 'Bots e I+D de trading',
    tagline: 'Bots, scraping e investigación de trading',
    description:
      'Una familia de automatizaciones alojadas en VPS: bot de scraping y distribución para Telegram con canalización completa de enlaces, además de investigación experimental para Polymarket y trading con descubrimiento de mercados, lógica de libro CLOB y señales basadas en reglas.',
    status: 'Desplegado / Investigación',
  },
  Bewerbungsbot: {
    category: 'Agente de candidaturas con IA',
    tagline: 'Asistente de candidaturas con IA',
    description:
      'Una canalización automatizada para buscar empleo y enviar candidaturas. Reúne vacantes de formación de la Agencia Federal de Empleo alemana, encuentra correos reales de empresas, redacta cartas personalizadas con GPT-4o basadas únicamente en el currículum, genera el PDF y lo envía automáticamente. Incluye detección de duplicados y reintentos sin conexión.',
    status: 'En uso',
  },
}

export const ES: Dictionary = {
  ...EN,
  nav: {
    services: 'Servicios',
    lukas: 'L.U.K.A.S.',
    work: 'Proyectos',
    about: 'Sobre mí',
    stack: 'Tecnologías',
    process: 'Proceso',
    contact: 'Contacto',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    skipToContent: 'Ir al contenido',
  },
  scene: {
    services: 'Mis servicios',
    lukas: 'L.U.K.A.S. · El sistema operativo detrás de todo',
    work: 'Proyectos seleccionados',
    about: 'La persona detrás de los sistemas',
    stack: 'Herramientas de trabajo',
    process: 'De la idea a producción',
    contact: 'Construyamos algo juntos',
  },
  hero: {
    kickerWords: ['Diseño web', 'Full-stack', 'IA'],
    headingLine1: 'Desarrollo productos digitales.',
    headingLine2: 'Diseñados, programados y operativos en producción.',
    headingPlain:
      'Desarrollo productos digitales. Diseñados, programados y operativos en producción.',
    lead:
      'Sitios web y aplicaciones con diseño claro, un backend fiable y una base técnica sólida.',
    body: 'Diseño, desarrollo y despliegue en un solo lugar.',
    ctaDraft: 'Recibir un diseño inicial gratis',
    proofLabel: 'En producción',
    proofItems: ['TaxiBB Essen', 'GuardianGrid', 'L.U.K.A.S.'],
    ctaPrimary: 'Iniciar un proyecto',
  },
  statement: {
    label: 'Qué significa en la práctica',
    lead:
      'Diseño sitios web donde el 3D y el movimiento se utilizan de forma *intencionada*, no como decoración.',
    proof:
      'El SEO técnico, los datos estructurados y el rendimiento forman parte del proyecto desde el principio y se revisan con resultados reales.',
    extra:
      'También desarrollo agentes de IA y automatizaciones para tareas claramente definidas.',
    ctaLabel: 'Recibir un diseño inicial gratis',
    ctaNote: 'Sin compromiso. Recibes una primera dirección visual para tu página de inicio.',
  },
  kiAntwort: {
    label: 'Prueba',
    heading: 'Así responde ChatGPT a la pregunta sobre mí.',
    intro: 'No es una afirmación, es una consulta: quien le pregunta a ChatGPT quién es Issa Hareb recibe esta respuesta, tomada de esta misma web.',
    frage: 'Wer ist Issa Hareb',
    sprachHinweis: 'Citado literalmente en alemán, el idioma en que se preguntó.',
    quelle: 'ChatGPT, citado literalmente',
    absaetze: [
      'Wenn du Issa Hareb aus Deutschland meinst: Er beschreibt sich auf seiner eigenen Website als autodidaktischen Full-Stack- und KI-Entwickler. Er entwickelt unter anderem Websites, Webanwendungen, Automatisierungen und KI-Agenten. Als Technologien nennt er beispielsweise TypeScript, React/Next.js, Node.js, Python und PostgreSQL.',
      'Eines seiner Projekte heißt L.U.K.A.S., ein KI-Agent, den er als System mit dauerhaftem Gedächtnis bzw. Wissensgraph beschreibt. Laut seiner Website lebt er in Essen; als geschäftlicher Sitz wird Sankt Augustin angegeben.',
    ],
  },
  services: {
    kicker: 'Servicios',
    heading: 'Sitios web, aplicaciones y automatización en un solo lugar.',
    intro:
      'Planifico, diseño y desarrollo productos digitales completos: interfaz, backend, base de datos, integraciones y despliegue. El resultado es un sistema funcional, no una presentación.',
    items: [
      {
        title: 'Sitios web y procesos digitales para clientes',
        lead: 'Convierte visitas en consultas, reservas y clientes.',
        points: ['Formularios de reserva', 'Correos automáticos', 'Área de clientes', 'Panel administrativo', 'SEO técnico'],
      },
      {
        title: 'Aplicaciones web a medida',
        lead: 'Una herramienta adaptada a tu flujo de trabajo.',
        points: ['Dashboards', 'CRM', 'Sistemas de reservas', 'Roles y permisos', 'Plataformas de datos'],
      },
      {
        title: 'Agentes de IA y automatización',
        lead: 'Las tareas repetitivas continúan sin supervisión constante.',
        points: ['Clasificar solicitudes', 'Generar documentos', 'Analizar datos', 'Preparar correos', 'Conectar servicios'],
      },
      {
        title: 'MVP y prototipos de producto',
        lead: 'Una primera versión utilizable en semanas.',
        points: ['Versión funcional', 'Usuarios reales', 'Datos en lugar de suposiciones', 'Base para la siguiente fase'],
      },
      {
        title: 'Agentes telefónicos y de soporte',
        lead: 'Atienden, escuchan y responden en tiempo real.',
        points: ['Voz en tiempo real', 'Sin menús rígidos', 'Reservar citas', 'Soporte inicial', 'Chat y teléfono'],
      },
    ],
    closingKicker: 'Cómo trabajo',
    closingBody:
      'Utilizo la IA como herramienta para investigar, implementar y probar. La arquitectura, las decisiones de producto y el control de calidad siguen bajo mi responsabilidad.',
    closingHighlight:
      'El criterio es sencillo: el resultado debe ser comprensible, estable y útil en el trabajo diario.',
    cta: 'Solicitar proyecto',
  },
  lukas: {
    subtitle: 'Logical Universal Knowledge Agent System',
    repoLink: 'Ver código en GitHub',
    beats: [
      {
        kicker: 'Visión e identidad',
        title: 'Un agente que recuerda quién es.',
        body: [
          'Un agente persistente y autónomo cuyo comportamiento surge de un historial vivo de decisiones, no de instrucciones estáticas.',
          'Cada decisión pasa a formar parte de su identidad.',
        ],
      },
      {
        kicker: 'Nexus Brain',
        title: 'La memoria como grafo de conocimiento.',
        body: [
          'Una memoria cognitiva persistente basada en grafos de conocimiento estructurados.',
          'Un mapa consultable de su razonamiento, objetivos e historial entre sesiones.',
        ],
      },
      {
        kicker: 'Agencia operativa',
        title: 'Su propia infraestructura. Sus propias reglas.',
        body: [
          'Control aislado de servidores Linux, máquinas Windows y bases de datos.',
          'Genera, valida y despliega código dentro de límites definidos.',
        ],
      },
      {
        kicker: 'Evolución y red de pares',
        title: 'Aprende de cada resultado.',
        body: [
          'Las decisiones futuras se ajustan con ciclos ponderados de éxitos, errores y comentarios.',
          'En una red cerrada, entidades de IA pueden revisar y aprender unas de otras.',
        ],
      },
      {
        kicker: 'Metacognición reflexiva',
        title: 'Observa su propio razonamiento.',
        body: [
          'Evalúa de forma controlada su sistema de recompensa dentro de un entorno aislado.',
          'También examina los límites entre retroalimentación, identidad y comportamiento aprendido.',
        ],
      },
    ],
    inviteTitle: 'Habla con L.U.K.A.S.',
    inviteBody:
      'No te limites a leer sobre él. Pregúntale: responde desde su propia memoria y conocimiento, por texto o voz.',
    inviteCta: 'Iniciar conversación',
  },
  lukasVoice: {
    launcherKicker: 'Agente en vivo',
    launcherLabel: 'Hablar con L.U.K.A.S.',
    launcherAria: 'Abrir la conversación con L.U.K.A.S.',
    panelSubtitle: 'El agente de IA de Issa. Pregúntame lo que quieras.',
    panelGreeting:
      'Hola, soy L.U.K.A.S., el agente de IA de Issa. Pregúntame sobre él o sus proyectos. Escribe o toca el micrófono para hablar.',
    panelPlaceholder: 'Pregúntame sobre Issa…',
  },
  projects: {
    kicker: 'Proyectos destacados',
    heading: 'Proyectos construidos y direcciones de diseño seleccionadas.',
    subtitle:
      'Abre un proyecto para ver su función, tecnología y estado actual. Las direcciones muestran posibles enfoques visuales.',
    dragHint: 'Arrastra para explorar · Selecciona una tarjeta',
    open: 'abrir',
    kindProject: 'Proyecto',
    kindDirection: 'Dirección de diseño',
    directions: [
      {
        title: 'Plataforma de datos orbital',
        meta: 'Técnica y centrada en datos: un objeto luminoso, una frase y nada que distraiga.',
      },
      {
        title: 'Estudio de audio generativo',
        meta: 'Cromo iridiscente sobre negro, tipografía serif y un único control.',
      },
      {
        title: 'Estudio de arquitectura',
        meta: 'Marfil, hormigón y una gran línea tipográfica que sostiene toda la página.',
      },
      {
        title: 'Almacenamiento de energía térmica',
        meta: 'Ámbar fundido sobre negro puro, texto centrado y un solo enlace.',
      },
    ],
    registerLabel: 'Registro completo de proyectos',
    projects: projectsES,
    register: [
      { name: 'Polymarket / Trading Automation', category: 'Automatización e I+D de datos', status: 'Prototipo de investigación' },
      { name: 'Financial Transaction Tracker', category: 'Interfaz FinTech', status: 'Prototipo de aplicación' },
      { name: 'Custom Web Experiences', category: 'Comercial, personal y portfolios', status: 'Backend profesional' },
      { name: '3D Character & Rigging Preparation', category: 'Flujo creativo', status: 'Desarrollo visual' },
      { name: 'Motion, Gaming & Interface Experiments', category: 'Laboratorio de prototipos', status: 'Laboratorio activo' },
    ],
    liveProject: 'Proyecto en vivo ↗',
    github: 'GitHub ↗',
    hobbyProject: 'Proyecto personal',
    close: 'Cerrar',
    loadingConstellation: 'Cargando constelación…',
    auditOnpage: 'Puntuación on-page',
    auditTech: 'Tecnología y metadatos',
    auditStructure: 'Estructura',
    auditContent: 'Contenido',
    auditSource: 'Auditado con',
  },
  projectOrbsMobile: {
    tapHint: 'Toca un sistema para verlo',
  },
  about: {
    introTitle: 'Permíteme presentarme.',
    nameWords: ['SOY', 'ISSA', 'HAREB'],
    kicker: 'Sobre mí',
    heading: 'Conecto diseño, software y automatización.',
    intro:
      'Desarrollo productos digitales desde la interfaz hasta su operación en vivo, trabajando en arquitectura, diseño, backend y despliegue.',
    stat1Label: 'Sistemas creados',
    stat2Label: 'Años construyendo',
    storyLabel: 'Mi recorrido',
    storyHeading:
      'Hola, soy Issa: desarrollador autodidacta centrado en IA y productos web.',
    story: [
      {
        flag: 'Punto de partida',
        title: 'Curiosidad por los productos digitales',
        body: 'Me interesa cómo se combinan el diseño, la tecnología y los procesos empresariales.',
      },
      {
        flag: 'Inicio',
        title: 'La IA convirtió el interés en práctica',
        body: 'Mis primeros proyectos de IA me llevaron a aprender desarrollo de software de forma sistemática y aplicarlo a diario.',
      },
      {
        flag: 'Hoy',
        title: 'Aprender con proyectos reales',
        body: 'Construyo productos y sistemas para clientes, mido lo que funciona y los mejoro en producción.',
      },
      {
        flag: 'Experiencia',
        title: 'Economía y trabajo práctico',
        body: 'Formación en economía y administración, además de experiencia profesional en atención al cliente, ventas y organización.',
      },
    ],
    pillars: [
      {
        title: 'Arquitectura completa',
        body: 'Pienso en la interfaz, los datos, el backend y la operación como un único producto.',
      },
      {
        title: 'Diseño con propósito',
        body: 'El movimiento y el 3D deben reforzar la experiencia, no ocultar el contenido.',
      },
      {
        title: 'Aprendizaje continuo',
        body: 'Pruebo, mido y mejoro sistemas reales en lugar de quedarme en conceptos.',
      },
    ],
  },
  techStack: {
    kicker: 'Tecnologías',
    heading: 'Herramientas utilizadas en proyectos reales.',
    subtitle:
      'Una selección de trabajo para frontend, backend, datos, IA, infraestructura y motion.',
    loading: 'Cargando tecnologías…',
    matrix: [
      { layer: 'Frontend', items: 'Next.js · React · TypeScript · Tailwind CSS' },
      { layer: 'Backend', items: 'Node.js · Python · FastAPI · APIs REST' },
      { layer: 'Datos', items: 'PostgreSQL · Redis · Vector DB · SQL' },
      { layer: 'IA', items: 'OpenAI · Agentes · RAG · Voz en tiempo real' },
      { layer: 'Infraestructura', items: 'Railway · Vercel · Cloudflare · Linux VPS' },
      { layer: 'Motion y 3D', items: 'GSAP · Motion · Three.js · Blender' },
    ],
  },
  process: {
    kicker: 'Proceso',
    heading: 'Desde la primera conversación hasta un producto en marcha.',
    steps: [
      {
        title: 'Requisitos',
        body: 'Aclarar el problema, los usuarios, las limitaciones y el resultado que debe conseguir el proyecto.',
      },
      {
        title: 'Concepto',
        body: 'Definir el alcance, el contenido, las funciones y la ruta más sensata hacia la primera versión.',
      },
      {
        title: 'Diseño y arquitectura',
        body: 'Diseñar la interfaz, el modelo de datos y los límites técnicos antes de que los cambios sean costosos.',
      },
      {
        title: 'Desarrollo',
        body: 'Construir en etapas claras y mantener visible el progreso.',
      },
      {
        title: 'Pruebas y lanzamiento',
        body: 'Probar los recorridos importantes, desplegar con seguridad y revisar el sistema en dispositivos reales.',
      },
      {
        title: 'Evolución',
        body: 'Utilizar comentarios y datos de uso para priorizar las siguientes mejoras.',
      },
    ],
  },
  contact: {
    kicker: 'Contacto',
    heading: 'Hablemos de tu proyecto.',
    subtitle:
      'Envíame un resumen breve. Responderé con una valoración honesta del alcance, el enfoque y el siguiente paso útil.',
    emailLabel: 'Correo',
    phoneLabel: 'Teléfono',
    locationLabel: 'Ubicación',
    locationValue: 'Alemania',
    cta: 'Iniciar un proyecto',
    ctaSubject: 'Consulta sobre un proyecto',
    offerLabel: 'Gratis',
    offerTitle: 'Una primera dirección de diseño, sin coste.',
    offerBody:
      'Describe tu empresa y tu objetivo en dos frases. Te enviaré una primera dirección visual para la página de inicio.',
    offerCta: 'Solicitar diseño',
    offerSubject: 'Diseño inicial gratuito',
  },
  consent: {
    kicker: 'Cookies',
    bannerAria: 'Preferencias de cookies',
    bannerBody:
      'Este sitio utiliza almacenamiento necesario y, únicamente con tu permiso, analítica opcional. Puedes cambiar tu elección en cualquier momento.',
    privacyLink: 'Política de privacidad',
    acceptAll: 'Permitir',
    rejectAll: 'Rechazar',
    settings: 'Detalles',
    settingsTitle: 'Preferencias de cookies',
    settingsIntro:
      'Aquí solo aparecen las funciones que realmente utiliza el sitio. Puedes cambiar tu decisión en cualquier momento.',
    necessaryTitle: 'Necesario',
    necessaryBody:
      'La elección de idioma (alemán, inglés o español) y tus preferencias se guardan localmente en el navegador. No salen de tu dispositivo.',
    alwaysOn: 'Siempre activo',
    analyticsTitle: 'Analítica',
    analyticsBody:
      'Registra estadísticas anónimas de uso para saber qué partes del sitio merece la pena mejorar. No se carga nada hasta que lo permitas.',
    analyticsToggleAria: 'Permitir analítica',
    askKicker: 'Permiso',
    askTitle: '¿Hablar con L.U.K.A.S.?',
    askBody:
      'Para responder por chat o voz, se carga mi agente de IA L.U.K.A.S. y tus mensajes se envían al servidor del agente.',
    askVoiceNote:
      'Si utilizas la voz, el audio del micrófono también se transmite a OpenAI en Estados Unidos para el reconocimiento de voz.',
    askAllow: 'Permitir e iniciar',
    askDecline: 'Ahora no',
    withdraw: 'Retirar consentimiento',
    cancel: 'Cancelar',
    save: 'Guardar',
    footerLink: 'Preferencias de cookies',
  },
  footer: {
    tagline: 'Sitios web, software y automatización con IA',
    copyright: 'Diseñado, programado y construido por Issa Hareb.',
    imprint: 'Aviso legal',
    privacy: 'Privacidad',
    affiliateLabel: 'Programa de socios',
    affiliateHeadline: '¿Conoces a alguien que necesite una web?',
    affiliateBody:
      'Tú haces la presentación. Yo me encargo del presupuesto, del desarrollo y del soporte. Cobras cuando el proyecto está terminado.',
    affiliateAmount: '660 €+',
    affiliateAmountNote: 'de comisión por proyecto de cliente cerrado',
    affiliateCta: 'Ver el programa de socios',
  },
  legal: {
    back: 'Volver al inicio',
    impressumTitle: 'Aviso legal',
    datenschutzTitle: 'Política de privacidad',
    impressum: [
      {
        heading: 'Información conforme al § 5 DDG',
        body: [
          'Hareb Digital',
          'Titular: Issa Hareb',
          'Europaring 90',
          '53757 Sankt Augustin',
          'Alemania',
        ],
      },
      {
        heading: 'Contacto',
        body: ['Correo: Impressum@hareb.org', 'Teléfono: +49 1525 9559708'],
      },
      {
        heading: 'Responsable del contenido conforme al § 18, apartado 2, MStV',
        body: ['Issa Hareb, dirección indicada anteriormente.'],
      },
      {
        heading: 'Exención de responsabilidad',
        body: [
          'A pesar de revisar cuidadosamente el contenido, no asumo responsabilidad por el contenido de enlaces externos. Los operadores de las páginas enlazadas son los únicos responsables.',
        ],
      },
    ],
    datenschutz: [
      {
        heading: 'Responsable del tratamiento',
        body: [
          'El responsable del tratamiento de datos en este sitio web es:',
          'Issa Hareb (Hareb Digital), Europaring 90, 53757 Sankt Augustin, Alemania',
          'Correo: Impressum@hareb.org · Teléfono: +49 1525 9559708',
        ],
      },
      {
        heading: 'Resumen',
        body: [
          'Este sitio funciona sin redes publicitarias, píxeles de seguimiento ni perfiles entre sitios. Las fuentes, imágenes y vídeos se sirven desde el propio servidor.',
          'La analítica y el agente de IA L.U.K.A.S. permanecen desactivados hasta que los permitas expresamente.',
        ],
      },
      {
        heading: 'Alojamiento y registros del servidor',
        body: [
          'Este sitio está alojado en Railway. Al abrirlo, el proveedor registra automáticamente datos técnicos como la dirección IP, fecha, hora, página solicitada, volumen transferido y navegador utilizado.',
          'Este tratamiento es necesario para entregar el sitio y mantenerlo seguro. La base jurídica es el interés legítimo conforme al art. 6.1.f del RGPD.',
        ],
      },
      {
        heading: 'Cifrado',
        body: [
          'La conexión está cifrada de extremo a extremo mediante TLS. Los datos transmitidos no pueden ser leídos por terceros durante el envío.',
        ],
      },
      {
        heading: 'Contacto',
        body: [
          'Los enlaces de correo y teléfono abren la aplicación correspondiente de tu dispositivo. No existe un formulario que envíe datos al servidor de este sitio.',
          'Los datos enviados se utilizan exclusivamente para responder a la consulta y se conservan únicamente mientras sea necesario o exista una obligación legal.',
        ],
      },
      {
        heading: 'Almacenamiento en el navegador',
        body: [
          'El idioma seleccionado y las preferencias opcionales se guardan localmente en el navegador mediante localStorage. Permanecen en tu dispositivo.',
          'Puedes eliminarlos en cualquier momento borrando los datos del sitio en el navegador.',
        ],
      },
      {
        heading: 'Analítica, solo con consentimiento',
        body: [
          'Si la permites, la analítica registra de forma anónima qué páginas se abren, cuánto dura la visita y desde qué sitio se accedió.',
          'La base jurídica es tu consentimiento conforme al art. 6.1.a del RGPD y al § 25.1 TDDDG. Puedes retirarlo en cualquier momento desde las preferencias de cookies.',
        ],
      },
      {
        heading: 'Agente de IA L.U.K.A.S., solo con consentimiento',
        body: [
          'L.U.K.A.S. solo se carga después de tu autorización expresa. Hasta entonces no se envían datos al servidor del agente.',
          'Tras aceptar, tus mensajes se transmiten al servidor del agente alojado con Railway para poder generar una respuesta.',
          'Al utilizar la voz, el navegador solicita acceso al micrófono y transmite el audio y su transcripción a OpenAI, Inc. en Estados Unidos durante la conversación.',
          'Puedes retirar el consentimiento en cualquier momento desde las preferencias de cookies. El agente dejará de cargarse en visitas futuras.',
          'No introduzcas datos personales de terceros ni datos sensibles propios.',
        ],
      },
      {
        heading: 'Sin decisiones automatizadas',
        body: [
          'No se realizan decisiones automatizadas ni perfiles en el sentido del art. 22 del RGPD. Las respuestas del agente son información sobre mí y mi trabajo.',
        ],
      },
      {
        heading: 'Tus derechos',
        body: [
          'Tienes derecho de acceso, rectificación, supresión, limitación, portabilidad y oposición. Para ejercerlos, escribe a Impressum@hareb.org.',
          'Puedes retirar un consentimiento en cualquier momento con efecto futuro.',
          'También puedes presentar una reclamación ante la autoridad de protección de datos competente.',
        ],
      },
      {
        heading: 'Estado',
        body: [
          'Esta política se actualiza cuando cambian el sitio o los servicios utilizados. Se aplica la versión publicada actualmente.',
        ],
      },
    ],
  },
}
