import type { Metadata } from "next";
import { Abschnitt } from "@/components/hd2-bausteine";
import { marke } from "@/lib/hd2-site";

export const metadata: Metadata = {
  title: "Impressum",
  description: `Impressum und Anbieterkennzeichnung von ${marke.name}.`,
    alternates: { canonical: "/impressum/" },
  // Rechtstexte gehören nicht in den Index — sie sollen niemanden anziehen.
  robots: { index: false, follow: true },
};

export default function Impressum() {
  return (
    <Abschnitt className="pt-20 sm:pt-24">
      <h1 className="text-4xl font-semibold tracking-tight">Impressum</h1>

      <div className="mt-10 max-w-2xl space-y-8 leading-relaxed text-nebel">
        <section>
          <h2 className="text-lg font-semibold text-kreide">Angaben gemäß § 5 DDG</h2>
          <p className="mt-3">
            {marke.name}
            <br />
            {marke.inhaber}
            <br />
            {marke.strasse}
            <br />
            {marke.plz} {marke.ort}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-kreide">Kontakt</h2>
          <p className="mt-3">
            Telefon: {marke.telefon}
            <br />
            E-Mail: {marke.email}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-kreide">Umsatzsteuer</h2>
          <p className="mt-3">PLATZHALTER_USTID</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-kreide">
            Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
          </h2>
          <p className="mt-3">
            {marke.inhaber}, Anschrift wie oben
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-kreide">Streitschlichtung</h2>
          <p className="mt-3">
            Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>
      </div>
    </Abschnitt>
  );
}
