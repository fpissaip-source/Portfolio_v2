import type { Metadata } from "next";
import { Abschnitt, Knopf, Projektbild, Ueberschrift } from "@/components/hd2-bausteine";
import { marke, referenzen } from "@/lib/hd2-site";

export const metadata: Metadata = {
  title: "Referenzen",
  description:
    "Echte Projekte von Hareb Digital aus Essen: ein live laufendes Kundensystem, ein autonomer KI-Agent und weitere Plattformen — mit Bildern und Stand.",
    alternates: { canonical: "/referenzen/" },
};

export default function Referenzseite() {
  return (
    <>
      <Abschnitt className="pt-20 sm:pt-24">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Referenzen</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-nebel">
          Alles hier ist gebaut und läuft — kein Konzeptbild, keine erfundene Kundenstimme. Wo ein
          Projekt noch in Entwicklung ist, steht es dabei.
        </p>
      </Abschnitt>

      <Abschnitt>
        <div className="grid gap-8 md:grid-cols-2">
          {referenzen.map((r) => (
            <article key={r.name} className="rounded-2xl border border-white/10 bg-kohle/60 p-6">
              <Projektbild name={r.bild} alt={`Bildschirmansicht des Projekts ${r.name}`} />
              <p className="mt-5 text-xs uppercase tracking-wider text-leuchten">{r.kategorie}</p>
              <h2 className="mt-2 text-xl font-semibold">{r.name}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-nebel">{r.text}</p>
              <p className="mt-4 text-xs text-nebel">{r.stand}</p>
            </article>
          ))}
        </div>
      </Abschnitt>

      <Abschnitt>
        <Ueberschrift eyebrow="Mehr">Technische Tiefe</Ueberschrift>
        <p className="mt-4 max-w-2xl text-nebel">
          Wer den Code sehen will, statt Beschreibungen zu lesen: L.U.K.A.S. liegt öffentlich auf
          GitHub, samt Sicherheitsmodell und Prüfungen. Das ausführliche Entwicklerprofil steht im
          Portfolio.
        </p>
        <div className="mt-7">
          <Knopf href={marke.portfolio} variante="leer">
            Zum Portfolio
          </Knopf>
        </div>
      </Abschnitt>
    </>
  );
}
