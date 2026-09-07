# Deutsch in One Music Lab

Deutsch ist über **DE** in der Kopfzeile verfügbar. Die Auswahl bleibt lokal
unter `oml-language` gespeichert. Sie gilt für Klanglabor, Akkordlabor,
Musiktheorie, Gehörbildung und Lexikon, einschließlich der sechs Lektionen,
aller 22 Akkordbeispiele, Aufgaben, Rückmeldungen und Fehlermeldungen.
Das Lexikon findet Begriffe in allen drei Sprachen. Fremdsprachige
Begriffsentsprechungen und bibliografische Originaltitel bleiben als solche
erkennbar; Produktnamen, MIDI, Hz und Akkordsymbolzusätze sind keine unübersetzten
Bedienelemente. Die Repository-Dokumentation ist keine zusätzliche Website-Seite.

## Notation und musikalischer Geltungsbereich

- Englisch B entspricht deutsch **H**, englisch B♭ entspricht **B**. Die
  Schreibweise folgt den Stufen: C–D–Es–F–G–As–B in natürlichem c-Moll,
  mit H statt B in harmonischem c-Moll; melodisch aufwärts zusätzlich A statt As,
  abwärts wieder natürliches Moll.
- Tonarten heißen **C-Dur**, **c-Moll**, **H-Dur**, **b-Moll**, **fis-Moll**.
  Modi werden beispielsweise als „Dorisch auf C“ benannt.
- Konkrete Töne zeigen ihre klassische Oktavlage: C₂ (Subkontra), C₁ (Kontra),
  C (groß), c (klein), c′, c″, c‴, c⁗, c⁗′. Die Oktavlage folgt dem geschriebenen
  Stammton; his′ und c″ sind daher unterschiedlich geschrieben, auch wenn sie
  in gleichstufiger Stimmung dieselbe Frequenz haben. Frequenzanzeigen außerhalb
  des benannten Bereichs MIDI 12–119 nennen ausdrücklich die MIDI-Nummer.
- Kreuz- und Be-Namen verwenden unter anderem Cis, Dis, Es, As, B; doppelte
  Versetzungen unter anderem Cisis, Eses, Ases und Heses. Sie werden nicht durch
  den Namen einer enharmonisch gleichen Klaviertaste ersetzt.
- Akkordsymbole behalten ihre im Jazz und in populärer Musik gebräuchlichen
  Zusätze wie `m7`, `maj7`, `sus4`. In DE stehen auch ihre Grund- und Basstöne
  deutsch: **Hm7**, **B7**, **H/Dis**. Tonartnamen und Akkordsymbole erfüllen
  unterschiedliche Aufgaben. Die römischen Ziffern bleiben im ausdrücklich
  erklärten Modell mit Dur als Bezugsleiter; sie werden nicht als universelle
  deutsche Funktionsanalyse ausgegeben.
- „Paralleltonart“ entspricht englisch *relative key*. *Parallel minor* heißt
  gleichnamige Molltonart bzw. Mollvariante. Für *mode mixture* wird die
  Entlehnung beschrieben, statt eine nicht allgemein etablierte deutsche
  Entsprechung vorzutäuschen. *Texture* heißt für diese Begleitfiguren konkret
  „Begleitfigur“. Akkordtypen werden von ihrer harmonischen Funktion getrennt.

Das sind Konventionen der hier verwendeten europäischen Notation und des
beschriebenen tonal/jazzbezogenen Lehrmodells. Sie machen 12-TET oder
Dur-Moll-Harmonik nicht zum Maßstab aller Musikkulturen. Deutsche Klaviatur und
Gehörbildung sind in dieser Änderung lokalisiert. Die bestehenden internationalen
Tonbezeichnungen in der russischen Oberfläche sind vom Eigentümer akzeptiert
und bleiben erhalten; sie sind keine offene Lokalisierungsaufgabe. Neue russische
Theorietexte, Lehrmaterialien, Übungen und gewöhnliche Lexikonartikel verwenden
traditionelle russische Notennamen und Oktavbezeichnungen. Lexikonartikel über
internationale Systeme zeigen die jeweils erläuterte Notation. Bei neuen
russischsprachigen Laborinhalten haben traditionelle russische Tonbezeichnungen
Vorrang. Internationale Notation bleibt zulässig und ist an sich kein
Lokalisierungsfehler; siehe
[Geltungsbereich](music-notation.md#scope-of-future-localization-work).

## Geprüfte Quellen

Zugriff und Textabgleich: **6. September 2026**. Es wurden die genannten
Abschnitte selbst gelesen, nicht nur Suchtreffer oder Inhaltsverzeichnisse.
Redaktioneller Abgleich: Codex; unabhängiges musiktheoretisches und deutsches
Sprachreview durch den vom Eigentümer benannten Reviewer steht im Gate G noch
aus. Automatische Tests ersetzen dieses Review nicht.

Quelle 1 steht zusätzlich als **S34** im [Quellenregister](sources.md), weil sie
das Verhalten von `lib/notation.ts` bestimmt und in Tests geprüft wird; die
Registerzeile und dieser Abschnitt müssen übereinstimmen.

1. **Monika Beck** (Theorie), **Thomas Bauser** (Gehörbildung), *Theorie D2/D3*,
   Demoausgabe 2012, Musikverlag Wolfram Heinlein für BBMV/VBSM.
   [Verlagslehrgang beim VBSM](https://www.musikschulen-bayern.de/assets/FLP/Lernhilfen/Theoriehefte/D2-D3-Theorie-Demo2012.pdf),
   gedruckte S. 6 (Oktavlagen), 8–10 (einfache/doppelte Alterationen und
   Ausnahmen), 12–17 (Dur/Moll, Vorzeichnungen und die drei Mollformen),
   83–85 (Septakkordtypen, Symbolzusätze, Umkehrungen). Angegeben sind die
   gedruckten Seitenzahlen; die Seitenzählung des PDF-Betrachters weicht davon
   ab. Grundlage für die Noten- und Tonartschreibung; keine Notenbilder oder
   Übungen übernommen.
2. **Markus Gorski**, *Lehrklänge*, undatierte Onlinefassung, Autor und
   Instrumentalpädagoge an der städtischen Musikschule Bünde:
   [Noten lesen](https://www.lehrklaenge.de/PHP/Grundlagen/Noten_lesen.php),
   Abschnitt zu den Stammtonnamen und den ein-/zwei-/dreigestrichenen Tönen;
   [Allgemeines über Akkorde](https://www.lehrklaenge.de/PHP/Akkorde/AkkordeAllgemein.php),
   Abschnitte Dur-, Moll-, verminderter und übermäßiger Akkord;
   [Authentisch, Plagal](https://www.lehrklaenge.de/PHP/Harmonielehre1/AuthentischPlagal.php).
   Terminologieabgleich; die dortigen pauschalen emotionalen Zuschreibungen
   wurden nicht übernommen.
3. **Stefan Helke**, *Finale und der Ton H*, Klemm Music Technology,
   30. Januar 2015, Abschnitt zur deutschen Akkordbezeichnung H/B und
   Eingabebeispiel C/B/Bb/A:
   [Produktdokumentation](https://klemm-music.de/finale-und-der-ton-h/).
   Gegenprüfung der Sprachgrenze englisch B/B♭ versus deutsch H/B.
4. **Andreas Feilen, Christina Schnauß, Mark Gotham**,
   *Studie zur Harmonielehre an Hochschulen und Universitäten im
   deutschsprachigen Raum und im internationalen Vergleich*, ZGMTH 21/2
   (2024), S. 117–132, DOI 10.31751/1218, Onlinefassung aktualisiert
   27. Februar 2025.
   [Einleitung und Terminologievergleich](https://www.gmth.de/zeitschrift/artikel/1218.aspx):
   Parallel-/Varianttonart, Grenzen einer direkten Übersetzung von
   *modal mixture* und *texture*. Diese Unterschiede bestimmen die
   kontextbezogene deutsche Wortwahl.

Die Sachgrundlagen der vorhandenen Lektionen und Akkordbeispiele bleiben in
[music-notation.md](music-notation.md) und [chords-lab.md](chords-lab.md)
nachgewiesen. Die deutsche Fassung formuliert vorhandene eigene Lehrtexte neu;
sie kopiert keine fremden Absätze, Abbildungen oder Tonaufnahmen.
Originaler Programmcode: Apache-2.0; eigene Lehrtexte einschließlich deutscher
Übersetzung: CC BY 4.0. Bibliografische Verweise ändern keine Fremdlizenzen.

## Developer contract and validation

`lib/german.ts` contains the German catalog keyed by the English source text.
`translator` and `localText` accept only catalog keys, so a new UI string without
a German translation fails TypeScript instead of silently falling back to EN.
Data records expose EN/RU/DE; counted nouns use `lib/plural.ts`. The language
switch changes displayed notation, `html[lang]`, the description metadata and
already visible errors without changing the MIDI pitches or stored progression.
English remains the static prerender/hydration default; the saved preference is
read on the client. There are no invented `/de` routes or separate search-engine
language URLs.

Regression tests cover the H/B distinction, all 35 German accidental names,
all available scale/tonic combinations, classical octave boundaries, slash
chords, counter grammar, invalid MIDI inputs, language persistence, translated
lessons and glossary search, practice feedback, audio failures and mobile
navigation. The existing audio suites continue measuring real rendered sound.
Run the cross-platform commands in CONTRIBUTING.md; no locale package or new
runtime dependency is required. Repository-wide coverage debt stays measured
under P00, including the newly maintained sidebar copy.
