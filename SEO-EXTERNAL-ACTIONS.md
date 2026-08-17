# Externe SEO-, AEO- und GEO-Maßnahmen

Ziel: Bei der Suche nach **„Issa Hareb"** steht diese Seite an erster Stelle,
und Google zeigt oben eine Zusammenfassung der Person.

Diese Punkte lassen sich **nicht** durch einen Code-Deploy erledigen. Sie
müssen in den jeweiligen Konten gemacht werden. Der Code-Teil ist fertig
(siehe „Was im Code bereits erledigt ist" ganz unten).

Aufbau übernommen aus `fpissaip-source/Taxibbessen/SEO-EXTERNAL-ACTIONS.md`.

---

## Verbindliche Identität

Diese Schreibweise muss **überall wortgleich** verwendet werden. Jede
Abweichung schwächt die Entität, statt sie zu bestätigen.

- **Name:** Issa Hareb
- **Rolle:** Full-Stack & AI Engineer
- **Website:** https://issahareb.me/
- **E-Mail:** info@hareb.org
- **Telefon:** 0152 59559708
- **International:** +49 1525 9559708
- **Eingetragener Sitz:** Europaring 90, 53757 Sankt Augustin, Deutschland
- **Wohnort / Arbeitsschwerpunkt:** Essen, Nordrhein-Westfalen
- **Bedientes Gebiet:** Essen, Ruhrgebiet, deutschsprachiger Raum, remote

Sitz und Wohnort sind bewusst getrennt und dürfen nicht vermischt werden.
Das Impressum nennt Sankt Augustin, weil das der eingetragene Sitz ist; die
strukturierten Daten nennen zusätzlich Essen als `homeLocation` und
`workLocation`. Wer in einem Verzeichnis Essen als Adresse einträgt,
erzeugt genau den Widerspruch, der bisher im Code stand.

---

## 1. Cloudflare: die KI-Sperre entfernen

**Dringend, blockiert alles Weitere.** Cloudflare schreibt derzeit einen
eigenen Block in die `robots.txt`, der ClaudeBot, GPTBot, Google-Extended,
CCBot, Bytespider, Amazonbot, Applebot-Extended und meta-externalagent mit
`Disallow: /` aussperrt.

1. Cloudflare Dashboard → `issahareb.me` → **AI Crawl Control**
2. Verwaltete `robots.txt` abschalten bzw. Crawler auf „Allow" setzen
3. Zusätzlich **Security → Bots** auf „Block AI bots" prüfen

Prüfen mit:

```
curl -s https://issahareb.me/robots.txt | grep -c "Cloudflare Managed"
```

Ergebnis `0` = erledigt.

---

## 2. Google Search Console

1. Property `https://issahareb.me/` anlegen, per DNS-TXT über Cloudflare
   bestätigen
2. Sitemap einreichen: `https://issahareb.me/sitemap.xml`
3. URL-Prüfung und **Indexierung beantragen** für:
   - `/`
   - `/affiliate`
   - `/impressum`
   - `/datenschutz`
4. Bei jeder URL kontrollieren: deklarierte Canonical, von Google gewählte
   Canonical, Indexierbarkeit, gerendertes HTML
5. Unter **Verbesserungen** prüfen, ob die FAQ als „Häufig gestellte Fragen"
   erkannt wird

---

## 3. Bing Webmaster Tools

Für ChatGPT der wichtigste Index.

1. Property verifizieren
2. Dieselbe Sitemap einreichen
3. **IndexNow aktivieren** (in Cloudflare: Caching → Crawler Hints)

---

## 4. Bestätigende Profile anlegen (`sameAs`)

**Das ist der eigentliche Hebel für die Zusammenfassung oben bei Google.**

Ein Knowledge Panel entsteht nicht durch Markup. Google vergibt es, wenn
mehrere voneinander unabhängige Quellen dieselbe Identität bestätigen.
taxibbessen.de hat sieben solcher Quellen; diese Seite hat aktuell **eine**
(GitHub). Das reicht nicht.

Anlegen bzw. vervollständigen, jeweils mit exakt der Identität von oben:

- [ ] **LinkedIn** — mit Abstand das stärkste Personensignal
- [ ] **Xing** — im deutschsprachigen Raum weiterhin anerkannt
- [ ] **GitHub** — vorhanden, aber Profil mit vollem Namen, Ort, Website und
      Beschreibung füllen
- [ ] **Instagram** (geschäftlich), falls vorhanden
- [ ] **Google-Unternehmensprofil**, falls du als Selbstständiger eines
      führst
- [ ] Ein Verzeichniseintrag für Freiberufler/IT-Dienstleister

Sobald eine URL existiert: in `app/layout.tsx` in das `sameAs`-Array
eintragen. Eine Zeile pro Profil, mehr ist es nicht.

**Wichtig:** Name, Ort, Rolle und Website müssen auf jedem Profil identisch
zur Liste oben sein. Ein Profil mit abweichenden Angaben schwächt die
Entität, statt sie zu stützen.

---

## 5. Eingehende Links

Crawler finden Seiten über Links. Eine Domain ohne einen einzigen
eingehenden Link kann sehr lange unentdeckt bleiben — das ist der
wahrscheinlichste Grund, warum ChatGPT die Seite bisher nicht findet.

- [ ] GitHub-Profil: Website-Feld auf `https://issahareb.me/`
- [ ] Jedes Repository: Website-Feld setzen
- [ ] LinkedIn/Xing: Website im Profil
- [ ] Bei Kundenprojekten, wo vereinbart, einen Entwickler-Hinweis im Footer
      oder Impressum
- [ ] taxibbessen.de: falls mit dem Kunden abgesprochen, ein Link von dort
      ist ein starkes fachliches Signal

---

## 6. Den Begriff besetzen

„Issa Hareb" ist ein Personenname mit wenig Wettbewerb. Was ihn festigt:

- Auf **jeder** Seite muss der volle Name im sichtbaren Text stehen, nicht
  nur im Titel. Die FAQ erledigt das jetzt zwölfmal auf der Startseite.
- Die Antworten sind bewusst so geschrieben, dass sie den Namen selbst
  enthalten („Issa Hareb ist …"), weil eine Antwortmaschine die Antwort
  allein herauslöst und der Kontext der Frage dabei verloren geht.
- Keine zweite Domain mit denselben Inhalten aufbauen. Zwei Auftritte
  teilen die Autorität, statt sie zu bündeln.

---

## 7. Monatliche Kontrolle

- Identitätsangaben auf allen Profilen unverändert und gleich
- Search Console: Abdeckung, Sitemap-Status, FAQ-Erkennung
- Bing: Index-Status
- `robots.txt` frei von Cloudflare-Sperren
- Suche nach „Issa Hareb" in Google, Bing, ChatGPT, Claude, Perplexity
- Keine doppelten oder veralteten Profile entstanden

---

## Abnahmekriterium

Alle öffentlich auffindbaren Profile zeigen dieselbe überprüfbare Identität:

`Issa Hareb · Full-Stack & AI Engineer · Essen / Sankt Augustin · info@hareb.org · https://issahareb.me/`

---

## Was im Code bereits erledigt ist

Diese Punkte brauchen keine weitere Arbeit:

- **Person-Entität** mit `givenName`, `familyName`, `alternateName`,
  getrenntem `address` (Sitz) und `homeLocation`/`workLocation` (Essen),
  `knowsAbout`, `makesOffer` mit `areaServed`
- **`@graph`** verknüpft Person, WebSite, ProfilePage und FAQPage über
  stabile `@id`s zu einer Beschreibung statt vier Fragmenten
- **FAQPage** mit zwölf Fragen, die den Namen tragen — nachgemessen: alle
  zwölf Fragen und Antworten stehen auch als sichtbarer Text im HTML
- **`llms.txt`** mit verbindlichen Daten und denselben zwölf Antworten
- **`robots.txt`** erlaubt alle KI-Crawler namentlich
- **Sitemap** mit allen vier Routen
- **Canonical, hreflang, `index, follow`, OpenGraph, Favicon**
- Ladezeit: ganze Seite von 36,7 MB auf 15,0 MB, mobil auf 8,0 MB
