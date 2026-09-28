import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Check, X } from 'lucide-react';

export const ProfileSelector: React.FC = () => {
  const { currentUser, availableUsers, addNewUser } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addNewUser(inputValue);
    setIsEditing(false);
    setInputValue('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputValue('');
  };

  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-colors shadow-xs"
        title="Changer d'utilisateur"
      >
        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
          <User className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm font-bold text-stone-800">{currentUser}</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5 bg-white p-1 border border-amber-300 rounded-xl shadow-xs">
      <input
        list="user-datalist"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Tapez votre nom..."
        className="w-36 text-sm px-2 py-1.5 outline-hidden rounded-lg bg-transparent"
        autoFocus
      />
      <datalist id="user-datalist">
        {availableUsers.map((u) => (
          <option key={u.id} value={u.name} />
        ))}
      </datalist>
      <button 
        type="submit"
        className="p-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
      >
        <Check className="w-4 h-4" />
      </button>
      <button 
        type="button"
        onClick={handleCancel}
        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </form>
  );
};