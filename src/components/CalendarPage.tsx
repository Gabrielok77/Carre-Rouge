import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ExternalActivity, Meeting, ActivityCategory } from '../types';
import { MonthlyCalendarGrid } from './MonthlyCalendarGrid';
import { SchoolYearAnnualGrid } from './SchoolYearAnnualGrid';
import { SCHOOL_YEAR_MONTHS } from '../data/schoolYearData';
import { formatDateDDMMYYYY } from '../utils/dateFormat';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ExternalLink,
  Users,
  Plus,
  Filter,
  Search,
  Square,
  Ticket,
  Trophy,
  Sparkles,
  Compass,
  CalendarDays,
  CalendarRange,
  Check,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

interface CalendarPageProps {
  onOpenNewActivity: () => void;
  onOpenNewMeeting: () => void;
}

// Unified item for calendar display
type UnifiedEvent =
  | { type: 'meeting'; data: Meeting; sortDate: string }
  | { type: 'activity'; data: ExternalActivity; sortDate: string };

export const CalendarPage: React.FC<CalendarPageProps> = ({
  onOpenNewActivity,
  onOpenNewMeeting,
}) => {
  const {
    meetings,
    externalActivities,
    currentUser,
    toggleActivityInterest,
    rsvpMeeting,
  } = useApp();

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  // Default to 'monthly' to provide the true calendar grid aspect immediately!
  const [viewMode, setViewMode] = useState<'monthly' | 'annual' | 'list'>('monthly');

  // Month navigation for calendar grid (Defaults to Septembre 2026, start of the school year)
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date('2026-09-01'));

  // Merge meetings and external activities
  const allEvents: UnifiedEvent[] = useMemo(() => {
    const list: UnifiedEvent[] = [];

    meetings.forEach((m) => {
      list.push({
        type: 'meeting',
        data: m,
        sortDate: m.date,
      });
    });

    externalActivities.forEach((act) => {
      list.push({
        type: 'activity',
        data: act,
        sortDate: act.startDate,
      });
    });

    return list.sort((a, b) => new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime());
  }, [meetings, externalActivities]);

  // Filter events for list view
  const filteredEvents = useMemo(() => {
    return allEvents.filter((item) => {
      // Category filter
      if (selectedFilter === 'meetings' && item.type !== 'meeting') return false;
      if (
        selectedFilter === 'manifs' &&
        (item.type !== 'activity' || (item.data.category !== 'altmanif' && item.data.category !== 'fef'))
      ) {
        return false;
      }
      if (selectedFilter === 'events' && (item.type !== 'activity' || item.data.category !== 'umons' && item.data.category !== 'conference')) {
        return false;
      }
      if (
        selectedFilter === 'others' &&
        (item.type !== 'activity' ||
          (item.data.category !== 'autre'))
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (item.type === 'meeting') {
          return (
            item.data.title.toLowerCase().includes(query) ||
            item.data.location.toLowerCase().includes(query) ||
            item.data.description.toLowerCase().includes(query) ||
            item.data.plannedItems.some((g) => g.toLowerCase().includes(query))
          );
        } else {
          return (
            item.data.title.toLowerCase().includes(query) ||
            item.data.city.toLowerCase().includes(query) ||
            item.data.location.toLowerCase().includes(query) ||
            item.data.description.toLowerCase().includes(query) ||
            item.data.addedBy.toLowerCase().includes(query)
          );
        }
      }

      return true;
    });
  }, [allEvents, selectedFilter, searchQuery]);

  // Format full date in French
  const formatFrenchDate = (dateStr: string) => {
    return formatDateDDMMYYYY(dateStr);
  };

  const getCategoryBadge = (category: ActivityCategory) => {
    switch (category) {
      case 'umons':
        return { label: 'Évènement UMons', bg: 'bg-rose-100 text-rose-900 border-rose-300' };
      case 'altmanif':
        return { label: 'Manif ', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'fef':
        return { label: 'Manif de la FEF', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
     // case 'escape_game':
     //   return { label: '', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'conference':
        return { label: 'Conférence ou Débat Politique', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      default:
        return { label: 'Évènement', bg: 'bg-stone-100 text-stone-800 border-stone-300' };
    }
  };

  // Helper when selecting a month from the school year ribbon or annual view
  const handleSelectMonth = (year: number, month: number) => {
    setCurrentMonthDate(new Date(year, month, 1));
    setViewMode('monthly');
  };

  const currentYearMonthKey = `${currentMonthDate.getFullYear()}-${String(
    currentMonthDate.getMonth() + 1
  ).padStart(2, '0')}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Année Scolaire 2026 - 2027 • Calendrier Carré Rouge</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Calendrier Scolaire des Mobilisations 2026-2027
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              C'est ici que vous pouvez indiquer les prochaines manifs, événements, etc. auxquels on peut participer !
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              id="btn-add-activity"
              onClick={onOpenNewActivity}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ajouter une nouvelle mobilisation</span>
            </button>

            <button
              id="btn-add-meeting"
              onClick={onOpenNewMeeting}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Square className="w-4 h-4 text-white" fill='red' color='black' />
              <span>+ Planifier une nouvelle activité Carré Rouge</span>
            </button>
          </div>
        </div>
        {/* View Switcher Tabs */}
        <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center bg-stone-100 p-1.5 rounded-2xl border border-stone-200 self-start">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                viewMode === 'monthly'
                  ? 'bg-white text-stone-900 shadow-xs ring-1 ring-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-amber-600" />
              <span>Grille Mensuelle</span>
            </button>

            <button
              onClick={() => setViewMode('annual')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                viewMode === 'annual'
                  ? 'bg-white text-stone-900 shadow-xs ring-1 ring-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CalendarRange className="w-4 h-4 text-indigo-600" />
              <span>Vue Année Scolaire 2026-2027</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                viewMode === 'list'
                  ? 'bg-white text-stone-900 shadow-xs ring-1 ring-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-stone-700" />
              <span>Liste & Inscriptions ({filteredEvents.length})</span>
            </button>
          </div>

          {/* Quick Stats or Year Badge */}
          <div className="text-xs text-stone-500 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              <strong>{meetings.length}</strong> AG Carré Rouge • <strong>{externalActivities.length}</strong> Autres mobilisations
            </span>
          </div>
        </div>

        {/* 2026-2027 School Year Fast Month Ribbon */}
        <div className="mt-4 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Mois de l'année scolaire 2026-2027 (cliquez pour naviguer) :
            </span>
            <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Sept 2026 ➔ Juil 2027
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {SCHOOL_YEAR_MONTHS.map((mObj) => {
              const isActive = currentYearMonthKey === mObj.key;
              // Count events for this month
              const count =
                meetings.filter((m) => m.date.startsWith(mObj.key)).length +
                externalActivities.filter((act) => act.startDate.startsWith(mObj.key)).length;

              return (
                <button
                  key={mObj.key}
                  onClick={() => handleSelectMonth(mObj.year, mObj.month)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs scale-105'
                      : 'bg-stone-50 hover:bg-stone-200/80 text-stone-700 border border-stone-200'
                  }`}
                >
                  <span>{mObj.shortName}</span>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-amber-400 text-stone-900' : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RENDER VIEW ACCORDING TO VIEW MODE */}

      {/* VIEW 1: MONTHLY CALENDAR GRID */}
      {viewMode === 'monthly' && (
        <MonthlyCalendarGrid
          currentDate={currentMonthDate}
          onDateChange={setCurrentMonthDate}
          meetings={meetings}
          externalActivities={externalActivities}
          currentUser={currentUser}
          onRsvpMeeting={rsvpMeeting}
          onToggleInterest={toggleActivityInterest}
          onOpenNewMeeting={onOpenNewMeeting}
          onOpenNewActivity={onOpenNewActivity}
          categoryFilter={selectedFilter}
        />
      )}

      {/* VIEW 2: FULL SCHOOL YEAR 2026-2027 ANNUAL VIEW */}
      {viewMode === 'annual' && (
        <SchoolYearAnnualGrid
          meetings={meetings}
          externalActivities={externalActivities}
          onSelectMonth={handleSelectMonth}
          currentUser={currentUser}
        />
      )}

      {/* VIEW 3: CHRONOLOGICAL DETAILED LIST */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Filters and Search Bar for list view */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Toutes les mobilisations ({allEvents.length})
              </button>

              <button
                onClick={() => setSelectedFilter('meetings')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                  selectedFilter === 'meetings'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Square className="w-3.5 h-3.5" fill='red'color='black' />
                <span>AG Carré Rouge ({meetings.length})</span>
              </button>

              <button
                onClick={() => setSelectedFilter('umons')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                  selectedFilter === 'umons'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Manifestations</span>
              </button>

              <button
                onClick={() => setSelectedFilter('tournaments')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                  selectedFilter === 'tournaments'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Autres Évènements</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher ville, évènement,..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Events List Cards */}
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center">
                <CalendarDays className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-800">Aucun événement ne correspond</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Modifiez vos filtres ou ajoutez une nouvel évènement.
                </p>
                <button
                  onClick={onOpenNewActivity}
                  className="mt-4 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
                >
                  + Proposer une nouvelle modification.
                </button>
              </div>
            ) : (
              filteredEvents.map((item) => {
                if (item.type === 'meeting') {
                  const meeting = item.data;
                  const isConfirmed = meeting.attendees.some(
                    (a) => a.userName === currentUser && a.status === 'confirmed'
                  );

                  return (
                    <div
                      key={meeting.id}
                      className="bg-white rounded-3xl border-2 border-amber-200/90 shadow-sm p-5 sm:p-6 transition-all hover:shadow-md"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white flex items-center gap-1">
                              <Square className="w-3.5 h-3.5" fill='red' />
                              <span>
                                {meeting.isGeneralAssembly
                                  ? 'Assemblée Générale Carré Rouge'
                                  : 'Événement Carré Rouge'}
                              </span>
                            </span>
                            <span className="text-xs text-stone-500 font-medium">
                              Organisé par <strong>{meeting.host}</strong>
                            </span>
                          </div>

                          <h3 className="text-xl font-black text-stone-900 tracking-tight">
                            {meeting.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                            <div className="flex items-center gap-1 font-semibold text-stone-900">
                              <CalendarIcon className="w-3.5 h-3.5 text-amber-600" />
                              <span className="capitalize">{formatFrenchDate(meeting.date)}</span>
                              <span className="text-stone-400">•</span>
                              <Clock className="w-3.5 h-3.5 text-stone-400" />
                              <span>
                                {new Date(meeting.date).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-600" />
                              <span>{meeting.location}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-stone-400" />
                              <span>
                                {meeting.attendees.filter((a) => a.status === 'confirmed').length} participant(s)
                              </span>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                            {meeting.description}
                          </p>

                          {/* Planned Games */}
                          {meeting.plannedItems.length > 0 && (
                            <div className="pt-2 flex flex-wrap items-center gap-1.5">
                              <span className="text-xs font-bold text-stone-500">Sujets :</span>
                              {meeting.plannedItems.map((game, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-stone-100 text-stone-800 border border-stone-200"
                                >
                                  🎲 {game}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action button */}
                        <div className="flex flex-row md:flex-col items-end justify-between md:justify-start gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                          <button
                            onClick={() =>
                              rsvpMeeting(meeting.id, isConfirmed ? 'declined' : 'confirmed')
                            }
                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
                              isConfirmed
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                            <span>{isConfirmed ? 'Je viens' : 'Je ne viens pas'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                // External Activity
                const act = item.data;
                const badgeInfo = getCategoryBadge(act.category);
                const isInterested = act.interestedUsers.includes(currentUser);

                return (
                  <div
                    key={act.id}
                    className="bg-white rounded-3xl border border-stone-200 shadow-xs p-5 sm:p-6 transition-all hover:border-indigo-300 hover:shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeInfo.bg}`}
                          >
                            {badgeInfo.label}
                          </span>
                          <span className="text-xs text-stone-500 font-medium">
                            Partagé par <strong className="text-stone-700">{act.addedBy}</strong>
                          </span>
                          {act.priceInfo && (
                            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {act.priceInfo}
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-stone-900 tracking-tight">{act.title}</h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                          <div className="flex items-center gap-1 font-semibold text-stone-900">
                            <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{formatDateDDMMYYYY(act.startDate)}</span>
                            {act.endDate && <span> au {formatDateDDMMYYYY(act.endDate)}</span>}
                          </div>

                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-600" />
                            <span>
                              {act.city} ({act.location})
                            </span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                          {act.description}
                        </p>

                        {/* External Link */}
                        {act.link && (
                          <div className="pt-1">
                            <a
                              href={act.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                            >
                              <span>Site officiel / Informations</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* Interested Users list */}
                        {act.interestedUsers.length > 0 && (
                          <div className="pt-2 flex items-center gap-2 text-xs text-stone-500">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            <span>
                              Personne(s) intéressée(s) ({act.interestedUsers.length}) :{' '}
                              <strong className="text-stone-700">{act.interestedUsers.join(', ')}</strong>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Interest Button */}
                      <div className="flex flex-row md:flex-col items-end justify-between md:justify-start gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                        <button
                          onClick={() => toggleActivityInterest(act.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
                            isInterested
                              ? 'bg-indigo-600 text-white'
                              : 'bg-stone-100 hover:bg-indigo-50 text-stone-700 hover:text-indigo-700'
                          }`}
                          title="Indiquer que vous êtes intéressé·e ou prévoyez d'y aller"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{isInterested ? 'Intéressé·e ✓' : 'Ça ne m\'intéresse pas.'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
