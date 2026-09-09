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
  date: string; // ISO string e.g. "2026-09-18T19:30:00"
  endDate?: string;
  location: string;
  description: string;
  isGeneralAssembly: boolean;
  status: MeetingStatus;
  host: string;
  plannedItems: string[];
  attendees: MeetingAttendee[];
  maxParticipants?: number;
}

export interface PollOption {
  id: string;
  date: string; // ISO date string
  label: string; // Formatted date label
  timeSlot?: string; // e.g. "19h30 - 23h00"
}

export type VoteChoice = 'yes' | 'if_needed' | 'no';

export interface PollVote {
  userId: string;
  userName: string;
  responses: Record<string, VoteChoice>; // optionId -> choice
  updatedAt: string;
  comment?: string;
}

export interface MeetingReport {
  id: string;
  title: string;          // Ex: "PV Réunion de rentrée 2026"
  meetingDate: string;    // Date de la réunion concernée
  uploadedAt: string;     // Date de téléversement (ISO string)
  expiresAt: string;      // Date d'expiration (uploadedAt + 20 jours minimum)
  pdfUrl: string;         // URL directe du PDF stocké sur Supabase
  fileName: string;       // Nom du fichier d'origine
  fileSizeMb: number;     // Taille pour information (ex: 1.4 Mo)
  authorName: string;     // Nom du secrétaire / membre ayant posté le PV
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
  status: 'open' | 'closed' | 'tie_break';
  selectedOptionId?: string;
  tiedOptionIds?: string[];
  autoResolvedAt?: string;
}

export type ActivityCategory =
  | 'umons'
  | 'fef'
  | 'altmanif'
  | 'festival'
  | 'salon'
  | 'tournament'
  | 'escape_game'
  | 'bar_jeux'
  | 'conference'
  | 'autre';

export interface ExternalActivity {
  id: string;
  title: string;
  category: ActivityCategory;
  startDate: string; // YYYY-MM-DD or ISO
  endDate?: string;
  location: string;
  city: string;
  description: string;
  link?: string;
  priceInfo?: string;
  addedBy: string;
  createdAt: string;
  interestedUsers: string[]; // List of user names
}

export type ItemComplexity = 'Facile / Ambiance' | 'Intermédiaire' | 'Expert / Stratégie';

export type ItemStatus = 'suggestion' | 'to_test' | 'club_owned' | 'tested';

export interface ItemComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface ItemIdea {
  id: string;
  title: string;
  author: string;
  description: string;
  bggUrl?: string;
  imageUrl?: string;
  status: ItemStatus;
  upvotes: string[]; // Array of user names who upvoted
  comments: ItemComment[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'member' | 'admin';
}
