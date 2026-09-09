import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Lightbulb,
  Home,
  User,
  Plus,
  Sparkles,
  Square,
  FileText,
} from 'lucide-react';

interface NavbarProps {
  onOpenNewMeeting: () => void;
  onOpenNewPoll: () => void;
  onOpenNewActivity: () => void;
  onOpenNewIdea: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewMeeting,
  onOpenNewPoll,
  onOpenNewActivity,
  onOpenNewIdea,
}) => {
  const {
    currentUser,
    setCurrentUser,
    availableUsers,
    addNewUser,
    activeTab,
    setActiveTab,
  } = useApp();

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserName.trim()) {
      addNewUser(newUserName.trim());
      setNewUserName('');
      setIsAddingUser(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
            id="nav-brand"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-sm shadow-amber-200 group-hover:scale-105 transition-transform">
              <Square className="w-6 h-6 fill='red' color='black'" />
            </div>
            <div>
              <span className="font-bold text-stone-900 text-lg tracking-tight block leading-tight">
                Carré Rouge
              </span>
              <span className="text-xs text-stone-500 font-medium">
                Assemblées, calendrier & idées partagées
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200/80">
            <button
              id="tab-btn-home"
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Home className="w-4 h-4 text-amber-600" />
              <span>Accueil & AG prévues</span>
            </button>

            <button
              id="tab-btn-calendar"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Calendrier & Mobilisations</span>
            </button>

            <button
              id="tab-btn-ideas"
              onClick={() => setActiveTab('ideas')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'ideas'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/60'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Boîte à idées</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                activeTab === 'reports' ? 'bg-amber-100 text-amber-900' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              PV & Discussions
            </button>
          </nav>

          {/* User selector & Quick Action */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Add Menu */}
            <div className="relative">
              <button
                id="btn-quick-add"
                onClick={() => setShowQuickMenu(!showQuickMenu)}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm px-3.5 py-2 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Créer</span>
              </button>

              {showQuickMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50 text-sm"
                  onClick={() => setShowQuickMenu(false)}
                >
                  <button
                    onClick={onOpenNewPoll}
                    className="w-full text-left px-4 py-2 hover:bg-stone-50 flex items-center gap-2 text-stone-700 font-medium"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Sondage de date (AG / Réunion)</span>
                  </button>
                  <button
                    onClick={onOpenNewMeeting}
                    className="w-full text-left px-4 py-2 hover:bg-stone-50 flex items-center gap-2 text-stone-700 font-medium"
                  >
                    <Calendar className="w-4 h-4 text-stone-600" />
                    <span>Planifier un événement Carré Rouge</span>
                  </button>
                  <button
                    onClick={onOpenNewActivity}
                    className="w-full text-left px-4 py-2 hover:bg-stone-50 flex items-center gap-2 text-stone-700 font-medium"
                  >
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Ajouter une activité extérieure</span>
                  </button>
                  <div className="border-t border-stone-100 my-1" />
                  <button
                    onClick={onOpenNewIdea}
                    className="w-full text-left px-4 py-2 hover:bg-stone-50 flex items-center gap-2 text-stone-700 font-medium"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Proposer une idée au groupe</span>
                  </button>
                </div>
              )}
            </div>

            {/* Member switcher */}
            <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1 text-sm">
              <User className="w-3.5 h-3.5 text-stone-500 hidden sm:block" />
              <span className="text-xs text-stone-500 hidden md:inline">Vous :</span>

              {isAddingUser ? (
                <form onSubmit={handleAddUserSubmit} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Votre prénom"
                    className="w-24 text-xs px-1.5 py-0.5 border border-stone-300 rounded bg-white"
                    autoFocus
                  />
                  <button type="submit" className="text-xs font-bold text-amber-600 px-1">
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingUser(false)}
                    className="text-xs text-stone-400"
                  >
                    ✕
                  </button>
                </form>
              ) : (
                <select
                  value={currentUser}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setIsAddingUser(true);
                    } else {
                      setCurrentUser(e.target.value);
                    }
                  }}
                  className="bg-transparent font-medium text-stone-800 text-xs sm:text-sm focus:outline-hidden cursor-pointer"
                  id="select-current-user"
                >
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                  <option value="__add_new__">+ Autre personne...</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden border-t border-stone-200 py-2 gap-1 justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 text-xs font-medium py-1 px-3 rounded-lg ${
              activeTab === 'home' ? 'text-amber-700 font-bold' : 'text-stone-600'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Accueil</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center gap-1 text-xs font-medium py-1 px-3 rounded-lg ${
              activeTab === 'calendar' ? 'text-amber-700 font-bold' : 'text-stone-600'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Calendrier</span>
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`flex flex-col items-center gap-1 text-xs font-medium py-1 px-3 rounded-lg ${
              activeTab === 'ideas' ? 'text-amber-700 font-bold' : 'text-stone-600'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>Boîte à idées</span>
          </button>
        </div>
      </div>
    </header>
  );
};
