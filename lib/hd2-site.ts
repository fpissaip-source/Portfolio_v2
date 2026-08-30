/*
 * DIE NEUE HAREB-DIGITAL-SEITE, hier zur Ansicht eingehaengt.
 *
 * Herkunft: github.com/fpissaip-source/harebdigital, Stand 5ae2485
 * ("Startseite traegt die Positionierung, der Ort die Unterseiten"). Sie ist
 * dort eine eigenstaendige Next-App fuer harebdigital.de und wird das auch
 * bleiben — dies hier ist eine Vorschau unter issahareb.me/start, damit man
 * sie ansehen kann, bevor die Domain steht.
 *
 * Zwei Dinge sind deshalb anders als im Ursprung:
 *
 * 1. Alle seiteneigenen Verweise laufen durch `pfad()` und bekommen /start
 *    davor. Im Ursprung liegt die Seite auf der Wurzel ihrer Domain und
 *    verweist auf "/kontakt"; hier waere das die Kontaktseite des Portfolios,
 *    die es nicht gibt.
 * 2. Der Inhalt ist unveraendert uebernommen. Wer etwas am Text aendern will,
 *    aendert es im Ursprungsrepo — sonst laufen die beiden Fassungen
 *    auseinander, und die falsche gewinnt beim naechsten Abgleich.
 *
 * Die alte Landingpage liegt weiterhin vollstaendig da, unter /start-alt.
 */

/** Wo die Seite in dieser Anwendung haengt. Auf ihrer eigenen Domain ist das
 *  die Wurzel; hier ein Unterpfad. */
export const BASIS = '/start'

/** Macht aus einem seiteneigenen Pfad einen, der hier funktioniert. Fremde
 *  Adressen, Mail- und Telefonverweise bleiben, wie sie sind. */
export function pfad(p: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(p)) return p
  /* Schon vorangestellt? Dann nichts tun. `Knopf` schickt seinen Verweis
     selbst durch diese Funktion, und an zwei Stellen stand der Aufruf beim
     Portieren zusaetzlich am Aufrufort — heraus kam /start/start/kontakt.
     Die beiden Stellen sind gerichtet; die Pruefung bleibt, weil der Fehler
     sich beim naechsten Abgleich mit dem Ursprung sonst wiederholt. */
  if (p === BASIS || p.startsWith(BASIS + '/') || p.startsWith(BASIS + '#')) return p
  if (p === '/') return BASIS
  if (p.startsWith('/#')) return BASIS + p.slice(1)
  return BASIS + p.replace(/\/$/, '')
}

/*
 * Alle Texte der Seite an einer Stelle.
 *
 * Die Komponenten enthalten keine Inhalte — wer etwas ändern will, ändert es
 * hier. Das ist derselbe Aufbau wie in der alten Landingpage, und er hat sich
 * bewährt: Texte anzupassen darf keine Suche durch JSX bedeuten.
 *
 * WAS HIER NICHT STEHT: erfundene Kundenstimmen. Der Vorgänger hatte vier
 * Zitate von Menschen, die es nicht gibt — als Platzhalter gedacht, aber im
 * Livegang gefährlich: erfundene Referenzen sind in Deutschland abmahnfähig,
 * und bei einer Seite, die gerade Vertrauen aufbauen soll, wäre das der
 * teuerste denkbare Start. Stattdessen stehen unten echte Projekte, mit den
 * Beschreibungen, die Issa selbst dafür geschrieben hat.
 */

/*
 * Was noch fehlt, steht als PLATZHALTER da — und scripts/check-platzhalter.mjs
 * lässt den Build scheitern, solange davon etwas übrig ist. Genau daran ist
 * die Vorgängerseite fast gescheitert.
 */
export const PLATZHALTER = "PLATZHALTER";

export const marke = {
  name: "Hareb Digital",
  claim: "Webagentur aus Essen",
  domain: "https://harebdigital.de",
  email: `${PLATZHALTER}@harebdigital.de`,
  telefon: PLATZHALTER,
  strasse: PLATZHALTER,
  plz: PLATZHALTER,
  ort: "Essen",
  land: "DE",
  // Wo tatsächlich gearbeitet wird — das darf ruhig weiter reichen als der Ort.
  gebiet: ["Essen", "Bochum", "Gelsenkirchen", "Duisburg", "Oberhausen", "Mülheim an der Ruhr"],
  inhaber: "Issa Hareb",
  portfolio: "https://issahareb.me",
} as const;

export const navigation = [
  { label: "Leistungen", href: "/#leistungen" },
  { label: "Referenzen", href: "/referenzen" },
  { label: "Ablauf", href: "/#ablauf" },
  { label: "Kontakt", href: "/kontakt" },
] as const;

export const start = {
  /*
   * Die Startseite traegt die POSITIONIERUNG, nicht den Ort.
   *
   * Hier stand zuerst "Webagentur Essen" als Titel und "Websites aus Essen"
   * als Ueberschrift. Das war zu eng: die Startseite ist die staerkste Seite,
   * und wer aus Hamburg kommt und den Namen sucht, liest dort als Erstes eine
   * geografische Einschraenkung, die es gar nicht gibt.
   *
   * Der Ortsbezug sitzt deshalb auf den lokalen Unterseiten — dort, wo die
   * Suchen mit Kaufabsicht liegen. Lokal ist die Tuer, nicht die Decke.
   */
  titel: "Hareb Digital",
  h1: "Websites und KI-Systeme, gebaut von dem, der sie entwickelt",
  beschreibung:
    "Hareb Digital baut Websites, Landingpages und KI-Systeme: individuell entwickelt statt Baukasten. Aus Essen, remote für Kunden im gesamten deutschsprachigen Raum.",
  vorspann:
    "Kein Template, kein Plugin-Stapel, keine Agentur-Kette. Sie haben einen Ansprechpartner, und der ist derjenige, der es gebaut hat, von der Struktur über das Design bis zum Code.",
  ortszeile: "Sitz in Essen · remote für Kunden im gesamten deutschsprachigen Raum",
  hauptCta: { label: "Kostenloses Erstgespräch", href: "/kontakt" },
  zweitCta: { label: "Referenzen ansehen", href: "/referenzen" },
  belege: [
    "Live-Kundenprojekt in Essen",
    "Ladezeit unter einer Sekunde",
    "Barrierefrei nach BFSG",
    "Festpreis statt Stundenzettel",
  ],
} as const;

/*
 * Die Leistungsseiten.
 *
 * Jede bekommt eine eigene URL — das ist der Unterschied zur alten
 * Single-Page mit Ankern. Eine Seite kann für einen Suchbegriff ranken; sechs
 * Seiten können es für sechs. Der "slug" ist gleichzeitig der Suchbegriff, auf
 * den die Seite zielt.
 */
export const leistungen = [
  {
    slug: "webdesign-essen",
    kurz: "Webdesign",
    titel: "Webdesign Essen",
    beschreibung:
      "Individuelles Webdesign aus Essen: Struktur, Gestaltung und Umsetzung aus einer Hand. Schnell, barrierefrei und auf Anfragen gebaut.",
    h1: "Webdesign aus Essen: individuell statt aus dem Baukasten",
    einleitung:
      "Die meisten Websites im Ruhrgebiet sind Vorlagen mit ausgetauschten Bildern. Das sieht man ihnen an, und Google sieht es auch. Ich entwerfe und baue Ihre Seite von Grund auf: passend zu dem, was Ihr Betrieb tatsächlich macht, und schnell genug, dass niemand vorher abspringt.",
    punkte: [
      { titel: "Entwurf, den Sie anfassen können", text: "Sie sehen früh einen klickbaren Entwurf im Browser. Kein PDF, aus dem man sich das Ergebnis denken muss." },
      { titel: "Handgebaut, nicht zusammengesteckt", text: "Kein WordPress-Theme mit zwanzig Plugins, die sich gegenseitig ausbremsen und jede Woche Sicherheitslücken nachreichen." },
      { titel: "Barrierefrei von Anfang an", text: "Kontraste, Tastaturbedienung, Vorlesbarkeit. Seit dem Barrierefreiheitsstärkungsgesetz ist das für viele Unternehmen Pflicht und nachträglich teurer." },
      { titel: "Pflegbar ohne mich", text: "Auf Wunsch mit CMS, damit Sie Texte und Bilder selbst ändern. Eine Einweisung ist dabei." },
    ],
  },
  {
    /*
     * Zweite lokale Seite, bewusst mit ANDEREM Blickwinkel als
     * webdesign-essen: dort geht es ums Bauen, hier um die Zusammenarbeit.
     * Zwei Seiten mit demselben Inhalt waeren duenner Doppelinhalt — Google
     * waehlt dann eine aus und wirft die andere weg.
     */
    slug: "webagentur-essen",
    kurz: "Agentur aus Essen",
    titel: "Webagentur Essen",
    beschreibung:
      "Webagentur in Essen: ein Ansprechpartner für Website, SEO, Betreuung und Automatisierung. Persönlich vor Ort im Ruhrgebiet, remote überall sonst.",
    h1: "Eine Webagentur in Essen, mit einem Ansprechpartner statt einer Kette",
    einleitung:
      "In den meisten Agenturen reden Sie mit jemandem, der nicht baut, und jemand baut, mit dem Sie nie reden. Bei mir ist das dieselbe Person. Das kürzt jede Rückfrage ab und ist der Grund, warum Projekte hier in Wochen fertig werden und nicht in Quartalen.",
    punkte: [
      { titel: "Persönlich im Ruhrgebiet", text: "Essen, Bochum, Gelsenkirchen, Duisburg, Oberhausen, Mülheim: dort komme ich vorbei. Alles Weitere geht per Video, das ändert am Ergebnis nichts." },
      { titel: "Alles aus einer Hand", text: "Design, Entwicklung, Texte, SEO und Betreuung. Sie koordinieren keine drei Dienstleister, die sich gegenseitig die Schuld geben." },
      { titel: "Betreuung statt Übergabe und weg", text: "Auf Wunsch Wartung, Updates und Überwachung mit monatlichem Bericht. Ohne Betreuung bekommen Sie alles vollständig übergeben: Code, Domain, Zugänge." },
      { titel: "Auch das, was andere nicht bauen", text: "Wenn Ihr Vorhaben über eine Website hinausgeht (Automatisierung, Auswertungen, ein KI-Agent), muss dafür niemand hinzugezogen werden." },
    ],
  },
  {
    slug: "website-erstellen-lassen",
    kurz: "Website erstellen lassen",
    titel: "Website erstellen lassen",
    beschreibung:
      "Website erstellen lassen bei einem Entwickler aus Essen: Festpreis, klarer Ablauf, Ladezeit unter einer Sekunde und Betreuung nach dem Launch.",
    h1: "Website erstellen lassen, mit Festpreis und ohne Überraschungen",
    einleitung:
      "Die zwei häufigsten Fragen sind immer dieselben: Was kostet es, und wie lange dauert es? Beides beantworte ich vor dem ersten Handschlag, als Festpreis und nicht als Schätzung, die später wächst.",
    punkte: [
      { titel: "Festpreis nach dem Erstgespräch", text: "Nach dreißig Minuten weiß ich genug für eine verbindliche Zahl. Kommt später etwas dazu, besprechen wir das vorher." },
      { titel: "Zwei bis acht Wochen", text: "Eine Landingpage in zwei bis drei Wochen, eine mehrseitige Unternehmensseite in vier bis acht. Der Zeitplan hängt vor allem davon ab, wie schnell Inhalte und Rückmeldungen kommen." },
      { titel: "Texte und Bilder inklusive", text: "Auf Wunsch schreibe ich die Texte und kümmere mich um Bildmaterial. Vorhandenes binde ich ein." },
      { titel: "Die Seite gehört Ihnen", text: "Code, Domain und Zugänge werden vollständig übergeben. Keine Miete, keine Abhängigkeit." },
    ],
  },
  {
    slug: "landingpage-erstellen-lassen",
    kurz: "Landingpages",
    titel: "Landingpage erstellen lassen",
    beschreibung:
      "Landingpage erstellen lassen: eine Seite, ein Ziel. Aufgebaut für Anfragen, mit Tracking, schnellem Aufbau und messbarem Ergebnis.",
    h1: "Landingpages, die eine Aufgabe haben und sie erfüllen",
    einleitung:
      "Eine Landingpage ist keine kleine Website. Sie hat genau ein Ziel (eine Anfrage, eine Anmeldung, einen Verkauf), und alles, was davon ablenkt, gehört nicht darauf. Genau daran scheitern die meisten.",
    punkte: [
      { titel: "Aufgebaut auf einen Zweck", text: "Aufbau, Reihenfolge und Text richten sich nach der einen Handlung, die am Ende stehen soll." },
      { titel: "Messbar statt gefühlt", text: "Tracking gehört dazu, sonst weiß niemand, ob sie funktioniert. Sie bekommen die Zahlen, nicht nur die Seite." },
      { titel: "Schnell live", text: "In der Regel zwei bis drei Wochen von der ersten Skizze bis zum Livegang." },
    ],
  },
  {
    slug: "ki-agenten-fuer-unternehmen",
    kurz: "KI-Systeme",
    titel: "KI-Agenten für Unternehmen",
    beschreibung:
      "KI-Agenten und Automatisierung für Unternehmen aus Essen: Systeme, die eigenständig arbeiten, mit Freigaben, Protokoll und Grenzen im Code statt im Prompt.",
    h1: "KI-Systeme, die wirklich arbeiten und nachvollziehbar bleiben",
    einleitung:
      "Die meisten „KI-Lösungen“ sind ein Chatfenster vor einer fremden API. Ich baue Systeme, die eigenständig Aufgaben erledigen: E-Mails lesen und Antworten vorbereiten, Recherchen durchführen, Daten zusammentragen, Webseiten bedienen. Mit einer Grenze, die im Code steht und nicht als Bitte im Prompt.",
    punkte: [
      { titel: "Entscheidungen mit Freigabe", text: "Alles, was nach außen wirkt oder Geld kostet, wird vorgelegt statt einfach getan. Die Prüfung sitzt im Code. Ein Sprachmodell ist nie eine Zugangskontrolle." },
      { titel: "Nachvollziehbar", text: "Jeder Schritt wird protokolliert. Sie können nachlesen, was das System getan hat und warum." },
      { titel: "Nicht aus der Broschüre", text: "L.U.K.A.S., mein eigener autonomer Agent, läuft seit Monaten produktiv. Der Quelltext ist öffentlich einsehbar, samt Sicherheitsmodell und Prüfungen." },
    ],
  },
] as const;

/*
 * Echte Projekte. Die Beschreibungen stammen wörtlich aus Issas eigenem
 * Portfolio (lib/translations.ts, projectsDE) — hier nur gekürzt auf das, was
 * einen Auftraggeber interessiert.
 */
export const referenzen = [
  {
    name: "TaxiBB Essen",
    bild: "taxibb",
    kategorie: "Live-Kundensystem · Essen",
    text: "Transport- und Logistikplattform, end-to-end für einen echten Kunden umgesetzt. Sofortbuchungen und geplante Buchungen, Admin-Bereich auf PostgreSQL, E-Mail-Workflows und kompromisslose technische SEO mit JSON-LD.",
    stand: "Live im Einsatz",
    hervorgehoben: true,
  },
  {
    name: "L.U.K.A.S.",
    bild: "lukas",
    kategorie: "Autonomes KI-System",
    text: "Ein Agent mit dauerhaftem Gedächtnis, eigenen Werkzeugen und einem Freigabesystem im Code. Läuft produktiv, der Quelltext ist öffentlich, samt Sicherheitsmodell und achtundzwanzig maschinellen Prüfungen.",
    stand: "Produktiv",
    hervorgehoben: true,
  },
  {
    name: "GuardianGrid",
    bild: "guardiangrid-login",
    kategorie: "Plattform · guardiangrid.io",
    text: "Eigenständige Begleit-Plattform auf der Bungie-API: OAuth2-Anmeldung mit Cloudflare Turnstile, Inventar-Auswertung, automatisierte Build-Analyse und nahezu Echtzeit-Zustände.",
    stand: "Aktiv in Entwicklung",
  },
  {
    name: "StudyForge",
    bild: "studyforge",
    kategorie: "KI-Lernplattform",
    text: "Vom Dokument zum Lerninhalt: PDFs hochladen, daraus Zusammenfassungen, Schlüsselbegriffe und adaptive Quiz erzeugen, inklusive Prüfungssimulation und Lernhistorie.",
    stand: "Produkt-Prototyp",
  },
  {
    name: "Bewerbungsbot",
    bild: "bewerbungsbot",
    kategorie: "KI-Agent",
    text: "Aggregiert Ausbildungsstellen über die API der Bundesagentur für Arbeit, findet echte Firmenkontakte, formuliert ein personalisiertes Anschreiben streng auf Basis des eigenen Lebenslaufs und versendet die Bewerbung als PDF.",
    stand: "Im Einsatz",
  },
  {
    name: "Team Operations Suite",
    bild: "teamops",
    kategorie: "Ops-Plattform",
    text: "Interne Performance-, CRM- und Workforce-Plattform: KPI-Dashboards, Kundendokumentation, Schichtplanung, interner Chat und Rollenverwaltung.",
    stand: "Full-Stack-Konzept",
  },
] as const;

export const ablauf = [
  { titel: "Gespräch", text: "Dreißig Minuten: Ziel, Zielgruppe, Budget. Danach wissen Sie, ob wir zusammenpassen, kostenlos und unverbindlich." },
  { titel: "Festpreis & Konzept", text: "Sie bekommen eine verbindliche Zahl und die Struktur der Seite, bevor irgendetwas gebaut wird." },
  { titel: "Umsetzung", text: "Design und Entwicklung mit frühem Testlink. Sie sehen den Fortschritt, statt auf eine Überraschung zu warten." },
  { titel: "Launch & danach", text: "Livegang, Messung, Feinschliff. Auf Wunsch laufende Betreuung mit Updates und monatlichem Bericht." },
] as const;

export const fragen = [
  { frage: "Was kostet eine Website?", antwort: "Eine fokussierte Landingpage startet im niedrigen vierstelligen Bereich, eine mehrseitige Unternehmensseite liegt darüber. Den genauen Rahmen nenne ich nach dem Erstgespräch, als Festpreis und nicht als Schätzung." },
  { frage: "Wie lange dauert es?", antwort: "Landingpage zwei bis drei Wochen, größere Seiten vier bis acht. Der Zeitplan hängt vor allem davon ab, wie schnell Inhalte und Rückmeldungen kommen." },
  { frage: "Arbeiten Sie nur in Essen?", antwort: "Der Schwerpunkt liegt im Ruhrgebiet: Essen, Bochum, Gelsenkirchen, Duisburg, Oberhausen und Mülheim. Alles andere geht auch, dann eben per Video statt vor Ort." },
  { frage: "Kann ich die Inhalte selbst pflegen?", antwort: "Ja. Auf Wunsch mit CMS, mit dem Sie Texte, Bilder und ganze Abschnitte ohne Code ändern. Eine kurze Einweisung ist inklusive." },
  { frage: "Muss meine Website barrierefrei sein?", antwort: "Seit dem Barrierefreiheitsstärkungsgesetz gilt das für viele Unternehmen mit Endkundengeschäft. Ich baue barrierefrei von Anfang an. Nachträglich ist es aufwendiger und teurer." },
  { frage: "Was passiert nach dem Launch?", antwort: "Auf Wunsch übernehme ich Wartung, Updates und Überwachung und melde mich monatlich mit Zahlen. Ohne Betreuung bekommen Sie die Seite vollständig übergeben: Code, Domain und Zugänge." },
] as const;

export const kontakt = {
  titel: "Kontakt",
  h1: "Erzählen Sie mir in zwei Sätzen, worum es geht",
  text: "Ich melde mich innerhalb von 24 Stunden mit einer ehrlichen Einschätzung, auch dann, wenn ich nicht der Richtige für Ihr Vorhaben bin.",
  punkte: ["Kostenloses 30-Minuten-Gespräch", "Festpreis statt Stundenzettel", "Antwort innerhalb von 24 Stunden"],
} as const;
