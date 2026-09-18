import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActivityCategory } from '../types';
import { X, Sparkles, MapPin, Calendar, ExternalLink } from 'lucide-react';

interface NewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewActivityModal: React.FC<NewActivityModalProps> = ({ isOpen, onClose }) => {
  const { addExternalActivity, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('altmanif');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [priceInfo, setPriceInfo] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) return;

    addExternalActivity({
      title: title.trim(),
      category,
      startDate,
      endDate: endDate || undefined,
      city: city.trim() || 'Belgique',
      location: location.trim() || city.trim(),
      description: description.trim(),
      link: link.trim() || undefined,
      priceInfo: priceInfo.trim() || undefined,
      addedBy: currentUser,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">
                Ajouter une nouvelle mobilisation
              </h2>
              <p className="text-xs text-stone-500">
                Manif, conférence ou autre événement en rapport avec la lutte !
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
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Nom de l'événement*
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Manifestation contre les 1200€, conférence sur les droits étudiants,..."
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Type d'événement</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ActivityCategory)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="altmanif">Manifestation</option>
                <option value="fef">Manif de la FEF</option>
                <option value="umons">Évènement de l'UMons</option>
                <option value="conference">Conférence</option>
                <option value="autre">Autre événement</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Ville *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                placeholder="Ex: Bruxelles, Charleroi, Mons..."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Date de début *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Date de fin (optionnel)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Lieu précis / Adresse
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Gare Centrale à Bruxelles, Plaine de Nimy,..."
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Description & Organisation</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Précisez les détails (horaires, hébergement, covoiturage, programme)..."
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Lien Web</label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Prix</label>
              <input
                type="text"
                value={priceInfo}
                onChange={(e) => setPriceInfo(e.target.value)}
                placeholder="Ex: Gratuit, 10€, etc."
                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
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
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Ajouter au calendrier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
