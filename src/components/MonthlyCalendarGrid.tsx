import React, { useState } from 'react';
import { Meeting, ExternalActivity, ActivityCategory } from '../types';
import {
  getSchoolHolidayForDate,
  getPublicHolidayForDate,
  SchoolHoliday,
  PublicHoliday,
} from '../data/schoolYearData';
import {
  ChevronLeft,
  ChevronRight,
  Square,
  Ticket,
  Trophy,
  Sparkles,
  MapPin,
  Clock,
  Users,
  Check,
  ExternalLink,
  Plus,
  Calendar as CalendarIcon,
  X,
  Info,
} from 'lucide-react';
import { formatDateDDMMYYYY } from '../utils/dateFormat';

interface UnifiedEvent {
  id: string;
  type: 'meeting' | 'activity';
  title: string;
  dateStr: string; // YYYY-MM-DD
  endDateStr?: string;
  timeStr?: string;
  location: string;
  description: string;
  category?: ActivityCategory;
  meetingData?: Meeting;
  activityData?: ExternalActivity;
}

interface MonthlyCalendarGridProps {
  currentDate: Date;
  onDateChange: (newDate: Date) => void;
  meetings: Meeting[];
  externalActivities: ExternalActivity[];
  currentUser: string;
  onRsvpMeeting: (meetingId: string, status: 'confirmed' | 'declined') => void;
  onToggleInterest: (activityId: string) => void;
  onOpenNewMeeting: () => void;
  onOpenNewActivity: () => void;
  categoryFilter: string;
}

export const MonthlyCalendarGrid: React.FC<MonthlyCalendarGridProps> = ({
  currentDate,
  onDateChange,
  meetings,
  externalActivities,
  currentUser,
  onRsvpMeeting,
  onToggleInterest,
  onOpenNewMeeting,
  onOpenNewActivity,
  categoryFilter,
}) => {
  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    dateStr: string;
    events: UnifiedEvent[];
    holiday?: SchoolHoliday;
    publicHoliday?: PublicHoliday;
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-11

  const todayStr = '2026-09-04'; // Application fixed date reference or actual today

  // Build unified event list
  const allEvents: UnifiedEvent[] = React.useMemo(() => {
    const list: UnifiedEvent[] = [];

    meetings.forEach((m) => {
      const d = m.date.slice(0, 10);
      const time = new Date(m.date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      list.push({
        id: m.id,
        type: 'meeting',
        title: m.title,
        dateStr: d,
        timeStr: time,
        location: m.location,
        description: m.description,
        meetingData: m,
      });
    });

    externalActivities.forEach((act) => {
      list.push({
        id: act.id,
        type: 'activity',
        title: act.title,
        dateStr: act.startDate.slice(0, 10),
        endDateStr: act.endDate?.slice(0, 10),
        location: `${act.city} (${act.location})`,
        description: act.description,
        category: act.category,
        activityData: act,
      });
    });

    return list;
  }, [meetings, externalActivities]);

  // Compute days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Day of week: 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi. We want 0 = Lundi, 6 = Dimanche
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  // Days from previous month to fill first row
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevDays = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    prevDays.push({
      day: prevMonthLastDay - i,
      month: month - 1,
      year: month === 0 ? year - 1 : year,
      isCurrentMonth: false,
    });
  }

  // Current month days
  const currentDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentDays.push({
      day: i,
      month,
      year,
      isCurrentMonth: true,
    });
  }

  // Days from next month to finish grid (total rows multiple of 7)
  const totalDaysSoFar = prevDays.length + currentDays.length;
  const nextDaysCount = (7 - (totalDaysSoFar % 7)) % 7;
  const nextDays = [];
  for (let i = 1; i <= nextDaysCount; i++) {
    nextDays.push({
      day: i,
      month: month + 1,
      year: month === 11 ? year + 1 : year,
      isCurrentMonth: false,
    });
  }

  const allCalendarCells = [...prevDays, ...currentDays, ...nextDays];

  // Helper to format date string YYYY-MM-DD
  const formatCellDate = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Helper to check if event spans or is on date
  const getEventsForDate = (dateStr: string) => {
    return allEvents.filter((ev) => {
      // Filter by category if set
      if (categoryFilter === 'meetings' && ev.type !== 'meeting') return false;
      if (categoryFilter === 'manifs' && (ev.type !== 'activity' || (ev.category !== 'altmanif' && ev.category !== 'fef'))) {
        return false;
      }
      if (categoryFilter === 'events' && (ev.type !== 'activity' || ev.category !== 'umons' && ev.category !== 'conference')) {
        return false;
      }

      if (ev.dateStr === dateStr) return true;
      if (ev.endDateStr && dateStr >= ev.dateStr && dateStr <= ev.endDateStr) {
        return true;
      }
      return false;
    });
  };

  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const handlePrevMonth = () => {
    onDateChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onDateChange(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    onDateChange(new Date('2026-09-01'));
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header with navigation */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 capitalize tracking-tight">
                  {monthNames[month]} {year}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Année 2026-2027
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Cliquez sur n'importe quel jour pour voir les détails ou participer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-colors shadow-xs"
              title="Aller à la rentrée 2026"
            >
              Aujourd'hui
            </button>
            <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg hover:bg-white text-stone-700 hover:text-stone-900 transition-colors"
                title="Mois précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg hover:bg-white text-stone-700 hover:text-stone-900 transition-colors"
                title="Mois suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
          <span className="font-bold text-stone-500 text-[11px] uppercase tracking-wider">Légende :</span>
          <div className="flex items-center gap-1.5 text-stone-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>🟥 AG Carré Rouge</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-700">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>🪧 Manifs</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>🗣️ Events</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-500">
            <span className="w-3 h-2 rounded bg-amber-100 border border-amber-300"></span>
            <span>🎒 Vacances et Jours fériés</span>
          </div>
        </div>
      </div>

      {/* Main 7-Column Calendar Grid */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-stone-900 text-stone-200 text-xs font-bold py-2.5 text-center border-b border-stone-800">
          <div className="text-stone-300">Lun</div>
          <div className="text-stone-300">Mar</div>
          <div className="text-stone-300">Mer</div>
          <div className="text-stone-300">Carré</div>
          <div className="text-stone-300">Ven</div>
          <div className="text-amber-400">Sam</div>
          <div className="text-amber-400">Dim</div>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-stone-200 bg-stone-100">
          {allCalendarCells.map((cell, idx) => {
            const cellDateStr = formatCellDate(cell.year, cell.month, cell.day);
            const events = getEventsForDate(cellDateStr);
            const isToday = cellDateStr === todayStr;
            const holiday = getSchoolHolidayForDate(cellDateStr);
            const publicHoliday = getPublicHolidayForDate(cellDateStr);
            const isWeekend = (idx % 7 === 5) || (idx % 7 === 6);

            return (
              <div
                key={`${cellDateStr}-${idx}`}
                onClick={() => {
                  setSelectedDayEvents({
                    dateStr: cellDateStr,
                    events,
                    holiday,
                    publicHoliday,
                  });
                }}
                className={`min-h-[105px] sm:min-h-[125px] p-1.5 sm:p-2 flex flex-col justify-between transition-all cursor-pointer group ${
                  cell.isCurrentMonth ? 'bg-white' : 'bg-stone-50/70 text-stone-400'
                } ${isWeekend && cell.isCurrentMonth ? 'bg-stone-50/40' : ''} ${
                  holiday && cell.isCurrentMonth ? 'bg-amber-50/25' : ''
                } ${isToday ? 'ring-2 ring-amber-500 ring-inset z-10' : ''} hover:bg-amber-50/50`}
              >
                {/* Day Number + Badges */}
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-flex items-center justify-center text-xs font-bold w-6 h-6 rounded-lg ${
                        isToday
                          ? 'bg-amber-600 text-white font-black shadow-xs'
                          : cell.isCurrentMonth
                          ? 'text-stone-800 group-hover:text-amber-700'
                          : 'text-stone-400'
                      }`}
                    >
                      {cell.day}
                    </span>
                    {isToday && (
                      <span className="hidden sm:inline text-[10px] font-black uppercase tracking-tight text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-md">
                        Aujourd'hui
                      </span>
                    )}
                  </div>

                  {/* Public Holiday or School Holiday Icon */}
                  <div className="flex items-center gap-1">
                    {publicHoliday && (
                      <span
                        className="text-[10px] bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-semibold hidden sm:inline"
                        title={publicHoliday.name}
                      >
                        Férié
                      </span>
                    )}
                    {holiday && (
                      <span
                        className="text-xs"
                        title={`${holiday.name} (${holiday.emoji})`}
                      >
                        {holiday.emoji}
                      </span>
                    )}
                  </div>
                </div>

                {/* Day Events Stack */}
                <div className="my-1 space-y-1 overflow-hidden flex-1">
                  {events.slice(0, 3).map((ev) => {
                    const isMeeting = ev.type === 'meeting';
                    const isConfirmed = isMeeting && ev.meetingData?.attendees.some(
                      (a) => a.userName === currentUser && a.status === 'confirmed'
                    );

                    let badgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
                    let icon = <Square className="w-3 h-3 text-amber-700 shrink-0" />;

                    if (!isMeeting) {
                      if (ev.category === 'fef' || ev.category === 'altmanif') {
                        badgeClass = 'bg-indigo-100 text-indigo-900 border-indigo-300';
                        icon = <Ticket className="w-3 h-3 text-indigo-700 shrink-0" />;
                      } else if (ev.category === 'umons') {
                        badgeClass = 'bg-rose-100 text-rose-900 border-rose-300';
                        icon = <Trophy className="w-3 h-3 text-rose-700 shrink-0" />;
                      } else {
                        badgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                        icon = <Sparkles className="w-3 h-3 text-emerald-700 shrink-0" />;
                      }
                    }

                    return (
                      <div
                        key={ev.id}
                        className={`text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-md border flex items-center gap-1 truncate font-medium shadow-2xs ${badgeClass} ${
                          isConfirmed ? 'ring-1 ring-emerald-500' : ''
                        }`}
                        title={`${ev.title} - ${ev.location}`}
                      >
                        {icon}
                        <span className="truncate">
                          {ev.timeStr ? `${ev.timeStr} ` : ''}
                          {ev.title}
                        </span>
                        {isConfirmed && <Check className="w-2.5 h-2.5 text-emerald-700 shrink-0 ml-auto" />}
                      </div>
                    );
                  })}

                  {events.length > 3 && (
                    <div className="text-[10px] font-bold text-stone-500 pl-1">
                      +{events.length - 3} autre{events.length - 3 > 1 ? 's' : ''}...
                    </div>
                  )}
                </div>

                {/* Bottom subtle indicator */}
                <div className="flex items-center justify-between text-[10px] text-stone-400">
                  {holiday && (
                    <span className="text-[9px] text-amber-700/80 font-medium truncate max-w-[80px]">
                      {holiday.name.replace('Vacances de ', 'Vac. ')}
                    </span>
                  )}
                  {events.length > 0 && !holiday && (
                    <span className="text-[9px] font-bold text-stone-600 ml-auto">
                      {events.length} évén.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Modal / Drawer */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-stone-200 my-8 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Détail de la journée
                  </span>
                  {selectedDayEvents.publicHoliday && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      Jour férié : {selectedDayEvents.publicHoliday.name}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-stone-900 capitalize mt-1">
                  {formatDateDDMMYYYY(selectedDayEvents.dateStr)}
                </h3>
                {selectedDayEvents.holiday && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
                    {selectedDayEvents.holiday.emoji} <strong>{selectedDayEvents.holiday.name}</strong> ({formatDateDDMMYYYY(selectedDayEvents.holiday.startDate)} au {formatDateDDMMYYYY(selectedDayEvents.holiday.endDate)}) : {selectedDayEvents.holiday.description}
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedDayEvents(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 overflow-y-auto space-y-4 flex-1">
              {selectedDayEvents.events.length === 0 ? (
                <div className="text-center py-8 text-stone-500">
                  <CalendarIcon className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-stone-700">
                    Aucun événement programmé ce jour.
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    Vous pouvez planifier une AG ou un événement Carré Rouge.
                  </p>
                </div>
              ) : (
                selectedDayEvents.events.map((ev) => {
                  if (ev.type === 'meeting' && ev.meetingData) {
                    const meeting = ev.meetingData;
                    const isConfirmed = meeting.attendees.some(
                      (a) => a.userName === currentUser && a.status === 'confirmed'
                    );

                    return (
                      <div
                        key={ev.id}
                        className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/40 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white flex items-center gap-1">
                            <Square className="w-3.5 h-3.5" />
                            <span>{meeting.isGeneralAssembly ? 'Assemblée Générale (AG)' : 'Événement Carré Rouge'}</span>
                          </span>
                          <span className="text-xs text-stone-500">
                            Hôte : <strong>{meeting.host}</strong>
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-stone-900">{meeting.title}</h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            {ev.timeStr}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-600" />
                            {meeting.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            {meeting.attendees.filter((a) => a.status === 'confirmed').length} participant(s)
                          </span>
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed">{meeting.description}</p>

                        {meeting.plannedItems.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-1">
                            <span className="text-xs text-stone-500 font-semibold">Éléments :</span>
                            {meeting.plannedItems.map((g, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-white text-stone-800 text-[11px] font-medium border border-stone-200"
                              >
                                🪧 {g}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() =>
                              onRsvpMeeting(meeting.id, isConfirmed ? 'declined' : 'confirmed')
                            }
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
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
                    );
                  }

                  if (ev.type === 'activity' && ev.activityData) {
                    const act = ev.activityData;
                    const isInterested = act.interestedUsers.includes(currentUser);

                    return (
                      <div
                        key={ev.id}
                        className="p-4 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-900 border border-indigo-200">
                            {act.category.toUpperCase()} • {act.city}
                          </span>
                          {act.priceInfo && (
                            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {act.priceInfo}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-stone-900">{act.title}</h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-600" />
                            {act.location}
                          </span>
                          {act.endDate && (
                            <span className="text-stone-500">Du {formatDateDDMMYYYY(act.startDate)} au {formatDateDDMMYYYY(act.endDate)}</span>
                          )}
                        </div>

                        <p className="text-xs text-stone-700 leading-relaxed">{act.description}</p>

                        {act.link && (
                          <a
                            href={act.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            <span>Site officiel</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-xs text-stone-500">
                            {act.interestedUsers.length} intéressé·e(s)
                          </span>
                          <button
                            onClick={() => onToggleInterest(act.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                              isInterested
                                ? 'bg-indigo-600 text-white'
                                : 'bg-stone-100 hover:bg-indigo-50 text-stone-700 hover:text-indigo-700'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{isInterested ? 'Intéressé·e ✓' : 'Pas intéressé·e'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })
              )}
            </div>

            {/* Modal Footer Quick Actions */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedDayEvents(null);
                    onOpenNewMeeting();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une AG</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedDayEvents(null);
                    onOpenNewActivity();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-900 text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter un événement Carré Rouge</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedDayEvents(null)}
                className="px-4 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
