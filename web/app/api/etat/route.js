import { sql } from '@vercel/postgres';

// État complet d'une page d'itinéraire (nuits + prix), un enregistrement JSON par page.
// Le champ data.v porte la version du schéma côté page : une page plus récente ignore
// silencieusement un état d'une ancienne version et le remplace à la première saisie.

async function ensureTable() {
  await sql`CREATE TABLE IF NOT EXISTS page_state (
    page TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
  )`;
}

export async function GET(request) {
  try {
    await ensureTable();
    const page = new URL(request.url).searchParams.get('page') || 'main';
    const { rows } = await sql`SELECT data FROM page_state WHERE page = ${page}`;
    return Response.json({ data: rows.length ? rows[0].data : null });
  } catch (e) {
    return Response.json({ error: 'Base indisponible', detail: String(e.message || e) }, { status: 503 });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return Response.json({ error: 'JSON invalide' }, { status: 400 });
  }
  const { page, data } = body || {};
  if (!page || !data || typeof data !== 'object') {
    return Response.json({ error: 'Champs "page" et "data" requis' }, { status: 400 });
  }
  try {
    await ensureTable();
    await sql`INSERT INTO page_state (page, data) VALUES (${page}, ${JSON.stringify(data)})
              ON CONFLICT (page) DO UPDATE SET data = ${JSON.stringify(data)}, updated_at = now()`;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: 'Base indisponible', detail: String(e.message || e) }, { status: 503 });
  }
}
