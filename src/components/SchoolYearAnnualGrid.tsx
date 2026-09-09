import React from 'react';
import { Meeting, ExternalActivity } from '../types';
import {
  SCHOOL_YEAR_MONTHS,
  TRIMESTERS,
  SCHOOL_HOLIDAYS_2026_2027,
  PUBLIC_HOLIDAYS_2026_2027,
  getSchoolHolidayForDate,
  getPublicHolidayForDate,
} from '../data/schoolYearData';
import {
  Calendar,
  Sparkles,
  Square,
  Ticket,
  Trophy,
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2,
  CalendarCheck2,
} from 'lucide-react';
import { formatDateDDMMYYYY } from '../utils/dateFormat';

interface SchoolYearAnnualGridProps {
  meetings: Meeting[];
  externalActivities: ExternalActivity[];
  onSelectMonth: (year: number, month: number) => void;
  currentUser: string;
}

export const SchoolYearAnnualGrid: React.FC<SchoolYearAnnualGridProps> = ({
  meetings,
  externalActivities,
  onSelectMonth,
  currentUser,
}) => {
  // Helper to format date string YYYY-MM-DD
  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Check if a date has events
  const getEventsOnDate = (dateStr: string) => {
    const dayMeetings = meetings.filter((m) => m.date.slice(0, 10) === dateStr);
    const dayActivities = externalActivities.filter((act) => {
      if (act.startDate.slice(0, 10) === dateStr) return true;
      if (act.endDate && dateStr >= act.startDate.slice(0, 10) && dateStr <= act.endDate.slice(0, 10)) {
        return true;
      }
      return false;
    });
    return { meetings: dayMeetings, activities: dayActivities };
  };

  return (
    <div className="space-y-8">
      {/* Annual Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>Planning Annuel Global • Année Scolaire 2026 - 2027</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Grand Calendrier de Carré Rouge (Septembre 2026 – Juillet 2027)
            </h2>
            <p className="text-stone-300 text-sm max-w-2xl leading-relaxed">
              Consultez d'un seul coup d'œil l'ensemble des mois scolaires
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-white/10 p-3 rounded-2xl border border-white/10 backdrop-blur-xs text-center shrink-0">
            <div className="px-3 py-1">
              <div className="text-xl font-black text-amber-400">{meetings.length}</div>
              <div className="text-[11px] text-stone-300">Assemblée Générale</div>
            </div>
            <div className="px-3 py-1 border-x border-white/10">
              <div className="text-xl font-black text-indigo-300">{externalActivities.length}</div>
              <div className="text-[11px] text-stone-300">Events</div>
            </div>
            <div className="px-3 py-1">
              <div className="text-xl font-black text-emerald-400">5</div>
              <div className="text-[11px] text-stone-300">Congés</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-stone-300">
          <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">Repères visuels :</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/40"></span>
            <span>🟥 AG Carré Rouge</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 ring-2 ring-indigo-400/40"></span>
            <span>🪧 Manifs</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 ring-2 ring-rose-400/40"></span>
            <span>🗣️ Autres évènements</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-amber-400/30 border border-amber-400/50"></span>
            <span>🎒 Jours fériés</span>
          </span>
        </div>
      </div>

      {/* Trimesters Sections */}
      {TRIMESTERS.map((trim) => {
        const trimesterMonths = SCHOOL_YEAR_MONTHS.filter((m) => trim.months.includes(m.key));

        return (
          <div key={trim.id} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{trim.emoji}</span>
                <div>
                  <h3 className="text-lg font-black text-stone-900 tracking-tight">
                    {trim.name}
                  </h3>
                  <p className="text-xs text-stone-500">{trim.theme}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
                {trimesterMonths.length} mois
              </span>
            </div>

            {/* Grid of months for this trimester */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {trimesterMonths.map((mObj) => {
                const firstDay = new Date(mObj.year, mObj.month, 1);
                const daysInMonth = new Date(mObj.year, mObj.month + 1, 0).getDate();
                const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Mon = 0, Sun = 6

                // Count events for this month
                const monthEventsCount = meetings.filter((m) => m.date.startsWith(mObj.key)).length +
                  externalActivities.filter((act) => act.startDate.startsWith(mObj.key)).length;

                // Build mini calendar cells
                const cells = [];
                for (let i = 0; i < startDayOfWeek; i++) {
                  cells.push({ day: null });
                }
                for (let d = 1; d <= daysInMonth; d++) {
                  cells.push({ day: d });
                }

                return (
                  <div
                    key={mObj.key}
                    className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Month Card Header */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100">
                        <div>
                          <div className="text-xs font-bold text-amber-700">{mObj.tag}</div>
                          <h4 className="text-base font-black text-stone-900 capitalize">
                            {mObj.name}
                          </h4>
                        </div>
                        <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                          {monthEventsCount} évén.
                        </span>
                      </div>

                      {/* Mini Grid Header */}
                      <div className="grid grid-cols-7 text-[10px] font-bold text-stone-400 text-center mb-1">
                        <div>L</div>
                        <div>M</div>
                        <div>M</div>
                        <div>J</div>
                        <div>V</div>
                        <div className="text-amber-600">S</div>
                        <div className="text-amber-600">D</div>
                      </div>

                      {/* Mini Days Matrix */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {cells.map((c, i) => {
                          if (!c.day) {
                            return <div key={`empty-${i}`} className="h-6"></div>;
                          }

                          const dStr = formatDateStr(mObj.year, mObj.month, c.day);
                          const { meetings: dMeet, activities: dAct } = getEventsOnDate(dStr);
                          const hasMeet = dMeet.length > 0;
                          const hasAct = dAct.length > 0;
                          const holiday = getSchoolHolidayForDate(dStr);
                          const isToday = dStr === '2026-09-04';

                          return (
                            <div
                              key={`day-${c.day}`}
                              className={`h-6 rounded flex flex-col items-center justify-center relative font-semibold text-[11px] ${
                                isToday ? 'ring-2 ring-amber-500 font-bold bg-amber-100 text-amber-950' : ''
                              } ${
                                holiday ? 'bg-amber-50/70 text-amber-900' : 'text-stone-700'
                              } hover:bg-amber-100 cursor-pointer transition-colors`}
                              onClick={() => onSelectMonth(mObj.year, mObj.month)}
                              title={`${dStr}${holiday ? ` (${holiday.name})` : ''}${
                                hasMeet ? ` - ${dMeet.map((m) => m.title).join(', ')}` : ''
                              }${hasAct ? ` - ${dAct.map((a) => a.title).join(', ')}` : ''}`}
                            >
                              <span>{c.day}</span>
                              {/* Dots for events */}
                              {(hasMeet || hasAct) && (
                                <div className="flex items-center gap-0.5 absolute -bottom-0.5">
                                  {hasMeet && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  )}
                                  {hasAct && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Key highlights for this month */}
                      <div className="mt-3 pt-2 border-t border-stone-100 space-y-1">
                        {meetings
                          .filter((m) => m.date.startsWith(mObj.key))
                          .slice(0, 2)
                          .map((m) => (
                            <div
                              key={m.id}
                              className="text-[11px] text-stone-700 truncate flex items-center gap-1 font-medium"
                              title={m.title}
                            >
                              <Square className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="font-bold text-stone-900">
                                {new Date(m.date).getDate()} :
                              </span>
                              <span className="truncate">{m.title}</span>
                            </div>
                          ))}

                        {externalActivities
                          .filter((act) => act.startDate.startsWith(mObj.key))
                          .slice(0, 2)
                          .map((act) => (
                            <div
                              key={act.id}
                              className="text-[11px] text-stone-700 truncate flex items-center gap-1 font-medium"
                              title={act.title}
                            >
                              <Ticket className="w-3 h-3 text-indigo-600 shrink-0" />
                              <span className="font-bold text-stone-900">
                                {new Date(act.startDate).getDate()} :
                              </span>
                              <span className="truncate">{act.title}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Action button to open full month */}
                    <button
                      onClick={() => onSelectMonth(mObj.year, mObj.month)}
                      className="mt-3 w-full py-1.5 px-2 rounded-xl bg-stone-50 hover:bg-amber-600 hover:text-white text-stone-700 text-xs font-bold flex items-center justify-center gap-1 transition-all border border-stone-200"
                    >
                      <span>Ouvrir {mObj.shortName}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* School Holidays summary card */}
      <div className="bg-amber-50/60 rounded-3xl border border-amber-200 p-5 sm:p-6">
        <h3 className="text-base font-black text-stone-900 flex items-center gap-2 mb-3">
          <span>🎒</span>
          <span>Calendrier Officiel des Vacances Scolaires 2026 - 2027</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SCHOOL_HOLIDAYS_2026_2027.map((h, i) => (
            <div
              key={i}
              className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900 flex items-center gap-1">
                  <span>{h.emoji}</span>
                  <span>{h.name}</span>
                </span>
              </div>
              <p className="text-[11px] text-amber-800 font-semibold">
                Du {formatDateDDMMYYYY(h.startDate)} au {formatDateDDMMYYYY(h.endDate)}
              </p>
              <p className="text-[11px] text-stone-500 leading-snug">{h.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
