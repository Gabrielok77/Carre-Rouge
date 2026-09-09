import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ItemStatus, ItemComplexity } from '../types';
import { formatDateDDMMYYYY } from '../utils/dateFormat';
import {
  Lightbulb,
  Plus,
  Heart,
  MessageSquare,
  Users,
  Clock,
  ExternalLink,
  Trash2,
  Search,
  Filter,
  Sparkles,
  Send,
  Tag,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

interface IdeasPageProps {
  onOpenNewIdea: () => void;
}

export const IdeasPage: React.FC<IdeasPageProps> = ({ onOpenNewIdea }) => {
  const {
    ItemIdeas,
    currentUser,
    toggleItemUpvote,
    addItemComment,
    updateItemStatus,
    deleteItemIdea,
  } = useApp();

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedComplexityFilter, setSelectedComplexityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'votes' | 'recent' | 'duration'>('votes');

  // Comment input per game
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const handleCommentChange = (gameId: string, text: string) => {
    setCommentInputs((prev) => ({ ...prev, [gameId]: text }));
  };

  const handleCommentSubmit = (e: React.FormEvent, gameId: string) => {
    e.preventDefault();
    const text = commentInputs[gameId];
    if (text && text.trim()) {
      addItemComment(gameId, text.trim());
      setCommentInputs((prev) => ({ ...prev, [gameId]: '' }));
      setExpandedComments((prev) => ({ ...prev, [gameId]: true }));
    }
  };

  const toggleCommentsExpansion = (gameId: string) => {
    setExpandedComments((prev) => ({ ...prev, [gameId]: !prev[gameId] }));
  };

  // Filter and sort ideas
  const filteredAndSortedIdeas = useMemo(() => {
    let list = [...ItemIdeas];

    // Status filter
    if (selectedStatusFilter !== 'all') {
      list = list.filter((g) => g.status === selectedStatusFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.author.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q)
      )
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'votes') {
        return b.upvotes.length - a.upvotes.length;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [ItemIdeas, selectedStatusFilter, selectedComplexityFilter, searchQuery, sortBy]);

  const getStatusBadge = (status: ItemStatus) => {
    switch (status) {
      case 'suggestion':
        return { label: '💡 Proposition', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'to_test':
        return { label: '💬 Remarque', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'club_owned':
        return { label: '📦 Organisation', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'tested':
        return { label: '✓ Point positif', bg: 'bg-stone-100 text-stone-700 border-stone-300' };
      default:
        return { label: 'État inconnu', bg: 'bg-stone-100 text-stone-700 border-stone-300' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
              <Lightbulb className="w-4 h-4" />
              <span>Boîte à Posts</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Idées à partager
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Ici, vous pouvez poster certaines remarques et idées à toustes ! Vous pouvez également voter et partager vos avis sur les idées.
            </p>
          </div>

          <button
            id="btn-propose-idea"
            onClick={onOpenNewIdea}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Partage un post</span>
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedStatusFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Toutes ({ItemIdeas.length})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('suggestion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedStatusFilter === 'suggestion'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              💡 Proposition
            </button>
            <button
              onClick={() => setSelectedStatusFilter('to_test')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedStatusFilter === 'to_test'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              💬 Remarque 
            </button>
            <button
              onClick={() => setSelectedStatusFilter('club_owned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedStatusFilter === 'club_owned'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              📦 Organisation
            </button>
          </div>

          {/* Search and Sort */}
          <div className="flex items-center gap-2">
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 font-medium text-stone-700"
            >
              <option value="votes">Les plus aimés ⭐</option>
              <option value="recent">Plus récents</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAndSortedIdeas.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <Lightbulb className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800">Aucune idée trouvée</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Soyez le premier à proposer ce sujet !
            </p>
            <button
              onClick={onOpenNewIdea}
              className="mt-4 px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
            >
              + Proposer un sujet maintenant
            </button>
          </div>
        ) : (
          filteredAndSortedIdeas.map((item) => {
            const hasUpvoted = item.upvotes.includes(currentUser);
            const statusInfo = getStatusBadge(item.status);
            const isCommentsOpen = expandedComments[item.id] ?? false;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.bg}`}
                        >
                          {statusInfo.label}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          Proposé par <strong className="text-stone-700">{item.author}</strong>
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-stone-900 tracking-tight">
                        {item.title}
                      </h3>
                    </div>

                    {/* Upvote Button */}
                    <button
                      onClick={() => toggleItemUpvote(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                        hasUpvoted
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 ring-2 ring-rose-200'
                          : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-rose-50 hover:text-rose-600'
                      }`}
                      title={hasUpvoted ? 'Sujet pertinent ! ' : 'Sujet Pertinent ?'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-rose-600 text-rose-600' : ''}`}
                      />
                      <span>{item.upvotes.length}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Supprimer « ${item.title} » ?`)) {
                          deleteItemIdea(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                      title="Supprimer cette idée"
                      aria-label={`Supprimer ${item.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Description */}
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-1">
                    {item.description}
                  </p>

                  {/* BGG Link */}
                  {item.bggUrl && (
                    <div className="pt-1">
                      <a
                        href={item.bggUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-semibold"
                      >
                        <span>Référence utile</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* List of members who upvoted */}
                  {item.upvotes.length > 0 && (
                    <div className="text-[11px] text-stone-500 pt-1">
                      <span className="font-semibold text-stone-700">Intéressé·es :</span>{' '}
                      {item.upvotes.join(', ')}
                    </div>
                  )}
                </div>

                {/* Card Bottom: Comments & Status Change */}
                <div className="border-t border-stone-100 bg-stone-50/70 p-4 space-y-3">
                  {/* Toggle Comments Bar */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleCommentsExpansion(item.id)}
                      className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                      <span>
                        {item.comments.length > 0
                          ? `${item.comments.length} avis / retours`
                          : 'Ajouter le 1er commentaire'}
                      </span>
                    </button>

                    {/* Status switcher for members */}
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="text-stone-400">Statut :</span>
                      <select
                        value={item.status}
                        onChange={(e) => updateItemStatus(item.id, e.target.value as ItemStatus)}
                        className="bg-white border border-stone-200 rounded px-1.5 py-0.5 font-medium text-stone-700"
                      >
                        <option value="suggestion">💡 Propositon</option>
                        <option value="to_test">💬 Remarque</option>
                        <option value="club_owned">📦 Organisation</option>
                        <option value="tested">✓ Point positif</option>
                      </select>
                    </div>
                  </div>

                  {/* Expanded Comments List */}
                  {isCommentsOpen && (
                    <div className="space-y-2 pt-2 border-t border-stone-200/60">
                      {item.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-2 rounded-lg bg-white border border-stone-200/60 text-xs"
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-stone-800">{comment.author}</span>
                            <span className="text-[10px] text-stone-400">
                              {formatDateDDMMYYYY(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-stone-600 text-xs leading-relaxed">{comment.text}</p>
                        </div>
                      ))}

                      {/* Comment Input */}
                      <form
                        onSubmit={(e) => handleCommentSubmit(e, item.id)}
                        className="flex items-center gap-1.5 pt-1"
                      >
                        <input
                          type="text"
                          value={commentInputs[item.id] || ''}
                          onChange={(e) => handleCommentChange(item.id, e.target.value)}
                          placeholder={`Votre avis (${currentUser})...`}
                          className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                          type="submit"
                          className="p-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                          title="Publier"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
