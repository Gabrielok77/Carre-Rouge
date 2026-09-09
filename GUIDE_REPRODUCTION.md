# Guide Complet : Comment Reproduire cette Plateforme Web de Club de Jeux de Société

Ce guide vous explique, étape par étape, comment recréer vous-même cette application web complète en **TypeScript**, **React** et **Tailwind CSS**.

---

## Sommaire

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Prérequis](#2-prérequis)
3. [Étape 1 : Créer le projet avec Vite & TypeScript](#3-étape-1--créer-le-projet-avec-vite--typescript)
4. [Étape 2 : Installer les dépendances](#4-étape-2--installer-les-dépendances)
5. [Étape 3 : Configurer Tailwind CSS](#5-étape-3--configurer-tailwind-css)
6. [Étape 4 : Définir les types TypeScript (`src/types.ts`)](#6-étape-4--définir-les-types-typescript)
7. [Étape 5 : Préparer des données de démonstration (`src/data/initialData.ts`)](#7-étape-5--données-initiales)
8. [Étape 6 : Gérer l'état et la persistance locale (`src/context/AppContext.tsx`)](#8-étape-6--état-global-et-persistance)
9. [Étape 7 : Construire les composants clés](#9-étape-7--construire-les-composants-clés)
   - [A. La barre de navigation (`Navbar.tsx`)](#a-la-barre-de-navigation)
   - [B. La page d'accueil et la gestion des 3 états (`HomeDashboard.tsx`)](#b-la-page-daccueil-et-les-3-états)
   - [C. Le composant de sondage interactif (`PollVoteCard.tsx`)](#c-le-composant-de-sondage-interactif)
   - [D. Le calendrier & les activités extérieures (`CalendarPage.tsx`)](#d-le-calendrier-et-les-activités-extérieures)
   - [E. La boîte à idées de jeux (`IdeasPage.tsx`)](#e-la-boîte-à-idées-de-jeux)
   - [F. Les fenêtres modales de création](#f-les-modales-de-création)
10. [Étape 8 : Assembler le tout dans `App.tsx`](#10-étape-8--assembler-dans-apptsx)
11. [Lancer et tester l'application en local](#11-lancer-et-tester-lapplication)
12. [Déploiement en ligne](#12-déploiement-en-ligne)

---

## 1. Vue d'ensemble du projet

L'application répond précisément aux besoins d'un groupe ou d'une association de jeux de société :

- **Page Principale (Accueil & Réunion)** :
  - **État 1** : Si une réunion est programmée, elle affiche sa date, son heure, son lieu, les jeux prévus et permet à chacun d'indiquer sa présence ("Je viens", "Peut-être", "Non").
  - **État 2** : Si aucune réunion n'est fixée, elle affiche le **sondage de dates pour la prochaine Assemblée Générale (AG)** ou réunion, avec un tableau de disponibilités interactif (type Doodle/Framadate).
  - **État 3** : Si aucun sondage n'est disponible non plus, elle affiche un **message invitant à créer un sondage** avec un bouton d'action directe.
  - Elle offre également des raccourcis d'accès aux autres pages.
- **Page Calendrier & Activités Extérieures** :
  - Affiche les réunions officielles du club ET les sorties extérieures partagées par toustes (festivals comme Cannes ou Paris est Ludique, salons, tournois, soirées bar à jeux).
  - Permet à n'importe quelle personne d'ajouter un événement extérieur et d'indiquer "+1 Ça m'intéresse".
- **Page Boîte à Idées de Jeux** :
  - Permet à chaque personne de proposer une idée de jeu à découvrir.
  - Tout le monde peut voter pour ses jeux préférés ("J'aimerais y jouer !"), filtrer par statut/mécanique/complexité et laisser des commentaires.

---

## 2. Prérequis

Assurez-vous d'avoir installé sur votre machine :
- **Node.js** (version 18 ou supérieure recommandée) : [https://nodejs.org](https://nodejs.org)
- **npm** (inclus avec Node.js) ou **pnpm** / **yarn**
- Un éditeur de code tel que **Visual Studio Code**

---

## 3. Étape 1 : Créer le projet avec Vite & TypeScript

Ouvrez un terminal et exécutez la commande suivante :

```bash
npm create vite@latest club-jeux -- --template react-ts
cd club-jeux
```

---

## 4. Étape 2 : Installer les dépendances

Installez les dépendances du projet :

```bash
npm install lucide-react @tailwindcss/vite tailwindcss
```

- `lucide-react` : collection d'icônes modernes et légères (dés, calendrier, ampoule, cœurs, etc.).
- `@tailwindcss/vite` & `tailwindcss` : framework CSS utilitaire version 4.

---

## 5. Étape 3 : Configurer Tailwind CSS

### `vite.config.ts`
Mettez à jour votre fichier `vite.config.ts` pour inclure le plugin Tailwind :

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### `src/index.css`
Remplacez le contenu de `src/index.css` par :

```css
@import "tailwindcss";
```

---

## 6. Étape 4 : Définir les types TypeScript

Créez le fichier `src/types.ts` pour structurer rigoureusement les données :

```typescript
export type MeetingStatus = 'scheduled' | 'cancelled' | 'completed';
export type RSVPStatus = 'confirmed' | 'declined' | 'maybe';

export interface MeetingAttendee {
  userId: string;
  userName: string;
  status: RSVPStatus;
  notes?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // Format ISO e.g. "2026-09-18T19:30:00"
  endDate?: string;
  location: string;
  description: string;
  isGeneralAssembly: boolean;
  status: MeetingStatus;
  host: string;
  plannedGames: string[];
  attendees: MeetingAttendee[];
  maxParticipants?: number;
}

export interface PollOption {
  id: string;
  date: string;
  label: string;
  timeSlot?: string;
}

export type VoteChoice = 'yes' | 'if_needed' | 'no';

export interface PollVote {
  userId: string;
  userName: string;
  responses: Record<string, VoteChoice>;
  updatedAt: string;
  comment?: string;
}

export interface MeetingPoll {
  id: string;
  title: string;
  description: string;
  isForAG: boolean;
  deadline: string;
  createdBy: string;
  createdAt: string;
  options: PollOption[];
  votes: PollVote[];
  status: 'open' | 'closed';
  selectedOptionId?: string;
}

export type ActivityCategory =
  | 'festival'
  | 'salon'
  | 'tournament'
  | 'escape_game'
  | 'bar_jeux'
  | 'autre';

export interface ExternalActivity {
  id: string;
  title: string;
  category: ActivityCategory;
  startDate: string;
  endDate?: string;
  location: string;
  city: string;
  description: string;
  link?: string;
  priceInfo?: string;
  addedBy: string;
  createdAt: string;
  interestedUsers: string[];
}

export type GameComplexity = 'Facile / Ambiance' | 'Intermédiaire' | 'Expert / Stratégie';
export type GameStatus = 'suggestion' | 'to_test' | 'club_owned' | 'tested';

export interface GameIdea {
  id: string;
  title: string;
  author: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  durationMinutes: number;
  complexity: GameComplexity;
  categories: string[];
  bggUrl?: string;
  status: GameStatus;
  upvotes: string[];
  comments: Array<{ id: string; author: string; text: string; createdAt: string }>;
  createdAt: string;
}
```

---

## 7. Étape 5 : Données initiales

Créez `src/data/initialData.ts` pour que votre application soit vivante dès son premier chargement (avec des personnes réalistes, une réunion de rentrée, un sondage d'AG, des festivals comme le FIJ Cannes et Paris est Ludique, et des suggestions de jeux comme Harmonies ou Dune Imperium).

---

## 8. Étape 6 : État global et persistance

Créez `src/context/AppContext.tsx` en utilisant un **React Context** combiné à `localStorage` :

- Toutes les modifications (votes de sondage, nouvelles idées de jeux, nouveaux événements extérieurs, inscriptions aux réunions) sont immédiatement enregistrées dans le navigateur.
- Un sélecteur de personne permet de tester l'application sous plusieurs identités (ex: "Alex", "Camille", "Sam" ou votre propre prénom).
- La logique calcule automatiquement :
  - `nextMeeting` : la réunion programmée la plus proche dans le temps.
  - `activePoll` : le sondage ouvert (prioritairement celui de l'Assemblée Générale).
  - Un commutateur de démonstration ("Simulateur de scénarios") pour visualiser en 1 clic les 3 états de la page d'accueil demandés dans la consigne.

---

## 9. Étape 7 : Construire les composants clés

Organisez vos composants dans le dossier `src/components/` :

1. **`Navbar.tsx`** :
   - Onglets Accueil, Calendrier, Boîte à idées.
   - Sélecteur d'utilisateur actif.
   - Menu déroulant "Créer" pour ajouter rapidement un sondage, une réunion, une sortie ou un jeu.
2. **`HomeDashboard.tsx`** :
   - Implémente la règle des 3 états :
     ```tsx
     {nextMeeting ? (
       <NextMeetingCard meeting={nextMeeting} />
     ) : activePoll ? (
       <PollVoteCard poll={activePoll} />
     ) : (
       <EmptyStateCreatePollBanner onOpenNewPoll={onOpenNewPoll} />
     )}
     ```
   - Cartes d'accès rapide vers le Calendrier et la Boîte à idées.
3. **`PollVoteCard.tsx`** :
   - Grille de vote interactive (Oui, Si besoin, Non).
   - Décompte en temps réel des votes et affichage des options en tête.
   - **Clôture automatique à la date limite** :
    - **Gagnant unique** : si une date recueille le plus de votes à la date limite, elle devient automatiquement la réunion officielle dans l'agenda, pré-inscrivant les personnes ayant voté favorablement.
     - **Égalité (Tie-breaker)** : en cas d'égalité en tête à la date limite, le sondage bascule automatiquement dans une vue spéciale **"Confirmer la date"** présentant uniquement les créneaux ex æquo. **Un simple clic sur la date choisie suffit à fixer immédiatement la réunion**, sans aucune étape superflue !
   - Bouton de test "Tester la date limite" permettant de simuler l'arrivée de l'échéance à tout moment.
4. **`CalendarPage.tsx`, `MonthlyCalendarGrid.tsx` & `SchoolYearAnnualGrid.tsx`** :
   - **Aspect complet de calendrier pour l'année scolaire 2026-2027** (de Septembre 2026 à Juillet 2027).
   - **Grille Mensuelle (Vue Calendrier Réelle)** : grille 7 colonnes (Lundi à Dimanche) avec repères des vacances scolaires officielles 2026-2027, jours fériés, badges d'événements (Soirées jeux, AG, Festivals, Tournois) et panneau de détail au clic sur un jour pour s'inscrire ou voter son intérêt.
   - **Vue Année Scolaire 2026-2027 (Planning mural annuel)** : affiche les 11 mois scolaires structurés par trimestres (Automne, Hiver, Printemps/Été), avec pastilles d'événements et repères de vacances.
   - **Ruban de navigation rapide 2026-2027** : 11 pastilles mensuelles interactives (`Sept '26` à `Juil '27`) avec le décompte d'événements par mois.
   - **Vue Liste chronologique** : fiches descriptives complètes avec moteur de recherche, filtres et bouton "+1 Ça m'intéresse".
5. **`IdeasPage.tsx`** :
   - Grille de toutes les propositions de jeux.
   - Compteur de cœurs (+1 vote).
   - Espace de commentaires pour discuter des règles ou proposer d'amener sa propre boîte.
6. **Modales (`NewPollModal.tsx`, `NewMeetingModal.tsx`, `NewActivityModal.tsx`, `NewIdeaModal.tsx`)** :
   - Formulaires soignés avec validation des champs.

---

## 10. Étape 8 : Assembler dans `App.tsx`

Dans `src/App.tsx`, importez le `AppProvider`, la `Navbar`, les vues conditionnelles et les modales.

---

## 11. Lancer et tester l'application

Démarrez le serveur de développement :

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000` (ou `5173`).

### Comment tester les 3 états demandés :
1. **État 1 (Prochaine réunion)** : Visitez l'accueil par défaut, la soirée jeux de rentrée y est affichée.
2. **État 2 (Sondage AG)** : Cliquez sur la pastille "2. Sondage AG" dans le bandeau supérieur pour voir le sondage de dates en lieu et place de la réunion.
3. **État 3 (Aucun sondage)** : Cliquez sur la pastille "3. Aucun sondage" pour voir le grand bandeau invitant à créer un sondage de dates avec le bouton d'action.

---

## 12. Déploiement en ligne

### Option 1 : Vercel (le plus rapide)
1. Poussez votre code sur un dépôt GitHub :
   ```bash
   git init
   git add .
   git commit -m "feat: plateforme club jeux de société"
   git remote add origin https://github.com/VOTRE_PSEUDO/club-jeux.git
   git push -u origin main
   ```
2. Rendez-vous sur [vercel.com](https://vercel.com), importez votre dépôt GitHub et cliquez sur **Deploy**.

### Option 2 : Netlify
1. Connectez votre compte GitHub sur [netlify.com](https://netlify.com).
2. Sélectionnez le dépôt, la commande de build est `npm run build` et le dossier de sortie est `dist`.
3. Cliquez sur **Deploy Site**.

---

## Idées d'évolutions futures

- **Backend Cloud (Firebase Firestore ou Supabase)** : pour synchroniser instantanément les votes et inscriptions entre plusieurs personnes sans passer par le LocalStorage.
- **Notifications Discord / Telegram** : webhook automatique lorsqu'une nouvelle idée de jeu est proposée ou qu'une réunion est fixée.
- **Export iCalendar (.ics)** : pour importer les dates directement dans Google Calendar ou Apple Calendar.
