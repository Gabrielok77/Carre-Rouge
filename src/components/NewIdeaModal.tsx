import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ItemComplexity, ItemStatus } from '../types';
import { X, Lightbulb, Users, Clock, Sparkles } from 'lucide-react';

interface NewIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewIdeaModal: React.FC<NewIdeaModalProps> = ({ isOpen, onClose }) => {
  const { addItemIdea, currentUser } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoriesInput, setCategoriesInput] = useState('Stratégie, Deckbuilding');
  const [bggUrl, setBggUrl] = useState('');
  const [status, setStatus] = useState<ItemStatus>('suggestion');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const categories = categoriesInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    addItemIdea({
      title: title.trim(),
      author: currentUser,
      description: description.trim(),
      bggUrl: bggUrl.trim() || undefined,
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">Partage ton avis ici !</h2>
              <p className="text-xs text-stone-500">
                Visible par toustes les personnes de la communauté.
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
              Titre du post*
            </label>
            <input
              id='idea-title'
              name='title'
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Remarques sur une manif, trucs à changer sur le site, commentaires sur un pv,..."
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Contenu du post*
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Évite de faire trop long pour que toustes puissent lire ! (et pas faire sauter le site au"
              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Lien ou référence utile (optionnel)
            </label>
            <input
              type="url"
              value={bggUrl}
              onChange={(e) => setBggUrl(e.target.value)}
              placeholder="https://..."
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
              Publier l'idée
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
