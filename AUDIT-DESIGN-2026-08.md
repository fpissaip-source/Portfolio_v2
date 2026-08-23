# Design- und UI-Audit — Portfolio und Landingpage

Geprüft am 23.08.2026 mit vier Skills gegen den laufenden Produktionsbuild.
Alles hier ist gemessen. Wo eine Regel aus einem Skill nicht auf diese Seite
passt, steht der Grund dabei statt eines Häkchens.

## Welcher Skill was beigetragen hat

| Skill | Rolle | Ergebnis |
|---|---|---|
| `web-design-guidelines` (Vercel) | Regelwerk, Codeprüfung | 6 Befunde |
| `playwright-cli` | Messung an der laufenden Seite | 3 Befunde |
| `design-taste-frontend` (TasteSkill) | Pre-Flight gegen Design-Tells | 4 Befunde, 2 Regeln verworfen |
| `awesome-design` | Nachschlagewerk zur Einordnung | keine Befunde, s. u. |
| `image-to-code` | **nicht anwendbar** | erzeugt Seiten, prüft keine |

---

## A. Was zu beheben war — am 23.08.2026 erledigt

Alle sechs Punkte sind behoben und am laufenden Build nachgemessen. Die
Beschreibungen unten stehen unverändert, damit nachvollziehbar bleibt, was
gefunden wurde; der Stand danach steht in Abschnitt F.

### A1. Bewegung ignoriert die Systemeinstellung — der wichtigste Befund

`components/anim.tsx` treibt **jede Überschrift und jeden Absatz** der
Startseite. Es prüft `prefers-reduced-motion` nicht:

```
components/anim.tsx:25  initial={{ opacity: 0, y, filter: 'blur(10px)' }}
components/anim.tsx:43  hidden: { opacity: 0, y: '0.5em', filter: 'blur(8px)' }
```

Wer Bewegung im Betriebssystem abgeschaltet hat, bekommt sie trotzdem. An der
laufenden Seite mit `prefers-reduced-motion: reduce` gemessen: **eine
Animation lief weiter, ein sichtbares Element stand unter voller Deckkraft.**

Zwei Regeln zugleich verletzt: die Einstellung wird nicht beachtet
(Vercel-Regelwerk, TasteSkill §6.B „non-negotiable"), und `filter: blur()` ist
keine Compositor-Eigenschaft — animiert werden dürfen nur `transform` und
`opacity`.

Acht weitere Komponenten animieren ohne Prüfung: `site-nav`, `process`,
`magnetic-button`, `consent-banner`, `lukas-consent-prompt`,
`lukas-voice-widget`, `language-context`, `anim`.

**Fix:** `useReducedMotion()` in `anim.tsx`, `initial={reduce ? false : {…}}`.
Eine Stelle deckt den größten Teil der Seite ab.

### A2. Toter Code mit `transition-all`

`components/ui/button.tsx` ist **nirgends importiert** — Reste des
shadcn-Gerüsts. Es enthält `transition-all`, das ausdrücklich verbotene
Muster. Löschen statt reparieren.

### A3. Tippziele unter 24 Pixel

An der laufenden Seite gemessen:

| Seite | Element | Höhe |
|---|---|---|
| Landingpage | `info@hareb.org`, Impressum, Datenschutz, Portfolio | 23 px |
| Anfrageseite | `← Issa Hareb` | 20 px |
| Anfrageseite | `info@hareb.org` | 22 px |
| Portfolio | Datenschutzhinweise | 21 px |

WCAG 2.2 AA verlangt 24×24. Behebbar mit senkrechter Polsterung, ohne dass
sich optisch etwas ändert. Der Sprunglink mit 1×1 ist korrekt so — er wird
erst beim Fokussieren sichtbar.

### A4. Formular: zwei Kleinigkeiten

- `components/enquiry-form.tsx` — dem E-Mail-Feld fehlt `spellCheck={false}`.
  Der Browser unterkringelt sonst jede Adresse rot.
- Beim Absenden mit fehlenden Feldern erscheint nur ein Text. Der Fokus
  springt nicht auf das erste fehlerhafte Feld — wer mit der Tastatur
  arbeitet, muss suchen.

### A5. Der Bühnentext der Landingpage ist zu lang

TasteSkill §4.7: Untertext höchstens 20 Wörter. Gemessen: **33.**

Darunter steht außerdem:

```
Antwort in 24 Stunden · Fester Preis, keine Überraschungen ·
Sitz in Sankt Augustin, zuhause in Essen
```

Das verletzt gleich drei Regeln: die verbotene Kleinzeile unter den
Schaltflächen (§4.7), den Ortsangaben-Streifen (§9.F) und die Rationierung des
Mittelpunkts auf einen pro Zeile (§9.F). Die Angaben sind richtig und
wertvoll — sie gehören in den Abschnitt darunter, nicht in die Bühne.

### A6. Der Gedankenstrich ist der falsche

TasteSkill verbietet den Geviertstrich `—` kategorisch als KI-Signatur. Diese
Regel ist für englische Texte gebaut, und blind angewandt wäre sie hier
falsch: im Deutschen ist der Gedankenstrich ein reguläres Satzzeichen.

**Der Befund darunter stimmt trotzdem.** Der Duden schreibt den
**Halbgeviertstrich `–` mit Leerzeichen** vor, nicht den Geviertstrich `—`.
Die Seite benutzt durchgehend den falschen:

| Datei | Vorkommen |
|---|---|
| Landingpage | 13 |
| Anfrageseite und Formular | 9 |
| `lib/translations.ts` | 6 |
| `lib/faq.ts` | 2 |

Nicht ersetzen, sondern austauschen: `—` → `–`. Typografisch korrekt, und der
Nebeneffekt ist, dass die Seite die auffälligste KI-Signatur verliert.

---

## B. Was geprüft wurde und in Ordnung ist

An der laufenden Seite gemessen, beide Seiten:

| Prüfung | Portfolio | Landingpage |
|---|---|---|
| genau ein `h1` | ✓ | ✓ |
| Überschriftenebenen ohne Sprung | ✓ | ✓ |
| Bilder mit `alt` und Maßen | ✓ | ✓ |
| Schaltflächen und Links mit Namen | ✓ | ✓ |
| Eingaben mit Beschriftung | ✓ | ✓ |
| Konsolenfehler | 0 | 0 |
| waagerechter Überlauf | 0 | 0 |

Im Code sauber: keine `<div onClick>`, kein `user-scalable=no`, kein
`onPaste`-Blocker, `touch-action` und `tap-highlight` gesetzt, `color-scheme`
und `theme-color` in beiden Layouts, `tabular-nums` an den Zahlenkolonnen,
Sprunglink vorhanden, Datumsformate über `toLocaleDateString` mit der
aktiven Sprache.

TasteSkill-Pre-Flight bestanden: keine Scroll-Aufforderung, keine
dekorativen Statuspunkte, keine Abschnittsnummern als Label, ein einziges
Laufband, ein Farbsystem pro Seite, keine erfundenen Zahlen, keine gefälschten
Produktbilder. Die vier Zahlen im Zahlenband sind nachprüfbar wahr — genau
das, was §4.9 verlangt und was die Referenzseiten mit „5M+ Customers"
verfehlen.

---

## C. Zwei Regeln, die hier nicht gelten

**Lucide als Icon-Bibliothek.** TasteSkill rät davon ab, erlaubt sie aber
ausdrücklich, „when the project already depends on it". Zwölf Dateien nutzen
sie. Ein Wechsel wäre Arbeit ohne Gegenwert.

**Label über jedem Abschnitt.** TasteSkill §4.7 rationiert sie auf eines pro
drei Abschnitte. Die Landingpage hält das exakt ein (3 bei 7 Abschnitten).
Das Portfolio nicht — dort trägt fast jeder Abschnitt eines.

Das ist eine bewusste Entscheidung aus dieser Sitzung: die Label waren
vorher 10px in 90 % Deckkraft, und beim Scrollen gab es nichts, das den
Abschnitt benannte. Sie wurden vergrößert und mit einer Akzentlinie versehen.
TasteSkills Regel zielt auf Seiten, die Label als Dekoration benutzen; hier
tragen sie Orientierung. **Ich lasse sie stehen** und halte den Widerspruch
hier fest, statt ihn stillschweigend aufzulösen.

---

## D. Einordnung über `awesome-design`

Zum Vergleich in der Sammlung nachgesehen: das Portfolio liegt zwischen
`dramatic` und `immersive` (großes Plakat-Display, dunkle Bühne, 3D,
Scroll-Choreografie). Die Landingpage liegt bei `neon` mit Anleihen bei
`bold`. Beide sind in sich schlüssig, und die Trennung ist gewollt — Violett
und Blau für die Person, der volle Verlauf für die Firma.

Kein Befund. Die Sammlung taugt zum Einordnen und zum Aussuchen einer
Richtung für eine neue Seite, nicht zum Prüfen einer bestehenden.

---

## E. Reihenfolge

1. **A1** — Bewegung. Barrierefreiheit, eine Datei, größte Wirkung.
2. **A3** — Tippziele. Reine Polsterung, kein optischer Eingriff.
3. **A6** — Gedankenstrich. Ein Suchen-und-Ersetzen über vier Dateien.
4. **A5** — Bühnentext kürzen, Kleinzeile nach unten verschieben.
5. **A4** — `spellCheck` und Fokus auf das erste Fehlerfeld.
6. **A2** — tote Datei löschen.


---

## F. Stand nach der Behebung

Gemessen am Produktionsbuild, 23.08.2026.

| | vorher | nachher |
|---|---|---|
| Animationen bei `prefers-reduced-motion: reduce` | 1 laufend | **0** |
| Unsichtbare Elemente bei reduzierter Bewegung | 1 | **0** |
| `filter: blur()` an Textelementen | vorhanden | **0** |
| Tippziele unter 24 px | 7 | **0** |
| Geviertstriche im sichtbaren Text | 30 | **0** |
| Bühnentext Landingpage | 33 Wörter | **19** |
| `spellCheck` am E-Mail-Feld | fehlt | gesetzt |
| Fokus beim unvollständigen Absenden | keiner | erstes fehlendes Feld |
| toter `components/ui/button.tsx` | vorhanden | gelöscht |

Bei normaler Bewegung läuft alles unverändert: Überschriften erscheinen mit
voller Deckkraft, neun Routen mit je einem `h1`, korrektem `lang`, ohne
waagerechten Überlauf und ohne Konsolenfehler.

### Zwei Dinge, die beim Beheben erst sichtbar wurden

**Ein Absatz war unsichtbar, nicht nur animiert.** Der Untertitel „Logical
Universal Knowledge Agent System" stand bei abgeschalteter Bewegung dauerhaft
auf Deckkraft 0: die Zeitleiste hatte ihren Anfangszustand gesetzt, der
auslösende Bildlauf kam aber nie. Inhalt, den niemand sieht, wiegt schwerer
als eine ungewollte Animation.

**Ein `gsap.set` davor reicht nicht.** `fromTo` setzt seinen Anfangszustand
sofort beim Anlegen der Zeitleiste und macht jedes vorangehende `set`
wirkungslos. Der Tween muss bei reduzierter Bewegung ganz entfallen.
