import { ServiceDetail, TeamMember, BlogPost, EcosystemStartup, ForumPost, Lead, BusinessStage, LegalArea, RiskItem } from '../types';

export const BINLEGAL_SERVICES: ServiceDetail[] = [
  {
    id: 'corporativo',
    number: '01',
    title: 'Corporativo',
    subtitle: 'Estructura societaria diseñada para escalar con seguridad',
    shortDescription: 'Diseñamos la arquitectura societaria, pactos de socios y esquemas de vesting para que tu empresa crezca sin fricciones entre fundadores ni contingencias fiscales.',
    fullDescription: 'El 86% de las disputas que destruyen PYMES nacen de vacíos en las reglas societarias iniciales. En BinLegal estructuramos la figura jurídica precisa (C.A., S.A.S., LLC o holding) adaptada a tu modelo de negocio, redactando estatutos personalizados, pactos de socios (shareholders agreements) y cláusulas de salida que blindan la continuidad operativa.',
    keyDeliverables: [
      'Constitución o reestructuración societaria a medida',
      'Pacto de socios (Drag-along, Tag-along, cláusulas anti-bloqueo)',
      'Planes de opción de compra de acciones (ESOP / Vesting)',
      'Libros mercantiles y gobierno corporativo para PYMES',
      'Actas de asambleas ordinarias y extraordinarias'
    ],
    commonRisks: [
      'Disputas de poder que paralizan las cuentas bancarias de la empresa',
      'Socios que abandonan el proyecto conservando el 50% de las acciones',
      'Responsabilidad patrimonial personal de los fundadores por errores societarios'
    ],
    idealStage: 'Desde la concepción de la sociedad hasta rondas de inversión'
  },
  {
    id: 'propiedad-intelectual',
    number: '02',
    title: 'Propiedad Intelectual',
    subtitle: 'Protegemos tu marca, tu software y tu know-how',
    shortDescription: 'Custodiamos el activo más valioso de tu negocio: tu identidad de marca, secretos comerciales, algoritmos y creaciones intelectuales ante registros y terceros.',
    fullDescription: 'Invertir en marketing sin registrar tu marca es construir un edificio sobre terreno ajeno. Ejecutamos búsquedas fonéticas profundas, registro de signos distintivos, cesiones de derechos de propiedad intelectual de programadores/diseñadores y acuerdos de secreto industrial (NDA de alto blindaje).',
    keyDeliverables: [
      'Búsqueda fonética y viabilidad de registro marcario ante entes oficiales (SAPI/OMPI)',
      'Tramitación completa de solicitud y defensa ante oposiciones',
      'Contratos de cesión de derechos de autor con freelancers y empleados',
      'Protección de código fuente y registro de software',
      'Protocolos de confidencialidad y acuerdos de no competencia'
    ],
    commonRisks: [
      'Pérdida de la marca por registro oportuno de un competidor malicioso',
      'Contratistas externos que reclaman la titularidad del software o código',
      'Fuga de fórmulas, bases de datos o secretos comerciales a rivales'
    ],
    idealStage: 'Antes de lanzar el producto o campaña de marketing pública'
  },
  {
    id: 'regulatorio',
    number: '03',
    title: 'Regulatorio',
    subtitle: 'Cumplimiento normativo integral de tu sector',
    shortDescription: 'Garantizamos que tu operación cumpla todas las normativas sectoriales, licencias comerciales, permisos sanitarios y regulaciones de comercio electrónico.',
    fullDescription: 'Operar al margen de la regulación expone a multas confiscatorias o cierres intempestivos. Adaptamos tu negocio a leyes tributarias, normas de protección al consumidor, normativas bancarias/Fintech y permisos sanitarios, trazando una ruta clara para operar con total tranquilidad.',
    keyDeliverables: [
      'Auditoría y diagnóstico de cumplimiento regulatorio por sector',
      'Gestión de licencias de actividades económicas y registros municipales',
      'Términos, condiciones y políticas de privacidad para plataformas web',
      'Permisología sanitaria, ambiental y de seguridad industrial',
      'Compliance en prevención de legitimación de capitales (si aplica)'
    ],
    commonRisks: [
      'Clausuras intempestivas que interrumpen el flujo de caja',
      'Sanciones por infracciones a la ley de comercio digital o datos personales',
      'Imposibilidad de acceder a pasarelas de pago o cuentas comerciales formales'
    ],
    idealStage: 'Lanzamiento comercial y apertura de nuevos canales de venta'
  },
  {
    id: 'laboral',
    number: '04',
    title: 'Laboral',
    subtitle: 'Relaciones laborales sólidas que sostienen el crecimiento',
    shortDescription: 'Estructuración de contratos de trabajo, esquemas de compensación variable y auditorías de riesgos laborales para crear equipos productivos sin pasivos ocultos.',
    fullDescription: 'La relación laboral en PYMES requiere un balance fino entre flexibilidad productiva y apego a la ley laboral vigente. Diseñamos contratos a tiempo determinado/indeterminado, convenios de confidencialidad, políticas de teletrabajo y asesoramos en desvinculaciones sin conflicto.',
    keyDeliverables: [
      'Contratos de trabajo individuales adaptados al rol y modalidad remota',
      'Esquemas de incentivos y remuneración por objetivos sin pasivos imprevistos',
      'Políticas de teletrabajo, propiedad de equipos y desconexión digital',
      'Protocolo de desvinculación laboral y acuerdos transaccionales de mutuo acuerdo',
      'Auditoría de cumplimiento de deberes formales laborales'
    ],
    commonRisks: [
      'Demandas laborales con estimaciones infladas que quiebran a la PYME',
      'Confusión jurídica entre prestador de servicios independiente y trabajador subordinado',
      'Contingencias por falta de libros de horas extras o comprobantes reglamentarios'
    ],
    idealStage: 'Contratación del primer colaborador en nómina'
  },
  {
    id: 'negociacion-mediacion',
    number: '05',
    title: 'Negociación y mediación',
    subtitle: 'Resolvemos conflictos antes de que lleguen al litigio',
    shortDescription: 'Métodos alternativos de resolución de controversias comerciales. Salvaguardamos tus relaciones estratégicas de negocios con soluciones pacíficas y eficaces.',
    fullDescription: 'Un juicio comercial promedio cuesta hasta un 40% del monto en disputa y tarda años. En BinLegal somos especialistas en mediación pragmática: sentamos a las partes en la mesa, identificamos el interés común y redactamos transacciones extrajudiciales con fuerza de cosa juzgada.',
    keyDeliverables: [
      'Estrategias de negociación preventiva para renegociación de contratos',
      'Mediación privada entre socios o con proveedores estratégicos',
      'Redacción y homologación de acuerdos transaccionales',
      'Gestión de cobro de carteras complejas mediante acuerdos de pago amistosos',
      'Diseño de cláusulas escalonadas de resolución de conflictos'
    ],
    commonRisks: [
      'Desgaste emocional y drenaje financiero en tribunales ordinarios',
      'Ruptura permanente de relaciones comerciales clave para la supervivencia',
      'Pérdida de confidencialidad de la disputa ante registros públicos'
    ],
    idealStage: 'Aparición del primer desacuerdo operativo o reestructuración de deudas'
  },
  {
    id: 'otros-servicios',
    number: '06',
    title: 'Otros servicios',
    subtitle: 'Contratos, gestoría notarial y trámites registrales',
    shortDescription: 'Soluciones directas y expeditas: redacción de contratos mercantiles a medida, poderes, trámites notariales y asesoría en contrataciones públicas y privadas.',
    fullDescription: 'Toda operación diaria necesita certeza legal sin burocracia innecesaria. Apoyamos a la PYME con revisión ágil de contratos de clientes/proveedores, poderes especiales, legalizaciones y acompañamiento presencial en notarías y registros mercantiles.',
    keyDeliverables: [
      'Contratos de prestación de servicios, distribución y suministro',
      'Poderes especiales mercantiles y judiciales',
      'Acompañamiento en firmas notariales y gestiones registrales rápidas',
      'Revisión y negociación de contratos de arrendamiento comercial',
      'Cartas de intención (LOI) y memorandos de entendimiento (MOU)'
    ],
    commonRisks: [
      'Firmar contratos estándar de internet con cláusulas lesivas no advertidas',
      'Arrendamientos comerciales con condiciones de desalojo abusivas',
      'Demoras en trámites registrales que retrasan licitaciones o créditos bancarios'
    ],
    idealStage: 'Operación continua del negocio y firma de convenios clave'
  }
];

export const BINLEGAL_TEAM: TeamMember[] = [
  {
    id: 'jose-rafael-vasquez',
    name: 'José Rafael Vásquez',
    role: 'Fundador & Director General',
    bio: 'Abogado especialista en derecho corporativo y estrategia para PYMES. Fundó BinLegal con la convicción de que la ley debe ser una catapulta de crecimiento y no un laberinto burocrático para los emprendedores.',
    specialty: 'Estrategia legal, estructuración de negocios y venture scaling',
    experience: '+12 años de trayectoria asesorando ecosistemas de negocios',
    email: 'jvasquez@binlegal.com',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&h=400&q=80'
  },
  {
    id: 'maria-fernandez',
    name: 'María Fernández',
    role: 'Socia · Corporativo & Fusiones',
    bio: 'Especialista en derecho societario, fusiones, reestructuraciones y pactos de socios. Ha estructurado más de 120 sociedades mercantiles y rondas de financiamiento temprano.',
    specialty: 'Arquitectura societaria, pactos de socios y gobierno corporativo',
    experience: '+9 años de experiencia en firmas corporativas',
    email: 'mfernandez@binlegal.com',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80'
  },
  {
    id: 'ricardo-salas',
    name: 'Ricardo Salas',
    role: 'Socio Fundador · Estrategia & Mediación',
    bio: 'Especialista en estructuración legal preventiva y mediación comercial. Enfocado en dotar a las empresas de herramientas sólidas para superar la temida barrera de los 3.5 años.',
    specialty: 'Estrategia preventiva, contratos complejos y arbitraje',
    experience: '+10 años acompañando empresas en expansión',
    email: 'rsalas@binlegal.com',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80'
  },
  {
    id: 'carlos-bermudez',
    name: 'Carlos Bermúdez',
    role: 'Director · Regulatorio & Compliance',
    bio: 'Experto en compliance normativo, permisos sectoriales y regulación comercial y aduanera. Asesora a industrias alimentarias, fintech, retail y manufactura.',
    specialty: 'Derecho administrativo, licencias comerciales y permisología',
    experience: '+8 años en consultoría regulatoria y de compliance',
    email: 'cbermudez@binlegal.com',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80'
  },
  {
    id: 'ana-rivas',
    name: 'Ana Rivas',
    role: 'Asociada · Propiedad Intelectual & Marcas',
    bio: 'Focalizada en protección de marcas, patentes, software y secretos empresariales. Ha liderado más de 300 solicitudes de signos distintivos y defensas ante oposiciones.',
    specialty: 'Marcas, patentes, derechos de autor en entornos digitales y software',
    experience: '+6 años en propiedad industrial e intelectual',
    email: 'arivas@binlegal.com',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80'
  }
];

export const BINLEGAL_BLOG: BlogPost[] = [
  {
    id: 'pacto-de-socios-pyme',
    title: 'El pacto de socios: el documento que salva a tu empresa antes del primer millón',
    category: 'Corporativo',
    date: '14 Octubre 2026',
    readTime: '5 min de lectura',
    excerpt: '¿Qué pasa si un cofundador decide irse al sexto mes con el 50% de las acciones? La cláusula de vesting y el pacto parasocial explicados para no abogados.',
    content: [
      'Al momento de iniciar un negocio, el optimismo es total. Todo el mundo promete dar el 100% y trabajar día y noche. Sin embargo, las estadísticas demuestran que 7 de cada 10 rupturas de PYMES se deben a disputas no resueltas entre los socios fundadores.',
      'Un estatuto mercantil estándar registrado en el tribunal no protege estas contingencias. Los estatutos son públicos y rígidos. Para regular la vida íntima del negocio se necesita un Pacto de Socios o Acuerdo de Accionistas privado.',
      'Cláusulas esenciales que debe tener toda PYME:',
      '1. Esquema de Vesting: Las acciones de los fundadores deben consolidarse mes a mes a lo largo de un período (usualmente 3 o 4 años con un año de "cliff"). Si alguien renuncia al mes 5, no se lleva la mitad de la empresa.',
      '2. Cláusulas de Arrastre y Acompañamiento (Drag-along y Tag-along): Si surge una oferta para comprar el 100% de la empresa, los socios minoritarios no pueden sabotear la venta, ni los mayoritarios pueden vender a sus espaldas sin incluirlos.',
      '3. Resolución de Deadlocks: Mecanismos rápidos (ruleta rusa, mediación privada de BinLegal) para desenredar un empate 50/50 antes de que el banco congele las cuentas por falta de firma.',
      'En BinLegal redactamos este acuerdo a la medida del ADN de tu equipo, permitiéndoles concentrarse en vender y crecer.'
    ],
    author: 'María Fernández'
  },
  {
    id: 'registrar-marca-no-es-gasto',
    title: 'Por qué no registrar tu marca es la apuesta más costosa que puedes hacer',
    category: 'Propiedad Intelectual',
    date: '28 Septiembre 2026',
    readTime: '4 min de lectura',
    excerpt: 'El mito de "primero vendo y luego registro". Casos reales de marcas que tuvieron que cambiar de nombre tras invertir miles de dólares en posicionamiento.',
    content: [
      'Un error recurrente entre los emprendedores es creer que tener el dominio web y la cuenta de Instagram equivale a tener la propiedad legal de la marca. Nada más alejado de la realidad.',
      'En la legislación comercial rige el principio "primero en el tiempo, primero en el derecho" (First to file). Si un competidor o un tercero de mala fe detecta que tu marca tiene tracción y la solicita formalmente ante el organismo registral, tú serás quien reciba una notificación judicial de cese de uso.',
      'El costo de un rebranding forzado incluye: pérdida de posicionamiento SEO, cambio de empaques, rediseño de logos, desconfianza de clientes y potenciales indemnizaciones por daños.',
      'En BinLegal realizamos la búsqueda fonética previa sin costo para clientes del diagnóstico legal, evaluando si el nombre está despejado antes de que inviertas un solo dólar en publicidad.'
    ],
    author: 'Ana Rivas'
  },
  {
    id: 'superar-barrera-3-anos',
    title: 'Cómo superar los primeros 3.5 años: La estructura legal como palanca y no como freno',
    category: 'Estrategia',
    date: '12 Septiembre 2026',
    readTime: '6 min de lectura',
    excerpt: 'El 86% de los emprendimientos no superan esta barrera en nuestra región. Analizamos los pilares legales que diferencian a un negocio efímero de una empresa duradera.',
    content: [
      'Cerca de 3 millones de personas están emprendiendo hoy. Sin embargo, apenas el 14% logra consolidar una empresa institucionalizada. ¿Por qué ocurre esto?',
      'La causa primordial rara vez es la falta de clientes o de producto. Es la asfixia producida por contingencias imprevistas: demandas laborales de colaboradores mal clasificados, multas fiscales por desconocimiento de ordenanzas, o peleas societarias.',
      'Una estructura legal profesional actúa como el chasis de un vehículo de carreras. Permite acelerar a fondo sin que el automóvil se desarme en la primera curva cerrada.',
      'Implementar desde el día uno: contratos de prestación de servicios claros, libros mercantiles al día y separación patrimonial estricta entre el dinero personal del fundador y el capital de la empresa.'
    ],
    author: 'José Rafael Vásquez'
  }
];

export const INITIAL_ECOSYSTEM_STARTUPS: EcosystemStartup[] = [
  {
    id: 'eco-1',
    name: 'Kora Logistics',
    founder: 'Gabriel Mendoza & Sofía Colmenares',
    sector: 'Logística de última milla',
    stage: 'En crecimiento',
    description: 'Plataforma SaaS de optimización de rutas y entregas urbanas para tiendas de e-commerce.',
    synergies: ['Retail digital', 'Transporte', 'Suministros'],
    verifiedClient: true,
    city: 'Caracas'
  },
  {
    id: 'eco-2',
    name: 'AgroData Vzla',
    founder: 'Valentina Pardo',
    sector: 'Agtech / Tecnología agrícola',
    stage: 'Consolidada',
    description: 'Sensores IoT y análisis satelital para productores de café y hortalizas en los Andes venezolanos.',
    synergies: ['Exportación', 'Financiamiento verde', 'Software'],
    verifiedClient: true,
    city: 'Mérida'
  },
  {
    id: 'eco-3',
    name: 'Cacao Origen Labs',
    founder: 'Andrés Eloy Castillo',
    sector: 'Alimentos & Bebidas Gourmet',
    stage: 'En crecimiento',
    description: 'Chocolatería bean-to-bar con certificación de comercio justo y exportación a Norteamérica y Europa.',
    synergies: ['Propiedad Intelectual', 'Comercio Exterior', 'Empaques'],
    verifiedClient: true,
    city: 'Barquisimeto'
  },
  {
    id: 'eco-4',
    name: 'MediSync',
    founder: 'Dra. Elena Silva & Marcos Terán',
    sector: 'HealthTech / Telemedicina',
    stage: 'Recién constituida',
    description: 'Gestor de historias clínicas electrónicas e interconsultas remotas con compliance HIPAA y regulatorio local.',
    synergies: ['Regulatorio Sanitario', 'Seguridad de Datos', 'Clínicas'],
    verifiedClient: true,
    city: 'Valencia'
  },
  {
    id: 'eco-5',
    name: 'NexPay B2B',
    founder: 'Daniela Machado',
    sector: 'Fintech / Cobranza B2B',
    stage: 'En crecimiento',
    description: 'Solución de conciliación automática de pagos multimoneda y facturación fiscal para mayoristas.',
    synergies: ['Banca', 'ERP', 'Distribución'],
    verifiedClient: true,
    city: 'Caracas'
  }
];

export const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'fp-1',
    author: 'Gabriel Mendoza',
    authorRole: 'CEO & Co-fundador',
    company: 'Kora Logistics',
    category: 'Rondas de Inversión',
    title: '¿Qué figuras usaron para su primera ronda pre-seed? (SAFE vs Nota Convertible)',
    content: 'Hola comunidad BinLegal. Estamos preparando nuestra primera ronda con ángeles locales y de la diáspora. ¿Cómo estructuraron con José Rafael Vásquez y el equipo el acuerdo para no complicar el cap table de entrada? Agradezco experiencias de otros fundadores del ecosistema.',
    createdAt: 'Ayer, 16:30',
    likes: 12,
    replies: [
      {
        id: 'fpr-1',
        author: 'José Rafael Vásquez',
        role: 'Director BinLegal',
        company: 'BinLegal',
        content: 'Excelente pregunta Gabriel. Con PYMES y startups de base tecnológica recomendamos un SAFE adaptado con Side Letter de jurisdicción aplicable. Evita fijar una valoración prematura y no genera pasivo financiero inmediato como la nota de deuda. En nuestra sesión del jueves revisaremos los términos clave.',
        createdAt: 'Ayer, 18:10'
      },
      {
        id: 'fpr-2',
        author: 'Daniela Machado',
        role: 'Founder',
        company: 'NexPay B2B',
        content: 'Totalmente de acuerdo con José Rafael. Nosotros usamos el modelo que nos diseñó María Fernández en BinLegal y los inversionistas internacionales lo firmaron sin objeciones.',
        createdAt: 'Hoy, 09:15'
      }
    ]
  },
  {
    id: 'fp-2',
    author: 'Andrés Eloy Castillo',
    authorRole: 'Fundador',
    company: 'Cacao Origen Labs',
    category: 'Permisología y Marcas',
    title: 'Experiencia con registro de marca internacional (Protocolo de Madrid / Marcas locales)',
    content: 'Comparto que gracias al blindaje de marca previo que hicimos con Ana Rivas pudimos frenar una copia idéntica que intentaron sacar en Panamá. Si alguno está exportando o planea hacerlo en los próximos 12 meses, no esperen a tener el producto en el anaquel.',
    createdAt: 'Hace 3 días',
    likes: 19,
    replies: [
      {
        id: 'fpr-3',
        author: 'Valentina Pardo',
        role: 'Directora',
        company: 'AgroData Vzla',
        content: '¡Gran hito Andrés! Nosotros estamos terminando la protección de nuestro software de telemetría también con BinLegal. Clave para generar valor real de empresa.',
        createdAt: 'Hace 2 días'
      }
    ]
  },
  {
    id: 'fp-3',
    author: 'Dra. Elena Silva',
    authorRole: 'Directora Médica',
    company: 'MediSync',
    category: 'Contratos y Proveedores',
    title: 'Modelos de contratos para desarrolladores freelance remotos (Cesión de IP y NDA)',
    content: 'Queremos dejarles el tip de nunca contratar desarrolladores sin una cláusula expresa de cesión irrevocable de derechos de autor patrimoniales sobre el código. Varios colegas médicos perdieron el control de sus plataformas por descuidar esto.',
    createdAt: 'Hace 5 días',
    likes: 15,
    replies: [
      {
        id: 'fpr-4',
        author: 'Ricardo Salas',
        role: 'Socio Fundador',
        company: 'BinLegal',
        content: 'Fundamental aporte, Dra. Elena. Es el motivo número uno de contingencias en due diligence. Todo código pagado debe tener respaldo legal de titularidad.',
        createdAt: 'Hace 4 días'
      }
    ]
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    fullName: 'Alejandro Morales',
    email: 'alejandro@urbanbite.ve',
    phone: '+58 412 889 2211',
    company: 'UrbanBite Delivery',
    jobTitle: 'Director General & Co-Fundador',
    isPrimaryContact: true,
    rif: 'J-50123984-2',
    industry: 'Alimentos / E-commerce',
    stage: 'Recién constituida',
    areasOfInterest: ['Corporativo', 'Laboral', 'Propiedad Intelectual'],
    notes: 'Estamos sumando 15 repartidores y queremos clarificar el esquema contractual para no tener pasivos laborales ocultos. También queremos registrar la marca.',
    status: 'nuevo_lead',
    createdAt: '2026-10-20 09:15',
    calculatedRiskScore: 78,
    riskSummary: 'Riesgo Alto en materia laboral y societaria por crecimiento rápido de flota sin contratos formalizados.',
    riskItems: [
      {
        area: 'Laboral',
        level: 'Alto',
        title: 'Clasificación de repartidores y colaboradores',
        description: 'Vincular personal operativo sin contratos estructurados de prestación de servicios expone a demandas solidarias.',
        actionRequired: 'Redacción urgente de contrato marco de servicios y pólizas de responsabilidad civil.'
      },
      {
        area: 'Propiedad Intelectual',
        level: 'Medio',
        title: 'Marca no registrada formalmente',
        description: 'Marca con presencia en redes sin solicitud ante el SAPI.',
        actionRequired: 'Búsqueda fonética y consignación de expediente de marca comercial.'
      },
      {
        area: 'Corporativo',
        level: 'Medio',
        title: 'Ausencia de pacto de socios',
        description: 'Dos fundadores con aporte 50/50 sin reglas de desempate en caso de desacuerdo.',
        actionRequired: 'Implementar pacto parasocial con cláusula de resolución expedita.'
      }
    ],
    internalNotes: [
      {
        id: 'note-1',
        author: 'José Rafael Vásquez',
        text: 'Prospecto con excelente volumen de pedidos semanales. Requieren propuesta rápida para que no firmen contratos genéricos de internet.',
        timestamp: '2026-10-20 09:40'
      }
    ],
    assignedLawyer: 'José Rafael Vásquez',
    documents: [
      {
        id: 'doc-1',
        name: 'RIF_Fiscal_UrbanBite_J501239842.pdf',
        category: 'Fiscal & Identificación',
        status: 'aprobado',
        uploadDate: '2026-10-20',
        size: '1.2 MB'
      },
      {
        id: 'doc-2',
        name: 'Borrador_Contrato_Repartidores_Actual.docx',
        category: 'Laboral',
        status: 'en_revision',
        uploadDate: '2026-10-20',
        size: '420 KB'
      },
      {
        id: 'doc-3',
        name: 'Logo_UrbanBite_Vector_SAPI.png',
        category: 'Propiedad Intelectual',
        status: 'recibido',
        uploadDate: '2026-10-20',
        size: '2.8 MB'
      }
    ],
    budget: {
      items: [
        {
          id: 'bi-1',
          concept: 'Estructuración y Redacción de Contrato Marco de Prestación de Servicios (Flota)',
          area: 'Laboral',
          quantity: 1,
          unitPrice: 380
        },
        {
          id: 'bi-2',
          concept: 'Búsqueda Fonética y Registro de Marca ante SAPI (Clase 39)',
          area: 'Propiedad Intelectual',
          quantity: 1,
          unitPrice: 280
        },
        {
          id: 'bi-3',
          concept: 'Redacción de Pacto de Socios y Acuerdo de Accionistas (Vesting & Drag-Along)',
          area: 'Corporativo',
          quantity: 1,
          unitPrice: 380
        }
      ],
      currency: 'USD',
      discount: 50,
      notes: 'Forma de pago: 50% de anticipo al formalizar y 50% al cierre y entrega de instrumentos.',
      status: 'borrador',
      createdAt: '2026-10-20',
      validUntil: '2026-11-15'
    }
  },
  {
    id: 'lead-7',
    fullName: 'Valentina Soto',
    email: 'valentina@urbanbite.ve',
    phone: '+58 414 209 1184',
    company: 'UrbanBite Delivery',
    jobTitle: 'Gerente de Administración & Finanzas',
    isPrimaryContact: false,
    rif: 'J-50123984-2',
    industry: 'Alimentos / E-commerce',
    stage: 'Recién constituida',
    areasOfInterest: ['Laboral', 'Contratos'],
    notes: 'Encargada de nómina, pólizas de seguros y acuerdos de pago de la flota operativa.',
    status: 'nuevo_lead',
    createdAt: '2026-10-21 11:30',
    calculatedRiskScore: 65,
    riskSummary: 'Coordinación administrativa para contratos marco y pólizas de responsabilidad.',
    riskItems: [],
    internalNotes: [
      {
        id: 'note-7-1',
        author: 'José Rafael Vásquez',
        text: 'Contacto administrativo añadido para enlace de recaudos societarios y revisión de pólizas.',
        timestamp: '2026-10-21 11:45'
      }
    ],
    assignedLawyer: 'José Rafael Vásquez'
  },
  {
    id: 'lead-2',
    fullName: 'Corina Villegas',
    email: 'corina@vitalgreen.com',
    phone: '+58 424 554 1902',
    company: 'VitalGreen Cosmética Natural',
    jobTitle: 'Socia Fundadora & Directora General',
    isPrimaryContact: true,
    rif: 'J-41298402-1',
    industry: 'Cuidado personal y Retail',
    stage: 'En crecimiento',
    areasOfInterest: ['Regulatorio', 'Propiedad Intelectual', 'Contratos'],
    notes: 'Recibimos una propuesta de una cadena nacional de farmacias para distribuir nuestros productos, pero exigen permisos sanitarios y contrato de suministro estricto.',
    status: 'diagnostico_enviado',
    createdAt: '2026-10-19 14:20',
    calculatedRiskScore: 65,
    riskSummary: 'Riesgo Medio-Alto en cumplimiento regulatorio y negociación de términos comerciales asimétricos con grandes cadenas.',
    riskItems: [
      {
        area: 'Regulatorio',
        level: 'Alto',
        title: 'Permisología sanitaria y registro de fórmulas',
        description: 'Comercializar cosméticos en gran escala sin registro sanitario vigente genera riesgo de decomiso de mercancía.',
        actionRequired: 'Acompañamiento en certificación y tramitación de notificación sanitaria obligatoria.'
      },
      {
        area: 'Contratos',
        level: 'Medio',
        title: 'Cláusulas leoninas de pago a 120 días',
        description: 'Contratos tipo de cadenas comerciales suelen imponer penalidades unilaterales y retenciones gravosas.',
        actionRequired: 'Negociación y ajuste de plazos, garantías de pago y límites de responsabilidad.'
      }
    ],
    internalNotes: [
      {
        id: 'note-2',
        author: 'Carlos Bermúdez',
        text: 'Se le envió el diagnóstico preliminar. Agendando llamada para revisar los términos del contrato de la farmacia.',
        timestamp: '2026-10-19 16:05'
      }
    ]
  },
  {
    id: 'lead-6',
    fullName: 'Daniel Ortega',
    email: 'daniel.ortega@vitalgreen.com',
    phone: '+58 412 555 0184',
    company: 'VitalGreen Cosmética Natural',
    jobTitle: 'Gerente de Operaciones & Distribución',
    isPrimaryContact: false,
    rif: 'J-41298402-1',
    industry: 'Cuidado personal y Retail',
    stage: 'En crecimiento',
    areasOfInterest: ['Contratos', 'Regulatorio'],
    notes: 'Contacto de operaciones y distribución. Coordina recaudos comerciales y seguimiento de contratos con aliados.',
    status: 'cliente_activo',
    createdAt: '2026-08-18 10:40',
    calculatedRiskScore: 32,
    riskSummary: 'Seguimiento preventivo de contratos y expansión comercial.',
    riskItems: [],
    internalNotes: [
      {
        id: 'note-6',
        author: 'Carlos Bermúdez',
        text: 'Contacto operativo incorporado a la cuenta corporativa para coordinar distribución y recaudos.',
        timestamp: '2026-08-18 10:45'
      }
    ]
  },
  {
    id: 'lead-3',
    fullName: 'Ing. Rodrigo Cárdenas',
    email: 'rodrigo@servioffice.net',
    phone: '+58 414 330 9182',
    company: 'ServiOffice Soluciones',
    jobTitle: 'Director de Operaciones & Socio',
    isPrimaryContact: true,
    rif: 'J-31902844-0',
    industry: 'Servicios B2B / Mantenimiento',
    stage: 'Consolidada',
    areasOfInterest: ['Negociación y mediación', 'Contratos'],
    notes: 'Un cliente corporativo nos adeuda 3 meses de servicio y amenaza con rescindir sin pagar. Queremos cobrar sin quemar el puente ni ir a juicio largo.',
    status: 'sesion_programada',
    createdAt: '2026-10-18 11:00',
    calculatedRiskScore: 52,
    riskSummary: 'Riesgo Financiero por cobro de cartera sin soporte de acuerdos transaccionales con fuerza ejecutiva.',
    riskItems: [
      {
        area: 'Negociación y mediación',
        level: 'Medio',
        title: 'Disputa de cumplimiento de contrato B2B',
        description: 'Riesgo de prescripción o litigio de 2 años en tribunales con pérdida de liquidez.',
        actionRequired: 'Mesa de mediación estratégica conducida por BinLegal con acuerdo transaccional notariado.'
      }
    ],
    internalNotes: [
      {
        id: 'note-3',
        author: 'Ricardo Salas',
        text: 'Sesión confirmada para mañana a las 11:00 AM vía Google Meet. Preparando borrador de mediación amistosa.',
        timestamp: '2026-10-18 15:30'
      }
    ]
  },
  {
    id: 'lead-4',
    fullName: 'Valeria Guzmán',
    email: 'valeria@aurorastudio.design',
    phone: '+58 412 112 3490',
    company: 'Aurora Creative Studio',
    jobTitle: 'Directora Creativa & Socia Fundadora',
    isPrimaryContact: true,
    rif: 'J-50892019-3',
    industry: 'Diseño & Marketing Digital',
    stage: 'Idea / Pre-lanzamiento',
    areasOfInterest: ['Corporativo', 'Propiedad Intelectual'],
    notes: 'Somos 3 socias saliendo de una agencia para armar nuestro propio estudio creativo. Queremos hacerlo formal y bien estructurado desde el día uno.',
    status: 'propuesta_presentada',
    createdAt: '2026-10-17 16:45',
    calculatedRiskScore: 40,
    riskSummary: 'Riesgo Bajo-Medio preventivo. Oportunidad óptima para constituir con estatutos modernos y protección de activos intangibles.',
    riskItems: [
      {
        area: 'Corporativo',
        level: 'Bajo',
        title: 'Estructuración societaria preventiva',
        description: 'Definir porcentajes de aportes de capital vs trabajo para evitar roces futuros.',
        actionRequired: 'Constitución societaria con acuerdo de fundadores y vesting de trabajo.'
      }
    ],
    internalNotes: [
      {
        id: 'note-4',
        author: 'José Rafael Vásquez',
        text: 'Presentamos propuesta de acompañamiento integral "Arranque Seguro PYME". Muy receptivas, esperando aprobación de presupuesto.',
        timestamp: '2026-10-18 10:15'
      }
    ]
  },
  {
    id: 'lead-5',
    fullName: 'Manuel Briceño',
    email: 'manuel@finanzapyme.io',
    phone: '+58 424 771 9022',
    company: 'FinanzaPyme',
    jobTitle: 'CEO & Co-Fundador',
    isPrimaryContact: true,
    rif: 'J-40992318-7',
    industry: 'Fintech / Software contable',
    stage: 'En crecimiento',
    areasOfInterest: ['Corporativo', 'Regulatorio', 'Propiedad Intelectual', 'Laboral'],
    notes: 'Estamos cerrando una ronda de $80k con inversionistas privados y necesitamos el blindaje total de la plataforma y el pacto de accionistas.',
    status: 'cliente_activo',
    createdAt: '2026-10-15 08:30',
    calculatedRiskScore: 85,
    riskSummary: 'Riesgo Alto por captación de fondos e involucramiento de terceros sin acuerdos de inversión blindados.',
    riskItems: [
      {
        area: 'Corporativo',
        level: 'Alto',
        title: 'Pacto de accionistas con inversionistas',
        description: 'Exposición a perder control operativo o derechos de veto de inversores sin asesoría especializada.',
        actionRequired: 'Estructuración de contrato de inversión, emisión de acciones preferentes y derechos de información.'
      }
    ],
    internalNotes: [
      {
        id: 'note-5',
        author: 'José Rafael Vásquez',
        text: 'Contrato firmado. Iniciamos trabajo con María Fernández y Ana Rivas. Cliente formalizado en el paquete mensual de asesoría integral.',
        timestamp: '2026-10-16 12:00'
      }
    ]
  }
];

export function calculateDiagnosisRisk(
  stage: BusinessStage,
  areas: LegalArea[],
  company: string,
  industry: string
): { score: number; summary: string; items: RiskItem[] } {
  let baseScore = 30;
  const items: RiskItem[] = [];

  // Stage multiplier
  if (stage === 'Idea / Pre-lanzamiento') {
    baseScore += 20;
    items.push({
      area: 'Estructura Inicial',
      level: 'Alto',
      title: 'Vulnerabilidad por falta de personería jurídica clara',
      description: `Operar ${company || 'el negocio'} sin separar el patrimonio personal del comercial pone en riesgo los bienes personales de los socios ante cualquier eventualidad.`,
      actionRequired: 'Definir la figura jurídica societaria adecuada y pactar las reglas de salida de fundadores antes de captar clientes.'
    });
  } else if (stage === 'Recién constituida') {
    baseScore += 30;
    items.push({
      area: 'Gobierno Corporativo',
      level: 'Alto',
      title: 'Ausencia de pacto de socios y reglas de capital',
      description: 'El 86% de las empresas en esta etapa sufren parálisis operativa por no acordar previamente qué ocurre si un socio no cumple sus funciones.',
      actionRequired: 'Redactar un pacto de socios privado con esquema de vesting y mecanismos de desempate.'
    });
  } else if (stage === 'En crecimiento') {
    baseScore += 35;
    items.push({
      area: 'Escalabilidad & Contratos',
      level: 'Alto',
      title: 'Contratos informales en fase de expansión acelerada',
      description: 'Crecer en ventas sin contratos estandarizados de clientes y proveedores acumula un pasivo contingente invisible.',
      actionRequired: 'Auditoría de contratos comerciales y estandarización de términos de servicio y cobranza.'
    });
  } else {
    // Consolidada
    baseScore += 25;
    items.push({
      area: 'Auditoría Continua',
      level: 'Medio',
      title: 'Desactualización normativa de libros y políticas',
      description: 'Empresas consolidadas suelen descuidar la renovación de permisos municipales y asambleas ordinarias anuales obligatorias.',
      actionRequired: 'Checklist de compliance anual y actualización de asambleas mercantiles obligatorias.'
    });
  }

  // Areas analysis
  areas.forEach(area => {
    if (area === 'Propiedad Intelectual') {
      baseScore += 10;
      items.push({
        area: 'Propiedad Intelectual',
        level: 'Alto',
        title: 'Exposición de marca y signos distintivos',
        description: `El valor intangible de ${company || 'tu marca'} en el sector de ${industry || 'tu industria'} puede ser apropiado por terceros si no existe solicitud formal prioritaria.`,
        actionRequired: 'Ejecutar búsqueda fonética y presentar solicitud de registro de marca ante la oficina de propiedad industrial.'
      });
    }
    if (area === 'Laboral') {
      baseScore += 12;
      items.push({
        area: 'Laboral',
        level: 'Alto',
        title: 'Riesgo de contingencias laborales y simulación',
        description: 'La contratación de colaboradores sin contratos especializados o con ambigüedades en horarios genera contingencias millonarias.',
        actionRequired: 'Estructurar contratos laborales ajustados con cláusulas de confidencialidad y propiedad de creaciones.'
      });
    }
    if (area === 'Regulatorio') {
      baseScore += 8;
      items.push({
        area: 'Regulatorio',
        level: 'Medio',
        title: 'Fiscalización y permisología sectorial',
        description: `El sector de ${industry || 'actividad'} exige cumplimiento estricto de deberes formales para evitar sanciones o paralización.`,
        actionRequired: 'Revisión normativa integral y matriz de licencias comerciales vigentes.'
      });
    }
    if (area === 'Contratos') {
      baseScore += 6;
      items.push({
        area: 'Contratos',
        level: 'Medio',
        title: 'Vulnerabilidad ante incumplimientos de clientes y aliados',
        description: 'Usar formatos de internet desactualizados deja desprotegidas las garantías de cobro y límites de responsabilidad.',
        actionRequired: 'Diseño de contratos comerciales robustos con cláusulas penales y resolución alternativa de disputas.'
      });
    }
    if (area === 'Mediación') {
      baseScore += 5;
      items.push({
        area: 'Mediación & Acuerdos',
        level: 'Medio',
        title: 'Costos potenciales de litigio prolongado',
        description: 'Resolver disputas en tribunales ordinarios desgasta el capital de trabajo de una PYME.',
        actionRequired: 'Incorporación de cláusulas de mediación previa en todos los acuerdos comerciales.'
      });
    }
  });

  const finalScore = Math.min(Math.max(baseScore, 35), 92);
  let summary = '';
  if (finalScore >= 75) {
    summary = `Nivel de Riesgo Legal Crítico (${finalScore}/100): ${company || 'Tu negocio'} se encuentra en un punto de inflexión. Requiere blindaje societario y contractual urgente para evitar contingencias que pongan en peligro la viabilidad de la empresa.`;
  } else if (finalScore >= 55) {
    summary = `Nivel de Riesgo Legal Moderado (${finalScore}/100): Existen frentes expuestos en las áreas seleccionadas (${areas.join(', ')}). Resolverlos ahora cuesta una fracción de lo que costaría solucionar un conflicto formal.`;
  } else {
    summary = `Nivel de Riesgo Legal Preventivo (${finalScore}/100): Buen momento para ordenar la estructura societaria y proteger los activos intangibles antes de la fase de aceleración.`;
  }

  return {
    score: finalScore,
    summary,
    items
  };
}
