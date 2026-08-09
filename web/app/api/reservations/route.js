import { sql } from '@vercel/postgres';

// Liens de réservation hôtels, indexés par page ('main' | 'bis') et par clé "Île|Option".
// Nécessite la variable d'environnement POSTGRES_URL (base Vercel Postgres / Neon).

async function ensureTable() {
  await sql`CREATE TABLE IF NOT EXISTS reservations (
    page TEXT NOT NULL,
    key TEXT NOT NULL,
    url TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (page, key)
  )`;
}

export async function GET(request) {
  try {
    await ensureTable();
    const page = new URL(request.url).searchParams.get('page') || 'main';
    const { rows } = await sql`SELECT key, url FROM reservations WHERE page = ${page}`;
    return Response.json({ reservations: Object.fromEntries(rows.map(r => [r.key, r.url])) });
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
  const { page, key, url } = body || {};
  if (!page || !key) {
    return Response.json({ error: 'Champs "page" et "key" requis' }, { status: 400 });
  }
  try {
    await ensureTable();
    if (!url) {
      await sql`DELETE FROM reservations WHERE page = ${page} AND key = ${key}`;
    } else {
      await sql`INSERT INTO reservations (page, key, url) VALUES (${page}, ${key}, ${url})
                ON CONFLICT (page, key) DO UPDATE SET url = ${url}, updated_at = now()`;
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: 'Base indisponible', detail: String(e.message || e) }, { status: 503 });
  }
}
