// src/components/JoinModal.tsx
import React, { useState, useEffect } from 'react';
import { verifyToken, claimInvitationToken } from '../lib/token_invitation';

interface JoinModalProps {
  tokenFromUrl: string;
  onSuccess: (newUserName: string) => void;
  onClose: () => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({ tokenFromUrl, onSuccess, onClose }) => {
  const [token] = useState(tokenFromUrl);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  // Vérifie le token dès l'ouverture de la page
  useEffect(() => {
    async function check() {
      setIsValidating(true);
      const res = await verifyToken(token);
      if (!res.valid) {
        setError(res.error || 'Jeton invalide');
      }
      setIsValidating(false);
    }
    void check();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await claimInvitationToken(token, name);
      onSuccess(name.trim());
    } catch (err: any) {
      setError(err.message || "Impossible de valider l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 text-center">Vérification de l'invitation...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Rejoindre Carré Rouge</h2>
        <p className="text-sm text-gray-500 mb-4">
          Vous avez reçu une invitation officielle avec le code : <span className="font-mono font-bold text-red-600">{token}</span>
        </p>

        {error ? (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Votre Prénom / Nom / Pseudonyme
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Angela"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50"
            >
              {loading ? 'Validation...' : 'Créer mon compte et entrer'}
            </button>
          </form>
        )}

        <button
          onClick={onClose}
          className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 text-center"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};