import { Abschnitt, Knopf, Ueberschrift } from '@/components/hd2-bausteine'
import { socialBeleg } from '@/lib/hd2-site'

/*
 * Der Social-Media-Beleg auf der Startseite.
 *
 * Drei Entscheidungen, die man dem Abschnitt ansehen soll:
 *
 * 1. Die Zahlen stehen als Text neben dem Bildschirmfoto, nicht nur darin.
 *    Ein Bild ist fuer Google, fuer einen Screenreader und fuer jede
 *    Antwortmaschine eine leere Flaeche. "5.045 Follower in einem Monat" ist
 *    das Argument des Abschnitts, und ein Argument, das nur als JPEG
 *    vorliegt, wird nirgends zitiert.
 *
 * 2. Die Bildschirmfotos haben weissen Grund, die Seite hat schwarzen. Sie
 *    liegen deshalb in einem hellen Rahmen mit weichem Rand, statt frei auf
 *    der Flaeche zu leuchten. Das ist auch inhaltlich richtig: sie sind ein
 *    Zitat aus einer fremden Anwendung und sollen als solches erkennbar sein.
 *
 * 3. Kein JavaScript, keine Animation. Der Abschnitt behauptet, dass die
 *    ersten Sekunden ueber Aufmerksamkeit entscheiden. Er sollte nicht selbst
 *    eine Sekunde brauchen, bis er da ist.
 */

function SocialBild({
  name,
  alt,
  breite,
  hoehe,
  className = '',
}: {
  name: string
  alt: string
  breite: number
  hoehe: number
  className?: string
}) {
  return (
    <picture>
      <source srcSet={`/social/${name}.avif`} type="image/avif" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/social/${name}.webp`}
        alt={alt}
        width={breite}
        height={hoehe}
        loading="lazy"
        decoding="async"
        className={`w-full rounded-xl bg-white ${className}`}
      />
    </picture>
  )
}

export function SocialBelegAbschnitt() {
  const s = socialBeleg

  return (
    <Abschnitt id="social">
      <Ueberschrift eyebrow={s.eyebrow}>{s.titel}</Ueberschrift>
      <p className="mt-4 max-w-2xl leading-relaxed text-nebel">{s.text}</p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {s.konten.map((k) => (
          <article key={k.handle} className="rounded-2xl border border-white/10 bg-kohle/60 p-5 sm:p-6">
            <div className="rounded-xl border border-white/10 p-1.5">
              <SocialBild name={k.bild} alt={k.alt} breite={1125} hoehe={542} />
            </div>

            <h3 className="mt-5 text-xl font-semibold">
              {k.name} <span className="font-normal text-nebel">{k.handle}</span>
            </h3>
            <p className="mt-1 text-sm text-leuchten">{k.art}</p>

            {/* Die Zahlen als Definitionsliste: Wert und Bedeutung gehoeren
                zusammen, und die Auszeichnung sagt das auch. */}
            <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4">
              {k.zahlen.map((z) => (
                /* `flex-col-reverse`: die Zahl steht oben, das Wort darunter,
                   im Dokument aber zuerst der Begriff und dann sein Wert.
                   Sonst muesste die Beschriftung zweimal dastehen, einmal
                   sichtbar und einmal versteckt, und ein Screenreader
                   laese sie doppelt. */
                <div key={z.label} className="flex flex-col-reverse">
                  <dt className="mt-1 text-xs leading-snug text-nebel">{z.label}</dt>
                  <dd className="text-2xl font-semibold tracking-tight">{z.wert}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <div className="mt-10 grid items-start gap-8 md:grid-cols-[minmax(0,300px)_1fr] md:gap-12">
        {/* Auf dem Telefon gedeckelt: das Raster ist der Beleg, nicht der
            Abschnitt. Ueber die volle Breite waere es das Erste und Groesste,
            was jemand hier sieht, und das ist nicht, was verkauft wird. */}
        <div className="mx-auto w-full max-w-[260px] rounded-2xl border border-white/10 bg-kohle/60 p-2 md:mx-0 md:max-w-none">
          <SocialBild name={s.raster.bild} alt={s.raster.alt} breite={900} hoehe={1444} />
        </div>
        <div>
          <h3 className="text-xl font-semibold">{s.raster.titel}</h3>
          <p className="mt-3 max-w-xl leading-relaxed text-nebel">{s.raster.text}</p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-kohle/60 p-6">
            <h3 className="text-lg font-semibold">{s.hinweis.titel}</h3>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-nebel">{s.hinweis.text}</p>
            <div className="mt-6">
              <Knopf href={s.hinweis.cta.href} variante="leer">
                {s.hinweis.cta.label}
              </Knopf>
            </div>
          </div>
        </div>
      </div>
    </Abschnitt>
  )
}
