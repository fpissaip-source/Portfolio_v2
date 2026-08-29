/**
 * Die Leistungsseiten.
 *
 * Warum es sie gibt: die Seite hatte genau eine Inhaltsseite. Gemessen am
 * 26.08. lagen in der Sitemap fünf Adressen mal drei Sprachen, davon zwei
 * Rechtstexte, ein Formular und eine Affiliate-Seite — es blieb die
 * Startseite. Eine Seite kann nicht für zwei verschiedene Suchabsichten
 * ranken, und "Fullstack Entwickler Essen" und "Webdesigner Essen" sind zwei
 * verschiedene. Dazu kam: das Wort "Webdesigner" stand kein einziges Mal auf
 * der Seite, "Full-Stack-Entwickler" als zusammenhängende Wendung ebenso
 * wenig.
 *
 * Nur Deutsch. Die Absicht hinter diesen Adressen ist lokal, und lokal heisst
 * hier deutschsprachig — eine spanische Fassung von "Webdesigner Essen" wäre
 * eine Adresse, die niemand sucht und die Google als dünn einstuft. Die Route
 * gibt deshalb nur `de` aus `generateStaticParams` zurück.
 *
 * Und die härteste Regel, dieselbe wie in `faq.ts`: hier steht nichts, was
 * nicht anderswo auf der Seite ohnehin belegt ist. Keine Preise, keine
 * Laufzeiten, keine Kundenzahlen, keine Auszeichnungen. Wo eine Zahl vom
 * Projekt abhängt, sagt der Text das, statt zu raten. Eine Leistungsseite,
 * die etwas verspricht, was die restliche Seite nicht hält, kostet mehr als
 * sie bringt.
 */

export type LeistungsAbschnitt = {
  titel: string
  text: string
  punkte?: string[]
}

export type Leistung = {
  /** Der letzte Teil der Adresse: /leistungen/<slug> */
  slug: string
  /** Für die Brotkrume und die Navigation. */
  kurz: string
  metaTitel: string
  metaText: string
  /** Die Überschrift der Seite. Sie trägt die Wendung, die gesucht wird —
   *  einmal, an der Stelle, an der sie ohnehin hingehört. */
  h1: string
  vorspann: string
  /** Der Name der Leistung in den strukturierten Daten. */
  dienstName: string
  dienstText: string
  abschnitte: LeistungsAbschnitt[]
  fragen: { frage: string; antwort: string }[]
}

const ORT =
  'Issa Hareb lebt in Essen in Nordrhein-Westfalen; der im Impressum eingetragene Sitz ist Sankt Augustin. Gearbeitet wird für Kunden in Essen, im Ruhrgebiet, im gesamten deutschsprachigen Raum und remote.'

const KEINE_AGENTUR =
  'Entwurf, Umsetzung und Betrieb liegen bei derselben Person. Es gibt keine Übergabe zwischen Design, Entwicklung und Betrieb und keinen Aufschlag für Zwischenschichten. Wer beauftragt, schreibt mit der Person, die das System auch baut.'

const ERSTER_SCHRITT =
  'Eine kurze Nachricht mit dem Vorhaben genügt. Innerhalb von 24 Stunden kommt eine ehrliche Einschätzung zu Umfang, Vorgehen und dem nächsten sinnvollen Schritt zurück — auf Wunsch mit einem kostenlosen ersten Design-Entwurf, bevor irgendetwas festgelegt wird.'

export const LEISTUNGEN: Leistung[] = [
  {
    slug: 'webdesign-essen',
    kurz: 'Webdesign',
    metaTitel: 'Webdesigner in Essen — Websites, die Anfragen bringen',
    metaText:
      'Webdesign und Umsetzung aus einer Hand: Entwurf, Programmierung und Betrieb von einer Person. Für Betriebe in Essen und im Ruhrgebiet. Antwort innerhalb von 24 Stunden.',
    h1: 'Webdesigner in Essen',
    vorspann:
      'Ein Entwurf, der niemand umsetzt, ist ein Bild. Hier kommt beides von derselben Person: das Aussehen und die Website, die daraus wird — gebaut, online gestellt und im Betrieb gehalten.',
    dienstName: 'Webdesign und Website-Entwicklung',
    dienstText:
      'Entwurf, Programmierung, Inbetriebnahme und Betrieb von Websites für Betriebe. Ausgeführt von Issa Hareb aus Essen.',
    abschnitte: [
      {
        titel: 'Was dabei entsteht',
        text: 'Eine Website ist kein Bild von einer Website. Was hier entworfen wird, wird auch gebaut — mit den Abläufen dahinter, die aus einem Besuch eine Anfrage machen.',
        punkte: [
          'Entwurf und Aufbau der Seiten, abgestimmt auf das, was der Betrieb wirklich anbietet',
          'Buchungs- und Kontaktstrecken, die im Postfach ankommen und nicht im Nichts',
          'Automatische E-Mails an Kunde und Betrieb, sobald etwas hereinkommt',
          'Ein Kundenbereich oder eine Admin-Oberfläche, wenn der Ablauf einen braucht',
          'Technisches SEO: Struktur, Ladezeit, strukturierte Daten, Sitemap',
        ],
      },
      {
        titel: 'Gestaltung und Technik trennen sich hier nicht',
        text: 'Der häufigste Bruch in Webprojekten liegt zwischen dem Entwurf und dem, was am Ende im Browser steht: Abstände, die nicht halten, Schriften, die anders setzen, ein Verhalten auf dem Telefon, an das im Entwurf niemand gedacht hat. Wenn dieselbe Person entwirft und baut, gibt es diese Übergabe nicht — und damit auch nicht die Stelle, an der eine gute Idee verloren geht.',
      },
      {
        titel: 'Ein Beleg statt einer Behauptung',
        text: 'taxibbessen.de ist eine gebaute Website und keine Präsentation: Buchungen sofort oder auf Termin, ein Verwaltungsbereich mit eigener Datenbank, automatische E-Mails und technisches SEO bis hinunter zu den strukturierten Daten. Seobility misst dort 92/100 Onpage, 99/100 Technik, 97/100 Struktur und 80/100 Inhalt (gemessen am 28.07.2026).',
      },
      {
        titel: 'Ohne Agentur dazwischen',
        text: KEINE_AGENTUR,
      },
      {
        titel: 'Wie es losgeht',
        text: ERSTER_SCHRITT,
      },
    ],
    fragen: [
      {
        frage: 'Was kostet Webdesign in Essen bei Issa Hareb?',
        antwort:
          'Der Preis hängt vom Umfang ab: eine Website mit Kontaktstrecke ist etwas anderes als eine Anwendung mit Kundenbereich, Datenbank und Rollenrechten. Issa Hareb nennt den Preis erst, nachdem der Umfang geklärt ist, und erstellt vorab kostenlos einen ersten Design-Entwurf.',
      },
      {
        frage: 'Macht Issa Hareb nur das Design oder auch die Umsetzung?',
        antwort:
          'Beides. Issa Hareb entwirft die Website und programmiert sie anschliessend selbst, stellt sie online und hält sie im Betrieb. Es gibt keinen zweiten Dienstleister, der den Entwurf umsetzt.',
      },
      {
        frage: 'Arbeitet Issa Hareb auch ausserhalb von Essen?',
        antwort:
          'Ja. Issa Hareb arbeitet für Kunden im gesamten deutschsprachigen Raum und remote. Essen und das Ruhrgebiet sind der räumliche Schwerpunkt, aber keine Voraussetzung für ein Projekt.',
      },
      {
        frage: 'Wird eine bestehende Website überarbeitet oder immer neu gebaut?',
        antwort:
          'Beides ist möglich. Wenn das Grundgerüst einer Website trägt, wird sie überarbeitet statt ersetzt; wenn nicht, ist ein Neubau günstiger als das Flicken. Was davon sinnvoll ist, sagt Issa Hareb nach einem Blick auf die bestehende Seite.',
      },
      {
        frage: 'Übernimmt Issa Hareb auch den Betrieb der Website?',
        antwort:
          'Ja. Websites von Issa Hareb bleiben nach dem Start überwacht und gepflegt. Wenn etwas klemmt, schreibt man ihm direkt und nicht einer Hotline.',
      },
    ],
  },
  {
    slug: 'fullstack-entwickler-essen',
    kurz: 'Full-Stack-Entwicklung',
    metaTitel: 'Full-Stack-Entwickler in Essen — Websites, Web-Apps, KI-Agenten',
    metaText:
      'Full-Stack-Entwickler aus Essen: Oberfläche, Backend, Datenbank und Deployment aus einer Hand. Websites, individuelle Webanwendungen, KI-Agenten und Automatisierungen.',
    h1: 'Full-Stack-Entwickler in Essen',
    vorspann:
      'Oberfläche, Backend, Datenbank, die Schnittstellen dazwischen und der Betrieb danach — von einer Person geplant, gebaut und live gehalten. Kein Konzept, keine Demo.',
    dienstName: 'Full-Stack-Entwicklung',
    dienstText:
      'Entwicklung von Websites, Webanwendungen, KI-Agenten und Automatisierungen über den gesamten Stapel: Oberfläche, Backend, Datenbank, Deployment und Betrieb. Ausgeführt von Issa Hareb aus Essen.',
    abschnitte: [
      {
        titel: 'Was gebaut wird',
        text: 'Nicht ein Ausschnitt, sondern das laufende System — von der ersten Zeile bis zu dem Tag, an dem es Arbeit abnimmt.',
        punkte: [
          'Websites mit digitalen Kundenprozessen: Buchung, Kontakt, automatische E-Mails, Kundenbereich',
          'Individuelle Webanwendungen: Dashboards, CRM, Buchungssysteme, Rollen und Rechte',
          'KI-Agenten und Automatisierungen: Anfragen vorsortieren, Dokumente erstellen, Daten auswerten, Dienste verbinden',
          'MVPs und Produktprototypen: eine benutzbare erste Fassung in Wochen statt einer fertig gedachten in Monaten',
          'Telefon- und Support-Agenten in Echtzeit-Sprache, ohne Menübaum',
        ],
      },
      {
        titel: 'Womit',
        text: 'TypeScript, React und Next.js in der Oberfläche. Node.js und PostgreSQL dahinter. Three.js, wenn etwas dreidimensional werden soll. Dazu KI-Systeme mit Retrieval, Werkzeugaufrufen und Leitplanken sowie Deployment und Überwachung auf der Plattform, die zum Projekt passt — Linux-VPS, Railway, Render, Cloudflare.',
      },
      {
        titel: 'Was „Full-Stack" hier bedeutet',
        text: 'Nicht, dass jemand von allem ein bisschen kann, sondern dass niemand zwischendurch übergibt. Der Entwurf kennt die Datenbank, die Datenbank kennt den Ablauf, und wer nachts das Log liest, ist derselbe, der die Oberfläche gebaut hat. Genau dort, an den Übergaben, verliert ein Projekt sonst die meiste Zeit.',
      },
      {
        titel: 'L.U.K.A.S. als eigener Beleg',
        text: 'L.U.K.A.S. ist ein dauerhafter, autonomer Agent mit eigenem Gedächtnis als Wissensgraph, eigener Infrastruktur und der Fähigkeit, seinen eigenen Code zu erzeugen, zu prüfen und auszurollen. Er ist kein Kundenprojekt, sondern der Beleg dafür, was hier gebaut wird, wenn niemand den Umfang begrenzt.',
      },
      {
        titel: 'Wo gearbeitet wird',
        text: ORT,
      },
      {
        titel: 'Wie es losgeht',
        text: ERSTER_SCHRITT,
      },
    ],
    fragen: [
      {
        frage: 'Was macht ein Full-Stack-Entwickler?',
        antwort:
          'Ein Full-Stack-Entwickler baut beide Hälften einer Anwendung: die Oberfläche, die man sieht, und alles dahinter — Server, Datenbank, Schnittstellen und den Betrieb. Issa Hareb übernimmt zusätzlich Entwurf und Deployment, sodass ein Projekt ohne Übergaben zwischen mehreren Beteiligten auskommt.',
      },
      {
        frage: 'Welche Technologien setzt Issa Hareb ein?',
        antwort:
          'Issa Hareb arbeitet mit TypeScript, React und Next.js im Frontend, mit Node.js und PostgreSQL im Backend und mit 3D im Web über Three.js. Dazu kommen KI-Systeme mit Retrieval, Tooling und Guardrails sowie Deployment und Monitoring auf der jeweils passenden Plattform.',
      },
      {
        frage: 'Wie lange dauert ein Projekt?',
        antwort:
          'Die Dauer richtet sich nach dem Umfang. Issa Hareb arbeitet in klaren Etappen: Anforderungen klären, Konzept festlegen, Design und Architektur entwerfen, umsetzen, testen und live stellen. Nach dem ersten Gespräch nennt er eine belastbare Einschätzung statt einer pauschalen Zahl.',
      },
      {
        frage: 'Entwickelt Issa Hareb auch KI-Agenten?',
        antwort:
          'Ja. Issa Hareb entwickelt KI-Agenten und Automatisierungen, die wiederkehrende Arbeit übernehmen: Anfragen vorsortieren, Dokumente erstellen, Daten auswerten, E-Mails vorbereiten und Dienste miteinander verbinden.',
      },
      {
        frage: 'Was unterscheidet ihn von einer Agentur?',
        antwort: KEINE_AGENTUR,
      },
    ],
  },
]

export function leistungFuer(slug: string): Leistung | undefined {
  return LEISTUNGEN.find((l) => l.slug === slug)
}
