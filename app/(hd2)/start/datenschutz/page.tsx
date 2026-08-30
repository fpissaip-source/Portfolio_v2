import type { Metadata } from "next";
import { Abschnitt } from "@/components/hd2-bausteine";
import { marke } from "@/lib/hd2-site";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: `Datenschutzerklärung von ${marke.name}.`,
    alternates: { canonical: "/datenschutz/" },
  robots: { index: false, follow: true },
};

/*
 * ACHTUNG — das ist ein GERÜST, keine fertige Datenschutzerklärung.
 *
 * Was hier steht, deckt den Stand ab, in dem die Seite nichts tut ausser
 * Inhalte auszuliefern: keine Analyse, keine Schriften von fremden Servern,
 * keine Einbettungen, kein Formular. Genau so ist sie gebaut, und deshalb
 * braucht sie auch kein Cookie-Banner.
 *
 * Sobald etwas davon dazukommt — ein Kontaktformular, das Lukas-Widget,
 * Analyse, eine Kartenansicht — muss dieser Text erweitert werden, und dann
 * gehoert er von jemandem geprueft, der dafuer haftet. Ich bin das nicht.
 */
export default function Datenschutz() {
  return (
    <Abschnitt className="pt-20 sm:pt-24">
      <h1 className="text-4xl font-semibold tracking-tight">Datenschutzerklärung</h1>

      <div className="mt-10 max-w-2xl space-y-8 leading-relaxed text-nebel">
        <p className="rounded-xl border border-white/15 bg-kohle/60 p-4 text-sm">
          PLATZHALTER_RECHTSPRUEFUNG — dieser Text ist ein Gerüst für den aktuellen Stand der
          Seite und muss vor dem Livegang geprüft und ergänzt werden.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-kreide">Verantwortlicher</h2>
          <p className="mt-3">
            {marke.name}, {marke.inhaber}
            <br />
            {marke.strasse}, {marke.plz} {marke.ort}
            <br />
            {marke.email}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-kreide">Server-Logdateien</h2>
          <p className="mt-3">
            Beim Abruf dieser Seite verarbeitet der Hoster technisch notwendige Daten wie
            IP-Adresse, Zeitpunkt, abgerufene Datei und übermittelnden Browser. Rechtsgrundlage ist
            Art. 6 Abs. 1 lit. f DSGVO — das berechtigte Interesse am sicheren und störungsfreien
            Betrieb.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-kreide">Keine Cookies, keine Analyse</h2>
          <p className="mt-3">
            Diese Seite setzt keine Cookies, bindet keine Analysedienste ein und lädt keine
            Schriften oder Inhalte von fremden Servern. Es gibt deshalb nichts einzuwilligen.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-kreide">Kontaktaufnahme</h2>
          <p className="mt-3">
            Schreiben Sie uns eine E-Mail, verarbeiten wir Ihre Angaben zur Bearbeitung der Anfrage
            und für den Fall von Anschlussfragen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b bzw.
            lit. f DSGVO.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-kreide">Ihre Rechte</h2>
          <p className="mt-3">
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der
            Verarbeitung, Datenübertragbarkeit und Widerspruch sowie ein Beschwerderecht bei einer
            Aufsichtsbehörde.
          </p>
        </section>
      </div>
    </Abschnitt>
  );
}
