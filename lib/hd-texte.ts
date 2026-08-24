/**
 * Die Texte der Landingpage von Hareb Digital, in drei Sprachen.
 *
 * Eigenes Wörterbuch, nicht das des Portfolios. Die beiden Seiten sprechen
 * bewusst verschieden: das Portfolio spricht zu Auftraggebern, die Websites
 * schon einordnen können, die Landingpage zu Betrieben ohne IT-Abteilung.
 * Ein gemeinsames Wörterbuch hätte den Ton der einen an den der anderen
 * gebunden.
 *
 * Die Auswahl trifft der Browser des Besuchers über den Accept-Language-Kopf,
 * nicht die Adresse. Das wäre auf einer indexierten Seite falsch — ein
 * Crawler bekäme je nach Laune eine andere Fassung unter derselben Adresse.
 * Diese Seite trägt `noindex`, solange sie unter issahareb.me liegt, und
 * bekommt ihren Verkehr aus Anzeigen. Für sie zählt, dass der Besucher in
 * seiner Sprache landet, ohne vorher etwas anklicken zu müssen.
 */

export const HD_SPRACHEN = ['de', 'en', 'es'] as const
export type HdLang = (typeof HD_SPRACHEN)[number]
export const HD_STANDARD: HdLang = 'de'

export const HD_HREFLANG: Record<HdLang, string> = { de: 'de-DE', en: 'en', es: 'es' }

/**
 * Die beste unterstützte Sprache aus einem Accept-Language-Kopf.
 *
 * Der Kopf ist eine nach Gewicht sortierte Wunschliste ("de-CH,de;q=0.9,
 * en;q=0.8"). Gewertet wird nach dem angegebenen q-Wert und nicht nach der
 * Reihenfolge, denn die Reihenfolge ist nicht vorgeschrieben. Verglichen wird
 * nur das Sprachkürzel vor dem Bindestrich: wer de-AT spricht, soll die
 * deutsche Fassung sehen und nicht die deutsche verfehlen.
 */
export function sprachAusKopf(kopf: string | null | undefined): HdLang {
  if (!kopf) return HD_STANDARD

  let beste: HdLang = HD_STANDARD
  let bestesGewicht = -1

  for (const teil of kopf.split(',')) {
    const [markeRoh, ...rest] = teil.trim().split(';')
    const marke = markeRoh.trim().toLowerCase()
    if (!marke) continue

    const q = rest
      .map((r) => r.trim())
      .find((r) => r.startsWith('q='))
      ?.slice(2)
    const gewicht = q === undefined ? 1 : Number.parseFloat(q)
    if (!Number.isFinite(gewicht) || gewicht <= bestesGewicht) continue

    const kuerzel = marke.split('-')[0]
    const treffer = HD_SPRACHEN.find((l) => l === kuerzel)
    if (!treffer) continue

    beste = treffer
    bestesGewicht = gewicht
  }

  return beste
}

export type HdTexte = {
  meta: { titel: string; beschreibung: string }
  ctaHaupt: string
  buehne: {
    titel: string
    vorspann: string
    arbeitenAnsehen: string
    bildAlt: string
    bildText: string
  }
  probleme: { titel: string; punkte: string[] }
  behauptung: string
  arbeiten: {
    label: string
    titel: string
    kundeLabel: string
    kundeName: string
    kundeText: string
    werte: { wert: string; name: string }[]
    quelle: string
    seiteAnsehen: string
    belegAlt: string
    ansehen: string
    projekte: { name: string; alt: string; text: string; url: string | null }[]
  }
  leistungen: {
    label: string
    titel: string
    vorspann: string
    punkte: { n: string; titel: string; text: string }[]
  }
  ablauf: { label: string; titel: string; schritte: { n: string; t: string; b: string }[] }
  fakten: { zahl: number; suffix: string; v: string }[]
  schluss: { titel: string; text: string }
  fuss: { inhaber: string; impressum: string; datenschutz: string; portfolio: string }
}

const DE: HdTexte = {
  meta: {
    titel: 'Hareb Digital: Websites, die gefunden werden und Arbeit abnehmen',
    beschreibung:
      'Hareb Digital baut Websites, Webanwendungen und Automatisierungen für kleine und mittlere Unternehmen. Ein Ansprechpartner, fester Preis, Antwort in 24 Stunden.',
  },
  ctaHaupt: 'Projekt anfragen',
  buehne: {
    titel: 'Gefunden werden. Arbeit loswerden.',
    vorspann:
      'Websites und Programme für Betriebe ohne IT-Abteilung. Du sagst mir, was dich stört. Ich sage dir, was es kostet.',
    arbeitenAnsehen: 'Arbeiten ansehen',
    bildAlt: 'Startseite von taxibbessen.de, gebaut für Taxi B&B in Essen',
    bildText: 'taxibbessen.de, gebaut für Taxi B&B in Essen. Läuft seit 2026.',
  },
  probleme: {
    titel: 'Kommt dir einer dieser Sätze bekannt vor?',
    punkte: [
      'Das Telefon klingelt nicht mehr so wie früher.',
      'Bei Google finden uns nur die, die uns sowieso kennen.',
      'Die Seite sieht aus wie 2014.',
      'Auf dem Handy ist alles verrutscht.',
      'Angebote schreiben dauert jedes Mal ewig.',
      'Die Agentur meldet sich seit Wochen nicht.',
    ],
  },
  behauptung:
    'Genau das ist die Arbeit. Du bekommst keine Präsentation, sondern eine Seite, die läuft. Kein Baukasten, kein Abo, keine Warteschleife. Klemmt etwas, schreibst du mir und nicht einer Hotline.',
  arbeiten: {
    label: 'Arbeiten',
    titel: 'Gebaut, online gestellt, im Betrieb.',
    kundeLabel: 'Kundenprojekt',
    kundeName: 'Taxi B&B Essen',
    kundeText:
      'Buchungen sofort oder auf Termin, ein Verwaltungsbereich mit eigener Datenbank, automatische E-Mails und technisches SEO bis hinunter zu den strukturierten Daten.',
    werte: [
      { wert: '92', name: 'Onpage' },
      { wert: '99', name: 'Technik' },
      { wert: '97', name: 'Struktur' },
      { wert: '80', name: 'Inhalt' },
    ],
    quelle: 'Gemessen von seobility.net am 28.07.2026.',
    seiteAnsehen: 'Seite ansehen',
    belegAlt: 'Buchungsstrecke und Startseite von taxibbessen.de',
    ansehen: 'Ansehen',
    projekte: [
      {
        name: 'GuardianGrid',
        alt: 'Anmeldebereich von guardiangrid.io',
        text: 'Eigenes Produkt: Anmeldung über einen fremden Anbieter, Auswertung großer Datenmengen, laufender Betrieb auf eigener Infrastruktur.',
        url: 'https://www.guardiangrid.io',
      },
      {
        name: 'L.U.K.A.S.',
        alt: 'Oberfläche des KI-Agenten L.U.K.A.S.',
        text: 'Eigenes Produkt: ein KI-Agent mit dauerhaftem Gedächtnis, der echte Aufgaben übernimmt statt nur zu antworten.',
        url: null,
      },
    ],
  },
  leistungen: {
    label: 'Leistungen',
    titel: 'Such dir aus, was gerade drückt.',
    vorspann:
      'Du musst nicht alles auf einmal machen. Meistens ist es einer dieser vier Punkte, und der bringt schon den Unterschied.',
    punkte: [
      {
        n: '01',
        titel: 'Eine neue Website',
        text: 'Von der ersten Skizze bis zu dem Tag, an dem sie läuft. Sie sieht auf dem Handy so gut aus wie am Rechner, wird bei Google gefunden und schickt dir Anfragen direkt zu.',
      },
      {
        n: '02',
        titel: 'Die bestehende überarbeiten',
        text: 'Wenn das Grundgerüst steht, aber nichts davon mehr stimmt. Neues Aussehen ohne bei null anzufangen, schneller, endlich sauber auf dem Handy.',
      },
      {
        n: '03',
        titel: 'Abläufe automatisieren',
        text: 'Alles, was du jede Woche von Hand machst und nicht müsstest. Angebote, Rechnungen, Terminerinnerungen, Anfragen sortieren und beantworten.',
      },
      {
        n: '04',
        titel: 'Nur gefunden werden',
        text: 'Die Seite bleibt, wie sie ist. Sichtbar wird sie trotzdem: ganz oben bei Google und in den Antworten von ChatGPT und Perplexity.',
      },
    ],
  },
  ablauf: {
    label: 'So läuft es',
    titel: 'Vier Schritte, kein Kleingedrucktes.',
    schritte: [
      {
        n: '01',
        t: 'Du erzählst',
        b: 'Zwei Minuten Formular oder ein Telefonat. Ich will wissen, was dich stört, nicht welche Technik du dir vorstellst.',
      },
      {
        n: '02',
        t: 'Ich sage, was geht',
        b: 'Innerhalb von 24 Stunden: was es kostet, wie lange es dauert, ob es sich lohnt. Auch wenn die Antwort nein ist.',
      },
      {
        n: '03',
        t: 'Du siehst es vorher',
        b: 'Auf Wunsch ein erster Entwurf, bevor du dich festlegst. Gefällt er nicht, hast du nichts verloren.',
      },
      {
        n: '04',
        t: 'Es läuft und bleibt betreut',
        b: 'Gebaut, online gestellt, überwacht. Klemmt etwas, schreibst du mir statt einer Hotline.',
      },
    ],
  },
  fakten: [
    { zahl: 24, suffix: ' h', v: 'bis du eine Antwort hast' },
    { zahl: 1, suffix: '', v: 'Ansprechpartner, von Anfang bis Ende' },
    { zahl: 0, suffix: ' €', v: 'für den ersten Entwurf' },
  ],
  schluss: {
    titel: 'Zwei Minuten, dann weißt du, woran du bist.',
    text: 'Fünf Felder, eines davon freiwillig. Innerhalb von 24 Stunden hast du eine ehrliche Einschätzung zu Umfang, Dauer und Preis.',
  },
  fuss: {
    inhaber: 'Inhaber Issa Hareb',
    impressum: 'Impressum',
    datenschutz: 'Datenschutz',
    portfolio: 'Portfolio',
  },
}

const EN: HdTexte = {
  meta: {
    titel: 'Hareb Digital: websites that get found and take work off your desk',
    beschreibung:
      'Hareb Digital builds websites, web applications and automation for small and mid-sized businesses. One contact, a fixed price, an answer within 24 hours.',
  },
  ctaHaupt: 'Start a project',
  buehne: {
    titel: 'Get found. Get work off your desk.',
    vorspann:
      'Websites and software for businesses without an IT department. You tell me what bothers you. I tell you what it costs.',
    arbeitenAnsehen: 'See the work',
    bildAlt: 'Home page of taxibbessen.de, built for Taxi B&B in Essen',
    bildText: 'taxibbessen.de, built for Taxi B&B in Essen. Live since 2026.',
  },
  probleme: {
    titel: 'Does any of this sound familiar?',
    punkte: [
      'The phone rings less than it used to.',
      'On Google we only get found by people who already know us.',
      'The site looks like 2014.',
      'On a phone everything is out of place.',
      'Writing quotes takes forever every single time.',
      'The agency has not answered for weeks.',
    ],
  },
  behauptung:
    'That is exactly the work. You get a site that runs, not a presentation. No page builder, no subscription, no hold music. If something breaks, you write to me and not to a hotline.',
  arbeiten: {
    label: 'Work',
    titel: 'Built, shipped, and running.',
    kundeLabel: 'Client project',
    kundeName: 'Taxi B&B Essen',
    kundeText:
      'Instant or scheduled bookings, an admin area with its own database, automatic emails, and technical SEO down to the structured data.',
    werte: [
      { wert: '92', name: 'On-page' },
      { wert: '99', name: 'Technical' },
      { wert: '97', name: 'Structure' },
      { wert: '80', name: 'Content' },
    ],
    quelle: 'Measured by seobility.net on 28 July 2026.',
    seiteAnsehen: 'Visit the site',
    belegAlt: 'Booking flow and home page of taxibbessen.de',
    ansehen: 'Visit',
    projekte: [
      {
        name: 'GuardianGrid',
        alt: 'Sign-in area of guardiangrid.io',
        text: 'Own product: sign-in through a third-party provider, analysis of large data sets, running in production on my own infrastructure.',
        url: 'https://www.guardiangrid.io',
      },
      {
        name: 'L.U.K.A.S.',
        alt: 'Interface of the AI agent L.U.K.A.S.',
        text: 'Own product: an AI agent with lasting memory that takes on real tasks instead of only answering.',
        url: null,
      },
    ],
  },
  leistungen: {
    label: 'Services',
    titel: 'Pick whatever hurts most right now.',
    vorspann:
      'You do not have to do everything at once. Usually it is one of these four, and that one already makes the difference.',
    punkte: [
      {
        n: '01',
        titel: 'A new website',
        text: 'From the first sketch to the day it goes live. It looks as good on a phone as on a desktop, gets found on Google, and sends enquiries straight to you.',
      },
      {
        n: '02',
        titel: 'Rework the one you have',
        text: 'When the structure is fine but nothing else is. A new look without starting from zero, faster, and finally clean on a phone.',
      },
      {
        n: '03',
        titel: 'Automate the routine',
        text: 'Everything you do by hand every week and should not have to. Quotes, invoices, appointment reminders, sorting and answering enquiries.',
      },
      {
        n: '04',
        titel: 'Just get found',
        text: 'The site stays as it is. It becomes visible anyway: at the top of Google and in the answers of ChatGPT and Perplexity.',
      },
    ],
  },
  ablauf: {
    label: 'How it works',
    titel: 'Four steps, no small print.',
    schritte: [
      {
        n: '01',
        t: 'You tell me',
        b: 'Two minutes of form or one phone call. I want to know what bothers you, not which technology you have in mind.',
      },
      {
        n: '02',
        t: 'I tell you what is possible',
        b: 'Within 24 hours: what it costs, how long it takes, whether it is worth it. Including when the answer is no.',
      },
      {
        n: '03',
        t: 'You see it first',
        b: 'A first draft before you commit, if you want one. If you do not like it, you have lost nothing.',
      },
      {
        n: '04',
        t: 'It runs and stays looked after',
        b: 'Built, shipped, monitored. If something breaks, you write to me instead of a hotline.',
      },
    ],
  },
  fakten: [
    { zahl: 24, suffix: ' h', v: 'until you have an answer' },
    { zahl: 1, suffix: '', v: 'contact, from start to finish' },
    { zahl: 0, suffix: ' €', v: 'for the first draft' },
  ],
  schluss: {
    titel: 'Two minutes, and you know where you stand.',
    text: 'Five fields, one of them optional. Within 24 hours you have an honest read on scope, timeline and price.',
  },
  fuss: {
    inhaber: 'Owner Issa Hareb',
    impressum: 'Legal notice',
    datenschutz: 'Privacy',
    portfolio: 'Portfolio',
  },
}

const ES: HdTexte = {
  meta: {
    titel: 'Hareb Digital: webs que se encuentran y que te quitan trabajo',
    beschreibung:
      'Hareb Digital crea webs, aplicaciones y automatizaciones para pequeñas y medianas empresas. Una sola persona de contacto, precio cerrado y respuesta en 24 horas.',
  },
  ctaHaupt: 'Solicitar proyecto',
  buehne: {
    titel: 'Que te encuentren. Quitarte trabajo.',
    vorspann:
      'Webs y programas para empresas sin departamento de informática. Tú me cuentas qué te molesta. Yo te digo lo que cuesta.',
    arbeitenAnsehen: 'Ver los trabajos',
    bildAlt: 'Página de inicio de taxibbessen.de, hecha para Taxi B&B en Essen',
    bildText: 'taxibbessen.de, hecha para Taxi B&B en Essen. En marcha desde 2026.',
  },
  probleme: {
    titel: '¿Te suena alguna de estas frases?',
    punkte: [
      'El teléfono ya no suena como antes.',
      'En Google solo nos encuentran los que ya nos conocen.',
      'La web parece de 2014.',
      'En el móvil está todo descolocado.',
      'Preparar presupuestos tarda una eternidad cada vez.',
      'La agencia lleva semanas sin contestar.',
    ],
  },
  behauptung:
    'Ese es justo el trabajo. No recibes una presentación, sino una web que funciona. Sin plantillas, sin cuota mensual, sin música de espera. Si algo falla, me escribes a mí y no a un centro de atención.',
  arbeiten: {
    label: 'Trabajos',
    titel: 'Hecho, publicado y en marcha.',
    kundeLabel: 'Proyecto de cliente',
    kundeName: 'Taxi B&B Essen',
    kundeText:
      'Reservas inmediatas o programadas, un panel de administración con su propia base de datos, correos automáticos y SEO técnico hasta los datos estructurados.',
    werte: [
      { wert: '92', name: 'On-page' },
      { wert: '99', name: 'Técnica' },
      { wert: '97', name: 'Estructura' },
      { wert: '80', name: 'Contenido' },
    ],
    quelle: 'Medido por seobility.net el 28/07/2026.',
    seiteAnsehen: 'Ver la web',
    belegAlt: 'Proceso de reserva y página de inicio de taxibbessen.de',
    ansehen: 'Ver',
    projekte: [
      {
        name: 'GuardianGrid',
        alt: 'Zona de acceso de guardiangrid.io',
        text: 'Producto propio: acceso a través de un proveedor externo, análisis de grandes volúmenes de datos y funcionamiento continuo en infraestructura propia.',
        url: 'https://www.guardiangrid.io',
      },
      {
        name: 'L.U.K.A.S.',
        alt: 'Interfaz del agente de IA L.U.K.A.S.',
        text: 'Producto propio: un agente de IA con memoria duradera que asume tareas reales en lugar de solo responder.',
        url: null,
      },
    ],
  },
  leistungen: {
    label: 'Servicios',
    titel: 'Elige lo que más aprieta ahora.',
    vorspann:
      'No hace falta hacerlo todo a la vez. Casi siempre es uno de estos cuatro puntos, y ese ya marca la diferencia.',
    punkte: [
      {
        n: '01',
        titel: 'Una web nueva',
        text: 'Desde el primer boceto hasta el día en que está en marcha. Se ve igual de bien en el móvil que en el ordenador, se encuentra en Google y te envía las solicitudes directamente.',
      },
      {
        n: '02',
        titel: 'Renovar la que ya tienes',
        text: 'Cuando la base sirve pero ya no encaja nada más. Otro aspecto sin empezar de cero, más rápida y por fin correcta en el móvil.',
      },
      {
        n: '03',
        titel: 'Automatizar procesos',
        text: 'Todo lo que haces a mano cada semana sin necesidad. Presupuestos, facturas, recordatorios de cita, clasificar y responder solicitudes.',
      },
      {
        n: '04',
        titel: 'Solo ganar visibilidad',
        text: 'La web se queda como está. Aun así se ve: arriba del todo en Google y en las respuestas de ChatGPT y Perplexity.',
      },
    ],
  },
  ablauf: {
    label: 'Cómo funciona',
    titel: 'Cuatro pasos, sin letra pequeña.',
    schritte: [
      {
        n: '01',
        t: 'Tú me cuentas',
        b: 'Dos minutos de formulario o una llamada. Quiero saber qué te molesta, no qué tecnología tienes en mente.',
      },
      {
        n: '02',
        t: 'Yo te digo qué se puede',
        b: 'En menos de 24 horas: lo que cuesta, lo que tarda y si merece la pena. También cuando la respuesta es no.',
      },
      {
        n: '03',
        t: 'Lo ves antes',
        b: 'Si quieres, una primera propuesta antes de comprometerte. Si no te gusta, no has perdido nada.',
      },
      {
        n: '04',
        t: 'Funciona y sigue atendida',
        b: 'Hecha, publicada y vigilada. Si algo falla, me escribes a mí y no a un centro de atención.',
      },
    ],
  },
  fakten: [
    { zahl: 24, suffix: ' h', v: 'hasta tener una respuesta' },
    { zahl: 1, suffix: '', v: 'persona de contacto, de principio a fin' },
    { zahl: 0, suffix: ' €', v: 'por la primera propuesta' },
  ],
  schluss: {
    titel: 'Dos minutos y sabes a qué atenerte.',
    text: 'Cinco campos, uno de ellos opcional. En menos de 24 horas tienes una valoración honesta de alcance, plazo y precio.',
  },
  fuss: {
    inhaber: 'Titular Issa Hareb',
    impressum: 'Aviso legal',
    datenschutz: 'Privacidad',
    portfolio: 'Portafolio',
  },
}

export const HD_TEXTE: Record<HdLang, HdTexte> = { de: DE, en: EN, es: ES }
