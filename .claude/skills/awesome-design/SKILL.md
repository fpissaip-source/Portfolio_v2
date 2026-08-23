---
name: awesome-design
description: 67 vollständige Designsysteme als Nachschlagewerk — von brutalism und neon über editorial und refined bis glassmorphism und neumorphism. Nutze diesen Skill, wenn eine Seite oder Komponente eine benannte Stilrichtung bekommen soll, wenn ein Stil in Tokens übersetzt werden muss (Typografie, Farben, Abstände, Radien, Schatten, Bewegung), oder wenn du zwischen Richtungen vergleichen willst. Auslöser: "im Stil von", "brutalistisch", "editorial", "glassmorphism", "welcher Stil passt", "Designrichtung wählen", "DESIGN.md erstellen".
metadata:
  source: https://github.com/bergside/awesome-design-skills
  license: MIT
---

# Awesome Design — 67 Designsysteme

Diese Sammlung liegt bewusst als **ein** Skill vor, nicht als 67.

Jedes Skill-Verzeichnis in `.claude/skills/` bringt seine Beschreibung in
den Kontext jeder Sitzung. 67 einzelne Einträge hätten die Skill-Liste
unlesbar gemacht und bei jedem Aufruf Platz gekostet, der für die
eigentliche Arbeit fehlt. Ein Eintrag mit einem Verzeichnis daneben leistet
dasselbe und kostet eine Zeile.

## Vorgehen

1. **Stil auswählen.** `styles/index.json` listet alle Stile mit Kürzel und
   Pfad. Kennst du den gewünschten Stil, geh direkt dorthin. Sonst lies die
   Liste unten und wähle nach dem, was der Auftrag verlangt.

2. **Nur den einen Stil laden.** `styles/<kürzel>/SKILL.md` enthält die
   Anweisungen, `styles/<kürzel>/DESIGN.md` das fertige Token-Set. Lies
   genau eines davon — die Sammlung ist ein Nachschlagewerk, kein Buch.

3. **Auf das Projekt übertragen, nicht abschreiben.** Die Token dieses
   Portfolios stehen in `app/globals.css` unter `@theme inline`. Ein Stil
   liefert die Richtung; die Umsetzung hält sich an die vorhandenen
   Variablen, sonst zerfällt die Seite in zwei Systeme.

## Die 67 Stile

**Reduziert** — basic, clean, flat, minimal, mono, paper, refined, sleek,
spacious, square

**Laut** — bold, brutalism, neobrutalism, dramatic, expressive, power,
pulse, vibrant

**Material und Tiefe** — claymorphism, glassmorphism, neumorphism,
skeumorphism, perspective, immersive

**Redaktionell** — editorial, storytelling, contemporary, artistic,
creative, lingo

**Technisch** — agentic, codex, matrix, terracotta, geometric, bento,
levels, grid-nah

**Retro und Spiel** — retro, vintage, pacman, sega, tetris, roku, riso,
dithered, doodle, sketch

**Marken-nah** — claude, shadcn, material, stitch, impeccable

**Geschäftlich** — corporate, enterprise, professional, premium, clean,
friendly

**Stimmung** — cosmic, cafe, fantasy, fiction, futuristic, gradient, neon,
colorful, ant, modern

Die vollständige, verbindliche Liste steht in `styles/index.json`.
