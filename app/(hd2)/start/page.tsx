import type { Metadata } from "next";
import { Abschnitt, Karte, Knopf, Projektbild, Ueberschrift } from "@/components/hd2-bausteine";
import { ablauf, fragen, leistungen, pfad, referenzen, start } from "@/lib/hd2-site";

export const metadata: Metadata = {
  /*
   * "absolute", damit die Vorlage aus dem Layout hier NICHT greift. Sonst
   * stuende der Markenname zweimal im Titel — einmal aus der Vorlage, einmal
   * aus dem Text. Ueber sechzig Zeichen kuerzt Google ohnehin.
   */
  title: { absolute: "Hareb Digital — Websites und KI-Systeme, die arbeiten" },
  description: start.beschreibung,
    alternates: { canonical: "/" },
};

/*
 * Die Fragen bekommen strukturierte Daten.
 *
 * Damit kann Google sie direkt im Suchergebnis ausklappen — das nimmt Fläche
 * weg von den Wettbewerbern darüber und darunter, und zwar ohne dass man
 * dafür besser ranken muss.
 */
function fragenDaten() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: fragen.map((f) => ({
      "@type": "Question",
      name: f.frage,
      acceptedAnswer: { "@type": "Answer", text: f.antwort },
    })),
  };
}

export default function Startseite() {
  const hervorgehoben = referenzen.filter((r) => "hervorgehoben" in r && r.hervorgehoben);

  return (
    <>
      <Abschnitt className="pt-20 sm:pt-28">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-leuchten">
          {start.ortszeile}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
          {start.h1}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-nebel">{start.vorspann}</p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Knopf href={start.hauptCta.href}>{start.hauptCta.label}</Knopf>
          <Knopf href={start.zweitCta.href} variante="leer">
            {start.zweitCta.label}
          </Knopf>
        </div>

        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-nebel">
          {start.belege.map((b) => (
            <li key={b} className="flex items-center gap-2">
              <span aria-hidden className="size-1.5 rounded-full bg-leuchten" />
              {b}
            </li>
          ))}
        </ul>
      </Abschnitt>

      <Abschnitt id="leistungen">
        <Ueberschrift eyebrow="Leistungen">Was ich für Sie baue</Ueberschrift>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {leistungen.map((l) => (
            <Karte key={l.slug}>
              <h3 className="text-lg font-semibold">{l.kurz}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-nebel">{l.einleitung}</p>
              <p className="mt-5">
                <a href={pfad(`/${l.slug}`)} className="text-sm font-medium text-leuchten hover:underline">
                  {l.titel} ansehen →
                </a>
              </p>
            </Karte>
          ))}
        </div>
      </Abschnitt>

      <Abschnitt>
        <Ueberschrift eyebrow="Referenzen">Gebaut, nicht behauptet</Ueberschrift>
        <p className="mt-4 max-w-2xl text-nebel">
          Keine erfundenen Kundenstimmen — echte Projekte, die laufen. Zwei davon hier, alle
          weiteren auf der Referenzseite.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {hervorgehoben.map((r) => (
            <article key={r.name} className="rounded-2xl border border-white/10 bg-kohle/60 p-6">
              <Projektbild name={r.bild} alt={`Bildschirmansicht des Projekts ${r.name}`} />
              <p className="mt-5 text-xs uppercase tracking-wider text-leuchten">{r.kategorie}</p>
              <h3 className="mt-2 text-xl font-semibold">{r.name}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-nebel">{r.text}</p>
              <p className="mt-4 text-xs text-nebel">{r.stand}</p>
            </article>
          ))}
        </div>
        <p className="mt-8">
          <a href={pfad("/referenzen")} className="text-sm font-medium text-leuchten hover:underline">
            Alle Referenzen ansehen →
          </a>
        </p>
      </Abschnitt>

      <Abschnitt id="ablauf">
        <Ueberschrift eyebrow="Ablauf">Vier Schritte, keine Überraschungen</Ueberschrift>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ablauf.map((s, i) => (
            <li key={s.titel} className="rounded-2xl border border-white/10 bg-kohle/60 p-6">
              <span className="text-sm font-medium text-leuchten">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.titel}</h3>
              <p className="mt-2 text-sm leading-relaxed text-nebel">{s.text}</p>
            </li>
          ))}
        </ol>
      </Abschnitt>

      <Abschnitt id="fragen">
        <Ueberschrift eyebrow="Fragen">Häufig gefragt</Ueberschrift>
        <dl className="mt-10 divide-y divide-white/10 border-y border-white/10">
          {fragen.map((f) => (
            <div key={f.frage} className="py-6">
              <dt className="text-lg font-medium">{f.frage}</dt>
              <dd className="mt-2 max-w-3xl leading-relaxed text-nebel">{f.antwort}</dd>
            </div>
          ))}
        </dl>
      </Abschnitt>

      <Abschnitt>
        <div className="rounded-2xl border border-white/10 bg-kohle/60 p-8 sm:p-12">
          <h2 className="text-3xl font-semibold tracking-tight">Lassen Sie uns kurz sprechen</h2>
          <p className="mt-4 max-w-2xl text-nebel">
            Dreißig Minuten, kostenlos. Danach wissen Sie, was Ihr Vorhaben kostet und wie lange es
            dauert — verbindlich.
          </p>
          <div className="mt-7">
            <Knopf href="/kontakt">Erstgespräch anfragen</Knopf>
          </div>
        </div>
      </Abschnitt>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fragenDaten()) }}
      />
    </>
  );
}
