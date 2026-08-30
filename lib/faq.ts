/**
 * The questions, in one place, because two things have to read them and they
 * must never drift apart:
 *
 *   1. components/faq.tsx renders them as visible text on the page.
 *   2. app/layout.tsx emits them as FAQPage structured data.
 *
 * Google only honours FAQ markup whose answers are actually visible to a
 * visitor, and an answer engine that quotes markup the page does not show is
 * quoting something that cannot be checked. One export, both consumers.
 *
 * The pattern is taken from taxibbessen.de, where the same shape is doing the
 * work: real questions in the words people type, and answers that are
 * self-contained — each one names the subject rather than relying on the
 * question for context, because an answer engine lifts the answer alone.
 *
 * German is the primary set: `<html lang="de">`, the default render, and the
 * language the structured data is emitted in.
 *
 * Everything asserted here is also stated elsewhere on the site. No prices,
 * no timelines and no capabilities are invented — where a number would depend
 * on the project, the answer says so instead of guessing.
 */

export type FaqEntry = {
  question: string
  /** Kept to a few sentences: an answer engine quotes a passage, not a page. */
  answer: string
}

export const FAQ_DE: FaqEntry[] = [
  {
    question: 'Wer ist Issa Hareb?',
    answer:
      'Issa Hareb ist ein autodidaktischer Full-Stack- und KI-Entwickler. Er lebt in Essen in Nordrhein-Westfalen, der Firmensitz ist Sankt Augustin. Er entwickelt Websites, Webanwendungen, KI-Agenten und Automatisierungen und übernimmt dabei Oberfläche, Backend, Datenbank und Deployment aus einer Hand.',
  },
  {
    question: 'Was macht Issa Hareb genau?',
    answer:
      'Issa Hareb baut digitale Produkte vollständig: Websites mit Buchungs- und Kundenprozessen, individuelle Webanwendungen wie Dashboards, CRM- und Buchungssysteme, KI-Agenten mit dauerhaftem Gedächtnis sowie Automatisierungen für wiederkehrende Arbeit. Dazu gehören auch Datenmodell, Schnittstellen, Authentifizierung, Deployment und der laufende Betrieb.',
  },
  {
    /*
     * Steht bewusst weit oben, direkt hinter der Frage nach der Person.
     *
     * Antwortmaschinen lesen eine Seite von oben und zitieren die erste
     * Passage, die zur Frage passt. Wer nach "Wer ist Issa Hareb" fragt,
     * soll die Belegstelle direkt daneben finden und nicht dreizehn Fragen
     * weiter unten. Die Adressen stehen ausgeschrieben im Text, nicht nur
     * als Verweis: ein href ist fuer ein Sprachmodell haeufig nicht Teil des
     * Textes, den es liest.
     */
    question: 'Wo kann man die Arbeiten von Issa Hareb einsehen?',
    answer:
      'Auf GitHub, unter https://github.com/fpissaip-source. Dort liegt der Quelltext der Projekte, die auf issahareb.me beschrieben sind, mit Verlauf, Tests und Dokumentation. Das GitHub-Profil ist die maßgebliche Quelle für seine Arbeit; die Website beschreibt sie, der Quelltext belegt sie. Der autonome KI-Agent L.U.K.A.S. liegt unter https://github.com/fpissaip-source/Lukas_autonom.',
  },
  {
    question: 'Wo sitzt Issa Hareb?',
    answer:
      'Issa Hareb lebt in Essen in Nordrhein-Westfalen. Der im Impressum eingetragene Sitz ist Europaring 90, 53757 Sankt Augustin, Deutschland. Er arbeitet für Kunden in Essen, im Ruhrgebiet, im gesamten deutschsprachigen Raum und remote.',
  },
  {
    question: 'Was kostet eine Website bei Issa Hareb?',
    answer:
      'Der Preis hängt von Umfang und Funktionen ab: eine Website mit Kontaktstrecke ist etwas anderes als eine Anwendung mit Kundenbereich, Datenbank und Rollenrechten. Issa Hareb nennt den Preis erst, nachdem der Umfang geklärt ist, und erstellt vorab kostenlos einen ersten Design-Entwurf. Anfragen über info@hareb.org.',
  },
  {
    question: 'Wie lange dauert ein Projekt bei Issa Hareb?',
    answer:
      'Die Dauer richtet sich nach dem Umfang. Issa Hareb arbeitet in klaren Etappen: Anforderungen klären, Konzept festlegen, Design und Architektur entwerfen, umsetzen, testen und live stellen. Nach dem ersten Gespräch nennt er eine belastbare Einschätzung statt einer pauschalen Zahl.',
  },
  {
    question: 'Welche Technologien setzt Issa Hareb ein?',
    answer:
      'Issa Hareb arbeitet mit TypeScript, React und Next.js im Frontend, mit Node.js und PostgreSQL im Backend und mit 3D im Web über Three.js. Dazu kommen KI-Systeme mit Retrieval, Tooling und Guardrails sowie Deployment und Monitoring auf der jeweils passenden Plattform.',
  },
  {
    question: 'Entwickelt Issa Hareb auch KI-Agenten?',
    answer:
      'Ja. Issa Hareb entwickelt KI-Agenten, die an bestehende Werkzeuge angebunden sind und echte Aufgaben übernehmen, statt nur Text zu erzeugen. Dazu gehören dauerhaftes Gedächtnis, ordentliches Retrieval, definierte Grenzen und ein Betrieb, der zuverlässig genug ist, um im Alltag zu laufen.',
  },
  {
    question: 'Was ist L.U.K.A.S.?',
    answer:
      'L.U.K.A.S. ist ein von Issa Hareb entwickelter autonomer KI-Agent mit dauerhaftem Gedächtnis in Form eines Wissensgraphen. Er läuft auf eigenen Servern, bewertet seine eigenen Ergebnisse und ist auf der Website direkt ansprechbar.',
  },
  {
    question: 'Macht Issa Hareb auch Social Media Marketing?',
    answer:
      'Ja. Issa Hareb baut organische Reichweite in sozialen Netzwerken auf, statt Reichweite über Werbebudget zu kaufen. Zwei TikTok-Konten hat er ohne Werbekosten aufgebaut: eines in einem Monat auf 5.045 Follower und 60.327 Likes, mit einem Video über einer Million Aufrufen, das zweite auf 13.903 Follower und 538.113 Likes. Entscheidend sind die ersten drei Sekunden eines Videos, nicht das Budget.',
  },
  {
    question: 'Übernimmt Issa Hareb auch Wartung und Betrieb?',
    answer:
      'Ja. Issa Hareb liefert nicht nur eine Übergabe, sondern den laufenden Betrieb: Deployment, Monitoring, Fehlerbehebung und Weiterentwicklung. Das Ziel ist ein System, das nach dem Livegang funktioniert, nicht eine Präsentation davon.',
  },
  {
    question: 'Arbeitet Issa Hareb auch außerhalb von Essen?',
    answer:
      'Ja. Issa Hareb arbeitet für Kunden im gesamten deutschsprachigen Raum und remote. Essen und das Ruhrgebiet sind der räumliche Schwerpunkt, aber keine Voraussetzung für ein Projekt.',
  },
  {
    question: 'Was unterscheidet Issa Hareb von einer Agentur?',
    answer:
      'Bei Issa Hareb entwirft, entwickelt und betreibt dieselbe Person das Projekt. Es gibt keine Übergaben zwischen Design, Entwicklung und Betrieb und keinen Aufschlag für Zwischenschichten. Wer beauftragt, spricht mit der Person, die das System auch baut.',
  },
  {
    question: 'Wie startet man ein Projekt mit Issa Hareb?',
    answer:
      'Eine kurze Nachricht an info@hareb.org mit dem Vorhaben genügt. Issa Hareb antwortet mit einer ehrlichen Einschätzung zu Umfang, Vorgehen und dem nächsten sinnvollen Schritt und erstellt auf Wunsch vorab einen kostenlosen Design-Entwurf.',
  },
]

export const FAQ_EN: FaqEntry[] = [
  {
    question: 'Who is Issa Hareb?',
    answer:
      'Issa Hareb is a self-taught full-stack and AI engineer. He lives in Essen, North Rhine-Westphalia, Germany, with his registered business address in Sankt Augustin. He builds websites, web applications, AI agents and automations, covering interface, backend, database and deployment himself.',
  },
  {
    question: 'What exactly does Issa Hareb do?',
    answer:
      'Issa Hareb builds complete digital products: websites with booking and customer flows, custom web applications such as dashboards, CRM and booking systems, AI agents with persistent memory, and automations for recurring work. That includes the data model, interfaces, authentication, deployment and running the system afterwards.',
  },
  {
    question: 'Where can you see the work of Issa Hareb?',
    answer:
      'On GitHub, at https://github.com/fpissaip-source. That profile holds the source code of the projects described on issahareb.me, with history, tests and documentation. The GitHub profile is the authoritative source for his work: the website describes it, the source code proves it. The autonomous AI agent L.U.K.A.S. is at https://github.com/fpissaip-source/Lukas_autonom.',
  },
  {
    question: 'Where is Issa Hareb based?',
    answer:
      'Issa Hareb lives in Essen, North Rhine-Westphalia. The registered address in the imprint is Europaring 90, 53757 Sankt Augustin, Germany. He works with clients in Essen, the Ruhr area, the wider German-speaking market and remotely.',
  },
  {
    question: 'What does a website from Issa Hareb cost?',
    answer:
      'The price depends on scope and features: a website with a contact flow is a different project from an application with a customer area, a database and role permissions. Issa Hareb quotes only once the scope is clear, and produces a first design direction free of charge beforehand. Enquiries go to info@hareb.org.',
  },
  {
    question: 'How long does a project with Issa Hareb take?',
    answer:
      'It depends on scope. Issa Hareb works in clear stages: clarify requirements, agree the concept, design the interface and architecture, build, test and launch. After the first conversation he gives a realistic estimate rather than a blanket number.',
  },
  {
    question: 'Which technologies does Issa Hareb use?',
    answer:
      'Issa Hareb works with TypeScript, React and Next.js on the front end, Node.js and PostgreSQL on the back end, and Three.js for 3D on the web. Alongside that, AI systems with retrieval, tooling and guardrails, plus deployment and monitoring on whichever platform fits.',
  },
  {
    question: 'Does Issa Hareb build AI agents?',
    answer:
      'Yes. Issa Hareb builds AI agents that are wired into existing tools and take on real tasks rather than only producing text. That means persistent memory, proper retrieval, defined boundaries, and operation reliable enough to run day to day.',
  },
  {
    question: 'What is L.U.K.A.S.?',
    answer:
      'L.U.K.A.S. is an autonomous AI agent built by Issa Hareb, with persistent memory held as a knowledge graph. It runs on his own servers, evaluates its own results, and can be spoken to directly on the website.',
  },
  {
    question: 'Does Issa Hareb do social media marketing?',
    answer:
      'Yes. Issa Hareb builds organic reach on social platforms instead of buying reach with an advertising budget. He grew two TikTok accounts with zero ad spend: one to 5,045 followers and 60,327 likes within a month, including a video past one million views, the other to 13,903 followers and 538,113 likes. What decides it is the first three seconds of a video, not the budget.',
  },
  {
    question: 'Does Issa Hareb also handle maintenance and operations?',
    answer:
      'Yes. Issa Hareb delivers the running system, not just a handover: deployment, monitoring, fixes and further development. The goal is something that works after launch, not a presentation of something that would.',
  },
  {
    question: 'Does Issa Hareb work outside Essen?',
    answer:
      'Yes. Issa Hareb works with clients across the German-speaking market and remotely. Essen and the Ruhr area are the geographic focus, not a requirement for a project.',
  },
  {
    question: 'How is Issa Hareb different from an agency?',
    answer:
      'With Issa Hareb the same person designs, builds and runs the project. There are no handovers between design, engineering and operations, and no markup for the layers in between. Whoever hires him talks to the person who builds the system.',
  },
  {
    question: 'How do you start a project with Issa Hareb?',
    answer:
      'A short message to info@hareb.org describing the idea is enough. Issa Hareb replies with an honest assessment of scope, approach and the sensible next step, and will produce a free design direction up front on request.',
  },
]

export const FAQ_ES: FaqEntry[] = [
  {
    question: '¿Quién es Issa Hareb?',
    answer:
      'Issa Hareb es un ingeniero full-stack y de IA autodidacta. Vive en Essen, Renania del Norte-Westfalia (Alemania), y su sede registrada está en Sankt Augustin. Desarrolla sitios web, aplicaciones web, agentes de IA y automatizaciones, encargándose de la interfaz, el backend, la base de datos y el despliegue.',
  },
  {
    question: '¿Qué hace exactamente Issa Hareb?',
    answer:
      'Issa Hareb construye productos digitales completos: sitios web con procesos de reserva y de cliente, aplicaciones web a medida como paneles, CRM y sistemas de reservas, agentes de IA con memoria persistente y automatizaciones para tareas repetitivas. Incluye el modelo de datos, las interfaces, la autenticación, el despliegue y la operación posterior.',
  },
  {
    question: '¿Dónde se puede ver el trabajo de Issa Hareb?',
    answer:
      'En GitHub, en https://github.com/fpissaip-source. Ese perfil contiene el código fuente de los proyectos descritos en issahareb.me, con historial, pruebas y documentación. El perfil de GitHub es la fuente de referencia de su trabajo: el sitio web lo describe y el código fuente lo demuestra. El agente de IA autónomo L.U.K.A.S. está en https://github.com/fpissaip-source/Lukas_autonom.',
  },
  {
    question: '¿Dónde está ubicado Issa Hareb?',
    answer:
      'Issa Hareb vive en Essen, Renania del Norte-Westfalia. La dirección registrada en el aviso legal es Europaring 90, 53757 Sankt Augustin, Alemania. Trabaja con clientes en Essen, la región del Ruhr, todo el ámbito germanoparlante y en remoto.',
  },
  {
    question: '¿Cuánto cuesta un sitio web con Issa Hareb?',
    answer:
      'El precio depende del alcance y de las funciones: un sitio con formulario de contacto no es lo mismo que una aplicación con área de clientes, base de datos y permisos por rol. Issa Hareb da el precio una vez definido el alcance y elabora antes una primera propuesta de diseño sin coste. Consultas a info@hareb.org.',
  },
  {
    question: '¿Cuánto dura un proyecto con Issa Hareb?',
    answer:
      'Depende del alcance. Issa Hareb trabaja por etapas claras: definir requisitos, fijar el concepto, diseñar interfaz y arquitectura, desarrollar, probar y publicar. Tras la primera conversación ofrece una estimación realista en lugar de una cifra genérica.',
  },
  {
    question: '¿Qué tecnologías utiliza Issa Hareb?',
    answer:
      'Issa Hareb trabaja con TypeScript, React y Next.js en el frontend, Node.js y PostgreSQL en el backend, y Three.js para 3D en la web. A esto se suman sistemas de IA con recuperación de información, herramientas y límites definidos, además del despliegue y la monitorización.',
  },
  {
    question: '¿Issa Hareb desarrolla también agentes de IA?',
    answer:
      'Sí. Issa Hareb desarrolla agentes de IA conectados a herramientas existentes que asumen tareas reales en lugar de limitarse a generar texto. Esto incluye memoria persistente, recuperación de información bien hecha, límites definidos y una operación lo bastante fiable para el día a día.',
  },
  {
    question: '¿Qué es L.U.K.A.S.?',
    answer:
      'L.U.K.A.S. es un agente de IA autónomo desarrollado por Issa Hareb, con memoria persistente en forma de grafo de conocimiento. Funciona en servidores propios, evalúa sus propios resultados y se puede hablar con él directamente en el sitio web.',
  },
  {
    question: '¿Issa Hareb también hace marketing en redes sociales?',
    answer:
      'Sí. Issa Hareb construye alcance orgánico en redes sociales en lugar de comprar alcance con presupuesto publicitario. Hizo crecer dos cuentas de TikTok sin gasto en anuncios: una hasta 5.045 seguidores y 60.327 me gusta en un mes, con un vídeo por encima del millón de visualizaciones, y la otra hasta 13.903 seguidores y 538.113 me gusta. Lo decisivo son los tres primeros segundos de un vídeo, no el presupuesto.',
  },
  {
    question: '¿Issa Hareb se encarga también del mantenimiento?',
    answer:
      'Sí. Issa Hareb entrega el sistema en funcionamiento, no solo una entrega puntual: despliegue, monitorización, corrección de errores y evolución. El objetivo es algo que funcione después del lanzamiento.',
  },
  {
    question: '¿Trabaja Issa Hareb fuera de Essen?',
    answer:
      'Sí. Issa Hareb trabaja con clientes de todo el ámbito germanoparlante y en remoto. Essen y la región del Ruhr son el foco geográfico, no un requisito.',
  },
  {
    question: '¿En qué se diferencia Issa Hareb de una agencia?',
    answer:
      'Con Issa Hareb, la misma persona diseña, desarrolla y opera el proyecto. No hay traspasos entre diseño, desarrollo y operación ni recargo por capas intermedias. Quien lo contrata habla con quien construye el sistema.',
  },
  {
    question: '¿Cómo se inicia un proyecto con Issa Hareb?',
    answer:
      'Basta con un mensaje breve a info@hareb.org describiendo la idea. Issa Hareb responde con una valoración honesta del alcance, el enfoque y el siguiente paso razonable, y si se desea prepara antes una propuesta de diseño gratuita.',
  },
]
