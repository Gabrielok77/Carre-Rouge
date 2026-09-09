import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PollVoteCard } from './PollVoteCard';
import { RSVPStatus } from '../types';
import { formatDateDDMMYYYY } from '../utils/dateFormat';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Check,
  X,
  HelpCircle,
  Plus,
  ArrowRight,
  Lightbulb,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Vote,
  CalendarPlus,
  Square,
  ShieldCheck,
  Heart,
  Tag,
  Share2,
} from 'lucide-react';

interface HomeDashboardProps {
  onOpenNewMeeting: () => void;
  onOpenNewPoll: () => void;
  onOpenNewActivity: () => void;
  onOpenNewIdea: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onOpenNewMeeting,
  onOpenNewPoll,
  onOpenNewActivity,
  onOpenNewIdea,
}) => {
  const {
    currentUser,
    nextMeeting,
    activePoll,
    rsvpMeeting,
    updateMeeting,
    setActiveTab,
    externalActivities,
    ItemIdeas,
    availableUsers,
  } = useApp();

  const [rsvpNote, setRsvpNote] = useState('');
  const [showRsvpNoteInput, setShowRsvpNoteInput] = useState(false);
  const [newItemSuggestion, setNewItemSuggestion] = useState('');
  const [isAddingPlannedItem, setIsAddingPlannedItem] = useState(false);

  // Determine current user RSVP status for the next meeting
  const currentUserRsvp = nextMeeting?.attendees.find((a) => a.userName === currentUser);

  const handleRsvp = (status: RSVPStatus) => {
    if (!nextMeeting) return;
    rsvpMeeting(nextMeeting.id, status, rsvpNote || currentUserRsvp?.notes);
    setShowRsvpNoteInput(false);
  };

  const handleAddPlannedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextMeeting || !newItemSuggestion.trim()) return;
    const updatedItems = [...nextMeeting.plannedItems, newItemSuggestion.trim()];
    updateMeeting(nextMeeting.id, { plannedItems: updatedItems });
    setNewItemSuggestion('');
    setIsAddingPlannedItem(false);
  };

  // Format date nicely in French
  const formatFrenchDate = (dateStr: string) => {
    return formatDateDDMMYYYY(dateStr);
  };

  const formatFrenchTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Aujourd'hui !";
    if (diffDays === 1) return 'Demain !';
    return `Dans ${diffDays} jours`;
  };

  const confirmedAttendees =
    nextMeeting?.attendees.filter((a) => a.status === 'confirmed') || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Welcome & Quick Highlights */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
            <Square className="w-3.5 h-3.5" />
            <span>Espace d'organisation communautaire</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Le site de l'AG Carré Rouge 
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Planifions nos prochaines AG ainsi que nos manifs, évents, etc. Ce site contient également un
            espace pour communiquer des idées/remarques.
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-6 border-t border-stone-700/60 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-stone-300">
                <strong className="text-white">{availableUsers.length}</strong> personnes enregistrés
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-stone-300">
                <strong className="text-white">{ItemIdeas.length}</strong> sujets suggérés
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span className="text-stone-300">
                <strong className="text-white">{externalActivities.length}</strong> évents
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE SECTION : Strict 3-Condition Logic as requested */}
      <section id="section-next-meeting-or-poll" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-600"></div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
              {nextMeeting
                ? 'Prochaine assemblée du Carré Rouge'
                : activePoll
                ? 'Sondage de dates pour la prochaine réunion / AG'
                : 'Prochaine réunion & Sondage de dates'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {nextMeeting && (
              <button
                onClick={onOpenNewMeeting}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Planifier une autre AG</span>
              </button>
            )}
          </div>
        </div>

        {/* CONDITION 1 : NEXT MEETING EXISTS */}
        {nextMeeting && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden transition-all hover:border-amber-300">
            {/* Top Bar with Date & Countdown */}
            <div className="p-6 bg-gradient-to-r from-amber-50 to-red-50/40 border-b border-stone-200/80">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white">
                      {nextMeeting.isGeneralAssembly
                        ? 'Assemblée Générale (AG)'
                        : 'Événement Carré Rouge'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {getDaysRemaining(nextMeeting.date)}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-stone-900 tracking-tight capitalize">
                    {formatFrenchDate(nextMeeting.date)}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-stone-600 mt-2">
                    <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>
                        {formatFrenchTime(nextMeeting.date)}
                        {nextMeeting.endDate && ` - ${formatFrenchTime(nextMeeting.endDate)}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-600" />
                      <span>{nextMeeting.location}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-stone-500" />
                      <span>Orga : {nextMeeting.host}</span>
                    </div>
                  </div>
                </div>

                {/* RSVP Status of Current User */}
                <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-xs text-right min-w-[200px]">
                  <p className="text-xs text-stone-500 mb-1">Votre participation ({currentUser}) :</p>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleRsvp('confirmed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                        currentUserRsvp?.status === 'confirmed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                      title="Je confirme ma présence"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Je viens</span>
                    </button>

                    <button
                      onClick={() => handleRsvp('maybe')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        currentUserRsvp?.status === 'maybe'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                      title="Peut-être"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Peut-être</span>
                    </button>

                    <button
                      onClick={() => handleRsvp('declined')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        currentUserRsvp?.status === 'declined'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                      title="Je ne peux pas"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Non</span>
                    </button>
                  </div>

                  {currentUserRsvp?.notes && (
                    <p className="text-[11px] text-stone-500 italic mt-1.5 truncate">
                      "{currentUserRsvp.notes}"
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Description & Planned games */}
              <div className="lg:col-span-2 space-y-5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                    Ordre du jour & Informations
                  </h4>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {nextMeeting.description}
                  </p>
                </div>

                {/* Planned Games Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                      <Square className="w-3.5 h-3.5 text-amber-600" />
                      <span>Sujets au programme</span>
                    </h4>

                    {!isAddingPlannedItem && (
                      <button
                        onClick={() => setIsAddingPlannedItem(true)}
                        className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Ajouter un sujet</span>
                      </button>
                    )}
                  </div>

                  {isAddingPlannedItem && (
                    <form onSubmit={handleAddPlannedItem} className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={newItemSuggestion}
                        onChange={(e) => setNewItemSuggestion(e.target.value)}
                        placeholder="Ex: 7 Wonders, Wingspan, Les Aventuriers du Rail..."
                        className="flex-1 text-xs px-3 py-1.5 border border-stone-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-bold"
                      >
                        Ajouter
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingPlannedItem(false)}
                        className="px-2 py-1.5 text-stone-500 text-xs"
                      >
                        Annuler
                      </button>
                    </form>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {nextMeeting.plannedItems.length > 0 ? (
                      nextMeeting.plannedItems.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200/80"
                        >
                          <Square className="w-3 h-3 text-amber-600" />
                          <span>{item}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-stone-500 italic">
                        Aucun sujet spécifique renseigné. Cliquez sur "+ Ajouter un sujet" pour en proposer.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Attendees List */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Participants ({confirmedAttendees.length} inscrits)
                  </h4>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {nextMeeting.attendees.map((attendee, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/60 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            attendee.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : attendee.status === 'maybe'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {attendee.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-800 leading-tight">
                            {attendee.userName}
                          </p>
                          {attendee.notes && (
                            <p className="text-[10px] text-stone-500 italic">{attendee.notes}</p>
                          )}
                        </div>
                      </div>

                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          attendee.status === 'confirmed'
                            ? 'text-emerald-700 bg-emerald-50'
                            : attendee.status === 'maybe'
                            ? 'text-amber-700 bg-amber-50'
                            : 'text-stone-500 bg-stone-100'
                        }`}
                      >
                        {attendee.status === 'confirmed'
                          ? 'Présent·e'
                          : attendee.status === 'maybe'
                          ? 'Incertain·e'
                          : 'Absent·e'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONDITION 1b : NEXT MEETING EXISTS, BUT AN ACTIVE/TIE-BREAK POLL IS ALSO ONGOING */}
        {nextMeeting && activePoll && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Vote className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-extrabold text-stone-900">
                  {activePoll.status === 'tie_break'
                    ? '⚖️ Sondage à départager (Égalité à la date limite)'
                    : '🗳️ Sondage de dates également en cours pour l\'AG.'}
                </h3>
              </div>
              <span className="text-xs text-stone-500 font-medium">
                {activePoll.isForAG ? 'Prochaine Assemblée Générale (AG)' : 'Évènement Carré Rouge'}
              </span>
            </div>
            <PollVoteCard poll={activePoll} />
          </div>
        )}

        {/* CONDITION 2 : NO MEETING, BUT A POLL IS AVAILABLE (AG or Session) */}
        {!nextMeeting && activePoll && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vote className="w-4 h-4 text-amber-600" />
                <span>
                  <strong>Aucune AG n'est fixée pour le moment.</strong> Le sondage
                  ci-dessous est ouvert pour déterminer la meilleure date pour tout le monde !
                </span>
              </div>
            </div>

            <PollVoteCard poll={activePoll} />
          </div>
        )}

        {/* CONDITION 3 : NO MEETING AND NO POLL AVAILABLE -> MESSAGE TO CREATE A POLL */}
        {!nextMeeting && !activePoll && (
          <div
            id="empty-poll-banner"
            className="bg-white rounded-2xl border-2 border-dashed border-stone-300 p-8 sm:p-10 text-center space-y-4 shadow-xs"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
              <Vote className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-bold text-stone-900 tracking-tight">
                Aucun sondage de date n'est disponible
              </h3>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                Il n'y a actuellement aucune réunion programmée et aucun sondage en cours pour la
                prochaine réunion ou Assemblée Générale (AG). Créez dès maintenant un sondage avec
                plusieurs propositions de dates pour recueillir les disponibilités de tout le monde !
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                id="btn-create-poll-cta"
                onClick={onOpenNewPoll}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all shadow-sm shadow-amber-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Créer un sondage pour la prochaine AG / Réunion</span>
              </button>

              <button
                onClick={onOpenNewMeeting}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <CalendarPlus className="w-4 h-4 text-stone-600" />
                <span>Ou fixer directement une AG</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ACCESS TO OTHER PAGES SECTION (Requested: "donnant accès aux autres pages") */}
      <section className="space-y-4 pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
              Explorer les autres sections
            </h2>
            <p className="text-xs text-stone-500">
              Calendrier des activités extérieures & Boîte à idées partagée
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 : Calendrier & Activités extérieures */}
          <div
            id="home-card-calendar"
            onClick={() => setActiveTab('calendar')}
            className="group cursor-pointer bg-white rounded-2xl border border-stone-200 hover:border-amber-400 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span>{externalActivities.length} activités prévues</span>
                </span>
              </div>

              <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                Calendrier
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                Consultez l'agenda complet : AG, manifs, conférences,...
              </p>

              {/* Preview of next 2 external events */}
              <div className="mt-4 space-y-2">
                {externalActivities.slice(0, 2).map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-stone-800">{act.title}</p>
                      <p className="text-stone-500 text-[11px] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {act.city} • {formatDateDDMMYYYY(act.startDate)}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-stone-600 bg-stone-200/70 px-2 py-0.5 rounded">
                      {act.interestedUsers.length} intéressé·es
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
              <span>Ouvrir la page Calendrier</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2 : Boîte à idées */}
          <div
            id="home-card-ideas"
            onClick={() => setActiveTab('ideas')}
            className="group cursor-pointer bg-white rounded-2xl border border-stone-200 hover:border-amber-400 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span>{ItemIdeas.length} idées partagées</span>
                </span>
              </div>

              <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                Boîte à idées
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                Partagez vos idées sur la mobilisation, l'organisation, les manifs ou juste votre mood vis à vis de la lutte.
              </p>

              {/* Preview of top voted game */}
              <div className="mt-4 space-y-2">
                {ItemIdeas.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-stone-800">{item.title}</p>
                      <p className="text-stone-500 text-[11px]">
                        Proposé par {item.author}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      <Heart className="w-3 h-3 fill-rose-600" />
                      {item.upvotes.length}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
              <span>Voir et partager des idées</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
