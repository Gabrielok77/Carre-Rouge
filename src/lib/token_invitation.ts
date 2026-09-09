import { supabase } from './supabase';

function generateSecureToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let tokenCode = 'RS-';
  for (let i = 0; i < 6; i++) {
    tokenCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return tokenCode;
}

export async function createInvitationToken(adminName: string, role: 'member' | 'admin' = 'member') {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // +7 jours

  const { data, error } = await supabase
    .from('invitation_tokens')
    .insert({
      token,
      role,
      created_by: adminName,
      expires_at: expiresAt,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  
  const inviteLink = `${window.location.origin}/?token=${token}`;
  return { token, inviteLink };
}

// 2. Vérifier si un token est encore valide
export async function verifyToken(token: string) {
  const { data, error } = await supabase
    .from('invitation_tokens')
    .select('*')
    .eq('token', token.trim().toUpperCase())
    .single();

  if (error || !data) {
    return { valid: false, error: "Token introuvable. (wtf)" };
  }

  if (data.status === 'used') {
    return { valid: false, error: "Token déjà utilisé." };
  }

  if (new Date(data.expires_at) < new Date()) {
    return { valid: false, error: "L'invitation a expiré." };
  }

  return { valid: true, tokenData: data };
}

// 3. Consommer le token et créer le membre
export async function claimInvitationToken(token: string, memberName: string) {
  // A. Vérification
  const check = await verifyToken(token);
  if (!check.valid || !check.tokenData) {
    throw new Error(check.error);
  }

  const userId = `u-${Date.now()}`;

  // B. Ajouter le nouvel utilisateur dans la table 'users'
  const { error: userError } = await supabase.from('users').insert({
    id: userId,
    name: memberName.trim(),
    role: check.tokenData.role || 'member',
  });
  if (userError) throw userError;

  // C. Marquer le token comme utilisé
  const { error: tokenError } = await supabase
    .from('invitation_tokens')
    .update({
      status: 'used',
      used_at: new Date().toISOString(),
      used_by_name: memberName.trim(),
    })
    .eq('token', token.trim().toUpperCase());

  if (tokenError) throw tokenError;

  return { userId, name: memberName.trim(), role: check.tokenData.role };
}