import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { CalendarPage } from './components/CalendarPage';
import { IdeasPage } from './components/IdeasPage';
import { NewPollModal } from './components/NewPollModal';
import { NewMeetingModal } from './components/NewMeetingModal';
import { NewActivityModal } from './components/NewActivityModal';
import { JoinModal } from './components/JoinModal';
import { NewIdeaModal } from './components/NewIdeaModal';
import { ReportsPage } from './components/ReportsPage';
import { Square } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const [isNewPollOpen, setIsNewPollOpen] = useState(false);
  const [isNewMeetingOpen, setIsNewMeetingOpen] = useState(false);
  const [isNewActivityOpen, setIsNewActivityOpen] = useState(false);
  const [isNewIdeaOpen, setIsNewIdeaOpen] = useState(false);
  const { setCurrentUser, loadSharedData } = useApp();
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  useEffect(() => {
    // 1. Lire le paramètre ?token=... dans l'URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setInviteToken(token);
    }
  }, []);

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans selection:bg-amber-200">

      {/* Top Navbar */}
      <Navbar
        onOpenNewMeeting={() => setIsNewMeetingOpen(true)}
        onOpenNewPoll={() => setIsNewPollOpen(true)}
        onOpenNewActivity={() => setIsNewActivityOpen(true)}
        onOpenNewIdea={() => setIsNewIdeaOpen(true)}
      />
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'home' && (
          <HomeDashboard
            onOpenNewMeeting={() => setIsNewMeetingOpen(true)}
            onOpenNewPoll={() => setIsNewPollOpen(true)}
            onOpenNewActivity={() => setIsNewActivityOpen(true)}
            onOpenNewIdea={() => setIsNewIdeaOpen(true)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarPage
            onOpenNewActivity={() => setIsNewActivityOpen(true)}
            onOpenNewMeeting={() => setIsNewMeetingOpen(true)}
          />
        )}

        {activeTab === 'ideas' && (
          <IdeasPage onOpenNewIdea={() => setIsNewIdeaOpen(true)} />
        )}

        {activeTab === 'reports' && <ReportsPage />}
      </main>

      {/* Global Modals */}
      <NewPollModal
        isOpen={isNewPollOpen}
        onClose={() => setIsNewPollOpen(false)}
      />

      <NewMeetingModal
        isOpen={isNewMeetingOpen}
        onClose={() => setIsNewMeetingOpen(false)}
      />

      <NewActivityModal
        isOpen={isNewActivityOpen}
        onClose={() => setIsNewActivityOpen(false)}
      />

      <NewIdeaModal
        isOpen={isNewIdeaOpen}
        onClose={() => setIsNewIdeaOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-8 border-t border-stone-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-stone-300">
            <Square className="w-5 h-5 text-amber-500"/>
            <span className="font-bold text-stone-100">La Plateforme du Carré Rouge !</span>
            <span className="text-stone-600">|</span>
            <span>TypeScript & React</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span className="hidden sm:inline">
              Assemblées • Mobilisations • Disponibilités • Idées
            </span>
          </div>
        </div>
      </footer>

      {/* Si un token est présent dans l'URL, on affiche la modale d'inscription */}
      {inviteToken && (
        <JoinModal
          tokenFromUrl={inviteToken}
          onSuccess={(newUserName) => {
            setCurrentUser(newUserName);
            setInviteToken(null);
            // Nettoie l'URL sans recharger la page
            window.history.replaceState({}, document.title, window.location.pathname);
            void loadSharedData();
          }}
          onClose={() => {
            setInviteToken(null);
            window.history.replaceState({}, document.title, window.location.pathname);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}