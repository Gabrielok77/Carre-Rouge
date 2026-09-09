// Données officielles et repères pour l'année scolaire 2026-2027

export interface SchoolHoliday {
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  description: string;
  emoji: string;
}

export interface PublicHoliday {
  date: string; // YYYY-MM-DD
  name: string;
}

export interface TrimesterInfo {
  id: number;
  name: string;
  shortName: string;
  months: string[]; // ['2026-09', '2026-10', ...]
  emoji: string;
  theme: string;
}

// Vacances scolaires prévisionnelles 2026-2027 (Zone B / référence nationale)
export const SCHOOL_HOLIDAYS_2026_2027: SchoolHoliday[] = [
  {
    name: 'Vacances de la Toussaint',
    startDate: '2026-10-17',
    endDate: '2026-11-01',
    description: 'Deux semaines propices aux réunions thématiques et actions collectives',
    emoji: '🎃',
  },
  {
    name: 'Vacances de Noël',
    startDate: '2026-12-19',
    endDate: '2027-01-03',
    description: 'Trêve des confiseurs et préparation collective de la rentrée',
    emoji: '🎄',
  },
  {
    name: 'Vacances d’Hiver',
    startDate: '2027-02-13',
    endDate: '2027-02-28',
    description: 'Période de coordination des mobilisations du second semestre',
    emoji: '🎿',
  },
  {
    name: 'Vacances de Printemps',
    startDate: '2027-04-10',
    endDate: '2027-04-25',
    description: 'Retour des beaux jours et actions collectives en plein air',
    emoji: '🌸',
  },
  {
    name: 'Pont de l’Ascension',
    startDate: '2027-05-06',
    endDate: '2027-05-09',
    description: 'Long week-end d’organisation et de coordination collective',
    emoji: '⛺',
  },
  {
    name: 'Vacances d’Été',
    startDate: '2027-07-03',
    endDate: '2027-08-31',
    description: 'Clôture de la saison scolaire 2026-2027',
    emoji: '☀️',
  },
];

// Jours fériés en France pour l'année scolaire 2026-2027
export const PUBLIC_HOLIDAYS_2026_2027: PublicHoliday[] = [
  { date: '2026-11-01', name: 'Toussaint' },
  { date: '2026-11-11', name: 'Armistice 1918' },
  { date: '2026-12-25', name: 'Noël' },
  { date: '2027-01-01', name: 'Jour de l’An' },
  { date: '2027-03-29', name: 'Lundi de Pâques' },
  { date: '2027-05-01', name: 'Fête du Travail' },
  { date: '2027-05-06', name: 'Ascension' },
  { date: '2027-05-08', name: 'Victoire 1945' },
  { date: '2027-05-17', name: 'Lundi de Pentecôte' },
  { date: '2027-07-14', name: 'Fête Nationale' },
];

// Les 11 mois de l'année scolaire 2026-2027
export const SCHOOL_YEAR_MONTHS: Array<{
  key: string; // "2026-09"
  year: number;
  month: number; // 0-indexed (8 = Septembre)
  name: string; // "Septembre 2026"
  shortName: string; // "Sept 26"
  trimester: 1 | 2 | 3;
  tag: string;
}> = [
  { key: '2026-09', year: 2026, month: 8, name: 'Septembre 2026', shortName: 'Sept 26', trimester: 1, tag: '🎒 Rentrée' },
  { key: '2026-10', year: 2026, month: 9, name: 'Octobre 2026', shortName: 'Oct 26', trimester: 1, tag: '🎃 Halloween' },
  { key: '2026-11', year: 2026, month: 10, name: 'Novembre 2026', shortName: 'Nov 26', trimester: 1, tag: '🍂 Automne' },
  { key: '2026-12', year: 2026, month: 11, name: 'Décembre 2026', shortName: 'Déc 26', trimester: 1, tag: '🎄 Noël' },
  { key: '2027-01', year: 2027, month: 0, name: 'Janvier 2027', shortName: 'Janv 27', trimester: 2, tag: '👑 Vœux' },
  { key: '2027-02', year: 2027, month: 1, name: 'Février 2027', shortName: 'Fév 27', trimester: 2, tag: '🎲 FIJ Cannes' },
  { key: '2027-03', year: 2027, month: 2, name: 'Mars 2027', shortName: 'Mars 27', trimester: 2, tag: '🌱 Printemps' },
  { key: '2027-04', year: 2027, month: 3, name: 'Avril 2027', shortName: 'Avr 27', trimester: 3, tag: '🐣 Pâques' },
  { key: '2027-05', year: 2027, month: 4, name: 'Mai 2027', shortName: 'Mai 27', trimester: 3, tag: '⛺ Ponts' },
  { key: '2027-06', year: 2027, month: 5, name: 'Juin 2027', shortName: 'Juin 27', trimester: 3, tag: '🌙 Clôture' },
  { key: '2027-07', year: 2027, month: 6, name: 'Juillet 2027', shortName: 'Juil 27', trimester: 3, tag: '☀️ Vacances' },
];

export const TRIMESTERS: TrimesterInfo[] = [
  {
    id: 1,
    name: 'Trimestre 1 : Rentrée & Découvertes',
    shortName: 'Trimestre 1 (Automne)',
    months: ['2026-09', '2026-10', '2026-11', '2026-12'],
    emoji: '🍂',
    theme: 'Rentrée, élection du bureau en AG, soirée Secret Santa de Noël',
  },
  {
    id: 2,
    name: 'Trimestre 2 : Mobilisations & Actions Thématiques',
    shortName: 'Trimestre 2 (Hiver)',
    months: ['2027-01', '2027-02', '2027-03'],
    emoji: '❄️',
    theme: 'Reprise, coordination des actions et préparation des mobilisations',
  },
  {
    id: 3,
    name: 'Trimestre 3 : Tournois & Clôture de Saison',
    shortName: 'Trimestre 3 (Printemps/Été)',
    months: ['2027-04', '2027-05', '2027-06', '2027-07'],
    emoji: '🌸',
    theme: 'Actions collectives, sorties en plein air et clôture de saison',
  },
];

// Helper pour tester si une date (YYYY-MM-DD) est dans une période de vacances scolaires
export function getSchoolHolidayForDate(dateStr: string): SchoolHoliday | undefined {
  const target = dateStr.slice(0, 10);
  return SCHOOL_HOLIDAYS_2026_2027.find(
    (h) => target >= h.startDate && target <= h.endDate
  );
}

// Helper pour tester si une date est un jour férié
export function getPublicHolidayForDate(dateStr: string): PublicHoliday | undefined {
  const target = dateStr.slice(0, 10);
  return PUBLIC_HOLIDAYS_2026_2027.find((h) => h.date === target);
}
