export default async (req: Request) => {
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ message: 'Liste des réunions' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      Allow: 'GET',
    },
  });
};
