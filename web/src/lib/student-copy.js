// Student presentation is English-only. Older stores/backups retain their locale.
export const interfaceLocale = (student, savedLocale) => student ? 'en' : savedLocale;

export const studentCopy = {
  en: { title: 'Your university day', tagline: 'Classes, notes, and a little Japanese.', intro: 'Your studies first. Pick up a little Japanese along the way.', edition: 'Student life', deviceAudio: 'Audio uses your device’s speech service, not our server. You may need to install a Japanese voice. Nothing plays automatically.' },
  fr: { title: 'Ta journée à l’université', tagline: 'Des cours, des notes et un peu de japonais.', intro: 'Tes études d’abord. Un peu de japonais en chemin.', edition: 'Vie étudiante', deviceAudio: 'L’audio utilise le service vocal de ton appareil, pas notre serveur. Une voix japonaise doit parfois être installée. Aucune lecture automatique.' },
  nl: { title: 'Je dag aan de universiteit', tagline: 'Lessen, notities en een beetje Japans.', intro: 'Je studie eerst. Pik onderweg wat Japans op.', edition: 'Studentenleven', deviceAudio: 'Audio gebruikt de spraakdienst van je apparaat, niet onze server. Mogelijk moet je een Japanse stem installeren. Niets speelt automatisch af.' },
  de: { title: 'Dein Tag an der Uni', tagline: 'Vorlesungen, Notizen und etwas Japanisch.', intro: 'Dein Studium zuerst. Lerne nebenbei etwas Japanisch.', edition: 'Studierendenleben', deviceAudio: 'Audio nutzt den Sprachdienst deines Geräts, nicht unseren Server. Eventuell musst du eine japanische Stimme installieren. Nichts wird automatisch abgespielt.' }
};
