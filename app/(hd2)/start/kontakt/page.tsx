import type { Metadata } from "next";
import { Abschnitt } from "@/components/hd2-bausteine";
import { kontakt, marke } from "@/lib/hd2-site";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontakt zu Hareb Digital, Webagentur in Essen. Kostenloses 30-Minuten-Erstgespräch, Antwort innerhalb von 24 Stunden.",
    alternates: { canonical: "/kontakt/" },
};

export default function Kontaktseite() {
  return (
    <Abschnitt className="pt-20 sm:pt-24">
      <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
        {kontakt.h1}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-nebel">{kontakt.text}</p>

      <ul className="mt-8 space-y-2.5 text-nebel">
        {kontakt.punkte.map((p) => (
          <li key={p} className="flex items-center gap-2.5">
            <span aria-hidden className="size-1.5 rounded-full bg-leuchten" />
            {p}
          </li>
        ))}
      </ul>

      <dl className="mt-12 grid gap-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-nebel">E-Mail</dt>
          <dd className="mt-1 text-lg">
            <a href={`mailto:${marke.email}`} className="hover:text-leuchten">
              {marke.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-nebel">Telefon</dt>
          <dd className="mt-1 text-lg">
            <a href={`tel:${marke.telefon.replace(/\s/g, "")}`} className="hover:text-leuchten">
              {marke.telefon}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm text-nebel">Sitz</dt>
          <dd className="mt-1 text-lg">{marke.ort}</dd>
        </div>
        <div>
          <dt className="text-sm text-nebel">Tätig in</dt>
          <dd className="mt-1 text-lg">{marke.gebiet.join(", ")}</dd>
        </div>
      </dl>
    </Abschnitt>
  );
}
