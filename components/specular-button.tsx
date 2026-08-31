'use client'

import type { MouseEventHandler, ReactNode } from 'react'

/**
 * Der Knopf mit dem wandernden Glanz am Rand.
 *
 * Vorgeschichte: das war eine WebGL-Flaeche. React Bits' SpecularButton,
 * portiert, mit eigenem Renderer, eigenem Shader und einer dauerhaft
 * laufenden rAF-Schleife — fuer einen Knopf von 249 x 97 Pixeln. Gemessen
 * am 30.08. hielt die Startseite sieben WebGL-Zustaende gleichzeitig; auf
 * einem aelteren iPhone liegt die Grenze etwa dort, und dahinter wirft
 * Safari den aeltesten Kontext weg. Einer davon war dieser Knopf.
 *
 * Was er tut, kann CSS auch: ein Kegelverlauf, der sich dreht, auf den
 * Rand maskiert. Der Winkel ist eine angemeldete Eigenschaft
 * (`@property`), deshalb laesst er sich ueberhaupt animieren — ohne die
 * Anmeldung waere ein Winkel fuer den Browser eine Zeichenkette und
 * spraenge zwischen den Bildern.
 *
 * Aufgegeben wurde dabei genau eines: der Glanz folgte frueher dem Zeiger.
 * Das kostete eine Schleife pro Bild, um einen Winkel auszurechnen, den
 * niemand als Zeigerposition liest — er sah aus wie eine Drehung, und eine
 * Drehung ist es jetzt auch.
 *
 * Der Knopf selbst ist unveraendert: Rahmen, Flaeche und Beschriftung
 * stehen wie vorher in globals.css, und sie standen dort auch schon, als
 * der Shader nur oben drauf lag. Ohne Effekt bleibt ein vollstaendiger,
 * lesbarer Knopf uebrig, und genau das war die Bedingung.
 */

type SpecularButtonProps = {
  children: ReactNode
  /** Rendert ein <a> statt eines <button>, wenn gesetzt. */
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
  className?: string
  'aria-label'?: string
}

export function SpecularButton({
  children,
  href,
  onClick,
  className = '',
  ...rest
}: SpecularButtonProps) {
  const shared = {
    className: `specular-btn ${className}`.trim(),
    onClick,
    ...rest,
  }

  const inner = (
    <>
      <span className="specular-btn__fx" aria-hidden="true" />
      <span className="specular-btn__label">{children}</span>
    </>
  )

  if (href) {
    return (
      <a href={href} {...shared}>
        {inner}
      </a>
    )
  }
  return (
    <button type="button" {...shared}>
      {inner}
    </button>
  )
}
