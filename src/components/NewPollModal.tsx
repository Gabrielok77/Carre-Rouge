import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PollOption } from '../types';
import { formatDateDDMMYYYY } from '../utils/dateFormat';
import { X, Plus, Trash2, Calendar, Clock, Vote, Check } from 'lucide-react';

interface NewPollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPollModal: React.FC<NewPollModalProps> = ({ isOpen, onClose }) => {
  const { addPoll, currentUser } = useApp();

  const [title, setTitle] = useState('Sondage de dates : Prochaine AG ou évent.');
  const [description, setDescription] = useState(
    'Votez vos créneaux disponibles pour déterminer la date de notre prochaine AG !'
  );
  const [isForAG, setIsForAG] = useState(false);
  const [deadline, setDeadline] = useState('2026-09-30');

  const [options, setOptions] = useState<Array<{ date: string; label: string; timeSlot: string }>>([
    { date: '2026-10-02', label: 'Vendredi 2 Octobre', timeSlot: '19h30 - 23h30' },
    { date: '2026-10-03', label: 'Samedi 3 Octobre', timeSlot: '14h00 - 19h00' },
    { date: '2026-10-09', label: 'Vendredi 9 Octobre', timeSlot: '19h30 - 23h30' },
  ]);

  const [newDateInput, setNewDateInput] = useState('');
  const [newLabelInput, setNewLabelInput] = useState('');
  const [newTimeInput, setNewTimeInput] = useState('19h30 - 23h30');

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (!newLabelInput.trim()) return;
    setOptions((prev) => [
      ...prev,
      {
        date: newDateInput || new Date().toISOString().split('T')[0],
        label: newLabelInput.trim(),
        timeSlot: newTimeInput.trim() || 'Évent',
      },
    ]);
    setNewLabelInput('');
    setNewDateInput('');
  };

  const handleRemoveOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || options.length === 0) return;

    const formattedOptions: PollOption[] = options.map((opt, i) => ({
      id: `opt-${Date.now()}-${i}`,
      date: opt.date.includes('T') ? opt.date : `${opt.date}T19:30:00`,
      label: opt.label,
      timeSlot: opt.timeSlot,
    }));

    addPoll({
      title: title.trim(),
      description: description.trim(),
      isForAG,
      deadline: deadline.includes('T') ? deadline : `${deadline}T23:59:00`,
      createdBy: currentUser,
      options: formattedOptions,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Créer un sondage de disponibilités
              </h2>
              <p className="text-xs text-stone-500">
                Proposez plusieurs créneaux pour la prochaine AG
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs sm:text-sm">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Titre du sondage *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Sondage de date : Prochaine AG & Soirée de rentrée"
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* AG Checkbox */}
          <div className="flex items-center gap-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <input
              type="checkbox"
              id="isForAG"
              checked={isForAG}
              onChange={(e) => {
                setIsForAG(e.target.checked);
                if (e.target.checked) {
                  setTitle('Sondage de dates : Prochaine Assemblée Générale (AG)');
                }
              }}
              className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
            />
            <label htmlFor="isForAG" className="text-xs font-semibold text-amber-900 cursor-pointer">
              Ce sondage concerne la prochaine Assemblée Générale (AG)
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Description / Ordre du jour (résumé)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Précisez le programme ou les horaires..."
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Date limite pour voter
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm"
            />
          </div>

          {/* Date Options list */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              Propositions de créneaux ({options.length})
            </label>

            <div className="space-y-2 mb-3">
              {options.map((opt, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                >
                  <div>
                    <span className="font-semibold text-stone-900">{opt.label}</span>
                    <span className="text-stone-400 mx-1.5">•</span>
                    <span className="text-stone-500">{opt.timeSlot}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(i)}
                    className="text-stone-400 hover:text-rose-600 p-1"
                    title="Supprimer cette option"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add new option */}
            <div className="p-3 bg-stone-100/70 rounded-xl border border-stone-200 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Ajouter une proposition
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="date"
                  value={newDateInput}
                  onChange={(e) => {
                    setNewDateInput(e.target.value);
                    if (e.target.value && !newLabelInput) {
                      setNewLabelInput(formatDateDDMMYYYY(e.target.value));
                    }
                  }}
                  className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={newLabelInput}
                  onChange={(e) => setNewLabelInput(e.target.value)}
                  placeholder="Ex: Samedi 10 Octobre"
                  className="px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                />
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newTimeInput}
                    onChange={(e) => setNewTimeInput(e.target.value)}
                    placeholder="19h30 - 23h30"
                    className="flex-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="px-3 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-bold hover:bg-stone-900"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-xs"
            >
              Créer et publier le sondage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
