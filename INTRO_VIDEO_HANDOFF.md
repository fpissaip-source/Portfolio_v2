# HANDOFF: Cinematic-Intro Framesequenz fertigstellen

> Für die Claude-Code-Session mit Netzwerkfreigabe für `d8j0ntlcm91z4.cloudfront.net`.
> Branch: `claude/hallo-n6uvbr`. Nach Abschluss diese Datei löschen.

## Kontext

Das Scroll-Intro (`components/cinematic-intro.tsx`) scrubbt eine JPEG-Framesequenz
(`public/intro/frames/frame-001.jpg` …) auf einem Canvas. Der letzte Frame zeigt einen
Ultrawide-Monitor mit **Chroma-Green-Screen**; `detectGreenRect()` findet das grüne
Rechteck zur Laufzeit, projiziert die Website-Vorschau darauf und zoomt hinein.
Aktuell liegen noch die ALTEN 121 Frames im Repo (`FRAME_COUNT = 121`).

Die finale Kamerafahrt existiert als 3 fertig generierte Seedance-Clips
(je 5 s, 1920×1080, ohne Audio, stilisierter 3D-Animationsfilm-Look):

1. **Stadt → Fenster** (Aerial-Zoom auf das eine lila Fenster):
   https://d8j0ntlcm91z4.cloudfront.net/user_3ABE2VcJODYFBgNSodXXFVfhJ1r/hf_20260714_204408_5beeb070-6915-476c-a8d4-dfb365cb721c.mp4
2. **Fenster → durchs Glas → Zimmer** (endet hinter dem Charakter am Schreibtisch):
   https://d8j0ntlcm91z4.cloudfront.net/user_3ABE2VcJODYFBgNSodXXFVfhJ1r/hf_20260714_204412_6e284b2c-beda-40aa-8a42-34af17f63d96.mp4
3. **Zimmer → Monitor-Nahaufnahme** (Charakter verlässt Bild, Greenscreen füllt Frame):
   https://d8j0ntlcm91z4.cloudfront.net/user_3ABE2VcJODYFBgNSodXXFVfhJ1r/hf_20260714_204415_a1f1bb09-5375-40f5-96cf-69ccdff9c0c3.mp4

## Schritte

```bash
# 1. Clips laden
cd /tmp && mkdir -p intro && cd intro
curl -fo a.mp4 'https://d8j0ntlcm91z4.cloudfront.net/user_3ABE2VcJODYFBgNSodXXFVfhJ1r/hf_20260714_204408_5beeb070-6915-476c-a8d4-dfb365cb721c.mp4'
curl -fo b.mp4 'https://d8j0ntlcm91z4.cloudfront.net/user_3ABE2VcJODYFBgNSodXXFVfhJ1r/hf_20260714_204412_6e284b2c-beda-40aa-8a42-34af17f63d96.mp4'
curl -fo c.mp4 'https://d8j0ntlcm91z4.cloudfront.net/user_3ABE2VcJODYFBgNSodXXFVfhJ1r/hf_20260714_204415_a1f1bb09-5375-40f5-96cf-69ccdff9c0c3.mp4'

# 2. Zusammenfügen (gleicher Codec erwartet; wenn concat -c copy Artefakte
#    erzeugt oder abbricht, alle drei auf einen gemeinsamen Nenner re-encoden)
printf "file 'a.mp4'\nfile 'b.mp4'\nfile 'c.mp4'\n" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy full.mp4 || \
ffmpeg -f concat -safe 0 -i list.txt -c:v libx264 -crf 18 -pix_fmt yuv420p full.mp4

# 3. Frames extrahieren (~12 fps → ~180 Frames bei 15 s)
rm -f REPO/public/intro/frames/frame-*.jpg
ffmpeg -i full.mp4 -vf "fps=12,scale=1536:864" -q:v 4 \
  REPO/public/intro/frames/frame-%03d.jpg
ls REPO/public/intro/frames | wc -l   # tatsächliche Anzahl merken!

# 4. Poster
cp REPO/public/intro/frames/frame-001.jpg REPO/public/intro/cinematic-poster.jpg
```

5. `components/cinematic-intro.tsx`: `FRAME_COUNT` auf die **tatsächliche Frame-Anzahl**
   aus Schritt 3 setzen (der `// NOTE: bump…`-Kommentar dort markiert die Stelle).
6. Alte, nicht mehr referenzierte Assets löschen:
   `public/intro/cinematic.mp4`, `room-wide.jpg`, `monitor-zoom.jpg`,
   `city-bluehour.png`, `workspace.png`.
7. **Validieren:**
   - Letzter Frame: großes, einheitlich grünes Rechteck (Monitor). Schwellen der
     Laufzeit-Erkennung: `g > 120 && g > 1.6*r && g > 1.6*b`. Schnelltest z. B. mit
     Python/PIL: Anteil grüner Pixel im letzten Frame > 8 % der Breite.
   - `pnpm install && pnpm build` grün.
   - `pnpm dev` + Playwright (`/opt/pw-browsers/chromium`, playwright-core):
     Screenshots bei ~4 %, 8 %, 12 %, 15 % Scrollhöhe — Frames laufen durch,
     Website-Overlay sitzt am Ende exakt auf dem Monitor, Zoom landet auf dem Hero.
8. Diese Datei (`INTRO_VIDEO_HANDOFF.md`) löschen.
9. Committen (Frames als eigener Commit ok) und auf `claude/hallo-n6uvbr` pushen.

## Hintergrund-Referenzen (Higgsfield, nur falls Neu-Generierung nötig)

- Keyframes: K1 Stadt `b8723c38-…cc3`, K2' Fassade `44e6d63f-…6e0`,
  K3' Zimmer `3f1e8245-…b23`, K4' Monitor `c0bd6793-…c22`
- Modell Videos: `seedance_2_0`, start_image+end_image, 5 s, 1080p, std, silent
- Nutzer-Vorgaben: EIN lila Fenster außen; im Zimmer KEIN Fenster sichtbar;
  Greenscreen makellos; 3D-Cartoon-Look durchgängig
