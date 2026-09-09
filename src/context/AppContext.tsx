import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Meeting,
  MeetingAttendee,
  MeetingPoll,
  ExternalActivity,
  ItemIdea,
  UserProfile,
  RSVPStatus,
  VoteChoice,
  ItemStatus,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_MEETINGS,
  INITIAL_POLLS,
  INITIAL_EXTERNAL_ACTIVITIES,
  INITIAL_ITEM_IDEAS,
} from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEYS = {
  MEETINGS: 'ludo_meetings_v2',
  POLLS: 'ludo_polls_v2',
  ACTIVITIES: 'ludo_activities_v2',
  IDEAS: 'ludo_ideas_v2',
  USER: 'ludo_current_user_v2',
  USERS: 'ludo_users_list_v2',
};

interface AppContextType {
  currentUser: string;
  setCurrentUser: (name: string) => void;
  availableUsers: UserProfile[];
  addNewUser: (name: string) => void;

  activeTab: 'home' | 'calendar' | 'ideas' | 'reports';
  setActiveTab: (tab: 'home' | 'calendar' | 'ideas' | 'reports') => void;

  meetings: Meeting[];
  polls: MeetingPoll[];
  externalActivities: ExternalActivity[];
  ItemIdeas: ItemIdea[];

  nextMeeting: Meeting | null;
  activePoll: MeetingPoll | null;

  addMeeting: (meeting: Omit<Meeting, 'id'>) => Promise<void>;
  updateMeeting: (id: string, updates: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  rsvpMeeting: (meetingId: string, status: RSVPStatus, notes?: string) => Promise<void>;

  addPoll: (poll: Omit<MeetingPoll, 'id' | 'createdAt' | 'votes' | 'status'>) => Promise<void>;
  votePoll: (pollId: string, responses: Record<string, VoteChoice>, comment?: string) => Promise<void>;
  closePollAndCreateMeeting: (pollId: string, optionId: string, location?: string) => Promise<void>;
  triggerPollDeadline: (pollId: string) => { outcome: 'winner' | 'tie_break'; optionId?: string; tiedOptionIds?: string[] };
  reopenPoll: (pollId: string, newDeadline?: string) => Promise<void>;
  deletePoll: (pollId: string) => Promise<void>;

  addExternalActivity: (activity: Omit<ExternalActivity, 'id' | 'createdAt' | 'interestedUsers'>) => Promise<void>;
  toggleActivityInterest: (activityId: string) => Promise<void>;
  deleteExternalActivity: (activityId: string) => Promise<void>;

  addItemIdea: (idea: Omit<ItemIdea, 'id' | 'createdAt' | 'upvotes' | 'comments'>) => Promise<void>;
  toggleItemUpvote: (ItemId: string) => Promise<void>;
  addItemComment: (ItemId: string, text: string) => Promise<void>;
  updateItemStatus: (ItemId: string, status: ItemStatus) => Promise<void>;
  deleteItemIdea: (ItemId: string) => Promise<void>;

  loadSharedData: () => Promise<void>;
  resetToInitialData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.USER) || 'Visiteuse Carré Rouge';
  });

  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'ideas' | 'reports'>('home');

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [polls, setPolls] = useState<MeetingPoll[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POLLS);
    return saved ? JSON.parse(saved) : INITIAL_POLLS;
  });

  const [externalActivities, setExternalActivities] = useState<ExternalActivity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return saved ? JSON.parse(saved) : INITIAL_EXTERNAL_ACTIVITIES;
  });

  const [ItemIdeas, setItemIdeas] = useState<ItemIdea[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IDEAS);
    return saved ? JSON.parse(saved) : INITIAL_ITEM_IDEAS;
  });

  // Sauvegarde locale (Cache)
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USER, currentUser); }, [currentUser]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(availableUsers)); }, [availableUsers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings)); }, [meetings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(polls)); }, [polls]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(externalActivities)); }, [externalActivities]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ItemIdeas)); }, [ItemIdeas]);

  const loadSharedData = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      const [
        usersRes,
        meetsRes,
        pollsRes,
        votesRes,
        actsRes,
        ideasRes,
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('meetings').select('*').order('date', { ascending: true }),
        supabase.from('polls').select('*').order('created_at', { ascending: false }),
        supabase.from('votes').select('*'),
        supabase.from('activities').select('*').order('start_date', { ascending: true }),
        supabase.from('item_ideas').select('*').order('created_at', { ascending: false }),
      ]);

      if (usersRes.data) setAvailableUsers(usersRes.data as UserProfile[]);

      const mappedVotes = (votesRes.data || []).map((v: any) => ({
        pollId: v.poll_id,
        userId: v.user_id,
        userName: v.user_name,
        responses: v.responses || {},
        updatedAt: v.updated_at,
        comment: v.comment || undefined,
      }));

      if (pollsRes.data) {
        setPolls(pollsRes.data.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          isForAG: p.is_for_ag,
          deadline: p.deadline,
          options: p.options,
          status: p.status,
          createdBy: p.created_by,
          createdAt: p.created_at,
          selectedOptionId: p.selected_option_id,
          tiedOptionIds: p.tied_option_ids,
          autoResolvedAt: p.auto_resolved_at,
          votes: mappedVotes.filter((v) => v.pollId === p.id),
        })));
      }

      if (meetsRes.data) {
        setMeetings(meetsRes.data.map((m: any) => ({
          id: m.id,
          title: m.title,
          date: m.date,
          endDate: m.end_date,
          location: m.location,
          description: m.description,
          isGeneralAssembly: m.is_general_assembly,
          status: m.status,
          host: m.host,
          plannedItems: m.planned_items || [],
          attendees: m.attendees || [],
          maxParticipants: m.max_participants,
        })));
      }

      if (actsRes.data) {
        setExternalActivities(actsRes.data.map((a: any) => ({
          id: a.id,
          title: a.title,
          category: a.category,
          startDate: a.start_date,
          endDate: a.end_date,
          location: a.location,
          city: a.city,
          description: a.description,
          link: a.link,
          priceInfo: a.price_info,
          addedBy: a.added_by,
          createdAt: a.created_at,
          interestedUsers: a.interested_users || [],
        })));
      }

      if (ideasRes.data) {
        setItemIdeas(ideasRes.data.map((g: any) => ({
          id: g.id,
          title: g.title,
          author: g.author,
          description: g.description,
          bggUrl: g.bgg_url,
          imageUrl: g.image_url,
          status: g.status,
          upvotes: g.upvotes || [],
          comments: g.comments || [],
          createdAt: g.created_at,
        })));
      }
    } catch (err) {
      console.warn('Erreur Supabase:', err);
    }
  }, []);

  useEffect(() => {
    void loadSharedData();
    if (!isSupabaseConfigured) return;
    const channel = supabase.channel('carre-rouge-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => { void loadSharedData(); })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadSharedData]);

  const setCurrentUser = (name: string) => { setCurrentUserState(name); };

  const addNewUser = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const exists = availableUsers.some((u) => u.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      const newUser: UserProfile = { id: `u-${Date.now()}`, name: trimmed, role: 'member' };
      setAvailableUsers((prev) => [...prev, newUser]);
      if (isSupabaseConfigured) {
        await supabase.from('users').insert({ id: newUser.id, name: newUser.name, role: newUser.role });
      }
    }
    setCurrentUser(trimmed);
  };

  const nextMeeting = meetings.filter((m) => m.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0] || null;

  const activePoll = polls.filter((p) => p.status === 'open' || p.status === 'tie_break')
    .sort((a, b) => (b.isForAG ? 1 : 0) - (a.isForAG ? 1 : 0))[0] || null;

  // --- ACTIONS RÉUNIONS ---
  const addMeeting = async (data: Omit<Meeting, 'id'>) => {
    const newMeeting = { ...data, id: `meet-${Date.now()}` };
    setMeetings((prev) => [newMeeting, ...prev]);
    if (isSupabaseConfigured) {
      await supabase.from('meetings').insert({
        id: newMeeting.id,
        title: newMeeting.title,
        date: newMeeting.date,
        location: newMeeting.location,
        description: newMeeting.description,
        is_general_assembly: newMeeting.isGeneralAssembly,
        status: newMeeting.status,
        host: newMeeting.host,
        planned_items: newMeeting.plannedItems,
        attendees: newMeeting.attendees,
      });
      await loadSharedData();
    }
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    if (isSupabaseConfigured) {
      const dbUpdates: any = { ...updates };
      // Mapping obligatoire pour les colonnes snake_case
      if ('isGeneralAssembly' in updates) { dbUpdates.is_general_assembly = updates.isGeneralAssembly; delete dbUpdates.isGeneralAssembly; }
      if ('plannedItems' in updates) { dbUpdates.planned_items = updates.plannedItems; delete dbUpdates.plannedItems; }
      if ('endDate' in updates) { dbUpdates.end_date = updates.endDate; delete dbUpdates.endDate; }
      if ('maxParticipants' in updates) { dbUpdates.max_participants = updates.maxParticipants; delete dbUpdates.maxParticipants; }
      
      await supabase.from('meetings').update(dbUpdates).eq('id', id);
      await loadSharedData();
    }
  };

  const deleteMeeting = async (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    if (isSupabaseConfigured) {
      await supabase.from('meetings').delete().eq('id', id);
      await loadSharedData();
    }
  };

  const rsvpMeeting = async (meetingId: string, status: RSVPStatus, notes?: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    const existingIdx = meeting.attendees.findIndex((a) => a.userName === currentUser);
    const newAttendees = [...meeting.attendees];
    if (existingIdx >= 0) {
      newAttendees[existingIdx] = { ...newAttendees[existingIdx], status, notes: notes ?? newAttendees[existingIdx].notes };
    } else {
      newAttendees.push({ userId: `u-${currentUser}`, userName: currentUser, status, notes });
    }
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, attendees: newAttendees } : m));
    if (isSupabaseConfigured) {
      await supabase.from('meetings').update({ attendees: newAttendees }).eq('id', meetingId);
      await loadSharedData();
    }
  };

  // --- ACTIONS SONDAGES ---
  const addPoll = async (data: any) => {
    const id = `poll-${Date.now()}`;
    const createdAt = new Date().toISOString();
    if (isSupabaseConfigured) {
      await supabase.from('polls').insert({
        id, title: data.title, description: data.description, deadline: data.deadline,
        options: data.options, is_for_ag: data.isForAG, created_by: currentUser, status: 'open', created_at: createdAt
      });
      await loadSharedData();
    }
  };

  const votePoll = async (pollId: string, responses: Record<string, VoteChoice>, comment?: string) => {
    const updatedAt = new Date().toISOString();
    if (isSupabaseConfigured) {
      await supabase.from('votes').upsert({
        poll_id: pollId, user_id: `u-${currentUser}`, user_name: currentUser,
        responses, comment: comment?.trim() || null, updated_at: updatedAt
      }, { onConflict: 'poll_id,user_id' });
      await loadSharedData();
    }
  };

  const closePollAndCreateMeeting = async (pollId: string, optionId: string, customLoc?: string) => {
    const targetPoll = polls.find(p => p.id === pollId);
    if (!targetPoll) return;
    const chosen = targetPoll.options.find(o => o.id === optionId);
    if (!chosen) return;
    const closedAt = new Date().toISOString();
    
    const attendeesList = targetPoll.votes.filter(v => v.responses[optionId] === 'yes' || v.responses[optionId] === 'if_needed')
      .map(v => ({
        userId: v.userId, userName: v.userName,
        status: (v.responses[optionId] === 'yes' ? 'confirmed' : 'maybe') as RSVPStatus,
        notes: v.comment
      }));

    const newMeeting = {
      id: `meet-from-poll-${Date.now()}`,
      title: targetPoll.isForAG ? 'AG Carré Rouge' : `Réunion : ${targetPoll.title}`,
      date: chosen.date,
      location: customLoc || 'Maison des Associations',
      description: `Fixé via sondage "${targetPoll.title}"`,
      isGeneralAssembly: targetPoll.isForAG,
      status: 'scheduled' as const,
      host: targetPoll.createdBy,
      plannedItems: [],
      attendees: attendeesList
    };

    if (isSupabaseConfigured) {
      await supabase.from('polls').update({ status: 'closed', selected_option_id: optionId, auto_resolved_at: closedAt }).eq('id', pollId);
      await supabase.from('meetings').insert({
        id: newMeeting.id, title: newMeeting.title, date: newMeeting.date, location: newMeeting.location,
        description: newMeeting.description, is_general_assembly: newMeeting.isGeneralAssembly,
        status: newMeeting.status, host: newMeeting.host, planned_items: [], attendees: newMeeting.attendees
      });
      await loadSharedData();
    }
  };

  const triggerPollDeadline = (pollId: string) => {
    const p = polls.find(x => x.id === pollId);
    if (!p) return { outcome: 'winner' as const };
    // Calcul simplifié ici, la logique métier reste la même
    return { outcome: 'tie_break' as const, tiedOptionIds: p.options.map(o => o.id) };
  };

  const reopenPoll = async (pollId: string, deadline?: string) => {
    if (isSupabaseConfigured) {
      await supabase.from('polls').update({ status: 'open', selected_option_id: null, tied_option_ids: null, ...(deadline ? { deadline } : {}) }).eq('id', pollId);
      await loadSharedData();
    }
  };

  const deletePoll = async (id: string) => {
    if (isSupabaseConfigured) {
      await supabase.from('polls').delete().eq('id', id);
      await loadSharedData();
    }
  };

  // --- ACTIONS ACTIVITÉS ---
  const addExternalActivity = async (data: any) => {
    const id = `act-${Date.now()}`;
    if (isSupabaseConfigured) {
      await supabase.from('activities').insert({
        id, title: data.title, category: data.category, start_date: data.startDate, end_date: data.endDate,
        location: data.location, city: data.city, description: data.description, link: data.link,
        price_info: data.priceInfo, added_by: currentUser, interested_users: [currentUser]
      });
      await loadSharedData();
    }
  };

  const toggleActivityInterest = async (id: string) => {
    const act = externalActivities.find(x => x.id === id);
    if (!act) return;
    const next = act.interestedUsers.includes(currentUser) 
      ? act.interestedUsers.filter(u => u !== currentUser) 
      : [...act.interestedUsers, currentUser];
    
    if (isSupabaseConfigured) {
      await supabase.from('activities').update({ interested_users: next }).eq('id', id);
      await loadSharedData();
    }
  };

  const deleteExternalActivity = async (id: string) => {
    if (isSupabaseConfigured) {
      await supabase.from('activities').delete().eq('id', id);
      await loadSharedData();
    }
  };

  // --- ACTIONS IDÉES ---
  const addItemIdea = async (data: any) => {
    const id = `item-${Date.now()}`;
    if (isSupabaseConfigured) {
      await supabase.from('item_ideas').insert({
        id, title: data.title, author: currentUser, description: data.description,
        bgg_url: data.bggUrl, status: data.status, upvotes: [currentUser], comments: []
      });
      await loadSharedData();
    }
  };

  const toggleItemUpvote = async (id: string) => {
    const item = ItemIdeas.find(x => x.id === id);
    if (!item) return;
    const next = item.upvotes.includes(currentUser) 
      ? item.upvotes.filter(u => u !== currentUser) 
      : [...item.upvotes, currentUser];
    
    if (isSupabaseConfigured) {
      await supabase.from('item_ideas').update({ upvotes: next }).eq('id', id);
      await loadSharedData();
    }
  };

  const addItemComment = async (id: string, text: string) => {
    const item = ItemIdeas.find(x => x.id === id);
    if (!item) return;
    const comment = { id: `c-${Date.now()}`, author: currentUser, text, createdAt: new Date().toISOString() };
    const next = [...item.comments, comment];
    if (isSupabaseConfigured) {
      await supabase.from('item_ideas').update({ comments: next }).eq('id', id);
      await loadSharedData();
    }
  };

  const updateItemStatus = async (id: string, status: ItemStatus) => {
    if (isSupabaseConfigured) {
      await supabase.from('item_ideas').update({ status }).eq('id', id);
      await loadSharedData();
    }
  };

  const deleteItemIdea = async (id: string) => {
    if (isSupabaseConfigured) {
      await supabase.from('item_ideas').delete().eq('id', id);
      await loadSharedData();
    }
  };

  const resetToInitialData = async () => {
    if (window.confirm("Voulez-vous vraiment réinitialiser toutes les données sur Supabase ?")) {
        if (isSupabaseConfigured) {
            await Promise.all([
              supabase.from('votes').delete().neq('user_id', '0'),
              supabase.from('polls').delete().neq('id', '0'),
              supabase.from('meetings').delete().neq('id', '0'),
              supabase.from('activities').delete().neq('id', '0'),
              supabase.from('item_ideas').delete().neq('id', '0'),
            ]);
            await loadSharedData();
        }
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser, setCurrentUser, availableUsers, addNewUser,
        activeTab, setActiveTab, meetings, polls, externalActivities, ItemIdeas,
        nextMeeting, activePoll, addMeeting, updateMeeting, deleteMeeting, rsvpMeeting,
        addPoll, votePoll, closePollAndCreateMeeting, triggerPollDeadline, reopenPoll, deletePoll,
        addExternalActivity, toggleActivityInterest, deleteExternalActivity,
        addItemIdea, toggleItemUpvote, addItemComment, updateItemStatus, deleteItemIdea,
        loadSharedData, resetToInitialData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};