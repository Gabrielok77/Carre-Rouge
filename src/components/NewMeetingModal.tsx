import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, Clock, MapPin, Square } from 'lucide-react';

interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewMeetingModal: React.FC<NewMeetingModalProps> = ({ isOpen, onClose }) => {
  const { addMeeting, currentUser } = useApp();

  const [title, setTitle] = useState('Événement Carré Rouge');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:30');
  const [location, setLocation] = useState('Rosa Parks, 1.08.');
  const [description, setDescription] = useState(
    'Événement Carré Rouge ouvert à toustes. C\'est ici que sont organisées nos différentes mobilisations.'
  );
  const [isGeneralAssembly, setIsGeneralAssembly] = useState(false);
  const [itemsInput, setItemsInput] = useState('Manif, Blocage, Interruption de cours,...');
  const [maxParticipants, setMaxParticipants] = useState<number>(16);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const plannedItems = itemsInput
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    const fullIsoDate = `${date}T${time || '19:30'}:00`;

    addMeeting({
      title: title.trim(),
      date: fullIsoDate,
      location: location.trim(),
      description: description.trim(),
      isGeneralAssembly,
      status: 'scheduled',
      host: currentUser,
      plannedItems,
      attendees: [
        {
          userId: `u-${currentUser}`,
          userName: currentUser,
          status: 'confirmed',
          notes: 'Présent·e',
        },
      ],
      maxParticipants: maxParticipants > 0 ? Number(maxParticipants) : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Square className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Planifier {isGeneralAssembly ? 'une AG' : 'un événement Carré Rouge'}
              </h2>
              <p className="text-xs text-stone-500">Fixez une date officielle dans le calendrier</p>
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
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Titre de la réunion *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
            <input
              type="checkbox"
              id="isAGMeeting"
              checked={isGeneralAssembly}
              onChange={(e) => {
                setIsGeneralAssembly(e.target.checked);
                if (e.target.checked) {
                  setTitle('Assemblée Générale (AG) Carré Rouge');
                } else {
                  setTitle('Événement Carré Rouge');
                }
              }}
              className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
            />
            <label htmlFor="isAGMeeting" className="text-xs font-semibold text-amber-900 cursor-pointer">
              Il s'agit d'une Assemblée Générale (AG)
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Heure de début</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Lieu *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="Ex: Maison des Associations - Salle 2 ou Chez..."
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {isGeneralAssembly
                ? "Sujets de l'AG (séparés par des virgules)"
                : "Éléments de l'événement Carré Rouge (séparés par des virgules)"}
            </label>
            <input
              type="text"
              value={itemsInput}
              onChange={(e) => setItemsInput(e.target.value)}
              placeholder="Ex: Dune Imperium, Codenames, Ark Nova..."
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
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
              Enregistrer la réunion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
