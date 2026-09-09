import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase'; // 👈 Chemin corrigé

export default function TestPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // 1. Vérifie si les clés .env sont chargées
      if (!isSupabaseConfigured) {
        setErrorMsg("⚠️ Supabase n'est pas configuré : VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquantes dans le .env !");
        setLoading(false);
        return;
      }

      // 2. Requête vers la table 'users' de votre base
      const { data, error } = await supabase.from('users').select('*');

      if (error) {
        console.error("Erreur Supabase :", error);
        setErrorMsg(`Erreur base de données : ${error.message} (Code: ${error.code})`);
      } else if (data) {
        setUsers(data);
      }
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 my-8">
      <h2 className="text-lg font-bold text-stone-900">Test de connexion Supabase</h2>

      {loading && <p className="text-sm text-stone-500">Chargement...</p>}

      {errorMsg && (
        <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      {!loading && !errorMsg && (
        <div>
          <p className="text-xs text-emerald-600 font-bold mb-2">✅ Connecté à Supabase avec succès !</p>
          <ul className="divide-y divide-stone-100 text-sm">
            {users.length === 0 ? (
              <li className="text-stone-400 py-2">La table 'users' est vide pour l'instant.</li>
            ) : (
              users.map((u) => (
                <li key={u.id} className="py-2 flex justify-between">
                  <span>{u.name}</span>
                  <span className="text-xs text-stone-400">{u.role}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}