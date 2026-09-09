import React from 'react';
import { X, BookOpen, ExternalLink, Copy, Check } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyPath = () => {
    navigator.clipboard.writeText('GUIDE_REPRODUCTION.md');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">
                Guide de reproduction du code
              </h2>
              <p className="text-xs text-stone-500">
                Documenté dans le fichier racine <code className="bg-stone-100 px-1 py-0.5 rounded font-mono font-bold">GUIDE_REPRODUCTION.md</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPath}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
              title="Copier le nom du fichier"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'GUIDE_REPRODUCTION.md'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-5 space-y-6 text-xs sm:text-sm text-stone-700 leading-relaxed pr-2">
          <section className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80">
            <h3 className="font-bold text-amber-950 text-sm mb-1">
              🎉 Votre guide complet est disponible à la racine du projet !
            </h3>
            <p className="text-xs text-amber-900">
              Le fichier <strong>GUIDE_REPRODUCTION.md</strong> contient l'ensemble des instructions détaillées étape par étape pour réinstaller et configurer vous-même ce projet de A à Z.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-stone-900 text-base">
              1. En résumé : Comment lancer ce projet chez vous en 4 commandes
            </h3>
            <div className="bg-stone-900 text-stone-100 p-3.5 rounded-xl font-mono text-xs overflow-x-auto space-y-1.5">
              <p className="text-stone-400"># 1. Créer le projet avec Vite & TypeScript</p>
              <p className="text-amber-400">npm create vite@latest club-jeux -- --template react-ts</p>
              <p className="text-amber-400">cd club-jeux</p>
              <p className="text-stone-400 pt-1"># 2. Installer les dépendances</p>
              <p className="text-amber-400">npm install lucide-react @tailwindcss/vite tailwindcss</p>
              <p className="text-stone-400 pt-1"># 3. Lancer le serveur de développement</p>
              <p className="text-emerald-400">npm run dev</p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-stone-900 text-base">
              2. Architecture des fichiers créée
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-stone-600 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <li>
                <strong className="text-stone-900 font-mono">src/types.ts</strong> : Définition des types TypeScript (réunions, sondages, activités extérieures, idées de jeux).
              </li>
              <li>
                <strong className="text-stone-900 font-mono">src/context/AppContext.tsx</strong> : Contexte React gérant l'état global et la persistance locale automatique (<code className="font-mono text-stone-800">localStorage</code>).
              </li>
              <li>
                <strong className="text-stone-900 font-mono">src/components/HomeDashboard.tsx</strong> : Page d'accueil avec la logique stricte des 3 états demandés (Réunion fixée / Sondage AG / Message de création).
              </li>
              <li>
                <strong className="text-stone-900 font-mono">src/components/CalendarPage.tsx</strong> : Planning mensuel & liste chronologique intégrant réunions club et festivals/salons extérieurs.
              </li>
              <li>
                <strong className="text-stone-900 font-mono">src/components/IdeasPage.tsx</strong> : Boîte à idées collaborative avec votes d'engouement (+1), avis et filtres.
              </li>
              <li>
                <strong className="text-stone-900 font-mono">GUIDE_REPRODUCTION.md</strong> : Le fichier complet avec tous les blocs de code prêts à copier-coller.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-stone-900 text-base">
              3. Comment tester facilement les 3 états de l'accueil
            </h3>
            <p className="text-xs text-stone-600">
              Un bandeau noir en haut de l'écran vous permet de tester immédiatement les 3 cas :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
                <span className="font-bold text-stone-900 block mb-1">1. Prochaine réunion</span>
                <span className="text-stone-500 text-[11px]">Affiche la date fixée, les participants et les jeux au programme.</span>
              </div>
              <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
                <span className="font-bold text-stone-900 block mb-1">2. Sondage AG</span>
                <span className="text-stone-500 text-[11px]">Affiche le vote interactif de disponibilités pour la prochaine AG.</span>
              </div>
              <div className="p-3 bg-stone-100 rounded-xl border border-stone-200">
                <span className="font-bold text-stone-900 block mb-1">3. Aucun sondage</span>
                <span className="text-stone-500 text-[11px]">Affiche l'encart d'invitation à créer un nouveau sondage.</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Fichier disponible dans votre projet : <code className="font-bold">/GUIDE_REPRODUCTION.md</code>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
