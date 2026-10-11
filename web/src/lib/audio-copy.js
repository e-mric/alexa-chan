import { writable } from 'svelte/store';

// Set only by mounted personal pages; the public demo stays in English.
export const audioLanguage = writable('en');
export const audioCopy = {
  en: {
    controls: 'Audio controls', playing: 'Playing', stop: 'Stop', title: 'Listen in your language and Japanese',
    page: 'Read this page', finish: 'Finish choosing text', choose: 'Choose text to hear', selection: 'Read selected text', done: 'Done',
    picking: 'Tap text or focus it and press Enter to hear it. Turn this off to use page buttons. Escape stops audio.',
    help: 'Or highlight text, then choose “Read selected text”.',
    note: 'Available lesson recordings use Koichi from ElevenLabs. Other text uses device voices. Nothing plays automatically.',
    device: 'Device voice'
  },
  fr: {
    controls: 'Commandes audio', playing: 'Lecture', stop: 'Arrêter', title: 'Écoute dans ta langue et en japonais',
    page: 'Lire cette page', finish: 'Terminer la sélection', choose: 'Choisir un texte à écouter', selection: 'Lire le texte sélectionné', done: 'Terminé',
    picking: 'Clique sur un texte ou sélectionne-le au clavier et appuie sur Entrée. Désactive ce mode pour utiliser les boutons. Échap arrête l’audio.',
    help: 'Ou surligne un texte, puis choisis « Lire le texte sélectionné ».',
    note: 'Les enregistrements disponibles utilisent Koichi d’ElevenLabs. Les autres textes utilisent les voix de ton appareil. Aucune lecture automatique.',
    device: 'Voix de l’appareil'
  },
  nl: {
    controls: 'Audiobediening', playing: 'Afspelen', stop: 'Stoppen', title: 'Luister in je taal en in het Japans',
    page: 'Lees deze pagina voor', finish: 'Tekst kiezen afronden', choose: 'Kies tekst om te horen', selection: 'Lees geselecteerde tekst voor', done: 'Klaar',
    picking: 'Tik op tekst of focus erop en druk op Enter. Schakel dit uit om paginaknoppen te gebruiken. Escape stopt de audio.',
    help: 'Of markeer tekst en kies “Lees geselecteerde tekst voor”.',
    note: 'Beschikbare lesopnamen gebruiken Koichi van ElevenLabs. Andere tekst gebruikt apparaatstemmen. Niets wordt automatisch afgespeeld.',
    device: 'Apparaatstem'
  },
  de: {
    controls: 'Audiosteuerung', playing: 'Wiedergabe', stop: 'Stoppen', title: 'Höre in deiner Sprache und auf Japanisch',
    page: 'Diese Seite vorlesen', finish: 'Textauswahl beenden', choose: 'Text zum Anhören wählen', selection: 'Ausgewählten Text vorlesen', done: 'Fertig',
    picking: 'Tippe auf Text oder fokussiere ihn und drücke Enter. Deaktiviere diesen Modus, um Schaltflächen zu verwenden. Escape stoppt die Wiedergabe.',
    help: 'Oder markiere Text und wähle „Ausgewählten Text vorlesen“.',
    note: 'Verfügbare Lektionsaufnahmen verwenden Koichi von ElevenLabs. Andere Texte verwenden Gerätestimmen. Nichts wird automatisch abgespielt.',
    device: 'Gerätestimme'
  }
};
