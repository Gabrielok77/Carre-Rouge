import React, { useState } from 'react';
import { MeetingPoll, VoteChoice } from '../types';
import { useApp } from '../context/AppContext';
import { formatDateDDMMYYYY } from '../utils/dateFormat';
import {
  Vote,
  Check,
  Clock,
  Calendar,
  AlertCircle,
  Users,
  CheckCircle2,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Scale,
  Zap,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface PollVoteCardProps {
  poll: MeetingPoll;
  onOpenFinalize?: (poll: MeetingPoll) => void;
}

export const PollVoteCard: React.FC<PollVoteCardProps> = ({ poll, onOpenFinalize }) => {
  const {
    currentUser,
    votePoll,
    closePollAndCreateMeeting,
    triggerPollDeadline,
    reopenPoll,
    setActiveTab,
  } = useApp();

  // Find existing vote of current user
  const userExistingVote = poll.votes.find((v) => v.userName === currentUser);

  const [responses, setResponses] = useState<Record<string, VoteChoice>>(() => {
    return userExistingVote ? { ...userExistingVote.responses } : {};
  });
  const [comment, setComment] = useState<string>(userExistingVote?.comment || '');
  const [hasVotedNotice, setHasVotedNotice] = useState(false);
  const [showVotersTable, setShowVotersTable] = useState(false);
  const [selectedFinalOption, setSelectedFinalOption] = useState<string>(poll.options[0]?.id || '');
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Update responses when current user changes or poll votes change
  React.useEffect(() => {
    const existing = poll.votes.find((v) => v.userName === currentUser);
    if (existing) {
      setResponses({ ...existing.responses });
      setComment(existing.comment || '');
    } else {
      setResponses({});
      setComment('');
    }
  }, [currentUser, poll]);

  const handleSelectChoice = (optionId: string, choice: VoteChoice) => {
    setResponses((prev) => ({
      ...prev,
      [optionId]: choice,
    }));
  };

  const handleSaveVote = (e: React.FormEvent) => {
    e.preventDefault();
    votePoll(poll.id, responses, comment);
    setHasVotedNotice(true);
    setTimeout(() => setHasVotedNotice(false), 3000);
  };

  // Calculate vote scores for each option
  // Score formula: yes * 2 + if_needed * 1
  const optionStats = poll.options.map((opt) => {
    let yesCount = 0;
    let ifNeededCount = 0;
    let noCount = 0;

    poll.votes.forEach((v) => {
      const choice = v.responses[opt.id];
      if (choice === 'yes') yesCount++;
      else if (choice === 'if_needed') ifNeededCount++;
      else if (choice === 'no') noCount++;
    });

    return {
      ...opt,
      yesCount,
      ifNeededCount,
      noCount,
      totalScore: yesCount * 2 + ifNeededCount,
    };
  });

  // Calculate top score and tied options
  const maxScore = Math.max(...optionStats.map((s) => s.totalScore), 0);
  const topOptions = optionStats.filter((s) => s.totalScore === maxScore && maxScore > 0);
  const bestOption = [...optionStats].sort((a, b) => b.totalScore - a.totalScore)[0];
  const isTie = topOptions.length > 1;

  // Specific tied options to show in tie-break mode
  const tiedOptions =
    poll.status === 'tie_break' && poll.tiedOptionIds && poll.tiedOptionIds.length > 0
      ? optionStats.filter((s) => poll.tiedOptionIds?.includes(s.id))
      : topOptions.length > 1
      ? topOptions
      : optionStats;

  // Single click confirm tied date
  const handleOneClickConfirm = (optionId: string) => {
    const chosen = poll.options.find((o) => o.id === optionId);
    closePollAndCreateMeeting(poll.id, optionId);
    setSuccessBanner(
      `🎉 La date du ${chosen?.label || 'créneau choisi'} a été confirmée en 1 clic ! La réunion a été officiellement programmée dans l’agenda.`
    );
  };

  // Simulate reaching poll deadline
  const handleSimulateDeadline = () => {
    const res = triggerPollDeadline(poll.id);
    if (res.outcome === 'tie_break') {
      setSuccessBanner(
        `⚖️ Date limite atteinte avec égalité ! Veuillez confirmer la date finale parmi les créneaux ex æquo ci-dessous en un simple clic.`
      );
    } else if (res.outcome === 'winner' && res.optionId) {
      const winner = poll.options.find((o) => o.id === res.optionId);
      setSuccessBanner(
        `🏆 Date limite atteinte ! Le créneau "${winner?.label}" a recueilli le plus de votes et est devenu automatiquement la date de réunion officielle dans l'agenda.`
      );
    }
  };

  const handleFinalizeMeeting = () => {
    if (!selectedFinalOption) return;
    closePollAndCreateMeeting(poll.id, selectedFinalOption);
    setShowFinalizeModal(false);
  };

  const selectedOpt = poll.options.find((o) => o.id === poll.selectedOptionId);

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 bg-amber-50/70 border-b border-stone-200">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200/80 text-amber-900 border border-amber-300/60">
                <Vote className="w-3.5 h-3.5" />
                {poll.isForAG ? 'Sondage Assemblée Générale (AG)' : 'Sondage de dates'}
              </span>

              {/* Status Badge */}
              {poll.status === 'open' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Ouvert aux votes</span>
                </span>
              )}

              {poll.status === 'tie_break' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
                  <Scale className="w-3.5 h-3.5 text-purple-700" />
                  <span>Date limite atteinte • Départage requis</span>
                </span>
              )}

              {poll.status === 'closed' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-200 text-stone-800 border border-stone-300">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sondage clôturé & Réunion fixée</span>
                </span>
              )}

              <span className="text-xs text-stone-500 flex items-center gap-1 ml-1">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>Date limite : {formatDateDDMMYYYY(poll.deadline)}</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {poll.title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
              {poll.description}
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {poll.status === 'open' && (
              <button
                type="button"
                onClick={handleSimulateDeadline}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-xs"
                title="Déclencher la clôture du sondage à date limite (attribue le gagnant ou bascule en départage si égalité)"
              >
                <Zap className="w-3.5 h-3.5 text-amber-200" />
                <span>Tester la date limite</span>
              </button>
            )}

            {poll.status !== 'closed' && (
              <button
                type="button"
                onClick={() => setShowFinalizeModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-stone-900 hover:bg-stone-800 text-white transition-colors shadow-xs"
                title="Choisir manuellement une date retenue et clore le sondage"
              >
                <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Valider la date</span>
              </button>
            )}

            {poll.status === 'closed' && (
              <button
                type="button"
                onClick={() => reopenPoll(poll.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 transition-colors shadow-xs"
                title="Rouvrir ce sondage pour autoriser de nouveaux votes"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>Rouvrir le sondage</span>
              </button>
            )}
          </div>
        </div>

        {/* Temporary Notification / Success Banner */}
        {successBanner && (
          <div className="mt-4 p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setActiveTab('calendar')}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg whitespace-nowrap"
            >
              Voir dans l'agenda ➔
            </button>
          </div>
        )}
      </div>

      {/* BODY CONTENT */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* ========================================================================= */}
        {/* CASE 1 : TIE BREAK / CONFIRMER LA DATE (USER EXPLICIT REQUIREMENT)       */}
        {/* "en cas d'égalité, il faut faire un nouvelle version avec 'confirmer la date' */}
        {/* entre les dates les plus votées. un simple clic sur la date choisie suffit   */}
        {/* à en faire la date de réunion"                                            */}
        {/* ========================================================================= */}
        {poll.status === 'tie_break' && (
          <div className="bg-gradient-to-br from-amber-50 via-purple-50/40 to-red-50/40 rounded-3xl border-2 border-purple-400 p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-4 border-b border-purple-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold text-purple-900 uppercase tracking-wider">
                    Date limite atteinte • Égalité Parfaite ({maxScore} points)
                  </span>
                  <h4 className="text-xl font-black text-stone-900 tracking-tight">
                    Confirmer la date de réunion entre les dates les plus votées
                  </h4>
                </div>
              </div>

              <span className="self-start md:self-auto text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-950 border border-purple-300">
                1 clic pour valider
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-5">
              Le sondage a atteint sa date limite avec une <strong>égalité de votes en tête</strong>.
              <br className="hidden sm:inline" />
              👉 <strong>Un simple clic sur la date de votre choix ci-dessous suffit à en faire instantanément la date officielle dans l'agenda du Carré Rouge :</strong>
            </p>

            {/* Grid of the tied dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {tiedOptions.map((opt) => {
                const yesVoters = poll.votes
                  .filter((v) => v.responses[opt.id] === 'yes')
                  .map((v) => v.userName);

                return (
                  <div
                    key={opt.id}
                    className="bg-white rounded-2xl border-2 border-purple-300 hover:border-emerald-500 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                          <Scale className="w-3 h-3" />
                          <span>Ex æquo en tête</span>
                        </span>
                        <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {opt.totalScore} pts ({opt.yesCount} Oui • {opt.ifNeededCount} Si besoin)
                        </span>
                      </div>

                      <h5 className="text-xl font-black text-stone-900 group-hover:text-emerald-700 transition-colors mt-1">
                        {opt.label}
                      </h5>

                      {opt.timeSlot && (
                        <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{opt.timeSlot}</span>
                        </p>
                      )}

                      {/* Members who voted Yes */}
                      <div className="mt-3 pt-3 border-t border-stone-100">
                        <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                          Disponibles ({yesVoters.length}) :
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {yesVoters.map((name, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-semibold px-2 py-0.5 bg-stone-100 text-stone-800 rounded-md"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Single-click confirmation button */}
                    <button
                      type="button"
                      onClick={() => handleOneClickConfirm(opt.id)}
                      className="mt-6 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 group-hover:scale-[1.02] cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirmer le {opt.label} (1 clic)</span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 pt-3 border-t border-purple-200">
              <span>Vous préférez accorder plus de temps à toustes ?</span>
              <button
                type="button"
                onClick={() => reopenPoll(poll.id)}
                className="text-purple-800 hover:text-purple-950 font-bold underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Rouvrir le sondage pour de nouveaux votes</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 2 : POLL CLOSED (SHOW WINNING DATE & LINK TO CALENDAR)               */}
        {/* ========================================================================= */}
        {poll.status === 'closed' && (
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Sondage clôturé • Réunion Programmée
                </p>
                <h4 className="text-lg font-black text-stone-900">
                  Date officielle retenue : {selectedOpt?.label || 'Créneau validé'}
                </h4>
                {selectedOpt?.timeSlot && (
                  <p className="text-xs text-stone-600 mt-0.5">
                    Horaire : {selectedOpt.timeSlot}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('calendar')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors self-start sm:self-auto flex items-center gap-1.5"
            >
              <span>Consulter dans le calendrier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CASE 3 : POLL IS OPEN -> USUAL VOTING FORM                                */}
        {/* ========================================================================= */}
        {poll.status === 'open' && (
          <form onSubmit={handleSaveVote} className="bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-stone-500 font-medium">Vos disponibilités</p>
                  <p className="text-sm font-bold text-stone-900">{currentUser}</p>
                </div>
              </div>
              <span className="text-xs text-stone-500">
                Indiquez votre choix sur chaque créneau proposé :
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {poll.options.map((opt) => {
                const currentChoice = responses[opt.id];
                return (
                  <div
                    key={opt.id}
                    className="p-3 bg-white rounded-xl border border-stone-200 hover:border-amber-300 transition-colors"
                  >
                    <p className="font-bold text-stone-900 text-sm">{opt.label}</p>
                    {opt.timeSlot && (
                      <p className="text-xs text-stone-500 mb-2.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {opt.timeSlot}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => handleSelectChoice(opt.id, 'yes')}
                        className={`py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                          currentChoice === 'yes'
                            ? 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-300'
                            : 'bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                        title="Disponible"
                      >
                        <Check className="w-3 h-3" />
                        <span>Dispo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectChoice(opt.id, 'if_needed')}
                        className={`py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                          currentChoice === 'if_needed'
                            ? 'bg-amber-500 text-white font-bold ring-2 ring-amber-300'
                            : 'bg-stone-100 text-stone-600 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                        title="Si besoin / En dépannage"
                      >
                        <span>Si besoin</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectChoice(opt.id, 'no')}
                        className={`py-1.5 px-1 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                          currentChoice === 'no'
                            ? 'bg-rose-600 text-white font-bold ring-2 ring-rose-300'
                            : 'bg-stone-100 text-stone-600 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                        title="Indisponible"
                      >
                        <span>Non</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Commentaire ou contrainte horaire (ex: j’arriverai vers 20h)..."
                className="flex-1 text-xs sm:text-sm px-3.5 py-2 bg-white rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{userExistingVote ? 'Mettre à jour mon vote' : 'Enregistrer mes disponibilités'}</span>
              </button>
            </div>

            {hasVotedNotice && (
              <div className="mt-3 p-2 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Vos disponibilités ont été enregistrées avec succès !</span>
              </div>
            )}
          </form>
        )}

        {/* Quick Results Summary Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-stone-500" />
              <h4 className="font-bold text-stone-900 text-sm">
                Résultats actuels ({poll.votes.length} personnes ont voté)
              </h4>
            </div>

            <button
              onClick={() => setShowVotersTable(!showVotersTable)}
              className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1"
            >
              <span>{showVotersTable ? 'Masquer le tableau' : 'Voir le détail des réponses'}</span>
              {showVotersTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
            {optionStats.map((stat) => {
              const isTop = maxScore > 0 && stat.totalScore === maxScore;
              return (
                <div
                  key={stat.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isTop
                      ? isTie
                        ? 'bg-purple-50/70 border-purple-300 ring-1 ring-purple-200'
                        : 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200'
                      : 'bg-white border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-900 truncate">{stat.label}</span>
                    {isTop && (
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                          isTie
                            ? 'bg-purple-200 text-purple-900'
                            : 'bg-emerald-200 text-emerald-900'
                        }`}
                      >
                        {isTie ? 'Ex æquo ⚖️' : 'En tête ⭐'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-emerald-700 font-bold">{stat.yesCount} dispo</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-amber-700 font-medium">{stat.ifNeededCount} si besoin</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-rose-700 font-medium">{stat.noCount} non</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Voters Matrix Table (Expandable) */}
          {showVotersTable && (
            <div className="overflow-x-auto border border-stone-200 rounded-2xl mt-3">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 border-b border-stone-200">
                    <th className="p-2.5 font-bold">Personne</th>
                    {poll.options.map((opt) => (
                      <th key={opt.id} className="p-2.5 font-bold text-center min-w-[110px]">
                        <div>{opt.label}</div>
                        {opt.timeSlot && (
                          <div className="font-normal text-[10px] text-stone-500">{opt.timeSlot}</div>
                        )}
                      </th>
                    ))}
                    <th className="p-2.5 font-bold min-w-[140px]">Remarque</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 bg-white">
                  {poll.votes.map((vote) => (
                    <tr key={vote.userId} className="hover:bg-stone-50/70">
                      <td className="p-2.5 font-bold text-stone-800 whitespace-nowrap">
                        {vote.userName}
                      </td>
                      {poll.options.map((opt) => {
                        const choice = vote.responses[opt.id];
                        return (
                          <td key={opt.id} className="p-2 text-center">
                            {choice === 'yes' && (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                                ✓
                              </span>
                            )}
                            {choice === 'if_needed' && (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-bold">
                                (✓)
                              </span>
                            )}
                            {choice === 'no' && (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-800 font-bold">
                                ✕
                              </span>
                            )}
                            {!choice && <span className="text-stone-300">-</span>}
                          </td>
                        );
                      })}
                      <td className="p-2.5 text-stone-600 italic">
                        {vote.comment || <span className="text-stone-300">-</span>}
                      </td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="bg-stone-100/70 font-bold text-stone-800 border-t border-stone-200">
                    <td className="p-2.5">Total Disponibles</td>
                    {optionStats.map((stat) => (
                      <td key={stat.id} className="p-2.5 text-center text-emerald-800 font-bold">
                        {stat.yesCount} ({stat.ifNeededCount > 0 ? `+${stat.ifNeededCount}` : '0'})
                      </td>
                    ))}
                    <td className="p-2.5 text-stone-400">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal to validate manually if desired */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <h3 className="text-lg font-black text-stone-900 mb-2">
              Valider la date et créer la réunion officielle
            </h3>
            <p className="text-xs text-stone-600 mb-4">
              Sélectionnez le créneau retenu suite au sondage. Cela fermera le sondage et créera
              automatiquement la réunion dans l’agenda du Carré Rouge !
            </p>

            <div className="space-y-2 mb-5">
              {optionStats.map((stat) => (
                <label
                  key={stat.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                    selectedFinalOption === stat.id
                      ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-400'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="finalOption"
                      checked={selectedFinalOption === stat.id}
                      onChange={() => setSelectedFinalOption(stat.id)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-stone-900">{stat.label}</p>
                      {stat.timeSlot && <p className="text-[11px] text-stone-500">{stat.timeSlot}</p>}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {stat.yesCount} votes oui
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFinalizeModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleFinalizeMeeting}
                className="px-4 py-2 text-xs font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors shadow-xs"
              >
                Confirmer & Créer la réunion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
