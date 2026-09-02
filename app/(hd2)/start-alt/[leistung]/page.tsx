import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Abschnitt, Karte, Knopf, Ueberschrift } from "@/components/hd2-bausteine";
import { leistungen, marke, pfad } from "@/lib/hd2-site";

/*
 * Eine Route, vier Seiten.
 *
 * Jede Leistung bekommt eine eigene URL mit eigenem Titel und eigener
 * Beschreibung — das ist der ganze Unterschied zur alten Seite, die alles
 * hinter Ankern (#leistungen) versteckt hatte. Anker ranken nicht einzeln;
 * eine Seite kann fuer genau einen Suchbegriff antreten.
 *
 * generateStaticParams sorgt dafuer, dass beim Build echte HTML-Dateien
 * entstehen — kein Nachladen, kein JavaScript noetig, damit der Text da ist.
 */
export function generateStaticParams() {
  return leistungen.map((l) => ({ leistung: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ leistung: string }>;
}): Promise<Metadata> {
  const { leistung } = await params;
  const eintrag = leistungen.find((l) => l.slug === leistung);
  if (!eintrag) return {};
  return {
    title: eintrag.titel,
    description: eintrag.beschreibung,
    alternates: { canonical: `/${eintrag.slug}/` },
    openGraph: {
      title: `${eintrag.titel} | ${marke.name}`,
      description: eintrag.beschreibung,
      url: `${marke.domain}/${eintrag.slug}/`,
    },
  };
}

export default async function Leistungsseite({
  params,
}: {
  params: Promise<{ leistung: string }>;
}) {
  const { leistung } = await params;
  const eintrag = leistungen.find((l) => l.slug === leistung);
  if (!eintrag) notFound();

  const andere = leistungen.filter((l) => l.slug !== eintrag.slug);

  return (
    <>
      <Abschnitt className="pt-20 sm:pt-24">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-leuchten">
          {marke.claim}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {eintrag.h1}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-nebel">{eintrag.einleitung}</p>
        <div className="mt-9">
          <Knopf href="/kontakt">Kostenloses Erstgespräch</Knopf>
        </div>
      </Abschnitt>

      <Abschnitt>
        <div className="grid gap-5 sm:grid-cols-2">
          {eintrag.punkte.map((p) => (
            <Karte key={p.titel}>
              <h2 className="text-lg font-semibold">{p.titel}</h2>
              <p className="mt-2.5 text-sm leading-relaxed text-nebel">{p.text}</p>
            </Karte>
          ))}
        </div>
      </Abschnitt>

      {/* Nur die Social-Media-Seite hat eine `vertiefung`. Der Zugriff laeuft
          ueber `in`, weil `leistungen` `as const` ist und die Eintraege
          deshalb verschiedene Typen haben: ein direktes `eintrag.vertiefung`
          waere auf den anderen fuenf ein Typfehler. Dieselbe Pruefung steht
          auf der Startseite bei `hervorgehoben`. */}
      {"vertiefung" in eintrag ? (
        <Abschnitt>
          <div className="rounded-2xl border border-white/10 bg-kohle/60 p-6 sm:p-10">
            <h2 className="max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
              {eintrag.vertiefung.titel}
            </h2>
            <div className="mt-6 flex flex-col gap-5">
              {eintrag.vertiefung.absaetze.map((a) => (
                <p key={a} className="max-w-2xl leading-relaxed text-nebel">
                  {a}
                </p>
              ))}
            </div>
          </div>
        </Abschnitt>
      ) : null}

      <Abschnitt>
        <Ueberschrift eyebrow="Auch möglich">Weitere Leistungen</Ueberschrift>
        <ul className="mt-8 flex flex-wrap gap-3">
          {andere.map((l) => (
            <li key={l.slug}>
              <a
                href={pfad(`/${l.slug}`)}
                className="inline-flex rounded-lg border border-white/15 px-4 py-2 text-sm text-nebel transition hover:border-white/35 hover:text-kreide"
              >
                {l.titel}
              </a>
            </li>
          ))}
        </ul>
      </Abschnitt>
    </>
  );
}
