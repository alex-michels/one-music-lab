// Original German translations. Terminology and scope: docs/german-localization.md.
// English source keys make every addition require a German translation at typecheck.
// Only strings that `translator`, `localText` or `german[…]` look up belong
// here. The German of lesson text, experiment instructions and glossary entries
// is the `de` field of their records in lib/content, and a text written as
// `nt(en, ru, de)` carries its own. Neither reads this file, so a copy kept
// here is shown nowhere and goes stale unnoticed.
export const german = {
  'An octave shift keeps the note name. Count the registers in the requested direction.':
    'Bei einer Oktavversetzung bleibt der Tonname erhalten. Zähle die Oktavlagen in der angegebenen Richtung.',
  'That is the value with no dots. The first dot adds half the original value.':
    'Das ist der Wert ohne Punkte. Der erste Punkt fügt die Hälfte des ursprünglichen Wertes hinzu.',
  'That includes the first dot only. The second dot adds half of what the first dot added.':
    'Dabei ist nur der erste Punkt berücksichtigt. Der zweite Punkt fügt die Hälfte dessen hinzu, was der erste Punkt hinzugefügt hat.',
  'Use the stated ratio: in a 3:2 group, three written eighths fill the time of two ordinary eighths.':
    'Beachte das angegebene Verhältnis: In einer 3:2-Gruppe stehen drei notierte Achtel für die Dauer von zwei regulären Achteln.',
  'One after another': 'Nacheinander',
  'Four steady beats': 'Vier gleichmäßige Zählzeiten',
  'One whole note': 'Eine ganze Note',
  'Two half notes': 'Zwei halbe Noten',
  'Four quarter notes': 'Vier Viertelnoten',
  'Two separate quarter notes': 'Zwei getrennte Viertelnoten',
  'Two quarter notes tied': 'Zwei Viertelnoten mit Haltebogen',
  'Two eighths per beat': 'Zwei Achtel je Zählzeit',
  'Three triplet eighths per beat': 'Drei Triolenachtel je Zählzeit',
  'Full-length tones': 'Töne in voller Dauer',
  'Short detached tones': 'Kurze abgesetzte Töne',
  'Four-note figure': 'Figur aus vier Tönen',
  'Repeat the figure': 'Die Figur wiederholen',
  'Repeat with a changed ending': 'Mit geändertem Schluss wiederholen',
  'Successive and simultaneous notes': 'Töne nacheinander und gleichzeitig',
  'Note values': 'Notenwerte',
  Ties: 'Haltebögen',
  'Beat division': 'Unterteilung der Zählzeit',
  Articulation: 'Artikulation',
  Repeats: 'Wiederholungen',
  'Stop sound': 'Klang stoppen',
  'Stop example': 'Beispiel stoppen',
  'Compare short examples': 'Kurze Beispiele vergleichen',
  'Experiment topic': 'Thema des Experiments',
  'Quarter notes per minute': 'Viertelnoten pro Minute',
  'Each button plays a finite example. Compare the attacks and gaps at the same tempo; the oscillator illustrates timing, not an instrument-specific articulation rule.':
    'Jede Schaltfläche spielt ein begrenztes Beispiel. Vergleiche die Toneinsätze und Pausen bei gleichem Tempo; der Tongenerator veranschaulicht Zeitverhältnisse, keine instrumentenspezifische Artikulationsregel.',
  Navigation: 'Navigation',
  'Navigate between the music laboratories and learning pages.':
    'Zwischen den Musiklaboren und Lernseiten wechseln.',
  'Explore sound, tuning and music theory in English, Russian and German. Tone generator, chord progressions, lessons and ear training.':
    'Entdecke Klang, Stimmung und Musiktheorie auf Deutsch, Englisch und Russisch. Mit Tongenerator, Akkordfolgen, Lektionen und Gehörbildung.',
  'Navigation width. Drag, or use the left and right arrow keys.':
    'Breite der Navigation. Ziehen oder die linke und rechte Pfeiltaste verwenden.',
  'Sound lab': 'Klanglabor',
  'Chords lab': 'Akkordlabor',
  'Music theory': 'Musiktheorie',
  // Not 'Gehörbildung': ear training moved to the lab and everything left in
  // this page is read off the page rather than heard (docs/notation-chapter.md).
  Practice: 'Übungen',
  Encyclopedia: 'Lexikon',
  'YOUR MUSIC WORKSPACE': 'DEIN RAUM FÜR MUSIK',
  'An open world of music': 'Eine offene Welt der Musik',
  Sine: 'Sinus',
  Triangle: 'Dreieck',
  Square: 'Rechteck',
  Sawtooth: 'Sägezahn',
  'Audio could not start. Check your browser audio settings and try again.':
    'Die Wiedergabe konnte nicht starten. Prüfe die Audioeinstellungen deines Browsers und versuche es erneut.',
  'Audio could not start. Please try again.':
    'Die Wiedergabe konnte nicht starten. Bitte versuche es erneut.',
  'The audio file could not be created. Please try again.':
    'Die Audiodatei konnte nicht erstellt werden. Bitte versuche es erneut.',
  'Audio is unavailable in this browser.':
    'Audiowiedergabe ist in diesem Browser nicht verfügbar.',
  '12-tone equal temperament': 'Zwölfstufige gleichstufige Stimmung',
  'Just intonation · A': 'Reine Stimmung · A',
  'Pythagorean · A': 'Pythagoreische Stimmung · A',
  'Open navigation': 'Navigation öffnen',
  'Sound, at your fingertips.': 'Klang in deinen Händen.',
  'Chords, connected.': 'Akkorde verbinden.',
  'The ideas behind the music.': 'Die Ideen hinter der Musik.',
  'The language of music.': 'Die Sprache der Musik.',
  'Tone generator': 'Tongenerator',
  'FROM FREQUENCY TO FEELING': 'VON DER FREQUENZ ZUM HÖREINDRUCK',
  Playing: 'Wiedergabe läuft',
  'Ready to play': 'Bereit zum Abspielen',
  FREQUENCY: 'FREQUENZ',
  'Frequency in hertz': 'Frequenz in Hertz',
  cents: 'Cent',
  Frequency: 'Frequenz',
  'One octave down': 'Eine Oktave tiefer',
  'One octave up': 'Eine Oktave höher',
  'Stop tone': 'Ton stoppen',
  'Play tone': 'Ton abspielen',
  'Reset frequency to A4': 'Frequenz auf a′ zurücksetzen',
  Waveform: 'Wellenform',
  OSCILLOSCOPE: 'OSZILLOSKOP',
  'LIVE SIGNAL': 'AKTUELLES SIGNAL',
  'WAVEFORM PREVIEW': 'VORSCHAU DER WELLENFORM',
  'Audio waveform visualization': 'Darstellung der Schallwellenform',
  Volume: 'Lautstärke',
  'Your tuning': 'Deine Stimmung',
  'Reference pitch': 'Kammerton',
  'A4 reference frequency': 'Frequenz des Kammertons a′',
  'Change A4. Every note follows.': 'Ändere a′. Alle Töne folgen.',
  'Tuning system': 'Stimmungssystem',
  'A4 sets the reference. The tuning system sets the relationships between notes.':
    'a′ legt die Bezugsfrequenz fest. Das Stimmungssystem bestimmt die Verhältnisse zwischen den Tönen.',
  'THE NOTE YOU’RE EXPLORING': 'DER TON, DEN DU ERKUNDEST',
  Period: 'Periodendauer',
  'MIDI note': 'MIDI-Notennummer',
  'How does pitch work?': 'Wie entsteht Tonhöhe?',
  'Explore the notes': 'Die Töne entdecken',
  'Lower keyboard octave': 'Klaviatur eine Oktave tiefer',
  Octave: 'Oktave',
  'Raise keyboard octave': 'Klaviatur eine Oktave höher',
  'All notes follow your tuning': 'Alle Töne folgen deiner Stimmung',
  'Click a key to hear it': 'Klicke auf eine Taste, um sie zu hören',
  'Open Chords lab · build a progression':
    'Akkordlabor öffnen · eine Akkordfolge gestalten',
  'Preparing…': 'Wird vorbereitet …',
  'Download tone · WAV, 5 sec': 'Ton herunterladen · WAV, 5 s',
  'Space to play · Esc to silence · A–K to explore notes':
    'Leertaste zum Abspielen · Esc zum Stoppen · A–K für die Klaviatur',
  'Start quietly. Keep listening comfortable.':
    'Beginne leise. Höre in angenehmer Lautstärke.',
  'Further reading': 'Weiterführende Lektüre',
  'MAKE IT AUDIBLE': 'MACH ES HÖRBAR',
  'Try it in the lab': 'Im Labor ausprobieren',
  'Open this experiment': 'Dieses Experiment öffnen',
  'Musical traditions deserve their own context, terminology and sources. A raga or maqam is not simply a scale preset.':
    'Musikalische Traditionen brauchen ihren eigenen Kontext, ihre Begriffe und Quellen. Ein Raga oder Maqam ist mehr als eine vorgegebene Tonleiter.',
  'Search musical terms': 'Musikalische Begriffe suchen',
  'Explore the idea': 'Den Begriff erkunden',
  'Minor third': 'Kleine Terz',
  'Major third': 'Große Terz',
  'Perfect fifth': 'Reine Quinte',
  'EAR TRAINING · INTERVALS': 'GEHÖRBILDUNG · INTERVALLE',
  'Listen to the space between.': 'Höre den Abstand zwischen den Tönen.',
  'Two notes, played one after the other. Which interval do you hear?':
    'Zwei Töne erklingen nacheinander. Welches Intervall hörst du?',
  'Start listening': 'Übung starten',
  'Listen again': 'Noch einmal hören',
  'That’s right.': 'Richtig.',
  'Keep listening.': 'Höre noch einmal hin.',
  'Next interval': 'Nächstes Intervall',
  'Sing the first note, then the second. Notice the distance, not just whether it sounds familiar.':
    'Singe erst den ersten, dann den zweiten Ton. Achte auf den Abstand und nicht nur darauf, ob der Klang vertraut wirkt.',
  'A little experiment': 'Ein kleines Experiment',
  'Listen to relationships': 'Tonverhältnisse hören',
  Intervals: 'Intervalle',
  'Scales & modes': 'Tonleitern & Modi',
  Chords: 'Akkorde',
  'Root note': 'Grundton',
  Explore: 'Erkunden',
  'In sequence': 'Nacheinander',
  Together: 'Zusammen',
  'Some notes are outside 20–20,000 Hz. Adjust the A4 reference to hear the complete experiment.':
    'Einige Töne liegen außerhalb von 20–20.000 Hz. Passe die Frequenz für a′ an, um das vollständige Experiment zu hören.',
  'Note spelling follows the selected tonic and scale or interval degrees. Semitone offsets identify keyboard steps; their sizes depend on your tuning.':
    'Die Tonnamen folgen dem gewählten Grundton und den Tonleiter- oder Intervallstufen. Halbtonabstände bezeichnen hier Klaviaturschritte; ihre Größe hängt von der Stimmung ab.',
  'Classical melodic minor raises degrees 6 and 7 going up; going down it uses natural minor. Blues here is a fixed-key model: the minor pentatonic with an added lowered fifth.':
    'In der klassischen melodischen Molltonleiter werden aufwärts die 6. und 7. Stufe erhöht; abwärts entspricht sie der natürlichen Molltonleiter. Das Bluesmodell verwendet feste Tonhöhen: die Moll-Pentatonik mit einer zusätzlichen erniedrigten Quinte.',
  'Minor scales: §3.1': 'Molltonleitern: §3.1',
  'Progression editor': 'Akkordfolgen bearbeiten',
  'MAKE A LITTLE MUSIC': 'GESTALTE EIN STÜCK MUSIK',
  'Your progression': 'Deine Akkordfolge',
  'Starting point': 'Ausgangspunkt',
  'Tonic · transpose': 'Grundton der Tonart · transponieren',
  'Palette scale': 'Tonleiter der Akkordauswahl',
  Major: 'Dur',
  'Natural minor': 'Natürliches Moll',
  'Chords match the scale': 'Akkorde sind leitereigen',
  'Fit chords to the scale': 'Akkorde an die Tonleiter anpassen',
  'The scale changed, but this progression sounds exactly as it did: it is built on degrees the two scales share.':
    'Die Tonleiter wurde geändert, aber die Akkordfolge klingt unverändert: Sie beruht auf Stufen, die beide Tonleitern gemeinsam haben.',
  'The palette has changed, and “Fit chords to the scale” will make these chords belong to it.':
    'Die Akkordauswahl wurde geändert. Mit „Akkorde an die Tonleiter anpassen“ werden auch diese Akkorde leitereigen.',
  'Progression chords': 'Akkorde der Folge',
  Chord: 'Akkord',
  up: 'höher',
  down: 'tiefer',
  'Acts as the dominant of the next chord':
    'Wirkt als Dominante des nächsten Akkords',
  Selected: 'Ausgewählt',
  ' · edited': ' · bearbeitet',
  Undo: 'Rückgängig',
  Redo: 'Wiederholen',
  'Move chord left': 'Akkord nach links verschieben',
  'Move chord right': 'Akkord nach rechts verschieben',
  'Duplicate chord': 'Akkord duplizieren',
  'Remove chord': 'Akkord entfernen',
  'The example replaced the progression you had edited. Undo brings it back.':
    'Das Beispiel hat deine bearbeitete Akkordfolge ersetzt. „Rückgängig“ stellt sie wieder her.',
  'Cancel start': 'Start abbrechen',
  Stop: 'Stopp',
  'Play progression': 'Akkordfolge abspielen',
  Tempo: 'Tempo',
  'Play through': 'Durchläufe',
  Ready: 'Bereit',
  sec: 's',
  'Keep a phrase within 3 minutes: reduce repeats or beats, or increase tempo.':
    'Eine Phrase darf höchstens 3 Minuten dauern: Verringere die Durchläufe oder Zählzeiten oder erhöhe das Tempo.',
  'Audio could not start. Check browser audio settings and try Play again.':
    'Die Wiedergabe konnte nicht starten. Prüfe die Audioeinstellungen des Browsers und drücke erneut auf Abspielen.',
  'Sound & accompaniment': 'Klang & Begleitung',
  Texture: 'Begleitfigur',
  'Held chords': 'Gehaltene Akkorde',
  'Quarter-note pulse': 'Akkorde in Vierteln',
  'Eighth-note chords': 'Akkorde in Achteln',
  'Arpeggio, rising': 'Arpeggio aufwärts',
  'Arpeggio, falling': 'Arpeggio abwärts',
  'Alberti bass · low, high, middle, high':
    'Alberti-Bass · tief, hoch, mittel, hoch',
  'Bass, then afterbeat chords': 'Bass, dann nachschlagende Akkorde',
  'Offbeat chords only': 'Akkorde auf den Achtel-Offbeats',
  Timbre: 'Klangfarbe',
  'Soft triangle': 'Weicher Dreieckklang',
  'Pure sine': 'Reiner Sinuston',
  'Chord inspector': 'Akkord untersuchen',
  'INSIDE THE CHORD': 'IM INNEREN DES AKKORDS',
  Listen: 'Anhören',
  'Move this chord down an octave':
    'Diesen Akkord eine Oktave tiefer versetzen',
  'Move this chord up an octave': 'Diesen Akkord eine Oktave höher versetzen',
  'Root degree': 'Stufe des Akkordgrundtons',
  'Chord type': 'Akkordtyp',
  'Bass / inversion': 'Basston / Umkehrung',
  ' · root position': ' · Grundstellung',
  ' · in the bass': ' · im Bass',
  Duration: 'Dauer',
  Construction: 'Aufbau',
  'Sounding notes, low to high': 'Klingende Töne von tief nach hoch',
  bass: 'Bass',
  'Keyboard, sounding notes': 'Klaviatur, klingende Töne',
  Root: 'Grundton',
  Bass: 'Basston',
  'An inversion changes the lowest note, not the root.':
    'Eine Umkehrung verändert den tiefsten Ton, nicht den Grundton.',
  'The octave buttons move this chord alone. A chord in a high bass position already sits well above its root position, so it can usually be lowered further than it can be raised: the top stop is where the chord would leave the keyboard, the bottom one is as low as this lab goes.':
    'Die Oktavtasten versetzen nur diesen Akkord. In einer hohen Umkehrung liegt er bereits deutlich über seiner Grundstellung und lässt sich daher meist weiter nach unten als nach oben versetzen. Die obere Grenze hält alle Töne auf der Klaviatur; die untere entspricht dem tiefsten Bereich dieses Labors.',
  'Shared pitches with the previous chord':
    'Gemeinsame Töne mit dem vorherigen Akkord',
  none: 'keine',
  'Compare their registers as well as their names: a card moved out of the default register is marked in the timeline.':
    'Vergleiche auch die Oktavlagen: Ein Akkord außerhalb seiner ursprünglichen Lage ist in der Folge gekennzeichnet.',
  'Chord palette': 'Akkordauswahl',
  'WHERE NEXT?': 'WIE GEHT ES WEITER?',
  'Chords in your key': 'Akkorde deiner Tonart',
  'Palette chord size': 'Anzahl der Akkordtöne in der Auswahl',
  Triads: 'Dreiklänge',
  Sevenths: 'Septakkorde',
  Add: 'Hinzufügen',
  '16 chords maximum. Remove one to add another.':
    'Höchstens 16 Akkorde. Entferne einen, um einen weiteren hinzuzufügen.',
  'A chord is added at the end; the copy button puts a duplicate next to the selected card. Then change its type or bass in the inspector. The palette follows the scale; your edited chords can go beyond it.':
    'Neue Akkorde werden am Ende angefügt; die Kopiertaste setzt ein Duplikat neben den ausgewählten Akkord. Ändere danach seinen Typ oder Basston. Die Auswahl folgt der Tonleiter; bearbeitete Akkorde dürfen darüber hinausgehen.',
  'For a leading tone in minor, try major V or V7 in the inspector.':
    'Für einen Leitton in Moll probiere auf der V. Stufe den Durdreiklang oder den Durseptakkord mit kleiner Septime (V7) aus.',
  'Listen & explore': 'Hören & entdecken',
  'Try a challenge': 'Eine Aufgabe ausprobieren',
  'Terms & sources': 'Begriffe & Quellen',
  ' · starting example': ' · Ausgangsbeispiel',
  'Change one thing at a time: chord type, bass, order, then tempo. Listen before deciding which version you prefer. Every change can be undone, including loading another example.':
    'Ändere jeweils nur eine Sache: Akkordtyp, Basston, Reihenfolge, dann Tempo. Höre beide Fassungen, bevor du dich entscheidest. Jede Änderung lässt sich rückgängig machen, auch das Laden eines anderen Beispiels.',
  'Which pitch is the root?': 'Welcher Ton ist der Grundton?',
  'Inspect the selected chord. Its lowest sounding note may be a different chord member. Choose the root, then try an inversion and answer again.':
    'Untersuche den ausgewählten Akkord. Sein tiefster klingender Ton kann ein anderer Akkordton sein. Wähle den Grundton, probiere dann eine Umkehrung und antworte erneut.',
  'Yes. The root stays': 'Ja. Der Grundton bleibt',
  'That is a chord member, but the root is':
    'Das ist ein Akkordton, aber der Grundton ist',
  'Use the construction formula; changing the bass does not change the root.':
    'Nutze die Aufbauformel: Ein anderer Basston verändert den Grundton nicht.',
  'Root ≠ bass': 'Grundton ≠ Basston',
  'The root identifies the chord. The bass is its lowest sounding pitch. A slash symbol, such as C/E, gives the bass after the slash.':
    'Der Grundton bestimmt die Identität des Akkords. Der Basston ist sein tiefster klingender Ton. Ein Schrägstrichsymbol wie C/E nennt den Basston nach dem Schrägstrich.',
  'Degrees & symbols': 'Stufen & Symbole',
  'Roman numerals here use the major scale as reference: minor-key III, VI and VII roots are written ♭III, ♭VI and ♭VII. Letter symbols follow international lead-sheet practice. The formula describes intervals from the chord root, not from the key tonic.':
    'Die römischen Stufenziffern beziehen sich hier auf die Durtonleiter: Die Grundtöne der III., VI. und VII. Stufe in Moll heißen daher ♭III, ♭VI und ♭VII. Akkordsymbole verwenden die gebräuchlichen Zusätze wie m7 und maj7, in der deutschen Fassung mit H und B. Die Formel beschreibt Intervalle vom Akkordgrundton aus, nicht vom Grundton der Tonart.',
  'V/x · applied dominants': 'V/x · Zwischendominanten',
  'A card shows V/x only when its chord is major where the scale is not, and the next chord’s root lies a fifth below. Both conditions are needed, because an applied dominant is defined by its resolution. Chords the lab cannot prove are left with their degree numeral alone.':
    'V/x erscheint nur, wenn ein Akkord anstelle des leitereigenen Moll- oder verminderten Dreiklangs einen Durklang bildet und der nächste Akkordgrundton eine Quinte tiefer liegt. Beide Bedingungen müssen erfüllt sein: Die Deutung als Zwischendominante hängt von der Fortschreitung ab. Andernfalls zeigt das Labor nur die Stufenziffer.',
  'A model to experiment with': 'Ein Modell zum Experimentieren',
  'This lab uses 12-tone equal temperament, A4 = 440 Hz, and straight 4/4. The examples are harmonic starting points drawn from the readings below. They do not model every tradition, phrasing, or rule of voice leading, and a chord pattern alone does not establish a style or certify a cadence.':
    'Dieses Labor verwendet die zwölfstufige gleichstufige Stimmung, a′ = 440 Hz und einen 4/4-Takt ohne Swing. Die Beispiele sind harmonische Ausgangspunkte auf Grundlage der unten genannten Quellen. Sie bilden nicht jede Tradition, Phrasierung oder Stimmführungsregel ab. Eine Akkordfolge allein bestimmt weder einen Stil noch eine Schlusswirkung.',
  Inversions: 'Umkehrungen',
  Ninths: 'Nonenakkorde',
  'Start quietly · Esc to stop · Editing stops playback · Every change can be undone · Sound stays in your browser':
    'Leise beginnen · Esc zum Stoppen · Bearbeiten stoppt die Wiedergabe · Jede Änderung lässt sich rückgängig machen · Der Klang entsteht in deinem Browser',
  'Minor second': 'Kleine Sekunde',
  'Major second': 'Große Sekunde',
  'Perfect fourth': 'Reine Quarte',
  'Tritone (augmented fourth)': 'Tritonus (übermäßige Quarte)',
  'Major triad': 'Durdreiklang',
  'Minor triad': 'Molldreiklang',
  'Dominant seventh': 'Dominantseptakkord',
  'Major seventh': 'Durseptakkord mit großer Septime',
  'Minor seventh': 'Mollseptakkord mit kleiner Septime',
  'Diminished triad': 'Verminderter Dreiklang',
  'Augmented triad': 'Übermäßiger Dreiklang',
  'Suspended second': 'Sekunde statt Terz (sus2)',
  'Suspended fourth': 'Quarte statt Terz (sus4)',
  'Dominant seventh type': 'Durseptakkord mit kleiner Septime',
  'Half-diminished seventh': 'Halbverminderter Septakkord',
  'Diminished seventh': 'Verminderter Septakkord',
  'Minor major seventh': 'Mollseptakkord mit großer Septime',
  'Major add ninth': 'Durdreiklang mit hinzugefügter None',
  'Dominant ninth type': 'Durakkord mit kleiner Septime und großer None',
  'Major ninth': 'Durakkord mit großer Septime und großer None',
  'Minor ninth': 'Mollakkord mit kleiner Septime und großer None',
  'Start here': 'Hier beginnen',
  Cadences: 'Schlusswendungen',
  'Classical schemas': 'Klassische Satzmodelle',
  'Pop and rock loops': 'Pop- und Rockschleifen',
  'Jazz progressions': 'Jazzprogressionen',
  'Blues forms': 'Bluesformen',
  'Colour and chromatics': 'Farben & Chromatik',
  'One chord · build your own': 'Ein Akkord · selbst gestalten',
  'An empty page: one tonic chord. Add from the palette, then change each chord’s type, bass and length. Nothing here is fixed, and every edit can be undone.':
    'Ein unbeschriebenes Blatt mit einem Tonikaakkord. Ergänze Akkorde aus der Auswahl und ändere jeweils Typ, Basston und Dauer. Nichts ist festgeschrieben; jede Änderung lässt sich rückgängig machen.',
  'Authentic cadence · a return home':
    'Authentischer Ganzschluss · zurück zur Tonika',
  'Tonic, preparation, dominant, return. Hutchinson defines an authentic cadence as a phrase ending V–I. Compare it with the other three endings in this group; a cadence also depends on rhythm, melody and phrase position, so a chord pair alone does not settle it.':
    'Tonika, Vorbereitung, Dominante, Rückkehr. Hutchinson bezeichnet V–I am Ende einer Phrase als authentischen Schluss. Vergleiche die vier Schlusswendungen dieser Gruppe. Eine Schlusswirkung hängt auch von Rhythmus, Melodie und Position in der Phrase ab; zwei Akkorde allein entscheiden sie nicht.',
  'Half cadence · stopping on V': 'Halbschluss · auf V enden',
  'Deceptive cadence · V7 goes elsewhere':
    'Trugschluss · V7 nimmt einen anderen Weg',
  'The same first three chords as the authentic cadence, with vi in place of I. Hutchinson notes that the term covers V resolving to anything other than I, of which V–vi is only the commonest case. Change the last chord back to I and compare.':
    'Die ersten drei Akkorde entsprechen dem authentischen Schluss, doch vi ersetzt I. Hutchinson fasst unter dem Begriff Fortschreitungen von V zu anderen Akkorden als I zusammen; V–vi ist der häufigste Fall. Ändere den letzten Akkord zurück zu I und vergleiche.',
  'Plagal ending · IV–I after the close':
    'Plagaler Anhang · IV–I nach dem Schluss',
  'An authentic close followed by the IV–I gesture often added after it. Hutchinson’s harmonic-function chapter treats a IV that moves to I as a prolongation of the tonic rather than a preparation for the dominant, which is why this feels like an afterword and not a new departure.':
    'Auf einen authentischen Schluss folgt die oft angefügte Wendung IV–I. In Hutchinsons Kapitel über harmonische Funktionen gilt IV vor I als Erweiterung des Tonikabereichs und nicht als Vorbereitung der Dominante. Die Wendung wirkt deshalb wie ein Nachwort und nicht wie ein neuer Aufbruch.',
  'Minor key · the leading tone': 'Molltonart · der Leitton',
  'Lament · a descending minor tetrachord':
    'Lamento · ein absteigender Molltetrachord',
  'Circle of fifths · roots falling by fifths':
    'Quintfall · Grundtöne in fallenden Quinten',
  'Every root falls a perfect fifth to the next. Hutchinson gives iii–vi–ii–V as a circle segment and ii–V–I as its shortest form; the chain can be lengthened, rotated or started anywhere. Try switching every chord to its seventh to hear the jazz version of the same motion.':
    'Jeder Grundton fällt eine reine Quinte zum nächsten. Hutchinson bezeichnet iii–vi–ii–V als Ausschnitt einer Quintfallkette und ii–V–I als ihre kürzeste Form. Die Kette lässt sich verlängern, rotieren oder an jeder Stelle beginnen. Erweitere alle Dreiklänge zu Septakkorden und höre dieselbe Bewegung im Jazzklang.',
  'Singer/songwriter · four chords': 'Singer-Songwriter · vier Akkorde',
  'Open Music Theory groups the common pop loops by which chord the major tonic is approached from; here it is IV, a plagal approach. Move the first chord to the end and listen again: the same four chords can suggest a different centre through order and emphasis.':
    'Open Music Theory ordnet verbreitete Popschleifen danach, von welchem Akkord aus sie die Durtonika erreichen. Hier geschieht das von IV aus, also plagal. Verschiebe den ersten Akkord ans Ende: Reihenfolge und Betonung können bei denselben vier Akkorden ein anderes Zentrum nahelegen.',
  'Singer/songwriter, rotated · minor or major?':
    'Singer-Songwriter, rotiert · Moll oder Dur?',
  'The same cycle begun on vi. Open Music Theory calls this rotation tonally ambiguous: it can be heard as vi–IV–I–V in the major key or i–♭VI–♭III–♭VII in the relative minor, because neither reading gets an authentic cadence. Decide for yourself which chord sounds like home.':
    'Derselbe Zyklus beginnt auf vi. Open Music Theory beschreibt diese Rotation als tonal mehrdeutig: Sie lässt sich als vi–IV–I–V in Dur oder als i–♭VI–♭III–♭VII in der parallelen Molltonart hören, weil keine der beiden Deutungen durch einen authentischen Schluss bestätigt wird. Entscheide selbst, welcher Akkord wie ein Ruhepunkt klingt.',
  'Doo-wop · the ballad cycle': 'Doo-Wop · der Balladenzyklus',
  'Named for its use in rock ballads of the 1950s and early 1960s. Of the common four-chord cycles this is the one that approaches the tonic from V, the traditional authentic motion — which is what makes it sound the most classical of the three.':
    'Benannt nach seiner Verwendung in Rockballaden der 1950er und frühen 1960er Jahre. Unter diesen verbreiteten Vierakkordzyklen erreicht er die Tonika von V aus, mit der traditionellen authentischen Fortschreitung. Deshalb erinnert er am stärksten an klassische Harmonik.',
  'Doo-wop with ii · one chord swapped':
    'Doo-Wop mit ii · ein Akkord ausgetauscht',
  'ii replaces IV. Open Music Theory explains the swap by shared function: both prepare the dominant, so the cycle keeps its shape while changing colour. Play this against the previous template and listen only to the third chord.':
    'ii ersetzt IV. Open Music Theory erklärt den Austausch mit der gemeinsamen Funktion: Beide bereiten die Dominante vor. Die Form bleibt erhalten, die Klangfarbe ändert sich. Vergleiche mit dem vorherigen Beispiel und achte nur auf den dritten Akkord.',
  'Hopscotch · step, step, skip': 'Hopscotch · Schritt, Schritt, Sprung',
  'Open Music Theory names this recent cycle after its root motion: two steps up, then a skip. The major tonic arrives from vi, an approach belonging to no traditional cadence, which is why the loop can turn without ever sounding closed.':
    'Open Music Theory benennt diesen neueren Zyklus nach seiner Grundtonbewegung: zwei Schritte aufwärts, dann ein Sprung. Die Durtonika wird von vi aus erreicht. Diese Wendung entspricht keinem traditionellen Schlussmodell; die Schleife kann daher kreisen, ohne abgeschlossen zu wirken.',
  'ii–V–I · the shortest circle': 'ii–V–I · die kürzeste Quintfallkette',
  'Minor ii–V–i · half-diminished start':
    'ii–V–i in Moll · halbverminderter Beginn',
  'The minor form of the same motion. The second degree carries a half-diminished seventh, and the dominant keeps its major third. The tonic here is a minor triad with a major seventh — a chord Hutchinson describes as characteristic of jazz. Change it to a plain minor seventh and compare.':
    'Dieselbe Bewegung in Moll. Auf der zweiten Stufe steht ein halbverminderter Septakkord, die Dominante behält ihre große Terz. Die Tonika ist hier ein Mollseptakkord mit großer Septime, den Hutchinson als charakteristisch für Jazz beschreibt. Ersetze sie durch einen Mollseptakkord mit kleiner Septime und vergleiche.',
  'Turnaround · back to the top': 'Turnaround · zurück zum Anfang',
  'Twelve-bar blues · the basic frame': 'Zwölftaktiger Blues · die Grundform',
  'Twelve bars, quick change · IV in bar two':
    'Zwölf Takte mit Quick Change · IV im zweiten Takt',
  'Two of the commonest alterations at once: IV in the second bar, and a dominant in the last bar to turn the form around. Open Music Theory describes the twelve-bar blues as a frame that survives such changes — it is hard to find a blues that alters nothing.':
    'Zwei häufige Änderungen zugleich: IV im zweiten Takt und die Dominante im letzten Takt als Rückleitung. Open Music Theory beschreibt den zwölftaktigen Blues als Grundgerüst, das solche Änderungen zulässt. Vollständig unveränderte Fassungen sind selten.',
  'Minor blues · sevenths turn minor': 'Mollblues · Septakkorde in Moll',
  'The tonic and subdominant become minor sevenths while the dominant keeps its major third. Because the major V falling to a minor iv can sound anticlimactic, the last phrase replaces V–iv–i with the minor ii–V–i.':
    'Tonika und Subdominante werden zu Mollseptakkorden, die Dominante behält ihre große Terz. Weil die Folge von Dur-V zu Moll-iv die Spannung zurücknehmen kann, ersetzt die letzte Phrase V–iv–i durch ii–V–i in Moll.',
  'Jazz blues · ii–V inside the form': 'Jazzblues · ii–V innerhalb der Form',
  'The blues frame with jazz motion added: bar eight turns vi into a dominant that leads to ii, the last phrase uses ii–V–I in place of the plagal V–IV–I, and the final two bars run I–VI7–ii7–V7 as a turnaround back to the top. Watch for the V7/ii label on each VI7 — the lab marks it only because the next chord confirms it.':
    'Die Bluesform wird um typische Jazzfortschreitungen erweitert: Im achten Takt wird vi zu einer Dominante von ii; die letzte Phrase verwendet ii–V–I statt V–IV–I mit plagalem Ende, und die beiden Schlusstakte führen mit I–VI7–ii7–V7 als Turnaround zum Anfang zurück. Achte bei jedem VI7 auf V7/ii. Das Labor zeigt die Deutung nur an, wenn der folgende Akkord sie bestätigt.',
  'Borrowed iv · a minor chord in a major key':
    'Entlehnte iv · ein Mollakkord in Dur',
  'The same subdominant twice, major then minor. Hutchinson calls borrowing from the parallel minor mode mixture, and names the lowered sixth degree as its commonest carrier — that is the one note that changes here. Nothing in the key signature moves; only the chord’s third.':
    'Dieselbe Subdominante zweimal: zuerst Dur, dann Moll. Hutchinson nennt die Entlehnung aus der gleichnamigen Molltonart „mode mixture“. Ihr häufigster Träger ist die erniedrigte sechste Tonleiterstufe; genau dieser Ton ändert sich hier. Die Tonartvorzeichnung bleibt bestehen, nur die Akkordterz wird erniedrigt.',
  'Applied dominant · a dominant of the dominant':
    'Zwischendominante · die Dominante der Dominante',
  '{tonic} major': '{tonic}-Dur',
  '{tonic} minor — natural': '{tonic}-Moll – natürlich',
  'Harmonic minor': 'Harmonisches Moll',
  '{tonic} minor — harmonic': '{tonic}-Moll – harmonisch',
  'Melodic minor (ascending)': 'Melodisches Moll (aufwärts)',
  '{tonic} minor — melodic (ascending)': '{tonic}-Moll – melodisch (aufwärts)',
  'Melodic minor (descending)': 'Melodisches Moll (abwärts)',
  '{tonic} minor — melodic (descending)': '{tonic}-Moll – melodisch (abwärts)',
  Dorian: 'Dorisch',
  '{tonic} Dorian': 'Dorisch auf {tonic}',
  Mixolydian: 'Mixolydisch',
  '{tonic} Mixolydian': 'Mixolydisch auf {tonic}',
  'Major pentatonic': 'Dur-Pentatonik',
  '{tonic} major pentatonic': '{tonic}-Dur-Pentatonik',
  'Minor pentatonic': 'Moll-Pentatonik',
  '{tonic} minor pentatonic': '{tonic}-Moll-Pentatonik',
  'Blues (12-TET)': 'Bluestonleiter (12-TET)',
  '{tonic} blues (12-TET)': 'Bluestonleiter auf {tonic} (12-TET)',
  Language: 'Sprache',
  Space: 'Leertaste',
  // Notation programme (roadmap №558).
  'Note name': 'Tonname',
  Clef: 'Notenschlüssel',
  Accidental: 'Versetzungszeichen',
  'How far a sign reaches': 'Wie weit ein Zeichen gilt',
  'Enharmonic spelling': 'Enharmonische Verwechslung',
  'Next question': 'Nächste Frage',
  'Not quite.': 'Nicht ganz.',
  Registers: 'Oktavlagen',
  'Altered notes': 'Versetzungszeichen',
  'Dotted values': 'Punktierte Werte',
  'Irregular groups': 'Unregelmäßige Teilungen',
  'Tied values': 'Übergebundene Werte',
  'That is the one.': 'Genau das ist es.',
  'That is the neighbouring step. Count the letters, not the keys.':
    'Das ist die Nachbarstufe. Zähle die Stufen, nicht die Tasten.',
  'The step is right, the sign is not. Check how far the sign moves the note.':
    'Die Stufe stimmt, das Versetzungszeichen nicht. Prüfe, wie weit das Zeichen den Ton versetzt.',
  'That is the spelling you started with. It sounds the same, but the task asked you to respell the note with a different letter.':
    'Das ist die Ausgangsschreibweise. Sie klingt gleich, verlangt war aber die Schreibweise mit einem anderen Stammton.',
  'That is how many parts the value was divided into, not how long it lasts.':
    'Das ist die Anzahl der Teile, in die der Wert geteilt wurde, nicht seine Dauer.',
  // Notes lab (roadmap №558).
  Notes: 'Noten',
  'FROM WRITING TO SOUND': 'VON DER SCHRIFT ZUM KLANG',
  'Write a note': 'Einen Ton aufschreiben',
  'What it is': 'Was daraus wird',
  Written: 'Schreibweise',
  Register: 'Oktavlage',
  'Sounding pitch': 'Klingende Tonhöhe',
  'outside the audible range': 'außerhalb des hörbaren Bereichs',
  'MIDI number': 'MIDI-Nummer',
  'Hear this note': 'Diesen Ton hören',
  'The frequency follows the reference pitch and the tuning map chosen in the tone generator. The written note does not change when they do.':
    'Die Frequenz richtet sich nach dem Kammerton und der Stimmung, die im Tongenerator gewählt sind. Die Schreibweise des Tons ändert sich dadurch nicht.',
  'IF YOU ALSO USE SOFTWARE': 'WENN DU AUCH MIT MUSIKSOFTWARE ARBEITEST',
  'MIDI fixes the note number, not the name of its octave. The same key that is number 60 here appears as C3 in some programs, C4 in others and C5 in a few. Read the number when the names disagree.':
    'MIDI legt die Nummer eines Tons fest, nicht den Namen seiner Oktavlage. Dieselbe Taste mit der Nummer 60 heißt in manchen Programmen C3, in anderen C4 und in einigen C5. Wenn die Namen auseinandergehen, gilt die Nummer.',
  'That value is twice as long as the group needs. Divide the starting value by the second number of the ratio: the result is the value the group is written in.':
    'Dieser Wert ist doppelt so lang wie nötig. Teile den Ausgangswert durch die zweite Zahl des Verhältnisses; das Ergebnis ist der Notenwert, mit dem die Gruppe notiert wird.',
  // Staff-based exercises (roadmap №553).
  'Read a note': 'Einen Ton lesen',
  'Change of clef': 'Schlüsselwechsel',
  'That is what the same place would mean in another clef. The clef at the start decides which pitch each line and space carries.':
    'So läse sich dieselbe Stelle in einem anderen Schlüssel. Der Schlüssel am Anfang bestimmt, welcher Ton auf jeder Linie und in jedem Zwischenraum steht.',
  'The note to name': 'Der zu benennende Ton',
  'Search a term…': 'Begriff suchen …',
  'Compare the clef, position and accidental with the correct note.':
    'Vergleiche Schlüssel, Position und Versetzungszeichen mit dem richtigen Ton.',
  // The four lenses and the shell around them (roadmap step 7).
  Read: 'Lesen',
  Play: 'Spielen',
  Drill: 'Üben',
  Define: 'Nachschlagen',
  'Views of this topic': 'Ansichten dieses Themas',
  Indexes: 'Übersichten',
  'Skip to content': 'Zum Inhalt springen',
  'not written': 'nicht geschrieben',
  // The define lens: its facets and its empty state (roadmap step 8).
  Kind: 'Art',
  Topic: 'Thema',
  All: 'Alle',
  sign: 'Zeichen',
  concept: 'Konzept',
  measure: 'Maß',
  tone: 'Klang',
  'No term matches': 'Kein Begriff passt',
  'Clear the search': 'Suche löschen',
  'Clear the filters': 'Filter löschen',
  // Sorting the define lens's index.
  Term: 'Begriff',
  ascending: 'aufsteigend',
  descending: 'absteigend',
  'Sort the index': 'Index sortieren',
  // The read lens: its index, its scope line and its inline exercise.
  'written so far': 'bisher geschrieben',
  'The plan for the rest is in the roadmap.':
    'Der Plan für alles Weitere steht in der Roadmap.',
  'Try it here': 'Hier ausprobieren',
  'Practise this rule': 'Diese Regel üben',
  // The drill lens: the rule ledger and the two exits out of it.
  'RULES THIS SESSION': 'REGELN IN DIESER SITZUNG',
  'A rule you have missed comes up twice as often as one you have not.':
    'Eine Regel, bei der dir ein Fehler unterlaufen ist, kommt doppelt so oft an die Reihe wie eine fehlerfreie.',
  'not yet asked': 'noch nicht gefragt',
  'the passage': 'zum Text',
  'the terms': 'zu den Begriffen',
  'Start a new session': 'Neue Sitzung beginnen',
  'One rule at a time.': 'Eine Regel nach der anderen.',
  // Neutral names for an engraved question, so that the picture does not read
  // the answer out to a screen reader before it has been asked.
  'The place to read in another clef':
    'Die Stelle, die im anderen Schlüssel zu lesen ist',
  'The bar the sign stands in': 'Der Takt, in dem das Versetzungszeichen steht',
  'Exercises use 12-tone equal temperament. Your chosen A4 is captured when each question starts.':
    'Die Übungen verwenden die zwölfstufige gleichstufige Stimmung. Die gewählte Frequenz für a′ wird zu Beginn jeder Frage übernommen.',
} as const;
export type GermanKey = keyof typeof german;
