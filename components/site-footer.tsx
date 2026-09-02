"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { useLanguage, useT } from "./language-context";
import { langPath } from "@/lib/i18n";
import { openConsentSettings } from "@/lib/consent";

const SOCIALS = [
  {
    type: "img" as const,
    src: "/logos/github.svg",
    href: "https://github.com/fpissaip-source",
    label: "GitHub",
  },
  // Restored with the real profile URL. It had shipped as href="#", which
  // looks like a live profile link and instead jumps to the top of a
  // 21,000px page, so it was pulled until there was something to point at.
  //
  // The www form rather than de.linkedin.com: the locale subdomain is a
  // mirror that redirects, and this URL is also the one in `sameAs` — a
  // corroborating profile only corroborates if both places name it
  // identically.
  {
    type: "img" as const,
    src: "/logos/linkedin.svg",
    href: "https://www.linkedin.com/in/issa-hareb-10a61642b",
    label: "LinkedIn",
  },
  // Canonical profile URL, not the /web_profiles tab that was handed over:
  // that one 301s, and `sameAs` has to name the resource itself.
  //
  // A text mark rather than a logo. There is no Xing SVG in public/logos,
  // and inventing a path for a trademarked mark from memory renders
  // garbage; the letters are unambiguous at this size and cost nothing.
  {
    type: "text" as const,
    href: "https://www.xing.com/profile/Issa_Hareb02082",
    label: "Xing",
    mark: "Xg",
  },
  // Das verifizierte Unternehmensprofil. Es steht laengst im sameAs-Array,
  // war aber nirgends auf der Seite verlinkt — und genau das ist der
  // Unterschied, den diese Datei an anderer Stelle selbst benennt: eine
  // Identitaetsbehauptung, die die Seite nicht auch sichtbar macht, ist die
  // schwaechere. Von allen Quellen im Graphen ist dies die einzige, deren
  // Angaben Google selbst geprueft hat, bevor es sie veroeffentlicht hat.
  {
    type: "text" as const,
    href: "https://share.google/EUZlSQOOkoXIK0AMM",
    label: "Google-Unternehmensprofil",
    mark: "G",
  },
  { type: "icon" as const, href: "mailto:info@hareb.org", label: "Email" },
];

export function SiteFooter() {
  const t = useT();
  /* Die drei Verweise trugen feste Pfade. Auf /en oder /es hat ein Klick
     darauf die Sprache verlassen: die Fassung ohne Präfix ist die deutsche,
     und wer von der englischen Seite auf das Partnerprogramm ging, landete
     im Deutschen und blieb dort. */
  const { lang } = useLanguage();
  return (
    <>
      {/* Das Wellenfeld am Fuss der Seite. Unterhalb des Kontaktteils war der
          Hintergrund nur noch schwarz; jetzt hoert die Seite dort auf, statt
          einfach zu enden.

          Es liegt hinter dem Band und der Fusszeile und ist nach oben
          ausmaskiert, damit es aus dem Schwarz herauswaechst statt mit einer
          Kante anzufangen. Die Farben sind die der Seite, nicht die der
          Vorlage. */}
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
          }}
        >
          {/* Hier lag eine WebGL-Flaeche von 1280 x 615 Pixeln (React Bits'
              GradientWaves, portiert). Sie war der letzte von sieben
              WebGL-Zustaenden auf dieser Seite und der am leichtesten zu
              ersetzende: was man durch die Maske hindurch sieht, sind ein
              paar weiche diagonale Baender ueber einem Schimmer am unteren
              Rand. Das kann CSS, ohne einen Grafikkontext dafuer zu
              oeffnen. Der Rest dieses Blocks, die Maske nach oben, bleibt
              unveraendert. */}
          <div className="wellenfeld" />
        </div>

        {/*
         * Das Partnerprogramm, vor der Fusszeile statt darin.
         *
         * Es stand als schmaler Link zwischen Impressum und Datenschutz. Dort
         * bietet die Seite 660 Euro Provision an und legt das Angebot unter
         * Rechtstexten ab: an der Stelle sucht es niemand, und wer es findet,
         * haelt es fuer Pflichttext.
         *
         * Jetzt ein eigenes Band mit der Zahl im Klartext. Die Zahl ist das
         * Argument, nicht der Wortlaut "Affiliate" — wer sie sieht, weiss in
         * einer Sekunde, worum es geht, und braucht die Seite dahinter nur
         * noch, um zu pruefen, ob es stimmt.
         */}
        <section className="relative border-t border-white/10 px-6 py-14 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 120% at 20% 100%, color-mix(in oklch, var(--purple) 16%, transparent) 0%, transparent 70%)",
            }}
          />
          <div className="relative mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="font-label text-[13px] uppercase tracking-[0.16em] text-accent-tint">
                {t.footer.affiliateLabel}
              </span>
              <h2 className="mt-3 max-w-[22ch] font-display text-2xl font-bold leading-[1.12] tracking-[-0.02em] sm:text-[2rem]">
                {t.footer.affiliateHeadline}
              </h2>
              <p className="mt-3 max-w-[54ch] text-[17px] leading-[1.6] text-foreground/75">
                {t.footer.affiliateBody}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-start gap-5 lg:items-end">
              <div className="lg:text-right">
                <div className="font-poster text-[3.2rem] leading-none tracking-[-0.02em] text-accent-tint sm:text-[3.8rem]">
                  {t.footer.affiliateAmount}
                </div>
                <p className="mt-2 max-w-[34ch] text-[15px] leading-[1.45] text-foreground/60">
                  {t.footer.affiliateAmountNote}
                </p>
              </div>
              <Link
                href={langPath(lang, "/affiliate")}
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-[16px] font-semibold text-[#050505] transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                {t.footer.affiliateCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>

        <footer className="relative border-t border-white/5 px-6 py-12">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2 text-sm tracking-tight">
              <span className="font-semibold">Issa Hareb</span>
              <span className="text-blue">.</span>
              <span className="text-[15px] text-foreground/70">
                {t.footer.tagline}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  {...(s.href.startsWith("http")
                    ? { target: "_blank", rel: "me noreferrer" }
                    : {})}
                  className="glass flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                >
                  {s.type === "img" ? (
                    <Image
                      src={s.src}
                      alt=""
                      width={16}
                      height={16}
                      className="h-4 w-4 opacity-70 invert transition-opacity hover:opacity-100"
                    />
                  ) : s.type === "text" ? (
                    <span
                      aria-hidden
                      className="text-[13px] font-semibold tracking-tight"
                    >
                      {s.mark}
                    </span>
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                </a>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] font-medium tracking-tight text-foreground/65 sm:justify-end">
              <Link
                href={langPath(lang, "/impressum")}
                className="inline-flex min-h-[24px] items-center py-1.5 transition-colors hover:text-foreground"
              >
                {t.footer.imprint}
              </Link>
              <Link
                href={langPath(lang, "/datenschutz")}
                className="inline-flex min-h-[24px] items-center py-1.5 transition-colors hover:text-foreground"
              >
                {t.footer.privacy}
              </Link>
              {/* Withdrawing consent has to be as reachable as giving it, so the
              preferences dialog gets a permanent entry point rather than
              living only in the first-visit banner. */}
              <button
                type="button"
                onClick={openConsentSettings}
                className="inline-flex min-h-[24px] items-center py-1.5 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                {t.consent.footerLink}
              </button>
              {/* Die Geschaeftsbezeichnung gehoert sichtbar auf die Seite, nicht
              nur ins Impressum und in die strukturierten Daten. Google prueft
              das eine gegen das andere, und ein Name, den nur der Quelltext
              kennt, bestaetigt nichts. */}
              <p>
                &copy; {new Date().getFullYear()} · Hareb Digital ·{" "}
                {t.footer.copyright}
              </p>
            </div>
          </div>

          {/* Dieselben Ziele noch einmal, diesmal als lesbarer Text.
          Die runden Knöpfe darüber tragen die Adresse im href und sonst
          nichts: ihr Inhalt ist ein Symbol mit leerem alt, die Beschriftung
          steckt in aria-label. Für ein Vorleseprogramm reicht das, für
          alles, was eine Seite als Text auswertet, nicht — dort ist der
          Verweis eine Adresse ohne ein einziges Wort daneben, und
          entsprechend fällt er beim Auslesen hinten herunter. Genau das
          war der Befund: aus dem Knopf sieht ChatGPT keinen Link.

          Die Knöpfe bleiben, wie sie sind. Hier steht dieselbe Aussage ein
          zweites Mal, in Worten. `rel="me"` sagt dazu, dass es dieselbe
          Person ist — dieselbe Angabe, die auch in `sameAs` der
          strukturierten Daten steht. */}
          <p className="mx-auto mt-8 flex max-w-7xl flex-wrap items-center justify-center gap-x-2.5 gap-y-1 border-t border-white/5 pt-6 text-[13px] tracking-tight text-foreground/55">
            {SOCIALS.filter((s) => s.href.startsWith("http")).map((s, i) => (
              <span
                key={`text-${s.label}`}
                className="inline-flex items-center gap-2.5"
              >
                {i > 0 && (
                  <span
                    aria-hidden
                    className="h-1 w-1 rounded-full bg-foreground/25"
                  />
                )}
                <a
                  href={s.href}
                  target="_blank"
                  rel="me noreferrer"
                  className="inline-flex min-h-[24px] items-center underline decoration-white/20 underline-offset-4 transition-colors hover:text-foreground hover:decoration-white/50"
                >
                  {/* Der Name steht im Verweistext, nicht nur die Adresse.
                      Grund: eine Suchmaschine verbindet eine Zielseite mit
                      den Woertern, die in den Verweisen darauf stehen. Hier
                      stand vorher "GitHub: github.com/fpissaip-source" —
                      korrekt, aber ohne ein einziges Vorkommen des Namens,
                      und genau danach wird gesucht ("Issa Hareb GitHub").
                      Der Nutzername enthaelt den Namen nicht. */}
                  Issa Hareb auf {s.label}: {s.href.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              </span>
            ))}
          </p>
        </footer>
      </div>
    </>
  );
}
